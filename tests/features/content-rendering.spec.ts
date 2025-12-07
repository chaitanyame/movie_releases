import { test, expect } from '@playwright/test';

/**
 * Content Rendering Tests
 * Verifies that JavaScript properly loads and renders JSON data
 */
test.describe('Content Rendering', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for content to load
    await page.waitForLoadState('networkidle');
  });

  test('should load and render current week post', async ({ page }) => {
    const currentWeekPost = page.locator('#current-week-post');
    await expect(currentWeekPost).not.toBeEmpty();
  });

  test('should display week title', async ({ page }) => {
    const postTitle = page.locator('.post-title, #current-week-post h2');
    await expect(postTitle).toBeVisible();
    await expect(postTitle).toContainText(/Week \d+/);
  });

  test('should display date range', async ({ page }) => {
    const postMeta = page.locator('.post-meta');
    await expect(postMeta.first()).toBeVisible();
  });

  test('should render platform sections', async ({ page }) => {
    // Should have at least one platform section
    const platformSections = page.locator('.platform-section');
    await expect(platformSections.first()).toBeVisible();
    
    const count = await platformSections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display platform names', async ({ page }) => {
    const platformTitles = page.locator('.platform-title');
    await expect(platformTitles.first()).toBeVisible();
  });

  test('should render release items', async ({ page }) => {
    const releaseItems = page.locator('.release-item');
    const count = await releaseItems.count();
    
    // Should have at least one release
    expect(count).toBeGreaterThan(0);
  });

  test('should display release titles', async ({ page }) => {
    const releaseTitles = page.locator('.release-title');
    await expect(releaseTitles.first()).toBeVisible();
  });

  test('should not show loading indicator after load', async ({ page }) => {
    const loading = page.locator('#loading-indicator');
    await expect(loading).toBeHidden();
  });

  test('should not show error message on successful load', async ({ page }) => {
    const error = page.locator('#error-message');
    await expect(error).toBeHidden();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('net::ERR')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
