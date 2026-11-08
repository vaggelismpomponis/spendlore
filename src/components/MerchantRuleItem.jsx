import React from 'react';
import { Pencil, Trash2, ArrowRight } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function MerchantRuleItem({ rule, onEdit, onDelete }) {
    const keywords = (rule.merchantPattern || '').split(/[,|]/).map(k => k.trim()).filter(Boolean);

    return (
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                    {keywords.slice(0, 5).map((kw, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.08] text-[11px] font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10"
                        >
                            {kw}
                        </span>
                    ))}
                    {keywords.length > 5 && (
                        <span className="text-[11px] font-bold text-gray-400">
                            +{keywords.length - 5} ακόμη
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                    <ArrowRight size={13} className="text-gray-400 shrink-0" />
                    <CategoryIcon category={rule.category} size={15} />
                    <span>{rule.category}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                        {rule.type === 'income' ? 'Έσοδο' : 'Έξοδο'}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                    type="button"
                    onClick={() => onEdit(rule)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    aria-label="Επεξεργασία"
                >
                    <Pencil size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(rule)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    aria-label="Διαγραφή"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

