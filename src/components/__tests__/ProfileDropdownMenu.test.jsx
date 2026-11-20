import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileDropdownMenu from '../ProfileDropdownMenu';
import { APP_VERSION } from '../../utils/version';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        language: 'el',
        theme: 'light',
    }),
}));

describe('ProfileDropdownMenu Component', () => {
    const defaultProps = {
        user: { id: 'u1', email: 'vaggelisbobonhs@gmail.com' },
        displayName: 'EVANGELOS Bomponis',
        photoURL: null,
        onSignOut: vi.fn(),
        setActiveTab: vi.fn(),
        onOpenWhatsNew: vi.fn(),
    };

    it('renders profile avatar button initially without dropdown open', () => {
        render(<ProfileDropdownMenu {...defaultProps} />);

        // The button has initials "EB"
        const avatarBtn = screen.getByRole('button', { name: /user profile menu/i });
        expect(avatarBtn).toBeInTheDocument();
        expect(screen.getByText('EB')).toBeInTheDocument();

        // Menu should not be in document initially
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens dropdown menu on click, displaying user info, version row, and menu items', () => {
        render(<ProfileDropdownMenu {...defaultProps} />);

        const avatarBtn = screen.getByRole('button', { name: /user profile menu/i });
        fireEvent.click(avatarBtn);

        // Menu should be open
        expect(screen.getByRole('menu')).toBeInTheDocument();

        // User info
        expect(screen.getByText('EVANGELOS Bomponis')).toBeInTheDocument();
        expect(screen.getByText('vaggelisbobonhs@gmail.com')).toBeInTheDocument();

        // Version badge
        expect(screen.getByText(new RegExp(`v${APP_VERSION}`))).toBeInTheDocument();

        // Quick options
        expect(screen.getByText('Ρυθμίσεις')).toBeInTheDocument();
        expect(screen.getByText('Τι νέο υπάρχει')).toBeInTheDocument();
        expect(screen.getByText('Τεχνική Υποστήριξη')).toBeInTheDocument();
        expect(screen.getByText('Αποσύνδεση')).toBeInTheDocument();
        expect(screen.queryByText('Αποστολή Σχολίων')).not.toBeInTheDocument();
    });

    it('navigates to settings when clicking Settings option', () => {
        const setActiveTab = vi.fn();
        render(<ProfileDropdownMenu {...defaultProps} setActiveTab={setActiveTab} />);

        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
        fireEvent.click(screen.getByText('Ρυθμίσεις'));

        expect(setActiveTab).toHaveBeenCalledWith('profile');
        // Menu should close
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens WhatsNew modal when clicking Changelog / What\'s New option', () => {
        const onOpenWhatsNew = vi.fn();
        render(<ProfileDropdownMenu {...defaultProps} onOpenWhatsNew={onOpenWhatsNew} />);

        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
        fireEvent.click(screen.getByText('Τι νέο υπάρχει'));

        expect(onOpenWhatsNew).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('invokes onSignOut when clicking Log out option', () => {
        const onSignOut = vi.fn();
        render(<ProfileDropdownMenu {...defaultProps} onSignOut={onSignOut} />);

        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
        fireEvent.click(screen.getByText('Αποσύνδεση'));

        expect(onSignOut).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
        render(<ProfileDropdownMenu {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
        expect(screen.getByRole('menu')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
