import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = 'spendwise_haptics_enabled';

// Internal memory cache of user preference
let isEnabled = true;

// Initialize preference from localStorage if available
try {
    if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            isEnabled = stored === 'true';
        }
    }
} catch {
    isEnabled = true;
}

/**
 * Check whether haptic feedback is currently enabled.
 */
export const isHapticsEnabled = () => isEnabled;

/**
 * Set the global haptics preference.
 * @param {boolean} enabled
 */
export const setHapticsEnabled = (enabled) => {
    isEnabled = Boolean(enabled);
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, String(isEnabled));
        }
    } catch {
        // Ignore localStorage quota/access errors
    }
};

/**
 * Helper to determine if native Capacitor Haptics plugin is available.
 */
const hasNativeHaptics = () => {
    try {
        return Capacitor.isPluginAvailable('Haptics');
    } catch {
        return false;
    }
};

/**
 * Trigger subtle keypad press vibration (numbers, backspace, decimal).
 */
export const hapticKeypadPress = async () => {
    if (!isEnabled) return;
    try {
        if (hasNativeHaptics()) {
            await Haptics.impact({ style: ImpactStyle.Light });
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(8);
        }
    } catch {
        // Graceful silence
    }
};

/**
 * Trigger luxury success pulse when saving a transaction.
 */
export const hapticSaveSuccess = async () => {
    if (!isEnabled) return;
    try {
        if (hasNativeHaptics()) {
            await Haptics.notification({ type: NotificationType.Success });
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate([15, 60, 20]);
        }
    } catch {
        // Graceful silence
    }
};

/**
 * Trigger affirmative pulse upon successful biometric / fingerprint authentication.
 */
export const hapticBiometricSuccess = async () => {
    if (!isEnabled) return;
    try {
        if (hasNativeHaptics()) {
            await Haptics.notification({ type: NotificationType.Success });
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate([20, 50, 25]);
        }
    } catch {
        // Graceful silence
    }
};

/**
 * Trigger error buzz upon rejected biometric / invalid PIN.
 */
export const hapticBiometricError = async () => {
    if (!isEnabled) return;
    try {
        if (hasNativeHaptics()) {
            await Haptics.notification({ type: NotificationType.Error });
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate([40, 50, 40]);
        }
    } catch {
        // Graceful silence
    }
};

/**
 * Light impact feedback for interactive chips and tabs.
 */
export const hapticImpactLight = async () => {
    if (!isEnabled) return;
    try {
        if (hasNativeHaptics()) {
            await Haptics.impact({ style: ImpactStyle.Light });
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(10);
        }
    } catch {
        // Graceful silence
    }
};

/**
 * Medium impact feedback for modal toggles and major switches.
 */
export const hapticImpactMedium = async () => {
    if (!isEnabled) return;
    try {
        if (hasNativeHaptics()) {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(22);
        }
    } catch {
        // Graceful silence
    }
};

