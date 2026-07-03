import { Story } from '../types/story';
import { PollResult } from '../types/poll-result';
import { User } from '../types/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  return response.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  const story = await response.json();
  if (story.type === 'poll' && story.poll) {
    const pollPromises = story.poll.map((_: unknown, i: number) =>
      fetchPollContent(story.id + i + 1)
    );
    const pollResults = await Promise.all(pollPromises);
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce(
      (sum: number, p: PollResult) => sum + p.points,
      0
    );
  }
  return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  return response.json();
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  return response.json();
}
