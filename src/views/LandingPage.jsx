import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowRight, Shield, PieChart, ScanLine, Bell,
    Repeat, Target, ChevronDown, ChevronUp,
    Smartphone, Globe, CheckCircle2, Wallet, BarChart3,
    Lock, ArrowUpRight, Menu, X
} from 'lucide-react';
import { PLAY_STORE_URL } from '../utils/platform';

const PrivacyPolicyView = React.lazy(() => import('./PrivacyPolicyView'));
const TermsOfServiceView = React.lazy(() => import('./TermsOfServiceView'));

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

const NavBar = ({ lang, setLang, onHome, legalView, onOpenLegal }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleAnchorClick = (e, hash) => {
        if (legalView) {
            e.preventDefault();
            if (onHome) onHome();
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
        setMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-gray-200/90 dark:border-white/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a
                        href="/"
                        onClick={(e) => {
                            if (onHome) {
                                e.preventDefault();
                                onHome();
                            }
                        }}
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-white p-1 border border-gray-200/80 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0">
                            <img
                                src="/spendlore-mark.png"
                                alt="Spendlore"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white font-display">
                            Spendlore
                        </span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {legalView ? (
                            <>
                                <a
                                    href="/"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onHome) onHome();
                                    }}
                                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors"
                                >
                                    <span>{lang === 'el' ? 'Αρχική' : 'Home'}</span>
                                </a>
                                <a
                                    href="/privacy"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onOpenLegal) onOpenLegal('privacy');
                                    }}
                                    className={`text-sm transition-colors ${
                                        legalView === 'privacy'
                                            ? 'font-bold text-gray-950 dark:text-white underline underline-offset-4'
                                            : 'font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white'
                                    }`}
                                >
                                    {lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                                </a>
                                <a
                                    href="/terms"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onOpenLegal) onOpenLegal('terms');
                                    }}
                                    className={`text-sm transition-colors ${
                                        legalView === 'terms'
                                            ? 'font-bold text-gray-950 dark:text-white underline underline-offset-4'
                                            : 'font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white'
                                    }`}
                                >
                                    {lang === 'el' ? 'Όροι Χρήσης' : 'Terms of Service'}
                                </a>
                            </>
                        ) : (
                            <>
                                <a
                                    href="#features"
                                    onClick={(e) => handleAnchorClick(e, '#features')}
                                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors"
                                >
                                    {lang === 'el' ? 'Δυνατότητες' : 'Features'}
                                </a>
                                <a
                                    href="#pricing"
                                    onClick={(e) => handleAnchorClick(e, '#pricing')}
                                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors"
                                >
                                    {lang === 'el' ? 'Τιμολόγηση' : 'Pricing'}
                                </a>
                                <a
                                    href="#faq"
                                    onClick={(e) => handleAnchorClick(e, '#faq')}
                                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors"
                                >
                                    FAQ
                                </a>
                            </>
                        )}
                        <div role="group" aria-label="Language selection" className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setLang('el')}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                                    lang === 'el'
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-2xs'
                                        : 'bg-white dark:bg-surface-dark2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-dark3'
                                }`}
                                aria-label="Ελληνικά"
                                aria-pressed={lang === 'el'}
                            >
                                EL
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                                    lang === 'en'
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-2xs'
                                        : 'bg-white dark:bg-surface-dark2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-dark3'
                                }`}
                                aria-label="English"
                                aria-pressed={lang === 'en'}
                            >
                                EN
                            </button>
                        </div>
                        <a
                            href={APP_URL}
                            className="text-sm font-bold text-white bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-xs"
                        >
                            {lang === 'el' ? 'Είσοδος' : 'Sign In'}
                        </a>
                    </div>

                    {/* Mobile Controls (Language toggle + Menu button) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <div role="group" aria-label="Language selection" className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setLang('el')}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                                    lang === 'el'
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-2xs'
                                        : 'bg-white dark:bg-surface-dark2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-dark3'
                                }`}
                                aria-label="Ελληνικά"
                                aria-pressed={lang === 'el'}
                            >
                                EL
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                                    lang === 'en'
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-2xs'
                                        : 'bg-white dark:bg-surface-dark2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-dark3'
                                }`}
                                aria-label="English"
                                aria-pressed={lang === 'en'}
                            >
                                EN
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {menuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-gray-100 dark:border-white/10 space-y-1">
                        {legalView && (
                            <a
                                href="/"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onHome) onHome();
                                    setMenuOpen(false);
                                }}
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark3 transition-colors"
                            >
                                {lang === 'el' ? 'Αρχική' : 'Home'}
                            </a>
                        )}
                        <a
                            href="#features"
                            onClick={(e) => handleAnchorClick(e, '#features')}
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark3 transition-colors"
                        >
                            {lang === 'el' ? 'Δυνατότητες' : 'Features'}
                        </a>
                        <a
                            href="#pricing"
                            onClick={(e) => handleAnchorClick(e, '#pricing')}
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark3 transition-colors"
                        >
                            {lang === 'el' ? 'Τιμολόγηση' : 'Pricing'}
                        </a>
                        <a
                            href="#faq"
                            onClick={(e) => handleAnchorClick(e, '#faq')}
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark3 transition-colors"
                        >
                            FAQ
                        </a>

                        <div className="pt-2 border-t border-gray-100 dark:border-white/10 space-y-1">
                            <a
                                href="/privacy"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onOpenLegal) onOpenLegal('privacy');
                                    setMenuOpen(false);
                                }}
                                className={`block text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${
                                    legalView === 'privacy'
                                        ? 'bg-gray-100 dark:bg-white/10 text-gray-950 dark:text-white font-bold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-dark3'
                                }`}
                            >
                                {lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                            </a>
                            <a
                                href="/terms"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onOpenLegal) onOpenLegal('terms');
                                    setMenuOpen(false);
                                }}
                                className={`block text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${
                                    legalView === 'terms'
                                        ? 'bg-gray-100 dark:bg-white/10 text-gray-950 dark:text-white font-bold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-dark3'
                                }`}
                            >
                                {lang === 'el' ? 'Όροι Χρήσης' : 'Terms of Service'}
                            </a>
                        </div>

                        <div className="px-3 pt-2">
                            <a
                                href={APP_URL}
                                className="w-full block text-center text-sm font-bold text-white bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-xs"
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
        <div className="border-b border-gray-200 dark:border-white/10 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 sm:py-5 px-1 text-left group cursor-pointer"
                aria-expanded={open}
            >
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white pr-4 leading-snug">
                    {lang === 'el' ? item.q : item.qEn}
                </span>
                <span className="shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>
            {open && (
                <div className="pb-5 px-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
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
    const [lang, setLang] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const queryLang = params.get('lang');
            if (queryLang === 'el' || queryLang === 'en') return queryLang;
            const saved = localStorage.getItem('landing_lang');
            if (saved === 'el' || saved === 'en') return saved;
        } catch {
            // Ignore storage/param errors in restricted environments
        }
        return 'el'; // Greek default
    });

    const location = useLocation();
    const navigate = useNavigate();

    const legalView = useMemo(() => {
        const path = (location?.pathname || '').toLowerCase();
        const hash = (location?.hash || '').toLowerCase();
        const params = new URLSearchParams(location?.search || '');
        if (path === '/privacy' || path.startsWith('/privacy/') || hash === '#privacy' || params.get('tab') === 'privacy' || params.get('legal') === 'privacy') return 'privacy';
        if (path === '/terms' || path.startsWith('/terms/') || hash === '#terms' || params.get('tab') === 'terms' || params.get('legal') === 'terms') return 'terms';
        return null;
    }, [location?.pathname, location?.hash, location?.search]);

    const updateLang = (valOrFn) => {
        setLang(prev => {
            const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
            try {
                localStorage.setItem('landing_lang', next);
            } catch {
                // Ignore storage errors
            }
            return next;
        });
    };

    const openLegal = (type) => {
        const nextPath = type === 'privacy' ? '/privacy' : '/terms';
        navigate(nextPath);
        window.scrollTo(0, 0);
    };

    const closeLegal = () => {
        navigate('/');
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        if (legalView === 'privacy') {
            document.title = lang === 'el' ? 'Πολιτική Απορρήτου | Spendlore' : 'Privacy Policy | Spendlore';
        } else if (legalView === 'terms') {
            document.title = lang === 'el' ? 'Όροι Χρήσης | Spendlore' : 'Terms of Service | Spendlore';
        } else {
            document.title = lang === 'el'
                ? 'Spendlore — Έξυπνη Διαχείριση Προσωπικών Οικονομικών'
                : 'Spendlore — Smart Personal Finance Tracker';
        }
    }, [legalView, lang]);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
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

    if (legalView) {
        const isPrivacy = legalView === 'privacy';
        const pageTitle = isPrivacy
            ? (lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy')
            : (lang === 'el' ? 'Όροι Χρήσης' : 'Terms of Service');
        const pagePath = isPrivacy ? '/privacy' : '/terms';

        return (
            <div className="landing-page min-h-dvh bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-white/20 flex flex-col">
                <NavBar
                    lang={lang}
                    setLang={updateLang}
                    onHome={closeLegal}
                    legalView={legalView}
                    onOpenLegal={openLegal}
                />

                <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12">
                    {/* Header bar with breadcrumb and explicit visible URL badge */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <a
                                href="/"
                                onClick={(e) => {
                                    e.preventDefault();
                                    closeLegal();
                                }}
                                className="hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                spendlore.gr
                            </a>
                            <span className="text-gray-400">/</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{pageTitle}</span>
                        </div>

                        {/* Explicit URL Affordance Pill */}
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-[11px] font-mono text-gray-600 dark:text-gray-300 self-start sm:self-auto">
                            <Globe size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>spendlore.gr{pagePath}</span>
                        </div>
                    </div>

                    <React.Suspense fallback={<div className="p-12 text-center text-sm text-gray-400">Loading...</div>}>
                        {isPrivacy ? (
                            <PrivacyPolicyView hideHeader={true} hideBack={true} lang={lang} />
                        ) : (
                            <TermsOfServiceView hideHeader={true} hideBack={true} lang={lang} />
                        )}
                    </React.Suspense>
                </main>

                <footer className="border-t border-gray-200 dark:border-white/10 py-10 px-4 sm:px-6 bg-white dark:bg-surface-dark">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white p-1 border border-gray-200/80 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0">
                                <img
                                    src="/spendlore-mark.png"
                                    alt="Spendlore"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white font-display">
                                Spendlore
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs text-gray-500 dark:text-gray-400">
                            <a
                                href="/privacy"
                                onClick={(e) => {
                                    e.preventDefault();
                                    openLegal('privacy');
                                }}
                                className={`hover:text-gray-950 dark:hover:text-white transition-colors ${legalView === 'privacy' ? 'font-bold text-gray-950 dark:text-white underline underline-offset-4' : ''}`}
                            >
                                {lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a
                                href="/terms"
                                onClick={(e) => {
                                    e.preventDefault();
                                    openLegal('terms');
                                }}
                                className={`hover:text-gray-950 dark:hover:text-white transition-colors ${legalView === 'terms' ? 'font-bold text-gray-950 dark:text-white underline underline-offset-4' : ''}`}
                            >
                                {lang === 'el' ? 'Όροι Χρήσης' : 'Terms of Service'}
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                                Google Play
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a href={APP_URL} className="hover:text-gray-950 dark:hover:text-white transition-colors">
                                Web App
                            </a>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            © {new Date().getFullYear()} Spendlore
                        </p>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="landing-page min-h-dvh bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-white/20">
            <NavBar
                lang={lang}
                setLang={updateLang}
                onHome={closeLegal}
                legalView={null}
                onOpenLegal={openLegal}
            />

            {/* ── HERO ── */}
            <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6">
                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Eyebrow */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        <Shield size={13} className="shrink-0" strokeWidth={2.2} />
                        <span>{lang === 'el' ? 'Χωρίς διαφημίσεις · Χωρίς πώληση δεδομένων' : 'Zero Ads · Full Privacy'}</span>
                        <span className="text-gray-300 dark:text-gray-700 mx-1">·</span>
                        <a
                            href="/privacy"
                            onClick={(e) => {
                                e.preventDefault();
                                openLegal('privacy');
                            }}
                            className="underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 normal-case font-semibold text-xs tracking-normal"
                        >
                            {lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                        </a>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-display text-gray-900 dark:text-white mb-5">
                        {lang === 'el' ? 'Τα οικονομικά σου, με απόλυτο έλεγχο.' : 'Your finances, with absolute clarity.'}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
                        {lang === 'el'
                            ? 'Καταγραφή εξόδων, έξυπνοι προϋπολογισμοί, στόχοι αποταμίευσης και σάρωση αποδείξεων. Ό,τι χρειάζεσαι για να ελέγχεις τα χρήματά σου — δωρεάν.'
                            : 'Expense tracking, smart budgets, savings goals, and receipt scanning. Everything you need to master your money — for free.'
                        }
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 max-w-md sm:max-w-none mx-auto">
                        <a
                            href={APP_URL}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm rounded-xl shadow-xs transition-all active:scale-95 min-h-[46px]"
                        >
                            {lang === 'el' ? 'Ξεκίνα Δωρεάν' : 'Get Started Free'}
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </a>
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white dark:bg-surface-dark2 text-gray-900 dark:text-white font-bold text-sm rounded-xl border border-gray-200/90 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-dark3 shadow-xs transition-all active:scale-95 min-h-[46px]"
                        >
                            <Smartphone size={16} strokeWidth={2.2} />
                            Google Play
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                            {lang === 'el' ? 'Δωρεάν για πάντα' : 'Free forever'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                            {lang === 'el' ? 'Android & Web' : 'Android & Web'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                            {lang === 'el' ? 'Ελληνικά & English' : 'Greek & English'}
                        </span>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-surface-dark2 border-y border-gray-200/80 dark:border-white/10 scroll-mt-20">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">
                            {lang === 'el' ? 'Δυνατότητες' : 'Features'}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display mb-3">
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
                                    className="p-5 sm:p-6 rounded-2xl bg-gray-50/80 dark:bg-surface-dark border border-gray-200/80 dark:border-white/10 shadow-xs hover:border-gray-300 dark:hover:border-white/20 transition-all"
                                >
                                    <div className="text-gray-900 dark:text-white mb-3.5">
                                        <Icon size={22} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white mb-1.5 leading-snug">
                                        {lang === 'el' ? feat.title : feat.titleEn}
                                    </h3>
                                    <p className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                        {lang === 'el' ? feat.desc : feat.descEn}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── PLATFORMS ── */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/50 dark:bg-surface-dark">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">
                            {lang === 'el' ? 'Πλατφόρμες' : 'Platforms'}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display mb-3">
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
                            className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/90 dark:border-white/10 shadow-xs hover:border-gray-300 dark:hover:border-white/20 transition-all"
                        >
                            <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                                <Smartphone size={24} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white leading-snug">
                                    Google Play Store
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {lang === 'el' ? 'Κατέβασε δωρεάν για Android' : 'Download free for Android'}
                                </p>
                            </div>
                            <ArrowUpRight size={17} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors shrink-0" />
                        </a>

                        {/* Web App Card */}
                        <a
                            href={APP_URL}
                            className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/90 dark:border-white/10 shadow-xs hover:border-gray-300 dark:hover:border-white/20 transition-all"
                        >
                            <div className="shrink-0 text-gray-900 dark:text-white">
                                <Globe size={24} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white leading-snug">
                                    Web App
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {lang === 'el' ? 'Άνοιξε στον browser' : 'Open in browser'}
                                </p>
                            </div>
                            <ArrowUpRight size={17} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors shrink-0" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-surface-dark2 border-y border-gray-200/80 dark:border-white/10 scroll-mt-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">
                            {lang === 'el' ? 'Συνδρομές' : 'Pricing'}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display mb-3">
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
                        <div className="p-6 sm:p-7 rounded-2xl bg-gray-50/80 dark:bg-surface-dark border border-gray-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                                    {lang === 'el' ? 'Δωρεάν' : 'Free'}
                                </p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                                    €0
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
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
                                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.2} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={APP_URL}
                                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-surface-dark2 hover:bg-gray-100 dark:hover:bg-surface-dark3 text-gray-900 dark:text-white font-bold text-sm rounded-xl border border-gray-200 dark:border-white/10 shadow-xs transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Ξεκίνα Δωρεάν' : 'Get Started'}
                            </a>
                        </div>

                        {/* Pro Monthly Plan */}
                        <div className="p-6 sm:p-7 rounded-2xl bg-gray-50/80 dark:bg-surface-dark border border-gray-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between">
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
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
                                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.2} />
                                            <span className={i === 0 ? 'font-bold' : ''}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={isDevHost ? '/upgrade?plan=monthly&app=1' : `${APP_URL}/upgrade?plan=monthly`}
                                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-surface-dark2 hover:bg-gray-100 dark:hover:bg-surface-dark3 text-gray-900 dark:text-white font-bold text-sm rounded-xl border border-gray-200 dark:border-white/10 shadow-xs transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Δοκίμασε Μηνιαίο' : 'Try Monthly'}
                            </a>
                        </div>

                        {/* Pro Annual Plan - Flagship */}
                        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-surface-dark3 border-2 border-gray-900 dark:border-white relative flex flex-col justify-between shadow-xs">
                            <span className="absolute -top-3 left-6 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white">
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
                                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.2} />
                                            <span className={i < 2 ? 'font-bold' : ''}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={isDevHost ? '/upgrade?plan=yearly&app=1' : `${APP_URL}/upgrade?plan=yearly`}
                                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm rounded-xl shadow-xs transition-all active:scale-95"
                            >
                                {lang === 'el' ? 'Δοκίμασε Pro Ετήσιο' : 'Try Pro Annual'}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/50 dark:bg-surface-dark scroll-mt-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">
                            FAQ
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display mb-3">
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
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-surface-dark2 border-t border-gray-200/80 dark:border-white/10">
                <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-2xl bg-gray-50/80 dark:bg-surface-dark border border-gray-200/90 dark:border-white/10 shadow-xs">
                    <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white p-2.5 border border-gray-200/80 dark:border-white/10 shadow-xs flex items-center justify-center">
                        <img
                            src="/spendlore-mark.png"
                            alt="Spendlore"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display mb-3">
                        {lang === 'el' ? 'Πάρε τον έλεγχο των οικονομικών σου' : 'Take control of your finances'}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8 font-medium">
                        {lang === 'el'
                            ? 'Δημιούργησε δωρεάν λογαριασμό σε 30 δευτερόλεπτα. Χωρίς πιστωτική κάρτα.'
                            : 'Create a free account in 30 seconds. No credit card required.'
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
                        <a
                            href={APP_URL}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm rounded-xl shadow-xs transition-all active:scale-95 min-h-[46px]"
                        >
                            {lang === 'el' ? 'Ξεκίνα Δωρεάν' : 'Get Started Free'}
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </a>
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white dark:bg-surface-dark2 text-gray-900 dark:text-white font-bold text-sm rounded-xl border border-gray-200/90 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-dark3 shadow-xs transition-all active:scale-95 min-h-[46px]"
                        >
                            <Smartphone size={16} strokeWidth={2.2} />
                            Google Play
                        </a>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-gray-200 dark:border-white/10 py-10 px-4 sm:px-6 bg-white dark:bg-surface-dark">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white p-1 border border-gray-200/80 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0">
                                <img
                                    src="/spendlore-mark.png"
                                    alt="Spendlore"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white font-display">
                                Spendlore
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs text-gray-500 dark:text-gray-400">
                            <a
                                href="/privacy"
                                onClick={(e) => {
                                    e.preventDefault();
                                    openLegal('privacy');
                                }}
                                className="hover:text-gray-950 dark:hover:text-white transition-colors"
                            >
                                {lang === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a
                                href="/terms"
                                onClick={(e) => {
                                    e.preventDefault();
                                    openLegal('terms');
                                }}
                                className="hover:text-gray-950 dark:hover:text-white transition-colors"
                            >
                                {lang === 'el' ? 'Όροι Χρήσης' : 'Terms of Service'}
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-950 dark:hover:text-white transition-colors">
                                Google Play
                            </a>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <a href={APP_URL} className="hover:text-gray-950 dark:hover:text-white transition-colors">
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

