import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ChevronDown, Check, TrendingUp, TrendingDown,
    Eye, EyeOff, ArrowUpRight, Wallet
} from 'lucide-react';
import Amount from '../Amount';

const TIMEFRAME_OPTIONS = [
    { id: '1D', label_el: '1Η', label_en: '1D', desc_el: 'Σήμερα', desc_en: 'Today' },
    { id: 'WTD', label_el: 'WTD', label_en: 'WTD', desc_el: 'Τρέχουσα εβδομάδα', desc_en: 'Week to date' },
    { id: '7D', label_el: '7Η', label_en: '7D', desc_el: 'Τελευταίες 7 ημέρες', desc_en: 'Last 7 days' },
    { id: 'MTD', label_el: 'MTD', label_en: 'MTD', desc_el: 'Τρέχων μήνας', desc_en: 'Month to date' },
    { id: 'LM', label_el: 'LM', label_en: 'LM', desc_el: 'Προηγούμενος μήνας', desc_en: 'Last month' },
    { id: '30D', label_el: '30Η', label_en: '30D', desc_el: 'Τελευταίες 30 ημέρες', desc_en: 'Last 30 days' },
    { id: '90D', label_el: '90Η', label_en: '90D', desc_el: 'Τελευταίες 90 ημέρες', desc_en: 'Last 90 days' },
    { id: 'YTD', label_el: 'YTD', label_en: 'YTD', desc_el: 'Τρέχον έτος', desc_en: 'Year to date' },
    { id: '365D', label_el: '1E', label_en: '1Y', desc_el: 'Τελευταίο έτος', desc_en: 'Last 365 days' },
    { id: '5Y', label_el: '5E', label_en: '5Y', desc_el: 'Τελευταία 5 έτη', desc_en: 'Last 5 years' },
    { id: '10Y', label_el: '10E', label_en: '10Y', desc_el: 'Τελευταία 10 έτη', desc_en: 'Last 10 years' },
    { id: 'All', label_el: 'Όλα', label_en: 'All', desc_el: 'Όλο το ιστορικό', desc_en: 'All time' },
];

/**
 * BalanceTrendCard — Flagship Spending Progression & Financial Trend Card
 * Features Month Spend as the primary hero figure with interactive timeframe progression chart,
 * and Total Balance (all_time_balance), Month Income, and Month Net cashflow capsules below.
 */
export default function BalanceTrendCard({
    balance = 0,
    transactions = [],
    currency = '€',
    privacyMode = false,
    togglePrivacyMode,
    monthSpend = 0,
    monthIncome = 0,
    monthNet = 0,
    isMonthNetPositive = true,
    spendTrend = 'neutral',
    diffPct = 0,
    isDesktop = false,
    t = (k) => k,
    language = 'el',
}) {
    const isEL = language === 'el';
    const [timeframe, setTimeframe] = useState('MTD');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const menuRef = useRef(null);
    const chartAreaRef = useRef(null);
    const svgContainerRef = useRef(null);
    const isTouchRef = useRef(false);

    // Close menu on outside click or escape
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('pointerdown', handleDown);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('pointerdown', handleDown);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isMenuOpen]);

    // Dismiss active chart tooltip on outside click/tap or escape
    useEffect(() => {
        if (hoveredIndex === null) return;
        const handleOutside = (e) => {
            if (chartAreaRef.current && !chartAreaRef.current.contains(e.target)) {
                setHoveredIndex(null);
                isTouchRef.current = false;
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setHoveredIndex(null);
                isTouchRef.current = false;
            }
        };
        document.addEventListener('pointerdown', handleOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('pointerdown', handleOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [hoveredIndex]);

    // ── Build historical spend timeline ──
    const { chartPoints, totalPeriodSpend, startDateLabel, endDateLabel } = useMemo(() => {
        const now = new Date();
        let startDate;

        switch (timeframe) {
            case '1D':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'WTD': {
                const d = new Date(now);
                const day = d.getDay();
                const diffToMonday = (day + 6) % 7;
                d.setDate(d.getDate() - diffToMonday);
                d.setHours(0, 0, 0, 0);
                startDate = d;
                break;
            }
            case '7D':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'MTD':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'LM':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case '30D':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90D':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'YTD':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case '365D':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case '5Y':
                startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
                break;
            case '10Y':
                startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
                break;
            case 'All':
            default:
                if (transactions.length > 0) {
                    const sortedDates = transactions
                        .map(tx => new Date(tx.date || tx.created_at || now).getTime())
                        .filter(n => !isNaN(n))
                        .sort((a, b) => a - b);
                    startDate = sortedDates.length > 0 ? new Date(sortedDates[0]) : new Date(now.getFullYear(), now.getMonth(), 1);
                } else {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                }
                break;
        }

        const startTime = startDate.getTime();
        const endTime = now.getTime();

        // Valid expense transactions in the period
        const periodExpenses = transactions
            .filter(tx => {
                if (tx.type !== 'expense') return false;
                const time = new Date(tx.date || tx.created_at || 0).getTime();
                return !isNaN(time) && time >= startTime && time <= endTime;
            })
            .sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime());

        const totalExpenseSum = periodExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        // For MTD, if monthSpend is provided, prioritize it for 100% sync with overall app stats
        const effectiveTotalSpend = (timeframe === 'MTD' && monthSpend > 0) ? monthSpend : totalExpenseSum;

        // Generate day-by-day (or interval-by-interval) trajectory
        const numSteps = Math.max(12, Math.min(60, Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000)) + 1));
        const stepMs = (endTime - startTime) / (numSteps - 1 || 1);

        const points = [];
        let cumSpend = 0;
        let txIndex = 0;

        const pad = (n) => String(n).padStart(2, '0');

        for (let i = 0; i < numSteps; i++) {
            const stepTime = i === numSteps - 1 ? endTime : startTime + i * stepMs;
            const stepDate = new Date(stepTime);

            while (txIndex < periodExpenses.length) {
                const tTime = new Date(periodExpenses[txIndex].date || periodExpenses[txIndex].created_at).getTime();
                if (tTime <= stepTime) {
                    cumSpend += Number(periodExpenses[txIndex].amount) || 0;
                    txIndex++;
                } else {
                    break;
                }
            }

            const dateFormatted = `${pad(stepDate.getDate())}.${pad(stepDate.getMonth() + 1)}.${stepDate.getFullYear()}`;

            points.push({
                xPct: (i / (numSteps - 1 || 1)) * 100,
                spend: i === numSteps - 1 ? effectiveTotalSpend : cumSpend,
                date: stepDate,
                dateFormatted,
                dateStr: stepDate.toLocaleDateString(isEL ? 'el-GR' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            });
        }

        const startLabel = startDate.toLocaleDateString(isEL ? 'el-GR' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const endLabel = now.toLocaleDateString(isEL ? 'el-GR' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return {
            chartPoints: points,
            totalPeriodSpend: effectiveTotalSpend,
            startDateLabel: startLabel,
            endDateLabel: endLabel
        };
    }, [transactions, timeframe, isEL, monthSpend]);

    // Active hovered point or final state
    const isHovering = hoveredIndex !== null && chartPoints[hoveredIndex];
    const displaySpend = isHovering ? chartPoints[hoveredIndex].spend : totalPeriodSpend;

    // SVG coordinate space
    const svgWidth = 600;
    const svgHeight = 110;
    const padTop = 10;
    const padBottom = 8;
    const drawHeight = svgHeight - padTop - padBottom;

    const { pathD, areaD, normalizedPoints } = useMemo(() => {
        if (chartPoints.length === 0) return { pathD: '', areaD: '', normalizedPoints: [] };

        const spends = chartPoints.map(p => p.spend);
        const minS = Math.min(...spends, 0);
        const maxS = Math.max(...spends, 1);
        const range = maxS - minS;

        const pts = chartPoints.map((pt, i) => {
            const x = (i / (chartPoints.length - 1 || 1)) * svgWidth;
            let y = padTop + drawHeight;
            if (range > 0) {
                // Invert y: high spend at top (small y), low spend at bottom (large y)
                y = padTop + (1 - (pt.spend - minS) / range) * drawHeight;
            }
            return { x, y, raw: pt };
        });

        let pStr = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length; i++) {
            pStr += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
        }

        const aStr = `${pStr} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

        return { pathD: pStr, areaD: aStr, normalizedPoints: pts };
    }, [chartPoints, drawHeight, padTop, svgHeight, svgWidth]);

    // Helper to calculate nearest point along the chart
    const updateScrubber = (clientX) => {
        if (!svgContainerRef.current || chartPoints.length === 0) return;
        const rect = svgContainerRef.current.getBoundingClientRect();
        if (rect.width <= 0) return;
        const xPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const pct = xPos / rect.width;
        const nearestIdx = Math.max(0, Math.min(chartPoints.length - 1, Math.round(pct * (chartPoints.length - 1))));
        setHoveredIndex(nearestIdx);
    };

    // Pointer move handler across chart area (Desktop hover)
    const handlePointerMove = (e) => {
        if (e.pointerType === 'touch') return;
        updateScrubber(e.clientX);
    };

    const handlePointerLeave = () => {
        if (!isTouchRef.current) {
            setHoveredIndex(null);
        }
    };

    // Touch handlers for mobile tap & scrub
    const handleTouchStart = (e) => {
        isTouchRef.current = true;
        if (e.touches && e.touches[0]) {
            updateScrubber(e.touches[0].clientX);
        }
    };

    const handleTouchMove = (e) => {
        isTouchRef.current = true;
        if (e.touches && e.touches[0]) {
            updateScrubber(e.touches[0].clientX);
        }
    };

    // Direct click handler (works for mouse click and mobile tap)
    const handleClick = (e) => {
        updateScrubber(e.clientX);
    };

    // Stroke Color: If spend is below previous month -> green (favorable); if above -> rose (warning)
    const strokeColor = spendTrend === 'below'
        ? '#10b981'
        : spendTrend === 'above'
        ? '#f43f5e'
        : '#0284c7';

    const activeTimeframeObj = TIMEFRAME_OPTIONS.find(o => o.id === timeframe) || TIMEFRAME_OPTIONS[3];
    const currentTimeframeLabel = isEL ? activeTimeframeObj.label_el : activeTimeframeObj.label_en;

    const heroTitle = timeframe === 'MTD'
        ? (t('this_month_spend') || (isEL ? 'Έξοδα Μήνα' : 'This Month Spend'))
        : (isEL ? 'Έξοδα Περιόδου' : 'Period Spend');

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 shadow-xs transition-all">
            {/* Top Row: Label, Controls (Timeframe & Privacy) */}
            <div className="p-5 sm:p-6 pb-2">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">
                        {heroTitle}
                    </p>

                    <div className="flex items-center gap-2 relative" ref={menuRef}>
                        {/* Privacy Toggle */}
                        {togglePrivacyMode && (
                            <button
                                type="button"
                                onClick={togglePrivacyMode}
                                aria-label={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 active:scale-95 transition-all"
                                title={privacyMode ? 'Show amounts' : 'Hide amounts'}
                            >
                                {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        )}

                        {/* Sure-Style Timeframe Dropdown */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-xs font-bold text-gray-800 dark:text-gray-100 transition-all active:scale-95 shadow-xs"
                            aria-haspopup="listbox"
                            aria-expanded={isMenuOpen}
                        >
                            <span>{currentTimeframeLabel}</span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 max-h-72 overflow-y-auto bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-40 animate-fade-in">
                                {TIMEFRAME_OPTIONS.map(opt => {
                                    const isSelected = opt.id === timeframe;
                                    const label = isEL ? opt.label_el : opt.label_en;
                                    const desc = isEL ? opt.desc_el : opt.desc_en;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                setTimeframe(opt.id);
                                                setIsMenuOpen(false);
                                                setHoveredIndex(null);
                                            }}
                                            className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs font-semibold transition-colors ${
                                                isSelected
                                                    ? 'bg-gray-100/90 dark:bg-white/[0.08] text-gray-950 dark:text-white font-bold'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold">{label}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{desc}</span>
                                            </div>
                                            {isSelected && (
                                                <Check size={14} className="text-gray-900 dark:text-white shrink-0 ml-2" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Primary Figure & Trend Subtitle */}
                <div className="mt-2.5">
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl sm:text-3xl font-extrabold text-gray-400 dark:text-gray-500 font-sans transition-all duration-200 ${privacyMode ? 'filter blur-[6px] select-none' : ''}`}>
                            {currency}
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-gray-900 dark:text-white tracking-tight tabular-nums font-sans leading-none">
                            <Amount value={displaySpend} showCurrency={false} minimumFractionDigits={2} maximumFractionDigits={2} />
                        </h2>
                    </div>

                    {/* Trend Subtitle (or Hovered Date Spend) */}
                    <div className="mt-2 min-h-[20px] flex items-center gap-1.5">
                        {isHovering ? (
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {chartPoints[hoveredIndex].dateStr}
                            </span>
                        ) : diffPct > 0 ? (
                            <span className={`inline-flex items-center gap-1 text-xs sm:text-[13px] font-bold transition-all duration-200 ${
                                spendTrend === 'below'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                            } ${privacyMode ? 'filter blur-[5px] select-none' : ''}`}>
                                {spendTrend === 'below' ? <TrendingDown size={13} className="shrink-0" /> : <TrendingUp size={13} className="shrink-0" />}
                                <span>{diffPct}% {spendTrend === 'below' ? (t('below_last_month') || 'κάτω από προηγούμενο μήνα') : (t('above_last_month') || 'πάνω από προηγούμενο μήνα')}</span>
                            </span>
                        ) : (
                            <span className={`text-xs text-gray-500 dark:text-gray-400 font-medium transition-all duration-200 ${privacyMode ? 'filter blur-[5px] select-none' : ''}`}>
                                {t('same_as_last_month') || (isEL ? 'Ίδια επίπεδα με προηγούμενο μήνα' : 'Same as last month')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Interactive SVG Area Chart ── */}
            <div
                ref={chartAreaRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onClick={handleClick}
                className="relative w-full cursor-crosshair px-2 sm:px-4 select-none"
            >
                <div ref={svgContainerRef} className="relative w-full">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-20 sm:h-32 overflow-visible"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id={`spend-gradient-${timeframe}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.18} />
                                <stop offset="80%" stopColor={strokeColor} stopOpacity={0.02} />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Gradient Fill Area */}
                        {areaD && (
                            <path
                                d={areaD}
                                fill={`url(#spend-gradient-${timeframe})`}
                                style={{ transition: 'd 0.3s ease-out' }}
                            />
                        )}

                        {/* Main Spend Progression Line */}
                        {pathD && (
                            <path
                                d={pathD}
                                fill="none"
                                stroke={strokeColor}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                style={{ transition: 'd 0.3s ease-out' }}
                            />
                        )}

                        {/* Scrubbing Cursor Guideline */}
                        {isHovering && normalizedPoints[hoveredIndex] && (
                            <line
                                x1={normalizedPoints[hoveredIndex].x}
                                y1={0}
                                x2={normalizedPoints[hoveredIndex].x}
                                y2={svgHeight}
                                stroke="currentColor"
                                className="text-gray-400/60 dark:text-white/40"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                            />
                        )}
                    </svg>

                    {/* Scrubber Dot with Halo (Rendered as HTML overlay to stay a 100% PERFECT circle across all screen sizes & aspect ratios) */}
                    {isHovering && normalizedPoints[hoveredIndex] && (
                        <div
                            data-testid="chart-scrubber-dot"
                            className="absolute pointer-events-none z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out"
                            style={{
                                left: `${(normalizedPoints[hoveredIndex].x / svgWidth) * 100}%`,
                                top: `${(normalizedPoints[hoveredIndex].y / svgHeight) * 100}%`,
                            }}
                        >
                            {/* Outer Halo Circle (translucent ring) */}
                            <div
                                className="w-[18px] h-[18px] rounded-full shrink-0"
                                style={{
                                    backgroundColor: strokeColor,
                                    opacity: 0.20,
                                }}
                            />
                            {/* Inner Solid Circular Dot */}
                            <div
                                className="absolute w-[9px] h-[9px] rounded-full ring-2 ring-white dark:ring-surface-dark2 shadow-sm shrink-0"
                                style={{
                                    backgroundColor: strokeColor,
                                }}
                            />
                        </div>
                    )}

                    {/* Floating Sure-Style Tooltip Card */}
                    {isHovering && normalizedPoints[hoveredIndex] && (
                        <div
                            data-testid="chart-tooltip-card"
                            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
                            style={{
                                left: `${(normalizedPoints[hoveredIndex].x / svgWidth) * 100}%`,
                                top: `${Math.max(16, Math.min(84, (normalizedPoints[hoveredIndex].y / svgHeight) * 100))}%`,
                                transform: (normalizedPoints[hoveredIndex].x / svgWidth) > 0.62
                                    ? 'translate(calc(-100% - 12px), -50%)'
                                    : 'translate(12px, -50%)',
                            }}
                        >
                            <div className="bg-white/95 dark:bg-surface-dark2/95 backdrop-blur-md border border-gray-200/90 dark:border-white/10 rounded-xl px-3 py-2 shadow-xl select-none min-w-[120px]">
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 font-mono tracking-tight leading-none">
                                    {chartPoints[hoveredIndex].dateFormatted}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                                    <span className="text-gray-400 dark:text-gray-500 font-semibold">—</span>
                                    <Amount value={chartPoints[hoveredIndex].spend} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Labels at Bottom Corners */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-3 pb-1 select-none">
                    <span>{startDateLabel}</span>
                    <span>{endDateLabel}</span>
                </div>
            </div>

            {/* ── Cashflow Summary Capsules Row: Total Balance, Month Income, Month Net ── */}
            <div className="p-2.5 sm:p-5 pt-2 sm:pt-3 border-t border-gray-200/70 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.01]">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    {/* 1. Total Balance Card (Συνολικό Υπόλοιπο) */}
                    <div className="bg-white dark:bg-surface-dark3 rounded-xl p-2 sm:p-3 border border-gray-200/70 dark:border-white/10 shadow-xs min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                            <Wallet size={12} className="text-gray-900 dark:text-white shrink-0 sm:w-[13px] sm:h-[13px]" strokeWidth={2.4} />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                                {t('all_time_balance') || (isEL ? 'Συνολικό Υπόλοιπο' : 'Total Balance')}
                            </span>
                        </div>
                        <p className={`text-xs sm:text-base font-extrabold tabular-nums truncate ${
                            balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'
                        }`}>
                            <Amount value={balance} />
                        </p>
                    </div>

                    {/* 2. Month Income */}
                    <div className="bg-white dark:bg-surface-dark3 rounded-xl p-2 sm:p-3 border border-gray-200/70 dark:border-white/10 shadow-xs min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                            <ArrowUpRight size={12} className="text-emerald-500 shrink-0 sm:w-[13px] sm:h-[13px]" strokeWidth={2.4} />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                                {t('month_income') || (isEL ? 'Έσοδα Μήνα' : 'Month Income')}
                            </span>
                        </div>
                        <p className="text-xs sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                            <Amount value={monthIncome} />
                        </p>
                    </div>

                    {/* 3. Month Net Cashflow */}
                    <div className="bg-white dark:bg-surface-dark3 rounded-xl p-2 sm:p-3 border border-gray-200/70 dark:border-white/10 shadow-xs min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                            {isMonthNetPositive ? (
                                <TrendingUp size={12} className="text-emerald-500 shrink-0 sm:w-[13px] sm:h-[13px]" strokeWidth={2.4} />
                            ) : (
                                <TrendingDown size={12} className="text-rose-500 shrink-0 sm:w-[13px] sm:h-[13px]" strokeWidth={2.4} />
                            )}
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                                {t('month_net') || (isEL ? 'Ισοζύγιο' : 'Month Net')}
                            </span>
                        </div>
                        <p className={`text-xs sm:text-base font-black tabular-nums truncate ${
                            isMonthNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                            <Amount
                                value={Math.abs(monthNet)}
                                prefix={isMonthNetPositive ? '+' : '−'}
                                showSign={false}
                            />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
