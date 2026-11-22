import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DesktopBreadcrumb from '../DesktopBreadcrumb';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

describe('DesktopBreadcrumb', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Greek default breadcrumb "Αρχική > Κατηγορίες" and triggers onBack', () => {
        useSettings.mockReturnValue({
            language: 'el',
            t: (key) => {
                const map = {
                    categories_breadcrumb_home: 'Αρχική',
                    categories_breadcrumb_categories: 'Κατηγορίες',
                };
                return map[key] || key;
            },
        });

        const handleBack = vi.fn();
        render(<DesktopBreadcrumb onBack={handleBack} currentLabel="Κατηγορίες" />);

        expect(screen.getByText('Αρχική')).toBeInTheDocument();
        expect(screen.getByText('Κατηγορίες')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Αρχική'));
        expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it('renders English default breadcrumb "Home > Categories"', () => {
        useSettings.mockReturnValue({
            language: 'en',
            t: (key) => {
                const map = {
                    categories_breadcrumb_home: 'Home',
                    categories_breadcrumb_categories: 'Categories',
                };
                return map[key] || key;
            },
        });

        render(<DesktopBreadcrumb onBack={vi.fn()} currentLabel="Categories" />);

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('renders custom parentLabel and rightAction', () => {
        useSettings.mockReturnValue({ language: 'el', t: () => null });

        render(
            <DesktopBreadcrumb
                onBack={vi.fn()}
                parentLabel="Προηγούμενο"
                currentLabel="Ρυθμίσεις"
                rightAction={<button type="button">Extra Action</button>}
            />
        );

        expect(screen.getByText('Προηγούμενο')).toBeInTheDocument();
        expect(screen.getByText('Ρυθμίσεις')).toBeInTheDocument();
        expect(screen.getByText('Extra Action')).toBeInTheDocument();
    });

    it('returns null when hideHeader is false', () => {
        useSettings.mockReturnValue({ language: 'el', t: () => null });

        const { container } = render(
            <DesktopBreadcrumb onBack={vi.fn()} currentLabel="Ρυθμίσεις" hideHeader={false} />
        );

        expect(container.firstChild).toBeNull();
    });

    it('does not render back button when hideBack is true', () => {
        useSettings.mockReturnValue({ language: 'el', t: () => null });

        render(
            <DesktopBreadcrumb
                onBack={vi.fn()}
                currentLabel="Όροι Χρήσης"
                hideBack={true}
                hideHeader={true}
            />
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByText('Όροι Χρήσης')).toBeInTheDocument();
    });
});
