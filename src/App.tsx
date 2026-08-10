import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { useSettings } from './context/useSettings';
import AppRoutes from './routes';
import './App.scss';

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'function') {
            return;
        }
        ga('set', 'page', location.pathname + location.search);
        ga('send', 'pageview');
    }, [location.pathname, location.search]);

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
