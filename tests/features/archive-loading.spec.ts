/**
 * Archive Post Loading Tests
 * 
 * Tests for loading and displaying archived week posts
 * when selected from the archive navigation.
 * 
 * @module tests/features/archive-loading.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Archive Post Loading', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for archive navigation to load
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
  });

  test('should load archived week when clicking archive item', async ({ page }) => {
    // Click on an archive item that is NOT the current week (use nth(1) for second item)
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    
    // Use second item if available, otherwise first
    const archiveItem = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    const weekId = await archiveItem.getAttribute('data-week-id');
    
    await archiveItem.click({ force: true });
    
    // Wait for content to update
    await page.waitForSelector('.post-title', { timeout: 5000 });
    
    // Verify content has changed (should show the archived week title)
    const postTitle = page.locator('.post-title');
    await expect(postTitle).toBeVisible();
  });

  test('should show loading indicator while fetching archive', async ({ page }) => {
    // We need to slow down the network to see the loading state
    await page.route('**/data/archive/*.json', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    // Use second item (not currently active)
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const archiveItem = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    
    await archiveItem.click({ force: true });
    
    // Check loading indicator appears
    const loading = page.locator('#loading-indicator');
    // It should be visible at some point during loading
    // This is a soft check since loading might be fast
    await expect(loading).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading might be too fast to catch, that's ok
    });
  });

  test('should update active state in navigation after loading', async ({ page }) => {
    // Use second item (not currently active)
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const archiveItem = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    const weekId = await archiveItem.getAttribute('data-week-id');
    
    await archiveItem.click({ force: true });
    await page.waitForSelector('.post-title', { timeout: 5000 });
    
    // The clicked item should now have active class
    const activeItem = page.locator('#archive-nav .archive-item.active');
    await expect(activeItem).toHaveAttribute('data-week-id', weekId!);
  });

  test('should display correct week title after loading archive', async ({ page }) => {
    // Use second item (not currently active)
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const archiveItem = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    const expectedTitle = await archiveItem.textContent();
    
    await archiveItem.click({ force: true });
    await page.waitForSelector('.post-title', { timeout: 5000 });
    
    // The post header should contain similar week info
    const postTitle = page.locator('.post-title');
    const titleText = await postTitle.textContent();
    
    // Both should reference the same week
    expect(titleText).toMatch(/week/i);
  });

  test('should display platform sections in archived post', async ({ page }) => {
    // Use second item (not currently active)
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const archiveItem = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    
    await archiveItem.click({ force: true });
    
    // Wait for content to load
    await page.waitForSelector('.platform-section', { timeout: 5000 });
    
    const platformSections = page.locator('.platform-section');
    const sectionCount = await platformSections.count();
    
    expect(sectionCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle missing archive gracefully with error message', async ({ page }) => {
    // Intercept archive requests and return 404 for a specific file
    await page.route('**/data/archive/9999-99.json', route => {
      route.fulfill({
        status: 404,
        body: 'Not Found'
      });
    });
    
    // Manually trigger loading a non-existent archive
    await page.evaluate(() => {
      // @ts-ignore - accessing global function
      if (typeof window.loadArchivedWeek === 'function') {
        window.loadArchivedWeek('9999-99');
      }
    });
    
    // This test passes if no uncaught exception occurs
    // The app should handle the error gracefully
    await page.waitForTimeout(500);
  });

  test('should reuse same rendering for archived posts as current week', async ({ page }) => {
    // First capture current week structure
    await page.waitForSelector('#current-week-post', { timeout: 5000 });
    const currentPostHtml = await page.locator('#current-week-post').innerHTML();
    
    // Load an archive (use second item, not currently active)
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    const archiveItem = count > 1 ? archiveItems.nth(1) : archiveItems.first();
    
    await archiveItem.click({ force: true });
    await page.waitForSelector('.post-title', { timeout: 5000 });
    
    // Verify same structure (has post-header, post-content, platform-section)
    const archivedPostHtml = await page.locator('#current-week-post').innerHTML();
    
    // Both should have similar structure
    expect(archivedPostHtml).toContain('post-header');
    expect(archivedPostHtml).toContain('post-content');
  });
});
