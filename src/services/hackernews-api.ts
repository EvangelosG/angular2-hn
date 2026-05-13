import fetch from 'unfetch';

import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }
    return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll' && Array.isArray(story.poll) && story.poll.length > 0) {
        const numberOfPollOptions = story.poll.length;
        const polls = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1))
        );
        story.poll = polls;
        story.poll_votes_count = polls.reduce((sum, p) => sum + (p?.points ?? 0), 0);
    }
    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
    return fetchJson<User>(`${BASE_URL}/user/${id}`);
}
