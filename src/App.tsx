import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './components/Feed/Feed';
import { Loader } from './components/Loader/Loader';
import './App.scss';

const ItemDetails = lazy(() =>
  import('./components/ItemDetails/ItemDetails').then((m) => ({ default: m.ItemDetails }))
);
const UserProfile = lazy(() =>
  import('./components/UserProfile/UserProfile').then((m) => ({ default: m.UserProfile }))
);

declare function ga(...args: unknown[]): void;

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', location.pathname + location.search);
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
        <Suspense fallback={<Loader />}>
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
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <AppContent />
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
