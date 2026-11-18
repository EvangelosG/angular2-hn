import type { Comment } from './comment';
import type { ItemType } from './itemType';
import type { PollResult } from './pollResult';

export interface Story {
    id: number;
    title: string;
    /** null for job posts */
    points: number | null;
    /** null for job posts */
    user: string | null;
    time: number;
    time_ago: string;
    type: ItemType;
    /** Absolute URL, or `item?id=<id>` for self posts (ask/poll/text jobs). */
    url: string;
    domain?: string;
    /** HTML body of self posts (item endpoint only). */
    content?: string;
    /** Item endpoint only; feed endpoints omit it. */
    comments?: Comment[];
    comments_count: number;
    /** Poll options; filled with full option content by `fetchItemContent`. */
    poll?: PollResult[];
    /** Sum of poll option points; set by `fetchItemContent` for polls. */
    poll_votes_count?: number;
    deleted?: boolean;
    dead?: boolean;
}
