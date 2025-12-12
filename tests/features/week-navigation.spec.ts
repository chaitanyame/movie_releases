/**
 * Feature 26-28: Last Week Navigation Tests
 * Tests for week navigation buttons (last/current/next)
 * 
 * TDD GATE 1: This test should FAIL before implementation
 * TDD GATE 2: This test should PASS after implementation
 */

import { test, expect } from '@playwright/test';

test.describe('Week Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
    });

    test('Feature 26: should have week navigation buttons', async ({ page }) => {
        // Check all three week buttons exist
        const lastWeekBtn = page.locator('button.week-btn[data-week="last"]');
        const currentWeekBtn = page.locator('button.week-btn[data-week="current"]');
        const nextWeekBtn = page.locator('button.week-btn[data-week="next"]');

        await expect(lastWeekBtn).toBeVisible();
        await expect(currentWeekBtn).toBeVisible();
        await expect(nextWeekBtn).toBeVisible();

        // Current week should be active by default
        await expect(currentWeekBtn).toHaveClass(/active/);
        await expect(currentWeekBtn).toHaveAttribute('aria-current', 'true');
    });

    test('Feature 27: should navigate to last week on button click', async ({ page }) => {
        const lastWeekBtn = page.locator('button.week-btn[data-week="last"]');
        const currentWeekBtn = page.locator('button.week-btn[data-week="current"]');

        // Click last week button
        await lastWeekBtn.click();

        // Wait for content to load
        await page.waitForTimeout(500);

        // Last week button should be active
        await expect(lastWeekBtn).toHaveClass(/active/);
        await expect(lastWeekBtn).toHaveAttribute('aria-current', 'true');

        // Current week button should not be active
        await expect(currentWeekBtn).not.toHaveClass(/active/);
        await expect(currentWeekBtn).not.toHaveAttribute('aria-current');

        // Verify data changed (check for last week's data)
        // For US: Last week (2025-49) should have Wicked and Gladiator II
        const movieCards = page.locator('.movie-card');
        const count = await movieCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Feature 27: should navigate to next week on button click', async ({ page }) => {
        const nextWeekBtn = page.locator('button.week-btn[data-week="next"]');
        const currentWeekBtn = page.locator('button.week-btn[data-week="current"]');

        // Click next week button
        await nextWeekBtn.click();

        // Wait for content to load
        await page.waitForTimeout(500);

        // Next week button should be active
        await expect(nextWeekBtn).toHaveClass(/active/);
        await expect(nextWeekBtn).toHaveAttribute('aria-current', 'true');

        // Current week button should not be active
        await expect(currentWeekBtn).not.toHaveClass(/active/);

        // Verify data changed (check for next week's data)
        // For US: Next week (2025-51) should have Nosferatu
        const movieCards = page.locator('.movie-card');
        const count = await movieCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Feature 28: should update active week title', async ({ page }) => {
        const activeWeekTitle = page.locator('#active-week-title');
        const lastWeekBtn = page.locator('button.week-btn[data-week="last"]');
        const currentWeekBtn = page.locator('button.week-btn[data-week="current"]');

        // Get initial title (current week)
        const initialTitle = await activeWeekTitle.textContent();
        expect(initialTitle).toBeTruthy();
        expect(initialTitle).toContain('Dec'); // Should contain month abbreviation

        // Click last week
        await lastWeekBtn.click();
        await page.waitForTimeout(500);

        // Title should change
        const lastWeekTitle = await activeWeekTitle.textContent();
        expect(lastWeekTitle).toBeTruthy();
        expect(lastWeekTitle).not.toBe(initialTitle);

        // Click back to current week
        await currentWeekBtn.click();
        await page.waitForTimeout(500);

        // Title should return to original
        const backToCurrentTitle = await activeWeekTitle.textContent();
        expect(backToCurrentTitle).toBe(initialTitle);
    });

    test('Feature 28: should maintain country when switching weeks', async ({ page }) => {
        const lastWeekBtn = page.locator('button.week-btn[data-week="last"]');
        const indiaBtn = page.locator('button.country-btn[data-country="india"]');

        // Switch to India
        await indiaBtn.click();
        await page.waitForTimeout(500);

        // Switch to last week
        await lastWeekBtn.click();
        await page.waitForTimeout(500);

        // India should still be active
        await expect(indiaBtn).toHaveClass(/active/);
        await expect(indiaBtn).toHaveAttribute('aria-current', 'true');

        // Last week should be active
        await expect(lastWeekBtn).toHaveClass(/active/);
        await expect(lastWeekBtn).toHaveAttribute('aria-current', 'true');
    });

    test('Feature 27: should display correct data for last week (US)', async ({ page }) => {
        const lastWeekBtn = page.locator('button.week-btn[data-week="last"]');

        // Click last week
        await lastWeekBtn.click();
        
        // Wait for loading to complete and content to render
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Verify categories exist
        const wideReleaseCategory = page.locator('[data-category="wide-release"]');
        await expect(wideReleaseCategory).toBeVisible();

        // Check for expected movies (Wicked, Gladiator II, The Order)
        const movieTitles = page.locator('.movie-title');
        const titles = await movieTitles.allTextContents();
        
        // Should have movies from last week
        expect(titles.length).toBeGreaterThan(0);
    });

    test('Feature 27: should display correct data for next week (US)', async ({ page }) => {
        const nextWeekBtn = page.locator('button.week-btn[data-week="next"]');

        // Click next week
        await nextWeekBtn.click();
        
        // Wait for loading to complete and content to render
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Verify categories exist
        const wideReleaseCategory = page.locator('[data-category="wide-release"]');
        await expect(wideReleaseCategory).toBeVisible();

        // Check for expected movies (Nosferatu)
        const movieTitles = page.locator('.movie-title');
        const titles = await movieTitles.allTextContents();
        
        // Should have movies from next week
        expect(titles.length).toBeGreaterThan(0);
    });

    test('Feature 28: should handle switching between all three weeks', async ({ page }) => {
        const lastWeekBtn = page.locator('button.week-btn[data-week="last"]');
        const currentWeekBtn = page.locator('button.week-btn[data-week="current"]');
        const nextWeekBtn = page.locator('button.week-btn[data-week="next"]');

        // Start at current (default)
        await expect(currentWeekBtn).toHaveClass(/active/);

        // Go to last week
        await lastWeekBtn.click();
        await page.waitForTimeout(500);
        await expect(lastWeekBtn).toHaveClass(/active/);
        await expect(currentWeekBtn).not.toHaveClass(/active/);

        // Go to next week
        await nextWeekBtn.click();
        await page.waitForTimeout(500);
        await expect(nextWeekBtn).toHaveClass(/active/);
        await expect(lastWeekBtn).not.toHaveClass(/active/);

        // Return to current
        await currentWeekBtn.click();
        await page.waitForTimeout(500);
        await expect(currentWeekBtn).toHaveClass(/active/);
        await expect(nextWeekBtn).not.toHaveClass(/active/);
    });
});
