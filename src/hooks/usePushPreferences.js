import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import {
    detectUserTimezone,
    fetchPushPreferences,
    getPushPermissionState,
    isPushSupported,
    loadCachedPushPreferences,
    registerDeviceForPush,
    saveCachedPushPreferences,
    unregisterDeviceForPush,
    upsertPushPreferences,
} from '../services/PushNotificationService';

export function usePushPreferences(userId, language, translate, showToast) {
    const isEL = language === 'el';
    const [prefs, setPrefs] = useState(() => loadCachedPushPreferences(userId));
    const [permState, setPermState] = useState('prompt');
    const [supported] = useState(() => isPushSupported());
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        let mounted = true;
        getPushPermissionState().then((state) => {
            if (mounted) setPermState(state);
        });
        if (!userId) return () => { mounted = false; };

        fetchPushPreferences(userId).then((loaded) => {
            if (mounted && loaded) setPrefs(loaded);
        });

        const channel = supabase.channel(`push-prefs-sync-${userId}`);
        channel
            .on('broadcast', { event: 'push-prefs-update' }, ({ payload }) => {
                if (!mounted || !payload) return;
                setPrefs((prev) => {
                    const merged = { ...prev, ...payload };
                    saveCachedPushPreferences(userId, merged);
                    return merged;
                });
            })
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const toggleMaster = useCallback(async () => {
        if (!userId || isUpdating) return;
        if (!supported) {
            showToast(
                translate('push_unsupported_toast') || (isEL ? 'Οι push ειδοποιήσεις δεν υποστηρίζονται σε αυτόν τον browser.' : 'Push notifications are not supported in this browser.'),
                'info'
            );
            return;
        }

        setIsUpdating(true);
        try {
            if (prefs.enabled) {
                await unregisterDeviceForPush(userId);
                const saved = await upsertPushPreferences(userId, {
                    enabled: false,
                    prompt_answered: true,
                    language,
                    timezone: detectUserTimezone(),
                });
                setPrefs(saved);
                showToast(
                    translate('push_disabled_toast') || (isEL ? 'Οι push υπενθυμίσεις απενεργοποιήθηκαν.' : 'Push reminders disabled.'),
                    'info'
                );
                return;
            }

            const regResult = await registerDeviceForPush(userId);
            setPermState(await getPushPermissionState());

            if (!regResult.ok) {
                const msg = regResult.reason === 'permission_denied'
                    ? (translate('push_permission_denied_toast') || (isEL ? 'Η άδεια ειδοποιήσεων απορρίφθηκε. Ενεργοποιήστε την από τις ρυθμίσεις συσκευής.' : 'Notification permission was denied. Enable it in your device or browser settings.'))
                    : (translate('push_activation_error') || (isEL ? 'Δεν ήταν δυνατή η ενεργοποίηση των ειδοποιήσεων.' : 'Could not enable push notifications.'));
                showToast(msg, 'error');
                return;
            }

            const saved = await upsertPushPreferences(userId, {
                enabled: true,
                prompt_answered: true,
                prompt_answered_at: prefs.prompt_answered_at || new Date().toISOString(),
                language,
                timezone: detectUserTimezone(),
            });
            setPrefs(saved);
            showToast(
                translate('push_enabled_toast') || (isEL ? 'Οι καθημερινές υπενθυμίσεις ενεργοποιήθηκαν!' : 'Daily push reminders enabled!'),
                'success'
            );
        } finally {
            setIsUpdating(false);
        }
    }, [userId, isUpdating, supported, prefs.enabled, prefs.prompt_answered_at, language, translate, isEL, showToast]);

    const updatePref = useCallback(async (patch) => {
        if (!userId) return;
        setPrefs((prev) => ({ ...prev, ...patch }));
        const saved = await upsertPushPreferences(userId, {
            ...patch,
            language,
            timezone: detectUserTimezone(),
        });
        setPrefs(saved);
    }, [userId, language]);

    return { prefs, permState, supported, isUpdating, toggleMaster, updatePref };
}
