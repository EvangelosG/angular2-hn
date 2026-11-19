/** Feed lists served at `/{feedName}/{page}`. */
export const FEED_NAMES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type FeedName = (typeof FEED_NAMES)[number];

export function isFeedName(value: string | undefined): value is FeedName {
    return (FEED_NAMES as readonly string[]).includes(value ?? '');
}
