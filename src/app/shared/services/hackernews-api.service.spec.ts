import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function stubFetch(responses: Record<string, unknown>) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!(url in responses)) {
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    }
    return Promise.resolve(jsonResponse(responses[url]));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function requestedUrl(fetchMock: ReturnType<typeof stubFetch>, call = 0): string {
  const input = fetchMock.mock.calls[call][0];
  return typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;

  beforeEach(() => {
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a feed page', async () => {
    const stories = [{ id: 1, title: 'Hello' }];
    const fetchMock = stubFetch({ [`${BASE_URL}/news?page=2`]: stories });

    await expect(firstValueFrom(service.fetchFeed('news', 2))).resolves.toEqual(stories);
    expect(requestedUrl(fetchMock)).toBe(`${BASE_URL}/news?page=2`);
  });

  it('fetches a user', async () => {
    const user = { id: 'pg', karma: 1 };
    stubFetch({ [`${BASE_URL}/user/pg`]: user });

    await expect(firstValueFrom(service.fetchUser('pg'))).resolves.toEqual(user);
  });

  it('fetches a non-poll item without extra requests', async () => {
    const story = { id: 42, type: 'story', title: 'Story' };
    const fetchMock = stubFetch({ [`${BASE_URL}/item/42`]: story });

    const emissions = await lastValueFrom(service.fetchItemContent(42).pipe(toArray()));

    expect(emissions).toEqual([story]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fills in poll options progressively using consecutive ids', async () => {
    const poll = { id: 100, type: 'poll', poll: [{}, {}] };
    const optionA = { points: 3, content: 'A' };
    const optionB = { points: 5, content: 'B' };
    const fetchMock = stubFetch({
      [`${BASE_URL}/item/100`]: poll,
      [`${BASE_URL}/item/101`]: optionA,
      [`${BASE_URL}/item/102`]: optionB,
    });

    const emissions = await lastValueFrom(service.fetchItemContent(100).pipe(toArray()));

    expect(emissions).toHaveLength(3);
    const story: Story = emissions[0];
    expect(emissions.every(emission => emission === story)).toBe(true);
    expect(story.poll).toEqual([optionA, optionB]);
    expect(story.poll_votes_count).toBe(8);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(requestedUrl(fetchMock, 1)).toBe(`${BASE_URL}/item/101`);
    expect(requestedUrl(fetchMock, 2)).toBe(`${BASE_URL}/item/102`);
  });

  it('still emits the poll when one option fails to load', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const poll = { id: 200, type: 'poll', poll: [{}, {}] };
    stubFetch({
      [`${BASE_URL}/item/200`]: poll,
      [`${BASE_URL}/item/202`]: { points: 2, content: 'B' },
    });

    const emissions = await lastValueFrom(service.fetchItemContent(200).pipe(toArray()));

    expect(emissions).toHaveLength(2);
    expect(emissions[0].poll_votes_count).toBe(2);
    expect(consoleError).toHaveBeenCalled();
  });

  it('errors when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(firstValueFrom(service.fetchUser('pg'))).rejects.toThrow('offline');
  });

  it('errors when the body is not valid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html></html>', { status: 500 })));

    await expect(firstValueFrom(service.fetchFeed('news', 1))).rejects.toBeDefined();
  });
});
