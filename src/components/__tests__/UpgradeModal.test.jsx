import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpgradeModal from '../UpgradeModal';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
    useSubscription: vi.fn(),
}));

vi.mock('../../supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'test@example.com' } } }),
        },
    },
}));

describe('UpgradeModal Component', () => {
    const mockCloseUpgradeModal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useSettings.mockReturnValue({
            t: (key, fallback) => fallback || key,
        });
        useSubscription.mockReturnValue({
            isUpgradeModalOpen: true,
            closeUpgradeModal: mockCloseUpgradeModal,
        });
    });

    it('does not render when isUpgradeModalOpen is false', () => {
        useSubscription.mockReturnValue({
            isUpgradeModalOpen: false,
            closeUpgradeModal: mockCloseUpgradeModal,
        });

        const { container } = render(<UpgradeModal />);
        expect(container.firstChild).toBeNull();
    });

    it('renders modal with Spendlore Pro header, features, and safe-area padded footer', () => {
        const { container } = render(<UpgradeModal />);

        expect(screen.getByText('Spendlore Pro')).toBeInTheDocument();
        expect(screen.getByText('PRO')).toBeInTheDocument();
        expect(screen.getByText('€29.99')).toBeInTheDocument();

        // Check footer has the safe-area and navigation bar bottom padding class
        const footer = container.querySelector('.border-t.border-gray-200');
        expect(footer).toBeInTheDocument();
        expect(footer.className).toContain('pb-[max(3.75rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))]');
    });

    it('toggles billing plans when buttons are clicked', () => {
        render(<UpgradeModal />);

        // Initially yearly plan (€29.99) is displayed
        expect(screen.getByText('€29.99')).toBeInTheDocument();

        // Switch to monthly plan
        const monthlyBtn = screen.getByRole('button', { name: /Μηνιαία/i });
        fireEvent.click(monthlyBtn);

        expect(screen.getByText('€2.99')).toBeInTheDocument();
    });

    it('calls closeUpgradeModal when the close button is clicked', () => {
        render(<UpgradeModal />);

        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);

        expect(mockCloseUpgradeModal).toHaveBeenCalledTimes(1);
    });
});

