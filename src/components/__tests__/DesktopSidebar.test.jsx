import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DesktopSidebar from '../DesktopSidebar';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
    useSubscription: vi.fn(),
}));

describe('DesktopSidebar Component', () => {
    const defaultSettings = {
        t: (k) => {
            const dict = {
                nav_main: 'ΚΥΡΙΕΣ ΣΕΛΙΔΕΣ',
                nav_home: 'Αρχική',
                nav_stats: 'Ανάλυση',
                nav_history: 'Ιστορικό',
                quick_access: 'ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ',
                goals: 'Στόχοι',
                budgets: 'Προϋπολογισμοί',
                recurring: 'Επαναλαμβανόμενα',
                advisor_title: 'Spendlore AI Σύμβουλος',
                settings: 'Ρυθμίσεις',
                admin_panel: 'Πίνακας Διαχείρισης'
            };
            return dict[k] || k;
        },
        theme: 'light',
        toggleTheme: vi.fn(),
        privacyMode: false,
        togglePrivacyMode: vi.fn()
    };

    const defaultSubscription = {
        isPro: true,
        openUpgradeModal: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useSettings.mockReturnValue(defaultSettings);
        useSubscription.mockReturnValue(defaultSubscription);
    });

    it('does not render Admin Control Panel for standard non-admin users', () => {
        render(
            <DesktopSidebar
                activeTab="home"
                setActiveTab={vi.fn()}
                user={{ id: 'regular-user-id', email: 'user@example.com' }}
                displayName="Regular User"
                photoURL={null}
                balance={100}
                totalIncome={200}
                totalExpense={100}
                onSignOut={vi.fn()}
            />
        );

        expect(screen.queryByText('Πίνακας Διαχείρισης')).not.toBeInTheDocument();
        expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });

    it('renders Admin Control Panel with ADMIN badge for master admin and handles navigation', () => {
        const setActiveTab = vi.fn();
        const setPreviousTab = vi.fn();

        render(
            <DesktopSidebar
                activeTab="settings"
                setActiveTab={setActiveTab}
                setPreviousTab={setPreviousTab}
                user={{ id: '86177767-e1f2-4356-b98b-e43503cab0da', email: 'admin@spendlore.gr' }}
                displayName="Vaggelis"
                photoURL={null}
                balance={500}
                totalIncome={1000}
                totalExpense={500}
                onSignOut={vi.fn()}
            />
        );

        const adminItem = screen.getByText('Πίνακας Διαχείρισης');
        expect(adminItem).toBeInTheDocument();
        expect(screen.getByText('ADMIN')).toBeInTheDocument();

        fireEvent.click(adminItem);
        expect(setPreviousTab).toHaveBeenCalledWith('settings');
        expect(setActiveTab).toHaveBeenCalledWith('admin');
    });

    it('renders Admin Control Panel when user has role="admin"', () => {
        render(
            <DesktopSidebar
                activeTab="home"
                setActiveTab={vi.fn()}
                user={{ id: 'secondary-admin-id', email: 'manager@spendlore.gr', role: 'admin' }}
                displayName="Admin Manager"
                photoURL={null}
                balance={500}
                totalIncome={1000}
                totalExpense={500}
                onSignOut={vi.fn()}
            />
        );

        expect(screen.getByText('Πίνακας Διαχείρισης')).toBeInTheDocument();
    });
});

