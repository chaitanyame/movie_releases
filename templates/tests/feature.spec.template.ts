# {Feature Name} UI Tests

> Test file for feature: {Feature Name}
> Created: {YYYY-MM-DD}

import { test, expect, Page } from '@playwright/test';

// ============================================
// Page Objects (if needed)
// ============================================

class {FeatureName}Page {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/{route}');
  }

  // Add page-specific methods
}

// ============================================
// Test Suite
// ============================================

test.describe('Feature: {Feature Name}', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the feature
    await page.goto('/{route}');
  });

  // ----------------------------------------
  // Happy Path Tests
  // ----------------------------------------

  test('should {expected behavior when used correctly}', async ({ page }) => {
    // Arrange
    // {setup test data}

    // Act
    // {perform user actions}

    // Assert
    await expect(page.locator('[data-testid="{element}"]')).toBeVisible();
  });

  test('should {another expected behavior}', async ({ page }) => {
    // Test implementation
  });

  // ----------------------------------------
  // Edge Cases
  // ----------------------------------------

  test('should handle empty input', async ({ page }) => {
    // Test empty state
  });

  test('should handle error state', async ({ page }) => {
    // Test error handling
  });

  // ----------------------------------------
  // Accessibility
  // ----------------------------------------

  test('should be keyboard accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    // Assert focus is on expected element
  });

});
