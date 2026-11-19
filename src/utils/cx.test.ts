import { cx } from './cx';

describe('cx', () => {
    it('joins truthy class names', () => {
        expect(cx('a', undefined, 'b', false, null, '', 'c')).toBe('a b c');
    });
});
