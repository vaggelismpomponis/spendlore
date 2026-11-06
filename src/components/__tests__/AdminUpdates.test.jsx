import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminUpdates from '../admin/AdminUpdates';

describe('AdminUpdates Component', () => {
    const mockUpdates = [
        {
            id: 'upd-1',
            version: '1.2.0',
            release_date: '2026-11-01T12:00:00Z',
            title_el: 'Νέα έκδοση 1.2.0',
            title_en: 'New release 1.2.0',
            features: [
                { icon: 'star', title_el: 'Νέες ειδοποιήσεις', title_en: 'New notifications' }
            ]
        }
    ];

    const mockNewUpdate = {
        version: '1.2.1',
        title_el: 'Διορθώσεις',
        title_en: 'Bug fixes',
        features: []
    };

    const translate = (key) => {
        const dict = {
            admin_publish_update_title: 'Δημοσίευση Νέας Ενημέρωσης',
            admin_publish_update_subtitle: 'Προσθέστε λεπτομέρειες έκδοσης και χαρακτηριστικά',
            admin_version_label: 'Έκδοση',
            admin_title_el_label: 'Ελληνικός Τίτλος',
            admin_title_en_label: 'Αγγλικός Τίτλος',
            admin_features_bullet: 'Χαρακτηριστικά Έκδοσης',
            admin_add_feature_btn: 'Προσθήκη',
            admin_publish_btn: 'Δημοσίευση',
            cancel: 'Ακύρωση',
            close: 'Κλείσιμο'
        };
        return dict[key] || key;
    };

    it('renders updates list and release metrics cleanly', () => {
        render(
            <AdminUpdates
                updates={mockUpdates}
                showUpdateModal={false}
                setShowUpdateModal={vi.fn()}
                newUpdate={mockNewUpdate}
                setNewUpdate={vi.fn()}
                addFeature={vi.fn()}
                removeFeature={vi.fn()}
                updateFeature={vi.fn()}
                onPublish={vi.fn()}
                onDelete={vi.fn()}
                translate={translate}
            />
        );

        expect(screen.getByText('Application Release Updates')).toBeInTheDocument();
        expect(screen.getAllByText(/v1\.2\.0/).length).toBeGreaterThan(0);
        expect(screen.getByText('Νέα έκδοση 1.2.0')).toBeInTheDocument();
    });

    it('renders modal with portaled executive layout and handles actions', () => {
        const setShowUpdateModal = vi.fn();
        const onPublish = vi.fn();

        render(
            <AdminUpdates
                updates={mockUpdates}
                showUpdateModal={true}
                setShowUpdateModal={setShowUpdateModal}
                newUpdate={mockNewUpdate}
                setNewUpdate={vi.fn()}
                addFeature={vi.fn()}
                removeFeature={vi.fn()}
                updateFeature={vi.fn()}
                onPublish={onPublish}
                onDelete={vi.fn()}
                translate={translate}
            />
        );

        // Header
        expect(screen.getByText('Δημοσίευση Νέας Ενημέρωσης')).toBeInTheDocument();
        expect(screen.getByText('Προσθέστε λεπτομέρειες έκδοσης και χαρακτηριστικά')).toBeInTheDocument();

        // Labels
        expect(screen.getByText('Έκδοση')).toBeInTheDocument();
        expect(screen.getByText('Ελληνικός Τίτλος')).toBeInTheDocument();
        expect(screen.getByText('Αγγλικός Τίτλος')).toBeInTheDocument();

        // Buttons
        const cancelBtn = screen.getByRole('button', { name: 'Ακύρωση' });
        const publishBtn = screen.getByRole('button', { name: /Δημοσίευση/i });
        const closeBtn = screen.getByRole('button', { name: 'Κλείσιμο' });

        expect(cancelBtn).toBeInTheDocument();
        expect(publishBtn).toBeInTheDocument();
        expect(closeBtn).toBeInTheDocument();

        // Fire cancel
        fireEvent.click(cancelBtn);
        expect(setShowUpdateModal).toHaveBeenCalledWith(false);

        // Fire publish
        fireEvent.click(publishBtn);
        expect(onPublish).toHaveBeenCalled();
    });
});
