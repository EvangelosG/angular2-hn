import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import AppRoutes from './routes';
import { useSettings } from './context/SettingsContext';
import './components/App.scss';

declare const ga: ((...args: unknown[]) => void) | undefined;

function usePageViews() {
    const location = useLocation();
    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
}

export default function App() {
    const { settings } = useSettings();
    usePageViews();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
