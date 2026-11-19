import { useQuery } from '@tanstack/react-query';

import type { FeedName } from '../models/feed-type';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

export function useFeed(feedType: FeedName, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: async ({ signal }) => ({ page, items: await fetchFeed(feedType, page, signal) }),
        // Like the Angular feed, keep the current page on screen while the next one loads.
        placeholderData: (previous) => previous,
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id, signal),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
