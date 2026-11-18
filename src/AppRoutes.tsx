import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Loader } from './components/Loader';
import { FeedPage } from './features/feed/FeedPage';
import { FEED_TYPES } from './models/feedType';

const ItemDetailsPage = lazy(() =>
    import('./features/item/ItemDetailsPage').then((module) => ({ default: module.ItemDetailsPage }))
);
const UserPage = lazy(() => import('./features/user/UserPage').then((module) => ({ default: module.UserPage })));

/** Port of app.routes.ts. */
export function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {FEED_TYPES.map((feedType) => (
                    <Route key={feedType} path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
                ))}
                <Route path="/item/:id" element={<ItemDetailsPage />} />
                <Route path="/user/:id" element={<UserPage />} />
            </Routes>
        </Suspense>
    );
}
