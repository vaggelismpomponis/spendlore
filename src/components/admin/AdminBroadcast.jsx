import React from 'react';
import { Send, Radio, AlertTriangle } from 'lucide-react';

const AdminBroadcast = ({
    broadcastTitle,
    setBroadcastTitle,
    broadcastMessage,
    setBroadcastMessage,
    onSend,
    translate = (k) => k
}) => {
    return (
        <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">

            {/* ─────── Executive Broadcast Hub Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <Radio size={22} className="text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                {translate('admin_broadcast_title') || 'Global System Broadcast'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {translate('admin_broadcast_subtitle') || 'Broadcast real-time announcements to all active users on launch'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Pipeline Ready</span>
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Target Audience
                        </span>
                        <span className="block text-sm font-extrabold text-gray-900 dark:text-white mt-1">
                            All User Accounts
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                            Delivery Channel
                        </span>
                        <span className="block text-sm font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                            In-App Modal Alert
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                            Priority Level
                        </span>
                        <span className="block text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            Immediate (P1)
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                            Push Ingestion
                        </span>
                        <span className="block text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                            Supabase DB Sync
                        </span>
                    </div>
                </div>
            </div>

            {/* ─────── Broadcast Composer Card ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-5">
                {/* Notice Banner */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
                    <AlertTriangle size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            Broadcast to all accounts
                        </p>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed font-medium">
                            This message will be displayed to every user upon their next launch or active session in Spendlore.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                            {translate('admin_broadcast_title_label') || 'Broadcast Title'}
                        </label>
                        <input
                            type="text"
                            value={broadcastTitle}
                            onChange={e => setBroadcastTitle(e.target.value)}
                            className="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                            placeholder={translate('admin_broadcast_title_placeholder') || 'e.g. Scheduled System Maintenance Notice'}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                                {translate('admin_broadcast_message_label') || 'Broadcast Message Body'}
                            </label>
                            <span className="text-[10px] font-bold text-gray-400">
                                {broadcastMessage.length} characters
                            </span>
                        </div>
                        <textarea
                            value={broadcastMessage}
                            onChange={e => setBroadcastMessage(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all min-h-[140px] resize-none leading-relaxed"
                            placeholder={translate('admin_broadcast_message_placeholder') || 'Type the full broadcast message here...'}
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={onSend}
                            disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Send size={15} />
                            <span>{translate('admin_broadcast_btn') || 'Transmit Broadcast'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBroadcast;
