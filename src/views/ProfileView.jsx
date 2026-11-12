import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, LogOut, ChevronRight,
    ShieldAlert as Shield, ArrowLeft, Moon, Sun, Monitor,
    Smartphone, HardDriveDownload,
    Languages, LayoutDashboard, MessageSquare, BookOpen, LifeBuoy,
    Settings, Info, Trash2, UserX, Tag,
    Camera, Mail, AlertTriangle, X, CheckCircle2, Pencil, Calendar, Eye, EyeOff,
    ShieldCheck, RefreshCw
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import PlayStoreModal from '../components/PlayStoreModal';
import ThemeSelectionModal from '../components/ThemeSelectionModal';
import PasswordInput from '../components/PasswordInput';
import { supabase } from '../supabase';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { isNative } from '../utils/platform';
import { APP_VERSION, APP_RELEASE_YEAR } from '../utils/version';
import { checkForAppUpdates, forceAppCachePurge } from '../utils/pwaUpdate';
import { openPlayStoreUpdates } from '../utils/notificationListener';
import Toggle from '../components/Toggle';
import ViewHeader from '../components/ViewHeader';
import ProBadge from '../components/ProBadge';



/* ─────────────────────────────────────────
   Setting Row — Skroutz style
 ───────────────────────────────────────── */
const SettingRow = ({
    icon: Icon,
    label,
    subtitle,
    color = 'text-gray-800 dark:text-white/90',
    onClick,
    right,
    last = false,
    danger = false
}) => (
    <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        className={`group flex items-center gap-4 px-5 py-4 mb-3 rounded-2xl
                    bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10
                    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
                    transition-all duration-200`}
    >
        <Icon size={22} className={`shrink-0 ${danger ? 'text-rose-500' : color}`} strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
            <span className={`block text-[16px] font-bold tracking-tight
                              ${danger ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                {label}
            </span>
            {subtitle && (
                <span className="block text-[11px] font-medium text-gray-500 dark:text-white/50 mt-0.5 leading-snug">
                    {subtitle}
                </span>
            )}
        </div>
        <div className="flex-shrink-0 ml-1">
            {right !== undefined ? right : (
                <ChevronRight
                    size={20}
                    className="text-gray-900 dark:text-white/80 group-hover:translate-x-0.5 transition-transform"
                />
            )}
        </div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value, last = false }) => (
    <div className={`flex items-center gap-4 px-5 py-4 mb-3 rounded-2xl bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10`}>
        <Icon size={22} className="text-gray-800 dark:text-white/90" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-gray-500 dark:text-white/60 mb-0.5">{label}</p>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

/* ─────────────────────────────────────────
   Card wrapper (No longer used for styling, just a pass-through)
 ───────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
    <div className={`flex flex-col ${className}`}>
        {children}
    </div>
);

/* ─────────────────────────────────────────
   Section Label
 ───────────────────────────────────────── */
const SectionLabel = ({ children, className = '' }) => (
    <p className={`text-[16px] font-bold text-gray-900 dark:text-white mb-3 px-1 mt-6 ${className}`}>
        {children}
    </p>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
 ═══════════════════════════════════════════════════════════ */
const ProfileView = ({ user, onBack, onSignOut, onRecurring, onAccount, onGeneral, onSecurity, onBackup, onAdmin, onFeedback, onGuide, onCategories, hideHeader }) => {
    const { theme, themePreference = 'system', toggleTheme, language, updateLanguage, t: translate, customCategories } = useSettings();
    const { isPro, openUpgradeModal, openBillingPortal } = useSubscription();
    const isDark = theme === 'dark';
    const isEL = language === 'el';
    const { showToast } = useToast();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const isNativeApp = isNative();

    const handleCheckUpdate = async () => {
        if (checkingUpdate) return;
        setCheckingUpdate(true);
        try {
            if (isNativeApp) {
                showToast(isEL ? 'Άνοιγμα Google Play Store...' : 'Opening Google Play Store...', 'info');
                await openPlayStoreUpdates();
                return;
            }
            const result = await checkForAppUpdates();
            if (result.updated) {
                showToast(isEL ? 'Βρέθηκε νέα έκδοση! Γίνεται ανανέωση...' : 'New version found! Reloading...', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(isEL ? 'Είστε στην πιο πρόσφατη έκδοση!' : "You're on the latest version!", 'info');
            }
        } catch (e) {
            showToast(isEL ? 'Αδυναμία ελέγχου ενημερώσεων' : 'Could not check for updates', 'error');
        } finally {
            setCheckingUpdate(false);
        }
    };

    const handleForcePurgeCache = () => {
        showToast(isEL ? 'Εκκαθάριση μνήμης & ανανέωση...' : 'Clearing cache & reloading...', 'info');
        setTimeout(async () => {
            await forceAppCachePurge();
        }, 400);
    };
    const [imgRetries, setImgRetries] = useState(0);
    const MAX_IMG_RETRIES = 3;

    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;
    const avatarSrc = photoURL ? (imgRetries > 0 ? `${photoURL}${photoURL.includes('?') ? '&' : '?'}retry=${imgRetries}` : photoURL) : null;
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name
        || user?.displayName || user?.email?.split('@')[0]
        || translate('anonymous_user');
        const isGoogle = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google') || user?.identities?.some(i => i.provider === 'google');
    const provider = isGoogle ? 'Google' : 'Email / Password';
    const isAdmin = user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' ||
        user?.role === 'admin' ||
        user?.app_metadata?.role === 'admin' ||
        user?.user_metadata?.role === 'admin' ||
        ['vaggelisbobonhs@gmail.com', 'vagelismpomponis@gmail.com', 'sbompomis@gmail.com'].includes(user?.email);
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    // Delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDangerZone, setShowDangerZone] = useState(false);

    const isPasswordUser = user?.app_metadata?.provider === 'email'
        || user?.identities?.some(i => i.provider === 'email');

    useEffect(() => { setImgRetries(0); }, [photoURL]);

    const handleDeleteAccount = async (e) => {
        if (e) e.preventDefault();
        setIsDeleting(true);
        try {
            if (isPasswordUser) {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: deletePassword
                });
                if (authError) throw new Error('wrong_password');
            }

            // 1. Delete all user data from public tables first
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];
            for (const table of tables) {
                try {
                    await supabase.from(table).delete().eq('user_id', user.id);
                } catch (e) {
                    console.warn(`Failed to delete from ${table}:`, e);
                }
            }

            // 2. Call RPC to delete the auth user
            const { error: rpcError } = await supabase.rpc('delete_user');
            if (rpcError) throw rpcError;

            // 3. Clear session and local data
            await supabase.auth.signOut();
            localStorage.clear();

            showToast(translate('account_deleted_successfully') || 'Account deleted', 'success');

            // 4. Force reload to landing page
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (error) {
            console.error('Delete error:', error);
            if (error.message === 'wrong_password') {
                showToast(translate('current_password_error') || 'Wrong password', 'error');
            } else {
                showToast(translate('error_message_generic') || 'Error during deletion', 'error');
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <motion.div
            className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
        >
            {/* ─────── Sticky Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={translate('settings') || 'Settings'}
                hideHeader={hideHeader}
                rightAction={
                    !isPro ? (
                        <motion.button
                            onClick={() => openUpgradeModal('profile_header')}
                            whileTap={{ scale: 0.93 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[11px] font-extrabold tracking-wide shadow-xs"
                        >
                            <ShieldCheck size={12} strokeWidth={2.5} className="shrink-0" />
                            {translate('become_pro') || translate('go_pro') || 'Become Pro'}
                        </motion.button>
                    ) : null
                }
            />

            {/* ─────── Scrollable Content ─────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-12 space-y-5">

                    {/* ════ User Identity Hero — centered ════ */}
                    <div className="flex flex-col items-center pt-4 pb-4 gap-2">
                        {/* Avatar */}
                        <motion.div
                            className="relative mb-2"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.08, duration: 0.3 }}
                        >
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-surface-dark2 border-4 border-gray-100 dark:border-white/10 shadow-lg shadow-black/10">
                                {avatarSrc ? (
                                    <img
                                        key={`profile-avatar-${imgRetries}`}
                                        src={avatarSrc}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        onError={() => {
                                            if (imgRetries < MAX_IMG_RETRIES) {
                                                setTimeout(() => setImgRetries(r => r + 1), 600 * (imgRetries + 1));
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={40} strokeWidth={1.5} className="text-gray-400 dark:text-white/40" />
                                    </div>
                                )}
                            </div>
                            {/* Corner Badge: Pro Badge or Online Dot */}
                            {isPro ? (
                                <div
                                    className="absolute -bottom-1 -right-2 select-none"
                                    title="Pro Member"
                                >
                                    <ProBadge />
                                </div>
                            ) : (
                                <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full
                                                bg-emerald-400 border-2 border-gray-50 dark:border-surface-dark shadow-sm" />
                            )}
                        </motion.div>

                        <div className="flex items-center gap-2">
                            <motion.h2
                                className="text-2xl leading-tight font-black text-gray-900 dark:text-white text-center"
                            >
                                {displayName || user?.email?.split('@')[0] || 'User'}
                            </motion.h2>
                        </div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                            {user?.email || 'Spendlore Account'}
                        </p>
                        <motion.button
                            onClick={onAccount}
                            whileTap={{ scale: 0.94 }}
                            className="mt-2 inline-flex items-center px-4 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100/90 dark:bg-surface-dark2 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200/70 dark:hover:bg-white/10 active:scale-95 transition-all"
                        >
                            {translate('edit_profile') || 'Επεξεργασία προφίλ'}
                        </motion.button>
                    </div>

                    {/* ════ Account Info ════ */}
                    <div className="mt-4">
                        <SectionLabel>{translate('account_info') || 'Account info'}</SectionLabel>
                        <Card>
                            <InfoRow icon={Mail} label={translate('email') || 'Email'} value={user?.email || '—'} />
                            <InfoRow icon={Shield} label={translate('login_method') || 'Login method'} value={provider} />
                            <InfoRow icon={Calendar} label={translate('member_since') || 'Member since'} value={createdAt} last />
                        </Card>
                    </div>

                    {/* ════ App Preferences ════ */}
                    <div className="mt-2">
                        <SectionLabel>{translate('app_preferences') || 'Προτιμήσεις Εφαρμογής'}</SectionLabel>
                        <Card>
                            <SettingRow
                                icon={Languages}
                                label={translate('language') || 'Language'}
                                right={
                                    <div className="flex gap-1 bg-white dark:bg-surface-dark p-0.5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
                                        {['el', 'en'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={(e) => { e.stopPropagation(); updateLanguage(lang); }}
                                                className={`px-3 py-1.5 rounded-[10px] text-[11px] font-extrabold transition-all duration-200
                                                            ${language === lang
                                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                        : 'text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                }
                            />
                            <SettingRow
                                icon={themePreference === 'system' ? Monitor : (themePreference === 'light' ? Sun : Moon)}
                                label={translate('appearance_theme') || 'Θέμα εμφάνισης'}
                                onClick={() => setShowThemeModal(true)}
                                right={
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-gray-300/60 dark:border-white/10">
                                            {themePreference === 'system'
                                                ? (translate('theme_system') || 'Προεπιλογή συστήματος')
                                                : (themePreference === 'light'
                                                    ? (translate('theme_light') || 'Φωτεινό')
                                                    : (translate('theme_dark') || 'Σκοτεινό'))}
                                        </span>
                                        <ChevronRight size={20} className="text-gray-900 dark:text-white/80 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                }
                            />
                            <SettingRow
                                icon={Settings}
                                label={translate('general') || 'General'}
                                onClick={onGeneral}
                            />
                            <SettingRow
                                icon={Tag}
                                label={translate('custom_categories') || 'Προσαρμοσμένες Κατηγορίες'}
                                onClick={onCategories}
                                right={
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-200/60 dark:border-violet-500/20">
                                            {(customCategories?.expense?.length || 0) + (customCategories?.income?.length || 0)}
                                        </span>
                                        <ChevronRight size={20} className="text-gray-900 dark:text-white/80 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                }
                            />
                        </Card>
                    </div>

                    {/* ════ Security & Data ════ */}
                    <div className="mt-2">
                        <SectionLabel>{translate('security_and_data') || 'Ασφάλεια & Δεδομένα'}</SectionLabel>
                        <Card>
                            <SettingRow
                                icon={Shield}
                                label={translate('security') || 'Security'}
                                onClick={onSecurity}
                            />
                            <SettingRow
                                icon={HardDriveDownload}
                                label={translate('backup_restore') || 'Backup & Restore'}
                                onClick={onBackup}
                            />
                        </Card>
                    </div>

                    {/* ════ Help & Support ════ */}
                    <div className="mt-2">
                        <SectionLabel>{translate('help_and_support') || (isEL ? 'Βοήθεια & Υποστήριξη' : 'Help & Support')}</SectionLabel>
                        <Card>
                            <SettingRow
                                icon={BookOpen}
                                label={translate('user_guide') || (isEL ? 'Οδηγός Χρήσης' : 'User Guide')}
                                onClick={onGuide}
                            />
                            <SettingRow
                                icon={LifeBuoy}
                                label={translate('technical_support') || translate('support') || (isEL ? 'Τεχνική Υποστήριξη' : 'Technical Support')}
                                onClick={onFeedback}
                            />
                        </Card>
                    </div>

                    {/* ════ System & App ════ */}
                    <div className="mt-2">
                        <SectionLabel>{translate('system_and_app') || 'Σύστημα & Εφαρμογή'}</SectionLabel>
                        <Card>
                            <SettingRow
                                icon={RefreshCw}
                                label={translate('check_for_updates') || (isEL ? 'Έλεγχος για ενημερώσεις' : 'Check for updates')}
                                subtitle={isNativeApp
                                    ? (isEL ? 'Άνοιγμα Google Play Store για έλεγχο νέας έκδοσης' : 'Open Google Play Store to check for updates')
                                    : (translate('check_for_updates_desc') || (isEL ? 'Έλεγχος διαθεσιμότητας νέας έκδοσης εφαρμογής' : 'Check for the latest web application release'))}
                                onClick={handleCheckUpdate}
                                right={
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-gray-300/60 dark:border-white/10">
                                            {checkingUpdate ? (isEL ? 'Έλεγχος...' : 'Checking...') : `v${APP_VERSION}`}
                                        </span>
                                        <RefreshCw size={16} className={`text-gray-900 dark:text-white/80 ${checkingUpdate ? 'animate-spin' : ''}`} />
                                    </div>
                                }
                            />
                            <SettingRow
                                icon={Trash2}
                                label={translate('purge_cache') || (isEL ? 'Εκκαθάριση Cache & Επανεκκίνηση' : 'Clear Cache & Reload')}
                                onClick={handleForcePurgeCache}
                            />
                            {!isNativeApp && (
                                <SettingRow
                                    icon={Smartphone}
                                    label={translate('install_android') || 'Εφαρμογή Android (Play Store)'}
                                    onClick={() => setShowPlayStoreModal(true)}
                                    right={
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                                                Google Play
                                            </span>
                                            <ChevronRight size={20} className="text-gray-900 dark:text-white/80 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    }
                                />
                            )}
                            {isAdmin && (
                                <SettingRow
                                    icon={LayoutDashboard}
                                    label={translate('control_panel') || 'Control Panel'}
                                    onClick={onAdmin}
                                />
                            )}
                        </Card>
                    </div>

                    {/* ════ Session / Account ════ */}
                    <div className="mt-2">
                        <SectionLabel>{translate('session') || 'Συνεδρία'}</SectionLabel>
                        <Card>
                            <SettingRow
                                icon={LogOut}
                                label={translate('logout') || 'Sign out'}
                                danger
                                onClick={() => setShowLogoutModal(true)}
                                last
                            />
                        </Card>
                    </div>

                    {/* ════ Danger Zone ════ */}
                    <div className="mt-2">
                        <div
                            onClick={() => setShowDangerZone(!showDangerZone)}
                            className="flex items-center justify-between cursor-pointer group px-1 mb-3 mt-4"
                        >
                            <SectionLabel className="!mt-0 !mb-0 group-hover:text-rose-500 transition-colors">
                                {translate('danger_zone') || 'Danger zone'}
                            </SectionLabel>
                            <div className={`text-gray-400 dark:text-white/40 transition-transform duration-300 ${showDangerZone ? 'rotate-90' : ''}`}>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        {showDangerZone && (
                            <div className="animate-fade-in">
                                <Card>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 text-left
                                                   bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30
                                                   active:scale-[0.98] transition-all duration-150"
                                    >
                                        <Trash2 size={22} className="text-rose-500 flex-shrink-0" strokeWidth={1.75} />
                                        <span className="flex-1 text-[16px] font-bold text-rose-500 tracking-tight">
                                            {translate('deactivate_account') || 'Deactivate my account'}
                                        </span>
                                        <ChevronRight size={20} className="text-rose-400 dark:text-rose-500/60 flex-shrink-0" />
                                    </button>
                                </Card>
                                <p className="text-[12px] text-gray-500 dark:text-white/40 mt-1 px-3">
                                    {translate('data_deletion_warning') || 'Data deletion is irreversible.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ════ Footer ════ */}
                    <div className="flex flex-col items-center gap-1.5 pt-1 pb-2 mt-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-gray-950 dark:text-white tracking-wide">Spendlore</span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wide">
                            {translate('version')} · {APP_RELEASE_YEAR}
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Modals ─── */}
            <ThemeSelectionModal
                isOpen={showThemeModal}
                onClose={() => setShowThemeModal(false)}
            />

            <PlayStoreModal
                isOpen={showPlayStoreModal}
                onClose={() => setShowPlayStoreModal(false)}
            />

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onSignOut}
                title={translate('logout_confirm_title')}
                message={translate('logout_confirm_message')}
                confirmText={translate('logout')}
                type="danger"
            />

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl p-6
                                    shadow-2xl border border-gray-300 dark:border-white/10
                                    animate-slide-up">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <AlertTriangle size={36} className="text-rose-500 shrink-0 mb-4" strokeWidth={1.5} />
                            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">
                                {translate('delete_account') || 'Delete Account'}
                            </h3>
                            <p className="text-[13px] text-gray-500 dark:text-white/60 leading-relaxed">
                                {translate('delete_account_confirm_message') || 'Are you sure you want to delete your account?'}
                            </p>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            {isPasswordUser ? (
                                <PasswordInput
                                    label={translate('confirm_password_instruction')}
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    placeholder={translate('password_input_placeholder')}
                                    required
                                />
                            ) : (
                                <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4
                                                border border-gray-100 dark:border-transparent
                                                text-[13px] text-gray-600 dark:text-white/50">
                                    {translate('google_reauth_instruction')}
                                </div>
                            )}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.06]
                                               text-gray-700 dark:text-white/60 font-bold rounded-xl
                                               hover:bg-gray-200 dark:hover:bg-white/[0.1]
                                               active:scale-95 transition-all text-[14px]"
                                >
                                    {translate('cancel') || 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700
                                               text-white font-bold rounded-xl
                                               shadow-sm
                                               active:scale-95 transition-all disabled:opacity-50 text-[14px]"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            {translate('deleting') || 'Deleting...'}
                                        </span>
                                    ) : (translate('delete_btn') || 'Delete')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ProfileView;
