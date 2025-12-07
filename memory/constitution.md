# OTT News Static Web Application - Constitution

This document defines the core principles, standards, and quality gates for the OTT News static web application project.

## Vision

Create a **lightweight, fast-loading static web application** that delivers fresh OTT/streaming platform news and updates daily through automated content aggregation. The site prioritizes simplicity, minimal dependencies, cost-effective API usage, and zero-maintenance operation once deployed.

## Core Principles

### 1. Simplicity First
- Single-page architecture with minimal JavaScript
- Pure HTML/CSS/vanilla JavaScript only (no frameworks)
- Static generation preferred over dynamic rendering
- Progressive enhancement over complex dependencies

### 2. Performance & Efficiency
- **Target**: Page loads in <2 seconds on 3G
- **Target**: Total page size <500KB (including images)
- Minimal API calls per build cycle
- Efficient caching strategies
- Lazy loading for non-critical content

### 3. Cost Optimization
- Minimize external API requests
- Batch API calls where possible
- Cache API responses aggressively
- Free-tier friendly (GitHub Pages, free APIs)
- No server-side compute costs

### 4. Automation & Maintenance-Free
- Daily automated updates via GitHub Actions
- No manual intervention required
- Self-healing on failures (graceful degradation)
- Automated deployments to GitHub Pages
- Error notifications only when critical

### 5. Content Consistency
- Standardized blog post structure (title, date, summary, source, image)
- Consistent metadata across all posts
- Structured JSON data format
- Semantic HTML markup

### 6. Test-Driven Development (TDD) - MANDATORY

> ⚠️ **NON-NEGOTIABLE**: Implementation code MUST NOT be written before a failing test exists.

```
┌─────────────────────────────────────────────────────────────────┐
│  🛑 TDD IS A HARD GATE - NOT A SUGGESTION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BEFORE writing ANY implementation code:                        │
│                                                                 │
│  1. Create test file: tests/{feature}.spec.ts                  │
│  2. Run test: npx playwright test tests/{feature}.spec.ts      │
│  3. VERIFY test FAILS                                          │
│  4. Update feature_list.json:                                  │
│     - test_file: "tests/{feature}.spec.ts"                     │
│     - test_fails_before: true                                  │
│                                                                 │
│  ONLY THEN may you write implementation code.                  │
│                                                                 │
│  AFTER implementation passes:                                   │
│  5. Run test: verify it PASSES                                  │
│  6. Update feature_list.json:                                  │
│     - test_passes_after: true                                  │
│     - passes: true                                             │
│                                                                 │
│  ⛔ Setting passes:true without test_passes_after:true          │
│     is a TDD VIOLATION                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- **RED**: Write the test FIRST - verify it FAILS
- **GREEN**: Implement ONLY enough code to pass the test
- **REFACTOR**: Clean up while keeping tests green
- **ENFORCEMENT**: If test passes before implementation, the test is wrong

### 7. Incremental Progress
- One feature at a time
- Complete before moving on
- Commit after each success
- Don't try to do too much

### 8. File-Based Memory
- All state lives in files
- `feature_list.json` is the source of truth
- Progress notes bridge sessions
- Git history enables rollback

### 9. Document for Next Agent
- Next agent has zero memory
- Write clear progress notes
- Explain decisions
- Leave clean state

### 10. Update Progress Immediately
- Update progress notes after each feature completion
- Document bugs/issues as soon as discovered
- Write before ending session (mandatory)
- Rule: "If you wouldn't remember it tomorrow, write it down now."

## Technical Standards

### Language & Stack
- **Primary Language**: Vanilla JavaScript (ES6+)
- **Markup**: Semantic HTML5
- **Styling**: CSS3 (CSS Grid, Flexbox, CSS Variables)
- **Build Tool**: npm scripts (no webpack/vite unless absolutely necessary)
- **Testing**: Playwright (for E2E and UI tests)
- **Automation**: GitHub Actions
- **Hosting**: GitHub Pages

### Code Style
- **JavaScript**: 
  - Use `const`/`let`, never `var`
  - Async/await over promise chains
  - ES modules (import/export)
  - Descriptive function names
  - JSDoc comments for public functions
  
- **HTML**: 
  - Semantic tags (`<article>`, `<section>`, `<nav>`, etc.)
  - ARIA labels for accessibility
  - Meta tags for SEO
  
- **CSS**: 
  - Mobile-first responsive design
  - CSS custom properties for theming
  - BEM naming convention for classes
  - No inline styles

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Graceful degradation for older browsers
- No polyfills unless critical

## Libraries

### Specified Libraries

| Category | Library | Reason |
|----------|---------|--------|
| **UI Testing** | Playwright | Comprehensive E2E testing, screenshot comparison, network mocking |
| **HTTP Client (Build)** | `fetch` (Node 18+) | Native, no dependencies, sufficient for API calls during build |
| **Date Handling** | `Intl.DateTimeFormat` | Native browser API, zero dependencies |
| **Build Automation** | GitHub Actions | Free, integrated, reliable |

### Explicitly Forbidden
- ❌ React, Vue, Angular, Svelte (frameworks add unnecessary weight)
- ❌ jQuery (modern vanilla JS is sufficient)
- ❌ Lodash/Underscore (native array methods are sufficient)
- ❌ Moment.js (use native Intl API or date-fns if needed)
- ❌ Bootstrap, Tailwind (custom CSS is lighter)

### Use Framework Defaults For
- npm (package manager)
- Standard Node.js built-ins (fs, path, etc. for build scripts)

## Quality Gates

All features must pass these gates before being marked `passes: true`:

### ✅ Functional Requirements
- [ ] Test written BEFORE implementation
- [ ] Test FAILS before implementation (`test_fails_before: true`)
- [ ] Test PASSES after implementation (`test_passes_after: true`)
- [ ] Feature works in Chrome, Firefox, Safari
- [ ] Mobile responsive (tested at 320px, 768px, 1024px, 1920px)

### ✅ Performance Requirements
- [ ] Page load <2s on 3G throttling (Playwright test)
- [ ] Total page size <500KB
- [ ] Lighthouse score >90 (Performance, Accessibility, SEO)
- [ ] No blocking JavaScript on initial render
- [ ] Images optimized (WebP with JPG fallback)

### ✅ Code Quality
- [ ] No linting errors (`npm run lint`)
- [ ] All tests pass (`npx playwright test`)
- [ ] No console errors in browser
- [ ] JSDoc comments on public functions
- [ ] No hardcoded API keys (use environment variables)

### ✅ Content Standards
- [ ] All blog posts follow standard structure
- [ ] Valid JSON format (if applicable)
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Meta tags present (title, description, og:image)

### ✅ Deployment Ready
- [ ] GitHub Actions workflow passes
- [ ] Changes committed with descriptive message
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes to existing features

## File Conventions

### Directory Structure
```
/
├── index.html              # Single-page application entry
├── assets/
│   ├── css/
│   │   ├── main.css       # Main styles
│   │   └── components/    # Component-specific styles
│   ├── js/
│   │   ├── app.js         # Main application logic
│   │   └── modules/       # Modular JS files
│   └── images/
│       ├── optimized/     # WebP images
│       └── fallback/      # JPG fallback images
├── data/
│   └── posts.json         # Blog post data (generated by build)
├── .github/
│   └── workflows/
│       └── daily-update.yml  # GitHub Actions automation
├── scripts/
│   ├── fetch-news.js      # API aggregation script
│   └── build.js           # Static site generation
├── tests/
│   ├── features/          # Feature tests
│   │   └── *.spec.ts
│   └── issues/            # Bug regression tests
│       └── I*.spec.ts
├── memory/
│   ├── constitution.md    # This file
│   ├── feature_list.json  # Feature tracking
│   ├── issues.json        # Issue tracking
│   └── claude-progress.md # Session notes
└── playwright.config.ts   # Playwright configuration
```

### Naming Conventions
- **Files**: kebab-case (`daily-update.yml`, `fetch-news.js`)
- **CSS Classes**: BEM convention (`.news-card__title--highlighted`)
- **JS Variables**: camelCase (`fetchNewsArticles`, `articleData`)
- **JS Constants**: UPPER_SNAKE_CASE (`API_KEY`, `MAX_ARTICLES`)
- **Test Files**: `{feature}.spec.ts` or `I{id}-{description}.spec.ts`

### Blog Post Structure
Every blog post in `data/posts.json` must follow this schema:

```json
{
  "id": "unique-slug-2024-12-07",
  "title": "Article Title",
  "date": "2024-12-07T10:00:00Z",
  "summary": "Brief 2-3 sentence description",
  "source": "Source Name",
  "sourceUrl": "https://source.com/article",
  "imageUrl": "assets/images/optimized/article-image.webp",
  "imageFallback": "assets/images/fallback/article-image.jpg",
  "category": "streaming|netflix|disney|amazon|apple|news",
  "tags": ["tag1", "tag2", "tag3"]
}
```

## Testing Strategy

### Test Types

1. **E2E Tests (Playwright)** - Primary testing method
   - Page load performance
   - Content rendering
   - Responsive design breakpoints
   - Link functionality
   - Image loading
   - Accessibility checks

2. **Build Script Tests**
   - API response validation
   - JSON schema validation
   - Data transformation correctness
   - Error handling (API failures)

3. **Visual Regression Tests**
   - Screenshot comparison for critical pages
   - Detect unintended UI changes

### Test Organization
```
tests/
├── features/
│   ├── page-load.spec.ts          # Performance tests
│   ├── content-rendering.spec.ts   # Content display tests
│   ├── responsive-design.spec.ts   # Mobile/tablet/desktop
│   └── accessibility.spec.ts       # A11y tests
└── issues/
    └── I001-fix-image-loading.spec.ts  # Bug regression tests
```

### Test Execution
```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test tests/features/page-load.spec.ts

# Run with UI
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Generate lighthouse report
npx playwright test tests/features/page-load.spec.ts --project=chromium
```

## API Consumption Patterns

### Principles
1. **Minimize calls**: Batch requests, cache aggressively
2. **Fail gracefully**: Show cached content if API fails
3. **Respect rate limits**: Implement delays between calls
4. **Monitor usage**: Log API call counts per build

### Example Pattern (Build Script)
```javascript
// scripts/fetch-news.js
const API_KEY = process.env.NEWS_API_KEY;
const CACHE_FILE = 'data/cache.json';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchNews() {
  // Check cache first
  const cached = await loadCache();
  if (cached && !isCacheExpired(cached)) {
    console.log('Using cached data');
    return cached.data;
  }

  // Fetch fresh data
  try {
    const response = await fetch(`https://api.example.com/news?key=${API_KEY}`);
    const data = await response.json();
    
    // Save to cache
    await saveCache({ data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('API fetch failed, using stale cache:', error);
    return cached?.data || [];
  }
}
```

## Automated Daily Updates

### GitHub Actions Workflow
- **Trigger**: Cron schedule (daily at 6 AM UTC)
- **Workflow**:
  1. Fetch latest news from APIs
  2. Transform data to standard format
  3. Generate static `data/posts.json`
  4. Rebuild `index.html` if needed
  5. Run Playwright tests
  6. Deploy to GitHub Pages (if tests pass)
  7. Notify on failure (GitHub Issues)

### Failure Handling
- If API fails: Use previous day's cached data
- If tests fail: Don't deploy, create GitHub issue
- If deployment fails: Retry once, then alert
- Never leave site in broken state

## Documentation Requirements

### Code Comments
- JSDoc for all public functions
- Inline comments for complex logic
- TODO comments with GitHub issue references

### Feature Documentation
- Each feature in `feature_list.json` is self-documenting
- Spec files in `specs/{branch}/spec.md` explain intent
- Progress notes in `memory/claude-progress.md` bridge sessions

### User Documentation
- Simple README.md with:
  - What the site does
  - How to view it
  - How to contribute (if open source)
- No complex documentation (site should be self-explanatory)

## Success Metrics

### Performance
- ✅ Page load time: <2 seconds (3G)
- ✅ Lighthouse score: >90
- ✅ Total page size: <500KB
- ✅ Time to first contentful paint: <1s

### Automation
- ✅ Daily builds succeed 95%+ of the time
- ✅ Zero manual deployments needed
- ✅ Self-healing on transient failures

### Quality
- ✅ All tests pass (100%)
- ✅ Zero console errors
- ✅ Accessible (WCAG 2.1 Level AA)
- ✅ Mobile-first responsive

### Cost
- ✅ $0/month hosting (GitHub Pages)
- ✅ Free tier API usage only
- ✅ No server compute costs

---

**Last Updated**: 2024-12-07  
**Next Review**: When adding major features or changing architecture

> Configure your project's library preferences here. If not specified, framework defaults apply.
> See `.github/instructions/libraries.instructions.md` for all defaults.

### Specified Libraries

| Category | Library | Reason |
|----------|---------|--------|
| UI Testing | Playwright | (default) |
| HTTP Client | fetch/requests | (default by language) |
| _Add your overrides here_ | | |

### Library Resolution Order

1. Libraries specified in this section (highest priority)
2. MCP tools if available (for simple operations)
3. Framework defaults from `libraries.instructions.md`

### Example Overrides

```markdown
| Category | Library | Reason |
|----------|---------|--------|
| UI Testing | Cypress | Team already uses Cypress |
| HTTP Client | axios | Need request interceptors |
| API Framework | Fastify | Performance requirements |
```

## Coding Standards

When generating or modifying code:
- Follow existing project conventions
- Prefer clarity over cleverness
- Include appropriate error handling
- Write code that is easy to modify

### When Modifying Files
- Make minimal, focused changes
- Preserve existing formatting
- Document significant changes
- Test changes when possible

## Communication Standards

### With Users
- Be concise but thorough
- Explain "why" not just "what"
- Offer options when appropriate
- Acknowledge limitations

### Between Agents
- Provide complete handoff context
- Reference specific files and locations
- State clear success criteria
- Include rollback instructions

## Boundaries

### Agents Should
- Ask for clarification when uncertain
- Refuse clearly harmful requests
- Suggest alternatives when blocked
- Learn from feedback

### Agents Should Not
- Make assumptions about intent
- Execute without a plan
- Ignore project conventions
- Forget to checkpoint state

---

*This constitution may be amended as the project evolves. All agents must re-read this file when starting significant work.*
