import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BalanceTrendCard from '../home/BalanceTrendCard';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

describe('BalanceTrendCard', () => {
    const mockT = vi.fn((key) => key);
    const mockTogglePrivacy = vi.fn();

    const sampleTransactions = [
        { id: '1', amount: 500, type: 'income', date: '2026-11-01T10:00:00.000Z' },
        { id: '2', amount: 200, type: 'expense', date: '2026-11-10T14:00:00.000Z' },
        { id: '3', amount: 100, type: 'expense', date: '2026-11-15T09:00:00.000Z' },
    ];

    it('renders month spend at the top and total balance in the card below', () => {
        useSettings.mockReturnValue({
            t: mockT,
            privacyMode: false,
            currency: '€',
            language: 'el',
        });

        render(
            <BalanceTrendCard
                balance={3900}
                transactions={sampleTransactions}
                currency="€"
                privacyMode={false}
                togglePrivacyMode={mockTogglePrivacy}
                monthSpend={858.49}
                monthIncome={442.26}
                monthNet={-416.23}
                isMonthNetPositive={false}
                spendTrend="below"
                diffPct={42}
                t={mockT}
                language="el"
            />
        );

        // Month spend title at the top
        expect(screen.getByText('this_month_spend')).toBeInTheDocument();
        // Month spend amount
        expect(screen.getByText(/858\.49|858,49/)).toBeInTheDocument();

        // Timeframe selector button starts at MTD
        expect(screen.getByText('MTD')).toBeInTheDocument();

        // Total balance card below
        expect(screen.getByText('all_time_balance')).toBeInTheDocument();
        expect(screen.getByText(/3\.900|3,900/)).toBeInTheDocument();

        // Cashflow capsules
        expect(screen.getByText('month_income')).toBeInTheDocument();
        expect(screen.getByText('month_net')).toBeInTheDocument();
    });

    it('opens timeframe dropdown and allows selection', () => {
        useSettings.mockReturnValue({
            t: mockT,
            privacyMode: false,
            currency: '€',
            language: 'el',
        });

        render(
            <BalanceTrendCard
                balance={3900}
                transactions={sampleTransactions}
                currency="€"
                privacyMode={false}
                t={mockT}
                language="el"
            />
        );

        const timeframeBtn = screen.getByText('MTD');
        fireEvent.click(timeframeBtn);

        // Menu should open displaying options like 7Η, 30Η, 1E, All/Όλα
        expect(screen.getByText('7Η')).toBeInTheDocument();
        expect(screen.getByText('30Η')).toBeInTheDocument();
        expect(screen.getByText('Όλα')).toBeInTheDocument();

        // Click on 7Η
        fireEvent.click(screen.getByText('7Η'));
        // 7Η should now be the button label
        expect(screen.getByText('7Η')).toBeInTheDocument();
        // Menu closes
        expect(screen.queryByText('Τρέχουσα εβδομάδα')).not.toBeInTheDocument();
    });

    it('masks values when privacy mode is enabled', () => {
        useSettings.mockReturnValue({
            t: mockT,
            privacyMode: true,
            currency: '€',
            language: 'el',
        });

        render(
            <BalanceTrendCard
                balance={3900}
                transactions={sampleTransactions}
                currency="€"
                privacyMode={true}
                togglePrivacyMode={mockTogglePrivacy}
                monthSpend={300}
                t={mockT}
                language="el"
            />
        );

        // In privacy mode, Amount masks as **** and trend subtitle renders ••••
        expect(screen.getAllByText('****')[0]).toBeInTheDocument();
        expect(screen.getByText('••••')).toBeInTheDocument();

        // Privacy button calls toggle
        const toggleBtn = screen.getByRole('button', { name: /Disable Privacy Mode/i });
        fireEvent.click(toggleBtn);
        expect(mockTogglePrivacy).toHaveBeenCalledTimes(1);
    });

    it('renders English labels when language is en', () => {
        useSettings.mockReturnValue({
            t: mockT,
            privacyMode: false,
            currency: '€',
            language: 'en',
        });

        render(
            <BalanceTrendCard
                balance={1500}
                transactions={sampleTransactions}
                currency="€"
                privacyMode={false}
                t={mockT}
                language="en"
            />
        );

        expect(screen.getByText('MTD')).toBeInTheDocument();
    });

    it('displays tooltip card on pointer move / tap and dismisses on outside click', () => {
        useSettings.mockReturnValue({
            t: mockT,
            privacyMode: false,
            currency: '€',
            language: 'el',
        });

        const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 600,
            height: 120,
            left: 0,
            top: 0,
            right: 600,
            bottom: 120,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));

        try {
            const { container } = render(
                <BalanceTrendCard
                    balance={3900}
                    transactions={sampleTransactions}
                    currency="€"
                    privacyMode={false}
                    monthSpend={300}
                    t={mockT}
                    language="el"
                />
            );

            // Initially tooltip is not shown
            expect(screen.queryByTestId('chart-tooltip-card')).not.toBeInTheDocument();

            // Simulate pointer move over chart
            const chartArea = container.querySelector('.cursor-crosshair');
            expect(chartArea).toBeInTheDocument();
            fireEvent.pointerMove(chartArea, { clientX: 200 });

            // Scrubber dot and tooltip should appear
            const dot = screen.getByTestId('chart-scrubber-dot');
            expect(dot).toBeInTheDocument();

            const tooltip = screen.getByTestId('chart-tooltip-card');
            expect(tooltip).toBeInTheDocument();
            expect(tooltip.textContent).toContain('—');

            // Simulate clicking outside to dismiss
            fireEvent.pointerDown(document.body);
            expect(screen.queryByTestId('chart-tooltip-card')).not.toBeInTheDocument();
        } finally {
            Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
        }
    });
});
