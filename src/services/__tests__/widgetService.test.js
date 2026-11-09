import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateNativeWidget } from '../widgetService';
import { Capacitor } from '@capacitor/core';

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn()
    }
}));

describe('widgetService', () => {
    let mockUpdateWidget;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUpdateWidget = vi.fn().mockResolvedValue({});
        window.Capacitor = {
            Plugins: {
                TransactionReader: {
                    updateWidget: mockUpdateWidget
                }
            }
        };
    });

    afterEach(() => {
        delete window.Capacitor;
    });

    it('returns false and does not call native plugin when not on native platform', async () => {
        Capacitor.isNativePlatform.mockReturnValue(false);

        const result = await updateNativeWidget({
            stb: 34.50,
            todayStartingBudget: 50,
            todaySpend: 15.50
        });

        expect(result).toBe(false);
        expect(mockUpdateWidget).not.toHaveBeenCalled();
    });

    it('formats safe amount correctly on native platform for Greek language', async () => {
        Capacitor.isNativePlatform.mockReturnValue(true);

        const result = await updateNativeWidget({
            stb: 34.50,
            todayStartingBudget: 50,
            todaySpend: 15.50,
            currency: '€',
            language: 'el'
        });

        expect(result).toBe(true);
        expect(mockUpdateWidget).toHaveBeenCalledWith({
            amount: expect.stringContaining('34,50'),
            label: 'Διαθέσιμο σήμερα',
            isOver: false,
            hasIncome: true
        });
    });

    it('formats safe amount correctly on native platform for English language', async () => {
        Capacitor.isNativePlatform.mockReturnValue(true);

        const result = await updateNativeWidget({
            stb: 25.00,
            todayStartingBudget: 60,
            todaySpend: 35.00,
            currency: '$',
            language: 'en'
        });

        expect(result).toBe(true);
        expect(mockUpdateWidget).toHaveBeenCalledWith({
            amount: expect.stringContaining('25.00'),
            label: 'Safe today',
            isOver: false,
            hasIncome: true
        });
    });

    it('handles exceeded budget (stb <= 0) gracefully', async () => {
        Capacitor.isNativePlatform.mockReturnValue(true);

        const result = await updateNativeWidget({
            stb: -10,
            todayStartingBudget: 40,
            todaySpend: 50,
            currency: '€',
            language: 'el'
        });

        expect(result).toBe(true);
        expect(mockUpdateWidget).toHaveBeenCalledWith({
            amount: '0,00 €',
            label: 'Όριο εξαντλήθηκε',
            isOver: true,
            hasIncome: true
        });
    });

    it('handles zero income configuration', async () => {
        Capacitor.isNativePlatform.mockReturnValue(true);

        const result = await updateNativeWidget({
            stb: 0,
            todayStartingBudget: 0,
            todaySpend: 0,
            currency: '€',
            language: 'el'
        });

        expect(result).toBe(true);
        expect(mockUpdateWidget).toHaveBeenCalledWith({
            amount: '—',
            label: 'Χωρίς Έσοδα',
            isOver: false,
            hasIncome: false
        });
    });
});

