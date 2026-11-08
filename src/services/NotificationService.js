import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Request notification permissions (required for iOS/Android 13+)
 */
export const requestNotificationPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return true;

    try {
        const { display } = await LocalNotifications.requestPermissions();
        return display === 'granted';
    } catch (e) {
        console.warn('Failed to request notification permissions:', e);
        return false;
    }
};

/**
 * Schedules a regret check-in for a transaction 14 days in the future.
 * Only triggers if the amount is > 2000 cents (€20).
 */
export const scheduleRegretCheckin = async (transaction) => {
    if (!transaction || transaction.type !== 'expense' || transaction.amount <= 2000) {
        return;
    }

    if (Capacitor.isNativePlatform()) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return;
    }

    // Schedule for 14 days from now
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 14);

    const currency = typeof localStorage !== 'undefined' ? (localStorage.getItem('currency') || '€') : '€';
    const language = typeof localStorage !== 'undefined' ? (localStorage.getItem('language') || 'el') : 'el';
    const isGreek = language === 'el' || (!language && typeof navigator !== 'undefined' && navigator.language?.startsWith('el'));
    const formattedAmount = (transaction.amount / 100).toFixed(2);

    const title = isGreek ? 'Αξιολόγηση Δαπάνης' : 'Expense Review';
    const body = isGreek
        ? `Έχουν περάσει 14 ημέρες από τη δαπάνη ${formattedAmount}${currency}. Ήταν χρήσιμη η αγορά σας;`
        : `It has been 14 days since your ${formattedAmount}${currency} purchase. Was it worth it?`;

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: Math.floor(Math.random() * 1000000),
                    schedule: { at: scheduleDate },
                    smallIcon: 'ic_stat_spendlore',
                    largeIcon: 'ic_spendlore_logo',
                    iconColor: '#7C3AED',
                    extra: {
                        transactionId: transaction.id,
                        action: 'regret_checkin'
                    },
                }
            ]
        });
        console.log(`Scheduled check-in for transaction ${transaction.id} on ${scheduleDate.toISOString()}`);
    } catch (e) {
        console.warn('Failed to schedule local notification:', e);
    }
};

/**
 * Schedules a local reminder when the 72-hour cooling-off countdown expires.
 */
export const scheduleCoolingOffNotification = async (item) => {
    if (!item || !item.expiresAt) return;
    if (!Capacitor.isNativePlatform()) return;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const scheduleDate = new Date(item.expiresAt);
    if (scheduleDate.getTime() <= Date.now()) return;

    const currency = typeof localStorage !== 'undefined' ? (localStorage.getItem('currency') || '€') : '€';
    const language = typeof localStorage !== 'undefined' ? (localStorage.getItem('language') || 'el') : 'el';
    const isGreek = language === 'el' || (!language && typeof navigator !== 'undefined' && navigator.language?.startsWith('el'));
    const formattedAmount = (Number(item.amount) || 0).toFixed(2);

    const title = isGreek ? '72 Ώρες Αναμονής Ολοκληρώθηκαν!' : '72-Hour Cooling-Off Complete!';
    const body = isGreek
        ? `Το αντικείμενο "${item.title}" (${currency}${formattedAmount}) πέρασε την περίοδο ψυχραιμίας. Το χρειάζεσαι ακόμα;`
        : `"${item.title}" (${currency}${formattedAmount}) finished cooling off. Do you still need it?`;

    const notificationId = Math.abs((item.id || '').split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 1000000;

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: notificationId,
                    schedule: { at: scheduleDate },
                    smallIcon: 'ic_stat_spendlore',
                    largeIcon: 'ic_spendlore_logo',
                    iconColor: '#7C3AED',
                    extra: {
                        coolingOffId: item.id,
                        action: 'cooling_off_decision'
                    }
                }
            ]
        });
    } catch (e) {
        console.warn('Failed to schedule cooling-off notification:', e);
    }
};
