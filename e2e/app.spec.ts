import { expect, test, type Page } from '@playwright/test';

function trackConsoleErrors(page: Page) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    return errors;
}

test('redirects to the news feed without browser errors', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('.app-feed li.post')).toHaveCount(30);
    expect(errors).toEqual([]);
});

test('navigates news → item → user', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.app-feed a[href^="/item/"]:visible', { hasText: /\d+ comments?/ }).first().click();
    await expect(page).toHaveURL(/\/item\/\d+$/);
    const userLink = page.locator('.app-item-details a[href^="/user/"]:visible').first();
    await expect(userLink).toBeVisible();
    const userId = (await userLink.textContent())!.trim();
    await userLink.click();
    await expect(page).toHaveURL(new RegExp(`/user/${userId}$`));
    await expect(page.locator('.app-user .main-details .name')).toHaveText(userId);
});

test('paginates feeds', async ({ page }) => {
    await page.goto('/newest/1');
    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/newest\/2$/);
    await expect(page.locator('.app-feed ol')).toHaveAttribute('start', '31');
});

test('persists the theme chosen in settings', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();
    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass('night');
});
