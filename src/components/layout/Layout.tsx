import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import Header from './Header';
import Footer from './Footer';

export interface LayoutProps {
    children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                {children ?? <Outlet />}
                <Footer />
            </div>
        </div>
    );
}
