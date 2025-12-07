/**
 * Issue Regression Test Template
 * 
 * Use this template for bug fixes to create regression tests.
 * File naming: tests/issues/I{id}-{description}.spec.ts
 * 
 * TDD Workflow:
 * 1. Create this test FIRST (reproduces the bug)
 * 2. Run test - verify it FAILS
 * 3. Fix the bug
 * 4. Run test - verify it PASSES
 * 5. Update issues.json with test results
 */

import { test, expect } from '@playwright/test';

test.describe('Issue I{ID}: {Brief Description}', () => {
  
  /**
   * Document the bug clearly for future reference
   */
  test.beforeAll(() => {
    console.log(`
      Issue: I{ID}
      Category: bug
      Priority: {priority}
      Description: {Full description of the bug}
      Steps to Reproduce:
        1. {Step 1}
        2. {Step 2}
        3. {Step 3}
      Expected: {What should happen}
      Actual: {What was happening - the bug}
      Fixed: {Date}
    `);
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the affected area
    await page.goto('/{route-where-bug-occurs}');
  });

  /**
   * This test should:
   * - FAIL before the fix is applied (reproduces bug)
   * - PASS after the fix is applied
   */
  test('should {expected correct behavior - opposite of bug}', async ({ page }) => {
    // Arrange - set up the conditions that trigger the bug
    // {setup code}

    // Act - perform the action that triggered the bug
    // {action code}

    // Assert - verify the correct behavior (not the buggy behavior)
    await expect(page.locator('[data-testid="{element}"]')).toBeVisible();
    // Add more specific assertions based on the bug
  });

  /**
   * Additional edge cases related to this bug
   */
  test('should handle edge case: {description}', async ({ page }) => {
    // Test related edge cases to ensure comprehensive fix
  });

});
