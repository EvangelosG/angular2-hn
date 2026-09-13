import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(null)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
  });

  it('uses the singular for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural for multiple comments', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(120)).toBe('120 comments');
  });
});
