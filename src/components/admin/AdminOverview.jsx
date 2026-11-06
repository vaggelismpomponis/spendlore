import React, { useState, useMemo } from 'react';
import {
    Users, RefreshCw, MessageSquare, Award, Activity, TrendingUp,
    Clock, Calendar, Smartphone, Monitor, Globe, ChevronRight, ArrowUpRight,
    Crown, Trophy, ArrowRight, ShieldCheck, CheckCircle2, LayoutDashboard,
    MoreVertical, ExternalLink, Mail, Copy, FileText, Trash2, ShieldAlert
} from 'lucide-react';

/* ─── Donut Chart (Enhanced SVG) ─── */
const DonutChart = ({ segments, size = 110, strokeWidth = 14 }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="currentColor"
                className="text-gray-100 dark:text-white/[0.06]"
                strokeWidth={strokeWidth}
            />
            {total > 0 && segments.map((seg, i) => {
                const dash = (seg.value / total) * circ;
                const gap = circ - dash;
                const el = (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
};

/* ─── KPI Bento Card ─── */
const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color,
    onClick,
    trend,
    badge
}) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs
                    flex flex-col justify-between transition-all duration-200 group
                    ${onClick ? 'cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/30' : ''}`}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon size={18} strokeWidth={2.2} className={`${color} shrink-0`} />
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">
                    {label}
                </span>
            </div>
            {badge && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-white/[0.06]">
                    {badge}
                </span>
            )}
            {onClick && !badge && (
                <ChevronRight size={14} className="text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
            )}
        </div>

        <div className="mt-4">
            <span className="block text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {value}
            </span>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                {trend !== undefined ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight size={12} strokeWidth={2.5} />
                        +{trend} this month
                    </span>
                ) : (
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                        {subtext || 'Telemetry active'}
                    </span>
                )}
                {onClick && (
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Inspect <ArrowRight size={10} />
                    </span>
                )}
            </div>
        </div>
    </div>
);

/* ─── Platform breakdown bar ─── */
const PlatformBar = ({ label, count, total, color, icon: Icon }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 dark:text-white">{count}</span>
                    <span className="text-[11px] text-gray-400 font-semibold">({pct}%)</span>
                </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

/* ─── Most Active Users Row ─── */
const UserLeaderboardRow = ({
    user,
    idx,
    onClick,
    onDropdownAction,
    onSubClick,
    translate = (k) => k,
    activeDropdown,
    setActiveDropdown
}) => {
    const rankColors = [
        'bg-amber-500 text-white',
        'bg-slate-400 text-white',
        'bg-amber-700 text-white',
        'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
    ];
    const rankColor = rankColors[idx] || rankColors[3];
    const isDropdownOpen = activeDropdown === user.id;

    return (
        <div
            onClick={() => onClick && onClick(user)}
            className={`flex items-center gap-3.5 p-3 sm:p-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer group relative last:rounded-b-2xl ${isDropdownOpen ? 'z-30' : 'z-0'}`}
        >
            {/* Rank badge */}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${rankColor}`}>
                #{idx + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {user.display_name || user.email?.split('@')[0]}
                    </p>
                    {user.subscription_status === 'pro' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-widest shrink-0 flex items-center gap-0.5">
                            <Crown size={8} /> PRO
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">{user.email}</p>
            </div>

            {/* Sessions count */}
            <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                    <Activity size={12} className="text-violet-500" />
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{user.sessionCount}</p>
                </div>
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">sessions</p>
            </div>

            {/* Actions: Grant/Revoke Pro + 3-dots Menu */}
            <div className="flex items-center gap-1 shrink-0">
                {onSubClick && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSubClick(user, user.subscription_status === 'pro' ? 'free' : 'pro');
                        }}
                        className={`hidden sm:block px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all border whitespace-nowrap active:scale-95
                            ${user.subscription_status === 'pro'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10 dark:text-rose-400'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:text-emerald-400'
                            }`}
                    >
                        {user.subscription_status === 'pro' ? (translate('admin_revoke_pro') || 'Revoke Pro') : (translate('admin_grant_pro') || 'Grant Pro')}
                    </button>
                )}

                {onDropdownAction && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(isDropdownOpen ? null : user.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
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
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(null);
                                    }}
                                />
                                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg z-50 overflow-hidden py-1.5 animate-fade-in text-left">
                                    {/* Mobile only: grant/revoke */}
                                    {onSubClick && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSubClick(user, user.subscription_status === 'pro' ? 'free' : 'pro');
                                                setActiveDropdown(null);
                                            }}
                                            className="sm:hidden w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                        >
                                            {user.subscription_status === 'pro' ? (
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
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDropdownAction('stripe', user);
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        <ExternalLink size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_view_on_stripe') || 'View on Stripe'}</span>
                                    </button>

                                    <a
                                        href={`mailto:${user.email}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        <Mail size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_send_email') || 'Send Email'}</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDropdownAction('copyId', user);
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium"
                                    >
                                        <Copy size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_copy_user_id') || 'Copy User ID'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDropdownAction('notes', user);
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium border-t border-gray-100 dark:border-white/5"
                                    >
                                        <FileText size={14} className="text-gray-400 shrink-0" />
                                        <span>{translate('admin_notes') || 'Notes'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDropdownAction('delete', user);
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors font-bold border-t border-gray-100 dark:border-white/5"
                                    >
                                        <Trash2 size={14} className="text-rose-500 shrink-0" />
                                        <span>{translate('admin_delete_user') || 'Delete User'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors shrink-0" />
            </div>
        </div>
    );
};

/* ─── Main AdminOverview Component ─── */
const AdminOverview = ({
    stats,
    metrics,
    profiles,
    sessions,
    onNavigateUsers,
    onUserClick,
    onDropdownAction,
    onSubClick,
    translate = (k) => k
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Platform breakdown from session data
    const platformCounts = useMemo(() => {
        const mobile = sessions.filter(s =>
            s.device && (s.device.includes('iPhone') || s.device.includes('Android') || s.device.includes('Mobile'))
        ).length;
        const desktop = sessions.filter(s =>
            s.device && (s.device.includes('Windows') || s.device.includes('Mac') || s.device.includes('Linux') ||
                s.device.includes('Desktop') || s.device.includes('Chrome') || s.device.includes('Firefox'))
        ).length;
        const other = sessions.length - mobile - desktop;
        return { mobile, desktop, other: Math.max(0, other) };
    }, [sessions]);

    // Users joined this month
    const joinedThisMonth = useMemo(() => {
        const now = new Date();
        return profiles.filter(p => {
            if (!p.created_at) return false;
            const d = new Date(p.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
    }, [profiles]);

    const proConversionRate = stats.users > 0 ? Math.round((metrics.proUsers / stats.users) * 100) : 0;
    const active7DaysRate = stats.users > 0 ? Math.round((metrics.active7Days / stats.users) * 100) : 0;
    const active30DaysRate = stats.users > 0 ? Math.round((metrics.active30Days / stats.users) * 100) : 0;
    const estimatedMrr = (metrics.proUsers * 2.99).toFixed(2);
    const avgTxPerUser = stats.users > 0 ? (stats.transactions / stats.users).toFixed(1) : '0';

    const subSegments = [
        { value: metrics.proUsers, color: '#8b5cf6' },
        { value: metrics.freeUsers, color: '#94a3b8' },
        { value: metrics.canceledUsers, color: '#f43f5e' },
    ];

    const totalPlatform = platformCounts.mobile + platformCounts.desktop + platformCounts.other;

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ─────── Executive Overview Hub Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard size={22} className="text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                Operations & Telemetry Overview
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Live user engagement, subscription conversion, ledger activity, and client distribution
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={onNavigateUsers}
                            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-xs"
                        >
                            <Users size={14} />
                            <span>View All Accounts</span>
                        </button>
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Total Accounts
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {stats.users}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                            Pro Conversion
                        </span>
                        <span className="block text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                            {proConversionRate}% ({metrics.proUsers})
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            Active (7 Days)
                        </span>
                        <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            {metrics.active7Days} ({active7DaysRate}%)
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            Client Sessions
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                            <span>{stats.activity}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Syncing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────── 4 Core KPI Bento Cards ─────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1106px]:grid-cols-4 gap-3.5">
                <StatCard
                    icon={Users}
                    label="Total User Base"
                    value={stats.users}
                    color="text-blue-500"
                    onClick={onNavigateUsers}
                    trend={joinedThisMonth > 0 ? joinedThisMonth : undefined}
                    badge={`${proConversionRate}% Pro`}
                />
                <StatCard
                    icon={RefreshCw}
                    label="Recorded Transactions"
                    value={stats.transactions}
                    subtext={`~${avgTxPerUser} entries / user`}
                    color="text-emerald-500"
                    badge="Ledger Live"
                />
                <StatCard
                    icon={MessageSquare}
                    label="User Feedback"
                    value={stats.feedback}
                    subtext="Community submissions"
                    color="text-amber-500"
                    badge={stats.feedback > 0 ? `${stats.feedback} Submissions` : 'Clean'}
                />
                <StatCard
                    icon={Activity}
                    label="Total App Sessions"
                    value={stats.activity}
                    subtext={`${metrics.active7Days} active in last 7d`}
                    color="text-violet-500"
                    badge="Heartbeat Online"
                />
            </div>

            {/* ─────── Mid Section: Subscription Split + Engagement + Platform ─────── */}
            <div className="grid grid-cols-1 min-[1106px]:grid-cols-2 min-[1408px]:grid-cols-3 gap-4">

                {/* Subscription Split Card */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.06] mb-4">
                            <div className="flex items-center gap-2">
                                <Crown size={17} className="text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={2.2} />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">Subscription Split</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Tier breakdown & estimated MRR</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/20">
                                ~€{estimatedMrr}/mo
                            </span>
                        </div>

                        <div className="flex items-center gap-5 my-2">
                            <div className="relative shrink-0">
                                <DonutChart segments={subSegments} size={100} strokeWidth={14} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{stats.users}</p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Users</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Pro Tier</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-extrabold text-violet-600 dark:text-violet-400">{metrics.proUsers}</span>
                                        <span className="text-[11px] text-gray-400 font-semibold ml-1">({proConversionRate}%)</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Free Tier</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-extrabold text-gray-900 dark:text-white">{metrics.freeUsers}</span>
                                        <span className="text-[11px] text-gray-400 font-semibold ml-1">({stats.users > 0 ? 100 - proConversionRate : 0}%)</span>
                                    </div>
                                </div>

                                {metrics.canceledUsers > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="font-bold text-gray-700 dark:text-gray-200">Canceled</span>
                                        </div>
                                        <span className="font-extrabold text-rose-600 dark:text-rose-400">{metrics.canceledUsers}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span>Conversion Rate</span>
                        <span className="font-extrabold text-violet-600 dark:text-violet-400">{proConversionRate}% of user base</span>
                    </div>
                </div>

                {/* User Engagement & Retention Card */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.06] mb-4">
                            <div className="flex items-center gap-2">
                                <Activity size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.2} />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">User Engagement</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Active retention telemetry</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                                Live
                            </span>
                        </div>

                        <div className="space-y-3">
                            {/* Last 7 Days */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Last 7 Days (WAU)</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{metrics.active7Days}</span>
                                        <span className="text-[10px] font-semibold text-gray-400">users</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-gray-200/70 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                        style={{ width: `${active7DaysRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                                    {active7DaysRate}% of registered user base
                                </p>
                            </div>

                            {/* Last 30 Days */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={13} className="text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Last 30 Days (MAU)</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">{metrics.active30Days}</span>
                                        <span className="text-[10px] font-semibold text-gray-400">users</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-gray-200/70 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                        style={{ width: `${active30DaysRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                                    {active30DaysRate}% of registered user base
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span>Stickiness (7d/30d)</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {metrics.active30Days > 0 ? Math.round((metrics.active7Days / metrics.active30Days) * 100) : 0}%
                        </span>
                    </div>
                </div>

                {/* Platform & Client Distribution Card */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.06] mb-4">
                            <div className="flex items-center gap-2">
                                <Globe size={17} className="text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2.2} />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">Platform Split</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Client OS & form factor telemetry</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                                {totalPlatform} Sessions
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            <PlatformBar
                                label="Mobile (iOS & Android)"
                                count={platformCounts.mobile}
                                total={totalPlatform}
                                color="bg-violet-600"
                                icon={Smartphone}
                            />
                            <PlatformBar
                                label="Desktop Web & PWA"
                                count={platformCounts.desktop}
                                total={totalPlatform}
                                color="bg-blue-600"
                                icon={Monitor}
                            />
                            {platformCounts.other > 0 && (
                                <PlatformBar
                                    label="Other Clients"
                                    count={platformCounts.other}
                                    total={totalPlatform}
                                    color="bg-gray-400"
                                    icon={Globe}
                                />
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Multi-client sync active
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{totalPlatform} recorded</span>
                    </div>
                </div>
            </div>

            {/* ─────── Most Active Users Leaderboard ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs relative">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-white/[0.06] rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                        <Trophy size={18} className="text-amber-500 shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">Most Active Accounts</h3>
                            <p className="text-[11px] text-gray-400 font-medium">Top user engagement leaderboard by app sessions</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onNavigateUsers}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-xs font-bold transition-all"
                    >
                        <span>View All Users</span>
                        <ArrowRight size={13} />
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {metrics.mostActiveUsers.length > 0 ? (
                        metrics.mostActiveUsers.map((user, idx) => (
                            <UserLeaderboardRow
                                key={user.id}
                                user={user}
                                idx={idx}
                                onClick={onUserClick}
                                onDropdownAction={onDropdownAction}
                                onSubClick={onSubClick}
                                translate={translate}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 rounded-b-2xl">
                            <Activity size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No session telemetry recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
