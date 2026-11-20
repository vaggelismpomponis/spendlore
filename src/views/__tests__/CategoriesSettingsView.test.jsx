import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoriesSettingsView from '../CategoriesSettingsView';

const mockAddCustomCategory = vi.fn();
const mockEditCustomCategory = vi.fn().mockReturnValue({ success: true });
const mockDeleteCustomCategory = vi.fn().mockReturnValue({ success: true });
const mockShowToast = vi.fn();

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        language: 'el',
        t: (k, params) => {
            if (params?.category) return `Delete ${params.category}?`;
            if (params?.count !== undefined) return `${params.count} transactions`;
            if (k === 'tx_count_singular') return '1 transaction';
            return k;
        },
        customCategories: {
            expense: ['Pills', 'Καύσιμα'],
            income: ['Freelance']
        },
        addCustomCategory: mockAddCustomCategory,
        editCustomCategory: mockEditCustomCategory,
        deleteCustomCategory: mockDeleteCustomCategory
    })
}));

vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({
        showToast: mockShowToast
    })
}));

let mockIsPro = true;
const mockOpenUpgradeModal = vi.fn();

vi.mock('../../contexts/SubscriptionContext', () => ({
    useSubscription: () => ({
        isPro: mockIsPro,
        openUpgradeModal: mockOpenUpgradeModal
    })
}));

describe('CategoriesSettingsView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders custom categories and transaction counts', () => {
        const transactions = [
            { category: 'Pills', type: 'expense' },
            { category: 'Pills', type: 'expense' },
            { category: 'Καύσιμα', type: 'expense' }
        ];

        render(<CategoriesSettingsView transactions={transactions} onBack={vi.fn()} />);

        expect(screen.getByText('Pills')).toBeInTheDocument();
        expect(screen.getByText('Καύσιμα')).toBeInTheDocument();
        expect(screen.getByText('2 transactions')).toBeInTheDocument();
        expect(screen.getByText('1 transaction')).toBeInTheDocument();
    });

    it('switches between expense and income tabs', () => {
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        expect(screen.getByText('Pills')).toBeInTheDocument();

        // Switch to Income tab
        const incomeTab = screen.getByText('categories_income_tab');
        fireEvent.click(incomeTab);

        expect(screen.getByText('Freelance')).toBeInTheDocument();
        expect(screen.queryByText('Pills')).not.toBeInTheDocument();
    });

    it('opens inline edit mode and saves renamed category', async () => {
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        // Open row menu on Pills (first more options button) then click edit
        const moreButtons = screen.getAllByTitle('More options');
        fireEvent.click(moreButtons[0]);

        const editButton = screen.getByTitle('edit_category');
        fireEvent.click(editButton);

        const input = screen.getByDisplayValue('Pills');
        fireEvent.change(input, { target: { value: 'Βιταμίνες' } });

        const saveButton = screen.getByTitle('save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockEditCustomCategory).toHaveBeenCalledWith('expense', 'Pills', 'Βιταμίνες');
            expect(mockShowToast).toHaveBeenCalledWith('category_updated_success', 'success');
        });
    });

    it('prompts delete modal and calls deleteCustomCategory with reassign target', async () => {
        const transactions = [{ category: 'Pills', type: 'expense' }];
        render(<CategoriesSettingsView transactions={transactions} onBack={vi.fn()} />);

        // Open row menu on Pills then click delete
        const moreButtons = screen.getAllByTitle('More options');
        fireEvent.click(moreButtons[0]);

        const deleteButton = screen.getByTitle('delete_category');
        fireEvent.click(deleteButton);

        // Delete modal appears
        expect(screen.getByText(/delete_category/i)).toBeInTheDocument();

        // Click confirm delete
        const confirmBtn = screen.getByTestId('confirm-delete-category-btn');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(mockDeleteCustomCategory).toHaveBeenCalledWith('expense', 'Pills', 'Άλλο');
            expect(mockShowToast).toHaveBeenCalledWith('category_deleted_success', 'success');
        });
    });

    it('renders PRO badge and opens upgrade modal when non-pro user tries to add category', () => {
        mockIsPro = false;
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        // Expect PRO badges to be present
        const proBadges = screen.getAllByText('PRO');
        expect(proBadges.length).toBeGreaterThan(0);

        // Click Add Category button
        const addBtn = screen.getByRole('button', { name: /add_category/i });
        fireEvent.click(addBtn);

        expect(mockOpenUpgradeModal).toHaveBeenCalledWith('categories');

        // Reset mockIsPro
        mockIsPro = true;
    });

    it('navigates back when clicking breadcrumb home', () => {
        const handleBack = vi.fn();
        render(<CategoriesSettingsView transactions={[]} onBack={handleBack} />);

        const homeBreadcrumb = screen.getByText('categories_breadcrumb_home');
        fireEvent.click(homeBreadcrumb);

        expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it('opens New category modal and adds category', async () => {
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        // Click + New category button
        const newCatBtn = screen.getByRole('button', { name: /add_category/i });
        fireEvent.click(newCatBtn);

        // Modal appears
        expect(screen.getByText('new_category_modal')).toBeInTheDocument();

        // Type name
        const input = screen.getByPlaceholderText('category_name_placeholder');
        fireEvent.change(input, { target: { value: 'Streaming' } });

        // Submit form
        const submitBtn = screen.getByTitle('save');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockAddCustomCategory).toHaveBeenCalledWith('expense', 'Streaming');
            expect(mockShowToast).toHaveBeenCalledWith('category_added_success', 'success');
        });
    });

    it('opens header menu and triggers reset to defaults', () => {
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        const moreBtn = screen.getByTitle('More actions');
        fireEvent.click(moreBtn);

        const resetBtn = screen.getByText('use_defaults_recommended');
        fireEvent.click(resetBtn);

        expect(mockShowToast).toHaveBeenCalledWith('defaults_restored', 'success');
    });
});
