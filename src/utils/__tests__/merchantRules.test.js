import { describe, it, expect } from 'vitest';
import {
    normalizeMerchantText,
    matchMerchantRule,
    applyMerchantRules,
    DEFAULT_STARTER_RULES
} from '../merchantRules';

describe('Merchant Rules & Aliasing Engine', () => {
    describe('normalizeMerchantText', () => {
        it('normalizes Greek accents and uppercase characters', () => {
            expect(normalizeMerchantText('ΣΚΛΑΒΕΝΙΤΗΣ')).toBe('σκλαβενιτης');
            expect(normalizeMerchantText('Σκλαβενίτης')).toBe('σκλαβενιτης');
            expect(normalizeMerchantText('  Βενζινάδικο ΕΚΟ  ')).toBe('βενζιναδικο εκο');
        });

        it('normalizes mixed English and Greek symbols', () => {
            expect(normalizeMerchantText("McDonald's")).toBe("mcdonald's");
            expect(normalizeMerchantText('Wolt Greece')).toBe('wolt greece');
        });
    });

    describe('matchMerchantRule', () => {
        const rules = [
            {
                id: 'r1',
                merchantPattern: 'ΣΚΛΑΒΕΝΙΤΗΣ, LIDL',
                category: 'Σούπερ Μάρκετ',
                type: 'expense'
            },
            {
                id: 'r2',
                merchantPattern: 'EKO, SHELL',
                category: 'Βενζίνη',
                type: 'expense'
            },
            {
                id: 'r3',
                merchantPattern: 'WOLT',
                category: 'Φαγητό',
                type: 'expense'
            },
            {
                id: 'r4',
                merchantPattern: 'ΜΙΣΘΟΔΟΣΙΑ',
                category: 'Μισθός',
                type: 'income'
            }
        ];

        it('matches Greek supermarket aliases with diacritics', () => {
            const match1 = matchMerchantRule('Αγορά στο Σκλαβενίτη 14.50€', rules, 'expense');
            expect(match1).not.toBeNull();
            expect(match1.category).toBe('Σούπερ Μάρκετ');

            const match2 = matchMerchantRule('LIDL HELLAS', rules, 'expense');
            expect(match2).not.toBeNull();
            expect(match2.category).toBe('Σούπερ Μάρκετ');
        });

        it('matches fuel gas stations', () => {
            const match = matchMerchantRule('Πρατήριο EKO Κηφισίας', rules, 'expense');
            expect(match).not.toBeNull();
            expect(match.category).toBe('Βενζίνη');
        });

        it('matches food delivery', () => {
            const match = matchMerchantRule('Wolt €6.39 with Ticket Restaurant', rules, 'expense');
            expect(match).not.toBeNull();
            expect(match.category).toBe('Φαγητό');
        });

        it('respects type (expense vs income)', () => {
            const matchExpense = matchMerchantRule('Μισθοδοσία Νοεμβρίου', rules, 'expense');
            expect(matchExpense).toBeNull();

            const matchIncome = matchMerchantRule('Μισθοδοσία Νοεμβρίου', rules, 'income');
            expect(matchIncome).not.toBeNull();
            expect(matchIncome.category).toBe('Μισθός');
        });

        it('returns null when no rule matches', () => {
            const match = matchMerchantRule('Unknown Merchant 123', rules, 'expense');
            expect(match).toBeNull();
        });

        it('supports exact match flag', () => {
            const exactRules = [
                {
                    id: 'ex1',
                    merchantPattern: 'EKO',
                    category: 'Βενζίνη',
                    exactMatch: true
                }
            ];

            expect(matchMerchantRule('EKO', exactRules, 'expense')).not.toBeNull();
            expect(matchMerchantRule('EKO KIFISIAS', exactRules, 'expense')).toBeNull();
        });
    });

    describe('applyMerchantRules', () => {
        const rules = [
            {
                id: 'r1',
                merchantPattern: 'Σκλαβενίτης, Lidl',
                category: 'Σούπερ Μάρκετ',
                type: 'expense'
            }
        ];

        it('returns matched category when rule matches', () => {
            const res = applyMerchantRules('Lidl Kallithea', 'Άλλο', rules, 'expense');
            expect(res).toBe('Σούπερ Μάρκετ');
        });

        it('returns fallback category when no rule matches', () => {
            const res = applyMerchantRules('Zara Home', 'Σπίτι', rules, 'expense');
            expect(res).toBe('Σπίτι');
        });
    });

    describe('DEFAULT_STARTER_RULES', () => {
        it('contains standard Greek starter categories', () => {
            expect(DEFAULT_STARTER_RULES.length).toBeGreaterThan(0);
            const categories = DEFAULT_STARTER_RULES.map(r => r.category);
            expect(categories).toContain('Σούπερ Μάρκετ');
            expect(categories).toContain('Φαγητό');
            expect(categories).toContain('Βενζίνη');
        });
    });
});

