import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Activity, RefreshCw, FileText, Smartphone, ArrowUp, EyeOff, MoreVertical } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import ProBadge from './ProBadge';
import { getLatestReleaseNote, getReleaseNoteByVersion } from '../data/releaseNotes';

const KNOWN_PREVIEWS = new Set([
    'balance_trend', 'whats_new', 'telemetry', 'pro_badge',
    'feedback_toolbar', 'scroll_reset', 'update_check',
    'categories_redesign', 'mobile_polish', 'modal_portal',
    'privacy_blur', 'privacy_uniformity'
]);

const PREVIEW_ALIASES = {
    categories: 'categories_redesign',
    support: 'feedback_toolbar',
    feedback: 'feedback_toolbar',
    settings: 'feedback_toolbar',
    cooling_off: 'modal_portal',
    budgets: 'modal_portal',
};

export const resolvePreviewType = (type) => {
    if (!type) return null;
    if (KNOWN_PREVIEWS.has(type)) return type;
    return PREVIEW_ALIASES[type] || null;
};

export const hasFeaturePreview = (type) => Boolean(resolvePreviewType(type));

/**
 * FeaturePreview — Renders realistic, high-fidelity UI previews for release notes
 * Matches the visual mockups shown in modern personal finance release drawers.
 */
const FeaturePreview = ({ type, isEL }) => {
    const resolvedType = resolvePreviewType(type) || type;
    switch (resolvedType) {
        case 'balance_trend':
            return (
                <div className="p-3.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 select-none space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {isEL ? 'Συνολικό Υπόλοιπο' : 'Balance'}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                            30D ▾
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-gray-400">€</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">3.900,00</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        +€240,00 (↑ +6,5%) <span className="text-gray-400 font-normal">{isEL ? 'έναντι πριν 30 ημ.' : 'vs. 30 days ago'}</span>
                    </div>
                    <div className="h-12 w-full pt-1">
                        <svg viewBox="0 0 300 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="preview-balance-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M 0 38 Q 75 32 150 20 T 300 8 L 300 50 L 0 50 Z" fill="url(#preview-balance-grad)" />
                            <path d="M 0 38 Q 75 32 150 20 T 300 8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1">
                        <span>20 Οκτ 2026</span>
                        <span>20 Νοε 2026</span>
                    </div>
                </div>
            );

        case 'whats_new':
            return (
                <div className="p-3 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 select-none space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-white/5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {isEL ? 'Ενημερώσεις Έκδοσης' : 'Release Highlights'}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                            v1.1.58
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        {isEL ? 'Αναλυτική παρουσίαση αλλαγών με οπτικές προεπισκοπήσεις και άμεση πρόσβαση στις νέες λειτουργίες.' : 'Visual presentation of updates with rich interactive cards.'}
                    </p>
                </div>
            );

        case 'telemetry':
            return (
                <div className="space-y-3 select-none">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/70 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <Activity size={15} className="text-sky-600 dark:text-sky-400" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                                {isEL ? 'Κατανομή Συνδρομών' : 'Subscription Split'}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 tabular-nums">
                            ~€17.94/mo
                        </span>
                    </div>

                    <div className="flex items-center gap-3 py-1">
                        <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                            <svg width="48" height="48" viewBox="0 0 48 48" className="rotate-[-90deg]">
                                <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" className="text-gray-200 dark:text-white/10" strokeWidth="6" />
                                <circle cx="24" cy="24" r="18" fill="none" stroke="#0284c7" strokeWidth="6" strokeDasharray="28 85" strokeLinecap="butt" />
                            </svg>
                            <span className="absolute text-[10px] font-black text-gray-900 dark:text-white">51</span>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">Pro Tier</span>
                                <span className="font-bold text-sky-600 dark:text-sky-400">12%</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">Free Tier</span>
                                <span className="font-bold text-gray-900 dark:text-white">88%</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/10">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 text-[11px] font-black tabular-nums text-gray-900 dark:text-white text-center">01</span>
                                <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">Top Active Member</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold tabular-nums">25 sessions</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/10">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 text-[11px] font-black tabular-nums text-gray-600 dark:text-gray-300 text-center">02</span>
                                <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">Pro Subscriber</span>
                                <ProBadge />
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold tabular-nums">15 sessions</span>
                        </div>
                    </div>
                </div>
            );

        case 'pro_badge':
            return (
                <div className="space-y-2.5 select-none">
                    <div className="p-3 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-200 shrink-0">
                                VB
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Vaggelis Bomponis</p>
                                <p className="text-[10px] text-gray-400 truncate">vaggelis@spendlore.app</p>
                            </div>
                        </div>
                        <ProBadge />
                    </div>

                    <div className="p-2.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                            {isEL ? 'Προηγμένη Οικονομική Ανάλυση' : 'Advanced Financial Analytics'}
                        </span>
                        <ProBadge />
                    </div>
                </div>
            );

        case 'feedback_toolbar':
            return (
                <div className="space-y-2 select-none">
                    <div className="h-8 px-3 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 flex items-center text-xs text-gray-400 font-medium">
                        {isEL ? 'Αναζήτηση με μήνυμα, email ή #TICK ID...' : 'Search by message, email, or #TICK ID...'}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-200/60 dark:bg-white/[0.06] rounded-xl">
                        <span className="py-1 text-center text-[10px] font-bold rounded-lg bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs">
                            {isEL ? 'Όλες' : 'All Status'}
                        </span>
                        <span className="py-1 text-center text-[10px] font-bold rounded-lg text-gray-500 dark:text-gray-400">
                            {isEL ? 'Ανοιχτά' : 'Open'}
                        </span>
                        <span className="py-1 text-center text-[10px] font-bold rounded-lg text-gray-500 dark:text-gray-400">
                            {isEL ? 'Σε Εξέλιξη' : 'In Progress'}
                        </span>
                        <span className="py-1 text-center text-[10px] font-bold rounded-lg text-gray-500 dark:text-gray-400">
                            {isEL ? 'Επιλυμένα' : 'Resolved'}
                        </span>
                    </div>
                </div>
            );

        case 'scroll_reset':
            return (
                <div className="p-3 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 flex items-center justify-between text-xs select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <ArrowUp size={15} strokeWidth={2.4} />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {isEL ? 'Άμεση επαναφορά στην κορυφή' : 'Instant Scroll-to-Top Reset'}
                        </span>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
            );

        case 'update_check':
            return (
                <div className="space-y-2 select-none">
                    <div className="p-2.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <RefreshCw size={14} className="text-gray-700 dark:text-gray-300" />
                            <span className="font-bold text-gray-900 dark:text-white">
                                {isEL ? 'Έλεγχος για ενημερώσεις' : 'Check for updates'}
                            </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10">
                            Google Play
                        </span>
                    </div>
                </div>
            );

        case 'categories_redesign':
            return (
                <div className="space-y-2 select-none">
                    <div className="flex items-center justify-between p-2.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-500/20 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-pink-500" />
                                {isEL ? 'Σούπερ Μάρκετ' : 'Supermarket'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {isEL ? 'Έξοδο' : 'Expense'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <MoreVertical size={16} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/20 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                {isEL ? 'Φαγητό & Καφές' : 'Food & Coffee'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <MoreVertical size={16} />
                        </div>
                    </div>
                </div>
            );

        case 'mobile_polish':
            return (
                <div className="space-y-2.5 select-none">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-950 text-white dark:bg-white dark:text-gray-950 shrink-0 shadow-xs">
                            {isEL ? 'Όλες' : 'All'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-white/10 shrink-0">
                            {isEL ? 'Έξοδα' : 'Expenses'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-white/10 shrink-0">
                            {isEL ? 'Έσοδα' : 'Income'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-white/10 shrink-0">
                            {isEL ? 'Κανόνες Εμπόρων' : 'Merchant Rules'}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 py-2 px-3 text-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold shadow-xs">
                            + {isEL ? 'Προσθήκη Κανόνα' : 'Add Rule'}
                        </div>
                    </div>
                </div>
            );

        case 'modal_portal':
            return (
                <div className="p-3 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 space-y-2.5 select-none">
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-white/5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {isEL ? 'Απομονωμένο Παράθυρο Διαλόγου' : 'Isolated Dialog Window'}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            z-[99999]
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{isEL ? 'Κλείδωμα κύλισης παρασκηνίου' : 'Background scroll lock'}</span>
                        <CheckCircle2 size={15} className="text-emerald-500" />
                    </div>
                </div>
            );

        case 'privacy_blur':
            return (
                <div className="p-3.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10 space-y-2.5 select-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <EyeOff size={15} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {isEL ? 'Λειτουργία Απορρήτου' : 'Privacy Mode'}
                            </span>
                        </div>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300">
                            Gaussian Blur
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums filter blur-[6px]">
                            €1.450,00
                        </span>
                        <span className="text-xs font-bold text-emerald-600 filter blur-[4px]">
                            +12% vs last month
                        </span>
                    </div>
                </div>
            );

        case 'privacy_uniformity':
            return (
                <div className="grid grid-cols-2 gap-2 select-none">
                    <div className="p-2.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Safe-to-Burn</span>
                        <span className="text-base font-black text-gray-900 dark:text-white tabular-nums filter blur-[5px]">
                            €45,00
                        </span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200/70 dark:border-white/10">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Cooling-Off</span>
                        <span className="text-base font-black text-emerald-600 tabular-nums filter blur-[5px]">
                            +€28,00
                        </span>
                    </div>
                </div>
            );

        default:
            return null;
    }
};

/**
 * WhatsNewModal — Sure-style slide-over release notes drawer
 * Modeled directly after modern open source personal finance release drawers.
 */
const WhatsNewModal = ({ isOpen, onClose, data }) => {
    const { language } = useSettings();
    const drawerRef = useRef(null);

    // Focus isolation & scroll lock listener
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose && onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isEL = language === 'el';

    // Resolve update data from props, version lookup, or latest built-in release note
    const activeNote = (() => {
        if (data && (data.sections || data.summary_el || data.summary_en)) {
            return data;
        }
        if (data && data.version) {
            const found = getReleaseNoteByVersion(data.version);
            if (found) return { ...found, ...data };
        }
        return getLatestReleaseNote();
    })();

    if (!activeNote) return null;

    const title = isEL ? (activeNote.title_el || activeNote.title_en) : (activeNote.title_en || activeNote.title_el);
    const summary = isEL ? (activeNote.summary_el || activeNote.summary_en) : (activeNote.summary_en || activeNote.summary_el);

    // Normalize sections: handles rich releaseNotes.js or legacy Supabase app_updates features
    const sections = activeNote.sections || (activeNote.features || []).map(f => ({
        title_el: f.title_el,
        title_en: f.title_en,
        desc_el: f.desc_el,
        desc_en: f.desc_en,
        previewType: f.previewType || null,
        caption_el: f.caption_el || null,
        caption_en: f.caption_en || null,
        image: f.image || null,
    }));

    const modalContent = (
        <div
            className="fixed inset-0 z-[99999] flex justify-end animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsnew-drawer-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity cursor-pointer"
                onClick={onClose}
            />

            {/* Slide-over Drawer */}
            <div
                ref={drawerRef}
                className="relative w-full sm:w-[500px] md:w-[540px] h-full bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col z-[101] animate-slide-up sm:animate-none overflow-hidden"
            >
                {/* ── Top Bar ── */}
                <div
                    className="px-6 border-b border-gray-100 dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md"
                    style={{
                        paddingTop: 'calc(env(safe-area-inset-top) + 1rem)',
                        paddingBottom: '1rem',
                    }}
                >
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isEL ? 'Τι νέο υπάρχει' : "What's new"}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={isEL ? 'Κλείσιμο' : 'Close'}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-7 custom-scrollbar">
                    {/* Main Release Headline */}
                    <div>
                        <h2
                            id="whatsnew-drawer-title"
                            className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight leading-snug"
                        >
                            {title || `Spendlore v${activeNote.version}`}
                        </h2>

                        {summary && (
                            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal mt-3">
                                {summary}
                            </p>
                        )}
                    </div>

                    {/* Feature Sections */}
                    {sections.length > 0 && (
                        <div className="space-y-8 pt-2">
                            {sections.map((section, idx) => {
                                const sectionTitle = isEL ? (section.title_el || section.title_en) : (section.title_en || section.title_el);
                                const sectionDesc = isEL ? (section.desc_el || section.desc_en) : (section.desc_en || section.desc_el);
                                const caption = isEL ? (section.caption_el || section.caption_en) : (section.caption_en || section.caption_el);
                                const hasPreview = Boolean(section.image || (section.previewType && hasFeaturePreview(section.previewType)));

                                return (
                                    <div key={idx} className="space-y-3">
                                        {sectionTitle && (
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                                                {sectionTitle}
                                            </h3>
                                        )}

                                        {sectionDesc && (
                                            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {sectionDesc}
                                            </p>
                                        )}

                                        {/* Visual Preview Card */}
                                        {hasPreview && (
                                            <div className="mt-3">
                                                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-surface-dark2 p-3.5 sm:p-4 overflow-hidden shadow-xs">
                                                    {section.image ? (
                                                        <img
                                                            src={section.image}
                                                            alt={sectionTitle || 'Feature preview'}
                                                            className="w-full h-auto rounded-lg object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <FeaturePreview type={section.previewType} isEL={isEL} />
                                                    )}
                                                </div>

                                                {caption && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic mt-2 px-2">
                                                        {caption}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Sticky Bottom Footer ── */}
                <div
                    className="px-6 border-t border-gray-100 dark:border-white/[0.08] bg-white dark:bg-surface-dark flex items-center justify-end shrink-0"
                    style={{
                        paddingTop: '1rem',
                        paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                        {isEL ? 'Κατάλαβα' : 'Got it'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
};

export default WhatsNewModal;
