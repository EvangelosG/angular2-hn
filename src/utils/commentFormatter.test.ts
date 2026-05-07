import { describe, expect, it } from 'vitest';

import { formatCommentCount } from './commentFormatter';

describe('formatCommentCount', () => {
    it('returns "discuss" when count is 0', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns "discuss" when count is negative or otherwise falsy-equivalent', () => {
        expect(formatCommentCount(-1)).toBe('-1 comments');
        expect(formatCommentCount(undefined as unknown as number)).toBe('discuss');
        expect(formatCommentCount(null as unknown as number)).toBe('discuss');
        expect(formatCommentCount(NaN as unknown as number)).toBe('discuss');
    });

    it('returns "1 comment" (singular) when count is 1', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns "N comments" (plural) when count is greater than 1', () => {
        expect(formatCommentCount(2)).toBe('2 comments');
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});
