import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WhatsNewModal from '../WhatsNewModal';
import { getLatestReleaseNote, getReleaseNoteByVersion, getAllReleaseNotes } from '../../data/releaseNotes';
import { APP_VERSION } from '../../utils/version';

// Mock SettingsContext
vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        language: 'el',
        theme: 'light',
    }),
}));

describe('WhatsNewModal Component', () => {
    it('returns null when isOpen is false', () => {
        const { container } = render(<WhatsNewModal isOpen={false} onClose={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders Sure-style slide-over drawer with header, headline, summary, feature sections, and Got it button', () => {
        const onClose = vi.fn();
        render(<WhatsNewModal isOpen={true} onClose={onClose} />);

        // Top bar
        const titleSpan = screen.getByText('Τι νέο υπάρχει');
        expect(titleSpan).toBeInTheDocument();
        const topBar = titleSpan.closest('div');
        expect(topBar.style.paddingTop).toContain('env(safe-area-inset-top');
        expect(screen.getByLabelText('Κλείσιμο')).toBeInTheDocument();

        // Release headline and summary from latest release notes (v1.1.58)
        const latest = getLatestReleaseNote();
        expect(screen.getByText(latest.title_el)).toBeInTheDocument();
        expect(screen.getByText(latest.summary_el)).toBeInTheDocument();

        // Feature section titles and captions
        expect(screen.getByText(latest.sections[0].title_el)).toBeInTheDocument();
        expect(screen.getByText(latest.sections[0].caption_el)).toBeInTheDocument();

        // Bottom action button
        const gotItBtn = screen.getByRole('button', { name: 'Κατάλαβα' });
        expect(gotItBtn).toBeInTheDocument();

        // Clicking Got it invokes onClose
        fireEvent.click(gotItBtn);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('invokes onClose when clicking close button or pressing Escape key', () => {
        const onClose = vi.fn();
        render(<WhatsNewModal isOpen={true} onClose={onClose} />);

        // Close button
        const closeBtn = screen.getByLabelText('Κλείσιμο');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        // Escape key
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('renders custom release notes when passed explicitly via data prop', () => {
        const customData = {
            version: '2.0.0',
            title_el: 'Spendlore v2.0.0 - Επαναστατική Εμπειρία',
            title_en: 'Spendlore v2.0.0 - Revolutionary Experience',
            summary_el: 'Μια νέα εποχή στον έλεγχο των οικονομικών σας.',
            summary_en: 'A new era in personal finance control.',
            sections: [
                {
                    title_el: 'Αυτόματη Τεχνητή Νοημοσύνη',
                    title_en: 'Automated AI Insights',
                    desc_el: 'Προηγμένες προτάσεις εξοικονόμησης χρημάτων.',
                    desc_en: 'Advanced money-saving recommendations.',
                    previewType: 'telemetry',
                    caption_el: 'Εξατομικευμένη ανάλυση εξόδων.',
                    caption_en: 'Personalized expense analysis.'
                }
            ]
        };

        render(<WhatsNewModal isOpen={true} onClose={vi.fn()} data={customData} />);

        expect(screen.getByText('Spendlore v2.0.0 - Επαναστατική Εμπειρία')).toBeInTheDocument();
        expect(screen.getByText('Μια νέα εποχή στον έλεγχο των οικονομικών σας.')).toBeInTheDocument();
        expect(screen.getByText('Αυτόματη Τεχνητή Νοημοσύνη')).toBeInTheDocument();
        expect(screen.getByText('Εξατομικευμένη ανάλυση εξόδων.')).toBeInTheDocument();
    });
});

describe('releaseNotes Data Registry', () => {
    it('provides latest release note and lookup by version', () => {
        const latest = getLatestReleaseNote();
        expect(latest).toBeDefined();
        expect(latest.version).toBe(APP_VERSION);
        expect(latest.sections.length).toBeGreaterThan(0);

        const vLatest = getReleaseNoteByVersion(APP_VERSION);
        expect(vLatest).toEqual(latest);

        const v57 = getReleaseNoteByVersion('1.1.57');
        expect(v57).toBeDefined();
        expect(v57.version).toBe('1.1.57');

        const all = getAllReleaseNotes();
        expect(all.length).toBeGreaterThanOrEqual(3);
    });
});
