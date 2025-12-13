/**
 * Feature 59: Browser back/forward buttons work
 * 
 * Tests verify that browser history API works correctly with hash routing.
 * Users should be able to use browser back/forward buttons to navigate
 * through their viewing history.
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 59: Browser Navigation', () => {
  test('should support back button navigation', async ({ page }) => {
    // Start at default
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Navigate to India
    await page.click('[data-country="india"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#current\/india/);

    // Navigate to last week
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#last-week\/india/);

    // Click browser back button
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be back at current week India
    await expect(page).toHaveURL(/\#current\/india/);
    const currentButton = page.locator('#current-week-btn');
    await expect(currentButton).toHaveClass(/active/);
  });

  test('should support forward button navigation', async ({ page }) => {
    // Start at default
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Navigate to next week
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#next-week\/us/);

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#current\/us/);

    // Click browser forward button
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Should be back at next week
    await expect(page).toHaveURL(/\#next-week\/us/);
    const nextButton = page.locator('#next-week-btn');
    await expect(nextButton).toHaveClass(/active/);
  });

  test('should maintain full navigation history', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Build a navigation history: US current -> US last -> India last -> India next
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');

    await page.click('[data-country="india"]');
    await page.waitForLoadState('networkidle');

    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#next-week\/india/);

    // Go back through history
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#last-week\/india/);

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#last-week\/us/);

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\#current\/us/);
  });

  test('should load correct state when using back button', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Navigate to India next week
    await page.click('[data-country="india"]');
    await page.waitForLoadState('networkidle');

    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Verify correct state restored
    const indiaButton = page.locator('[data-country="india"]');
    await expect(indiaButton).toHaveAttribute('aria-current', 'page');

    const currentButton = page.locator('#current-week-btn');
    await expect(currentButton).toHaveClass(/active/);
  });
});
