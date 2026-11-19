import type { Comment } from './comment';
import type { FeedType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
    id: number;
    title: string;
    points: number | null;
    user: string | null;
    time: number;
    time_ago: string;
    type: FeedType;
    url: string;
    domain?: string;
    /** HTML body for Ask HN / text posts (item endpoint). */
    content?: string;
    text?: string;
    comments: Comment[];
    comments_count: number;
    poll?: PollResult[];
    /** Sum of poll option points; set by fetchItemContent for polls. */
    poll_votes_count?: number;
    deleted?: boolean;
    dead?: boolean;
}
