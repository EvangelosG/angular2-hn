import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function usePageTracking(): void {
    const location = useLocation();

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.ga !== 'function') {
            return;
        }
        window.ga('set', 'page', location.pathname);
        window.ga('send', 'pageview');
    }, [location.pathname]);
}
