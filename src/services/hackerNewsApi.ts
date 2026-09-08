import type { PollResult } from '@/models/pollResult';
import type { Story } from '@/models/story';
import type { User } from '@/models/user';

/**
 * Port of src/app/shared/services/hackernews-api.service.ts.
 * Plain fetch + Promises (no RxJS, no Angular DI).
 */
export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status} for ${url}`);
    }
    const body: unknown = await res.json();
    if (body !== null && typeof body === 'object' && 'error' in body) {
        throw new Error(String((body as { error: unknown }).error));
    }
    return body as T;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return lazyFetch<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await lazyFetch<Story>(`${BASE_URL}/item/${id}`);

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;

        const results = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, index) =>
                fetchPollContent(story.id + index + 1)
            )
        );

        results.forEach((pollResults, index) => {
            story.poll[index] = pollResults;
            story.poll_votes_count += pollResults.points;
        });
    }

    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return lazyFetch<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return lazyFetch<User>(`${BASE_URL}/user/${id}`);
}
