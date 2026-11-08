import React from 'react';
import { PiggyBank, Target, Hourglass, ShieldCheck } from 'lucide-react';
import Amount from './Amount';

const CoolingOffStats = ({ stats, language = 'el' }) => {
    const isEL = language === 'el';
    const { totalSaved = 0, successRate = 0, activeCount = 0, activeTotalAmount = 0, readyForDecisionCount = 0 } = stats || {};

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Total Money Saved */}
            <div className="bg-gray-100/90 dark:bg-surface-dark2 border border-emerald-500/20 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                        {isEL ? 'Χρήματα που Γλίτωσες' : 'Impulse Money Saved'}
                    </span>
                    <PiggyBank size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.3} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    <Amount value={totalSaved} isIncome={true} />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isEL ? 'Από παρορμητικές αγορές που ακυρώθηκαν' : 'From cancelled impulse purchases'}
                </p>
            </div>

            {/* Avoided Impulse Rate */}
            <div className="bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                        {isEL ? 'Ποσοστό Εγκράτειας' : 'Discipline Rate'}
                    </span>
                    <Target size={18} className="text-gray-700 dark:text-gray-300 shrink-0" strokeWidth={2.3} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                    {successRate}%
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isEL ? 'Των πειρασμών ξεπερνιούνται μετά από 72 ώρες' : 'Of impulse urges fade after 72 hours'}
                </p>
            </div>

            {/* In Cooling-off / Ready for Decision */}
            <div className="bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                        {isEL ? 'Σε Ψυχραιμία' : 'In Cooling-Off'}
                    </span>
                    <Hourglass size={18} className={readyForDecisionCount > 0 ? "text-amber-500 shrink-0 animate-pulse" : "text-gray-700 dark:text-gray-300 shrink-0"} strokeWidth={2.3} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tabular-nums flex items-baseline gap-2">
                    <span>{activeCount}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        (<Amount value={activeTotalAmount} />)
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {readyForDecisionCount > 0
                        ? (isEL ? `${readyForDecisionCount} έτοιμα για τελική απόφαση!` : `${readyForDecisionCount} ready for decision!`)
                        : (isEL ? 'Αντικείμενα υπό ενεργή αντίστροφη μέτρηση' : 'Items under active countdown')}
                </p>
            </div>
        </div>
    );
};

export default CoolingOffStats;

