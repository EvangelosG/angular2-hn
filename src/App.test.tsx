import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonResponse, makeComment, makeStory, pg } from './test/fixtures';
import { renderApp } from './test/renderApp';

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

const thirtyStories = Array.from({ length: 30 }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}` }));

beforeEach(() => {
    fetchMock.mockImplementation(async (input) => {
        const url = String(input);
        if (url.endsWith('/item/50')) {
            return jsonResponse(
                makeStory({
                    id: 50,
                    title: 'Discussed story',
                    comments: [
                        makeComment({
                            id: 1,
                            content: '<p>Parent comment</p>',
                            comments: [makeComment({ id: 2, level: 1, user: 'carol', content: '<p>Child comment</p>' })],
                        }),
                        makeComment({ id: 3, deleted: true }),
                    ],
                })
            );
        }
        if (url.includes('/user/pg.json')) return jsonResponse(pg);
        if (url.includes('/jobs?')) return jsonResponse([makeStory({ type: 'job', title: 'Hiring' })]);
        if (url.includes('?page=')) return jsonResponse(thirtyStories);
        return jsonResponse({}, 404);
    });
});

afterEach(() => fetchMock.mockReset());

describe('routing', () => {
    it('redirects / to the first news page', async () => {
        renderApp('/');
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', expect.anything());
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed', async (feed) => {
        renderApp(`/${feed}/2`);
        await waitFor(() =>
            expect(fetchMock).toHaveBeenCalledWith(`https://node-hnapi.herokuapp.com/${feed}?page=2`, expect.anything())
        );
    });

    it('lazy-loads the item page', async () => {
        renderApp('/item/50');
        expect((await screen.findAllByText('Discussed story')).length).toBeGreaterThan(0);
    });

    it('lazy-loads the user page and sanitizes the about text', async () => {
        renderApp('/user/pg');
        expect(await screen.findByText('Bug fixer.')).toBeInTheDocument();
        expect(screen.getByText('157316 ★')).toBeInTheDocument();
        expect(document.querySelector('script')).toBeNull();
    });
});

describe('Feed', () => {
    it('numbers items by page and links to the neighbouring pages', async () => {
        renderApp('/news/2');
        await screen.findByText('Story 1');
        expect(document.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });

    it('hides Prev on page 1 and More on a short page', async () => {
        renderApp('/jobs/1');
        await screen.findByText('Hiring');
        expect(screen.getByText(/These are jobs at startups/)).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
    });

    it('shows an error message when the feed fails', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}, 500));
        renderApp('/news/1');
        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });
});

describe('Comment', () => {
    it('renders nested comments and collapses a subtree', async () => {
        const user = userEvent.setup();
        renderApp('/item/50');
        const child = await screen.findByText('Child comment');
        expect(screen.getByText('Parent comment')).toBeVisible();
        expect(screen.getByText('Comment Deleted', { exact: false })).toBeInTheDocument();

        const [parentToggle] = screen.getAllByText('[-]');
        await user.click(parentToggle);
        expect(parentToggle).toHaveTextContent('[+]');
        expect(child).not.toBeVisible();
        expect(screen.getByText('Parent comment')).not.toBeVisible();
    });
});

describe('Settings', () => {
    it('opens from the header and applies a theme', async () => {
        const user = userEvent.setup();
        const { container } = renderApp('/news/1');
        await screen.findByText('Story 1');

        await user.click(screen.getByAltText('Settings'));
        const dialog = screen.getByRole('dialog', { name: 'Settings' });
        await user.click(within(dialog).getByLabelText('Night'));
        expect(container.firstChild).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');

        await user.click(within(dialog).getByLabelText('Open links in a new tab'));
        expect(screen.getAllByRole('link', { name: /^Story 1$/ })[0]).toHaveAttribute('target', '_blank');

        await user.click(screen.getByLabelText('Close settings'));
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
