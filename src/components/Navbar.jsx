import { useEffect, useState } from 'react';
import { Home, BarChart3, History, Settings, ShieldCheck } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const NAV_ITEMS = [
    { id: 'home', Icon: Home, labelKey: 'nav_home' },
    { id: 'stats', Icon: BarChart3, labelKey: 'nav_stats' },
    { id: 'history', Icon: History, labelKey: 'nav_history' },
    { id: 'profile', Icon: Settings, labelKey: 'settings' },
];

/** Watches the `dark` class on <html> and returns a boolean. */
function useDarkMode() {
    const [isDark, setIsDark] = useState(
        () => document.documentElement.classList.contains('dark')
    );
    useEffect(() => {
        const obs = new MutationObserver(() =>
            setIsDark(document.documentElement.classList.contains('dark'))
        );
        obs.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return isDark;
}

const Navbar = ({ activeTab, setActiveTab }) => {
    const { t: translate } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();
    const isDark = useDarkMode();

    const handleNavClick = (id) => {
        if (id === 'stats' && !isPro) {
            openUpgradeModal('stats');
            return;
        }
        if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        setActiveTab(id);
    };

    const renderItem = ({ id, Icon, labelKey }) => {
        const active = activeTab === id;
        const isProLocked = id === 'stats' && !isPro;
        const label = translate(labelKey);

        const iconActiveClass = isDark ? 'text-white' : 'text-gray-950';
        const iconInactiveClass = isDark ? 'text-gray-400' : 'text-gray-400';
        const labelActiveClass = isDark ? 'text-white font-bold' : 'text-gray-950 font-bold';
        const labelInactiveClass = isDark ? 'text-gray-400 font-medium' : 'text-gray-400 font-medium';

        return (
            <button
                key={id}
                id={`nav-${id}`}
                onClick={(e) => {
                    e.currentTarget.blur();
                    handleNavClick(id);
                }}
                onPointerDown={(e) => {
                    e.currentTarget.blur();
                }}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center flex-1 h-[48px] rounded-full relative group outline-none focus:outline-none focus-visible:outline-none active:outline-none focus:ring-0 active:ring-0 select-none border-none transition-transform active:scale-95"
                style={{
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                }}
            >
                <div
                    className="relative flex items-center justify-center p-0.5 outline-none focus:outline-none select-none border-none"
                    style={{ outline: 'none', border: 'none' }}
                >
                    <Icon
                        size={20}
                        strokeWidth={active ? 2.5 : 1.8}
                        className={`${active ? iconActiveClass : iconInactiveClass} transition-colors duration-200 outline-none focus:outline-none select-none`}
                        style={{ outline: 'none', border: 'none' }}
                    />
                    {isProLocked && (
                        <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm pointer-events-none">
                            <ShieldCheck size={8} className="text-white shrink-0" strokeWidth={2.5} fill="currentColor" />
                        </span>
                    )}
                </div>

                <span className={`text-[10px] tracking-tight leading-tight capitalize transition-colors duration-200 select-none ${
                    active ? labelActiveClass : labelInactiveClass
                }`}>
                    {label}
                </span>

                {/* Revolut micro-pill active indicator */}
                <div
                    className={`w-3.5 h-[2px] rounded-full mt-0.5 transition-all duration-300 ${
                        active ? (isDark ? 'bg-white' : 'bg-gray-950') : 'bg-transparent'
                    }`}
                />
            </button>
        );
    };

    const pillStyle = isDark
        ? {
              background: 'rgba(18, 18, 18, 0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
          }
        : {
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
          };

    return (
        <nav
            aria-label="Main navigation"
            className="w-full pointer-events-none"
        >
            <div
                className="w-full h-[58px] rounded-full pointer-events-auto flex items-center justify-around px-2 relative transition-all duration-300"
                style={pillStyle}
            >
                {NAV_ITEMS.map(renderItem)}
            </div>
        </nav>
    );
};

export default Navbar;
