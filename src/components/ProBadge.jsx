import React from 'react';

/**
 * ProBadge — unified corporate amber "PRO" badge.
 * Standardized across rankings, users lists, sidebar, profile, and locked features.
 * Features pure bold typography without icons, emojis, or pill shapes.
 */
const ProBadge = ({ className = '', onClick }) => (
    <span
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
        className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 shrink-0 select-none ${
            onClick ? 'cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 transition-all' : ''
        } ${className}`}
    >
        PRO
    </span>
);

export default ProBadge;
