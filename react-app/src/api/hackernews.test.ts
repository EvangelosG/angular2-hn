import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

function mockFetch(handler: (url: string) => unknown) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => ({
    ok: true,
    status: 200,
    json: async () => handler(String(input)),
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hackernews api', () => {
  it('requests the feed for a given type and page', async () => {
    const fetchMock = mockFetch(() => [{ id: 1 }]);

    const stories = await fetchFeed('news', 2);

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    expect(stories).toHaveLength(1);
  });

  it('requests a user by id', async () => {
    const fetchMock = mockFetch(() => ({ id: 'pg' }));

    const user = await fetchUser('pg');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
    expect(user.id).toBe('pg');
  });

  it('resolves poll options and accumulates the vote count', async () => {
    mockFetch((url) => {
      if (url.endsWith('/item/10')) {
        return { id: 10, type: 'poll', poll: [{}, {}] };
      }
      return { points: url.endsWith('/item/11') ? 3 : 4, content: url };
    });

    const story = await fetchItemContent(10);

    expect(story.poll.map((option) => option.points)).toEqual([3, 4]);
    expect(story.poll_votes_count).toBe(7);
  });

  it('leaves non-poll stories untouched', async () => {
    mockFetch(() => ({ id: 5, type: 'story', title: 'Hello' }));

    const story = await fetchItemContent(5);

    expect(story.poll_votes_count).toBeUndefined();
    expect(story.title).toBe('Hello');
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }))
    );

    await expect(fetchUser('pg')).rejects.toThrow('failed with status 500');
  });
});
