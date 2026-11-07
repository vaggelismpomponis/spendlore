import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DesktopLayout from '../DesktopLayout';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
}));

vi.mock('../DesktopSidebar', () => ({
  default: () => <div data-testid="desktop-sidebar" />,
}));

vi.mock('../DesktopRightPanel', () => ({
  default: () => <div data-testid="desktop-right-panel" />,
}));

describe('DesktopLayout', () => {
  const defaultProps = {
    activeTab: 'home',
    setActiveTab: vi.fn(),
    setPreviousTab: vi.fn(),
    user: { id: 'test-user', email: 'test@example.com' },
    displayName: 'Test User',
    photoURL: null,
    balance: 1000,
    totalIncome: 2000,
    totalExpense: 1000,
    transactions: [],
    budgets: [],
    onSignOut: vi.fn(),
    onAdd: vi.fn(),
    unreadCount: 3,
  };

  const mockOpenUpgradeModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue({
      t: (key) => key,
    });
    useSubscription.mockReturnValue({
      isPro: false,
      openUpgradeModal: mockOpenUpgradeModal,
    });
  });

  it('triggers onToggleNotifications when the bell button is clicked', () => {
    const mockToggle = vi.fn();
    render(
      <DesktopLayout {...defaultProps} onToggleNotifications={mockToggle}>
        <div>Content</div>
      </DesktopLayout>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('triggers setShowNotificationPanel when onToggleNotifications is not provided', () => {
    const mockSetShow = vi.fn();
    render(
      <DesktopLayout {...defaultProps} setShowNotificationPanel={mockSetShow}>
        <div>Content</div>
      </DesktopLayout>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(mockSetShow).toHaveBeenCalledTimes(1);
    // Verify it passes an updater function that toggles state
    const updater = mockSetShow.mock.calls[0][0];
    expect(typeof updater).toBe('function');
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  it('renders unread count badge when unreadCount > 0', () => {
    render(
      <DesktopLayout {...defaultProps} unreadCount={5}>
        <div>Content</div>
      </DesktopLayout>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('triggers onAdd without event arguments when add button is clicked', () => {
    const mockOnAdd = vi.fn();
    render(
      <DesktopLayout {...defaultProps} onAdd={mockOnAdd}>
        <div>Content</div>
      </DesktopLayout>
    );

    const addBtn = screen.getByRole('button', { name: /add_transaction/i });
    fireEvent.click(addBtn);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith();
  });

  it('hides the right panel and renders title for categories tab', () => {
    const { container } = render(
      <DesktopLayout {...defaultProps} activeTab="categories">
        <div>Categories Content</div>
      </DesktopLayout>
    );

    expect(container.querySelector('#tour-quick-access')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'custom_categories' })).toBeInTheDocument();
  });

  it('renders Become Pro button on desktop when user is not pro and triggers upgrade flow on click', () => {
    const mockSetActiveTab = vi.fn();
    const mockSetPreviousTab = vi.fn();

    render(
      <DesktopLayout
        {...defaultProps}
        activeTab="profile"
        setActiveTab={mockSetActiveTab}
        setPreviousTab={mockSetPreviousTab}
      >
        <div>Settings Content</div>
      </DesktopLayout>
    );

    const becomeProBtn = screen.getByRole('button', { name: /become_pro/i });
    expect(becomeProBtn).toBeInTheDocument();

    // Verify neither Bell nor Add button is rendered on settings pages
    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add_transaction/i })).not.toBeInTheDocument();

    fireEvent.click(becomeProBtn);

    expect(mockOpenUpgradeModal).toHaveBeenCalledWith('desktop_header');
    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });

  it('renders Bell and Add button on non-settings tabs like home and hides become pro', () => {
    render(
      <DesktopLayout {...defaultProps} activeTab="home">
        <div>Home Content</div>
      </DesktopLayout>
    );

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add_transaction/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /become_pro/i })).not.toBeInTheDocument();
  });

  it('does not render Become Pro button on desktop when isPro is true', () => {
    useSubscription.mockReturnValue({
      isPro: true,
      openUpgradeModal: mockOpenUpgradeModal,
    });

    render(
      <DesktopLayout {...defaultProps} activeTab="profile">
        <div>Settings Content</div>
      </DesktopLayout>
    );

    expect(screen.queryByRole('button', { name: /become_pro/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add_transaction/i })).not.toBeInTheDocument();
  });

  it('does not render Become Pro button on desktop when activeTab is upgrade', () => {
    render(
      <DesktopLayout {...defaultProps} activeTab="upgrade">
        <div>Upgrade Content</div>
      </DesktopLayout>
    );

    expect(screen.queryByRole('button', { name: /become_pro/i })).not.toBeInTheDocument();
  });
});
