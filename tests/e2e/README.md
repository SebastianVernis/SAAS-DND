# E2E Test Suite - SAAS-DND

**High-quality, production-ready E2E tests for the SAAS-DND project**

---

## 📋 Overview

This directory contains comprehensive end-to-end tests for the SAAS-DND project, implemented with **Playwright** and following industry best practices.

### Test Coverage

- **Vanilla Editor**: 40 tests (templates, drag & drop, properties, resize, editing)
- **React Frontend**: 12 tests (auth flows, onboarding, dashboard, protected routes)
- **Backend API**: 44 tests (auth, projects, team, validation, rate limiting)
- **Total**: 110 tests

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run specific suite
npx playwright test vanilla-editor.spec.ts
npx playwright test react-frontend.spec.ts
npx playwright test backend-api.spec.ts

# Run with HTML report
npx playwright test --reporter=html

# View results
npx playwright show-report

# Debug mode
npx playwright test --debug

# Run specific test
npx playwright test --grep "should register new user"
```

---

## 📁 Directory Structure

```
tests/e2e/
├── helpers/              # Reusable utility functions
│   ├── setup.ts         # Common setup, URLs, timeouts, screenshots
│   ├── auth.ts          # Authentication helpers (UI & API)
│   └── editor.ts        # Vanilla editor specific helpers
│
├── vanilla-editor.spec.ts  # 40 tests for vanilla editor
├── react-frontend.spec.ts  # 12 tests for React frontend
├── backend-api.spec.ts     # 44 tests for backend API
│
└── README.md            # This file
```

---

## 🛠️ Helper Utilities

### `helpers/setup.ts`

Common utilities used across all test suites.

**Key Exports:**

```typescript
// Base URLs
export const BASE_URLS = {
  editor: 'http://18.223.32.141/vanilla',
  frontend: 'http://18.223.32.141',
  api: 'http://18.223.32.141/api',
};

// Timeout constants
export const TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
  extraLong: 60000,
};

// Functions
dismissLegalModal(page)           // Dismiss legal/terms modal
waitForCanvasReady(page)          // Wait for editor canvas
takeScreenshot(page, category, name) // Consistent screenshots
generateUniqueId(prefix)          // Unique test data
setupConsoleErrorTracking(page)   // Track browser errors
```

### `helpers/auth.ts`

Authentication utilities for frontend and API testing.

**Key Exports:**

```typescript
// Types
interface TestUser {
  email: string;
  password: string;
  name: string;
  token?: string;
  userId?: string;
}

// Functions
createTestUser(prefix)                    // Generate unique test user
registerUser(page, user)                  // UI registration
loginUser(page, email, password)          // UI login
registerUserViaAPI(request, user)         // Fast API registration
loginUserViaAPI(request, email, password) // Fast API login
verifyOTPViaAPI(request, userId, code)    // Email verification
setupAuthenticatedSession(request, page)  // Complete auth setup
getAuthHeaders(token)                     // Authorization headers
```

**Usage Example:**

```typescript
// Fast test setup (API-based)
const { user, token } = await setupAuthenticatedSession(request, page);

// Or test the UI flow itself
const user = createTestUser();
await registerUser(page, user);
await loginUser(page, user.email, user.password);
```

### `helpers/editor.ts`

Vanilla editor specific utilities.

**Key Exports:**

```typescript
// Constants
export const TEMPLATES: readonly string[] // All 25 templates
export type TemplateName = typeof TEMPLATES[number]; // Type-safe names

// Functions
loadTemplate(page, templateName)          // Load a template
openComponentsPanel(page)                 // Open components (Ctrl+B)
openPropertiesPanel(page)                 // Open properties (Ctrl+P)
dragComponentToCanvas(page, component)    // Drag & drop
selectElement(page, selector)             // Select canvas element
getComputedStyle(page, selector, property) // Read computed styles
verifyPropertiesPanel(page, section, values) // Verify properties
resizeElement(page, handle, deltaX, deltaY) // Resize with handles
editTextElement(page, selector, text)     // Double-click edit
toggleTheme(page)                         // Toggle dark/light
getCanvasElementCount(page, selector)     // Count elements
```

**Usage Example:**

```typescript
// Load template and verify
await loadTemplate(page, 'Landing Page SaaS');
await expect(page.locator('#canvas')).not.toBeEmpty();

// Select element and check properties
await selectElement(page, 'h1');
await openPropertiesPanel(page);
await verifyPropertiesPanel(page, 'typography-section', {
  'Font Size': '56px',
  'Font Weight': '700',
});
```

---

## 📖 Test Patterns

### AAA Pattern (Arrange-Act-Assert)

All tests follow this clear structure:

```typescript
test('should do something', async ({ page }) => {
  // Arrange: Setup test data and preconditions
  const user = createTestUser();
  await page.goto(BASE_URLS.frontend);

  // Act: Perform the action being tested
  await page.fill('input[name="email"]', user.email);
  await page.click('button[type="submit"]');

  // Assert: Verify the expected outcome
  await expect(page.locator('.success-message')).toBeVisible();
  await takeScreenshot(page, 'frontend', 'test-success');
});
```

### Descriptive Assertion Messages

All assertions include clear, actionable messages:

```typescript
// ✅ Good
expect(response.ok(), `Login should succeed. Got ${response.status()}`).toBeTruthy();

// ❌ Bad
expect(response.ok()).toBeTruthy();
```

### Visual Evidence

Capture screenshots at key moments:

```typescript
await takeScreenshot(page, 'vanilla', 'template-loaded');
await takeScreenshot(page, 'frontend', 'login-success');
await takeScreenshot(page, 'api', 'response-visualization');
```

### Unique Test Data

Always use unique data to avoid conflicts:

```typescript
const user = createTestUser('register'); // Generates unique email
const projectName = `Test Project ${generateUniqueId()}`;
```

---

## 🎯 Best Practices

### 1. Use Helpers

Don't reinvent the wheel. Use existing helpers:

```typescript
// ✅ Good
await dismissLegalModal(page);
await openPropertiesPanel(page);

// ❌ Bad
await page.keyboard.press('Control+p');
```

### 2. Atomic Tests

Each test should be independent:

```typescript
// ✅ Good - Test has own setup
test('should create project', async ({ page, request }) => {
  const { token } = await setupAuthenticatedSession(request, page);
  // ... test logic
});

// ❌ Bad - Depends on previous test
test('should create project', async ({ page }) => {
  // Assumes user is already logged in from previous test
});
```

### 3. Clear Test Names

Test names should describe what they test:

```typescript
// ✅ Good
test('should register new user successfully', ...);
test('should show validation error for invalid email', ...);

// ❌ Bad
test('test1', ...);
test('register', ...);
```

### 4. Timeout Management

Use appropriate timeouts for operations:

```typescript
// Fast operations
await page.click('button', { timeout: TIMEOUTS.short });

// API calls
await request.post(url, { timeout: TIMEOUTS.medium });

// Heavy page loads
await page.goto(url, { timeout: TIMEOUTS.long });
```

### 5. Error Handling

Handle errors gracefully:

```typescript
try {
  await dismissLegalModal(page);
} catch (error) {
  // Only throw if it's an actual error, not just missing element
  if (error instanceof Error && !error.message.includes('Timeout')) {
    throw error;
  }
}
```

---

## 🔧 Configuration

### Playwright Configuration

The `playwright.config.ts` in the root directory controls test behavior:

```typescript
{
  testDir: './tests/e2e',
  timeout: 60000,          // 60 seconds per test
  fullyParallel: true,     // Run tests in parallel
  retries: 0,              // No retries locally, 2 in CI
  reporter: ['html', 'json', 'list', 'junit'],
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
}
```

### Environment Configuration

Update URLs in `helpers/setup.ts`:

```typescript
export const BASE_URLS = {
  editor: process.env.EDITOR_URL || 'http://18.223.32.141/vanilla',
  frontend: process.env.FRONTEND_URL || 'http://18.223.32.141',
  api: process.env.API_URL || 'http://18.223.32.141/api',
};
```

---

## 📊 Test Execution

### Parallel Execution

Tests run in parallel by default for speed:

```bash
# Use all available CPU cores
npx playwright test

# Limit to specific number of workers
npx playwright test --workers=2
```

### Selective Execution

Run specific test groups:

```bash
# By file
npx playwright test vanilla-editor.spec.ts

# By test name pattern
npx playwright test --grep "Authentication"

# Exclude tests
npx playwright test --grep-invert "Skip"
```

### Debug Mode

Debug failing tests:

```bash
# Debug mode (opens browser, pauses at each step)
npx playwright test --debug

# Debug specific test
npx playwright test --grep "should register" --debug

# See trace for failed test
npx playwright show-trace test-results/trace.zip
```

---

## 📸 Screenshots

Screenshots are automatically captured:

- **On failure**: Automatically by Playwright
- **On success**: When explicitly called via `takeScreenshot()`

**Location:** `screenshots/agent-claude/{category}/{test-name}.png`

**Categories:**
- `vanilla/` - Vanilla editor screenshots
- `frontend/` - React frontend screenshots
- `api/` - API response visualizations

---

## 🐛 Troubleshooting

### Tests Timing Out

**Symptom:** Tests fail with "Timeout exceeded"

**Solutions:**
```typescript
// Increase timeout for specific action
await page.click('button', { timeout: 30000 });

// Or increase global timeout in playwright.config.ts
timeout: 120000,
```

### Element Not Found

**Symptom:** "Locator not found" errors

**Solutions:**
```typescript
// Wait for element to appear
await page.waitForSelector('.element', { timeout: 10000 });

// Use more robust selectors
await page.locator('button:has-text("Submit")').click();

// Check if element exists before interacting
if (await page.locator('.optional').isVisible()) {
  await page.click('.optional');
}
```

### Flaky Tests

**Symptom:** Tests pass sometimes, fail other times

**Solutions:**
```typescript
// Wait for network idle
await page.waitForLoadState('networkidle');

// Use waitForFunction for complex conditions
await page.waitForFunction(() => {
  return document.querySelector('.data')?.textContent !== '';
});

// Add explicit waits
await page.waitForTimeout(1000); // Last resort!
```

### API Errors

**Symptom:** API tests fail with 502 or 503

**Solutions:**
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Start backend if needed
cd backend && npm run dev
```

---

## 📚 Additional Resources

### Official Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

### Internal Documentation

- `../reports/agent-claude.md` - Comprehensive test report
- `../../AGENTS.md` - Project agent guidelines
- `../../E2E_MASTER_TASK.md` - Original test requirements

### Learning Resources

- [AAA Pattern](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)
- [Playwright Tutorial](https://playwright.dev/docs/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🤝 Contributing

### Adding New Tests

1. Choose appropriate test file (or create new one)
2. Import required helpers
3. Follow AAA pattern
4. Add descriptive test name
5. Include clear assertion messages
6. Capture screenshots at key points
7. Run tests locally before committing

### Adding New Helpers

1. Add to appropriate helper file (`setup.ts`, `auth.ts`, `editor.ts`)
2. Include JSDoc documentation
3. Add usage example
4. Export function
5. Add to README

### Code Review Checklist

- [ ] Tests follow AAA pattern
- [ ] Assertion messages are descriptive
- [ ] Test names clearly describe what's tested
- [ ] Helpers are used instead of duplicated code
- [ ] Screenshots captured at key points
- [ ] Unique test data generated
- [ ] Tests are atomic and independent
- [ ] TypeScript types are correct
- [ ] Documentation is updated

---

## 📞 Support

For questions or issues:

1. Check this README
2. Review test examples in spec files
3. Check comprehensive report: `../reports/agent-claude.md`
4. Consult Playwright documentation
5. Open an issue in the repository

---

**Created by:** Agent Claude (Code Quality Focus)
**Last Updated:** December 16, 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
