import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type GoogleAnalytics = (...args: unknown[]) => void;

declare global {
    interface Window {
        ga?: GoogleAnalytics;
    }
}

/**
 * Sends a Google Analytics pageview on every navigation, like the Angular
 * `AppComponent` did on `NavigationEnd`. No-op when the `ga` snippet from
 * index.html has not loaded (e.g. blocked, offline or in tests).
 */
export function usePageTracking(): void {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        const ga = window.ga;
        if (typeof ga !== 'function') {
            return;
        }
        ga('set', 'page', `${pathname}${search}${hash}`);
        ga('send', 'pageview');
    }, [pathname, search, hash]);
}
