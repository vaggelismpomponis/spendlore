import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = '••••••••', 
    required = false, 
    error = '', 
    icon: Icon,
    iconClassName = '',
    iconSize = 17,
    className = '',
    inputClassName = '',
    labelClassName = '',
    alignLabel = 'left',
    autoComplete = 'current-password',
    id,
    name,
    ...rest
}) => {
    const [show, setShow] = useState(false);
    const inputId = id || (label ? `password-input-${label.toLowerCase().replace(/\s+/g, '-')}` : 'password-input');
    
    const hasCustomBg = inputClassName.includes('bg-');
    const hasCustomBorder = inputClassName.includes('border-') || inputClassName.includes('border ');
    const hasCustomFocus = inputClassName.includes('focus:');
    const hasCustomRounded = inputClassName.includes('rounded-');
    const hasCustomPadding = inputClassName.includes('py-') || inputClassName.includes('pl-') || inputClassName.includes('p-');

    const inputClasses = [
        'w-full text-sm font-medium transition-all duration-200',
        hasCustomPadding ? '' : `${Icon ? 'pl-11' : 'px-3.5'} py-2.5`,
        'pr-11',
        hasCustomBg ? '' : 'bg-white dark:bg-surface-dark3',
        hasCustomBorder ? '' : 'border border-gray-200 dark:border-white/10',
        hasCustomRounded ? '' : 'rounded-xl',
        inputClassName.includes('text-') ? '' : 'text-gray-900 dark:text-white',
        inputClassName.includes('placeholder:') ? '' : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        error 
            ? 'focus:outline-none focus:ring-2 focus:ring-rose-500/40 border-rose-300 dark:border-rose-500/30'
            : hasCustomFocus 
                ? '' 
                : 'focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white focus:border-gray-950 dark:focus:border-white',
        inputClassName
    ].filter(Boolean).join(' ');

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label 
                    htmlFor={inputId} 
                    className={`block ${alignLabel === 'center' ? 'text-center' : 'text-left'} text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest w-full ${labelClassName}`}
                >
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors pointer-events-none ${iconClassName || 'group-focus-within:text-violet-400'}`} size={iconSize} />
                )}
                <input
                    id={inputId}
                    name={name || inputId}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={inputClasses}
                    required={required}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 
                               text-gray-400 hover:text-gray-600 dark:hover:text-white 
                               active:scale-90 transition-all duration-200"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && (
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default PasswordInput;
