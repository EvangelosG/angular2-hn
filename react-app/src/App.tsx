import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { useSettings } from './hooks/useSettings';
import './App.scss';

export function App() {
  const { settings } = useSettings();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', `${pathname}${search}`);
      window.ga('send', 'pageview');
    }
  }, [pathname, search]);

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
