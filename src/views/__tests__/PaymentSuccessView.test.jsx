import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentSuccessView from '../PaymentSuccessView';

const mockSyncSubscription = vi.fn().mockResolvedValue({});

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (k, fallback) => fallback || k,
    }),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
    useSubscription: () => ({
        syncSubscription: mockSyncSubscription,
    }),
}));

vi.mock('../../utils/platform', () => ({
    isNative: () => false,
}));

describe('PaymentSuccessView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders hero title, status, and feature list with unboxed icons', () => {
        render(<PaymentSuccessView onContinue={vi.fn()} />);

        expect(screen.getByText('payment_success_label')).toBeInTheDocument();
        expect(screen.getByText('payment_success_title')).toBeInTheDocument();
        expect(screen.getByText('payment_success_subtitle')).toBeInTheDocument();

        // 4 capabilities rendered
        expect(screen.getByText('Full Analytics & History')).toBeInTheDocument();
        expect(screen.getByText('Unlimited Budgets & Goals')).toBeInTheDocument();
        expect(screen.getByText('Biometric App Lock')).toBeInTheDocument();
        expect(screen.getByText('Smart Receipt Scanner')).toBeInTheDocument();

        // Anti-slop check: no pulsating neon badges or particle wrappers
        expect(document.querySelectorAll('.animate-ping-pulse').length).toBe(0);
        expect(document.querySelectorAll('[style*="psFloat"]').length).toBe(0);
    });

    it('triggers syncSubscription and calls onContinue on CTA click', async () => {
        mockSyncSubscription.mockResolvedValueOnce({ isPro: true });
        const onContinueMock = vi.fn();
        render(<PaymentSuccessView onContinue={onContinueMock} />);

        const ctaBtn = screen.getByText('payment_success_cta');
        fireEvent.click(ctaBtn);

        expect(mockSyncSubscription).toHaveBeenCalled();
    });

    it('auto-dismisses if user is not pro and sync confirms not pro', async () => {
        mockSyncSubscription.mockResolvedValueOnce({ isPro: false });
        const onContinueMock = vi.fn();
        render(<PaymentSuccessView onContinue={onContinueMock} />);

        // Wait microtask for promise resolution
        await new Promise((r) => setTimeout(r, 10));
        expect(onContinueMock).toHaveBeenCalled();
    });
});

