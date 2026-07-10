import { Page } from '@playwright/test';

export interface MockStory {
    id: number;
    title: string;
    points: number | null;
    user: string | null;
    time: number;
    time_ago: string;
    type: string;
    url: string;
    domain?: string;
    comments_count: number;
    content?: string;
    comments?: MockComment[];
}

export interface MockComment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted?: boolean;
    comments: MockComment[];
}

function makeStory(id: number, overrides: Partial<MockStory> = {}): MockStory {
    return {
        id,
        title: `Story number ${id}`,
        points: 100 + id,
        user: `author${id}`,
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: id % 3,
        ...overrides,
    };
}

// 30 items so the "More ›" pagination link is shown.
const newsPage1: MockStory[] = Array.from({ length: 30 }, (_, i) => makeStory(i + 1));
// Second page with fewer than 30 items so "More ›" is hidden but "Prev" shows.
const newsPage2: MockStory[] = Array.from({ length: 5 }, (_, i) => makeStory(i + 31));

const askStory = makeStory(1, {
    title: 'Ask HN: How do you test React apps?',
    url: '',
    domain: undefined,
    comments_count: 2,
});

const itemDetail: MockStory = {
    ...makeStory(1, {
        title: 'Story number 1',
        url: 'https://example.com/1',
        comments_count: 2,
    }),
    content: '<p>This is the story body.</p>',
    comments: [
        {
            id: 101,
            level: 0,
            user: 'commenter_a',
            time: 1600000100,
            time_ago: '1 hour ago',
            content: '<p>Top level comment A</p>',
            comments: [
                {
                    id: 102,
                    level: 1,
                    user: 'commenter_b',
                    time: 1600000200,
                    time_ago: '50 minutes ago',
                    content: '<p>Nested reply B</p>',
                    comments: [],
                },
            ],
        },
        {
            id: 103,
            level: 0,
            user: 'commenter_c',
            time: 1600000300,
            time_ago: '40 minutes ago',
            content: '<p>Top level comment C</p>',
            comments: [],
        },
    ],
};

const jobsPage1: MockStory[] = Array.from({ length: 3 }, (_, i) =>
    makeStory(i + 200, {
        title: `Startup ${i + 1} (YC S25) Is Hiring`,
        type: 'job',
        points: null,
        user: null,
        comments_count: 0,
    })
);

const mockUser = {
    id: 'commenter_a',
    created_time: 1400000000,
    created: 'January 1, 2015',
    karma: 4321,
    about: '<p>Just here to comment.</p>',
};

export async function mockHnApi(page: Page) {
    await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const pageParam = url.searchParams.get('page') || '1';

        const json = (body: unknown) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

        if (path === '/news') {
            return json(pageParam === '2' ? newsPage2 : newsPage1);
        }
        if (path === '/ask') {
            return json([askStory]);
        }
        if (path === '/jobs') {
            return json(jobsPage1);
        }
        if (path === '/newest' || path === '/show') {
            return json(newsPage1);
        }
        if (path === '/item/1') {
            return json(itemDetail);
        }
        if (path.startsWith('/user/')) {
            const id = decodeURIComponent(path.replace('/user/', ''));
            if (id === 'commenter_a') {
                return json(mockUser);
            }
            return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' });
        }
        // Fallback: empty list.
        return json([]);
    });
}
