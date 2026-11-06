import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminOverview from '../admin/AdminOverview';

describe('AdminOverview Component', () => {
    const mockStats = {
        users: 10,
        transactions: 150,
        feedback: 5,
        activity: 42
    };

    const mockMetrics = {
        proUsers: 3,
        freeUsers: 7,
        canceledUsers: 0,
        active7Days: 6,
        active30Days: 9,
        mostActiveUsers: [
            {
                id: 'user-1',
                email: 'topuser@example.com',
                display_name: 'Top User',
                subscription_status: 'free',
                sessionCount: 25,
                created_at: '2026-01-01T00:00:00Z'
            },
            {
                id: 'user-2',
                email: 'prouser@example.com',
                display_name: 'Pro User',
                subscription_status: 'pro',
                sessionCount: 15,
                created_at: '2026-01-02T00:00:00Z'
            }
        ]
    };

    const mockProfiles = [
        { id: 'user-1', created_at: '2026-01-01T00:00:00Z' },
        { id: 'user-2', created_at: '2026-01-02T00:00:00Z' }
    ];

    const mockSessions = [
        { id: 's1', user_id: 'user-1', device: 'Windows Desktop' },
        { id: 's2', user_id: 'user-2', device: 'Android Mobile' }
    ];

    const translate = (key) => {
        const dict = {
            admin_view_on_stripe: 'View on Stripe',
            admin_send_email: 'Send Email',
            admin_copy_user_id: 'Copy User ID',
            admin_notes: 'Notes',
            admin_delete_user: 'Delete User',
            admin_grant_pro: 'Grant Pro',
            admin_revoke_pro: 'Revoke Pro'
        };
        return dict[key] || key;
    };

    it('renders overview stats and active accounts leaderboard', () => {
        render(
            <AdminOverview
                stats={mockStats}
                metrics={mockMetrics}
                profiles={mockProfiles}
                sessions={mockSessions}
                onNavigateUsers={vi.fn()}
                onUserClick={vi.fn()}
                onDropdownAction={vi.fn()}
                onSubClick={vi.fn()}
                translate={translate}
            />
        );

        expect(screen.getByText('Operations & Telemetry Overview')).toBeInTheDocument();
        expect(screen.getByText('Most Active Accounts')).toBeInTheDocument();
        expect(screen.getByText('Top User')).toBeInTheDocument();
        expect(screen.getByText('Pro User')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('opens dropdown menu on Most Active Accounts and triggers actions', () => {
        const onDropdownAction = vi.fn();
        const onSubClick = vi.fn();
        const onUserClick = vi.fn();

        render(
            <AdminOverview
                stats={mockStats}
                metrics={mockMetrics}
                profiles={mockProfiles}
                sessions={mockSessions}
                onNavigateUsers={vi.fn()}
                onUserClick={onUserClick}
                onDropdownAction={onDropdownAction}
                onSubClick={onSubClick}
                translate={translate}
            />
        );

        const actionButtons = screen.getAllByLabelText('User actions');
        expect(actionButtons.length).toBe(2);

        // Click first user action button (Top User)
        fireEvent.click(actionButtons[0]);

        // Dropdown actions should appear
        expect(screen.getByText('View on Stripe')).toBeInTheDocument();
        expect(screen.getByText('Send Email')).toBeInTheDocument();
        expect(screen.getByText('Copy User ID')).toBeInTheDocument();
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();

        // Clicking Delete User should invoke onDropdownAction with 'delete' and user object
        fireEvent.click(screen.getByText('Delete User'));
        expect(onDropdownAction).toHaveBeenCalledWith('delete', expect.objectContaining({ id: 'user-1' }));

        // Ensure row click was not triggered due to stopPropagation
        expect(onUserClick).not.toHaveBeenCalled();
    });

    it('triggers Grant/Revoke Pro from quick button without triggering row navigation', () => {
        const onSubClick = vi.fn();
        const onUserClick = vi.fn();

        render(
            <AdminOverview
                stats={mockStats}
                metrics={mockMetrics}
                profiles={mockProfiles}
                sessions={mockSessions}
                onNavigateUsers={vi.fn()}
                onUserClick={onUserClick}
                onDropdownAction={vi.fn()}
                onSubClick={onSubClick}
                translate={translate}
            />
        );

        // First user is 'free', button says 'Grant Pro'
        const grantBtn = screen.getByText('Grant Pro');
        fireEvent.click(grantBtn);

        expect(onSubClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'user-1' }),
            'pro'
        );
        expect(onUserClick).not.toHaveBeenCalled();

        // Second user is 'pro', button says 'Revoke Pro'
        const revokeBtn = screen.getByText('Revoke Pro');
        fireEvent.click(revokeBtn);

        expect(onSubClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'user-2' }),
            'free'
        );
        expect(onUserClick).not.toHaveBeenCalled();
    });
});

