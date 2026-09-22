/**
 * Pluralises a comment count the way the Angular `comment` pipe did.
 */
export function formatCommentCount(comment: number): string {
    if (comment > 0) {
        const st = comment === 1 ? 'comment' : 'comments';
        return `${comment} ${st}`;
    }
    return 'discuss';
}

/**
 * Prepares HN-supplied comment/story HTML for `dangerouslySetInnerHTML`.
 *
 * Angular rendered it verbatim through `[innerHTML]`; the only extra work here
 * is honouring the "open links in new tab" setting, which Angular applied via
 * `[attr.target]` / `[attr.rel]` on the links it controlled.
 */
export function renderCommentHtml(content: string | undefined | null, openLinksInNewTab = false): string {
    if (!content) {
        return '';
    }
    if (!openLinksInNewTab) {
        return content;
    }
    return content.replace(/<a\s/gi, '<a target="_blank" rel="noopener" ');
}
