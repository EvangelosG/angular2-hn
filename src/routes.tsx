import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import Loader from './components/Loader/Loader';
import Feed from './pages/Feed/Feed';
import { FEED_NAMES } from './models/feed-type.type';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const User = lazy(() => import('./pages/User/User'));

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route index element={<Navigate to="/news/1" replace />} />
                {FEED_NAMES.map((feedName) => (
                    <Route key={feedName} path={feedName}>
                        <Route index element={<Navigate to={`/${feedName}/1`} replace />} />
                        <Route path=":page" element={<Feed feedType={feedName} />} />
                    </Route>
                ))}
                <Route
                    path="item/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <ItemDetails />
                        </Suspense>
                    }
                />
                <Route
                    path="user/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <User />
                        </Suspense>
                    }
                />
                <Route path="*" element={<Navigate to="/news/1" replace />} />
            </Route>
        </Routes>
    );
}
