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
    Check
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
                subtitle={isEL ? 'Ενημέρωση: Οκτώβριος 2026' : 'Updated: October 2026'}
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
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                <Shield size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Χάρτης Εμπιστοσύνης & Απορρήτου' : 'Privacy & Trust Charter'}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Το Απόρρητό σας είναι Προτεραιότητα' : 'Your Privacy is Our Priority'}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                {isEL
                                    ? 'Κατανοούμε απόλυτα ότι τα οικονομικά σας δεδομένα είναι ευαίσθητα. Δείτε με διαφάνεια πώς τα συλλέγουμε, πώς τα προστατεύουμε και γιατί δεν τα διαμοιραζόμαστε ποτέ με διαφημιστές.'
                                    : 'We understand that your financial records are sensitive. Here is complete transparency on how we protect your records, enforce encryption, and never share data with advertisers.'}
                            </p>

                            {/* Trust Commitments */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                    <CheckCircle2 size={13} strokeWidth={2.3} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{isEL ? 'Μηδενικές Διαφημίσεις' : 'Zero Ad Tracking'}</span>
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                    <Lock size={13} strokeWidth={2.3} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{isEL ? 'Κρυπτογραφημένο Cloud Vault' : 'Encrypted Cloud Vault'}</span>
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                    <ShieldCheck size={13} strokeWidth={2.3} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{isEL ? 'Πλήρης Κυριαρχία Δεδομένων' : 'Full Data Sovereignty'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 1: What Data We Collect ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <Eye size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Συλλογή Δεδομένων' : 'Data Collection'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Τι δεδομένα συλλέγουμε' : 'What Data We Collect'}
                            </h2>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Συλλέγουμε αυστηρά μόνο τα δεδομένα που είναι απολύτως απαραίτητα για την ορθή λειτουργία της εφαρμογής:'
                                : 'We only collect information that is strictly essential for the financial ledger to function:'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <UserCheck size={18} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Στοιχεία Λογαριασμού' : 'Account Identity'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Το email και το όνομά σας όταν συνδέεστε μέσω Google ή Email, αποκλειστικά για την ταυτοποίηση της σύνδεσής σας.'
                                        : 'Your email address and display name when signing in via Google Auth or Email, strictly for session authentication.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <Database size={18} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Οικονομικά Δεδομένα' : 'Financial Ledger'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Συναλλαγές, κατηγορίες, στόχοι αποταμίευσης και προϋπολογισμοί που καταχωρείτε εσείς στην εφαρμογή.'
                                        : 'Transactions, categories, recurring rules, and budgets that you enter manually or import into the app.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <Server size={18} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Τηλεμετρία Συσκευής' : 'Device Compatibility'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Βασικές πληροφορίες συσκευής και πλατφόρμας για διασφάλιση συμβατότητας PIN και βιομετρικού κλειδώματος.'
                                        : 'Basic OS platform and screen profile parameters to ensure hardware PIN and biometric lock compatibility.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 2: How We Use Data & Zero-Ad Pledge ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <Database size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Χρήση Δεδομένων' : 'Data Usage'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Πώς χρησιμοποιούμε τα δεδομένα σας' : 'How We Use Data'}
                            </h2>
                        </div>

                        {/* Ironclad Pledge Banner */}
                        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                            <ShieldCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" strokeWidth={2.2} />
                            <div className="text-xs leading-relaxed">
                                <strong className="font-bold block text-sm text-emerald-900 dark:text-emerald-200 mb-0.5">
                                    {isEL ? 'Δέσμευση Μηδενικής Εμπορευματοποίησης' : 'Zero Commercialization Pledge'}
                                </strong>
                                {isEL
                                    ? 'Δεν πουλάμε, δεν ενοικιάζουμε και δεν μοιραζόμαστε ποτέ τα οικονομικά σας δεδομένα με διαφημιστικές εταιρείες ή εταιρείες ανάλυσης δεδομένων.'
                                    : 'We never sell, rent, broker, or monetize your financial data to advertising networks or third-party data brokers.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="flex items-start gap-3">
                                <Check size={16} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Παροχή & Συγχρονισμός Υπηρεσιών' : 'Service Delivery & Real-Time Sync'}
                                    </strong>
                                    {isEL
                                        ? 'Εμφάνιση στατιστικών, υπολογισμός υπολοίπων, ειδοποιήσεις υπέρβασης ορίων και άμεσος συγχρονισμός σε όλες τις συνδεδεμένες συσκευές σας.'
                                        : 'Displaying balance insights, budget utilization limits, recurring rules, and seamless cloud synchronization across all devices.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Check size={16} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Προστασία & Ασφάλεια' : 'Security & Access Control'}
                                    </strong>
                                    {isEL
                                        ? 'Έλεγχος ενεργών συνεδριών, αποτροπή κακόβουλης πρόσβασης και εφαρμογή κρυπτογραφημένων πρωτοκόλλων ασφαλείας.'
                                        : 'Monitoring active session devices, blocking unauthorized connections, and safeguarding cryptographic access tokens.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 3: Storage & Cryptography ─────── */}
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

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Χρησιμοποιούμε enterprise υποδομές Supabase (σε servers Google Cloud) με ισχυρή κρυπτογράφηση σε όλα τα επίπεδα:'
                                : 'We leverage enterprise Supabase infrastructure (hosted on Google Cloud Platform) with multi-tiered encryption:'}
                        </p>

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
                                        ? 'Όλη η κίνηση μεταξύ συσκευής και βάσης δεδομένων κρυπτογραφείται μέσω αυστηρού πρωτοκόλλου HTTPS / TLS.'
                                        : 'Every request between your device and database travels across high-grade encrypted HTTPS / TLS channels.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-[11px] font-mono font-bold text-gray-900 dark:text-white inline-block">
                                    AES-256
                                </span>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Κρυπτογράφηση Αποθήκευσης' : 'At-Rest Encryption'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Τα αποθηκευμένα δεδομένα παραμένουν προστατευμένα με enterprise κρυπτογράφηση δίσκου στα κέντρα δεδομένων.'
                                        : 'Stored tables and backups reside on encrypted Google Cloud disks protected by hardened security policies.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-2">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-[11px] font-mono font-bold text-gray-900 dark:text-white inline-block">
                                    Local Enclave
                                </span>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Τοπικό Κλείδωμα' : 'Hardware Biometrics'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Το PIN και τα βιομετρικά αποτυπώματα ελέγχονται αποκλειστικά τοπικά στο hardware της συσκευής σας.'
                                        : 'Your App PIN and FaceID / TouchID biometric keys are authenticated locally without reaching external servers.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 4: Your Rights & Sovereignty ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <FileText size={13} strokeWidth={2.2} />
                                <span>{isEL ? 'Κυριαρχία Δεδομένων' : 'User Sovereignty'}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Τα Δικαιώματά σας & Κυριαρχία Δεδομένων' : 'Your Rights & Data Portability'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Εξαγωγής' : 'Right to Export'}
                                    </strong>
                                    {isEL
                                        ? 'Μπορείτε να κατεβάσετε όλο το ιστορικό σας σε standard JSON αρχείο ανά πάσα στιγμή.'
                                        : 'Download your complete transaction ledger as a JSON archive anytime from Settings.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Διόρθωσης' : 'Right to Rectify'}
                                    </strong>
                                    {isEL
                                        ? 'Έχετε τη δυνατότητα άμεσης επεξεργασίας ή διόρθωσης οποιασδήποτε εγγραφής ή κανόνα.'
                                        : 'Update, rename, or adjust transactions, categories, and account settings instantly.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Διαγραφής' : 'Right to Erasure'}
                                    </strong>
                                    {isEL
                                        ? 'Οριστική διαγραφή όλων των συναλλαγών ή του λογαριασμού σας με 1 κλικ από τη Ζώνη Κινδύνου.'
                                        : 'Permanently purge all financial rows or delete your account completely with zero residue.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Section 5: Contact & Inquiries Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <Mail size={20} strokeWidth={2.2} className="text-gray-900 dark:text-white shrink-0" />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                        {isEL ? 'Ερωτήσεις για το Απόρρητο;' : 'Questions Regarding Privacy?'}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {isEL
                                            ? 'Επικοινωνήστε απευθείας με την ομάδα ανάπτυξης μέσω της ενότητας Σχόλια & Ιδέες.'
                                            : 'Reach out directly to the team via the Feedback & Ideas hub in Settings.'}
                                    </p>
                                </div>
                            </div>

                            {effectiveBack && (
                                <button
                                    type="button"
                                    onClick={effectiveBack}
                                    className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs active:scale-95 transition-all text-center shrink-0 shadow-xs"
                                >
                                    {isEL ? 'Επιστροφή' : 'Return'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            Spendlore Finance App &bull; {isEL ? 'Χάρτης Προστασίας Δεδομένων' : 'Data Protection Charter'} &bull; &copy; 2026
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
