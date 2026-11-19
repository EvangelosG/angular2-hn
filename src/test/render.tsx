import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';

import { SettingsProvider } from '../shared/settings/SettingsContext';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    return renderRoutes([{ path: '*', element: ui }], { route });
}

export function renderRoutes(routes: RouteObject[], { route = '/' }: { route?: string } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createMemoryRouter(routes, { initialEntries: [route] });
    const utils = render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    );
    return { ...utils, router };
}
