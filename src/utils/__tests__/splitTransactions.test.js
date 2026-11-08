import { describe, it, expect } from 'vitest';

describe('Split Transactions Aggregation Engine', () => {
    const transactions = [
        {
            id: 'tx-1',
            type: 'expense',
            amount: 50,
            category: 'Φαγητό',
            date: '2026-11-01T10:00:00Z'
        },
        {
            id: 'tx-2-split',
            type: 'expense',
            amount: 80,
            category: 'Σούπερ Μάρκετ',
            date: '2026-11-02T10:00:00Z',
            splits: [
                { category: 'Σούπερ Μάρκετ', category_id: 'Σούπερ Μάρκετ', amount: 60, note: 'Τρόφιμα' },
                { category: 'Σπίτι', category_id: 'Σπίτι', amount: 20, note: 'Καθαριστικά' }
            ]
        },
        {
            id: 'tx-3-split',
            type: 'expense',
            amount: 100,
            category: 'Σούπερ Μάρκετ',
            date: '2026-11-03T10:00:00Z',
            splits: [
                { category: 'Σούπερ Μάρκετ', category_id: 'Σούπερ Μάρκετ', amount: 70, note: 'Ψώνια' },
                { category: 'Φαγητό', category_id: 'Φαγητό', amount: 20, note: 'Έτοιμο φαγητό' },
                { category: 'Καφές', category_id: 'Καφές', amount: 10, note: 'Κάψουλες' }
            ]
        }
    ];

    it('accurately aggregates category spend taking splits into account', () => {
        const calculateCategorySpent = (category) => {
            const catLower = category.toLowerCase();
            return transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                    if (Array.isArray(t.splits) && t.splits.length >= 2) {
                        const splitAmt = t.splits
                            .filter(s => (s.category || s.category_id)?.toLowerCase() === catLower)
                            .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
                        return acc + splitAmt;
                    }
                    return t.category?.toLowerCase() === catLower ? acc + t.amount : acc;
                }, 0);
        };

        // Σούπερ Μάρκετ: 60 (from tx-2) + 70 (from tx-3) = 130 (instead of naive 80 + 100 = 180)
        expect(calculateCategorySpent('Σούπερ Μάρκετ')).toBe(130);

        // Φαγητό: 50 (from tx-1) + 20 (from tx-3 split) = 70 (instead of naive 50)
        expect(calculateCategorySpent('Φαγητό')).toBe(70);

        // Σπίτι: 20 (from tx-2 split) = 20 (instead of naive 0)
        expect(calculateCategorySpent('Σπίτι')).toBe(20);

        // Καφές: 10 (from tx-3 split) = 10 (instead of naive 0)
        expect(calculateCategorySpent('Καφές')).toBe(10);

        // Total of all category spend must equal exact total transaction expense (50 + 80 + 100 = 230)
        const totalCategorized =
            calculateCategorySpent('Σούπερ Μάρκετ') +
            calculateCategorySpent('Φαγητό') +
            calculateCategorySpent('Σπίτι') +
            calculateCategorySpent('Καφές');
        expect(totalCategorized).toBe(230);
    });

    it('correctly maps category breakdown for donut/pie charts with splits', () => {
        const catMap = {};
        transactions.forEach(tx => {
            if (tx.type !== 'expense') return;
            if (Array.isArray(tx.splits) && tx.splits.length >= 2) {
                tx.splits.forEach(s => {
                    const c = s.category || s.category_id || 'other';
                    catMap[c] = (catMap[c] || 0) + (Number(s.amount) || 0);
                });
            } else {
                catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
            }
        });

        expect(catMap).toEqual({
            'Φαγητό': 70,
            'Σούπερ Μάρκετ': 130,
            'Σπίτι': 20,
            'Καφές': 10
        });
    });
});

