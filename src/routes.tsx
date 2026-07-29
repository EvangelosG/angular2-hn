import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { App } from './App';
import { Feed } from './components/Feed/Feed';
import { Loader } from './components/Loader/Loader';
import type { Feed as FeedName } from './models';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/User/User'));

const FEEDS: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {FEEDS.map((feedType) => (
                    <Route key={feedType} path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                ))}
                <Route
                    path="/item/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <ItemDetails />
                        </Suspense>
                    }
                />
                <Route
                    path="/user/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <User />
                        </Suspense>
                    }
                />
            </Route>
        </Routes>
    );
}
