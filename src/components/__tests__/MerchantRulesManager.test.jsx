import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MerchantRulesManager from '../MerchantRulesManager';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (k) => k,
        language: 'el',
        customCategories: { expense: [], income: [] },
    }),
}));

vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({
        showToast: vi.fn(),
    }),
}));

describe('MerchantRulesManager & MerchantRuleItem', () => {
    const mockRules = [
        {
            id: 'rule-1',
            merchantPattern: 'Σκλαβενίτης, Sklavenitis',
            category: 'Σούπερ Μάρκετ',
            type: 'expense',
            exactMatch: false,
        },
    ];

    it('renders merchant rule item with more options button and hidden actions inside menu', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <MerchantRulesManager
                rules={mockRules}
                onAdd={vi.fn()}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestoreStarter={vi.fn()}
            />
        );

        // Keywords and category are displayed
        expect(screen.getByText('Σκλαβενίτης')).toBeInTheDocument();
        expect(screen.getByText('Σούπερ Μάρκετ')).toBeInTheDocument();

        // More options button exists
        const moreBtn = screen.getByTitle('More options');
        expect(moreBtn).toBeInTheDocument();

        // Dropdown actions are not initially in the document
        expect(screen.queryByText(/Επεξεργασία/i)).not.toBeInTheDocument();

        // Click more options
        fireEvent.click(moreBtn);

        // Actions are now visible
        const editBtn = screen.getByText(/Επεξεργασία/i);
        const deleteBtn = screen.getByText(/Διαγραφή/i);
        expect(editBtn).toBeInTheDocument();
        expect(deleteBtn).toBeInTheDocument();

        // Click Edit
        fireEvent.click(editBtn);
        // Modal for editing opens
        expect(screen.getByText('edit_merchant_rule')).toBeInTheDocument();
    });

    it('triggers delete target and opens confirmation modal on Delete click', () => {
        const onDelete = vi.fn();

        render(
            <MerchantRulesManager
                rules={mockRules}
                onAdd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={onDelete}
                onRestoreStarter={vi.fn()}
            />
        );

        // Open menu
        fireEvent.click(screen.getByTitle('More options'));

        // Click delete
        fireEvent.click(screen.getByText(/Διαγραφή/i));

        // Confirmation modal is displayed
        expect(screen.getByText(/Είστε βέβαιοι ότι θέλετε να διαγράψετε τον κανόνα/i)).toBeInTheDocument();
    });
});
