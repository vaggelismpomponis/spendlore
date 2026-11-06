import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowRight, BarChart2, Target, Lock, ScanLine, Smartphone, RefreshCw } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { isNative } from '../utils/platform';

const PRO_FEATURES = [
    { icon: BarChart2, key: 'pro_feature_analytics', fallback: 'Full Analytics & History' },
    { icon: Target,    key: 'pro_feature_budgets',   fallback: 'Unlimited Budgets & Goals' },
    { icon: Lock,      key: 'pro_feature_biometrics', fallback: 'Biometric App Lock' },
    { icon: ScanLine,  key: 'pro_feature_scanner',   fallback: 'Smart Receipt Scanner' },
];

const PaymentSuccessView = ({ onContinue }) => {
    const { t } = useSettings();
    const { syncSubscription, isPro } = useSubscription();
    const hasAnimated = useRef(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isMobileWeb = !isNative() && (typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent));
    const isAndroidWeb = !isNative() && (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent));
    const appDeepLink = 'com.bomponis.spendwise://payment-success?upgraded=true';
    const androidIntentLink = 'intent://payment-success?upgraded=true#Intent;scheme=com.bomponis.spendwise;package=com.bomponis.spendwise;end';
    const mobileAppUrl = isAndroidWeb ? androidIntentLink : appDeepLink;

    useEffect(() => {
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            const url = new URL(window.location.href);
            url.searchParams.delete('upgraded');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    useEffect(() => {
        if (!isNative() && isMobileWeb) {
            const timer = setTimeout(() => {
                window.location.href = mobileAppUrl;
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isMobileWeb, mobileAppUrl]);

    useEffect(() => {
        let isMounted = true;
        syncSubscription()
            .then((res) => {
                // Defense-in-depth: if backend verification confirms user is NOT Pro, auto-dismiss
                if (isMounted && res && res.isPro === false && !isPro) {
                    if (typeof onContinue === 'function') {
                        onContinue();
                    }
                }
            })
            .catch(console.error);

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPro, onContinue]);

    const handleContinue = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            await syncSubscription();
        } catch (e) {
            console.error('Subscription sync failed:', e);
        }
        if (typeof onContinue === 'function') {
            onContinue();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md select-none overflow-y-auto">
            <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col text-center">
                
                {/* Semantic Status Hero */}
                <div className="flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={36} strokeWidth={2.2} />
                </div>

                {/* Overline & Typography */}
                <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    {t('payment_success_label')}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t('payment_success_title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xs mx-auto">
                    {t('payment_success_subtitle')}
                </p>

                {/* Capabilities Bento (Pure Unboxed Icons) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-6 text-left">
                    {PRO_FEATURES.map(({ icon: Icon, key, fallback }) => (
                        <div
                            key={key}
                            className="p-3 bg-gray-50 dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/5 rounded-xl flex items-center gap-2.5"
                        >
                            <Icon size={16} className="text-gray-700 dark:text-gray-300 shrink-0" strokeWidth={2} />
                            <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                                {t(key, fallback)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 w-full">
                    {isMobileWeb && (
                        <a
                            href={mobileAppUrl}
                            className="w-full py-3 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                        >
                            <Smartphone size={16} />
                            <span>{t('open_in_spendwise_app')}</span>
                            <ArrowRight size={15} className="ml-auto" />
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isRefreshing}
                        className={
                            isMobileWeb
                                ? "w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                                : "w-full py-3 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                        }
                    >
                        {isRefreshing ? (
                            <RefreshCw size={15} className="animate-spin" />
                        ) : (
                            <>
                                <span>{isMobileWeb ? t('payment_success_continue_web') : t('payment_success_cta')}</span>
                                <ArrowRight size={15} className={isMobileWeb ? "" : "ml-auto sm:ml-0"} />
                            </>
                        )}
                    </button>
                </div>

                {/* Subscription Management Note */}
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 leading-normal max-w-xs mx-auto">
                    {t('payment_success_manage')}
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccessView;
