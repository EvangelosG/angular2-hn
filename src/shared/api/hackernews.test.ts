import { afterEach, describe, expect, it, vi } from 'vitest';

import { jsonResponse, makeStory, pg } from '../../test/fixtures';
import { BASE_URL, USER_BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

afterEach(() => fetchMock.mockReset());

const requestedUrls = () => fetchMock.mock.calls.map(([url]) => url);

describe('hackernews api', () => {
    it('fetches a feed page', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse([makeStory()]));
        const stories = await fetchFeed('newest', 3);
        expect(requestedUrls()).toEqual([`${BASE_URL}/newest?page=3`]);
        expect(stories).toHaveLength(1);
    });

    it('fetches an item without extra requests for non-polls', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(makeStory({ id: 7 })));
        const story = await fetchItemContent(7);
        expect(requestedUrls()).toEqual([`${BASE_URL}/item/7`]);
        expect(story.id).toBe(7);
    });

    it('loads poll options and totals their votes', async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse(makeStory({ id: 10, type: 'poll', poll: [{}, {}] as never })))
            .mockResolvedValueOnce(jsonResponse({ points: 3, content: 'Yes' }))
            .mockResolvedValueOnce(jsonResponse({ points: 5, content: 'No' }));
        const story = await fetchItemContent(10);
        expect(requestedUrls()).toEqual([`${BASE_URL}/item/10`, `${BASE_URL}/item/11`, `${BASE_URL}/item/12`]);
        expect(story.poll).toEqual([
            { points: 3, content: 'Yes' },
            { points: 5, content: 'No' },
        ]);
        expect(story.poll_votes_count).toBe(8);
    });

    it('fetches users from the HNPWA api', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(pg));
        expect(await fetchUser('pg')).toEqual(pg);
        expect(requestedUrls()).toEqual([`${USER_BASE_URL}/user/pg.json`]);
    });

    it('rejects unknown users', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(null));
        await expect(fetchUser('nobody')).rejects.toThrow('User nobody not found');
    });

    it('rejects on HTTP errors', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));
        await expect(fetchFeed('news', 1)).rejects.toThrow('Request failed (500)');
    });
});
