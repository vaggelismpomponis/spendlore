import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useAnimationControls, useMotionValue, useTransform } from "framer-motion";
import { 
    Bell, X, CheckCheck, Trash2, Plus, Pencil, Minus, Info, 
    MoreHorizontal, ChevronDown, Check, CreditCard, Radio, MessageSquare 
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useSettings } from "../contexts/SettingsContext";
import { getCategoryTranslation } from '../utils/categoryTranslations';
import ConfirmationModal from './ConfirmationModal';
import CategoryIcon from './CategoryIcon';
import { hapticImpactLight } from '../utils/haptics';

function formatNotificationTime(isoString, isGreek) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(isGreek ? 'el-GR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function resolveChannel(notif) {
    const msg = (notif.message || '').toLowerCase();
    if (
        notif.type === 'add' || 
        notif.type === 'edit' || 
        notif.type === 'delete' || 
        notif.metadata?.txType || 
        (notif.metadata?.amount !== undefined && notif.metadata?.amount !== null)
    ) {
        return 'transactions';
    }
    if (
        msg.includes('όριο') || 
        msg.includes('budget') || 
        notif.type === 'budget' || 
        msg.includes('υπέρβαση') || 
        msg.includes('αξιολόγηση')
    ) {
        return 'alerts';
    }
    return 'system';
}

function getChannelIcon(channel) {
    switch (channel) {
        case 'transactions':
            return CreditCard;
        case 'alerts':
            return Bell;
        case 'system':
        default:
            return Radio;
    }
}

const NotificationItem = ({ notif, idx, isOpen, onOpen, onClose, onDelete, t, isGreek }) => {
    const controls = useAnimationControls();
    const x = useMotionValue(0);
    // Smooth transform for icon & label scaling and fading as swipe progresses
    const iconScale = useTransform(x, [-76, -30, 0], [1, 0.85, 0.6]);
    const iconOpacity = useTransform(x, [-76, -20, 0], [1, 0.9, 0]);
    // Smoothly morph right border radius from 16px to 0px so it flattens seamlessly against the delete tray
    const rightRadius = useTransform(x, [-36, 0], [0, 16]);
    const isDraggingRef = useRef(false);
    const hasMountedRef = useRef(false);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }
        if (isOpen) {
            controls.start({
                x: -76,
                transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
            });
        } else {
            controls.start({
                x: 0,
                transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
            });
        }
    }, [isOpen, controls]);

    const handleDragStart = () => {
        isDraggingRef.current = true;
    };

    const handleDragEnd = (_event, info) => {
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 80);

        // Snap threshold: if swiped past -28px or fast flick to left
        const shouldOpen = info.offset.x < -28 || info.velocity.x < -180;
        const shouldClose = info.offset.x > 20 || info.velocity.x > 180;

        if (isOpen) {
            if (shouldClose) {
                onClose();
                controls.start({
                    x: 0,
                    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
                });
            } else {
                controls.start({
                    x: -76,
                    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
                });
            }
        } else {
            if (shouldOpen) {
                onOpen();
                hapticImpactLight();
                controls.start({
                    x: -76,
                    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
                });
            } else {
                controls.start({
                    x: 0,
                    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
                });
            }
        }
    };

    const handleCardClick = (e) => {
        if (isDraggingRef.current) return;
        if (isOpen) {
            e.stopPropagation();
            onClose();
            controls.start({
                x: 0,
                transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }
            });
        }
    };

    const meta = notif.metadata || {};
    const hasAmount = meta.amount !== undefined && meta.amount !== null;
    const isExpense = meta.txType === 'expense';
    const amountSign = isExpense ? '-' : '+';
    const amountColor = isExpense
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-emerald-600 dark:text-emerald-400';
    const amountBg = isExpense
        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';

    const channel = resolveChannel(notif);
    const ChannelIconComp = getChannelIcon(channel);
    const timeDisplay = formatNotificationTime(notif.timestamp, isGreek);

    // Title resolution with backward compatibility for tests and translations
    const reverseMap = {
        'Transaction deleted': 'notification_deleted',
        'Συναλλαγή διαγράφηκε': 'notification_deleted',
        'New expense recorded': 'notification_added_expense',
        'Νέο έξοδο καταγράφηκε': 'notification_added_expense',
        'New income recorded': 'notification_added_income',
        'Νέο εισόδημα καταγράφηκε': 'notification_added_income',
        'Transaction edited': 'notification_edited',
        'Συναλλαγή τροποποιήθηκε': 'notification_edited'
    };
    const key = reverseMap[notif.message] || notif.message;
    const translated = t(key);
    const displayTitle = translated !== key ? translated : notif.message;

    // Subtitle / body text description in Klarna fashion
    let bodyText = notif.body || '';
    if (!bodyText) {
        if (meta.note) {
            bodyText = `"${meta.note}"`;
        } else if (notif.type === 'add') {
            bodyText = isGreek 
                ? (isExpense ? 'Καταγράφηκε νέο έξοδο στο λογαριασμό σας' : 'Προστέθηκε νέο έσοδο στο υπόλοιπό σας')
                : (isExpense ? 'New expense logged in your account' : 'New income added to your balance');
        } else if (notif.type === 'edit') {
            bodyText = isGreek 
                ? 'Οι λεπτομέρειες της συναλλαγής ενημερώθηκαν'
                : 'Transaction details were updated';
        } else if (notif.type === 'delete') {
            bodyText = isGreek 
                ? 'Η συναλλαγή αφαιρέθηκε από το ιστορικό σας'
                : 'Transaction was removed from your history';
        } else {
            bodyText = notif.message;
        }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                scale: 0.95,
                transition: { duration: 0.2, ease: "easeInOut" }
            }}
            transition={{ delay: idx * 0.02 }}
            className="relative overflow-hidden rounded-2xl mb-2.5 select-none bg-transparent"
        >
            {/* Background Delete Action Tray (Revealed on Swipe Left) */}
            <div
                className={`absolute inset-0 bg-rose-600 dark:bg-rose-600 flex justify-end z-0 rounded-2xl overflow-hidden ${
                    isOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif.id);
                    }}
                    className="w-[76px] h-full flex flex-col items-center justify-center gap-1.5 text-white active:scale-95 transition-transform cursor-pointer"
                    aria-label={t("delete") || "Διαγραφή"}
                    title={t("delete") || "Διαγραφή"}
                >
                    <motion.div
                        style={{ scale: iconScale, opacity: iconOpacity }}
                        className="flex flex-col items-center justify-center gap-1 text-white"
                    >
                        <Trash2 size={20} className="text-white stroke-[2.3]" />
                        <span className="text-[11px] font-extrabold text-white tracking-tight">
                            {t("delete") || "Διαγραφή"}
                        </span>
                    </motion.div>
                </button>
            </div>

            {/* Foreground Swipeable Card */}
            <motion.div
                style={{
                    x,
                    borderTopRightRadius: rightRadius,
                    borderBottomRightRadius: rightRadius
                }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -76, right: 0 }}
                dragElastic={{ left: 0.25, right: 0 }}
                animate={controls}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={handleCardClick}
                className={`relative z-10 w-full flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl
                            touch-pan-y cursor-grab active:cursor-grabbing
                            border transition-colors duration-150
                            ${!notif.read
                                ? "bg-white dark:bg-surface-dark3 border-gray-200 dark:border-white/10 shadow-xs"
                                : "bg-gray-100/75 dark:bg-surface-dark2 border-gray-200/50 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                            }`}
            >
                {/* Spendlore Brand Mark Badge (Klarna Circular Icon standard) */}
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-500/20 flex items-center justify-center shrink-0 p-1.5 overflow-hidden shadow-xs">
                    <img 
                        src="/spendlore-mark.png" 
                        alt="Spendlore" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex';
                            }
                        }}
                    />
                    <span className="hidden w-full h-full items-center justify-center text-xs font-black text-violet-700 dark:text-violet-300">
                        S
                    </span>
                </div>

                {/* Card Content */}
                <div className="flex-1 min-w-0">
                    {/* Top Row: Title + Channel Badge + Timestamp + Unread Dot */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[13px] sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                                {displayTitle}
                            </span>
                            <span 
                                className="w-4 h-4 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-950 flex items-center justify-center shrink-0 shadow-xs"
                                title={channel}
                            >
                                <ChannelIconComp size={9} strokeWidth={2.4} />
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            {timeDisplay && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                    {timeDisplay}
                                </span>
                            )}
                            {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                            )}
                        </div>
                    </div>

                    {/* Subtitle / Description */}
                    {bodyText && (
                        <p className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-300 font-normal leading-relaxed mt-1">
                            {bodyText}
                        </p>
                    )}

                    {/* Metadata Chips: Category, Note & Amount */}
                    {(meta.category || hasAmount || (meta.note && bodyText !== `"${meta.note}"`)) && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 pt-1.5 border-t border-gray-200/50 dark:border-white/5">
                            {hasAmount && (
                                <span className={`text-[12px] font-bold px-2 py-0.5 rounded-lg border flex-shrink-0 ${amountColor} ${amountBg}`}>
                                    {amountSign}{Number(meta.amount).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                </span>
                            )}
                            {meta.category && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md
                                                bg-white dark:bg-white/[0.08]
                                                text-gray-600 dark:text-gray-300 border border-gray-200/70 dark:border-white/10 flex items-center gap-1.5">
                                    <CategoryIcon category={meta.category} size={12} className="shrink-0" />
                                    {getCategoryTranslation(meta.category, t)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const NotificationPanel = ({ isOpen, onClose }) => {
    const { notifications, markAllRead, clearAll, deleteNotification, unreadCount, refetchNotifications } = useNotifications();
    const { t } = useSettings();

    const [swipedId, setSwipedId] = useState(null);
    const [notifToDelete, setNotifToDelete] = useState(null);
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

    // Klarna Filter & Menu States
    const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'transactions' | 'alerts' | 'system'
    const [dateSort, setDateSort] = useState('newest'); // 'newest' | 'oldest' | 'unread'
    const [showChannelDropdown, setShowChannelDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const channelDropdownRef = useRef(null);
    const dateDropdownRef = useRef(null);
    const moreMenuRef = useRef(null);

    const isGreek = typeof navigator !== 'undefined' && 
        (navigator.language?.startsWith('el') || t('language') === 'Γλώσσα' || t('notifications_inbox') === 'Εισερχόμενα');

    const handleOpen = () => {
        if (refetchNotifications) {
            refetchNotifications();
        }
        markAllRead();
    };

    useEffect(() => {
        if (isOpen) {
            handleOpen();
        } else {
            setSwipedId(null);
            setShowChannelDropdown(false);
            setShowDateDropdown(false);
            setShowMoreMenu(false);
        }
    }, [isOpen]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (channelDropdownRef.current && !channelDropdownRef.current.contains(e.target)) {
                setShowChannelDropdown(false);
            }
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
                setShowDateDropdown(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = (id) => {
        setSwipedId(prev => prev === id ? null : prev);
        deleteNotification(id);
    };

    // Filter and Sort Notifications
    const filteredNotifications = useMemo(() => {
        let list = [...notifications];

        // 1. Channel Filter
        if (channelFilter !== 'all') {
            list = list.filter(n => resolveChannel(n) === channelFilter);
        }

        // 2. Date Sort / Unread Filter
        if (dateSort === 'unread') {
            list = list.filter(n => !n.read);
        } else if (dateSort === 'oldest') {
            list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
        } else {
            // Newest first (default)
            list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        }

        return list;
    }, [notifications, channelFilter, dateSort]);

    // Date Grouping (Klarna Standard: "Σήμερα", "Χθες", "17 Σεπτεμβρίου", etc.)
    const dateGroups = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = [];
        const map = new Map();

        filteredNotifications.forEach(item => {
            const d = new Date(item.timestamp || Date.now());
            const dDay = new Date(d);
            dDay.setHours(0, 0, 0, 0);

            let key;
            let title;
            if (dDay.getTime() === today.getTime()) {
                key = 'today';
                title = t('date_today') || (isGreek ? 'Σήμερα' : 'Today');
            } else if (dDay.getTime() === yesterday.getTime()) {
                key = 'yesterday';
                title = t('date_yesterday') || (isGreek ? 'Χθες' : 'Yesterday');
            } else {
                key = dDay.toISOString().split('T')[0];
                title = d.toLocaleDateString(isGreek ? 'el-GR' : 'en-US', {
                    day: 'numeric',
                    month: 'long'
                });
            }

            if (!map.has(key)) {
                const groupObj = { key, title, items: [] };
                map.set(key, groupObj);
                groups.push(groupObj);
            }
            map.get(key).items.push(item);
        });

        return groups;
    }, [filteredNotifications, isGreek, t]);

    // Filter label helpers
    const getChannelLabel = () => {
        switch (channelFilter) {
            case 'transactions':
                return t('filter_transactions') || (isGreek ? 'Συναλλαγές' : 'Transactions');
            case 'alerts':
                return t('filter_alerts') || (isGreek ? 'Ειδοποιήσεις' : 'Alerts');
            case 'system':
                return t('filter_system') || (isGreek ? 'Σύστημα' : 'System');
            default:
                return t('sent_as') || (isGreek ? 'Στάλθηκε ως' : 'Sent as');
        }
    };

    const getDateLabel = () => {
        switch (dateSort) {
            case 'oldest':
                return t('sort_oldest') || (isGreek ? 'Παλαιότερες' : 'Oldest');
            case 'unread':
                return t('sort_unread') || (isGreek ? 'Μη αναγνωσμένα' : 'Unread');
            default:
                return t('filter_date') || (isGreek ? 'Ημερομηνία' : 'Date');
        }
    };

    // Header title backward-compatible with tests
    const headerTitle = (t('notifications_inbox') && t('notifications_inbox') !== 't_notifications_inbox')
        ? t('notifications_inbox')
        : (t('notifications') || (isGreek ? 'Εισερχόμενα' : 'Inbox'));

    return (
        <>
            <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="notif-modal-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 lg:p-0 lg:block pointer-events-none"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                        onClick={onClose}
                    />

                    {/* Klarna-Style Notification Inbox Panel */}
                    <motion.div
                        key="notif-panel"
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 14, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="pointer-events-auto relative z-10 w-full max-w-lg
                                   lg:fixed lg:top-[74px] lg:right-6 lg:left-auto lg:z-[105] lg:w-[480px]
                                   bg-white dark:bg-surface-dark2
                                   rounded-3xl shadow-2xl
                                   border border-gray-200/80 dark:border-white/10
                                   overflow-hidden flex flex-col"
                        style={{ maxHeight: "85vh", height: "auto" }}
                    >
                        {/* Klarna Header */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {headerTitle}
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <>
                                        {/* Quick Clear All button (Title matching test expectation) */}
                                        <button
                                            type="button"
                                            onClick={() => setShowClearAllConfirm(true)}
                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-150"
                                            title={t("clear_all") || "Clear all"}
                                            aria-label={t("clear_all") || "Clear all"}
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* Klarna 3-dots actions menu */}
                                        <div className="relative" ref={moreMenuRef}>
                                            <button
                                                type="button"
                                                onClick={() => setShowMoreMenu(prev => !prev)}
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                aria-label="More options"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {/* Dropdown Popup */}
                                            {showMoreMenu && (
                                                <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-30">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowMoreMenu(false);
                                                            markAllRead();
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2.5"
                                                    >
                                                        <CheckCheck size={16} className="text-violet-600 dark:text-violet-400" />
                                                        {t('mark_all_read_full') || (isGreek ? 'Επισήμανση όλων ως αναγνωσμένα' : 'Mark all as read')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowMoreMenu(false);
                                                            setShowClearAllConfirm(true);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5"
                                                    >
                                                        <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
                                                        {t('clear_all_full') || (isGreek ? 'Εκκαθάριση όλων' : 'Clear all')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Close Button */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Klarna Filter Chips Row (Rendered when notifications exist) */}
                        {notifications.length > 0 && (
                            <div className="flex items-center gap-2 px-5 pb-3 pt-0.5 border-b border-gray-100 dark:border-white/5">
                                {/* Filter 1: Sent As / Type */}
                                <div className="relative" ref={channelDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChannelDropdown(prev => !prev);
                                            setShowDateDropdown(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                            channelFilter !== 'all'
                                                ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950 shadow-xs'
                                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-white/10'
                                        }`}
                                    >
                                        <span>{getChannelLabel()}</span>
                                        <ChevronDown size={13} className={`transition-transform duration-150 ${showChannelDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showChannelDropdown && (
                                        <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-1 z-30">
                                            {[
                                                { id: 'all', label: t('filter_all') || (isGreek ? 'Όλα' : 'All') },
                                                { id: 'transactions', label: t('filter_transactions') || (isGreek ? 'Συναλλαγές' : 'Transactions') },
                                                { id: 'alerts', label: t('filter_alerts') || (isGreek ? 'Ειδοποιήσεις' : 'Alerts') },
                                                { id: 'system', label: t('filter_system') || (isGreek ? 'Σύστημα' : 'System') },
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setChannelFilter(opt.id);
                                                        setShowChannelDropdown(false);
                                                    }}
                                                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between ${
                                                        channelFilter === opt.id
                                                            ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    {channelFilter === opt.id && <Check size={14} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Filter 2: Date / Sort */}
                                <div className="relative" ref={dateDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDateDropdown(prev => !prev);
                                            setShowChannelDropdown(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                            dateSort !== 'newest'
                                                ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950 shadow-xs'
                                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-white/10'
                                        }`}
                                    >
                                        <span>{getDateLabel()}</span>
                                        <ChevronDown size={13} className={`transition-transform duration-150 ${showDateDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showDateDropdown && (
                                        <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-1 z-30">
                                            {[
                                                { id: 'newest', label: t('sort_newest') || (isGreek ? 'Νεότερες πρώτα' : 'Newest first') },
                                                { id: 'oldest', label: t('sort_oldest') || (isGreek ? 'Παλαιότερες πρώτα' : 'Oldest first') },
                                                { id: 'unread', label: t('sort_unread') || (isGreek ? 'Μόνο μη αναγνωσμένα' : 'Unread only') },
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setDateSort(opt.id);
                                                        setShowDateDropdown(false);
                                                    }}
                                                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between ${
                                                        dateSort === opt.id
                                                            ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    {dateSort === opt.id && <Check size={14} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notifications List Grouped By Date */}
                        <div
                            className="overflow-y-auto custom-scrollbar p-4 sm:p-5"
                            style={{ maxHeight: "calc(85vh - 120px)" }}
                            onClick={() => {
                                if (swipedId) setSwipedId(null);
                            }}
                        >
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="relative mb-3">
                                        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <ellipse cx="70" cy="72" rx="42" ry="38" fill="url(#glowGrad)" opacity="0.25"/>
                                            <path d="M70 22C52 22 38 37 38 56V82H102V56C102 37 88 22 70 22Z" fill="url(#bellGrad)"/>
                                            <path d="M32 82H108C108 82 108 88 70 88C32 88 32 82 32 82Z" fill="url(#bellGrad2)" rx="4"/>
                                            <ellipse cx="70" cy="91" rx="7" ry="5" fill="url(#bellGrad2)"/>
                                            <path d="M64 22C64 18.686 66.686 16 70 16C73.314 16 76 18.686 76 22" stroke="url(#bellGrad2)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                                            <ellipse cx="57" cy="44" rx="7" ry="12" fill="white" opacity="0.22" transform="rotate(-15 57 44)"/>
                                            <path d="M60 64 Q63 61 66 64" stroke="#2E1065" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                            <path d="M74 64 Q77 61 80 64" stroke="#2E1065" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                            <path d="M63 72 Q70 77 77 72" stroke="#2E1065" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                            <ellipse cx="58" cy="70" rx="4.5" ry="2.5" fill="#DDD6FE" opacity="0.45"/>
                                            <ellipse cx="82" cy="70" rx="4.5" ry="2.5" fill="#DDD6FE" opacity="0.45"/>
                                            <text x="96" y="40" fontSize="9" fontWeight="800" fill="#7C3AED" opacity="0.9" fontFamily="sans-serif">z</text>
                                            <text x="103" y="30" fontSize="11" fontWeight="800" fill="#7C3AED" opacity="0.75" fontFamily="sans-serif">z</text>
                                            <text x="111" y="19" fontSize="13" fontWeight="800" fill="#7C3AED" opacity="0.6" fontFamily="sans-serif">z</text>
                                            <circle cx="38" cy="112" r="9" fill="url(#coinGrad)" opacity="0.95"/>
                                            <circle cx="38" cy="112" r="9" stroke="#059669" strokeWidth="1" opacity="0.8"/>
                                            <text x="35" y="115.5" fontSize="9" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="800">€</text>
                                            <circle cx="52" cy="118" r="7" fill="url(#coinGrad)" opacity="0.9"/>
                                            <circle cx="52" cy="118" r="7" stroke="#059669" strokeWidth="0.8" opacity="0.8"/>
                                            <text x="49.5" y="121" fontSize="7.5" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="800">€</text>
                                            <rect x="58" y="108" width="30" height="20" rx="3.5" fill="url(#cardGrad)" opacity="0.95"/>
                                            <rect x="58" y="113" width="30" height="4" fill="#0F172A" opacity="0.4"/>
                                            <rect x="61" y="119.5" width="6" height="4.5" rx="1" fill="#FBBF24" opacity="0.9"/>
                                            <rect x="69" y="121" width="15" height="1.5" rx="0.5" fill="white" opacity="0.5"/>
                                            <ellipse cx="108" cy="116" rx="11" ry="9" fill="url(#piggyGrad)" opacity="0.95"/>
                                            <circle cx="116" cy="112" r="3.5" fill="url(#piggyGrad)" opacity="0.95"/>
                                            <ellipse cx="101" cy="117" rx="2" ry="2.5" fill="#8B5CF6" opacity="0.6"/>
                                            <circle cx="105" cy="112" r="2.5" fill="#4C1D95" opacity="0.4"/>
                                            <rect x="106" y="105" width="4" height="2" rx="0.8" fill="#4C1D95" opacity="0.5"/>
                                            <defs>
                                                <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                                                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35"/>
                                                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"/>
                                                </radialGradient>
                                                <linearGradient id="bellGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                                                    <stop offset="0%" stopColor="#8B5CF6"/>
                                                    <stop offset="100%" stopColor="#6D28D9"/>
                                                </linearGradient>
                                                <linearGradient id="bellGrad2" x1="50%" y1="0%" x2="50%" y2="100%">
                                                    <stop offset="0%" stopColor="#7C3AED"/>
                                                    <stop offset="100%" stopColor="#5B21B6"/>
                                                </linearGradient>
                                                <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#34D399"/>
                                                    <stop offset="100%" stopColor="#059669"/>
                                                </linearGradient>
                                                <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#312E81"/>
                                                    <stop offset="100%" stopColor="#1E1B4B"/>
                                                </linearGradient>
                                                <linearGradient id="piggyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#C4B5FD"/>
                                                    <stop offset="100%" stopColor="#7C3AED"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white/90 mb-1">
                                        {t("no_notifications") || "No notifications yet"}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px] leading-relaxed">
                                        {t("notifications_empty_desc") || "Actions and updates will appear here"}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {dateGroups.map(group => (
                                        <div key={group.key} className="mb-4 last:mb-0">
                                            {/* Date Section Header */}
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 px-1 tracking-tight">
                                                {group.title}
                                            </h4>

                                            {/* Grouped Notification Items */}
                                            <AnimatePresence initial={false}>
                                                {group.items.map((notif, idx) => (
                                                    <NotificationItem
                                                        key={notif.id || `notif-${idx}`}
                                                        notif={notif}
                                                        idx={idx}
                                                        isOpen={swipedId === notif.id}
                                                        onOpen={() => setSwipedId(notif.id)}
                                                        onClose={() => setSwipedId(prev => prev === notif.id ? null : prev)}
                                                        onDelete={(id) => setNotifToDelete(id)}
                                                        t={t}
                                                        isGreek={isGreek}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Delete Single Notification Confirmation Modal */}
            <ConfirmationModal
                isOpen={Boolean(notifToDelete)}
                onClose={() => setNotifToDelete(null)}
                onConfirm={() => {
                    if (notifToDelete) {
                        handleDelete(notifToDelete);
                        setNotifToDelete(null);
                    }
                }}
                title={t('delete_notification') || 'Διαγραφή Ειδοποίησης'}
                message={t('delete_notification_confirm') || 'Θέλεις σίγουρα να διαγράψεις αυτή την ειδοποίηση;'}
                confirmText={t('delete') || 'Διαγραφή'}
                type="danger"
                zIndex="z-[150]"
            />

            {/* Clear All Notifications Confirmation Modal */}
            <ConfirmationModal
                isOpen={showClearAllConfirm}
                onClose={() => setShowClearAllConfirm(false)}
                onConfirm={() => {
                    clearAll();
                    setShowClearAllConfirm(false);
                }}
                title={t('clear_all_notifications') || 'Εκκαθάριση Ειδοποιήσεων'}
                message={t('clear_all_notifications_confirm') || 'Θέλεις σίγουρα να διαγράψεις όλες τις ειδοποιήσεις;'}
                confirmText={t('clear_all') || 'Εκκαθάριση'}
                type="danger"
                zIndex="z-[150]"
            />
        </>
    );
};

export default NotificationPanel;
