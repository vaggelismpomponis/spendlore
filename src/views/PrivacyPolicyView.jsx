import React from 'react';
import {
    ShieldCheck,
    Lock,
    Eye,
    Database,
    Mail,
    Server,
    UserCheck,
    FileText,
    CheckCircle2,
    Shield,
    Check,
    ExternalLink,
    Globe,
    Key
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';

const PrivacyPolicyView = ({ onBack, hideHeader = false, lang, backLabel, hideBack = false }) => {
    const settings = useSettings?.() || {};
    const effectiveLang = lang || settings.language || 'el';
    const isEL = effectiveLang === 'el';
    const effectiveBack = hideBack ? null : onBack;

    return (
        <div className="h-full min-h-dvh bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300">

            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={effectiveBack}
                title={isEL ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                subtitle={isEL ? 'Ενημέρωση: Νοέμβριος 2026' : 'Updated: November 2026'}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    <DesktopBreadcrumb
                        onBack={effectiveBack}
                        backLabel={backLabel || (isEL ? 'Επιστροφή στις Ρυθμίσεις' : 'Back to Settings')}
                        hideHeader={hideHeader}
                    />

                    {/* ─────── Executive Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            <Shield size={14} strokeWidth={2.2} />
                            <span>{isEL ? 'Χάρτης Εμπιστοσύνης & Απορρήτου' : 'Privacy & Trust Charter'}</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                                {isEL
                                    ? 'Πολιτική Απορρήτου Spendlore'
                                    : 'Spendlore Privacy Policy'}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                {isEL
                                    ? 'Η παρούσα Πολιτική Απορρήτου καθορίζει με πλήρη διαφάνεια τον τρόπο με τον οποίο η εφαρμογή Spendlore (διαθέσιμη στο www.spendlore.gr και στο Google Play) συλλέγει, διαχειρίζεται, προστατεύει και διαγράφει τα προσωπικά και οικονομικά σας δεδομένα.'
                                    : 'This Privacy Policy details with complete transparency how the Spendlore personal finance application (hosted at https://www.spendlore.gr/ and on Google Play) collects, processes, protects, and deletes your personal and financial data.'}
                            </p>
                        </div>

                        {/* App Metadata & Scope Pill */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 font-mono text-gray-700 dark:text-gray-300">
                                <Globe size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>https://www.spendlore.gr</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 font-medium text-gray-700 dark:text-gray-300">
                                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{isEL ? 'Έκδοση 2.0 • Ενημέρωση 5 Νοεμβρίου 2026' : 'Version 2.0 • Updated November 5, 2026'}</span>
                            </span>
                        </div>
                    </div>

                    {/* ─────── Section 1: Google User Data & OAuth 2.0 Policy (CRITICAL FOR GOOGLE COMPLIANCE) ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                                <Key size={14} strokeWidth={2.4} />
                                <span>{isEL ? 'Συμμόρφωση Google OAuth 2.0' : 'Google User Data & OAuth 2.0 Policy'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL
                                    ? 'Δεδομένα Χρήστη Google & Δήλωση Περιορισμένης Χρήσης (Limited Use)'
                                    : 'Google User Data Access & Limited Use Disclosure'}
                            </h2>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Η εφαρμογή μας προσφέρει τη δυνατότητα σύνδεσης μέσω Google (Google Sign-In) για γρήγορη, ασφαλή και αξιόπιστη ταυτοποίηση χωρίς ανάγκη κωδικών πρόσβασης.'
                                : 'Our application offers Google Sign-In (OAuth 2.0) to provide a streamlined, secure, and passwordless authentication experience.'}
                        </p>

                        <div className="space-y-3 pt-1">
                            {/* Google Scopes & Data Accessed */}
                            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 space-y-2">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{isEL ? 'Τι δεδομένα λαμβάνουμε από το Google Account σας:' : 'Data Accessed via Google APIs:'}</span>
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Ζητάμε αποκλειστικά τα βασικά στοιχεία προφίλ ταυτότητας (email, profile, openid):'
                                        : 'We request and access only basic user profile identity scopes (email, profile, openid):'}
                                </p>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 pl-4 list-disc">
                                    <li>
                                        <strong>Email:</strong> {isEL ? 'Η διεύθυνση email σας, αποκλειστικά για τη δημιουργία και ταυτοποίηση του λογαριασμού σας.' : 'Your primary email address, strictly used to create and authenticate your account.'}
                                    </li>
                                    <li>
                                        <strong>{isEL ? 'Όνομα' : 'Display Name'}:</strong> {isEL ? 'Το ονοματεπώνυμό σας για την εξατομίκευση του προφίλ στην εφαρμογή.' : 'Your name, used solely to personalize your profile view.'}
                                    </li>
                                    <li>
                                        <strong>{isEL ? 'Εικόνα Προφίλ' : 'Profile Avatar'}:</strong> {isEL ? 'Η εικόνα προφίλ σας για εμφάνιση στο header του λογαριασμού σας.' : 'Your profile picture URL, displayed in the application header.'}
                                    </li>
                                </ul>
                                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 italic">
                                    {isEL
                                        ? 'ΔΕΝ ζητάμε, ΔΕΝ έχουμε πρόσβαση και ΔΕΝ διαβάζουμε ποτέ δεδομένα από το Google Drive, το Gmail, τις Επαφές Google ή το Ημερολόγιο Google.'
                                        : 'We do NOT request, access, read, or process data from your Google Drive, Gmail, Google Contacts, Google Calendar, or any other private Google service.'}
                                </p>
                            </div>

                            {/* Google Limited Use Verbatim Clause */}
                            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 space-y-2">
                                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                                    <span>{isEL ? 'Δήλωση Πολιτικής Περιορισμένης Χρήσης Google (Limited Use)' : 'Google API Limited Use Compliance'}</span>
                                </h3>
                                <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed font-semibold">
                                    &ldquo;Spendlore&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                                    <a
                                        href="https://developers.google.com/terms/api-services-user-data-policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 font-bold"
                                    >
                                        Google API Services User Data Policy
                                        <ExternalLink size={12} />
                                    </a>
                                    , including the Limited Use requirements.&rdquo;
                                </p>
                            </div>

                            {/* Google Data Retention & Revocation */}
                            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 space-y-2">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <Lock size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{isEL ? 'Διατήρηση & Ανάκληση Πρόσβασης Google:' : 'Google Data Retention & Revocation:'}</span>
                                </h3>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 pl-4 list-disc">
                                    <li>
                                        <strong>{isEL ? 'Ανάκληση μέσω Google' : 'Revoke via Google'}:</strong>{' '}
                                        {isEL
                                            ? 'Μπορείτε ανά πάσα στιγμή να ανακαλέσετε την πρόσβαση του Spendlore στο Google Account σας μεταβαίνοντας στις '
                                            : 'You can revoke Spendlore&apos;s access to your Google account at any time by visiting '}
                                        <a
                                            href="https://myaccount.google.com/permissions"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-emerald-600 dark:text-emerald-400 underline inline-flex items-center gap-1"
                                        >
                                            myaccount.google.com/permissions
                                            <ExternalLink size={11} />
                                        </a>.
                                    </li>
                                    <li>
                                        <strong>{isEL ? 'Οριστική Διαγραφή' : 'Permanent Deletion'}:</strong>{' '}
                                        {isEL
                                            ? 'Μπορείτε να διαγράψετε οριστικά το λογαριασμό σας μέσα από την εφαρμογή (Ρυθμίσεις > Ζώνη Κινδύνου > Διαγραφή Λογαριασμού). Η ενέργεια αυτή διαγράφει άμεσα και αμετάκλητα όλα τα δεδομένα σας από τους διακομιστές μας.'
                                            : 'You can permanently delete your account directly inside the app (Settings > Danger Zone > Delete Account). This immediately and irreversibly deletes all your data from our database.'}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 2: What Financial Data We Collect ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <Eye size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Οικονομικά Δεδομένα' : 'Financial Ledger Data'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Τι δεδομένα συλλέγουμε' : 'What Data We Collect'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <Database size={18} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Συναλλαγές & Προϋπολογισμοί' : 'Ledger Entries'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Ποσά, ημερομηνίες, κατηγορίες εξόδων/εσόδων, στόχοι αποταμίευσης και προϋπολογισμοί που καταχωρείτε οικειοθελώς.'
                                        : 'Amounts, dates, categories, budgets, and savings goals that you manually record or configure.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <FileText size={18} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Σάρωση Αποδείξεων (OCR)' : 'Receipt Scanning (OCR)'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Η οπτική αναγνώριση αποδείξεων εκτελείται τοπικά στη μνήμη της συσκευής σας. Οι φωτογραφίες των αποδείξεων δεν αποθηκεύονται ούτε πωλούνται σε τρίτους.'
                                        : 'Receipt text extraction executes locally in device memory. Receipt photos are not archived or transferred to data brokers.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <Server size={18} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Ασφάλεια Συσκευής' : 'Device Security'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Το PIN και το βιομετρικό κλείδωμα (FaceID/Fingerprint) ελέγχονται αποκλειστικά από το Secure Enclave της συσκευής σας.'
                                        : 'App PIN and biometric locks authenticate strictly on your local device hardware enclave.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 3: Zero Commercialization Pledge ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <ShieldCheck size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Δέσμευση Μηδενικών Διαφημίσεων' : 'Zero Commercialization Pledge'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Πλήρης Προστασία από Διαφημιστικά Δίκτυα' : 'No Advertising & No Data Brokers'}
                            </h2>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                            <ShieldCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" strokeWidth={2.2} />
                            <div className="text-xs sm:text-sm leading-relaxed">
                                <strong className="font-bold block text-sm text-emerald-900 dark:text-emerald-200 mb-0.5">
                                    {isEL ? 'Δεν Πουλάμε Ποτέ Δεδομένα' : 'We Never Sell or Broker Data'}
                                </strong>
                                {isEL
                                    ? 'Δεν ενσωματώνουμε διαφημιστικά SDK (Google AdMob, Meta Audience Network, κ.λπ.) και δεν πωλούμε, δεν εκμισθώνουμε και δεν διαβιβάζουμε τα οικονομικά σας δεδομένα σε διαφημιστές ή εταιρείες τηλεμετρίας.'
                                    : 'We do not integrate advertising SDKs (such as Google AdMob or Meta Audience Network) and we never sell, broker, rent, or transfer your financial data to third-party advertisers.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="flex items-start gap-3">
                                <Check size={16} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Supabase & Google Cloud' : 'Supabase Infrastructure'}
                                    </strong>
                                    {isEL
                                        ? 'Υποδομές φιλοξενίας δεδομένων σε servers Google Cloud Platform με ενεργό PostgreSQL Row Level Security (RLS).'
                                        : 'Enterprise data hosting on Google Cloud Platform with PostgreSQL Row Level Security (RLS) enforcing user isolation.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Check size={16} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Πληρωμές Stripe PCI-DSS Level 1' : 'Stripe Payment Processor'}
                                    </strong>
                                    {isEL
                                        ? 'Οι προαιρετικές συνδρομές Pro επεξεργάζονται απευθείας από τη Stripe. Δεν αποθηκεύουμε αριθμούς καρτών.'
                                        : 'Optional Pro subscriptions process through Stripe (PCI-DSS Level 1). No credit card numbers ever touch our database.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 4: Data Security & Encryption ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <Lock size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Ασφάλεια Υποδομών' : 'Infrastructure Security'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Ασφάλεια Δεδομένων & Κρυπτογράφηση' : 'Data Security & Storage'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-[11px] font-mono font-bold text-gray-900 dark:text-white inline-block">
                                    TLS 1.3
                                </span>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Κρυπτογράφηση Μεταφοράς' : 'In-Transit Encryption'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Όλες οι επικοινωνίες διεξάγονται μέσω αυστηρά κρυπτογραφημένων καναλιών HTTPS / TLS 1.3.'
                                        : 'All network traffic between client devices and backend runs via hardened HTTPS / TLS 1.3.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-[11px] font-mono font-bold text-gray-900 dark:text-white inline-block">
                                    AES-256
                                </span>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Κρυπτογράφηση Δίσκου' : 'At-Rest Encryption'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Οι βάσεις δεδομένων και τα αντίγραφα ασφαλείας κρυπτογραφούνται σε επίπεδο δίσκου με αλγόριθμο AES-256.'
                                        : 'Database tables and automated backups reside on encrypted storage volumes protected by AES-256.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-[11px] font-mono font-bold text-gray-900 dark:text-white inline-block">
                                    PostgreSQL RLS
                                </span>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Μόνωση Χρηστών' : 'Row Level Security'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Κάθε εγγραφή είναι προσβάσιμη αποκλειστικά από τον ίδιο τον χρήστη που την δημιούργησε.'
                                        : 'Cryptographic policy enforcement ensures no user can ever query or read another user’s records.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 5: User Rights (GDPR & CCPA) ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <FileText size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Δικαιώματα Χρήστη (GDPR)' : 'User Rights (GDPR / CCPA)'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Τα Δικαιώματά σας & Κυριαρχία Δεδομένων' : 'Your Data Rights & Sovereignty'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Εξαγωγής (Export)' : 'Right to Portability'}
                                    </strong>
                                    {isEL
                                        ? 'Εξαγωγή ολόκληρου του ιστορικού σας σε αρχείο JSON ανά πάσα στιγμή από τις Ρυθμίσεις.'
                                        : 'Download your entire transaction history and categories as a structured JSON file anytime.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Διόρθωσης' : 'Right to Rectification'}
                                    </strong>
                                    {isEL
                                        ? 'Άμεση επεξεργασία, ανακατηγοριοποίηση ή τροποποίηση οποιασδήποτε εγγραφής με ένα πάτημα.'
                                        : 'Update, correct, or re-categorize any financial record or profile field at any moment.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Διαγραφής (Erasure)' : 'Right to Erasure'}
                                    </strong>
                                    {isEL
                                        ? 'Οριστική διαγραφή του λογαριασμού και όλων των συναλλαγών σας με άμεσο και αμετάκλητο τρόπο.'
                                        : 'Permanently erase your user profile and all associated financial entries with one click.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 6: Contact & Inquiries Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="flex items-center gap-3.5">
                            <Mail size={22} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0" />
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {isEL ? 'Επικοινωνία & Υπεύθυνος Προστασίας Δεδομένων' : 'Data Protection Contact & Inquiries'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {isEL
                                        ? 'Για οποιαδήποτε ερώτηση, αίτημα εξαγωγής ή οριστικής διαγραφής των δεδομένων σας, επικοινωνήστε απευθείας μαζί μας:'
                                        : 'For any privacy inquiries, data export requests, or deletion verifications, please reach out directly to:'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
                                <span className="block font-bold text-gray-900 dark:text-white mb-1">
                                    {isEL ? 'Υπεύθυνος Εφαρμογής:' : 'Developer & Data Controller:'}
                                </span>
                                <span className="text-gray-600 dark:text-gray-300">Vangelis Bomponis (Spendlore)</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
                                <span className="block font-bold text-gray-900 dark:text-white mb-1">
                                    {isEL ? 'Email Επικοινωνίας:' : 'Support Email:'}
                                </span>
                                <div className="space-y-0.5 font-mono">
                                    <div>
                                        <a href="mailto:support@spendlore.gr" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                            support@spendlore.gr
                                        </a>
                                    </div>
                                    <div>
                                        <a href="mailto:vaggelisbobonhs@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                            vaggelisbobonhs@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {effectiveBack && (
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={effectiveBack}
                                    className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs active:scale-95 transition-all text-center shrink-0 shadow-xs"
                                >
                                    {isEL ? 'Επιστροφή' : 'Return'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            Spendlore &bull; https://www.spendlore.gr &bull; {isEL ? 'Χάρτης Προστασίας Δεδομένων' : 'Data Protection Charter'} &bull; &copy; 2026
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
