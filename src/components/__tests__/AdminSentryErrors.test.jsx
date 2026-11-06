import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminSentryErrors from '../admin/AdminSentryErrors';

describe('AdminSentryErrors Component', () => {
    const mockErrors = [
        {
            id: 'err-1',
            message: 'TypeError: Cannot read properties of undefined (reading count)',
            level: 'error',
            context: 'BudgetView',
            timestamp: '2026-11-06T00:10:00Z',
            url: '/budgets',
            userEmail: 'admin@spendlore.gr',
            stack: 'TypeError: Cannot read properties\n    at BudgetView (BudgetView.jsx:120)'
        },
        {
            id: 'err-2',
            message: 'Network request timeout while fetching exchange rates',
            level: 'warning',
            context: 'RatesService',
            timestamp: '2026-11-06T00:12:00Z',
            url: '/transactions',
            userEmail: 'user@spendlore.gr',
            stack: 'Error: Timeout\n    at fetchRates (rates.js:45)'
        }
    ];

    it('renders empty state when error list is empty', () => {
        render(
            <AdminSentryErrors
                errors={[]}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={vi.fn()}
            />
        );

        expect(screen.getByText('No Sentry errors recorded')).toBeInTheDocument();
        expect(screen.getByText(/All systems operational/i)).toBeInTheDocument();
    });

    it('renders error list with status chips and telemetry metadata', () => {
        render(
            <AdminSentryErrors
                errors={mockErrors}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={vi.fn()}
            />
        );

        expect(screen.getByText('Sentry Telemetry & Error Logging')).toBeInTheDocument();
        expect(screen.getByText('TypeError: Cannot read properties of undefined (reading count)')).toBeInTheDocument();
        expect(screen.getByText('Network request timeout while fetching exchange rates')).toBeInTheDocument();
        expect(screen.getByText('[BudgetView]')).toBeInTheDocument();
        expect(screen.getByText('[RatesService]')).toBeInTheDocument();
    });

    it('filters error list by search query', () => {
        render(
            <AdminSentryErrors
                errors={mockErrors}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/Search errors by message/i);
        fireEvent.change(searchInput, { target: { value: 'exchange rates' } });

        expect(screen.queryByText(/TypeError: Cannot read properties/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Network request timeout/i)).toBeInTheDocument();
    });

    it('filters error list by level filter button', () => {
        render(
            <AdminSentryErrors
                errors={mockErrors}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={vi.fn()}
            />
        );

        const warningsFilterBtn = screen.getByRole('button', { name: 'Warnings' });
        fireEvent.click(warningsFilterBtn);

        expect(screen.queryByText(/TypeError: Cannot read properties/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Network request timeout/i)).toBeInTheDocument();
    });

    it('triggers onTriggerTest when test error button is clicked', () => {
        const onTriggerTest = vi.fn();
        render(
            <AdminSentryErrors
                errors={mockErrors}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={onTriggerTest}
            />
        );

        const testBtn = screen.getByRole('button', { name: /Test Error/i });
        fireEvent.click(testBtn);

        expect(onTriggerTest).toHaveBeenCalledTimes(1);
    });

    it('expands error card to reveal stack trace and drawer details', () => {
        render(
            <AdminSentryErrors
                errors={mockErrors}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={vi.fn()}
            />
        );

        // Click on the first error message to expand
        const cardHeader = screen.getByText('TypeError: Cannot read properties of undefined (reading count)');
        fireEvent.click(cardHeader);

        expect(screen.getByText(/at BudgetView \(BudgetView\.jsx:120\)/i)).toBeInTheDocument();
        expect(screen.getByText('Copy Stack')).toBeInTheDocument();
    });

    it('links to the configured Sentry production dashboard', () => {
        render(
            <AdminSentryErrors
                errors={mockErrors}
                onClear={vi.fn()}
                onRefresh={vi.fn()}
                onTriggerTest={vi.fn()}
            />
        );

        const dashboardLink = screen.getByRole('link', { name: /Sentry Dashboard/i });
        expect(dashboardLink).toHaveAttribute('href', 'https://spendwise-mz.sentry.io/issues/?environment=production&project=4511308038013008&statsPeriod=14d');
        expect(dashboardLink).toHaveAttribute('target', '_blank');
        expect(dashboardLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});

