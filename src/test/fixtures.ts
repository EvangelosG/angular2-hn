import { Comment } from '../app/shared/models/comment';
import { Story } from '../app/shared/models/story';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'dang',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Top comment</p>',
        comments: [],
        ...overrides,
    };
}

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
