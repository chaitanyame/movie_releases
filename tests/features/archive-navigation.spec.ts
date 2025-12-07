/**
 * Archive Navigation UI Tests
 * 
 * Tests for the archive navigation component that displays
 * a list of archived weeks for selection.
 * 
 * @module tests/features/archive-navigation.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Archive Navigation UI', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have archive navigation section in HTML', async ({ page }) => {
    const archiveNav = page.locator('#archive-nav');
    await expect(archiveNav).toBeVisible();
  });

  test('should have a heading for archive section', async ({ page }) => {
    const heading = page.locator('#archive-nav h2');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/archive/i);
  });

  test('should display archive list after loading', async ({ page }) => {
    // Wait for archive list to be populated
    await page.waitForSelector('#archive-nav nav', { timeout: 5000 });
    
    const archiveList = page.locator('#archive-nav nav');
    await expect(archiveList).toBeVisible();
  });

  test('should list archived weeks as clickable items', async ({ page }) => {
    // Wait for archive list to populate
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
    
    const archiveItems = page.locator('#archive-nav .archive-item');
    const count = await archiveItems.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display week date range in archive items', async ({ page }) => {
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
    
    const firstItem = page.locator('#archive-nav .archive-item').first();
    const text = await firstItem.textContent();
    
    // Should contain week information (e.g., "Week 49" or "Dec 2-8")
    expect(text).toMatch(/week|dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov/i);
  });

  test('should have data-week-id attribute on archive items', async ({ page }) => {
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
    
    const firstItem = page.locator('#archive-nav .archive-item').first();
    const weekId = await firstItem.getAttribute('data-week-id');
    
    expect(weekId).toMatch(/^\d{4}-\d{2}$/); // YYYY-WW format
  });

  test('should handle empty archive list gracefully', async ({ page }) => {
    // Even with no archives, the navigation section should exist
    const archiveNav = page.locator('#archive-nav');
    await expect(archiveNav).toBeVisible();
  });

  test('archive items should be keyboard accessible', async ({ page }) => {
    await page.waitForSelector('#archive-nav .archive-item', { timeout: 5000 });
    
    const firstItem = page.locator('#archive-nav .archive-item').first();
    
    // Should be focusable (button or link)
    const tagName = await firstItem.evaluate(el => el.tagName.toLowerCase());
    expect(['a', 'button']).toContain(tagName);
  });

  test('archive navigation should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    const archiveNav = page.locator('#archive-nav');
    await expect(archiveNav).toBeVisible();
    
    // Should not overflow
    const box = await archiveNav.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(320);
  });
});
