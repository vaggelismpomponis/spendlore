import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', (event) => {
    let payload = {};
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (_) {
            payload = { body: event.data.text() };
        }
    }

    const title = payload.title || 'Spendlore';
    const body = payload.body || '';
    const url = payload.url || '/';
    const action = payload.action || null;
    const tag = payload.tag || 'spendlore-push';

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag,
            renotify: true,
            data: { url, action },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    const targetUrl = data.url || '/';
    const action = data.action || null;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            const resolvedUrl = new URL(targetUrl, self.location.origin).href;

            for (const client of windowClients) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    client.postMessage({
                        type: 'SPENDLORE_PUSH_ACTION',
                        url: targetUrl,
                        action,
                    });
                    return client.focus();
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(resolvedUrl);
            }
            return undefined;
        })
    );
});
