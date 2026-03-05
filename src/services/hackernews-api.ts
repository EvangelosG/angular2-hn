import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
    return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
    const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, signal);
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(
                fetchPollContent(story.id + i, signal).then((pollResult) => {
                    story.poll[i - 1] = pollResult;
                    story.poll_votes_count += pollResult.points;
                })
            );
        }
        await Promise.all(pollPromises);
    }
    return story;
}

export async function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
    return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
    return fetchJson<User>(`${BASE_URL}/user/${id}`, signal);
}
