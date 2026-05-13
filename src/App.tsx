import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SettingsProvider } from './context/SettingsContext';
import { useSettings } from './hooks/useSettings';
import { usePageTracking } from './hooks/usePageTracking';
import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';

function AppShell() {
    const { settings } = useSettings();
    usePageTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<FeedPage feedType="news" />} />
                    <Route path="/newest" element={<Navigate to="/newest/1" replace />} />
                    <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
                    <Route path="/show" element={<Navigate to="/show/1" replace />} />
                    <Route path="/show/:page" element={<FeedPage feedType="show" />} />
                    <Route path="/ask" element={<Navigate to="/ask/1" replace />} />
                    <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
                    <Route path="/jobs" element={<Navigate to="/jobs/1" replace />} />
                    <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                    <Route path="/user/:id" element={<UserPage />} />
                    <Route path="*" element={<Navigate to="/news/1" replace />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
