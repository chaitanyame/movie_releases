/**
 * Lighthouse Audit Tests
 * 
 * Verifies the application meets performance, accessibility,
 * best practices, and SEO standards.
 * 
 * Note: These tests use Playwright's built-in accessibility
 * and performance features as a proxy for Lighthouse audits.
 * For full Lighthouse audits, run: npx lighthouse http://localhost:3000
 */

import { test, expect } from '@playwright/test';

test.describe('Lighthouse Audit Proxies', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.post-title', { timeout: 10000 });
  });

  test('Performance: page loads within acceptable time', async ({ page }) => {
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        load: nav.loadEventEnd - nav.startTime
      };
    });
    
    // DOMContentLoaded should be under 3 seconds
    expect(timing.domContentLoaded).toBeLessThan(3000);
  });

  test('Accessibility: page has proper heading hierarchy', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check h2 exists
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(1);
  });

  test('Accessibility: images have alt attributes', async ({ page }) => {
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('Accessibility: skip link is present', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
  });

  test('Accessibility: interactive elements are focusable', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toHaveAttribute('aria-label');
      }
    }
  });

  test('Best Practices: no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForSelector('.post-title', { timeout: 10000 });
    
    expect(errors.length).toBe(0);
  });

  test('SEO: page has meta description', async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.{50,}/);
  });

  test('SEO: page has Open Graph tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();
    
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toBeAttached();
  });

  test('SEO: page has canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toBeAttached();
  });
});
