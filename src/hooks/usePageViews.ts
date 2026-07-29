import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function usePageViews() {
    const location = useLocation();

    useEffect(() => {
        const url = `${location.pathname}${location.search}`;
        window.ga?.('set', 'page', url);
        window.ga?.('send', 'pageview');
    }, [location.pathname, location.search]);
}
