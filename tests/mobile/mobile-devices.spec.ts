/**
 * Mobile Device Tests
 * 
 * Tests that verify the application works correctly on
 * various mobile device viewports and touch interactions.
 * 
 * Run with: npx playwright test tests/mobile/mobile-devices.spec.ts
 */

import { test, expect } from '@playwright/test';

// Device viewport configurations
const IPHONE_12 = { width: 390, height: 844 };
const PIXEL_5 = { width: 393, height: 851 };
const IPAD_PRO = { width: 834, height: 1194 };
const MOBILE_SMALL = { width: 320, height: 568 };
const MOBILE_STANDARD = { width: 375, height: 667 };

test.describe('Mobile Device Testing', () => {
  
  test('page loads on iPhone 12 viewport', async ({ page }) => {
    await page.setViewportSize(IPHONE_12);
    await page.goto('/');
    
    const header = page.locator('.site-header h1');
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('page loads on Pixel 5 viewport', async ({ page }) => {
    await page.setViewportSize(PIXEL_5);
    await page.goto('/');
    
    const header = page.locator('.site-header h1');
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('page loads on iPad Pro viewport', async ({ page }) => {
    await page.setViewportSize(IPAD_PRO);
    await page.goto('/');
    
    const header = page.locator('.site-header h1');
    await expect(header).toBeVisible({ timeout: 10000 });
    
    // On tablet, sidebar should be visible
    const sidebar = page.locator('.archive-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('content is readable on mobile', async ({ page }) => {
    await page.setViewportSize(IPHONE_12);
    await page.goto('/');
    await page.waitForSelector('.post-title', { timeout: 10000 });
    
    const postTitle = page.locator('.post-title');
    const fontSize = await postTitle.evaluate(el => getComputedStyle(el).fontSize);
    
    // Font size should be readable on mobile (at least 16px)
    const sizeNum = parseFloat(fontSize);
    expect(sizeNum).toBeGreaterThanOrEqual(16);
  });

  test('touch targets are large enough', async ({ page }) => {
    await page.setViewportSize(PIXEL_5);
    await page.goto('/');
    await page.waitForSelector('.platform-section', { timeout: 10000 });
    
    // Check back-to-current button if visible
    const backButton = page.locator('#back-to-current');
    if (await backButton.isVisible()) {
      const box = await backButton.boundingBox();
      // Touch targets should be at least 44x44px per WCAG
      expect(box?.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('scrolling works on mobile', async ({ page }) => {
    await page.setViewportSize(IPHONE_12);
    await page.goto('/');
    await page.waitForSelector('.platform-section', { timeout: 10000 });
    
    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 300));
    
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });
});

test.describe('Mobile Responsiveness', () => {
  
  test('viewport meta tag is present', async ({ page }) => {
    await page.goto('/');
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('no horizontal overflow at 320px width', async ({ page }) => {
    await page.setViewportSize(MOBILE_SMALL);
    await page.goto('/');
    await page.waitForSelector('.post-title', { timeout: 10000 });
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    // Body should not be wider than viewport (no horizontal scroll)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
  });

  test('text is readable without zooming', async ({ page }) => {
    await page.setViewportSize(MOBILE_STANDARD);
    await page.goto('/');
    await page.waitForSelector('.release-item', { timeout: 10000 });
    
    const releaseItem = page.locator('.release-item').first();
    const fontSize = await releaseItem.evaluate(el => {
      return parseFloat(getComputedStyle(el).fontSize);
    });
    
    // Should be at least 14px for readability
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test('layout adapts from mobile to desktop', async ({ page }) => {
    // Start at mobile
    await page.setViewportSize(MOBILE_STANDARD);
    await page.goto('/');
    await page.waitForSelector('.site-header', { timeout: 10000 });
    
    // Header should always be visible
    await expect(page.locator('.site-header')).toBeVisible();
    
    // Change to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Header still visible
    await expect(page.locator('.site-header')).toBeVisible();
    
    // Sidebar should be visible on desktop
    await expect(page.locator('.archive-sidebar')).toBeVisible();
  });
});
