import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeSelectionModal from '../ThemeSelectionModal';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

describe('ThemeSelectionModal Component', () => {
    const updateThemePreference = vi.fn();
    const mockSettings = {
        t: (k) => {
            const dict = {
                theme: 'Θέμα',
                appearance_theme: 'Εμφάνιση & Θέμα',
                select_theme: 'Επιλέξτε το θέμα εμφάνισης',
                theme_system: 'Προεπιλογή συστήματος',
                theme_system_desc: 'Αυτόματη προσαρμογή στις ρυθμίσεις της συσκευής',
                theme_light: 'Φωτεινό',
                theme_light_desc: 'Κλασική φωτεινή εμφάνιση με υψηλή αντίθεση',
                theme_dark: 'Σκοτεινό',
                theme_dark_desc: 'Ξεκούραστο για τα μάτια σε συνθήκες χαμηλού φωτισμού',
                done: 'Τέλος',
                close: 'Κλείσιμο',
            };
            return dict[k] || k;
        },
        themePreference: 'system',
        updateThemePreference,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useSettings.mockReturnValue(mockSettings);
    });

    it('does not render when isOpen is false', () => {
        render(<ThemeSelectionModal isOpen={false} onClose={vi.fn()} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the 3 theme options in exact order: light, dark, system', () => {
        render(<ThemeSelectionModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Θέμα')).toBeInTheDocument();

        // Light option, Dark option, System option
        const optionTitles = [
            screen.getByText('Φωτεινό'),
            screen.getByText('Σκοτεινό'),
            screen.getByText('Προεπιλογή συστήματος')
        ];

        expect(optionTitles[0]).toBeInTheDocument();
        expect(optionTitles[1]).toBeInTheDocument();
        expect(optionTitles[2]).toBeInTheDocument();

        // Verify order in DOM
        const lightCard = optionTitles[0].closest('button');
        const darkCard = optionTitles[1].closest('button');
        const systemCard = optionTitles[2].closest('button');

        expect(lightCard.compareDocumentPosition(darkCard)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(darkCard.compareDocumentPosition(systemCard)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('calls updateThemePreference when selecting an option', () => {
        render(<ThemeSelectionModal isOpen={true} onClose={vi.fn()} />);

        const lightBtn = screen.getByText('Φωτεινό').closest('button');
        fireEvent.click(lightBtn);

        expect(updateThemePreference).toHaveBeenCalledWith('light');

        const darkBtn = screen.getByText('Σκοτεινό').closest('button');
        fireEvent.click(darkBtn);

        expect(updateThemePreference).toHaveBeenCalledWith('dark');
    });

    it('calls onClose when Done button or X button is clicked', () => {
        const onClose = vi.fn();
        render(<ThemeSelectionModal isOpen={true} onClose={onClose} />);

        const doneBtn = screen.getByRole('button', { name: /τέλος/i });
        fireEvent.click(doneBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        const closeBtn = screen.getByRole('button', { name: /κλείσιμο/i });
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('closes on Escape key press', () => {
        const onClose = vi.fn();
        render(<ThemeSelectionModal isOpen={true} onClose={onClose} />);

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

