import React, { useState, useMemo } from 'react';
import {
    Lightbulb, Bug, MessageSquare, Trash2, Mail, Download, Search, CheckCircle2, Filter
} from 'lucide-react';

const getTypeIcon = (type) => {
    switch (type) {
        case 'idea': return <Lightbulb size={18} className="text-amber-500 shrink-0" strokeWidth={2.2} />;
        case 'bug': return <Bug size={18} className="text-rose-500 shrink-0" strokeWidth={2.2} />;
        default: return <MessageSquare size={18} className="text-blue-500 shrink-0" strokeWidth={2.2} />;
    }
};

const getTypeBadge = (type) => {
    switch (type) {
        case 'idea':
            return {
                label: 'Feature Idea',
                className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
            };
        case 'bug':
            return {
                label: 'Bug Report',
                className: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
            };
        default:
            return {
                label: 'General Feedback',
                className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
            };
    }
};

const AdminFeedback = ({
    feedback = [],
    onDelete,
    translate = (k) => k
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const ideaCount = useMemo(() => feedback.filter(f => f.type === 'idea').length, [feedback]);
    const bugCount = useMemo(() => feedback.filter(f => f.type === 'bug').length, [feedback]);
    const otherCount = useMemo(() => feedback.filter(f => f.type !== 'idea' && f.type !== 'bug').length, [feedback]);

    const filtered = useMemo(() => {
        return feedback.filter(item => {
            const matchesFilter = filter === 'all' || item.type === filter;
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                (item.message || '').toLowerCase().includes(search) ||
                (item.email || '').toLowerCase().includes(search);
            return matchesFilter && matchesSearch;
        });
    }, [feedback, filter, searchTerm]);

    const handleExport = () => {
        try {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(feedback, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `spendlore-feedback-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } catch (e) {
            console.error('Export feedback error:', e);
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ─────── Executive Feedback Hub Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <MessageSquare size={22} className="text-amber-500 shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                User Feedback & Feature Requests
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Bug reports, feature suggestions, and user sentiment submissions
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {feedback.length > 0 && (
                            <button
                                type="button"
                                onClick={handleExport}
                                className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
                                title="Export feedback JSON"
                            >
                                <Download size={14} />
                                <span>Export Feedback</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Total Feedback
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {feedback.length}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                            Feature Ideas
                        </span>
                        <span className="block text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            {ideaCount}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">
                            Bug Reports
                        </span>
                        <span className="block text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                            {bugCount}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                            General / Other
                        </span>
                        <span className="block text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                            {otherCount}
                        </span>
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
                        placeholder={translate('search_feedback') || 'Search feedback by message or user email…'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl gap-1">
                    {[
                        { key: 'all', label: `All (${feedback.length})` },
                        { key: 'idea', label: `Ideas (${ideaCount})` },
                        { key: 'bug', label: `Bugs (${bugCount})` },
                        { key: 'other', label: `Other (${otherCount})` }
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
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-1 text-xs text-gray-400">
                <span className="font-medium">
                    Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> {filtered.length === 1 ? 'submission' : 'submissions'}
                </span>
            </div>

            {/* Feedback Submissions List */}
            {filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={16} />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                        {translate('no_feedback_found') || 'No feedback records found'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        No submissions match the current filter and search query. All feedback from users will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((item) => {
                        const badge = getTypeBadge(item.type);
                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-xs space-y-3 group hover:border-violet-300 dark:hover:border-violet-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        {getTypeIcon(item.type)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 font-medium mt-1">
                                                {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95"
                                        title="Delete feedback"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-xs leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                                    {item.message}
                                </div>

                                <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Mail size={12} className="text-gray-400" />
                                        <a
                                            href={`mailto:${item.email}`}
                                            className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
                                        >
                                            {item.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
