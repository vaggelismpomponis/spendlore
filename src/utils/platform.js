import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isWeb = () => !Capacitor.isNativePlatform();

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bomponis.spendwise';

/**
 * Returns true when the current view should be the marketing/landing page.
 * - On production: matches spendlore.gr or www.spendlore.gr
 * - On localhost / preview: can be forced via ?landing or /landing
 * - Can be forced to the app via ?app
 * - Always false on native platforms
 */
export const isLandingDomain = (explicitPath) => {
    if (Capacitor.isNativePlatform()) return false;
    if (typeof window === 'undefined') return false;

    // Dedicated app subdomain is always the app
    if (window.location.hostname === 'app.spendlore.gr') return false;

    // Development & manual testing overrides via query param or path
    const params = new URLSearchParams(window.location.search);
    if (params.has('app') || params.get('view') === 'app') return false;
    if (params.has('landing') || params.get('view') === 'landing') return true;

    const path = (explicitPath || window.location.pathname || '').toLowerCase();
    if (path === '/landing' || path.startsWith('/landing/')) return true;

    // Dedicated public legal pages (/privacy, /terms) on web default to the public landing layout
    if (path === '/privacy' || path === '/terms') {
        return true;
    }

    const host = window.location.hostname;
    // On production marketing domain (spendlore.gr / www.spendlore.gr) OR local dev/preview host:
    // The default view is always the Landing Page.
    // Entering the app happens exclusively when clicking action buttons (e.g. ?app=1 or on app.spendlore.gr).
    if (host === 'spendlore.gr' || host === 'www.spendlore.gr') return true;
    if (host === 'localhost' || host === '127.0.0.1') return true;

    return false;
};
