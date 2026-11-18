import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import type { Settings } from '../models/settings';
import { SettingsProvider } from '../settings';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial URL, e.g. '/news/2'. Default '/'. */
    route?: string;
    /** Route pattern to mount `ui` under so useParams works, e.g. '/item/:id'. */
    path?: string;
    /** Settings overrides (on top of localStorage/defaults). */
    initialSettings?: Partial<Settings>;
}

/** Renders `ui` inside SettingsProvider + MemoryRouter. Returns RTL queries plus a userEvent `user`. */
export function renderWithProviders(
    ui: ReactElement,
    { route = '/', path, initialSettings, ...options }: RenderWithProvidersOptions = {}
) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <SettingsProvider initialSettings={initialSettings}>
                <MemoryRouter initialEntries={[route]}>
                    {path ? (
                        <Routes>
                            <Route path={path} element={children} />
                            <Route path="*" element={<LocationDisplay />} />
                        </Routes>
                    ) : (
                        children
                    )}
                    {path ? null : <LocationDisplay />}
                </MemoryRouter>
            </SettingsProvider>
        );
    }
    return { user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Renders the current pathname+search in `data-testid="location"` to assert navigation. */
export function LocationDisplay() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname + location.search}</div>;
}
