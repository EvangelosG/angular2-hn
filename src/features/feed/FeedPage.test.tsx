import { fireEvent, screen, waitFor } from '@testing-library/react';

import { fetchFeed } from '../../api/hackerNewsApi';
import type { FeedName, Story } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import { FeedPage } from './FeedPage';

vi.mock('../../api/hackerNewsApi');

const mockedFetchFeed = vi.mocked(fetchFeed);

function makeStories(count: number, start = 1): Story[] {
    return Array.from({ length: count }, (_, i) => ({
        id: start + i,
        title: `Story ${start + i}`,
        points: 10,
        user: 'user',
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${start + i}`,
        domain: 'example.com',
        comments: [],
        comments_count: 2,
    }));
}

function renderFeed(feedType: FeedName, route: string) {
    return renderWithProviders(<FeedPage key={feedType} feedType={feedType} />, {
        route,
        path: `/${feedType}/:page`,
    });
}

describe('FeedPage', () => {
    let scrollTo: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        scrollTo = vi.fn();
        vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo as unknown as typeof window.scrollTo);
    });

    it('shows the loader while loading, then the numbered list', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(30));
        const { container } = renderFeed('news', '/news/1');

        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenCalledWith(
            'news',
            1,
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );

        const list = screen.getByRole('list');
        expect(list).toHaveAttribute('start', '1');
        expect(screen.getAllByRole('listitem')).toHaveLength(30);
        expect(container.querySelector('.nav')).not.toBeNull();
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveClass('more');
        expect(screen.queryByText(/funded by Y Combinator/)).not.toBeInTheDocument();
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('numbers later pages and shows Prev, hiding More when fewer than 30 items', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(5, 61));
        renderFeed('newest', '/newest/3');

        expect(await screen.findByRole('link', { name: 'Story 61' })).toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenCalledWith('newest', 3, expect.anything());
        expect(screen.getByRole('list')).toHaveAttribute('start', '61');
        const prev = screen.getByRole('link', { name: '‹ Prev' });
        expect(prev).toHaveAttribute('href', '/newest/2');
        expect(prev).toHaveClass('prev');
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
    });

    it('treats an invalid page as page 1', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(3));
        renderFeed('show', '/show/abc');

        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenCalledWith('show', 1, expect.anything());
        expect(screen.getByRole('list')).toHaveAttribute('start', '1');
    });

    it('fetches the next page when navigating via More', async () => {
        mockedFetchFeed.mockImplementation((_feed, page) => Promise.resolve(makeStories(30, (page - 1) * 30 + 1)));
        renderFeed('ask', '/ask/1');

        fireEvent.click(await screen.findByRole('link', { name: 'More ›' }));

        expect(await screen.findByRole('link', { name: 'Story 31' })).toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenLastCalledWith('ask', 2, expect.anything());
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/ask/1');
        await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(2));
    });

    it('shows the jobs intro on the jobs feed', async () => {
        mockedFetchFeed.mockResolvedValue(
            makeStories(2).map((story) => ({ ...story, type: 'job' as const, points: null, user: null }))
        );
        renderFeed('jobs', '/jobs/1');

        await screen.findByRole('link', { name: 'Story 1' });
        const intro = screen.getByText(/These are jobs at startups that were funded by Y Combinator\./);
        expect(intro).toHaveClass('job-header');
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('shows the Angular error message when the request fails', async () => {
        mockedFetchFeed.mockRejectedValue(new Error('boom'));
        renderFeed('newest', '/newest/1');

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load newest stories.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('aborts the in-flight request on unmount', async () => {
        let signal: AbortSignal | undefined;
        mockedFetchFeed.mockImplementation((_feed, _page, opts) => {
            signal = opts?.signal;
            return new Promise(() => undefined);
        });
        const { unmount } = renderFeed('news', '/news/1');

        await waitFor(() => expect(signal).toBeDefined());
        unmount();
        expect(signal?.aborted).toBe(true);
    });
});
