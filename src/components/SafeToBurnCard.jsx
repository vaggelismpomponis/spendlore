import React from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle } from 'lucide-react';
import Amount from './Amount';
import { useSettings } from '../contexts/SettingsContext';

const SafeToBurnCard = ({
    stbData: propStbData,
    stb,
    todayStartingBudget,
    isGlideActive,
    streak,
    t: propT,
    stats,
    onClick,
    className = ""
}) => {
    const { t: contextT } = useSettings();
    const t = propT || contextT;

    const data = propStbData || {
        stb: stb ?? 0,
        todayStartingBudget: todayStartingBudget ?? 0,
        todaySpend: stats?.todaySpend ?? 0,
        streak: streak ?? 0,
        isGlideActive: isGlideActive ?? false
    };

    if (!data) return null;

    const hasNoIncome = data.todayStartingBudget <= 0 && (data.todaySpend || 0) === 0;
    const isOverLimit = data.stb <= 0 && !hasNoIncome;

    return (
        <motion.div
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
            className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2 transition-all bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-white/20' : ''} ${className}`.trim()}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Flame size={16} className="text-amber-500 shrink-0 sm:w-[18px] sm:h-[18px]" />
                    <div className="flex items-baseline gap-1.5 sm:block">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            Safe-to-Burn
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {t('safe_to_burn_daily') || 'Ημερήσιο Όριο'}
                        </p>
                    </div>
                </div>

                {hasNoIncome ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200/80 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                        <span>{t('no_income_set') || 'Χωρίς Έσοδα'}</span>
                    </span>
                ) : isOverLimit ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                        <AlertTriangle size={11} className="stroke-[2.5]" />
                        <span>{t('over_daily_limit') || 'Υπέρβαση Ορίου'}</span>
                    </span>
                ) : data.streak > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                        <Flame size={12} className="fill-orange-500 text-orange-500" />
                        <span>{data.streak} Streak</span>
                    </span>
                ) : null}
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
                <div className={`text-xl sm:text-2xl font-black tabular-nums font-display ${hasNoIncome
                        ? 'text-gray-500 dark:text-gray-400'
                        : isOverLimit
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-gray-900 dark:text-white'
                    }`}>
                    <Amount value={data.stb <= 0 ? 0 : data.stb} />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500">
                    {t('today') || 'Σήμερα'}
                </span>
            </div>

            <p className="text-[10.5px] sm:text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-1 sm:line-clamp-none">
                {hasNoIncome
                    ? (t('stb_no_income_desc') || 'Καταχώρισε τα έσοδα του μήνα για να υπολογιστεί το ασφαλές ημερήσιο όριο.')
                    : isOverLimit
                        ? (t('stb_exceeded_desc') || 'Έχεις εξαντλήσει το ασφαλές ημερήσιο όριο για σήμερα. Περιόρισε τα έξοδα για να επανέλθεις.')
                        : (t('safe_to_burn_desc') || 'Ημερήσιο ποσό που μπορείς να ξοδέψεις με ασφάλεια σήμερα.')}
            </p>
        </motion.div>
    );
};

export default SafeToBurnCard;
