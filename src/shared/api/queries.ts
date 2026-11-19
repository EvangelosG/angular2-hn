import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Feed } from '../models/feed-type.type';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

export function useFeed(feedType: Feed, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: async ({ signal }) => ({ page, items: await fetchFeed(feedType, page, signal) }),
        placeholderData: keepPreviousData,
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
