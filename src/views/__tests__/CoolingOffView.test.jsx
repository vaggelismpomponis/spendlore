import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CoolingOffView from '../CoolingOffView';
import { useAppStore } from '../../store/useAppStore';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({ language: 'el', t: (k) => k })
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

    it('allows adding a new item through the modal', () => {
        render(<CoolingOffView onBack={vi.fn()} onAddTransaction={vi.fn()} />);

        const openBtn = screen.getByText('Νέα Επιθυμία (72h)');
        fireEvent.click(openBtn);

        expect(screen.getByText('Προσθήκη σε Αναμονή 72 Ωρών')).toBeInTheDocument();

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
        expect(state.coolingOffItems[0].status).toBe('active');
    });
});

