import { expect, test } from '@playwright/test';

import { mockApi } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('redirects / to the first news page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'news story 1-0' })).toBeVisible();
});

for (const feed of ['news', 'newest', 'show', 'ask', 'jobs']) {
    test(`renders the ${feed} feed`, async ({ page }) => {
        await page.goto(`/${feed}/1`);
        await expect(page.locator('li.post')).toHaveCount(30);
        await expect(page.getByRole('link', { name: `${feed} story 1-0` })).toBeVisible();
    });
}

test('header navigation and pagination', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.header-nav').getByRole('link', { name: 'show' }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect(page.locator('.header-nav a.active')).toHaveText('show');
    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/show\/2$/);
    await expect(page.getByRole('link', { name: 'show story 2-0' })).toBeVisible();
    await expect(page.locator('ol.feed-list')).toHaveAttribute('start', '31');
    await page.getByRole('link', { name: '‹ Prev' }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
});

test('opens an item with nested comments and collapses a thread', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.subtext-laptop, .subtext-palm').filter({ visible: true }).first().getByRole('link', { name: /2 comments/ }).click();
    await expect(page).toHaveURL(/\/item\/100$/);
    await expect(page.getByText('Top comment')).toBeVisible();
    await expect(page.getByText('Reply')).toBeVisible();
    await page.getByText('[-]').first().click();
    await expect(page.getByText('Reply')).toBeHidden();
});

test('opens a user profile', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.getByText('157316 ★')).toBeVisible();
    await expect(page.getByText('Bug fixer.')).toBeVisible();
});

test('settings persist the chosen theme across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();
    await expect(page.locator('#root > div')).toHaveClass('night');
    await page.reload();
    await expect(page.locator('#root > div')).toHaveClass('night');
});

test('registers a service worker', async ({ page }) => {
    await page.goto('/news/1');
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    expect(scope).toMatch(/\/$/);
});
