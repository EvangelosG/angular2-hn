import type { PollResult, Story, User } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchPollContent(id: number | string): Promise<PollResult> {
    return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number | string): Promise<Story> {
    const story = await getJson<Story>(`${BASE_URL}/item/${id}`);
    if (story.type === 'poll' && story.poll && story.poll.length > 0) {
        const numberOfPollOptions = story.poll.length;
        const pollOptionIds: number[] = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollOptionIds.push(Number(story.id) + i);
        }
        const pollResults = await Promise.all(pollOptionIds.map((pollId) => fetchPollContent(pollId)));
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((sum, result) => sum + (result.points ?? 0), 0);
    }
    return story;
}

export async function fetchUser(id: string): Promise<User> {
    return getJson<User>(`${BASE_URL}/user/${id}`);
}

export function useHackerNewsApi() {
    return {
        fetchFeed,
        fetchItemContent,
        fetchPollContent,
        fetchUser,
    };
}
