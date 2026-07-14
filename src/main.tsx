import React, { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import App from './App';
import Feed from './components/Feed';
import Loader from './components/Loader';
import { SettingsProvider } from './context/SettingsProvider';
import './styles/global.scss';

const ItemDetails = React.lazy(() => import('./components/ItemDetails'));
const User = React.lazy(() => import('./components/User'));

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<Loader />}>{element}</Suspense>;

const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            { path: 'news/:page', element: <Feed feedType="news" /> },
            { path: 'newest/:page', element: <Feed feedType="newest" /> },
            { path: 'show/:page', element: <Feed feedType="show" /> },
            { path: 'ask/:page', element: <Feed feedType="ask" /> },
            { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
            { path: 'item/:id', element: withSuspense(<ItemDetails />) },
            { path: 'user/:id', element: withSuspense(<User />) },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </StrictMode>
);
