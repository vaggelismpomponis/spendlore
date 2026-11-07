import React from 'react';
import * as Sentry from '@sentry/react';
import sentryLogger from '../utils/sentryLogger';
import { useSettings } from '../contexts/SettingsContext';
import { AlertCircle, RefreshCw, RotateCcw, ChevronDown, ChevronRight, Copy, CheckCircle2 } from 'lucide-react';

const AUTO_RETRY_KEY = 'spendlore_error_boundary_retry';
const AUTO_RETRY_COOLDOWN_MS = 15000;

const removeInlineLoaderSafely = () => {
    if (typeof document !== 'undefined') {
        const loader = document.getElementById('inline-loader');
        if (loader) {
            try {
                loader.remove();
            } catch {
                loader.style.display = 'none';
            }
        }
    }
};

class ErrorBoundaryClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            isReloading: false,
            autoRetrying: false,
            copied: false,
        };
        removeInlineLoaderSafely();
    }

    static getDerivedStateFromError(error) {
        removeInlineLoaderSafely();
        return { hasError: true, error };
    }

    componentDidMount() {
        if (this.state.hasError) {
            removeInlineLoaderSafely();
        }
    }

    componentDidCatch(error, errorInfo) {
        removeInlineLoaderSafely();
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });

        // Report to Sentry with component stack as extra context
        Sentry.withScope((scope) => {
            scope.setTag('context', 'ErrorBoundary');
            scope.setExtra('componentStack', errorInfo?.componentStack);
            Sentry.captureException(error);
        });

        sentryLogger.recordError({
            message: `ErrorBoundary: ${error?.message || String(error)}`,
            error,
            context: 'ErrorBoundary',
            level: 'fatal',
            stack: errorInfo?.componentStack || error?.stack,
            extras: { componentStack: errorInfo?.componentStack }
        });

        // Smart single-attempt auto-recovery with circuit breaker
        this.attemptAutoRecovery(error);
    }

    attemptAutoRecovery = (error) => {
        // Only run auto-recovery in browser environment and when not an inline boundary
        if (typeof window === 'undefined' || this.props.disableAutoRetry || this.props.inline) {
            return;
        }

        try {
            const now = Date.now();
            const lastRetry = parseInt(sessionStorage.getItem(AUTO_RETRY_KEY) || '0', 10);

            // Circuit breaker: Only attempt reload if no reload occurred within the cooldown window
            if (now - lastRetry > AUTO_RETRY_COOLDOWN_MS) {
                sessionStorage.setItem(AUTO_RETRY_KEY, String(now));
                this.setState({ autoRetrying: true });

                // Brief pause so logger / Sentry dispatch before reload
                setTimeout(() => {
                    try {
                        window.location.reload();
                    } catch (e) {
                        console.error('Auto-reload invocation failed:', e);
                        this.setState({ autoRetrying: false });
                    }
                }, 120);
            }
        } catch (e) {
            console.warn('SessionStorage unavailable or auto-retry check failed:', e);
        }
    };

    handleReload = () => {
        removeInlineLoaderSafely();
        this.setState({ isReloading: true });
        try {
            window.location.reload();
        } catch {
            window.location.href = window.location.pathname;
        }
    };

    handleResetAndRestart = () => {
        removeInlineLoaderSafely();
        this.setState({ isReloading: true });
        try {
            localStorage.removeItem('lastActiveTab');
            localStorage.removeItem('lastPreviousTab');
            localStorage.removeItem('customCategories');
            localStorage.removeItem('notifications');
            sessionStorage.clear();
        } catch (e) {
            console.error('Storage clear error:', e);
        }
        window.location.href = '/';
    };

    handleCopyError = () => {
        const details = `${this.state.error?.toString() || 'Unknown error'}\n\nStack:\n${this.state.errorInfo?.componentStack || ''}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(details).then(() => {
                this.setState({ copied: true });
                setTimeout(() => this.setState({ copied: false }), 2500);
            }).catch(() => { });
        }
    };

    render() {
        const { t } = this.props.settings;

        if (this.state.hasError) {
            removeInlineLoaderSafely();

            // Custom inline fallback prop support
            if (this.props.fallback) {
                return typeof this.props.fallback === 'function'
                    ? this.props.fallback(this.state.error, this.handleReload)
                    : this.props.fallback;
            }

            // Auto-recovery screen while single-attempt reload is executing
            if (this.state.autoRetrying) {
                return (
                    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-surface-light dark:bg-surface-dark transition-colors duration-200 relative z-[10001] select-none">
                        <div className="w-full max-w-sm bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-6 flex flex-col items-center text-center shadow-xs">
                            <RefreshCw size={24} className="animate-spin text-gray-900 dark:text-white mb-3" strokeWidth={2.2} />
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                {t('auto_recovering')}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('auto_recovering_desc')}
                            </p>
                        </div>
                    </div>
                );
            }

            // Compact layout for inline sub-boundaries
            if (this.props.inline) {
                return (
                    <div className="p-4 bg-white dark:bg-surface-dark2 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col items-center text-center gap-2">
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                            <AlertCircle size={15} strokeWidth={2.2} />
                            <span className="text-xs font-bold">{t('system_interruption')}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                            {t('something_went_wrong')}
                        </p>
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="mt-1 py-1.5 px-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw size={12} className={this.state.isReloading ? "animate-spin" : ""} />
                            {t('reload_app')}
                        </button>
                    </div>
                );
            }

            // Executive Full-Screen Error Boundary (Anti-Slop AI Design)
            return (
                <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-surface-light dark:bg-surface-dark transition-colors duration-200 relative z-[10001] select-none">
                    <div className="w-full max-w-md bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 flex flex-col shadow-xs">
                        {/* Pure Unboxed Overline & Icon */}
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
                            <AlertCircle size={18} className="shrink-0" strokeWidth={2.2} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                {t('system_interruption')}
                            </span>
                        </div>

                        {/* Typography */}
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {t('something_went_wrong')}
                        </h1>

                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {t('error_message_generic')}
                        </p>

                        {/* Balanced Action Button Row */}
                        <div className="flex flex-col sm:flex-row gap-2.5 pt-4 w-full">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                disabled={this.state.isReloading}
                                className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={this.state.isReloading ? "animate-spin" : ""} strokeWidth={2} />
                                {t('reload_app')}
                            </button>

                            <button
                                type="button"
                                onClick={this.handleResetAndRestart}
                                disabled={this.state.isReloading}
                                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-200 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                            >
                                <RotateCcw size={14} strokeWidth={2} />
                                {t('clear_cache_restart')}
                            </button>
                        </div>

                        {/* Collapsible Technical Details — strictly rendered in development mode only */}
                        {Boolean(import.meta.env.DEV) && (
                            <div className="w-full text-left pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors py-1 cursor-pointer"
                                    >
                                        {this.state.showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        <span>{t('error_details')}</span>
                                    </button>
                                    {this.state.showDetails && (
                                        <button
                                            type="button"
                                            onClick={this.handleCopyError}
                                            className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 font-semibold hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            {this.state.copied ? (
                                                <>
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    <span>{t('copied')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    <span>{t('copy_error')}</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {this.state.showDetails && (
                                    <div className="mt-2.5 p-3.5 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden text-left">
                                        <p className="font-mono text-[11px] break-all text-rose-600 dark:text-rose-400 mb-2 font-semibold select-text">
                                            {this.state.error && this.state.error.toString()}
                                        </p>
                                        <div className="font-mono text-[10px] text-gray-500 dark:text-gray-400 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed custom-scrollbar select-text">
                                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const ErrorBoundary = (props) => {
    let settings;
    try {
        settings = useSettings();
    } catch {
        settings = null;
    }

    // Resilient fallback translation if context is missing during fatal boot crash
    const t = (key) => {
        if (settings?.t) return settings.t(key);
        const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'el';
        const trans = {
            el: {
                something_went_wrong: 'Κάτι πήγε στραβά',
                error_message_generic: 'Παρουσιάστηκε ένα μη αναμενόμενο σφάλμα στην εφαρμογή. Παρακαλούμε δοκιμάστε να την ανανεώσετε.',
                reload_app: 'Ανανέωση Εφαρμογής',
                clear_cache_restart: 'Εκκαθάριση & Επανεκκίνηση',
                error_details: 'Λεπτομέρειες Σφάλματος',
                system_interruption: 'Σφάλμα Εφαρμογής',
                auto_recovering: 'Ανάκτηση εφαρμογής...',
                auto_recovering_desc: 'Αυτόματη ανανέωση για αποκατάσταση της κατάστασης.',
                copy_error: 'Αντιγραφή',
                copied: 'Αντιγράφηκε',
            },
            en: {
                something_went_wrong: 'Something went wrong',
                error_message_generic: 'An unexpected error occurred in the application. Please try reloading.',
                reload_app: 'Reload App',
                clear_cache_restart: 'Clear Cache & Restart',
                error_details: 'Error Details',
                system_interruption: 'Application Error',
                auto_recovering: 'Recovering application...',
                auto_recovering_desc: 'Automatic reload to restore app state.',
                copy_error: 'Copy Details',
                copied: 'Copied',
            }
        };
        return trans[lang]?.[key] || trans['el'][key] || key;
    };

    return <ErrorBoundaryClass {...props} settings={{ ...settings, t }} />;
};

export default ErrorBoundary;
