import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../settings';

import { ROUTER_FUTURE_FLAGS } from '../routerFutureFlags';

export { ROUTER_FUTURE_FLAGS };

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial URL, e.g. '/item/123'. Defaults to '/'. */
    route?: string;
    /** Route pattern to mount `ui` under so useParams works, e.g. '/item/:id'. */
    path?: string;
}

/** Renders `ui` inside SettingsProvider + MemoryRouter (the same providers main.tsx uses). */
export function renderWithProviders(
    ui: ReactElement,
    { route = '/', path, ...options }: RenderWithProvidersOptions = {}
): RenderResult {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
                {path ? (
                    <Routes>
                        <Route path={path} element={ui} />
                    </Routes>
                ) : (
                    ui
                )}
            </MemoryRouter>
        </SettingsProvider>,
        options
    );
}
