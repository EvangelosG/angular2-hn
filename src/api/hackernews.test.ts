import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

function mockFetch(responses: Record<string, unknown>) {
    return vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (!(url in responses)) {
            return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) } as Response);
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(responses[url]) } as Response);
    });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('hackernews api', () => {
    it('requests a paginated feed', async () => {
        const fetchMock = mockFetch({ [`${BASE_URL}/news?page=2`]: [{ id: 1 }] });
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('rejects on a failed response', async () => {
        vi.stubGlobal('fetch', mockFetch({}));

        await expect(fetchUser('missing')).rejects.toThrow('failed with status 404');
    });

    it('resolves poll options and sums their votes', async () => {
        vi.stubGlobal(
            'fetch',
            mockFetch({
                [`${BASE_URL}/item/10`]: { id: 10, type: 'poll', poll: [{}, {}] },
                [`${BASE_URL}/item/11`]: { content: 'first', points: 3 },
                [`${BASE_URL}/item/12`]: { content: 'second', points: 4 },
            })
        );

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { content: 'first', points: 3 },
            { content: 'second', points: 4 },
        ]);
        expect(story.poll_votes_count).toBe(7);
    });

    it('passes the abort signal through', async () => {
        const fetchMock = mockFetch({ [`${BASE_URL}/item/1`]: { id: 1, type: 'link' } });
        vi.stubGlobal('fetch', fetchMock);
        const controller = new AbortController();

        await fetchItemContent(1, controller.signal);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/1`, { signal: controller.signal });
    });
});
