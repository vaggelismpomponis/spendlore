import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BackgroundPermissionsModal from '../BackgroundPermissionsModal';
import * as notificationListener from '../../utils/notificationListener';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (k) => k,
        language: 'el'
    })
}));

vi.mock('../../utils/notificationListener', () => ({
    getBackgroundPermissionsStatus: vi.fn(),
    openNotificationSettings: vi.fn(),
    requestIgnoreBatteryOptimization: vi.fn(),
    openBatteryOptimizationSettings: vi.fn(),
    openAutostartSettings: vi.fn()
}));

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: () => false
    }
}));

describe('BackgroundPermissionsModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        notificationListener.getBackgroundPermissionsStatus.mockResolvedValue({
            notificationListener: false,
            batteryNoRestrictions: false,
            autostartSupported: true,
            manufacturer: 'xiaomi'
        });
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <BackgroundPermissionsModal isOpen={false} onClose={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders modal with steps when isOpen is true', async () => {
        render(
            <BackgroundPermissionsModal isOpen={true} onClose={vi.fn()} />
        );

        await waitFor(() => {
            expect(screen.getByText('bg_permissions_title')).toBeInTheDocument();
            expect(screen.getByText('bg_permissions_subtitle')).toBeInTheDocument();
            expect(screen.getByText(/1\. bg_permission_notifications/)).toBeInTheDocument();
            expect(screen.getByText(/2\. bg_permission_battery/)).toBeInTheDocument();
            expect(screen.getByText(/3\. bg_permission_autostart/)).toBeInTheDocument();
        });
    });

    it('calls onClose when Done button is clicked', async () => {
        const onClose = vi.fn();
        render(
            <BackgroundPermissionsModal isOpen={true} onClose={onClose} />
        );

        await waitFor(() => {
            expect(screen.getByText('bg_permissions_done')).toBeInTheDocument();
        });

        const doneBtn = screen.getByText('bg_permissions_done');
        fireEvent.click(doneBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('triggers requestIgnoreBatteryOptimization when battery button is clicked', async () => {
        render(
            <BackgroundPermissionsModal isOpen={true} onClose={vi.fn()} />
        );

        await waitFor(() => {
            expect(screen.getByText('bg_permission_remove_restrictions')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('bg_permission_remove_restrictions'));
        expect(notificationListener.requestIgnoreBatteryOptimization).toHaveBeenCalled();
    });

    it('triggers openAutostartSettings when autostart button is clicked', async () => {
        render(
            <BackgroundPermissionsModal isOpen={true} onClose={vi.fn()} />
        );

        await waitFor(() => {
            expect(screen.getByText('bg_permission_open_autostart')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('bg_permission_open_autostart'));
        expect(notificationListener.openAutostartSettings).toHaveBeenCalled();
    });
});
