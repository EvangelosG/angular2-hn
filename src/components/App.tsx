import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import Header from './Header';
import Footer from './Footer';
import Feed from './Feed';
import ItemDetails from './ItemDetails';
import User from './User';
import './App.scss';

declare function ga(...args: string[]): void;

const AppContent: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    try {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
    } catch (e) {
      // GA not loaded
    }
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
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
          <Route path="/user/:id" element={<User />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
