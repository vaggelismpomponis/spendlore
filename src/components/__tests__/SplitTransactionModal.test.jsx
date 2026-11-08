import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SplitTransactionModal from '../SplitTransactionModal';

const mockCustomCategories = { expense: ['Κατοικίδια'], income: [] };

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        customCategories: mockCustomCategories,
        t: (key) => {
            const map = {
                split_transaction_title: 'Διαχωρισμός Συναλλαγής',
                split_transaction_desc: 'Σπάσε το ποσό της συναλλαγής σε περισσότερες κατηγορίες.',
                split_total_amount: 'Συνολικό Ποσό',
                split_allocated: 'Κατανεμήθηκαν',
                split_remaining: 'Υπόλοιπο',
                split_add_category: 'Προσθήκη Κατηγορίας',
                split_apply: 'Εφαρμογή',
                split_cancel: 'Ακύρωση',
                split_error_category: 'Επιλέξτε κατηγορία για κάθε διαχωρισμό.',
                split_error_amount: 'Το ποσό κάθε διαχωρισμού πρέπει να είναι μεγαλύτερο από 0.',
                split_error_sum: 'Το άθροισμα των κατηγοριών ({sum}€) πρέπει να ισούται με το συνολικό ποσό ({total}€).'
            };
            return map[key] || key;
        },
        currency: '€'
    })
}));

describe('SplitTransactionModal Component', () => {
    it('renders modal when isOpen is true', () => {
        render(
            <SplitTransactionModal
                isOpen={true}
                onClose={vi.fn()}
                totalAmount={80}
                onApplySplits={vi.fn()}
            />
        );

        expect(screen.getByText('Διαχωρισμός Συναλλαγής')).toBeInTheDocument();
        expect(screen.getByText('Σπάσε το ποσό της συναλλαγής σε περισσότερες κατηγορίες.')).toBeInTheDocument();
        expect(screen.getByText('Συνολικό Ποσό')).toBeInTheDocument();
        expect(screen.getByText('ΜΕΡΟΣ 1')).toBeInTheDocument();
        expect(screen.getByText('ΜΕΡΟΣ 2')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <SplitTransactionModal
                isOpen={false}
                onClose={vi.fn()}
                totalAmount={80}
                onApplySplits={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('adds a new split row when clicking Add Category', () => {
        render(
            <SplitTransactionModal
                isOpen={true}
                onClose={vi.fn()}
                totalAmount={100}
                onApplySplits={vi.fn()}
            />
        );

        expect(screen.getAllByText(/ΜΕΡΟΣ/)).toHaveLength(2);

        const addBtn = screen.getByText('Προσθήκη Κατηγορίας');
        fireEvent.click(addBtn);

        expect(screen.getAllByText(/ΜΕΡΟΣ/)).toHaveLength(3);
        expect(screen.getByText('ΜΕΡΟΣ 3')).toBeInTheDocument();
    });

    it('validates that sum of splits must match total amount before applying', async () => {
        const handleApply = vi.fn();
        render(
            <SplitTransactionModal
                isOpen={true}
                onClose={vi.fn()}
                totalAmount={80}
                initialSplits={[
                    { category: 'Σούπερ Μάρκετ', category_id: 'Σούπερ Μάρκετ', amount: 50, note: '' },
                    { category: 'Σπίτι', category_id: 'Σπίτι', amount: 20, note: '' }
                ]}
                onApplySplits={handleApply}
            />
        );

        // Sum is 70, target is 80
        const applyBtn = screen.getByText('Εφαρμογή');
        fireEvent.click(applyBtn);

        expect(handleApply).not.toHaveBeenCalled();
        expect(screen.getByText(/Το άθροισμα των κατηγοριών/)).toBeInTheDocument();
    });

    it('successfully calls onApplySplits when splits are valid and sum matches', () => {
        const handleApply = vi.fn();
        const handleClose = vi.fn();

        render(
            <SplitTransactionModal
                isOpen={true}
                onClose={handleClose}
                totalAmount={80}
                initialSplits={[
                    { category: 'Σούπερ Μάρκετ', category_id: 'Σούπερ Μάρκετ', amount: 60, note: 'Τρόφιμα' },
                    { category: 'Σπίτι', category_id: 'Σπίτι', amount: 20, note: 'Καθαριστικά' }
                ]}
                onApplySplits={handleApply}
            />
        );

        const applyBtn = screen.getByText('Εφαρμογή');
        fireEvent.click(applyBtn);

        expect(handleApply).toHaveBeenCalledTimes(1);
        expect(handleApply).toHaveBeenCalledWith(
            [
                { category: 'Σούπερ Μάρκετ', category_id: 'Σούπερ Μάρκετ', amount: 60, note: 'Τρόφιμα' },
                { category: 'Σπίτι', category_id: 'Σπίτι', amount: 20, note: 'Καθαριστικά' }
            ],
            80
        );
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onApplySplits with empty array when Cancel is clicked', () => {
        const handleApply = vi.fn();
        const handleClose = vi.fn();

        render(
            <SplitTransactionModal
                isOpen={true}
                onClose={handleClose}
                totalAmount={80}
                onApplySplits={handleApply}
            />
        );

        const cancelBtn = screen.getByText('Ακύρωση');
        fireEvent.click(cancelBtn);

        expect(handleApply).toHaveBeenCalledWith([], 80);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
