import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [130, '130 comments'],
    ])('formats %i as "%s"', (count, expected) => {
        expect(formatCommentCount(count)).toBe(expected);
    });
});
