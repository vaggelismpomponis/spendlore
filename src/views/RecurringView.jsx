import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    Repeat,
    TrendingUp,
    TrendingDown,
    Pencil,
    X,
    Check,
    CheckCircle2,
    RefreshCw,
    ArrowUpCircle,
    ArrowDownCircle,
    ChevronRight
} from 'lucide-react';
import { supabase } from '../supabase';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomSelect from '../components/CustomSelect';

/* ─────────────────────────────────────────────────────────────
   Small helpers
───────────────────────────────────────────────────────────── */
const FREQ_COLORS = {
    monthly: { from: 'from-violet-500', to: 'to-purple-600', bar: '#a78bfa', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
    weekly:  { from: 'from-cyan-500',   to: 'to-blue-600',   bar: '#38bdf8', badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
};

const getFreqMeta = (freq) => FREQ_COLORS[freq] || FREQ_COLORS.monthly;

/* ── Styled input ── */
const Field = ({ label, ...props }) => {
    const id = React.useId();
    return (
        <div>
            <label htmlFor={id} className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className="w-full py-3 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
        </div>
    );
};

/* ── Styled select ── */
const SelectField = ({ label, value, onChange, options, placeholder }) => {
    return (
        <div>
            <label className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                {label}
            </label>
            <CustomSelect
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
            />
        </div>
    );
};

/* ──────────────────────────────────────────────────────────────
   Main Component
─────────────────────────────────────────────────────────────── */
const RecurringView = ({ user, onBack, hideHeader }) => {
    const { t: translate, currency, privacyMode, language } = useSettings();
    const { showToast } = useToast();
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /* ── modal state ── */
    const [showModal, setShowModal]     = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [deletingRule, setDeletingRule] = useState(null);

    /* ── form state ── */
    const [title,     setTitle]     = useState('');
    const [amount,    setAmount]    = useState('');
    const [type,      setType]      = useState('expense');
    const [frequency, setFrequency] = useState('monthly');
    const [day,       setDay]       = useState('1');

    /* ── data fetching ── */
    useEffect(() => {
        if (!user) return;
        const fetchRules = async () => {
            const { data, error } = await supabase
                .from('recurring_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (!error) setRules(data || []);
            setIsLoading(false);
        };
        fetchRules();
        const channel = supabase
            .channel('recurring-changes-v2')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'recurring_transactions',
                filter: `user_id=eq.${user.id}`
            }, fetchRules)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    /* ── handlers ── */
    const openAdd = () => {
        setEditingRule(null);
        setTitle(''); setAmount(''); setType('expense');
        setFrequency('monthly'); setDay('1');
        setShowModal(true);
    };

    const openEdit = (rule) => {
        setEditingRule(rule);
        setTitle(rule.title);
        setAmount(rule.amount.toString());
        setType(rule.type);
        setFrequency(rule.frequency || 'monthly');
        setDay(rule.day.toString());
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingRule(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        try {
            if (editingRule) {
                const updatedRule = { ...editingRule, title, amount: parseFloat(amount), type, frequency, day: parseInt(day) };
                // Optimistic update
                setRules(prev => prev.map(r => r.id === editingRule.id ? updatedRule : r));
                closeModal();

                const { error } = await supabase.from('recurring_transactions')
                    .update({ title, amount: parseFloat(amount), type, frequency, day: parseInt(day) })
                    .eq('id', editingRule.id);
                if (error) {
                    // Rollback
                    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
                    throw error;
                }
            } else {
                const { data, error } = await supabase.from('recurring_transactions')
                    .insert({
                        user_id: user.id,
                        title, amount: parseFloat(amount), type, frequency, day: parseInt(day),
                        last_processed: null
                    })
                    .select().single();
                if (error) throw error;
                // Optimistic add
                setRules(prev => [data, ...prev]);
                closeModal();
            }
        } catch (err) {
            console.error('Error saving rule:', err);
            showToast(translate('save_error') || 'Error saving. Please try again.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deletingRule) return;
        const ruleToDelete = deletingRule;
        // Optimistic remove
        setRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
        setDeletingRule(null);
        try {
            const { error } = await supabase.from('recurring_transactions')
                .delete().eq('id', ruleToDelete.id);
            if (error) {
                // Rollback
                setRules(prev => [...prev, ruleToDelete].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                throw error;
            }
        } catch (err) {
            console.error('Error deleting rule:', err);
            showToast(translate('delete_error') || 'Error deleting. Please try again.', 'error');
        }
    };

    /* ── summary stats ── */
    const totalExpense = rules.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const totalIncome  = rules.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const net          = totalIncome - totalExpense;
    const sym          = currency || '€';

    /* ────────────────────────────────────────────────────────
       Render
    ──────────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in transition-colors duration-300">

            <div className={`shrink-0 transition-colors duration-300 sticky top-0 z-40
                            ${hideHeader 
                                ? 'bg-transparent border-none px-4 pt-4 pb-2' 
                                : 'bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md px-5 pt-4 pb-4 shadow-sm border-b border-gray-100 dark:border-white/5'}`}
                style={!hideHeader ? { paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' } : {}}
            >
                <div className="flex items-center justify-between min-h-[40px] gap-4 relative">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={onBack}
                            className="absolute left-0 w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.08]
                                       flex items-center justify-center
                                       text-gray-500 dark:text-white/50
                                       border border-gray-200/60 dark:border-white/10
                                       hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                       active:scale-90 transition-all duration-150"
                        >
                            <ArrowLeft size={15} strokeWidth={2.5} />
                        </button>
                        <div className="pl-10 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none truncate">
                                {translate('recurring') || (language === 'el' ? 'Επαναλαμβανόμενα' : 'Recurring')}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                                {rules.length} {(translate('active') || (language === 'el' ? 'ενεργές' : 'active')).toLowerCase()} · {new Date().toLocaleString(language === 'el' ? 'el-GR' : 'en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Add button — fixed size, never shrinks */}
                    <button
                        onClick={openAdd}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 text-sm font-bold rounded-xl shadow-xs border border-black/10 dark:border-white/20 transition-all active:scale-95"
                    >
                        <Plus size={16} /> {translate('add_recurring') || (language === 'el' ? 'Προσθήκη' : 'Add')}
                    </button>
                </div>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto">

                {/* ── Hero Summary Card (when rules exist) ── */}
                {rules.length > 0 && (
                    <div className="px-5 pt-5">
                        <div className="relative bg-gray-100/90 dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">
                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                                            <RefreshCw size={12} /> {translate('monthly_recurring') || 'Monthly Recurring'}
                                        </p>
                                        <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            <Amount value={net} prefix={net >= 0 ? '+' : ''} />
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                            {translate('net_cash_flow') || 'Net cash flow / month'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                                            {rules.length} {translate('rules') || 'rules'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="flex gap-2.5 mt-4">
                                    <div className="flex-1 bg-gray-200/60 dark:bg-white/[0.06] border border-gray-300/60 dark:border-white/[0.1] rounded-xl py-2 px-2.5 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-semibold flex items-center justify-center gap-1">
                                            <ArrowDownCircle size={11} className="text-rose-500" /> {translate('expenses') || 'Expenses'}
                                        </p>
                                        <p className="text-rose-600 dark:text-rose-400 font-bold text-sm mt-0.5">
                                            <Amount value={totalExpense} prefix="-" />
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-gray-200/60 dark:bg-white/[0.06] border border-gray-300/60 dark:border-white/[0.1] rounded-xl py-2 px-2.5 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-semibold flex items-center justify-center gap-1">
                                            <ArrowUpCircle size={11} className="text-emerald-500" /> {translate('income') || 'Income'}
                                        </p>
                                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">
                                            <Amount value={totalIncome} prefix="+" />
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-gray-200/60 dark:bg-white/[0.06] border border-gray-300/60 dark:border-white/[0.1] rounded-xl py-2 px-2.5 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-semibold flex items-center justify-center gap-1">
                                            <CheckCircle2 size={11} className="text-gray-500 dark:text-gray-400" /> {translate('active') || 'Active'}
                                        </p>
                                        <p className="text-gray-900 dark:text-white font-bold text-sm mt-0.5">{rules.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Empty State ── */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-gray-200 dark:border-white/20 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                    </div>
                ) : rules.length === 0 && (
                    <div className="px-5 py-4">
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-xs mt-2">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/10 flex items-center justify-center mb-5 text-gray-900 dark:text-white shadow-xs">
                                <Repeat size={30} strokeWidth={1.75} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight">
                                {translate('auto_transactions') || 'Automatic Transactions'}
                            </h3>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 max-w-[260px] mb-6 leading-relaxed">
                                {translate('auto_trans_desc') || 'Add fixed expenses (rent, subscriptions) and the app will add them automatically each month.'}
                            </p>
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 font-bold text-sm rounded-xl shadow-xs transition-all active:scale-95 group"
                            >
                                <Plus size={16} className="transition-transform group-hover:rotate-90" /> {translate('add_recurring') || 'Add'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Rule Cards ── */}
                {rules.length > 0 && (
                    <div className="px-5 py-5 space-y-3 pb-10 stagger-children">
                        {rules.map((rule, idx) => {
                            const isIncome = rule.type === 'income';
                            const freq = rule.frequency || 'monthly';
                            const meta = getFreqMeta(freq);

                            return (
                                <div
                                    key={rule.id}
                                    className="bg-gray-100/90 dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all duration-200"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    {/* Card content */}
                                    <div className="p-4">
                                        {/* Top row */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {/* Icon */}
                                            {isIncome
                                                    ? <TrendingUp size={22} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                                                    : <TrendingDown size={22} className="text-rose-500 shrink-0" strokeWidth={2.5} />
                                                }

                                            {/* Title + meta */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-[14.5px] text-gray-900 dark:text-white truncate">
                                                        {rule.title}
                                                    </h3>
                                                    <span className={`ml-2 flex-shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${meta.badge}`}>
                                                        {translate(freq) || freq}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Calendar size={10} className="text-gray-400 dark:text-white/50 flex-shrink-0" />
                                                    <span className="text-[11px] text-gray-400 dark:text-white/60 font-medium">
                                                        {translate('every_month_day', { day: rule.day }) || `Day ${rule.day} of each month`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount + actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-transparent">
                                            <span className={`text-[18px] font-extrabold tracking-tight
                                                             ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                <Amount value={rule.amount} prefix={isIncome ? '+' : '-'} />
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(rule)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                                                               text-indigo-600 dark:text-indigo-400
                                                               bg-indigo-50 dark:bg-indigo-900/20
                                                               hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                                                               transition-colors active:scale-95"
                                                >
                                                    <Pencil size={12} /> {translate('edit') || 'Edit'}
                                                </button>
                                                <button
                                                    onClick={() => setDeletingRule(rule)}
                                                    className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold
                                                               text-red-500 bg-red-50 dark:bg-red-900/20
                                                               hover:bg-red-100 dark:hover:bg-red-900/40
                                                               transition-colors active:scale-95"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════
                Add / Edit Modal — portal
            ═══════════════════════════════════════════ */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
                    <div className="bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl animate-pop border border-gray-300 dark:border-white/10">

                        {/* Accent stripe */}


                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {editingRule ? (translate('edit_rule') || 'Edit Rule') : (translate('new_rule') || 'New Rule')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {editingRule ? (translate('edit_rule_desc') || 'Modify the details below') : (translate('new_rule_desc') || 'Set up your recurring transaction')}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                {/* Title */}
                                <Field
                                    label={translate('title') || 'Title'}
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Netflix, Rent, Salary…"
                                    required
                                    autoFocus={!editingRule}
                                />

                                {/* Amount */}
                                <div>
                                    <label htmlFor="recurring-amount" className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('amount') || 'Amount'} ({sym})
                                    </label>
                                    <div className="relative">
                                        {!privacyMode && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{sym}</span>}
                                        <input
                                            id="recurring-amount"
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Type pill selector */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('type') || 'Type'}
                                    </label>
                                    <div className="flex bg-gray-100 dark:bg-white/[0.06] rounded-xl p-1">
                                        {['expense', 'income'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`flex-1 py-2.5 text-[12px] font-bold rounded-lg transition-all duration-200
                                                            ${type === t
                                                        ? t === 'expense'
                                                            ? 'bg-white dark:bg-white/[0.12] shadow-sm text-rose-500'
                                                            : 'bg-white dark:bg-white/[0.12] shadow-sm text-emerald-500'
                                                        : 'text-gray-400 dark:text-white/50'}`}
                                            >
                                                {translate(t) || t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Frequency + Day */}
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField
                                        label={translate('frequency') || 'Frequency'}
                                        value={frequency}
                                        onChange={setFrequency}
                                        options={[
                                            { value: 'monthly', label: translate('monthly') || 'Monthly' },
                                            { value: 'weekly', label: `${translate('weekly') || 'Weekly'} (Soon)`, disabled: true }
                                        ]}
                                    />
                                    <SelectField
                                        label={translate('day_of_month') || 'Day of month'}
                                        value={day}
                                        onChange={setDay}
                                        options={[...Array(31)].map((_, i) => ({ value: i + 1, label: String(i + 1) }))}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm"
                                    >
                                        {translate('cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Check size={16} />
                                        {editingRule ? (translate('update') || 'Update') : (translate('save') || 'Save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════
                Delete Confirmation Modal
            ═══════════════════════════════════════════ */}
            <ConfirmationModal
                isOpen={!!deletingRule}
                onClose={() => setDeletingRule(null)}
                onConfirm={handleDelete}
                title={translate('delete_recurring_title') || 'Delete Rule'}
                message={deletingRule
                    ? (translate('delete_recurring_confirm') || `Delete "${deletingRule.title}"? This cannot be undone.`)
                    : ''}
                confirmText={translate('delete') || 'Delete'}
                type="danger"
            />
        </div>
    );
};

export default RecurringView;









