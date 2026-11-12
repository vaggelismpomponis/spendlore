import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowLeft, RefreshCw, Search, X,
    LayoutDashboard, Users, MessageSquare, Radio,
    Filter, ChevronLeft, ChevronRight,
    Activity, CheckCircle2, SlidersHorizontal, ArrowRight,
    ShieldAlert, LifeBuoy
} from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import ConfirmationModal from '../components/ConfirmationModal';
import ViewHeader from '../components/ViewHeader';

// Sub-components
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsersList from '../components/admin/AdminUsersList';
import AdminUserDetail from '../components/admin/AdminUserDetail';
import AdminFeedback from '../components/admin/AdminFeedback';
import AdminUpdates from '../components/admin/AdminUpdates';
import AdminBroadcast from '../components/admin/AdminBroadcast';
import AdminSentryErrors from '../components/admin/AdminSentryErrors';
import sentryLogger from '../utils/sentryLogger';
import logger from '../utils/logger';
import { scrollContainerToTop, resetGlobalScroll } from '../utils/scroll';

/* ─── Desktop Sidebar Tab ─── */
const SidebarTab = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group border ${isActive
                    ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950 font-bold border-gray-950 dark:border-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-950 dark:hover:text-white font-medium border-transparent'
                }`}
        >
            <Icon size={16} strokeWidth={2.2} className={`shrink-0 ${isActive ? 'text-white dark:text-gray-950' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'}`} />
            <span className="text-xs flex-1 truncate">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 tabular-nums ${isActive
                        ? 'bg-white/20 text-white dark:bg-gray-950/10 dark:text-gray-950'
                        : 'bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-white/10'
                    }`}>
                    {tab.badge}
                </span>
            )}
            {isActive && <ChevronRight size={13} className="shrink-0 text-white/70 dark:text-gray-950/70" />}
        </button>
    );
};

/* ─── Main AdminView Component ─── */
const AdminView = ({ onBack, hideHeader }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Feedback State
    const [feedback, setFeedback] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Updates State
    const [updates, setUpdates] = useState([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showUpdateDeleteModal, setShowUpdateDeleteModal] = useState(false);
    const [updateToDelete, setUpdateToDelete] = useState(null);
    const initialUpdateState = { version: '', title_el: '', title_en: '', features: [] };
    const [newUpdate, setNewUpdate] = useState(initialUpdateState);

    // Dashboard & Users State
    const [stats, setStats] = useState({ users: 0, transactions: 0, feedback: 0, activity: 0 });
    const [metrics, setMetrics] = useState({ proUsers: 0, freeUsers: 0, canceledUsers: 0, active7Days: 0, active30Days: 0, mostActiveUsers: [] });
    const [profiles, setProfiles] = useState([]);
    const [sessions, setSessions] = useState([]);

    // Broadcast State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // Sentry Errors State
    const [sentryErrors, setSentryErrors] = useState([]);

    // Subscription Management State
    const [showSubModal, setShowSubModal] = useState(false);
    const [subTarget, setSubTarget] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Notes State
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesTarget, setNotesTarget] = useState(null);
    const [editingNotes, setEditingNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Delete User State
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // User Detail State
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profileStats, setProfileStats] = useState({ transactions: 0, budgets: 0, goals: 0 });
    const [profileSessions, setProfileSessions] = useState([]);
    const [loadingProfileData, setLoadingProfileData] = useState(false);
    const mainScrollRef = useRef(null);

    // Ensure section switches and opening/closing a user profile always start at top of page
    useLayoutEffect(() => {
        scrollContainerToTop(mainScrollRef.current);
        resetGlobalScroll();
    }, [activeSection, selectedProfile?.id]);

    const { showToast } = useToast();
    const { t: translate } = useSettings();

    /* ─── Data Fetching ─── */
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                { data: fbData },
                { data: upData },
                { count: fCount },
                { count: tCount },
                { data: profRes, error: profInvokeError }
            ] = await Promise.all([
                supabase.from('feedback').select('*').order('created_at', { ascending: false }),
                supabase.from('app_updates').select('*').order('created_at', { ascending: false }),
                supabase.from('feedback').select('*', { count: 'exact', head: true }),
                supabase.from('transactions').select('*', { count: 'exact', head: true }),
                supabase.functions.invoke('admin-get-profiles')
            ]);

            if (profInvokeError) {
                console.error('Invoke error:', profInvokeError);
                showToast(`Function error: ${profInvokeError.message}`, 'error');
            }
            if (profRes?.error) {
                console.error('Admin API error:', profRes.error);
                showToast(`Admin API: ${profRes.error}`, 'error');
            }

            const profData = profRes?.profiles || [];
            const sessData = profRes?.sessions || [];

            setFeedback(fbData || []);
            setUpdates(upData || []);
            setSessions(sessData || []);

            // Fetch Sentry error logs
            const errs = await sentryLogger.fetchAllErrors();
            setSentryErrors(errs || []);

            const allUserIds = new Set([
                ...(profData || []).map(p => p.id),
                ...(sessData || []).map(s => s.user_id)
            ].filter(id => !!id));

            const latestSessionsMap = (sessData || []).reduce((acc, s) => {
                if (!acc[s.user_id] || new Date(s.last_active) > new Date(acc[s.user_id].last_active)) {
                    acc[s.user_id] = s;
                }
                return acc;
            }, {});

            // Batch user statistics calculation via RPC (bypasses RLS)
            let batchStats = {};
            try {
                const { data: allStats, error: allStatsErr } = await supabase.rpc('admin_get_all_users_stats');
                if (!allStatsErr && allStats) {
                    batchStats = allStats;
                } else if (allStatsErr) {
                    console.warn('admin_get_all_users_stats RPC warning:', allStatsErr);
                }
            } catch (e) {
                console.warn('admin_get_all_users_stats call failed:', e);
            }

            const enhancedProfiles = Array.from(allUserIds).map((uid, index) => {
                const profile = (profData || []).find(p => p.id === uid);
                const latestSession = latestSessionsMap[uid];
                return {
                    id: uid,
                    email: profile?.email || latestSession?.email || 'Unknown',
                    display_name: profile?.display_name || latestSession?.display_name || null,
                    subscription_status: profile?.subscription_status || 'free',
                    stripe_customer_id: profile?.stripe_customer_id || null,
                    admin_notes: profile?.admin_notes || null,
                    created_at: profile?.created_at || null,
                    last_sign_in_at: profile?.last_sign_in_at || null,
                    displayId: index + 1,
                    latest_session: latestSession || null,
                    stats: batchStats[uid] || profile?.stats || { transactions: 0, budgets: 0, goals: 0 },
                    is_virtual: !profile
                };
            });

            setProfiles(enhancedProfiles);
            setSelectedProfile(prev => {
                if (!prev) return null;
                const updated = enhancedProfiles.find(p => p.id === prev.id);
                return updated ? { ...prev, ...updated } : prev;
            });

            // Fetch platform-wide totals across all users
            let totalPlatformTransactions = profRes?.totalTransactions;
            let totalPlatformFeedback = fCount || 0;

            try {
                const { data: overviewRpc, error: rpcErr } = await supabase.rpc('admin_get_overview_stats');
                if (!rpcErr && overviewRpc) {
                    if (overviewRpc.transactions !== undefined) totalPlatformTransactions = Number(overviewRpc.transactions);
                    if (overviewRpc.feedback !== undefined) totalPlatformFeedback = Number(overviewRpc.feedback);
                }
            } catch (_) {}

            if (totalPlatformTransactions === undefined || totalPlatformTransactions === null) {
                totalPlatformTransactions = tCount || 0;
            }

            const uniqueUsers = allUserIds.size;
            setStats({
                users: uniqueUsers,
                transactions: totalPlatformTransactions,
                feedback: totalPlatformFeedback,
                activity: sessData?.length || 0
            });

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const proUsers = enhancedProfiles.filter(p => p.subscription_status === 'pro').length;
            const freeUsers = enhancedProfiles.filter(p => p.subscription_status === 'free').length;
            const canceledUsers = enhancedProfiles.filter(p => p.subscription_status === 'canceled' || p.subscription_status === 'cancelled').length;

            const active7Days = enhancedProfiles.filter(p => {
                const session = latestSessionsMap[p.id];
                return session && new Date(session.last_active) >= sevenDaysAgo;
            }).length;

            const active30Days = enhancedProfiles.filter(p => {
                const session = latestSessionsMap[p.id];
                return session && new Date(session.last_active) >= thirtyDaysAgo;
            }).length;

            const sessionCounts = (sessData || []).reduce((acc, s) => {
                acc[s.user_id] = (acc[s.user_id] || 0) + 1;
                return acc;
            }, {});

            const mostActiveUsers = enhancedProfiles
                .map(p => ({ ...p, sessionCount: sessionCounts[p.id] || 0 }))
                .filter(p => p.sessionCount > 0)
                .sort((a, b) => b.sessionCount - a.sessionCount)
                .slice(0, 5);

            setMetrics({ proUsers, freeUsers, canceledUsers, active7Days, active30Days, mostActiveUsers });

        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    /* ─── Handlers ─── */
    const handleDeleteClick = (id) => { setItemToDelete(id); setShowDeleteModal(true); };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { error } = await supabase.from('feedback').delete().eq('id', itemToDelete);
            if (error) throw error;
            setFeedback(prev => prev.filter(f => f.id !== itemToDelete));
            showToast('Feedback deleted', 'success');
        } catch (error) {
            showToast('Failed to delete', 'error');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleSubClick = (profile, status) => { setSubTarget({ profile, status }); setShowSubModal(true); };

    const confirmSubscriptionChange = async () => {
        if (!subTarget) return;
        const { profile, status } = subTarget;
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, subscription_status: status, subscription_expiry: null } : p));
        if (selectedProfile?.id === profile.id) {
            setSelectedProfile(prev => ({ ...prev, subscription_status: status, subscription_expiry: null }));
        }
        try {
            const { error } = await supabase.functions.invoke('admin-manage-subscription', {
                body: { targetUserId: profile.id, status }
            });
            if (error) throw error;
            showToast(`User updated to ${status.toUpperCase()}`, 'success');
            await fetchAllData();
        } catch (err) {
            showToast(`Error: ${err.message}`, 'error');
            fetchAllData();
        } finally {
            setShowSubModal(false);
            setSubTarget(null);
        }
    };

    const handleSaveNotes = async (userId, notesText) => {
        setIsSavingNotes(true);
        try {
            const { error } = await supabase.functions.invoke('admin-update-notes', {
                body: { targetUserId: userId, notes: notesText }
            });
            if (error) throw error;
            showToast(translate('notes_saved') || 'Notes saved', 'success');
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, admin_notes: notesText } : p));
            if (selectedProfile?.id === userId) {
                setSelectedProfile(prev => ({ ...prev, admin_notes: notesText }));
            }
            setShowNotesModal(false);
        } catch (err) {
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleSaveNotesModal = async () => {
        if (!notesTarget) return;
        await handleSaveNotes(notesTarget.id, editingNotes);
    };

    const handleDeleteUpdateClick = (update) => { setUpdateToDelete(update); setShowUpdateDeleteModal(true); };

    const confirmDeleteUpdate = async () => {
        if (!updateToDelete) return;
        try {
            const { error } = await supabase.from('app_updates').delete().eq('id', updateToDelete.id);
            if (error) throw error;
            showToast('Update deleted', 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to delete update', 'error');
        } finally {
            setShowUpdateDeleteModal(false);
            setUpdateToDelete(null);
        }
    };

    const handleProfileClick = async (profile) => {
        setSelectedProfile(profile);
        setActiveSection('users');
        setLoadingProfileData(true);

        // Tier 1: Immediately populate from cached sessions and pre-loaded profile.stats
        const cachedSessions = (sessions || []).filter(s => s.user_id === profile.id);
        setProfileSessions(cachedSessions);
        if (profile.stats) {
            setProfileStats(profile.stats);
        }

        try {
            let freshStats = profile.stats ? { ...profile.stats } : { transactions: 0, budgets: 0, goals: 0 };

            // Tier 2: Try Security Definer RPC admin_get_user_stats (bypasses RLS)
            const { data: rpcStats, error: rpcErr } = await supabase.rpc('admin_get_user_stats', { target_user_id: String(profile.id) });
            if (!rpcErr && rpcStats) {
                freshStats = {
                    transactions: Number(rpcStats.transactions || 0),
                    budgets: Number(rpcStats.budgets || 0),
                    goals: Number(rpcStats.goals || 0)
                };
            } else {
                if (rpcErr) {
                    console.warn('admin_get_user_stats RPC warning:', rpcErr);
                }
                // Tier 3: Direct queries with Admin RLS policy
                const [
                    { count: tCount, error: tErr },
                    { count: bCount, error: bErr },
                    { count: gCount, error: gErr }
                ] = await Promise.all([
                    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
                    supabase.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
                    supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', profile.id)
                ]);
                if (tErr) console.warn('Direct count transactions error:', tErr);
                freshStats = {
                    transactions: tCount !== null && tCount !== undefined ? tCount : (profile.stats?.transactions || 0),
                    budgets: bCount !== null && bCount !== undefined ? bCount : (profile.stats?.budgets || 0),
                    goals: gCount !== null && gCount !== undefined ? gCount : (profile.stats?.goals || 0)
                };
            }

            setProfileStats(freshStats);

            // Fetch live session history and merge with cached sessions
            const { data: sData } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', profile.id)
                .order('last_active', { ascending: false });

            if (sData && sData.length > 0) {
                const sessionMap = new Map();
                cachedSessions.forEach(s => sessionMap.set(s.id || s.last_active, s));
                sData.forEach(s => sessionMap.set(s.id || s.last_active, s));
                const merged = Array.from(sessionMap.values()).sort((a, b) => new Date(b.last_active) - new Date(a.last_active));
                setProfileSessions(merged);
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoadingProfileData(false);
        }
    };

    const handleDropdownAction = (action, profile) => {
        if (action === 'stripe') {
            if (profile.stripe_customer_id) {
                window.open(`https://dashboard.stripe.com/customers/${profile.stripe_customer_id}`, '_blank');
            } else {
                window.open(`https://dashboard.stripe.com/search?query=${encodeURIComponent(profile.email)}`, '_blank');
            }
        } else if (action === 'copyId') {
            navigator.clipboard.writeText(profile.id);
            showToast(translate('copied') || 'Copied!', 'success');
        } else if (action === 'notes') {
            setNotesTarget(profile);
            setEditingNotes(profile.admin_notes || '');
            setShowNotesModal(true);
        } else if (action === 'delete') {
            if (profile.id === '86177767-e1f2-4356-b98b-e43503cab0da') {
                return showToast(translate('admin_cannot_delete_self') || 'Cannot delete master admin account', 'error');
            }
            setUserToDelete(profile);
            setShowDeleteUserModal(true);
        }
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        const target = userToDelete;
        setIsDeletingUser(true);
        try {
            let success = false;

            // 1. Try invoking Edge Function admin-delete-user
            try {
                const { data, error } = await supabase.functions.invoke('admin-delete-user', {
                    body: { targetUserId: target.id }
                });
                if (!error && (data?.success || !data?.error)) {
                    success = true;
                }
            } catch (efErr) {
                console.warn('Edge function admin-delete-user failed:', efErr);
            }

            // 2. If Edge function didn't succeed, fallback to RPC function admin_delete_user
            if (!success) {
                try {
                    const { error: rpcError } = await supabase.rpc('admin_delete_user', {
                        target_user_id: target.id
                    });
                    if (!rpcError) {
                        success = true;
                    } else {
                        console.warn('RPC admin_delete_user failed:', rpcError);
                    }
                } catch (rpcErr) {
                    console.warn('RPC invoke exception:', rpcErr);
                }
            }

            // 3. Fallback: delete public records directly
            if (!success) {
                await Promise.allSettled([
                    supabase.from('transactions').delete().eq('user_id', target.id),
                    supabase.from('recurring_transactions').delete().eq('user_id', target.id),
                    supabase.from('budgets').delete().eq('user_id', target.id),
                    supabase.from('goals').delete().eq('user_id', target.id),
                    supabase.from('sessions').delete().eq('user_id', target.id),
                    supabase.from('feedback').delete().eq('user_id', target.id),
                    supabase.from('profiles').delete().eq('id', target.id)
                ]);
            }

            setProfiles(prev => prev.filter(p => p.id !== target.id));
            if (selectedProfile?.id === target.id) {
                setSelectedProfile(null);
            }

            showToast(translate('admin_user_deleted_success') || 'User deleted successfully', 'success');
            await fetchAllData();
        } catch (err) {
            console.error('Delete user error:', err);
            showToast((translate('admin_delete_user_error') || 'Error deleting user: ') + (err.message || ''), 'error');
        } finally {
            setIsDeletingUser(false);
            setShowDeleteUserModal(false);
            setUserToDelete(null);
        }
    };

    const addFeature = () => {
        setNewUpdate({ ...newUpdate, features: [...newUpdate.features, { icon: 'star', title_el: '', title_en: '', desc_el: '', desc_en: '', bg: 'bg-violet-50 dark:bg-violet-500/10', color: 'text-violet-500' }] });
    };
    const removeFeature = (index) => {
        const updated = [...newUpdate.features];
        updated.splice(index, 1);
        setNewUpdate({ ...newUpdate, features: updated });
    };
    const updateFeature = (index, field, value) => {
        const updated = [...newUpdate.features];
        updated[index][field] = value;
        setNewUpdate({ ...newUpdate, features: updated });
    };

    const handlePublishUpdate = async () => {
        if (!newUpdate.version) return showToast(translate('admin_version_required'), 'error');
        try {
            const { error } = await supabase.from('app_updates').insert([newUpdate]);
            if (error) throw error;
            showToast(translate('admin_update_published'), 'success');
            setShowUpdateModal(false);
            setNewUpdate(initialUpdateState);
            fetchAllData();
        } catch (e) {
            showToast(translate('admin_update_error') + e.message, 'error');
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            return showToast(translate('admin_broadcast_fill_fields'), 'error');
        }
        try {
            const { error } = await supabase.from('broadcasts').insert([{
                title: broadcastTitle.trim(),
                message: broadcastMessage.trim(),
                created_at: new Date().toISOString()
            }]);
            if (error) throw error;
            showToast(translate('admin_broadcast_success'), 'success');
            setBroadcastTitle('');
            setBroadcastMessage('');
        } catch (e) {
            showToast('Αποτυχία αποστολής: ' + e.message, 'error');
        }
    };

    // Real-time Sentry error listener
    useEffect(() => {
        const handleRecorded = (e) => {
            if (e.detail) {
                setSentryErrors(prev => [e.detail, ...prev.filter(item => item.id !== e.detail.id)]);
            }
        };
        const handleCleared = () => {
            setSentryErrors([]);
        };

        window.addEventListener('spendlore:sentry-error-recorded', handleRecorded);
        window.addEventListener('spendlore:sentry-error-cleared', handleCleared);

        return () => {
            window.removeEventListener('spendlore:sentry-error-recorded', handleRecorded);
            window.removeEventListener('spendlore:sentry-error-cleared', handleCleared);
        };
    }, []);

    const handleClearSentryErrors = async () => {
        await sentryLogger.clearErrors();
        setSentryErrors([]);
        showToast('All Sentry error logs cleared', 'success');
    };

    const handleTestSentryError = () => {
        logger.error(
            'Manual telemetry verification test from Admin Console',
            new Error('Sentry Telemetry Diagnostic Test (Code: 200)'),
            'AdminConsole',
            { testTriggeredBy: 'AdminUser', timestamp: new Date().toISOString() }
        );
        showToast('Test error captured and sent to Sentry', 'info');
    };

    const filteredFeedback = feedback.filter(f => {
        const matchesFilter = filter === 'all' || f.type === filter;
        const matchesSearch = (f.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const openTicketsCount = feedback.filter(f => (f.status || 'open') !== 'resolved').length;

    const tabs = [
        { id: 'overview', icon: LayoutDashboard, label: translate('admin_tab_overview') || 'Overview', badge: null },
        { id: 'users', icon: Users, label: translate('admin_tab_users') || 'Users', badge: profiles.length || null },
        { id: 'feedback', icon: LifeBuoy, label: translate('admin_tab_feedback') || 'Support & Tickets', badge: openTicketsCount > 0 ? `${openTicketsCount} ${translate('admin_open') || 'open'}` : null },
        { id: 'updates', icon: RefreshCw, label: translate('admin_tab_updates') || 'Updates', badge: updates.length || null },
        { id: 'broadcast', icon: Radio, label: translate('admin_tab_broadcast') || 'Broadcast', badge: 'Live' },
        { id: 'sentry', icon: ShieldAlert, label: translate('admin_tab_sentry') || 'Sentry Errors', badge: sentryErrors.length || null },
    ];

    /* ─── Content Renderer ─── */
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 text-center bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
                    <RefreshCw size={24} className="animate-spin text-violet-600 dark:text-violet-400 mb-3" />
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                        {translate('admin_loading') || 'Loading telemetry data...'}
                    </p>
                    <p className="text-xs text-gray-400 font-medium max-w-md">
                        {translate('admin_fetching_live_metrics') || 'Fetching live database metrics from Supabase'}
                    </p>
                </div>
            );
        }

        switch (activeSection) {
            case 'overview':
                return (
                    <AdminOverview
                        stats={stats}
                        metrics={metrics}
                        profiles={profiles}
                        sessions={sessions}
                        feedback={feedback}
                        sentryErrors={sentryErrors}
                        updates={updates}
                        openTicketsCount={openTicketsCount}
                        onNavigateUsers={() => setActiveSection('users')}
                        onNavigateTab={(tab) => {
                            setActiveSection(tab);
                            if (tab !== 'users') setSelectedProfile(null);
                        }}
                        onUserClick={handleProfileClick}
                        onSubClick={handleSubClick}
                        onDropdownAction={handleDropdownAction}
                        onRefresh={fetchAllData}
                        loading={loading}
                        translate={translate}
                    />
                );
            case 'users':
                return selectedProfile ? (
                    <AdminUserDetail
                        profile={selectedProfile}
                        profileStats={profileStats}
                        profileSessions={profileSessions}
                        loadingProfileData={loadingProfileData}
                        onBack={() => setSelectedProfile(null)}
                        onSubClick={handleSubClick}
                        onSaveNotes={handleSaveNotes}
                        onDeleteUser={(profile) => handleDropdownAction('delete', profile)}
                        isSavingNotes={isSavingNotes}
                        showToast={showToast}
                        translate={translate}
                    />
                ) : (
                    <AdminUsersList
                        profiles={profiles}
                        sessions={sessions}
                        onProfileClick={handleProfileClick}
                        onSubClick={handleSubClick}
                        onDropdownAction={handleDropdownAction}
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        translate={translate}
                    />
                );
            case 'feedback':
                return (
                    <AdminFeedback
                        feedback={feedback}
                        onDelete={handleDeleteClick}
                        onFeedbackUpdate={(id, updates) => {
                            setFeedback(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
                        }}
                        translate={translate}
                    />
                );
            case 'updates':
                return (
                    <AdminUpdates
                        updates={updates}
                        showUpdateModal={showUpdateModal}
                        setShowUpdateModal={setShowUpdateModal}
                        newUpdate={newUpdate}
                        setNewUpdate={setNewUpdate}
                        addFeature={addFeature}
                        removeFeature={removeFeature}
                        updateFeature={updateFeature}
                        onPublish={handlePublishUpdate}
                        onDelete={handleDeleteUpdateClick}
                        translate={translate}
                    />
                );
            case 'broadcast':
                return (
                    <AdminBroadcast
                        broadcastTitle={broadcastTitle}
                        setBroadcastTitle={setBroadcastTitle}
                        broadcastMessage={broadcastMessage}
                        setBroadcastMessage={setBroadcastMessage}
                        onSend={handleSendBroadcast}
                        translate={translate}
                    />
                );
            case 'sentry':
                return (
                    <AdminSentryErrors
                        errors={sentryErrors}
                        onClear={handleClearSentryErrors}
                        onRefresh={async () => {
                            const errs = await sentryLogger.fetchAllErrors();
                            setSentryErrors(errs || []);
                        }}
                        onTriggerTest={handleTestSentryError}
                        loading={loading}
                        translate={translate}
                    />
                );
            default:
                return null;
        }
    };

    /* ─── Layout ─── */
    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300 overflow-hidden">

            {/* ─────── Desktop Control & Breadcrumb Header ─────── */}
            {hideHeader ? (
                <div className="shrink-0 bg-white dark:bg-surface-dark2 border-b border-gray-100 dark:border-white/[0.06] px-6 py-3.5 flex items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-xs font-bold text-gray-700 dark:text-gray-200 active:scale-95 transition-all shadow-sm"
                        >
                            <ArrowLeft size={14} strokeWidth={2.5} />
                            <span>{translate('admin_back_to_app') || 'Back to App'}</span>
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <span>{translate('admin_console') || 'Admin Console'}</span>
                            <span className="text-gray-300 dark:text-white/20">/</span>
                            <span className="font-extrabold text-gray-900 dark:text-white capitalize">
                                {tabs.find(t => t.id === activeSection)?.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 border border-gray-200/80 dark:border-white/10 text-xs font-bold text-gray-800 dark:text-gray-200 active:scale-95 transition-all"
                            title={translate('admin_refresh') || 'Refresh Data'}
                        >
                            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                            <span>{loading ? (translate('admin_refreshing') || 'Refreshing...') : (translate('admin_refresh') || 'Refresh')}</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* ─────── Mobile Sticky Header ─────── */
                <ViewHeader
                    onBack={onBack}
                    title={translate('admin_dashboard_title') || 'Admin Panel'}
                    subtitle={translate('admin_operations_telemetry') || 'Operations & Telemetry'}
                    contentClassName="mb-3"
                    rightAction={
                        <button
                            type="button"
                            onClick={fetchAllData}
                            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 flex items-center justify-center border border-gray-200/60 dark:border-white/10 active:scale-95 transition-all"
                            aria-label="Refresh Data"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>
                    }
                >

                    {/* Mobile tabs row */}
                    <div className="relative">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-6">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeSection === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveSection(tab.id); if (tab.id !== 'users') setSelectedProfile(null); }}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                            ${isActive ? 'bg-gray-950 text-white font-bold shadow-xs dark:bg-white dark:text-gray-950' : 'bg-gray-200/60 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400'}`}
                                    >
                                        <Icon size={13} />
                                        <span>{tab.label}</span>
                                        {tab.badge && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </ViewHeader>
            )}

            {/* ─────── Desktop Layout: Sidebar + Content ─────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* Desktop Left Sidebar (hidden on mobile) */}
                <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-surface-dark2 border-r border-gray-200 dark:border-white/10 p-4 gap-2 overflow-y-auto">
                    <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <SlidersHorizontal size={12} />
                            <span>{translate('admin_operations_hub') || 'Operations Hub'}</span>
                        </p>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title={translate('admin_system_operational') || 'System Operational'} />
                    </div>

                    <div className="space-y-1">
                        {tabs.map(tab => (
                            <SidebarTab
                                key={tab.id}
                                tab={tab}
                                isActive={activeSection === tab.id}
                                onClick={() => { setActiveSection(tab.id); if (tab.id !== 'users') setSelectedProfile(null); }}
                            />
                        ))}
                    </div>

                    {/* Sync action at bottom of sidebar */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                        <button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-100/80 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-white/80 active:scale-[0.98] transition-all text-xs font-bold border border-gray-200/50 dark:border-white/5"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin text-violet-600' : 'text-gray-400'} />
                            <span>{loading ? (translate('admin_syncing_engine') || 'Syncing Engine...') : (translate('admin_sync_telemetry') || 'Sync Telemetry')}</span>
                        </button>
                    </div>
                </aside>

                {/* ─────── Main Content Scrollable Area ─────── */}
                <main ref={mainScrollRef} data-scroll-container="main" className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1680px] mx-auto pb-16">

                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight capitalize">
                                    {tabs.find(t => t.id === activeSection)?.label}
                                </h2>
                                {activeSection === 'users' && selectedProfile ? (
                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <button onClick={() => setSelectedProfile(null)} className="text-violet-600 dark:text-violet-400 hover:underline font-bold">
                                            {translate('admin_users_list') || 'Users List'}
                                        </button>
                                        <span>/</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                            {selectedProfile.display_name || selectedProfile.email?.split('@')[0]}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Section Content */}
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* ─────── Modals ─────── */}

            {/* Feedback Delete Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title={translate('delete_feedback_title')}
                message={translate('delete_feedback_msg')}
                confirmText={translate('delete')}
                type="danger"
            />

            {/* Subscription Modal */}
            <ConfirmationModal
                isOpen={showSubModal}
                onClose={() => setShowSubModal(false)}
                onConfirm={confirmSubscriptionChange}
                title={subTarget?.status === 'pro' ? translate('admin_grant_pro_title') : translate('admin_revoke_pro_title')}
                message={subTarget?.status === 'pro'
                    ? translate('admin_grant_pro_message', { email: subTarget?.profile?.email })
                    : translate('admin_revoke_pro_message', { email: subTarget?.profile?.email })
                }
                confirmText={subTarget?.status === 'pro' ? translate('admin_grant_pro_btn') : translate('admin_revoke_pro_btn')}
                type={subTarget?.status === 'pro' ? 'info' : 'danger'}
            />

            {/* Update Delete Modal */}
            <ConfirmationModal
                isOpen={showUpdateDeleteModal}
                onClose={() => setShowUpdateDeleteModal(false)}
                onConfirm={confirmDeleteUpdate}
                title={translate('admin_delete_update_confirm')}
                message={translate('admin_delete_update_message', { version: updateToDelete?.version })}
                confirmText={translate('delete')}
                type="danger"
            />

            {/* Delete User Modal */}
            <ConfirmationModal
                isOpen={showDeleteUserModal}
                onClose={() => { if (!isDeletingUser) { setShowDeleteUserModal(false); setUserToDelete(null); } }}
                onConfirm={confirmDeleteUser}
                title={translate('admin_delete_user_title') || 'Delete User Account'}
                message={
                    translate('admin_delete_user_message', { email: userToDelete?.email || 'this user' }) ||
                    `Are you sure you want to permanently delete account "${userToDelete?.email}"? All associated data, transactions, sessions, and authentication records will be erased.`
                }
                confirmText={isDeletingUser ? (translate('admin_deleting') || 'Deleting...') : (translate('admin_delete_user_btn') || 'Delete User')}
                type="danger"
            />

            {/* Notes Modal */}
            {typeof document !== 'undefined' && showNotesModal && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowNotesModal(false)} />
                    <div className="relative w-full max-w-lg bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-300 dark:border-white/10">
                        <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{translate('admin_notes')}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notesTarget?.email}</p>
                            </div>
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <textarea
                                value={editingNotes}
                                onChange={e => setEditingNotes(e.target.value)}
                                className="w-full p-3.5 bg-white dark:bg-surface-dark3 rounded-xl border border-gray-200 dark:border-white/10 text-sm min-h-[160px] focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all resize-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder={translate('admin_notes_placeholder') || 'Write internal notes about this account...'}
                            />
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowNotesModal(false)}
                                    className="flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm"
                                >
                                    {translate('cancel') || 'Cancel'}
                                </button>
                                <button
                                    onClick={handleSaveNotesModal}
                                    disabled={isSavingNotes}
                                    className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    {isSavingNotes ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {translate('save') || 'Save Notes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminView;
