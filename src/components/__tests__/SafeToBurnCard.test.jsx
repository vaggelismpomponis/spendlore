import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SafeToBurnCard from '../SafeToBurnCard';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('SafeToBurnCard', () => {
    const renderWithContext = (ui) => {
        return render(
            <SettingsProvider>
                {ui}
            </SettingsProvider>
        );
    };

    it('renders the card with daily limit, amount, and streak pill', () => {
        const mockStbData = {
            stb: 244.0,
            todayStartingBudget: 300,
            todaySpend: 56,
            streak: 8,
            isGlideActive: false
        };

        renderWithContext(
            <SafeToBurnCard
                stbData={mockStbData}
                t={(key) => key}
            />
        );

        expect(screen.getByText('Safe-to-Burn')).toBeInTheDocument();
        expect(screen.getByText('8 Streak')).toBeInTheDocument();
        expect(screen.getByText(/244/)).toBeInTheDocument();
        expect(screen.getByText(/Σήμερα|today/i)).toBeInTheDocument();
    });

    it('renders over daily limit warning when stb <= 0', () => {
        const mockStbData = {
            stb: 0,
            todayStartingBudget: 100,
            todaySpend: 150,
            streak: 0,
            isGlideActive: false
        };

        renderWithContext(
            <SafeToBurnCard
                stbData={mockStbData}
                t={(key) => key}
            />
        );

        expect(screen.getByText(/over_daily_limit|Υπέρβαση Ορίου/i)).toBeInTheDocument();
    });

    it('triggers onClick when clicked', () => {
        const handleClick = vi.fn();
        const mockStbData = {
            stb: 150.0,
            todayStartingBudget: 200,
            todaySpend: 50,
            streak: 3
        };

        renderWithContext(
            <SafeToBurnCard
                stbData={mockStbData}
                t={(key) => key}
                onClick={handleClick}
            />
        );

        fireEvent.click(screen.getByText('Safe-to-Burn'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
