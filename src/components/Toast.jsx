import React, { useEffect } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3500, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getIconBadge = () => {
        switch (type) {
            case 'error':
                return (
                    <div className="w-5 h-5 rounded-full bg-rose-600 dark:bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <X size={12} strokeWidth={2.75} />
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <AlertTriangle size={12} strokeWidth={2.5} />
                    </div>
                );
            case 'info':
                return (
                    <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Info size={12} strokeWidth={2.5} />
                    </div>
                );
            case 'success':
            default:
                return (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Check size={12} strokeWidth={2.75} />
                    </div>
                );
        }
    };

    return (
        <div className="fixed top-[calc(env(safe-area-inset-top)+1rem)] sm:top-6 left-4 right-4 sm:left-auto sm:right-6 flex justify-center sm:justify-end z-[100] pointer-events-none">
            <div className="animate-slide-down pointer-events-auto w-full max-w-[360px] sm:max-w-sm">
                <div
                    data-testid="toast-container"
                    className="relative flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/90 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/40 backdrop-blur-md transition-all select-none"
                >
                    {/* Left Icon Badge */}
                    {getIconBadge()}

                    {/* Middle Message */}
                    <div className="flex-1 min-w-0 pr-1">
                        <p className="text-[13.5px] sm:text-sm font-medium text-gray-900 dark:text-white leading-snug tracking-tight">
                            {message}
                        </p>
                    </div>

                    {/* Right Circular Countdown Animation Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Dismiss notification"
                        className="group relative flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer focus:outline-none"
                        title="Dismiss"
                    >
                        <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 20 20">
                            {/* Subtle Background Track */}
                            <circle
                                cx="10"
                                cy="10"
                                r="7.5"
                                fill="none"
                                stroke="currentColor"
                                className="text-gray-200 dark:text-white/15"
                                strokeWidth="1.75"
                            />
                            {/* Depleting Animated Progress Ring */}
                            <circle
                                cx="10"
                                cy="10"
                                r="7.5"
                                fill="none"
                                stroke="currentColor"
                                className="text-gray-400 dark:text-gray-400 transition-all"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeDasharray="47.124"
                                style={{
                                    animation: `toast-circle-countdown ${duration}ms linear forwards`
                                }}
                            />
                        </svg>
                        {/* Subtle X icon on hover inside circle */}
                        <X
                            size={10}
                            strokeWidth={2.5}
                            className="absolute opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-300"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
