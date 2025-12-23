import { test, expect } from '@playwright/test';

test.describe('Test Suite 5: Debugging and Logs', () => {
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

  test('Test 5.1: Console Logs', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.locator('h2:has-text("La solución perfecta para tu negocio")').click();

    const expectedLog = '📋 Loading properties for:';
    const logFound = messages.some(msg => msg.includes(expectedLog));
    expect(logFound, `Expected console log "${expectedLog}" was not found.`).toBe(true);

    const fullLogMessage = messages.find(msg => msg.includes(expectedLog));
    expect(fullLogMessage).toContain('fontSize');
    expect(fullLogMessage).toContain('padding');
    expect(fullLogMessage).toContain('backgroundColor');
    expect(fullLogMessage).toContain('display');

    await page.screenshot({ path: 'screenshots/suite5-test1.png' });
  });

  test('Test 5.2: Verify getComputedStyle', async ({ page }) => {
    const h2 = page.locator('h2:has-text("La solución perfecta para tu negocio")');
    await h2.click();

    const fontSize = await h2.evaluate((element) => {
      return window.getComputedStyle(element).fontSize;
    });

    expect(fontSize).toBe('56px');
  });
});
