import { describe, it, expect } from 'vitest';
import { APP_VERSION, APP_BUILD_NUMBER, APP_RELEASE_YEAR, getAppVersionString } from '../version';
import packageJson from '../../../package.json';
import { translations } from '../translations';

describe('App Version Single Source of Truth', () => {
    it('matches package.json version', () => {
        expect(APP_VERSION).toBe(packageJson.version);
    });

    it('returns formatted localized version strings', () => {
        expect(getAppVersionString('el')).toBe(`Έκδοση ${APP_VERSION}`);
        expect(getAppVersionString('en')).toBe(`Version ${APP_VERSION}`);
    });

    it('aligns with translation dictionary version keys', () => {
        expect(translations.el.version).toBe(`Έκδοση ${APP_VERSION}`);
        expect(translations.en.version).toBe(`Version ${APP_VERSION}`);
    });

    it('has valid release year and build number', () => {
        expect(APP_RELEASE_YEAR).toBe('2026');
        expect(typeof APP_BUILD_NUMBER).toBe('number');
        expect(APP_BUILD_NUMBER).toBeGreaterThan(0);
    });
});

