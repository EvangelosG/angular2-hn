import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes, type RouteObject } from 'react-router-dom';

import { PageViewTracker } from './analytics';
import { Loader } from './components/Loader';
import { FeedPage } from './features/feed';
import { FEED_NAMES } from './models';

const ItemDetailsPage = lazy(() => import('./features/item'));
const UserPage = lazy(() => import('./features/user'));

export const DEFAULT_ROUTE = '/news/1';

export const routes: RouteObject[] = [
    { path: '/', element: <Navigate to={DEFAULT_ROUTE} replace /> },
    {
        element: (
            <PageViewTracker>
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
            </PageViewTracker>
        ),
        children: [
            // key remounts the page when switching feed types, like Angular's separate route configs.
            ...FEED_NAMES.map((feedType) => ({
                path: `/${feedType}/:page`,
                element: <FeedPage key={feedType} feedType={feedType} />,
            })),
            { path: '/item/:id', element: <ItemDetailsPage /> },
            { path: '/user/:id', element: <UserPage /> },
        ],
    },
    { path: '*', element: <Navigate to={DEFAULT_ROUTE} replace /> },
];

export function AppRoutes() {
    return useRoutes(routes);
}
