# Task List: Movie Theatrical Releases Tracker

> Generated from: [plan.md](plan.md)  
> Date: 2025-12-12  
> Feature: Movie Theatrical Releases for last/current/next week (US & India)

## Overview

| Metric | Value |
|--------|-------|
| Total Tasks | 58 |
| Setup Phase | 5 tasks |
| Foundational Phase | 8 tasks |
| User Story Phases | 40 tasks (5 stories) |
| Polish Phase | 5 tasks |
| Estimated Sessions | 12-15 sessions |

## Implementation Strategy

**MVP Scope**: User Story 1 only (Current Week View) - 8 tasks total
**Incremental Delivery**: Each user story is independently testable
**Parallel Opportunities**: Tasks marked with [P] can run in parallel

---

## Phase 1: Setup

**Goal**: Initialize project foundation and validate environment

### Setup Tasks

- [ ] T001 Create project structure per implementation plan
- [ ] T002 [P] Validate existing dependencies (Node 18+, Playwright 1.48+)
- [ ] T003 [P] Create placeholder JSON data files for testing in data/us/ and data/india/
- [ ] T004 [P] Set up environment variables (.env with PERPLEXITY_API_KEY)
- [ ] T005 Verify existing test infrastructure runs successfully (npm test)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Build shared infrastructure needed by ALL user stories

**Must Complete Before User Stories**: These tasks provide core utilities and data structures that every user story depends on.

### Foundational Tasks

- [ ] T006 [P] Update date-utils.js with three-week functions (getPreviousWeekInfo, getCurrentWeekInfo, getNextWeekInfo) in scripts/utils/date-utils.js
- [ ] T007 [P] Create JSON schemas for validation in specs/001-movie-releases/contracts/week-data-schema.json
- [ ] T008 [P] Create movie release schema in specs/001-movie-releases/contracts/movie-release-schema.json
- [ ] T009 Update week-transition.js for three-week sliding window logic in scripts/utils/week-transition.js
- [ ] T010 Create country configuration object (US & India categories) in scripts/fetch-releases.js
- [ ] T011 [P] Add JSON validation utility function in scripts/utils/validate-json.js
- [ ] T012 Create base HTML structure for three-week navigation in index.html
- [ ] T013 Add CSS styles for week navigation and visual indicators in assets/css/main.css

---

## Phase 3: User Story 1 - Current Week View (P1 - MVP)

**Goal**: Display current week theatrical releases for US and India  
**Priority**: P1 (Critical - MVP Feature)  
**Independent Test**: Load homepage → select country → verify current week movies displayed

### User Story 1 Tasks

- [ ] T014 [P] [US1] Create test: Current week data loads successfully in tests/features/current-week-load.spec.ts
- [ ] T015 [P] [US1] Create test: US current week displays with distribution categories in tests/features/us-current-week-display.spec.ts
- [ ] T016 [P] [US1] Create test: India current week displays with language categories in tests/features/india-current-week-display.spec.ts
- [ ] T017 [US1] Implement Perplexity API prompt for current week theatrical releases in scripts/fetch-releases.js (updatePromptForMovies function)
- [ ] T018 [US1] Implement fetchWeekData function for current week in scripts/fetch-releases.js
- [ ] T019 [US1] Implement country detection logic in assets/js/app.js (detectUserCountry function)
- [ ] T020 [US1] Implement data loading for current week in assets/js/app.js (loadWeekData function)
- [ ] T021 [US1] Implement movie release rendering in assets/js/app.js (renderMovieReleases function)
- [ ] T022 [US1] Implement category grouping display in assets/js/app.js (renderCategories function)
- [ ] T023 [US1] Implement country switcher functionality in assets/js/app.js (switchCountry function)
- [ ] T024 [US1] Add loading indicator with ARIA attributes in index.html and assets/js/app.js
- [ ] T025 [US1] Verify all tests pass for User Story 1 (npm test tests/features/*current-week*)

**User Story 1 Complete**: ✅ Users can view current week theatrical releases for US and India

---

## Phase 4: User Story 2 - Last Week Navigation (P2)

**Goal**: Enable navigation to previous week's theatrical releases  
**Priority**: P2 (Important - Extends core functionality)  
**Independent Test**: Click "Last Week" → verify previous week movies displayed

### User Story 2 Tasks

- [ ] T026 [P] [US2] Create test: Last week navigation works in tests/features/last-week-navigation.spec.ts
- [ ] T027 [P] [US2] Create test: Last week data renders correctly in tests/features/last-week-display.spec.ts
- [ ] T028 [P] [US2] Create test: "Back to Current Week" button works in tests/features/back-to-current.spec.ts
- [ ] T029 [US2] Implement Perplexity API prompt for last week releases in scripts/fetch-releases.js
- [ ] T030 [US2] Implement fetchLastWeekData function in scripts/fetch-releases.js
- [ ] T031 [US2] Add "Last Week" navigation button in index.html
- [ ] T032 [US2] Implement last week navigation handler in assets/js/app.js (navigateToLastWeek function)
- [ ] T033 [US2] Implement week title display with date range in assets/js/app.js (displayWeekTitle function)
- [ ] T034 [US2] Add "Back to Current Week" button in index.html
- [ ] T035 [US2] Update CSS for week navigation states in assets/css/main.css
- [ ] T036 [US2] Verify all tests pass for User Story 2 (npm test tests/features/*last-week*)

**User Story 2 Complete**: ✅ Users can navigate to and view last week's theatrical releases

---

## Phase 5: User Story 3 - Next Week Preview (P3)

**Goal**: Display upcoming theatrical releases scheduled for next week  
**Priority**: P3 (Enhancement - Forward planning)  
**Independent Test**: Click "Next Week" → verify upcoming movies with "Upcoming" badges

### User Story 3 Tasks

- [ ] T037 [P] [US3] Create test: Next week navigation works in tests/features/next-week-navigation.spec.ts
- [ ] T038 [P] [US3] Create test: Upcoming releases display with indicators in tests/features/next-week-display.spec.ts
- [ ] T039 [P] [US3] Create test: Tentative dates show "TBA" or "Subject to Change" in tests/features/tentative-dates.spec.ts
- [ ] T040 [US3] Implement Perplexity API prompt for next week releases in scripts/fetch-releases.js
- [ ] T041 [US3] Implement fetchNextWeekData function in scripts/fetch-releases.js
- [ ] T042 [US3] Add "Next Week" navigation button in index.html
- [ ] T043 [US3] Implement next week navigation handler in assets/js/app.js (navigateToNextWeek function)
- [ ] T044 [US3] Add "Upcoming" badge component in assets/js/app.js (renderUpcomingBadge function)
- [ ] T045 [US3] Handle tentative dates display in assets/js/app.js (formatTentativeDate function)
- [ ] T046 [US3] Add CSS for upcoming badges and tentative styling in assets/css/main.css
- [ ] T047 [US3] Verify all tests pass for User Story 3 (npm test tests/features/*next-week*)

**User Story 3 Complete**: ✅ Users can preview next week's upcoming theatrical releases

---

## Phase 6: User Story 4 - Country-Specific Categories (P2)

**Goal**: Organize movies by relevant distribution model per country  
**Priority**: P2 (Important - Essential for usability)  
**Independent Test**: Switch countries → verify categories change (US: distribution types, India: language/industry)

### User Story 4 Tasks

- [ ] T048 [P] [US4] Create test: US categories display correctly (Wide/Limited/Independent/Blockbuster) in tests/features/us-categories.spec.ts
- [ ] T049 [P] [US4] Create test: India categories display correctly (Bollywood/Tollywood/etc) in tests/features/india-categories.spec.ts
- [ ] T050 [P] [US4] Create test: Multi-language movies show all languages in tests/features/multi-language-display.spec.ts
- [ ] T051 [US4] Define US category configuration in scripts/fetch-releases.js (US_CATEGORIES constant)
- [ ] T052 [US4] Define India category configuration in scripts/fetch-releases.js (INDIA_CATEGORIES constant)
- [ ] T053 [US4] Implement category filtering in API prompt logic in scripts/fetch-releases.js
- [ ] T054 [US4] Update renderCategories to handle country-specific display in assets/js/app.js
- [ ] T055 [US4] Add multi-language display support in assets/js/app.js (renderLanguageInfo function)
- [ ] T056 [US4] Add CSS for category-specific styling in assets/css/main.css
- [ ] T057 [US4] Verify all tests pass for User Story 4 (npm test tests/features/*categories*)

**User Story 4 Complete**: ✅ Movies organized by country-appropriate distribution models

---

## Phase 7: User Story 5 - Shareable URLs (P3)

**Goal**: Enable hash-based URLs for direct linking to weeks/countries  
**Priority**: P3 (Enhancement - Shareability)  
**Independent Test**: Copy URL with hash → paste in new tab → verify correct week/country loads

### User Story 5 Tasks

- [ ] T058 [P] [US5] Create test: Hash URL navigation works in tests/features/url-routing.spec.ts
- [ ] T059 [P] [US5] Create test: Browser back/forward buttons work in tests/features/browser-navigation.spec.ts
- [ ] T060 [P] [US5] Create test: Shared URLs load correct state in tests/features/shareable-urls.spec.ts
- [ ] T061 [US5] Implement hash router initialization in assets/js/app.js (initHashRouter function)
- [ ] T062 [US5] Implement hash change listener in assets/js/app.js (onHashChange function)
- [ ] T063 [US5] Implement URL state update on navigation in assets/js/app.js (updateUrlHash function)
- [ ] T064 [US5] Parse hash parameters on page load in assets/js/app.js (parseHashParams function)
- [ ] T065 [US5] Handle invalid hash gracefully with redirect in assets/js/app.js (handleInvalidHash function)
- [ ] T066 [US5] Add URL examples to UI (copy button) in index.html
- [ ] T067 [US5] Verify all tests pass for User Story 5 (npm test tests/features/*url*)

**User Story 5 Complete**: ✅ URLs are shareable and browser navigation works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Production-ready quality, automation, and performance  
**Priority**: Required for PR merge

### Polish Tasks

- [ ] T068 Update GitHub Actions workflow for three-week updates in .github/workflows/update-deploy.yml
- [ ] T069 Create integration tests for three-week data flow in tests/integration/three-week-flow.spec.ts
- [ ] T070 Run performance audit (Lighthouse score ≥ 90) in tests/performance/lighthouse.spec.ts
- [ ] T071 Run accessibility audit (WCAG 2.1 AA compliance) in tests/features/accessibility.spec.ts
- [ ] T072 Verify progressive enhancement (works without JS) manual testing with JS disabled

---

## Dependency Graph

```
Phase 1: Setup (T001-T005)
  └──> Phase 2: Foundational (T006-T013) [BLOCKING]
         │
         ├──> Phase 3: US1 (T014-T025) [MVP - Can Deploy After This]
         │
         ├──> Phase 4: US2 (T026-T036) [Independent]
         │
         ├──> Phase 5: US3 (T037-T047) [Independent]
         │
         ├──> Phase 6: US4 (T048-T057) [Enhances all user stories]
         │
         ├──> Phase 7: US5 (T058-T067) [Independent]
         │
         └──> Phase 8: Polish (T068-T072) [Final gates]
```

**Critical Path**: T001-T005 → T006-T013 → T014-T025 (MVP)

---

## Parallel Execution Opportunities

### After Foundational Phase (T006-T013) Complete:

**Parallel Group 1** (User Story 1 - Current Week):
- T014 [Test: Current week loads]
- T015 [Test: US display]
- T016 [Test: India display]

**Parallel Group 2** (User Story 2 - Last Week):
- T026 [Test: Last week nav]
- T027 [Test: Last week display]
- T028 [Test: Back button]

**Parallel Group 3** (User Story 3 - Next Week):
- T037 [Test: Next week nav]
- T038 [Test: Upcoming indicators]
- T039 [Test: Tentative dates]

**Parallel Group 4** (User Story 4 - Categories):
- T048 [Test: US categories]
- T049 [Test: India categories]
- T050 [Test: Multi-language]

**Parallel Group 5** (User Story 5 - URLs):
- T058 [Test: Hash routing]
- T059 [Test: Browser nav]
- T060 [Test: Shared URLs]

---

## Suggested Implementation Order (MVP First)

### Sprint 1: MVP - Current Week View (3-4 sessions)
1. **T001-T005** - Setup phase
2. **T006-T013** - Foundational infrastructure
3. **T014-T025** - User Story 1 (Current Week View)

**Deliverable**: Users can view current week theatrical releases for US and India

### Sprint 2: Historical Context (2-3 sessions)
4. **T026-T036** - User Story 2 (Last Week Navigation)

**Deliverable**: Users can browse last week's releases

### Sprint 3: Future Preview (2-3 sessions)
5. **T037-T047** - User Story 3 (Next Week Preview)

**Deliverable**: Users can preview upcoming releases

### Sprint 4: Enhanced Organization (2-3 sessions)
6. **T048-T057** - User Story 4 (Country Categories)

**Deliverable**: Country-specific organization improves usability

### Sprint 5: Shareability & Polish (2-3 sessions)
7. **T058-T067** - User Story 5 (Shareable URLs)
8. **T068-T072** - Polish phase

**Deliverable**: Production-ready with automation and performance validation

---

## Task Complexity Guide

| Complexity | Estimated Effort | Examples |
|------------|-----------------|----------|
| **Low** | 30min - 1hr | T002 (validate deps), T004 (env setup), T011 (utility function) |
| **Medium** | 1-2 hrs | T017 (API prompt), T021 (rendering), T033 (week title display) |
| **High** | 2-4 hrs | T009 (week transition logic), T061-T065 (hash router), T068 (GitHub Actions) |

---

## Testing Strategy

### Test Execution Checkpoints

**After Each User Story Phase**:
```bash
# Run user story specific tests
npm test tests/features/*{story-keyword}*

# Example:
npm test tests/features/*current-week*
npm test tests/features/*last-week*
```

**Before PR Merge**:
```bash
# Full test suite
npm test

# Performance audit
npm run test:performance

# Accessibility audit
npm run test:a11y
```

### TDD Gates (NON-NEGOTIABLE)

**GATE 1** (Before implementation):
- Create test file
- Run test → MUST FAIL
- Update feature_list.json: `test_fails_before: true`

**GATE 2** (After implementation):
- Run test → MUST PASS
- Update feature_list.json: `test_passes_after: true`, `passes: true`

---

## File Modification Summary

| Priority | Files to Modify | Tasks |
|----------|----------------|-------|
| **P1 Critical** | scripts/fetch-releases.js, assets/js/app.js, scripts/utils/week-transition.js | T006-T025 |
| **P2 Important** | index.html, assets/css/main.css, scripts/utils/date-utils.js | T026-T057 |
| **P3 Enhancement** | .github/workflows/update-deploy.yml, tests/** | T058-T072 |

---

## Next Steps

1. **Run `/harness.generate`** to convert this task list to `memory/feature_list.json`
2. **Start with MVP**: Use `@Coder` to implement User Story 1 (T001-T025)
3. **Verify independently**: Each user story should be testable standalone
4. **Iterate**: Complete one user story fully before moving to next

---

## Notes

- **MVP Definition**: User Story 1 (Current Week View) is sufficient for initial deployment
- **Independent Stories**: US2, US3, US5 can be implemented in any order after US1
- **US4 Enhancement**: Should be implemented after at least US1 works, enhances all stories
- **TDD Required**: Every feature task MUST have corresponding test task completed first
- **Performance Budget**: Monitor file sizes (target < 100KB gzipped total)
- **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation throughout

**Constitution Compliance**: All tasks maintain zero runtime dependencies, temporal data integrity, and progressive enhancement principles.
