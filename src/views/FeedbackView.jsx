import React, { useState } from 'react';
import {
    Send,
    ShieldCheck,
    Tag,
    Heart,
    Mail
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';
import { getAppVersionString } from '../utils/version';

const FeedbackView = ({ user, onBack, hideHeader = false }) => {
    const { language } = useSettings();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [isSending, setIsSending] = useState(false);

    const isEL = language === 'el';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        try {
            let tags = ['[Support]'];
            if (selectedTag) tags.push(`[${selectedTag}]`);

            let finalMessage = message.trim();
            for (const tag of tags) {
                if (!finalMessage.includes(tag)) {
                    finalMessage = `${tag} ${finalMessage}`;
                }
            }

            const priority = 'high';
            // Map 'support' to 'other' to satisfy Postgres feedback_type_check constraint ('bug', 'idea', 'other')
            const dbType = 'other';

            const { error } = await supabase
                .from('feedback')
                .insert({
                    user_id: user?.id,
                    message: finalMessage,
                    type: dbType,
                    email: user?.email,
                    status: 'open',
                    priority,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Supabase feedback insert warning:', error);
            }

            // Always dispatch instant email notification to spendlore@gmail.com via Resend
            try {
                fetch('https://www.spendlore.gr/api/send-ticket-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    keepalive: true,
                    body: JSON.stringify({
                        type: 'support',
                        message: finalMessage,
                        userEmail: user?.email,
                        priority,
                        appVersion: getAppVersionString()
                    })
                }).catch(err => console.warn('Ticket notification dispatch failed:', err));
            } catch (notifyErr) {
                console.warn('Failed to dispatch ticket notification:', notifyErr);
            }

            showToast(
                isEL
                    ? 'Το αίτημα υποστήριξης υποβλήθηκε επιτυχώς! Θα λάβετε απάντηση σύντομα.'
                    : 'Your support ticket has been submitted. We will reply shortly.',
                'success'
            );
            setMessage('');
            setSelectedTag('');
            setTimeout(onBack, 1500);
        } catch (error) {
            console.error('Support ticket error:', error);
            showToast(
                isEL
                    ? 'Αποτυχία αποστολής αιτήματος. Παρακαλούμε δοκιμάστε ξανά.'
                    : 'Failed to send support ticket. Please try again.',
                'error'
            );
        } finally {
            setIsSending(false);
        }
    };

    const quickTags = [
        'Account & Login',
        'Billing & Plan',
        'UI & Design',
        'Receipt Scanner',
        'Budgets & Limits',
        'Savings Goals',
        'Recurring Payments',
        'Performance & Sync'
    ];

    const handleTagClick = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag('');
        } else {
            setSelectedTag(tag);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={isEL ? 'Τεχνική Υποστήριξη' : 'Technical Support'}
                subtitle={isEL ? 'Βοήθεια με τον λογαριασμό ή τη συνδρομή' : 'Help with account, billing or features'}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-0 py-5 md:py-8 lg:py-0 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        backLabel={isEL ? 'Επιστροφή στις Ρυθμίσεις' : 'Back to Settings'}
                        hideHeader={hideHeader}
                    />

                    {/* ─────── Direct Support Channels Banner ─────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-gray-700 dark:text-gray-300 shrink-0" />
                            <div>
                                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                                    {isEL ? 'Επίσημο Email Υποστήριξης:' : 'Official Customer Support:'}
                                </span>
                                <span className="ml-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                    info@spendlore.gr
                                </span>
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {isEL ? 'Απάντηση εντός 24 ωρών' : 'Guaranteed 24h response'}
                        </span>
                    </div>

                    {/* ─────── Technical Support Ticket Form Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Quick Topic Tags (Optional) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    <Tag size={13} />
                                    <span>{isEL ? 'Γρήγορη Ετικέτα (Προαιρετικό)' : 'Quick Tag (Optional)'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {quickTags.map((tag) => {
                                        const isTagActive = selectedTag === tag;
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTagClick(tag)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${isTagActive
                                                        ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950 border-gray-950 dark:border-white shadow-xs'
                                                        : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1] border-gray-200/70 dark:border-white/[0.08]'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Message Area */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {isEL ? 'Το Μήνυμά σας' : 'Your Message'}
                                    </label>
                                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                        {message.length} chars
                                    </span>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={
                                        isEL
                                            ? 'Πώς μπορούμε να σας βοηθήσουμε; Περιγράψτε το αίτημά σας σχετικά με τον λογαριασμό, τη συνδρομή ή την εφαρμογή...'
                                            : 'How can we help? Describe your question or issue regarding your account, subscription, or app features...'
                                    }
                                    rows={5}
                                    className="w-full p-3.5 rounded-xl bg-gray-50/70 dark:bg-surface-dark border border-gray-200/80 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all resize-y min-h-[140px]"
                                    required
                                />
                            </div>

                            {/* User Context & Privacy Banner */}
                            {user?.email && (
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ShieldCheck size={16} className="text-gray-900 dark:text-white shrink-0" />
                                        <span className="truncate">
                                            {isEL ? 'Υποβολή ως' : 'Submitting as'}: <strong className="text-gray-900 dark:text-white">{user.email}</strong>
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-700 dark:text-gray-300 bg-gray-200/60 dark:bg-white/10 px-2 py-0.5 rounded-md shrink-0 ml-2">
                                        Verified
                                    </span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSending || !message.trim()}
                                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 font-bold text-sm shadow-xs active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>
                                            {isEL ? 'Υποβολή Αιτήματος Υποστήριξης' : 'Submit Support Ticket'}
                                        </span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8 flex flex-col items-center gap-1.5 opacity-60">
                        <Heart size={14} className="text-rose-500" fill="currentColor" />
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            Spendlore &bull; {isEL ? 'Φτιαγμένο με φροντίδα για την κοινότητα' : 'Made with care for the community'} &bull; {getAppVersionString(language)}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeedbackView;
