import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Bell, BatteryCharging, Power, CheckCircle2, AlertCircle, ArrowUpRight, Smartphone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import {
    getBackgroundPermissionsStatus,
    openNotificationSettings,
    requestIgnoreBatteryOptimization,
    openBatteryOptimizationSettings,
    openAutostartSettings
} from '../utils/notificationListener';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const BackgroundPermissionsModal = ({ isOpen, onClose, onPermissionsUpdated }) => {
    const { t, language } = useSettings();
    const isEL = language === 'el';

    const [status, setStatus] = useState({
        notificationListener: false,
        batteryNoRestrictions: false,
        autostartSupported: false,
        manufacturer: 'unknown'
    });
    const [isLoading, setIsLoading] = useState(true);

    const refreshStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const current = await getBackgroundPermissionsStatus();
            setStatus(current);
            if (typeof onPermissionsUpdated === 'function') {
                onPermissionsUpdated(current);
            }
        } finally {
            setIsLoading(false);
        }
    }, [onPermissionsUpdated]);

    useEffect(() => {
        if (!isOpen) return;
        refreshStatus();

        if (Capacitor.isNativePlatform()) {
            const listener = App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    refreshStatus();
                }
            });
            return () => {
                listener.then(handle => handle.remove());
            };
        }
    }, [isOpen, refreshStatus]);

    if (!isOpen) return null;

    const isXiaomi = /xiaomi|redmi|poco/i.test(status.manufacturer);

    const handleRequestBattery = async () => {
        await requestIgnoreBatteryOptimization();
        setTimeout(refreshStatus, 1000);
    };

    const handleOpenBatterySettings = async () => {
        await openBatteryOptimizationSettings();
    };

    const handleOpenAutostart = async () => {
        await openAutostartSettings();
    };

    const handleOpenNotificationSettings = async () => {
        await openNotificationSettings();
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bg-permissions-title"
        >
            {/* Backdrop with full viewport blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Surface */}
            <div className="bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-scale-in border border-gray-300 dark:border-white/10 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-white/10 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            <Smartphone size={12} strokeWidth={2.5} />
                            <span>Android Reliability</span>
                        </div>
                        <h3 id="bg-permissions-title" className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                            {t('bg_permissions_title')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {t('bg_permissions_subtitle')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors shrink-0"
                        aria-label={t('cancel')}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">

                    {/* Step 1: Notification & SMS Listener */}
                    <div className="p-4 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                <Bell size={18} className="text-gray-900 dark:text-white mt-0.5 shrink-0" strokeWidth={2.3} />
                                <div className="space-y-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                        1. {t('bg_permission_notifications')}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {t('bg_permission_notifications_desc')}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 shrink-0 ${status.notificationListener
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
                                }`}>
                                {status.notificationListener ? (
                                    <>
                                        <CheckCircle2 size={12} strokeWidth={2.5} />
                                        <span>{t('bg_permission_granted')}</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={12} strokeWidth={2.5} />
                                        <span>{t('bg_permission_required')}</span>
                                    </>
                                )}
                            </span>
                        </div>

                        {!status.notificationListener ? (
                            <button
                                type="button"
                                onClick={handleOpenNotificationSettings}
                                className="w-full py-2 px-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                <span>{t('bg_permission_open')}</span>
                                <ArrowUpRight size={14} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleOpenNotificationSettings}
                                className="w-full py-2 px-3 bg-gray-200/70 hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-gray-800 dark:text-gray-200 border border-gray-300/60 dark:border-white/[0.1] text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                <span>{isEL ? 'Διαχείριση Άδειας Συστήματος' : 'Manage System Permission'}</span>
                                <ArrowUpRight size={14} />
                            </button>
                        )}
                    </div>

                    {/* Step 2: Battery: No restrictions */}
                    <div className="p-4 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                <BatteryCharging size={18} className="text-gray-900 dark:text-white mt-0.5 shrink-0" strokeWidth={2.3} />
                                <div className="space-y-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                        2. {t('bg_permission_battery')}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {t('bg_permission_battery_desc')}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 shrink-0 ${status.batteryNoRestrictions
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
                                }`}>
                                {status.batteryNoRestrictions ? (
                                    <>
                                        <CheckCircle2 size={12} strokeWidth={2.5} />
                                        <span>{t('bg_permission_granted')}</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={12} strokeWidth={2.5} />
                                        <span>{t('bg_permission_required')}</span>
                                    </>
                                )}
                            </span>
                        </div>

                        {!status.batteryNoRestrictions && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleRequestBattery}
                                    className="flex-1 py-2 px-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <span>{t('bg_permission_remove_restrictions')}</span>
                                    <Check size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleOpenBatterySettings}
                                    className="py-2 px-3 bg-gray-200/70 hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition-all active:scale-95"
                                    title={isEL ? 'Άνοιγμα λεπτομερειών μπαταρίας' : 'Open battery details'}
                                >
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Background Autostart (Xiaomi / OEM) */}
                    <div className="p-4 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                <Power size={18} className="text-gray-900 dark:text-white mt-0.5 shrink-0" strokeWidth={2.3} />
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            3. {t('bg_permission_autostart')}
                                        </h4>
                                        {isXiaomi && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                                Xiaomi / MIUI
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {t('bg_permission_autostart_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenAutostart}
                            className="w-full py-2 px-3 bg-gray-200/70 hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-gray-900 dark:text-white border border-gray-300/60 dark:border-white/[0.1] text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                            <span>{t('bg_permission_open_autostart')}</span>
                            <ArrowUpRight size={14} />
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 sm:p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                        <Check size={16} />
                        <span>{t('bg_permissions_done')}</span>
                    </button>
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default BackgroundPermissionsModal;

