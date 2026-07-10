import { test, expect } from '@playwright/test';

import { mockHnApi } from './mocks';

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

test('redirects the root path to /news/1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('renders the news feed with 30 stories and header navigation', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.locator('ol > li.post')).toHaveCount(30);
    await expect(page.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
    await expect(page.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
    await expect(page.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
    await expect(page.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
});

test('navigates between feeds via the header', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'jobs' }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
    await expect(page.getByText('These are jobs at startups')).toBeVisible();
    // Job items have no points / user metadata.
    await expect(page.getByText('points by')).toHaveCount(0);
});

test('paginates the news feed', async ({ page }) => {
    await page.goto('/news/1');

    // Page 1 has 30 items -> "More" is shown, "Prev" is not.
    await expect(page.locator('.nav .prev')).toHaveCount(0);
    const more = page.locator('.nav .more');
    await expect(more).toBeVisible();
    await more.click();

    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol > li.post')).toHaveCount(5);
    // Page 2 has < 30 items -> "Prev" is shown, "More" is not.
    await expect(page.locator('.nav .prev')).toBeVisible();
    await expect(page.locator('.nav .more')).toHaveCount(0);
});

test('opens item details and renders nested comments with collapse', async ({ page }) => {
    await page.goto('/item/1');

    await expect(page.getByRole('heading')).toHaveCount(0); // no error heading
    await expect(page.getByText('This is the story body.')).toBeVisible();

    // Two top-level comments, three comments total (one nested).
    await expect(page.locator('.comment-list > li')).toHaveCount(2);
    await expect(page.getByText('Top level comment A')).toBeVisible();
    await expect(page.getByText('Nested reply B')).toBeVisible();
    await expect(page.getByText('Top level comment C')).toBeVisible();

    // Collapsing the first comment hides its (nested) subtree.
    const firstToggle = page.locator('.comment .collapse').first();
    await firstToggle.click();
    await expect(page.getByText('Nested reply B')).toBeHidden();
    await firstToggle.click();
    await expect(page.getByText('Nested reply B')).toBeVisible();
});

test('navigates to an item detail from an Ask HN feed link', async ({ page }) => {
    await page.goto('/ask/1');
    await page.getByRole('link', { name: 'Ask HN: How do you test React apps?' }).click();
    await expect(page).toHaveURL(/\/item\/1$/);
    await expect(page.getByText('This is the story body.')).toBeVisible();
});

test('switches theme and persists it across reloads', async ({ page }) => {
    await page.goto('/news/1');
    const shell = page.locator('#root > div').first();
    await expect(shell).toHaveClass(/default/);

    await page.getByAltText('Settings').click();
    await page.getByRole('radio', { name: 'Night' }).check();
    // Close the settings popup.
    await page.locator('.popup .close').click();

    await expect(shell).toHaveClass(/night/);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('night');

    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass(/night/);
});

test('renders a user profile', async ({ page }) => {
    await page.goto('/user/commenter_a');
    await expect(page.locator('.main-details .name')).toHaveText('commenter_a');
    await expect(page.getByText('4321 ★')).toBeVisible();
    await expect(page.getByText('Just here to comment.')).toBeVisible();
});

test('shows an error state when a user cannot be loaded', async ({ page }) => {
    await page.goto('/user/does_not_exist');
    await expect(page.getByText('Could not load user does_not_exist.')).toBeVisible();
});
