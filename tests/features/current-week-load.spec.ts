/**
 * Feature Test: Current Week Data Loading
 * 
 * Verifies that the current week theatrical releases data loads successfully
 * and displays correctly on the homepage.
 * 
 * TDD GATE 1: This test MUST FAIL before implementation.
 */

import { test, expect } from '@playwright/test';

test.describe('Current Week Data Loading', () => {
  test('should load current week data successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Assert: Current week data should load within 2 seconds
    const weekTitleDisplay = page.locator('#active-week-title');
    await expect(weekTitleDisplay).toBeVisible({ timeout: 2000 });
    
    // Verify week title displays correctly (format: "Week XX: Month DD-DD, YYYY")
    const weekTitleText = await weekTitleDisplay.textContent();
    expect(weekTitleText).toMatch(/^Week \d+: .+$/);
    
    // Verify no error messages are shown
    const errorMessage = page.locator('#error-message');
    await expect(errorMessage).toBeHidden();
    
    // Verify loading indicator is not visible (data has loaded)
    const loadingIndicator = page.locator('#loading-indicator');
    await expect(loadingIndicator).toBeHidden();
  });

  test('should display current week as active in navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Current week button should have active class
    const currentWeekBtn = page.locator('.week-btn[data-week="current"]');
    await expect(currentWeekBtn).toHaveClass(/active/);
    
    // Current week button should have aria-pressed="true"
    await expect(currentWeekBtn).toHaveAttribute('aria-pressed', 'true');
    
    // Current week button should have aria-current="true"
    await expect(currentWeekBtn).toHaveAttribute('aria-current', 'true');
  });

  test('should load current week data for default country (US)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // US country button should be active by default
    const usCountryBtn = page.locator('.country-btn[data-country="us"]');
    await expect(usCountryBtn).toHaveClass(/active/);
    
    // Main content area should have data
    const mainContent = page.locator('#current-week-post');
    await expect(mainContent).not.toBeEmpty();
  });

  test('should display week metadata in navigation buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // All week buttons should have metadata spans
    const lastWeekMeta = page.locator('#last-week-meta');
    const currentWeekMeta = page.locator('#current-week-meta');
    const nextWeekMeta = page.locator('#next-week-meta');
    
    // Metadata should be visible
    await expect(lastWeekMeta).toBeVisible();
    await expect(currentWeekMeta).toBeVisible();
    await expect(nextWeekMeta).toBeVisible();
    
    // Metadata should have date range content (not empty)
    // This will fail until we implement the data loading logic
    const currentMetaText = await currentWeekMeta.textContent();
    expect(currentMetaText).toBeTruthy();
  });
});
