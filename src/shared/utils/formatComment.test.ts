import { describe, expect, it } from 'vitest';

import { formatComment } from './formatComment';

describe('formatComment', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatComment(0)).toBe('discuss');
    });

    it('uses the singular for one comment', () => {
        expect(formatComment(1)).toBe('1 comment');
    });

    it('uses the plural for several comments', () => {
        expect(formatComment(42)).toBe('42 comments');
    });
});
