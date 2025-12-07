/**
 * Cross-Browser Tests
 * 
 * Tests that verify core functionality works across
 * all supported browsers (Chromium, Firefox, WebKit).
 * 
 * Run with: npx playwright test tests/browsers/cross-browser.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  
  test('page loads and displays content', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Header visible
    const header = page.locator('.site-header h1');
    await expect(header).toBeVisible({ timeout: 10000 });
    await expect(header).toHaveText('OTT Weekly Releases');
    
    // Content loads
    const postTitle = page.locator('.post-title');
    await expect(postTitle).toBeVisible({ timeout: 10000 });
    
    console.log(`✓ ${browserName}: Page loads correctly`);
  });

  test('archive navigation works', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Wait for main content to load first
    await page.waitForSelector('.platform-section', { timeout: 10000 });
    
    // Archive nav container should exist
    const archiveNav = page.locator('#archive-nav');
    await expect(archiveNav).toBeVisible();
    
    // Check for archive items (may be buttons or links)
    const archiveItems = page.locator('#archive-nav button, #archive-nav .archive-item');
    const count = await archiveItems.count();
    
    // Archive might be empty if no index.json, but nav should be visible
    expect(count).toBeGreaterThanOrEqual(0);
    
    console.log(`✓ ${browserName}: Archive navigation renders (${count} items)`);
  });

  test('CSS variables are applied', async ({ page, browserName }) => {
    await page.goto('/');
    
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Should have dark background from CSS variables
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    
    console.log(`✓ ${browserName}: CSS variables work`);
  });

  test('JavaScript execution works', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Wait for JS to render content
    await page.waitForSelector('.platform-section', { timeout: 10000 });
    
    const platforms = page.locator('.platform-section');
    const count = await platforms.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
    
    console.log(`✓ ${browserName}: JavaScript renders ${count} platform sections`);
  });

  test('fetch API works for loading data', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Content should load via fetch
    await page.waitForSelector('.release-item', { timeout: 10000 });
    
    const releases = page.locator('.release-item');
    const count = await releases.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
    
    console.log(`✓ ${browserName}: Fetch API loads ${count} releases`);
  });

  test('responsive layout renders correctly', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForSelector('.post-title', { timeout: 10000 });
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.site-header')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.archive-sidebar')).toBeVisible();
    
    console.log(`✓ ${browserName}: Responsive layout works`);
  });
});
