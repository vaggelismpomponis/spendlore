import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '../supabase';

export const BudgetNotificationManager = {
    async requestPermissions() {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            return display === 'granted';
        } catch (error) {
            console.error("Error requesting notification permissions:", error);
            return false;
        }
    },

    async checkTransactionAgainstBudgets(userId, transaction, allTransactions) {
        if (!userId || !transaction || transaction.type !== 'expense' || !transaction.category) {
            return;
        }

        try {
            const { data: budgets, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            const targetBudget = (budgets || []).find(b =>
                b.category.toLowerCase() === transaction.category.toLowerCase()
            );

            if (!targetBudget || !targetBudget.notification_threshold) {
                return;
            }

            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            if (targetBudget.last_notified_month === currentMonthStr) {
                return;
            }

            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const spentSoFar = allTransactions
                .filter(t => {
                    if (t.type !== 'expense') return false;
                    const tDate = new Date(t.date);
                    const isSameMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                    const isCategoryMatch = t.category?.toLowerCase() === targetBudget.category.toLowerCase();
                    return isSameMonth && isCategoryMatch && t.id !== transaction.id;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const newTotalSpent = spentSoFar + transaction.amount;
            const percentageSpent = (newTotalSpent / targetBudget.amount) * 100;

            if (percentageSpent >= targetBudget.notification_threshold) {
                const currency = typeof localStorage !== 'undefined' ? (localStorage.getItem('currency') || '€') : '€';
                const language = typeof localStorage !== 'undefined' ? (localStorage.getItem('language') || 'el') : 'el';
                await this.sendBudgetAlert(
                    targetBudget.category,
                    percentageSpent.toFixed(0),
                    targetBudget.amount,
                    newTotalSpent.toFixed(2),
                    currency,
                    language
                );

                await supabase.from('budgets')
                    .update({ last_notified_month: currentMonthStr })
                    .eq('id', targetBudget.id);
            }

        } catch (error) {
            console.error("Error checking budget thresholds:", error);
        }
    },

    async sendBudgetAlert(category, percentage, totalAmount, spentAmount = null, currency = '€', language = 'el') {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) return;

            const isExceeded = Number(percentage) >= 100;
            const isGreek = language === 'el' || (!language && typeof navigator !== 'undefined' && navigator.language?.startsWith('el'));

            const title = isGreek
                ? (isExceeded ? 'Υπέρβαση Προϋπολογισμού' : 'Ειδοποίηση Προϋπολογισμού')
                : (isExceeded ? 'Budget Limit Exceeded' : 'Budget Alert');

            let body;
            if (spentAmount != null) {
                body = isGreek
                    ? (isExceeded
                        ? `Προϋπολογισμός «${category}»: Υπέρβαση στο ${percentage}% του μηνιαίου σας ορίου (${spentAmount}${currency} από ${totalAmount}${currency}).`
                        : `Προϋπολογισμός «${category}»: Έχετε φτάσει στο ${percentage}% του μηνιαίου σας ορίου (${spentAmount}${currency} από ${totalAmount}${currency}).`)
                    : (isExceeded
                        ? `Budget "${category}": Limit exceeded at ${percentage}% of your monthly budget (${spentAmount}${currency} of ${totalAmount}${currency}).`
                        : `Budget "${category}": You have reached ${percentage}% of your monthly limit (${spentAmount}${currency} of ${totalAmount}${currency}).`);
            } else {
                body = isGreek
                    ? (isExceeded
                        ? `Προϋπολογισμός «${category}»: Υπέρβαση στο ${percentage}% του μηνιαίου σας προϋπολογισμού (${totalAmount}${currency}).`
                        : `Προϋπολογισμός «${category}»: Έχετε φτάσει στο ${percentage}% του μηνιαίου σας προϋπολογισμού (${totalAmount}${currency}).`)
                    : (isExceeded
                        ? `Budget "${category}": Limit exceeded at ${percentage}% of your monthly budget (${totalAmount}${currency}).`
                        : `Budget "${category}": You have reached ${percentage}% of your monthly budget (${totalAmount}${currency}).`);
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 1000) },
                        smallIcon: 'ic_stat_spendlore',
                        largeIcon: 'ic_spendlore_logo',
                        iconColor: '#7C3AED',
                        sound: null,
                        attachments: null,
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
        } catch (error) {
            console.error("Failed to send local notification:", error);
        }
    }
};
