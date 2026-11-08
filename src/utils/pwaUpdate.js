/**
 * PWA Service Worker Update Utilities
 * Provides explicit update checking and cache purge mechanisms,
 * essential for iOS Safari standalone PWAs lacking native browser refresh controls.
 */

export const checkForAppUpdates = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return { supported: false, updated: false };
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return { supported: true, updated: false };
        }

        await registration.update();

        // If a new service worker is already waiting, trigger activation
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return { supported: true, updated: true };
        }

        return { supported: true, updated: false };
    } catch (error) {
        return { supported: true, updated: false, error };
    }
};

export const forceAppCachePurge = async () => {
    if (typeof window === 'undefined') return;

    try {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }

        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((reg) => reg.unregister()));
        }
    } catch (e) {
        // Silently catch cache cleanup errors
    }

    window.location.reload();
};

