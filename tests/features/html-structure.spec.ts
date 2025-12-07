import { test, expect } from '@playwright/test';

/**
 * HTML Structure Tests
 * Verifies the semantic HTML structure of the main page
 */
test.describe('HTML Structure', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct document title', async ({ page }) => {
    await expect(page).toHaveTitle('OTT Weekly Releases');
  });

  test('should have lang attribute set to English', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should have required meta tags', async ({ page }) => {
    // Viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
    
    // Description meta tag
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });

  test('should have semantic header element', async ({ page }) => {
    const header = page.locator('header.site-header');
    await expect(header).toBeVisible();
    
    const h1 = header.locator('h1');
    await expect(h1).toHaveText('OTT Weekly Releases');
  });

  test('should have main content area', async ({ page }) => {
    const main = page.locator('main.main-content');
    await expect(main).toBeVisible();
  });

  test('should have current week post container', async ({ page }) => {
    const currentWeekPost = page.locator('#current-week-post');
    await expect(currentWeekPost).toBeVisible();
  });

  test('should have loading indicator element', async ({ page }) => {
    const loading = page.locator('#loading-indicator');
    await expect(loading).toBeAttached();
  });

  test('should have error message element', async ({ page }) => {
    const error = page.locator('#error-message');
    await expect(error).toBeAttached();
  });

  test('should have archive navigation sidebar', async ({ page }) => {
    const archiveNav = page.locator('#archive-nav');
    await expect(archiveNav).toBeAttached();
  });

  test('should have footer element', async ({ page }) => {
    const footer = page.locator('footer.site-footer');
    await expect(footer).toBeVisible();
  });

  test('should link to CSS stylesheet', async ({ page }) => {
    const cssLink = page.locator('link[rel="stylesheet"][href*="main.css"]');
    await expect(cssLink).toBeAttached();
  });

  test('should link to JavaScript file', async ({ page }) => {
    const jsScript = page.locator('script[src*="app.js"]');
    await expect(jsScript).toBeAttached();
  });
});
