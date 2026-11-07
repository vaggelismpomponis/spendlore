import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * ProBadge — inline amber-orange "PRO" chip.
 * Used next to locked features throughout the app.
 */
const ProBadge = ({ className = '', onClick }) => (
    <span
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs ${
            onClick ? 'cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all' : ''
        } ${className}`}
    >
        <ShieldCheck size={11} strokeWidth={2.5} className="shrink-0" />
        PRO
    </span>
);

export default ProBadge;
