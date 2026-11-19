import { useParams } from 'react-router-dom';

import type { FeedName } from '../../models';

export interface FeedPageProps {
    feedType: FeedName;
}

// Placeholder: replaced by the feed agent (port of feeds/feed + feeds/item).
export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<'page'>();
    return (
        <div>
            Feed placeholder: {feedType} page {page}
        </div>
    );
}
