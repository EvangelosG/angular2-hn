import type { Comment } from '../models/comment';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Example story',
        points: 100,
        user: 'pg',
        time: 1700000000,
        time_ago: '2 hours ago',
        type: 'link',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments_count: 3,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'dang',
        time: 1700000000,
        time_ago: '1 hour ago',
        content: '<p>Example comment</p>',
        comments: [],
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        created_time: 1160418092,
        created: '18 years ago',
        karma: 155000,
        about: '<p>Bug fixer.</p>',
        ...overrides,
    };
}

/** A Response-like object for mocking global fetch. */
export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
