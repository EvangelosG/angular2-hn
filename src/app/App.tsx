import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useSettings } from './shared/settings/useSettings';
import Header from './core/header/Header';
import Footer from './core/footer/Footer';
import Feed, { type FeedName } from './feeds/feed/Feed';
import Loader from './shared/components/loader/Loader';
import './App.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

const feedTypes: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        window.ga?.('set', 'page', location.pathname + location.search);
        window.ga?.('send', 'pageview');
    }, [location.pathname, location.search]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {feedTypes.map((feedType) => (
                            <Route
                                key={feedType}
                                path={`/${feedType}/:page`}
                                element={<Feed key={feedType} feedType={feedType} />}
                            />
                        ))}
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
