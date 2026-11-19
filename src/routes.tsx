import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import App from './App';
import FeedPage from './feeds/FeedPage';
import { FEED_NAMES } from './shared/models/feed-type';

const ItemDetailsPage = lazy(() => import('./item-details/ItemDetailsPage'));
const UserPage = lazy(() => import('./user/UserPage'));

export const routes: RouteObject[] = [
    {
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_NAMES.map((feedType) => ({
                path: `${feedType}/:page`,
                // Keyed so switching feeds remounts the page, like Angular's separate route configs.
                element: <FeedPage key={feedType} feedType={feedType} />,
            })),
            { path: 'item/:id', element: <ItemDetailsPage /> },
            { path: 'user/:id', element: <UserPage /> },
        ],
    },
];
