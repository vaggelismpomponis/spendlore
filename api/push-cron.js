import { createClient } from '@supabase/supabase-js';
import {
    getLocalDateParts,
    getLocalDateKeyForTimestamp,
    getEveningReminderMessage,
    getMiddayNudgeMessage,
    getWeeklySummaryMessage,
} from './_lib/pushMessages.js';
import { sendPushToSubscriptions } from './_lib/pushDispatcher.js';

function getSupabaseAdmin() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return null;
    }
    return createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

function isAuthorizedCronRequest(req) {
    const secret = process.env.PUSH_CRON_SECRET;
    if (!secret) {
        return false;
    }
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (authHeader === `Bearer ${secret}`) {
        return true;
    }
    if (req.headers['x-vercel-cron'] && req.headers['x-cron-secret'] === secret) {
        return true;
    }
    return false;
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isAuthorizedCronRequest(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Missing Supabase server credentials' });
    }

    try {
        const now = new Date();
        const eightDaysAgoIso = new Date(now.getTime() - 8 * 86400000).toISOString();

        const [prefsRes, subsRes, logsRes, txRes] = await Promise.all([
            supabaseAdmin
                .from('push_preferences')
                .select('user_id, enabled, evening_reminder_enabled, evening_reminder_hour, midday_nudge_enabled, midday_nudge_hour, weekly_summary_enabled, weekly_summary_hour, timezone, language')
                .eq('enabled', true),
            supabaseAdmin
                .from('push_subscriptions')
                .select('id, user_id, platform, token, endpoint, p256dh, auth, is_active')
                .eq('is_active', true),
            supabaseAdmin
                .from('push_delivery_logs')
                .select('user_id, notification_type, period_key')
                .gte('sent_at', eightDaysAgoIso),
            supabaseAdmin
                .from('transactions')
                .select('user_id, amount, date, created_at')
                .eq('type', 'expense')
                .gte('created_at', eightDaysAgoIso),
        ]);

        if (prefsRes.error) throw prefsRes.error;
        if (subsRes.error) throw subsRes.error;
        if (logsRes.error) throw logsRes.error;
        if (txRes.error) throw txRes.error;

        const prefsList = prefsRes.data || [];
        const subsByUser = new Map();
        for (const sub of subsRes.data || []) {
            if (!subsByUser.has(sub.user_id)) subsByUser.set(sub.user_id, []);
            subsByUser.get(sub.user_id).push(sub);
        }

        const sentLogSet = new Set();
        for (const log of logsRes.data || []) {
            sentLogSet.add(`${log.user_id}:${log.notification_type}:${log.period_key}`);
        }

        const txByUser = new Map();
        for (const tx of txRes.data || []) {
            if (!txByUser.has(tx.user_id)) txByUser.set(tx.user_id, []);
            txByUser.get(tx.user_id).push(tx);
        }

        const metrics = {
            evaluatedUsers: prefsList.length,
            eveningSent: 0,
            middaySent: 0,
            weeklySent: 0,
            devicesReached: 0,
            failed: 0,
            deactivated: 0,
            skipped: 0,
        };

        const logsToInsert = [];

        for (const pref of prefsList) {
            const userSubs = subsByUser.get(pref.user_id) || [];
            if (userSubs.length === 0) continue;

            const local = getLocalDateParts(now, pref.timezone);
            const userTxs = txByUser.get(pref.user_id) || [];

            const hasExpenseToday = userTxs.some((tx) => {
                const txDateKey = getLocalDateKeyForTimestamp(tx.date || tx.created_at, local.timeZone);
                return txDateKey === local.dateKey;
            });

            // 1. Smart Evening Reminder (only if 0 expenses logged today)
            if (
                pref.evening_reminder_enabled &&
                local.hour === Number(pref.evening_reminder_hour) &&
                !hasExpenseToday &&
                !sentLogSet.has(`${pref.user_id}:evening_reminder:${local.dateKey}`)
            ) {
                const payload = getEveningReminderMessage(pref.language, local.dateKey);
                const result = await sendPushToSubscriptions(supabaseAdmin, userSubs, payload);
                metrics.devicesReached += result.sent;
                metrics.failed += result.failed;
                metrics.deactivated += result.deactivated;
                metrics.skipped += result.skipped;

                if (result.sent > 0) {
                    metrics.eveningSent += 1;
                    logsToInsert.push({
                        user_id: pref.user_id,
                        notification_type: 'evening_reminder',
                        period_key: local.dateKey,
                        title: payload.title,
                        body: payload.body,
                    });
                }
            }

            // 2. Midday Check-in Nudge
            if (
                pref.midday_nudge_enabled &&
                local.hour === Number(pref.midday_nudge_hour) &&
                !sentLogSet.has(`${pref.user_id}:midday_nudge:${local.dateKey}`)
            ) {
                const payload = getMiddayNudgeMessage(pref.language, local.dateKey);
                const result = await sendPushToSubscriptions(supabaseAdmin, userSubs, payload);
                metrics.devicesReached += result.sent;
                metrics.failed += result.failed;
                metrics.deactivated += result.deactivated;
                metrics.skipped += result.skipped;

                if (result.sent > 0) {
                    metrics.middaySent += 1;
                    logsToInsert.push({
                        user_id: pref.user_id,
                        notification_type: 'midday_nudge',
                        period_key: local.dateKey,
                        title: payload.title,
                        body: payload.body,
                    });
                }
            }

            // 3. Weekly Summary (Sundays)
            if (
                pref.weekly_summary_enabled &&
                local.weekday === 'Sun' &&
                local.hour === Number(pref.weekly_summary_hour) &&
                !sentLogSet.has(`${pref.user_id}:weekly_summary:${local.isoWeekKey}`)
            ) {
                const sevenDaysAgoMs = now.getTime() - 7 * 86400000;
                const weeklyExpenses = userTxs.filter((tx) => {
                    const ts = new Date(tx.date || tx.created_at).getTime();
                    return !Number.isNaN(ts) && ts >= sevenDaysAgoMs;
                });
                const totalAmount = weeklyExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

                const payload = getWeeklySummaryMessage(pref.language, {
                    count: weeklyExpenses.length,
                    totalAmount,
                    currency: '€',
                });
                const result = await sendPushToSubscriptions(supabaseAdmin, userSubs, payload);
                metrics.devicesReached += result.sent;
                metrics.failed += result.failed;
                metrics.deactivated += result.deactivated;
                metrics.skipped += result.skipped;

                if (result.sent > 0) {
                    metrics.weeklySent += 1;
                    logsToInsert.push({
                        user_id: pref.user_id,
                        notification_type: 'weekly_summary',
                        period_key: local.isoWeekKey,
                        title: payload.title,
                        body: payload.body,
                    });
                }
            }
        }

        if (logsToInsert.length > 0) {
            await supabaseAdmin
                .from('push_delivery_logs')
                .upsert(logsToInsert, { onConflict: 'user_id,notification_type,period_key', ignoreDuplicates: true });
        }

        return res.status(200).json({ success: true, ...metrics });
    } catch (error) {
        console.error('Push cron error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
