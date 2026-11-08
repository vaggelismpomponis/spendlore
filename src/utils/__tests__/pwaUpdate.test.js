import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkForAppUpdates, forceAppCachePurge } from '../pwaUpdate';

describe('pwaUpdate utils', () => {
    const originalNavigator = global.navigator;
    const originalWindow = global.window;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        global.navigator = originalNavigator;
        global.window = originalWindow;
    });

    it('returns supported: false when serviceWorker is not supported in navigator', async () => {
        Object.defineProperty(global, 'navigator', {
            value: {},
            writable: true,
            configurable: true,
        });

        const result = await checkForAppUpdates();
        expect(result).toEqual({ supported: false, updated: false });
    });

    it('returns supported: true and calls registration.update when registration exists', async () => {
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        const mockGetRegistration = vi.fn().mockResolvedValue({
            update: mockUpdate,
            waiting: null,
        });

        Object.defineProperty(global, 'navigator', {
            value: {
                serviceWorker: {
                    getRegistration: mockGetRegistration,
                },
            },
            writable: true,
            configurable: true,
        });

        const result = await checkForAppUpdates();
        expect(mockGetRegistration).toHaveBeenCalled();
        expect(mockUpdate).toHaveBeenCalled();
        expect(result).toEqual({ supported: true, updated: false });
    });

    it('triggers SKIP_WAITING when a waiting service worker is detected', async () => {
        const mockPostMessage = vi.fn();
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        const mockGetRegistration = vi.fn().mockResolvedValue({
            update: mockUpdate,
            waiting: {
                postMessage: mockPostMessage,
            },
        });

        Object.defineProperty(global, 'navigator', {
            value: {
                serviceWorker: {
                    getRegistration: mockGetRegistration,
                },
            },
            writable: true,
            configurable: true,
        });

        const result = await checkForAppUpdates();
        expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
        expect(result).toEqual({ supported: true, updated: true });
    });

    it('forceAppCachePurge deletes caches and unregisters workers before reload', async () => {
        const mockDelete = vi.fn().mockResolvedValue(true);
        const mockUnregister = vi.fn().mockResolvedValue(true);
        const mockReload = vi.fn();

        Object.defineProperty(global, 'caches', {
            value: {
                keys: vi.fn().mockResolvedValue(['cache-v1', 'cache-v2']),
                delete: mockDelete,
            },
            writable: true,
            configurable: true,
        });

        Object.defineProperty(global, 'navigator', {
            value: {
                serviceWorker: {
                    getRegistrations: vi.fn().mockResolvedValue([{ unregister: mockUnregister }]),
                },
            },
            writable: true,
            configurable: true,
        });

        delete window.location;
        window.location = { reload: mockReload };

        await forceAppCachePurge();

        expect(mockDelete).toHaveBeenCalledWith('cache-v1');
        expect(mockDelete).toHaveBeenCalledWith('cache-v2');
        expect(mockUnregister).toHaveBeenCalled();
        expect(mockReload).toHaveBeenCalled();
    });
});

