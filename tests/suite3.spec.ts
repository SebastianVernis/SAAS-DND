import { test, expect } from '@playwright/test';

test.describe('Test Suite 3: Property Editing', () => {
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
    // Load a template to have elements to work with
    await page.click('text=📁 Archivo');
    await page.click('text=Plantillas');
    await page.click('text=Landing Page SaaS');
    await page.waitForSelector('#canvas h2', { timeout: 60000 });
  });

  test('Test 3.1: Change Font Size', async ({ page }) => {
    const h2 = page.locator('h2:has-text("La solución perfecta para tu negocio")');
    await h2.click();
    await page.keyboard.press('Control+P');

    const fontSizeInput = page.locator('#property-panel #typography-section input[label="Font Size"]');
    await fontSizeInput.fill('64px');

    // Deselect and reselect
    await page.locator('body').click();
    await h2.click();
    await page.keyboard.press('Control+P');

    await expect(fontSizeInput).toHaveValue('64px');
    await expect(h2).toHaveCSS('font-size', '64px');

    await page.screenshot({ path: 'screenshots/suite3-test1.png' });
  });

  test('Test 3.2: Change Display to Flex', async ({ page }) => {
    const div = page.locator('div').first(); // Select a generic div
    await div.click();
    await page.keyboard.press('Control+P');

    const displaySelect = page.locator('#property-panel #positioning-section select[label="Display"]');
    await displaySelect.selectOption('flex');

    await expect(page.locator('#property-panel #flexbox-section')).toBeVisible();
    await expect(div).toHaveCSS('display', 'flex');

    await page.screenshot({ path: 'screenshots/suite3-test2.png' });
  });

  test('Test 3.3: Change Colors', async ({ page }) => {
    // Assuming there's a button in the SaaS template
    const button = page.locator('button').first();
    await button.click();
    await page.keyboard.press('Control+P');

    const bgColorInput = page.locator('#property-panel #background-section input[label="Background Color"]');
    await bgColorInput.fill('#ff0000');

    const textColorInput = page.locator('#property-panel #typography-section input[label="Color"]');
    await textColorInput.fill('#00ff00');

    await expect(button).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    await expect(button).toHaveCSS('color', 'rgb(0, 255, 0)');

    await page.screenshot({ path: 'screenshots/suite3-test3.png' });
  });

  test('Test 3.4: Adjust Spacing', async ({ page }) => {
    const section = page.locator('section').first();
    await section.click();
    await page.keyboard.press('Control+P');

    const paddingTopInput = page.locator('#property-panel #spacing-section input[label="Padding Top"]');
    await paddingTopInput.fill('120px');

    const marginBottomInput = page.locator('#property-panel #spacing-section input[label="Margin Bottom"]');
    await marginBottomInput.fill('40px');

    await expect(section).toHaveCSS('padding-top', '120px');
    await expect(section).toHaveCSS('margin-bottom', '40px');

    await page.screenshot({ path: 'screenshots/suite3-test4.png' });
  });
});
