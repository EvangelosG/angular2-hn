export type FeedType = 'poll' | 'story' | 'job' | 'link' | 'ask' | 'pollopt';

export const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;
export type Feed = (typeof FEEDS)[number];
