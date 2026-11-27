const DEFAULT_TIMEZONE = 'Europe/Athens';

const EVENING_MESSAGES = {
    el: [
        {
            title: 'Ξέχασες τα έξοδα της ημέρας;',
            body: 'Πέρασε 1 λεπτό στο Spendlore για να καταχωρήσεις τυχόν έξοδα που έκανες σήμερα.',
        },
        {
            title: 'Κλείσε τη μέρα σου οργανωμένα',
            body: 'Δεν βρήκαμε έξοδα για σήμερα. Καταχώρησε ό,τι ξόδεψες για να μένει ο προϋπολογισμός σου ακριβής.',
        },
        {
            title: 'Βραδινός έλεγχος εξόδων',
            body: 'Έχεις περάσει τα σημερινά σου έξοδα; Μία γρήγορη καταχώρηση κρατά τα στατιστικά σου ενημερωμένα.',
        },
        {
            title: 'Μικρή υπενθύμιση από το Spendlore',
            body: 'Μήπως έκανες κάποια αγορά σήμερα που δεν έχει καταγραφεί ακόμα;',
        },
    ],
    en: [
        {
            title: "Forgot today's expenses?",
            body: 'Take a quick moment in Spendlore to log any purchases you made today.',
        },
        {
            title: 'Wrap up your day cleanly',
            body: 'No expenses logged yet today. Add what you spent to keep your budget accurate.',
        },
        {
            title: 'Evening expense check-in',
            body: 'Did you log today’s spending? A quick entry keeps your insights up to date.',
        },
        {
            title: 'Quick Spendlore reminder',
            body: 'Any purchases today that still need to be recorded?',
        },
    ],
};

const MIDDAY_MESSAGES = {
    el: [
        {
            title: 'Πέρασες τον καφέ ή τα ψώνια σου;',
            body: 'Καταχώρησε τώρα τα πρωινά σου έξοδα πριν τα ξεχάσεις.',
        },
        {
            title: 'Μεσημεριανό check-in εξόδων',
            body: 'Ένα γρήγορο άγγιγμα αρκεί για να περάσεις καφέ, μετακινήσεις ή μικρές αγορές.',
        },
        {
            title: 'Κράτα ρυθμό στα έξοδά σου',
            body: 'Κατέγραψε ό,τι ξόδεψες μέχρι τώρα μέσα στη μέρα για καθαρή εικόνα υπολοίπου.',
        },
        {
            title: 'Γρήγορη καταγραφή ημέρας',
            body: 'Βενζίνη, καφές ή σούπερ μάρκετ; Πέρασε τα έξοδά σου σε δευτερόλεπτα.',
        },
    ],
    en: [
        {
            title: 'Logged your coffee or errands?',
            body: 'Record your morning expenses now while they are still fresh.',
        },
        {
            title: 'Midday expense check-in',
            body: 'One quick entry keeps your coffee, commute, and daily purchases organized.',
        },
        {
            title: 'Stay on top of today’s spending',
            body: 'Log what you have spent so far today to keep your daily balance clear.',
        },
        {
            title: 'Quick daily log',
            body: 'Fuel, groceries, or coffee? Add your expenses in seconds.',
        },
    ],
};

function hashSeed(input) {
    let hash = 0;
    const str = String(input || '');
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function getIsoWeekKey(year, month, day) {
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
    return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function normalizeTimeZone(timeZone) {
    if (!timeZone || typeof timeZone !== 'string') return DEFAULT_TIMEZONE;
    try {
        Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
        return timeZone;
    } catch (_) {
        return DEFAULT_TIMEZONE;
    }
}

export function getLocalDateParts(now = new Date(), timeZone = DEFAULT_TIMEZONE) {
    const safeTz = normalizeTimeZone(timeZone);
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: safeTz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23',
        weekday: 'short',
    });

    const parts = formatter.formatToParts(now);
    const map = {};
    for (const part of parts) {
        if (part.type !== 'literal') {
            map[part.type] = part.value;
        }
    }

    const year = Number(map.year);
    const month = Number(map.month);
    const day = Number(map.day);
    const rawHour = Number(map.hour);
    const hour = rawHour === 24 ? 0 : rawHour;
    const dateKey = `${map.year}-${map.month}-${map.day}`;

    return {
        timeZone: safeTz,
        dateKey,
        year,
        month,
        day,
        hour,
        weekday: map.weekday,
        isoWeekKey: getIsoWeekKey(year, month, day),
    };
}

export function getLocalDateKeyForTimestamp(timestamp, timeZone = DEFAULT_TIMEZONE) {
    if (!timestamp) return null;
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return getLocalDateParts(date, timeZone).dateKey;
}

export function getEveningReminderMessage(language = 'el', dateKey = '') {
    const lang = language === 'en' ? 'en' : 'el';
    const pool = EVENING_MESSAGES[lang];
    const picked = pool[hashSeed(`evening:${dateKey}`) % pool.length];
    return {
        ...picked,
        url: '/?action=add-expense',
        action: 'add-expense',
        tag: `spendlore-evening-${dateKey || 'daily'}`,
        type: 'evening_reminder',
    };
}

export function getMiddayNudgeMessage(language = 'el', dateKey = '') {
    const lang = language === 'en' ? 'en' : 'el';
    const pool = MIDDAY_MESSAGES[lang];
    const picked = pool[hashSeed(`midday:${dateKey}`) % pool.length];
    return {
        ...picked,
        url: '/?action=add-expense',
        action: 'add-expense',
        tag: `spendlore-midday-${dateKey || 'daily'}`,
        type: 'midday_nudge',
    };
}

export function getWeeklySummaryMessage(language = 'el', { count = 0, totalAmount = 0, currency = '€' } = {}) {
    const lang = language === 'en' ? 'en' : 'el';
    const safeCount = Math.max(0, Number(count) || 0);
    const formattedTotal = (Number(totalAmount) || 0).toFixed(2);

    if (lang === 'en') {
        const body = safeCount === 0
            ? 'No expenses recorded in the last 7 days. Open Spendlore to review or log your week.'
            : `You logged ${safeCount} ${safeCount === 1 ? 'expense' : 'expenses'} totaling ${formattedTotal}${currency} over the last 7 days.`;
        return {
            title: 'Weekly Expense Summary',
            body,
            url: '/?tab=stats',
            action: 'open-stats',
            tag: 'spendlore-weekly-summary',
            type: 'weekly_summary',
        };
    }

    const body = safeCount === 0
        ? 'Δεν καταγράφηκαν έξοδα τις τελευταίες 7 ημέρες. Άνοιξε το Spendlore για ανασκόπηση.'
        : `Κατέγραψες ${safeCount} ${safeCount === 1 ? 'έξοδο' : 'έξοδα'} συνολικής αξίας ${formattedTotal}${currency} τις τελευταίες 7 ημέρες.`;
    return {
        title: 'Εβδομαδιαία Σύνοψη Εξόδων',
        body,
        url: '/?tab=stats',
        action: 'open-stats',
        tag: 'spendlore-weekly-summary',
        type: 'weekly_summary',
    };
}
