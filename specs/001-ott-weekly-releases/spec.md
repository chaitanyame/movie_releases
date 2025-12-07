# OTT Weekly Releases - Feature Specification

## Overview

A static single-page web application that displays weekly OTT (Over-The-Top) streaming platform releases in a blog post format. The application automatically fetches and updates release information using the Perplexity API once per day during the active week (Monday-Sunday). Each week has exactly one post that is created on Monday and updated daily until Sunday, then archived for historical reference.

## User Stories

- As a streaming enthusiast, I want to see all the latest OTT releases for the current week in one place, so that I can quickly decide what to watch without visiting multiple platform websites.

- As a mobile user, I want the site to load quickly and work seamlessly on my phone, so that I can check new releases on the go.

- As a returning visitor, I want to see what was released in previous weeks, so that I can catch up on content I might have missed.

- As a casual browser, I want a clean and simple interface without login requirements, so that I can access information immediately without friction.

## Requirements

### Functional Requirements

1. **Weekly Post Structure**
   - Each week has exactly ONE post (Monday-Sunday)
   - Post is created on Monday with initial releases
   - Post is updated daily (Tuesday-Sunday) with new releases or changes
   - Post structure must be consistent across all weeks

2. **Post Content Sections** (in order)
   - Post title with week date range (e.g., "OTT Releases: Dec 2-8, 2024")
   - Introduction paragraph (brief overview of the week's highlights)
   - Releases organized by OTT platform (Netflix, Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock)
   - Each release must show:
     - Title
     - Release date
     - Genre(s)
     - Brief description (2-3 sentences)
   - Footer with "Last updated: [timestamp]"

3. **Perplexity API Integration**
   - Automated daily API call (once per day, not on every page load)
   - Specific prompt structure: "What are the new OTT streaming releases for the week of [date range]? Include Netflix, Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, and Peacock. For each release, provide the title, exact release date, genre, and a brief description."
   - API call triggered via GitHub Actions (cron schedule)
   - Response parsed and stored as static JSON

4. **Data Storage**
   - All data stored as static JSON files (no database)
   - Current week's data: `data/current-week.json`
   - Archive data: `data/archive/YYYY-WW.json` (e.g., `2024-49.json` for week 49)
   - JSON schema must be consistent and validated

5. **Main Page Display**
   - Current week's post displayed prominently at top
   - Mobile-responsive layout
   - Fast loading (<2 seconds on 3G)
   - Clean, readable typography

6. **Archive Navigation**
   - Simple navigation menu to access previous weeks
   - Chronologically ordered (newest first)
   - Load archived posts without full page refresh (if possible within vanilla JS constraints)
   - Display archive post in same format as current week

7. **Automation**
   - GitHub Actions workflow runs daily at a scheduled time
   - Workflow fetches data from Perplexity API
   - Workflow generates/updates JSON files
   - Workflow commits changes to repository
   - GitHub Pages automatically deploys updated site

### Non-Functional Requirements

- **Performance**: 
  - Page load time <2 seconds on 3G
  - Total page size <500KB (including all assets)
  - Lighthouse Performance score >90
  - First Contentful Paint <1 second

- **Cost Efficiency**:
  - Perplexity API: 1 call per day maximum
  - GitHub Actions: Free tier (2000 minutes/month)
  - GitHub Pages: Free hosting
  - Zero server costs

- **Reliability**:
  - Graceful degradation if API fails (show cached data)
  - Self-healing: retry failed API calls once
  - Error notifications via GitHub Issues (only on repeated failures)
  - 99% uptime (site remains accessible even if updates fail)

- **Accessibility**:
  - WCAG 2.1 Level AA compliance
  - Semantic HTML markup
  - ARIA labels where needed
  - Keyboard navigation support
  - Screen reader friendly

- **Browser Support**:
  - Chrome, Firefox, Safari, Edge (last 2 versions)
  - Mobile browsers (iOS Safari, Chrome Android)
  - Graceful degradation for older browsers

## Technical Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions (Daily Cron)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Trigger: Cron (daily at 9 AM UTC)              │  │
│  │  2. Run: scripts/fetch-weekly-releases.js          │  │
│  │  3. Call: Perplexity API with week-specific prompt │  │
│  │  4. Parse: API response → structured JSON          │  │
│  │  5. Save: data/current-week.json                   │  │
│  │  6. Archive: On Monday, move last week to archive  │  │
│  │  7. Commit: Push changes to repo                   │  │
│  │  8. Deploy: GitHub Pages auto-deploys              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Static Website (GitHub Pages)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  index.html                                         │  │
│  │    ↓                                                │  │
│  │  assets/js/app.js (loads JSON, renders content)    │  │
│  │    ↓                                                │  │
│  │  data/current-week.json                            │  │
│  │  data/archive/*.json                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Model

#### Current Week Post (`data/current-week.json`)
```json
{
  "week": {
    "year": 2024,
    "weekNumber": 49,
    "startDate": "2024-12-02",
    "endDate": "2024-12-08"
  },
  "metadata": {
    "title": "OTT Releases: Dec 2-8, 2024",
    "introduction": "This week brings exciting new content across all major streaming platforms...",
    "lastUpdated": "2024-12-07T09:15:00Z",
    "updateCount": 6
  },
  "platforms": [
    {
      "name": "Netflix",
      "logo": "assets/images/logos/netflix.png",
      "releases": [
        {
          "id": "netflix-title-2024-12-02",
          "title": "Example Movie",
          "releaseDate": "2024-12-02",
          "genre": ["Action", "Thriller"],
          "description": "A brief 2-3 sentence description of the content...",
          "type": "movie"
        }
      ]
    },
    {
      "name": "Prime Video",
      "logo": "assets/images/logos/prime.png",
      "releases": []
    }
  ]
}
```

#### Archive Post (`data/archive/2024-49.json`)
- Same structure as current week
- Immutable once archived (no further updates)

### API/Interface

#### Perplexity API Integration

**Endpoint**: `https://api.perplexity.ai/chat/completions`

**Request Headers**:
```json
{
  "Authorization": "Bearer $PERPLEXITY_API_KEY",
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant that provides accurate, up-to-date information about streaming platform releases. Always structure your response as valid JSON."
    },
    {
      "role": "user",
      "content": "What are the new OTT streaming releases for the week of December 2-8, 2024? Include Netflix, Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, and Peacock. For each release, provide: exact title, precise release date (YYYY-MM-DD format), genre(s), type (movie/series/documentary/special), and a 2-3 sentence description. Return ONLY valid JSON in this exact format: {\"platforms\": [{\"name\": \"Netflix\", \"releases\": [{\"title\": \"\", \"releaseDate\": \"\", \"genre\": [], \"type\": \"\", \"description\": \"\"}]}]}"
    }
  ],
  "temperature": 0.2,
  "max_tokens": 4000
}
```

**Response** (parsed and stored):
```json
{
  "platforms": [
    {
      "name": "Netflix",
      "releases": [...]
    }
  ]
}
```

#### JavaScript API (for frontend)

**Main App Module** (`assets/js/app.js`):
```javascript
// Public API
async function loadCurrentWeek() { /* ... */ }
async function loadArchivedWeek(year, weekNumber) { /* ... */ }
function renderPost(postData) { /* ... */ }
function showArchiveList() { /* ... */ }
```

### Dependencies

#### Build/Automation Dependencies
- Node.js 18+ (for fetch API)
- GitHub Actions (built-in)
- Perplexity API access (requires API key)

#### Testing Dependencies
- Playwright (UI and E2E testing)
- @playwright/test (test runner)

#### Frontend Dependencies
- **ZERO** external JavaScript libraries (pure vanilla JS)
- Native browser APIs only (fetch, Intl.DateTimeFormat, etc.)

#### Environment Variables
- `PERPLEXITY_API_KEY`: API key for Perplexity API (stored in GitHub Secrets)

## Acceptance Criteria

### Core Functionality
- [ ] Single-page application loads in <2 seconds on 3G
- [ ] Current week's post is displayed prominently with all required sections
- [ ] Post title shows correct week date range (e.g., "OTT Releases: Dec 2-8, 2024")
- [ ] Introduction paragraph is present and readable
- [ ] Releases are organized by platform (Netflix, Prime Video, Disney+, Hulu, etc.)
- [ ] Each release displays title, release date, genre(s), and description
- [ ] Footer shows "Last updated: [timestamp]" in readable format
- [ ] Archive navigation menu lists all previous weeks chronologically
- [ ] Clicking an archive entry loads and displays that week's post
- [ ] Mobile responsive design works at 320px, 768px, 1024px, 1920px widths

### Automation
- [ ] GitHub Actions workflow runs daily at scheduled time (9 AM UTC)
- [ ] Workflow successfully calls Perplexity API with correct prompt
- [ ] API response is parsed and validated against JSON schema
- [ ] Current week data is saved to `data/current-week.json`
- [ ] On Monday, previous week is archived to `data/archive/YYYY-WW.json`
- [ ] Changes are committed to repository automatically
- [ ] GitHub Pages deploys updated site automatically
- [ ] Workflow handles API failures gracefully (uses cached data)

### Data Integrity
- [ ] JSON files follow consistent schema
- [ ] Week numbers are calculated correctly
- [ ] Date ranges are accurate (Monday-Sunday)
- [ ] No duplicate releases within a week
- [ ] Release IDs are unique and stable

### Performance
- [ ] Page load time <2 seconds on 3G (verified via Lighthouse)
- [ ] Total page size <500KB
- [ ] Lighthouse Performance score >90
- [ ] Lighthouse Accessibility score >90
- [ ] First Contentful Paint <1 second
- [ ] No render-blocking JavaScript

### Quality
- [ ] All Playwright tests pass (100%)
- [ ] No console errors in browser
- [ ] No broken links or images
- [ ] Semantic HTML structure
- [ ] ARIA labels present where needed
- [ ] Keyboard navigation works correctly

### Cost Efficiency
- [ ] Perplexity API called exactly once per day (not on page load)
- [ ] No unnecessary API calls or retries
- [ ] Cached data used when API unavailable
- [ ] Total monthly cost: $0 (stays within free tiers)

## Edge Cases

### API Failures
- **Case**: Perplexity API returns 429 (rate limit) or 500 (server error)
- **Handling**: 
  - Log error to GitHub Actions logs
  - Use previous day's cached data (keep showing stale data)
  - Retry once after 5-minute delay
  - If retry fails, create GitHub Issue for manual review
  - Site remains accessible with last known good data

### Incomplete API Response
- **Case**: API returns partial data (missing platforms or releases)
- **Handling**:
  - Validate response against JSON schema
  - If validation fails, log detailed error
  - Use cached data from previous successful call
  - Do not overwrite good data with incomplete data

### Week Transition (Sunday → Monday)
- **Case**: Post needs to be archived and new week started
- **Handling**:
  - At 11:59 PM Sunday (UTC), trigger archive workflow
  - Copy `data/current-week.json` to `data/archive/YYYY-WW.json`
  - Generate new empty template for new week
  - Monday's API call populates new week's data
  - Both old and new weeks accessible immediately

### No Releases for a Platform
- **Case**: A platform (e.g., Peacock) has no releases this week
- **Handling**:
  - Still display platform name and logo
  - Show message: "No new releases this week"
  - Do not hide the platform entirely (maintains consistent layout)

### Timezone Handling
- **Case**: Release dates may be in different timezones
- **Handling**:
  - All dates stored in ISO 8601 format (YYYY-MM-DD)
  - Display dates in user's local timezone using Intl.DateTimeFormat
  - GitHub Actions runs in UTC
  - Week boundaries based on UTC (Monday 00:00 UTC to Sunday 23:59 UTC)

### First Week (Bootstrap)
- **Case**: No data exists when site first launches
- **Handling**:
  - Manual initial run of GitHub Actions workflow
  - Generate placeholder JSON with empty releases
  - Display message: "Check back tomorrow for this week's releases!"
  - Ensure site doesn't break with empty data

### Archive List Growth
- **Case**: Archive list grows over time (52 weeks per year)
- **Handling**:
  - Paginate archive list (show 12 weeks at a time)
  - "Load more" button for older weeks
  - Keep archive lightweight (lazy load archived post data)
  - Consider annual archive pages after 1 year (future enhancement)

### Duplicate Releases (Same Title, Different Date)
- **Case**: A series releases multiple episodes in one week
- **Handling**:
  - Each release gets unique ID: `{platform}-{title-slug}-{date}`
  - Group releases with same title under expandable section
  - Show: "Title (3 episodes this week)"
  - Expand to see individual episode details

### Mobile Data Constraints
- **Case**: User on slow mobile connection
- **Handling**:
  - Lazy load platform logos (only when scrolled into view)
  - Use responsive images (smaller images for mobile)
  - Inline critical CSS (above-the-fold content)
  - Defer non-critical JavaScript

## Testing Strategy

### Test Categories

#### 1. E2E Tests (Playwright)
**Location**: `tests/features/`

**Tests**:
- `page-load.spec.ts`: Performance, load time, page size
- `content-rendering.spec.ts`: Verify all content sections render correctly
- `responsive-design.spec.ts`: Test at multiple breakpoints
- `archive-navigation.spec.ts`: Test archive loading and navigation
- `accessibility.spec.ts`: WCAG compliance, keyboard nav, screen readers

#### 2. Build Script Tests
**Location**: `tests/build/`

**Tests**:
- `api-integration.spec.ts`: Mock Perplexity API responses, test parsing
- `json-validation.spec.ts`: Validate JSON schema compliance
- `date-calculations.spec.ts`: Test week number, date range calculations
- `archive-logic.spec.ts`: Test archiving logic

#### 3. Visual Regression Tests
**Location**: `tests/visual/`

**Tests**:
- Screenshot comparison for:
  - Homepage with current week
  - Archive page
  - Mobile views
  - Different content lengths (many releases vs. few)

#### 4. Integration Tests
**Location**: `tests/integration/`

**Tests**:
- `github-actions.spec.ts`: Test workflow execution (local simulation)
- `data-persistence.spec.ts`: Test JSON file creation and updates
- `error-handling.spec.ts`: Test graceful degradation scenarios

### Test Execution Plan

**Pre-Implementation** (TDD Gate 1):
1. Write all tests FIRST
2. Run tests → verify ALL FAIL
3. Update `feature_list.json` with test file paths and `test_fails_before: true`

**During Implementation** (TDD Gate 2):
1. Implement feature code
2. Run tests → verify tests PASS
3. Update `feature_list.json` with `test_passes_after: true` and `passes: true`

**Continuous Testing**:
- Run full test suite before every commit
- Run visual regression tests before marking feature complete
- Run performance tests on actual deployed site

### Test Data

**Mock API Responses**:
```json
// tests/fixtures/perplexity-response.json
{
  "platforms": [
    {
      "name": "Netflix",
      "releases": [
        {
          "title": "Test Movie",
          "releaseDate": "2024-12-05",
          "genre": ["Drama"],
          "type": "movie",
          "description": "A test movie for automated testing."
        }
      ]
    }
  ]
}
```

**Test JSON Files**:
- `tests/fixtures/current-week.json`: Sample current week data
- `tests/fixtures/archive/2024-48.json`: Sample archived week

## Open Questions

### Week Definition
- **Question**: Should weeks follow ISO 8601 (Monday-Sunday) or US convention (Sunday-Saturday)?
- **Proposed Answer**: ISO 8601 (Monday-Sunday) for consistency with most international calendars

### API Timing
- **Question**: What time should the daily API call run? 9 AM UTC means different times for different timezones.
- **Proposed Answer**: 9 AM UTC (early morning US East Coast, afternoon Europe) to catch releases that went live overnight

### Platform Priority
- **Question**: Should platforms be ordered by popularity or alphabetically?
- **Proposed Answer**: Order by release count (most releases first) to highlight where the most content is

### Archive Display
- **Question**: Show all archived weeks or paginate after certain count?
- **Proposed Answer**: Show last 12 weeks by default, "Load more" for older weeks

### Update Notifications
- **Question**: Should users be notified when new releases are added during the week?
- **Proposed Answer**: No notifications for v1.0 (keep it simple). Consider RSS feed or browser notifications in future version.

### Data Retention
- **Question**: How long should we keep archived weeks? Forever or prune after 1 year?
- **Proposed Answer**: Keep all archives indefinitely (JSON files are tiny, <10KB each)

### Platform Coverage
- **Question**: Should we include smaller platforms (Crunchyroll, Shudder, etc.)?
- **Proposed Answer**: Start with top 8 platforms. Add more based on user feedback and API response quality.

### Error Display
- **Question**: If API fails and we show cached data, should we display a notice to users?
- **Proposed Answer**: Yes, subtle banner: "Showing data from [date]. Updates temporarily unavailable."

## Success Metrics

### User Engagement
- [ ] Average page load time <2 seconds
- [ ] Archive navigation used by >30% of visitors
- [ ] Mobile traffic >50% of total visits

### Technical Performance
- [ ] 99%+ uptime
- [ ] <5 failed API calls per month
- [ ] Zero deployment failures

### Cost Efficiency
- [ ] $0 monthly hosting cost (GitHub Pages free tier)
- [ ] <500 Perplexity API calls per month (well within free tier)
- [ ] <100 GitHub Actions minutes per month (well within free tier)

### Code Quality
- [ ] 100% test pass rate
- [ ] Zero console errors in production
- [ ] Lighthouse scores: All >90

## Implementation Phases

### Phase 1: Core Structure (Week 1)
- Static HTML skeleton
- CSS styling (mobile-first)
- Basic JavaScript for rendering
- Manual JSON data (no API yet)

### Phase 2: API Integration (Week 2)
- Perplexity API client script
- JSON schema validation
- Response parsing and transformation
- Error handling

### Phase 3: Automation (Week 3)
- GitHub Actions workflow
- Daily cron job
- Archive logic (week transitions)
- Deployment automation

### Phase 4: Archive & Navigation (Week 4)
- Archive page/section
- Load archived posts
- Archive list UI
- Week selector

### Phase 5: Polish & Testing (Week 5)
- Performance optimization
- Accessibility audit
- Visual regression tests
- Full E2E test suite

### Phase 6: Deployment (Week 6)
- GitHub Pages setup
- Domain configuration (if custom domain)
- Monitoring setup
- Go live!

## Related Documentation

- [Project Constitution](../../memory/constitution.md)
- [Libraries Instructions](../../.github/instructions/libraries.instructions.md)
- [API Documentation](./api-docs.md) (to be created)
- [Deployment Guide](./deployment.md) (to be created)

---

**Created**: 2024-12-07  
**Branch**: 001-ott-weekly-releases  
**Status**: Specification Complete → Ready for Planning
