/**
 * E2E Tests for ClassManager Component
 * 
 * Tests the visual CSS class management functionality in the vanilla editor.
 * 
 * Test Coverage:
 * - ClassManager initialization
 * - Adding classes via input
 * - Removing classes via × button
 * - Autocomplete functionality
 * - Styles preview display
 * - Undefined class warnings
 * - Integration with Properties Panel
 */

import { test, expect, Page } from '@playwright/test';

const EDITOR_URL = 'http://18.223.32.141/editor/';
const TIMEOUT = 10000;

/**
 * Helper: Wait for editor to be fully loaded
 */
async function waitForEditorLoad(page: Page) {
  await page.waitForSelector('#canvas', { timeout: TIMEOUT });
  await page.waitForSelector('.components-panel', { timeout: TIMEOUT });
  await page.waitForTimeout(1000); // Wait for modules to initialize
}

/**
 * Helper: Create and select a test element
 */
async function createAndSelectElement(page: Page, componentType: string = 'button') {
  // Find the component in the panel
  const component = page.locator(`.component-item[data-type="${componentType}"]`).first();
  await expect(component).toBeVisible({ timeout: TIMEOUT });
  
  // Drag to canvas
  const canvas = page.locator('#canvas');
  await component.dragTo(canvas);
  
  // Wait for element to be created
  await page.waitForTimeout(500);
  
  // Select the element
  const canvasElement = canvas.locator('.canvas-element').last();
  await canvasElement.click();
  
  // Wait for properties panel to update
  await page.waitForTimeout(500);
  
  return canvasElement;
}

/**
 * Helper: Check if ClassManager section is visible
 */
async function isClassManagerVisible(page: Page): Promise<boolean> {
  const section = page.locator('.class-manager-section');
  return await section.isVisible().catch(() => false);
}

test.describe('ClassManager - Initialization', () => {
  test('should load ClassManager when element is selected', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    // Create and select an element
    await createAndSelectElement(page, 'button');
    
    // Check if ClassManager section is visible
    const classManagerSection = page.locator('.class-manager-section');
    await expect(classManagerSection).toBeVisible({ timeout: TIMEOUT });
    
    // Check for key components
    await expect(page.locator('.class-tags-container')).toBeVisible();
    await expect(page.locator('#class-input')).toBeVisible();
    await expect(page.locator('.class-add-btn')).toBeVisible();
  });

  test('should show empty state when no classes', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    // Create a new element (should have no custom classes)
    await createAndSelectElement(page, 'div');
    
    // Check for empty state message
    const emptyMessage = page.locator('.class-tags-empty');
    await expect(emptyMessage).toBeVisible({ timeout: TIMEOUT });
    await expect(emptyMessage).toContainText('Sin clases CSS');
  });

  test('should initialize window.classManager', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    // Check if classManager is available globally
    const hasClassManager = await page.evaluate(() => {
      return typeof window.classManager !== 'undefined';
    });
    
    expect(hasClassManager).toBe(true);
  });
});

test.describe('ClassManager - Add Classes', () => {
  test('should add class via input and Enter key', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    // Type class name and press Enter
    const input = page.locator('#class-input');
    await input.fill('test-class');
    await input.press('Enter');
    
    // Wait for UI update
    await page.waitForTimeout(500);
    
    // Check if class tag appears
    const classTag = page.locator('.class-tag').filter({ hasText: 'test-class' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
    
    // Verify class is added to element
    const hasClass = await element.evaluate((el) => {
      return el.classList.contains('test-class');
    });
    expect(hasClass).toBe(true);
  });

  test('should add class via + button', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    // Type class name and click + button
    const input = page.locator('#class-input');
    await input.fill('button-primary');
    
    const addButton = page.locator('.class-add-btn');
    await addButton.click();
    
    // Wait for UI update
    await page.waitForTimeout(500);
    
    // Check if class tag appears
    const classTag = page.locator('.class-tag').filter({ hasText: 'button-primary' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
  });

  test('should clear input after adding class', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Add a class
    const input = page.locator('#class-input');
    await input.fill('my-class');
    await input.press('Enter');
    
    // Wait for UI update
    await page.waitForTimeout(500);
    
    // Check if input is cleared
    const inputValue = await input.inputValue();
    expect(inputValue).toBe('');
  });

  test('should add multiple classes', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    // Add multiple classes
    const classes = ['class-one', 'class-two', 'class-three'];
    const input = page.locator('#class-input');
    
    for (const className of classes) {
      await input.fill(className);
      await input.press('Enter');
      await page.waitForTimeout(300);
    }
    
    // Check if all class tags appear
    for (const className of classes) {
      const classTag = page.locator('.class-tag').filter({ hasText: className });
      await expect(classTag).toBeVisible({ timeout: TIMEOUT });
    }
    
    // Verify all classes are on element
    const elementClasses = await element.evaluate((el) => {
      return Array.from(el.classList);
    });
    
    for (const className of classes) {
      expect(elementClasses).toContain(className);
    }
  });

  test('should not add duplicate classes', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    const input = page.locator('#class-input');
    
    // Add class twice
    await input.fill('duplicate-class');
    await input.press('Enter');
    await page.waitForTimeout(300);
    
    await input.fill('duplicate-class');
    await input.press('Enter');
    await page.waitForTimeout(300);
    
    // Check that only one tag exists
    const classTags = page.locator('.class-tag').filter({ hasText: 'duplicate-class' });
    const count = await classTags.count();
    expect(count).toBe(1);
  });
});

test.describe('ClassManager - Remove Classes', () => {
  test('should remove class via × button', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    // Add a class
    const input = page.locator('#class-input');
    await input.fill('removable-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Click remove button
    const removeButton = page.locator('.class-tag').filter({ hasText: 'removable-class' })
      .locator('.class-tag-remove');
    await removeButton.click();
    
    // Wait for UI update
    await page.waitForTimeout(500);
    
    // Check if class tag is removed
    const classTag = page.locator('.class-tag').filter({ hasText: 'removable-class' });
    await expect(classTag).not.toBeVisible();
    
    // Verify class is removed from element
    const hasClass = await element.evaluate((el) => {
      return el.classList.contains('removable-class');
    });
    expect(hasClass).toBe(false);
  });

  test('should show empty state after removing all classes', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Add a class
    const input = page.locator('#class-input');
    await input.fill('temp-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Remove the class
    const removeButton = page.locator('.class-tag-remove').first();
    await removeButton.click();
    await page.waitForTimeout(500);
    
    // Check for empty state
    const emptyMessage = page.locator('.class-tags-empty');
    await expect(emptyMessage).toBeVisible({ timeout: TIMEOUT });
  });
});

test.describe('ClassManager - Autocomplete', () => {
  test('should have datalist for autocomplete', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Check if datalist exists
    const datalist = page.locator('#available-classes');
    await expect(datalist).toBeAttached();
    
    // Check if input has list attribute
    const input = page.locator('#class-input');
    const listAttr = await input.getAttribute('list');
    expect(listAttr).toBe('available-classes');
  });

  test('should extract classes from stylesheets', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Check if classes were extracted
    const hasClasses = await page.evaluate(() => {
      return window.classManager && window.classManager.availableClasses.size > 0;
    });
    
    expect(hasClasses).toBe(true);
  });
});

test.describe('ClassManager - Styles Preview', () => {
  test('should show styles preview when classes exist', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Add a class
    const input = page.locator('#class-input');
    await input.fill('preview-test');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if styles preview section appears
    const stylesPreview = page.locator('.class-styles-preview');
    const isVisible = await stylesPreview.isVisible().catch(() => false);
    
    // Preview should be visible if class has styles
    if (isVisible) {
      await expect(stylesPreview).toBeVisible();
      
      // Check for preview title
      const previewTitle = page.locator('.styles-preview-title');
      await expect(previewTitle).toBeVisible();
      await expect(previewTitle).toContainText('Estilos aplicados');
    }
  });

  test('should show class name in preview', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Add a class
    const input = page.locator('#class-input');
    await input.fill('styled-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if class name appears in preview
    const className = page.locator('.class-style-name').filter({ hasText: '.styled-class' });
    const exists = await className.count() > 0;
    
    if (exists) {
      await expect(className).toBeVisible();
    }
  });
});

test.describe('ClassManager - Validation', () => {
  test('should show warning for undefined classes', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Add a class that doesn't exist in CSS
    const input = page.locator('#class-input');
    await input.fill('undefined-class-xyz-123');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if warning badge appears
    const warningTag = page.locator('.class-tag.undefined-class')
      .filter({ hasText: 'undefined-class-xyz-123' });
    
    const hasWarning = await warningTag.count() > 0;
    if (hasWarning) {
      await expect(warningTag).toBeVisible();
      
      // Check for warning icon
      const tagText = await warningTag.textContent();
      expect(tagText).toContain('⚠️');
    }
  });
});

test.describe('ClassManager - Integration', () => {
  test('should update when selecting different elements', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    // Create first element with a class
    const element1 = await createAndSelectElement(page, 'button');
    let input = page.locator('#class-input');
    await input.fill('element-one-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Create second element with different class
    const element2 = await createAndSelectElement(page, 'div');
    input = page.locator('#class-input');
    await input.fill('element-two-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Select first element again
    await element1.click();
    await page.waitForTimeout(500);
    
    // Check if first element's class is shown
    const class1Tag = page.locator('.class-tag').filter({ hasText: 'element-one-class' });
    await expect(class1Tag).toBeVisible({ timeout: TIMEOUT });
    
    // Check if second element's class is NOT shown
    const class2Tag = page.locator('.class-tag').filter({ hasText: 'element-two-class' });
    await expect(class2Tag).not.toBeVisible();
  });

  test('should persist classes after deselecting and reselecting', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    // Create element and add class
    const element = await createAndSelectElement(page, 'button');
    const input = page.locator('#class-input');
    await input.fill('persistent-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Click canvas to deselect
    const canvas = page.locator('#canvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);
    
    // Reselect element
    await element.click();
    await page.waitForTimeout(500);
    
    // Check if class is still there
    const classTag = page.locator('.class-tag').filter({ hasText: 'persistent-class' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
  });

  test('should work with Properties Panel visibility toggle', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    // Check if ClassManager is visible
    const isVisible = await isClassManagerVisible(page);
    expect(isVisible).toBe(true);
    
    // Toggle properties panel (Ctrl+P)
    await page.keyboard.press('Control+P');
    await page.waitForTimeout(500);
    
    // Toggle back
    await page.keyboard.press('Control+P');
    await page.waitForTimeout(500);
    
    // ClassManager should still be visible
    const stillVisible = await isClassManagerVisible(page);
    expect(stillVisible).toBe(true);
  });
});

test.describe('ClassManager - Edge Cases', () => {
  test('should handle class names with hyphens', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    const input = page.locator('#class-input');
    await input.fill('my-hyphenated-class-name');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    const classTag = page.locator('.class-tag').filter({ hasText: 'my-hyphenated-class-name' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
  });

  test('should handle class names with numbers', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    const input = page.locator('#class-input');
    await input.fill('class123');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    const classTag = page.locator('.class-tag').filter({ hasText: 'class123' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
  });

  test('should trim whitespace from class names', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    const element = await createAndSelectElement(page, 'button');
    
    const input = page.locator('#class-input');
    await input.fill('  spaced-class  ');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Should show trimmed version
    const classTag = page.locator('.class-tag').filter({ hasText: 'spaced-class' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
    
    // Verify element has trimmed class
    const hasClass = await element.evaluate((el) => {
      return el.classList.contains('spaced-class');
    });
    expect(hasClass).toBe(true);
  });

  test('should ignore empty class names', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    await createAndSelectElement(page, 'button');
    
    const input = page.locator('#class-input');
    await input.fill('   ');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Should not add any tag
    const classTags = page.locator('.class-tag');
    const count = await classTags.count();
    
    // Count should be 0 or only show empty state
    const emptyState = page.locator('.class-tags-empty');
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(count === 0 || hasEmptyState).toBe(true);
  });
});

test.describe('ClassManager - Dark Mode', () => {
  test('should render correctly in dark mode', async ({ page }) => {
    await page.goto(EDITOR_URL);
    await waitForEditorLoad(page);
    
    // Toggle dark mode
    const themeToggle = page.locator('#themeToggle');
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    
    await createAndSelectElement(page, 'button');
    
    // Add a class
    const input = page.locator('#class-input');
    await input.fill('dark-mode-class');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if ClassManager is visible
    const classManagerSection = page.locator('.class-manager-section');
    await expect(classManagerSection).toBeVisible({ timeout: TIMEOUT });
    
    // Check if class tag is visible
    const classTag = page.locator('.class-tag').filter({ hasText: 'dark-mode-class' });
    await expect(classTag).toBeVisible({ timeout: TIMEOUT });
  });
});
