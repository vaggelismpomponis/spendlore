import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * ProBadge — inline amber-orange "PRO" chip.
 * Used next to locked features throughout the app.
 */
const ProBadge = () => (
    <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs"
    >
        <ShieldCheck size={11} strokeWidth={2.5} className="shrink-0" />
        PRO
    </span>
);

export default ProBadge;
