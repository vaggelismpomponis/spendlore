import { describe, it, expect } from 'vitest';
import {
    getEveningReminderMessage,
    getMiddayNudgeMessage,
    getWeeklySummaryMessage,
    getLocalDateParts,
    getLocalDateKeyForTimestamp,
    normalizeTimeZone,
} from '../_lib/pushMessages.js';

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

describe('pushMessages helpers', () => {
    it('normalizes invalid timezones to Europe/Athens', () => {
        expect(normalizeTimeZone('Invalid/Zone')).toBe('Europe/Athens');
        expect(normalizeTimeZone(null)).toBe('Europe/Athens');
        expect(normalizeTimeZone('America/New_York')).toBe('America/New_York');
    });

    it('extracts accurate local date parts and ISO week key', () => {
        // 2026-11-29T16:30:00Z is Sunday 18:30 in Europe/Athens (UTC+2)
        const sunday = new Date('2026-11-29T16:30:00Z');
        const parts = getLocalDateParts(sunday, 'Europe/Athens');
        expect(parts.dateKey).toBe('2026-11-29');
        expect(parts.hour).toBe(18);
        expect(parts.weekday).toBe('Sun');
        expect(parts.isoWeekKey).toBe('2026-W48');

        // Same instant in New York (UTC-5) is 11:30 AM
        const nyParts = getLocalDateParts(sunday, 'America/New_York');
        expect(nyParts.dateKey).toBe('2026-11-29');
        expect(nyParts.hour).toBe(11);
    });

    it('converts timestamps into user local date keys', () => {
        // 2026-11-27T22:30:00Z is already 2026-11-28 00:30 in Europe/Athens
        const lateUtc = '2026-11-27T22:30:00Z';
        expect(getLocalDateKeyForTimestamp(lateUtc, 'Europe/Athens')).toBe('2026-11-28');
        expect(getLocalDateKeyForTimestamp(lateUtc, 'UTC')).toBe('2026-11-27');
        expect(getLocalDateKeyForTimestamp('invalid-date', 'Europe/Athens')).toBeNull();
    });

    it('generates rotating evening & midday messages without emojis in EL and EN', () => {
        const eveningEl = getEveningReminderMessage('el', '2026-11-27');
        const eveningEn = getEveningReminderMessage('en', '2026-11-27');
        const middayEl = getMiddayNudgeMessage('el', '2026-11-27');
        const middayEn = getMiddayNudgeMessage('en', '2026-11-27');

        for (const msg of [eveningEl, eveningEn, middayEl, middayEn]) {
            expect(msg.title.length).toBeGreaterThan(5);
            expect(msg.body.length).toBeGreaterThan(10);
            expect(msg.url).toBe('/?action=add-expense');
            expect(msg.action).toBe('add-expense');
            expect(EMOJI_REGEX.test(msg.title)).toBe(false);
            expect(EMOJI_REGEX.test(msg.body)).toBe(false);
        }
    });

    it('formats weekly summary for 0 and N expenses', () => {
        const zeroEl = getWeeklySummaryMessage('el', { count: 0, totalAmount: 0, currency: '€' });
        expect(zeroEl.title).toBe('Εβδομαδιαία Σύνοψη Εξόδων');
        expect(zeroEl.body).toContain('Δεν καταγράφηκαν έξοδα');
        expect(zeroEl.url).toBe('/?tab=stats');

        const multiEn = getWeeklySummaryMessage('en', { count: 5, totalAmount: 142.5, currency: '€' });
        expect(multiEn.title).toBe('Weekly Expense Summary');
        expect(multiEn.body).toContain('5 expenses');
        expect(multiEn.body).toContain('142.50€');
        expect(multiEn.action).toBe('open-stats');
        expect(EMOJI_REGEX.test(multiEn.body)).toBe(false);
    });
});
