import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Header from './components/core/Header';
import Footer from './components/core/Footer';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/user/User'));

function NotFound() {
    return <p>Not found</p>;
}

function Layout() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        window.ga?.('set', 'page', location.pathname);
        window.ga?.('send', 'pageview');
    }, [location.pathname]);

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
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
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <Layout />
            </SettingsProvider>
        </BrowserRouter>
    );
}

export default App;
