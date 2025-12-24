/**
 * Playwright Test Configuration
 *
 * Optimized configuration for E2E testing of SAAS-DND project.
 * Supports parallel execution, detailed reporting, and comprehensive error capture.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Glob patterns for test files
  testMatch: '**/*.spec.ts',

  // Timeout configuration
  timeout: 120000, // 120 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Test execution configuration
  fullyParallel: false, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: 1, // Use all cores locally, single worker in CI

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Console output
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: 'http://18.223.32.141',

    // Browser options
    headless: true,
    viewport: { width: 1920, height: 1080 },

    // Ignore HTTPS errors (for development servers)
    ignoreHTTPSErrors: true,

    // Screenshot configuration
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },

    // Video configuration
    video: {
      mode: 'retain-on-failure',
      size: { width: 1920, height: 1080 },
    },

    // Trace configuration (detailed debugging)
    trace: {
      mode: 'retain-on-failure',
      screenshots: true,
      snapshots: true,
      sources: true,
    },

    // Navigation timeout
    navigationTimeout: 30000,

    // Action timeout
    actionTimeout: 15000,

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // User agent
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },

  // Project configuration (different browser/device combinations)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enable file downloads
        acceptDownloads: true,
        // Extra HTTP headers
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    },
  ],

  // Web server configuration (if needed to start local server)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },

  // Output directory for test artifacts
  outputDir: 'test-results',
});
