import { Story } from '../types/story';
import { PollResult } from '../types/poll-result';
import { User } from '../types/user';

const BASE_URL = 'https://api.hnpwa.com/v0';

export async function fetchFeed(
    feedType: string,
    page: number,
    signal?: AbortSignal
): Promise<Story[]> {
    const response = await fetch(`${BASE_URL}/${feedType}/${page}.json`, {
        signal,
    });
    if (!response.ok) throw new Error(`Failed to fetch ${feedType} feed`);
    return response.json();
}

export async function fetchItemContent(
    id: number,
    signal?: AbortSignal
): Promise<Story> {
    const response = await fetch(`${BASE_URL}/item/${id}.json`, { signal });
    if (!response.ok) throw new Error(`Failed to fetch item ${id}`);
    const story: Story = await response.json();

    if (story.type === 'poll' && story.poll && story.poll.length > 0) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = Array.from(
            { length: numberOfPollOptions },
            (_, i) => fetchPollContent(story.id + i + 1, signal)
        );
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((result, i) => {
            story.poll[i] = result;
            story.poll_votes_count += result.points;
        });
    }

    return story;
}

export async function fetchPollContent(
    id: number,
    signal?: AbortSignal
): Promise<PollResult> {
    const response = await fetch(`${BASE_URL}/item/${id}.json`, { signal });
    if (!response.ok) throw new Error(`Failed to fetch poll item ${id}`);
    return response.json();
}

export async function fetchUser(
    id: string,
    signal?: AbortSignal
): Promise<User> {
    const response = await fetch(`${BASE_URL}/user/${id}.json`, { signal });
    if (!response.ok) throw new Error(`Failed to fetch user ${id}`);
    return response.json();
}
