import { describe, expect, it } from 'vitest';

import { commentCount } from './commentCount';

describe('commentCount', () => {
    it('returns "discuss" for zero (or negative) counts', () => {
        expect(commentCount(0)).toBe('discuss');
        expect(commentCount(-1)).toBe('discuss');
    });

    it('uses the singular for one comment', () => {
        expect(commentCount(1)).toBe('1 comment');
    });

    it('uses the plural for several comments', () => {
        expect(commentCount(2)).toBe('2 comments');
        expect(commentCount(57)).toBe('57 comments');
    });
});
