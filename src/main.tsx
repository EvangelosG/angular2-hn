import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Global theme styles must load before App so component CSS Modules win specificity ties.
import './styles/styles.scss';
import App from './App';
import { SettingsProvider } from './settings';
import { ROUTER_FUTURE_FLAGS } from './routerFutureFlags';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
                <App />
            </BrowserRouter>
        </SettingsProvider>
    </StrictMode>
);
