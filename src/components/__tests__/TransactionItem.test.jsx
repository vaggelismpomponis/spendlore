import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionItem from '../TransactionItem';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (key) => key,
        language: 'el'
    })
}));

describe('TransactionItem Component', () => {
    it('renders a normal single-category transaction correctly', () => {
        const tx = {
            id: 'tx-1',
            type: 'expense',
            amount: 50,
            category: 'Φαγητό',
            note: 'Δείπνο',
            date: '2026-11-08T12:00:00Z'
        };

        render(<TransactionItem transaction={tx} onEdit={vi.fn()} onDelete={vi.fn()} />);

        expect(screen.getByText('Φαγητό')).toBeInTheDocument();
        expect(screen.getByText('Δείπνο')).toBeInTheDocument();
        expect(screen.queryByTitle(/κατηγορίες/)).not.toBeInTheDocument();
    });

    it('renders a split transaction with category count indicator and split breakdown', () => {
        const splitTx = {
            id: 'tx-split-1',
            type: 'expense',
            amount: 80,
            category: 'Σούπερ Μάρκετ',
            note: 'Εβδομαδιαία ψώνια',
            date: '2026-11-08T12:00:00Z',
            splits: [
                { category: 'Σούπερ Μάρκετ', category_id: 'Σούπερ Μάρκετ', amount: 60, note: 'Τρόφιμα' },
                { category: 'Σπίτι', category_id: 'Σπίτι', amount: 20, note: 'Καθαριστικά' }
            ]
        };

        render(<TransactionItem transaction={splitTx} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // Should display main category and 2 count
        expect(screen.getAllByText('Σούπερ Μάρκετ').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('2')).toBeInTheDocument();

        // Should display breakdown categories and amounts
        expect(screen.getByText('Σπίτι')).toBeInTheDocument();
        expect(screen.getByText('€60.00')).toBeInTheDocument();
        expect(screen.getByText('€20.00')).toBeInTheDocument();
    });
});
