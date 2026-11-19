import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';
import type { Feed } from '../models/feed-type.type';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi's /user endpoint is no longer available, so users come from the HNPWA API.
export const USER_BASE_URL = 'https://api.hnpwa.com/v0';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request failed (${res.status}): ${url}`);
    }
    return res.json() as Promise<T>;
}

export function fetchFeed(feedType: Feed, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        story.poll = results;
        story.poll_votes_count = results.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    const user = await getJson<User | null>(`${USER_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
    if (!user) {
        throw new Error(`User ${id} not found`);
    }
    return user;
}
