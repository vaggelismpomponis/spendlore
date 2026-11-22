import React, { useState, useEffect } from 'react';
import {
    User, Mail, Check,
    AlertTriangle, Shield, Lock, CheckCircle2
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase';
import { useAppStore } from '../store/useAppStore';
import ViewHeader from '../components/ViewHeader';
import ProBadge from '../components/ProBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';

/**
 * Split full name into first and last name
 */
const splitFullName = (fullName = '') => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) return { first: '', last: '' };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: '' };
    const first = parts.slice(0, -1).join(' ');
    const last = parts[parts.length - 1];
    return { first, last };
};

/**
 * Generate User Initials for Avatar
 */
const getInitials = (first = '', last = '', fallback = 'U') => {
    const f = (first || '').trim().charAt(0).toUpperCase();
    const l = (last || '').trim().charAt(0).toUpperCase();
    if (f && l) return `${f}${l}`;
    if (f) return f;
    return (fallback || 'U').charAt(0).toUpperCase();
};

const AccountSettingsView = ({ user, onBack, hideHeader }) => {
    const { t: translate, language } = useSettings();
    const { showToast } = useToast();
    const { isPro } = useSubscription();
    const isEL = language === 'el';

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || user?.email?.split('@')[0] || '';
    const initialNames = splitFullName(displayName);

    const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || initialNames.first || '');
    const [lastName, setLastName] = useState(user?.user_metadata?.last_name || initialNames.last || '');
    const [savingPersonal, setSavingPersonal] = useState(false);

    useEffect(() => {
        if (user) {
            const currentNames = splitFullName(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || user?.email?.split('@')[0] || '');
            setFirstName(user?.user_metadata?.first_name || currentNames.first || '');
            setLastName(user?.user_metadata?.last_name || currentNames.last || '');
        }
    }, [user]);

    // Profile photo derived directly from authenticated account (Google OAuth / email profile)
    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL || null;

    // Danger Zone Modals
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showPreloadConfirm, setShowPreloadConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isPreloading, setIsPreloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Save Personal Information (First Name, Last Name)
    const handleSavePersonal = async (e) => {
        if (e) e.preventDefault();
        setSavingPersonal(true);
        try {
            const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || displayName;
            const updates = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                full_name: fullName,
                name: fullName
            };

            const { error } = await supabase.auth.updateUser({ data: updates });
            if (error) throw error;

            showToast(translate('name_updated_success') || (isEL ? 'Τα στοιχεία ενημερώθηκαν επιτυχώς!' : 'Profile updated successfully!'), 'success');
        } catch (err) {
            console.error('Failed to update personal info:', err);
            showToast(translate('name_update_error') || (isEL ? 'Αποτυχία ενημέρωσης στοιχείων.' : 'Failed to update profile.'), 'error');
        } finally {
            setSavingPersonal(false);
        }
    };

    // ─── Danger Zone Actions ───

    // 1. Reset Account (Wipes transactions, budgets, goals, but keeps user profile)
    const handleResetAccount = async () => {
        setIsResetting(true);
        try {
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets'];
            for (const table of tables) {
                try {
                    await supabase.from(table).delete().eq('user_id', user.id);
                } catch (e) {
                    console.warn(`Error resetting ${table}:`, e);
                }
            }

            // Reset local store
            useAppStore.setState({
                transactions: [],
                budgets: [],
                goals: [],
                coolingOffItems: []
            });

            showToast(isEL ? 'Ο λογαριασμός μηδενίστηκε επιτυχώς. Όλα τα δεδομένα διαγράφηκαν.' : 'Account reset successfully. All data wiped.', 'success');
            setShowResetConfirm(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error('Reset failed:', err);
            showToast(isEL ? 'Σφάλμα κατά την επαναφορά του λογαριασμού.' : 'Failed to reset account.', 'error');
        } finally {
            setIsResetting(false);
        }
    };

    // 2. Reset and Preload Sample Data
    const handleResetAndPreload = async () => {
        setIsPreloading(true);
        try {
            // First clear existing data
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets'];
            for (const table of tables) {
                try {
                    await supabase.from(table).delete().eq('user_id', user.id);
                } catch (e) {
                    console.warn(`Error clearing ${table}:`, e);
                }
            }

            const today = new Date();
            const dateStr = (offsetDays = 0) => {
                const d = new Date(today);
                d.setDate(d.getDate() - offsetDays);
                return d.toISOString().split('T')[0];
            };

            const sampleTransactions = [
                {
                    user_id: user.id,
                    amount: 1450,
                    type: 'income',
                    category: 'Μισθοδοσία',
                    date: dateStr(0),
                    description: 'Μηνιαίος μισθός',
                    merchant: 'Εταιρεία',
                    created_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    amount: 84.50,
                    type: 'expense',
                    category: 'Σούπερ Μάρκετ',
                    date: dateStr(1),
                    description: 'Εβδομαδιαία ψώνια',
                    merchant: 'Σκλαβενίτης',
                    created_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    amount: 18.20,
                    type: 'expense',
                    category: 'Φαγητό',
                    date: dateStr(2),
                    description: 'Παραγγελία δείπνου',
                    merchant: 'Wolt',
                    created_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    amount: 4.80,
                    type: 'expense',
                    category: 'Καφές',
                    date: dateStr(2),
                    description: 'Πρωινός καφές',
                    merchant: 'Coffee Island',
                    created_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    amount: 50.00,
                    type: 'expense',
                    category: 'Βενζίνη',
                    date: dateStr(4),
                    description: 'Ανεφοδιασμός καυσίμων',
                    merchant: 'Shell',
                    created_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    amount: 65.00,
                    type: 'expense',
                    category: 'Λογαριασμοί',
                    date: dateStr(7),
                    description: 'Λογαριασμός ρεύματος',
                    merchant: 'ΔΕΗ',
                    created_at: new Date().toISOString()
                }
            ];

            const { data: insertedTxs, error: txError } = await supabase.from('transactions').insert(sampleTransactions).select();
            if (txError) throw txError;

            // Sample Recurring Rules
            const sampleRecurring = [
                {
                    user_id: user.id,
                    title: 'Ενοίκιο',
                    amount: 450,
                    type: 'expense',
                    frequency: 'monthly',
                    day: 1
                },
                {
                    user_id: user.id,
                    title: 'Netflix',
                    amount: 12.99,
                    type: 'expense',
                    frequency: 'monthly',
                    day: 15
                },
                {
                    user_id: user.id,
                    title: 'Μισθοδοσία',
                    amount: 1450,
                    type: 'income',
                    frequency: 'monthly',
                    day: 28
                }
            ];
            await supabase.from('recurring_transactions').insert(sampleRecurring);

            // Sample Budgets
            const sampleBudgets = [
                {
                    user_id: user.id,
                    category: 'Σούπερ Μάρκετ',
                    amount: 350,
                    period: 'monthly'
                },
                {
                    user_id: user.id,
                    category: 'Φαγητό',
                    amount: 150,
                    period: 'monthly'
                },
                {
                    user_id: user.id,
                    category: 'Βενζίνη',
                    amount: 120,
                    period: 'monthly'
                }
            ];
            await supabase.from('budgets').insert(sampleBudgets);

            // Sample Goal
            const sampleGoal = {
                user_id: user.id,
                title: 'Ταμείο Έκτακτης Ανάγκης',
                target_amount: 3000,
                current_amount: 1200,
                deadline: '2027-12-31'
            };
            await supabase.from('goals').insert(sampleGoal);

            // Update state
            useAppStore.setState({
                transactions: insertedTxs || sampleTransactions,
                budgets: sampleBudgets,
                goals: [sampleGoal]
            });

            showToast(isEL ? 'Φορτώθηκαν δείγματα συναλλαγών, προϋπολογισμών και στόχων!' : 'Sample transactions, budgets, and goals loaded!', 'success');
            setShowPreloadConfirm(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error('Preload failed:', err);
            showToast(isEL ? 'Σφάλμα κατά τη φόρτωση δεδομένων επίδειξης.' : 'Failed to preload sample data.', 'error');
        } finally {
            setIsPreloading(false);
        }
    };

    // 3. Delete Account (Permanently wipe all records & user auth)
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // Delete all user records from public tables
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];
            for (const table of tables) {
                try {
                    await supabase.from(table).delete().eq('user_id', user.id);
                } catch (e) {
                    console.warn(`Error deleting from ${table}:`, e);
                }
            }

            // Attempt RPC user deletion if configured
            try {
                await supabase.rpc('delete_user');
            } catch (rpcErr) {
                console.warn('RPC delete_user unavailable:', rpcErr);
            }

            // Sign out
            await supabase.auth.signOut();
            showToast(translate('account_deleted_successfully') || (isEL ? 'Ο λογαριασμός διαγράφηκε οριστικά.' : 'Account deleted successfully.'), 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        } catch (err) {
            console.error('Delete account failed:', err);
            showToast(isEL ? 'Σφάλμα κατά τη διαγραφή του λογαριασμού.' : 'Failed to delete account.', 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const initials = getInitials(firstName, lastName, user?.email?.charAt(0) || 'U');

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── View Header for Mobile ─────── */}
            <ViewHeader
                onBack={onBack}
                title={translate('profile_info') || (isEL ? 'Στοιχεία Προφίλ' : 'Profile Info')}
                subtitle={translate('personal_info_desc') || (isEL ? 'Προσαρμόστε τα στοιχεία του λογαριασμού σας' : 'Customize your profile')}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Content ─────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 pb-20 max-w-2xl sm:max-w-3xl mx-auto w-full space-y-6">

                    {/* Navigation Breadcrumb & Headline matching Sure style */}
                    <div className="pt-1 pb-2 space-y-2">
                        <DesktopBreadcrumb
                            onBack={onBack}
                            parentLabel={translate('home_breadcrumb') || (isEL ? 'Αρχική' : 'Home')}
                            currentLabel={translate('profile_info') || (isEL ? 'Στοιχεία Προφίλ' : 'Profile Info')}
                        />
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {translate('profile_info') || (isEL ? 'Στοιχεία Προφίλ' : 'Profile Info')}
                        </h1>
                    </div>

                    {/* ════ CARD 1: PERSONAL ════ */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 p-5 sm:p-6 rounded-2xl shadow-xs">
                        {/* Section Header */}
                        <div className="mb-6">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {translate('personal_info') || (isEL ? 'Προσωπικά Στοιχεία' : 'Personal')}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                                {translate('personal_info_desc') || (isEL ? 'Προσαρμόστε την εμφάνιση και τα στοιχεία του λογαριασμού σας' : 'Customize how you appear on Spendlore')}
                            </p>
                        </div>

                        {/* Avatar Display (Displays photo if linked email/account has one, otherwise clean initials) */}
                        <div className="flex flex-col items-center justify-center pt-2 pb-6">
                            <div className="relative mb-2">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-surface-dark3 border-2 border-white dark:border-surface-dark3 shadow-sm flex items-center justify-center">
                                    {photoURL ? (
                                        <img
                                            src={photoURL}
                                            alt={displayName}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-xl sm:text-2xl select-none">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                {isPro && (
                                    <div className="absolute -bottom-1 -right-2 select-none" title="Pro Member">
                                        <ProBadge />
                                    </div>
                                )}
                            </div>
                            {photoURL && (
                                <span className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                                    {isEL ? 'Φωτογραφία συνδεδεμένου λογαριασμού' : 'Linked account photo'}
                                </span>
                            )}
                        </div>

                        {/* Personal Form Fields */}
                        <form onSubmit={handleSavePersonal} className="space-y-4">
                            {/* Email Field (Authenticated Readonly) */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                    {translate('email') || 'Email'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        disabled
                                        value={user?.email || ''}
                                        className="w-full py-2.5 px-3.5 bg-gray-100/80 dark:bg-surface-dark3/50 border border-gray-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 cursor-not-allowed select-all"
                                    />
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" title="Primary authentication email">
                                        <Lock size={15} />
                                    </div>
                                </div>
                            </div>

                            {/* First Name & Last Name (2-Column Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('first_name') || 'First Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="e.g. EVANGELOS"
                                        className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all shadow-2xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('last_name') || 'Last Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="e.g. Bomponis"
                                        className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all shadow-2xs"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={savingPersonal}
                                    className="px-6 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-xs transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Check size={16} />
                                    <span>{savingPersonal ? (isEL ? 'Αποθήκευση...' : 'Saving...') : (translate('save') || 'Save')}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ════ CARD 2: DANGER ZONE ════ */}
                    <div className="bg-white dark:bg-surface-dark2 border border-rose-200/70 dark:border-rose-900/40 p-5 sm:p-6 rounded-2xl shadow-xs space-y-6">
                        {/* Section Header */}
                        <div className="border-b border-rose-100 dark:border-rose-900/30 pb-3">
                            <h2 className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                <AlertTriangle size={18} className="shrink-0 text-rose-500" />
                                <span>{translate('danger_zone') || 'Danger Zone'}</span>
                            </h2>
                        </div>

                        {/* Option 1: Reset Account */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex-1 pr-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {translate('reset_account_title') || 'Reset account'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5 leading-relaxed">
                                    {translate('reset_account_desc') || 'Resetting your account will delete all your accounts, categories, merchants, tags, and other data, but keep your user account intact.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(true)}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer self-start sm:self-auto"
                            >
                                {translate('reset_account_btn') || 'Reset account'}
                            </button>
                        </div>

                        {/* Option 2: Reset and Preload */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
                            <div className="flex-1 pr-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {translate('reset_and_preload_title') || 'Reset and preload'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5 leading-relaxed">
                                    {translate('reset_and_preload_desc') || 'Delete all your existing data and then load fresh sample data so you can explore with a pre-filled environment.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPreloadConfirm(true)}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer self-start sm:self-auto"
                            >
                                {translate('reset_and_preload_btn') || 'Reset and preload'}
                            </button>
                        </div>

                        {/* Option 3: Delete Account */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
                            <div className="flex-1 pr-2">
                                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                    {translate('delete_account_title') || 'Delete account'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5 leading-relaxed">
                                    {translate('delete_account_desc') || 'Deleting your account will permanently remove all your data and cannot be undone.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer self-start sm:self-auto"
                            >
                                {translate('delete_account_btn') || 'Delete account'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* ════ CONFIRMATION MODALS FOR DANGER ZONE ════ */}
            {/* 1. Reset Account Confirm */}
            <ConfirmationModal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={handleResetAccount}
                title={translate('reset_account_title') || 'Reset account'}
                message={translate('reset_account_desc') || 'Resetting your account will delete all your accounts, categories, merchants, tags, and other data, but keep your user account intact.'}
                confirmText={isResetting ? (isEL ? 'Επαναφορά...' : 'Resetting...') : (translate('reset_account_btn') || 'Reset account')}
                type="danger"
            />

            {/* 2. Reset and Preload Confirm */}
            <ConfirmationModal
                isOpen={showPreloadConfirm}
                onClose={() => setShowPreloadConfirm(false)}
                onConfirm={handleResetAndPreload}
                title={translate('reset_and_preload_title') || 'Reset and preload'}
                message={translate('reset_and_preload_desc') || 'Delete all your existing data and then load fresh sample data so you can explore with a pre-filled environment.'}
                confirmText={isPreloading ? (isEL ? 'Φόρτωση...' : 'Preloading...') : (translate('reset_and_preload_btn') || 'Reset and preload')}
                type="danger"
            />

            {/* 3. Delete Account Confirm */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                title={translate('delete_account_title') || 'Delete account'}
                message={translate('delete_account_desc') || 'Deleting your account will permanently remove all your data and cannot be undone.'}
                confirmText={isDeleting ? (isEL ? 'Διαγραφή...' : 'Deleting...') : (translate('delete_account_btn') || 'Delete account')}
                type="danger"
            />
        </div>
    );
};

export default AccountSettingsView;
