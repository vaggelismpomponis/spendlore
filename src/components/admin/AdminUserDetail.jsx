import React, { useState } from 'react';
import {
    ChevronLeft, RefreshCw, Activity, Shield, FileText, ExternalLink, Mail,
    Copy, Smartphone, Monitor, Radio, MapPin, Clock, Calendar, User,
    TrendingUp, Target, CreditCard, CheckCircle2, Crown, Globe, Trash2
} from 'lucide-react';

/* ─── Utility ─── */
const timeAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

/* ─── Mini Stat Badge ─── */
const StatBadge = ({ icon: Icon, label, value, color, loading }) => (
    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
        <div>
            <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {label}
            </span>
            <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                {loading ? <span className="animate-pulse text-gray-300 dark:text-gray-600">—</span> : value}
            </span>
        </div>
        <Icon size={18} className={`${color} shrink-0`} strokeWidth={2.2} />
    </div>
);

/* ─── Session Timeline Row ─── */
const SessionRow = ({ session, isLatest, idx }) => {
    const deviceIcon = () => {
        const d = session.device || '';
        if (d.includes('iPhone') || d.includes('Android') || d.includes('Mobile')) return <Smartphone size={14} />;
        if (d.includes('Windows') || d.includes('Mac') || d.includes('Linux')) return <Monitor size={14} />;
        return <Globe size={14} />;
    };

    return (
        <div className="flex gap-3 group">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border z-10
                    ${isLatest
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'bg-white dark:bg-surface-dark2 border-gray-200 dark:border-white/10 text-gray-400'}`}
                >
                    {deviceIcon()}
                </div>
                {idx < 9 && <div className="w-0.5 flex-1 bg-gray-200/60 dark:bg-white/10 mt-1 mb-1" />}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-3.5 ${idx >= 9 ? 'pb-0' : ''}`}>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                {session.device || 'Unknown Client'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {new Date(session.last_active).toLocaleString()}
                            </p>
                        </div>
                        {isLatest && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase rounded-md shrink-0">
                                Latest
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-400">
                        {session.location && !session.location.includes('Unknown') && (
                            <div className="flex items-center gap-1">
                                <MapPin size={11} className="text-gray-400" />
                                <span>{session.location}</span>
                            </div>
                        )}
                        {session.ip && (
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                                <Shield size={10} />
                                <span>{session.ip}</span>
                            </div>
                        )}
                        {session.last_active && (
                            <div className="flex items-center gap-1">
                                <Clock size={10} />
                                <span>{timeAgo(session.last_active)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Inline Notes Editor ─── */
const InlineNotes = ({ notes, onSave, isSaving, translate }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(notes || '');

    const handleSave = async () => {
        await onSave(value);
        setEditing(false);
    };

    return (
        <div>
            {editing ? (
                <div className="space-y-2">
                    <textarea
                        autoFocus
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white min-h-[90px] focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none transition-all leading-relaxed"
                        placeholder="Internal administrator notes..."
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            <span>{translate('save') || 'Save Notes'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setValue(notes || ''); setEditing(false); }}
                            className="px-3 py-2 bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setEditing(true)}
                    className="min-h-[70px] p-3.5 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 cursor-text hover:border-violet-300 dark:hover:border-violet-500/30 transition-all group"
                >
                    {notes ? (
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{notes}</p>
                    ) : (
                        <p className="text-xs text-gray-400 italic">Click here to add notes about this user…</p>
                    )}
                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold tracking-wider mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to edit notes
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─── Main AdminUserDetail Component ─── */
const AdminUserDetail = ({
    profile,
    profileStats,
    profileSessions,
    loadingProfileData,
    onBack,
    onSubClick,
    onSaveNotes,
    onDeleteUser,
    isSavingNotes,
    showToast,
    translate = (k) => k
}) => {
    if (!profile) return null;

    const allSessions = profileSessions || [];
    const totalSessions = allSessions.length;
    const firstSeen = allSessions.length > 0
        ? new Date(Math.min(...allSessions.map(s => new Date(s.last_active).getTime()))).toLocaleDateString()
        : null;

    const handleStripeClick = () => {
        if (profile.stripe_customer_id) {
            window.open(`https://dashboard.stripe.com/customers/${profile.stripe_customer_id}`, '_blank');
        } else {
            window.open(`https://dashboard.stripe.com/search?query=${encodeURIComponent(profile.email)}`, '_blank');
        }
    };

    return (
        <div className="space-y-5 animate-fade-in pb-10">

            {/* Back + Action Header Bar */}
            <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] px-3.5 py-2 rounded-xl transition-all active:scale-95"
                >
                    <ChevronLeft size={15} />
                    <span>{translate('back') || 'Back to Users'}</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(profile.email || ''); showToast(translate('copied') || 'Copied email!', 'success'); }}
                        className="p-2 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-xl transition-all active:scale-95"
                        title="Copy email"
                    >
                        <Mail size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={handleStripeClick}
                        className="p-2 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-xl transition-all active:scale-95"
                        title="Open in Stripe"
                    >
                        <ExternalLink size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(profile.id); showToast(translate('copied') || 'Copied ID!', 'success'); }}
                        className="p-2 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 rounded-xl transition-all active:scale-95"
                        title="Copy user ID"
                    >
                        <Copy size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubClick(profile, profile.subscription_status === 'pro' ? 'free' : 'pro')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            profile.subscription_status === 'pro'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                        }`}
                    >
                        {profile.subscription_status === 'pro' ? 'Revoke Pro' : 'Grant Pro'}
                    </button>
                </div>
            </div>

            {/* Identity Card */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {profile.display_name || profile.email?.split('@')[0]}
                            </h2>
                            {profile.subscription_status === 'pro' && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-widest flex items-center gap-0.5">
                                    <Crown size={9} /> PRO
                                </span>
                            )}
                            {profile.subscription_status === 'canceled' && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                                    Canceled
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{profile.email}</p>
                    </div>
                </div>

                {/* Identity Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Joined</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white mt-1">
                            {formatDate(profile.created_at)}
                        </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Last Sign In</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white mt-1">
                            {timeAgo(profile.last_sign_in_at) || '—'}
                        </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sessions</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white mt-1">
                            {totalSessions} recorded
                        </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer ID</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white mt-1 font-mono truncate">
                            {profile.stripe_customer_id ? `${profile.stripe_customer_id.slice(0, 10)}…` : 'None'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Usage Telemetry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatBadge icon={TrendingUp} label="Ledger Transactions" value={profileStats.transactions}
                    color="text-violet-500" loading={loadingProfileData} />
                <StatBadge icon={Target} label="Budgets Configured" value={profileStats.budgets}
                    color="text-blue-500" loading={loadingProfileData} />
                <StatBadge icon={TrendingUp} label="Savings Goals" value={profileStats.goals}
                    color="text-emerald-500" loading={loadingProfileData} />
            </div>

            {/* Session Timeline + Admin Tools & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Session Timeline */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <Activity size={17} className="text-violet-600 dark:text-violet-400" />
                            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                                Session History
                            </h3>
                        </div>
                        {firstSeen && (
                            <span className="text-[11px] text-gray-400 font-medium">Since {firstSeen}</span>
                        )}
                    </div>
                    <div className="p-4 sm:p-5">
                        {loadingProfileData ? (
                            <div className="flex flex-col items-center py-10 opacity-50">
                                <RefreshCw size={22} className="animate-spin text-violet-500 mb-2" />
                                <p className="text-xs font-bold text-gray-400">Loading session telemetry…</p>
                            </div>
                        ) : allSessions.length > 0 ? (
                            <>
                                {allSessions.slice(0, 10).map((sess, idx) => (
                                    <SessionRow key={idx} session={sess} isLatest={idx === 0} idx={idx} />
                                ))}
                                {allSessions.length > 10 && (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase text-center mt-2 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                                        Showing latest 10 of {allSessions.length} sessions
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-xs italic">
                                No session telemetry recorded yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Tools + Notes */}
                <div className="space-y-4">
                    {/* Admin Tools */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                            <Shield size={16} className="text-blue-500" />
                            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                                Admin Tools
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleStripeClick}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl border border-gray-100 dark:border-white/[0.06] transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Stripe Customer</span>
                                </div>
                                <ChevronLeft size={12} className="rotate-180 text-gray-400" />
                            </button>
                            <a
                                href={`mailto:${profile.email}`}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl border border-gray-100 dark:border-white/[0.06] transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Mail size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Send Direct Email</span>
                                </div>
                                <ChevronLeft size={12} className="rotate-180 text-gray-400" />
                            </a>
                            <button
                                type="button"
                                onClick={() => { navigator.clipboard.writeText(profile.id); showToast(translate('copied') || 'Copied ID!', 'success'); }}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl border border-gray-100 dark:border-white/[0.06] transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Copy size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Copy User ID</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => onDeleteUser && onDeleteUser(profile)}
                                className="w-full flex items-center justify-between p-3 bg-rose-50/60 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl border border-rose-200/60 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Trash2 size={14} className="text-rose-500 shrink-0" />
                                    <span className="text-xs font-bold">{translate('admin_delete_user') || 'Delete User Account'}</span>
                                </div>
                                <ChevronLeft size={12} className="rotate-180 text-rose-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                            <FileText size={16} className="text-amber-500" />
                            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                                Admin Notes
                            </h3>
                        </div>
                        <InlineNotes
                            notes={profile.admin_notes}
                            onSave={(text) => onSaveNotes(profile.id, text)}
                            isSaving={isSavingNotes}
                            translate={translate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;
