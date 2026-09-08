import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';

import Feed from '@/components/Feed/Feed';
import Loader from '@/components/Loader/Loader';

/** Lazily loaded routes — replaces the Angular `loadChildren` lazy modules. */
const ItemDetails = lazy(() => import('@/components/ItemDetails/ItemDetails'));
const User = lazy(() => import('@/components/User/User'));

function lazyRoute(element: ReactNode) {
    return <Suspense fallback={<Loader />}>{element}</Suspense>;
}

/** Feed types, mirroring the `data: {feedType: ...}` entries of `src/app/app.routes.ts`. */
const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

/**
 * Central route table — port of `src/app/app.routes.ts`.
 *
 * `''` redirects to `news/1`; every feed is registered both with and without the
 * `:page` segment (the Angular child route was `:page`, Feed defaults to page 1).
 */
export const routes: RouteObject[] = [
    { path: '/', element: <Navigate to="/news/1" replace /> },
    ...feedTypes.flatMap((feedType) => [
        { path: `/${feedType}`, element: <Feed feedType={feedType} /> },
        { path: `/${feedType}/:page`, element: <Feed feedType={feedType} /> },
    ]),
    { path: '/item/:id', element: lazyRoute(<ItemDetails />) },
    { path: '/user/:id', element: lazyRoute(<User />) },
    { path: '*', element: <Navigate to="/news/1" replace /> },
];

export default function AppRoutes() {
    return useRoutes(routes);
}
