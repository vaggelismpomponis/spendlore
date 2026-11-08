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
