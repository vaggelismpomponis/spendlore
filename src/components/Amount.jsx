import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Reusable component to display financial amounts.
 * Blurs the value when Privacy Mode is enabled.
 */
const Amount = ({ 
    value, 
    showCurrency = true, 
    className = "", 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2,
    style = "decimal", // "decimal" or "currency"
    prefix = "",
    showSign = true
}) => {
    const { privacyMode, currency, language } = useSettings();

    const locale = language === 'el' ? 'el-GR' : 'en-US';
    
    let formattedText = '';
    try {
        const displayValue = showSign ? value : Math.abs(value);
        const formatted = new Intl.NumberFormat(locale, {
            style: style,
            currency: style === 'currency' ? (currency === '€' ? 'EUR' : currency) : undefined,
            minimumFractionDigits,
            maximumFractionDigits,
        }).format(displayValue);

        formattedText = `${prefix}${formatted}${style === 'decimal' && showCurrency ? ` ${currency}` : ''}`;
    } catch (e) {
        // Fallback if Intl fails
        const val = showSign ? value : Math.abs(value);
        formattedText = `${prefix}${val.toFixed(2)}${showCurrency ? ` ${currency}` : ''}`;
    }

    const privacyClasses = privacyMode ? 'filter blur-[6px] select-none pointer-events-none transition-all duration-200' : 'transition-all duration-200';

    return (
        <span 
            className={`inline-block ${privacyClasses} ${className}`.trim()}
            data-privacy={privacyMode ? "blurred" : "visible"}
        >
            {formattedText}
        </span>
    );
};

export default Amount;









