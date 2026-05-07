import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.replaceState({}, '', '/');
    });

    afterEach(() => {
        localStorage.clear();
        window.history.replaceState({}, '', '/');
    });

    it('redirects "/" to "/news/1" and renders the news placeholder', async () => {
        window.history.replaceState({}, '', '/');
        render(<App />);

        await waitFor(() => {
            expect(window.location.pathname).toBe('/news/1');
        });

        expect(screen.getByText(/Phase 4 placeholder.*news.*page 1/i)).toBeInTheDocument();
    });

    it('renders Header (5 nav links) and the body-cover element', () => {
        const { container } = render(<App />);
        // Header renders 5 NavLinks: home + new + show + ask + jobs
        expect(screen.getByRole('link', { name: /^new$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^show$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^ask$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^jobs$/i })).toBeInTheDocument();
        expect(container.querySelector('.body-cover')).not.toBeNull();
    });

    it('applies the settings.theme as a className on the root div after a theme is set', async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        // Open Settings via the cog
        await user.click(screen.getByAltText('Settings'));
        // Pick "night"
        await user.click(screen.getByRole('radio', { name: /^night$/i }));

        await waitFor(() => {
            expect(container.firstChild).toHaveClass('night');
        });
    });

    it('renders the Footer with the GitHub link', () => {
        render(<App />);
        const link = screen.getByRole('link', { name: /github/i });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
    });
});
