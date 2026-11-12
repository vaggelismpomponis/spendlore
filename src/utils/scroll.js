/**
 * Scroll Reset Utilities
 * Ensures views, sub-views, and detail pages consistently open at the top (scrollTop = 0).
 */

export const scrollContainerToTop = (el) => {
    if (!el) return;
    el.scrollTop = 0;
    if (typeof el.scrollTo === 'function') {
        try {
            el.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } catch {
            el.scrollTo(0, 0);
        }
    }
};

export const resetGlobalScroll = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (typeof window.scrollTo === 'function') {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } catch {
            window.scrollTo(0, 0);
        }
    }

    if (document.documentElement) {
        document.documentElement.scrollTop = 0;
    }
    if (document.body) {
        document.body.scrollTop = 0;
    }

    const containers = document.querySelectorAll(
        'main.overflow-y-auto, [data-scroll-container="main"]'
    );
    containers.forEach((node) => scrollContainerToTop(node));
};

