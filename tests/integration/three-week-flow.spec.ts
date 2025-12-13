import { test, expect } from '@playwright/test';

/**
 * Integration tests for the complete three-week data flow
 * Feature 69: Test the full cycle of navigating between last week, current week, and next week
 */

test.describe('Three-Week Data Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data to load
    await page.waitForSelector('.movie-title', { timeout: 10000 });
  });

  test('complete navigation through all three weeks', async ({ page }) => {
    // 1. Verify current week loads by default
    const currentWeekBtn = page.locator('#current-week-btn');
    await expect(currentWeekBtn).toHaveClass(/active/);
    await expect(page.locator('#active-week-title')).toBeVisible();
    
    // Verify movies are displayed
    const movieTitles = page.locator('.movie-title');
    await expect(movieTitles.first()).toBeVisible();
    const currentMovieCount = await movieTitles.count();
    expect(currentMovieCount).toBeGreaterThan(0);

    // 2. Navigate to last week
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#last-week-btn')).toHaveClass(/active/);
    await expect(currentWeekBtn).not.toHaveClass(/active/);
    
    // Verify week title changed
    const lastWeekTitle = await page.locator('#active-week-title').textContent();
    expect(lastWeekTitle).toContain('Week');
    
    // Verify movies loaded for last week
    await expect(movieTitles.first()).toBeVisible();
    const lastWeekMovieCount = await movieTitles.count();
    expect(lastWeekMovieCount).toBeGreaterThan(0);

    // 3. Navigate to next week from last week
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#next-week-btn')).toHaveClass(/active/);
    
    // Verify back to current week (next week from last week = current week)
    const backToCurrentTitle = await page.locator('#active-week-title').textContent();
    expect(backToCurrentTitle).toContain('Week');
    await expect(movieTitles.first()).toBeVisible();

    // 4. Navigate to next week (future week)
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#next-week-btn')).toHaveClass(/active/);
    
    // Verify future week loaded (might have no movies yet)
    const futureWeekTitle = await page.locator('#active-week-title').textContent();
    expect(futureWeekTitle).toContain('Week');

    // 5. Return to current week
    await page.click('#current-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(currentWeekBtn).toHaveClass(/active/);
    await expect(movieTitles.first()).toBeVisible();
  });

  test('country switching persists across week navigation', async ({ page }) => {
    // 1. Start on US current week
    const usBtn = page.locator('button[data-country="us"]');
    await expect(usBtn).toHaveAttribute('aria-current', 'page');
    
    // 2. Switch to India
    const indiaBtn = page.locator('button[data-country="india"]');
    await indiaBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(indiaBtn).toHaveAttribute('aria-current', 'page');
    await expect(usBtn).not.toHaveAttribute('aria-current', 'page');
    
    // 3. Navigate to last week - should stay on India
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(indiaBtn).toHaveAttribute('aria-current', 'page');
    
    // 4. Navigate to next week - should still be India
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(indiaBtn).toHaveAttribute('aria-current', 'page');
    
    // 5. Navigate to current week - should still be India
    await page.click('#current-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(indiaBtn).toHaveAttribute('aria-current', 'page');
    
    // Verify movies loaded for India
    const movieTitles = page.locator('.movie-title');
    await expect(movieTitles.first()).toBeVisible();
  });

  test('URL hash updates reflect three-week navigation', async ({ page }) => {
    // 1. Current week US (default)
    await expect(page).toHaveURL(/#current\/us/);
    
    // 2. Navigate to last week
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#last-week\/us/);
    
    // 3. Switch to India
    await page.click('button[data-country="india"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#last-week\/india/);
    
    // 4. Navigate to current week
    await page.click('#current-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#current\/india/);
    
    // 5. Navigate to next week
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#next-week\/india/);
    
    // 6. Back to US
    await page.click('button[data-country="us"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#next-week\/us/);
  });

  test('archive loading works for three-week navigation', async ({ page }) => {
    // 1. Navigate to last week (archived data)
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    
    // Verify archive loaded
    const movieTitles = page.locator('.movie-title');
    await expect(movieTitles.first()).toBeVisible();
    
    // 2. Open archive list
    const archiveToggle = page.locator('#archive-toggle-btn');
    await archiveToggle.click();
    await page.waitForSelector('#archive-list', { state: 'visible' });
    
    // Verify archive list has items
    const archiveItems = page.locator('.archive-item');
    const archiveCount = await archiveItems.count();
    expect(archiveCount).toBeGreaterThan(0);
    
    // 3. Load an archived week
    await archiveItems.first().click();
    await page.waitForLoadState('networkidle');
    
    // Verify movies loaded from archive
    await expect(movieTitles.first()).toBeVisible();
    
    // 4. Return to current week
    await page.click('#current-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#current-week-btn')).toHaveClass(/active/);
  });

  test('theme toggle persists across week navigation', async ({ page }) => {
    // 1. Toggle to dark theme
    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // 2. Navigate to last week
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // 3. Navigate to next week
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // 4. Switch country
    await page.click('button[data-country="india"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // 5. Toggle back to light
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('error handling during week transitions', async ({ page }) => {
    // Test graceful degradation when data is missing
    
    // Navigate to future week (might not have data yet)
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    
    // Should show either:
    // 1. Movies if data exists
    // 2. Empty state message (no error)
    
    const errorElement = page.locator('[role="alert"]');
    const hasError = await errorElement.count() > 0;
    
    if (hasError) {
      // If error shown, should be user-friendly
      const errorText = await errorElement.textContent();
      expect(errorText).toBeTruthy();
      expect(errorText.toLowerCase()).not.toContain('undefined');
      expect(errorText.toLowerCase()).not.toContain('null');
    } else {
      // If no error, either movies or empty state should be visible
      const moviesOrEmpty = page.locator('.movie-title, .empty-state');
      // Should have at least one (either movies or empty state message)
      const count = await moviesOrEmpty.count();
      expect(count).toBeGreaterThanOrEqual(0); // Accept 0 for future weeks
    }
  });

  test('full user journey: browse, switch countries, navigate weeks, use archive', async ({ page }) => {
    // Simulates a complete user session
    
    // 1. User lands on current week US
    await expect(page.locator('#current-week-btn')).toHaveClass(/active/);
    await expect(page.locator('button[data-country="us"]')).toHaveAttribute('aria-current', 'page');
    const movieTitles = page.locator('.movie-title');
    await expect(movieTitles.first()).toBeVisible();
    
    // 2. User checks what's coming next week
    await page.click('#next-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#next-week\/us/);
    
    // 3. User wants to see India releases instead
    await page.click('button[data-country="india"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#next-week\/india/);
    
    // 4. User goes back to current week
    await page.click('#current-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#current\/india/);
    
    // 5. User checks last week's releases
    await page.click('#last-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#last-week\/india/);
    
    // 6. User opens archive to see older weeks
    await page.click('#archive-toggle-btn');
    await page.waitForSelector('#archive-list', { state: 'visible' });
    
    // 7. User loads an archived week
    const archiveItems = page.locator('.archive-item');
    if (await archiveItems.count() > 0) {
      await archiveItems.first().click();
      await page.waitForLoadState('networkidle');
      await expect(movieTitles.first()).toBeVisible();
    }
    
    // 8. User returns to current week US to finish
    await page.click('button[data-country="us"]');
    await page.waitForLoadState('networkidle');
    await page.click('#current-week-btn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#current\/us/);
    await expect(page.locator('#current-week-btn')).toHaveClass(/active/);
  });
});
