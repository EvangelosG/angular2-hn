import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import * as api from '../../hooks/useHackerNewsApi';
import type { Story } from '../../models';
import Feed from './Feed';

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        ...overrides,
    };
}

function renderFeedAt(path: string, feedType = 'news') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Routes>
                    <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('renders the Loader while pending then renders the items', async () => {
        const stories = [makeStory(1), makeStory(2)];
        const fetchSpy = vi.spyOn(api, 'fetchFeed').mockResolvedValue(stories);

        renderFeedAt('/news/1');

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Story 1')).toBeInTheDocument();
        });
        expect(screen.getByText('Story 2')).toBeInTheDocument();
        expect(fetchSpy).toHaveBeenCalledWith('news', 1);
    });

    it('passes feedType and page derived from the URL to fetchFeed', async () => {
        const fetchSpy = vi.spyOn(api, 'fetchFeed').mockResolvedValue([]);

        renderFeedAt('/show/3', 'show');

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith('show', 3);
        });
    });

    it('renders the ErrorMessage when the fetch rejects', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('boom'));

        renderFeedAt('/news/1');

        await waitFor(() => {
            expect(screen.getByText(/could not load news stories/i)).toBeInTheDocument();
        });
    });

    it('does not render a Prev link on page 1 and renders More when 30 items are returned', async () => {
        const stories = Array.from({ length: 30 }, (_, idx) => makeStory(idx + 1));
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(stories);

        renderFeedAt('/news/1');

        await waitFor(() => {
            expect(screen.getByText(/More/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/Prev/i)).not.toBeInTheDocument();
        const more = screen.getByText(/More/i);
        expect(more.closest('a')).toHaveAttribute('href', '/news/2');
    });

    it('renders Prev on page 2 and omits More when fewer than 30 items returned', async () => {
        const stories = Array.from({ length: 5 }, (_, idx) => makeStory(idx + 1));
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(stories);

        renderFeedAt('/news/2');

        await waitFor(() => {
            expect(screen.getByText(/Prev/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/More/i)).not.toBeInTheDocument();
        const prev = screen.getByText(/Prev/i);
        expect(prev.closest('a')).toHaveAttribute('href', '/news/1');
    });

    it('renders the jobs header paragraph when feedType is jobs', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue([]);

        renderFeedAt('/jobs/1', 'jobs');

        await waitFor(() => {
            expect(screen.getByText(/These are jobs at startups/i)).toBeInTheDocument();
        });
    });
});
