import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { sendPushToSubscriptions, getPushChannelStatus } from './_lib/pushDispatcher.js';

const ADMIN_ID = '86177767-e1f2-4356-b98b-e43503cab0da';
const ADMIN_EMAILS = ['vaggelisbobonhs@gmail.com', 'vaggelismpomponis@gmail.com', 'ebomponis@gmail.com'];

const ACTION_URL_MAP = {
    'open-home': '/',
    'add-expense': '/?action=add-expense',
    'open-stats': '/?tab=stats',
};

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
}

async function authenticateAdmin(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return { error: 'Missing authorization header', status: 401 };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) {
        return { error: 'Server configuration error', status: 500 };
    }

    const token = authHeader.slice(7).trim();
    const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
        return { error: 'Unauthorized', status: 401 };
    }

    const userEmail = (user.email || '').toLowerCase();
    const isAdmin = user.id === ADMIN_ID || ADMIN_EMAILS.some(e => e.toLowerCase() === userEmail);
    if (!isAdmin) {
        return { error: 'Forbidden: Admin only', status: 403 };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    return { user, supabaseAdmin };
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const auth = await authenticateAdmin(req);
    if (auth.error) {
        return res.status(auth.status).json({ error: auth.error });
    }

    const { supabaseAdmin } = auth;

    try {
        if (req.method === 'GET') {
            const { data: activeSubs, error } = await supabaseAdmin
                .from('push_subscriptions')
                .select('user_id, platform')
                .eq('is_active', true);

            if (error) throw error;

            const uniqueUsers = new Set();
            let androidDevices = 0;
            let webDevices = 0;

            for (const sub of activeSubs || []) {
                uniqueUsers.add(sub.user_id);
                if (sub.platform === 'android' || sub.platform === 'ios') androidDevices += 1;
                if (sub.platform === 'web') webDevices += 1;
            }

            return res.status(200).json({
                totalUsers: uniqueUsers.size,
                totalDevices: (activeSubs || []).length,
                androidDevices,
                webDevices,
                configured: getPushChannelStatus(),
            });
        }

        const {
            title,
            body,
            targetAudience = 'all',
            action = 'open-home',
            alsoSaveInAppBroadcast = false,
        } = req.body || {};

        const cleanTitle = String(title || '').trim().slice(0, 120);
        const cleanBody = String(body || '').trim().slice(0, 500);

        if (!cleanTitle || !cleanBody) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        let query = supabaseAdmin
            .from('push_subscriptions')
            .select('id, user_id, platform, token, endpoint, p256dh, auth')
            .eq('is_active', true);

        if (targetAudience === 'android') {
            query = query.in('platform', ['android', 'ios']);
        } else if (targetAudience === 'web') {
            query = query.eq('platform', 'web');
        }

        const { data: targets, error: targetsErr } = await query;
        if (targetsErr) throw targetsErr;

        const safeAction = ACTION_URL_MAP[action] ? action : 'open-home';
        const targetUrl = ACTION_URL_MAP[safeAction];
        const broadcastKey = crypto.randomUUID();

        const delivery = await sendPushToSubscriptions(supabaseAdmin, targets || [], {
            title: cleanTitle,
            body: cleanBody,
            url: targetUrl,
            action: safeAction,
            tag: `spendlore-broadcast-${broadcastKey}`,
            type: 'admin_broadcast',
        });

        if (delivery.sent > 0 && Array.isArray(targets) && targets.length > 0) {
            const uniqueUserIds = Array.from(new Set(targets.map(t => t.user_id)));
            const logRows = uniqueUserIds.map(uid => ({
                user_id: uid,
                notification_type: 'admin_broadcast',
                period_key: broadcastKey,
                title: cleanTitle,
                body: cleanBody,
            }));
            await supabaseAdmin
                .from('push_delivery_logs')
                .upsert(logRows, { onConflict: 'user_id,notification_type,period_key', ignoreDuplicates: true });
        }

        if (alsoSaveInAppBroadcast) {
            const { error: broadcastErr } = await supabaseAdmin.from('broadcasts').insert([{
                title: cleanTitle,
                message: cleanBody,
                created_at: new Date().toISOString(),
            }]);
            if (broadcastErr) {
                console.warn('Could not save in-app broadcast copy:', broadcastErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            totalTargets: (targets || []).length,
            ...delivery,
        });
    } catch (error) {
        console.error('Admin send push error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
