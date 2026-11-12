import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileView from '../ProfileView';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { checkForAppUpdates, forceAppCachePurge } from '../../utils/pwaUpdate';
import { isNative } from '../../utils/platform';
import { openPlayStoreUpdates } from '../../utils/notificationListener';

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

vi.mock('../../utils/pwaUpdate', () => ({
  checkForAppUpdates: vi.fn().mockResolvedValue({ supported: true, updated: false }),
  forceAppCachePurge: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../utils/notificationListener', () => ({
  openPlayStoreUpdates: vi.fn().mockResolvedValue(true),
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

  it('renders dedicated Check for Updates and Clear Cache settings on web', async () => {
    render(
      <ProfileView
        user={mockUser}
        onGuide={mockOnGuide}
        onFeedback={mockOnFeedback}
      />
    );

    const checkUpdateRow = screen.getByText('Έλεγχος για ενημερώσεις');
    const purgeCacheRow = screen.getByText('Εκκαθάριση Cache & Επανεκκίνηση');

    expect(checkUpdateRow).toBeInTheDocument();
    expect(purgeCacheRow).toBeInTheDocument();

    fireEvent.click(checkUpdateRow);
    await waitFor(() => {
      expect(checkForAppUpdates).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument();
    });

    vi.useFakeTimers();
    fireEvent.click(purgeCacheRow);
    vi.advanceTimersByTime(500);
    expect(forceAppCachePurge).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('renders update check (Play Store) and clear cache on native Android app', async () => {
    isNative.mockReturnValue(true);

    render(
      <ProfileView
        user={mockUser}
        onGuide={mockOnGuide}
        onFeedback={mockOnFeedback}
      />
    );

    const checkUpdateRow = screen.getByText('Έλεγχος για ενημερώσεις');
    const purgeCacheRow = screen.getByText('Εκκαθάριση Cache & Επανεκκίνηση');

    expect(checkUpdateRow).toBeInTheDocument();
    expect(purgeCacheRow).toBeInTheDocument();
    expect(screen.queryByText('Εφαρμογή Android (Play Store)')).not.toBeInTheDocument();

    fireEvent.click(checkUpdateRow);
    await waitFor(() => {
      expect(openPlayStoreUpdates).toHaveBeenCalledTimes(1);
    });
    expect(checkForAppUpdates).not.toHaveBeenCalled();

    isNative.mockReturnValue(false);
  });
});
