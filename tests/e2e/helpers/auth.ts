/**
 * Authentication Test Helpers
 *
 * Provides reusable authentication utilities for E2E tests.
 * Handles registration, login, OTP verification, and session management.
 *
 * @module auth
 */

import { Page, expect, APIRequestContext } from '@playwright/test';
import { BASE_URLS, TIMEOUTS, generateUniqueId } from './setup';

/**
 * Test user credentials interface
 * Standardizes user data across authentication tests
 */
export interface TestUser {
  email: string;
  password: string;
  name: string;
  token?: string;
  userId?: string;
}

/**
 * Creates a test user with unique credentials
 *
 * Generates unique email to avoid conflicts in database.
 * Uses strong password that meets validation requirements.
 *
 * @param prefix - Optional prefix for email (default: 'test')
 * @returns TestUser object with generated credentials
 *
 * @example
 * ```typescript
 * const user = createTestUser('admin');
 * // { email: 'admin-1234567890@test.com', ... }
 * ```
 */
export function createTestUser(prefix: string = 'test'): TestUser {
  return {
    email: `${prefix}-${generateUniqueId()}@test.com`,
    password: 'SecurePass123!',
    name: `Test User ${generateUniqueId()}`,
  };
}

/**
 * Registers a new user via UI
 *
 * Navigates to registration page, fills form, and submits.
 * Handles success/error states and provides clear failure messages.
 *
 * @param page - Playwright Page object
 * @param user - User credentials to register
 * @returns Promise<void>
 * @throws Will fail if registration encounters errors
 *
 * @example
 * ```typescript
 * const user = createTestUser();
 * await registerUser(page, user);
 * // User registered, page is on OTP verification
 * ```
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  // Navigate to registration page
  await page.goto(`${BASE_URLS.frontend}/register`, {
    waitUntil: 'networkidle',
    timeout: TIMEOUTS.long,
  });

  // Fill registration form
  await page.fill('input[name="email"]', user.email, { timeout: TIMEOUTS.short });
  await page.fill('input[name="password"]', user.password, { timeout: TIMEOUTS.short });
  await page.fill('input[name="name"]', user.name, { timeout: TIMEOUTS.short });

  // Submit form
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled({ timeout: TIMEOUTS.short });
  await submitButton.click();

  // Verify redirect to OTP verification
  await page.waitForURL('**/verify-otp', {
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Logs in a user via UI
 *
 * Navigates to login page, fills credentials, and submits.
 * Verifies successful login by checking JWT token and dashboard redirect.
 *
 * @param page - Playwright Page object
 * @param email - User email
 * @param password - User password
 * @returns Promise<string> JWT token
 * @throws Will fail if login is unsuccessful
 *
 * @example
 * ```typescript
 * const token = await loginUser(page, 'test@example.com', 'password');
 * // User logged in, page is on dashboard
 * ```
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<string> {
  // Navigate to login page
  await page.goto(`${BASE_URLS.frontend}/login`, {
    waitUntil: 'networkidle',
    timeout: TIMEOUTS.long,
  });

  // Fill login form
  await page.fill('input[name="email"]', email, { timeout: TIMEOUTS.short });
  await page.fill('input[name="password"]', password, { timeout: TIMEOUTS.short });

  // Submit form
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled({ timeout: TIMEOUTS.short });
  await submitButton.click();

  // Wait for successful login (redirect to dashboard or home)
  await page.waitForURL('**/dashboard', {
    timeout: TIMEOUTS.medium,
  });

  // Retrieve and verify token from localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));

  expect(token, 'JWT token should be stored in localStorage after login').toBeTruthy();

  return token as string;
}

/**
 * Registers user via API
 *
 * More efficient than UI registration for setup/teardown.
 * Useful when authentication is a prerequisite, not the test subject.
 *
 * @param request - Playwright APIRequestContext
 * @param user - User credentials to register
 * @returns Promise<{ userId: string, otpCode?: string }>
 * @throws Will fail if API returns non-2xx status
 *
 * @example
 * ```typescript
 * const { userId } = await registerUserViaAPI(request, user);
 * // User registered in database
 * ```
 */
export async function registerUserViaAPI(
  request: APIRequestContext,
  user: TestUser
): Promise<{ userId: string; otpCode?: string }> {
  const response = await request.post(`${BASE_URLS.api}/auth/register`, {
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
    },
    timeout: TIMEOUTS.medium,
  });

  expect(
    response.ok(),
    `Registration API should return 2xx status. Got ${response.status()}`
  ).toBeTruthy();

  const data = await response.json();

  expect(data, 'Registration response should contain userId').toHaveProperty('userId');

  return {
    userId: data.userId,
    otpCode: data.otpCode, // Available in development mode
  };
}

/**
 * Logs in user via API
 *
 * More efficient than UI login for test setup.
 * Returns JWT token for making authenticated API requests.
 *
 * @param request - Playwright APIRequestContext
 * @param email - User email
 * @param password - User password
 * @returns Promise<string> JWT token
 * @throws Will fail if API returns non-2xx status
 *
 * @example
 * ```typescript
 * const token = await loginUserViaAPI(request, 'test@example.com', 'password');
 * // Use token for subsequent authenticated requests
 * ```
 */
export async function loginUserViaAPI(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const response = await request.post(`${BASE_URLS.api}/auth/login`, {
    data: {
      email,
      password,
    },
    timeout: TIMEOUTS.medium,
  });

  expect(
    response.ok(),
    `Login API should return 2xx status. Got ${response.status()}`
  ).toBeTruthy();

  const data = await response.json();

  expect(data, 'Login response should contain token').toHaveProperty('token');

  return data.token;
}

/**
 * Verifies OTP code via API
 *
 * Completes email verification step.
 * In development, OTP is returned in registration response.
 *
 * @param request - Playwright APIRequestContext
 * @param userId - User ID from registration
 * @param otpCode - 6-digit OTP code
 * @returns Promise<boolean> Success status
 *
 * @example
 * ```typescript
 * await verifyOTPViaAPI(request, userId, '123456');
 * // Email verified, user can now login
 * ```
 */
export async function verifyOTPViaAPI(
  request: APIRequestContext,
  userId: string,
  otpCode: string
): Promise<boolean> {
  const response = await request.post(`${BASE_URLS.api}/auth/verify-otp`, {
    data: {
      userId,
      code: otpCode,
    },
    timeout: TIMEOUTS.medium,
  });

  return response.ok();
}

/**
 * Logs out user
 *
 * Clears token from localStorage and navigates to login page.
 * Ensures clean state for subsequent tests.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await logoutUser(page);
 * // User logged out, token cleared
 * ```
 */
export async function logoutUser(page: Page): Promise<void> {
  // Clear token from localStorage
  await page.evaluate(() => localStorage.removeItem('token'));

  // Navigate to login page to verify logout
  await page.goto(`${BASE_URLS.frontend}/login`, {
    waitUntil: 'networkidle',
    timeout: TIMEOUTS.long,
  });

  // Verify we're on login page (not redirected to dashboard)
  expect(page.url()).toContain('/login');
}

/**
 * Sets up authenticated session
 *
 * Registers user, verifies email, and logs in - all via API.
 * Fast alternative to UI-based authentication for test setup.
 *
 * @param request - Playwright APIRequestContext
 * @param page - Playwright Page object
 * @param user - Optional user credentials (generates if not provided)
 * @returns Promise<{ user: TestUser, token: string }>
 *
 * @example
 * ```typescript
 * const { user, token } = await setupAuthenticatedSession(request, page);
 * // User fully authenticated and ready for testing
 * ```
 */
export async function setupAuthenticatedSession(
  request: APIRequestContext,
  page: Page,
  user?: TestUser
): Promise<{ user: TestUser; token: string }> {
  const testUser = user || createTestUser();

  // Register user
  const { userId, otpCode } = await registerUserViaAPI(request, testUser);
  testUser.userId = userId;

  // Verify email if OTP is available (development mode)
  if (otpCode) {
    await verifyOTPViaAPI(request, userId, otpCode);
  }

  // Login to get token
  const token = await loginUserViaAPI(request, testUser.email, testUser.password);
  testUser.token = token;

  // Set token in browser context
  await page.goto(BASE_URLS.frontend);
  await page.evaluate((t) => localStorage.setItem('token', t), token);

  return { user: testUser, token };
}

/**
 * Creates authorization header for API requests
 *
 * Standardizes Bearer token format for authenticated requests.
 *
 * @param token - JWT token
 * @returns Authorization header object
 *
 * @example
 * ```typescript
 * const headers = getAuthHeaders(token);
 * await request.get('/api/projects', { headers });
 * ```
 */
export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
