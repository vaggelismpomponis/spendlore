import React, { useState, useEffect } from 'react';
import {
    Home, BarChart3, History, Settings, Target,
    RefreshCw, Lightbulb, LogOut, Moon, Sun, Monitor, Eye, EyeOff,
    PiggyBank, User, ShieldCheck, ArrowRight, LayoutDashboard,
    Languages
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import ThemeSelectionModal from './ThemeSelectionModal';

const NavItem = ({ icon: Icon, label, active, onClick, badge, showCrown, id }) => (
    <button
        id={id}
        onClick={onClick}
        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left
                    outline-none focus:outline-none focus-visible:outline-none active:outline-none focus:ring-0 active:ring-0
                    transition-all duration-200 group relative select-none border
                    ${active
                ? 'bg-gray-100 dark:bg-surface-dark3 text-gray-950 dark:text-white font-bold border-gray-200 dark:border-white/10 shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.06] hover:text-gray-950 dark:hover:text-white font-medium border-transparent'
            }`}
    >
        <Icon
            size={18}
            className={`shrink-0 transition-transform duration-200 ${active
                    ? 'text-violet-600 dark:text-violet-400 scale-105'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:scale-110'
                }`}
        />
        <span className="text-sm flex-1 truncate">{label}</span>
        {badge && (
            <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${active
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-gray-200/70 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                    }`}
            >
                {badge}
            </span>
        )}
        {showCrown && !active && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-0.5 shrink-0">
                <ShieldCheck size={10} className="shrink-0" />
                <span>PRO</span>
            </span>
        )}
    </button>
);

const SectionLabel = ({ label }) => (
    <p className="px-3.5 pt-4 pb-1.5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest select-none">
        {label}
    </p>
);

const DesktopSidebar = ({
    activeTab, setActiveTab,
    user, displayName, photoURL,
    balance, totalIncome, totalExpense,
    onSignOut,
    setPreviousTab,
}) => {
    const { t, theme, themePreference = 'system', toggleTheme, privacyMode, togglePrivacyMode, language = 'el', updateLanguage } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [imgRetries, setImgRetries] = useState(0);
    const MAX_IMG_RETRIES = 3;

    const isAdmin = user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' ||
        user?.role === 'admin' ||
        user?.app_metadata?.role === 'admin' ||
        user?.user_metadata?.role === 'admin';

    const effectiveName = displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user') || 'User';
    const effectivePhoto = photoURL || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;

    useEffect(() => {
        setImgRetries(0);
    }, [effectivePhoto]);

    const navTo = (tab) => {
        if ((tab === 'advisor' || tab === 'recurring' || tab === 'stats') && !isPro) {
            openUpgradeModal(tab);
            return;
        }
        setActiveTab(tab);
    };

    return (
        <aside className="
            h-full flex flex-col bg-white dark:bg-surface-dark2
            border-r border-gray-200 dark:border-white/10
            shadow-[4px_0_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.4)]
            overflow-y-auto custom-scrollbar
            w-[264px] xl:w-[272px] flex-shrink-0 select-none z-20 relative
        ">
            {/* ── Brand Header ── */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                <button
                    onClick={() => navTo('home')}
                    style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                    className="flex items-center gap-3 group cursor-pointer text-left outline-none focus:outline-none focus-visible:outline-none active:outline-none focus:ring-0 active:ring-0 transition-all w-full select-none"
                >
                    <div className="relative shrink-0">
                        <img
                            src="/spendlore-logo.png"
                            alt="Spendlore"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/spendlore-mark.png';
                            }}
                            className="w-9 h-9 rounded-2xl object-contain shadow-xs transition-transform duration-200 group-hover:scale-105 select-none pointer-events-none"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight font-display group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                                Spendlore
                            </h1>
                            {isPro && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/30 shrink-0">
                                    PRO
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 truncate -mt-0.5">
                            {t('personal_finance') || 'Personal Finance'}
                        </p>
                    </div>
                </button>
            </div>

            {/* ── Primary Navigation ── */}
            <div className="flex-1 px-3 space-y-1">
                <SectionLabel label={t('nav_main') || 'Main'} />

                <NavItem id="nav-home" icon={Home} label={t('nav_home')} active={activeTab === 'home'} onClick={() => navTo('home')} />
                <NavItem id="nav-stats" icon={BarChart3} label={t('nav_stats')} active={activeTab === 'stats'} onClick={() => navTo('stats')} showCrown={!isPro} />
                <NavItem id="nav-history" icon={History} label={t('nav_history')} active={activeTab === 'history'} onClick={() => navTo('history')} />

                <SectionLabel label={t('quick_access') || 'Tools'} />

                <NavItem icon={Target} label={t('goals')} active={activeTab === 'goals'} onClick={() => navTo('goals')} />
                <NavItem icon={PiggyBank} label={t('budgets')} active={activeTab === 'budgets'} onClick={() => navTo('budgets')} />
                <NavItem id="nav-recurring" icon={RefreshCw} label={t('recurring')} active={activeTab === 'recurring'} onClick={() => { setPreviousTab?.('home'); navTo('recurring'); }} showCrown={!isPro} />
                <NavItem id="nav-advisor" icon={Lightbulb} label={t('advisor_title')} active={activeTab === 'advisor'} onClick={() => navTo('advisor')} showCrown={!isPro} />

                <SectionLabel label={t('settings') || 'Settings'} />

                <NavItem
                    id="nav-profile"
                    icon={Settings}
                    label={t('settings') || 'Ρυθμίσεις'}
                    active={['profile', 'account', 'general', 'security', 'backup', 'support', 'feedback', 'guide', 'profile-details', 'categories'].includes(activeTab)}
                    onClick={() => navTo('profile')}
                />

                {isAdmin && (
                    <NavItem
                        id="nav-admin"
                        icon={LayoutDashboard}
                        label={t('admin_panel') || 'Πίνακας Διαχείρισης'}
                        active={activeTab === 'admin'}
                        badge="ADMIN"
                        onClick={() => {
                            if (setPreviousTab) setPreviousTab(activeTab);
                            navTo('admin');
                        }}
                    />
                )}
            </div>

            {/* ── User Profile & Quick Controls Footer ── */}
            <div className="p-3.5 border-t border-gray-200/90 dark:border-white/[0.08] space-y-2.5 mt-auto bg-gray-50/70 dark:bg-white/[0.02]">
                {/* ── Become Pro Card (Non-Pro Users) ── */}
                {!isPro && (
                    <button
                        type="button"
                        id="sidebar-become-pro-btn"
                        onClick={() => {
                            if (setPreviousTab && activeTab !== 'upgrade') {
                                setPreviousTab(activeTab);
                            }
                            openUpgradeModal('sidebar');
                        }}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className={`w-full text-left p-3.5 rounded-2xl cursor-pointer group transition-all duration-200
                                   bg-gray-100/90 dark:bg-surface-dark2
                                   border border-gray-200 dark:border-white/10
                                   hover:border-gray-300 dark:hover:border-white/20
                                   hover:bg-gray-200/60 dark:hover:bg-white/[0.04]
                                   active:scale-[0.99] block select-none ${activeTab === 'upgrade'
                                ? 'ring-1 ring-gray-950 dark:ring-white'
                                : ''
                            }`}
                    >
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <ShieldCheck size={16} strokeWidth={2.2} className="text-amber-500 shrink-0" />
                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                    {t('become_pro') || t('go_pro') || 'Become Pro'}
                                </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                PRO
                            </span>
                        </div>

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {t('go_pro_subtitle') || 'Unlock all features'}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <span>{t('upgrade_to_pro') || t('upgrade') || 'Upgrade'}</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                    </button>
                )}

                {/* User Profile Mini Capsule */}
                <div
                    onClick={() => navTo('profile')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer group border ${activeTab === 'profile'
                            ? 'bg-gray-200/80 dark:bg-surface-dark border-gray-300 dark:border-white/20'
                            : 'bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                        {effectivePhoto && imgRetries < MAX_IMG_RETRIES ? (
                            <img
                                src={imgRetries > 0 ? `${effectivePhoto}${effectivePhoto.includes('?') ? '&' : '?'}retry=${imgRetries}` : effectivePhoto}
                                alt="User"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                                onError={() => setImgRetries(prev => prev + 1)}
                            />
                        ) : (
                            <User size={15} className="text-gray-500 dark:text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                {effectiveName}
                            </p>
                            {isPro && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 shrink-0">
                                    PRO
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {isPro ? (t('pro_member') || 'Pro Member') : (user?.email || 'Spendlore')}
                        </p>
                    </div>
                </div>

                {/* Compact Utility Action Grid (Theme, Privacy, Language, Logout) */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    {/* Theme Preference Modal Trigger */}
                    <button
                        onClick={() => setShowThemeModal(true)}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/[0.08] hover:text-gray-950 dark:hover:text-white outline-none focus:outline-none active:scale-95 transition-all shadow-2xs"
                        title={t('select_theme') || 'Επιλογή Θέματος'}
                    >
                        {themePreference === 'system' ? (
                            <Monitor size={13} className="shrink-0" />
                        ) : themePreference === 'light' ? (
                            <Sun size={13} className="text-amber-400 shrink-0" />
                        ) : (
                            <Moon size={13} className="text-indigo-400 shrink-0" />
                        )}
                        <span className="text-[11px] font-bold truncate">
                            {themePreference === 'system'
                                ? (t('theme_system') || 'Σύστημα')
                                : themePreference === 'light'
                                ? (t('theme_light') || 'Φωτεινό')
                                : (t('theme_dark') || 'Σκοτεινό')}
                        </span>
                    </button>

                    {/* Privacy Toggle */}
                    <button
                        onClick={togglePrivacyMode}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold outline-none focus:outline-none active:scale-95 transition-all border ${privacyMode
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white shadow-xs font-bold'
                                : 'text-gray-700 dark:text-gray-300 bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/[0.08] hover:text-gray-950 dark:hover:text-white shadow-2xs'
                            }`}
                        title={privacyMode ? (t('show_amounts') || 'Show amounts') : (t('hide_amounts') || 'Hide amounts')}
                    >
                        {privacyMode ? <EyeOff size={13} className="shrink-0" /> : <Eye size={13} className="shrink-0" />}
                        <span className="text-[11px] font-bold truncate">{privacyMode ? (t('privacy_private') || 'Private') : (t('privacy_visible') || 'Visible')}</span>
                    </button>

                    {/* Language Switcher */}
                    <button
                        onClick={() => updateLanguage && updateLanguage(language === 'el' ? 'en' : 'el')}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/[0.08] hover:text-gray-950 dark:hover:text-white outline-none focus:outline-none active:scale-95 transition-all shadow-2xs"
                        title={language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
                        aria-label={language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
                    >
                        <Languages size={13} className="text-gray-500 dark:text-gray-400 shrink-0" />
                        <span className="text-[11px] font-bold truncate">{language === 'el' ? 'Ελληνικά' : 'English'}</span>
                    </button>

                    {/* Sign Out */}
                    <button
                        onClick={onSignOut}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900/40 hover:text-rose-600 dark:hover:text-rose-300 outline-none focus:outline-none active:scale-95 transition-all shadow-2xs"
                        title={t('sign_out') || t('logout') || 'Sign out'}
                        aria-label={t('sign_out') || t('logout') || 'Sign out'}
                    >
                        <LogOut size={13} className="shrink-0" />
                        <span className="text-[11px] font-bold truncate">{t('sign_out') || t('logout') || 'Sign out'}</span>
                    </button>
                </div>
            </div>

            <ThemeSelectionModal
                isOpen={showThemeModal}
                onClose={() => setShowThemeModal(false)}
            />
        </aside>
    );
};

export default DesktopSidebar;
