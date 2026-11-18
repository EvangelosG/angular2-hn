import type { FeedType } from '../models/feedType';
import type { PollResult } from '../models/pollResult';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

/** True when the error comes from an aborted request; callers should ignore it. */
export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

/**
 * Fetches an item with its comment tree. For polls, like Angular, each option `story.id + i`
 * is fetched and `poll` / `poll_votes_count` are filled in before resolving.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const original = story.poll as Array<PollResult & { item?: string }>;
        const results = await Promise.allSettled(original.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
        signal?.throwIfAborted();
        story.poll = results.map((result, i) =>
            result.status === 'fulfilled'
                ? result.value
                : { points: original[i].points, content: original[i].content ?? original[i].item ?? '' }
        );
        story.poll_votes_count = story.poll.reduce((total, option) => total + option.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`, signal);
}
