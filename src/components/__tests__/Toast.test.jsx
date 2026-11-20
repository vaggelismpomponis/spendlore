import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from '../Toast';
import { ToastProvider, useToast } from '../../contexts/ToastContext';

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders message and circular animation button', () => {
        const mockOnClose = vi.fn();
        render(<Toast message="Recurring transactions settings updated" onClose={mockOnClose} />);

        expect(screen.getByText('Recurring transactions settings updated')).toBeInTheDocument();
        const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
        expect(dismissBtn).toBeInTheDocument();
        expect(dismissBtn.querySelector('svg')).toBeInTheDocument();
    });

    it('renders success badge by default', () => {
        const mockOnClose = vi.fn();
        const { container } = render(<Toast message="All changes saved" onClose={mockOnClose} />);

        const badge = container.querySelector('.bg-emerald-600');
        expect(badge).toBeInTheDocument();
    });

    it('renders error badge when type is error', () => {
        const mockOnClose = vi.fn();
        const { container } = render(<Toast message="Something went wrong" type="error" onClose={mockOnClose} />);

        const badge = container.querySelector('.bg-rose-600');
        expect(badge).toBeInTheDocument();
    });

    it('renders warning badge when type is warning', () => {
        const mockOnClose = vi.fn();
        const { container } = render(<Toast message="Warning: low balance" type="warning" onClose={mockOnClose} />);

        const badge = container.querySelector('.bg-amber-500');
        expect(badge).toBeInTheDocument();
    });

    it('renders info badge when type is info', () => {
        const mockOnClose = vi.fn();
        const { container } = render(<Toast message="Saved offline" type="info" onClose={mockOnClose} />);

        const badge = container.querySelector('.bg-blue-600');
        expect(badge).toBeInTheDocument();
    });

    it('auto-closes after the specified duration', () => {
        const mockOnClose = vi.fn();
        render(<Toast message="Temporary message" duration={2000} onClose={mockOnClose} />);

        expect(mockOnClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking the dismiss button', () => {
        const mockOnClose = vi.fn();
        render(<Toast message="Dismiss me" onClose={mockOnClose} />);

        const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
        fireEvent.click(dismissBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});

describe('ToastProvider & useToast', () => {
    const TestConsumer = () => {
        const { showToast } = useToast();
        return (
            <button onClick={() => showToast('Test triggered toast', 'success', 3000)}>
                Trigger Toast
            </button>
        );
    };

    it('displays toast when showToast is called', () => {
        render(
            <ToastProvider>
                <TestConsumer />
            </ToastProvider>
        );

        expect(screen.queryByText('Test triggered toast')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Trigger Toast'));

        expect(screen.getByText('Test triggered toast')).toBeInTheDocument();
    });
});
