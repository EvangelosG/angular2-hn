import { expect, test } from '@playwright/test';

// These tests hit the live Hacker News APIs, as the app does.
const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

test('redirects / to /news/1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('.app-feed li.post').first()).toBeVisible();
});

for (const feed of FEEDS) {
    test(`${feed} feed paginates`, async ({ page }) => {
        await page.goto(`/${feed}/1`);
        const posts = page.locator('.app-feed li.post');
        await expect(posts.first()).toBeVisible();
        await expect(page.locator('.app-feed ol')).toHaveAttribute('start', '1');

        const more = page.locator('.nav .more');
        if ((await posts.count()) === 30) {
            await more.click();
            await expect(page).toHaveURL(new RegExp(`/${feed}/2$`));
            await expect(page.locator('.app-feed ol')).toHaveAttribute('start', '31');
            await expect(page.locator('.nav .prev')).toHaveAttribute('href', `/${feed}/1`);
        } else {
            await expect(more).toHaveCount(0);
        }
    });
}

test('item page renders nested comments', async ({ page }) => {
    await page.goto('/news/1');
    const commentLink = page.locator('.subtext-laptop a[href^="/item/"]').filter({ hasText: /comments/ });
    await commentLink.first().click();
    await expect(page).toHaveURL(/\/item\/\d+$/);
    await expect(page.locator('.comment-list .app-comment').first()).toBeVisible();
    await expect(page.locator('.subtree .app-comment').first()).toBeAttached();

    const toggle = page.locator('.comment-list .collapse').first();
    await toggle.click();
    await expect(toggle).toHaveText('[+]');
});

test('poll item renders results', async ({ page }) => {
    await page.goto('/item/126809');
    await expect(page.locator('.pollContent')).toHaveCount(3);
    await expect(page.locator('.pollBar').first()).toHaveAttribute('style', /width: \d/);
});

test('user profile loads', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.locator('.main-details .right')).toContainText('★');
});

test('settings persist across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('img.settings').click();
    await page.getByLabel('Night').check();
    await page.getByLabel('Font size:').fill('20');
    await page.getByLabel('List spacing:').fill('6');
    await page.getByLabel('Open links in a new tab').check();
    await page.locator('.popup .close').click();

    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass('night');
    const title = page.locator('.app-item a.title').first();
    await expect(title).toHaveCSS('font-size', '20px');
    await expect(page.locator('.app-item > div').first()).toHaveCSS('margin-bottom', '6px');
    const external = page.locator('.app-item a.title[href^="http"]').first();
    await expect(external).toHaveAttribute('target', '_blank');
});

test('works offline after the first visit', async ({ page, context }) => {
    await page.goto('/news/1');
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
    });
    // Reload once so the now-controlling service worker caches the API response.
    await page.reload();
    await expect(page.locator('.app-feed li.post').first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('.app-feed li.post').first()).toBeVisible();
    await context.setOffline(false);
});
