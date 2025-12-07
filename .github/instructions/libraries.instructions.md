# Default Libraries Instructions

Apply these library defaults for all code generation in this project.

## Library Resolution Order

When generating code that requires external libraries:

1. **Check `memory/constitution.md`** - User-specified libraries take priority
2. **Check MCP availability** - Use MCP tools if available and appropriate
3. **Use defaults below** - Fall back to framework defaults

## Default Libraries by Language

### TypeScript / JavaScript

| Category | Default Library | Alternatives |
|----------|-----------------|--------------|
| **HTTP Client** | `fetch` (native) | axios, got, ky |
| **Testing** | Playwright | Jest, Vitest, Mocha |
| **UI Testing** | Playwright | Puppeteer (via MCP), Cypress |
| **API Framework** | Express | Fastify, Hono, Koa |
| **Validation** | Zod | Yup, Joi, class-validator |
| **Date/Time** | date-fns | dayjs, luxon |
| **State Management** | Native/Context | Redux, Zustand, Jotai |

### Python

| Category | Default Library | Alternatives |
|----------|-----------------|--------------|
| **HTTP Client** | `requests` | httpx, aiohttp, urllib3 |
| **Testing** | pytest | unittest, nose2 |
| **UI Testing** | Playwright | Selenium, Puppeteer |
| **API Framework** | FastAPI | Flask, Django, Starlette |
| **Validation** | Pydantic | marshmallow, attrs |
| **Date/Time** | datetime (stdlib) | pendulum, arrow |
| **Async HTTP** | httpx | aiohttp |

### Go

| Category | Default Library | Alternatives |
|----------|-----------------|--------------|
| **HTTP Client** | `net/http` (stdlib) | resty, req |
| **Testing** | `testing` (stdlib) | testify, ginkgo |
| **API Framework** | Gin | Echo, Fiber, Chi |
| **Validation** | go-playground/validator | ozzo-validation |

### Rust

| Category | Default Library | Alternatives |
|----------|-----------------|--------------|
| **HTTP Client** | reqwest | hyper, ureq |
| **Testing** | Built-in | - |
| **API Framework** | Axum | Actix-web, Rocket |
| **Serialization** | serde | - |

## UI Testing Priority

For browser automation and UI testing:

```
1. MCP puppeteer/playwright server (if available and configured)
   └── Check: .vscode/mcp.json has browser automation server
   └── Best for: Quick screenshots, simple navigation, content extraction
   
2. Playwright (default)
   └── Most feature-complete, best for complex scenarios
   └── Configuration: playwright.config.ts
   
3. User-specified library
   └── Check: memory/constitution.md "Libraries" section
```

### When to Use MCP vs Direct Library

| Scenario | Use MCP | Use Library |
|----------|---------|-------------|
| Fetching webpage content | ✅ fetch MCP | - |
| Complex test suite | - | ✅ Playwright |
| Quick screenshot | ✅ browser MCP | - |
| E2E test with assertions | - | ✅ Playwright |
| API exploration | ✅ fetch MCP | - |
| Production API client | - | ✅ axios/requests |
| Content extraction | ✅ browser MCP | - |
| Parallel test execution | - | ✅ Playwright |
| Network interception | - | ✅ Playwright |

## API Client Priority

For making HTTP requests:

```
1. MCP fetch tools (if available)
   └── Best for: Fetching external content during planning/research
   
2. Native fetch (browser/Node 18+)
   └── No dependencies required
   └── Use for: Simple requests in TypeScript/JavaScript
   
3. Library (axios, requests, etc.)
   └── When more features needed (interceptors, retry, etc.)
```

## How to Override Defaults

### In constitution.md

Add a "Libraries" section to your project's constitution:

```markdown
## Libraries

### Specified Libraries
| Category | Library | Reason |
|----------|---------|--------|
| HTTP Client | axios | Need request interceptors |
| Testing | Vitest | Faster than Jest |
| UI Testing | Cypress | Team preference |
| API Framework | Fastify | Performance critical |

### Use Defaults For
- Everything else uses framework defaults
```

### Per-Feature Override

In `specs/{branch}/spec.md`, specify library requirements:

```markdown
## Technical Requirements

### Required Libraries
- Use `puppeteer` instead of Playwright (specific Chrome features needed)
- Use `axios` for HTTP (need request/response interceptors)
```

## Code Generation Examples

### TypeScript HTTP Request

```typescript
// Default: native fetch
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// If axios specified in constitution:
import axios from 'axios';
const { data } = await axios.get('https://api.example.com/data');
```

### Python HTTP Request

```python
# Default: requests
import requests
response = requests.get('https://api.example.com/data')
data = response.json()

# If httpx specified in constitution:
import httpx
response = httpx.get('https://api.example.com/data')
data = response.json()
```

### UI Test (Default: Playwright)

```typescript
// TypeScript with Playwright
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.click('[data-testid="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

```python
# Python with Playwright
from playwright.sync_api import sync_playwright

def test_user_can_login():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('/login')
        page.fill('[data-testid="email"]', 'user@example.com')
        page.click('[data-testid="submit"]')
        assert '/dashboard' in page.url
        browser.close()
```

### UI Test (If Cypress specified)

```typescript
// If Cypress specified in constitution
describe('Login', () => {
  it('user can login', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Package Managers

### Defaults by Language

| Language | Default | Alternatives |
|----------|---------|--------------|
| TypeScript/JS | npm | pnpm, yarn, bun |
| Python | pip | poetry, uv, pipenv |
| Go | go mod | - |
| Rust | cargo | - |

## Summary

1. **Always check constitution.md first** for user-specified libraries
2. **Try MCP if available** for simple operations (fetch, screenshots)
3. **Use Playwright** as default for UI testing
4. **Use native fetch** as default for HTTP in TypeScript
5. **Use requests** as default for HTTP in Python
6. **Document overrides** in the feature spec if needed
