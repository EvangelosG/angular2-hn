import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { AppRoutes } from './AppRoutes';
import { Footer } from './core/footer/Footer';
import { Header } from './core/header/Header';
import { Settings } from './core/settings/Settings';
import { useSettings } from './shared/settings/SettingsContext';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

function usePageViews() {
    const location = useLocation();
    useEffect(() => {
        window.ga?.('set', 'page', location.pathname);
        window.ga?.('send', 'pageview');
    }, [location.pathname]);
}

export function App() {
    const { settings } = useSettings();
    usePageViews();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                {settings.showSettings && <Settings />}
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
