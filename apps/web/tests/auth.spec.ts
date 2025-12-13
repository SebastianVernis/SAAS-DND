import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow a user to register and verify their account', async ({ page }) => {
    // Mock the API response for registration
    await page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Registration successful' }),
      });
    });

    await page.goto('/register');

    await page.fill('input[placeholder="Juan Pérez"]', 'Test User');
    await page.fill('input[placeholder="tu@email.com"]', `test-${Date.now()}@example.com`);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'Password123');
    await page.fill('input[placeholder="Repite tu contraseña"]', 'Password123');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Crear Cuenta")');

    await page.waitForURL('**/verify-otp?email=**');

    await expect(page.locator('h2:has-text("Revisa tu Email")')).toBeVisible();
  });

  test('should allow a user to log in', async ({ page }) => {
    // Mock the API response for login
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Error al iniciar sesión' }),
      });
    });

    await page.goto('/login');

    await page.fill('input[placeholder="tu@email.com"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', 'Password123');
    await page.click('button:has-text("Iniciar Sesión")');

    await expect(page.locator('p:has-text("Error al iniciar sesión")')).toBeVisible();
  });
});
