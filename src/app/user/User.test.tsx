import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { jsonResponse } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import User from './User';

function renderUser(id: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<User />} />
        </Routes>,
        { route: `/user/${id}` }
    );
}

describe('User', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('renders the profile', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                jsonResponse({ id: 'pg', karma: 157316, created: '20 years ago', created_time: 0, about: 'Bug fixer.' })
            )
        );
        renderUser('pg');

        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
    });

    it('shows an error for an unknown user', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, 404)));
        renderUser('nobody');
        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });
});
