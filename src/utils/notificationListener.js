import { registerPlugin, Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import logger from './logger';

const TransactionReader = registerPlugin('TransactionReader');

export const setupNotificationListener = (onTransactionsFound, onConfirmedFound) => {
    if (!Capacitor.isNativePlatform()) return () => {};

    const checkTransactions = async () => {
        try {
            const result = await TransactionReader.getPendingTransactions();
            const txs = result?.transactions;
            const confirmedTxs = result?.confirmedTransactions;

            if (txs && txs.length > 0 && typeof onTransactionsFound === 'function') {
                logger.info(`Received ${txs.length} pending notification payload(s)`, 'TransactionReader');
                onTransactionsFound(txs);
            }

            if (confirmedTxs && confirmedTxs.length > 0 && typeof onConfirmedFound === 'function') {
                logger.info(`Received ${confirmedTxs.length} confirmed notification quick-action(s)`, 'TransactionReader');
                onConfirmedFound(confirmedTxs);
            }
        } catch (e) {
            logger.warn(`TransactionReader getPendingTransactions error: ${e?.message || e}`, 'TransactionReader');
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
