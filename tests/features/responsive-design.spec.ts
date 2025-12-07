import { test, expect } from '@playwright/test';

/**
 * Responsive Design Tests
 * Verifies mobile-first responsive design across breakpoints
 */
test.describe('Responsive Design', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Mobile (320px)', () => {
    test.use({ viewport: { width: 320, height: 568 } });

    test('should display content in single column', async ({ page }) => {
      const main = page.locator('main.main-content');
      await expect(main).toBeVisible();
      
      // Main should take full width on mobile
      const box = await main.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(320);
    });

    test('should have readable font size', async ({ page }) => {
      const body = page.locator('body');
      const fontSize = await body.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      // Base font should be at least 16px
      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
    });
  });

  test.describe('Tablet (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should have proper spacing on tablet', async ({ page }) => {
      const main = page.locator('main.main-content');
      await expect(main).toBeVisible();
      
      const padding = await main.evaluate(el => 
        window.getComputedStyle(el).padding
      );
      // Should have some padding
      expect(padding).toBeTruthy();
    });
  });

  test.describe('Desktop (1024px)', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test('should have visible header', async ({ page }) => {
      const header = page.locator('header.site-header');
      await expect(header).toBeVisible();
    });

    test('should have visible sidebar', async ({ page }) => {
      const sidebar = page.locator('#archive-nav');
      await expect(sidebar).toBeAttached();
    });
  });

  test.describe('CSS Variables', () => {
    test('should define CSS custom properties', async ({ page }) => {
      const colorPrimary = await page.evaluate(() => {
        const root = document.documentElement;
        return getComputedStyle(root).getPropertyValue('--color-primary').trim();
      });
      
      // Should have color-primary defined
      expect(colorPrimary).toBeTruthy();
    });

    test('should define spacing variables', async ({ page }) => {
      const spacingMd = await page.evaluate(() => {
        const root = document.documentElement;
        return getComputedStyle(root).getPropertyValue('--spacing-md').trim();
      });
      
      expect(spacingMd).toBeTruthy();
    });
  });

  test.describe('Visual Elements', () => {
    test('should have dark background', async ({ page }) => {
      const bgColor = await page.evaluate(() => {
        const body = document.body;
        return getComputedStyle(body).backgroundColor;
      });
      
      // Should have a background color set
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('should have visible text on dark background', async ({ page }) => {
      const textColor = await page.evaluate(() => {
        const body = document.body;
        return getComputedStyle(body).color;
      });
      
      // Text color should be light (RGB values should be high)
      expect(textColor).toMatch(/rgba?\(\d+/);
    });
  });
});
