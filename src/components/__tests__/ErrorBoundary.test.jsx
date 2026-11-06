import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock Sentry
vi.mock('@sentry/react', () => ({
    withScope: vi.fn((cb) => cb({ setTag: vi.fn(), setExtra: vi.fn() })),
    captureException: vi.fn(),
}));

// Mock sentryLogger
vi.mock('../../utils/sentryLogger', () => ({
    default: {
        recordError: vi.fn(),
    },
}));

// Mock SettingsContext
vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (k) => k,
    }),
}));

const ThrowingComponent = ({ shouldThrow = true }) => {
    if (shouldThrow) {
        throw new Error('Test exploding error');
    }
    return <div>Normal Content</div>;
};

describe('ErrorBoundary Component', () => {
    let originalConsoleError;

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = vi.fn(); // Suppress noisy React boundary logs in test output
        sessionStorage.clear();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        vi.clearAllMocks();
    });

    it('renders children normally when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Safe Child Component</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Safe Child Component')).toBeInTheDocument();
    });

    it('catches render error and displays executive anti-slop error UI', () => {
        // Prevent auto-retry in test by setting disableAutoRetry
        render(
            <ErrorBoundary disableAutoRetry={true}>
                <ThrowingComponent />
            </ErrorBoundary>
        );

        // Header and description rendered
        expect(screen.getByText('something_went_wrong')).toBeInTheDocument();
        expect(screen.getByText('system_interruption')).toBeInTheDocument();
        expect(screen.getByText('reload_app')).toBeInTheDocument();
        expect(screen.getByText('clear_cache_restart')).toBeInTheDocument();

        // Anti-slop check: Ensure no boxed icon slop class (w-16 h-16 bg-rose-500/10) exists
        const boxedSlopIcons = document.querySelectorAll('.w-16.h-16.bg-rose-500\\/10');
        expect(boxedSlopIcons.length).toBe(0);
    });

    it('toggles technical details and stack trace', () => {
        render(
            <ErrorBoundary disableAutoRetry={true}>
                <ThrowingComponent />
            </ErrorBoundary>
        );

        const detailsToggle = screen.getByText('error_details');
        expect(screen.queryByText(/Test exploding error/)).not.toBeInTheDocument();

        // Click to expand
        fireEvent.click(detailsToggle);
        expect(screen.getByText(/Test exploding error/)).toBeInTheDocument();
        expect(screen.getByText('copy_error')).toBeInTheDocument();
    });

    it('supports custom inline fallback', () => {
        render(
            <ErrorBoundary
                disableAutoRetry={true}
                fallback={(error) => <div>Custom Fallback: {error.message}</div>}
            >
                <ThrowingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Fallback: Test exploding error')).toBeInTheDocument();
    });

    it('supports compact inline boundary mode', () => {
        render(
            <ErrorBoundary disableAutoRetry={true} inline={true}>
                <ThrowingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('something_went_wrong')).toBeInTheDocument();
        expect(screen.getByText('system_interruption')).toBeInTheDocument();
        expect(screen.getByText('reload_app')).toBeInTheDocument();
    });
});

