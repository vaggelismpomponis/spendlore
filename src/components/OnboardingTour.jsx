import React, { useCallback, useMemo } from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import TourBubble from './TourBubble';
import { Wallet, History, Plus, Home, ShieldCheck } from 'lucide-react';

// Inject spotlight styles via CSS to avoid react-joyride spreading them onto SVG elements
const SPOTLIGHT_STYLE = `
  .react-joyride__spotlight {
    border-radius: 1rem !important;
    box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.35), 0 0 0 5px rgba(15, 23, 42, 0.08) !important;
  }
  .dark .react-joyride__spotlight {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6), 0 0 0 5px rgba(255, 255, 255, 0.15) !important;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('joyride-spotlight-fix')) {
    const style = document.createElement('style');
    style.id = 'joyride-spotlight-fix';
    style.textContent = SPOTLIGHT_STYLE;
    document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────────
// Tour Step Definitions
// Targets must match real DOM IDs in the rendered app.
// For desktop, navbar items are in DesktopSidebar and the Add button is in DesktopTopBar.
// ─────────────────────────────────────────────────────────────────
export const getTourSteps = (isDesktop = false) => [
    {
        target: 'body',
        placement: 'center',
        disableBeacon: true,
        hideCloseButton: false,
        data: {
            titleKey: 'tour_step1_title',
            descKey:  'tour_step1_desc',
            Icon:     Wallet,
        },
    },
    {
        target: '#tour-add-button',
        placement: isDesktop ? 'bottom-end' : 'top',
        disableBeacon: true,
        spotlightPadding: 8,
        data: {
            titleKey: 'tour_step2_title',
            descKey:  'tour_step2_desc',
            Icon:     Plus,
        },
    },
    {
        target: '#nav-home',
        placement: isDesktop ? 'right' : 'top',
        disableBeacon: true,
        spotlightPadding: 6,
        data: {
            titleKey: 'tour_step3_title',
            descKey:  'tour_step3_desc',
            Icon:     Home,
        },
    },
    {
        target: '#nav-history',
        placement: isDesktop ? 'right' : 'top',
        disableBeacon: true,
        spotlightPadding: 6,
        data: {
            titleKey: 'tour_step4_title',
            descKey:  'tour_step4_desc',
            Icon:     History,
        },
    },
    {
        target: '#nav-profile',
        placement: isDesktop ? 'right' : 'top',
        disableBeacon: true,
        spotlightPadding: 6,
        data: {
            titleKey: 'tour_step5_title',
            descKey:  'tour_step5_desc',
            Icon:     ShieldCheck,
        },
    },
];

export const TOUR_STEPS = getTourSteps(false);

// ─────────────────────────────────────────────────────────────────
// OnboardingTour
// Props:
//   run       {boolean}  — whether tour is running
//   onFinish  {function} — called when tour ends (finished OR skipped)
//   isDesktop {boolean}  — adapts placements for desktop sidebar / header
// ─────────────────────────────────────────────────────────────────
const OnboardingTour = ({ run, onFinish, isDesktop = false }) => {
    const steps = useMemo(() => getTourSteps(isDesktop), [isDesktop]);

    const handleCallback = useCallback((data) => {
        const { action, status, type } = data;

        if (type === EVENTS.TARGET_NOT_FOUND) {
            console.warn('[OnboardingTour] Target element not found:', data.step?.target);
        }

        const isDone =
            status === STATUS.FINISHED ||
            status === STATUS.SKIPPED ||
            (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE);

        if (isDone) {
            onFinish?.();
        }
    }, [onFinish]);

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress={false}
            showSkipButton
            disableScrolling={isDesktop}
            disableOverlayClose={false}
            spotlightClicks={false}
            callback={handleCallback}
            tooltipComponent={TourBubble}
            styles={{
                options: {
                    arrowColor: 'transparent',
                    zIndex: 10000,
                    overlayColor: 'rgba(0, 0, 0, 0.65)',
                },
                overlay: {
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                },
            }}
            locale={{
                back: 'Πίσω',
                close: 'Κλείσιμο',
                last: 'Ολοκλήρωση',
                next: 'Επόμενο',
                open: 'Open',
                skip: 'Παράλειψη',
            }}
        />
    );
};

export default OnboardingTour;
