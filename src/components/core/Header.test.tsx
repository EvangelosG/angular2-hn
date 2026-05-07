import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import Header from './Header';

function renderHeader() {
    return render(
        <MemoryRouter initialEntries={['/news/1']}>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders all five nav links with correct hrefs', () => {
        renderHeader();
        expect(screen.getByRole('link', { name: /^logo$/i }) || screen.getByAltText('Logo')).toBeTruthy();
        const newest = screen.getByRole('link', { name: /^new$/i });
        const show = screen.getByRole('link', { name: /^show$/i });
        const ask = screen.getByRole('link', { name: /^ask$/i });
        const jobs = screen.getByRole('link', { name: /^jobs$/i });
        expect(newest).toHaveAttribute('href', '/newest/1');
        expect(show).toHaveAttribute('href', '/show/1');
        expect(ask).toHaveAttribute('href', '/ask/1');
        expect(jobs).toHaveAttribute('href', '/jobs/1');
    });

    it('renders the home link to /news/1', () => {
        renderHeader();
        const homeLinks = screen.getAllByRole('link');
        const home = homeLinks.find((l) => l.getAttribute('href') === '/news/1');
        expect(home).toBeTruthy();
    });

    it('opens Settings when the cog is clicked', async () => {
        const user = userEvent.setup();
        renderHeader();

        // Settings panel should not be visible initially
        expect(screen.queryByRole('heading', { name: /^settings$/i })).not.toBeInTheDocument();

        const cog = screen.getByAltText('Settings');
        await user.click(cog);

        // After clicking the cog, the Settings panel renders
        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
    });
});
