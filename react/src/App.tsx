import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './pages/Feed/Feed';
import { ItemDetails } from './pages/ItemDetails/ItemDetails';
import { User } from './pages/User/User';
import './App.scss';

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

function FeedRoute() {
  const { feedType } = useParams();
  if (!feedType || !FEED_TYPES.includes(feedType)) {
    return <Navigate to="/news/1" replace />;
  }
  return <Feed key={feedType} feedType={feedType} />;
}

export function App() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/:feedType/:page" element={<FeedRoute />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="*" element={<Navigate to="/news/1" replace />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
