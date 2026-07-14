import { useEffect, useState } from 'react';

import { fetchFeed, fetchItemContent, fetchUser } from '../api/hackernews';
import { Story } from '../types/story';
import { User } from '../types/user';

interface AsyncState<T> {
    data: T | null;
    error: string;
}

export function useFeed(feedType: string, page: number) {
    const [state, setState] = useState<AsyncState<Story[]>>({ data: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();
        setState({ data: null, error: '' });

        fetchFeed(feedType, page, controller.signal)
            .then((items) => {
                setState({ data: items, error: '' });
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setState({ data: null, error: `Could not load ${feedType} stories.` });
            });

        return () => controller.abort();
    }, [feedType, page]);

    return state;
}

export function useItem(id: number) {
    const [state, setState] = useState<AsyncState<Story>>({ data: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();
        setState({ data: null, error: '' });
        window.scrollTo(0, 0);

        fetchItemContent(id, controller.signal)
            .then((item) => setState({ data: item, error: '' }))
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setState({ data: null, error: 'Could not load item comments.' });
            });

        return () => controller.abort();
    }, [id]);

    return state;
}

export function useUser(id: string) {
    const [state, setState] = useState<AsyncState<User>>({ data: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();
        setState({ data: null, error: '' });

        fetchUser(id, controller.signal)
            .then((data) => setState({ data, error: '' }))
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setState({ data: null, error: `Could not load user ${id}.` });
            });

        return () => controller.abort();
    }, [id]);

    return state;
}
