import React from 'react';
import { BellRing, Clock, Coffee, BarChart3, AlertTriangle, Info } from 'lucide-react';
import Toggle from './Toggle';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { usePushPreferences } from '../hooks/usePushPreferences';

const EVENING_HOURS = [17, 18, 19, 20, 21, 22, 23];
const MIDDAY_HOURS = [11, 12, 13, 14, 15, 16, 17];
const WEEKLY_HOURS = [10, 12, 14, 16, 18, 19, 20, 21];
const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;

export default function PushNotificationSettingsCard({ user }) {
    const { language, t: translate } = useSettings();
    const { showToast } = useToast();
    const isEL = language === 'el';
    const { prefs, permState, supported, toggleMaster, updatePref } = usePushPreferences(user?.id, language, translate, showToast);

    const rows = [
        {
            key: 'evening_reminder_enabled',
            hourKey: 'evening_reminder_hour',
            hours: EVENING_HOURS,
            icon: Clock,
            title: translate('push_evening_title') || (isEL ? 'Βραδινή υπενθύμιση' : 'Evening reminder'),
            desc: translate('push_evening_desc') || (isEL ? 'Μόνο αν δεν έχετε περάσει έξοδα σήμερα' : 'Only when no expenses were logged today'),
        },
        {
            key: 'midday_nudge_enabled',
            hourKey: 'midday_nudge_hour',
            hours: MIDDAY_HOURS,
            icon: Coffee,
            title: translate('push_midday_title') || (isEL ? 'Μεσημεριανό check-in' : 'Midday check-in'),
            desc: translate('push_midday_desc') || (isEL ? 'Φιλική υπενθύμιση μέσα στη μέρα' : 'Friendly daytime reminder'),
        },
        {
            key: 'weekly_summary_enabled',
            hourKey: 'weekly_summary_hour',
            hours: WEEKLY_HOURS,
            icon: BarChart3,
            title: translate('push_weekly_title') || (isEL ? 'Εβδομαδιαία σύνοψη (Κυριακή)' : 'Weekly summary (Sunday)'),
            desc: translate('push_weekly_desc') || (isEL ? 'Συνολικά έξοδα των τελευταίων 7 ημερών' : 'Total expenses from the last 7 days'),
        },
    ];

    return (
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-3">
            <div onClick={toggleMaster} className="flex items-center justify-between gap-3.5 cursor-pointer">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <BellRing size={20} className="text-gray-700 dark:text-gray-300 shrink-0" strokeWidth={2.2} />
                    <div className="min-w-0 flex-1">
                        <span className="block font-bold text-sm text-gray-900 dark:text-white leading-tight">
                            {translate('push_settings_title') || (isEL ? 'Push Ειδοποιήσεις & Υπενθυμίσεις' : 'Push Notifications & Reminders')}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight block mt-0.5">
                            {translate('push_settings_desc') || (isEL ? 'Καθημερινές υπενθυμίσεις εξόδων και εβδομαδιαία σύνοψη σε κινητό & web.' : 'Daily expense reminders and weekly summaries on mobile & web.')}
                        </span>
                    </div>
                </div>
                <Toggle enabled={Boolean(prefs.enabled)} onClick={toggleMaster} />
            </div>

            {!supported && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 text-[11px] text-gray-600 dark:text-gray-300">
                    <Info size={14} className="shrink-0 mt-0.5 text-gray-500" />
                    <span>
                        {translate('push_unsupported_banner') || (isEL ? 'Για iPhone/iPad προσθέστε πρώτα το Spendlore στην Οθόνη Αφετηρίας (PWA) για να ενεργοποιήσετε push ειδοποιήσεις.' : 'On iOS Safari, add Spendlore to your Home Screen first to enable web push notifications.')}
                    </span>
                </div>
            )}

            {supported && permState === 'denied' && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                        {translate('push_denied_banner') || (isEL ? 'Οι ειδοποιήσεις είναι αποκλεισμένες από τη συσκευή ή τον browser. Ενεργοποιήστε τις από τις Ρυθμίσεις συσκευής.' : 'Notifications are blocked by your device or browser. Allow notifications in settings to receive reminders.')}
                    </span>
                </div>
            )}

            {prefs.enabled && (
                <div className="pt-2 border-t border-gray-200/60 dark:border-white/[0.06] space-y-2.5">
                    {rows.map(({ key, hourKey, hours, icon: Icon, title, desc }) => {
                        const active = Boolean(prefs[key]);
                        return (
                            <div
                                key={key}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/10"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <Icon size={15} className="text-gray-600 dark:text-gray-400 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-xs font-bold text-gray-900 dark:text-white leading-tight">{title}</span>
                                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{desc}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2.5 shrink-0">
                                    <select
                                        aria-label={title}
                                        value={Number(prefs[hourKey])}
                                        disabled={!active}
                                        onChange={(e) => updatePref({ [hourKey]: Number(e.target.value) })}
                                        className="py-1.5 px-2.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white disabled:opacity-40"
                                    >
                                        {hours.map((h) => (
                                            <option key={h} value={h}>{formatHour(h)}</option>
                                        ))}
                                    </select>
                                    <Toggle enabled={active} onClick={() => updatePref({ [key]: !active })} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
