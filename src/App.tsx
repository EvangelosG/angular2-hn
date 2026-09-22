import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components/layout';
import { Loader } from './components/shared';
import { usePageTracking } from './hooks/usePageTracking';
import type { FeedName } from './models';
import FeedPage from './pages/FeedPage';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

export const FEED_NAMES: readonly FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export const HOME_PATH = '/news/1';

export default function App() {
    usePageTracking();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Navigate to={HOME_PATH} replace />} />
                {FEED_NAMES.map((feed) => (
                    <Route key={feed} path={feed}>
                        <Route index element={<Navigate to={`/${feed}/1`} replace />} />
                        <Route path=":page" element={<FeedPage feedType={feed} />} />
                    </Route>
                ))}
                <Route
                    path="item/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <ItemDetailsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="user/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <UserPage />
                        </Suspense>
                    }
                />
                <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
            </Route>
        </Routes>
    );
}
