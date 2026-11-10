/**
 * Detects whether an error represents a user cancelling or backing out of an authentication flow
 * (e.g., closing the Google account picker sheet, pressing the back button, closing popup).
 *
 * User cancellation is an expected user intent, not a technical defect, and should never be
 * logged as an application error, tracked in Sentry, or shown as a scary red error toast.
 *
 * @param {any} error
 * @returns {boolean}
 */
export const isUserCancellationError = (error) => {
    if (!error) return false;

    // Check string error
    if (typeof error === 'string') {
        return isCancellationText(error.toLowerCase());
    }

    // Check error message, details, description, or reason
    const msg = String(
        error?.message ||
        error?.details ||
        error?.error_description ||
        error?.reason ||
        error?.error ||
        ''
    ).toLowerCase();

    if (isCancellationText(msg)) {
        return true;
    }

    // Check error code / status (e.g. Android 12501 GoogleSignInStatusCodes.SIGN_IN_CANCELLED)
    const code = String(error?.code ?? error?.status ?? error?.statusCode ?? '').toLowerCase();
    if (
        code === '12501' ||
        code === 'sign_in_cancelled' ||
        code === 'sign_in_canceled' ||
        code === 'cancelled' ||
        code === 'canceled' ||
        code === 'abort' ||
        code === 'popup_closed_by_user' ||
        code === 'access_denied'
    ) {
        return true;
    }

    // Check nested original/cause error
    if (error?.cause && isUserCancellationError(error.cause)) {
        return true;
    }

    return false;
};

function isCancellationText(text) {
    if (!text) return false;
    return (
        text.includes('cancelled by user') ||
        text.includes('canceled by user') ||
        text.includes('sign-in cancelled') ||
        text.includes('sign in cancelled') ||
        text.includes('sign-in canceled') ||
        text.includes('sign in canceled') ||
        text.includes('user cancelled') ||
        text.includes('user canceled') ||
        text.includes('popup_closed_by_user') ||
        text.includes('closed the popup') ||
        text.includes('popup closed') ||
        text.includes('user closed') ||
        text.includes('user denied') ||
        text.includes('access_denied') ||
        text.includes('user_cancel') ||
        text.includes('12501')
    );
}

export default isUserCancellationError;

