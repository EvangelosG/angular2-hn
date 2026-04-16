import { describe, it, expect } from 'vitest';
import { formatComment } from '../utils/formatComment';

describe('formatComment', () => {
  it('returns "discuss" when count is 0', () => {
    expect(formatComment(0)).toBe('discuss');
  });

  it('returns "1 comment" when count is 1', () => {
    expect(formatComment(1)).toBe('1 comment');
  });

  it('returns "N comments" when count is greater than 1', () => {
    expect(formatComment(5)).toBe('5 comments');
    expect(formatComment(100)).toBe('100 comments');
  });

  it('returns "discuss" for negative numbers', () => {
    expect(formatComment(-1)).toBe('discuss');
  });
});
