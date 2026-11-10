import React, { useState } from 'react';
import {
    ShieldAlert,
    AlertTriangle,
    Search,
    ExternalLink,
    RefreshCw,
    Trash2,
    Download,
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    User,
    Globe,
    Clock,
    Terminal,
    Bug
} from 'lucide-react';

const SENTRY_PROJECT_URL = 'https://spendwise-mz.sentry.io/issues/?environment=production&project=4511308038013008&statsPeriod=14d';

const resolveTranslation = (translateFn, key, fallback, params) => {
    if (typeof translateFn === 'function') {
        const val = translateFn(key, params);
        if (val && val !== key) return val;
    }
    return fallback !== undefined ? fallback : key;
};

const AdminSentryErrors = ({
    errors = [],
    onClear,
    onRefresh,
    onTriggerTest,
    loading = false,
    translate = (k) => k
}) => {
    const t = (k, fb, p) => resolveTranslation(translate, k, fb, p);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [copiedId, setCopiedId] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleCopy = (id, text) => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => {});
    };

    const handleExport = () => {
        try {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(errors, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `spendlore-sentry-errors-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } catch (e) {
            console.error('Export logs error:', e);
        }
    };

    const filteredErrors = errors.filter(item => {
        const matchesLevel = levelFilter === 'all' || item.level === levelFilter;
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            (item.message || '').toLowerCase().includes(search) ||
            (item.context || '').toLowerCase().includes(search) ||
            (item.url || '').toLowerCase().includes(search) ||
            (item.userEmail || '').toLowerCase().includes(search) ||
            (item.stack || '').toLowerCase().includes(search);

        return matchesLevel && matchesSearch;
    });

    const errorCount = errors.filter(e => e.level === 'error' || e.level === 'fatal').length;
    const warningCount = errors.filter(e => e.level === 'warning' || e.level === 'warn').length;

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ─────── Sentry Integration Status Hub ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={22} className="text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                {t('admin_sentry_title', 'Sentry Telemetry & Error Logging')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('admin_sentry_subtitle', 'Live crash monitoring, unhandled exceptions, and diagnostic traces')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={onTriggerTest}
                            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
                            title="Trigger a test exception to verify live capture"
                        >
                            <Bug size={14} className="text-rose-500" />
                            <span>{t('admin_test_event', 'Test Error')}</span>
                        </button>

                        <a
                            href={SENTRY_PROJECT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-xs"
                        >
                            <span>{t('admin_open_sentry_dashboard', 'Sentry Dashboard')}</span>
                            <ExternalLink size={13} />
                        </a>
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {t('admin_total_logged_events', 'Total Events')}
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {errors.length}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">
                            {t('admin_critical_errors', 'Errors / Crashes')}
                        </span>
                        <span className="block text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                            {errorCount}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                            {t('admin_warnings', 'Warnings')}
                        </span>
                        <span className="block text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            {warningCount}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            {t('admin_sdk_status', 'Ingest Status')}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{t('admin_sdk_initialized', 'Active (spendwise-mz.sentry.io)')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────── Search & Action Controls ─────── */}
            <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('admin_search_sentry_placeholder', 'Search errors by message, context, stack trace, or user email...')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                </div>

                {/* Filter & Actions Row */}
                <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
                    {/* Level Tabs */}
                    <div className="flex bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl gap-1">
                        {[
                            { key: 'all', label: t('admin_all_levels', 'All') },
                            { key: 'error', label: t('admin_filter_errors', 'Errors') },
                            { key: 'warning', label: t('admin_filter_warnings', 'Warnings') }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setLevelFilter(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    levelFilter === tab.key
                                        ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                        title="Refresh Logs"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>

                    {/* Export Button */}
                    {errors.length > 0 && (
                        <button
                            type="button"
                            onClick={handleExport}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                            title="Export JSON"
                        >
                            <Download size={15} />
                        </button>
                    )}

                    {/* Clear Button */}
                    {errors.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowClearConfirm(true)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all active:scale-95"
                            title="Clear Logs"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Clear Confirmation Banner */}
            {showClearConfirm && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                            {t('admin_clear_all_logs', 'Clear all local & cloud error log records?')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="px-3 py-1.5 rounded-lg bg-gray-200/80 dark:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                        >
                            {t('cancel', 'Cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onClear();
                                setShowClearConfirm(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-xs"
                        >
                            {t('admin_clear_all_logs', 'Confirm Clear')}
                        </button>
                    </div>
                </div>
            )}

            {/* ─────── Error Logs List ─────── */}
            {filteredErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Check size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {searchTerm ? t('admin_no_errors_found', 'No matching errors found') : t('admin_no_sentry_errors', 'No Sentry errors recorded')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                        {t('admin_no_errors_desc', 'All systems operational. Errors reported by users or runtime handlers will appear here in real time.')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredErrors.map((item) => {
                        const isExpanded = expandedIds.has(item.id);
                        const isWarn = item.level === 'warning' || item.level === 'warn';
                        const isCopied = copiedId === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`bg-white dark:bg-surface-dark2 rounded-2xl border transition-all ${
                                    isWarn 
                                        ? 'border-amber-200 dark:border-amber-500/30' 
                                        : 'border-rose-200 dark:border-rose-500/30'
                                } shadow-xs overflow-hidden`}
                            >
                                {/* Header Summary */}
                                <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <button
                                            type="button"
                                            className="mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                        >
                                            {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                        </button>

                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            {/* Overline Metadata */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                    isWarn
                                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
                                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
                                                }`}>
                                                    {item.level.toUpperCase()}
                                                </span>

                                                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                                    [{item.context || 'General'}]
                                                </span>

                                                <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                    <Clock size={11} />
                                                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                                                </span>

                                                {item.userEmail && (
                                                    <span className="text-[11px] text-gray-600 dark:text-gray-300 flex items-center gap-1 font-medium">
                                                        <User size={11} className="text-gray-400" />
                                                        <span>{item.userEmail}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Error Message */}
                                            <p className="text-sm font-bold text-gray-900 dark:text-white break-words leading-snug">
                                                {item.message}
                                            </p>

                                            {/* URL Path */}
                                            {item.url && (
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 font-mono truncate">
                                                    <Globe size={11} />
                                                    <span>{item.url}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Copy & External Link Quick Action */}
                                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(item.id, `${item.message}\n\nStack:\n${item.stack || 'No stack trace available'}`)}
                                            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg transition-colors"
                                            title="Copy Error & Stack"
                                        >
                                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Stack Trace & Metadata Drawer */}
                                {isExpanded && (
                                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 space-y-3">
                                        {/* Stack Trace */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Terminal size={12} />
                                                    Stack Trace
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(item.id, item.stack || item.message)}
                                                    className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                                                >
                                                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                                    <span>{isCopied ? t('admin_copied', 'Copied') : t('admin_copy_stack', 'Copy Stack')}</span>
                                                </button>
                                            </div>
                                            <pre className="font-mono text-[11px] p-3.5 rounded-xl bg-gray-900 text-gray-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 custom-scrollbar">
                                                {item.stack || 'No stack trace recorded.'}
                                            </pre>
                                        </div>

                                        {/* Metadata Attributes */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                            {item.id && (
                                                <div className="p-2.5 rounded-lg bg-white dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/5">
                                                    <span className="font-bold text-gray-400 block mb-0.5">Event ID</span>
                                                    <span className="font-mono text-gray-700 dark:text-gray-300 truncate block">{item.id}</span>
                                                </div>
                                            )}
                                            {item.userAgent && (
                                                <div className="p-2.5 rounded-lg bg-white dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/5">
                                                    <span className="font-bold text-gray-400 block mb-0.5">User Agent</span>
                                                    <span className="text-gray-700 dark:text-gray-300 truncate block">{item.userAgent}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminSentryErrors;

