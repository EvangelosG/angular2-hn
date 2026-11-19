import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';
import type { FeedName } from '../models/feed-type';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi's /user endpoint no longer responds; the HNPWA API serves the same shape.
export const USER_BASE_URL = 'https://api.hnpwa.com/v0';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll') {
        // Poll options are the items immediately following the poll's id.
        const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((sum, result) => sum + result.points, 0);
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`${USER_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
