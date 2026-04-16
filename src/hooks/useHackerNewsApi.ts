import { useState, useEffect } from 'react';
import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface FeedState {
  items: Story[] | null;
  loading: boolean;
  error: string;
}

interface ItemState {
  item: Story | null;
  loading: boolean;
  error: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string;
}

export function useFeed(feedType: string, page: number): FeedState {
  const [state, setState] = useState<FeedState>({
    items: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ items: null, loading: true, error: '' });

    fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: Story[]) => {
        setState({ items: data, loading: false, error: '' });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          items: null,
          loading: false,
          error: `Could not load ${feedType} stories.`,
        });
      });

    return () => controller.abort();
  }, [feedType, page]);

  return state;
}

export function useItemDetails(id: number): ItemState {
  const [state, setState] = useState<ItemState>({
    item: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ item: null, loading: true, error: '' });

    fetch(`${BASE_URL}/item/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then(async (story: Story) => {
        if (story.type === 'poll' && story.poll) {
          const numberOfPollOptions = story.poll.length;
          let pollVotesCount = 0;
          const pollResults: PollResult[] = [];

          for (let i = 1; i <= numberOfPollOptions; i++) {
            try {
              const res = await fetch(`${BASE_URL}/item/${story.id + i}`, {
                signal: controller.signal,
              });
              const pollResult: PollResult = await res.json();
              pollResults.push(pollResult);
              pollVotesCount += pollResult.points;
            } catch {
              // skip failed poll fetches
            }
          }
          story.poll = pollResults;
          story.poll_votes_count = pollVotesCount;
        }
        setState({ item: story, loading: false, error: '' });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          item: null,
          loading: false,
          error: 'Could not load item comments.',
        });
      });

    return () => controller.abort();
  }, [id]);

  return state;
}

export function useUser(id: string): UserState {
  const [state, setState] = useState<UserState>({
    user: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ user: null, loading: true, error: '' });

    fetch(`${BASE_URL}/user/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: User) => {
        setState({ user: data, loading: false, error: '' });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          user: null,
          loading: false,
          error: `Could not load user ${id}.`,
        });
      });

    return () => controller.abort();
  }, [id]);

  return state;
}
