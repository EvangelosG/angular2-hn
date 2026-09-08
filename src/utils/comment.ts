/**
 * Port of the Angular `comment` pipe (src/app/shared/pipes/comment.pipe.ts).
 *
 * Usage in JSX: `{formatCommentCount(item.comments_count)}`
 */
export function formatCommentCount(comment: number): string {
    if (comment > 0) {
        const st = comment === 1 ? 'comment' : 'comments';
        return `${comment} ${st}`;
    }
    return 'discuss';
}
