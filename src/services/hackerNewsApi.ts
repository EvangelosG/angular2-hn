import type { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return getJson<PollResult>(`/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await getJson<Story>(`/item/${id}`);

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, index) => fetchPollContent(story.id + index + 1))
        );

        story.poll_votes_count = 0;
        pollResults.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }

    return story;
}

export function fetchUser(id: string): Promise<User> {
    return getJson<User>(`/user/${id}`);
}
