import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function CustomSelect({
    id,
    value,
    onChange,
    options = [],
    placeholder = '— Select —',
    disabled = false,
    size = 'md',
    searchable = false,
    className = '',
    menuClassName = '',
    renderOption,
    renderSelected,
    'data-testid': testId,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef(null);

    // Normalize options (support strings or objects with value/label/icon)
    const normalizedOptions = useMemo(() => {
        return options
            .filter(opt => opt !== null && opt !== undefined && (typeof opt === 'string' ? opt.trim() !== '' : opt.value !== ''))
            .map(opt => {
                if (typeof opt === 'object') {
                    return { value: opt.value, label: opt.label ?? opt.value, icon: opt.icon, disabled: !!opt.disabled };
                }
                return { value: opt, label: String(opt), icon: null, disabled: false };
            });
    }, [options]);

    const selectedOption = useMemo(() => {
        return normalizedOptions.find(opt => String(opt.value) === String(value));
    }, [normalizedOptions, value]);

    // Outside click & Escape listener
    useEffect(() => {
        if (!isOpen) return;
        const handlePointerDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Position check for viewport bottom overflow
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUpwards(spaceBelow < 220 && rect.top > spaceBelow);
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return normalizedOptions;
        const q = search.toLowerCase();
        return normalizedOptions.filter(opt => opt.label.toLowerCase().includes(q));
    }, [normalizedOptions, search]);

    const handleSelect = (opt) => {
        if (opt.disabled) return;
        setIsOpen(false);
        setSearch('');
        if (onChange) {
            onChange(opt.value);
        }
    };

    const sizeClasses = size === 'sm'
        ? 'py-1.5 px-2.5 text-xs'
        : 'py-2.5 px-3.5 text-sm';

    return (
        <div className={`relative w-full ${className}`} ref={containerRef} id={id}>
            <button
                type="button"
                data-testid={testId}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`w-full ${sizeClasses} bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-left font-medium text-gray-900 dark:text-white flex items-center justify-between gap-2 focus:outline-none transition-all cursor-pointer ${isOpen ? 'ring-1 ring-gray-950 dark:ring-white border-transparent' : 'focus:ring-1 focus:ring-gray-950 dark:focus:ring-white'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-2.5 truncate">
                    {selectedOption ? (
                        renderSelected ? renderSelected(selectedOption) : (
                            <>
                                {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                                <span className="truncate">{selectedOption.label}</span>
                            </>
                        )
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 truncate">{placeholder}</span>
                    )}
                </div>
                <ChevronDown
                    size={size === 'sm' ? 13 : 15}
                    className={`text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gray-700 dark:text-gray-300' : ''}`}
                />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className={`absolute left-0 right-0 ${openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                        } z-[150] bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 max-h-56 overflow-y-auto ${menuClassName}`}
                >
                    {searchable && normalizedOptions.length > 5 && (
                        <div className="p-1 pb-1.5 mb-1 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
                            <Search size={13} className="text-gray-400 shrink-0 ml-1" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Αναζήτηση..."
                                autoFocus
                                className="w-full bg-transparent text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                            />
                        </div>
                    )}
                    {filteredOptions.length === 0 ? (
                        <div className="py-3 px-3 text-center text-xs text-gray-400">
                            Δεν βρέθηκαν αποτελέσματα
                        </div>
                    ) : (
                        filteredOptions.map(opt => {
                            const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    disabled={opt.disabled}
                                    onClick={() => handleSelect(opt)}
                                    className={`w-full px-2.5 py-2 rounded-lg text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between gap-2 ${isSelected
                                            ? 'bg-gray-100 dark:bg-white/10 text-gray-950 dark:text-white font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                        } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        {renderOption ? renderOption(opt, isSelected) : (
                                            <>
                                                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                                <span className="truncate">{opt.label}</span>
                                            </>
                                        )}
                                    </div>
                                    {isSelected && <Check size={14} className="text-gray-950 dark:text-white shrink-0" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

