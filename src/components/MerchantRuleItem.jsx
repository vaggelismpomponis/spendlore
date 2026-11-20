import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, ArrowRight, MoreHorizontal } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import CategoryIcon from './CategoryIcon';

export default function MerchantRuleItem({ rule, onEdit, onDelete }) {
    const { language = 'el' } = useSettings();
    const isEL = language === 'el';
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [menuOpen]);

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

            {/* Right: Actions menu with dots */}
            <div className="relative self-end sm:self-center shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="More options"
                    aria-label="More options"
                >
                    <MoreHorizontal size={18} />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-30 min-w-[160px] w-auto p-1.5 bg-white dark:bg-surface-dark2 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 animate-fade-in text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onEdit(rule); }}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <Pencil size={15} className="shrink-0 text-gray-500 dark:text-gray-400" />
                            <span>{isEL ? 'Επεξεργασία κανόνα' : 'Edit rule'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onDelete(rule); }}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <Trash2 size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                            <span>{isEL ? 'Διαγραφή κανόνα' : 'Delete rule'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
