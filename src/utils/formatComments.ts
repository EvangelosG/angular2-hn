/** Port of Angular's `comment` pipe: "discuss", "1 comment", "N comments". */
export function formatComments(count: number | null | undefined): string {
    if (count && count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
