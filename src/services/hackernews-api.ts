import { Story, PollResult, User } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    const story: Story = await res.json();
    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
            const pollResult = await fetchPollContent(story.id + i);
            story.poll[i - 1] = pollResult;
            story.poll_votes_count += pollResult.points;
        }
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    return res.json();
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`);
    return res.json();
}
