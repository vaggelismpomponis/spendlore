/**
 * Merchant Rules & Aliasing Engine
 * 
 * Maps merchant names, receipt text, or notification keywords
 * directly to target categories with accent-insensitive matching.
 */

export const normalizeMerchantText = (str = '') => {
    if (!str) return '';
    return str
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

/**
 * Default starter templates for Greek and international merchants
 */
export const DEFAULT_STARTER_RULES = [
    {
        id: 'starter_supermarket',
        merchantPattern: 'Σκλαβενίτης, Sklavenitis, Lidl, AB Βασιλόπουλος, AB Vassilopoulos, Μασούτης, Masoutis, Market In, Γαλαξίας, Galaxias, Bazaar, Carrefour',
        category: 'Σούπερ Μάρκετ',
        type: 'expense'
    },
    {
        id: 'starter_food',
        merchantPattern: 'Wolt, e-food, efood, Goody, McDonald, KFC, Pizza, Domino, Burger, Grill, Tavern, Delivery',
        category: 'Φαγητό',
        type: 'expense'
    },
    {
        id: 'starter_coffee',
        merchantPattern: 'Starbucks, Mikel, Coffee Island, Coffee Lab, Gregory, Everest, Καφές, Espresso',
        category: 'Καφές',
        type: 'expense'
    },
    {
        id: 'starter_fuel',
        merchantPattern: 'Shell, BP, EKO, Avin, Revoil, Elin, ΕΛΙΝ, Petrol, Βενζίνη, Attiki Odos, Διόδια',
        category: 'Βενζίνη',
        type: 'expense'
    },
    {
        id: 'starter_bills',
        merchantPattern: 'ΔΕΗ, DEI, Cosmote, Vodafone, Nova, ΕΥΔΑΠ, EYDAP, ΔΕΔΔΗΕ, PPC, Taxisnet, EFKA, ΕΦΚΑ',
        category: 'Λογαριασμοί',
        type: 'expense'
    },
    {
        id: 'starter_entertainment',
        merchantPattern: 'Netflix, Spotify, YouTube Premium, Disney, Cinema, Village, Odeon, Steam, PlayStation',
        category: 'Διασκέδαση',
        type: 'expense'
    },
    {
        id: 'starter_health',
        merchantPattern: 'Φαρμακείο, Farmakeio, Pharmacy, Γιατρός, Clinic, Νοσοκομείο',
        category: 'Υγεία',
        type: 'expense'
    }
];

/**
 * Finds the first matching user merchant rule for a given text
 * 
 * @param {string} text - Merchant name, raw receipt text, or notification payload
 * @param {Array} rules - Array of user MerchantRule objects
 * @param {string} type - 'expense' | 'income'
 * @returns {Object|null} { matched: true, rule, category } or null
 */
export const matchMerchantRule = (text = '', rules = [], type = 'expense') => {
    if (!text || !Array.isArray(rules) || rules.length === 0) {
        return null;
    }

    const normalizedTarget = normalizeMerchantText(text);
    if (!normalizedTarget) return null;

    for (const rule of rules) {
        if (!rule || !rule.merchantPattern || !rule.category) continue;
        if (rule.type && rule.type !== type) continue;

        // Split patterns by comma or pipe
        const patterns = rule.merchantPattern
            .split(/[,|]/)
            .map(p => normalizeMerchantText(p))
            .filter(p => p.length > 0);

        for (const pattern of patterns) {
            if (rule.exactMatch) {
                const stem = (pattern.endsWith('ς') && pattern.length > 3) ? pattern.slice(0, -1) : null;
                if (normalizedTarget === pattern || (stem && normalizedTarget === stem)) {
                    return {
                        matched: true,
                        rule,
                        matchedPattern: pattern,
                        category: rule.category
                    };
                }
            } else {
                // Check full pattern or Greek stem without trailing 'ς' (e.g. Σκλαβενίτης -> Σκλαβενίτη)
                const stem = (pattern.endsWith('ς') && pattern.length > 3) ? pattern.slice(0, -1) : null;
                if (normalizedTarget.includes(pattern) || (stem && normalizedTarget.includes(stem))) {
                    return {
                        matched: true,
                        rule,
                        matchedPattern: pattern,
                        category: rule.category
                    };
                }
            }
        }
    }

    return null;
};

/**
 * Determines transaction category with priority given to user-defined merchant rules
 * 
 * @param {string} text - Merchant name or text to evaluate
 * @param {string} fallbackCategory - Category to return if no rule matches
 * @param {Array} rules - Array of user rules
 * @param {string} type - 'expense' | 'income'
 * @returns {string} Effective category name
 */
export const applyMerchantRules = (text = '', fallbackCategory = 'Άλλο', rules = [], type = 'expense') => {
    const match = matchMerchantRule(text, rules, type);
    return match ? match.category : fallbackCategory;
};
