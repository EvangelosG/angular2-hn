import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Header from './Header';
import { SettingsProvider } from '../context/SettingsContext';

function renderHeader() {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Header', () => {
    it('renders the feed navigation links', () => {
        renderHeader();
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('opens the settings popup when the cog is clicked', async () => {
        const user = userEvent.setup();
        renderHeader();
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        await user.click(screen.getByAltText('Settings'));
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });
});
