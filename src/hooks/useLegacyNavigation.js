import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';

export function useLegacyNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const activeTab = useMemo(() => {
        const path = location.pathname;
        const search = location.search;
        const params = new URLSearchParams(search);
        if (params.get('tab') === 'privacy') return 'privacy';
        if (params.get('tab') === 'terms') return 'terms';
        if (path === '/' || path === '/home') return 'home';
        if (path.startsWith('/privacy')) return 'privacy';
        if (path.startsWith('/terms')) return 'terms';
        if (path.startsWith('/settings/account')) return 'account';
        if (path.startsWith('/settings/general')) return 'general';
        if (path.startsWith('/settings/categories')) return 'categories';
        if (path.startsWith('/settings/security')) return 'security';
        if (path.startsWith('/settings/privacy')) return 'privacy';
        if (path.startsWith('/settings/terms')) return 'terms';
        if (path.startsWith('/settings/backup')) return 'backup';
        if (path.startsWith('/settings/support')) return 'support';
        if (path.startsWith('/settings/feedback')) return 'support';
        if (path.startsWith('/settings/guide')) return 'guide';
        if (path.startsWith('/settings')) return 'profile'; // Profile is settings root
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/stats')) return 'stats';
        if (path.startsWith('/history')) return 'history';
        if (path.startsWith('/recurring')) return 'recurring';
        if (path.startsWith('/goals')) return 'goals';
        if (path.startsWith('/budgets')) return 'budgets';
        if (path.startsWith('/advisor')) return 'advisor';
        if (path.startsWith('/upgrade')) return 'upgrade';
        return 'home';
    }, [location.pathname]);

    const setActiveTab = (tab) => {
        const paths = {
            'home': '/',
            'stats': '/stats',
            'history': '/history',
            'profile': '/settings',
            'account': '/settings/account',
            'general': '/settings/general',
            'categories': '/settings/categories',
            'security': '/settings/security',
            'privacy': '/settings/privacy',
            'terms': '/settings/terms',
            'backup': '/settings/backup',
            'support': '/settings/support',
            'feedback': '/settings/support',
            'guide': '/settings/guide',
            'admin': '/admin',
            'recurring': '/recurring',
            'goals': '/goals',
            'budgets': '/budgets',
            'advisor': '/advisor',
            'upgrade': '/upgrade',
        };
        const targetPath = paths[tab] || '/';
        if (location.pathname !== targetPath) {
            navigate(targetPath);
        }
    };

    // The logic previously maintained a previousTab state in local storage
    const [previousTab, setPreviousTabState] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('lastPreviousTab')) || 'home';
    });
    const setPreviousTab = (tab) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastPreviousTab', tab);
        }
        setPreviousTabState(tab);
    };

    // Save activeTab to local storage for backward compatibility
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastActiveTab', activeTab);
        }
    }, [activeTab]);

    return { activeTab, setActiveTab, previousTab, setPreviousTab };
}

