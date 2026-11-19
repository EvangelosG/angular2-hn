import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

import { App } from '../App';
import { SettingsProvider } from '../shared/settings/SettingsProvider';

export function renderApp(path: string) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <SettingsProvider>
                    <App />
                </SettingsProvider>
            </MemoryRouter>
        </QueryClientProvider>
    );
}
