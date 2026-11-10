/**
 * PWA Service Worker Update Utilities
 * Provides explicit update checking and cache purge mechanisms,
 * essential for iOS Safari standalone PWAs and mobile browsers.
 */

export const isServerBuildNewer = async () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    try {
        const res = await fetch(`/?__cb=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (!res.ok) return false;
        const html = await res.text();
        const serverMatch = html.match(/assets\/index-([a-zA-Z0-9_-]+)\.js/);
        if (!serverMatch) return false;

        const currentScript = document.querySelector('script[src*="assets/index-"]');
        if (!currentScript) return false;
        const currentMatch = currentScript.src.match(/assets\/index-([a-zA-Z0-9_-]+)\.js/);
        if (!currentMatch) return false;

        return serverMatch[1] !== currentMatch[1];
    } catch {
        return false;
    }
};

export const checkForAppUpdates = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return { supported: false, updated: false };
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            const buildChanged = await isServerBuildNewer();
            if (buildChanged) {
                await forceAppCachePurge();
                return { supported: true, updated: true };
            }
            return { supported: true, updated: false };
        }

        // 1. If a new service worker is already waiting, trigger activation
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return { supported: true, updated: true };
        }

        // 2. Set up listener for updatefound before triggering update()
        let updateFound = false;
        const updateFoundPromise = new Promise((resolve) => {
            const onUpdateFound = () => {
                updateFound = true;
                const installingWorker = registration.installing;
                if (!installingWorker) {
                    resolve(true);
                    return;
                }
                if (typeof installingWorker.addEventListener === 'function') {
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' || installingWorker.state === 'activated') {
                            if (registration.waiting) {
                                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                            }
                            resolve(true);
                        }
                    });
                } else {
                    resolve(true);
                }
            };

            if (typeof registration.addEventListener === 'function') {
                registration.addEventListener('updatefound', onUpdateFound, { once: true });
            }

            // If a worker is already installing
            if (registration.installing) {
                onUpdateFound();
            }

            // Timeout after 2500ms
            setTimeout(() => resolve(false), 2500);
        });

        await registration.update();

        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return { supported: true, updated: true };
        }

        const found = await updateFoundPromise;
        if (found || registration.waiting) {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            return { supported: true, updated: true };
        }

        // 3. Fallback: check if the server has a newer index-[hash].js bundle
        const buildChanged = await isServerBuildNewer();
        if (buildChanged) {
            await forceAppCachePurge();
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

