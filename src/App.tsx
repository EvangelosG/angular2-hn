import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Feed from './pages/Feed/Feed';
import ItemDetails from './pages/ItemDetails/ItemDetails';
import User from './pages/User/User';

function AppContent() {
  const { theme } = useSettings();

  return (
    <div className={theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<Feed />} />
          <Route path="/newest/:page" element={<Feed />} />
          <Route path="/show/:page" element={<Feed />} />
          <Route path="/ask/:page" element={<Feed />} />
          <Route path="/jobs/:page" element={<Feed />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
