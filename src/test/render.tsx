import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../app/shared/settings/SettingsProvider';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </SettingsProvider>
    );
}
