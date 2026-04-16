export function formatComment(count: number): string {
  if (count > 0) {
    return count === 1 ? `${count} comment` : `${count} comments`;
  }
  return 'discuss';
}
