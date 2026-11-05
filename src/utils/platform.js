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

    // Dedicated app subdomains are always the app
    if (window.location.hostname.startsWith('app.')) return false;

    const path = (explicitPath || window.location.pathname || '').toLowerCase();

    // 1. Explicit in-app routes are ALWAYS the app (never the landing page)
    const APP_ROUTES = [
        '/stats',
        '/history',
        '/recurring',
        '/goals',
        '/budgets',
        '/advisor',
        '/settings',
        '/admin',
        '/upgrade',
        '/home'
    ];
    if (APP_ROUTES.some(r => path === r || path.startsWith(r + '/'))) {
        return false;
    }

    // 2. Query param overrides
    const params = new URLSearchParams(window.location.search);
    if (params.has('landing') || params.get('view') === 'landing') {
        try {
            sessionStorage.removeItem('sw_in_app');
        } catch (_) {}
        return true;
    }

    if (params.has('app') || params.get('view') === 'app') {
        try {
            sessionStorage.setItem('sw_in_app', '1');
        } catch (_) {}
        return false;
    }

    // Explicit landing path
    if (path === '/landing' || path.startsWith('/landing/')) {
        try {
            sessionStorage.removeItem('sw_in_app');
        } catch (_) {}
        return true;
    }

    // 3. Dedicated public legal pages (/privacy, /terms) on web default to the public landing layout
    // unless the user is already inside an active app session
    if (path === '/privacy' || path === '/terms') {
        const inApp = (() => {
            try { return sessionStorage.getItem('sw_in_app') === '1'; } catch (_) { return false; }
        })();
        if (!inApp) return true;
        return false;
    }

    // 4. If user already transitioned into the app in this session, keep them in the app
    try {
        if (sessionStorage.getItem('sw_in_app') === '1') {
            return false;
        }
    } catch (_) {}

    const host = window.location.hostname;
    // Known marketing / public domains
    const MARKETING_DOMAINS = [
        'spendwise.online',
        'www.spendwise.online',
        'spendlore.gr',
        'www.spendlore.gr',
        'spendlore.com',
        'www.spendlore.com'
    ];
    if (MARKETING_DOMAINS.includes(host)) {
        return path === '/';
    }

    // On localhost, preview, or default web host: default to landing at root '/' if not in app session
    if (path === '/') {
        return true;
    }

    return false;
};
