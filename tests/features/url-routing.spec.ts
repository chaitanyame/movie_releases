/**
 * Feature 58: Hash URL navigation works
 * 
 * Tests verify that the application correctly handles hash-based routing
 * for shareable URLs. Users should be able to navigate directly to specific
 * views using URL hashes like #current/us or #next-week/india.
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 58: Hash URL Navigation', () => {
  test('should load current week US data with #current/us hash', async ({ page }) => {
    // Navigate directly with hash
    await page.goto('http://localhost:8000/#current/us');
    await page.waitForLoadState('networkidle');

    // Verify country is US
    const usButton = page.locator('[data-country="us"]');
    await expect(usButton).toHaveAttribute('aria-current', 'page');

    // Verify current week is active
    const currentButton = page.locator('#current-week-btn');
    await expect(currentButton).toHaveClass(/active/);

    // Verify data is loaded
    const movieCards = page.locator('.movie-card');
    await expect(movieCards.first()).toBeVisible();
  });

  test('should load last week India data with #last-week/india hash', async ({ page }) => {
    // Navigate directly with hash
    await page.goto('http://localhost:8000/#last-week/india');
    await page.waitForLoadState('networkidle');

    // Verify country is India
    const indiaButton = page.locator('[data-country="india"]');
    await expect(indiaButton).toHaveAttribute('aria-current', 'page');

    // Verify last week is active
    const lastButton = page.locator('#last-week-btn');
    await expect(lastButton).toHaveClass(/active/);

    // Verify active week title contains "Week"
    const weekTitle = page.locator('#active-week-title');
    await expect(weekTitle).toContainText('Week');
  });

  test('should load next week US data with #next-week/us hash', async ({ page }) => {
    // Navigate directly with hash
    await page.goto('http://localhost:8000/#next-week/us');
    await page.waitForLoadState('networkidle');

    // Verify country is US
    const usButton = page.locator('[data-country="us"]');
    await expect(usButton).toHaveAttribute('aria-current', 'page');

    // Verify next week is active
    const nextButton = page.locator('#next-week-btn');
    await expect(nextButton).toHaveClass(/active/);

    // Verify upcoming badges are visible
    const upcomingBadges = page.locator('.upcoming-badge');
    const badgeCount = await upcomingBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should default to #current/us when no hash provided', async ({ page }) => {
    // Navigate without hash
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Verify URL has been updated with default hash
    await expect(page).toHaveURL(/\#current\/us/);

    // Verify current week US is active
    const usButton = page.locator('[data-country="us"]');
    await expect(usButton).toHaveAttribute('aria-current', 'page');

    const currentButton = page.locator('#current-week-btn');
    await expect(currentButton).toHaveClass(/active/);
  });

  test('should handle invalid hash by redirecting to default', async ({ page }) => {
    // Navigate with invalid hash
    await page.goto('http://localhost:8000/#invalid/country');
    await page.waitForLoadState('networkidle');

    // Should redirect to default
    await expect(page).toHaveURL(/\#current\/us/);

    // Verify default state loaded
    const usButton = page.locator('[data-country="us"]');
    await expect(usButton).toHaveAttribute('aria-current', 'page');
  });

  test('should update hash when navigating between weeks', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Click last week button
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');

    // Verify hash updated
    await expect(page).toHaveURL(/\#last-week\/us/);

    // Click next week button
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');

    // Verify hash updated
    await expect(page).toHaveURL(/\#next-week\/us/);
  });

  test('should update hash when navigating between countries', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    // Click India button
    await page.click('[data-country="india"]');
    await page.waitForLoadState('networkidle');

    // Verify hash updated
    await expect(page).toHaveURL(/\#current\/india/);

    // Click US button
    await page.click('[data-country="us"]');
    await page.waitForLoadState('networkidle');

    // Verify hash updated
    await expect(page).toHaveURL(/\#current\/us/);
  });
});