import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import { useSettings } from './hooks/useSettings';
import './App.scss';

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname + location.search;
        if (window.ga) {
            window.ga('set', 'page', path);
            window.ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
