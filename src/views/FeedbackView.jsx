import React, { useState } from 'react';
import {
    Send,
    ShieldCheck,
    Mail,
    Copy,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';
import { getAppVersionString } from '../utils/version';

const QUICK_TAGS = [
    'Account & Login',
    'Billing & Plan',
    'UI & Design',
    'Receipt Scanner',
    'Budgets & Limits',
    'Savings Goals',
    'Recurring Payments',
    'Performance & Sync'
];

const FeedbackView = ({ user, onBack, hideHeader = false }) => {
    const { language, t: translate } = useSettings();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [isSending, setIsSending] = useState(false);

    const isEL = language === 'el';

    const handleCopyEmail = (e) => {
        e.preventDefault();
        try {
            navigator?.clipboard?.writeText('info@spendlore.gr');
            showToast(
                isEL ? 'Το email υποστήριξης αντιγράφηκε στο πρόχειρο.' : 'Support email copied to clipboard.',
                'success'
            );
        } catch {
            showToast(
                isEL ? 'info@spendlore.gr' : 'info@spendlore.gr',
                'info'
            );
        }
    };

    const handleTagClick = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag('');
        } else {
            setSelectedTag(tag);
        }
    };

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

            // Always dispatch instant email notification via Resend
            if (typeof fetch === 'function') {
                try {
                    const res = fetch('https://www.spendlore.gr/api/send-ticket-notification', {
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
                    });
                    if (res && typeof res.catch === 'function') {
                        res.catch(err => console.warn('Ticket notification dispatch failed:', err));
                    }
                } catch (notifyErr) {
                    console.warn('Failed to dispatch ticket notification:', notifyErr);
                }
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

    const headerTitle = isEL ? 'Τεχνική Υποστήριξη' : 'Technical Support';
    const headerSubtitle = isEL ? 'Βοήθεια με τον λογαριασμό ή τη συνδρομή' : 'Help with account, billing or features';
    const breadcrumbLabel = translate('technical_support') || headerTitle;

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={headerTitle}
                subtitle={headerSubtitle}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Navigation Breadcrumb (Home > Support) matching Sure style */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        parentLabel={translate('home_breadcrumb') || (isEL ? 'Αρχική' : 'Home')}
                        currentLabel={breadcrumbLabel}
                    />

                    {/* Desktop Headline & Description */}
                    <div className="hidden lg:block space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {headerTitle}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {headerSubtitle}
                        </p>
                    </div>

                    {/* Asymmetric 2-Column Hallmark Layout on Desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* ─────── Left Column: Direct Contact & Submitter Context ─────── */}
                        <div className="lg:col-span-5 space-y-4">

                            {/* Direct Support Channel Card */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
                                <div>
                                    <span className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {isEL ? 'Επίσημο Κανάλι Επικοινωνίας' : 'Official Support Channel'}
                                    </span>
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Mail size={16} className="text-gray-700 dark:text-gray-300 shrink-0" />
                                            <a
                                                href="mailto:info@spendlore.gr"
                                                className="text-sm font-bold text-gray-900 dark:text-white hover:underline truncate"
                                            >
                                                info@spendlore.gr
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopyEmail}
                                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] transition-colors cursor-pointer shrink-0"
                                            title={isEL ? 'Αντιγραφή email' : 'Copy email'}
                                            aria-label={isEL ? 'Αντιγραφή email' : 'Copy email'}
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                        <CheckCircle2 size={14} className="shrink-0" />
                                        <span>{isEL ? 'Απάντηση εντός 24 ωρών' : 'Guaranteed 24h response'}</span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">
                                        SLA 24/7
                                    </span>
                                </div>
                            </div>

                            {/* Submitter Identity Card */}
                            {user?.email && (
                                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                                            {isEL ? 'Στοιχεία Αποστολέα' : 'Sender Identity'}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md">
                                            Verified
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-700 dark:text-gray-300">
                                        <ShieldCheck size={16} className="text-gray-900 dark:text-white shrink-0" />
                                        <span className="font-semibold truncate text-gray-900 dark:text-white">
                                            {user.email}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
                                        {isEL
                                            ? 'Η απάντηση της ομάδας υποστήριξης θα σταλεί απευθείας στο συνδεδεμένο email σας.'
                                            : 'Support updates and responses will be delivered directly to your verified email address.'}
                                    </p>
                                </div>
                            )}

                            {/* Fast Resolution Tips */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs space-y-2.5">
                                <span className="block text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                                    {isEL ? 'Συμβουλές Ταχείας Επίλυσης' : 'Tips for Faster Resolution'}
                                </span>
                                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    <li className="flex items-start gap-2">
                                        <Clock size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                                        <span>
                                            {isEL
                                                ? 'Αναφέρετε τη συσκευή και τον browser ή την έκδοση Android.'
                                                : 'Mention your device model, browser, or Android version.'}
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FileText size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                                        <span>
                                            {isEL
                                                ? 'Περιγράψτε τα βήματα που οδήγησαν στο ζήτημα.'
                                                : 'Include steps to reproduce or specific transaction details.'}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                        </div>

                        {/* ─────── Right Column: Support Ticket Console ─────── */}
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-surface-dark2 border border-gray-300 dark:border-white/15 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                                {/* Top Contrast Accent Strip */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-950 dark:bg-white" />

                                {/* Card Header / Console Identity */}
                                <div className="pb-5 border-b border-gray-100 dark:border-white/[0.08] flex items-start justify-between gap-4">
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                            {isEL ? 'Φόρμα Υποστήριξης' : 'Support Ticket'}
                                        </span>
                                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {isEL ? 'Υποβολή Νέου Αιτήματος' : 'Open Support Ticket'}
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                            {isEL
                                                ? 'Συμπληρώστε τις λεπτομέρειες και η τεχνική μας ομάδα θα σας απαντήσει άμεσα.'
                                                : 'Provide the details below and our team will get back to you promptly.'}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-800 dark:text-gray-200 shrink-0">
                                        <MessageSquare size={14} className="text-gray-600 dark:text-gray-400" />
                                        <span>{isEL ? 'Άμεση Αποστολή' : 'Direct Dispatch'}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* Quick Topic Chips */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                {isEL ? 'Θεματολογία (Προαιρετικό)' : 'Topic Category (Optional)'}
                                            </label>
                                            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                {isEL ? 'Ταχύτερη δρομολόγηση' : 'Faster triage'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {QUICK_TAGS.map((tag) => {
                                                const isTagActive = selectedTag === tag;
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => handleTagClick(tag)}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer border ${isTagActive
                                                            ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950 border-gray-950 dark:border-white shadow-sm ring-1 ring-gray-950 dark:ring-white font-bold'
                                                            : 'bg-white hover:bg-gray-100/80 text-gray-700 dark:bg-surface-dark3 dark:hover:bg-white/[0.08] dark:text-gray-300 border-gray-300/80 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20'
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
                                            <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                {isEL ? 'Το Μήνυμά σας' : 'Your Message'}
                                            </label>
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-white/[0.06]">
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
                                            rows={6}
                                            className="w-full p-4 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-300 dark:border-white/15 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-950 dark:focus:ring-white shadow-2xs transition-all resize-y min-h-[160px]"
                                            required
                                        />
                                    </div>

                                    {/* Submit Action */}
                                    <div className="space-y-2 pt-1">
                                        <button
                                            type="submit"
                                            disabled={isSending || !message.trim()}
                                            className={`w-full py-3 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                !message.trim() || isSending
                                                    ? 'bg-gray-100 text-gray-400 dark:bg-white/[0.05] dark:text-white/30 border border-gray-200 dark:border-white/10 cursor-not-allowed'
                                                    : 'bg-gray-950 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 shadow-sm active:scale-[0.99]'
                                            }`}
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <span>
                                                        {isEL ? 'Υποβολή Αιτήματος Υποστήριξης' : 'Submit Support Ticket'}
                                                    </span>
                                                    <Send size={16} />
                                                </>
                                            )}
                                        </button>
                                        {!message.trim() && (
                                            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                                                {isEL ? 'Πληκτρολογήστε το μήνυμά σας για να ενεργοποιηθεί η υποβολή' : 'Enter your message above to enable submission'}
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>

                    {/* Professional Typography Footer */}
                    <div className="text-center pt-4 pb-8">
                        <p className="text-xs font-medium text-gray-400 dark:text-white/40">
                            Spendlore &middot; {getAppVersionString(language)}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeedbackView;
