import { test, expect } from '@playwright/test';

test.describe('Test Suite 2: Drag & Drop Elements', () => {
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

  test('Test 2.1: Create Button', async ({ page }) => {
    await page.keyboard.press('Control+B');
    const buttonComponent = page.locator('#components-panel [data-component-type="button"]');
    const canvas = page.locator('#canvas-body');
    await buttonComponent.dragTo(canvas);

    await canvas.locator('button').click();
    await page.keyboard.press('Control+P');

    await expect(page.locator('#property-panel')).toBeVisible();

    const spacingSection = page.locator('#property-panel #spacing-section');
    await expect(spacingSection.locator('input[label="Padding"]')).toHaveValue('12px 24px');

    const backgroundSection = page.locator('#property-panel #background-section');
    await expect(backgroundSection.locator('input[label="Background Color"]')).not.toBeEmpty();

    const borderSection = page.locator('#property-panel #border-section');
    await expect(borderSection.locator('input[label="Border Radius"]')).toHaveValue('6px');

    const typographySection = page.locator('#property-panel #typography-section');
    await expect(typographySection.locator('input[label="Font Weight"]')).not.toBeEmpty();

    await page.screenshot({ path: 'screenshots/suite2-test1.png' });
  });

  test('Test 2.2: Create Card', async ({ page }) => {
    await page.keyboard.press('Control+B');
    const cardComponent = page.locator('#components-panel [data-component-type="card"]');
    const canvas = page.locator('#canvas-body');
    await cardComponent.dragTo(canvas);

    await canvas.locator('.card').click(); // Assuming card has a class 'card'
    await page.keyboard.press('Control+P');

    await expect(page.locator('#property-panel')).toBeVisible();

    const effectsSection = page.locator('#property-panel #effects-section');
    await expect(effectsSection.locator('select[label="Box Shadow"]')).not.toHaveValue('none');

    const borderSection = page.locator('#property-panel #border-section');
    await expect(borderSection.locator('input[label="Border Radius"]')).not.toBeEmpty();

    const backgroundSection = page.locator('#property-panel #background-section');
    await expect(backgroundSection.locator('input[label="Background Color"]')).not.toBeEmpty();

    const spacingSection = page.locator('#property-panel #spacing-section');
    await expect(spacingSection.locator('input[label="Padding"]')).not.toBeEmpty();

    await page.screenshot({ path: 'screenshots/suite2-test2.png' });
  });
});
