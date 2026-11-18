import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './App.module.scss';
import { AppRoutes } from './AppRoutes';
import { Footer } from './layout/Footer';
import { Header } from './layout/Header';
import { useSettings } from './settings';
import { cx } from './utils/cx';

function usePageViewTracking() {
    const { pathname, search } = useLocation();
    useEffect(() => {
        window.ga?.('set', 'page', pathname + search);
        window.ga?.('send', 'pageview');
    }, [pathname, search]);
}

/** Port of app.component: theme wrapper, header, routed page, footer. */
export function App() {
    const { settings } = useSettings();
    usePageViewTracking();

    return (
        <div className={settings.theme}>
            <div className={cx(styles.bodyCover, 'body-cover')}></div>
            <div className={cx(styles.wrapper, 'wrapper')}>
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
