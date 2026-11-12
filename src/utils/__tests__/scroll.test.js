import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollContainerToTop, resetGlobalScroll } from '../scroll';

describe('scroll utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('scrollContainerToTop resets scrollTop to 0 and calls scrollTo when available', () => {
        const mockEl = {
            scrollTop: 450,
            scrollTo: vi.fn(),
        };

        scrollContainerToTop(mockEl);

        expect(mockEl.scrollTop).toBe(0);
        expect(mockEl.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    });

    it('scrollContainerToTop handles null/undefined gracefully', () => {
        expect(() => scrollContainerToTop(null)).not.toThrow();
        expect(() => scrollContainerToTop(undefined)).not.toThrow();
    });

    it('resetGlobalScroll resets window, document, and registered main scroll containers', () => {
        const windowScrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => { });

        const mainEl = document.createElement('main');
        mainEl.className = 'flex-1 overflow-y-auto';
        mainEl.scrollTop = 320;
        mainEl.scrollTo = vi.fn();
        document.body.appendChild(mainEl);

        const mobileEl = document.createElement('div');
        mobileEl.setAttribute('data-scroll-container', 'main');
        mobileEl.scrollTop = 180;
        mobileEl.scrollTo = vi.fn();
        document.body.appendChild(mobileEl);

        // Sidebar should NOT be reset
        const sidebarEl = document.createElement('aside');
        sidebarEl.className = 'overflow-y-auto';
        sidebarEl.scrollTop = 200;
        document.body.appendChild(sidebarEl);

        resetGlobalScroll();

        expect(windowScrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
        expect(mainEl.scrollTop).toBe(0);
        expect(mobileEl.scrollTop).toBe(0);
        expect(sidebarEl.scrollTop).toBe(200);
    });
});

