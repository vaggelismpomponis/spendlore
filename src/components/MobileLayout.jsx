import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Bell, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import OfflineIndicator from './OfflineIndicator';
import PaymentSuccessView from '../views/PaymentSuccessView';
import PaymentCanceledView from '../views/PaymentCanceledView';

export default function MobileLayout({
    activeTab,
    setActiveTab,
    photoURL,
    imgRetries,
    setImgRetries,
    MAX_IMG_RETRIES,
    translate,
    unreadCount,
    setShowNotificationPanel,
    showPaymentSuccess,
    setShowPaymentSuccess,
    showPaymentCanceled,
    setShowPaymentCanceled,
    openAddModal,
    children,
    overlays,
    modals
}) {
    const [showFabMenu, setShowFabMenu] = useState(false);
    const fabLongPressRef = useRef(null);
    const fabPressStartRef = useRef(false);

    return (
        <main className="h-full w-full bg-surface-light dark:bg-surface-dark
                        font-sans text-gray-900 dark:text-white
                        selection:bg-gray-900 selection:text-white dark:selection:bg-white dark:selection:text-gray-900
                        flex justify-center items-start transition-colors duration-300">

            {/* Mobile container */}
            <div className="w-full max-w-md bg-white dark:bg-surface-dark
                            h-full overflow-hidden
                            shadow-2xl relative flex flex-col
                            transition-colors duration-300">

                {/* Payment Success/Cancel Overlay (Mobile) */}
                {showPaymentSuccess && (
                    <PaymentSuccessView
                        onContinue={() => {
                            setShowPaymentSuccess(false);
                            setActiveTab('home');
                        }}
                    />
                )}
                {showPaymentCanceled && (
                    <PaymentCanceledView
                        onContinue={() => {
                            setShowPaymentCanceled(false);
                            setActiveTab('home');
                        }}
                        onRetry={() => {
                            setShowPaymentCanceled(false);
                            setActiveTab('profile');
                        }}
                    />
                )}

                {/* ── Main Scroll Area ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
                    {/* ── Top Bar ── */}
                    <div className="shrink-0 sticky top-0 z-50
                                    bg-white/90 dark:bg-surface-dark backdrop-blur-md
                                    border-b border-gray-200/60 dark:border-white/5
                                    px-4 pb-3 -mx-4 transition-all duration-300"
                        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>

                        <div className="flex items-center justify-between min-h-[40px]">
                            {/* LEFT — User Profile Avatar */}
                            <div className="relative flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('profile')}
                                    className="w-9 h-9 rounded-full flex items-center justify-center
                                               bg-gray-100 dark:bg-surface-dark2
                                               text-gray-600 dark:text-gray-300
                                               hover:bg-gray-200 dark:hover:bg-white/[0.08]
                                               active:scale-95 transition-all
                                               overflow-hidden shadow-xs shrink-0"
                                    style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                                    title={translate('settings')}
                                    aria-label={translate('settings')}
                                >
                                    {photoURL && imgRetries < MAX_IMG_RETRIES ? (
                                        <img
                                            src={imgRetries > 0 ? `${photoURL}${photoURL.includes('?') ? '&' : '?'}retry=${imgRetries}` : photoURL}
                                            alt="Profile"
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover"
                                            onError={() => setImgRetries(prev => prev + 1)}
                                        />
                                    ) : (
                                        <User size={18} strokeWidth={2.2} />
                                    )}
                                </motion.button>
                            </div>

                            {/* CENTER — App Name */}
                            {activeTab === 'home' ? (
                                <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-black tracking-tight text-gray-900 dark:text-white font-sans select-none pointer-events-none">
                                    Spendlore
                                </h1>
                            ) : (
                                <h2 className="absolute left-1/2 -translate-x-1/2
                                                text-[16px] font-bold text-gray-900 dark:text-white
                                                truncate max-w-[160px] text-center select-none">
                                    {activeTab === 'history' && translate('nav_history')}
                                    {activeTab === 'stats' && translate('nav_stats')}
                                    {activeTab === 'goals' && translate('goals')}
                                    {activeTab === 'budgets' && translate('budgets')}
                                    {activeTab === 'cooling-off' && (translate('cooling_off_title') || 'Αναμονή 72h')}
                                    {(activeTab === 'support' || activeTab === 'feedback') && (translate('technical_support') || translate('support') || 'Support')}
                                    {activeTab === 'admin' && 'Admin Panel'}
                                </h2>
                            )}

                            {/* RIGHT — Notification Bell */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotificationPanel(prev => !prev)}
                                className="relative w-9 h-9 rounded-xl flex-shrink-0
                                        bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10
                                        shadow-sm
                                        flex items-center justify-center
                                        text-gray-700 dark:text-gray-300
                                        hover:text-gray-950 dark:hover:text-white
                                        transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none select-none"
                                style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                                aria-label="Notifications"
                            >
                                <Bell size={18} strokeWidth={2} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1
                                                        min-w-[18px] h-[18px] px-1 rounded-full
                                                        bg-gray-900 text-white dark:bg-white dark:text-gray-950
                                                        text-[9px] font-black
                                                        flex items-center justify-center
                                                        shadow-sm border border-white dark:border-gray-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </motion.button>
                        </div>

                        {/* Offline / Sync status banner */}
                        <OfflineIndicator className="-mx-4 -mb-3 mt-2" />
                    </div>

                    <div className="h-4 shrink-0" />

                    {/* Main views (Home, Stats, History) */}
                    {children}
                </div>

                {/* Overlays (Profile, Goals, Settings, etc.) */}
                {overlays}

                {/* Mobile Modals/FAB */}
                {!['goals', 'budgets', 'cooling-off', 'profile', 'recurring', 'general', 'security', 'backup', 'support', 'feedback', 'admin', 'privacy', 'advisor', 'guide', 'upgrade'].includes(activeTab) && (
                    <div
                        className="absolute bottom-0 left-0 right-0 w-full z-[45] pointer-events-none px-3"
                        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
                    >
                        {/* Quick Add Button positioned at the bottom-right corner, directly above the navbar pill */}
                        <div className="flex justify-end pr-1 mb-2 pointer-events-auto">
                            <div id="tour-add-button" className="relative">
                                {/* Long-press context menu */}
                                <AnimatePresence>
                                    {showFabMenu && [
                                        /* Backdrop to dismiss */
                                        <div
                                            key="mobile-fab-menu-backdrop"
                                            className="fixed inset-0 z-[44]"
                                            onClick={() => setShowFabMenu(false)}
                                        />,
                                        <motion.div
                                            key="mobile-fab-menu-popover"
                                            initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 350, mass: 0.6 }}
                                            className="absolute bottom-[calc(100%+12px)] right-0 z-[46] flex flex-col gap-2 items-end"
                                        >
                                            {/* Income pill */}
                                            <motion.button
                                                whileTap={{ scale: 0.93 }}
                                                onClick={() => { setShowFabMenu(false); openAddModal('income'); }}
                                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-black/15 border border-emerald-400/30 whitespace-nowrap transition-colors"
                                            >
                                                <TrendingUp size={14} strokeWidth={2.5} />
                                                <span>Έσοδο</span>
                                            </motion.button>
                                            {/* Expense pill */}
                                            <motion.button
                                                whileTap={{ scale: 0.93 }}
                                                onClick={() => { setShowFabMenu(false); openAddModal('expense'); }}
                                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-black/15 border border-rose-400/30 whitespace-nowrap transition-colors"
                                            >
                                                <TrendingDown size={14} strokeWidth={2.5} />
                                                <span>Έξοδο</span>
                                            </motion.button>
                                            {/* Connector dot */}
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 opacity-60 mr-5" />
                                        </motion.div>
                                    ]}
                                </AnimatePresence>

                                {/* FAB */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    animate={showFabMenu ? { scale: 1.05 } : { scale: 1 }}
                                    onClick={() => {
                                        if (showFabMenu) { setShowFabMenu(false); return; }
                                        openAddModal();
                                    }}
                                    onContextMenu={(e) => { e.preventDefault(); setShowFabMenu(true); }}
                                    onPointerDown={() => {
                                        fabPressStartRef.current = true;
                                        fabLongPressRef.current = setTimeout(() => {
                                            if (fabPressStartRef.current) setShowFabMenu(true);
                                        }, 500);
                                    }}
                                    onPointerUp={() => {
                                        fabPressStartRef.current = false;
                                        clearTimeout(fabLongPressRef.current);
                                    }}
                                    onPointerLeave={() => {
                                        fabPressStartRef.current = false;
                                        clearTimeout(fabLongPressRef.current);
                                    }}
                                    aria-label="Add transaction"
                                    className="relative w-12 h-12 rounded-2xl bg-gray-950 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 flex items-center justify-center shadow-xl shadow-black/20 dark:shadow-black/50 border border-black/10 dark:border-white/20 outline-none focus:outline-none focus-visible:outline-none select-none active:scale-95 transition-all"
                                    style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                                >
                                    <motion.div
                                        animate={{ rotate: showFabMenu ? 45 : 0 }}
                                        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                                    >
                                        <Plus size={22} strokeWidth={2.5} />
                                    </motion.div>
                                </motion.button>
                            </div>
                        </div>

                        {/* Floating Pill Navbar */}
                        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {/* Global Modals */}
                {modals}
            </div>
        </main>
    );
}
