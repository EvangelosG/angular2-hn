import { BASE_URL, USER_BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';
import { makeStory, user } from '../../test/fixtures';

function mockFetch(responses: Record<string, unknown>) {
    const fetchMock = vi.fn(async (url: string) => {
        if (!(url in responses)) {
            return new Response('not found', { status: 404 });
        }
        return new Response(JSON.stringify(responses[url]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackernews api', () => {
    it('fetches a feed page', async () => {
        const stories = [makeStory()];
        const fetchMock = mockFetch({ [`${BASE_URL}/show?page=2`]: stories });
        await expect(fetchFeed('show', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/show?page=2`, expect.anything());
    });

    it('rejects on HTTP errors', async () => {
        mockFetch({});
        await expect(fetchFeed('news', 1)).rejects.toThrow('404');
    });

    it('fills in poll options and the vote total for polls', async () => {
        const poll = makeStory({
            id: 10,
            type: 'poll',
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
            ],
        });
        mockFetch({
            [`${BASE_URL}/item/10`]: poll,
            [`${BASE_URL}/item/11`]: { points: 5, content: 'Yes' },
            [`${BASE_URL}/item/12`]: { points: 3, content: 'No' },
        });
        const result = await fetchItemContent(10);
        expect(result.poll).toEqual([
            { points: 5, content: 'Yes' },
            { points: 3, content: 'No' },
        ]);
        expect(result.poll_votes_count).toBe(8);
    });

    it('does not fetch poll options for regular stories', async () => {
        const fetchMock = mockFetch({ [`${BASE_URL}/item/1`]: makeStory() });
        await fetchItemContent(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetches users from the HNPWA API', async () => {
        mockFetch({ [`${USER_BASE_URL}/user/pg.json`]: user });
        await expect(fetchUser('pg')).resolves.toEqual(user);
    });
});
