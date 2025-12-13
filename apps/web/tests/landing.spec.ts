import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should allow interaction with the iframe demo', async ({ page }) => {
    await page.goto('/');

    // Check that the iframe is visible
    const iframe = page.frameLocator('iframe[title="Editor DragNDrop Vanilla"]');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 10000 });

    // Test the preset buttons
    await page.click('button:has-text("Tablet")');
    const iframeContainer = page.locator('.iframe-container');
    await expect(iframeContainer).toHaveAttribute('style', /width: 768px/);

    await page.click('button:has-text("Mobile")');
    await expect(iframeContainer).toHaveAttribute('style', /width: 375px/);

    await page.click('button:has-text("Desktop")');
    await expect(iframeContainer).toHaveAttribute('style', /width: 100%/);
  });
});
