import { afterEach, describe, expect, it, vi } from 'vitest';

import { baseUrl, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

function mockFetch(handler: (url: string) => unknown) {
    const fetchMock = vi.fn(async (url: string) => ({
        ok: true,
        status: 200,
        json: async () => handler(url),
    }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackernews api', () => {
    it('requests the feed for a given type and page', async () => {
        const fetchMock = mockFetch(() => [{ id: 1, title: 'A story' }]);

        const stories = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/news?page=2`);
        expect(stories).toEqual([{ id: 1, title: 'A story' }]);
    });

    it('requests a user by id', async () => {
        const fetchMock = mockFetch(() => ({ id: 'pg', karma: 100 }));

        const user = await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/user/pg`);
        expect(user.karma).toBe(100);
    });

    it('fills in poll options and the total vote count for polls', async () => {
        mockFetch((url) => {
            if (url === `${baseUrl}/item/10`) {
                return { id: 10, type: 'poll', poll: [{}, {}] };
            }
            if (url === `${baseUrl}/item/11`) {
                return { content: 'First option', points: 30 };
            }
            return { content: 'Second option', points: 12 };
        });

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { content: 'First option', points: 30 },
            { content: 'Second option', points: 12 },
        ]);
        expect(story.poll_votes_count).toBe(42);
    });

    it('leaves non-poll items untouched', async () => {
        const fetchMock = mockFetch(() => ({ id: 10, type: 'story', title: 'A story' }));

        const story = await fetchItemContent(10);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(story.title).toBe('A story');
    });

    it('rejects when the response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })));

        await expect(fetchFeed('news', 1)).rejects.toThrow('503');
    });
});
