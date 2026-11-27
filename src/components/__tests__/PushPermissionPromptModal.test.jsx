import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PushPermissionPromptModal from '../PushPermissionPromptModal';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (key) => key,
        language: 'el',
    }),
}));

describe('PushPermissionPromptModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.style.overflow = '';
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <PushPermissionPromptModal isOpen={false} onAccept={vi.fn()} onDecline={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
        expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    });

    it('portals to document.body with z-[99999], dialog semantics, and scroll lock', () => {
        const { unmount } = render(
            <PushPermissionPromptModal isOpen={true} onAccept={vi.fn()} onDecline={vi.fn()} />
        );

        const dialog = document.body.querySelector('[role="dialog"]');
        expect(dialog).not.toBeNull();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog.className).toContain('z-[99999]');
        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByText('push_prompt_title')).toBeInTheDocument();

        unmount();
        expect(document.body.style.overflow).toBe('');
    });

    it('calls onAccept, onDecline, and closes on Escape key', () => {
        const onAccept = vi.fn();
        const onDecline = vi.fn();

        render(
            <PushPermissionPromptModal isOpen={true} onAccept={onAccept} onDecline={onDecline} />
        );

        fireEvent.click(screen.getByText('push_prompt_accept'));
        expect(onAccept).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText('push_prompt_decline'));
        expect(onDecline).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onDecline).toHaveBeenCalledTimes(2);
    });
});
