import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Footer from './core/footer/Footer';
import Header from './core/header/Header';
import Feed from './feeds/feed/Feed';
import Loader from './shared/components/loader/Loader';
import { usePageTracking } from './shared/hooks/usePageTracking';
import { FEED_TYPES } from './shared/services/hackernews-api';
import { useSettings } from './shared/settings/settings';
import { SettingsProvider } from './shared/settings/SettingsProvider';
import './App.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

function Layout() {
    const { settings } = useSettings();
    usePageTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Navigate to="/news/1" replace />} />
                {FEED_TYPES.map((feedType) => (
                    <Route key={feedType} path={`${feedType}/:page`} element={<Feed feedType={feedType} />} />
                ))}
                <Route path="item/:id" element={<ItemDetails />} />
                <Route path="user/:id" element={<User />} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </SettingsProvider>
    );
}
