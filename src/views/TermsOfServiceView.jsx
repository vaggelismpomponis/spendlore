import React from 'react';
import {
    FileText,
    ShieldCheck,
    CreditCard,
    AlertCircle,
    Scale,
    Trash2,
    Mail,
    Lock
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';

const TermsOfServiceView = ({ onBack, hideHeader = false, lang, hideBack = false }) => {
    const settings = useSettings?.() || {};
    const effectiveLang = lang || settings.language || 'el';
    const isEL = effectiveLang === 'el';

    const handleBack = hideBack ? null : (onBack || (() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }));

    return (
        <div className="h-full min-h-dvh bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-y-auto custom-scrollbar">

            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={handleBack}
                title={isEL ? 'Όροι Χρήσης' : 'Terms of Service'}
                subtitle={isEL ? 'Ενημέρωση: Νοέμβριος 2026' : 'Updated: November 2026'}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Container ─────── */}
            <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-0 py-5 md:py-8 lg:py-0 space-y-6">

                {/* Desktop Navigation Breadcrumb Bar */}
                <DesktopBreadcrumb
                    onBack={handleBack}
                    backLabel={isEL ? 'Επιστροφή' : 'Back'}
                    hideHeader={hideHeader}
                />

                {/* ─────── Executive Hero Hub ─────── */}
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                    <div className="relative z-10 max-w-2xl space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            <FileText size={13} strokeWidth={2.2} />
                            <span>{isEL ? 'Νομική Σύμβαση Χρήστη' : 'Legal Agreement'}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {isEL ? 'Όροι Παροχής Υπηρεσιών' : 'Terms of Service'}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            {isEL
                                ? 'Καλώς ήρθατε στο Spendlore (spendlore.gr). Οι παρόντες Όροι Χρήσης καθορίζουν τα δικαιώματα και τις υποχρεώσεις σας κατά τη χρήση της εφαρμογής και του ιστοτόπου μας.'
                                : 'Welcome to Spendlore (https://www.spendlore.gr/). These Terms of Service govern your access to and use of the Spendlore web and mobile applications.'}
                        </p>
                    </div>
                </div>

                {/* ─────── Core Sections ─────── */}
                <div className="space-y-4 sm:space-y-6">

                    {/* Section 1: Acceptance */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Scale size={18} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '1. Αποδοχή των Όρων' : '1. Acceptance of Terms'}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Με την εγγραφή σας, την είσοδο ή τη χρήση του Spendlore (διαδικτυακά ή μέσω κινητού), δηλώνετε ότι έχετε διαβάσει, κατανοήσει και συμφωνείτε πλήρως με τους παρόντες Όρους Χρήσης και την Πολιτική Απορρήτου. Εάν δεν συμφωνείτε με οποιοδήποτε μέρος των όρων, οφείλετε να διακόψετε τη χρήση της εφαρμογής.'
                                : 'By creating an account, accessing, or using Spendlore (web or mobile), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not access or use the application.'}
                        </p>
                    </div>

                    {/* Section 2: Informational Purpose Disclaimer */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '2. Μη Παροχή Επενδυτικών / Φορολογικών Συμβουλών' : '2. No Financial or Tax Advice'}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Το Spendlore είναι αποκλειστικά ένα ψηφιακό εργαλείο καταγραφής και οργάνωσης προσωπικών οικονομικών. Οι πληροφορίες, οι δείκτες προϋπολογισμών, τα στατιστικά γραφήματα και οι υποδείξεις του AI Advisor παρέχονται αποκλειστικά για ενημερωτικούς σκοπούς και ΔΕΝ συνιστούν επαγγελματικές, νομικές, φοροτεχνικές ή επενδυτικές συμβουλές.'
                                : 'Spendlore is strictly a personal budgeting and expense tracking management tool. Analytics, automated categorizations, and AI Advisor insights are for informational self-management purposes only and do not constitute financial, investment, accounting, or legal advice.'}
                        </p>
                    </div>

                    {/* Section 3: User Accounts & Security */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Lock size={18} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '3. Λογαριασμός Χρήστη & Ασφάλεια' : '3. User Accounts & Security'}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Είστε αποκλειστικά υπεύθυνοι για τη διατήρηση της εμπιστευτικότητας των στοιχείων σύνδεσής σας (κωδικός πρόσβασης, PIN ασφαλείας, πρόσβαση Google). Οφείλετε να ενημερώσετε άμεσα την ομάδα υποστήριξης σε περίπτωση οποιασδήποτε μη εξουσιοδοτημένης χρήσης του λογαριασμού σας.'
                                : 'You are responsible for safeguarding your login credentials (password, biometric lock, PIN, Google authentication). You agree to immediately notify us of any unauthorized use or breach of security related to your account.'}
                        </p>
                    </div>

                    {/* Section 4: Subscriptions, Trials, & Billing */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <CreditCard size={18} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '4. Συνδρομές Pro, Δοκιμαστική Περίοδος & Πληρωμές' : '4. Pro Subscriptions, Trials & Payments'}
                            </h2>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p>
                                {isEL
                                    ? 'Το Spendlore προσφέρει μια δωρεάν βασική έκδοση και προαιρετικές συνδρομές Pro (Μηνιαία ή Ετήσια). Οι πληρωμές επεξεργάζονται με ασφάλεια μέσω της πιστοποιημένης πλατφόρμας Stripe (PCI-DSS Level 1).'
                                    : 'Spendlore provides a free core tier and optional Pro subscription plans (Monthly or Annual). Payment transactions are processed securely via Stripe (PCI-DSS Level 1 certified).'}
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                                <li>
                                    <strong>{isEL ? 'Δοκιμαστική Περίοδος:' : 'Free Trial:'}</strong>{' '}
                                    {isEL
                                        ? 'Τα πλάνα Pro περιλαμβάνουν 7 ημέρες δωρεάν δοκιμής για νέους χρήστες.'
                                        : 'Pro plans include a 7-day free trial for eligible new subscribers.'}
                                </li>
                                <li>
                                    <strong>{isEL ? 'Αυτόματη Ανανέωση:' : 'Automatic Renewal:'}</strong>{' '}
                                    {isEL
                                        ? 'Οι συνδρομές ανανεώνονται αυτόματα στο τέλος κάθε περιόδου χρέωσης, εκτός εάν ακυρωθούν πριν τη λήξη.'
                                        : 'Subscriptions renew automatically at the end of each billing period unless cancelled before renewal.'}
                                </li>
                                <li>
                                    <strong>{isEL ? 'Ακύρωση οποτεδήποτε:' : 'Cancel Anytime:'}</strong>{' '}
                                    {isEL
                                        ? 'Μπορείτε να ακυρώσετε τη συνδρομή σας οποτεδήποτε μέσω του Stripe Customer Portal από τις Ρυθμίσεις Προφίλ. Διατηρείτε την πρόσβαση Pro μέχρι το τέλος της τρέχουσας πληρωμένης περιόδου.'
                                        : 'You can cancel anytime via the Stripe Customer Portal in Profile Settings. You retain Pro access until the end of the current billing cycle.'}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5: Acceptable Use */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck size={18} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '5. Πολιτική Επιτρεπτής Χρήσης' : '5. Acceptable Use Policy'}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Συμφωνείτε να μη χρησιμοποιείτε το Spendlore για παράνομες πράξεις, νομιμοποίηση εσόδων από παράνομες δραστηριότητες, απόπειρες παραβίασης ασφαλείας, αντίστροφη μηχανική (reverse engineering) ή κατάχρηση των API της υπηρεσίας.'
                                : 'You agree not to use Spendlore for unlawful purposes, money laundering, reverse engineering, security probing, distributed denial of service, or any abuse of service APIs and infrastructure.'}
                        </p>
                    </div>

                    {/* Section 6: Data Ownership & Termination */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Trash2 size={18} className="text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '6. Κυριαρχία Δεδομένων & Διαγραφή Λογαριασμού' : '6. Data Sovereignty & Termination'}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Τα οικονομικά σας δεδομένα ανήκουν αποκλειστικά σε εσάς. Μπορείτε ανά πάσα στιγμή να εξάγετε το σύνολο των συναλλαγών σας (CSV / JSON) και να διαγράψετε οριστικά τον λογαριασμό σας από τις Ρυθμίσεις Λογαριασμού.'
                                : 'Your financial records belong exclusively to you. You maintain full rights to export your data (CSV/JSON) and delete your account permanently at any time from Account Settings.'}
                        </p>
                    </div>

                    {/* Section 7: Governing Law & Contact */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Mail size={18} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isEL ? '7. Εφαρμοστέο Δίκαιο & Επικοινωνία' : '7. Governing Law & Contact'}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isEL
                                ? 'Οι παρόντες όροι διέπονται από το Ελληνικό Δίκαιο και το Δίκαιο της Ευρωπαϊκής Ένωσης. Για οποιαδήποτε απορία ή νομικό αίτημα, μπορείτε να επικοινωνήσετε μαζί μας στο support@spendlore.gr.'
                                : 'These terms are governed by and construed in accordance with the laws of Greece and the European Union. For inquiries or legal notices, contact support@spendlore.gr.'}
                        </p>
                    </div>

                </div>

                {/* Footer Copyright */}
                <div className="pt-6 pb-12 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} Spendlore &bull; https://www.spendlore.gr. All rights reserved.
                </div>

            </div>
        </div>
    );
};

export default TermsOfServiceView;
