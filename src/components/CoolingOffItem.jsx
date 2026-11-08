import React from 'react';
import { Hourglass, CheckCircle2, ShoppingBag, Trash2, Clock, Plus, Tag } from 'lucide-react';
import Amount from './Amount';
import { getTimeRemaining } from '../utils/coolingOff';
import CategoryIcon from './CategoryIcon';

const CoolingOffItem = ({
    item,
    language = 'el',
    onPass,
    onBuy,
    onExtend,
    onDelete
}) => {
    const isEL = language === 'el';
    const rem = getTimeRemaining(item.expiresAt);
    const isExpired = rem.isExpired;

    return (
        <div className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3.5 shadow-sm ${
            item.status === 'passed'
                ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                : item.status === 'bought'
                ? 'bg-gray-100/60 dark:bg-surface-dark2 border-gray-200 dark:border-white/10 opacity-80'
                : isExpired
                ? 'bg-amber-500/[0.05] border-amber-500/40 ring-1 ring-amber-500/30'
                : 'bg-gray-100/90 dark:bg-surface-dark2 border-gray-200 dark:border-white/10'
        }`}>
            {/* Header: Title, Category, Amount & Delete */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                            {item.title}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-200/70 dark:bg-white/[0.08] text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            <CategoryIcon category={item.category} size={12} className="shrink-0" />
                            <span>{item.category}</span>
                        </span>
                    </div>
                    {item.note && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            "{item.note}"
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tabular-nums">
                            <Amount value={item.amount} />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title={isEL ? 'Διαγραφή' : 'Delete'}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Status & Timer Bar */}
            {item.status === 'active' && !isExpired && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/70 dark:border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold">
                        <Clock size={15} className="shrink-0 animate-pulse" />
                        <span>
                            {isEL ? 'Απομένουν' : 'Left'}: {rem.hours > 0 ? `${rem.hours}ω ` : ''}{rem.minutes}λ
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onExtend(item.id, 24)}
                        className="px-2.5 py-1 rounded-lg bg-gray-200/60 dark:bg-white/[0.06] hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-[11px] font-bold transition-all"
                    >
                        +24ω
                    </button>
                </div>
            )}

            {/* Decision Prompt when 72 hours elapsed */}
            {item.status === 'active' && isExpired && (
                <div className="pt-2 border-t border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                        <Hourglass size={15} className="shrink-0" />
                        <span>{isEL ? 'Πέρασαν οι 72 ώρες! Το χρειάζεσαι ακόμα;' : '72 hours have passed! Do you still need it?'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => onPass(item.id)}
                            className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                            <CheckCircle2 size={15} />
                            <span>{isEL ? 'Γλίτωσα τα χρήματα!' : 'Skipped! Saved Money'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onBuy(item)}
                            className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                            <ShoppingBag size={15} />
                            <span>{isEL ? 'Ναι, Αγορά' : 'Yes, Buy'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Completed status badges */}
            {item.status === 'passed' && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs pt-1 border-t border-emerald-500/10">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{isEL ? 'Αποφεύχθηκε με επιτυχία! Γλίτωσες τα χρήματα.' : 'Impulse avoided! Money saved.'}</span>
                </div>
            )}

            {item.status === 'bought' && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-xs pt-1 border-t border-gray-200/50 dark:border-white/[0.05]">
                    <ShoppingBag size={15} className="shrink-0" />
                    <span>{isEL ? 'Αγοράστηκε συνειδητά μετά τη λήξη της αναμονής.' : 'Consciously purchased after cooling-off.'}</span>
                </div>
            )}
        </div>
    );
};

export default CoolingOffItem;
