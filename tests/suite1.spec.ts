import { test, expect } from '@playwright/test';

test.describe('Test Suite 1: Preloaded Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://18.223.32.141/vanilla');
    await page.waitForLoadState('networkidle');
    // Close the legal modal if it appears
    const checkbox = page.locator('#accept-terms-checkbox');
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.click('#accept-btn');
    }
    const newProjectButton = page.locator('button:has-text("📄 Nuevo Proyecto Blanco")');
    if (await newProjectButton.isVisible()) {
      await newProjectButton.click();
    }
  });

  test('Test 1.1: SaaS Product Template', async ({ page }) => {
    await page.click('text=📁 Archivo');
    await page.click('text=Plantillas');
    await page.click('text=Landing Page SaaS');
    await page.waitForSelector('#canvas h2', { timeout: 60000 });
    await page.click('h2:has-text("La solución perfecta para tu negocio")');
    await page.evaluate(() => window.panelToggle.toggleRightPanel());
    await expect(page.locator('#property-panel')).toBeVisible();

    const typographySection = page.locator('#property-panel #typography-section');
    await expect(typographySection.locator('input[label="Font Size"]')).toHaveValue('56px');
    await expect(typographySection.locator('input[label="Font Weight"]')).toHaveValue('700');
    // Color check is visual

    const spacingSection = page.locator('#property-panel #spacing-section');
    await expect(spacingSection.locator('input[label="Margin"]')).toHaveValue('0px 0px 20px');

    const positioningSection = page.locator('#property-panel #positioning-section');
    await expect(positioningSection.locator('select[label="Display"]')).toHaveValue('block');

    await page.screenshot({ path: 'screenshots/suite1-test1.png' });
  });

  test('Test 1.2: Portfolio Template', async ({ page }) => {
    await page.click('text=📁 Archivo');
    await page.click('text=Plantillas');
    await page.click('text=Portafolio Profesional');
    await page.waitForSelector('nav', { timeout: 60000 });
    await page.click('nav');
    await page.evaluate(() => window.panelToggle.toggleRightPanel());

    const backgroundSection = page.locator('#property-panel #background-section');
    await expect(backgroundSection.locator('input[label="Background Color"]')).toHaveValue('#ffffff');

    const spacingSection = page.locator('#property-panel #spacing-section');
    await expect(spacingSection.locator('input[label="Padding"]')).toHaveValue('20px 40px');

    const positioningSection = page.locator('#property-panel #positioning-section');
    await expect(positioningSection.locator('select[label="Display"]')).toHaveValue('flex');

    await expect(page.locator('#property-panel #flexbox-section')).toBeVisible();
    const flexboxSection = page.locator('#property-panel #flexbox-section');
    await expect(flexboxSection.locator('select[label="Justify Content"]')).toHaveValue('space-between');
    await expect(flexboxSection.locator('select[label="Align Items"]')).toHaveValue('center');

    await page.screenshot({ path: 'screenshots/suite1-test2.png' });
  });

  test('Test 1.3: Elements with Flexbox', async ({ page }) => {
    // Assuming portfolio template is loaded, as it has a flex nav
    await page.click('text=📁 Archivo');
    await page.click('text=Plantillas');
    await page.click('text=Portafolio Profesional');
    await page.waitForSelector('nav', { timeout: 60000 });
    await page.click('nav');
    await page.evaluate(() => window.panelToggle.toggleRightPanel());

    await expect(page.locator('#property-panel #flexbox-section')).toBeVisible();

    await page.screenshot({ path: 'screenshots/suite1-test3.png' });
  });

  test('Test 1.4: Elements with Grid', async ({ page }) => {
    // Need a template with a grid
    // For now, let's assume one exists and this test will fail if not.
    // This highlights the need for a specific grid template if not present.
    await page.click('text=📁 Archivo');
    await page.click('text=Plantillas');
    // Replace with actual template name
    await page.click('text=Features Section');
    await page.waitForSelector('.grid-container', { timeout: 60000 }); // replace with actual selector
    await page.click('.grid-container');
    await page.evaluate(() => window.panelToggle.toggleRightPanel());

    await expect(page.locator('#property-panel #grid-section')).toBeVisible();

    const gridSection = page.locator('#property-panel #grid-section');
    await expect(gridSection.locator('input[label="Grid Template Columns"]')).toHaveValue('repeat(3, 1fr)');
    await expect(gridSection.locator('input[label="Grid Gap"]')).not.toBeEmpty();

    await page.screenshot({ path: 'screenshots/suite1-test4.png' });
  });
});
