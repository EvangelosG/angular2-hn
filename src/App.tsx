import { Footer, Header } from './layout';
import { AppRoutes } from './routes';
import { useSettings } from './settings';

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
