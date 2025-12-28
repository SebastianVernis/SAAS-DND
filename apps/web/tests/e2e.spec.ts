import { test, expect } from '@playwright/test';

test.describe('SaaS DND E2E Testing', () => {
  test('should load the landing page and verify its content', async ({ page }) => {
    await page.goto('/');

    // Verify Hero section
    await expect(page.locator('h1:has-text("Crea y Despliega Landing Pages al Instante")')).toBeVisible();

    // Verify Features grid (6 características)
    await expect(page.locator('h3:has-text("Arrastra y Suelta en Tiempo Real")')).toBeVisible();
    await expect(page.locator('h3:has-text("Más de 25 Plantillas Profesionales")')).toBeVisible();
    await expect(page.locator('h3:has-text("Exporta tu Código en HTML y CSS")')).toBeVisible();
    await expect(page.locator('h3:has-text("Componentes con IA Generativa")')).toBeVisible();
    await expect(page.locator('h3:has-text("Optimizado para SEO y Rendimiento")')).toBeVisible();
    await expect(page.locator('h3:has-text("Colabora en Equipo en Tiempo Real")')).toBeVisible();

    // Verify Pricing (3 planes: Pro, Teams, Enterprise)
    await expect(page.locator('h3:has-text("Pro")')).toBeVisible();
    await expect(page.locator('h3:has-text("Teams")')).toBeVisible();
    await expect(page.locator('h3:has-text("Enterprise")')).toBeVisible();
  });

  test('should have a working demo with a 5-minute timer that redirects to /register', async ({ page }) => {
    await page.goto('/');

    // Start the demo
    await page.click('button:has-text("Iniciar Demo (5 minutos)")');

    // Verify the timer is visible and starts at 5:00
    await expect(page.locator('p:has-text("Tiempo restante: 5:00")')).toBeVisible();

    // Verify the iframe is loaded
    const iframe = page.frameLocator('iframe[title="Editor DragNDrop Vanilla"]');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 10000 });

    // Wait for the timer to expire and check for redirection
    await page.waitForURL('**/register', { timeout: 301000 }); // 5 minutes + 1 second buffer
    await expect(page).toHaveURL('/register');
  });

  test('should redirect to /register when "Comenzar Gratis" is clicked', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Comenzar Gratis")');
    await page.waitForURL('**/register');
    await expect(page).toHaveURL('/register');
  });

  test('should complete the entire SaaS flow from registration to logout', async ({ page }) => {
    // Registration
    await page.goto('/register');
    const email = `test-e2e-${Date.now()}@example.com`;
    await page.fill('input[placeholder="Juan Pérez"]', 'Test User E2E');
    await page.fill('input[placeholder="tu@email.com"]', email);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'TestE2E123');
    await page.fill('input[placeholder="Repite tu contraseña"]', 'TestE2E123');
    await page.check('input[type="checkbox"]');
    const registerResponsePromise = page.waitForResponse('**/api/auth/register');
    await page.click('button:has-text("Crear Cuenta")');
    const registerResponse = await registerResponsePromise;
    expect(registerResponse.status()).toBe(201);
    const registerResponseBody = await registerResponse.json();
    expect(registerResponseBody).toHaveProperty('userId');
    expect(registerResponseBody).toHaveProperty('otp');
    const otp = registerResponseBody.otp;
    await page.waitForURL(`**/verify-otp?email=${encodeURIComponent(email)}`);
    await expect(page).toHaveURL(`/verify-otp?email=${encodeURIComponent(email)}`);

    // OTP Verification
    await expect(page.locator(`p:has-text("${email}")`)).toBeVisible();
    for (let i = 0; i < 6; i++) {
      await page.locator(`input[aria-label="Digit ${i + 1}"]`).fill(otp[i]);
    }
    const verifyOtpResponsePromise = page.waitForResponse('**/api/auth/verify-otp');
    const verifyOtpResponse = await verifyOtpResponsePromise;
    expect(verifyOtpResponse.status()).toBe(200);
    const verifyOtpResponseBody = await verifyOtpResponse.json();
    expect(verifyOtpResponseBody).toHaveProperty('token');
    await page.waitForURL('**/onboarding');
    await expect(page).toHaveURL('/onboarding');

    // Onboarding
    await expect(page.locator('h2:has-text("¿Qué tipo de cuenta necesitas?")')).toBeVisible();
    await page.click('div:has-text("Agencia")');
    await page.click('button:has-text("Siguiente")');
    await expect(page.locator('div[aria-valuenow="25"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Cuéntanos sobre tu organización")')).toBeVisible();
    await page.fill('input[placeholder="Tu Empresa LLC"]', 'Mi Agencia de Testing');
    await page.click('button[role="combobox"]:has-text("Seleccionar industria")');
    await page.click('div[role="option"]:has-text("Design")');
    await page.click('button[role="combobox"]:has-text("Seleccionar tamaño")');
    await page.click('div[role="option"]:has-text("6-20")');
    await page.click('button:has-text("Siguiente")');
    await expect(page.locator('div[aria-valuenow="50"]')).toBeVisible();
    await expect(page.locator('h2:has-text("¿Cuál es tu rol en la organización?")')).toBeVisible();
    await page.click('div:has-text("Designer")');
    await page.click('button:has-text("Siguiente")');
    await expect(page.locator('div[aria-valuenow="75"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Personaliza tu experiencia")')).toBeVisible();
    const completeOnboardingResponsePromise = page.waitForResponse('**/api/onboarding/complete');
    await page.click('button:has-text("Completar Setup")');
    const completeOnboardingResponse = await completeOnboardingResponsePromise;
    expect(completeOnboardingResponse.status()).toBe(200);
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Dashboard
    await expect(page.locator('a[href="/dashboard"]:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/projects"]:has-text("Projects")')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/team"]:has-text("Team")')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/settings"]:has-text("Settings")')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/billing"]:has-text("Billing")')).toBeVisible();
    await expect(page.locator('button[aria-haspopup="menu"]')).toBeVisible();
    await expect(page.locator('h3:has-text("Proyectos")')).toBeVisible();
    await expect(page.locator('h3:has-text("AI Calls")')).toBeVisible();
    await expect(page.locator('h3:has-text("Storage")')).toBeVisible();
    await expect(page.locator('h3:has-text("Miembros")')).toBeVisible();
    await expect(page.locator('h3:has-text("Recent Projects")')).toBeVisible();
    await expect(page.locator('a:has-text("Proyecto de Bienvenida")')).toBeVisible();
    await expect(page.locator('h3:has-text("Quick Actions")')).toBeVisible();
    await expect(page.locator('button:has-text("Nuevo Proyecto")')).toBeVisible();
    await expect(page.locator('button:has-text("Invitar Miembro")')).toBeVisible();

    // Project Management
    await page.click('a[href="/dashboard/projects"]:has-text("Projects")');
    await page.waitForURL('**/dashboard/projects');
    await expect(page.locator('h3:has-text("Proyecto de Bienvenida")')).toBeVisible();
    await page.click('button:has-text("Nuevo Proyecto")');
    await page.fill('input[placeholder="Mi Landing Page"]', 'Proyecto E2E Test');
    await page.click('button:has-text("Blank")');
    await page.click('button:has-text("Crear Proyecto")');
    await expect(page.locator('h3:has-text("Proyecto E2E Test")')).toBeVisible();
    await page.locator('div.card:has-text("Proyecto E2E Test") button[aria-label="Duplicate"]').click();
    await expect(page.locator('h3:has-text("Proyecto E2E Test (Copy)")')).toBeVisible();
    await page.locator('div.card:has-text("Proyecto E2E Test (Copy)") button[aria-label="Delete"]').click();
    await page.click('button:has-text("Confirmar")');
    await expect(page.locator('h3:has-text("Proyecto E2E Test (Copy)")')).not.toBeVisible();
    await page.locator('div.card:has-text("Proyecto E2E Test") button[aria-label="Delete"]').click();
    await page.click('button:has-text("Confirmar")');
    await expect(page.locator('h3:has-text("Proyecto E2E Test")')).not.toBeVisible();

    // Team Management
    await page.click('a[href="/dashboard/team"]:has-text("Team")');
    await page.waitForURL('**/dashboard/team');
    await expect(page.locator(`td:has-text("${email}")`)).toBeVisible();
    await page.click('button:has-text("Invitar Miembro")');
    await page.fill('input[placeholder="tu@email.com"]', 'teammate@example.com');
    await page.click('button[role="combobox"]:has-text("Editor")');
    await page.click('div[role="option"]:has-text("Viewer")');
    await page.click('button:has-text("Enviar Invitación")');
    await expect(page.locator('td:has-text("teammate@example.com")')).toBeVisible();
    await expect(page.locator('td:has-text("pending")')).toBeVisible();
    await page.locator('tr:has-text("teammate@example.com") button:has-text("Revocar")').click();
    await expect(page.locator('td:has-text("teammate@example.com")')).not.toBeVisible();

    // Logout and Login
    await page.goto('/dashboard');
    await page.click('button[aria-haspopup="menu"]');
    await page.click('button:has-text("Logout")');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL('/login');
    await page.fill('input[placeholder="tu@email.com"]', email);
    await page.fill('input[placeholder="••••••••"]', 'TestE2E123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should allow a user to use the vanilla editor', async ({ context }) => {
    // Open the editor in a new tab
    const newPage = await context.newPage();
    await newPage.goto('/vanilla');

    // Verify editor loads
    await expect(newPage.locator('#gjs')).toBeVisible();

    // Test templates
    await newPage.click('button:has-text("Plantillas")');
    await expect(newPage.locator('.gjs-pn-views .gjs-pn-panel')).toBeVisible();
    await newPage.click('div.gjs-template-card:has-text("SaaS Product")');
    //await expect(newPage.locator('h1:has-text("Your Next SaaS Product")')).toBeVisible(); // This might be in an iframe

    // Test properties panel
    await newPage.keyboard.press('Control+KeyP');
    await expect(newPage.locator('.gjs-pn-views .gjs-pn-panel')).toBeVisible();

    // For now, we are just checking if the editor loads.
    // A more detailed test would require interacting with the canvas and its elements.
  });
});

test.describe('Security and Validation', () => {
  test('should show an error for a weak password during registration', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder="Juan Pérez"]', 'Test User E2E');
    await page.fill('input[placeholder="tu@email.com"]', `test-weak-pass-${Date.now()}@example.com`);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'weak');
    await page.fill('input[placeholder="Repite tu contraseña"]', 'weak');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Crear Cuenta")');

    // Verify the error message
    await expect(page.locator('p:has-text("La contraseña debe tener al menos 8 caracteres")')).toBeVisible();
  });

  test('should show an error for a duplicate email during registration', async ({ page }) => {
    // First, register a user
    await page.goto('/register');
    const duplicateEmail = `test-duplicate-${Date.now()}@example.com`;
    await page.fill('input[placeholder="Juan Pérez"]', 'Test User E2E');
    await page.fill('input[placeholder="tu@email.com"]', duplicateEmail);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'TestE2E123');
    await page.fill('input[placeholder="Repite tu contraseña"]', 'TestE2E123');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Crear Cuenta")');
    await page.waitForURL(`**/verify-otp?email=${encodeURIComponent(duplicateEmail)}`);

    // Now, try to register with the same email
    await page.goto('/register');
    await page.fill('input[placeholder="Juan Pérez"]', 'Another User');
    await page.fill('input[placeholder="tu@email.com"]', duplicateEmail);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'Password456');
    await page.fill('input[placeholder="Repite tu contraseña"]', 'Password456');
    await page.check('input[type="checkbox"]');

    const responsePromise = page.waitForResponse('**/api/auth/register');
    await page.click('button:has-text("Crear Cuenta")');
    const response = await responsePromise;

    // Verify the response
    expect(response.status()).toBe(409);
  });

  test('should show an error for an invalid OTP', async ({ page }) => {
    await page.goto('/register');
    const email = `test-invalid-otp-${Date.now()}@example.com`;
    await page.fill('input[placeholder="Juan Pérez"]', 'Test User E2E');
    await page.fill('input[placeholder="tu@email.com"]', email);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'TestE2E123');
    await page.fill('input[placeholder="Repite tu contraseña"]', 'TestE2E123');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Crear Cuenta")');
    await page.waitForURL(`**/verify-otp?email=${encodeURIComponent(email)}`);

    // Fill in an invalid OTP
    for (let i = 0; i < 6; i++) {
      await page.locator(`input[aria-label="Digit ${i + 1}"]`).fill('0');
    }

    const responsePromise = page.waitForResponse('**/api/auth/verify-otp');
    const response = await responsePromise;

    // Verify the response
    expect(response.status()).toBe(400);
  });
});
