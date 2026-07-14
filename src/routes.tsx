import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import App from './App';
import Feed from './components/feeds/Feed/Feed';
import Loader from './components/shared/Loader/Loader';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/user/User/User'));

function lazyRoute(element: JSX.Element) {
    return <Suspense fallback={<Loader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            { path: 'news/:page', element: <Feed feedType="news" /> },
            { path: 'newest/:page', element: <Feed feedType="newest" /> },
            { path: 'show/:page', element: <Feed feedType="show" /> },
            { path: 'ask/:page', element: <Feed feedType="ask" /> },
            { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
            { path: 'item/:id', element: lazyRoute(<ItemDetails />) },
            { path: 'user/:id', element: lazyRoute(<User />) },
        ],
    },
]);
