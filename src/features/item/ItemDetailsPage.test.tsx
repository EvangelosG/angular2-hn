import { act, screen, waitFor, within } from '@testing-library/react';
import { Link, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchItemContent } from '../../api/hackerNewsApi';
import type { Story } from '../../models';
import { makeComment, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ItemDetailsPage } from './ItemDetailsPage';

vi.mock('../../api/hackerNewsApi', async (orig) => ({
    ...(await orig<typeof import('../../api/hackerNewsApi')>()),
    fetchItemContent: vi.fn(),
}));

const fetchItemContentMock = vi.mocked(fetchItemContent);

function renderPage(id = '1', initialSettings = {}) {
    return renderWithProviders(<ItemDetailsPage />, { route: `/item/${id}`, path: '/item/:id', initialSettings });
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function laptopHeader(container: HTMLElement): HTMLElement {
    return container.querySelector('.laptop') as HTMLElement;
}

function mobileHeader(container: HTMLElement): HTMLElement {
    return container.querySelector('.mobile') as HTMLElement;
}

describe('ItemDetailsPage', () => {
    beforeEach(() => {
        fetchItemContentMock.mockReset();
    });

    it('shows the loader while the item is loading', () => {
        fetchItemContentMock.mockReturnValue(new Promise(() => {}));
        renderPage('42');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(fetchItemContentMock).toHaveBeenCalledWith(42, expect.any(AbortSignal));
    });

    it('scrolls to the top on load', () => {
        const scrollTo = vi.spyOn(window, 'scrollTo');
        fetchItemContentMock.mockReturnValue(new Promise(() => {}));
        renderPage();
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('shows the error message when the item fails to load', async () => {
        fetchItemContentMock.mockRejectedValue(new Error('boom'));
        renderPage();
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('ignores aborted requests', async () => {
        fetchItemContentMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));
        renderPage();
        await act(async () => {});
        expect(screen.queryByText('Could not load item comments.')).not.toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the laptop header and subtext for a link story', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({ id: 7, title: 'A story', points: 120, user: 'pg', time_ago: '2 hours ago', comments_count: 3 })
        );
        const { container } = renderPage('7');
        await screen.findAllByText('A story');

        const laptop = laptopHeader(container);
        expect(laptop).toHaveClass('item-header');
        const title = within(laptop).getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(within(laptop).getByText('(example.com)')).toHaveClass('domain');

        const subtext = laptop.querySelector('.subtext') as HTMLElement;
        expect(subtext).toHaveTextContent('120 points by pg');
        expect(subtext).toHaveTextContent('2 hours ago | 3 comments');
        expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext).getByRole('link', { name: '3 comments' })).toHaveAttribute('href', '/item/7');
        expect(within(subtext).getByText(/2 hours ago/)).toHaveClass('itemDetails');
    });

    it('uses the comment pipe wording', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ comments_count: 0 }));
        const { container } = renderPage();
        await screen.findAllByText('Example story');
        expect(within(laptopHeader(container)).getByRole('link', { name: 'discuss' })).toBeInTheDocument();
        expect(laptopHeader(container)).not.toHaveClass('item-header');
    });

    it('opens the title link in a new tab when the setting is on', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ title: 'New tab story' }));
        const { container } = renderPage('1', { openLinkInNewTab: true });
        await screen.findAllByText('New tab story');
        for (const header of [laptopHeader(container), mobileHeader(container)]) {
            const link = within(header).getByRole('link', { name: 'New tab story' });
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener');
        }
    });

    it('links the title to the item page when the url is relative (ask posts)', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({ id: 9, title: 'Ask HN: anything?', type: 'ask', url: 'item?id=9', domain: undefined })
        );
        const { container } = renderPage('9', { openLinkInNewTab: true });
        await screen.findAllByText('Ask HN: anything?');
        for (const header of [laptopHeader(container), mobileHeader(container)]) {
            const link = within(header).getByRole('link', { name: 'Ask HN: anything?' });
            expect(link).toHaveAttribute('href', '/item/9');
            expect(link).not.toHaveAttribute('target');
            expect(link).toHaveClass('active');
        }
        expect(container.querySelector('.domain')).not.toBeInTheDocument();
    });

    it('renders job items without points, user or comments', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({ type: 'job', title: 'We are hiring', points: null, user: null, comments_count: 0, time_ago: '1 day ago' })
        );
        const { container } = renderPage();
        await screen.findAllByText('We are hiring');
        const laptop = laptopHeader(container);
        expect(laptop).toHaveClass('item-header');
        const subtext = laptop.querySelector('.subtext') as HTMLElement;
        expect(subtext).toHaveTextContent(/^1 day ago$/);
        expect(subtext).not.toHaveTextContent('points');
        expect(within(subtext).getByText('1 day ago')).not.toHaveClass('itemDetails');
    });

    it('renders the item content as HTML', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ content: 'Some <b>bold</b> text' }));
        const { container } = renderPage();
        expect(await screen.findByText('bold')).toBeInTheDocument();
        expect(container.querySelector('.subject b')).toHaveTextContent('bold');
    });

    it('renders poll results with proportional bars', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({
                type: 'poll',
                title: 'Poll: tabs or spaces?',
                url: 'item?id=1',
                poll: [
                    { content: '<p>Tabs</p>', points: 30 },
                    { content: '<p>Spaces</p>', points: 10 },
                ],
                poll_votes_count: 40,
            })
        );
        const { container } = renderPage();
        await screen.findByText('Tabs');
        const options = container.querySelectorAll('.pollResults .pollContent');
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent('Tabs30 points');
        expect(options[1]).toHaveTextContent('Spaces10 points');
        const bars = screen.getAllByTestId('poll-bar');
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('does not render poll results for non-poll items', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory());
        const { container } = renderPage();
        await screen.findAllByText('Example story');
        expect(container.querySelector('.pollResults')).not.toBeInTheDocument();
    });

    it('renders nested comments, including deleted ones', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({
                comments: [
                    makeComment({
                        id: 11,
                        user: 'alice',
                        content: 'top level',
                        comments: [makeComment({ id: 12, user: 'bob', content: 'reply' })],
                    }),
                    makeComment({ id: 13, deleted: true }),
                ],
            })
        );
        const { container } = renderPage();
        expect(await screen.findByText('top level')).toBeInTheDocument();
        expect(screen.getByText('reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
        expect(container.querySelectorAll('.commentList > li')).toHaveLength(2);
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    });

    it('goes back when the mobile back button is clicked', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ title: 'Back story' }));
        const { user, container } = renderWithProviders(
            <>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                    <Route path="*" element={null} />
                </Routes>
                <Link to="/item/1">open item</Link>
            </>,
            { route: '/news/1' }
        );
        await user.click(screen.getByRole('link', { name: 'open item' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/item/1');
        await screen.findAllByText('Back story');

        await user.click(container.querySelector('.back-button') as HTMLElement);
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it('refetches when the id changes', async () => {
        fetchItemContentMock.mockImplementation(async (id: number) =>
            makeStory({ id, title: `Story ${id}`, comments_count: 1 })
        );
        const { user } = renderWithProviders(
            <>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                </Routes>
                <Link to="/item/2">next item</Link>
            </>,
            { route: '/item/1' }
        );
        expect(await screen.findAllByText('Story 1')).toHaveLength(2);

        await user.click(screen.getByRole('link', { name: 'next item' }));
        expect(await screen.findAllByText('Story 2')).toHaveLength(2);
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();
        expect(fetchItemContentMock).toHaveBeenCalledTimes(2);
        expect(fetchItemContentMock).toHaveBeenLastCalledWith(2, expect.any(AbortSignal));
        expect(fetchItemContentMock.mock.calls[0][1]?.aborted).toBe(true);
    });

    it('aborts the in-flight request on unmount', () => {
        const pending = deferred<Story>();
        fetchItemContentMock.mockReturnValue(pending.promise);
        const { unmount } = renderPage();
        const signal = fetchItemContentMock.mock.calls[0][1] as AbortSignal;
        expect(signal.aborted).toBe(false);
        unmount();
        expect(signal.aborted).toBe(true);
    });

    it('keeps waiting for a slow response', async () => {
        const pending = deferred<Story>();
        fetchItemContentMock.mockReturnValue(pending.promise);
        renderPage();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        pending.resolve(makeStory({ title: 'Finally' }));
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
        expect(screen.getAllByText('Finally').length).toBe(2);
    });
});
