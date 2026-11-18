import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../test/renderWithProviders';
import { Header } from './Header';

describe('Header', () => {
    it('renders the logo home link and the nav links', () => {
        renderWithProviders(<Header />, { route: '/news/1' });

        expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'assets/images/logo.svg');
        for (const [label, href] of [
            ['new', '/newest/1'],
            ['show', '/show/1'],
            ['ask', '/ask/1'],
            ['jobs', '/jobs/1'],
        ]) {
            expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
        }
        expect(document.getElementById('header')).toHaveTextContent('new | show | ask | jobs');
    });

    it('marks the link for the current route as active', () => {
        renderWithProviders(<Header />, { route: '/show/1' });

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
        expect(screen.getByAltText('Logo').closest('a')).not.toHaveClass('active');
    });

    it('marks the home link active on /news/1', () => {
        renderWithProviders(<Header />, { route: '/news/1' });

        expect(screen.getByAltText('Logo').closest('a')).toHaveClass('home-link', 'active');
    });

    it('navigates and scrolls to top when a nav link is clicked', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo');
        const { user } = renderWithProviders(<Header />, { route: '/news/2' });

        await user.click(screen.getByRole('link', { name: 'ask' }));

        expect(screen.getByTestId('location')).toHaveTextContent('/ask/1');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        expect(screen.getByRole('link', { name: 'ask' })).toHaveClass('active');
    });

    it('navigates home and scrolls to top when the logo is clicked', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo');
        const { user } = renderWithProviders(<Header />, { route: '/jobs/3' });

        await user.click(screen.getByAltText('Logo'));

        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('toggles the settings popup with the cog icon', async () => {
        const { user } = renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('closes the settings popup with the close button', async () => {
        const { user } = renderWithProviders(<Header />, { initialSettings: { showSettings: true } });

        await user.click(screen.getByText('×'));

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('keeps the plain theme hooks on the header', () => {
        renderWithProviders(<Header />);

        expect(document.getElementById('header')).toBeInTheDocument();
        expect(document.querySelector('#header .logo-inner')).toBeInTheDocument();
    });
});
