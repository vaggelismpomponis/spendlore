import { describe, it, expect } from 'vitest';
import {
    DEFAULT_COOLING_OFF_HOURS,
    createCoolingOffItem,
    getTimeRemaining,
    calculateCoolingOffStats
} from '../coolingOff';

describe('coolingOff utility', () => {
    it('creates an item with 72-hour default expiration', () => {
        const item = createCoolingOffItem({
            title: 'Sony WH-1000XM5',
            amount: '299.99',
            category: 'Τεχνολογία',
            note: 'Saw it on deal'
        });

        expect(item.id).toMatch(/^co_/);
        expect(item.title).toBe('Sony WH-1000XM5');
        expect(item.amount).toBe(299.99);
        expect(item.category).toBe('Τεχνολογία');
        expect(item.durationHours).toBe(DEFAULT_COOLING_OFF_HOURS);
        expect(item.status).toBe('active');

        const created = new Date(item.createdAt).getTime();
        const expires = new Date(item.expiresAt).getTime();
        const diffHours = Math.round((expires - created) / (1000 * 60 * 60));
        expect(diffHours).toBe(72);
    });

    it('calculates time remaining correctly for unexpired items', () => {
        const now = 1700000000000;
        const expiresAt = new Date(now + 36 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString();

        const rem = getTimeRemaining(expiresAt, now);
        expect(rem.isExpired).toBe(false);
        expect(rem.hours).toBe(36);
        expect(rem.minutes).toBe(15);
    });

    it('reports isExpired as true when duration has passed', () => {
        const now = 1700000000000;
        const expiresAt = new Date(now - 1000).toISOString();

        const rem = getTimeRemaining(expiresAt, now);
        expect(rem.isExpired).toBe(true);
        expect(rem.totalMs).toBe(0);
    });

    it('calculates comprehensive cooling-off analytics', () => {
        const now = Date.now();
        const mockItems = [
            {
                id: '1',
                title: 'Sneakers',
                amount: 120,
                status: 'passed',
                savedAmount: 120
            },
            {
                id: '2',
                title: 'Smartwatch',
                amount: 250,
                status: 'passed',
                savedAmount: 250
            },
            {
                id: '3',
                title: 'Espresso Machine',
                amount: 180,
                status: 'bought'
            },
            {
                id: '4',
                title: 'Drone',
                amount: 300,
                status: 'active',
                expiresAt: new Date(now + 24 * 3600 * 1000).toISOString()
            },
            {
                id: '5',
                title: 'Gaming Keyboard',
                amount: 90,
                status: 'active',
                expiresAt: new Date(now - 1000).toISOString() // ready for decision!
            }
        ];

        const stats = calculateCoolingOffStats(mockItems);
        expect(stats.totalSaved).toBe(370); // 120 + 250
        expect(stats.passedCount).toBe(2);
        expect(stats.boughtCount).toBe(1);
        expect(stats.activeCount).toBe(2);
        expect(stats.activeTotalAmount).toBe(390); // 300 + 90
        expect(stats.readyForDecisionCount).toBe(1);
        expect(stats.decidedTotal).toBe(3); // 2 passed + 1 bought
        expect(stats.successRate).toBe(67); // 2/3 ≈ 67%
    });

    it('handles empty and malformed items array safely', () => {
        const stats = calculateCoolingOffStats(null);
        expect(stats.totalSaved).toBe(0);
        expect(stats.activeCount).toBe(0);
        expect(stats.successRate).toBe(0);
    });
});

