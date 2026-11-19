import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackPageView } from './analytics';

/** Tracks a pageview whenever the router location changes. */
export function usePageViews(): void {
    const { pathname, search } = useLocation();

    useEffect(() => {
        trackPageView(pathname + search);
    }, [pathname, search]);
}
