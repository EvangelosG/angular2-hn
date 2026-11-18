/** Feed names used in routes (`/news/1`) and in `fetchFeed`. */
export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TYPES: readonly FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];
