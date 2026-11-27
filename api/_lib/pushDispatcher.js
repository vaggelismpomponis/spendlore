import crypto from 'node:crypto';
import webpush from 'web-push';

let cachedFcmToken = null;
let cachedFcmExpiry = 0;

function base64UrlEncode(input) {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
    return buf
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function parseServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) return null;

    try {
        const trimmed = raw.trim();
        if (trimmed.startsWith('{')) {
            return JSON.parse(trimmed);
        }
        const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (err) {
        console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_JSON configuration:', err.message);
        return null;
    }
}

function configureWebPush() {
    const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:info@spendlore.gr';

    if (!publicKey || !privateKey) {
        return false;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    return true;
}

async function getFcmAccessToken(serviceAccount) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (cachedFcmToken && nowSec < cachedFcmExpiry - 60) {
        return cachedFcmToken;
    }

    const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claims = base64UrlEncode(JSON.stringify({
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        iat: nowSec,
        exp: nowSec + 3600,
    }));

    const signingInput = `${header}.${claims}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signingInput);
    signer.end();
    const signature = base64UrlEncode(signer.sign(serviceAccount.private_key));
    const jwt = `${signingInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }).toString(),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`FCM OAuth token exchange failed (${res.status}): ${errText}`);
    }

    const tokenData = await res.json();
    cachedFcmToken = tokenData.access_token;
    cachedFcmExpiry = nowSec + (Number(tokenData.expires_in) || 3600);
    return cachedFcmToken;
}

export function getPushChannelStatus() {
    const webPush = Boolean((process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY) && process.env.VAPID_PRIVATE_KEY);
    const sa = parseServiceAccount();
    const fcm = Boolean(sa && sa.project_id && sa.client_email && sa.private_key);
    return { webPush, fcm };
}

async function deactivateSubscriptions(supabaseAdmin, ids) {
    if (!supabaseAdmin || !Array.isArray(ids) || ids.length === 0) return;
    try {
        await supabaseAdmin
            .from('push_subscriptions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .in('id', ids);
    } catch (err) {
        console.warn('Failed to deactivate stale push subscriptions:', err.message);
    }
}

export async function sendPushToSubscriptions(supabaseAdmin, subscriptions, payload) {
    const summary = { sent: 0, failed: 0, deactivated: 0, skipped: 0 };
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
        return summary;
    }

    const webConfigured = configureWebPush();
    const serviceAccount = parseServiceAccount();
    const fcmConfigured = Boolean(serviceAccount?.project_id && serviceAccount?.client_email && serviceAccount?.private_key);

    let fcmAccessToken = null;
    const staleIds = [];

    const webSubs = subscriptions.filter(s => s.platform === 'web' && s.endpoint && s.p256dh && s.auth);
    const nativeSubs = subscriptions.filter(s => (s.platform === 'android' || s.platform === 'ios') && s.token);

    if (webSubs.length > 0 && !webConfigured) {
        console.warn('Web Push skipped: VAPID keys are not configured');
        summary.skipped += webSubs.length;
    } else if (webSubs.length > 0) {
        const bodyJson = JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/',
            action: payload.action || null,
            tag: payload.tag || 'spendlore-push',
            type: payload.type || 'general',
        });

        await Promise.all(webSubs.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    bodyJson,
                    { TTL: 3600 }
                );
                summary.sent += 1;
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    staleIds.push(sub.id);
                    summary.deactivated += 1;
                } else {
                    console.warn(`Web Push error for subscription ${sub.id}:`, err.message);
                    summary.failed += 1;
                }
            }
        }));
    }

    if (nativeSubs.length > 0 && !fcmConfigured) {
        console.warn('FCM Push skipped: FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
        summary.skipped += nativeSubs.length;
    } else if (nativeSubs.length > 0) {
        try {
            fcmAccessToken = await getFcmAccessToken(serviceAccount);
        } catch (err) {
            console.error('Could not obtain FCM access token:', err.message);
            summary.failed += nativeSubs.length;
            await deactivateSubscriptions(supabaseAdmin, staleIds);
            return summary;
        }

        const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

        await Promise.all(nativeSubs.map(async (sub) => {
            try {
                const res = await fetch(fcmEndpoint, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${fcmAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: {
                            token: sub.token,
                            notification: {
                                title: payload.title,
                                body: payload.body,
                            },
                            android: {
                                priority: 'HIGH',
                                notification: {
                                    channel_id: 'spendlore_reminders',
                                    icon: 'ic_stat_spendlore',
                                    color: '#111827',
                                    tag: payload.tag || 'spendlore-push',
                                },
                            },
                            data: {
                                url: String(payload.url || '/'),
                                action: String(payload.action || ''),
                                type: String(payload.type || 'general'),
                            },
                        },
                    }),
                });

                if (res.ok) {
                    summary.sent += 1;
                    return;
                }

                const errBody = await res.json().catch(() => ({}));
                const details = errBody?.error?.details || [];
                const fcmErrorCode = details.find(d => d.errorCode)?.errorCode || errBody?.error?.status;

                if (fcmErrorCode === 'UNREGISTERED' || fcmErrorCode === 'INVALID_ARGUMENT') {
                    staleIds.push(sub.id);
                    summary.deactivated += 1;
                } else {
                    console.warn(`FCM send error for subscription ${sub.id}:`, JSON.stringify(errBody));
                    summary.failed += 1;
                }
            } catch (err) {
                console.warn(`FCM network error for subscription ${sub.id}:`, err.message);
                summary.failed += 1;
            }
        }));
    }

    await deactivateSubscriptions(supabaseAdmin, staleIds);
    return summary;
}
