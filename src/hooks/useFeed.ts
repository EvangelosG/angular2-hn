import { useEffect, useState } from 'react';

import type { Story } from '../models';
import { fetchFeed } from '../services/hackerNewsApi';

interface FeedState {
    key: string;
    items?: Story[];
    errorMessage: string;
}

export function useFeed(feedType: string, page: number) {
    const key = `${feedType}/${page}`;
    const [state, setState] = useState<FeedState>({ key, errorMessage: '' });

    useEffect(() => {
        let cancelled = false;

        fetchFeed(feedType, page)
            .then((items) => {
                if (cancelled) {
                    return;
                }
                setState({ key: `${feedType}/${page}`, items, errorMessage: '' });
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setState({ key: `${feedType}/${page}`, errorMessage: `Could not load ${feedType} stories.` });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [feedType, page]);

    // Anything loaded for a previous feed/page is stale, so the loader shows again while refetching.
    return state.key === key ? { items: state.items, errorMessage: state.errorMessage } : { errorMessage: '' };
}
