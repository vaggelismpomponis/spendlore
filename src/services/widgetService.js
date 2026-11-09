import { Capacitor } from '@capacitor/core';
import logger from '../utils/logger';

let lastWidgetSyncTime = 0;

/**
 * Formats and sends the current Safe-to-Burn calculation to the native Android AppWidget.
 *
 * @param {Object} data
 * @param {number} data.stb - Calculated Safe-to-Burn amount
 * @param {number} data.todayStartingBudget - Starting daily budget allocation
 * @param {number} data.todaySpend - Amount spent today
 * @param {string} data.currency - Currency symbol (e.g. '€')
 * @param {string} data.language - Active language code ('el' or 'en')
 */
export const updateNativeWidget = async (data = {}, options = {}) => {
    if (!Capacitor.isNativePlatform()) return false;

    try {
        const {
            stb = 0,
            todayStartingBudget = 0,
            todaySpend = 0,
            currency = '€',
            language = 'el'
        } = data;

        const hasIncome = (todayStartingBudget || 0) > 0 || (todaySpend || 0) > 0;
        const isOver = hasIncome && (stb || 0) <= 0;

        let formattedAmount = '—';
        let label = language === 'el' ? 'Διαθέσιμο σήμερα' : 'Safe today';

        if (!hasIncome) {
            formattedAmount = '—';
            label = language === 'el' ? 'Χωρίς Έσοδα' : 'No Income Set';
        } else if (isOver) {
            formattedAmount = `0,00 ${currency}`;
            label = language === 'el' ? 'Όριο εξαντλήθηκε' : 'Limit Exceeded';
        } else {
            const num = Math.max(0, stb || 0);
            const formattedNum = num.toLocaleString(language === 'el' ? 'el-GR' : 'en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            formattedAmount = `${formattedNum} ${currency}`;
            label = language === 'el' ? 'Διαθέσιμο σήμερα' : 'Safe today';
        }

        // Throttle updates (skip if called within 500ms, unless forced or in test)
        const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
        const now = Date.now();
        if (!options.force && !isTestEnv && now - lastWidgetSyncTime < 500) return true;
        lastWidgetSyncTime = now;

        const TransactionReader = window.Capacitor?.Plugins?.TransactionReader;
        if (TransactionReader?.updateWidget) {
            await TransactionReader.updateWidget({
                amount: formattedAmount,
                label,
                isOver,
                hasIncome
            });
            return true;
        }
        return false;
    } catch (err) {
        logger.warn('Failed to update native widget data', err, 'widgetService');
        return false;
    }
};

export default {
    updateNativeWidget
};

