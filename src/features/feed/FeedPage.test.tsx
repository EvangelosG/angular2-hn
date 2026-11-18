import { act, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed } from '../../api/hackerNewsApi';
import type { FeedType } from '../../models/feedType';
import type { Story } from '../../models/story';
import { SettingsProvider } from '../../settings';
import { makeStory } from '../../test/fixtures';
import { LocationDisplay, renderWithProviders } from '../../test/renderWithProviders';
import { FeedPage } from './FeedPage';

vi.mock('../../api/hackerNewsApi', async (orig) => ({
    ...(await orig<typeof import('../../api/hackerNewsApi')>()),
    fetchFeed: vi.fn(),
}));

function makeStories(count: number, startId = 1): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory({ id: startId + i, title: `Story ${startId + i}` }));
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

function renderFeed(feedType: FeedType, route: string) {
    return renderWithProviders(<FeedPage feedType={feedType} />, { route, path: `/${feedType}/:page` });
}

describe('FeedPage', () => {
    beforeEach(() => {
        vi.mocked(fetchFeed).mockReset();
    });

    it('shows the loader while loading, then the stories', async () => {
        const request = deferred<Story[]>();
        vi.mocked(fetchFeed).mockReturnValue(request.promise);
        const { container } = renderFeed('news', '/news/1');

        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));

        await act(async () => request.resolve(makeStories(3)));

        expect(container.querySelector('.loader')).not.toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        expect(screen.getByText('Story 1')).toBeInTheDocument();
    });

    it('shows the error message when the feed fails to load', async () => {
        vi.mocked(fetchFeed).mockRejectedValue(new Error('boom'));
        const { container } = renderFeed('show', '/show/1');

        expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument();
        expect(container.querySelector('.loader')).not.toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('numbers the list from (page - 1) * 30 + 1', async () => {
        vi.mocked(fetchFeed).mockResolvedValue(makeStories(30));
        renderFeed('news', '/news/3');

        const list = await screen.findByRole('list');
        expect(fetchFeed).toHaveBeenCalledWith('news', 3, expect.any(AbortSignal));
        expect(list).toHaveAttribute('start', '61');
    });

    it('hides Prev on page 1 and shows More when there are 30 items', async () => {
        vi.mocked(fetchFeed).mockResolvedValue(makeStories(30));
        renderFeed('newest', '/newest/1');

        expect(await screen.findByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/newest/2');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });

    it('shows Prev after page 1 and hides More with fewer than 30 items', async () => {
        vi.mocked(fetchFeed).mockResolvedValue(makeStories(12));
        renderFeed('ask', '/ask/2');

        expect(await screen.findByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/ask/1');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('navigates and refetches when More is clicked, then scrolls to top', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo');
        vi.mocked(fetchFeed).mockImplementation(async (_type, page) => makeStories(30, (page - 1) * 30 + 1));
        const { user } = renderFeed('news', '/news/1');

        await user.click(await screen.findByRole('link', { name: 'More ›' }));

        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenLastCalledWith('news', 2, expect.any(AbortSignal));
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        expect(scrollTo).toHaveBeenCalledTimes(2);
    });

    it('does not scroll when the load fails', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo');
        vi.mocked(fetchFeed).mockRejectedValue(new Error('boom'));
        renderFeed('news', '/news/1');

        await screen.findByText('Could not load news stories.');
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('shows the jobs header without the list margin on /jobs', async () => {
        vi.mocked(fetchFeed).mockResolvedValue(makeStories(2));
        renderFeed('jobs', '/jobs/1');

        const list = await screen.findByRole('list');
        expect(screen.getByText(/These are jobs at startups that were funded by Y Combinator/)).toHaveClass(
            'job-header'
        );
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(list).not.toHaveClass('listMargin');
    });

    it('does not show the jobs header on other feeds', async () => {
        vi.mocked(fetchFeed).mockResolvedValue(makeStories(2));
        renderFeed('news', '/news/1');

        expect(await screen.findByRole('list')).toHaveClass('listMargin');
        expect(screen.queryByText(/These are jobs at startups/)).not.toBeInTheDocument();
    });

    it('uses page 1 semantics from the route param', async () => {
        vi.mocked(fetchFeed).mockResolvedValue(makeStories(1));
        renderFeed('news', '/news/1');

        expect(await screen.findByRole('list')).toHaveAttribute('start', '1');
    });

    it('refetches when the feed type changes and ignores stale responses', async () => {
        const newsRequest = deferred<Story[]>();
        const jobsRequest = deferred<Story[]>();
        vi.mocked(fetchFeed).mockImplementation((type) =>
            type === 'news' ? newsRequest.promise : jobsRequest.promise
        );

        let setFeedType!: (type: FeedType) => void;
        function Harness() {
            const [feedType, set] = useState<FeedType>('news');
            setFeedType = set;
            return <FeedPage feedType={feedType} />;
        }
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/x/1']}>
                    <Routes>
                        <Route path="/x/:page" element={<Harness />} />
                    </Routes>
                    <LocationDisplay />
                </MemoryRouter>
            </SettingsProvider>
        );

        const newsSignal = vi.mocked(fetchFeed).mock.calls[0][2];
        act(() => setFeedType('jobs'));
        expect(fetchFeed).toHaveBeenLastCalledWith('jobs', 1, expect.any(AbortSignal));
        expect(newsSignal?.aborted).toBe(true);

        await act(async () => newsRequest.resolve([makeStory({ id: 1, title: 'Stale news story' })]));
        expect(screen.queryByText('Stale news story')).not.toBeInTheDocument();

        await act(async () => jobsRequest.resolve([makeStory({ id: 2, title: 'Fresh job', type: 'job' })]));
        expect(screen.getByText('Fresh job')).toBeInTheDocument();
        expect(screen.queryByText('Stale news story')).not.toBeInTheDocument();
    });

    it('shows the loader again while the next page loads', async () => {
        const page2 = deferred<Story[]>();
        vi.mocked(fetchFeed).mockImplementation((_type, page) =>
            page === 1 ? Promise.resolve(makeStories(30)) : page2.promise
        );
        const { user, container } = renderFeed('news', '/news/1');

        await user.click(await screen.findByRole('link', { name: 'More ›' }));
        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();

        await act(async () => page2.resolve(makeStories(5, 31)));
        await waitFor(() => expect(screen.getByText('Story 31')).toBeInTheDocument());
    });
});
