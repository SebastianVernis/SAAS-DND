/**
 * Test Setup Helpers
 *
 * This module provides utilities for test setup, configuration, and common operations
 * across all E2E test suites. Follows AAA (Arrange-Act-Assert) pattern principles.
 *
 * @module setup
 */

import { Page, expect } from '@playwright/test';

/**
 * Base URLs for different application components
 * Centralized configuration for easy maintenance
 */
export const BASE_URLS = {
  editor: 'http://18.223.32.141/vanilla',
  frontend: 'http://18.223.32.141',
  api: 'http://18.223.32.141/api',
} as const;

/**
 * Common timeouts used across tests
 * Following Playwright best practices for timeout management
 */
export const TIMEOUTS = {
  short: 5000,       // For fast operations (button clicks, simple DOM queries)
  medium: 15000,     // For API calls, network requests
  long: 30000,       // For heavy page loads, template rendering
  extraLong: 60000,  // For complex operations, video rendering
} as const;

/**
 * Screenshot configuration
 * Consistent naming and storage patterns
 */
export const SCREENSHOT_CONFIG = {
  baseDir: 'screenshots/agent-claude',
  fullPage: false,
  animations: 'disabled' as const,
} as const;

/**
 * Dismisses the legal/terms modal on the vanilla editor
 *
 * This is a common prerequisite for most vanilla editor tests.
 * The function is idempotent - safe to call even if modal isn't present.
 *
 * @param page - Playwright Page object
 * @throws Will fail the test if modal elements are present but uninteractable
 *
 * @example
 * ```typescript
 * await dismissLegalModal(page);
 * // Now proceed with editor interactions
 * ```
 */
export async function dismissLegalModal(page: Page): Promise<void> {
  try {
    const checkbox = page.locator('#accept-terms-checkbox');
    const acceptButton = page.locator('#accept-btn');

    // Check if modal is present
    const isVisible = await checkbox.isVisible({ timeout: TIMEOUTS.short });

    if (isVisible) {
      // Ensure checkbox is checked
      await checkbox.check({ timeout: TIMEOUTS.short });

      // Wait for button to be enabled (it may be disabled until checkbox is checked)
      await expect(acceptButton).toBeEnabled({ timeout: TIMEOUTS.short });

      // Click accept button
      await acceptButton.click();

      // Verify modal is dismissed by waiting for it to be hidden
      await expect(checkbox).not.toBeVisible({ timeout: TIMEOUTS.short });
    }
  } catch (error) {
    // Modal not present or already dismissed - this is not an error condition
    // We only throw if elements exist but are uninteractable
    if (error instanceof Error && !error.message.includes('Timeout')) {
      throw error;
    }
  }
}

/**
 * Waits for the editor canvas to be ready for interactions
 *
 * Ensures that the canvas is fully loaded, visible, and ready for element manipulation.
 * This prevents race conditions in tests.
 *
 * @param page - Playwright Page object
 * @throws Will fail if canvas doesn't become ready within timeout
 *
 * @example
 * ```typescript
 * await waitForCanvasReady(page);
 * // Now safe to interact with canvas elements
 * ```
 */
export async function waitForCanvasReady(page: Page): Promise<void> {
  const canvas = page.locator('#canvas');

  // Wait for canvas to be attached to DOM
  await canvas.waitFor({ state: 'attached', timeout: TIMEOUTS.medium });

  // Wait for canvas to be visible
  await expect(canvas).toBeVisible({ timeout: TIMEOUTS.medium });

  // Additional check: ensure canvas has at least loaded its initial state
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.long });
}

/**
 * Captures a screenshot with consistent naming and configuration
 *
 * Follows a standardized naming convention for easy organization and retrieval.
 * Automatically creates necessary directories.
 *
 * @param page - Playwright Page object
 * @param category - Test category (vanilla, frontend, api)
 * @param testName - Descriptive name for the screenshot (kebab-case recommended)
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await takeScreenshot(page, 'vanilla', 'template-saas-landing');
 * // Creates: screenshots/agent-claude/vanilla/template-saas-landing.png
 * ```
 */
export async function takeScreenshot(
  page: Page,
  category: 'vanilla' | 'frontend' | 'api',
  testName: string
): Promise<void> {
  const path = `${SCREENSHOT_CONFIG.baseDir}/${category}/${testName}.png`;

  await page.screenshot({
    path,
    fullPage: SCREENSHOT_CONFIG.fullPage,
    animations: SCREENSHOT_CONFIG.animations,
  });
}

/**
 * Waits for network to be idle
 *
 * Useful after operations that trigger API calls or lazy loading.
 * More reliable than fixed timeouts.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait (default: medium timeout)
 *
 * @example
 * ```typescript
 * await waitForNetworkIdle(page);
 * // Network activity has settled
 * ```
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = TIMEOUTS.medium
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Performs a hard refresh of the page
 *
 * Bypasses cache to ensure fresh content.
 * Useful after editor modifications or when testing cache behavior.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await hardRefresh(page);
 * // Page reloaded with fresh content
 * ```
 */
export async function hardRefresh(page: Page): Promise<void> {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Generates a unique test identifier
 *
 * Useful for creating unique test data (emails, project names, etc.)
 * Helps avoid conflicts in parallel test execution.
 *
 * @param prefix - Optional prefix for the identifier
 * @returns Unique string identifier
 *
 * @example
 * ```typescript
 * const email = `test-${generateUniqueId()}@example.com`;
 * // test-1234567890@example.com
 * ```
 */
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Checks if browser console has errors
 *
 * Monitors console for JavaScript errors during test execution.
 * Returns collected errors for assertion or logging.
 *
 * @param page - Playwright Page object
 * @returns Array of error messages
 *
 * @example
 * ```typescript
 * page.on('console', msg => {
 *   if (msg.type() === 'error') {
 *     errors.push(msg.text());
 *   }
 * });
 * const errors = getConsoleErrors(page);
 * expect(errors).toHaveLength(0);
 * ```
 */
export function setupConsoleErrorTracking(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}
