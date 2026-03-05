import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function apiFetch<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return apiFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await apiFetch<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll' && story.poll && story.poll.length > 0) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises: Promise<void>[] = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(
                fetchPollContent(story.id + i).then((pollResult) => {
                    story.poll[i - 1] = pollResult;
                    story.poll_votes_count += pollResult.points;
                })
            );
        }
        await Promise.all(pollPromises);
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    return apiFetch<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    return apiFetch<User>(`${baseUrl}/user/${id}`);
}
