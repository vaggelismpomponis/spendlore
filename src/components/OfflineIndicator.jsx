import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useSettings } from '../contexts/SettingsContext';

export default function OfflineIndicator({ className = '' }) {
    const isOnline = useAppStore((state) => state.isOnline);
    const isSyncing = useAppStore((state) => state.isSyncing);
    const syncQueue = useAppStore((state) => state.syncQueue);
    const { t } = useSettings();

    const pendingCount = syncQueue?.length || 0;

    // When fully online and not syncing, do not show anything
    if (isOnline && !isSyncing && pendingCount === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={`w-full py-1.5 px-3 flex items-center justify-between text-xs transition-colors select-none ${
                    !isOnline
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-b border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-b border-emerald-500/20'
                } ${className}`}
                role="status"
                aria-live="polite"
            >
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                    {!isOnline ? (
                        <>
                            <WifiOff size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>{t('offline_badge') || 'OFFLINE'}</span>
                            <span className="font-normal normal-case text-gray-600 dark:text-gray-400">
                                • {t('offline_mode') || 'Εκτός σύνδεσης'}
                            </span>
                        </>
                    ) : (
                        <>
                            <RefreshCw size={13} className="shrink-0 animate-spin text-emerald-600 dark:text-emerald-400" />
                            <span>{t('syncing') || 'ΣΥΓΧΡΟΝΙΣΜΟΣ...'}</span>
                        </>
                    )}
                </div>

                {pendingCount > 0 && (
                    <div className="text-[10px] font-extrabold uppercase tracking-widest tabular-nums px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200">
                        {pendingCount} {t('pending_sync') || 'εκκρεμούν'}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
