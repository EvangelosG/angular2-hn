import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
    let pipe: CommentPipe;

    beforeEach(() => {
        pipe = new CommentPipe();
    });

    it('should return "discuss" for 0 comments', () => {
        expect(pipe.transform(0)).toBe('discuss');
    });

    it('should return "discuss" for negative numbers', () => {
        expect(pipe.transform(-1)).toBe('discuss');
    });

    it('should return "1 comment" for 1 comment', () => {
        expect(pipe.transform(1)).toBe('1 comment');
    });

    it('should return plural "comments" for more than 1', () => {
        expect(pipe.transform(5)).toBe('5 comments');
    });

    it('should return plural "comments" for 2', () => {
        expect(pipe.transform(2)).toBe('2 comments');
    });
});
