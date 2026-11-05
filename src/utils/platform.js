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

    // Development & manual testing overrides via query param or path
    const params = new URLSearchParams(window.location.search);
    if (params.has('landing') || params.get('view') === 'landing') return true;
    if (params.has('app') || params.get('view') === 'app') return false;

    const path = (explicitPath || window.location.pathname || '').toLowerCase();
    if (path === '/landing' || path.startsWith('/landing/')) return true;

    const host = window.location.hostname;

    // Dedicated public legal pages (/privacy, /terms) on web default to the public landing layout
    // unless explicitly in app mode (?app=1) or on the app subdomain (app.spendlore.gr)
    if (path === '/privacy' || path === '/terms') {
        if (host !== 'app.spendlore.gr') return true;
    }

    return host === 'spendlore.gr' || host === 'www.spendlore.gr';
};
