import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Executive Guided Tour Bubble (Zero AI Visual Slop)
 * 
 * Complies with strict Spendlore executive design standards:
 * - Pure unboxed uppercase typography for step counters and overlines
 * - Crisp 1px structural borders and flat high-contrast cards (no gradients, no blobs)
 * - Pure unboxed Lucide icons inline with typography (no boxed containers)
 * - Balanced monochrome action buttons (rounded-xl, no rounded-full pill buttons)
 * - Greek monotonic toneless capitalization (ΒΗΜΑ 4 ΑΠΟ 5)
 */
const TourBubble = ({
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    isLastStep,
    size = 5,
}) => {
    const { t, language } = useSettings();
    const config = step.data || {};
    const Icon = config.Icon || null;

    const isEl = language === 'el';
    const stepCounterText = isEl
        ? `ΒΗΜΑ ${index + 1} ΑΠΟ ${size}`
        : `STEP ${index + 1} OF ${size}`;

    const title = t(config.titleKey) || step.title || '';
    const desc = t(config.descKey) || step.content || '';

    return (
        <motion.div
            {...tooltipProps}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[310px] max-w-[calc(100vw-24px)] sm:w-[350px] bg-white dark:bg-surface-dark2 border border-gray-200/90 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl relative z-[10002] select-none text-left"
        >
            {/* Top Progress Row: Segmented Bars + Step Counter + Close */}
            <div className="flex items-center justify-between gap-3 mb-3.5">
                {/* Discrete Segmented Progress Bars */}
                <div className="flex items-center gap-1.5 flex-1" aria-hidden="true">
                    {Array.from({ length: size }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                                i <= index
                                    ? 'bg-gray-900 dark:bg-white'
                                    : 'bg-gray-200 dark:bg-white/15'
                            }`}
                        />
                    ))}
                </div>

                {/* Pure Unboxed Step Counter */}
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest tabular-nums shrink-0">
                    {stepCounterText}
                </span>

                {/* Unboxed Close Button */}
                {step.hideCloseButton !== true && (
                    <button
                        {...closeProps}
                        type="button"
                        aria-label={t('close') || 'Close'}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* Content Body: Inline Unboxed Icon + Typography */}
            <div className="flex items-start gap-3 mt-1">
                {Icon && (
                    <div className="pt-0.5 shrink-0 text-gray-900 dark:text-white" aria-hidden="true">
                        <Icon size={20} strokeWidth={2.2} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-normal mt-1.5">
                        {desc}
                    </p>
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2.5 pt-3.5 mt-4 border-t border-gray-100 dark:border-white/5">
                {index > 0 ? (
                    <button
                        {...backProps}
                        type="button"
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                        <ArrowLeft size={14} />
                        <span>{t('onboarding_back') || 'Πίσω'}</span>
                    </button>
                ) : (
                    <button
                        {...closeProps}
                        type="button"
                        className="px-2.5 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors shrink-0"
                    >
                        {t('onboarding_skip') || 'Παράλειψη'}
                    </button>
                )}

                <button
                    {...primaryProps}
                    type="button"
                    className="flex-1 py-2 px-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                >
                    <span>
                        {isLastStep
                            ? (t('onboarding_finish') || 'Ολοκλήρωση')
                            : (t('onboarding_next') || 'Επόμενο')}
                    </span>
                    {!isLastStep && <ArrowRight size={14} />}
                </button>
            </div>
        </motion.div>
    );
};

export default TourBubble;
