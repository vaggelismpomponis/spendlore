import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn(() => false),
        getPlatform: vi.fn(() => 'web'),
    },
}));

vi.mock('@capacitor/push-notifications', () => ({
    PushNotifications: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        register: vi.fn(),
        createChannel: vi.fn(),
        addListener: vi.fn(),
    },
}));

import {
    sanitizeVapidKey,
    urlBase64ToUint8Array,
    arrayBufferToBase64Url,
    buildDeviceKey,
    loadCachedPushPreferences,
    saveCachedPushPreferences,
    DEFAULT_PUSH_PREFERENCES,
    isPushSupported,
    registerDeviceForPush,
} from '../PushNotificationService';

describe('PushNotificationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('sanitizes quoted or whitespace-padded VAPID keys', () => {
        expect(sanitizeVapidKey('  "ABC_123-xyz"  ')).toBe('ABC_123-xyz');
        expect(sanitizeVapidKey("'ABC_123-xyz'")).toBe('ABC_123-xyz');
        expect(sanitizeVapidKey(null)).toBe('');
    });

    it('converts base64url VAPID key to Uint8Array and back cleanly', () => {
        const sampleBase64Url = 'SGVsbG8td29ybGRfMTIz';
        const arr = urlBase64ToUint8Array(sampleBase64Url);
        expect(arr).toBeInstanceOf(Uint8Array);
        expect(arr.length).toBeGreaterThan(0);
        expect(arrayBufferToBase64Url(arr.buffer)).toBe(sampleBase64Url);
    });

    it('builds deterministic non-PII device keys', () => {
        const k1 = buildDeviceKey('web', 'https://fcm.googleapis.com/fcm/send/abc123');
        const k2 = buildDeviceKey('web', 'https://fcm.googleapis.com/fcm/send/abc123');
        const k3 = buildDeviceKey('web', 'https://fcm.googleapis.com/fcm/send/xyz999');

        expect(k1).toBe(k2);
        expect(k1).not.toBe(k3);
        expect(k1.startsWith('web_')).toBe(true);
    });

    it('loads defaults and caches user-scoped push preferences', () => {
        const initial = loadCachedPushPreferences('user-1');
        expect(initial.enabled).toBe(DEFAULT_PUSH_PREFERENCES.enabled);
        expect(initial.evening_reminder_hour).toBe(21);

        saveCachedPushPreferences('user-1', { ...initial, enabled: true, evening_reminder_hour: 20 });
        const loaded = loadCachedPushPreferences('user-1');
        expect(loaded.enabled).toBe(true);
        expect(loaded.evening_reminder_hour).toBe(20);
    });

    it('gracefully reports unsupported or missing user on registerDeviceForPush', async () => {
        const noUser = await registerDeviceForPush(null);
        expect(noUser).toEqual({ ok: false, reason: 'no_user' });

        // jsdom lacks PushManager by default
        expect(isPushSupported()).toBe(false);
        const unsupported = await registerDeviceForPush('user-1');
        expect(unsupported).toEqual({ ok: false, reason: 'unsupported' });
    });
});
