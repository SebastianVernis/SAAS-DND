/**
 * E2E Test Suite: React Frontend
 *
 * Comprehensive testing of the React Frontend including:
 * - Authentication flows (register, login, OTP, logout)
 * - Onboarding wizard (5-step process)
 * - Dashboard functionality
 * - Protected routes
 * - State management
 *
 * @group react-frontend
 * @priority high
 */

import { test, expect } from '@playwright/test';
import {
  BASE_URLS,
  TIMEOUTS,
  takeScreenshot,
  setupConsoleErrorTracking,
  generateUniqueId,
} from './helpers/setup';
import {
  createTestUser,
  registerUser,
  loginUser,
  logoutUser,
  setupAuthenticatedSession,
  registerUserViaAPI,
  loginUserViaAPI,
  verifyOTPViaAPI,
  getAuthHeaders,
} from './helpers/auth';

/**
 * Test Suite Configuration
 * Sets up common behavior for all frontend tests
 */
test.describe('React Frontend - E2E Tests', () => {
  /**
   * Before Each Test: Setup
   * Prepares clean state for each test
   */
  test.beforeEach(async ({ page }) => {
    // Track console errors
    setupConsoleErrorTracking(page);
  });

  /**
   * Test Group 1: Authentication - Registration
   * Validates user registration flow
   */
  test.describe('Authentication - Registration', () => {
    test('should complete registration flow successfully', async ({ page }) => {
      // Arrange: Create unique test user
      const user = createTestUser('register');

      // Act: Navigate and fill registration form
      await page.goto(`${BASE_URLS.frontend}/register`, {
        waitUntil: 'networkidle',
        timeout: TIMEOUTS.long,
      });

      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="name"]', user.name);

      // Assert: Form should be valid and button enabled
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton, 'Submit button should be enabled').toBeEnabled({
        timeout: TIMEOUTS.short,
      });

      // Act: Submit form
      await submitButton.click();

      // Assert: Should redirect to OTP verification
      await page.waitForURL('**/verify-otp', {
        timeout: TIMEOUTS.medium,
      });

      expect(page.url(), 'Should be on OTP verification page').toContain('/verify-otp');

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'register-success');
    });

    test('should show validation error for invalid email', async ({ page }) => {
      // Arrange: Navigate to registration
      await page.goto(`${BASE_URLS.frontend}/register`);

      // Act: Enter invalid email
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'ValidPass123!');
      await page.fill('input[name="name"]', 'Test User');

      // Blur email field to trigger validation
      await page.locator('input[name="email"]').blur();

      // Assert: Validation error should appear
      const errorMessage = page.locator('text=/invalid email|correo inválido/i');
      await expect(
        errorMessage,
        'Validation error should appear for invalid email'
      ).toBeVisible({
        timeout: TIMEOUTS.short,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'register-validation-error');
    });

    test('should show error for duplicate email', async ({ page, request }) => {
      // Arrange: Register a user first
      const user = createTestUser('duplicate');
      await registerUserViaAPI(request, user);

      // Act: Try to register same email via UI
      await page.goto(`${BASE_URLS.frontend}/register`);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', 'DifferentPass123!');
      await page.fill('input[name="name"]', 'Different Name');
      await page.click('button[type="submit"]');

      // Assert: Error message should appear
      const errorMessage = page.locator('text=/already exists|ya existe/i');
      await expect(
        errorMessage,
        'Error should appear for duplicate email'
      ).toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'register-duplicate-error');
    });
  });

  /**
   * Test Group 2: Authentication - OTP Verification
   * Validates OTP verification flow
   */
  test.describe('Authentication - OTP Verification', () => {
    test('should verify OTP successfully in development mode', async ({ page, request }) => {
      // Arrange: Register user and get OTP (development mode returns OTP)
      const user = createTestUser('otp');
      const { userId, otpCode } = await registerUserViaAPI(request, user);

      // Navigate to OTP page
      await page.goto(`${BASE_URLS.frontend}/verify-otp?userId=${userId}`);

      // Act: Enter OTP code
      if (otpCode) {
        // In development mode, OTP is provided
        await page.fill('input[name="otp"]', otpCode);
        await page.click('button[type="submit"]');

        // Assert: Should redirect to login or dashboard
        await page.waitForURL(/\/(login|dashboard)/, {
          timeout: TIMEOUTS.medium,
        });

        expect(page.url(), 'Should redirect after successful OTP verification').toMatch(
          /\/(login|dashboard)/
        );

        // Capture screenshot
        await takeScreenshot(page, 'frontend', 'otp-success');
      } else {
        // Skip test if OTP not available
        test.skip();
      }
    });

    test('should show error for invalid OTP', async ({ page, request }) => {
      // Arrange: Register user
      const user = createTestUser('invalid-otp');
      const { userId } = await registerUserViaAPI(request, user);

      await page.goto(`${BASE_URLS.frontend}/verify-otp?userId=${userId}`);

      // Act: Enter invalid OTP
      await page.fill('input[name="otp"]', '000000');
      await page.click('button[type="submit"]');

      // Assert: Error message should appear
      const errorMessage = page.locator('text=/invalid|inválido/i');
      await expect(errorMessage, 'Error should appear for invalid OTP').toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'otp-invalid-error');
    });
  });

  /**
   * Test Group 3: Authentication - Login
   * Validates user login flow
   */
  test.describe('Authentication - Login', () => {
    test('should login with valid credentials successfully', async ({ page, request }) => {
      // Arrange: Create and verify user
      const user = createTestUser('login');
      const { userId, otpCode } = await registerUserViaAPI(request, user);

      // Verify email if OTP available
      if (otpCode) {
        await verifyOTPViaAPI(request, userId, otpCode);
      }

      // Act: Login via UI
      await page.goto(`${BASE_URLS.frontend}/login`);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.click('button[type="submit"]');

      // Assert: Should redirect to dashboard
      await page.waitForURL('**/dashboard', {
        timeout: TIMEOUTS.medium,
      });

      // Verify token in localStorage
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token, 'JWT token should be stored after login').toBeTruthy();

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'login-success');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Arrange: Navigate to login
      await page.goto(`${BASE_URLS.frontend}/login`);

      // Act: Enter invalid credentials
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      // Assert: Error message should appear
      const errorMessage = page.locator('text=/invalid credentials|credenciales inválidas/i');
      await expect(errorMessage, 'Error should appear for invalid credentials').toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'login-invalid-credentials');
    });

    test('should persist login across page refresh', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      const { token } = await setupAuthenticatedSession(request, page);

      // Navigate to dashboard
      await page.goto(`${BASE_URLS.frontend}/dashboard`);

      // Assert: Should be on dashboard
      expect(page.url()).toContain('/dashboard');

      // Act: Refresh page
      await page.reload({ waitUntil: 'networkidle' });

      // Assert: Should still be on dashboard (not redirected to login)
      expect(page.url(), 'Should remain on dashboard after refresh').toContain('/dashboard');

      // Verify token still in localStorage
      const storedToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(storedToken, 'Token should persist after refresh').toBe(token);

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'login-persisted');
    });
  });

  /**
   * Test Group 4: Authentication - Logout
   * Validates logout functionality
   */
  test.describe('Authentication - Logout', () => {
    test('should logout successfully and redirect to login', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      await setupAuthenticatedSession(request, page);
      await page.goto(`${BASE_URLS.frontend}/dashboard`);

      // Act: Click logout button
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Cerrar sesión")');
      await logoutButton.click();

      // Assert: Should redirect to login
      await page.waitForURL('**/login', {
        timeout: TIMEOUTS.medium,
      });

      // Verify token is cleared
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token, 'Token should be cleared after logout').toBeNull();

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'logout-success');
    });
  });

  /**
   * Test Group 5: Onboarding Wizard
   * Validates 5-step onboarding process
   */
  test.describe('Onboarding Wizard', () => {
    test('should complete full onboarding wizard', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      await setupAuthenticatedSession(request, page);

      // Navigate to onboarding
      await page.goto(`${BASE_URLS.frontend}/onboarding`);

      // Step 1: Organization Type
      await page.click('input[value="agency"]');
      await page.click('button:has-text("Next"), button:has-text("Siguiente")');
      await takeScreenshot(page, 'frontend', 'onboarding-step-1');

      // Step 2: Organization Details
      const orgName = `Test Agency ${generateUniqueId()}`;
      const slug = `test-agency-${generateUniqueId()}`;
      await page.fill('input[name="organizationName"]', orgName);
      await page.fill('input[name="slug"]', slug);
      await page.click('button:has-text("Next"), button:has-text("Siguiente")');
      await takeScreenshot(page, 'frontend', 'onboarding-step-2');

      // Step 3: Industry Selection
      await page.click('input[value="technology"]');
      await page.click('button:has-text("Next"), button:has-text("Siguiente")');
      await takeScreenshot(page, 'frontend', 'onboarding-step-3');

      // Step 4: Team Size
      await page.click('input[value="10-50"]');
      await page.click('button:has-text("Next"), button:has-text("Siguiente")');
      await takeScreenshot(page, 'frontend', 'onboarding-step-4');

      // Step 5: Goals/Objectives
      await page.click('input[value="website-builder"]');
      await page.click('button:has-text("Complete"), button:has-text("Completar")');
      await takeScreenshot(page, 'frontend', 'onboarding-step-5');

      // Assert: Should redirect to dashboard after completion
      await page.waitForURL('**/dashboard', {
        timeout: TIMEOUTS.medium,
      });

      expect(page.url(), 'Should redirect to dashboard after onboarding').toContain(
        '/dashboard'
      );

      // Capture final screenshot
      await takeScreenshot(page, 'frontend', 'onboarding-complete');
    });
  });

  /**
   * Test Group 6: Dashboard
   * Validates dashboard functionality and data display
   */
  test.describe('Dashboard', () => {
    test('should display dashboard with user information', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      const { user } = await setupAuthenticatedSession(request, page);

      // Act: Navigate to dashboard
      await page.goto(`${BASE_URLS.frontend}/dashboard`);

      // Assert: Dashboard should load and display user info
      const userGreeting = page.locator(`text=/welcome|bienvenido/i`);
      await expect(userGreeting, 'Dashboard should show welcome message').toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'dashboard-home');
    });

    test('should display projects list on dashboard', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      await setupAuthenticatedSession(request, page);

      // Act: Navigate to dashboard/projects
      await page.goto(`${BASE_URLS.frontend}/dashboard/projects`);

      // Assert: Projects section should be visible
      const projectsSection = page.locator('[data-testid="projects-list"], .projects-container');
      await expect(projectsSection, 'Projects section should be visible').toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'dashboard-projects');
    });

    test('should display team section on dashboard', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      await setupAuthenticatedSession(request, page);

      // Act: Navigate to team section
      await page.goto(`${BASE_URLS.frontend}/dashboard/team`);

      // Assert: Team section should be visible
      const teamSection = page.locator('[data-testid="team-members"], .team-container');
      await expect(teamSection, 'Team section should be visible').toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'dashboard-team');
    });

    test('should display settings section on dashboard', async ({ page, request }) => {
      // Arrange: Setup authenticated session
      await setupAuthenticatedSession(request, page);

      // Act: Navigate to settings
      await page.goto(`${BASE_URLS.frontend}/dashboard/settings`);

      // Assert: Settings section should be visible
      const settingsSection = page.locator('[data-testid="settings"], .settings-container');
      await expect(settingsSection, 'Settings section should be visible').toBeVisible({
        timeout: TIMEOUTS.medium,
      });

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'dashboard-settings');
    });
  });

  /**
   * Test Group 7: Protected Routes
   * Validates that protected routes require authentication
   */
  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      // Arrange: Ensure no token in localStorage
      await page.goto(BASE_URLS.frontend);
      await page.evaluate(() => localStorage.removeItem('token'));

      // Act: Try to access dashboard
      await page.goto(`${BASE_URLS.frontend}/dashboard`);

      // Assert: Should redirect to login
      await page.waitForURL('**/login', {
        timeout: TIMEOUTS.medium,
      });

      expect(page.url(), 'Should redirect to login for protected route').toContain('/login');

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'protected-route-redirect');
    });

    test('should allow access to protected route with valid token', async ({
      page,
      request,
    }) => {
      // Arrange: Setup authenticated session
      await setupAuthenticatedSession(request, page);

      // Act: Navigate to protected route
      await page.goto(`${BASE_URLS.frontend}/dashboard/projects`);

      // Assert: Should successfully access protected route
      expect(page.url(), 'Should access protected route with valid token').toContain(
        '/dashboard'
      );

      // Verify we're not redirected to login
      await page.waitForTimeout(2000); // Wait to ensure no redirect
      expect(page.url(), 'Should remain on protected route').not.toContain('/login');

      // Capture screenshot
      await takeScreenshot(page, 'frontend', 'protected-route-success');
    });
  });
});
