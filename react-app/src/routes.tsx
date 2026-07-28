import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { App } from './App';
import { Feed } from './components/Feed/Feed';
import { Loader } from './components/shared/Loader/Loader';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/User/User'));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route index element={<Navigate to="/news/1" replace />} />
        {feedTypes.map((feedType) => (
          <Route key={feedType} path={`${feedType}/:page`} element={<Feed feedType={feedType} />} />
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
