import React from 'react';
import { Send, Radio, AlertTriangle } from 'lucide-react';

const resolveTranslation = (translateFn, key, fallback, params) => {
    if (typeof translateFn === 'function') {
        const val = translateFn(key, params);
        if (val && val !== key) return val;
    }
    return fallback !== undefined ? fallback : key;
};

const AdminBroadcast = ({
    broadcastTitle,
    setBroadcastTitle,
    broadcastMessage,
    setBroadcastMessage,
    broadcastMode = 'both',
    setBroadcastMode,
    pushTargetAudience = 'all',
    setPushTargetAudience,
    pushTapAction = 'open-home',
    setPushTapAction,
    pushStats = null,
    isSending = false,
    onSend,
    translate = (k) => k
}) => {
    const t = (k, fb, p) => resolveTranslation(translate, k, fb, p);
    const includesPush = broadcastMode === 'push' || broadcastMode === 'both';

    const modes = [
        { id: 'both', label: t('admin_mode_both', 'In-App + Push') },
        { id: 'push', label: t('admin_mode_push', 'Push Notification') },
        { id: 'in_app', label: t('admin_mode_inapp', 'In-App Modal') },
    ];

    return (
        <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <Radio size={22} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                {t('admin_broadcast_title', 'Global System Broadcast')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('admin_broadcast_subtitle', 'Send in-app announcements and real-time push notifications to user devices')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('admin_broadcast_ready', 'Live Pipeline Ready')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {t('admin_push_users_label', 'Push Users')}
                        </span>
                        <span className="block text-sm font-extrabold text-gray-900 dark:text-white mt-1 tabular-nums">
                            {pushStats ? pushStats.totalUsers : '—'}
                        </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {t('admin_push_total_devices', 'Active Devices')}
                        </span>
                        <span className="block text-sm font-extrabold text-gray-900 dark:text-white mt-1 tabular-nums">
                            {pushStats ? pushStats.totalDevices : '—'}
                        </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            Android (FCM)
                        </span>
                        <span className="block text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
                            {pushStats ? pushStats.androidDevices : '—'}
                        </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                            Web / PWA
                        </span>
                        <span className="block text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                            {pushStats ? pushStats.webDevices : '—'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200/70 dark:border-white/10 w-fit">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setBroadcastMode?.(m.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                broadcastMode === m.id
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
                    <AlertTriangle size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            {t('admin_broadcast_notice_title', 'Broadcast to all accounts')}
                        </p>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed font-medium">
                            {includesPush
                                ? t('admin_push_notice_desc', 'Push notifications are delivered immediately to subscribed Android & Web/PWA devices.')
                                : t('admin_broadcast_notice_desc', 'This message will be displayed to every user upon their next launch or active session in Spendlore.')}
                        </p>
                    </div>
                </div>

                {includesPush && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                {t('admin_push_target_label', 'Target Platform')}
                            </label>
                            <select
                                value={pushTargetAudience}
                                onChange={(e) => setPushTargetAudience?.(e.target.value)}
                                className="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white"
                            >
                                <option value="all">{t('admin_push_target_all', 'All Devices (Android + Web)')}</option>
                                <option value="android">{t('admin_push_target_android', 'Android Native Only')}</option>
                                <option value="web">{t('admin_push_target_web', 'Web / PWA Only')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                {t('admin_push_action_label', 'On Tap Destination')}
                            </label>
                            <select
                                value={pushTapAction}
                                onChange={(e) => setPushTapAction?.(e.target.value)}
                                className="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white"
                            >
                                <option value="open-home">{t('admin_push_action_home', 'Open App Home')}</option>
                                <option value="add-expense">{t('admin_push_action_add_expense', 'Open Add Expense Modal')}</option>
                                <option value="open-stats">{t('admin_push_action_stats', 'Open Statistics View')}</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                            {t('admin_broadcast_title_label', 'Broadcast Title')}
                        </label>
                        <input
                            type="text"
                            value={broadcastTitle}
                            onChange={e => setBroadcastTitle(e.target.value)}
                            className="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                            placeholder={t('admin_broadcast_title_placeholder', 'e.g. Scheduled System Maintenance Notice')}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                                {t('admin_broadcast_message_label', 'Broadcast Message Body')}
                            </label>
                            <span className="text-[10px] font-bold text-gray-400">
                                {broadcastMessage.length} {t('admin_characters', 'characters')}
                            </span>
                        </div>
                        <textarea
                            value={broadcastMessage}
                            onChange={e => setBroadcastMessage(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all min-h-[120px] resize-none leading-relaxed"
                            placeholder={t('admin_broadcast_message_placeholder', 'Type the full broadcast message here...')}
                        />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={onSend}
                            disabled={isSending || !broadcastTitle.trim() || !broadcastMessage.trim()}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin shrink-0" /> : <Send size={15} />}
                            <span>{t('admin_broadcast_btn', 'Transmit Broadcast')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBroadcast;
