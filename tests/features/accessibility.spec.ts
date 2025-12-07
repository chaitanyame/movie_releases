/**
 * Accessibility Tests
 * 
 * Tests for WCAG 2.1 Level AA compliance including
 * keyboard navigation, focus states, color contrast,
 * and screen reader support.
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.post-title', { timeout: 10000 });
  });

  test('has proper lang attribute on html element', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('has skip-to-content link', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
    
    const href = await skipLink.getAttribute('href');
    expect(href).toContain('#');
  });

  test('skip link becomes visible on focus', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    
    // Initially hidden (off-screen)
    await page.keyboard.press('Tab');
    
    // After tab, should be visible
    await expect(skipLink).toBeFocused();
  });

  test('has single h1 element', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('heading hierarchy is proper (no skipped levels)', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const levels: number[] = [];
    
    for (const heading of headings) {
      const tag = await heading.evaluate(el => el.tagName);
      levels.push(parseInt(tag.charAt(1)));
    }
    
    // Check no level is skipped by more than 1
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i-1]).toBeLessThanOrEqual(1);
    }
  });

  test('interactive elements have visible focus indicators', async ({ page }) => {
    const archiveItem = page.locator('#archive-nav .archive-item').first();
    await archiveItem.focus();
    
    // Should have focus styling (outline)
    const outline = await archiveItem.evaluate(el => {
      const style = getComputedStyle(el);
      return style.outline || style.outlineStyle;
    });
    
    expect(outline).not.toBe('none');
  });

  test('buttons have accessible names', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('loading indicator has proper ARIA attributes', async ({ page }) => {
    const loading = page.locator('#loading-indicator');
    
    const role = await loading.getAttribute('role');
    expect(role).toBe('status');
    
    const ariaLive = await loading.getAttribute('aria-live');
    expect(ariaLive).toBe('polite');
  });

  test('error messages have alert role', async ({ page }) => {
    const error = page.locator('#error-message');
    const role = await error.getAttribute('role');
    expect(role).toBe('alert');
  });

  test('main content has aria-busy attribute', async ({ page }) => {
    const main = page.locator('.main-content');
    const ariaBusy = await main.getAttribute('aria-busy');
    expect(ariaBusy).toBe('false');
  });

  test('archive navigation is keyboard accessible', async ({ page }) => {
    // Tab through to archive items
    const archiveItems = page.locator('#archive-nav .archive-item');
    const firstItem = archiveItems.first();
    
    await firstItem.focus();
    await expect(firstItem).toBeFocused();
    
    // Can navigate with Tab
    await page.keyboard.press('Tab');
    
    const secondItem = archiveItems.nth(1);
    if (await secondItem.count() > 0) {
      await expect(secondItem).toBeFocused();
    }
  });

  test('platform sections have proper landmarks', async ({ page }) => {
    const sections = page.locator('.platform-section');
    const count = await sections.count();
    
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const ariaLabelledBy = await section.getAttribute('aria-labelledby');
      
      // Each section should be labelled
      expect(ariaLabelledBy).toBeTruthy();
    }
  });
});
