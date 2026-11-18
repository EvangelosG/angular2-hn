import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { renderWithProviders } from './test/renderWithProviders';

// Feature pages are mocked so these routing tests don't depend on their implementation.
vi.mock('./features/feed/FeedPage', () => ({
    FeedPage: ({ feedType }: { feedType: string }) => <div>feed:{feedType}</div>,
}));
vi.mock('./features/item/ItemDetailsPage', () => ({ ItemDetailsPage: () => <div>item-page</div> }));
vi.mock('./features/user/UserPage', () => ({ UserPage: () => <div>user-page</div> }));
vi.mock('./layout/Header', () => ({ Header: () => <header>header</header> }));
vi.mock('./layout/Footer', () => ({ Footer: () => <footer>footer</footer> }));

describe('App', () => {
    it('redirects / to /news/1', async () => {
        renderWithProviders(<App />, { route: '/' });
        expect(await screen.findByText('feed:news')).toBeInTheDocument();
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('routes /%s/:page to FeedPage', async (feedType) => {
        renderWithProviders(<App />, { route: `/${feedType}/2` });
        expect(await screen.findByText(`feed:${feedType}`)).toBeInTheDocument();
    });

    it('lazy-loads the item and user pages', async () => {
        renderWithProviders(<App />, { route: '/item/123' });
        expect(await screen.findByText('item-page')).toBeInTheDocument();
    });

    it('lazy-loads the user page', async () => {
        renderWithProviders(<App />, { route: '/user/pg' });
        expect(await screen.findByText('user-page')).toBeInTheDocument();
    });

    it('renders the theme wrapper with header and footer', () => {
        const { container } = renderWithProviders(<App />, { route: '/news/1', initialSettings: { theme: 'night' } });
        const root = container.firstChild as HTMLElement;
        expect(root).toHaveClass('night');
        expect(root.querySelector('.body-cover')).not.toBeNull();
        expect(root.querySelector('.wrapper')).toContainElement(screen.getByText('header'));
        expect(root.querySelector('.wrapper')).toContainElement(screen.getByText('footer'));
    });
});
