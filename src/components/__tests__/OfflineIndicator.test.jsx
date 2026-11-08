import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import OfflineIndicator from '../OfflineIndicator';
import { useAppStore } from '../../store/useAppStore';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('OfflineIndicator', () => {
    beforeEach(() => {
        useAppStore.setState({
            isOnline: true,
            isSyncing: false,
            syncQueue: [],
        });
    });

    it('renders null when online, not syncing, and queue is empty', () => {
        const { container } = render(
            <SettingsProvider>
                <OfflineIndicator />
            </SettingsProvider>
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders offline indicator badge when isOnline is false', () => {
        useAppStore.setState({ isOnline: false, syncQueue: [{ id: '1' }] });

        render(
            <SettingsProvider>
                <OfflineIndicator />
            </SettingsProvider>
        );

        expect(screen.getByText('OFFLINE')).toBeInTheDocument();
        expect(screen.getByText(/1/)).toBeInTheDocument();
    });

    it('renders syncing indicator when isSyncing is true', () => {
        useAppStore.setState({ isOnline: true, isSyncing: true });

        render(
            <SettingsProvider>
                <OfflineIndicator />
            </SettingsProvider>
        );

        expect(screen.getByText(/Συγχρονισμός/i)).toBeInTheDocument();
    });
});
