import React from 'react';
import { LifeBuoy, Clock, CheckCircle2, Inbox } from 'lucide-react';

const AdminTicketStats = ({ tickets = [], translate = (k) => k }) => {
    const openCount = tickets.filter(t => (t.status || 'open') === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
    const supportCount = tickets.filter(t => t.type === 'support' || (t.message || '').includes('[Support]')).length;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
                        {translate('admin_ticket_stats_open') || 'Open Tickets'}
                    </span>
                    <Clock size={14} className="text-amber-500" />
                </div>
                <span className="block text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {openCount}
                </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">
                        {translate('admin_ticket_stats_in_progress') || 'In Progress'}
                    </span>
                    <Inbox size={14} className="text-blue-500" />
                </div>
                <span className="block text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {inProgressCount}
                </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                        {translate('admin_ticket_stats_resolved') || 'Resolved'}
                    </span>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {resolvedCount}
                </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {translate('admin_ticket_stats_support') || 'Direct Support'}
                    </span>
                    <LifeBuoy size={14} className="text-gray-400" />
                </div>
                <span className="block text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {supportCount} <span className="text-xs font-normal text-gray-400">/ {tickets.length} {translate('admin_total_label') || 'total'}</span>
                </span>
            </div>
        </div>
    );
};

export default AdminTicketStats;

