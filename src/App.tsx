import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './core/Header';
import Footer from './core/Footer';
import Loader from './shared/components/Loader';
import { useSettings } from './shared/settings/SettingsContext';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

function usePageviewTracking() {
    const location = useLocation();
    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
        }
    }, [location.pathname, location.search]);
}

export default function App() {
    const { settings } = useSettings();
    usePageviewTracking();

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
