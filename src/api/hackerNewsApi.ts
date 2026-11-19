import type { PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi's /user endpoint is down; users come from the HNPWA API.
export const HN_USER_API_BASE_URL = 'https://api.hnpwa.com/v0';

export interface FetchOptions {
    signal?: AbortSignal;
}

export class ApiError extends Error {
    readonly status: number;
    readonly url: string;

    constructor(status: number, url: string) {
        super(`Request to ${url} failed with status ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.url = url;
    }
}

async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const res = await fetch(url, { signal: options.signal });
    if (!res.ok) {
        throw new ApiError(res.status, url);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, options?: FetchOptions): Promise<Story[]> {
    return fetchJson<Story[]>(`${HN_API_BASE_URL}/${feedType}?page=${page}`, options);
}

export function fetchPollContent(id: number, options?: FetchOptions): Promise<PollResult> {
    return fetchJson<PollResult>(`${HN_API_BASE_URL}/item/${id}`, options);
}

/**
 * Fetches an item with its comment tree. For polls, the poll options (items
 * id+1..id+n) are fetched too, replacing `poll` and setting `poll_votes_count`.
 */
export async function fetchItemContent(id: number | string, options?: FetchOptions): Promise<Story> {
    const story = await fetchJson<Story>(`${HN_API_BASE_URL}/item/${id}`, options);
    if (story.type === 'poll') {
        const optionCount = story.poll?.length ?? 0;
        const poll = await Promise.all(
            Array.from({ length: optionCount }, (_, i) => fetchPollContent(story.id + i + 1, options))
        );
        story.poll = poll;
        story.poll_votes_count = poll.reduce((total, option) => total + (option.points ?? 0), 0);
    }
    return story;
}

export function fetchUser(id: string, options?: FetchOptions): Promise<User> {
    return fetchJson<User>(`${HN_USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, options);
}
