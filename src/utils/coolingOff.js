/**
 * 72-Hour Cooling-Off Wishlist Utility & Calculations
 * Anti-Impulse Buying Behavioral Friction Tool
 */

export const DEFAULT_COOLING_OFF_HOURS = 72;

export const DURATION_OPTIONS = [
    { hours: 24, labelEl: '24 Ώρες (1 ημέρα)', labelEn: '24 Hours (1 day)' },
    { hours: 48, labelEl: '48 Ώρες (2 ημέρες)', labelEn: '48 Hours (2 days)' },
    { hours: 72, labelEl: '72 Ώρες (3 ημέρες - Συνιστώμενο)', labelEn: '72 Hours (3 days - Recommended)' },
    { hours: 168, labelEl: '7 Ημέρες (1 εβδομάδα)', labelEn: '7 Days (1 week)' },
];

/**
 * Creates a new Cooling-Off impulse item.
 */
export const createCoolingOffItem = ({
    title,
    amount,
    category = 'Άλλο',
    note = '',
    durationHours = DEFAULT_COOLING_OFF_HOURS
}) => {
    const now = new Date();
    const duration = Number(durationHours) || DEFAULT_COOLING_OFF_HOURS;
    const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

    return {
        id: `co_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: (title || '').trim(),
        amount: Math.max(0, parseFloat(amount) || 0),
        category: category || 'Άλλο',
        note: (note || '').trim(),
        durationHours: duration,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'active', // 'active' | 'passed' | 'bought'
        decidedAt: null,
        savedAmount: 0
    };
};

/**
 * Calculates time remaining until cooling-off expires.
 */
export const getTimeRemaining = (expiresAt, nowMs = Date.now()) => {
    if (!expiresAt) {
        return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, percentRemaining: 0 };
    }

    const expiryTime = new Date(expiresAt).getTime();
    const totalMs = expiryTime - nowMs;

    if (totalMs <= 0) {
        return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, percentRemaining: 0 };
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        totalMs,
        hours,
        minutes,
        seconds,
        isExpired: false
    };
};

/**
 * Computes analytics and statistics over user's cooling-off list.
 */
export const calculateCoolingOffStats = (items = []) => {
    const list = Array.isArray(items) ? items : [];

    let totalSaved = 0;
    let passedCount = 0;
    let boughtCount = 0;
    let activeCount = 0;
    let activeTotalAmount = 0;
    let readyForDecisionCount = 0;

    const now = Date.now();

    for (const item of list) {
        const amt = Number(item.amount) || 0;

        if (item.status === 'passed') {
            passedCount += 1;
            totalSaved += (item.savedAmount !== undefined && item.savedAmount !== null ? Number(item.savedAmount) : amt);
        } else if (item.status === 'bought') {
            boughtCount += 1;
        } else if (item.status === 'active') {
            activeCount += 1;
            activeTotalAmount += amt;

            if (item.expiresAt && new Date(item.expiresAt).getTime() <= now) {
                readyForDecisionCount += 1;
            }
        }
    }

    const decidedTotal = passedCount + boughtCount;
    const successRate = decidedTotal > 0 ? Math.round((passedCount / decidedTotal) * 100) : 0;

    return {
        totalSaved,
        passedCount,
        boughtCount,
        activeCount,
        activeTotalAmount,
        readyForDecisionCount,
        decidedTotal,
        successRate
    };
};

