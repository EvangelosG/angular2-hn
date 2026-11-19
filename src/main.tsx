import './styles.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from './App';
import { SettingsProvider } from './shared/settings/SettingsProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <SettingsProvider>
                    <App />
                </SettingsProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);
