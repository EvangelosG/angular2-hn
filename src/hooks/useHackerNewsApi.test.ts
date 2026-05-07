import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    fetchFeed,
    fetchItemContent,
    fetchPollContent,
    fetchUser,
    useHackerNewsApi,
} from './useHackerNewsApi';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface MockJsonResponse {
    ok: boolean;
    status: number;
    statusText: string;
    json: () => Promise<unknown>;
}

function jsonResponse(payload: unknown, init?: { status?: number; statusText?: string }): MockJsonResponse {
    const status = init?.status ?? 200;
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: init?.statusText ?? 'OK',
        json: async () => payload,
    };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('fetchFeed', () => {
    it('calls the right URL and returns the parsed JSON', async () => {
        const stories = [{ id: 1, title: 'a' }];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));

        const result = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`);
        expect(result).toEqual(stories);
    });

    it('throws on a non-2xx response', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500, statusText: 'Server Error' }));

        await expect(fetchFeed('news', 1)).rejects.toThrow(/500/);
    });
});

describe('fetchItemContent', () => {
    it('returns the JSON unchanged for a non-poll item', async () => {
        const story = { id: 10, type: 'story', title: 'x' };
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        const result = await fetchItemContent(10);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/10`);
        expect(result).toEqual(story);
    });

    it('aggregates poll option results and computes poll_votes_count', async () => {
        const pollStory = {
            id: 100,
            type: 'poll',
            poll: [
                { points: 0, content: 'placeholder a' },
                { points: 0, content: 'placeholder b' },
                { points: 0, content: 'placeholder c' },
            ],
        };
        fetchMock.mockResolvedValueOnce(jsonResponse(pollStory));
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 5, content: 'option-a' }));
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 7, content: 'option-b' }));
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 1, content: 'option-c' }));

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(fetchMock).toHaveBeenNthCalledWith(1, `${BASE_URL}/item/100`);
        expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/item/101`);
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${BASE_URL}/item/102`);
        expect(fetchMock).toHaveBeenNthCalledWith(4, `${BASE_URL}/item/103`);
        expect(result.poll).toEqual([
            { points: 5, content: 'option-a' },
            { points: 7, content: 'option-b' },
            { points: 1, content: 'option-c' },
        ]);
        expect(result.poll_votes_count).toBe(13);
    });

    it('throws on a non-2xx response', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 404, statusText: 'Not Found' }));

        await expect(fetchItemContent(1)).rejects.toThrow(/404/);
    });
});

describe('fetchPollContent', () => {
    it('calls the right URL and returns the parsed JSON', async () => {
        const payload = { points: 9, content: 'opt' };
        fetchMock.mockResolvedValueOnce(jsonResponse(payload));

        const result = await fetchPollContent(42);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`);
        expect(result).toEqual(payload);
    });

    it('throws on a non-2xx response', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 503, statusText: 'Unavailable' }));

        await expect(fetchPollContent(1)).rejects.toThrow(/503/);
    });
});

describe('fetchUser', () => {
    it('calls the right URL and returns the parsed JSON', async () => {
        const user = { id: 'pg', karma: 100 };
        fetchMock.mockResolvedValueOnce(jsonResponse(user));

        const result = await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`);
        expect(result).toEqual(user);
    });

    it('throws on a non-2xx response', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 401, statusText: 'Unauthorized' }));

        await expect(fetchUser('nobody')).rejects.toThrow(/401/);
    });
});

describe('useHackerNewsApi', () => {
    it('returns an object exposing all four fetch functions', () => {
        const api = useHackerNewsApi();
        expect(api.fetchFeed).toBe(fetchFeed);
        expect(api.fetchItemContent).toBe(fetchItemContent);
        expect(api.fetchPollContent).toBe(fetchPollContent);
        expect(api.fetchUser).toBe(fetchUser);
    });
});
