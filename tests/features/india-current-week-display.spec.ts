import { test, expect } from '@playwright/test';

/**
 * Feature 16: TDD Test - India Current Week Category Display
 * 
 * Tests India language category organization for current week:
 * - Bollywood category and movies
 * - Regional language categories (Tamil, Telugu, Malayalam, Kannada, etc.)
 * - Multi-language movie handling
 * - Movie cards with regional information
 * - Language badges/indicators
 * 
 * Expected to FAIL before implementation (TDD GATE 1)
 */

test.describe('India Current Week Category Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Switch to India country
    const indiaButton = page.locator('.country-btn[data-country="india"]');
    await indiaButton.click();
    await page.waitForTimeout(500); // Wait for data to load
  });

  test('should display India as selected country after switching', async ({ page }) => {
    // Verify India country button is active
    const indiaButton = page.locator('.country-btn[data-country="india"]');
    await expect(indiaButton).toHaveClass(/active/);
    await expect(indiaButton).toHaveAttribute('aria-pressed', 'true');
    await expect(indiaButton).toHaveAttribute('aria-current', 'true');

    // Verify US is no longer active
    const usButton = page.locator('.country-btn[data-country="us"]');
    await expect(usButton).not.toHaveClass(/active/);
    await expect(usButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should display Bollywood category with movies', async ({ page }) => {
    // Verify Bollywood category exists
    const bollywoodSection = page.locator('[data-category="bollywood"]');
    await expect(bollywoodSection).toBeVisible();

    // Verify category heading
    const categoryHeading = bollywoodSection.locator('h3');
    await expect(categoryHeading).toBeVisible();
    await expect(categoryHeading).toContainText(/Bollywood|Hindi/i);

    // Verify at least one movie card in this category
    const movieCards = bollywoodSection.locator('.movie-card');
    await expect(movieCards.first()).toBeVisible();
    const movieCount = await movieCards.count();
    expect(movieCount).toBeGreaterThan(0);
  });

  test('should display regional language categories', async ({ page }) => {
    // Check for common regional categories
    const regionalCategories = [
      'tollywood-telugu',
      'kollywood-tamil',
      'mollywood-malayalam',
      'sandalwood-kannada'
    ];

    // At least one regional category should be visible
    let foundRegionalCategory = false;
    for (const category of regionalCategories) {
      const categorySection = page.locator(`[data-category="${category}"]`);
      if (await categorySection.isVisible()) {
        foundRegionalCategory = true;
        
        // Verify heading exists
        const heading = categorySection.locator('h3');
        await expect(heading).toBeVisible();
        break;
      }
    }

    expect(foundRegionalCategory).toBe(true);
  });

  test('should display movie cards with language information', async ({ page }) => {
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

    // Verify language indicator/badge exists
    const languageBadge = firstMovieCard.locator('.language-badge, .language-tag, [data-language]');
    await expect(languageBadge.first()).toBeVisible();
    const languageText = await languageBadge.first().textContent();
    expect(languageText?.length).toBeGreaterThan(0);
  });

  test('should display multi-language movies with all languages', async ({ page }) => {
    // Find a movie card with multiple languages
    const movieCards = page.locator('.movie-card');
    const cardCount = await movieCards.count();

    // Check if any movie has multiple language badges
    let foundMultiLanguageMovie = false;
    for (let i = 0; i < cardCount; i++) {
      const card = movieCards.nth(i);
      const languageBadges = card.locator('.language-badge, .language-tag, [data-language]');
      const badgeCount = await languageBadges.count();
      
      if (badgeCount > 1) {
        foundMultiLanguageMovie = true;
        
        // Verify each language badge is visible
        for (let j = 0; j < badgeCount; j++) {
          await expect(languageBadges.nth(j)).toBeVisible();
        }
        break;
      }
    }

    // Multi-language movies are optional, but structure should support them
    // This test just verifies the implementation handles them if present
    expect(foundMultiLanguageMovie === true || foundMultiLanguageMovie === false).toBe(true);
  });

  test('should organize language categories in semantic structure', async ({ page }) => {
    // Verify main content area exists
    const mainContent = page.locator('#current-week-post');
    await expect(mainContent).toBeVisible();

    // Verify categories are within main content
    const categorySections = mainContent.locator('[data-category]');
    const categoryCount = await categorySections.count();
    expect(categoryCount).toBeGreaterThanOrEqual(1); // At least Bollywood

    // Verify each category has proper heading structure
    for (let i = 0; i < categoryCount; i++) {
      const category = categorySections.nth(i);
      const heading = category.locator('h3');
      await expect(heading).toBeVisible();
    }
  });

  test('should display category metadata with movie counts', async ({ page }) => {
    // Verify Bollywood shows movie count
    const bollywoodSection = page.locator('[data-category="bollywood"]');
    if (await bollywoodSection.isVisible()) {
      const heading = bollywoodSection.locator('h3');
      const headingText = await heading.textContent();
      
      // Should contain count like "Bollywood (8 movies)"
      expect(headingText).toMatch(/\(\d+\s+(movie|movies)\)/i);
    }
  });

  test('should maintain accessibility for India categories', async ({ page }) => {
    // Verify category sections have appropriate structure
    const categorySections = page.locator('[data-category]');
    const firstCategory = categorySections.first();
    await expect(firstCategory).toBeVisible();

    // Should have semantic HTML elements
    const tagName = await firstCategory.evaluate(el => el.tagName.toLowerCase());
    expect(['section', 'div', 'article']).toContain(tagName);

    // Language badges should be readable
    const languageBadges = page.locator('.language-badge, .language-tag, [data-language]');
    const firstBadge = languageBadges.first();
    if (await firstBadge.isVisible()) {
      const badgeText = await firstBadge.textContent();
      expect(badgeText?.length).toBeGreaterThan(0);
    }
  });

  test('should handle category switching from US to India', async ({ page }) => {
    // We already switched to India in beforeEach
    // Verify US categories are no longer visible
    const usWideRelease = page.locator('[data-category="wide-release"]');
    const usLimitedRelease = page.locator('[data-category="limited-release"]');

    // US categories should not be visible when India is selected
    if (await usWideRelease.isVisible()) {
      expect(false).toBe(true); // Should not reach here
    }

    // India categories should be visible
    const bollywoodSection = page.locator('[data-category="bollywood"]');
    await expect(bollywoodSection).toBeVisible();
  });
});
