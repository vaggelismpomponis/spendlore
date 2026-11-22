import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatsView from '../StatsView';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock Recharts ResponsiveContainer & charts since JSDOM has zero dimensions
vi.mock('recharts', async () => {
    const actual = await vi.importActual('recharts');
    return {
        ...actual,
        ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container">{children}</div>,
    };
});

const sampleTransactions = [
    {
        id: '1',
        type: 'income',
        amount: 1500,
        category: 'Μισθός',
        date: new Date().toISOString(),
        note: 'Μισθοδοσία'
    },
    {
        id: '2',
        type: 'expense',
        amount: 85.5,
        category: 'Σούπερ Μάρκετ',
        date: new Date().toISOString(),
        note: 'Σκλαβενίτης'
    },
    {
        id: '3',
        type: 'expense',
        amount: 25.0,
        category: 'Φαγητό',
        date: new Date().toISOString(),
        note: 'Wolt'
    }
];

describe('StatsView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithContext = (ui) => {
        return render(
            <SettingsProvider>
                {ui}
            </SettingsProvider>
        );
    };

    it('renders the 4 executive KPI cards: Total Income, Total Expenses, Net Savings, and Performance/Daily Avg', () => {
        renderWithContext(<StatsView transactions={sampleTransactions} />);

        // Check for portfolio overview header
        expect(screen.getByText(/Επισκόπηση Χαρτοφυλακίου/i)).toBeInTheDocument();

        // Check KPI cards
        expect(screen.getByText(/Συνολικά Έσοδα/i)).toBeInTheDocument();
        expect(screen.getByText(/Συνολικά Έξοδα/i)).toBeInTheDocument();
        expect(screen.getByText(/Καθαρή Αποταμίευση/i)).toBeInTheDocument();
        expect(screen.getByText(/Ημερήσιος Μ\.Ο\.|Απόδοση Budget/i)).toBeInTheDocument();
    });

    it('displays weekday spending patterns and top merchants sections in analytics view', () => {
        renderWithContext(<StatsView transactions={sampleTransactions} />);

        // Weekday spending chart title
        expect(screen.getByText(/Έξοδα ανά Ημέρα Εβδομάδας/i)).toBeInTheDocument();

        // Top merchants section
        expect(screen.getByText(/Κορυφαίοι Έμποροι & Καταστήματα/i)).toBeInTheDocument();
        expect(screen.getByText(/Σκλαβενίτης/i)).toBeInTheDocument();
        expect(screen.getByText(/Wolt/i)).toBeInTheDocument();
    });

    it('switches between Analytics and Calendar views using the segmented controls', () => {
        renderWithContext(<StatsView transactions={sampleTransactions} />);

        // Initially in Analytics view
        expect(screen.getByText(/Ανάλυση Τάσεων/i)).toBeInTheDocument();

        // Click Calendar button
        const calendarTabBtn = screen.getByRole('button', { name: /Ημερολόγιο/i });
        fireEvent.click(calendarTabBtn);

        // Calendar section should now be visible
        expect(screen.getByText(/Στατιστικά Ημερολογίου/i)).toBeInTheDocument();
        expect(screen.getByText(/Σερί Χωρίς Έξοδα/i)).toBeInTheDocument();

        // Click back to Analytics view
        const analyticsTabBtn = screen.getByRole('button', { name: /Αναλύσεις/i });
        fireEvent.click(analyticsTabBtn);
        expect(screen.getByText(/Ανάλυση Τάσεων/i)).toBeInTheDocument();
    });

    it('opens category drill-down modal with z-[99999] portal on clicking a category', () => {
        renderWithContext(<StatsView transactions={sampleTransactions} />);

        // Find and click the Σούπερ Μάρκετ category button (from legend or top categories)
        const supermarketBtns = screen.getAllByRole('button', { name: /Σούπερ Μάρκετ/i });
        fireEvent.click(supermarketBtns[0]);

        // Check that dialog is open
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveClass('z-[99999]');

        // Close button
        const closeBtn = dialog.querySelector('button');
        fireEvent.click(closeBtn);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
