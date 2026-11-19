import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Feed } from './feeds/feed/Feed';
import { FEEDS } from './shared/models/feed-type.type';
import { Loader } from './shared/components/loader/Loader';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

export function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {FEEDS.map((feedType) => (
                    <Route key={feedType} path={`/${feedType}/:page`} element={<Feed key={feedType} feedType={feedType} />} />
                ))}
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/user/:id" element={<User />} />
            </Routes>
        </Suspense>
    );
}
