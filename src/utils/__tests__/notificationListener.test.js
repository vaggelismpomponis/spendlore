import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    setupNotificationListener,
    setNativeProStatus,
    checkNotificationPermission,
    openNotificationSettings,
    isIgnoringBatteryOptimizations,
    requestIgnoreBatteryOptimization,
    openBatteryOptimizationSettings,
    openAutostartSettings,
    getBackgroundPermissionsStatus,
    setAutoTrackingEnabled,
    getAutoTrackingEnabled,
    openPlayStoreUpdates
} from '../notificationListener';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';

// Mock Capacitor
vi.mock('@capacitor/core', () => {
    const mockTransactionReader = {
        getPendingTransactions: vi.fn(),
        setProStatus: vi.fn(),
        setAutoTrackingEnabled: vi.fn(),
        getAutoTrackingEnabled: vi.fn(),
        checkPermission: vi.fn(),
        openNotificationSettings: vi.fn(),
        openPlayStore: vi.fn(),
        isIgnoringBatteryOptimizations: vi.fn(),
        requestIgnoreBatteryOptimization: vi.fn(),
        openBatteryOptimizationSettings: vi.fn(),
        openAutostartSettings: vi.fn(),
        getBackgroundPermissionsStatus: vi.fn(),
        addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() }))
    };

    return {
        Capacitor: {
            isNativePlatform: vi.fn(() => true)
        },
        registerPlugin: vi.fn(() => mockTransactionReader)
    };
});

vi.mock('@capacitor/app', () => ({
    App: {
        addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() }))
    }
}));

vi.mock('../logger', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        error: vi.fn()
    }
}));

describe('Notification Listener with Quick Actions', () => {
    let mockPlugin;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockPlugin = registerPlugin('TransactionReader');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns empty cleanup function when not on native platform', () => {
        Capacitor.isNativePlatform.mockReturnValueOnce(false);
        const onPending = vi.fn();
        const onConfirmed = vi.fn();
        const cleanup = setupNotificationListener(onPending, onConfirmed);
        expect(typeof cleanup).toBe('function');
        cleanup();
        expect(mockPlugin.getPendingTransactions).not.toHaveBeenCalled();
    });

    it('processes pending transactions when found', async () => {
        const rawPending = [
            {
                id: 'tx_123',
                title: 'Wolt',
                text: 'Wolt €6.39 with Ticket Restaurant',
                date: Date.now()
            }
        ];

        mockPlugin.getPendingTransactions.mockResolvedValueOnce({
            transactions: rawPending,
            confirmedTransactions: []
        });

        const onPending = vi.fn();
        const onConfirmed = vi.fn();

        const cleanup = setupNotificationListener(onPending, onConfirmed);

        // Wait for promise resolution
        await vi.runAllTicks();

        expect(mockPlugin.getPendingTransactions).toHaveBeenCalled();
        expect(onPending).toHaveBeenCalledWith(rawPending);
        expect(onConfirmed).not.toHaveBeenCalled();

        cleanup();
    });

    it('processes confirmed quick-action transactions directly', async () => {
        const rawConfirmed = [
            {
                id: 'tx_confirmed_1',
                amount: 6.39,
                merchant: 'Wolt',
                category: 'Φαγητό',
                note: 'Wolt',
                type: 'expense',
                date: Date.now(),
                confirmedVia: 'notification_action'
            }
        ];

        mockPlugin.getPendingTransactions.mockResolvedValueOnce({
            transactions: [],
            confirmedTransactions: rawConfirmed
        });

        const onPending = vi.fn();
        const onConfirmed = vi.fn();

        const cleanup = setupNotificationListener(onPending, onConfirmed);

        await vi.runAllTicks();

        expect(onPending).not.toHaveBeenCalled();
        expect(onConfirmed).toHaveBeenCalledWith(rawConfirmed);

        cleanup();
    });

    it('processes both pending and confirmed transactions in the same batch', async () => {
        const rawPending = [{ id: 'p1', title: 'Winbank', text: '50€' }];
        const rawConfirmed = [{ id: 'c1', amount: 12.5, category: 'Βενζίνη' }];

        mockPlugin.getPendingTransactions.mockResolvedValueOnce({
            transactions: rawPending,
            confirmedTransactions: rawConfirmed
        });

        const onPending = vi.fn();
        const onConfirmed = vi.fn();

        const cleanup = setupNotificationListener(onPending, onConfirmed);

        await vi.runAllTicks();

        expect(onPending).toHaveBeenCalledWith(rawPending);
        expect(onConfirmed).toHaveBeenCalledWith(rawConfirmed);

        cleanup();
    });

    it('registers transactionsUpdated listener for real-time notification actions', () => {
        const onPending = vi.fn();
        const onConfirmed = vi.fn();

        const cleanup = setupNotificationListener(onPending, onConfirmed);

        expect(mockPlugin.addListener).toHaveBeenCalledWith('transactionsUpdated', expect.any(Function));
        cleanup();
    });

    it('syncs native Pro status correctly', async () => {
        await setNativeProStatus(true);
        expect(mockPlugin.setProStatus).toHaveBeenCalledWith({ isPro: true });

        await setNativeProStatus(false);
        expect(mockPlugin.setProStatus).toHaveBeenCalledWith({ isPro: false });
    });

    it('checks permission and returns boolean', async () => {
        mockPlugin.checkPermission.mockResolvedValueOnce({ granted: true });
        const granted = await checkNotificationPermission();
        expect(granted).toBe(true);

        mockPlugin.checkPermission.mockResolvedValueOnce({ granted: false });
        const notGranted = await checkNotificationPermission();
        expect(notGranted).toBe(false);
    });

    it('opens notification settings', async () => {
        await openNotificationSettings();
        expect(mockPlugin.openNotificationSettings).toHaveBeenCalled();
    });

    it('checks battery optimization status', async () => {
        mockPlugin.isIgnoringBatteryOptimizations.mockResolvedValueOnce({ isIgnoring: true });
        const isIgnoring = await isIgnoringBatteryOptimizations();
        expect(isIgnoring).toBe(true);
        expect(mockPlugin.isIgnoringBatteryOptimizations).toHaveBeenCalled();
    });

    it('requests ignore battery optimization', async () => {
        mockPlugin.requestIgnoreBatteryOptimization.mockResolvedValueOnce({ requested: true, isIgnoring: false });
        const res = await requestIgnoreBatteryOptimization();
        expect(res.requested).toBe(true);
        expect(mockPlugin.requestIgnoreBatteryOptimization).toHaveBeenCalled();
    });

    it('opens battery optimization settings', async () => {
        await openBatteryOptimizationSettings();
        expect(mockPlugin.openBatteryOptimizationSettings).toHaveBeenCalled();
    });

    it('opens autostart settings', async () => {
        mockPlugin.openAutostartSettings.mockResolvedValueOnce({ openedDirectly: true });
        const res = await openAutostartSettings();
        expect(res.openedDirectly).toBe(true);
        expect(mockPlugin.openAutostartSettings).toHaveBeenCalled();
    });

    it('fetches consolidated background permissions status', async () => {
        mockPlugin.getBackgroundPermissionsStatus.mockResolvedValueOnce({
            notificationListener: true,
            batteryNoRestrictions: true,
            autostartSupported: true,
            manufacturer: 'xiaomi'
        });
        const status = await getBackgroundPermissionsStatus();
        expect(status.notificationListener).toBe(true);
        expect(status.batteryNoRestrictions).toBe(true);
        expect(status.autostartSupported).toBe(true);
        expect(status.manufacturer).toBe('xiaomi');
    });

    it('persists and retrieves auto tracking toggle state', async () => {
        mockPlugin.setAutoTrackingEnabled.mockResolvedValueOnce({ enabled: false });
        const disabled = await setAutoTrackingEnabled(false);
        expect(disabled).toBe(false);
        expect(mockPlugin.setAutoTrackingEnabled).toHaveBeenCalledWith({ enabled: false });

        mockPlugin.getAutoTrackingEnabled.mockResolvedValueOnce({ enabled: false });
        const isEnabled = await getAutoTrackingEnabled();
        expect(isEnabled).toBe(false);
        expect(mockPlugin.getAutoTrackingEnabled).toHaveBeenCalled();
    });

    it('opens Play Store on native platform', async () => {
        mockPlugin.openPlayStore.mockResolvedValueOnce(undefined);
        const res = await openPlayStoreUpdates();
        expect(res).toBe(true);
        expect(mockPlugin.openPlayStore).toHaveBeenCalled();
    });
});

