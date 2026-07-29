import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { baseUrl, fetchFeed, fetchItemContent, fetchUser } from './hnApi';

function mockFetch(responses: Record<string, unknown>) {
    return vi.fn((url: string) => {
        if (!(url in responses)) {
            return Promise.reject(new Error(`Unexpected request: ${url}`));
        }
        return Promise.resolve({ json: () => Promise.resolve(responses[url]) } as Response);
    });
}

describe('hnApi', () => {
    let fetchMock: ReturnType<typeof mockFetch>;

    beforeEach(() => {
        fetchMock = mockFetch({});
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('requests a paginated feed', async () => {
        const stories = [{ id: 1 }];
        fetchMock = mockFetch({ [`${baseUrl}/news?page=2`]: stories });
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
    });

    it('requests a user profile', async () => {
        const user = { id: 'pg', karma: 100 };
        fetchMock = mockFetch({ [`${baseUrl}/user/pg`]: user });
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchUser('pg')).resolves.toEqual(user);
    });

    it('leaves non-poll items untouched', async () => {
        const story = { id: 10, type: 'story' };
        fetchMock = mockFetch({ [`${baseUrl}/item/10`]: story });
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchItemContent(10)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('resolves poll options and accumulates the vote count', async () => {
        fetchMock = mockFetch({
            [`${baseUrl}/item/10`]: { id: 10, type: 'poll', poll: [{}, {}] },
            [`${baseUrl}/item/11`]: { points: 3, content: 'first option' },
            [`${baseUrl}/item/12`]: { points: 4, content: 'second option' },
        });
        vi.stubGlobal('fetch', fetchMock);

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { points: 3, content: 'first option' },
            { points: 4, content: 'second option' },
        ]);
        expect(story.poll_votes_count).toBe(7);
    });
});
