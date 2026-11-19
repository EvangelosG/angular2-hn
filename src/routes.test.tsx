import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from './routes';
import { renderRoutes } from './test/render';
import { makeComment, makeStory, user } from './test/fixtures';
import { BASE_URL, USER_BASE_URL } from './shared/api/hackernews';

function page(feed: string, page: number, count = 30) {
    return Array.from({ length: count }, (_, i) =>
        makeStory({ id: page * 1000 + i, title: `${feed} ${page}-${i}` })
    );
}

beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            const u = new URL(url);
            let body: unknown;
            if (url.startsWith(USER_BASE_URL)) body = user;
            else if (u.pathname.startsWith('/item/')) body = makeStory({ id: 7, title: 'Item seven', comments: [makeComment()] });
            else if (url.startsWith(BASE_URL)) {
                const feed = u.pathname.slice(1);
                const p = Number(u.searchParams.get('page'));
                body = page(feed, p, p === 3 ? 5 : 30);
            }
            return new Response(JSON.stringify(body), { status: 200 });
        })
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('routes', () => {
    it('redirects / to /news/1', async () => {
        const { router } = renderRoutes(routes, { route: '/' });
        await waitFor(() => expect(router.state.location.pathname).toBe('/news/1'));
        expect(await screen.findByText('news 1-0')).toBeInTheDocument();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed', async (feed) => {
        renderRoutes(routes, { route: `/${feed}/1` });
        expect(await screen.findByText(`${feed} 1-0`)).toBeInTheDocument();
        expect(screen.getByRole('list')).toHaveAttribute('start', '1');
    });

    it('paginates with Prev / More links', async () => {
        const { router } = renderRoutes(routes, { route: '/show/2' });
        expect(await screen.findByText('show 2-0')).toBeInTheDocument();
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/show/1');
        await userEvent.click(screen.getByRole('link', { name: 'More ›' }));
        expect(await screen.findByText('show 3-0')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/show/3');
        expect(screen.getByRole('list')).toHaveAttribute('start', '61');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('shows the YC jobs header only on the jobs feed', async () => {
        renderRoutes(routes, { route: '/jobs/1' });
        expect(await screen.findByText(/funded by Y Combinator/)).toBeInTheDocument();
    });

    it('lazy-loads the item details page', async () => {
        renderRoutes(routes, { route: '/item/7' });
        expect(await screen.findAllByText('Item seven')).not.toHaveLength(0);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('lazy-loads the user page', async () => {
        renderRoutes(routes, { route: '/user/pg' });
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
    });

    it('shows an error message when a feed fails to load', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
        renderRoutes(routes, { route: '/ask/1' });
        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    });

    it('opens settings from the header and switches theme', async () => {
        const { container } = renderRoutes(routes, { route: '/news/1' });
        await userEvent.click(screen.getByAltText('Settings'));
        await userEvent.click(screen.getByLabelText(/Night/));
        expect(container.firstElementChild).toHaveClass('night');
        await userEvent.click(screen.getByText('×'));
        expect(screen.queryByText('Select a theme')).not.toBeInTheDocument();
    });
});
