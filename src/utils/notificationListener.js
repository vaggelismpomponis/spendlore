import { registerPlugin, Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import logger from './logger';

const TransactionReader = registerPlugin('TransactionReader');

export const setupNotificationListener = (onTransactionsFound, onConfirmedFound) => {
    if (!Capacitor.isNativePlatform()) return () => {};

    let isChecking = false;
    const seenPendingIds = new Set();
    const seenConfirmedIds = new Set();

    const trackAndFilter = (list, seenSet) => {
        if (!Array.isArray(list) || list.length === 0) return [];
        const unique = [];
        for (const item of list) {
            if (!item) continue;
            const id = item.id;
            if (id && seenSet.has(id)) continue;
            if (id) {
                if (seenSet.size > 200) {
                    const first = seenSet.values().next().value;
                    seenSet.delete(first);
                }
                seenSet.add(id);
            }
            unique.push(item);
        }
        return unique;
    };

    const checkTransactions = async () => {
        if (isChecking) return;
        isChecking = true;
        try {
            const result = await TransactionReader.getPendingTransactions();
            const txs = trackAndFilter(result?.transactions, seenPendingIds);
            const confirmedTxs = trackAndFilter(result?.confirmedTransactions, seenConfirmedIds);

            if (txs.length > 0 && typeof onTransactionsFound === 'function') {
                logger.info(`Received ${txs.length} pending notification payload(s)`, 'TransactionReader');
                onTransactionsFound(txs);
            }

            if (confirmedTxs.length > 0 && typeof onConfirmedFound === 'function') {
                logger.info(`Received ${confirmedTxs.length} confirmed notification quick-action(s)`, 'TransactionReader');
                onConfirmedFound(confirmedTxs);
            }
        } catch (e) {
            logger.warn(`TransactionReader getPendingTransactions error: ${e?.message || e}`, 'TransactionReader');
        } finally {
            isChecking = false;
        }
    };

    // 1. Initial check on mount
    checkTransactions();

    // 2. Check on app resume
    const appListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            checkTransactions();
        }
    });

    // 3. Listen for immediate native broadcast event when notification action buttons are tapped
    const pluginListener = TransactionReader.addListener('transactionsUpdated', () => {
        logger.info('Native transactionsUpdated event received', 'TransactionReader');
        checkTransactions();
    });

    // 4. Poll every 5 seconds as a continuous fallback
    const intervalId = setInterval(checkTransactions, 5000);

    return () => {
        appListener.then(handle => handle?.remove?.()).catch(() => {});
        pluginListener.then(handle => handle?.remove?.()).catch(() => {});
        clearInterval(intervalId);
    };
};

export const setNativeProStatus = async (isPro) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await TransactionReader.setProStatus({ isPro: Boolean(isPro) });
    } catch (e) {
        logger.warn(`Failed to update native Pro status: ${e?.message || e}`, 'TransactionReader');
    }
};

export const setAutoTrackingEnabled = async (enabled) => {
    const flag = Boolean(enabled);
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('spendlore_auto_tracking_enabled', flag ? 'true' : 'false');
        }
    } catch (_) {}
    if (!Capacitor.isNativePlatform()) return flag;
    try {
        const res = await TransactionReader.setAutoTrackingEnabled({ enabled: flag });
        return res?.enabled ?? flag;
    } catch (e) {
        logger.warn(`Failed to set native auto-tracking enabled: ${e?.message || e}`, 'TransactionReader');
        return flag;
    }
};

export const getAutoTrackingEnabled = async () => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
        const res = await TransactionReader.getAutoTrackingEnabled();
        if (typeof res?.enabled === 'boolean') {
            return res.enabled;
        }
    } catch (e) {
        logger.warn(`Failed to read native auto-tracking state: ${e?.message || e}`, 'TransactionReader');
    }
    try {
        if (typeof localStorage !== 'undefined') {
            const val = localStorage.getItem('spendlore_auto_tracking_enabled');
            if (val !== null) return val === 'true';
        }
    } catch (_) {}
    return true;
};

export const setNativeMerchantRules = async (rules) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await TransactionReader.setMerchantRules({
            rules: JSON.stringify(Array.isArray(rules) ? rules : [])
        });
    } catch (e) {
        logger.warn(`Failed to update native merchant rules: ${e?.message || e}`, 'TransactionReader');
    }
};

export const openNotificationSettings = async () => {
    try {
        await TransactionReader.openNotificationSettings();
    } catch (e) {
        logger.warn(`Failed to open notification settings: ${e?.message || e}`, 'TransactionReader');
    }
};

export const openPlayStoreUpdates = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            await TransactionReader.openPlayStore();
            return true;
        } catch (e) {
            logger.warn(`Failed to open Play Store: ${e?.message || e}`, 'TransactionReader');
        }
    }
    if (typeof window !== 'undefined') {
        window.open('https://play.google.com/store/apps/details?id=com.bomponis.spendwise', '_blank', 'noopener,noreferrer');
    }
    return false;
};

export const checkNotificationPermission = async () => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
        const result = await TransactionReader.checkPermission();
        return !!result?.granted;
    } catch (e) {
        logger.warn(`Failed to check notification permission: ${e?.message || e}`, 'TransactionReader');
        return false;
    }
};

export const isIgnoringBatteryOptimizations = async () => {
    if (!Capacitor.isNativePlatform()) return true;
    try {
        const result = await TransactionReader.isIgnoringBatteryOptimizations();
        return !!result?.isIgnoring;
    } catch (e) {
        logger.warn(`Failed to check battery optimization: ${e?.message || e}`, 'TransactionReader');
        return true;
    }
};

export const requestIgnoreBatteryOptimization = async () => {
    if (!Capacitor.isNativePlatform()) return { alreadyGranted: true };
    try {
        const result = await TransactionReader.requestIgnoreBatteryOptimization();
        return result || {};
    } catch (e) {
        logger.warn(`Failed to request ignore battery optimization: ${e?.message || e}`, 'TransactionReader');
        return { error: e?.message || e };
    }
};

export const openBatteryOptimizationSettings = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await TransactionReader.openBatteryOptimizationSettings();
    } catch (e) {
        logger.warn(`Failed to open battery optimization settings: ${e?.message || e}`, 'TransactionReader');
    }
};

export const openAutostartSettings = async () => {
    if (!Capacitor.isNativePlatform()) return { openedDirectly: false };
    try {
        const result = await TransactionReader.openAutostartSettings();
        return result || {};
    } catch (e) {
        logger.warn(`Failed to open autostart settings: ${e?.message || e}`, 'TransactionReader');
        return { openedDirectly: false, error: e?.message || e };
    }
};

export const getBackgroundPermissionsStatus = async () => {
    if (!Capacitor.isNativePlatform()) {
        return {
            notificationListener: true,
            batteryNoRestrictions: true,
            autostartSupported: false,
            manufacturer: 'web'
        };
    }
    try {
        const result = await TransactionReader.getBackgroundPermissionsStatus();
        return {
            notificationListener: !!result?.notificationListener,
            batteryNoRestrictions: !!result?.batteryNoRestrictions,
            autostartSupported: !!result?.autostartSupported,
            manufacturer: result?.manufacturer || 'unknown'
        };
    } catch (e) {
        logger.warn(`Failed to get background permissions status: ${e?.message || e}`, 'TransactionReader');
        return {
            notificationListener: false,
            batteryNoRestrictions: false,
            autostartSupported: false,
            manufacturer: 'unknown'
        };
    }
};
