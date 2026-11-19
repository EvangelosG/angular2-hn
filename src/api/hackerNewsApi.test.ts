import { ApiError, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackerNewsApi';

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('hackerNewsApi', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('fetchFeed requests the feed page', async () => {
        const stories = [{ id: 1, title: 'A' }];
        fetchMock.mockResolvedValue(jsonResponse(stories));

        await expect(fetchFeed('newest', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/newest?page=2', {
            signal: undefined,
        });
    });

    it('passes the abort signal through', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));
        const controller = new AbortController();

        await fetchFeed('news', 1, { signal: controller.signal });
        expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { signal: controller.signal });
    });

    it('throws ApiError on non-2xx responses', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ error: 'nope' }, 500));

        const error = await fetchFeed('news', 1).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
    });

    it('rejects when the network fails', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(fetchFeed('news', 1)).rejects.toThrow('Failed to fetch');
    });

    it('fetchItemContent returns non-poll items untouched', async () => {
        const item = { id: 10, type: 'link', title: 'Story', comments: [] };
        fetchMock.mockResolvedValue(jsonResponse(item));

        await expect(fetchItemContent(10)).resolves.toEqual(item);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/10', { signal: undefined });
    });

    it('fetchItemContent fetches poll options and totals the votes', async () => {
        fetchMock.mockImplementation((url: string) => {
            if (url.endsWith('/item/100')) {
                return Promise.resolve(
                    jsonResponse({ id: 100, type: 'poll', poll: [{}, {}], comments: [] })
                );
            }
            if (url.endsWith('/item/101')) {
                return Promise.resolve(jsonResponse({ points: 5, content: 'Yes' }));
            }
            if (url.endsWith('/item/102')) {
                return Promise.resolve(jsonResponse({ points: 7, content: 'No' }));
            }
            return Promise.reject(new Error(`unexpected ${url}`));
        });

        const story = await fetchItemContent('100');
        expect(story.poll).toEqual([
            { points: 5, content: 'Yes' },
            { points: 7, content: 'No' },
        ]);
        expect(story.poll_votes_count).toBe(12);
    });

    it('fetchPollContent requests the option item', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ points: 1, content: 'x' }));

        await expect(fetchPollContent(5)).resolves.toEqual({ points: 1, content: 'x' });
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/5', { signal: undefined });
    });

    it('fetchUser uses the HNPWA API', async () => {
        const user = { id: 'pg', created: '18 years ago', created_time: 1, karma: 100 };
        fetchMock.mockResolvedValue(jsonResponse(user));

        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(fetchMock).toHaveBeenCalledWith('https://api.hnpwa.com/v0/user/pg.json', { signal: undefined });
    });
});
