import React, { useState, useMemo } from 'react';
import {
    Users, RefreshCw, MessageSquare, Activity, TrendingUp,
    Clock, Calendar, Smartphone, Monitor, Globe, ChevronRight, ArrowUpRight,
    ArrowRight, ShieldCheck, CheckCircle2, LayoutDashboard,
    MoreVertical, ExternalLink, Mail, Copy, FileText, Trash2, ShieldAlert,
    LifeBuoy, Radio, CreditCard, Sparkles, AlertCircle, Check
} from 'lucide-react';
import ProBadge from '../ProBadge';

/* ─── Donut Chart (SVG) ─── */
const DonutChart = ({ segments, size = 110, strokeWidth = 14 }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    const visibleSegments = segments.filter(seg => seg.value > 0);
    const total = visibleSegments.reduce((s, seg) => s + seg.value, 0);
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
            {total > 0 && visibleSegments.map((seg, i) => {
                const dash = (seg.value / total) * circ;
                const gap = circ - dash;
                const el = (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.colorClass ? 'currentColor' : seg.color}
                        className={seg.colorClass || undefined}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
};

const resolveTranslation = (translateFn, key, fallback, params) => {
    if (typeof translateFn === 'function') {
        const val = translateFn(key, params);
        if (val && val !== key) return val;
    }
    return fallback !== undefined ? fallback : key;
};

/* ─── Executive Stat Bento Card ─── */
const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color = 'text-gray-900 dark:text-white',
    onClick,
    trend,
    badge,
    translate = (k) => k
}) => {
    const t = (k, fb, p) => resolveTranslation(translate, k, fb, p);
    return (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs
                    flex flex-col justify-between transition-all duration-200 group
                    ${onClick ? 'cursor-pointer hover:border-gray-400 dark:hover:border-white/20 active:scale-[0.99]' : ''}`}
    >
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <Icon size={16} strokeWidth={2.2} className={`${color} shrink-0`} />
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">
                    {label}
                </span>
            </div>
            {badge && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-white/[0.08] shrink-0">
                    {badge}
                </span>
            )}
        </div>

        <div className="mt-4">
            <span className="block text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight tabular-nums">
                {value}
            </span>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                {trend !== undefined ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight size={12} strokeWidth={2.5} />
                        +{trend} {t('admin_this_month', 'this month')}
                    </span>
                ) : (
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate">
                        {subtext || t('admin_telemetry_active', 'Telemetry active')}
                    </span>
                )}
                {onClick && (
                    <span className="text-[10px] font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                        {t('admin_inspect', 'Inspect')} <ArrowRight size={10} />
                    </span>
                )}
            </div>
        </div>
    </div>
    );
};

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
                <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-extrabold text-gray-900 dark:text-white">{count}</span>
                    <span className="text-[11px] text-gray-400 font-semibold">({pct}%)</span>
                </div>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
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
    const t = (k, fb, p) => resolveTranslation(translate, k, fb, p);
    const rankColor = idx === 0
        ? 'text-gray-900 dark:text-white'
        : idx < 3
            ? 'text-gray-600 dark:text-gray-300'
            : 'text-gray-400 dark:text-gray-500';
    const isDropdownOpen = activeDropdown === user.id;

    return (
        <div
            onClick={() => onClick && onClick(user)}
            className={`flex items-center gap-3.5 p-3 sm:p-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer group relative last:rounded-b-2xl ${isDropdownOpen ? 'z-30' : 'z-0'}`}
        >
            {/* Rank indicator */}
            <span className={`w-6 text-xs font-black tabular-nums tracking-wider text-center shrink-0 select-none ${rankColor}`}>
                {String(idx + 1).padStart(2, '0')}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        {user.display_name || user.email?.split('@')[0]}
                    </p>
                    {user.subscription_status === 'pro' && (
                        <ProBadge />
                    )}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">{user.email}</p>
            </div>

            {/* Sessions count */}
            <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end tabular-nums">
                    <Activity size={12} className="text-gray-500 dark:text-gray-400" />
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{user.sessionCount}</p>
                </div>
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{t('admin_sessions', 'sessions')}</p>
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
                        {user.subscription_status === 'pro' ? t('admin_revoke_pro', 'Revoke Pro') : t('admin_grant_pro', 'Grant Pro')}
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
                                    ? 'bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white'
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200'
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
                                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in text-left">
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
                                                    <span>{t('admin_revoke_pro', 'Revoke Pro')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                                                    <span>{t('admin_grant_pro', 'Grant Pro')}</span>
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
                                        <span>{t('admin_view_on_stripe', 'View on Stripe')}</span>
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
                                        <span>{t('admin_send_email', 'Send Email')}</span>
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
                                        <span>{t('admin_copy_user_id', 'Copy User ID')}</span>
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
                                        <span>{t('admin_notes', 'Notes')}</span>
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
                                        <span>{t('admin_delete_user', 'Delete User')}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors shrink-0" />
            </div>
        </div>
    );
};

/* ─── Main AdminOverview Component ─── */
const AdminOverview = ({
    stats = { users: 0, transactions: 0, feedback: 0, activity: 0 },
    metrics = { proUsers: 0, freeUsers: 0, canceledUsers: 0, active7Days: 0, active30Days: 0, mostActiveUsers: [] },
    profiles = [],
    sessions = [],
    feedback = [],
    sentryErrors = [],
    updates = [],
    openTicketsCount = 0,
    onNavigateUsers,
    onNavigateTab,
    onUserClick,
    onDropdownAction,
    onSubClick,
    onRefresh,
    loading = false,
    translate = (k) => k
}) => {
    const t = (k, fb, p) => resolveTranslation(translate, k, fb, p);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Platform breakdown from session data
    const platformCounts = useMemo(() => {
        const mobile = (sessions || []).filter(s =>
            s.device && (s.device.includes('iPhone') || s.device.includes('Android') || s.device.includes('Mobile'))
        ).length;
        const desktop = (sessions || []).filter(s =>
            s.device && (s.device.includes('Windows') || s.device.includes('Mac') || s.device.includes('Linux') ||
                s.device.includes('Desktop') || s.device.includes('Chrome') || s.device.includes('Firefox'))
        ).length;
        const other = (sessions || []).length - mobile - desktop;
        return { mobile, desktop, other: Math.max(0, other) };
    }, [sessions]);

    // Users joined this month
    const joinedThisMonth = useMemo(() => {
        const now = new Date();
        return (profiles || []).filter(p => {
            if (!p.created_at) return false;
            const d = new Date(p.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
    }, [profiles]);

    const proConversionRate = stats.users > 0 ? Math.round((metrics.proUsers / stats.users) * 100) : 0;
    const active7DaysRate = stats.users > 0 ? Math.round((metrics.active7Days / stats.users) * 100) : 0;
    const active30DaysRate = stats.users > 0 ? Math.round((metrics.active30Days / stats.users) * 100) : 0;
    const estimatedMrr = (metrics.proUsers * 2.99).toFixed(2);
    const estimatedArr = (metrics.proUsers * 2.99 * 12).toFixed(2);
    const avgTxPerUser = stats.users > 0 ? (stats.transactions / stats.users).toFixed(1) : '0';
    const stickiness = metrics.active30Days > 0 ? Math.round((metrics.active7Days / metrics.active30Days) * 100) : 0;

    const subSegments = [
        { value: metrics.proUsers, color: '#0284c7', colorClass: 'text-sky-600 dark:text-sky-500' },
        { value: metrics.freeUsers, color: '#e2e8f0', colorClass: 'text-slate-200 dark:text-slate-700' },
        { value: metrics.canceledUsers, color: '#f43f5e', colorClass: 'text-rose-500 dark:text-rose-400' },
    ];

    const totalPlatform = platformCounts.mobile + platformCounts.desktop + platformCounts.other;

    // Latest unresolved feedback tickets for the quick queue
    const recentOpenFeedback = useMemo(() => {
        return (feedback || [])
            .filter(f => (f.status || 'open') !== 'resolved')
            .slice(0, 3);
    }, [feedback]);

    return (
        <div className="space-y-6 animate-fade-in">

            {/* ─────── Executive Command Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                {t('admin_enterprise_telemetry', 'Enterprise Telemetry • Supabase Live Engine')}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
                            {t('admin_overview_title', 'Operations & Telemetry Overview')}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                            {t('admin_overview_subtitle', 'Live user engagement, subscription conversion, ledger activity, and client distribution')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        <button
                            type="button"
                            onClick={onNavigateUsers}
                            className="px-3.5 py-2 rounded-xl bg-gray-950 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-xs"
                        >
                            <Users size={14} />
                            <span>{t('admin_view_all_accounts', 'View All Accounts')}</span>
                        </button>

                        {onRefresh && (
                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={loading}
                                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all border border-gray-200 dark:border-white/10"
                                title={t('admin_refresh', 'Refresh')}
                            >
                                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                                <span>{loading ? t('admin_refreshing', 'Refreshing...') : t('admin_refresh', 'Refresh')}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] min-w-0 overflow-hidden">
                        <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {t('admin_total_accounts', 'Total Accounts')}
                        </span>
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-1">
                            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                                {stats.users}
                            </span>
                            {joinedThisMonth > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight whitespace-nowrap">
                                    +{joinedThisMonth} {t('admin_this_month', 'mo')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] min-w-0 overflow-hidden">
                        <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {t('admin_pro_conversion', 'Pro Conversion')}
                        </span>
                        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 mt-1">
                            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                                {proConversionRate}%
                            </span>
                            <span className="text-xs font-bold text-gray-400">
                                ({metrics.proUsers})
                            </span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] min-w-0 overflow-hidden">
                        <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {t('admin_active_7d', 'Active (7 Days)')}
                        </span>
                        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 mt-1">
                            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {metrics.active7Days}
                            </span>
                            <span className="text-xs font-bold text-gray-400">
                                ({active7DaysRate}%)
                            </span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] min-w-0 overflow-hidden">
                        <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {t('admin_client_sessions', 'Client Sessions')}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1">
                            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                                {stats.activity}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-200/60 dark:bg-white/10 px-1.5 py-0.5 rounded max-w-full truncate">
                                {t('admin_syncing', 'Syncing')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────── 4 Core Enterprise KPI Bento Cards ─────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label={t('admin_total_user_base', 'Total User Base')}
                    value={stats.users}
                    color="text-gray-900 dark:text-white"
                    onClick={onNavigateUsers}
                    trend={joinedThisMonth > 0 ? joinedThisMonth : undefined}
                    badge={`${proConversionRate}% Pro`}
                    translate={translate}
                />
                <StatCard
                    icon={RefreshCw}
                    label={t('admin_recorded_transactions', 'Recorded Transactions')}
                    value={stats.transactions.toLocaleString()}
                    subtext={`~${avgTxPerUser} ${t('admin_entries_per_user', 'entries / user')}`}
                    color="text-gray-900 dark:text-white"
                    badge={t('admin_ledger_live', 'Ledger Live')}
                    translate={translate}
                />
                <StatCard
                    icon={LifeBuoy}
                    label={t('admin_user_feedback', 'User Feedback')}
                    value={stats.feedback}
                    subtext={t('admin_feedback_subtext', 'Community & support tickets')}
                    color="text-gray-900 dark:text-white"
                    onClick={onNavigateTab ? () => onNavigateTab('feedback') : undefined}
                    badge={openTicketsCount > 0 ? `${openTicketsCount} ${t('admin_open', 'Open')}` : t('admin_clean', 'Clean')}
                    translate={translate}
                />
                <StatCard
                    icon={Activity}
                    label={t('admin_total_app_sessions', 'Total App Sessions')}
                    value={stats.activity}
                    subtext={`${metrics.active7Days} ${t('admin_active_in_last_7d', 'active in last 7d')}`}
                    color="text-gray-900 dark:text-white"
                    badge={t('admin_heartbeat_online', 'Heartbeat Online')}
                    translate={translate}
                />
            </div>

            {/* ─────── Fast Operations Shortcuts Bar ─────── */}
            {onNavigateTab && (
                <div className="bg-white dark:bg-surface-dark2 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1 shrink-0">
                        {t('admin_operational_hub_label', 'Operational Hub:')}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onNavigateTab('users')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
                        >
                            <Users size={13} />
                            <span>{t('admin_tab_users', 'Accounts')} ({stats.users})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigateTab('feedback')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
                        >
                            <LifeBuoy size={13} className={openTicketsCount > 0 ? 'text-amber-500' : 'text-gray-400'} />
                            <span>{t('admin_support_desk', 'Support Desk')} ({openTicketsCount} {t('admin_open', 'Open')})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigateTab('updates')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
                        >
                            <RefreshCw size={13} />
                            <span>{t('admin_app_releases', 'App Releases')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigateTab('broadcast')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
                        >
                            <Radio size={13} />
                            <span>{t('admin_broadcast', 'Broadcast')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigateTab('sentry')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
                        >
                            <ShieldAlert size={13} className={sentryErrors.length > 0 ? 'text-rose-500' : 'text-gray-400'} />
                            <span>{t('admin_sentry_logs', 'Sentry Logs')} ({sentryErrors.length})</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ─────── Mid Section: Subscription Split + Engagement + Platform ─────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {/* 1. Subscription Split Card */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.06] mb-4">
                            <div className="flex items-center gap-2">
                                <CreditCard size={17} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{t('admin_subscription_split', 'Subscription Split')}</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">{t('admin_tier_breakdown_mrr', 'Tier breakdown & estimated MRR')}</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 tabular-nums">
                                ~€{estimatedMrr}/mo
                            </span>
                        </div>

                        <div className="flex items-center gap-5 my-2">
                            <div className="relative shrink-0">
                                <DonutChart segments={subSegments} size={100} strokeWidth={14} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none tabular-nums">{stats.users}</p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t('admin_tab_users', 'Users')}</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-sky-600 dark:bg-sky-500" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{t('admin_pro_tier', 'Pro Tier')}</span>
                                    </div>
                                    <div className="text-right tabular-nums">
                                        <span className="font-extrabold text-sky-600 dark:text-sky-400">{metrics.proUsers}</span>
                                        <span className="text-[11px] text-gray-400 font-semibold ml-1">({proConversionRate}%)</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300/80 dark:border-slate-600" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{t('admin_free_tier', 'Free Tier')}</span>
                                    </div>
                                    <div className="text-right tabular-nums">
                                        <span className="font-extrabold text-gray-900 dark:text-white">{metrics.freeUsers}</span>
                                        <span className="text-[11px] text-gray-400 font-semibold ml-1">({stats.users > 0 ? 100 - proConversionRate : 0}%)</span>
                                    </div>
                                </div>

                                {metrics.canceledUsers > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{t('admin_canceled', 'Canceled')}</span>
                                        </div>
                                        <span className="font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">{metrics.canceledUsers}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span>{t('admin_arr_label', 'Annualized Run-Rate (ARR)')}</span>
                        <span className="font-extrabold text-gray-900 dark:text-white tabular-nums">€{estimatedArr}</span>
                    </div>
                </div>

                {/* 2. User Engagement & Retention Card */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.06] mb-4">
                            <div className="flex items-center gap-2">
                                <Activity size={17} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{t('admin_user_engagement', 'User Engagement')}</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">{t('admin_active_retention_telemetry', 'Active retention telemetry')}</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
                                Live
                            </span>
                        </div>

                        <div className="space-y-3">
                            {/* Last 7 Days */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-gray-600 dark:text-gray-400" />
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('admin_last_7_days_wau', 'Last 7 Days (WAU)')}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 tabular-nums">
                                        <span className="text-base font-extrabold text-gray-900 dark:text-white">{metrics.active7Days}</span>
                                        <span className="text-[10px] font-semibold text-gray-400">{t('admin_tab_users', 'users').toLowerCase()}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-gray-200/70 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                        style={{ width: `${active7DaysRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                                    {active7DaysRate}% {t('admin_registered_user_base_pct', 'of registered user base')}
                                </p>
                            </div>

                            {/* Last 30 Days */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={13} className="text-gray-600 dark:text-gray-400" />
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('admin_last_30_days_mau', 'Last 30 Days (MAU)')}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 tabular-nums">
                                        <span className="text-base font-extrabold text-gray-900 dark:text-white">{metrics.active30Days}</span>
                                        <span className="text-[10px] font-semibold text-gray-400">{t('admin_tab_users', 'users').toLowerCase()}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-gray-200/70 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gray-800 dark:bg-white rounded-full transition-all duration-700"
                                        style={{ width: `${active30DaysRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                                    {active30DaysRate}% {t('admin_registered_user_base_pct', 'of registered user base')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span>{t('admin_stickiness', 'Stickiness (7d/30d)')}</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {stickiness}%
                        </span>
                    </div>
                </div>

                {/* 3. Platform & Client Distribution Card */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.06] mb-4">
                            <div className="flex items-center gap-2">
                                <Globe size={17} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{t('admin_platform_split', 'Platform Split')}</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">{t('admin_client_os_telemetry', 'Client OS & form factor telemetry')}</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-white/10 tabular-nums">
                                {totalPlatform} {t('admin_sessions', 'Sessions')}
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            <PlatformBar
                                label={t('admin_mobile_clients', 'Mobile (iOS & Android Native)')}
                                count={platformCounts.mobile}
                                total={totalPlatform}
                                color="bg-gray-900 dark:bg-white"
                                icon={Smartphone}
                            />
                            <PlatformBar
                                label={t('admin_desktop_clients', 'Desktop Web & PWA')}
                                count={platformCounts.desktop}
                                total={totalPlatform}
                                color="bg-emerald-500"
                                icon={Monitor}
                            />
                            {platformCounts.other > 0 && (
                                <PlatformBar
                                    label={t('admin_other_clients', 'Other Clients')}
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
                            {t('admin_multiclient_sync_active', 'Multi-client sync active')}
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-300 tabular-nums">{totalPlatform} {t('admin_recorded', 'recorded')}</span>
                    </div>
                </div>
            </div>

            {/* ─────── Operational Activity & Health Hub ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Left (7 cols): Most Active Accounts Leaderboard */}
                <div className="lg:col-span-7 bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs relative flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-100 dark:border-white/[0.06] rounded-t-2xl">
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{t('admin_most_active_accounts', 'Most Active Accounts')}</h3>
                                <p className="text-[11px] text-gray-400 font-medium">{t('admin_most_active_sub', 'Top user engagement leaderboard by app sessions')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onNavigateUsers}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/15 text-xs font-bold transition-all border border-gray-200/60 dark:border-white/10"
                            >
                                <span>{t('admin_view_all_users', 'View All Users')}</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {metrics.mostActiveUsers && metrics.mostActiveUsers.length > 0 ? (
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
                                <div className="text-center py-12 rounded-b-2xl">
                                    <Activity size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('admin_no_session_telemetry', 'No session telemetry recorded yet')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-3.5 bg-gray-50/70 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05] rounded-b-2xl flex items-center justify-between text-xs text-gray-400">
                        <span>{t('admin_realtime_telemetry_updated', 'Telemetry updated in real time')}</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                            {metrics.mostActiveUsers?.length || 0} {t('admin_top_accounts', 'top accounts')}
                        </span>
                    </div>
                </div>

                {/* Right (5 cols): Operational Health & Pending Queue */}
                <div className="lg:col-span-5 space-y-5">

                    {/* Support & Tickets Snapshot */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06] mb-3.5">
                            <div className="flex items-center gap-2">
                                <LifeBuoy size={16} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                    {t('admin_support_ticketing_queue', 'Support & Ticketing Queue')}
                                </h3>
                            </div>
                            {onNavigateTab && (
                                <button
                                    type="button"
                                    onClick={() => onNavigateTab('feedback')}
                                    className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {t('admin_open_desk', 'Open Desk')} &rarr;
                                </button>
                            )}
                        </div>

                        {recentOpenFeedback.length > 0 ? (
                            <div className="space-y-2.5">
                                {recentOpenFeedback.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={onNavigateTab ? () => onNavigateTab('feedback') : undefined}
                                        className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                                                {ticket.email || t('admin_anonymous_user', 'Anonymous User')}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                                                {ticket.priority || t('admin_open', 'open').toLowerCase()}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {ticket.message || t('admin_no_description_provided', 'No description provided')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{t('admin_all_caught_up', 'All caught up!')}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{t('admin_no_open_tickets', 'No open support tickets requiring urgent attention.')}</p>
                            </div>
                        )}
                    </div>

                    {/* Infrastructure & Sentry Health */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                    {t('admin_system_telemetry', 'System Telemetry')}
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                99.98% {t('admin_health_label', 'HEALTH')}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">{t('admin_database_engine', 'Database Engine')}</span>
                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {t('admin_supabase_eu_west', 'Supabase Postgres (EU West)')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">{t('admin_inapp_updates', 'In-App Updates')}</span>
                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {t('admin_google_play_flexible', 'Google Play Flexible Live')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">{t('admin_sentry_crash_telemetry', 'Sentry Crash Telemetry')}</span>
                                <span className={`font-bold flex items-center gap-1.5 ${sentryErrors.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${sentryErrors.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    {sentryErrors.length > 0 ? `${sentryErrors.length} ${t('admin_exceptions', 'Exceptions')}` : (t('admin_errors_logged', 'Errors Logged') ? `0 ${t('admin_errors_logged', 'Errors Logged')}` : '0 Errors Logged')}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default AdminOverview;
