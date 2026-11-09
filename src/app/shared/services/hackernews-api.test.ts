import { jsonResponse, makeStory } from '../../../test/fixtures';
import { BASE_URL, fetchFeed, fetchItemContent, fetchUser, USER_BASE_URL } from './hackernews-api';

describe('hackernews-api', () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => vi.unstubAllGlobals());

    it('fetches a feed page', async () => {
        fetchMock.mockResolvedValue(jsonResponse([makeStory()]));
        const stories = await fetchFeed('newest', 2);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/newest?page=2`, expect.anything());
        expect(stories).toHaveLength(1);
    });

    it('rejects on a non-OK response', async () => {
        fetchMock.mockResolvedValue(new Response('Cannot GET', { status: 404 }));
        await expect(fetchFeed('news', 1)).rejects.toThrow('404');
    });

    it('loads poll options and totals their votes', async () => {
        const poll = makeStory({
            id: 126809,
            type: 'poll',
            poll: [
                { content: 'a', points: 0 },
                { content: 'b', points: 0 },
            ],
        });
        fetchMock.mockImplementation(async (url) => {
            switch (url) {
                case `${BASE_URL}/item/126809`:
                    return jsonResponse(poll);
                case `${BASE_URL}/item/126810`:
                    return jsonResponse({ content: '<p>Yes', points: 73 });
                case `${BASE_URL}/item/126811`:
                    return jsonResponse({ content: '<p>No', points: 27 });
            }
            throw new Error(`unexpected ${String(url)}`);
        });

        const item = await fetchItemContent(126809);

        expect(item.poll).toEqual([
            { content: '<p>Yes', points: 73 },
            { content: '<p>No', points: 27 },
        ]);
        expect(item.poll_votes_count).toBe(100);
    });

    it('does not fetch extra items for non-poll stories', async () => {
        fetchMock.mockResolvedValue(jsonResponse(makeStory({ id: 5 })));
        await fetchItemContent(5);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetches users from the HNPWA API', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'pg', karma: 1, created: '20 years ago', created_time: 0 }));
        const user = await fetchUser('pg');
        expect(fetchMock).toHaveBeenCalledWith(`${USER_BASE_URL}/user/pg.json`, expect.anything());
        expect(user.id).toBe('pg');
    });
});
