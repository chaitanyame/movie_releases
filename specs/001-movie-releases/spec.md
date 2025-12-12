# Feature Specification: Movie Theatrical Releases Tracker

**Feature Branch**: `001-movie-releases`  
**Created**: 2025-12-12  
**Status**: Draft  
**Input**: User description: "Replace OTT streaming platform releases with theatrical movie releases for last week, current week, and next week for US and India markets, reusing existing functionality with Perplexity API"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Week Movie Releases (Priority: P1)

As a movie enthusiast, I want to see all theatrical movie releases for the current week in my region (US or India), organized by theater chains or distribution categories, so I can plan which movies to watch this week.

**Why this priority**: Core MVP functionality - users need to see what's playing in theaters RIGHT NOW. This is the primary value proposition and must work standalone.

**Independent Test**: Can be fully tested by loading the homepage, selecting a country (US or India), and verifying that current week's theatrical movie releases are displayed with titles, release dates, genres, and theater information. Delivers immediate value without requiring archive or future week functionality.

**Acceptance Scenarios**:

1. **Given** I am on the homepage, **When** page loads, **Then** I see current week's theatrical movie releases for my detected country (US or India)
2. **Given** I select "United States" country button, **When** data loads, **Then** I see US theatrical releases organized by distribution/theater categories with movie posters, titles, genres, ratings, and release dates
3. **Given** I select "India" country button, **When** data loads, **Then** I see Indian theatrical releases organized by language/industry (Bollywood, Tollywood, etc.) with regional theater distribution information
4. **Given** I view a movie release, **When** I read the details, **Then** I see title, release date, genre, cast (top 3-4 actors), runtime, rating (if available), and brief description
5. **Given** current week data is being loaded, **When** loading in progress, **Then** I see a loading indicator with appropriate ARIA attributes for accessibility

---

### User Story 2 - Navigate to Previous Week Releases (Priority: P2)

As a movie enthusiast, I want to view last week's theatrical movie releases so I can catch up on movies I might have missed or see what was popular recently.

**Why this priority**: Extends core functionality to provide historical context. Users can discover movies still playing in theaters from previous week releases.

**Independent Test**: Can be tested by navigating to "Last Week" view and verifying that previous week's theatrical releases are displayed. Delivers value by showing recent releases that may still be in theaters.

**Acceptance Scenarios**:

1. **Given** I am viewing current week releases, **When** I click "Previous Week" or navigate via URL hash, **Then** I see last week's theatrical releases with proper week date range displayed
2. **Given** I am viewing previous week releases, **When** data loads, **Then** movies are organized by the same categories as current week (theater chains for US, language/industry for India)
3. **Given** I am viewing previous week releases, **When** I click "Back to Current Week" button, **Then** I return to current week view
4. **Given** I view archived week releases, **When** page loads, **Then** the week title shows "Week [N]: [Date Range]" format clearly indicating it's historical data

---

### User Story 3 - Preview Next Week Releases (Priority: P3)

As a movie enthusiast, I want to see upcoming theatrical movie releases scheduled for next week so I can plan ahead and anticipate new movies coming to theaters.

**Why this priority**: Forward-looking feature that helps users plan future theater visits. Lower priority than current/past weeks since release dates for future weeks may be subject to change.

**Independent Test**: Can be tested by navigating to "Next Week" view and verifying that upcoming theatrical releases are displayed with tentative release dates clearly marked.

**Acceptance Scenarios**:

1. **Given** I am viewing current week releases, **When** I click "Next Week" or navigate via URL, **Then** I see next week's scheduled theatrical releases
2. **Given** I view next week releases, **When** data loads, **Then** I see movies marked with "Upcoming" or "Scheduled" indicators
3. **Given** I view next week releases, **When** release dates are tentative, **Then** I see "TBA" or "Subject to Change" notation
4. **Given** I am viewing next week releases, **When** I navigate back, **Then** I can return to current week view

---

### User Story 4 - Country-Specific Theater Distribution (Priority: P2)

As a user, I want to see movie releases organized according to my country's theater ecosystem (theater chains for US, language/regional industries for India) so the information is relevant and familiar to me.

**Why this priority**: Ensures the data presentation matches how users in each country think about theatrical releases. Essential for usability but can be refined after core viewing functionality works.

**Independent Test**: Can be tested by switching between US and India and verifying that organizational categories change appropriately (US: AMC, Regal, Cinemark, etc. vs India: Bollywood/Hindi, Tollywood/Telugu, regional categories).

**Acceptance Scenarios**:

1. **Given** I select United States, **When** viewing releases, **Then** movies are organized by distribution categories (Wide Release, Limited Release, Independent, Blockbuster)
2. **Given** I select India, **When** viewing releases, **Then** movies are organized by language/industry (Bollywood/Hindi, Tollywood/Telugu, Kollywood/Tamil, Mollywood/Malayalam, Sandalwood/Kannada, Regional)
3. **Given** I view India releases, **When** a movie is multi-language, **Then** I see all available language versions listed (e.g., "Hindi, Telugu, Tamil")
4. **Given** I view US releases, **When** a movie has limited release, **Then** I see notation about theater availability or major cities

---

### User Story 5 - Shareable URLs and Hash-Based Navigation (Priority: P3)

As a user, I want to share direct links to specific weeks and countries so I can send relevant movie information to friends or bookmark pages.

**Why this priority**: Enhances shareability and user experience but not core to viewing functionality. Can be added after basic navigation works.

**Independent Test**: Can be tested by copying URLs with hash parameters (e.g., #last-week/us, #current/india, #next-week/india) and verifying they load the correct week and country.

**Acceptance Scenarios**:

1. **Given** I am viewing a specific week and country, **When** I copy the URL, **Then** the URL contains hash parameters like #current/us or #last-week/india
2. **Given** I receive a shared URL with hash parameters, **When** I open it, **Then** the application loads that exact week and country
3. **Given** I navigate between weeks, **When** URL changes, **Then** browser back/forward buttons work correctly
4. **Given** I share a URL to last week for India, **When** recipient opens it, **Then** they see the correct historical data for that week and country

---

### Edge Cases

- **Week transition at midnight**: What happens when the application is viewed exactly at midnight UTC on Sunday/Monday boundary? System should handle gracefully and show the correct week based on server/system time.
- **No releases for a week**: How does the system display weeks where no theatrical releases are scheduled? Show empty state message: "No theatrical releases scheduled for this week."
- **API timeout or failure**: What happens when Perplexity API is unavailable? Display cached data from most recent successful fetch with timestamp and "Data may be outdated" notice.
- **Invalid week in URL hash**: What happens when user manually enters an invalid week reference (e.g., #invalid/us)? Redirect to current week with error message.
- **Future weeks beyond next week**: What happens if user tries to access 2+ weeks in the future? Only support current week, last week, and next week as specified.
- **Country not detected**: What happens if timezone detection fails? Default to US market with option to manually switch to India.
- **Movie with no poster/image**: How to display movies without poster URLs? Use placeholder image or text-based fallback with movie title.
- **Release date changes**: What happens when a movie's release date is postponed after being fetched? Display data as fetched with generation timestamp; next update will reflect changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch theatrical movie release data from Perplexity API for last week, current week, and next week
- **FR-002**: System MUST support two regional markets: United States and India
- **FR-003**: System MUST organize US theatrical releases by distribution categories (Wide Release, Limited Release, Independent, Blockbuster)
- **FR-004**: System MUST organize India theatrical releases by language/industry (Bollywood/Hindi, Tollywood/Telugu, Kollywood/Tamil, Mollywood/Malayalam, Sandalwood/Kannada, Regional)
- **FR-005**: System MUST display movie details including: title, release date, genre, cast (top 3-4 actors), runtime, rating, theater distribution info, and description
- **FR-006**: System MUST maintain ISO week-based temporal boundaries for all three time periods (last week, current week, next week)
- **FR-007**: System MUST store data in separate JSON files: `data/{country}/last-week.json`, `data/{country}/current-week.json`, `data/{country}/next-week.json`
- **FR-008**: System MUST auto-detect user's country based on timezone and default to appropriate market (US or India)
- **FR-009**: Users MUST be able to manually switch between US and India markets via country selector buttons
- **FR-010**: System MUST persist user's country preference in localStorage across sessions
- **FR-011**: System MUST provide navigation controls to switch between last week, current week, and next week views
- **FR-012**: System MUST support hash-based URL routing for shareable links (e.g., #current/us, #last-week/india, #next-week/us)
- **FR-013**: System MUST display loading indicators during data fetch operations with appropriate ARIA attributes
- **FR-014**: System MUST display human-readable error messages when data cannot be loaded
- **FR-015**: System MUST show data generation timestamp to indicate freshness of information
- **FR-016**: System MUST handle week transitions automatically via daily GitHub Actions workflow at 09:00 UTC
- **FR-017**: System MUST validate all JSON data files for required fields before rendering
- **FR-018**: System MUST maintain zero runtime dependencies (vanilla HTML, CSS, JavaScript only)
- **FR-019**: System MUST work without JavaScript enabled (progressive enhancement) by displaying at minimum the current week data as static content
- **FR-020**: System MUST meet WCAG 2.1 Level AA accessibility standards

### Key Entities

- **Movie Release**: Represents a theatrical movie release with attributes:
  - Title (string, required)
  - Release date (ISO date string, required)
  - Genre (string, required)
  - Rating (string, optional - e.g., "PG-13", "UA", "R")
  - Runtime (number in minutes, optional)
  - Cast (array of actor names, top 3-4)
  - Director (string, optional)
  - Language (string or array for multi-language releases)
  - Theater distribution info (string - wide release, limited, theater chains)
  - Description (string, brief 1-2 sentence synopsis)
  - Industry/Region (for India: Bollywood, Tollywood, etc.)
  - Poster URL (string, optional)

- **Week Data**: Contains movie releases for a specific week period:
  - Week number (1-53, ISO standard)
  - Year (4-digit year)
  - Week ID (format: "YYYY-WW")
  - Week start date (Monday, ISO format)
  - Week end date (Sunday, ISO format)
  - Week range (human-readable: "December 8-14, 2025")
  - Week title (format: "Week 50: December 8-14, 2025")
  - Week type (last-week, current-week, next-week)
  - Country data (id, name, flag)
  - Generated timestamp (ISO format)
  - Distribution categories (array of category objects, each containing movie releases)

- **Distribution Category**: Groups movies by theater ecosystem:
  - Category ID (string: "wide-release", "bollywood-hindi", etc.)
  - Category name (string: "Wide Release", "Bollywood / Hindi")
  - Releases (array of Movie Release objects)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view current week theatrical movie releases within 2 seconds of page load on desktop (3G connection)
- **SC-002**: System accurately displays last week, current week, and next week movie data for both US and India markets
- **SC-003**: 95% of users successfully switch between weeks and countries without errors on first attempt
- **SC-004**: Page maintains First Contentful Paint < 1.0s and Largest Contentful Paint < 2.5s (per constitution performance budgets)
- **SC-005**: System successfully fetches and updates movie data daily via automated workflow without manual intervention
- **SC-006**: All movie releases include minimum required fields (title, release date, genre) with 98% data completeness
- **SC-007**: Shareable URLs correctly load the specified week and country with 100% accuracy
- **SC-008**: System remains functional for users with JavaScript disabled (progressive enhancement - at least current week static content visible)
- **SC-009**: Application passes Lighthouse accessibility audit with minimum score of 90
- **SC-010**: Week transitions occur automatically at correct times (Monday 00:00 UTC) without data corruption
- **SC-011**: Error recovery displays cached data when API fails, ensuring users always see some movie information
- **SC-012**: Users can identify upcoming vs current vs past releases through clear visual indicators and labels

### User Satisfaction Metrics

- Users can immediately identify this week's new theatrical releases in their region
- Users find the country-specific organization (theater chains vs regional industries) intuitive and helpful
- Users successfully plan theater visits using the information provided
- Users can share specific movie release information with friends via URLs

## Assumptions

- Perplexity API will provide comprehensive theatrical movie release data for both US and India markets
- Theatrical release dates are publicly available and relatively stable for current and past weeks
- Future week (next week) data may have tentative dates subject to change
- Users are primarily interested in new theatrical releases, not repertory or special screenings
- Movie poster images will be available through standard entertainment data sources (TMDB, IMDb references)
- US market considers "theater chains" and "distribution type" as primary organizational categories
- India market considers "language/regional industry" as primary organizational categories
- Users understand ISO week numbering (Monday-Sunday weeks)
- GitHub Actions can successfully run daily at 09:00 UTC to fetch new data
- localStorage is available in user browsers for preference persistence
- Users have modern browsers with ES6+ JavaScript support (for enhanced features)

## Out of Scope

- User authentication or personalized recommendations
- Integration with ticket booking systems or theater websites
- Movie reviews, ratings aggregation, or user-generated content
- Trailer videos or rich media content
- Movie showtimes or theater location mapping
- Archive functionality beyond 3 weeks (last, current, next only)
- Support for regions beyond US and India
- Mobile applications (native iOS/Android apps)
- Real-time updates (daily batch updates are sufficient)
- Social sharing integrations beyond URL sharing
- Advanced filtering or search functionality
- Comparison features between markets
- Historical trend analysis or statistics
- API endpoints for third-party consumption

## Dependencies

- **Perplexity API**: Required for fetching movie release data (same as current OTT implementation)
- **GitHub Actions**: Required for automated daily data updates
- **Browser localStorage**: Optional for persisting user country preference
- **Existing codebase utilities**: Reuse date-utils.js, cache.js, error-handler.js, week-transition.js modules
- **ISO week calculation**: Week numbers and boundaries must follow ISO 8601 standard

## Non-Functional Requirements

- **Performance**: Adhere to constitution performance budgets (FCP < 1.0s, LCP < 2.5s, TBT < 200ms)
- **Accessibility**: WCAG 2.1 Level AA compliance mandatory
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **Mobile Responsiveness**: Fully responsive design for mobile, tablet, desktop
- **Data Freshness**: Update daily at 09:00 UTC via GitHub Actions
- **Error Handling**: Graceful degradation with cached data fallback
- **Zero Dependencies**: Maintain vanilla HTML/CSS/JavaScript architecture per constitution
- **Progressive Enhancement**: Core content viewable without JavaScript
