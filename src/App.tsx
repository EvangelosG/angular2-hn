import { Outlet } from 'react-router-dom';

import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { usePageViews } from './hooks/usePageViews';
import { useSettings } from './hooks/useSettings';

export function App() {
    const { settings } = useSettings();
    usePageViews();

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
