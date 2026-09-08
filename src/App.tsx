import { useSettings } from '@/context/SettingsContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import AppRoutes from './routes';
import './App.module.scss';

/**
 * Root application component — port of `src/app/app.component.html`.
 *
 * The Angular component also pushed a Google Analytics pageview on every
 * NavigationEnd (`ga('set', 'page', ...)`); that analytics snippet no longer
 * exists in the app shell, so it is intentionally not ported.
 */
export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
