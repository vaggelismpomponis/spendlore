import React from 'react';
import { Hourglass, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateCoolingOffStats, getTimeRemaining } from '../utils/coolingOff';
import Amount from './Amount';

const CoolingOffHomeWidget = ({ onOpen, language = 'el' }) => {
    const isEL = language === 'el';
    const items = useAppStore(state => state.coolingOffItems || []);
    const stats = calculateCoolingOffStats(items);

    const activeList = items.filter(i => i.status === 'active');
    const expiredList = activeList.filter(i => getTimeRemaining(i.expiresAt).isExpired);
    const hasReadyDecisions = expiredList.length > 0;

    return (
        <div
            onClick={onOpen}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-4 ${
                hasReadyDecisions
                    ? 'bg-amber-500/[0.06] border-amber-500/30 hover:bg-amber-500/[0.1] hover:border-amber-500/50'
                    : 'bg-gray-100/90 dark:bg-surface-dark2 border-gray-200 dark:border-white/10 hover:bg-gray-200/60 dark:hover:bg-white/[0.06]'
            }`}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                    hasReadyDecisions
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}>
                    <Hourglass size={20} className={hasReadyDecisions ? "animate-pulse" : ""} strokeWidth={2.3} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                            {isEL ? 'Κανόνας 72 Ωρών (Cooling-Off)' : '72-Hour Cooling-Off Rule'}
                        </span>
                        {hasReadyDecisions && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                                {isEL ? 'Αποφαση' : 'Decision'}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 truncate">
                        {hasReadyDecisions
                            ? (isEL ? `${expiredList.length} αγορά είναι έτοιμη για τελική απόφαση!` : `${expiredList.length} purchase ready for your final decision!`)
                            : stats.totalSaved > 0
                            ? (isEL ? `Έχεις γλιτώσει €${stats.totalSaved.toFixed(0)} από παρορμητικές αγορές.` : `You've saved €${stats.totalSaved.toFixed(0)} from impulse purchases.`)
                            : activeList.length > 0
                            ? (isEL ? `${activeList.length} αντικείμενα υπό ενεργή αναμονή.` : `${activeList.length} items in active cooling-off.`)
                            : (isEL ? 'Βάλτε σε αναμονή αγορές πριν αποφασίσετε.' : 'Park impulse urges for 72 hours before buying.')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {stats.totalSaved > 0 && !hasReadyDecisions && (
                    <span className="hidden sm:inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +<Amount value={stats.totalSaved} /> {isEL ? 'κέρδος' : 'saved'}
                    </span>
                )}
                <ChevronRight size={18} className="text-gray-400 dark:text-white/40 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
        </div>
    );
};

export default CoolingOffHomeWidget;

