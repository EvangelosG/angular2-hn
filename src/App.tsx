import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { useSettings } from './context/SettingsContext';
import './App.scss';

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
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
