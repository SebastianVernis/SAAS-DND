import { test, expect } from '@playwright/test';

test.describe('Test Suite 4: Edge Cases', () => {
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

  test('Test 4.1: Element with No Styles', async ({ page }) => {
    // Inject a basic div into the canvas for testing
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.id = 'test-div';
      document.querySelector('#canvas-body')?.appendChild(div);
    });

    const testDiv = page.locator('#test-div');
    await testDiv.click();
    await page.evaluate(() => window.panelToggle.toggleRightPanel());

    await expect(page.locator('#property-panel')).toBeVisible();

    const positioningSection = page.locator('#property-panel #positioning-section');
    await expect(positioningSection.locator('select[label="Display"]')).toHaveValue('block');

    await page.screenshot({ path: 'screenshots/suite4-test1.png' });
  });

  test('Test 4.2: Multiple Consecutive Selections', async ({ page }) => {
    // Load a template for element variety
    await page.click('text=📁 Archivo');
    await page.click('text=Plantillas');
    await page.click('text=Landing Page SaaS');
    await page.waitForSelector('#canvas h2', { timeout: 60000 });

    const h2 = page.locator('h2:has-text("La solución perfecta para tu negocio")');
    const p = page.locator('p').first();

    // Select A -> Panel loads properties A
    await h2.click();
    await page.evaluate(() => window.panelToggle.toggleRightPanel());
    const h2FontSize = await page.locator('#property-panel #typography-section input[label="Font Size"]').inputValue();
    expect(h2FontSize).toBe('56px');

    // Select B -> Panel loads properties B
    await p.click();
    const pFontSize = await page.locator('#property-panel #typography-section input[label="Font Size"]').inputValue();
    expect(pFontSize).not.toBe('56px'); // Assuming p has different font size

    // Select A again
    await h2.click();
    const newH2FontSize = await page.locator('#property-panel #typography-section input[label="Font Size"]').inputValue();
    expect(newH2FontSize).toBe('56px');

    await page.screenshot({ path: 'screenshots/suite4-test2.png' });
  });

  test('Test 4.3: Element with Complex Styles', async ({ page }) => {
    // Inject a div with complex styles
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.id = 'complex-div';
      div.style.background = 'linear-gradient(to right, red, blue)';
      div.style.boxShadow = '5px 5px 15px 5px rgba(0,0,0,0.3)';
      div.style.transform = 'rotate(10deg)';
      document.querySelector('#canvas-body')?.appendChild(div);
    });

    const complexDiv = page.locator('#complex-div');
    await complexDiv.click();
    await page.evaluate(() => window.panelToggle.toggleRightPanel());

    await expect(page.locator('#property-panel')).toBeVisible();

    const backgroundSection = page.locator('#property-panel #background-section');
    await expect(backgroundSection.locator('input[label="Background Color"]')).not.toBeEmpty();

    const effectsSection = page.locator('#property-panel #effects-section');
    await expect(effectsSection.locator('select[label="Box Shadow"]')).not.toHaveValue('none');

    await page.screenshot({ path: 'screenshots/suite4-test3.png' });
  });
});
