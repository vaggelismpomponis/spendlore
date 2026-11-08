import React, { useState } from 'react';
import {
    LifeBuoy,
    Bug,
    Lightbulb,
    MessageSquare,
    Mail,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    Save
} from 'lucide-react';
import CustomSelect from '../CustomSelect';

const getTypeMeta = (type, message = '') => {
    if (type === 'support' || (message && message.includes('[Support]'))) {
        return {
            icon: LifeBuoy,
            label: 'Support Ticket',
            badgeClass: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
        };
    }
    switch (type) {
        case 'bug':
            return {
                icon: Bug,
                label: 'Bug Report',
                badgeClass: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
            };
        case 'idea':
            return {
                icon: Lightbulb,
                label: 'Feature Request',
                badgeClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
            };
        default:
            return {
                icon: MessageSquare,
                label: 'General Feedback',
                badgeClass: 'bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
            };
    }
};

const getStatusBadge = (status = 'open') => {
    switch (status) {
        case 'resolved':
            return {
                label: 'Resolved',
                icon: CheckCircle2,
                className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
            };
        case 'in_progress':
            return {
                label: 'In Progress',
                icon: Clock,
                className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
            };
        default:
            return {
                label: 'Open',
                icon: AlertCircle,
                className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
            };
    }
};

const AdminTicketCard = ({
    item,
    onStatusChange,
    onPriorityChange,
    onNotesSave,
    onDelete
}) => {
    const [showNotes, setShowNotes] = useState(Boolean(item.admin_notes));
    const [notes, setNotes] = useState(item.admin_notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const typeMeta = getTypeMeta(item.type, item.message);
    const TypeIcon = typeMeta.icon;
    const status = item.status || 'open';
    const priority = item.priority || (item.type === 'bug' || item.type === 'support' ? 'high' : 'normal');
    const statusMeta = getStatusBadge(status);
    const StatusIcon = statusMeta.icon;

    const ticketRef = `#TICK-${String(item.id).slice(0, 6).toUpperCase()}`;

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            await onNotesSave(item.id, notes);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const replySubject = encodeURIComponent(`[Spendlore Support ${ticketRef}] Regarding your request`);
    const replyBody = encodeURIComponent(
        `Hi,\n\nThank you for reaching out to Spendlore Support.\n\nRegarding your ticket (${ticketRef}):\n"${item.message}"\n\n`
    );

    return (
        <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-xs space-y-3.5 group hover:border-gray-300 dark:hover:border-white/20 transition-all">
            {/* Header: Type, ID, Status & Priority Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <TypeIcon size={18} className="text-gray-700 dark:text-gray-300 shrink-0" />
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${typeMeta.badgeClass}`}>
                        {typeMeta.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-400">
                        {ticketRef}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Status Dropdown */}
                    <div className="w-32">
                        <CustomSelect
                            size="sm"
                            value={status}
                            onChange={(val) => onStatusChange(item.id, val)}
                            options={[
                                { value: 'open', label: 'Open', icon: <AlertCircle size={13} className="text-amber-500" /> },
                                { value: 'in_progress', label: 'In Progress', icon: <Clock size={13} className="text-blue-500" /> },
                                { value: 'resolved', label: 'Resolved', icon: <CheckCircle2 size={13} className="text-emerald-500" /> },
                            ]}
                        />
                    </div>

                    {/* Priority Selector */}
                    <div className="w-24">
                        <CustomSelect
                            size="sm"
                            value={priority}
                            onChange={(val) => onPriorityChange(item.id, val)}
                            options={[
                                { value: 'normal', label: 'Normal' },
                                { value: 'high', label: 'High' },
                                { value: 'urgent', label: 'Urgent' },
                            ]}
                        />
                    </div>

                    {/* Delete Action */}
                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95"
                        title="Delete Ticket"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Message Body */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-xs leading-relaxed text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">
                {item.message}
            </div>

            {/* Footer Row: User Details, Timestamps & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs text-gray-400">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-gray-400">
                        {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-gray-400" />
                            <a
                                href={`mailto:${item.email}?subject=${replySubject}&body=${replyBody}`}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium underline transition-colors"
                            >
                                {item.email}
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Reply Button */}
                    {item.email && (
                        <a
                            href={`mailto:${item.email}?subject=${replySubject}&body=${replyBody}`}
                            className="px-3 py-1.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                        >
                            <Mail size={12} />
                            <span>Reply via Email</span>
                        </a>
                    )}

                    {/* Toggle Notes */}
                    <button
                        type="button"
                        onClick={() => setShowNotes(prev => !prev)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-300 font-bold text-xs transition-all"
                    >
                        {showNotes ? 'Hide Notes' : item.admin_notes ? 'View Notes (1)' : 'Add Note'}
                    </button>
                </div>
            </div>

            {/* Expandable Internal Admin Notes */}
            {showNotes && (
                <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            Internal Admin Notes (Private)
                        </span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add internal resolution notes, customer conversation records, or tracking info..."
                        rows={2}
                        className="w-full p-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white transition-all"
                    />
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes || notes === (item.admin_notes || '')}
                            className="px-3 py-1.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-black font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                        >
                            <Save size={12} />
                            <span>{isSavingNotes ? 'Saving...' : 'Save Note'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTicketCard;

