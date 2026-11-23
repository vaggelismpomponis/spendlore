import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CoolingOffModal from '../CoolingOffModal';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('CoolingOffModal', () => {
    const renderWithContext = (ui) => {
        return render(
            <SettingsProvider>
                {ui}
            </SettingsProvider>
        );
    };

    it('renders modal with strictly the 72-hour option', () => {
        renderWithContext(
            <CoolingOffModal isOpen={true} onClose={vi.fn()} onAdd={vi.fn()} />
        );

        expect(screen.getByText('Προσθήκη σε Αναμονή 72 Ωρών')).toBeInTheDocument();
        expect(screen.getByText('72 Ώρες (3 ημέρες)')).toBeInTheDocument();
        expect(screen.getByText('Κανόνας 72 Ωρών')).toBeInTheDocument();

        // 24 hours, 48 hours, and 7 days should NOT exist
        expect(screen.queryByText(/24 Ώρες/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/48 Ώρες/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/7 Ημέρες/i)).not.toBeInTheDocument();
    });

    it('calls onAdd with item locked to 72 hours when form is submitted', () => {
        const handleAdd = vi.fn();
        const handleClose = vi.fn();

        renderWithContext(
            <CoolingOffModal isOpen={true} onClose={handleClose} onAdd={handleAdd} />
        );

        const titleInput = screen.getByPlaceholderText('π.χ. Ακουστικά Sony, Sneakers Nike');
        const amountInput = screen.getByPlaceholderText('0.00');

        fireEvent.change(titleInput, { target: { value: 'Sony WH-1000XM5' } });
        fireEvent.change(amountInput, { target: { value: '299' } });

        const submitBtn = screen.getByText('Έναρξη 72h');
        fireEvent.click(submitBtn);

        expect(handleAdd).toHaveBeenCalledTimes(1);
        const createdItem = handleAdd.mock.calls[0][0];
        expect(createdItem.title).toBe('Sony WH-1000XM5');
        expect(createdItem.amount).toBe(299);
        expect(createdItem.durationHours).toBe(72);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press or cancel button', () => {
        const handleClose = vi.fn();

        renderWithContext(
            <CoolingOffModal isOpen={true} onClose={handleClose} onAdd={vi.fn()} />
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);

        const cancelBtn = screen.getByText('Ακύρωση');
        fireEvent.click(cancelBtn);
        expect(handleClose).toHaveBeenCalledTimes(2);
    });
});
