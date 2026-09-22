import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import type { Story, User } from './models';
import { renderAt } from './test/render';

vi.mock('./api/hackernews', () => ({
    fetchFeed: vi.fn(),
    fetchItemContent: vi.fn(),
    fetchUser: vi.fn(),
}));

import { fetchFeed, fetchItemContent, fetchUser } from './api/hackernews';

const mockedFetchFeed = vi.mocked(fetchFeed);
const mockedFetchItemContent = vi.mocked(fetchItemContent);
const mockedFetchUser = vi.mocked(fetchUser);

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Hello HN',
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

const user: User = { id: 'pg', crated_time: 0, created: '19 years ago', karma: 1, avg: 0, about: '' };

function activeHeaderLinks(): string[] {
    return Array.from(document.querySelectorAll('#header a.active')).map((a) => a.getAttribute('href') ?? '');
}

describe('App routing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedFetchFeed.mockResolvedValue([story()]);
        mockedFetchItemContent.mockResolvedValue(story({ id: 42, title: 'Item 42', url: '' }));
        mockedFetchUser.mockResolvedValue(user);
    });

    it('redirects / to /news/1 and renders the news feed inside the layout shell', async () => {
        renderAt('/', <App />);

        expect(await screen.findByText('Hello HN')).toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
        expect(document.querySelector('#header')).toBeInTheDocument();
        expect(document.querySelector('#footer')).toBeInTheDocument();
        expect(activeHeaderLinks()).toEqual(['/news/1']);
    });

    it.each([
        ['/newest/1', 'newest', 1],
        ['/show/1', 'show', 1],
        ['/ask/3', 'ask', 3],
        ['/jobs/2', 'jobs', 2],
    ])('%s fetches the %s feed page %i', async (path, feed, page) => {
        renderAt(path, <App />);

        await waitFor(() => expect(mockedFetchFeed).toHaveBeenCalledWith(feed, page, expect.any(AbortSignal)));
        expect(await screen.findByText('Hello HN')).toBeInTheDocument();
        expect(document.querySelector('ol')).toHaveAttribute('start', String((page - 1) * 30 + 1));
    });

    it('highlights the active feed link only on page 1, like the Angular header', async () => {
        renderAt('/show/1', <App />);
        await screen.findByText('Hello HN');
        expect(activeHeaderLinks()).toEqual(['/show/1']);
    });

    it('redirects a feed without a page to page 1', async () => {
        renderAt('/jobs', <App />);

        await waitFor(() => expect(mockedFetchFeed).toHaveBeenCalledWith('jobs', 1, expect.any(AbortSignal)));
        expect(activeHeaderLinks()).toEqual(['/jobs/1']);
    });

    it('redirects unknown paths to /news/1', async () => {
        renderAt('/does/not/exist', <App />);

        await waitFor(() => expect(mockedFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
        expect(activeHeaderLinks()).toEqual(['/news/1']);
    });

    it('lazily renders the item details page for /item/:id', async () => {
        renderAt('/item/42', <App />);

        // title is rendered twice: once in the mobile header, once in the laptop header
        expect(await screen.findAllByText('Item 42')).toHaveLength(2);
        expect(mockedFetchItemContent).toHaveBeenCalledWith(42, expect.any(AbortSignal));
        expect(mockedFetchFeed).not.toHaveBeenCalled();
        expect(activeHeaderLinks()).toEqual([]);
    });

    it('lazily renders the user page for /user/:id', async () => {
        renderAt('/user/pg', <App />);

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(mockedFetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
        expect(mockedFetchFeed).not.toHaveBeenCalled();
    });

    it('applies the persisted theme class to the outermost element', async () => {
        localStorage.setItem('theme', 'amoledblack');
        const { container } = renderAt('/news/1', <App />);

        await screen.findByText('Hello HN');
        expect(container.firstElementChild).toHaveClass('amoledblack');
        expect(container.querySelectorAll('.wrapper')).toHaveLength(1);
    });
});
