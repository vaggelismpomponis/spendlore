import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * DesktopBreadcrumb - Unified breadcrumb navigation matching the Sure design system:
 * e.g. "Αρχική > Κατηγορίες" / "Home > Categories"
 * Displays cleanly across settings pages.
 */
const DesktopBreadcrumb = ({
    onBack,
    parentLabel,
    currentLabel,
    title,
    backLabel,
    rightAction,
    hideHeader,
    hideBack = false,
    className = '',
}) => {
    const { language, t: translate } = useSettings?.() || {};
    const isEL = language === 'el';

    // If hideHeader is explicitly passed as false, mobile header is active
    if (hideHeader === false) return null;

    const effectiveBack = hideBack ? null : onBack;
    const pageText = currentLabel || title;

    if (!effectiveBack && !pageText) return null;

    const homeText = parentLabel
        || (backLabel && backLabel !== 'Back to Settings' && backLabel !== 'Επιστροφή στις Ρυθμίσεις' ? backLabel : null)
        || translate?.('categories_breadcrumb_home')
        || translate?.('breadcrumb_home')
        || translate?.('home_breadcrumb')
        || (isEL ? 'Αρχική' : 'Home');

    return (
        <div className={`flex items-center justify-between gap-3 select-none ${className}`}>
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                {effectiveBack && (
                    <>
                        <button
                            type="button"
                            onClick={effectiveBack}
                            className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <span>{homeText}</span>
                        </button>
                        {pageText && (
                            <ChevronRight size={12} className="text-gray-400 dark:text-gray-600 shrink-0" />
                        )}
                    </>
                )}
                {pageText && (
                    <span className="text-gray-900 dark:text-white font-bold truncate">
                        {pageText}
                    </span>
                )}
            </nav>

            {rightAction && (
                <div className="shrink-0 flex items-center gap-2">
                    {rightAction}
                </div>
            )}
        </div>
    );
};

export default DesktopBreadcrumb;
