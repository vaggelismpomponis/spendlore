import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

const BASE_EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Βενζίνη', 'Υγεία', 'Άλλο'];
const BASE_INCOME_CATEGORIES = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλα Έσοδα'];

export default function MerchantRuleModal({ isOpen, onClose, editingRule = null, onSave }) {
    const { t: translate, customCategories } = useSettings();
    const { showToast } = useToast();

    const [pattern, setPattern] = useState('');
    const [category, setCategory] = useState('Σούπερ Μάρκετ');
    const [type, setType] = useState('expense');
    const [exactMatch, setExactMatch] = useState(false);

    useEffect(() => {
        if (editingRule) {
            setPattern(editingRule.merchantPattern || '');
            setCategory(editingRule.category || 'Σούπερ Μάρκετ');
            setType(editingRule.type || 'expense');
            setExactMatch(Boolean(editingRule.exactMatch));
        } else {
            setPattern('');
            setCategory(type === 'income' ? 'Μισθός' : 'Σούπερ Μάρκετ');
            setExactMatch(false);
        }
    }, [editingRule, isOpen, type]);

    if (!isOpen) return null;

    const availableCategories = type === 'income'
        ? [...BASE_INCOME_CATEGORIES, ...(customCategories?.income || [])]
        : [...BASE_EXPENSE_CATEGORIES, ...(customCategories?.expense || [])];

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedPattern = pattern.trim();
        if (!trimmedPattern) {
            showToast('Παρακαλώ εισάγετε τουλάχιστον μία λέξη-κλειδί.', 'error');
            return;
        }
        onSave({ merchantPattern: trimmedPattern, category, type, exactMatch });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {editingRule ? (translate('edit_merchant_rule') || 'Επεξεργασία Κανόνα') : (translate('add_merchant_rule') || 'Νέος Κανόνας')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {translate('merchant_rules_desc') || 'Αυτόματη αντιστοίχιση εμπόρου σε κατηγορία'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors" aria-label="Κλείσιμο">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">Τύπος Συναλλαγής</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/70 dark:bg-white/[0.06] rounded-xl">
                            <button type="button" onClick={() => { setType('expense'); setCategory('Σούπερ Μάρκετ'); }} className={`py-1.5 text-xs font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Έξοδο</button>
                            <button type="button" onClick={() => { setType('income'); setCategory('Μισθός'); }} className={`py-1.5 text-xs font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Έσοδο</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">{translate('merchant_keywords_label') || 'Λέξεις-κλειδιά Εμπόρου'}</label>
                        <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder={translate('merchant_keywords_placeholder') || 'π.χ. ΣΚΛΑΒΕΝΙΤΗΣ, LIDL, MARKET IN'} className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all" autoFocus />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{translate('merchant_keywords_help') || 'Χωρίστε πολλαπλές λέξεις-κλειδιά με κόμμα.'}</p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">{translate('target_category_label') || 'Κατηγορία Στόχος'}</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all cursor-pointer">
                            {availableCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input type="checkbox" id="exactMatchCheckbox" checked={exactMatch} onChange={(e) => setExactMatch(e.target.checked)} className="w-4 h-4 rounded text-gray-950 focus:ring-0 dark:bg-surface-dark3 dark:border-white/20" />
                        <label htmlFor="exactMatchCheckbox" className="text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">{translate('exact_match_label') || 'Ακριβής ταύτιση ονόματος (όχι υπο-λέξεις)'}</label>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm">Ακύρωση</button>
                        <button type="submit" className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Check size={16} />
                            <span>{translate('save_changes') || 'Αποθήκευση'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
