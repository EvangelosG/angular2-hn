import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { FeedPage } from './pages/FeedPage';
import { Loader } from './components/shared/Loader';

const ItemDetailsPage = lazy(() =>
    import('./pages/ItemDetailsPage').then((m) => ({ default: m.ItemDetailsPage }))
);
const UserPage = lazy(() =>
    import('./pages/UserPage').then((m) => ({ default: m.UserPage }))
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            {
                path: 'news/:page',
                element: <FeedPage feedType="news" />,
            },
            {
                path: 'newest/:page',
                element: <FeedPage feedType="newest" />,
            },
            {
                path: 'show/:page',
                element: <FeedPage feedType="show" />,
            },
            {
                path: 'ask/:page',
                element: <FeedPage feedType="ask" />,
            },
            {
                path: 'jobs/:page',
                element: <FeedPage feedType="jobs" />,
            },
            {
                path: 'item/:id',
                element: (
                    <Suspense fallback={<Loader />}>
                        <ItemDetailsPage />
                    </Suspense>
                ),
            },
            {
                path: 'user/:id',
                element: (
                    <Suspense fallback={<Loader />}>
                        <UserPage />
                    </Suspense>
                ),
            },
        ],
    },
]);
