import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountSettingsView from '../AccountSettingsView';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { supabase } from '../../supabase';

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
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  },
}));

describe('AccountSettingsView', () => {
  const mockUser = {
    id: 'user-123',
    email: 'vaggelisbobonhs@gmail.com',
    user_metadata: {
      first_name: 'EVANGELOS',
      last_name: 'Bomponis',
      full_name: 'EVANGELOS Bomponis',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  const mockOnBack = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useSettings.mockReturnValue({
      t: (key) => {
        const dict = {
          profile_info: 'Profile Info',
          personal_info: 'Personal',
          danger_zone: 'Danger Zone',
          reset_account_title: 'Reset account',
          reset_account_btn: 'Reset account',
          reset_and_preload_title: 'Reset and preload',
          reset_and_preload_btn: 'Reset and preload',
          delete_account_title: 'Delete account',
          delete_account_btn: 'Delete account',
          save: 'Save',
          name: 'Name',
          email: 'Email',
          cancel: 'Cancel',
          home_breadcrumb: 'Home',
        };
        return dict[key] || key;
      },
      language: 'en',
    });

    useToast.mockReturnValue({
      showToast: mockShowToast,
    });

    useSubscription.mockReturnValue({
      isPro: true,
    });
  });

  it('renders Personal and Danger Zone cards without photo upload or household sections', () => {
    render(<AccountSettingsView user={mockUser} onBack={mockOnBack} />);

    expect(screen.getAllByText('Profile Info').length).toBeGreaterThan(0);
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();

    // Verify Household and photo upload button are completely removed
    expect(screen.queryByText('Household')).not.toBeInTheDocument();
    expect(screen.queryByText(/upload photo/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add member/i })).not.toBeInTheDocument();

    // Check fields
    expect(screen.getByDisplayValue('vaggelisbobonhs@gmail.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EVANGELOS')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bomponis')).toBeInTheDocument();
  });

  it('renders linked account photo if user already has one, or initials fallback if not', () => {
    const { rerender } = render(<AccountSettingsView user={mockUser} onBack={mockOnBack} />);
    const avatarImg = screen.getByRole('img');
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');

    // Rerender with user having no avatar
    const userNoAvatar = {
      ...mockUser,
      user_metadata: { first_name: 'John', last_name: 'Doe' },
    };
    rerender(<AccountSettingsView user={userNoAvatar} onBack={mockOnBack} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles saving personal information', async () => {
    render(<AccountSettingsView user={mockUser} onBack={mockOnBack} />);

    const firstNameInput = screen.getByDisplayValue('EVANGELOS');
    fireEvent.change(firstNameInput, { target: { value: 'Vangelis' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({
          first_name: 'Vangelis',
          last_name: 'Bomponis',
          full_name: 'Vangelis Bomponis',
        }),
      });
    });

    expect(mockShowToast).toHaveBeenCalled();
  });

  it('renders all three Danger Zone action buttons', () => {
    render(<AccountSettingsView user={mockUser} onBack={mockOnBack} />);

    expect(screen.getByRole('button', { name: 'Reset account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset and preload' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();
  });
});
