import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { SettingsProvider } from './context/SettingsProvider';
import { AppRoutes } from './routes';
import './styles.scss';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <AppRoutes />
            </SettingsProvider>
        </BrowserRouter>
    </StrictMode>
);
