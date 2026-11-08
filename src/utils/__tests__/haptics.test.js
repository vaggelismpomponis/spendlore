import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import {
    isHapticsEnabled,
    setHapticsEnabled,
    hapticKeypadPress,
    hapticSaveSuccess,
    hapticBiometricSuccess,
    hapticBiometricError,
    hapticImpactLight,
    hapticImpactMedium
} from '../haptics';

vi.mock('@capacitor/haptics', () => ({
    Haptics: {
        impact: vi.fn(),
        notification: vi.fn()
    },
    ImpactStyle: {
        Light: 'LIGHT',
        Medium: 'MEDIUM',
        Heavy: 'HEAVY'
    },
    NotificationType: {
        Success: 'SUCCESS',
        Warning: 'WARNING',
        Error: 'ERROR'
    }
}));

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isPluginAvailable: vi.fn()
    }
}));

describe('haptics utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        setHapticsEnabled(true);
        navigator.vibrate = vi.fn();
    });

    it('manages haptics enabled state and persists in localStorage', () => {
        expect(isHapticsEnabled()).toBe(true);
        setHapticsEnabled(false);
        expect(isHapticsEnabled()).toBe(false);
        expect(localStorage.getItem('spendwise_haptics_enabled')).toBe('false');

        setHapticsEnabled(true);
        expect(isHapticsEnabled()).toBe(true);
        expect(localStorage.getItem('spendwise_haptics_enabled')).toBe('true');
    });

    describe('with native Capacitor Haptics plugin', () => {
        beforeEach(() => {
            vi.mocked(Capacitor.isPluginAvailable).mockReturnValue(true);
        });

        it('triggers light impact on keypad press', async () => {
            await hapticKeypadPress();
            expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
            expect(navigator.vibrate).not.toHaveBeenCalled();
        });

        it('triggers success notification on save success', async () => {
            await hapticSaveSuccess();
            expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Success });
        });

        it('triggers success notification on biometric success', async () => {
            await hapticBiometricSuccess();
            expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Success });
        });

        it('triggers error notification on biometric error', async () => {
            await hapticBiometricError();
            expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Error });
        });

        it('triggers light and medium impact on custom events', async () => {
            await hapticImpactLight();
            expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });

            await hapticImpactMedium();
            expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
        });
    });

    describe('fallback to web navigator.vibrate when native plugin is unavailable', () => {
        beforeEach(() => {
            vi.mocked(Capacitor.isPluginAvailable).mockReturnValue(false);
        });

        it('falls back to subtle vibration on keypad press', async () => {
            await hapticKeypadPress();
            expect(Haptics.impact).not.toHaveBeenCalled();
            expect(navigator.vibrate).toHaveBeenCalledWith(8);
        });

        it('falls back to double-pulse pattern on save success', async () => {
            await hapticSaveSuccess();
            expect(navigator.vibrate).toHaveBeenCalledWith([15, 60, 20]);
        });

        it('falls back to affirmative pulse on biometric success', async () => {
            await hapticBiometricSuccess();
            expect(navigator.vibrate).toHaveBeenCalledWith([20, 50, 25]);
        });

        it('falls back to error buzz on biometric error', async () => {
            await hapticBiometricError();
            expect(navigator.vibrate).toHaveBeenCalledWith([40, 50, 40]);
        });
    });

    describe('when haptics is disabled by user', () => {
        beforeEach(() => {
            setHapticsEnabled(false);
            vi.mocked(Capacitor.isPluginAvailable).mockReturnValue(true);
        });

        it('suppresses all vibrations completely', async () => {
            await hapticKeypadPress();
            await hapticSaveSuccess();
            await hapticBiometricSuccess();
            await hapticBiometricError();
            await hapticImpactLight();
            await hapticImpactMedium();

            expect(Haptics.impact).not.toHaveBeenCalled();
            expect(Haptics.notification).not.toHaveBeenCalled();
            expect(navigator.vibrate).not.toHaveBeenCalled();
        });
    });

    describe('exception safety', () => {
        it('catches and suppresses any native exceptions without crashing', async () => {
            vi.mocked(Capacitor.isPluginAvailable).mockReturnValue(true);
            vi.mocked(Haptics.impact).mockRejectedValueOnce(new Error('Hardware failure'));

            await expect(hapticKeypadPress()).resolves.not.toThrow();
        });
    });
});

