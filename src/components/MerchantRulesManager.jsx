import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { matchMerchantRule } from '../utils/merchantRules';
import ConfirmationModal from './ConfirmationModal';
import MerchantRuleModal from './MerchantRuleModal';
import MerchantRuleItem from './MerchantRuleItem';

export default function MerchantRulesManager({ rules = [], onAdd, onEdit, onDelete, onRestoreStarter }) {
    const { t: translate } = useSettings();
    const [testQuery, setTestQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const testMatch = useMemo(() => {
        if (!testQuery.trim()) return null;
        return matchMerchantRule(testQuery, rules, 'expense') || matchMerchantRule(testQuery, rules, 'income');
    }, [testQuery, rules]);

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {translate('merchant_rules_tab') || 'Κανόνες Εμπόρων'} ({rules.length})
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRestoreStarter}
                        className="py-2 px-3 text-xs font-bold rounded-xl bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] transition-all flex items-center gap-1.5"
                    >
                        <RefreshCw size={13} />
                        <span>{translate('restore_starter_rules') || 'Προτεινόμενοι Κανόνες'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setEditingRule(null); setModalOpen(true); }}
                        className="py-2 px-3.5 text-xs font-bold rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <Plus size={15} />
                        <span>{translate('add_merchant_rule') || 'Νέος Κανόνας'}</span>
                    </button>
                </div>
            </div>

            {/* Interactive Live Tester Card */}
            <div className="p-4 rounded-xl bg-gray-200/50 dark:bg-white/[0.03] border border-gray-300/60 dark:border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    <Search size={13} />
                    <span>{translate('merchant_rule_test_title') || 'Δοκιμή Κανόνα σε Πραγματικό Χρόνο'}</span>
                </div>
                <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder={translate('merchant_rule_test_placeholder') || 'Πληκτρολογήστε όνομα εμπόρου (π.χ. Σκλαβενίτης, Wolt, Shell)...'}
                    className="w-full py-2 px-3 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                />
                {testQuery.trim() && (
                    <div className="pt-1 text-xs">
                        {testMatch ? (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 size={14} className="shrink-0" />
                                <span>
                                    Ταυτοποιήθηκε: «{testMatch.matchedPattern}» ➔ Κατηγορία: <strong>{testMatch.category}</strong>
                                </span>
                            </div>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                                {translate('merchant_rule_test_nomatch') || 'Δεν βρέθηκε κανόνας (θα χρησιμοποιηθεί η προεπιλογή).'}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Rules List */}
            {rules.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-gray-100/60 dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 space-y-3">
                    <SlidersHorizontal size={28} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {translate('no_merchant_rules_title') || 'Δεν έχουν οριστεί κανόνες'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                            {translate('no_merchant_rules_desc') || 'Προσθέστε κανόνες για αυτόματη αντιστοίχιση ή φορτώστε τους προτεινόμενους.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onRestoreStarter}
                        className="py-2 px-4 text-xs font-bold rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-all inline-flex items-center gap-1.5"
                    >
                        <RefreshCw size={13} />
                        <span>{translate('restore_starter_rules') || 'Φόρτωση Προτεινόμενων'}</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {rules.map((rule) => (
                        <MerchantRuleItem
                            key={rule.id}
                            rule={rule}
                            onEdit={(r) => { setEditingRule(r); setModalOpen(true); }}
                            onDelete={(r) => setDeleteTarget(r)}
                        />
                    ))}
                </div>
            )}

            {/* Edit / Add Modal */}
            <MerchantRuleModal
                isOpen={modalOpen}
                editingRule={editingRule}
                onClose={() => { setModalOpen(false); setEditingRule(null); }}
                onSave={(ruleData) => {
                    if (editingRule) {
                        onEdit(editingRule.id, ruleData);
                    } else {
                        onAdd(ruleData);
                    }
                }}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) {
                        onDelete(deleteTarget.id);
                        setDeleteTarget(null);
                    }
                }}
                title={translate('delete_category') || 'Διαγραφή Κανόνα'}
                message={`Είστε βέβαιοι ότι θέλετε να διαγράψετε τον κανόνα για «${deleteTarget?.merchantPattern}»;`}
                confirmText="Διαγραφή"
                isDanger
            />
        </div>
    );
}
