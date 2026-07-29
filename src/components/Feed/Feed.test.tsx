import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../context/SettingsProvider';
import type { Story } from '../../models';
import * as api from '../../services/hackerNewsApi';
import { Feed } from './Feed';

function buildStories(count: number): Story[] {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        title: `Story ${index + 1}`,
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        content: '',
        text: '',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    })) as Story[];
}

function renderFeed(page: number) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[`/news/${page}`]}>
                <Routes>
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Feed', () => {
    it('numbers the list from the current page and offers a link to the next page', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(buildStories(30));

        const { container } = renderFeed(2);

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/3');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
        expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    });

    it('hides pagination links on a first, partial page', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(buildStories(12));

        renderFeed(1);

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    });

    it('shows the error message when the feed cannot be loaded', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('offline'));

        renderFeed(1);

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });
});
