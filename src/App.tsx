import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './components/Feed/Feed';
import { ItemDetails } from './components/ItemDetails/ItemDetails';
import { UserProfile } from './components/UserProfile/UserProfile';
import './App.scss';
import './components/Settings/Settings.scss';

declare let ga: Function;

function AnalyticsTracker() {
    const location = useLocation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the initial render to avoid double-counting redirects
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

    return null;
}

function AppContent() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<UserProfile />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AnalyticsTracker />
                <AppContent />
            </SettingsProvider>
        </BrowserRouter>
    );
}
