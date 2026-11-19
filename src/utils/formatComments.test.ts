import { formatComments } from './formatComments';

describe('formatComments', () => {
    it.each([
        [0, 'discuss'],
        [undefined, 'discuss'],
        [null, 'discuss'],
        [1, '1 comment'],
        [42, '42 comments'],
    ])('formats %s as %s', (count, expected) => {
        expect(formatComments(count)).toBe(expected);
    });
});
