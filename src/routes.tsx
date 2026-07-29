import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { App } from './App';
import { Loader } from './components/loader/Loader';
import { Feed } from './feeds/Feed';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {feedTypes.map((feedType) => (
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
