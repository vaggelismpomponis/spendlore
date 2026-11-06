import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationModal from '../ConfirmationModal';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (k) => (k === 'cancel' ? 'Ακύρωση' : k === 'confirm_default' ? 'Επιβεβαίωση' : k)
    })
}));

describe('ConfirmationModal Component', () => {
    it('returns null when isOpen is false', () => {
        const { container } = render(
            <ConfirmationModal
                isOpen={false}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Modal"
                message="Test Message"
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('portals to document.body with z-[99999] and backdrop-blur-md when isOpen is true', () => {
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Оριστική Διαγραφή"
                message="Είστε σίγουρος;"
                confirmText="Διαγραφή"
                type="danger"
            />
        );

        // Check modal content is rendered in document.body
        expect(screen.getByText('Оριστική Διαγραφή')).toBeInTheDocument();
        expect(screen.getByText('Είστε σίγουρος;')).toBeInTheDocument();
        expect(screen.getByText('Διαγραφή')).toBeInTheDocument();
        expect(screen.getByText('Ακύρωση')).toBeInTheDocument();

        // Check top-level modal wrapper has z-[99999]
        const dialog = screen.getByRole('dialog');
        expect(dialog.className).toContain('z-[99999]');
        expect(dialog.className).toContain('fixed inset-0');

        // Check backdrop has backdrop-blur-md and fixed inset-0
        const backdrop = dialog.querySelector('.backdrop-blur-md');
        expect(backdrop).toBeInTheDocument();
        expect(backdrop.className).toContain('fixed inset-0');
        expect(backdrop.className).toContain('bg-black/60');
    });

    it('invokes onClose when backdrop is clicked', () => {
        const onClose = vi.fn();
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={onClose}
                onConfirm={vi.fn()}
                title="Test Modal"
                message="Test Message"
            />
        );

        const dialog = screen.getByRole('dialog');
        const backdrop = dialog.querySelector('.backdrop-blur-md');
        fireEvent.click(backdrop);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('invokes onConfirm and onClose when confirm button is clicked', () => {
        const onClose = vi.fn();
        const onConfirm = vi.fn();
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
                title="Test Modal"
                message="Test Message"
                confirmText="Επιβεβαίωση"
            />
        );

        fireEvent.click(screen.getByText('Επιβεβαίωση'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

