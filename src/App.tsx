import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/core/Footer';
import Header from './components/core/Header';
import Settings from './components/core/Settings';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import { useSettings } from './context/SettingsContext';
import './App.scss';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/user/User'));

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    window.ga?.('set', 'page', location.pathname + location.search);
    window.ga?.('send', 'pageview');
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<User />} />
            <Route path="/:feedType/:page" element={<Feed />} />
            <Route path="*" element={<Navigate to="/news/1" replace />} />
          </Routes>
        </Suspense>
        <Footer />
        {settings.showSettings && <Settings />}
      </div>
    </div>
  );
}
