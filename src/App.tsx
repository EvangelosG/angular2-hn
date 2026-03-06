import { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './components/Feed/Feed';
import { Loader } from './components/Loader/Loader';
import './App.scss';
// Eagerly import SCSS for conditionally-rendered components (Settings modal)
import './components/Settings/Settings.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails').then(m => ({ default: m.ItemDetails })));
const User = lazy(() => import('./components/User/User').then(m => ({ default: m.User })));

declare let ga: Function;

export function App() {
    const { settings } = useSettings();
    const location = useLocation();
    const isInitialRender = useRef(true);

    useEffect(() => {
        // Skip initial render to avoid double-counting redirect
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed />} />
                    <Route path="/newest/:page" element={<Feed />} />
                    <Route path="/show/:page" element={<Feed />} />
                    <Route path="/ask/:page" element={<Feed />} />
                    <Route path="/jobs/:page" element={<Feed />} />
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
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
