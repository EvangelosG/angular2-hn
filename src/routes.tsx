import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Feed from './components/Feed/Feed';
import Loader from './components/Loader/Loader';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/User/User'));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export default function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {feedTypes.map((feedType) => (
                    <Route key={feedType} path={`/${feedType}`}>
                        <Route path=":page" element={<Feed feedType={feedType} />} />
                    </Route>
                ))}
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/user/:id" element={<User />} />
                <Route path="*" element={<Navigate to="/news/1" replace />} />
            </Routes>
        </Suspense>
    );
}
