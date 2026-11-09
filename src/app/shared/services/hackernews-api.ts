import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/:id, so profiles come from the HNPWA API (same response shape).
export const USER_BASE_URL = 'https://api.hnpwa.com/v0';

export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;
export type FeedName = (typeof FEED_TYPES)[number];

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        // Poll options are stored as the items immediately following the poll.
        const poll = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        return {
            ...story,
            poll,
            poll_votes_count: poll.reduce((total, option) => total + option.points, 0),
        };
    }
    return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJson<User>(`${USER_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
