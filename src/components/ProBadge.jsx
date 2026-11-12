import React from 'react';

/**
 * ProBadge — unified corporate monochrome "PRO" badge.
 * Standardized across rankings, users lists, sidebar, profile, and locked features.
 * Features pure bold typography without icons, emojis, or pill shapes.
 */
const ProBadge = ({ className = '', onClick }) => (
    <span
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
        className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white shrink-0 select-none ${
            onClick ? 'cursor-pointer hover:bg-black dark:hover:bg-gray-100 active:scale-95 transition-all' : ''
        } ${className}`}
    >
        PRO
    </span>
);

export default ProBadge;
