import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Visual Window Mockup for Theme Selection
 * Recreates high-fidelity miniature UI windows representing Light, Dark, and 50/50 Split System.
 */
export const ThemeWindowMockup = ({ themeType }) => {
    // Shared chart line & area path
    const chartPath = "M 48 54 Q 60 56 70 48 T 88 42 T 106 46 T 120 40 T 136 41";
    const areaPath = "M 48 54 Q 60 56 70 48 T 88 42 T 106 46 T 120 40 T 136 41 L 136 68 L 48 68 Z";

    if (themeType === 'light') {
        return (
            <svg viewBox="0 0 160 110" className="w-full h-auto rounded-xl overflow-hidden border border-gray-300/80 dark:border-white/10 shadow-2xs select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="mockup-light-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                {/* Background */}
                <rect x="0" y="0" width="160" height="110" fill="#ffffff" />
                
                {/* Top Bar Header */}
                <rect x="8" y="8" width="34" height="6" rx="3" fill="#e2e8f0" />
                <rect x="136" y="8" width="16" height="6" rx="2" fill="#cbd5e1" />
                <line x1="0" y1="20" x2="160" y2="20" stroke="#f1f5f9" strokeWidth="1" />

                {/* Left Sidebar */}
                <rect x="8" y="27" width="28" height="7" rx="3.5" fill="#e2e8f0" />
                <rect x="8" y="38" width="24" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="8" y="47" width="22" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="8" y="56" width="26" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="8" y="65" width="20" height="5" rx="2.5" fill="#f1f5f9" />

                {/* Main Dashboard Card */}
                <rect x="42" y="27" width="110" height="46" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="48" y="33" width="22" height="4" rx="2" fill="#cbd5e1" />
                <rect x="48" y="40" width="14" height="3" rx="1.5" fill="#e2e8f0" />
                
                {/* Chart Area Fill & Trend Line */}
                <path d={areaPath} fill="url(#mockup-light-grad)" />
                <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom Sub-Cards */}
                <rect x="42" y="78" width="52" height="24" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="48" y="85" width="20" height="4" rx="2" fill="#cbd5e1" />
                <rect x="48" y="92" width="28" height="3" rx="1.5" fill="#e2e8f0" />

                <rect x="100" y="78" width="52" height="24" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="106" y="85" width="20" height="4" rx="2" fill="#cbd5e1" />
                <rect x="106" y="92" width="28" height="3" rx="1.5" fill="#e2e8f0" />
            </svg>
        );
    }

    if (themeType === 'dark') {
        return (
            <svg viewBox="0 0 160 110" className="w-full h-auto rounded-xl overflow-hidden border border-zinc-800 dark:border-white/10 shadow-2xs select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="mockup-dark-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                {/* Background */}
                <rect x="0" y="0" width="160" height="110" fill="#141416" />

                {/* Top Bar Header */}
                <rect x="8" y="8" width="34" height="6" rx="3" fill="#27272a" />
                <rect x="136" y="8" width="16" height="6" rx="2" fill="#3f3f46" />
                <line x1="0" y1="20" x2="160" y2="20" stroke="#1f1f23" strokeWidth="1" />

                {/* Left Sidebar */}
                <rect x="8" y="27" width="28" height="7" rx="3.5" fill="#27272a" />
                <rect x="8" y="38" width="24" height="5" rx="2.5" fill="#1f1f23" />
                <rect x="8" y="47" width="22" height="5" rx="2.5" fill="#1f1f23" />
                <rect x="8" y="56" width="26" height="5" rx="2.5" fill="#1f1f23" />
                <rect x="8" y="65" width="20" height="5" rx="2.5" fill="#1f1f23" />

                {/* Main Dashboard Card */}
                <rect x="42" y="27" width="110" height="46" rx="6" fill="#1c1c1f" stroke="#27272a" strokeWidth="1" />
                <rect x="48" y="33" width="22" height="4" rx="2" fill="#3f3f46" />
                <rect x="48" y="40" width="14" height="3" rx="1.5" fill="#27272a" />

                {/* Chart Area Fill & Trend Line */}
                <path d={areaPath} fill="url(#mockup-dark-grad)" />
                <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom Sub-Cards */}
                <rect x="42" y="78" width="52" height="24" rx="5" fill="#1c1c1f" stroke="#27272a" strokeWidth="1" />
                <rect x="48" y="85" width="20" height="4" rx="2" fill="#3f3f46" />
                <rect x="48" y="92" width="28" height="3" rx="1.5" fill="#27272a" />

                <rect x="100" y="78" width="52" height="24" rx="5" fill="#1c1c1f" stroke="#27272a" strokeWidth="1" />
                <rect x="106" y="85" width="20" height="4" rx="2" fill="#3f3f46" />
                <rect x="106" y="92" width="28" height="3" rx="1.5" fill="#27272a" />
            </svg>
        );
    }

    // System: 50/50 Split!
    return (
        <svg viewBox="0 0 160 110" className="w-full h-auto rounded-xl overflow-hidden border border-gray-300 dark:border-zinc-700 shadow-2xs select-none" preserveAspectRatio="xMidYMid meet">
            <defs>
                <clipPath id="split-left">
                    <rect x="0" y="0" width="80" height="110" />
                </clipPath>
                <clipPath id="split-right">
                    <rect x="80" y="0" width="80" height="110" />
                </clipPath>
                <linearGradient id="mockup-split-light-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="mockup-split-dark-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
            </defs>

            {/* LEFT HALF (Light) */}
            <g clipPath="url(#split-left)">
                <rect x="0" y="0" width="160" height="110" fill="#ffffff" />
                <rect x="8" y="8" width="34" height="6" rx="3" fill="#e2e8f0" />
                <line x1="0" y1="20" x2="160" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <rect x="8" y="27" width="28" height="7" rx="3.5" fill="#e2e8f0" />
                <rect x="8" y="38" width="24" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="8" y="47" width="22" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="8" y="56" width="26" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="8" y="65" width="20" height="5" rx="2.5" fill="#f1f5f9" />
                <rect x="42" y="27" width="110" height="46" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="48" y="33" width="22" height="4" rx="2" fill="#cbd5e1" />
                <rect x="48" y="40" width="14" height="3" rx="1.5" fill="#e2e8f0" />
                <path d={areaPath} fill="url(#mockup-split-light-grad)" />
                <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="42" y="78" width="52" height="24" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="48" y="85" width="20" height="4" rx="2" fill="#cbd5e1" />
                <rect x="48" y="92" width="28" height="3" rx="1.5" fill="#e2e8f0" />
            </g>

            {/* RIGHT HALF (Dark) */}
            <g clipPath="url(#split-right)">
                <rect x="0" y="0" width="160" height="110" fill="#141416" />
                <rect x="136" y="8" width="16" height="6" rx="2" fill="#3f3f46" />
                <line x1="0" y1="20" x2="160" y2="20" stroke="#1f1f23" strokeWidth="1" />
                <rect x="42" y="27" width="110" height="46" rx="6" fill="#1c1c1f" stroke="#27272a" strokeWidth="1" />
                <path d={areaPath} fill="url(#mockup-split-dark-grad)" />
                <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="100" y="78" width="52" height="24" rx="5" fill="#1c1c1f" stroke="#27272a" strokeWidth="1" />
                <rect x="106" y="85" width="20" height="4" rx="2" fill="#3f3f46" />
                <rect x="106" y="92" width="28" height="3" rx="1.5" fill="#27272a" />
            </g>

            {/* Split Divider Line */}
            <line x1="80" y1="0" x2="80" y2="110" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        </svg>
    );
};

const ThemeSelectionModal = ({ isOpen, onClose }) => {
    const { t, themePreference = 'system', updateThemePreference } = useSettings();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const themeOptions = [
        {
            id: 'light',
            title: t('theme_light') || 'Φωτεινό',
            description: t('theme_light_desc') || 'Κλασική φωτεινή εμφάνιση με υψηλή αντίθεση',
        },
        {
            id: 'dark',
            title: t('theme_dark') || 'Σκοτεινό',
            description: t('theme_dark_desc') || 'Ξεκούραστο για τα μάτια σε συνθήκες χαμηλού φωτισμού',
        },
        {
            id: 'system',
            title: t('theme_system') || 'Προεπιλογή συστήματος',
            description: t('theme_system_desc') || 'Αυτόματη προσαρμογή στις ρυθμίσεις της συσκευής',
        },
    ];

    const modalContent = (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-modal-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl relative z-10 overflow-hidden animate-scale-in border border-gray-300 dark:border-white/10 p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                        <h3 id="theme-modal-title" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {t('theme') || t('appearance_theme') || 'Θέμα'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                            {t('theme_choose_desc') || 'Επιλέξτε το επιθυμητό θέμα για την εφαρμογή'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors shrink-0"
                        aria-label={t('close') || 'Κλείσιμο'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 3 Visual Options in Exact Order matching the UI design: Light, Dark, System */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
                    {themeOptions.map((opt) => {
                        const isSelected = themePreference === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => updateThemePreference?.(opt.id)}
                                className={`group flex flex-col items-center p-2 sm:p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer text-center select-none ${
                                    isSelected
                                        ? 'bg-gray-200/70 dark:bg-white/[0.08] border-gray-950 dark:border-white shadow-xs'
                                        : 'bg-white/40 dark:bg-white/[0.02] border-transparent hover:border-gray-300 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-white/[0.05]'
                                }`}
                            >
                                {/* Visual Window Mockup */}
                                <div className="w-full">
                                    <ThemeWindowMockup themeType={opt.id} />
                                </div>

                                {/* Label & Active Indicator */}
                                <div className="flex items-center justify-center gap-1.5 mt-3 w-full">
                                    <span className={`text-xs sm:text-sm font-bold text-center truncate ${
                                        isSelected ? 'text-gray-950 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                                    }`}>
                                        {opt.title}
                                    </span>
                                    {isSelected && (
                                        <div className="w-4 h-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center shrink-0">
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Action Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Check size={16} />
                    <span>{t('done') || 'Τέλος'}</span>
                </button>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ThemeSelectionModal;
