import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';

const PUSH_PREFS_CACHE_KEY = (userId) => `spendwise_push_prefs_${userId}`;
const DEVICE_KEY_STORAGE = 'spendwise_push_device_key';

export const DEFAULT_PUSH_PREFERENCES = {
    enabled: false,
    prompt_answered: false,
    prompt_answered_at: null,
    evening_reminder_enabled: true,
    evening_reminder_hour: 21,
    midday_nudge_enabled: true,
    midday_nudge_hour: 14,
    weekly_summary_enabled: true,
    weekly_summary_hour: 18,
    timezone: 'Europe/Athens',
    language: 'el',
};

const PUSH_PREFS_COLUMNS = [
    'user_id',
    'enabled',
    'prompt_answered',
    'prompt_answered_at',
    'evening_reminder_enabled',
    'evening_reminder_hour',
    'midday_nudge_enabled',
    'midday_nudge_hour',
    'weekly_summary_enabled',
    'weekly_summary_hour',
    'timezone',
    'language',
    'updated_at',
].join(', ');

export function detectUserTimezone() {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz || 'Europe/Athens';
    } catch (_) {
        return 'Europe/Athens';
    }
}

export function isPushSupported() {
    if (Capacitor.isNativePlatform()) {
        return true;
    }
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }
    return Boolean(
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

export async function getPushPermissionState() {
    if (!isPushSupported()) return 'unsupported';

    if (Capacitor.isNativePlatform()) {
        try {
            const { receive } = await PushNotifications.checkPermissions();
            if (receive === 'granted') return 'granted';
            if (receive === 'denied') return 'denied';
            return 'prompt';
        } catch (_) {
            return 'prompt';
        }
    }

    const perm = Notification.permission;
    if (perm === 'granted') return 'granted';
    if (perm === 'denied') return 'denied';
    return 'prompt';
}

export function urlBase64ToUint8Array(base64String) {
    const clean = String(base64String || '').trim();
    const padding = '='.repeat((4 - (clean.length % 4)) % 4);
    const base64 = (clean + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function buildDeviceKey(platform, rawIdentifier) {
    const str = String(rawIdentifier || '');
    let hash = 5381;
    for (let i = 0; i < str.length; i += 1) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    const secondary = str.length.toString(36);
    return `${platform}_${hash.toString(36)}_${secondary}`;
}

function getStoredDeviceKey() {
    try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(DEVICE_KEY_STORAGE) : null;
    } catch (_) {
        return null;
    }
}

function setStoredDeviceKey(deviceKey) {
    try {
        if (typeof localStorage !== 'undefined' && deviceKey) {
            localStorage.setItem(DEVICE_KEY_STORAGE, deviceKey);
        }
    } catch (_) {
        // ignore storage errors
    }
}

async function saveSubscriptionRecord(userId, payload) {
    const nowIso = new Date().toISOString();
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
            {
                user_id: userId,
                platform: payload.platform,
                device_key: payload.deviceKey,
                token: payload.token || null,
                endpoint: payload.endpoint || null,
                p256dh: payload.p256dh || null,
                auth: payload.auth || null,
                user_agent: typeof navigator !== 'undefined' ? String(navigator.userAgent || '').slice(0, 250) : null,
                is_active: true,
                updated_at: nowIso,
                last_seen_at: nowIso,
            },
            { onConflict: 'user_id,device_key' }
        );

    if (error) {
        throw error;
    }
    setStoredDeviceKey(payload.deviceKey);
}

async function registerNativePush(userId) {
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';

    try {
        if (platform === 'android') {
            await PushNotifications.createChannel({
                id: 'spendlore_reminders',
                name: 'Spendlore Reminders',
                description: 'Daily expense reminders and weekly summaries',
                importance: 4,
                visibility: 1,
                vibration: true,
            });
        }
    } catch (_) {
        // Channel creation is best-effort on older Android versions
    }

    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
        permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
        return { ok: false, reason: 'permission_denied' };
    }

    const token = await new Promise((resolve, reject) => {
        let settled = false;
        const handles = [];
        const cleanup = () => {
            handles.forEach(p => Promise.resolve(p).then(h => h?.remove?.()).catch(() => {}));
        };

        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(new Error('Native push registration timed out'));
            }
        }, 12000);

        handles.push(
            PushNotifications.addListener('registration', (tokenObj) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                cleanup();
                resolve(tokenObj?.value || '');
            })
        );

        handles.push(
            PushNotifications.addListener('registrationError', (err) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                cleanup();
                reject(new Error(err?.error || 'Native push registration error'));
            })
        );

        PushNotifications.register().catch((err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            cleanup();
            reject(err);
        });
    });

    if (!token) {
        return { ok: false, reason: 'empty_token' };
    }

    const deviceKey = buildDeviceKey(platform, token);
    await saveSubscriptionRecord(userId, {
        platform,
        deviceKey,
        token,
    });

    return { ok: true, platform, deviceKey };
}

async function registerWebPush(userId) {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
        return { ok: false, reason: 'missing_vapid_key' };
    }

    let permission = Notification.permission;
    if (permission === 'default') {
        permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
        return { ok: false, reason: 'permission_denied' };
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration?.pushManager) {
        return { ok: false, reason: 'unsupported' };
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
    }

    const json = subscription.toJSON();
    const endpoint = json?.endpoint || subscription.endpoint;
    const p256dh = json?.keys?.p256dh || '';
    const auth = json?.keys?.auth || '';

    if (!endpoint || !p256dh || !auth) {
        return { ok: false, reason: 'invalid_subscription' };
    }

    const deviceKey = buildDeviceKey('web', endpoint);
    await saveSubscriptionRecord(userId, {
        platform: 'web',
        deviceKey,
        endpoint,
        p256dh,
        auth,
    });

    return { ok: true, platform: 'web', deviceKey };
}

export async function registerDeviceForPush(userId) {
    if (!userId) return { ok: false, reason: 'no_user' };
    if (!isPushSupported()) return { ok: false, reason: 'unsupported' };

    try {
        if (Capacitor.isNativePlatform()) {
            return await registerNativePush(userId);
        }
        return await registerWebPush(userId);
    } catch (err) {
        console.warn('registerDeviceForPush failed:', err?.message || err);
        return { ok: false, reason: 'registration_failed', error: err?.message || String(err) };
    }
}

export async function unregisterDeviceForPush(userId) {
    if (!userId) return { ok: false };

    let deviceKey = getStoredDeviceKey();

    try {
        if (!Capacitor.isNativePlatform() && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            const sub = await reg?.pushManager?.getSubscription();
            if (sub) {
                if (!deviceKey && sub.endpoint) {
                    deviceKey = buildDeviceKey('web', sub.endpoint);
                }
                await sub.unsubscribe().catch(() => {});
            }
        }
    } catch (_) {
        // ignore unsubscribe failures
    }

    if (deviceKey) {
        try {
            await supabase
                .from('push_subscriptions')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('device_key', deviceKey);
        } catch (err) {
            console.warn('Failed to deactivate push subscription in cloud:', err?.message || err);
        }
    }

    return { ok: true };
}

export function initPushTapListeners(onPushAction) {
    if (typeof onPushAction !== 'function') return () => {};

    const cleanups = [];

    if (Capacitor.isNativePlatform()) {
        try {
            const handlePromise = PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
                const data = event?.notification?.data || {};
                onPushAction({
                    action: data.action || null,
                    url: data.url || '/',
                    type: data.type || null,
                });
            });
            cleanups.push(() => {
                Promise.resolve(handlePromise).then(h => h?.remove?.()).catch(() => {});
            });
        } catch (_) {
            // ignore on unsupported environments
        }
    } else if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const messageHandler = (event) => {
            const msg = event?.data;
            if (msg?.type === 'SPENDLORE_PUSH_ACTION') {
                onPushAction({
                    action: msg.action || null,
                    url: msg.url || '/',
                    type: msg.pushType || null,
                });
            }
        };
        navigator.serviceWorker.addEventListener('message', messageHandler);
        cleanups.push(() => navigator.serviceWorker.removeEventListener('message', messageHandler));
    }

    return () => {
        cleanups.forEach(fn => fn());
    };
}

export function loadCachedPushPreferences(userId) {
    const defaults = {
        ...DEFAULT_PUSH_PREFERENCES,
        timezone: detectUserTimezone(),
    };
    if (!userId) return defaults;

    try {
        const raw = localStorage.getItem(PUSH_PREFS_CACHE_KEY(userId));
        if (!raw) return defaults;
        return { ...defaults, ...JSON.parse(raw) };
    } catch (_) {
        return defaults;
    }
}

export function saveCachedPushPreferences(userId, prefs) {
    if (!userId || !prefs) return;
    try {
        localStorage.setItem(PUSH_PREFS_CACHE_KEY(userId), JSON.stringify(prefs));
    } catch (_) {
        // ignore storage errors
    }
}

export async function fetchPushPreferences(userId) {
    const fallback = loadCachedPushPreferences(userId);
    if (!userId) return fallback;

    try {
        const { data, error } = await supabase
            .from('push_preferences')
            .select(PUSH_PREFS_COLUMNS)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return fallback;

        const merged = { ...fallback, ...data };
        saveCachedPushPreferences(userId, merged);
        return merged;
    } catch (err) {
        console.warn('Failed to fetch push preferences:', err?.message || err);
        return fallback;
    }
}

export function broadcastPushPreferences(userId, prefs) {
    if (!userId || !prefs) return;
    try {
        const channel = supabase.channel(`push-prefs-sync-${userId}`);
        channel.send({
            type: 'broadcast',
            event: 'push-prefs-update',
            payload: prefs,
        }).catch(() => {});
    } catch (_) {
        // ignore broadcast errors
    }
}

export async function upsertPushPreferences(userId, partialPrefs) {
    if (!userId) return loadCachedPushPreferences(null);

    const current = loadCachedPushPreferences(userId);
    const nextPrefs = {
        ...current,
        ...partialPrefs,
        timezone: partialPrefs?.timezone || current.timezone || detectUserTimezone(),
        updated_at: new Date().toISOString(),
    };

    saveCachedPushPreferences(userId, nextPrefs);
    broadcastPushPreferences(userId, nextPrefs);

    const dbPayload = {
        user_id: userId,
        enabled: Boolean(nextPrefs.enabled),
        prompt_answered: Boolean(nextPrefs.prompt_answered),
        prompt_answered_at: nextPrefs.prompt_answered_at || null,
        evening_reminder_enabled: Boolean(nextPrefs.evening_reminder_enabled),
        evening_reminder_hour: Number(nextPrefs.evening_reminder_hour ?? 21),
        midday_nudge_enabled: Boolean(nextPrefs.midday_nudge_enabled),
        midday_nudge_hour: Number(nextPrefs.midday_nudge_hour ?? 14),
        weekly_summary_enabled: Boolean(nextPrefs.weekly_summary_enabled),
        weekly_summary_hour: Number(nextPrefs.weekly_summary_hour ?? 18),
        timezone: String(nextPrefs.timezone || 'Europe/Athens'),
        language: nextPrefs.language === 'en' ? 'en' : 'el',
        updated_at: nextPrefs.updated_at,
    };

    try {
        const { data, error } = await supabase
            .from('push_preferences')
            .upsert(dbPayload, { onConflict: 'user_id' })
            .select(PUSH_PREFS_COLUMNS)
            .single();

        if (error) throw error;
        const saved = { ...nextPrefs, ...data };
        saveCachedPushPreferences(userId, saved);
        return saved;
    } catch (err) {
        console.warn('Failed to upsert push preferences:', err?.message || err);
        return nextPrefs;
    }
}
