import React, { useState, useRef, useEffect } from 'react';
import {
    Settings, Box, LogOut, User
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { APP_VERSION, APP_BUILD_NUMBER } from '../utils/version';

/**
 * MessageCircleQuestion — Lucide-style question bubble icon for tech support / help
 */
const MessageCircleQuestion = ({ size = 15, className = '', strokeWidth = 2, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
    </svg>
);

/**
 * ProfileDropdownMenu — Sure-Style Profile Avatar Dropdown Menu
 * Directly inspired by Sure's user profile dropdown with quick options & version info.
 */
export default function ProfileDropdownMenu({
    user,
    displayName,
    photoURL,
    onSignOut,
    setActiveTab,
    onOpenWhatsNew,
    align = 'left', // 'left' | 'right'
    direction = 'down', // 'down' | 'up'
    trigger,
    className = '',
}) {
    const { language = 'el' } = useSettings();
    const isEL = language === 'el';
    const [isOpen, setIsOpen] = useState(false);
    const [imgRetries, setImgRetries] = useState(0);
    const menuRef = useRef(null);

    const effectiveName = displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || (isEL ? 'Χρήστης' : 'User');
    const effectiveEmail = user?.email || '';
    const effectivePhoto = photoURL || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;

    const initials = effectiveName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';

    // Close on click outside or Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('pointerdown', handleDown);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('pointerdown', handleDown);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    const handleNavigate = (tab) => {
        setIsOpen(false);
        setActiveTab?.(tab);
    };

    const handleChangelog = () => {
        setIsOpen(false);
        onOpenWhatsNew?.();
    };

    const handleLogout = () => {
        setIsOpen(false);
        onSignOut?.();
    };

    return (
        <div className={`relative flex-shrink-0 ${className}`} ref={menuRef}>
            {/* Custom or Default Avatar Trigger Button */}
            {trigger ? (
                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                    {typeof trigger === 'function'
                        ? trigger({ isOpen, setIsOpen, effectivePhoto, initials, effectiveName })
                        : trigger}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-label="User Profile Menu"
                    className="w-10 h-10 rounded-full flex-shrink-0
                               bg-gray-100 dark:bg-white/[0.08]
                               flex items-center justify-center
                               text-gray-500 dark:text-gray-400
                               hover:scale-105 active:scale-95
                               transition-all duration-200 overflow-hidden
                               border border-gray-200 dark:border-white/10
                               cursor-pointer select-none"
                >
                    {effectivePhoto && imgRetries < 3 ? (
                        <img
                            src={imgRetries > 0 ? `${effectivePhoto}${effectivePhoto.includes('?') ? '&' : '?'}retry=${imgRetries}` : effectivePhoto}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                            onError={() => setImgRetries(prev => prev + 1)}
                        />
                    ) : (
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{initials}</span>
                    )}
                </button>
            )}

            {/* Dropdown Menu Popover */}
            {isOpen && (
                <div
                    role="menu"
                    className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
                        direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } w-[calc(100vw-2rem)] max-w-72 sm:w-72
                    bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10
                    rounded-2xl shadow-2xl p-2.5 z-[100] animate-fade-in select-none`}
                >
                    {/* User Identity Card */}
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-surface-dark3 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-white/10 font-bold text-xs text-gray-700 dark:text-gray-200">
                            {effectivePhoto && imgRetries < 3 ? (
                                <img
                                    src={effectivePhoto}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {effectiveName}
                            </p>
                            {effectiveEmail && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium">
                                    {effectiveEmail}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Version Row (Sure-style: Version: [v1.1.58] (70)) */}
                    <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{isEL ? 'Έκδοση' : 'Version'}:</span>
                        <span className="px-1.5 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-bold">
                            v{APP_VERSION}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                            ({APP_BUILD_NUMBER})
                        </span>
                    </div>

                    <div className="my-1 border-t border-gray-100 dark:border-white/10" />

                    {/* Quick Menu Options */}
                    <div className="space-y-0.5">
                        {/* 1. Settings */}
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleNavigate('profile')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06]
                                       hover:text-gray-950 dark:hover:text-white transition-colors text-left"
                        >
                            <Settings size={15} className="text-gray-400 dark:text-gray-400 shrink-0" />
                            <span>{isEL ? 'Ρυθμίσεις' : 'Settings'}</span>
                        </button>

                        {/* 2. Changelog / What's New */}
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleChangelog}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06]
                                       hover:text-gray-950 dark:hover:text-white transition-colors text-left"
                        >
                            <Box size={15} className="text-gray-400 dark:text-gray-400 shrink-0" />
                            <span>{isEL ? 'Τι νέο υπάρχει' : 'Changelog'}</span>
                        </button>

                        {/* 3. Contact / Support */}
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleNavigate('support')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06]
                                       hover:text-gray-950 dark:hover:text-white transition-colors text-left"
                        >
                            <MessageCircleQuestion size={15} className="text-gray-400 dark:text-gray-400 shrink-0" />
                            <span>{isEL ? 'Τεχνική Υποστήριξη' : 'Contact'}</span>
                        </button>
                    </div>

                    <div className="my-1.5 border-t border-gray-100 dark:border-white/10" />

                    {/* Log out */}
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold
                                   text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30
                                   transition-colors text-left"
                    >
                        <LogOut size={15} className="text-rose-500 shrink-0" />
                        <span>{isEL ? 'Αποσύνδεση' : 'Log out'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
