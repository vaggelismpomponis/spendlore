import React, { useState, useMemo } from 'react';
import {
    LifeBuoy,
    Download,
    Search,
    CheckCircle2,
    Filter
} from 'lucide-react';
import { supabase } from '../../supabase';
import AdminTicketStats from './AdminTicketStats';
import AdminTicketCard from './AdminTicketCard';
import CustomSelect from '../CustomSelect';

const AdminFeedback = ({
    feedback = [],
    onDelete,
    onFeedbackUpdate,
    translate = (k) => k
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [localTickets, setLocalTickets] = useState(feedback);

    // Keep in sync with parent feedback updates
    React.useEffect(() => {
        setLocalTickets(feedback);
    }, [feedback]);

    const handleStatusChange = async (id, newStatus) => {
        setLocalTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        if (onFeedbackUpdate) {
            onFeedbackUpdate(id, { status: newStatus });
        }
        try {
            await supabase.from('feedback').update({ status: newStatus }).eq('id', id);
        } catch (e) {
            console.warn('Failed to update status in DB:', e);
        }
    };

    const handlePriorityChange = async (id, newPriority) => {
        setLocalTickets(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
        if (onFeedbackUpdate) {
            onFeedbackUpdate(id, { priority: newPriority });
        }
        try {
            await supabase.from('feedback').update({ priority: newPriority }).eq('id', id);
        } catch (e) {
            console.warn('Failed to update priority in DB:', e);
        }
    };

    const handleNotesSave = async (id, notes) => {
        setLocalTickets(prev => prev.map(t => t.id === id ? { ...t, admin_notes: notes } : t));
        if (onFeedbackUpdate) {
            onFeedbackUpdate(id, { admin_notes: notes });
        }
        try {
            await supabase.from('feedback').update({ admin_notes: notes }).eq('id', id);
        } catch (e) {
            console.warn('Failed to save notes in DB:', e);
        }
    };

    const filtered = useMemo(() => {
        return localTickets.filter(item => {
            const currentStatus = item.status || 'open';
            const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
            const isSupport = item.type === 'support' || (item.message || '').includes('[Support]');
            const matchesType = typeFilter === 'all' || 
                (typeFilter === 'support' ? isSupport : (item.type === typeFilter && !isSupport));
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                (item.message || '').toLowerCase().includes(search) ||
                (item.email || '').toLowerCase().includes(search) ||
                String(item.id).toLowerCase().includes(search);
            return matchesStatus && matchesType && matchesSearch;
        });
    }, [localTickets, statusFilter, typeFilter, searchTerm]);

    const handleExport = () => {
        try {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localTickets, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `spendlore-support-tickets-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } catch (e) {
            console.error('Export tickets error:', e);
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* ─────── Executive Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <LifeBuoy size={22} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                {translate('admin_support_hub_title') || 'Support Desk & User Feedback'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {translate('admin_support_hub_subtitle') || 'Customer support tickets, bug reports, and incoming inquiries'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {localTickets.length > 0 && (
                            <button
                                type="button"
                                onClick={handleExport}
                                className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
                                title="Export tickets JSON"
                            >
                                <Download size={14} />
                                <span>{translate('admin_export_json') || 'Export JSON'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI Metrics */}
                <AdminTicketStats tickets={localTickets} translate={translate} />
            </div>

            {/* ─────── Search & Action Controls Toolbar ─────── */}
            <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={translate('admin_search_tickets_placeholder') || 'Search tickets by message, email, or #TICK ID…'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white transition-all"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 shrink-0">
                    {/* Status Tabs */}
                    <div className="grid grid-cols-2 lg:inline-flex lg:items-center bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl gap-1 w-full lg:w-auto">
                        {[
                            { key: 'all', label: translate('admin_all_status') || 'All Status' },
                            { key: 'open', label: translate('admin_open') || 'Open' },
                            { key: 'in_progress', label: translate('admin_in_progress') || 'In Progress' },
                            { key: 'resolved', label: translate('admin_resolved') || 'Resolved' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center truncate ${
                                    statusFilter === tab.key
                                        ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Category Selector */}
                    <div className="w-full lg:w-44 shrink-0">
                        <CustomSelect
                            size="sm"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={[
                                { value: 'all', label: translate('admin_all_categories') || 'All Categories' },
                                { value: 'support', label: translate('admin_support_only') || 'Support Only' },
                                { value: 'bug', label: translate('admin_bugs_only') || 'Bugs Only' },
                                { value: 'idea', label: translate('admin_ideas_only') || 'Feature Ideas' },
                                { value: 'other', label: translate('admin_general_only') || 'General' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            {filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={16} />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                        {translate('admin_no_tickets_found') || 'No support tickets found'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {translate('admin_no_tickets_match') || 'No submissions match the current status and search filters. All incoming customer support tickets and user feedback will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((item) => (
                        <AdminTicketCard
                            key={item.id}
                            item={item}
                            onStatusChange={handleStatusChange}
                            onPriorityChange={handlePriorityChange}
                            onNotesSave={handleNotesSave}
                            onDelete={onDelete}
                            translate={translate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
