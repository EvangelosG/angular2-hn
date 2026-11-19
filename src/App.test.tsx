import { screen, waitFor } from '@testing-library/react';
import { useLocation, useParams } from 'react-router-dom';

import App from './App';
import { renderWithProviders } from './test/renderWithProviders';

// Feature and layout folders are owned by other agents; mock them so these tests only cover routing/shell.
vi.mock('./layout', () => ({
    Header: () => <div data-testid="header" />,
    Footer: () => <div data-testid="footer" />,
}));
vi.mock('./features/feed', () => ({
    FeedPage: function MockFeedPage({ feedType }: { feedType: string }) {
        const { page } = useParams();
        return <div data-testid="feed">{`${feedType}:${page}`}</div>;
    },
}));
vi.mock('./features/item', () => ({
    default: function MockItemDetailsPage() {
        const { id } = useParams();
        return <div data-testid="item">{id}</div>;
    },
}));
vi.mock('./features/user', () => ({
    default: function MockUserPage() {
        const { id } = useParams();
        return <div data-testid="user">{id}</div>;
    },
}));

function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
}

function renderApp(route: string) {
    return renderWithProviders(
        <>
            <App />
            <LocationProbe />
        </>,
        { route }
    );
}

describe('App', () => {
    afterEach(() => {
        delete window.ga;
    });

    it('renders the theme wrapper with header, page and footer', async () => {
        const { container } = renderApp('/news/1');

        const themeRoot = container.firstElementChild as HTMLElement;
        expect(themeRoot).toHaveClass('default');
        expect(themeRoot.children[0]).toHaveClass('body-cover');
        const wrapper = themeRoot.children[1];
        expect(wrapper).toHaveClass('wrapper');
        expect(wrapper.firstElementChild).toBe(screen.getByTestId('header'));
        expect(wrapper.lastElementChild).toBe(screen.getByTestId('footer'));
        expect(await screen.findByTestId('feed')).toHaveTextContent('news:1');
    });

    it('applies the saved theme class', () => {
        localStorage.setItem('theme', 'night');
        const { container } = renderApp('/news/1');
        expect(container.firstElementChild).toHaveClass('night');
    });

    it('redirects / to /news/1', async () => {
        renderApp('/');
        expect(await screen.findByTestId('feed')).toHaveTextContent('news:1');
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('routes /%s/:page to the feed page', async (feed) => {
        renderApp(`/${feed}/3`);
        expect(await screen.findByTestId('feed')).toHaveTextContent(`${feed}:3`);
    });

    it('lazy-loads the item page', async () => {
        renderApp('/item/8863');
        expect(await screen.findByTestId('item')).toHaveTextContent('8863');
    });

    it('lazy-loads the user page', async () => {
        renderApp('/user/pg');
        expect(await screen.findByTestId('user')).toHaveTextContent('pg');
    });

    it('redirects unknown URLs to /news/1', async () => {
        renderApp('/nope');
        expect(await screen.findByTestId('feed')).toHaveTextContent('news:1');
    });

    it('sends a pageview for the URL after redirects only', async () => {
        const ga = vi.fn();
        window.ga = ga;

        renderApp('/');

        await screen.findByTestId('feed');
        await waitFor(() => expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1'));
        expect(ga).not.toHaveBeenCalledWith('set', 'page', '/');
        expect(ga.mock.calls.filter(([command]) => command === 'send')).toHaveLength(1);
    });
});
