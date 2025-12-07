# Playwright Testing Instructions

Apply these guidelines when writing UI tests with Playwright.

## Setup

```bash
# Install Playwright
npm init playwright@latest

# Or add to existing project
npm install -D @playwright/test
npx playwright install
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature: {FeatureName}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should {expected behavior}', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Best Practices

### 1. Use Page Object Model
```typescript
// pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }
}
```

### 2. Use data-testid Attributes
```html
<button data-testid="submit-button">Submit</button>
```
```typescript
await page.click('[data-testid="submit-button"]');
```

### 3. Wait for Elements Properly
```typescript
// Good - auto-waits
await page.click('button');
await expect(page.locator('.result')).toBeVisible();

// Avoid - manual waits
await page.waitForTimeout(1000); // ❌
```

### 4. Use Assertions
```typescript
await expect(page).toHaveTitle('Dashboard');
await expect(page.locator('.message')).toContainText('Success');
await expect(page.locator('button')).toBeEnabled();
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

## Configuration

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Feature Verification Steps

When verifying a feature with UI tests:

1. **Create test file**: `tests/{feature-name}.spec.ts`
2. **Write happy path test first**
3. **Add edge case tests**
4. **Run tests**: `npx playwright test tests/{feature-name}.spec.ts`
5. **Verify all pass before marking feature complete**

## Integration with Harness Framework

In `feature_list.json`, include Playwright verification:
```json
{
  "id": 1,
  "name": "User Login",
  "steps": [
    "Create login form component",
    "Add form validation",
    "Implement authentication API",
    "Create Playwright tests in tests/login.spec.ts",
    "Verify: npx playwright test tests/login.spec.ts passes"
  ]
}
```
