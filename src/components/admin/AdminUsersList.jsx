import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, MoreVertical, ExternalLink, Mail, Copy, FileText,
    Users, ArrowUpDown, Smartphone, Monitor, Globe, Clock, ShieldCheck, ShieldAlert,
    Download, Trash2
} from 'lucide-react';
import ProBadge from '../ProBadge';

/* ─── Utility ─── */
const getTimeAgo = (dateStr, translate = (k) => k) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 2) return translate('admin_just_now') || 'just now';
    if (mins < 60) return translate('admin_mins_ago', { mins }) || `${mins}m ago`;
    if (hours < 24) return translate('admin_hours_ago', { hours }) || `${hours}h ago`;
    if (days < 30) return translate('admin_days_ago', { days }) || `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/* ─── User Row Card ─── */
const UserRow = ({ profile, onProfileClick, onSubClick, onDropdownAction, activeDropdown, setActiveDropdown, translate = (k) => k, sessions }) => {
    const lastActive = profile.latest_session?.last_active;
    const sessionCount = sessions.filter(s => s.user_id === profile.id).length;
    const isOnline = lastActive && (Date.now() - new Date(lastActive).getTime()) < 15 * 60 * 1000; // 15min

    const deviceIcon = () => {
        const d = profile.latest_session?.device || '';
        if (d.includes('iPhone') || d.includes('Android') || d.includes('Mobile')) return <Smartphone size={11} />;
        if (d.includes('Windows') || d.includes('Mac') || d.includes('Linux')) return <Monitor size={11} />;
        return <Globe size={11} />;
    };

    const isDropdownOpen = activeDropdown === profile.id;

    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setActiveDropdown(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDropdownOpen, setActiveDropdown]);

    return (
        <div
            onClick={() => onProfileClick(profile)}
            className={`group relative bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs
                       hover:border-violet-300 dark:hover:border-violet-500/30 transition-all cursor-pointer
                       ${isDropdownOpen ? 'z-30' : 'z-0'}`}
        >
            <div className="flex items-center gap-3.5 p-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {isOnline && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Online" />
                        )}
                        <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {profile.display_name || profile.latest_session?.display_name || profile.email?.split('@')[0]}
                        </p>
                        {profile.subscription_status === 'pro' && (
                            <ProBadge />
                        )}
                        {profile.subscription_status === 'canceled' && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 uppercase tracking-widest shrink-0">
                                {translate('admin_canceled') || 'Canceled'}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {profile.created_at && (
                            <span className="text-[10px] text-gray-400 font-medium">{translate('admin_joined') || 'Joined'} {formatDate(profile.created_at)}</span>
                        )}
                        {lastActive && (
                            <>
                                <span className="text-gray-300 dark:text-white/10">·</span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                    <Clock size={10} />
                                    <span>{getTimeAgo(lastActive, translate)}</span>
                                </div>
                            </>
                        )}
                        {profile.latest_session?.device && (
                            <>
                                <span className="text-gray-300 dark:text-white/10">·</span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    {deviceIcon()}
                                    <span className="truncate max-w-[120px]">{profile.latest_session.device}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="shrink-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {/* Activity Badges: Transactions & Sessions */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        {profile.stats?.transactions > 0 && (
                            <div className="flex flex-col items-center px-2 py-1 bg-violet-50/80 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 rounded-xl" title="Total logged ledger transactions">
                                <span className="text-xs font-black text-violet-700 dark:text-violet-300 leading-tight">{profile.stats.transactions}</span>
                                <span className="text-[8px] uppercase font-bold text-violet-500/80 tracking-wider">{translate('admin_txs_count') || 'txs'}</span>
                            </div>
                        )}
                        {sessionCount > 0 && (
                            <div className="flex flex-col items-center px-2.5 py-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] rounded-xl">
                                <span className="text-xs font-black text-gray-900 dark:text-white leading-tight">{sessionCount}</span>
                                <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">{translate('admin_session_count') || 'sess.'}</span>
                            </div>
                        )}
                    </div>

                    {/* Grant/Revoke */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSubClick(profile, profile.subscription_status === 'pro' ? 'free' : 'pro'); }}
                        className={`hidden sm:block px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border whitespace-nowrap active:scale-95
                            ${profile.subscription_status === 'pro'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10 dark:text-rose-400'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:text-emerald-400'
                            }`}
                    >
                        {profile.subscription_status === 'pro' ? translate('admin_revoke_pro') : translate('admin_grant_pro')}
                    </button>

                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(isDropdownOpen ? null : profile.id); }}
                            className={`p-2 rounded-xl transition-all ${
                                isDropdownOpen
                                    ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400'
                            }`}
                            aria-label="User actions"
                        >
                            <MoreVertical size={16} />
                        </button>
                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg z-50 overflow-hidden py-1.5 animate-fade-in">
                                    {/* Mobile only: grant/revoke */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onSubClick(profile, profile.subscription_status === 'pro' ? 'free' : 'pro'); setActiveDropdown(null); }}
                                        className="sm:hidden w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        {profile.subscription_status === 'pro' ? (
                                            <>
                                                <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                                                <span>{translate('admin_revoke_pro') || 'Revoke Pro'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                                                <span>{translate('admin_grant_pro') || 'Grant Pro'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('stripe', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        <ExternalLink size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_view_on_stripe')}</span>
                                    </button>
                                    <a
                                        href={`mailto:${profile.email}`}
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        <Mail size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_send_email')}</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('copyId', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        <Copy size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_copy_user_id')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('notes', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium border-t border-gray-100 dark:border-white/5"
                                    >
                                        <FileText size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_notes')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('delete', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors font-bold border-t border-gray-100 dark:border-white/5"
                                    >
                                        <Trash2 size={14} className="text-rose-500 shrink-0" />
                                        <span>{translate('admin_delete_user') || 'Delete User'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};

/* ─── Main AdminUsersList Component ─── */
const AdminUsersList = ({
    profiles = [],
    sessions = [],
    onProfileClick,
    onSubClick,
    onDropdownAction,
    activeDropdown,
    setActiveDropdown,
    translate = (k) => k
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('joined'); // 'joined' | 'active' | 'name' | 'sessions'
    const [sortDir, setSortDir] = useState('desc');

    const sessionCountMap = useMemo(() => {
        return sessions.reduce((acc, s) => {
            acc[s.user_id] = (acc[s.user_id] || 0) + 1;
            return acc;
        }, {});
    }, [sessions]);

    const proCount = useMemo(() => profiles.filter(p => p.subscription_status === 'pro').length, [profiles]);
    const freeCount = useMemo(() => profiles.filter(p => p.subscription_status === 'free').length, [profiles]);

    const sevenDaysAgo = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), []);
    const active7Count = useMemo(() => {
        return profiles.filter(p => {
            const last = p.latest_session?.last_active;
            return last && new Date(last) >= sevenDaysAgo;
        }).length;
    }, [profiles, sevenDaysAgo]);

    const handleExportUsers = () => {
        try {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `spendlore-users-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } catch (e) {
            console.error('Export users error:', e);
        }
    };

    const filtered = useMemo(() => {
        let list = profiles.filter(p => {
            const matchFilter = filter === 'all' || p.subscription_status === filter;
            const q = searchTerm.toLowerCase();
            const matchSearch = !q ||
                (p.email || '').toLowerCase().includes(q) ||
                (p.display_name || '').toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });

        list = [...list].sort((a, b) => {
            let va, vb;
            if (sortBy === 'name') {
                va = (a.display_name || a.email || '').toLowerCase();
                vb = (b.display_name || b.email || '').toLowerCase();
            } else if (sortBy === 'active') {
                va = new Date(a.latest_session?.last_active || 0).getTime();
                vb = new Date(b.latest_session?.last_active || 0).getTime();
            } else if (sortBy === 'sessions') {
                va = sessionCountMap[a.id] || 0;
                vb = sessionCountMap[b.id] || 0;
            } else {
                va = new Date(a.created_at || 0).getTime();
                vb = new Date(b.created_at || 0).getTime();
            }
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });

        return list;
    }, [profiles, sessions, filter, searchTerm, sortBy, sortDir, sessionCountMap]);

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const SortBtn = ({ col, label }) => (
        <button
            type="button"
            onClick={() => toggleSort(col)}
            className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${
                sortBy === col
                    ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
            <span>{label}</span>
            <ArrowUpDown size={10} className={sortBy === col ? 'opacity-100' : 'opacity-40'} />
        </button>
    );

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ─────── Executive Users Hub Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <Users size={22} className="text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                {translate('admin_users_hub_title') || 'User Accounts & Subscriptions'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {translate('admin_users_hub_subtitle') || 'Directory of registered accounts, subscription tiers, and session activity'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {profiles.length > 0 && (
                            <button
                                type="button"
                                onClick={handleExportUsers}
                                className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
                                title={translate('admin_export_directory') || 'Export Directory'}
                            >
                                <Download size={14} />
                                <span>{translate('admin_export_directory') || 'Export Directory'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {translate('admin_total_accounts') || 'Total Accounts'}
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {profiles.length}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                            {translate('admin_pro_subscribers') || 'Pro Subscribers'}
                        </span>
                        <span className="block text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                            {proCount}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {translate('admin_free_accounts') || 'Free Accounts'}
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {freeCount}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            {translate('admin_active_7d') || 'Active (7 Days)'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            <span>{active7Count}</span>
                            <span className="text-xs font-bold text-gray-400">{translate('admin_tab_users') || 'Users'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────── Search & Action Controls Toolbar ─────── */}
            <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={translate('admin_search_users_placeholder') || 'Search users by name or email…'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
                    {/* Subscription Filter Pills */}
                    <div className="flex bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl gap-1">
                        {[
                            { key: 'all', label: `${translate('admin_all') || 'All'} (${profiles.length})` },
                            { key: 'pro', label: `Pro (${proCount})` },
                            { key: 'free', label: `${translate('admin_free_tier') || 'Free'} (${freeCount})` }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setFilter(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    filter === tab.key
                                        ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort Options */}
                    <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl">
                        <SortBtn col="joined" label={translate('admin_sort_joined') || 'Joined'} />
                        <SortBtn col="active" label={translate('admin_sort_active') || 'Active'} />
                        <SortBtn col="sessions" label={translate('admin_sort_sessions') || 'Sessions'} />
                        <SortBtn col="name" label={translate('admin_sort_name') || 'Name'} />
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-1 text-xs text-gray-400">
                <span className="font-medium">
                    {translate('admin_showing_accounts', { count: filtered.length }) || `Showing ${filtered.length} accounts`}
                </span>
            </div>

            {/* User List */}
            {filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
                        <Users size={16} />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                        {translate('admin_no_users')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {translate('admin_no_users_match') || 'No registered accounts match your current filter and search query.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map(profile => (
                        <UserRow
                            key={profile.id}
                            profile={profile}
                            sessions={sessions}
                            onProfileClick={onProfileClick}
                            onSubClick={onSubClick}
                            onDropdownAction={onDropdownAction}
                            activeDropdown={activeDropdown}
                            setActiveDropdown={setActiveDropdown}
                            translate={translate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminUsersList;
