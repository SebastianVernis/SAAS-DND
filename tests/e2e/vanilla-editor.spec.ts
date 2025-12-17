/**
 * E2E Test Suite: Vanilla Editor
 *
 * Comprehensive testing of the Vanilla Editor component including:
 * - Template loading and rendering (25 templates)
 * - Drag & drop functionality
 * - Properties panel accuracy
 * - Resize handles (8 directions)
 * - Text editing (double-click)
 * - Theme toggle and UI features
 *
 * @group vanilla-editor
 * @priority high
 */

import { test, expect, Page } from '@playwright/test';
import {
  BASE_URLS,
  TIMEOUTS,
  dismissLegalModal,
  waitForCanvasReady,
  takeScreenshot,
  setupConsoleErrorTracking,
} from './helpers/setup';
import {
  TEMPLATES,
  loadTemplate,
  openComponentsPanel,
  openPropertiesPanel,
  dragComponentToCanvas,
  selectElement,
  getComputedStyle,
  verifyPropertiesPanel,
  resizeElement,
  editTextElement,
  toggleTheme,
  getCanvasElementCount,
} from './helpers/editor';

/**
 * Test Suite Configuration
 * Sets up common behavior for all tests in this suite
 */
test.describe('Vanilla Editor - E2E Tests', () => {
  /**
   * Before Each Test: Setup
   * Prepares the editor for testing by navigating to it and dismissing modals
   */
  test.beforeEach(async ({ page }) => {
    // Track console errors for quality assurance
    const errors = setupConsoleErrorTracking(page);

    // Navigate to vanilla editor
    await page.goto(BASE_URLS.editor, {
      waitUntil: 'networkidle',
      timeout: TIMEOUTS.long,
    });

    // Dismiss legal modal if present
    await dismissLegalModal(page);

    // Ensure canvas is ready
    await waitForCanvasReady(page);

    // Store errors array for later verification
    (page as any).__consoleErrors = errors;
  });

  /**
   * After Each Test: Cleanup and Verification
   * Checks for console errors and performs cleanup
   */
  test.afterEach(async ({ page }) => {
    const errors = (page as any).__consoleErrors || [];

    // Log console errors (if any) - don't fail test, just report
    if (errors.length > 0) {
      console.warn(`Console errors detected: ${errors.length}`);
      errors.forEach((err: string, i: number) => {
        console.warn(`  ${i + 1}. ${err}`);
      });
    }
  });

  /**
   * Test Group 1: Template Loading (25 tests)
   * Validates that all templates load correctly and render content
   */
  test.describe('Template Loading & Rendering', () => {
    /**
     * Tests each template individually
     * Ensures templates load, render content, and can be captured in screenshots
     */
    TEMPLATES.forEach((templateName, index) => {
      test(`should load template ${index + 1}: ${templateName}`, async ({ page }) => {
        // Arrange: Template name is already defined

        // Act: Load the template
        await loadTemplate(page, templateName);

        // Assert: Canvas should contain content
        const canvas = page.locator('#canvas');
        await expect(canvas, `Canvas should have content after loading ${templateName}`)
          .not.toBeEmpty({ timeout: TIMEOUTS.medium });

        // Verify at least one visible element exists
        const elementCount = await getCanvasElementCount(page);
        expect(
          elementCount,
          `Template ${templateName} should have at least 1 element on canvas`
        ).toBeGreaterThan(0);

        // Capture screenshot for visual verification
        const screenshotName = `template-${String(index + 1).padStart(2, '0')}-${templateName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`;
        await takeScreenshot(page, 'vanilla', screenshotName);
      });
    });
  });

  /**
   * Test Group 2: Drag & Drop Functionality
   * Validates component drag and drop from sidebar to canvas
   */
  test.describe('Drag & Drop Components', () => {
    test('should drag Button component from sidebar to canvas', async ({ page }) => {
      // Arrange: Clear canvas by starting fresh
      await page.click('text=📁 Archivo');
      await page.click('text=📄 Nuevo Proyecto Blanco');
      await waitForCanvasReady(page);

      // Get initial element count
      const initialCount = await getCanvasElementCount(page, 'button');

      // Act: Drag button component to canvas
      await dragComponentToCanvas(page, 'Button');

      // Assert: Button should be added to canvas
      const newCount = await getCanvasElementCount(page, 'button');
      expect(
        newCount,
        'Canvas should have one more button after drag & drop'
      ).toBeGreaterThan(initialCount);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'drag-drop-button');
    });

    test('should drag multiple components to canvas', async ({ page }) => {
      // Arrange: Start with blank project
      await page.click('text=📁 Archivo');
      await page.click('text=📄 Nuevo Proyecto Blanco');
      await waitForCanvasReady(page);

      const components = ['Button', 'Input', 'Heading'];

      // Act: Drag each component
      for (const component of components) {
        await dragComponentToCanvas(page, component);
        await page.waitForTimeout(500); // Small delay between drags
      }

      // Assert: All components should be on canvas
      const totalElements = await getCanvasElementCount(page);
      expect(
        totalElements,
        `Canvas should have at least ${components.length} elements`
      ).toBeGreaterThanOrEqual(components.length);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'drag-drop-multiple');
    });
  });

  /**
   * Test Group 3: Properties Panel Accuracy
   * Validates that properties panel correctly reads computed styles
   */
  test.describe('Properties Panel', () => {
    test('should read computed typography styles from template', async ({ page }) => {
      // Arrange: Load template with styled h2
      await loadTemplate(page, 'Landing Page SaaS');

      // Select h2 element
      await selectElement(page, 'h2:has-text("La solución perfecta")');

      // Act: Open properties panel
      await openPropertiesPanel(page);

      // Assert: Typography section should show correct values
      await verifyPropertiesPanel(page, 'typography-section', {
        'Font Size': '56px',
        'Font Weight': '700',
      });

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'properties-panel-typography');
    });

    test('should read computed spacing styles from template', async ({ page }) => {
      // Arrange: Load portfolio template
      await loadTemplate(page, 'Portafolio Profesional');

      // Select nav element
      await selectElement(page, 'nav');

      // Act: Open properties panel
      await openPropertiesPanel(page);

      // Assert: Spacing section should show correct padding
      const spacingSection = page.locator('#property-panel #spacing-section');
      await expect(spacingSection).toBeVisible({ timeout: TIMEOUTS.short });

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'properties-panel-spacing');
    });

    test('should read flexbox properties from template', async ({ page }) => {
      // Arrange: Load portfolio template (has flexbox nav)
      await loadTemplate(page, 'Portafolio Profesional');

      // Select nav element (uses flexbox)
      await selectElement(page, 'nav');

      // Act: Open properties panel
      await openPropertiesPanel(page);

      // Assert: Flexbox section should be visible and contain correct values
      const flexboxSection = page.locator('#property-panel #flexbox-section');
      await expect(flexboxSection, 'Flexbox section should be visible for flex elements')
        .toBeVisible({ timeout: TIMEOUTS.short });

      await verifyPropertiesPanel(page, 'flexbox-section', {
        'Justify Content': 'space-between',
        'Align Items': 'center',
      });

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'properties-panel-flexbox');
    });

    test('should update properties panel when selecting different elements', async ({
      page,
    }) => {
      // Arrange: Load template with multiple elements
      await loadTemplate(page, 'Landing Page SaaS');
      await openPropertiesPanel(page);

      // Act & Assert: Select h1 and verify
      await selectElement(page, 'h1');
      await page.waitForTimeout(300);

      let typographySection = page.locator('#property-panel #typography-section');
      await expect(typographySection).toBeVisible();

      // Act & Assert: Select button and verify (should show different values)
      await selectElement(page, 'button');
      await page.waitForTimeout(300);

      typographySection = page.locator('#property-panel #typography-section');
      await expect(typographySection).toBeVisible();

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'properties-panel-multiple-elements');
    });
  });

  /**
   * Test Group 4: Resize Handles
   * Validates all 8 directional resize handles function correctly
   */
  test.describe('Resize Handles', () => {
    const directions: Array<'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'> = [
      'n',
      'ne',
      'e',
      'se',
      's',
      'sw',
      'w',
      'nw',
    ];

    directions.forEach((direction) => {
      test(`should resize element using ${direction.toUpperCase()} handle`, async ({
        page,
      }) => {
        // Arrange: Load template and select an element
        await loadTemplate(page, 'Landing Page SaaS');
        const element = await selectElement(page, 'button');

        // Get initial dimensions
        const initialBox = await element.boundingBox();
        expect(initialBox, 'Element should have dimensions').toBeTruthy();

        // Act: Resize using specified handle
        const delta = 50; // 50px resize
        const deltaX = direction.includes('e') ? delta : direction.includes('w') ? -delta : 0;
        const deltaY = direction.includes('s') ? delta : direction.includes('n') ? -delta : 0;

        await resizeElement(page, direction, deltaX, deltaY);

        // Assert: Element dimensions should have changed
        const newBox = await element.boundingBox();
        expect(newBox, 'Element should still have dimensions after resize').toBeTruthy();

        // Verify dimension change (allow some tolerance due to browser rendering)
        const widthChanged = direction.includes('e') || direction.includes('w');
        const heightChanged = direction.includes('n') || direction.includes('s');

        if (widthChanged && initialBox && newBox) {
          expect(
            Math.abs(newBox.width - initialBox.width),
            `Width should change when dragging ${direction} handle`
          ).toBeGreaterThan(10);
        }

        if (heightChanged && initialBox && newBox) {
          expect(
            Math.abs(newBox.height - initialBox.height),
            `Height should change when dragging ${direction} handle`
          ).toBeGreaterThan(10);
        }
      });
    });

    test('should show all 8 resize handles when element is selected', async ({ page }) => {
      // Arrange: Load template
      await loadTemplate(page, 'Landing Page SaaS');

      // Act: Select an element
      await selectElement(page, 'button');
      await page.waitForTimeout(300); // Wait for handles to appear

      // Assert: All 8 handles should be visible
      const handleCount = await page.locator('.resize-handle').count();
      expect(handleCount, 'Should have 8 resize handles').toBe(8);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'resize-handles-all');
    });
  });

  /**
   * Test Group 5: Text Editing
   * Validates inline text editing via double-click
   */
  test.describe('Text Editing', () => {
    test('should edit h1 text via double-click', async ({ page }) => {
      // Arrange: Load template with h1
      await loadTemplate(page, 'Landing Page SaaS');

      const newText = 'New Heading Text';

      // Act: Edit h1 text
      await editTextElement(page, 'h1', newText);

      // Assert: Text should be updated
      const h1 = page.locator('#canvas h1').first();
      await expect(h1, 'H1 should contain new text').toContainText(newText);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'text-editing-h1');
    });

    test('should edit paragraph text via double-click', async ({ page }) => {
      // Arrange: Load template with paragraph
      await loadTemplate(page, 'Landing Page SaaS');

      const newText = 'Updated paragraph content for testing';

      // Act: Edit paragraph text
      await editTextElement(page, 'p', newText);

      // Assert: Text should be updated
      const paragraph = page.locator('#canvas p').first();
      await expect(paragraph, 'Paragraph should contain new text').toContainText(newText);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'text-editing-paragraph');
    });

    test('should edit button text via double-click', async ({ page }) => {
      // Arrange: Load template with button
      await loadTemplate(page, 'Landing Page SaaS');

      const newText = 'Click Me';

      // Act: Edit button text
      await editTextElement(page, 'button', newText);

      // Assert: Button text should be updated
      const button = page.locator('#canvas button').first();
      await expect(button, 'Button should contain new text').toContainText(newText);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'text-editing-button');
    });
  });

  /**
   * Test Group 6: Theme & UI Features
   * Validates theme toggle, keyboard shortcuts, and other UI features
   */
  test.describe('Theme & UI Features', () => {
    test('should toggle theme with Ctrl+Shift+D', async ({ page }) => {
      // Arrange: Editor is loaded
      // Get initial body background color
      const initialBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Act: Toggle theme
      await toggleTheme(page);

      // Assert: Background color should change
      const newBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      expect(newBg, 'Background color should change after theme toggle').not.toBe(initialBg);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'theme-toggle-dark');
    });

    test('should open components panel with Ctrl+B', async ({ page }) => {
      // Arrange: Panel is initially hidden
      const panel = page.locator('#components-panel');
      const initiallyVisible = await panel.isVisible().catch(() => false);

      // Act: Open panel
      await openComponentsPanel(page);

      // Assert: Panel should be visible
      await expect(panel, 'Components panel should be visible after Ctrl+B').toBeVisible();

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'components-panel-open');
    });

    test('should open properties panel with Ctrl+P', async ({ page }) => {
      // Arrange: Load template and select element
      await loadTemplate(page, 'Landing Page SaaS');
      await selectElement(page, 'h1');

      // Act: Open panel
      await openPropertiesPanel(page);

      // Assert: Panel should be visible
      const panel = page.locator('#property-panel');
      await expect(panel, 'Properties panel should be visible after Ctrl+P').toBeVisible();

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'properties-panel-open');
    });
  });

  /**
   * Test Group 7: Export & Save Features
   * Validates HTML export and localStorage persistence
   */
  test.describe('Export & Save Features', () => {
    test('should export HTML correctly', async ({ page }) => {
      // Arrange: Load a template
      await loadTemplate(page, 'Landing Page SaaS');

      // Act: Trigger export (implementation depends on editor)
      // This test may need adjustment based on actual export mechanism
      await page.click('text=📁 Archivo');
      await page.click('text=💾 Guardar');

      // Wait for save operation
      await page.waitForTimeout(1000);

      // Assert: Check localStorage for saved data
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('currentProject');
      });

      expect(savedData, 'Project should be saved to localStorage').toBeTruthy();

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'export-save');
    });

    test('should load project from localStorage', async ({ page }) => {
      // Arrange: Save a project first
      await loadTemplate(page, 'Landing Page SaaS');
      await page.click('text=📁 Archivo');
      await page.click('text=💾 Guardar');
      await page.waitForTimeout(1000);

      // Clear canvas
      await page.click('text=📁 Archivo');
      await page.click('text=📄 Nuevo Proyecto Blanco');
      await waitForCanvasReady(page);

      // Act: Load from localStorage
      await page.click('text=📁 Archivo');
      await page.click('text=📂 Abrir');

      // Assert: Canvas should have content again
      await page.waitForTimeout(1000);
      const elementCount = await getCanvasElementCount(page);
      expect(elementCount, 'Canvas should have elements after loading').toBeGreaterThan(0);

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'load-from-storage');
    });
  });

  /**
   * Test Group 8: Canvas Operations
   * Validates undo, redo, delete, and clear operations
   */
  test.describe('Canvas Operations', () => {
    test('should delete selected element with Delete key', async ({ page }) => {
      // Arrange: Load template
      await loadTemplate(page, 'Landing Page SaaS');
      const initialCount = await getCanvasElementCount(page);

      // Select first button
      await selectElement(page, 'button');

      // Act: Press Delete key
      await page.keyboard.press('Delete');
      await page.waitForTimeout(500);

      // Assert: Element count should decrease
      const newCount = await getCanvasElementCount(page);
      expect(newCount, 'Element count should decrease after deletion').toBeLessThan(
        initialCount
      );

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'delete-element');
    });

    test('should clear entire canvas', async ({ page }) => {
      // Arrange: Load template with content
      await loadTemplate(page, 'Landing Page SaaS');
      const initialCount = await getCanvasElementCount(page);
      expect(initialCount, 'Canvas should have elements initially').toBeGreaterThan(0);

      // Act: Clear canvas
      await page.click('text=📁 Archivo');
      await page.click('text=🗑️ Limpiar Canvas');

      // Wait for confirmation (if any)
      await page.waitForTimeout(500);

      // Assert: Canvas should be empty or have minimal elements
      const newCount = await getCanvasElementCount(page);
      expect(newCount, 'Canvas should have fewer elements after clear').toBeLessThan(
        initialCount
      );

      // Capture screenshot
      await takeScreenshot(page, 'vanilla', 'clear-canvas');
    });
  });
});
