import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Monitor, Sun, Moon, Check, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

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
            id: 'system',
            icon: Monitor,
            title: t('theme_system') || 'Προεπιλογή συστήματος',
            description: t('theme_system_desc') || 'Αυτόματη προσαρμογή στις ρυθμίσεις της συσκευής',
        },
        {
            id: 'light',
            icon: Sun,
            iconClass: 'text-amber-500',
            title: t('theme_light') || 'Φωτεινό',
            description: t('theme_light_desc') || 'Κλασική φωτεινή εμφάνιση με υψηλή αντίθεση',
        },
        {
            id: 'dark',
            icon: Moon,
            iconClass: 'text-indigo-400 dark:text-indigo-300',
            title: t('theme_dark') || 'Σκοτεινό',
            description: t('theme_dark_desc') || 'Ξεκούραστο για τα μάτια σε συνθήκες χαμηλού φωτισμού',
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
            <div className="bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-in border border-gray-300 dark:border-white/10 p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 id="theme-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
                            {t('appearance_theme') || 'Εμφάνιση & Θέμα'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('select_theme') || 'Επιλέξτε το θέμα εμφάνισης'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                        aria-label={t('close') || 'Κλείσιμο'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 3 Options in Exact Order: System, Light, Dark */}
                <div className="space-y-2 mb-5">
                    {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = themePreference === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => updateThemePreference?.(opt.id)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-[0.99] select-none ${isSelected
                                        ? 'bg-white dark:bg-surface-dark3 border-gray-900 dark:border-white shadow-xs'
                                        : 'bg-white/70 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-start gap-3 min-w-0 pr-3">
                                    <Icon
                                        size={18}
                                        className={`shrink-0 mt-0.5 ${opt.iconClass || 'text-gray-600 dark:text-gray-300'}`}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {opt.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium leading-relaxed">
                                            {opt.description}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                                            ? 'border-gray-950 dark:border-white bg-gray-950 dark:bg-white text-white dark:text-gray-950'
                                            : 'border-gray-300 dark:border-white/20 bg-transparent'
                                        }`}
                                >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Action Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
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

