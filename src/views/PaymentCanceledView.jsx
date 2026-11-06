import React, { useEffect, useRef } from 'react';
import { XCircle, ArrowLeft, RefreshCcw, ShieldCheck, CreditCard } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const PaymentCanceledView = ({ onContinue, onRetry }) => {
    const { t } = useSettings();
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            const url = new URL(window.location.href);
            url.searchParams.delete('canceled');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md select-none overflow-y-auto">
            <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col text-center">
                
                {/* Status Hero */}
                <div className="flex items-center justify-center mx-auto mb-3 text-gray-400 dark:text-gray-500">
                    <XCircle size={36} strokeWidth={2} />
                </div>

                {/* Overline & Typography */}
                <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
                    {t('payment_canceled_label') || 'Ακύρωση Πληρωμής'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t('payment_canceled_title') || 'Δεν έγινε χρέωση'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xs mx-auto">
                    {t('payment_canceled_subtitle') || 'Η διαδικασία πληρωμής ακυρώθηκε. Ο λογαριασμός σας δεν χρεώθηκε.'}
                </p>

                {/* Info List */}
                <div className="my-6 space-y-2 text-left">
                    <div className="p-3 bg-gray-50 dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/5 rounded-xl flex items-center gap-2.5">
                        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {t('payment_canceled_info_1') || 'Ασφαλής διαδικασία'}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/5 rounded-xl flex items-center gap-2.5">
                        <CreditCard size={16} className="text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2} />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {t('payment_canceled_info_2') || 'Μπορείτε να δοκιμάσετε ξανά'}
                        </span>
                    </div>
                </div>

                {/* Balanced Action Row */}
                <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                    <button
                        type="button"
                        onClick={onContinue}
                        className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-200 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        <span>{t('back_to_app') || 'Πίσω στην Εφαρμογή'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                        <RefreshCcw size={14} />
                        <span>{t('try_again') || 'Προσπάθησε Ξανά'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCanceledView;
