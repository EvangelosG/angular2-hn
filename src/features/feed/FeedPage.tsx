import { useParams } from 'react-router-dom';

import type { FeedType } from '../../models/feedType';

export interface FeedPageProps {
    feedType: FeedType;
}

// STUB (owned by the feed agent): port of feeds/feed + feeds/item.
export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();
    return (
        <div data-testid="feed-page-stub">
            {feedType} feed, page {page}
        </div>
    );
}
