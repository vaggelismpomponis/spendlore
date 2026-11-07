import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TourBubble from '../TourBubble';
import { History, Wallet } from 'lucide-react';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (k) => {
            const map = {
                tour_step1_title: 'Καλωσόρισες στο Spendlore',
                tour_step1_desc: 'Σε 60 δευτερόλεπτα θα ξέρεις όλα όσα χρειάζεσαι.',
                tour_step4_title: 'Ιστορικό Συναλλαγών',
                tour_step4_desc: 'Φίλτραρε και αναζήτησε κάθε συναλλαγή.',
                onboarding_next: 'Επόμενο',
                onboarding_back: 'Πίσω',
                onboarding_skip: 'Παράλειψη',
                onboarding_finish: 'Ολοκλήρωση',
                close: 'Κλείσιμο'
            };
            return map[k] || k;
        },
        language: 'el'
    })
}));

describe('TourBubble Executive Anti-Slop Component', () => {
    const defaultStep = {
        title: 'Fallback Title',
        content: 'Fallback Content',
        data: {
            titleKey: 'tour_step4_title',
            descKey: 'tour_step4_desc',
            Icon: History,
        }
    };

    it('renders clean executive card with zero AI visual slop', () => {
        const { container } = render(
            <TourBubble
                index={3}
                size={5}
                step={defaultStep}
                backProps={{ onClick: vi.fn() }}
                closeProps={{ onClick: vi.fn() }}
                primaryProps={{ onClick: vi.fn() }}
                tooltipProps={{ 'data-testid': 'tour-bubble' }}
                isLastStep={false}
            />
        );

        // Validates flat high-contrast executive surface
        const bubble = screen.getByTestId('tour-bubble');
        expect(bubble.className).toContain('bg-white');
        expect(bubble.className).toContain('dark:bg-surface-dark2');
        expect(bubble.className).toContain('rounded-2xl');
        expect(bubble.className).toContain('border');

        // Zero AI Visual Slop: no loud gradients, no floating blobs, no pill buttons
        expect(bubble.className).not.toContain('bg-gradient-to');
        expect(bubble.className).not.toContain('from-violet');
        expect(bubble.className).not.toContain('from-amber');
        expect(container.querySelector('.blur-2xl')).toBeNull();
        expect(container.querySelector('.rounded-full.w-40')).toBeNull();

        // Validates toneless uppercase step counter
        expect(screen.getByText('ΒΗΜΑ 4 ΑΠΟ 5')).toBeInTheDocument();

        // Validates content
        expect(screen.getByText('Ιστορικό Συναλλαγών')).toBeInTheDocument();
        expect(screen.getByText('Φίλτραρε και αναζήτησε κάθε συναλλαγή.')).toBeInTheDocument();
    });

    it('renders Skip button on first step and triggers closeProps', () => {
        const handleClose = vi.fn();
        const firstStep = {
            data: {
                titleKey: 'tour_step1_title',
                descKey: 'tour_step1_desc',
                Icon: Wallet,
            }
        };

        render(
            <TourBubble
                index={0}
                size={5}
                step={firstStep}
                backProps={{ onClick: vi.fn() }}
                closeProps={{ onClick: handleClose }}
                primaryProps={{ onClick: vi.fn() }}
                tooltipProps={{ 'data-testid': 'tour-bubble' }}
                isLastStep={false}
            />
        );

        expect(screen.getByText('ΒΗΜΑ 1 ΑΠΟ 5')).toBeInTheDocument();
        const skipBtn = screen.getByText('Παράλειψη');
        expect(skipBtn).toBeInTheDocument();

        fireEvent.click(skipBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders Back button on intermediate step and Next action', () => {
        const handleBack = vi.fn();
        const handleNext = vi.fn();

        render(
            <TourBubble
                index={2}
                size={5}
                step={defaultStep}
                backProps={{ onClick: handleBack }}
                closeProps={{ onClick: vi.fn() }}
                primaryProps={{ onClick: handleNext }}
                tooltipProps={{ 'data-testid': 'tour-bubble' }}
                isLastStep={false}
            />
        );

        const backBtn = screen.getByText('Πίσω');
        expect(backBtn).toBeInTheDocument();
        fireEvent.click(backBtn);
        expect(handleBack).toHaveBeenCalledTimes(1);

        const nextBtn = screen.getByText('Επόμενο');
        expect(nextBtn).toBeInTheDocument();
        fireEvent.click(nextBtn);
        expect(handleNext).toHaveBeenCalledTimes(1);
    });

    it('renders Finish button on last step without slop emoji', () => {
        render(
            <TourBubble
                index={4}
                size={5}
                step={defaultStep}
                backProps={{ onClick: vi.fn() }}
                closeProps={{ onClick: vi.fn() }}
                primaryProps={{ onClick: vi.fn() }}
                tooltipProps={{ 'data-testid': 'tour-bubble' }}
                isLastStep={true}
            />
        );

        expect(screen.getByText('ΒΗΜΑ 5 ΑΠΟ 5')).toBeInTheDocument();
        expect(screen.getByText('Ολοκλήρωση')).toBeInTheDocument();
        expect(screen.queryByText('Επόμενο')).toBeNull();
    });
});

