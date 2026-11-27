import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Clock, Coffee, BarChart3, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const FOCUS_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function PushPermissionPromptModal({ isOpen, loading = false, onAccept, onDecline }) {
    const { language, t: translate } = useSettings();
    const isEL = language === 'el';
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const focusTimer = setTimeout(() => {
            const first = dialogRef.current?.querySelector(FOCUS_SELECTOR);
            first?.focus();
        }, 10);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) {
                e.preventDefault();
                onDecline?.();
                return;
            }
            if (e.key === 'Tab' && dialogRef.current) {
                const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUS_SELECTOR));
                if (!focusables.length) return;
                const [first, last] = [focusables[0], focusables[focusables.length - 1]];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(focusTimer);
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, loading, onDecline]);

    if (!isOpen || typeof document === 'undefined') return null;

    const benefits = [
        {
            icon: Clock,
            title: translate('push_prompt_benefit_evening_title') || (isEL ? 'Έξυπνη βραδινή υπενθύμιση' : 'Smart evening reminder'),
            desc: translate('push_prompt_benefit_evening_desc') || (isEL ? 'Στέλνεται μόνο αν δεν έχετε καταχωρήσει έξοδα μέσα στην ημέρα.' : 'Sent only if you have not logged any expenses today.'),
        },
        {
            icon: Coffee,
            title: translate('push_prompt_benefit_midday_title') || (isEL ? 'Διακριτικό μεσημεριανό check-in' : 'Friendly midday check-in'),
            desc: translate('push_prompt_benefit_midday_desc') || (isEL ? 'Μία σύντομη υπενθύμιση για καφέ, ψώνια ή μετακινήσεις.' : 'A quick prompt for coffee, errands, or daily purchases.'),
        },
        {
            icon: BarChart3,
            title: translate('push_prompt_benefit_weekly_title') || (isEL ? 'Εβδομαδιαία σύνοψη εξόδων' : 'Weekly expense summary'),
            desc: translate('push_prompt_benefit_weekly_desc') || (isEL ? 'Κάθε Κυριακή η συνολική εικόνα των εξόδων της εβδομάδας.' : 'Every Sunday, see a clear summary of your weekly spending.'),
        },
    ];

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="push-prompt-title"
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onDecline?.(); }}
        >
            <div ref={dialogRef} className="relative w-full max-w-sm sm:max-w-md bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl overflow-hidden animate-pop">
                <div className="p-5 sm:p-6 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Bell size={18} strokeWidth={2.2} className="shrink-0" />
                                <h3 id="push-prompt-title" className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                    {translate('push_prompt_title') || (isEL ? 'Καθημερινές υπενθυμίσεις εξόδων' : 'Daily Expense Reminders')}
                                </h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {translate('push_prompt_subtitle') || (isEL ? 'Μένεις οργανωμένος χωρίς να ξεχνάς καμία συναλλαγή.' : 'Stay organized without forgetting daily transactions.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onDecline}
                            disabled={loading}
                            aria-label={translate('cancel') || 'Close'}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors shrink-0 disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {benefits.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10">
                                <Icon size={17} strokeWidth={2.2} className="text-gray-700 dark:text-gray-300 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{title}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {translate('push_prompt_footer_note') || (isEL ? 'Μπορείτε να προσαρμόσετε τις ώρες ή να απενεργοποιήσετε τις ειδοποιήσεις ανά πάσα στιγμή από τις Γενικές Ρυθμίσεις.' : 'You can customize reminder times or turn notifications off anytime in General Settings.')}
                    </p>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onDecline}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm disabled:opacity-50"
                        >
                            {translate('push_prompt_decline') || (isEL ? 'Όχι τώρα' : 'Not Now')}
                        </button>
                        <button
                            type="button"
                            onClick={onAccept}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin shrink-0" /> : <Check size={16} className="shrink-0" />}
                            <span>{translate('push_prompt_accept') || (isEL ? 'Ενεργοποίηση' : 'Enable')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
