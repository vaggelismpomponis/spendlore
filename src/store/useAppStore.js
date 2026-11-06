import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { calculateStb, getRemainingDaysInMonth, getDaysInMonth } from '../features/StbEngine';
import { scheduleRegretCheckin } from '../services/NotificationService';

// Custom IndexedDB storage engine for Zustand using idb-keyval
const idbStorage = {
    getItem: async (name) => {
        return (await get(name)) || null;
    },
    setItem: async (name, value) => {
        await set(name, value);
    },
    removeItem: async (name) => {
        await del(name);
    }
};

export const useAppStore = create(
    persist(
        (set, getStore) => ({
            transactions: [],
            budgets: [],
            goals: [],
            userSettings: {
                income: 0,
                fixedObligations: 0,
                targetSavings: 0,
            },

            // Onboarding tour
            tourSeen: false,
            setTourSeen: (val) => set({ tourSeen: val }),

            // Tracks async IndexedDB rehydration — always false until storage is read
            hasHydrated: false,
            setHasHydrated: (val) => set({ hasHydrated: val }),

            // Actions for syncing state from Supabase and optimistic updates
            setTransactions: (updater) => set((state) => ({
                transactions: typeof updater === 'function' ? updater(state.transactions) : updater
            })),
            setBudgets: (updater) => set((state) => ({
                budgets: typeof updater === 'function' ? updater(state.budgets) : updater
            })),
            setGoals: (updater) => set((state) => ({
                goals: typeof updater === 'function' ? updater(state.goals) : updater
            })),
            setUserSettings: (settings) => set((state) => ({
                userSettings: { ...state.userSettings, ...settings }
            })),

            // Optimistic UI updates
            addTransaction: (tx) => {
                scheduleRegretCheckin(tx);
                set((state) => ({
                    transactions: [tx, ...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
                }));
            },
            removeTransaction: (id) => set((state) => ({
                transactions: state.transactions.filter(tx => tx.id !== id)
            })),
            updateTransaction: (updatedTx) => set((state) => ({
                transactions: state.transactions.map(tx => tx.id === updatedTx.id ? { ...tx, ...updatedTx } : tx)
            })),

            // Derived Safe-to-Burn calculation
            getSafeToBurn: (options = {}) => {
                const state = getStore();
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const currentDay = now.getDate();

                const txList = options.transactions || (state.transactions?.length > 0 ? state.transactions : []);

                // Calculate current month's actual logged income
                const currentMonthIncome = txList
                    .filter(tx => {
                        if (tx.type !== 'income') return false;
                        const d = new Date(tx.date);
                        return d.getFullYear() === year && d.getMonth() === month;
                    })
                    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

                // Calculate overall positive balance fallback
                const overallBalance = txList.reduce((acc, t) => t.type === 'income' ? acc + (Number(t.amount) || 0) : acc - (Number(t.amount) || 0), 0);

                // Determine effective monthly income:
                // 1. Explicit options.income (e.g. testing)
                // 2. options.monthIncome (passed from views)
                // 3. currentMonthIncome (sum of income transactions in current month)
                // 4. state.userSettings?.income (user's monthly salary setting if configured)
                // 5. fallback to current balance if positive and no income logged yet
                const income = options.income ?? (
                    (options.monthIncome > 0 ? options.monthIncome : null) ??
                    (currentMonthIncome > 0 ? currentMonthIncome : null) ??
                    (state.userSettings?.income > 0 ? state.userSettings.income : null) ??
                    (options.balance > 0 ? options.balance : null) ??
                    (overallBalance > 0 ? overallBalance : 0)
                );
                const fixed = options.fixed ?? (state.userSettings?.fixedObligations || 0);
                const savings = options.savings ?? (state.userSettings?.targetSavings || 0);

                const currentMonthExpenses = txList.filter(tx => {
                    if (tx.type !== 'expense') return false;
                    const d = new Date(tx.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                });

                const pastDailySpends = [];
                for (let day = 1; day < currentDay; day++) {
                    const dailyTotal = currentMonthExpenses
                        .filter(tx => new Date(tx.date).getDate() === day)
                        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
                    pastDailySpends.push(dailyTotal);
                }

                const todaySpend = currentMonthExpenses
                    .filter(tx => new Date(tx.date).getDate() === currentDay)
                    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

                const stbResult = calculateStb({
                    income,
                    fixed,
                    savings,
                    pastDailySpends,
                    todaySpend,
                    daysInMonth: getDaysInMonth(now)
                });

                // Safety guard: Safe-to-Burn can never exceed actual available liquid balance
                const effectiveBalance = options.balance !== undefined ? options.balance : overallBalance;
                if (effectiveBalance !== undefined && effectiveBalance !== null) {
                    if (effectiveBalance <= 0) {
                        stbResult.stb = 0;
                    } else if (stbResult.stb > effectiveBalance) {
                        stbResult.stb = Math.max(0, Math.round(effectiveBalance));
                    }
                }

                return stbResult;
            }
        }),
        {
            name: 'spendwise-store', // unique storage key
            storage: createJSONStorage(() => idbStorage),
            // hasHydrated is runtime-only — never persist it
            partialize: (state) => {
                const { hasHydrated, setHasHydrated, ...persisted } = state;
                return persisted;
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
