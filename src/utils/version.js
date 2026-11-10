/**
 * Application Single Source of Truth for Versioning
 * Aligned across package.json, android/app/build.gradle, and all frontend views.
 */
export const APP_VERSION = '1.1.53';
export const APP_BUILD_NUMBER = 65;
export const APP_RELEASE_YEAR = '2026';

export const getAppVersionString = (language = 'el') => {
    const isEl = language === 'el';
    return isEl ? `Έκδοση ${APP_VERSION}` : `Version ${APP_VERSION}`;
};

export default {
    version: APP_VERSION,
    build: APP_BUILD_NUMBER,
    year: APP_RELEASE_YEAR,
    getAppVersionString,
};

