export function formatCommentCount(count: number): string {
    if (!count || count === 0) return 'discuss';
    if (count === 1) return '1 comment';
    return `${count} comments`;
}
