import type { Comment } from '../shared/models/comment';
import type { Story } from '../shared/models/story';
import type { User } from '../shared/models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Story 1',
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        comments_count: 2,
        type: 'link',
        url: 'https://example.com/1',
        domain: 'example.com',
        ...overrides,
    } as Story;
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'bob',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Top comment</p>',
        comments: [],
        ...overrides,
    };
}

export const pg: User = {
    id: 'pg',
    created_time: 1160418092,
    created: '20 years ago',
    karma: 157316,
    about: 'Bug fixer.<script>window.hacked = true</script>',
};

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
