import type { Page } from '@playwright/test';

const story = (id: number, overrides: Record<string, unknown> = {}) => ({
    id,
    title: `Story ${id}`,
    points: 100,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments_count: 2,
    ...overrides,
});

export const feedPage = (feed: string, page: number) =>
    Array.from({ length: 30 }, (_, i) => story(page * 100 + i, { title: `${feed} story ${page}-${i}` }));

export const item = {
    ...story(4242, { title: 'Discussed story' }),
    content: '',
    comments: [
        {
            id: 1,
            level: 0,
            user: 'dang',
            time_ago: '1 hour ago',
            content: '<p>Top comment</p>',
            deleted: false,
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'tptacek',
                    time_ago: '30 minutes ago',
                    content: '<p>Reply</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        },
    ],
};

export const user = { id: 'pg', created: '20 years ago', created_time: 1160418092, karma: 157316, about: 'Bug fixer.' };

export async function mockApi(page: Page) {
    await page.route(/google-analytics\.com/, (route) => route.abort());
    await page.route(/node-hnapi\.herokuapp\.com|api\.hnpwa\.com/, (route) => {
        const url = new URL(route.request().url());
        const headers = { 'access-control-allow-origin': '*' };
        if (url.pathname.startsWith('/v0/user/')) return route.fulfill({ json: user, headers });
        if (url.pathname.startsWith('/item/')) return route.fulfill({ json: item, headers });
        const feed = url.pathname.slice(1);
        return route.fulfill({ json: feedPage(feed, Number(url.searchParams.get('page'))), headers });
    });
}
