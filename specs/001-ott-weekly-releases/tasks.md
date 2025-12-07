# Task List

**Feature Branch**: 001-ott-weekly-releases  
**Generated from**: [plan.md](plan.md)  
**Date**: 2024-12-07

## Overview

- **Total Tasks**: 35
- **Estimated Sessions**: 11-16
- **TDD Mandatory**: All code tasks require test-first approach

## Task Categories

---

## Category: Phase 1 - Foundation & Static Structure

### Task T001: Setup Project Directory Structure
- **ID**: T001
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: None
- **Estimated Effort**: 0.5 sessions

**Description**:
Create the complete project directory structure with all necessary folders and placeholder files. This establishes the foundation for all subsequent development work.

**Acceptance Criteria**:
- [ ] Directory structure matches specification
- [ ] All folders created with proper naming
- [ ] Placeholder files in place (empty or minimal content)
- [ ] `.gitkeep` files in empty directories to track them in git

**Files to Create**:
```
index.html
assets/css/main.css
assets/js/app.js
assets/images/logos/.gitkeep
data/current-week.json
data/archive/.gitkeep
scripts/fetch-releases.js
tests/features/.gitkeep
tests/build/.gitkeep
tests/integration/.gitkeep
playwright.config.ts
package.json
```

**Testing Notes**:
Verify by running `tree` or `ls -R` to confirm structure exists.

---

### Task T002: Create HTML Skeleton with Semantic Structure
- **ID**: T002
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: T001
- **Estimated Effort**: 1 session

**Description**:
Create the main `index.html` file with semantic HTML5 structure, proper meta tags for SEO and mobile optimization, and ARIA labels for accessibility. The HTML should define the layout structure with empty content containers that JavaScript will populate.

**Acceptance Criteria**:
- [ ] Test file `tests/features/html-structure.spec.ts` exists and FAILS before implementation
- [ ] HTML uses semantic tags: `<header>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- [ ] Contains proper `<meta>` tags: charset, viewport, description
- [ ] Has `lang="en"` attribute on `<html>`
- [ ] Includes Open Graph meta tags for social sharing
- [ ] Contains content containers with IDs: `#current-week-post`, `#archive-nav`, `#loading-indicator`
- [ ] Links to CSS and JS files correctly
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/html-structure.spec.ts` (create first - TDD)
- `index.html` (implementation)

**Testing Notes**:
```bash
# Run test (should FAIL first)
npx playwright test tests/features/html-structure.spec.ts

# After implementation, run again (should PASS)
npx playwright test tests/features/html-structure.spec.ts
```

---

### Task T003: Create CSS Styling System with Variables
- **ID**: T003
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T002
- **Estimated Effort**: 1 session

**Description**:
Create a comprehensive CSS styling system using CSS custom properties (variables) for theming, mobile-first responsive design with CSS Grid and Flexbox, and BEM naming convention for maintainability. The design should be clean, modern, and optimized for readability.

**Acceptance Criteria**:
- [ ] Test file `tests/features/responsive-design.spec.ts` exists and FAILS before implementation
- [ ] CSS variables defined for: colors, spacing, typography, shadows
- [ ] Mobile-first breakpoints: 320px (base), 768px (tablet), 1024px (desktop), 1920px (large)
- [ ] CSS Grid used for main page layout
- [ ] Flexbox used for component layouts
- [ ] BEM naming convention used consistently
- [ ] Smooth transitions for hover/focus states
- [ ] Print styles included
- [ ] Test PASSES after implementation at all breakpoints

**Files to Create/Modify**:
- `tests/features/responsive-design.spec.ts` (create first - TDD)
- `assets/css/main.css` (implementation)

**Testing Notes**:
```bash
# Test at multiple viewport widths
npx playwright test tests/features/responsive-design.spec.ts
```

---

### Task T004: Create Mock JSON Data Files
- **ID**: T004
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: T001
- **Estimated Effort**: 0.5 sessions

**Description**:
Create sample JSON data files that follow the exact schema defined in the specification. These files will be used for initial development and testing before API integration.

**Acceptance Criteria**:
- [ ] `data/current-week.json` contains valid sample data for current week
- [ ] `data/archive/2024-49.json` contains valid sample data for an archived week
- [ ] JSON structure matches schema from spec.md exactly
- [ ] Includes all 8 platforms (some with releases, some without)
- [ ] Realistic sample content for testing UI
- [ ] Valid JSON (passes `JSON.parse()`)

**Files to Create**:
- `data/current-week.json`
- `data/archive/2024-49.json`

**Testing Notes**:
```bash
# Validate JSON
node -e "require('./data/current-week.json')"
node -e "require('./data/archive/2024-49.json')"
```

---

### Task T005: Create JavaScript Module for Content Rendering
- **ID**: T005
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T002, T003, T004
- **Estimated Effort**: 1.5 sessions

**Description**:
Create the main JavaScript application module that fetches JSON data and renders it to the page using template literals. Use ES6 module structure with clean separation of concerns.

**Acceptance Criteria**:
- [ ] Test file `tests/features/content-rendering.spec.ts` exists and FAILS before implementation
- [ ] ES6 module syntax with proper exports
- [ ] Function `loadCurrentWeek()` - fetches and renders current week data
- [ ] Function `renderPost(postData)` - renders complete post structure
- [ ] Function `renderPlatform(platform)` - renders platform section
- [ ] Function `renderRelease(release)` - renders individual release card
- [ ] Uses native `fetch()` API
- [ ] Uses template literals for HTML generation
- [ ] Handles loading states (show spinner while fetching)
- [ ] Handles errors gracefully (show error message)
- [ ] No console errors during execution
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/content-rendering.spec.ts` (create first - TDD)
- `assets/js/app.js` (implementation)

**Testing Notes**:
```bash
npx playwright test tests/features/content-rendering.spec.ts
```

---

### Task T006: Setup Playwright Testing Infrastructure
- **ID**: T006
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: T001
- **Estimated Effort**: 0.5 sessions

**Description**:
Initialize Playwright testing framework with proper configuration for the project. This must be done early as TDD requires tests before implementation.

**Acceptance Criteria**:
- [ ] `package.json` includes Playwright as devDependency
- [ ] `playwright.config.ts` configured for project
- [ ] Test browsers: Chromium, Firefox, WebKit
- [ ] Base URL set for local development
- [ ] Screenshots on failure enabled
- [ ] HTML reporter configured
- [ ] Tests can be run with `npx playwright test`

**Files to Create/Modify**:
- `package.json`
- `playwright.config.ts`

**Testing Notes**:
```bash
npm install
npx playwright install
npx playwright test --list  # Should list configured projects
```

---

## Category: Phase 2 - Perplexity API Integration

### Task T007: Create Perplexity API Client Script
- **ID**: T007
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T001, T006
- **Estimated Effort**: 1.5 sessions

**Description**:
Create a Node.js script that calls the Perplexity API to fetch OTT release data. The script should use the `sonar` model and be designed to run in GitHub Actions.

**Acceptance Criteria**:
- [ ] Test file `tests/build/api-integration.spec.ts` exists and FAILS before implementation
- [ ] Script `scripts/fetch-releases.js` created
- [ ] Uses native `fetch()` (Node 18+)
- [ ] Reads API key from `PERPLEXITY_API_KEY` environment variable
- [ ] Calls `https://api.perplexity.ai/chat/completions`
- [ ] Uses `sonar` model as specified
- [ ] Includes `web_search_options` for current data
- [ ] Returns structured response
- [ ] Test PASSES after implementation (with mocked API)

**Files to Create/Modify**:
- `tests/build/api-integration.spec.ts` (create first - TDD)
- `scripts/fetch-releases.js` (implementation)

**Testing Notes**:
```bash
# Test with mock (no real API call)
npx playwright test tests/build/api-integration.spec.ts

# Manual test with real API
PERPLEXITY_API_KEY=your_key node scripts/fetch-releases.js
```

---

### Task T008: Design and Implement API Prompt Template
- **ID**: T008
- **Priority**: P1 (Critical)
- **Complexity**: High
- **Depends On**: T007
- **Estimated Effort**: 1 session

**Description**:
Design the prompt template that will be sent to Perplexity API to fetch OTT release data. The prompt must be carefully crafted to return valid, structured JSON.

**Acceptance Criteria**:
- [ ] System prompt instructs model to return valid JSON only
- [ ] User prompt requests specific data format
- [ ] Prompt includes all 8 platforms: Netflix, Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock
- [ ] Requests: title, release date (YYYY-MM-DD), genre array, type, description
- [ ] Date range is dynamically calculated for current week
- [ ] Uses `web_search_options.search_context_size: "low"` for efficiency
- [ ] Tested with actual API to verify response format

**Files to Modify**:
- `scripts/fetch-releases.js` (add prompt template)

**Testing Notes**:
Test with real API and manually verify response quality.

---

### Task T009: Implement JSON Response Parser and Validator
- **ID**: T009
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T007
- **Estimated Effort**: 1 session

**Description**:
Create functions to parse the API response and validate it against the expected JSON schema. Invalid responses should be rejected to prevent corrupting stored data.

**Acceptance Criteria**:
- [ ] Test file `tests/build/json-validation.spec.ts` exists and FAILS before implementation
- [ ] Function `parseApiResponse(response)` extracts JSON from API response
- [ ] Function `validateSchema(data)` validates against expected schema
- [ ] Function `transformToAppFormat(data)` adds metadata (week number, dates, timestamp, IDs)
- [ ] Handles partial/incomplete responses
- [ ] Rejects clearly invalid data
- [ ] Logs validation errors with context
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/build/json-validation.spec.ts` (create first - TDD)
- `scripts/fetch-releases.js` (add parser/validator functions)

**Testing Notes**:
```bash
npx playwright test tests/build/json-validation.spec.ts
```

---

### Task T010: Implement Caching Mechanism
- **ID**: T010
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T009
- **Estimated Effort**: 1 session

**Description**:
Implement a file-based caching mechanism to store API responses. The cache ensures data availability when the API fails and prevents unnecessary API calls.

**Acceptance Criteria**:
- [ ] Test file `tests/build/caching.spec.ts` exists and FAILS before implementation
- [ ] Cache stored in `data/.cache/` directory
- [ ] Function `loadCache()` retrieves cached data
- [ ] Function `saveCache(data)` stores data with timestamp
- [ ] Function `isCacheValid()` checks if cache is within TTL (24 hours)
- [ ] Falls back to cache when API fails
- [ ] Logs cache hit/miss for debugging
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/build/caching.spec.ts` (create first - TDD)
- `scripts/fetch-releases.js` (add caching functions)
- `data/.cache/.gitkeep` (create cache directory)

**Testing Notes**:
```bash
npx playwright test tests/build/caching.spec.ts
```

---

### Task T011: Implement Error Handling and Retry Logic
- **ID**: T011
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T007, T010
- **Estimated Effort**: 1 session

**Description**:
Implement robust error handling for API failures including rate limits (429), server errors (500), and timeouts. Include retry logic with exponential backoff.

**Acceptance Criteria**:
- [ ] Test file `tests/build/error-handling.spec.ts` exists and FAILS before implementation
- [ ] Handles HTTP 429 (rate limit) - retry after delay
- [ ] Handles HTTP 500 (server error) - retry once
- [ ] Handles network timeout - retry once
- [ ] Maximum 2 retry attempts
- [ ] Falls back to cached data if all retries fail
- [ ] Never overwrites good data with failed request data
- [ ] Logs all errors with context for debugging
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/build/error-handling.spec.ts` (create first - TDD)
- `scripts/fetch-releases.js` (add error handling)

**Testing Notes**:
```bash
npx playwright test tests/build/error-handling.spec.ts
```

---

### Task T012: Create Date/Week Utility Functions
- **ID**: T012
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T001
- **Estimated Effort**: 0.5 sessions

**Description**:
Create utility functions for calculating week numbers, date ranges, and formatting dates. These are used throughout the application.

**Acceptance Criteria**:
- [ ] Test file `tests/build/date-utils.spec.ts` exists and FAILS before implementation
- [ ] Function `getISOWeekNumber(date)` returns ISO week number
- [ ] Function `getWeekDateRange(date)` returns {start, end} for Monday-Sunday
- [ ] Function `formatDateRange(start, end)` returns "Dec 2-8, 2024" format
- [ ] Function `isNewWeek()` detects Monday transition
- [ ] All dates in UTC to avoid timezone issues
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/build/date-utils.spec.ts` (create first - TDD)
- `scripts/utils/date-utils.js` (implementation)

**Testing Notes**:
```bash
npx playwright test tests/build/date-utils.spec.ts
```

---

## Category: Phase 3 - GitHub Actions Automation

### Task T013: Create GitHub Actions Daily Update Workflow
- **ID**: T013
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T007, T011
- **Estimated Effort**: 1 session

**Description**:
Create a GitHub Actions workflow that runs daily to fetch fresh OTT release data and update the site.

**Acceptance Criteria**:
- [ ] Workflow file `.github/workflows/daily-update.yml` created
- [ ] Triggers on cron schedule: `0 9 * * *` (9 AM UTC daily)
- [ ] Also allows manual trigger (`workflow_dispatch`)
- [ ] Uses Node.js 18+
- [ ] Accesses `PERPLEXITY_API_KEY` from secrets
- [ ] Runs `scripts/fetch-releases.js`
- [ ] Commits changes only if files changed
- [ ] Pushes to repository
- [ ] Workflow syntax is valid (passes YAML linting)

**Files to Create**:
- `.github/workflows/daily-update.yml`

**Testing Notes**:
```bash
# Validate YAML
npx yaml-lint .github/workflows/daily-update.yml

# Test workflow locally with act (optional)
act -j update
```

---

### Task T014: Implement Week Transition Logic
- **ID**: T014
- **Priority**: P1 (Critical)
- **Complexity**: High
- **Depends On**: T012, T013
- **Estimated Effort**: 1 session

**Description**:
Implement logic to detect when a new week starts and archive the previous week's data.

**Acceptance Criteria**:
- [ ] Test file `tests/build/week-transition.spec.ts` exists and FAILS before implementation
- [ ] Detects Monday (start of new ISO week)
- [ ] Archives `data/current-week.json` to `data/archive/YYYY-WW.json`
- [ ] Creates new empty `data/current-week.json` for new week
- [ ] Preserves archive files (never overwrite)
- [ ] Works correctly at year boundaries (week 52 → week 1)
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/build/week-transition.spec.ts` (create first - TDD)
- `scripts/fetch-releases.js` (add week transition logic)

**Testing Notes**:
```bash
npx playwright test tests/build/week-transition.spec.ts
```

---

### Task T015: Configure GitHub Secrets and Environment
- **ID**: T015
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: T013
- **Estimated Effort**: 0.5 sessions

**Description**:
Document and configure the required GitHub repository secrets and environment variables.

**Acceptance Criteria**:
- [ ] `PERPLEXITY_API_KEY` documented in README
- [ ] Step-by-step instructions for adding secret
- [ ] Workflow correctly references `${{ secrets.PERPLEXITY_API_KEY }}`
- [ ] Local development uses `.env` file (git-ignored)
- [ ] `.env.example` file shows required variables

**Files to Create/Modify**:
- `README.md` (add configuration section)
- `.env.example`
- `.gitignore` (ensure `.env` is ignored)

**Testing Notes**:
Verify secret is accessible in workflow by checking logs.

---

### Task T016: Implement Git Commit and Push Logic
- **ID**: T016
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T013
- **Estimated Effort**: 0.5 sessions

**Description**:
Add logic to the GitHub Actions workflow to commit and push changes only when data files have been updated.

**Acceptance Criteria**:
- [ ] Configures git user for commits (GitHub Actions bot)
- [ ] Checks if files have changed before committing
- [ ] Creates descriptive commit message: "chore: update weekly releases [YYYY-MM-DD]"
- [ ] Pushes only if there are new commits
- [ ] Does not fail if there are no changes

**Files to Modify**:
- `.github/workflows/daily-update.yml`

**Testing Notes**:
Test by manually triggering workflow with no data changes.

---

### Task T017: Add Workflow Failure Notifications
- **ID**: T017
- **Priority**: P3 (Low)
- **Complexity**: Low
- **Depends On**: T013
- **Estimated Effort**: 0.5 sessions

**Description**:
Add automated notifications when the daily update workflow fails repeatedly.

**Acceptance Criteria**:
- [ ] Creates GitHub Issue on workflow failure
- [ ] Issue includes error context and logs
- [ ] Labels issue as "automation-failure"
- [ ] Only creates issue if not already open
- [ ] Includes link to failed workflow run

**Files to Modify**:
- `.github/workflows/daily-update.yml`

**Testing Notes**:
Test by intentionally failing workflow.

---

## Category: Phase 4 - Archive System & Navigation

### Task T018: Create Archive Index Generator
- **ID**: T018
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T014
- **Estimated Effort**: 1 session

**Description**:
Create a script that generates an index of all archived weeks for the navigation menu.

**Acceptance Criteria**:
- [ ] Test file `tests/features/archive-list.spec.ts` exists and FAILS before implementation
- [ ] Scans `data/archive/` directory for JSON files
- [ ] Extracts week metadata from each file
- [ ] Sorts by date (newest first)
- [ ] Generates `data/archive-index.json` with list of weeks
- [ ] Runs as part of build process
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/archive-list.spec.ts` (create first - TDD)
- `scripts/generate-archive-index.js` (implementation)
- `data/archive-index.json` (generated)

**Testing Notes**:
```bash
npx playwright test tests/features/archive-list.spec.ts
```

---

### Task T019: Implement Archive Navigation UI
- **ID**: T019
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T005, T018
- **Estimated Effort**: 1 session

**Description**:
Create the UI component for navigating between archived weeks.

**Acceptance Criteria**:
- [ ] Test file `tests/features/archive-navigation.spec.ts` exists and FAILS before implementation
- [ ] Archive menu displays in sidebar or dropdown
- [ ] Lists all available weeks: "Week of Dec 2-8, 2024"
- [ ] Current/active week is highlighted
- [ ] Click on week loads that week's data
- [ ] Mobile-responsive design
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/archive-navigation.spec.ts` (create first - TDD)
- `assets/js/app.js` (add navigation rendering)
- `assets/css/main.css` (add navigation styles)

**Testing Notes**:
```bash
npx playwright test tests/features/archive-navigation.spec.ts
```

---

### Task T020: Implement Archive Post Loading
- **ID**: T020
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T019
- **Estimated Effort**: 1 session

**Description**:
Add functionality to load and display archived week posts when selected.

**Acceptance Criteria**:
- [ ] Test file `tests/features/archive-loading.spec.ts` exists and FAILS before implementation
- [ ] Function `loadArchivedWeek(year, weekNumber)` fetches archive data
- [ ] Reuses `renderPost()` function for consistent display
- [ ] Shows loading indicator while fetching
- [ ] Handles 404 (missing archive) gracefully
- [ ] Shows "Archive not found" message for missing weeks
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/archive-loading.spec.ts` (create first - TDD)
- `assets/js/app.js` (add archive loading)

**Testing Notes**:
```bash
npx playwright test tests/features/archive-loading.spec.ts
```

---

### Task T021: Implement Hash-Based URL Routing
- **ID**: T021
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T020
- **Estimated Effort**: 1 session

**Description**:
Add URL hash-based routing so users can bookmark and share links to specific weeks.

**Acceptance Criteria**:
- [ ] Test file `tests/features/url-routing.spec.ts` exists and FAILS before implementation
- [ ] URL format: `#archive/2024-49` for archived weeks
- [ ] URL format: `#current` or no hash for current week
- [ ] Updates URL when navigating between weeks
- [ ] Loads correct week based on URL on page load
- [ ] Supports browser back/forward buttons
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/url-routing.spec.ts` (create first - TDD)
- `assets/js/app.js` (add routing logic)

**Testing Notes**:
```bash
npx playwright test tests/features/url-routing.spec.ts
```

---

### Task T022: Add "Back to Current Week" Button
- **ID**: T022
- **Priority**: P3 (Medium)
- **Complexity**: Low
- **Depends On**: T020
- **Estimated Effort**: 0.5 sessions

**Description**:
Add a prominent button to return to the current week when viewing an archive.

**Acceptance Criteria**:
- [ ] Button visible only when viewing archived week
- [ ] Clear label: "← Back to Current Week"
- [ ] Clicking loads current week and updates URL
- [ ] Smooth transition/scroll to top
- [ ] Accessible (keyboard, focus states)

**Files to Modify**:
- `assets/js/app.js`
- `assets/css/main.css`

**Testing Notes**:
Manual testing with visual verification.

---

## Category: Phase 5 - Performance Optimization

### Task T023: Optimize and Compress Assets
- **ID**: T023
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T019
- **Estimated Effort**: 1 session

**Description**:
Optimize all assets (images, CSS, JS) for fastest possible loading.

**Acceptance Criteria**:
- [ ] Test file `tests/features/page-load.spec.ts` exists and FAILS before implementation
- [ ] Platform logos compressed (WebP with JPG fallback)
- [ ] Total logo size <100KB
- [ ] CSS minified for production (optional, consider keeping readable)
- [ ] Images use appropriate dimensions (not oversized)
- [ ] No unused CSS rules
- [ ] Total page size <500KB
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/features/page-load.spec.ts` (create first - TDD)
- `assets/images/logos/` (optimized images)
- `assets/css/main.css` (cleanup unused styles)

**Testing Notes**:
```bash
npx playwright test tests/features/page-load.spec.ts
```

---

### Task T024: Implement Lazy Loading for Images
- **ID**: T024
- **Priority**: P2 (High)
- **Complexity**: Low
- **Depends On**: T023
- **Estimated Effort**: 0.5 sessions

**Description**:
Implement native lazy loading for all images to improve initial page load time.

**Acceptance Criteria**:
- [ ] All `<img>` tags have `loading="lazy"` attribute
- [ ] Hero/above-fold images excluded from lazy loading
- [ ] Images load only when scrolled into viewport
- [ ] No visual jank during image loading

**Files to Modify**:
- `index.html`
- `assets/js/app.js` (ensure dynamic images have lazy loading)

**Testing Notes**:
Use Chrome DevTools Network tab to verify lazy loading.

---

### Task T025: Inline Critical CSS
- **ID**: T025
- **Priority**: P3 (Medium)
- **Complexity**: Low
- **Depends On**: T023
- **Estimated Effort**: 0.5 sessions

**Description**:
Inline critical above-the-fold CSS to eliminate render-blocking requests.

**Acceptance Criteria**:
- [ ] Critical CSS (header, hero, initial content) inlined in `<head>`
- [ ] Full stylesheet still linked for remaining styles
- [ ] First Contentful Paint <1 second
- [ ] No flash of unstyled content (FOUC)

**Files to Modify**:
- `index.html`

**Testing Notes**:
Run Lighthouse and check FCP metric.

---

### Task T026: Run and Pass Lighthouse Audits
- **ID**: T026
- **Priority**: P1 (Critical)
- **Complexity**: Medium
- **Depends On**: T023, T024, T025
- **Estimated Effort**: 1 session

**Description**:
Run Lighthouse audits and fix all issues to achieve scores >90 in all categories.

**Acceptance Criteria**:
- [ ] Test file `tests/performance/lighthouse.spec.ts` exists
- [ ] Performance score >90
- [ ] Accessibility score >90
- [ ] Best Practices score >90
- [ ] SEO score >90
- [ ] All audit failures documented and addressed
- [ ] Test PASSES after implementation

**Files to Create/Modify**:
- `tests/performance/lighthouse.spec.ts`
- Various files as needed to fix issues

**Testing Notes**:
```bash
npx playwright test tests/performance/lighthouse.spec.ts
# Also run manual Lighthouse in Chrome DevTools
```

---

## Category: Phase 6 - Accessibility & Polish

### Task T027: Accessibility Audit and Fixes
- **ID**: T027
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T026
- **Estimated Effort**: 1 session

**Description**:
Perform comprehensive accessibility audit and fix all WCAG 2.1 Level AA violations.

**Acceptance Criteria**:
- [ ] Test file `tests/features/accessibility.spec.ts` exists and FAILS before fixes
- [ ] All interactive elements keyboard accessible
- [ ] Proper focus indicators visible
- [ ] Color contrast ratio ≥4.5:1 for normal text
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA labels on non-text elements
- [ ] Skip-to-content link present
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] Test PASSES after fixes

**Files to Create/Modify**:
- `tests/features/accessibility.spec.ts` (create first - TDD)
- `index.html` (add ARIA, skip link)
- `assets/css/main.css` (focus styles, contrast fixes)

**Testing Notes**:
```bash
npx playwright test tests/features/accessibility.spec.ts
# Also use axe DevTools browser extension
```

---

### Task T028: Add Loading States and Indicators
- **ID**: T028
- **Priority**: P2 (High)
- **Complexity**: Low
- **Depends On**: T005
- **Estimated Effort**: 0.5 sessions

**Description**:
Add visual feedback during data loading and error states.

**Acceptance Criteria**:
- [ ] Loading spinner shows while fetching data
- [ ] Skeleton screens for content areas (optional enhancement)
- [ ] Error message with retry button on fetch failure
- [ ] Loading states are accessible (ARIA attributes)

**Files to Modify**:
- `index.html` (loading/error templates)
- `assets/js/app.js` (loading state logic)
- `assets/css/main.css` (spinner styles)

**Testing Notes**:
Simulate slow network in DevTools to verify loading states.

---

### Task T029: Add "Last Updated" Timestamp Display
- **ID**: T029
- **Priority**: P2 (High)
- **Complexity**: Low
- **Depends On**: T005
- **Estimated Effort**: 0.5 sessions

**Description**:
Display the last updated timestamp in the post footer, formatted for user's locale.

**Acceptance Criteria**:
- [ ] Timestamp displays in footer: "Last updated: Dec 7, 2024 at 9:15 AM"
- [ ] Uses `Intl.DateTimeFormat` for localization
- [ ] Updates when data refreshes
- [ ] Accessible (not just visual)

**Files to Modify**:
- `assets/js/app.js`

**Testing Notes**:
Verify different locales show appropriate formatting.

---

### Task T030: Add SEO Meta Tags and Open Graph
- **ID**: T030
- **Priority**: P3 (Medium)
- **Complexity**: Low
- **Depends On**: T002
- **Estimated Effort**: 0.5 sessions

**Description**:
Add comprehensive SEO and social sharing meta tags.

**Acceptance Criteria**:
- [ ] Meta description with relevant keywords
- [ ] Open Graph tags: og:title, og:description, og:image, og:url
- [ ] Twitter Card tags: twitter:card, twitter:title, twitter:description
- [ ] Canonical URL
- [ ] Structured data (JSON-LD) for article/blog post (optional)

**Files to Modify**:
- `index.html`

**Testing Notes**:
Use Facebook Sharing Debugger and Twitter Card Validator.

---

## Category: Phase 7 - Testing & Deployment

### Task T031: Run Full E2E Test Suite
- **ID**: T031
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: All previous tasks
- **Estimated Effort**: 0.5 sessions

**Description**:
Execute all Playwright tests and fix any failures.

**Acceptance Criteria**:
- [ ] All tests pass (100% pass rate)
- [ ] No flaky tests
- [ ] Test execution time <5 minutes
- [ ] Test report generated

**Testing Notes**:
```bash
npx playwright test
npx playwright show-report
```

---

### Task T032: Cross-Browser Testing
- **ID**: T032
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T031
- **Estimated Effort**: 1 session

**Description**:
Test the application across all major browsers and fix any compatibility issues.

**Acceptance Criteria**:
- [ ] Test file `tests/browsers/cross-browser.spec.ts` covers major browsers
- [ ] Chrome (latest) - works correctly
- [ ] Firefox (latest) - works correctly
- [ ] Safari (latest) - works correctly
- [ ] Edge (latest) - works correctly
- [ ] No browser-specific bugs
- [ ] Test PASSES on all browsers

**Files to Create**:
- `tests/browsers/cross-browser.spec.ts`

**Testing Notes**:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

### Task T033: Mobile Device Testing
- **ID**: T033
- **Priority**: P2 (High)
- **Complexity**: Medium
- **Depends On**: T031
- **Estimated Effort**: 0.5 sessions

**Description**:
Test the application on mobile devices and viewports.

**Acceptance Criteria**:
- [ ] iOS Safari (simulated) - works correctly
- [ ] Chrome Android (simulated) - works correctly
- [ ] Touch interactions work properly
- [ ] No horizontal scrolling on mobile
- [ ] Text readable without zooming

**Files to Create**:
- `tests/mobile/mobile-devices.spec.ts`

**Testing Notes**:
```bash
npx playwright test tests/mobile/mobile-devices.spec.ts
```

---

### Task T034: Setup GitHub Pages Deployment
- **ID**: T034
- **Priority**: P1 (Critical)
- **Complexity**: Low
- **Depends On**: T031
- **Estimated Effort**: 0.5 sessions

**Description**:
Configure GitHub Pages for automatic deployment.

**Acceptance Criteria**:
- [ ] GitHub Pages enabled in repository settings
- [ ] Source: Deploy from branch
- [ ] Branch: `001-ott-weekly-releases` (or `main` after merge)
- [ ] Root directory: `/` (root of repo)
- [ ] Site accessible at `https://{username}.github.io/{repo}/`
- [ ] Custom domain configured (optional)

**Testing Notes**:
Check repository Settings > Pages after configuration.

---

### Task T035: Update Documentation (README)
- **ID**: T035
- **Priority**: P2 (High)
- **Complexity**: Low
- **Depends On**: T034
- **Estimated Effort**: 0.5 sessions

**Description**:
Update README with complete project documentation.

**Acceptance Criteria**:
- [ ] Project overview and description
- [ ] Live demo link
- [ ] Setup instructions for local development
- [ ] Environment variables documentation
- [ ] GitHub Secrets configuration guide
- [ ] Deployment instructions
- [ ] Contributing guidelines
- [ ] License information

**Files to Modify**:
- `README.md`

**Testing Notes**:
Review rendered README on GitHub.

---

## Dependency Graph

```
Phase 1 (Foundation):
T001 ──┬──> T002 ──> T003 ──> T005
       │              ↑
       ├──> T004 ─────┘
       └──> T006

Phase 2 (API):
T006 ──> T007 ──┬──> T008
                ├──> T009 ──> T010
                └──> T011
T001 ──> T012

Phase 3 (Automation):
T007, T011 ──> T013 ──┬──> T014
                      ├──> T015
                      ├──> T016
                      └──> T017

Phase 4 (Archive):
T014 ──> T018 ──> T019 ──> T020 ──┬──> T021
                                  └──> T022

Phase 5 (Performance):
T019 ──> T023 ──┬──> T024
                ├──> T025
                └──────────> T026

Phase 6 (Accessibility):
T026 ──> T027
T005 ──> T028, T029
T002 ──> T030

Phase 7 (Deploy):
All ──> T031 ──> T032, T033 ──> T034 ──> T035
```

## Suggested Execution Order

| Order | Task ID | Task Title | Priority |
|-------|---------|------------|----------|
| 1 | T001 | Setup Project Directory Structure | P1 |
| 2 | T006 | Setup Playwright Testing Infrastructure | P1 |
| 3 | T002 | Create HTML Skeleton with Semantic Structure | P1 |
| 4 | T003 | Create CSS Styling System with Variables | P1 |
| 5 | T004 | Create Mock JSON Data Files | P1 |
| 6 | T005 | Create JavaScript Module for Content Rendering | P1 |
| 7 | T012 | Create Date/Week Utility Functions | P1 |
| 8 | T007 | Create Perplexity API Client Script | P1 |
| 9 | T008 | Design and Implement API Prompt Template | P1 |
| 10 | T009 | Implement JSON Response Parser and Validator | P1 |
| 11 | T010 | Implement Caching Mechanism | P2 |
| 12 | T011 | Implement Error Handling and Retry Logic | P1 |
| 13 | T013 | Create GitHub Actions Daily Update Workflow | P1 |
| 14 | T014 | Implement Week Transition Logic | P1 |
| 15 | T015 | Configure GitHub Secrets and Environment | P1 |
| 16 | T016 | Implement Git Commit and Push Logic | P1 |
| 17 | T017 | Add Workflow Failure Notifications | P3 |
| 18 | T018 | Create Archive Index Generator | P2 |
| 19 | T019 | Implement Archive Navigation UI | P2 |
| 20 | T020 | Implement Archive Post Loading | P2 |
| 21 | T021 | Implement Hash-Based URL Routing | P2 |
| 22 | T022 | Add "Back to Current Week" Button | P3 |
| 23 | T023 | Optimize and Compress Assets | P2 |
| 24 | T024 | Implement Lazy Loading for Images | P2 |
| 25 | T025 | Inline Critical CSS | P3 |
| 26 | T026 | Run and Pass Lighthouse Audits | P1 |
| 27 | T027 | Accessibility Audit and Fixes | P2 |
| 28 | T028 | Add Loading States and Indicators | P2 |
| 29 | T029 | Add "Last Updated" Timestamp Display | P2 |
| 30 | T030 | Add SEO Meta Tags and Open Graph | P3 |
| 31 | T031 | Run Full E2E Test Suite | P1 |
| 32 | T032 | Cross-Browser Testing | P2 |
| 33 | T033 | Mobile Device Testing | P2 |
| 34 | T034 | Setup GitHub Pages Deployment | P1 |
| 35 | T035 | Update Documentation (README) | P2 |

## Summary by Priority

| Priority | Count | Tasks |
|----------|-------|-------|
| P1 (Critical) | 18 | T001-T003, T005-T009, T011-T016, T026, T031, T034 |
| P2 (High) | 13 | T010, T018-T021, T023, T024, T027-T029, T032, T033, T035 |
| P3 (Medium) | 4 | T017, T022, T025, T030 |

## Summary by Phase

| Phase | Tasks | Sessions |
|-------|-------|----------|
| Phase 1: Foundation | T001-T006 | 1-2 |
| Phase 2: API | T007-T012 | 2-3 |
| Phase 3: Automation | T013-T017 | 2-3 |
| Phase 4: Archive | T018-T022 | 2 |
| Phase 5: Performance | T023-T026 | 1-2 |
| Phase 6: Accessibility | T027-T030 | 1-2 |
| Phase 7: Deploy | T031-T035 | 1-2 |
| **Total** | **35 tasks** | **11-16 sessions** |

---

**Task List Status**: ✅ Ready for Feature List Generation  
**Next Command**: `/harness.generate`
