import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CoolingOffView from '../CoolingOffView';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../supabase';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({ language: 'el', t: (k) => k, customCategories: { expense: ['Gaming Gadgets'] } })
}));

vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() })
}));

vi.mock('../../utils/haptics', () => ({
    hapticSaveSuccess: vi.fn(),
    hapticImpactLight: vi.fn()
}));

describe('CoolingOffView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAppStore.setState({ coolingOffItems: [] });
    });

    it('renders empty state when there are no items', () => {
        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        expect(screen.getByText('Κανόνας Ψυχραιμίας 72 Ωρών')).toBeInTheDocument();
        expect(screen.getByText('Καμία καταχώρηση')).toBeInTheDocument();
    });

    it('renders active items and displays decision prompt when 72 hours have elapsed', () => {
        const now = Date.now();
        const mockItems = [
            {
                id: 'co_1',
                title: 'Sneakers Nike',
                amount: 140,
                category: 'Διασκέδαση',
                status: 'active',
                createdAt: new Date(now - 75 * 3600 * 1000).toISOString(),
                expiresAt: new Date(now - 3 * 3600 * 1000).toISOString() // expired 3 hours ago
            }
        ];
        useAppStore.setState({ coolingOffItems: mockItems });

        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        expect(screen.getByText('Sneakers Nike')).toBeInTheDocument();
        expect(screen.getByText('Πέρασαν οι 72 ώρες! Το χρειάζεσαι ακόμα;')).toBeInTheDocument();
        expect(screen.getByText('Γλίτωσα τα χρήματα!')).toBeInTheDocument();
        expect(screen.getByText('Ναι, Αγορά')).toBeInTheDocument();
    });

    it('marks item as passed when user confirms they skipped the purchase', () => {
        const now = Date.now();
        const mockItems = [
            {
                id: 'co_1',
                title: 'Smartwatch',
                amount: 220,
                category: 'Τεχνολογία',
                status: 'active',
                expiresAt: new Date(now - 1000).toISOString()
            }
        ];
        useAppStore.setState({ coolingOffItems: mockItems });

        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        const passBtn = screen.getByText('Γλίτωσα τα χρήματα!');
        fireEvent.click(passBtn);

        const state = useAppStore.getState();
        expect(state.coolingOffItems[0].status).toBe('passed');
        expect(state.coolingOffItems[0].savedAmount).toBe(220);
    });

    it('converts to expense transaction when user confirms they still want to buy it', () => {
        const now = Date.now();
        const mockItems = [
            {
                id: 'co_1',
                title: 'Sony Headphones',
                amount: 300,
                category: 'Διασκέδαση',
                note: 'Needed for work',
                status: 'active',
                expiresAt: new Date(now - 1000).toISOString()
            }
        ];
        useAppStore.setState({ coolingOffItems: mockItems });
        const onAddTransactionMock = vi.fn();

        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={onAddTransactionMock} />);

        const buyBtn = screen.getByText('Ναι, Αγορά');
        fireEvent.click(buyBtn);

        expect(onAddTransactionMock).toHaveBeenCalledWith({
            type: 'expense',
            amount: 300,
            category: 'Διασκέδαση',
            note: 'Needed for work (72h Rule)'
        });

        const state = useAppStore.getState();
        expect(state.coolingOffItems[0].status).toBe('bought');
    });

    it('allows adding a new item through the modal with custom categories', () => {
        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        const openBtn = screen.getByText(/Νέα Επιθυμία/i);
        fireEvent.click(openBtn);

        expect(screen.getByText('Προσθήκη σε Αναμονή 72 Ωρών')).toBeInTheDocument();

        // Custom category should be available in dropdown options
        const selectTrigger = screen.getByText('Διασκέδαση');
        fireEvent.click(selectTrigger);
        expect(screen.getByText('Gaming Gadgets')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Gaming Gadgets'));

        const titleInput = screen.getByPlaceholderText('π.χ. Ακουστικά Sony, Sneakers Nike');
        const amountInput = screen.getByPlaceholderText('0.00');

        fireEvent.change(titleInput, { target: { value: 'Espresso Machine' } });
        fireEvent.change(amountInput, { target: { value: '450' } });

        const submitBtn = screen.getByText('Έναρξη 72h');
        fireEvent.click(submitBtn);

        const state = useAppStore.getState();
        expect(state.coolingOffItems.length).toBe(1);
        expect(state.coolingOffItems[0].title).toBe('Espresso Machine');
        expect(state.coolingOffItems[0].amount).toBe(450);
        expect(state.coolingOffItems[0].category).toBe('Gaming Gadgets');
        expect(state.coolingOffItems[0].status).toBe('active');
    });

    it('prompts confirmation modal on delete and removes item only upon confirmation', () => {
        const mockItems = [
            {
                id: 'co_del',
                title: 'Mechanical Keyboard',
                amount: 150,
                category: 'Διασκέδαση',
                status: 'active',
                expiresAt: new Date(Date.now() + 50000).toISOString()
            }
        ];
        useAppStore.setState({ coolingOffItems: mockItems });

        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();

        const deleteBtn = screen.getByTitle('Διαγραφή');
        fireEvent.click(deleteBtn);

        // Confirmation modal should appear
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Διαγραφή Επιθυμίας')).toBeInTheDocument();
        expect(within(dialog).getByText(/Είστε σίγουροι ότι θέλετε να διαγράψετε το «Mechanical Keyboard»/i)).toBeInTheDocument();

        // Confirm inside dialog
        const confirmBtn = within(dialog).getByRole('button', { name: 'Διαγραφή' });
        fireEvent.click(confirmBtn);

        const state = useAppStore.getState();
        expect(state.coolingOffItems.length).toBe(0);
    });

    it('persists item deletion and updates to Supabase cooling_off_items table', () => {
        const mockUser = { id: 'user-777', email: 'test@spendlore.app' };
        const mockItems = [
            {
                id: 'co_sync',
                title: 'Bose Headphones',
                amount: 320,
                category: 'Διασκέδαση',
                status: 'active',
                expiresAt: new Date(Date.now() + 100000).toISOString()
            }
        ];
        useAppStore.setState({ coolingOffItems: mockItems });

        render(<CoolingOffView user={mockUser} onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        const deleteBtn = screen.getByTitle('Διαγραφή');
        fireEvent.click(deleteBtn);

        const dialog = screen.getByRole('dialog');
        const confirmBtn = within(dialog).getByRole('button', { name: 'Διαγραφή' });
        fireEvent.click(confirmBtn);

        expect(supabase.from).toHaveBeenCalledWith('cooling_off_items');
    });
});

