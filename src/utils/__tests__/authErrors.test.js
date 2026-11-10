import { describe, it, expect } from 'vitest';
import { isUserCancellationError } from '../authErrors';

describe('isUserCancellationError', () => {
    it('returns true for common Google Sign-In cancellation error messages', () => {
        expect(isUserCancellationError('Google Sign-In cancelled by user')).toBe(true);
        expect(isUserCancellationError('Google auth failed: Google Sign-In cancelled by user')).toBe(true);
        expect(isUserCancellationError('Google Sign-In canceled by user')).toBe(true);
        expect(isUserCancellationError('Sign-in cancelled')).toBe(true);
        expect(isUserCancellationError('Sign in canceled')).toBe(true);
        expect(isUserCancellationError('User cancelled')).toBe(true);
        expect(isUserCancellationError('popup_closed_by_user')).toBe(true);
        expect(isUserCancellationError('User closed the popup')).toBe(true);
    });

    it('returns true for Error instances representing user cancellations', () => {
        expect(isUserCancellationError(new Error('Google Sign-In cancelled by user'))).toBe(true);
        expect(isUserCancellationError(new Error('Google auth failed: Google Sign-In cancelled by user'))).toBe(true);
        expect(isUserCancellationError(new Error('popup_closed_by_user'))).toBe(true);
    });

    it('returns true for error objects containing cancellation codes or fields', () => {
        expect(isUserCancellationError({ code: 12501 })).toBe(true);
        expect(isUserCancellationError({ code: '12501' })).toBe(true);
        expect(isUserCancellationError({ code: 'SIGN_IN_CANCELLED' })).toBe(true);
        expect(isUserCancellationError({ code: 'popup_closed_by_user' })).toBe(true);
        expect(isUserCancellationError({ error: 'access_denied' })).toBe(true);
        expect(isUserCancellationError({ reason: 'user_cancel' })).toBe(true);
        expect(isUserCancellationError({ details: 'User closed the popup window' })).toBe(true);
    });

    it('returns false for actual system, network, or credential errors', () => {
        expect(isUserCancellationError(null)).toBe(false);
        expect(isUserCancellationError(undefined)).toBe(false);
        expect(isUserCancellationError('')).toBe(false);
        expect(isUserCancellationError(new Error('Network request failed'))).toBe(false);
        expect(isUserCancellationError(new Error('Invalid email or password'))).toBe(false);
        expect(isUserCancellationError(new Error('Failed to fetch'))).toBe(false);
        expect(isUserCancellationError({ code: 'invalid_grant', message: 'Token expired' })).toBe(false);
        expect(isUserCancellationError({ code: 500, message: 'Internal Server Error' })).toBe(false);
    });
});

