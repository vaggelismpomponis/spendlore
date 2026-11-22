import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import CategoryIcon from '../components/CategoryIcon';
import CalendarSection from '../components/CalendarSection';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    Label
} from 'recharts';
import {
    TrendingUp, TrendingDown, X, ChevronRight,
    BarChart2, PieChart as PieIcon,
    Calendar, ArrowUpRight, Activity, ThumbsDown,
    Target, Wallet, Store, ShieldCheck, CheckCircle2
} from 'lucide-react';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';
import { useAppStore } from '../store/useAppStore';
import useIsDesktop from '../hooks/useIsDesktop';
import {
    getCategoryTranslation,
    getUppercaseCategoryTranslation
} from '../utils/categoryTranslations';

/* ─── Premium Palette ─── */
const COLORS = [
    '#7c3aed', // Violet
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#ef4444'  // Red
];

/* ─── Custom Tooltip for Cash Flow ─── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl 
                        border border-gray-100 dark:border-white/10
                        rounded-2xl p-4 shadow-xl text-xs min-w-[150px] animate-pop">
            <p className="font-bold text-gray-400 dark:text-gray-500 mb-2 border-b border-gray-100 dark:border-white/5 pb-2 uppercase tracking-widest">{label}</p>
            <div className="space-y-2">
                {payload.map(p => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ background: p.color || p.fill }} />
                            <span className="font-bold text-gray-600 dark:text-gray-300">{p.name}:</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">
                            <Amount value={p.value} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Custom Tooltip for Weekday Bar Chart ─── */
const WeekdayTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl 
                        border border-gray-100 dark:border-white/10
                        rounded-2xl p-3 shadow-xl text-xs min-w-[130px] animate-pop">
            <p className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] mb-1">{label}</p>
            <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-gray-600 dark:text-gray-300">Έξοδα:</span>
                <span className="font-black text-gray-900 dark:text-white">
                    <Amount value={item.value} />
                </span>
            </div>
        </div>
    );
};

/* ─── Time filter button ─── */
const TimeBtn = ({ value, label, active, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`flex-1 py-2 px-3 rounded-xl text-xs whitespace-nowrap transition-all duration-200
                    ${active
                ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white font-bold shadow-xs border border-gray-200/90 dark:border-white/10'
                : 'text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/5'
            }`}
    >
        {label}
    </button>
);

const StatsView = ({ transactions = [] }) => {
    const { t, language, privacyMode } = useSettings();
    const isDesktop = useIsDesktop();
    const budgets = useAppStore(state => state.budgets) || [];

    const [activeView, setActiveView] = useState('analytics'); // 'analytics' | 'calendar'
    const [timeRange, setTimeRange] = useState('thisMonth');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    // Calendar view state
    const [calendarYear, setCalendarYear] = useState(() => selectedYear || new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(() => (selectedMonth !== null && selectedMonth !== undefined) ? selectedMonth : new Date().getMonth());

    // Sync calendar view with parent period selection
    useEffect(() => {
        const now = new Date();
        if (timeRange === 'thisMonth') {
            setCalendarYear(now.getFullYear());
            setCalendarMonth(now.getMonth());
        } else if (timeRange === 'lastMonth') {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            setCalendarYear(lm.getFullYear());
            setCalendarMonth(lm.getMonth());
        } else if (timeRange === 'custom' && selectedMonth !== null) {
            setCalendarYear(selectedYear);
            setCalendarMonth(selectedMonth);
        }
    }, [timeRange, selectedYear, selectedMonth]);

    // Modal background scroll lock & ESC key listener
    useEffect(() => {
        if (!selectedCategory) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedCategory(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedCategory]);

    const locale = language === 'el' ? 'el-GR' : 'en-US';

    const availableYears = useMemo(() => {
        const years = [...new Set(transactions.map(tx => new Date(tx.date).getFullYear()))];
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) years.push(currentYear);
        return years.sort((a, b) => b - a);
    }, [transactions]);

    const months = useMemo(() => [
        { id: 0, name: t('january') || 'Ιανουάριος' }, { id: 1, name: t('february') || 'Φεβρουάριος' },
        { id: 2, name: t('march') || 'Μάρτιος' }, { id: 3, name: t('april') || 'Απρίλιος' },
        { id: 4, name: t('may') || 'Μάιος' }, { id: 5, name: t('june') || 'Ιούνιος' },
        { id: 6, name: t('july') || 'Ιούλιος' }, { id: 7, name: t('august') || 'Αύγουστος' },
        { id: 8, name: t('september') || 'Σεπτέμβριος' }, { id: 9, name: t('october') || 'Οκτώβριος' },
        { id: 10, name: t('november') || 'Νοέμβριος' }, { id: 11, name: t('december') || 'Δεκέμβριος' }
    ], [t]);

    /* ── Filter Logic ── */
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(tx => {
            const d = new Date(tx.date);
            if (timeRange === 'custom') {
                return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth);
            }
            if (timeRange === 'thisMonth') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (timeRange === 'lastMonth') {
                const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
            }
            if (timeRange === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });
    }, [transactions, timeRange, selectedYear, selectedMonth]);

    /* ── Category Drill-Down Data ── */
    const drillDownTransactions = useMemo(() => {
        if (!selectedCategory) return [];
        const catLower = selectedCategory.toLowerCase();
        return filteredTransactions
            .filter(t => {
                if (t.type !== 'expense') return false;
                if (Array.isArray(t.splits) && t.splits.length >= 2) {
                    return t.splits.some(s => (s.category || s.category_id)?.toLowerCase() === catLower);
                }
                return t.category?.toLowerCase() === catLower;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [filteredTransactions, selectedCategory]);

    const drillDownTotal = useMemo(() => {
        if (!selectedCategory) return 0;
        const catLower = selectedCategory.toLowerCase();
        return drillDownTransactions.reduce((s, t) => {
            if (Array.isArray(t.splits) && t.splits.length >= 2) {
                const splitSum = t.splits
                    .filter(sp => (sp.category || sp.category_id)?.toLowerCase() === catLower)
                    .reduce((acc, sp) => acc + (Number(sp.amount) || 0), 0);
                return s + splitSum;
            }
            return s + t.amount;
        }, 0);
    }, [drillDownTransactions, selectedCategory]);

    /* ── Aggregations (Income, Expense, Category Distribution, Cash Flow Trend) ── */
    const { totalIncome, totalExpense, incomeCount, expenseCount, categoryData, trendData } = useMemo(() => {
        let inc = 0, exp = 0;
        let incCount = 0, expCount = 0;
        const catMap = {};
        const trendMap = {};
        const isYearly = timeRange === 'year' || (timeRange === 'custom' && selectedMonth === null) || timeRange === 'all';

        const sortedTxs = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTxs.forEach(tx => {
            if (tx.type === 'income') {
                inc += tx.amount;
                incCount++;
            } else {
                exp += tx.amount;
                expCount++;
                if (Array.isArray(tx.splits) && tx.splits.length >= 2) {
                    tx.splits.forEach(s => {
                        const sCat = s.category || s.category_id || 'other';
                        catMap[sCat] = (catMap[sCat] || 0) + (Number(s.amount) || 0);
                    });
                } else {
                    catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
                }
            }

            const d = new Date(tx.date);
            const key = isYearly
                ? d.toLocaleDateString(locale, { month: 'short' })
                : d.toLocaleDateString(locale, { day: '2-digit', month: 'short' });

            if (!trendMap[key]) trendMap[key] = { date: key, income: 0, expense: 0 };
            trendMap[key][tx.type] += tx.amount;
        });

        const other1 = (t('other') || 'other').toLowerCase();
        const other2 = (t('cat_other') || 'other').toLowerCase();

        const catData = Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => {
                const aName = (a.name || '').toLowerCase();
                const bName = (b.name || '').toLowerCase();
                const isOtherA = aName === 'other' || aName === 'άλλο' || aName === other1 || aName === other2;
                const isOtherB = bName === 'other' || bName === 'άλλο' || bName === other1 || bName === other2;

                if (isOtherA && !isOtherB) return 1;
                if (!isOtherA && isOtherB) return -1;
                return b.value - a.value;
            });

        return {
            totalIncome: inc,
            totalExpense: exp,
            incomeCount: incCount,
            expenseCount: expCount,
            categoryData: catData,
            trendData: Object.values(trendMap)
        };
    }, [filteredTransactions, timeRange, selectedMonth, t, locale]);

    const cashFlow = totalIncome - totalExpense;

    /* ── Savings Rate Calculation ── */
    const savingsRate = useMemo(() => {
        if (totalIncome > 0) {
            return Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
        }
        return totalExpense > 0 ? -100 : 0;
    }, [totalIncome, totalExpense]);

    /* ── Budget Performance vs Daily Average Spend ── */
    const totalBudgetLimit = useMemo(() => {
        return budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    }, [budgets]);

    const budgetPct = useMemo(() => {
        if (totalBudgetLimit <= 0) return 0;
        return Math.round((totalExpense / totalBudgetLimit) * 100);
    }, [totalExpense, totalBudgetLimit]);

    const { daysInPeriod, dailyAvgSpend } = useMemo(() => {
        const now = new Date();
        let days = 30;
        if (timeRange === 'thisMonth') {
            days = Math.max(1, now.getDate());
        } else if (timeRange === 'lastMonth') {
            const lm = new Date(now.getFullYear(), now.getMonth(), 0);
            days = lm.getDate();
        } else if (timeRange === 'year') {
            const start = new Date(now.getFullYear(), 0, 1);
            const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            days = Math.max(1, diff);
        } else if (timeRange === 'custom') {
            if (selectedMonth !== null) {
                days = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            } else {
                days = 365;
            }
        }
        const avg = days > 0 ? totalExpense / days : 0;
        return { daysInPeriod: days, dailyAvgSpend: avg };
    }, [timeRange, selectedMonth, selectedYear, totalExpense]);

    /* ── Day of Week Spending Pattern (Bar Chart) ── */
    const { weekdayData, peakWeekdayName, peakWeekdayPct } = useMemo(() => {
        const dayLabels = language === 'el'
            ? ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ']
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const totals = [0, 0, 0, 0, 0, 0, 0];
        filteredTransactions.forEach(tx => {
            if (tx.type !== 'expense') return;
            const d = new Date(tx.date);
            // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
            const dayIdx = (d.getDay() + 6) % 7; // 0=Mon, 6=Sun
            totals[dayIdx] += (Number(tx.amount) || 0);
        });

        const maxVal = Math.max(...totals);
        const maxIdx = maxVal > 0 ? totals.indexOf(maxVal) : -1;

        const data = dayLabels.map((name, idx) => ({
            name,
            amount: totals[idx],
            isPeak: idx === maxIdx && maxVal > 0
        }));

        const peakPct = totalExpense > 0 && maxVal > 0
            ? Math.round((maxVal / totalExpense) * 100)
            : 0;

        return {
            weekdayData: data,
            peakWeekdayName: maxIdx >= 0 ? dayLabels[maxIdx] : null,
            peakWeekdayPct: peakPct
        };
    }, [filteredTransactions, language, totalExpense]);

    /* ── Top Merchants / Store Breakdown ── */
    const topMerchants = useMemo(() => {
        const merchantMap = {};
        filteredTransactions.forEach(tx => {
            if (tx.type !== 'expense') return;
            const raw = (tx.merchant || tx.merchant_name || tx.note || '').trim();
            if (!raw) return;
            const clean = raw.charAt(0).toUpperCase() + raw.slice(1);
            if (!merchantMap[clean]) {
                merchantMap[clean] = { name: clean, amount: 0, count: 0, category: tx.category || 'other' };
            }
            merchantMap[clean].amount += (Number(tx.amount) || 0);
            merchantMap[clean].count += 1;
        });

        return Object.values(merchantMap)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [filteredTransactions]);

    /* ── Anti-Persona Aggregation (Regret Status) ── */
    const antiPersona = useMemo(() => {
        const catStats = {};
        transactions.forEach(tx => {
            if (tx.type !== 'expense' || !tx.regret_status) return;
            const cat = tx.category?.toLowerCase() || 'other';
            if (!catStats[cat]) catStats[cat] = { count: 0, regretCount: 0 };
            catStats[cat].count++;
            if (tx.regret_status === 'regret') {
                catStats[cat].regretCount++;
            }
        });

        const ratedCats = Object.keys(catStats).filter(cat => catStats[cat].count > 0);
        if (ratedCats.length === 0) return [];

        const withQuotients = ratedCats.map(cat => ({
            category: cat,
            quotient: catStats[cat].regretCount / catStats[cat].count,
            regretCount: catStats[cat].regretCount,
            totalCount: catStats[cat].count
        }));

        withQuotients.sort((a, b) => {
            if (b.quotient !== a.quotient) return b.quotient - a.quotient;
            return b.totalCount - a.totalCount;
        });

        return withQuotients.filter(c => c.quotient > 0).slice(0, 2);
    }, [transactions]);

    /* ── Calendar Insights ── */
    const calendarInsights = useMemo(() => {
        const numDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const dailyTotals = {};
        let monthlyExpenseTotal = 0;

        transactions.forEach(tx => {
            if (tx.type !== 'expense') return;
            const d = new Date(tx.date);
            if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
                const day = d.getDate();
                dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
                monthlyExpenseTotal += tx.amount;
            }
        });

        let maxStreak = 0;
        let currentStreak = 0;
        let noExpenseDaysCount = 0;

        for (let day = 1; day <= numDays; day++) {
            const hasExpense = dailyTotals[day] !== undefined && dailyTotals[day] > 0;
            if (!hasExpense) {
                currentStreak++;
                noExpenseDaysCount++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        }

        let highestDayAmount = 0;
        let highestDayNum = null;
        for (let day = 1; day <= numDays; day++) {
            const dayAmt = dailyTotals[day] || 0;
            if (dayAmt > highestDayAmount) {
                highestDayAmount = dayAmt;
                highestDayNum = day;
            }
        }
        const highestDayDate = highestDayNum ? new Date(calendarYear, calendarMonth, highestDayNum) : null;
        const activeDaysCount = numDays - noExpenseDaysCount;
        const activeDayAverage = activeDaysCount > 0 ? monthlyExpenseTotal / activeDaysCount : 0;

        return {
            maxStreak,
            noExpenseDaysCount,
            totalDays: numDays,
            highestDayAmount,
            highestDayDate,
            activeDayAverage,
            activeDaysCount
        };
    }, [transactions, calendarYear, calendarMonth]);

    const TIME_FILTERS = [
        { value: 'thisMonth', label: t('stats_this_month') || 'Αυτ. Μήνας' },
        { value: 'lastMonth', label: t('stats_last_month') || 'Προηγ. Μήνας' },
        { value: 'year', label: t('stats_year') || 'Φέτος' },
        { value: 'custom', label: t('stats_history') || 'Ιστορικό' },
    ];

    return (
        <div className="pb-28 space-y-6">

            {/* ── Top Header & Navigation Segment ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {t('stats_portfolio_overview') || 'Επισκόπηση Χαρτοφυλακίου'}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        {timeRange === 'thisMonth'
                            ? (t('stats_this_month') || 'Αυτός ο Μήνας')
                            : timeRange === 'lastMonth'
                            ? (t('stats_last_month') || 'Προηγούμενος Μήνας')
                            : timeRange === 'year'
                            ? `${t('stats_year') || 'Έτος'} ${new Date().getFullYear()}`
                            : `${months[selectedMonth]?.name || ''} ${selectedYear}`}
                    </p>
                </div>

                {/* View Mode Segment Switcher (Analytics vs Calendar) */}
                <div className="inline-flex self-start sm:self-auto bg-gray-200/70 dark:bg-surface-dark3 p-1 rounded-xl border border-gray-300/60 dark:border-white/10">
                    <button
                        onClick={() => setActiveView('analytics')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeView === 'analytics'
                                ? 'bg-white dark:bg-surface-dark2 text-gray-900 dark:text-white shadow-xs'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <BarChart2 size={14} />
                        <span>{t('stats_view_analytics') || 'Αναλύσεις'}</span>
                    </button>
                    <button
                        onClick={() => setActiveView('calendar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeView === 'calendar'
                                ? 'bg-white dark:bg-surface-dark2 text-gray-900 dark:text-white shadow-xs'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Calendar size={14} />
                        <span>{t('stats_view_calendar') || 'Ημερολόγιο'}</span>
                    </button>
                </div>
            </div>

            {/* ── Time Period Filter Tabs ── */}
            <div className="bg-gray-100/90 dark:bg-surface-dark2 rounded-xl p-1 flex gap-1 border border-gray-200 dark:border-white/10 overflow-x-auto scrollbar-hide">
                {TIME_FILTERS.map(f => (
                    <TimeBtn
                        key={f.value}
                        value={f.value}
                        label={f.label}
                        active={timeRange === f.value}
                        onClick={setTimeRange}
                    />
                ))}
            </div>

            {/* ── Custom Year/Month Picker ── */}
            <AnimatePresence>
                {timeRange === 'custom' && (
                    <motion.div
                        key="custom-date-picker"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-100/90 dark:bg-surface-dark2 p-4 rounded-2xl space-y-4 overflow-hidden border border-gray-200 dark:border-white/10"
                    >
                        <div className="relative">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pr-10">
                                {availableYears.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                                                ${selectedYear === year
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-white/10 hover:bg-gray-50'}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-gray-100/90 dark:from-surface-dark2 to-transparent pointer-events-none flex items-center justify-end pr-1 pb-2">
                                <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className={`col-span-4 py-2 rounded-xl text-xs font-bold transition-all border
                                        ${selectedMonth === null
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-white/10 hover:bg-gray-50'}`}
                            >
                                {t('stats_year') || 'Όλο το'} {selectedYear}
                            </button>
                            {months.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMonth(m.id)}
                                    className={`py-2 rounded-xl text-[11px] font-bold transition-all
                                            ${selectedMonth === m.id
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-white/10 hover:bg-gray-50'}`}
                                >
                                    {m.name.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════════════
                VIEW 1: ANALYTICS & CHARTS DASHBOARD (DEFAULT)
            ══════════════════════════════════════════════════════════════════ */}
            {activeView === 'analytics' && (
                <div className="space-y-6">

                    {/* ── 4 Executive KPI Metric Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* 1. Total Income */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <TrendingUp size={15} className="text-emerald-500 shrink-0" />
                                    {t('stats_total_income') || 'Συνολικά Έσοδα'}
                                </span>
                            </div>
                            <div className="my-1 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                <Amount value={totalIncome} />
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                                <span>+{incomeCount} {t('stats_transactions') || 'συναλλαγές'}</span>
                            </div>
                        </div>

                        {/* 2. Total Expenses */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <TrendingDown size={15} className="text-rose-500 shrink-0" />
                                    {t('stats_total_expenses') || 'Συνολικά Έξοδα'}
                                </span>
                            </div>
                            <div className="my-1 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                <Amount value={totalExpense} />
                            </div>
                            <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                <span>-{expenseCount} {t('stats_transactions') || 'συναλλαγές'}</span>
                            </div>
                        </div>

                        {/* 3. Net Savings */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Wallet size={15} className="text-cyan-500 shrink-0" />
                                    {t('stats_net_savings') || 'Καθαρή Αποταμίευση'}
                                </span>
                                {savingsRate !== 0 && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        savingsRate >= 0
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                    }`}>
                                        {savingsRate >= 0 ? `+${savingsRate}%` : `${savingsRate}%`}
                                    </span>
                                )}
                            </div>
                            <div className={`my-1 text-2xl sm:text-3xl font-extrabold tracking-tight ${
                                cashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                                <Amount value={cashFlow} />
                            </div>
                            <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                                {t('stats_income_minus_expenses') || 'Έσοδα μείον έξοδα'}
                            </div>
                        </div>

                        {/* 4. Budget Performance or Daily Average */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Target size={15} className="text-amber-500 shrink-0" />
                                    {totalBudgetLimit > 0
                                        ? (t('stats_budget_performance') || 'Απόδοση Budget')
                                        : (t('stats_daily_average') || 'Ημερήσιος Μ.Ο.')}
                                </span>
                            </div>
                            {totalBudgetLimit > 0 ? (
                                <>
                                    <div className="my-1 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        {budgetPct}%
                                    </div>
                                    <div className="space-y-1.5 mt-1">
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(100, budgetPct)}%`,
                                                    backgroundColor: budgetPct > 100 ? '#ef4444' : budgetPct > 80 ? '#f59e0b' : '#10b981'
                                                }}
                                            />
                                        </div>
                                        <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                            {t('stats_of_budget_used') || 'του προϋπολογισμού'}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="my-1 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        <Amount value={dailyAvgSpend} />
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                                        {t('stats_per_day') || 'ανά ημέρα'} • {daysInPeriod} {language === 'el' ? 'ημέρες' : 'days'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Row 2: Charts Grid (Cash Flow Trend & Weekday Spending) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left: Cash Flow Trend */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <BarChart2 size={16} className="text-emerald-500" />
                                        {t('stats_trend_analysis') || 'Ανάλυση Τάσεων'}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                        {t('stats_cash_flow') || 'Ροή Εσόδων & Εξόδων'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span>{t('stats_income') || 'Έσοδα'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                                        <span>{t('stats_expense') || 'Έξοδα'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-60 w-full min-w-0">
                                {trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-white/5" />
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                                                dy={6}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                                tickFormatter={(v) => `€${v}`}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8884d8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="income"
                                                name={t('stats_income') || 'Έσοδα'}
                                                stroke="#10b981"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorInc)"
                                                animationDuration={1000}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expense"
                                                name={t('stats_expense') || 'Έξοδα'}
                                                stroke="#7c3aed"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorExp)"
                                                animationDuration={1000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <BarChart2 size={24} className="opacity-30" />
                                        <p className="text-xs font-medium">{t('stats_no_data') || 'Δεν υπάρχουν δεδομένα'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Weekday Spending Bar Chart */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar size={16} className="text-violet-500" />
                                        {t('stats_weekday_spending') || 'Έξοδα ανά Ημέρα Εβδομάδας'}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                        {peakWeekdayName
                                            ? `${t('stats_weekday_peak') || 'Κορυφαία ημέρα'}: ${peakWeekdayName} (${peakWeekdayPct}%)`
                                            : (t('stats_weekday_desc') || 'Κατανομή εξόδων στις ημέρες')}
                                    </p>
                                </div>
                            </div>

                            <div className="h-60 w-full min-w-0">
                                {totalExpense > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-white/5" />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }}
                                                dy={6}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                                tickFormatter={(v) => `€${v}`}
                                            />
                                            <Tooltip content={<WeekdayTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1000}>
                                                {weekdayData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.isPeak ? '#7c3aed' : '#94a3b8'}
                                                        opacity={entry.isPeak ? 1 : 0.45}
                                                        className="transition-colors hover:opacity-90"
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <Calendar size={24} className="opacity-30" />
                                        <p className="text-xs font-medium">{t('stats_no_expenses') || 'Δεν υπάρχουν έξοδα.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Row 3: Donut & Top Categories ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left: Expense Distribution Donut */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <PieIcon size={16} className="text-violet-500" />
                                    {t('stats_expense_distribution') || 'Κατανομή Εξόδων'}
                                </h3>
                            </div>

                            {categoryData.length > 0 ? (
                                <div className="flex flex-col items-center">
                                    <div className="h-60 w-full relative min-w-0">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={68} outerRadius={92}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                    animationBegin={0}
                                                    animationDuration={1000}
                                                >
                                                    {categoryData.map((_, i) => (
                                                        <Cell
                                                            key={i}
                                                            fill={COLORS[i % COLORS.length]}
                                                            className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                                        />
                                                    ))}
                                                    <Label
                                                        width={30}
                                                        position="center"
                                                        content={() => (
                                                            <g>
                                                                <text
                                                                    x="50%"
                                                                    y="50%"
                                                                    dy="-8"
                                                                    textAnchor="middle"
                                                                    dominantBaseline="middle"
                                                                    className="fill-gray-400 dark:fill-gray-500 text-[10px] font-bold uppercase tracking-widest"
                                                                >
                                                                    {t('stats_total_spent') || 'ΣΥΝΟΛΟ'}
                                                                </text>
                                                                <text
                                                                    x="50%"
                                                                    y="50%"
                                                                    dy="14"
                                                                    textAnchor="middle"
                                                                    dominantBaseline="middle"
                                                                    className="fill-gray-900 dark:fill-white text-lg font-black"
                                                                    style={{ filter: privacyMode ? 'blur(6px)' : 'none' }}
                                                                >
                                                                    {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalExpense)}
                                                                </text>
                                                            </g>
                                                        )}
                                                    />
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Category Chips Legend */}
                                    <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-sm">
                                        {categoryData.map((cat, i) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 transition-all hover:bg-gray-200/70 dark:hover:bg-white/10"
                                            >
                                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                    {getCategoryTranslation(cat.name, t)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <PieIcon size={24} className="opacity-30" />
                                    <p className="text-xs font-medium">{t('stats_no_data') || 'Δεν υπάρχουν δεδομένα'}</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Top Categories List */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity size={16} className="text-cyan-500" />
                                    {t('stats_top_categories') || 'Κορυφαίες Κατηγορίες'}
                                </h3>
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {categoryData.length} {t('categories') || 'κατηγορίες'}
                                </span>
                            </div>

                            {categoryData.length === 0 ? (
                                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <Activity size={24} className="opacity-30" />
                                    <p className="text-xs font-medium">{t('stats_no_expenses') || 'Δεν υπάρχουν έξοδα.'}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categoryData.slice(0, 5).map((cat, i) => {
                                        const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                                        return (
                                            <button
                                                key={cat.name}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className="w-full bg-gray-50/80 dark:bg-surface-dark3 rounded-xl p-3 border border-gray-200/60 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="shrink-0">
                                                        <CategoryIcon category={cat.name} type="expense" size={22} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                                                {getCategoryTranslation(cat.name, t)}
                                                            </span>
                                                            <span className="font-black text-xs text-gray-900 dark:text-white shrink-0 ml-2">
                                                                <Amount value={cat.value} />
                                                            </span>
                                                        </div>
                                                        <div className="relative h-1.5 bg-gray-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                                                                style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1.5">
                                                            <span className="text-[10px] text-gray-400 font-semibold">
                                                                {pct.toFixed(1)}% {t('stats_pct_of_total') || 'των εξόδων'}
                                                            </span>
                                                            <ArrowUpRight size={12} className="text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Row 4: Top Merchants & Smart Financial Indicators ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left: Top Merchants Breakdown */}
                        <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Store size={16} className="text-amber-500" />
                                        {t('stats_top_merchants') || 'Κορυφαίοι Έμποροι & Καταστήματα'}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                        {t('stats_merchants_breakdown') || 'Ανάλυση ανά κατάστημα βάσει σημειώσεων'}
                                    </p>
                                </div>
                            </div>

                            {topMerchants.length === 0 ? (
                                <div className="h-44 flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <Store size={24} className="opacity-30" />
                                    <p className="text-xs font-medium text-center max-w-xs">
                                        {t('stats_no_merchants') || 'Δεν έχουν καταγραφεί έμποροι ή καταστήματα.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topMerchants.map((m, i) => {
                                        const maxMerchantVal = topMerchants[0]?.amount || 1;
                                        const relativePct = (m.amount / maxMerchantVal) * 100;
                                        return (
                                            <div
                                                key={m.name}
                                                className="bg-gray-50/80 dark:bg-surface-dark3 rounded-xl p-3 border border-gray-200/60 dark:border-white/5"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                            {m.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                            ({m.count} {t('stats_transactions') || 'συν.'})
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900 dark:text-white shrink-0 ml-2">
                                                        <Amount value={m.amount} />
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200/80 dark:bg-white/10 rounded-full overflow-hidden mt-1.5">
                                                    <div
                                                        className="h-full bg-amber-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${relativePct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Anti-Persona or Financial Health */}
                        {antiPersona.length > 0 ? (
                            <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                            <ThumbsDown size={16} />
                                            Anti-Persona Insights
                                        </h3>
                                        <p className="text-[11px] text-gray-500 dark:text-white/60 font-medium mt-0.5">
                                            Κατηγορίες με το υψηλότερο ποσοστό μεταμέλειας
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {antiPersona.map((ap) => (
                                        <div
                                            key={ap.category}
                                            className="flex items-center gap-3.5 bg-gray-50/80 dark:bg-surface-dark3 rounded-xl p-3 border border-rose-100 dark:border-rose-500/10"
                                        >
                                            <div className="shrink-0">
                                                <CategoryIcon category={ap.category} type="expense" size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-xs text-gray-900 dark:text-white capitalize truncate">
                                                        {getCategoryTranslation(ap.category, t)}
                                                    </h4>
                                                    <span className="text-[11px] font-bold text-rose-500 tabular-nums shrink-0 ml-2">
                                                        {Math.round(ap.quotient * 100)}% Μεταμέλεια
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-rose-500 rounded-full"
                                                        style={{ width: `${ap.quotient * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    {ap.regretCount} από {ap.totalCount} αγορές μετανιωμένες
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-emerald-500" />
                                            {t('stats_financial_health') || 'Οικονομική Εικόνα'}
                                        </h3>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                            {t('stats_financial_health_desc') || 'Συνοπτικοί δείκτες οικονομικής υγείας'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveView('calendar')}
                                        className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                                    >
                                        <span>{t('stats_calendar_hint') || 'Ημερολόγιο'}</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50/80 dark:bg-surface-dark3 rounded-xl p-3 border border-gray-200/60 dark:border-white/5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                            {t('saving_streak') || 'Σερί Χωρίς Έξοδα'}
                                        </span>
                                        <span className="text-lg font-black text-violet-600 dark:text-violet-400">
                                            {calendarInsights.maxStreak} {language === 'el' ? 'ημέρες' : 'days'}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50/80 dark:bg-surface-dark3 rounded-xl p-3 border border-gray-200/60 dark:border-white/5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                            {t('expense_free_days') || 'Ημέρες Χωρίς Έξοδα'}
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-emerald-500">
                                                {calendarInsights.noExpenseDaysCount}
                                            </span>
                                            <span className="text-[11px] font-bold text-gray-400">
                                                / {calendarInsights.totalDays}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/80 dark:bg-surface-dark3 rounded-xl p-3 border border-gray-200/60 dark:border-white/5 col-span-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {t('highest_spend_day') || 'Ημέρα Μεγαλύτερου Εξόδου'}
                                            </span>
                                            {calendarInsights.highestDayDate && (
                                                <span className="text-[10px] font-bold text-gray-500">
                                                    {calendarInsights.highestDayDate.toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-lg font-black text-rose-500 block mt-0.5">
                                            <Amount value={calendarInsights.highestDayAmount} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                VIEW 2: EXPENSE CALENDAR & CALENDAR INSIGHTS
            ══════════════════════════════════════════════════════════════════ */}
            {activeView === 'calendar' && (
                <div className="space-y-6">
                    {/* Expense Calendar Section */}
                    <CalendarSection
                        transactions={transactions}
                        calendarYear={calendarYear}
                        calendarMonth={calendarMonth}
                        setCalendarYear={setCalendarYear}
                        setCalendarMonth={setCalendarMonth}
                    />

                    {/* Calendar Insights */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-2xl p-5 sm:p-6 space-y-4 border border-gray-200/80 dark:border-white/10 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <TrendingUp size={20} className="text-gray-900 dark:text-white shrink-0" />
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {t('calendar_insights') || 'Στατιστικά Ημερολογίου'}
                                </h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                    {months[calendarMonth]?.name} {calendarYear}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {/* Saving Streak */}
                            <div className="bg-gray-50/80 dark:bg-surface-dark3 border border-gray-200/60 dark:border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {t('saving_streak') || 'Σερί Χωρίς Έξοδα'}
                                </span>
                                <span className="text-base sm:text-lg font-black text-violet-600 dark:text-violet-400 mt-2">
                                    {calendarInsights.maxStreak === 1
                                        ? (t('streak_day_single') || '1 μέρα σερί')
                                        : t('streak_days', { days: calendarInsights.maxStreak }) || `${calendarInsights.maxStreak} μέρες σερί`}
                                </span>
                            </div>

                            {/* Expense-Free Days */}
                            <div className="bg-gray-50/80 dark:bg-surface-dark3 border border-gray-200/60 dark:border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {t('expense_free_days') || 'Ημέρες Χωρίς Έξοδα'}
                                </span>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-base sm:text-lg font-black text-emerald-500">
                                        {calendarInsights.noExpenseDaysCount}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                        / {calendarInsights.totalDays}
                                    </span>
                                </div>
                            </div>

                            {/* Highest Expense Day */}
                            <div className="bg-gray-50/80 dark:bg-surface-dark3 border border-gray-200/60 dark:border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {t('highest_spend_day') || 'Μεγαλύτερο Έξοδο'}
                                </span>
                                <div className="mt-2 flex flex-col">
                                    <span className="text-base sm:text-lg font-black text-rose-500">
                                        <Amount value={calendarInsights.highestDayAmount} />
                                    </span>
                                    {calendarInsights.highestDayDate && (
                                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                                            {calendarInsights.highestDayDate.toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Active Day Average */}
                            <div className="bg-gray-50/80 dark:bg-surface-dark3 border border-gray-200/60 dark:border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {t('active_day_avg') || 'Μ.Ο. Ενεργών Ημερών'}
                                </span>
                                <div className="mt-2 flex flex-col">
                                    <span className="text-base sm:text-lg font-black text-cyan-500">
                                        <Amount value={calendarInsights.activeDayAverage} />
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                                        {t('spent') || 'έξοδα'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Category Drill-Down: Absolute Highest Z-Index (z-[99999]) Body Portal ── */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedCategory && (
                        <div
                            role="dialog"
                            aria-modal="true"
                            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
                        >
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setSelectedCategory(null)}
                            />

                            {/* Modal Card */}
                            <div
                                className="relative z-10 w-full max-w-lg bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-pop"
                            >
                                {/* Header */}
                                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <CategoryIcon category={selectedCategory} type="expense" size={26} />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white capitalize truncate">
                                                {getCategoryTranslation(selectedCategory, t)}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {drillDownTransactions.length} {t('stats_transactions') || 'συναλλαγές'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right font-black text-lg sm:text-xl text-gray-900 dark:text-white">
                                            <Amount value={drillDownTotal} />
                                        </div>
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Transactions List */}
                                <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-2.5 custom-scrollbar">
                                    {drillDownTransactions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                            <Activity size={36} className="mb-2 opacity-30" />
                                            <p className="text-sm font-semibold">{t('stats_no_records') || 'Δεν βρέθηκαν εγγραφές.'}</p>
                                        </div>
                                    ) : drillDownTransactions.map(tx => {
                                        const splitForCat = (Array.isArray(tx.splits) && tx.splits.length >= 2)
                                            ? tx.splits.filter(s => (s.category || s.category_id)?.toLowerCase() === selectedCategory.toLowerCase())
                                            : null;
                                        const displayAmount = splitForCat && splitForCat.length > 0
                                            ? splitForCat.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
                                            : tx.amount;
                                        const splitNote = splitForCat && splitForCat.length > 0
                                            ? splitForCat.map(s => s.note).filter(Boolean).join(', ')
                                            : tx.note;

                                        return (
                                            <div
                                                key={tx.id}
                                                className="flex justify-between items-center bg-white dark:bg-surface-dark3 p-3.5 rounded-xl border border-gray-200/80 dark:border-white/5"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-white/5 shrink-0">
                                                        <CategoryIcon category={selectedCategory} type="expense" size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs text-gray-900 dark:text-white capitalize truncate">
                                                            {splitNote || getCategoryTranslation(selectedCategory, t)}
                                                        </p>
                                                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 truncate">
                                                            <span>{new Date(tx.date).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            {splitForCat && (
                                                                <span className="truncate">
                                                                    ({t('split_part_of_total')?.replace('{total}', `€${tx.amount.toFixed(2)}`) || `από €${tx.amount.toFixed(2)}`})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="font-black text-rose-500 text-sm shrink-0 ml-3">
                                                    <Amount value={displayAmount} prefix="−" />
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};

export default StatsView;
