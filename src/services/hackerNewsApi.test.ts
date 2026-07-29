import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent } from './hackerNewsApi';

function mockFetch(responses: Record<string, unknown>) {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        const body = responses[url];
        if (body === undefined) {
            return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) } as Response);
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('requests the given feed type and page', async () => {
        const fetchMock = mockFetch({
            'https://node-hnapi.herokuapp.com/news?page=2': [{ id: 1 }],
        });

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
    });

    it('rejects when the request fails', async () => {
        mockFetch({});
        await expect(fetchFeed('news', 1)).rejects.toThrow();
    });
});

describe('fetchItemContent', () => {
    it('resolves poll options and accumulates the vote count', async () => {
        mockFetch({
            'https://node-hnapi.herokuapp.com/item/100': {
                id: 100,
                type: 'poll',
                poll: [{}, {}],
            },
            'https://node-hnapi.herokuapp.com/item/101': { content: 'first', points: 10 },
            'https://node-hnapi.herokuapp.com/item/102': { content: 'second', points: 5 },
        });

        const story = await fetchItemContent(100);

        expect(story.poll).toEqual([
            { content: 'first', points: 10 },
            { content: 'second', points: 5 },
        ]);
        expect(story.poll_votes_count).toBe(15);
    });

    it('leaves non-poll stories untouched', async () => {
        const fetchMock = mockFetch({
            'https://node-hnapi.herokuapp.com/item/200': { id: 200, type: 'story', title: 'A story' },
        });

        const story = await fetchItemContent(200);

        expect(story.title).toBe('A story');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
