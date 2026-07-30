import { afterEach, describe, expect, it, vi } from 'vitest';

import { baseUrl, fetchFeed, fetchItemContent, fetchUser } from './hackerNews';

function mockFetch(responses: Record<string, unknown>) {
  return vi.fn((url: string) => {
    const body = responses[url];
    if (body === undefined) {
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hacker news api', () => {
  it('fetches a page of a feed', async () => {
    vi.stubGlobal('fetch', mockFetch({ [`${baseUrl}/news?page=2`]: [{ id: 1 }] }));

    await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
  });

  it('fetches poll options and sums their points', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [`${baseUrl}/item/10`]: { id: 10, type: 'poll', poll: [{}, {}] },
        [`${baseUrl}/item/11`]: { points: 3, content: 'first' },
        [`${baseUrl}/item/12`]: { points: 4, content: 'second' },
      })
    );

    const story = await fetchItemContent(10);

    expect(story.poll).toEqual([
      { points: 3, content: 'first' },
      { points: 4, content: 'second' },
    ]);
    expect(story.poll_votes_count).toBe(7);
  });

  it('rejects when a request fails', async () => {
    vi.stubGlobal('fetch', mockFetch({}));

    await expect(fetchUser('nobody')).rejects.toThrow();
  });
});
