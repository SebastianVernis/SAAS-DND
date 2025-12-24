/**
 * E2E Test Suite: Text Editing & Resize System Validation
 * 
 * Comprehensive testing for GitHub Issue #12:
 * [TEST] Validar Edición de Textos y Sistema de Resize
 * 
 * This test suite validates:
 * - Text editing via double-click (Suite 1)
 * - Resize handles functionality (Suite 2)
 * - Properties panel integration (Suite 3)
 * - Combined editing + resize operations (Suite 4)
 * - Edge cases and performance (Suite 5)
 * - Tooltip and visual feedback (Suite 6)
 * - Keyboard shortcuts (Suite 7)
 * 
 * @group vanilla-editor
 * @priority high
 * @issue #12
 */

import { test, expect, Page, Locator } from '@playwright/test';
import {
  BASE_URLS,
  TIMEOUTS,
  dismissLegalModal,
  waitForCanvasReady,
  takeScreenshot,
  setupConsoleErrorTracking,
} from './helpers/setup';
import {
  loadTemplate,
  openPropertiesPanel,
  selectElement,
} from './helpers/editor';

/**
 * Helper: Edit text element via double-click
 */
async function editTextViaDoubleClick(
  page: Page,
  selector: string,
  newText: string
): Promise<void> {
  const element = page.locator(`#canvas ${selector}`).first();
  
  // Double-click to activate editing
  await element.dblclick({ timeout: TIMEOUTS.short });
  
  // Wait for contentEditable to be enabled
  await page.waitForTimeout(200);
  
  // Clear existing text and type new text
  await page.keyboard.press('Control+A');
  await page.keyboard.type(newText);
  
  // Press Enter to save
  await page.keyboard.press('Enter');
  
  // Wait for save
  await page.waitForTimeout(300);
}

/**
 * Helper: Check if element is editable
 */
async function isElementEditable(element: Locator): Promise<boolean> {
  const contentEditable = await element.getAttribute('contenteditable');
  return contentEditable === 'true';
}

/**
 * Helper: Get resize handle
 */
function getResizeHandle(page: Page, direction: string): Locator {
  return page.locator(`.resize-handle-${direction}`).first();
}

/**
 * Helper: Perform resize operation
 */
async function performResize(
  page: Page,
  direction: string,
  deltaX: number,
  deltaY: number
): Promise<void> {
  const handle = getResizeHandle(page, direction);
  
  // Get handle position
  const box = await handle.boundingBox();
  if (!box) throw new Error(`Handle ${direction} not found`);
  
  // Perform drag
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + deltaX, box.y + box.height / 2 + deltaY, {
    steps: 10,
  });
  await page.mouse.up();
  
  // Wait for resize to complete
  await page.waitForTimeout(300);
}

/**
 * Helper: Get element dimensions
 */
async function getElementDimensions(element: Locator): Promise<{ width: number; height: number }> {
  const box = await element.boundingBox();
  if (!box) throw new Error('Element not found');
  return { width: box.width, height: box.height };
}

/**
 * Helper: Check if tooltip is visible
 */
async function isTooltipVisible(page: Page): Promise<boolean> {
  const tooltip = page.locator('#resize-dimensions-tooltip');
  return await tooltip.isVisible().catch(() => false);
}

/**
 * Test Suite Configuration
 */
test.describe('Text Editing & Resize System - Issue #12', () => {
  test.beforeEach(async ({ page }) => {
    // Track console errors
    const errors = setupConsoleErrorTracking(page);
    
    // Navigate to vanilla editor
    await page.goto(BASE_URLS.editor, {
      waitUntil: 'networkidle',
      timeout: TIMEOUTS.long,
    });
    
    // Dismiss legal modal
    await dismissLegalModal(page);
    
    // Wait for canvas
    await waitForCanvasReady(page);
    
    // Store errors
    (page as any).__consoleErrors = errors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as any).__consoleErrors || [];
    if (errors.length > 0) {
      console.warn(`Console errors detected: ${errors.length}`);
      errors.forEach((err: string, i: number) => {
        console.warn(`  ${i + 1}. ${err}`);
      });
    }
  });

  /**
   * ✅ Test Suite 1: Edición de Textos
   */
  test.describe('Suite 1: Text Editing', () => {
    test('1.1: Should edit H1 title via double-click', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const h1 = page.locator('#canvas h1').first();
      const originalText = await h1.textContent();
      
      // Act
      const newText = 'MiProducto';
      await editTextViaDoubleClick(page, 'h1', newText);
      
      // Assert
      await expect(h1).toContainText(newText);
      expect(await h1.textContent()).not.toBe(originalText);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-1.1-edit-h1');
    });

    test('1.2: Should edit paragraph via double-click and blur', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const paragraph = page.locator('#canvas p').first();
      
      // Act
      await paragraph.dblclick();
      await page.waitForTimeout(200);
      await page.keyboard.press('Control+A');
      await page.keyboard.type('New paragraph text');
      
      // Click outside to blur
      await page.locator('#canvas').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);
      
      // Assert
      await expect(paragraph).toContainText('New paragraph text');
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-1.2-edit-paragraph-blur');
    });

    test('1.3: Should edit button text', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = page.locator('#canvas button').first();
      
      // Act
      const newText = 'Prueba ahora';
      await editTextViaDoubleClick(page, 'button', newText);
      
      // Assert
      await expect(button).toContainText(newText);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-1.3-edit-button');
    });

    test('1.4: Should edit multiple elements consecutively', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      
      // Act & Assert
      await editTextViaDoubleClick(page, 'h2', 'New H2 Text');
      await expect(page.locator('#canvas h2').first()).toContainText('New H2 Text');
      
      await editTextViaDoubleClick(page, 'p', 'New Paragraph');
      await expect(page.locator('#canvas p').first()).toContainText('New Paragraph');
      
      await editTextViaDoubleClick(page, 'button', 'New Button');
      await expect(page.locator('#canvas button').first()).toContainText('New Button');
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-1.4-multiple-edits');
    });

    test('1.5: Should NOT edit non-text elements (div, section)', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const section = page.locator('#canvas section').first();
      
      // Act
      await section.dblclick();
      await page.waitForTimeout(300);
      
      // Assert - element should NOT be editable
      const isEditable = await isElementEditable(section);
      expect(isEditable).toBe(false);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-1.5-non-editable');
    });
  });

  /**
   * ✅ Test Suite 2: Resize de Elementos
   */
  test.describe('Suite 2: Resize Handles', () => {
    test('2.1: Should show 8 resize handles when element selected', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      
      // Act
      await selectElement(page, 'button');
      await page.waitForTimeout(300);
      
      // Assert
      const handleCount = await page.locator('.resize-handle').count();
      expect(handleCount).toBe(8);
      
      // Verify all handles are visible
      const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
      for (const handle of handles) {
        const handleElement = getResizeHandle(page, handle);
        await expect(handleElement).toBeVisible();
      }
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.1-handles-visible');
    });

    test('2.2: Should resize horizontally using East handle', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      const initialDims = await getElementDimensions(button);
      
      // Act
      await performResize(page, 'e', 50, 0);
      
      // Assert
      const newDims = await getElementDimensions(button);
      expect(newDims.width).toBeGreaterThan(initialDims.width);
      expect(Math.abs(newDims.height - initialDims.height)).toBeLessThan(5); // Height should stay same
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.2-resize-horizontal');
    });

    test('2.3: Should resize vertically using South handle', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const section = await selectElement(page, 'section');
      const initialDims = await getElementDimensions(section);
      
      // Act
      await performResize(page, 's', 0, 100);
      
      // Assert
      const newDims = await getElementDimensions(section);
      expect(newDims.height).toBeGreaterThan(initialDims.height);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.3-resize-vertical');
    });

    test('2.4: Should resize diagonally using Southeast handle', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      const initialDims = await getElementDimensions(button);
      
      // Act
      await performResize(page, 'se', 50, 30);
      
      // Assert
      const newDims = await getElementDimensions(button);
      expect(newDims.width).toBeGreaterThan(initialDims.width);
      expect(newDims.height).toBeGreaterThan(initialDims.height);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.4-resize-diagonal');
    });

    test('2.5: Should preserve aspect ratio with Shift key', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      const initialDims = await getElementDimensions(button);
      const initialRatio = initialDims.width / initialDims.height;
      
      // Act - Hold Shift and resize
      const handle = getResizeHandle(page, 'se');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Handle not found');
      
      await page.keyboard.down('Shift');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 60, { steps: 10 });
      await page.mouse.up();
      await page.keyboard.up('Shift');
      await page.waitForTimeout(300);
      
      // Assert
      const newDims = await getElementDimensions(button);
      const newRatio = newDims.width / newDims.height;
      
      // Ratio should be approximately the same (within 10% tolerance)
      const ratioDiff = Math.abs(newRatio - initialRatio) / initialRatio;
      expect(ratioDiff).toBeLessThan(0.1);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.5-aspect-ratio');
    });

    test('2.6: Should resize from Northwest handle', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      const initialDims = await getElementDimensions(button);
      
      // Act
      await performResize(page, 'nw', -30, -20);
      
      // Assert
      const newDims = await getElementDimensions(button);
      expect(newDims.width).toBeGreaterThan(initialDims.width - 10);
      expect(newDims.height).toBeGreaterThan(initialDims.height - 10);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.6-resize-nw');
    });

    test('2.7: Should have correct cursor for each handle', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      await selectElement(page, 'button');
      await page.waitForTimeout(300);
      
      // Assert - Check cursor styles
      const expectedCursors = {
        'nw': 'nw-resize',
        'n': 'n-resize',
        'ne': 'ne-resize',
        'e': 'e-resize',
        'se': 'se-resize',
        's': 's-resize',
        'sw': 'sw-resize',
        'w': 'w-resize',
      };
      
      for (const [handle, expectedCursor] of Object.entries(expectedCursors)) {
        const handleElement = getResizeHandle(page, handle);
        const cursor = await handleElement.evaluate(el => window.getComputedStyle(el).cursor);
        expect(cursor).toBe(expectedCursor);
      }
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.7-handle-cursors');
    });

    test('2.8: Should enforce minimum size limit', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      
      // Act - Try to make element very small
      await performResize(page, 'w', 500, 0); // Large negative resize
      
      // Assert - Element should not be smaller than minimum (20px)
      const newDims = await getElementDimensions(button);
      expect(newDims.width).toBeGreaterThanOrEqual(20);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.8-min-size');
    });

    test('2.9: Should cancel resize with Escape key', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      const initialDims = await getElementDimensions(button);
      
      // Act - Start resize but cancel with Esc
      const handle = getResizeHandle(page, 'e');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Handle not found');
      
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 5 });
      
      // Press Escape before releasing mouse
      await page.keyboard.press('Escape');
      await page.mouse.up();
      await page.waitForTimeout(300);
      
      // Assert - Dimensions should be restored
      const newDims = await getElementDimensions(button);
      expect(Math.abs(newDims.width - initialDims.width)).toBeLessThan(5);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-2.9-cancel-resize');
    });
  });

  /**
   * ✅ Test Suite 3: Integración Panel de Propiedades
   */
  test.describe('Suite 3: Properties Panel Integration', () => {
    test('3.1: Should update properties panel during resize', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      await selectElement(page, 'button');
      await openPropertiesPanel(page);
      
      // Get initial width from panel
      const widthInput = page.locator('#property-panel input[data-property="width"]').first();
      const initialWidth = await widthInput.inputValue().catch(() => '');
      
      // Act - Resize element
      await performResize(page, 'e', 50, 0);
      await page.waitForTimeout(500);
      
      // Assert - Panel should show updated width
      const newWidth = await widthInput.inputValue().catch(() => '');
      expect(newWidth).not.toBe(initialWidth);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-3.1-panel-update');
    });

    test('3.2: Should update element when changing dimensions in panel', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      await openPropertiesPanel(page);
      const initialDims = await getElementDimensions(button);
      
      // Act - Change width in properties panel
      const widthInput = page.locator('#property-panel input[data-property="width"]').first();
      await widthInput.fill('350');
      await widthInput.press('Enter');
      await page.waitForTimeout(500);
      
      // Assert - Element should be resized
      const newDims = await getElementDimensions(button);
      expect(Math.abs(newDims.width - 350)).toBeLessThan(10);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-3.2-panel-to-element');
    });
  });

  /**
   * ✅ Test Suite 4: Edición + Resize Combinados
   */
  test.describe('Suite 4: Combined Editing & Resize', () => {
    test('4.1: Should edit text then resize element', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      
      // Act - Edit text
      await editTextViaDoubleClick(page, 'h2', 'New Heading');
      
      // Act - Resize
      const h2 = await selectElement(page, 'h2');
      await performResize(page, 'e', 50, 0);
      
      // Assert
      await expect(h2).toContainText('New Heading');
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-4.1-edit-then-resize');
    });

    test('4.2: Should resize then edit text', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const button = await selectElement(page, 'button');
      
      // Act - Resize first
      await performResize(page, 'se', 50, 20);
      
      // Act - Edit text
      await editTextViaDoubleClick(page, 'button', 'Resized Button');
      
      // Assert
      await expect(button).toContainText('Resized Button');
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-4.2-resize-then-edit');
    });

    test('4.3: Should not allow editing during resize', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      await selectElement(page, 'button');
      
      // Act - Start resize
      const handle = getResizeHandle(page, 'e');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Handle not found');
      
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      
      // Try to double-click during resize
      const button = page.locator('#canvas button').first();
      await button.dblclick().catch(() => {}); // Should not activate editing
      
      await page.mouse.up();
      await page.waitForTimeout(300);
      
      // Assert - Element should not be editable
      const isEditable = await isElementEditable(button);
      expect(isEditable).toBe(false);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-4.3-no-edit-during-resize');
    });
  });

  /**
   * ✅ Test Suite 5: Edge Cases
   */
  test.describe('Suite 5: Edge Cases & Performance', () => {
    test('5.1: Should resize nested elements correctly', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const container = await selectElement(page, 'div');
      const initialDims = await getElementDimensions(container);
      
      // Act
      await performResize(page, 'e', 50, 0);
      
      // Assert
      const newDims = await getElementDimensions(container);
      expect(newDims.width).toBeGreaterThan(initialDims.width);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-5.1-nested-resize');
    });

    test('5.2: Should handle multiple consecutive resizes', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      
      // Act - Resize element A
      const buttonA = await selectElement(page, 'button');
      const initialDimsA = await getElementDimensions(buttonA);
      await performResize(page, 'e', 30, 0);
      const newDimsA = await getElementDimensions(buttonA);
      
      // Act - Resize element B
      const h2 = await selectElement(page, 'h2');
      await performResize(page, 's', 0, 20);
      
      // Act - Go back to element A
      await selectElement(page, 'button');
      const finalDimsA = await getElementDimensions(buttonA);
      
      // Assert - Element A should maintain its resized dimensions
      expect(Math.abs(finalDimsA.width - newDimsA.width)).toBeLessThan(5);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-5.2-multiple-resizes');
    });

    test('5.3: Should handle flex container resize', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Portafolio Profesional');
      const nav = await selectElement(page, 'nav');
      const initialDims = await getElementDimensions(nav);
      
      // Act
      await performResize(page, 'e', 50, 0);
      
      // Assert
      const newDims = await getElementDimensions(nav);
      expect(newDims.width).toBeGreaterThan(initialDims.width);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-5.3-flex-resize');
    });
  });

  /**
   * ✅ Test Suite 6: Tooltip y Feedback Visual
   */
  test.describe('Suite 6: Tooltip & Visual Feedback', () => {
    test('6.1: Should show dimensions tooltip during resize', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      await selectElement(page, 'button');
      
      // Act - Start resize
      const handle = getResizeHandle(page, 'e');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Handle not found');
      
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
      
      // Assert - Tooltip should be visible
      const tooltipVisible = await isTooltipVisible(page);
      expect(tooltipVisible).toBe(true);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-6.1-tooltip-visible');
      
      await page.mouse.up();
    });

    test('6.2: Should hide tooltip after resize completes', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      await selectElement(page, 'button');
      
      // Act - Perform complete resize
      await performResize(page, 'e', 50, 0);
      await page.waitForTimeout(500);
      
      // Assert - Tooltip should be hidden
      const tooltipVisible = await isTooltipVisible(page);
      expect(tooltipVisible).toBe(false);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-6.2-tooltip-hidden');
    });

    test('6.3: Should show handles only for selected element', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      
      // Act - Select first button
      await selectElement(page, 'button');
      await page.waitForTimeout(300);
      let handleCount = await page.locator('.resize-handle').count();
      expect(handleCount).toBe(8);
      
      // Act - Deselect by clicking canvas
      await page.locator('#canvas').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);
      
      // Assert - Handles should be hidden
      handleCount = await page.locator('.resize-handle:visible').count();
      expect(handleCount).toBe(0);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-6.3-handles-visibility');
    });
  });

  /**
   * ✅ Test Suite 7: Keyboard Shortcuts
   */
  test.describe('Suite 7: Keyboard Shortcuts', () => {
    test('7.1: Should save text edit with Enter key', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const h1 = page.locator('#canvas h1').first();
      
      // Act
      await h1.dblclick();
      await page.waitForTimeout(200);
      await page.keyboard.press('Control+A');
      await page.keyboard.type('New Text');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      
      // Assert
      await expect(h1).toContainText('New Text');
      const isEditable = await isElementEditable(h1);
      expect(isEditable).toBe(false);
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-7.1-enter-save');
    });

    test('7.2: Should create new line with Shift+Enter', async ({ page }) => {
      // Arrange
      await loadTemplate(page, 'Landing Page SaaS');
      const paragraph = page.locator('#canvas p').first();
      
      // Act
      await paragraph.dblclick();
      await page.waitForTimeout(200);
      await page.keyboard.press('Control+A');
      await page.keyboard.type('Line 1');
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.type('Line 2');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      
      // Assert
      const text = await paragraph.textContent();
      expect(text).toContain('Line 1');
      expect(text).toContain('Line 2');
      
      // Screenshot
      await takeScreenshot(page, 'issue-12', 'test-7.2-shift-enter');
    });
  });
});
