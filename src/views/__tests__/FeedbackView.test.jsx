import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedbackView from '../FeedbackView';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../supabase';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

vi.mock('../../contexts/ToastContext', () => ({
    useToast: vi.fn(),
}));

vi.mock('../../supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn().mockResolvedValue({ error: null })
        }))
    }
}));

describe('FeedbackView', () => {
    const mockShowToast = vi.fn();
    const mockT = vi.fn((key) => key);

    beforeEach(() => {
        vi.clearAllMocks();
        useSettings.mockReturnValue({
            language: 'el',
            t: mockT,
        });
        useToast.mockReturnValue({
            showToast: mockShowToast,
        });
    });

    it('renders FeedbackView with header, breadcrumb and contact channels without reference errors', () => {
        render(
            <FeedbackView user={{ id: 'u1', email: 'test@example.com' }} onBack={vi.fn()} />
        );

        expect(screen.getByText('technical_support')).toBeInTheDocument();
        expect(screen.getByText('info@spendlore.gr')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Πώς μπορούμε να σας βοηθήσουμε/i)).toBeInTheDocument();
        expect(screen.getByText('Υποβολή Αιτήματος Υποστήριξης')).toBeInTheDocument();
    });

    it('allows submitting a support message with a tag', async () => {
        const mockUser = { id: 'u1', email: 'test@example.com' };
        render(
            <FeedbackView user={mockUser} onBack={vi.fn()} />
        );

        // Select a quick tag
        const tagAccount = screen.getByText('Account & Login');
        fireEvent.click(tagAccount);

        const textarea = screen.getByPlaceholderText(/Πώς μπορούμε να σας βοηθήσουμε/i);
        fireEvent.change(textarea, { target: { value: 'Something is not working properly.' } });

        const submitBtn = screen.getByText('Υποβολή Αιτήματος Υποστήριξης');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('feedback');
        });
    });
});
