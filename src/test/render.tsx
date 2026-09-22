import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsContext';

/** Renders `ui` the way src/main.tsx mounts <App/>, but on an in-memory history starting at `path`. */
export function renderAt(path: string, ui: ReactElement) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>{ui}</SettingsProvider>
        </MemoryRouter>
    );
}
