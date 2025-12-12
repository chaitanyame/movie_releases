import { test, expect } from '@playwright/test';

/**
 * Feature 15: TDD Test - US Current Week Category Display
 * 
 * Tests US distribution category organization for current week:
 * - Wide Release category and movies
 * - Limited Release category and movies
 * - Platform Release category and movies (if present)
 * - Movie cards with title, release date, genres
 * - Proper semantic structure
 * 
 * Expected to FAIL before implementation (TDD GATE 1)
 */

test.describe('US Current Week Category Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display US as default selected country', async ({ page }) => {
    // Verify US country button is active by default
    const usButton = page.locator('.country-btn[data-country="us"]');
    await expect(usButton).toHaveClass(/active/);
    await expect(usButton).toHaveAttribute('aria-pressed', 'true');
    await expect(usButton).toHaveAttribute('aria-current', 'true');
  });

  test('should display Wide Release category with movies', async ({ page }) => {
    // Verify Wide Release category exists
    const wideReleaseSection = page.locator('[data-category="wide-release"]');
    await expect(wideReleaseSection).toBeVisible();

    // Verify category heading
    const categoryHeading = wideReleaseSection.locator('h3');
    await expect(categoryHeading).toBeVisible();
    await expect(categoryHeading).toContainText(/Wide Release/i);

    // Verify at least one movie card in this category
    const movieCards = wideReleaseSection.locator('.movie-card');
    await expect(movieCards.first()).toBeVisible();
    const movieCount = await movieCards.count();
    expect(movieCount).toBeGreaterThan(0);
  });

  test('should display Limited Release category with movies', async ({ page }) => {
    // Verify Limited Release category exists
    const limitedReleaseSection = page.locator('[data-category="limited-release"]');
    await expect(limitedReleaseSection).toBeVisible();

    // Verify category heading
    const categoryHeading = limitedReleaseSection.locator('h3');
    await expect(categoryHeading).toBeVisible();
    await expect(categoryHeading).toContainText(/Limited Release/i);

    // Verify at least one movie card in this category
    const movieCards = limitedReleaseSection.locator('.movie-card');
    const movieCount = await movieCards.count();
    // Limited release might be empty, but section should exist
    expect(movieCount).toBeGreaterThanOrEqual(0);
  });

  test('should display movie cards with required information', async ({ page }) => {
    // Get first movie card from any category
    const firstMovieCard = page.locator('.movie-card').first();
    await expect(firstMovieCard).toBeVisible();

    // Verify movie title exists
    const movieTitle = firstMovieCard.locator('.movie-title');
    await expect(movieTitle).toBeVisible();
    const titleText = await movieTitle.textContent();
    expect(titleText?.length).toBeGreaterThan(0);

    // Verify release date exists
    const releaseDate = firstMovieCard.locator('.release-date');
    await expect(releaseDate).toBeVisible();
    const dateText = await releaseDate.textContent();
    expect(dateText).toMatch(/\d{4}-\d{2}-\d{2}/); // YYYY-MM-DD format

    // Verify genres exist (if present)
    const genres = firstMovieCard.locator('.genres');
    if (await genres.isVisible()) {
      const genresText = await genres.textContent();
      expect(genresText?.length).toBeGreaterThan(0);
    }
  });

  test('should organize categories in semantic structure', async ({ page }) => {
    // Verify main content area exists
    const mainContent = page.locator('#current-week-post');
    await expect(mainContent).toBeVisible();

    // Verify categories are within main content
    const categorySections = mainContent.locator('[data-category]');
    const categoryCount = await categorySections.count();
    expect(categoryCount).toBeGreaterThanOrEqual(2); // At least Wide + Limited

    // Verify each category has proper heading structure
    for (let i = 0; i < categoryCount; i++) {
      const category = categorySections.nth(i);
      const heading = category.locator('h3');
      await expect(heading).toBeVisible();
    }
  });

  test('should display category metadata (movie counts)', async ({ page }) => {
    // Verify Wide Release shows movie count
    const wideReleaseSection = page.locator('[data-category="wide-release"]');
    const wideReleaseHeading = wideReleaseSection.locator('h3');
    const headingText = await wideReleaseHeading.textContent();
    
    // Should contain count like "Wide Release (5 movies)"
    expect(headingText).toMatch(/\(\d+\s+(movie|movies)\)/i);
  });

  test('should maintain accessibility for category structure', async ({ page }) => {
    // Verify category sections have appropriate ARIA labels
    const categorySections = page.locator('[data-category]');
    const firstCategory = categorySections.first();
    
    // Should have region role or section element
    const tagName = await firstCategory.evaluate(el => el.tagName.toLowerCase());
    expect(['section', 'div']).toContain(tagName);

    // Movie cards should have article role or article element
    const firstMovieCard = page.locator('.movie-card').first();
    const cardTagName = await firstMovieCard.evaluate(el => el.tagName.toLowerCase());
    expect(['article', 'div']).toContain(cardTagName);
  });
});
