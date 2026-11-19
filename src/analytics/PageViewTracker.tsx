import type { ReactNode } from 'react';

import { usePageViews } from './usePageViews';

/**
 * Wraps the routed pages (not the redirect routes), so the tracked path is the
 * URL after redirects, matching Angular's NavigationEnd.urlAfterRedirects.
 */
export function PageViewTracker({ children }: { children: ReactNode }) {
    usePageViews();
    return <>{children}</>;
}
