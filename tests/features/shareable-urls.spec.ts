/**
 * Feature 60: Shared URLs load correct state
 * 
 * Tests verify that URLs can be shared and will load the exact same state
 * in a new browser session. This is critical for social sharing functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 60: Shareable URLs', () => {
  test('should load same state when URL is shared', async ({ browser }) => {
    // First context: Navigate to a specific state
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    await page1.goto('http://localhost:8000/');
    await page1.waitForLoadState('networkidle');

    // Navigate to India last week
    await page1.click('[data-country="india"]');
    await page1.waitForLoadState('networkidle');
    await page1.click('#last-week-btn');
    await page1.waitForLoadState('networkidle');

    // Capture the URL
    const sharedUrl = page1.url();
    expect(sharedUrl).toContain('#last-week/india');

    await context1.close();

    // Second context: Open the shared URL in a fresh session
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto(sharedUrl);
    await page2.waitForLoadState('networkidle');

    // Verify the same state is loaded
    const indiaButton = page2.locator('[data-country="india"]');
    await expect(indiaButton).toHaveAttribute('aria-current', 'page');

    const lastButton = page2.locator('#last-week-btn');
    await expect(lastButton).toHaveClass(/active/);

    await context2.close();
  });

  test('should handle various hash combinations', async ({ page }) => {
    const testCases = [
      { hash: '#current/us', country: 'us', week: 'current' },
      { hash: '#last-week/us', country: 'us', week: 'last' },
      { hash: '#next-week/us', country: 'us', week: 'next' },
      { hash: '#current/india', country: 'india', week: 'current' },
      { hash: '#last-week/india', country: 'india', week: 'last' },
      { hash: '#next-week/india', country: 'india', week: 'next' },
    ];

    for (const testCase of testCases) {
      await page.goto(`http://localhost:8000/${testCase.hash}`);
      await page.waitForLoadState('networkidle');

      // Verify country
      const countryButton = page.locator(`[data-country="${testCase.country}"]`);
      await expect(countryButton).toHaveAttribute('aria-current', 'page');

      // Verify week
      const weekButton = page.locator(`#${testCase.week}-week-btn`);
      await expect(weekButton).toHaveClass(/active/);

      // Verify URL persists
      await expect(page).toHaveURL(new RegExp(testCase.hash.replace('/', '\/')));
    }
  });

  test('should preserve state across page reloads', async ({ page }) => {
    // Navigate to specific state
    await page.goto('http://localhost:8000/#next-week/india');
    await page.waitForLoadState('networkidle');

    // Verify initial state
    await expect(page).toHaveURL(/\#next-week\/india/);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify state is preserved
    const indiaButton = page.locator('[data-country="india"]');
    await expect(indiaButton).toHaveAttribute('aria-current', 'page');

    const nextButton = page.locator('#next-week-btn');
    await expect(nextButton).toHaveClass(/active/);

    // Verify upcoming badges are visible
    const upcomingBadges = page.locator('.upcoming-badge');
    const badgeCount = await upcomingBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should work with copy-paste URLs', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    // Navigate to US next week
    await page1.goto('http://localhost:8000/#next-week/us');
    await page1.waitForLoadState('networkidle');

    const url = page1.url();

    await context1.close();

    // Simulate pasting URL in new tab
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto(url);
    await page2.waitForLoadState('networkidle');

    // Verify correct state
    await expect(page2).toHaveURL(/\#next-week\/us/);

    const usButton = page2.locator('[data-country="us"]');
    await expect(usButton).toHaveAttribute('aria-current', 'page');

    const nextButton = page2.locator('#next-week-btn');
    await expect(nextButton).toHaveClass(/active/);

    await context2.close();
  });
});
