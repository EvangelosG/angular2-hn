import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonResponse, makeStory } from '../test/fixtures';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser, isAbortError } from './hackerNewsApi';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackerNewsApi', () => {
    it('fetchFeed requests the feed page and resolves the stories', async () => {
        const stories = [makeStory({ id: 1 }), makeStory({ id: 2 })];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));

        await expect(fetchFeed('newest', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/newest?page=2`, { signal: undefined });
    });

    it('passes the AbortSignal through to fetch', async () => {
        const controller = new AbortController();
        fetchMock.mockResolvedValueOnce(jsonResponse([]));

        await fetchFeed('news', 1, controller.signal);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=1`, { signal: controller.signal });
    });

    it('rejects on non-OK responses', async () => {
        fetchMock.mockResolvedValueOnce(new Response('Cannot GET /user/pg', { status: 404 }));

        await expect(fetchUser('pg')).rejects.toThrow(/status 404/);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
    });

    it('rejects on network errors', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
        await expect(fetchFeed('ask', 1)).rejects.toThrow('Failed to fetch');
    });

    it('fetchItemContent resolves non-poll items as returned', async () => {
        const story = makeStory({ id: 42, comments: [] });
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        await expect(fetchItemContent(42)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`, { signal: undefined });
    });

    it('fetchItemContent fetches each poll option (id + i) and totals the votes', async () => {
        const poll = makeStory({
            id: 100,
            type: 'poll',
            poll: [
                { points: 1, content: 'a' },
                { points: 2, content: 'b' },
            ],
        });
        fetchMock.mockImplementation(async (input) => {
            const url = String(input);
            if (url.endsWith('/item/100')) return jsonResponse(poll);
            if (url.endsWith('/item/101')) return jsonResponse({ id: 101, points: 10, content: '<p>Option A</p>' });
            if (url.endsWith('/item/102')) return jsonResponse({ id: 102, points: 30, content: '<p>Option B</p>' });
            return new Response('', { status: 404 });
        });

        const item = await fetchItemContent(100);

        expect(item.poll).toEqual([
            expect.objectContaining({ points: 10, content: '<p>Option A</p>' }),
            expect.objectContaining({ points: 30, content: '<p>Option B</p>' }),
        ]);
        expect(item.poll_votes_count).toBe(40);
    });

    it('keeps the original poll option when its fetch fails', async () => {
        const poll = { ...makeStory({ id: 200, type: 'poll' }), poll: [{ item: 'Yes', points: 5 }] };
        fetchMock.mockImplementation(async (input) =>
            String(input).endsWith('/item/200') ? jsonResponse(poll) : new Response('', { status: 500 })
        );

        const item = await fetchItemContent(200);
        expect(item.poll).toEqual([{ points: 5, content: 'Yes' }]);
        expect(item.poll_votes_count).toBe(5);
    });

    it('fetchPollContent requests the poll option item', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 3, content: 'x' }));
        await expect(fetchPollContent(7)).resolves.toEqual({ points: 3, content: 'x' });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/7`, { signal: undefined });
    });

    it('isAbortError recognises aborted requests only', () => {
        expect(isAbortError(new DOMException('aborted', 'AbortError'))).toBe(true);
        expect(isAbortError(new Error('boom'))).toBe(false);
    });
});
