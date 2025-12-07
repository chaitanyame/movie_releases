import { test, expect } from '@playwright/test';

test.describe('Back to Current Week Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
  });

  test('is hidden on initial load (current week)', async ({ page }) => {
    const button = page.locator('#back-to-current');
    await expect(button).toBeHidden();
  });

  test('shows when viewing an archived week', async ({ page }) => {
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const target = count > 1 ? archiveItems.nth(1) : archiveItems.first();

    await target.click({ force: true });

    const button = page.locator('#back-to-current');
    await expect(button).toBeVisible({ timeout: 5000 });
  });

  test('returns to current week and hides after click', async ({ page }) => {
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const target = count > 1 ? archiveItems.nth(1) : archiveItems.first();

    await target.click({ force: true });
    await page.waitForSelector('#back-to-current', { state: 'visible', timeout: 5000 });

  await page.click('#back-to-current', { force: true });

    // Should navigate back to current and hide button
    await expect(page).toHaveURL(/(#current)?$/);
    await expect(page.locator('#back-to-current')).toBeHidden({ timeout: 5000 });

    // Active archive item should be the current week (first item)
    const currentActive = page.locator('#archive-nav .archive-item.active').first();
    await expect(currentActive).toHaveAttribute('data-week-id', '2024-49');
  });

  test('visible when loading page directly on archive hash', async ({ page }) => {
    await page.goto('/#archive/2024-48');
    const button = page.locator('#back-to-current');
    await expect(button).toBeVisible({ timeout: 5000 });
  });
});