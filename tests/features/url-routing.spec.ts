import { test, expect } from '@playwright/test';

test.describe('Hash-Based URL Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
  });

  test('loads archive when URL contains archive hash', async ({ page }) => {
    await page.goto('/#archive/2024-48');

    await page.waitForSelector('.post-title', { timeout: 5000 });
    await page.waitForSelector('#archive-nav .archive-item.active[data-week-id="2024-48"]', { timeout: 5000 });

    await expect(page).toHaveURL(/#archive\/2024-48/);
  });

  test('updates hash when clicking archive item', async ({ page }) => {
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const target = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    const weekId = await target.getAttribute('data-week-id');

    await target.click({ force: true });

    await expect(page).toHaveURL(new RegExp(`#archive/${weekId}`));
    await page.waitForSelector(`#archive-nav .archive-item.active[data-week-id="${weekId}"]`, { timeout: 5000 });
  });

  test('handles hashchange navigation between archive and current', async ({ page }) => {
    await page.waitForSelector('.post-title', { timeout: 5000 });

    await page.evaluate(() => { location.hash = '#archive/2024-48'; });
    await page.waitForSelector('#archive-nav .archive-item.active[data-week-id="2024-48"]', { timeout: 5000 });

    await page.evaluate(() => { location.hash = '#current'; });
    await page.waitForSelector('.post-title', { timeout: 5000 });
    await page.waitForSelector('#archive-nav .archive-item.active[data-week-id="2024-49"]', { timeout: 5000 });
  });

  test('supports back/forward navigation of hash routes', async ({ page }) => {
    await page.goto('/#archive/2024-48');
    await page.waitForSelector('#archive-nav .archive-item.active[data-week-id="2024-48"]', { timeout: 5000 });

    await page.evaluate(() => { location.hash = '#archive/2024-49'; });
    await page.waitForSelector('#archive-nav .archive-item.active[data-week-id="2024-49"]', { timeout: 5000 });

    await page.goBack();
    await page.waitForSelector('#archive-nav .archive-item.active[data-week-id="2024-48"]', { timeout: 5000 });
    await expect(page).toHaveURL(/#archive\/2024-48/);
  });
});