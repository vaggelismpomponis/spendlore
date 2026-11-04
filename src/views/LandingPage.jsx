import React, { useState, useEffect } from 'react';
import {
    ArrowRight, Shield, TrendingUp, PieChart, ScanLine, Bell,
    Repeat, Target, Fingerprint, Download, ChevronDown, ChevronUp,
    Smartphone, Globe, CheckCircle2, Star, Wallet, BarChart3,
    Tags, CreditCard, Lock, Eye, ArrowUpRight, Menu, X
} from 'lucide-react';
import { PLAY_STORE_URL } from '../utils/platform';

const isDevHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const APP_URL = isDevHost ? '/?app=1' : 'https://app.spendlore.gr';

/* ─────────────────────────────────────────────────────────────
   FEATURES DATA
───────────────────────────────────────────────────────────── */
const features = [
    {
        icon: Wallet,
        title: 'Έξυπνη Διαχείριση Εξόδων',
        titleEn: 'Smart Expense Tracking',
        desc: 'Καταγράφεις έσοδα και έξοδα σε δευτερόλεπτα. Φωνητική εισαγωγή, OCR σάρωση αποδείξεων, αυτόματη κατηγοριοποίηση.',
        descEn: 'Log income and expenses in seconds. Voice input, OCR receipt scanning, automatic categorization.',
    },
    {
        icon: PieChart,
        title: 'Προϋπολογισμοί & Ειδοποιήσεις',
        titleEn: 'Budgets & Alerts',
        desc: 'Δημιούργησε μηνιαίους προϋπολογισμούς ανά κατηγορία. Ειδοποίηση όταν πλησιάζεις ή ξεπερνάς το όριο.',
        descEn: 'Create monthly budgets per category. Get notified when approaching or exceeding limits.',
    },
    {
        icon: Target,
        title: 'Στόχοι Αποταμίευσης',
        titleEn: 'Savings Goals',
        desc: 'Θέσε στόχους αποταμίευσης, παρακολούθησε την πρόοδο σε πραγματικό χρόνο και μείνε κινητοποιημένος.',
        descEn: 'Set savings goals, track real-time progress, and stay motivated.',
    },
    {
        icon: BarChart3,
        title: 'Αναλυτικά Στατιστικά',
        titleEn: 'Advanced Analytics',
        desc: 'Λεπτομερή γραφήματα ανά μήνα, κατηγορία και τάση. Κατανόησε που πηγαίνουν τα χρήματά σου.',
        descEn: 'Detailed charts by month, category, and trend. Understand where your money goes.',
    },
    {
        icon: Repeat,
        title: 'Επαναλαμβανόμενες Συναλλαγές',
        titleEn: 'Recurring Transactions',
        desc: 'Αυτόματη καταχώρηση πάγιων εξόδων και εσόδων. Ενοίκιο, συνδρομές, μισθός — χωρίς χειροκίνητη εισαγωγή.',
        descEn: 'Automatic logging of recurring bills and income. Rent, subscriptions, salary — hands-free.',
    },
    {
        icon: ScanLine,
        title: 'Σάρωση Αποδείξεων (OCR)',
        titleEn: 'Receipt Scanner (OCR)',
        desc: 'Φωτογράφισε μία απόδειξη και η εφαρμογή εξάγει αυτόματα το ποσό. Υποστήριξη Ελληνικών και Αγγλικών.',
        descEn: 'Snap a receipt photo and the app auto-extracts the amount. Greek & English support.',
    },
    {
        icon: Bell,
        title: 'Αυτόματη Καταγραφή Τραπεζών',
        titleEn: 'Bank SMS Auto-Logging',
        desc: 'Αυτόματη αναγνώριση τραπεζικών SMS (Google Pay, Revolut, Winbank, Alpha κ.α.) και καταχώρηση συναλλαγών.',
        descEn: 'Auto-detect bank SMS notifications and log transactions instantly.',
    },
    {
        icon: Lock,
        title: 'Βιομετρικό Κλείδωμα',
        titleEn: 'Biometric Lock',
        desc: 'Κλείδωσε την εφαρμογή με Face ID ή δακτυλικό αποτύπωμα. Τα δεδομένα σου είναι πάντα ασφαλή.',
        descEn: 'Lock the app with Face ID or fingerprint. Your data is always secure.',
    },
];

/* ─────────────────────────────────────────────────────────────
   FAQ DATA
───────────────────────────────────────────────────────────── */
const faqItems = [
    {
        q: 'Είναι δωρεάν η εφαρμογή;',
        qEn: 'Is the app free?',
        a: 'Ναι! Η βασική έκδοση είναι εντελώς δωρεάν με απεριόριστες συναλλαγές. Η Pro έκδοση ξεκλειδώνει επιπλέον δυνατότητες όπως απεριόριστα budgets, σάρωση αποδείξεων AI, εξαγωγή δεδομένων και βιομετρικό κλείδωμα.',
        aEn: 'Yes! The basic version is completely free with unlimited transactions. The Pro version unlocks extra features like unlimited budgets, AI receipt scanning, data export, and biometric lock.',
    },
    {
        q: 'Τα δεδομένα μου είναι ασφαλή;',
        qEn: 'Is my data secure?',
        a: 'Απολύτως. Χρησιμοποιούμε end-to-end κρυπτογράφηση, ασφαλή αποθήκευση μέσω Supabase/PostgreSQL, και προαιρετικό βιομετρικό κλείδωμα. Δεν πουλάμε ποτέ τα δεδομένα σου και δεν εμφανίζουμε διαφημίσεις.',
        aEn: 'Absolutely. We use secure storage via Supabase/PostgreSQL and optional biometric lock. We never sell your data and never show ads.',
    },
    {
        q: 'Υπάρχει εφαρμογή για Android;',
        qEn: 'Is there an Android app?',
        a: 'Ναι! Το Spendlore είναι διαθέσιμο στο Google Play Store. Μπορείς επίσης να χρησιμοποιήσεις την εφαρμογή από τον browser σε οποιαδήποτε συσκευή (PWA).',
        aEn: 'Yes! Spendlore is available on the Google Play Store. You can also use the app from any browser on any device (PWA).',
    },
    {
        q: 'Μπορώ να εξάγω τα δεδομένα μου;',
        qEn: 'Can I export my data?',
        a: 'Ναι. Με την Pro έκδοση μπορείς να εξάγεις όλες τις συναλλαγές σου σε CSV ή JSON format, ιδανικό για Excel ή τον λογιστή σου. Μπορείς επίσης να δημιουργήσεις πλήρες backup.',
        aEn: 'Yes. With Pro you can export all transactions to CSV or JSON, ideal for Excel or your accountant. You can also create full backups.',
    },
    {
        q: 'Υποστηρίζει πολλές γλώσσες;',
        qEn: 'Does it support multiple languages?',
        a: 'Ναι, η εφαρμογή υποστηρίζει Ελληνικά και Αγγλικά. Η γλώσσα εναλλάσσεται αυτόματα ή χειροκίνητα από τις ρυθμίσεις.',
        aEn: 'Yes, the app supports Greek and English. Language switches automatically or manually from settings.',
    },
    {
        q: 'Πόσο κοστίζει η Pro έκδοση;',
        qEn: 'How much does Pro cost?',
        a: 'Η Pro έκδοση ξεκινά από €2.99/μήνα ή €29.99/έτος (εξοικονόμηση 17%). Μπορείς να ακυρώσεις οποτεδήποτε.',
        aEn: 'Pro starts at €2.99/month or €29.99/year (save 17%). You can cancel anytime.',
    },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

const NavBar = ({ lang, setLang }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200/60 dark:border-white/[0.06]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5 group">
                        <img
                            src="/spendlore-mark.png"
                            alt="Spendlore"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white font-display">
                            Spendlore
                        </span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            {lang === 'el' ? 'Δυνατότητες' : 'Features'}
                        </a>
                        <a href="#pricing" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            {lang === 'el' ? 'Τιμολόγηση' : 'Pricing'}
                        </a>
                        <a href="#faq" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            FAQ
                        </a>
                        <button
                            onClick={() => setLang(lang === 'el' ? 'en' : 'el')}
                            className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                        >
                            {lang === 'el' ? 'EN' : 'ΕΛ'}
                        </button>
                        <a
                            href={APP_URL}
                            className="text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-5 py-2 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95"
                        >
                            {lang === 'el' ? 'Είσοδος' : 'Sign In'}
                        </a>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {menuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-gray-100 dark:border-white/[0.06] space-y-2">
                        <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-gray-600 dark:text-gray-400 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            {lang === 'el' ? 'Δυνατότητες' : 'Features'}
                        </a>
                        <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-gray-600 dark:text-gray-400 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            {lang === 'el' ? 'Τιμολόγηση' : 'Pricing'}
                        </a>
                        <a href="#faq" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-gray-600 dark:text-gray-400 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            FAQ
                        </a>
                        <div className="flex items-center gap-3 px-3 pt-2">
                            <button
                                onClick={() => setLang(lang === 'el' ? 'en' : 'el')}
                                className="text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                            >
                                {lang === 'el' ? 'EN' : 'ΕΛ'}
                            </button>
                            <a
                                href={APP_URL}
                                className="flex-1 text-center text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-5 py-2.5 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Είσοδος' : 'Sign In'}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

const FAQItem = ({ item, lang }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-200/80 dark:border-white/[0.06] last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 px-1 text-left group cursor-pointer"
                aria-expanded={open}
            >
                <span className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white pr-4 leading-snug">
                    {lang === 'el' ? item.q : item.qEn}
                </span>
                <span className="shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>
            {open && (
                <div className="pb-5 px-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {lang === 'el' ? item.a : item.aEn}
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────────── */
const LandingPage = () => {
    const [lang, setLang] = useState('el');

    useEffect(() => {
        const browserLang = navigator.language?.startsWith('el') ? 'el' : 'en';
        setLang(browserLang);

        // Enable full-page document scrolling when viewing LandingPage
        document.documentElement.classList.add('landing-mode');
        document.body.classList.add('landing-mode');
        const root = document.getElementById('root');
        if (root) root.classList.add('landing-mode');

        return () => {
            document.documentElement.classList.remove('landing-mode');
            document.body.classList.remove('landing-mode');
            if (root) root.classList.remove('landing-mode');
        };
    }, []);

    return (
        <div className="landing-page min-h-dvh bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-violet-200 dark:selection:bg-violet-900/50">
            <NavBar lang={lang} setLang={setLang} />

            {/* ── HERO ── */}
            <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 overflow-hidden">
                {/* Subtle background accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-violet-100/40 via-transparent to-transparent dark:from-violet-950/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 mb-6">
                        <Shield size={14} className="text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wide">
                            {lang === 'el' ? 'Χωρίς διαφημίσεις. Χωρίς πώληση δεδομένων.' : 'No ads. No data selling.'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-display mb-5">
                        {lang === 'el' ? (
                            <>
                                Τα οικονομικά σου,{' '}
                                <span className="text-violet-600 dark:text-violet-400">
                                    απλά.
                                </span>
                            </>
                        ) : (
                            <>
                                Your finances,{' '}
                                <span className="text-violet-600 dark:text-violet-400">
                                    simplified.
                                </span>
                            </>
                        )}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
                        {lang === 'el'
                            ? 'Καταγραφή εξόδων, έξυπνοι προϋπολογισμοί, στόχοι αποταμίευσης και σάρωση αποδείξεων. Ό,τι χρειάζεσαι για να ελέγχεις τα χρήματά σου — δωρεάν.'
                            : 'Expense tracking, smart budgets, savings goals, and receipt scanning. Everything you need to control your money — for free.'
                        }
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
                        <a
                            href={APP_URL}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[15px] rounded-xl shadow-sm hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95"
                        >
                            {lang === 'el' ? 'Ξεκίνα Δωρεάν' : 'Get Started Free'}
                            <ArrowRight size={17} strokeWidth={2.5} />
                        </a>
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white font-bold text-[15px] rounded-xl border border-gray-200/80 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/[0.1] transition-all active:scale-95"
                        >
                            <Smartphone size={17} strokeWidth={2} />
                            Google Play
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 dark:text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                            {lang === 'el' ? 'Δωρεάν για πάντα' : 'Free forever'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                            {lang === 'el' ? 'Android & Web' : 'Android & Web'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                            {lang === 'el' ? 'Ελληνικά & English' : 'Greek & English'}
                        </span>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/70 dark:bg-white/[0.015] scroll-mt-20">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display mb-3">
                            {lang === 'el' ? 'Ό,τι χρειάζεσαι, σε μία εφαρμογή' : 'Everything you need, in one app'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                            {lang === 'el'
                                ? 'Από γρήγορη καταγραφή εξόδων μέχρι λεπτομερή ανάλυση — ο πλήρης σύμμαχος στα προσωπικά σου οικονομικά.'
                                : 'From quick expense logging to detailed analysis — your complete personal finance companion.'
                            }
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {features.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <div
                                    key={i}
                                    className="group p-5 sm:p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200/60 dark:border-white/[0.08] flex items-center justify-center mb-4 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10 group-hover:border-violet-200/60 dark:group-hover:border-violet-500/20 transition-colors">
                                        <Icon size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" strokeWidth={1.8} />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1.5 leading-snug">
                                        {lang === 'el' ? feat.title : feat.titleEn}
                                    </h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {lang === 'el' ? feat.desc : feat.descEn}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── PLATFORMS ── */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display mb-3">
                            {lang === 'el' ? 'Παντού μαζί σου' : 'Available everywhere'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                            {lang === 'el'
                                ? 'Android εφαρμογή στο Google Play και web εφαρμογή σε οποιονδήποτε browser. Τα δεδομένα σου συγχρονίζονται αυτόματα.'
                                : 'Android app on Google Play and web app on any browser. Your data syncs automatically.'
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
                        {/* Android Card */}
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Smartphone size={22} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-snug">
                                    Google Play Store
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {lang === 'el' ? 'Κατέβασε δωρεάν' : 'Download for free'}
                                </p>
                            </div>
                            <ArrowUpRight size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
                        </a>

                        {/* Web App Card */}
                        <a
                            href={APP_URL}
                            className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 flex items-center justify-center shrink-0">
                                <Globe size={22} className="text-violet-600 dark:text-violet-400" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-snug">
                                    Web App
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {lang === 'el' ? 'Άνοιξε στον browser' : 'Open in browser'}
                                </p>
                            </div>
                            <ArrowUpRight size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/70 dark:bg-white/[0.015] scroll-mt-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display mb-3">
                            {lang === 'el' ? 'Απλή & Διαφανής Τιμολόγηση' : 'Simple & Transparent Pricing'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                            {lang === 'el'
                                ? 'Ξεκίνα δωρεάν. Επίλεξε μηνιαίο ή ετήσιο πλάνο Pro με 7 ημέρες δωρεάν δοκιμή.'
                                : 'Start free. Choose monthly or annual Pro with a 7-day free trial.'
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                        {/* Free Plan */}
                        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                                    {lang === 'el' ? 'Δωρεάν' : 'Free'}
                                </p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                                    €0
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                                    {lang === 'el' ? 'για πάντα · χωρίς πιστωτική' : 'forever · no credit card'}
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        lang === 'el' ? 'Απεριόριστες συναλλαγές' : 'Unlimited transactions',
                                        lang === 'el' ? 'Βασικά στατιστικά & γραφήματα' : 'Basic analytics & charts',
                                        lang === 'el' ? '3 προϋπολογισμοί (budgets)' : '3 budgets',
                                        lang === 'el' ? '2 στόχοι αποταμίευσης' : '2 savings goals',
                                        lang === 'el' ? 'Φωνητική καταγραφή' : 'Voice input',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={APP_URL}
                                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gray-200/70 dark:bg-white/[0.08] text-gray-700 dark:text-gray-200 font-bold text-sm rounded-xl border border-gray-300/60 dark:border-white/[0.1] hover:bg-gray-200 dark:hover:bg-white/[0.12] transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Ξεκίνα Δωρεάν' : 'Get Started'}
                            </a>
                        </div>

                        {/* Pro Monthly Plan */}
                        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                                    {lang === 'el' ? 'Pro Μηνιαίο' : 'Pro Monthly'}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">€2.99</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        /{lang === 'el' ? 'μήνα' : 'mo'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                                    {lang === 'el' ? '7 ημέρες δωρεάν · Ακύρωση όποτε θες' : '7-day free trial · Cancel anytime'}
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        lang === 'el' ? 'Όλα τα δωρεάν +' : 'Everything in Free +',
                                        lang === 'el' ? 'Απεριόριστα budgets & στόχοι' : 'Unlimited budgets & goals',
                                        lang === 'el' ? 'Σάρωση αποδείξεων (AI OCR)' : 'Receipt scanning (AI OCR)',
                                        lang === 'el' ? 'Αυτόματη καταγραφή SMS' : 'Auto bank SMS logging',
                                        lang === 'el' ? 'Εξαγωγή CSV / JSON' : 'CSV / JSON export',
                                        lang === 'el' ? 'Βιομετρικό κλείδωμα' : 'Biometric lock',
                                        lang === 'el' ? 'Επαναλαμβανόμενες συναλλαγές' : 'Recurring transactions',
                                        lang === 'el' ? 'Priority υποστήριξη' : 'Priority support',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${i === 0 ? 'text-violet-500' : 'text-emerald-500'}`} strokeWidth={2.5} />
                                            <span className={i === 0 ? 'font-bold' : ''}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={isDevHost ? '/upgrade?plan=monthly&app=1' : `${APP_URL}/upgrade?plan=monthly`}
                                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gray-200/70 dark:bg-white/[0.08] text-gray-700 dark:text-gray-200 font-bold text-sm rounded-xl border border-gray-300/60 dark:border-white/[0.1] hover:bg-gray-200 dark:hover:bg-white/[0.12] transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Δοκίμασε Μηνιαίο' : 'Try Monthly'}
                            </a>
                        </div>

                        {/* Pro Annual Plan - Flagship */}
                        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-white/[0.04] border-2 border-gray-900 dark:border-white relative flex flex-col justify-between shadow-lg">
                            <span className="absolute -top-3 left-6 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm">
                                {lang === 'el' ? 'Δημοφιλέστερο · -17%' : 'Best Value · Save 17%'}
                            </span>
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                                    {lang === 'el' ? 'Pro Ετήσιο' : 'Pro Annual'}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">€29.99</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        /{lang === 'el' ? 'έτος' : 'year'}
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-6">
                                    {lang === 'el' ? '≈ €2.50/μήνα · 2 μήνες δωρεάν' : '≈ €2.50/mo · 2 months free'}
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        lang === 'el' ? '7 ημέρες δωρεάν δοκιμή' : '7-day free trial',
                                        lang === 'el' ? 'Όλα τα προνόμια του Pro' : 'All Pro features included',
                                        lang === 'el' ? 'Απεριόριστα budgets & στόχοι' : 'Unlimited budgets & goals',
                                        lang === 'el' ? 'Σάρωση αποδείξεων (AI OCR)' : 'Receipt scanning (AI OCR)',
                                        lang === 'el' ? 'Αυτόματη καταγραφή SMS' : 'Auto bank SMS logging',
                                        lang === 'el' ? 'Εξαγωγή CSV / JSON' : 'CSV / JSON export',
                                        lang === 'el' ? 'Βιομετρικό κλείδωμα' : 'Biometric lock',
                                        lang === 'el' ? 'Επαναλαμβανόμενες συναλλαγές' : 'Recurring transactions',
                                        lang === 'el' ? 'Priority υποστήριξη' : 'Priority support',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${i < 2 ? 'text-violet-500' : 'text-emerald-500'}`} strokeWidth={2.5} />
                                            <span className={i < 2 ? 'font-bold' : ''}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={isDevHost ? '/upgrade?plan=yearly&app=1' : `${APP_URL}/upgrade?plan=yearly`}
                                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm rounded-xl shadow-sm hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Δοκίμασε Pro Ετήσιο' : 'Try Pro Annual'}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 scroll-mt-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display mb-3">
                            {lang === 'el' ? 'Συχνές Ερωτήσεις' : 'Frequently Asked Questions'}
                        </h2>
                    </div>
                    <div>
                        {faqItems.map((item, i) => (
                            <FAQItem key={i} item={item} lang={lang} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50/70 dark:bg-white/[0.015]">
                <div className="max-w-3xl mx-auto text-center">
                    <img
                        src="/spendlore-mark.png"
                        alt="Spendlore"
                        className="w-14 h-14 mx-auto mb-5 object-contain"
                    />
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display mb-3">
                        {lang === 'el' ? 'Πάρε τον έλεγχο των οικονομικών σου' : 'Take control of your finances'}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                        {lang === 'el'
                            ? 'Δημιούργησε δωρεάν λογαριασμό σε 30 δευτερόλεπτα. Χωρίς πιστωτική κάρτα.'
                            : 'Create a free account in 30 seconds. No credit card required.'
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href={APP_URL}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[15px] rounded-xl shadow-sm hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95"
                        >
                            {lang === 'el' ? 'Ξεκίνα Δωρεάν' : 'Get Started Free'}
                            <ArrowRight size={17} strokeWidth={2.5} />
                        </a>
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white font-bold text-[15px] rounded-xl border border-gray-200/80 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/[0.1] transition-all active:scale-95"
                        >
                            <Smartphone size={17} strokeWidth={2} />
                            Google Play
                        </a>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-gray-200/80 dark:border-white/[0.06] py-10 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <img
                                src="/spendlore-mark.png"
                                alt="Spendlore"
                                className="w-6 h-6 object-contain"
                            />
                            <span className="text-sm font-bold text-gray-900 dark:text-white font-display">
                                Spendlore
                            </span>
                        </div>
                        <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
                            <a href={isDevHost ? '/?app=1&tab=privacy' : `${APP_URL}?tab=privacy`} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                {lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                Google Play
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a href={APP_URL} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                Web App
                            </a>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            © {new Date().getFullYear()} Spendlore
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

