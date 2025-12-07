# Implementation Plan

**Feature Branch**: 001-ott-weekly-releases  
**Specification**: [spec.md](spec.md)  
**Created**: 2024-12-07

## Specifications Covered
- [spec.md](spec.md) - OTT Weekly Releases static SPA

## Overview

This plan outlines the implementation of a zero-dependency static web application that displays weekly OTT streaming releases. The implementation follows a strict TDD approach with incremental feature delivery. Each phase builds upon the previous, ensuring a stable foundation before adding complexity.

## Technical Constraints

- **ZERO frameworks**: No React, Vue, Angular, Svelte
- **ZERO build tools**: No webpack, vite, parcel (unless absolutely necessary for testing)
- **Pure vanilla JavaScript**: ES6+ modules only
- **Native CSS**: Grid, Flexbox, CSS Variables (no Tailwind, Bootstrap)
- **Single HTML file**: `index.html` as entry point
- **Static hosting**: GitHub Pages (free tier)
- **TDD mandatory**: Test before code, always

## Implementation Phases

### Phase 1: Foundation & Static Structure
**Goal**: Create the basic HTML/CSS structure with manual data  
**Duration**: 1-2 sessions  
**Priority**: CRITICAL

#### Tasks

1. **Setup project structure**
   - Depends on: None
   - Complexity: Low
   - Create directory structure:
     ```
     /
     ├── index.html
     ├── assets/
     │   ├── css/
     │   │   └── main.css
     │   ├── js/
     │   │   └── app.js
     │   └── images/
     │       └── logos/
     ├── data/
     │   ├── current-week.json
     │   └── archive/
     ├── scripts/
     │   └── fetch-releases.js
     └── tests/
         └── features/
     ```

2. **Create HTML skeleton (TDD)**
   - Depends on: Task 1
   - Complexity: Low
   - Test: `tests/features/html-structure.spec.ts`
     - Verify semantic HTML5 tags (`<article>`, `<section>`, `<header>`, `<footer>`)
     - Verify meta tags (viewport, description, charset)
     - Verify accessibility (lang attribute, ARIA labels)
   - Implementation:
     - Single-page layout with semantic HTML
     - Meta tags for SEO and mobile
     - ARIA labels for accessibility
     - Empty content sections (to be filled by JS)

3. **Create CSS styling system (TDD)**
   - Depends on: Task 2
   - Complexity: Medium
   - Test: `tests/features/responsive-design.spec.ts`
     - Test at breakpoints: 320px, 768px, 1024px, 1920px
     - Verify mobile-first approach
     - Check CSS variables are defined
   - Implementation:
     - CSS custom properties for theming (colors, spacing, typography)
     - Mobile-first responsive design
     - CSS Grid for main layout
     - Flexbox for components
     - BEM naming convention

4. **Create mock JSON data**
   - Depends on: Task 1
   - Complexity: Low
   - Create `data/current-week.json` with sample data
   - Create `data/archive/2024-48.json` with sample archived week
   - Follow exact schema from spec.md

5. **Basic JavaScript module structure (TDD)**
   - Depends on: Task 2, 4
   - Complexity: Low
   - Test: `tests/features/content-rendering.spec.ts`
     - Verify JSON loads correctly
     - Verify content renders in correct sections
     - Verify no console errors
   - Implementation:
     - ES6 module structure
     - Functions: `loadCurrentWeek()`, `renderPost()`, `renderPlatform()`, `renderRelease()`
     - Use native `fetch()` API
     - Template literals for HTML generation

#### Deliverables
- [ ] Working static site with manual data
- [ ] Responsive design at all breakpoints
- [ ] All Phase 1 tests passing
- [ ] Committed to feature branch

---

### Phase 2: Perplexity API Integration
**Goal**: Integrate Perplexity API for fetching OTT release data  
**Duration**: 2-3 sessions  
**Priority**: CRITICAL

#### Tasks

1. **Create Perplexity API client script (TDD)**
   - Depends on: Phase 1 complete
   - Complexity: Medium
   - Test: `tests/build/api-integration.spec.ts`
     - Mock API responses
     - Test successful response parsing
     - Test error handling (429, 500, timeout)
     - Test JSON schema validation
   - Implementation:
     - Node.js script: `scripts/fetch-releases.js`
     - Use native `fetch()` (Node 18+)
     - API endpoint: `https://api.perplexity.ai/chat/completions`
     - Model: `sonar` (as specified by user)
     - Environment variable: `PERPLEXITY_API_KEY`

2. **Design API prompt for OTT releases (Critical)**
   - Depends on: Task 1
   - Complexity: High
   - Adapt user's provided prompt template:
     ```javascript
     {
       "model": "sonar",
       "messages": [
         {
           "role": "system",
           "content": "You are an expert at curating streaming platform releases. Provide accurate, up-to-date information in valid JSON format only."
         },
         {
           "role": "user",
           "content": "Provide a detailed list of new OTT streaming releases for the week of [START_DATE] to [END_DATE]. Include Netflix, Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, and Peacock. For each release, provide: exact title, precise release date (YYYY-MM-DD), genre array, type (movie/series/documentary), and 2-3 sentence description. Return ONLY valid JSON in this format: {\"platforms\": [{\"name\": \"Netflix\", \"releases\": [{\"title\": \"\", \"releaseDate\": \"\", \"genre\": [], \"type\": \"\", \"description\": \"\"}]}]}"
         }
       ],
       "web_search_options": {
         "search_context_size": "low"
       }
     }
     ```

3. **Implement response parser and validator (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/build/json-validation.spec.ts`
     - Test valid JSON parsing
     - Test schema validation
     - Test data transformation
     - Test handling of malformed responses
   - Implementation:
     - Parse API response
     - Validate against JSON schema
     - Transform to application format
     - Add metadata (week number, dates, timestamp)
     - Generate unique IDs for releases

4. **Implement caching mechanism (TDD)**
   - Depends on: Task 3
   - Complexity: Medium
   - Test: `tests/build/caching.spec.ts`
     - Test cache creation
     - Test cache expiry (24h TTL)
     - Test fallback to cache on API failure
   - Implementation:
     - Cache API responses locally
     - 24-hour TTL
     - Use cached data if API fails
     - Log cache hit/miss

5. **Error handling and retry logic (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/build/error-handling.spec.ts`
     - Test retry on 429/500 errors
     - Test timeout handling
     - Test graceful degradation
   - Implementation:
     - Retry once after 5-minute delay
     - Fall back to cached data
     - Log errors with context
     - Never overwrite good data with bad data

#### Deliverables
- [ ] Working API client script
- [ ] Successful API calls with real data
- [ ] Robust error handling
- [ ] All Phase 2 tests passing
- [ ] Committed to feature branch

---

### Phase 3: GitHub Actions Automation
**Goal**: Automate daily API calls and site updates  
**Duration**: 2-3 sessions  
**Priority**: CRITICAL

#### Tasks

1. **Create GitHub Actions workflow (TDD)**
   - Depends on: Phase 2 complete
   - Complexity: Medium
   - Test: `tests/integration/github-actions.spec.ts`
     - Test workflow YAML validity
     - Test cron schedule parsing
     - Test environment variable injection
     - Simulate workflow locally
   - Implementation:
     - File: `.github/workflows/daily-update.yml`
     - Trigger: Cron schedule (`0 9 * * *` - daily at 9 AM UTC)
     - Steps:
       1. Checkout repository
       2. Setup Node.js 18+
       3. Install dependencies (if any)
       4. Run `scripts/fetch-releases.js`
       5. Commit changes (if any)
       6. Push to repository

2. **Implement week transition logic (TDD)**
   - Depends on: Task 1
   - Complexity: High
   - Test: `tests/build/week-transition.spec.ts`
     - Test archive creation on Monday
     - Test week number calculation
     - Test date range accuracy
   - Implementation:
     - Detect when new week starts (Monday 00:00 UTC)
     - Archive previous week's data to `data/archive/YYYY-WW.json`
     - Initialize new `data/current-week.json` with empty template
     - Calculate ISO week numbers correctly

3. **Add GitHub Secrets configuration**
   - Depends on: Task 1
   - Complexity: Low
   - Add `PERPLEXITY_API_KEY` to repository secrets
   - Document in README how to configure
   - Use `${{ secrets.PERPLEXITY_API_KEY }}` in workflow

4. **Implement commit and push logic (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/integration/git-operations.spec.ts`
     - Test commit message generation
     - Test conditional commit (only if changes)
     - Test push operations
   - Implementation:
     - Configure git user in workflow
     - Check for changes before committing
     - Descriptive commit messages: "chore: update weekly releases [YYYY-MM-DD]"
     - Push to same branch (001-ott-weekly-releases)

5. **Add workflow failure notifications**
   - Depends on: Task 1
   - Complexity: Low
   - On workflow failure, create GitHub Issue
   - Include error logs and context
   - Label as "automation-failure"

#### Deliverables
- [ ] Working GitHub Actions workflow
- [ ] Automated daily updates
- [ ] Proper week transitions
- [ ] All Phase 3 tests passing
- [ ] Documentation updated
- [ ] Committed to feature branch

---

### Phase 4: Archive System & Navigation
**Goal**: Enable access to previous weeks' releases  
**Duration**: 2 sessions  
**Priority**: HIGH

#### Tasks

1. **Create archive list generator (TDD)**
   - Depends on: Phase 3 complete
   - Complexity: Medium
   - Test: `tests/features/archive-list.spec.ts`
     - Test archive file discovery
     - Test chronological sorting
     - Test metadata extraction
   - Implementation:
     - Scan `data/archive/` directory
     - Generate list of available weeks
     - Sort by date (newest first)
     - Extract week metadata for display

2. **Implement archive navigation UI (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/features/archive-navigation.spec.ts`
     - Test archive menu rendering
     - Test click handlers
     - Test active state indication
   - Implementation:
     - Archive sidebar/dropdown
     - List format: "Week of Dec 2-8, 2024"
     - Click to load archived post
     - Highlight current selection

3. **Add archive post loading (TDD)**
   - Depends on: Task 2
   - Complexity: Medium
   - Test: `tests/features/archive-loading.spec.ts`
     - Test fetch archived JSON
     - Test render archived post
     - Test error handling (missing archive)
   - Implementation:
     - Function: `loadArchivedWeek(year, weekNumber)`
     - Fetch from `data/archive/YYYY-WW.json`
     - Render using same `renderPost()` function
     - Handle 404 gracefully

4. **Implement URL-based navigation (Optional but recommended)**
   - Depends on: Task 3
   - Complexity: Medium
   - Use URL hash for navigation: `#archive/2024-48`
   - Load correct post based on hash
   - Update hash on navigation
   - Support browser back/forward buttons

5. **Add "Back to Current Week" button (TDD)**
   - Depends on: Task 3
   - Complexity: Low
   - Test: Verify button appears when viewing archive
   - Implementation: Button that reloads current week

#### Deliverables
- [ ] Working archive navigation
- [ ] All archived weeks accessible
- [ ] URL-based navigation (if implemented)
- [ ] All Phase 4 tests passing
- [ ] Committed to feature branch

---

### Phase 5: Performance Optimization
**Goal**: Meet performance targets (<2s load, <500KB size, Lighthouse >90)  
**Duration**: 1-2 sessions  
**Priority**: HIGH

#### Tasks

1. **Optimize assets (TDD)**
   - Depends on: Phases 1-4 complete
   - Complexity: Medium
   - Test: `tests/features/page-load.spec.ts`
     - Test total page size <500KB
     - Test load time <2s on 3G throttling
     - Test image sizes
   - Implementation:
     - Compress platform logos (WebP with JPG fallback)
     - Inline critical CSS
     - Defer non-critical JavaScript
     - Lazy load images

2. **Add service worker for caching (Optional)**
   - Depends on: Task 1
   - Complexity: High
   - Cache static assets (CSS, JS, logos)
   - Cache-first strategy for JSON data
   - Offline support (show cached data)

3. **Implement lazy loading (TDD)**
   - Depends on: Task 1
   - Complexity: Low
   - Test: Verify images load only when in viewport
   - Implementation: Native `loading="lazy"` attribute

4. **Run Lighthouse audits (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/performance/lighthouse.spec.ts`
     - Performance score >90
     - Accessibility score >90
     - SEO score >90
     - Best Practices score >90
   - Implementation: Fix any issues flagged

5. **Optimize JavaScript execution**
   - Depends on: Task 1
   - Complexity: Low
   - Minimize DOM manipulations
   - Use document fragments for batch updates
   - Avoid render-blocking scripts

#### Deliverables
- [ ] Page load time <2 seconds (3G)
- [ ] Total page size <500KB
- [ ] Lighthouse scores all >90
- [ ] All Phase 5 tests passing
- [ ] Committed to feature branch

---

### Phase 6: Accessibility & Polish
**Goal**: Ensure WCAG 2.1 Level AA compliance and final polish  
**Duration**: 1-2 sessions  
**Priority**: MEDIUM

#### Tasks

1. **Accessibility audit (TDD)**
   - Depends on: Phase 5 complete
   - Complexity: Medium
   - Test: `tests/features/accessibility.spec.ts`
     - Test keyboard navigation
     - Test screen reader compatibility
     - Test ARIA labels
     - Test color contrast ratios
   - Implementation:
     - Add ARIA labels to interactive elements
     - Ensure keyboard focus indicators
     - Proper heading hierarchy (h1 → h2 → h3)
     - Skip-to-content link

2. **Add loading states and indicators**
   - Depends on: Task 1
   - Complexity: Low
   - Show loading spinner when fetching data
   - Skeleton screens for content
   - Error states with retry button

3. **Implement "last updated" timestamp (TDD)**
   - Depends on: Phase 1 complete
   - Complexity: Low
   - Test: Verify timestamp displays correctly
   - Implementation:
     - Display in footer: "Last updated: Dec 7, 2024 at 9:15 AM"
     - Use `Intl.DateTimeFormat` for localization
     - Update on each data refresh

4. **Add metadata and SEO tags**
   - Depends on: Task 1
   - Complexity: Low
   - Meta description
   - Open Graph tags (og:title, og:description, og:image)
   - Twitter Card tags
   - Canonical URL

5. **Visual polish and animations**
   - Depends on: Task 1
   - Complexity: Low
   - Smooth transitions (CSS transitions, not JS)
   - Hover states for interactive elements
   - Focus states for accessibility
   - Consistent spacing and alignment

#### Deliverables
- [ ] WCAG 2.1 Level AA compliant
- [ ] Loading states implemented
- [ ] SEO optimized
- [ ] Visual polish complete
- [ ] All Phase 6 tests passing
- [ ] Committed to feature branch

---

### Phase 7: Testing & Deployment
**Goal**: Comprehensive testing and production deployment  
**Duration**: 2 sessions  
**Priority**: CRITICAL

#### Tasks

1. **Run full E2E test suite**
   - Depends on: All phases complete
   - Complexity: Low
   - Execute all Playwright tests
   - Fix any failures
   - Achieve 100% pass rate

2. **Cross-browser testing (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/browsers/cross-browser.spec.ts`
     - Chrome (latest)
     - Firefox (latest)
     - Safari (latest)
     - Edge (latest)
   - Implementation: Fix any browser-specific issues

3. **Mobile device testing (TDD)**
   - Depends on: Task 1
   - Complexity: Medium
   - Test: `tests/mobile/mobile-devices.spec.ts`
     - iOS Safari
     - Chrome Android
     - Various screen sizes
   - Implementation: Fix any mobile-specific issues

4. **Setup GitHub Pages deployment**
   - Depends on: Task 1, 2, 3
   - Complexity: Low
   - Configure GitHub Pages in repository settings
   - Set source to branch: `001-ott-weekly-releases`
   - Set root directory: `/` (root of repo)
   - Add custom domain (if applicable)

5. **Create deployment workflow**
   - Depends on: Task 4
   - Complexity: Low
   - File: `.github/workflows/deploy.yml`
   - Trigger: On push to feature branch
   - Steps:
     1. Run all tests
     2. Build (if needed - should be minimal/none)
     3. Deploy to GitHub Pages

6. **Production smoke tests**
   - Depends on: Task 4, 5
   - Complexity: Low
   - Test deployed site
   - Verify all functionality works
   - Check performance on real network

7. **Documentation**
   - Depends on: All tasks complete
   - Complexity: Low
   - Update README.md with:
     - Project overview
     - Setup instructions
     - Environment variables
     - Deployment guide
     - Contributing guidelines

#### Deliverables
- [ ] All tests passing (100%)
- [ ] Cross-browser compatibility verified
- [ ] Mobile devices tested
- [ ] Deployed to GitHub Pages
- [ ] Production site verified
- [ ] Documentation complete
- [ ] Ready for PR to dev branch

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Perplexity API rate limits** | Medium | High | Implement aggressive caching (24h TTL), fallback to cached data, monitor usage carefully |
| **API returns inconsistent data** | Medium | High | Strict JSON schema validation, reject invalid responses, use cached data as fallback |
| **Week transition logic fails** | Low | High | Thorough testing of edge cases, manual backup process documented |
| **GitHub Actions quota exceeded** | Low | Medium | Optimize workflow (1 run/day = 30 runs/month, well within free tier 2000 min/month) |
| **Performance targets not met** | Low | Medium | Aggressive asset optimization, lazy loading, service worker caching |
| **Browser compatibility issues** | Medium | Medium | Test early and often, use polyfills only if absolutely necessary |
| **Accessibility non-compliance** | Low | Medium | Early accessibility audits, use semantic HTML, test with screen readers |
| **JSON file size grows too large** | Low | Low | Archive old data, implement pagination for archive list |
| **API cost exceeds budget** | Low | High | 1 call/day = ~30 calls/month (well within free tier), set usage alerts |
| **Manual intervention required** | Low | High | Thorough error handling, graceful degradation, comprehensive logging |

## Dependencies

### External APIs
- **Perplexity API**: `sonar` model
  - Rate limit: TBD (check Perplexity docs)
  - Cost: Free tier available (verify limits)
  - Backup plan: Manual data entry if API unavailable

### GitHub Services
- **GitHub Actions**: Free tier (2000 minutes/month)
- **GitHub Pages**: Free tier (100GB bandwidth/month)
- **GitHub Secrets**: For API key storage

### Browser APIs (Native, Zero Dependencies)
- `fetch()` - HTTP requests
- `Intl.DateTimeFormat` - Date localization
- ES6 modules - Code organization
- CSS Grid/Flexbox - Layout
- CSS Variables - Theming

## Testing Strategy

### Test Pyramid

```
        ┌─────────────┐
        │   E2E       │ ← Playwright (UI, Performance, Accessibility)
        │  (20 tests) │
        └─────────────┘
       ┌───────────────┐
       │ Integration   │ ← GitHub Actions, API, File Operations
       │  (15 tests)   │
       └───────────────┘
      ┌─────────────────┐
      │   Build Scripts │ ← API client, Data parsing, Validation
      │    (25 tests)   │
      └─────────────────┘
```

### Test Execution Plan

**Before each feature** (TDD Gate 1):
1. Write test for feature
2. Run test → verify FAILS
3. Update `feature_list.json`: `test_fails_before: true`

**After implementing feature** (TDD Gate 2):
1. Run test → verify PASSES
2. Update `feature_list.json`: `test_passes_after: true`, `passes: true`

**Continuous**:
- Run full suite before commit
- Run visual regression tests weekly
- Run performance tests on deployed site

## Success Criteria

### Functional
- [ ] Current week's post displays correctly with all sections
- [ ] Daily API calls fetch and update data successfully
- [ ] Archive navigation allows access to all previous weeks
- [ ] Week transitions happen automatically on Monday
- [ ] All platform releases render correctly
- [ ] Mobile responsive at all breakpoints

### Performance
- [ ] Page load time <2 seconds on 3G (Lighthouse test)
- [ ] Total page size <500KB
- [ ] Lighthouse Performance score >90
- [ ] First Contentful Paint <1 second
- [ ] Time to Interactive <3 seconds

### Quality
- [ ] 100% test pass rate (all tests passing)
- [ ] Zero console errors in production
- [ ] WCAG 2.1 Level AA compliant
- [ ] Cross-browser compatible (Chrome, Firefox, Safari, Edge)
- [ ] Mobile-friendly (iOS, Android)

### Automation
- [ ] GitHub Actions runs daily without manual intervention
- [ ] API failures handled gracefully (fallback to cache)
- [ ] Deployments happen automatically
- [ ] Error notifications only on critical failures

### Cost
- [ ] $0 monthly hosting cost (GitHub Pages)
- [ ] Perplexity API within free tier (<500 calls/month)
- [ ] GitHub Actions within free tier (<2000 minutes/month)
- [ ] Total monthly cost: $0

## Open Decisions

### Decision 1: Perplexity API Model
- **Options**: 
  - `sonar` (user specified - online, current data)
  - `sonar-pro` (more accurate, higher cost)
  - `llama-3.1-sonar-large-128k-online` (spec mentioned)
- **Recommendation**: Use `sonar` as specified by user (cost-effective, online data)
- **Status**: ✅ Decided - use `sonar`

### Decision 2: Archive Pagination
- **Options**:
  - Show all archived weeks (simple, may grow large)
  - Paginate after 12 weeks (better UX long-term)
  - Infinite scroll (more complex)
- **Recommendation**: Show last 12 weeks, "Load more" button for older
- **Status**: ⏳ Pending - decide in Phase 4

### Decision 3: Service Worker
- **Options**:
  - Implement service worker (offline support, better caching)
  - Skip service worker (simpler, fewer edge cases)
- **Recommendation**: Skip for v1.0, add in v1.1 if needed
- **Status**: ⏳ Pending - decide in Phase 5

### Decision 4: URL Routing
- **Options**:
  - Hash-based routing (`#archive/2024-48`)
  - Query parameters (`?week=2024-48`)
  - No URL routing (state in memory only)
- **Recommendation**: Hash-based routing (bookmarkable, no server config)
- **Status**: ⏳ Pending - decide in Phase 4

### Decision 5: GitHub Actions Schedule
- **Options**:
  - 9 AM UTC daily (covers US morning, Europe afternoon)
  - 12 PM UTC daily (US morning, Europe evening)
  - Multiple times per day (more updates, higher cost)
- **Recommendation**: 9 AM UTC (single daily update)
- **Status**: ✅ Decided - 9 AM UTC

## Timeline Estimate

| Phase | Sessions | Cumulative |
|-------|----------|------------|
| Phase 1: Foundation | 1-2 | 2 |
| Phase 2: API Integration | 2-3 | 5 |
| Phase 3: Automation | 2-3 | 8 |
| Phase 4: Archive System | 2 | 10 |
| Phase 5: Performance | 1-2 | 12 |
| Phase 6: Accessibility | 1-2 | 14 |
| Phase 7: Testing & Deploy | 2 | 16 |
| **Total** | **11-16 sessions** | **~16** |

**Note**: Each "session" = one focused @Coder interaction (1-2 hours of implementation)

## Next Steps

1. **Review this plan** with stakeholders (if applicable)
2. **Run `/speckit.tasks`** to break down phases into granular tasks
3. **Run `/harness.generate`** to convert tasks into `feature_list.json`
4. **Begin implementation** with `@Coder` on Phase 1

---

**Plan Status**: ✅ Ready for Task Generation  
**Next Command**: `/speckit.tasks`
