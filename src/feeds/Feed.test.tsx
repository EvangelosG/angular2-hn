import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed } from '../api/hackernews';
import { SettingsProvider } from '../context/SettingsProvider';
import type { Story } from '../models/story';
import { Feed } from './Feed';

vi.mock('../api/hackernews', () => ({ fetchFeed: vi.fn() }));

const fetchFeedMock = vi.mocked(fetchFeed);

function story(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

function renderFeed(feedType: string, page: number) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
                <Routes>
                    <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

beforeEach(() => {
    window.scrollTo = vi.fn();
});

describe('Feed', () => {
    it('shows the loader until the feed resolves', async () => {
        fetchFeedMock.mockResolvedValue([story(1)]);

        renderFeed('news', 1);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
    });

    it('numbers the list from the current page and only links to pages that exist', async () => {
        fetchFeedMock.mockResolvedValue(Array.from({ length: 30 }, (_, index) => story(index + 1)));

        const { container } = renderFeed('news', 2);

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/3');
    });

    it('hides pagination links on a short first page', async () => {
        fetchFeedMock.mockResolvedValue([story(1)]);

        renderFeed('news', 1);

        await screen.findByText('Story 1');
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
    });

    it('renders the jobs header only for the jobs feed', async () => {
        fetchFeedMock.mockResolvedValue([story(1)]);

        renderFeed('jobs', 1);

        expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
    });

    it('renders an error message when the feed cannot be loaded', async () => {
        fetchFeedMock.mockRejectedValue(new Error('offline'));

        renderFeed('show', 1);

        await waitFor(() => expect(screen.getByText('Could not load show stories.')).toBeInTheDocument());
    });
});
