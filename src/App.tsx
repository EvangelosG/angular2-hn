import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import Header from './components/core/Header';
import Footer from './components/core/Footer';
import { SettingsProvider, useSettings } from './context/SettingsContext';

function FeedPlaceholder({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    return <p>[Phase 4 placeholder] Feed: {feedType}, page {page}</p>;
}

function ItemDetailsPlaceholder() {
    const { id } = useParams<{ id: string }>();
    return <p>[Phase 4 placeholder] Item details: {id}</p>;
}

function UserPlaceholder() {
    const { id } = useParams<{ id: string }>();
    return <p>[Phase 4 placeholder] User: {id}</p>;
}

function NotFoundPlaceholder() {
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
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<FeedPlaceholder feedType="news" />} />
                    <Route path="/newest/:page" element={<FeedPlaceholder feedType="newest" />} />
                    <Route path="/show/:page" element={<FeedPlaceholder feedType="show" />} />
                    <Route path="/ask/:page" element={<FeedPlaceholder feedType="ask" />} />
                    <Route path="/jobs/:page" element={<FeedPlaceholder feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetailsPlaceholder />} />
                    <Route path="/user/:id" element={<UserPlaceholder />} />
                    <Route path="*" element={<NotFoundPlaceholder />} />
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
