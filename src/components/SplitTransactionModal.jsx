import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { getCategoryTranslation, isBaseCategory } from '../utils/categoryTranslations';
import CategoryIcon from './CategoryIcon';
import CustomSelect from './CustomSelect';

const baseExpenseCategories = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Βενζίνη', 'Υγεία', 'Άλλο'];
const baseIncomeCategories = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλα Έσοδα'];

export default function SplitTransactionModal({
    isOpen,
    onClose,
    totalAmount = 0,
    currentCategory = '',
    currentNote = '',
    initialSplits = [],
    onApplySplits,
    type = 'expense'
}) {
    const { customCategories, t, currency = '€' } = useSettings();

    // Available categories based on type
    const categories = useMemo(() => {
        const rawCustom = (type === 'income' ? customCategories?.income : customCategories?.expense) || [];
        const baseList = type === 'income' ? baseIncomeCategories : baseExpenseCategories;
        const cleanCustom = rawCustom.filter(cat => {
            if (!cat || typeof cat !== 'string') return false;
            const lower = cat.trim().toLowerCase();
            return !baseList.some(b => b.toLowerCase() === lower) && !isBaseCategory(cat);
        });
        return [...baseList, ...cleanCustom];
    }, [type, customCategories]);

    const categoryOptions = useMemo(() => {
        return categories.map(cat => ({
            value: cat,
            label: getCategoryTranslation(cat, t),
            icon: <CategoryIcon category={cat} type={type} size={16} />
        }));
    }, [categories, type, t]);

    // Local total
    const [targetTotal, setTargetTotal] = useState(0);

    // Splits state: array of { id, category, amount, note }
    const [splits, setSplits] = useState([]);
    const [validationError, setValidationError] = useState('');

    // Initialize or reset splits when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const parsedTotal = parseFloat(totalAmount) || 0;
        setTargetTotal(parsedTotal);
        setValidationError('');

        if (Array.isArray(initialSplits) && initialSplits.length >= 2) {
            setSplits(
                initialSplits.map((s, index) => ({
                    id: `split-${index}-${Date.now()}`,
                    category: s.category || s.category_id || '',
                    amount: s.amount ? String(s.amount) : '',
                    note: s.note || ''
                }))
            );
        } else {
            // Default 2 splits
            setSplits([
                {
                    id: `split-0-${Date.now()}`,
                    category: currentCategory || (categories[0] || 'Σούπερ Μάρκετ'),
                    amount: '',
                    note: currentNote || ''
                },
                {
                    id: `split-1-${Date.now() + 1}`,
                    category: '',
                    amount: '',
                    note: ''
                }
            ]);
        }
    }, [isOpen]);

    // Calculate sum of split amounts
    const currentSum = useMemo(() => {
        return splits.reduce((acc, s) => {
            const val = parseFloat(s.amount);
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
    }, [splits]);

    const remaining = useMemo(() => {
        const rem = Math.round((targetTotal - currentSum) * 100) / 100;
        return Math.abs(rem) < 0.001 ? 0 : rem;
    }, [targetTotal, currentSum]);

    const isSumMatched = Math.abs(targetTotal - currentSum) < 0.01 && targetTotal > 0;

    const handleUpdateSplit = (id, field, value) => {
        setValidationError('');
        setSplits(prev =>
            prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    const handleAddSplit = () => {
        setValidationError('');
        // Suggest remaining amount if positive
        const suggestedAmount = remaining > 0 ? remaining.toFixed(2) : '';
        setSplits(prev => [
            ...prev,
            {
                id: `split-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                category: '',
                amount: suggestedAmount,
                note: ''
            }
        ]);
    };

    const handleRemoveSplit = (id) => {
        if (splits.length <= 2) return;
        setValidationError('');
        setSplits(prev => prev.filter(s => s.id !== id));
    };

    const handleFillRemainder = (id) => {
        if (remaining <= 0) return;
        setSplits(prev =>
            prev.map(s => {
                if (s.id === id) {
                    const currentVal = parseFloat(s.amount) || 0;
                    const nextVal = Math.round((currentVal + remaining) * 100) / 100;
                    return { ...s, amount: nextVal > 0 ? nextVal.toFixed(2) : '' };
                }
                return s;
            })
        );
    };

    const handleAutoSyncTotal = () => {
        if (currentSum > 0) {
            setTargetTotal(Math.round(currentSum * 100) / 100);
            setValidationError('');
        }
    };

    const handleSave = () => {
        // Validation checks
        if (splits.length < 2) {
            setValidationError(t('split_error_min_categories') || 'Απαιτούνται τουλάχιστον 2 κατηγορίες.');
            return;
        }

        for (let i = 0; i < splits.length; i++) {
            const s = splits[i];
            if (!s.category || !s.category.trim()) {
                setValidationError(t('split_error_category') || 'Επιλέξτε κατηγορία για κάθε διαχωρισμό.');
                return;
            }
            const val = parseFloat(s.amount);
            if (isNaN(val) || val <= 0) {
                setValidationError(t('split_error_amount') || 'Το ποσό κάθε διαχωρισμού πρέπει να είναι μεγαλύτερο από 0.');
                return;
            }
        }

        if (targetTotal <= 0) {
            setValidationError(t('amount_positive_error') || 'Το συνολικό ποσό πρέπει να είναι θετικό.');
            return;
        }

        if (Math.abs(currentSum - targetTotal) >= 0.01) {
            const sumStr = currentSum.toFixed(2);
            const totalStr = targetTotal.toFixed(2);
            const msg = (t('split_error_sum') || 'Το άθροισμα των κατηγοριών ({sum}€) πρέπει να ισούται με το συνολικό ποσό ({total}€).')
                .replace('{sum}', sumStr)
                .replace('{total}', totalStr);
            setValidationError(msg);
            return;
        }

        // Clean splits payload
        const cleaned = splits.map(s => ({
            category: s.category.trim(),
            category_id: s.category.trim(),
            amount: Math.round(parseFloat(s.amount) * 100) / 100,
            note: (s.note || '').trim().substring(0, 100)
        }));

        onApplySplits(cleaned, targetTotal);
        onClose();
    };

    const handleCancelAndRemoveSplits = () => {
        onApplySplits([], targetTotal);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="split-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-gray-100/95 dark:bg-surface-dark2 rounded-t-2xl sm:rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden text-gray-900 dark:text-white animate-scale-in"
            >
                    {/* Header */}
                    <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/70 dark:bg-surface-dark/50 shrink-0">
                        <div>
                            <h3 id="split-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('split_transaction_title') || 'Διαχωρισμός Συναλλαγής'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('split_transaction_desc') || 'Σπάσε το ποσό της συναλλαγής σε περισσότερες κατηγορίες.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Total & Summary Allocation Bar */}
                    <div className="p-4 bg-white dark:bg-surface-dark3/60 border-b border-gray-200 dark:border-white/10 shrink-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <span className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                    {t('split_total_amount') || 'Συνολικό Ποσό'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-400 font-bold">{currency}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={targetTotal || ''}
                                        onChange={(e) => {
                                            setValidationError('');
                                            setTargetTotal(parseFloat(e.target.value) || 0);
                                        }}
                                        placeholder="0.00"
                                        className="w-28 py-1.5 px-2.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-lg text-base font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all tabular-nums"
                                    />
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                    {t('split_allocated') || 'Κατανεμήθηκαν'}
                                </span>
                                <div className="text-base font-bold tabular-nums text-gray-900 dark:text-white">
                                    {currentSum.toFixed(2)} {currency}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                    {t('split_remaining') || 'Υπόλοιπο'}
                                </span>
                                <div className={`text-base font-bold tabular-nums ${
                                    isSumMatched
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : remaining > 0
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    {remaining.toFixed(2)} {currency}
                                </div>
                            </div>
                        </div>

                        {/* Remainder Auto-Match Pill if sum differs */}
                        {!isSumMatched && currentSum > 0 && (
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-white/5">
                                <span className="text-gray-500 dark:text-gray-400">
                                    {remaining > 0
                                        ? `Απομένουν ${remaining.toFixed(2)}${currency} προς κατανομή`
                                        : `Υπέρβαση κατά ${Math.abs(remaining).toFixed(2)}${currency}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAutoSyncTotal}
                                    className="font-bold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white underline transition-colors"
                                >
                                    Προσαρμογή συνόλου σε {currentSum.toFixed(2)}{currency}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Split Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px]">
                        {splits.map((split, index) => {
                            const parsedSplitAmt = parseFloat(split.amount) || 0;
                            return (
                                <div
                                    key={split.id}
                                    className="p-3.5 bg-white dark:bg-surface-dark3 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-2.5 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                                                ΜΕΡΟΣ {index + 1}
                                            </span>
                                            {split.category && (
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    • {getCategoryTranslation(split.category, t)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {remaining > 0 && parsedSplitAmt <= 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleFillRemainder(split.id)}
                                                    className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 rounded border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    + {remaining.toFixed(2)}{currency}
                                                </button>
                                            )}
                                            {splits.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSplit(split.id)}
                                                    className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                                                    title={t('split_remove') || 'Αφαίρεση'}
                                                    aria-label="Remove split"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category Select */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                            {t('category_label') || 'Κατηγορία'}
                                        </label>
                                        <CustomSelect
                                            value={split.category}
                                            onChange={(val) => handleUpdateSplit(split.id, 'category', val)}
                                            options={categoryOptions}
                                            placeholder={t('select_category') || 'Επιλογή κατηγορίας…'}
                                            searchable
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Amount and Note inputs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                                {t('amount') || 'Ποσό'} ({currency})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={split.amount}
                                                onChange={(e) => handleUpdateSplit(split.id, 'amount', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full py-2 px-3 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all tabular-nums"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1 uppercase tracking-widest">
                                                {t('note_placeholder') || 'Σημείωση'}
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={split.note}
                                                onChange={(e) => handleUpdateSplit(split.id, 'note', e.target.value)}
                                                placeholder={index === 0 ? 'π.χ. Τρόφιμα' : 'π.χ. Είδη καθαρισμού'}
                                                className="w-full py-2 px-3 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Split Button */}
                        <button
                            type="button"
                            onClick={handleAddSplit}
                            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 dark:border-white/15 hover:border-gray-400 dark:hover:border-white/30 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white bg-white/40 dark:bg-surface-dark3/30 transition-all font-semibold text-xs flex items-center justify-center gap-1.5"
                        >
                            <Plus size={15} />
                            <span>{t('split_add_category') || 'Προσθήκη Κατηγορίας'}</span>
                        </button>
                    </div>

                    {/* Validation Error Banner */}
                    {validationError && (
                        <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-500/10 border-t border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gray-50 dark:bg-surface-dark border-t border-gray-200 dark:border-white/10 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancelAndRemoveSplits}
                                className="flex-1 h-11 py-2.5 px-4 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center text-center whitespace-nowrap"
                            >
                                <span className="truncate">{t('split_cancel') || 'Ακύρωση'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex-1 h-11 py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
                            >
                                <Check size={16} className="shrink-0" />
                                <span className="truncate">{t('split_apply') || 'Εφαρμογή'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
