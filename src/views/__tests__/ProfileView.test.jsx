import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileView from '../ProfileView';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
}));

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

vi.mock('../../utils/platform', () => ({
  isNative: vi.fn(() => false),
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=gr.spendlore.app',
}));

describe('ProfileView', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@spendlore.app',
    created_at: '2026-08-31T12:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Test User' },
  };

  const mockOnGuide = vi.fn();
  const mockOnFeedback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useSettings.mockReturnValue({
      t: (key) => {
        const dict = {
          help_and_support: 'Βοήθεια & Υποστήριξη',
          user_guide: 'Οδηγός Χρήσης',
          technical_support: 'Τεχνική Υποστήριξη',
          support: 'Τεχνική Υποστήριξη',
        };
        return dict[key];
      },
      language: 'el',
      theme: 'light',
      themePreference: 'system',
      customCategories: { expense: [], income: [] },
      updateLanguage: vi.fn(),
    });

    useToast.mockReturnValue({
      showToast: vi.fn(),
    });

    useSubscription.mockReturnValue({
      isPro: false,
      openUpgradeModal: vi.fn(),
      openBillingPortal: vi.fn(),
    });
  });

  it('renders Help & Support section with User Guide and Technical Support rows', () => {
    render(
      <ProfileView
        user={mockUser}
        onGuide={mockOnGuide}
        onFeedback={mockOnFeedback}
      />
    );

    // Section title
    expect(screen.getByText('Βοήθεια & Υποστήριξη')).toBeInTheDocument();

    // User Guide row
    const guideElement = screen.getByText('Οδηγός Χρήσης');
    expect(guideElement).toBeInTheDocument();

    // Support row
    const supportElement = screen.getByText('Τεχνική Υποστήριξη');
    expect(supportElement).toBeInTheDocument();

    // Click guide row
    fireEvent.click(guideElement);
    expect(mockOnGuide).toHaveBeenCalled();

    // Click support row
    fireEvent.click(supportElement);
    expect(mockOnFeedback).toHaveBeenCalled();
  });
});
