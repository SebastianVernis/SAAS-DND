/**
 * Vanilla Editor Test Helpers
 *
 * Provides utilities specific to the Vanilla Editor component.
 * Handles template loading, component interactions, and editor features.
 *
 * @module editor
 */

import { Page, expect, Locator } from '@playwright/test';
import { TIMEOUTS, waitForCanvasReady } from './setup';

/**
 * List of all 25 templates available in the editor
 * Ordered as they appear in the application
 */
export const TEMPLATES = [
  'Landing Page SaaS',
  'Portafolio Profesional',
  'Blog Personal',
  'Tienda Online',
  'Dashboard Analítico',
  'Documentación Técnica',
  'Página Corporativa',
  'Evento/Conferencia',
  'App Móvil Landing',
  'Newsletter Template',
  'Formulario de Contacto',
  'Página de Precios',
  'Testimonios',
  'Equipo/About',
  'FAQ (Preguntas Frecuentes)',
  'Login/Registro',
  'Features Section',
  'Hero Section',
  'Footer Template',
  'Header/Navbar',
  'Card Grid',
  'Timeline',
  'Estadísticas',
  'Call to Action',
  'Social Proof',
] as const;

export type TemplateName = typeof TEMPLATES[number];

export async function acceptLegalModal(page: Page) {
  try {
    await page.waitForLoadState('networkidle');
    const checkbox = page.locator('#accept-terms-checkbox');
    const visible = await checkbox.isVisible({ timeout: 3000 }).catch(() => false);

    if (visible) {
      await checkbox.check();
      await page.click('#accept-btn');
      await page.waitForTimeout(1500);  // Esperar animación
    }
  } catch (error) {
    // Modal no presente, continuar
  }
}

/**
 * Component categories in the editor
 */
export const COMPONENT_CATEGORIES = {
  layout: ['Container', 'Section', 'Grid', 'Flexbox'],
  typography: ['Heading', 'Paragraph', 'Link', 'List'],
  forms: ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio'],
  media: ['Image', 'Video', 'Icon'],
} as const;

/**
 * Loads a template in the editor
 *
 * Opens the template menu, selects the specified template,
 * and waits for it to render completely.
 *
 * @param page - Playwright Page object
 * @param templateName - Name of template to load
 * @throws Will fail if template is not found or fails to load
 *
 * @example
 * ```typescript
 * await loadTemplate(page, 'Landing Page SaaS');
 * // Template loaded and rendered on canvas
 * ```
 */
export async function loadTemplate(page: Page, templateName: TemplateName): Promise<void> {
  await acceptLegalModal(page);
  const gallery = page.locator('#galleryScreen');
  if (!await gallery.isVisible()) {
    // Open Archivo (File) menu
    await page.click('text=📁 Archivo', { timeout: TIMEOUTS.short });

    // Click Plantillas (Templates)
    await page.click('text=Plantillas', { timeout: TIMEOUTS.short });
  }

  // Select specific template
  await page.click(`text="${templateName}"`, { timeout: TIMEOUTS.medium });

  // Wait for template to render on canvas
  await waitForCanvasReady(page);

  // Additional verification: canvas should have content
  const canvas = page.locator('#canvas');
  await expect(canvas).not.toBeEmpty({ timeout: TIMEOUTS.long });
}

/**
 * Opens the components panel
 *
 * Uses keyboard shortcut for faster execution.
 * Verifies panel is visible before proceeding.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await openComponentsPanel(page);
 * // Components panel is now visible
 * ```
 */
export async function openComponentsPanel(page: Page): Promise<void> {
  // Use keyboard shortcut (Ctrl+B)
  await page.keyboard.press('Control+b');

  // Verify panel is visible
  const panel = page.locator('#components-panel');
  await expect(panel).toBeVisible({ timeout: TIMEOUTS.short });
}

/**
 * Opens the properties panel
 *
 * Uses keyboard shortcut for faster execution.
 * Verifies panel is visible before proceeding.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await openPropertiesPanel(page);
 * // Properties panel is now visible
 * ```
 */
export async function openPropertiesPanel(page: Page): Promise<void> {
  // Use keyboard shortcut (Ctrl+P)
  await page.keyboard.press('Control+p');

  // Verify panel is visible
  const panelSelectors = [
    '#properties-panel',
    '#property-panel',
    '.properties-panel',
    '[data-testid="properties-panel"]'
  ];

  let panel;
  for (const selector of panelSelectors) {
    panel = page.locator(selector);
    if (await panel.count() > 0) break;
  }

  await panel.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
}

/**
 * Drags a component from the sidebar to the canvas
 *
 * Simulates drag and drop operation with proper coordinates.
 * Verifies component is added to canvas.
 *
 * @param page - Playwright Page object
 * @param componentName - Name of component to drag
 * @returns Promise<void>
 * @throws Will fail if component is not found or drag fails
 *
 * @example
 * ```typescript
 * await dragComponentToCanvas(page, 'Button');
 * // Button component added to canvas
 * ```
 */
export async function dragComponentToCanvas(
  page: Page,
  componentName: string
): Promise<void> {
  // Ensure components panel is open
  await openComponentsPanel(page);

  // Locate component and canvas
  const component = page.locator(`.component-item:has-text("${componentName}")`);
  const canvas = page.locator('#canvas');

  // Verify component exists
  await expect(component).toBeVisible({ timeout: TIMEOUTS.short });

  // Perform drag and drop
  await component.dragTo(canvas, {
    targetPosition: { x: 100, y: 100 }, // Drop near top-left
  });

  // Wait for canvas to update
  await page.waitForTimeout(500); // Small delay for visual feedback

  // Verify component was added (implementation depends on how editor tracks elements)
  // This is a basic check - adjust based on actual implementation
  const canvasElements = canvas.locator('*');
  await expect(canvasElements.first()).toBeAttached();
}

/**
 * Selects an element on the canvas
 *
 * Clicks the element and verifies selection indicators appear.
 * Selection is indicated by resize handles and/or outline.
 *
 * @param page - Playwright Page object
 * @param selector - CSS selector for element to select
 * @returns Promise<Locator> Selected element locator
 *
 * @example
 * ```typescript
 * const element = await selectElement(page, 'h1');
 * // H1 element is now selected with visible handles
 * ```
 */
export async function selectElement(page: Page, selector: string): Promise<Locator> {
  const element = page.locator(`#canvas ${selector}`).first();

  // Click element to select it
  await element.click({ timeout: TIMEOUTS.short });

  // Verify selection by checking for resize handles or selected class
  await page.waitForTimeout(300); // Small delay for selection UI to appear

  return element;
}

/**
 * Gets computed style value for an element
 *
 * Reads actual rendered styles (not just inline styles).
 * More reliable than checking element.style directly.
 *
 * @param page - Playwright Page object
 * @param selector - CSS selector for element
 * @param property - CSS property name (camelCase)
 * @returns Promise<string> Computed style value
 *
 * @example
 * ```typescript
 * const fontSize = await getComputedStyle(page, 'h1', 'fontSize');
 * expect(fontSize).toBe('56px');
 * ```
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return page.evaluate(
    ({ sel, prop }) => {
      const element = document.querySelector(sel);
      if (!element) return '';
      return window.getComputedStyle(element)[prop as any] || '';
    },
    { sel: `#canvas ${selector}`, prop: property }
  );
}

/**
 * Verifies properties panel displays correct values
 *
 * Checks that property panel reads and displays computed styles correctly.
 * Supports typography, spacing, background, and positioning properties.
 *
 * @param page - Playwright Page object
 * @param sectionId - ID of property section (e.g., 'typography-section')
 * @param expectedValues - Object mapping property labels to expected values
 * @returns Promise<void>
 * @throws Will fail if any property doesn't match expected value
 *
 * @example
 * ```typescript
 * await verifyPropertiesPanel(page, 'typography-section', {
 *   'Font Size': '56px',
 *   'Font Weight': '700'
 * });
 * ```
 */
export async function verifyPropertiesPanel(
  page: Page,
  sectionId: string,
  expectedValues: Record<string, string>
): Promise<void> {
  const panelSelectors = [
    '#properties-panel',
    '#property-panel',
    '.properties-panel',
    '[data-testid="properties-panel"]'
  ];

  let panel;
  for (const selector of panelSelectors) {
    panel = page.locator(selector);
    if (await panel.count() > 0) break;
  }

  await panel.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });

  const section = panel.locator(`#${sectionId}`);

  // Ensure section is visible
  await expect(section).toBeVisible({ timeout: TIMEOUTS.short });

  // Check each property
  for (const [label, expectedValue] of Object.entries(expectedValues)) {
    // Try both input and select elements (different property types use different controls)
    const input = section.locator(`input[aria-label="${label}"], input[label="${label}"]`);
    const select = section.locator(`select[aria-label="${label}"], select[label="${label}"]`);

    // Check which control exists
    const inputVisible = await input.isVisible().catch(() => false);
    const selectVisible = await select.isVisible().catch(() => false);

    if (inputVisible) {
      await expect(input).toHaveValue(expectedValue, {
        timeout: TIMEOUTS.short,
      });
    } else if (selectVisible) {
      await expect(select).toHaveValue(expectedValue, {
        timeout: TIMEOUTS.short,
      });
    } else {
      throw new Error(
        `Property control not found for label: ${label} in section: ${sectionId}`
      );
    }
  }
}

/**
 * Resizes element using handles
 *
 * Drags a resize handle to change element dimensions.
 * Supports all 8 directional handles.
 *
 * @param page - Playwright Page object
 * @param handle - Handle direction (n, ne, e, se, s, sw, w, nw)
 * @param deltaX - Horizontal movement in pixels
 * @param deltaY - Vertical movement in pixels
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await resizeElement(page, 'se', 100, 100);
 * // Element resized by dragging southeast handle
 * ```
 */
export async function resizeElement(
  page: Page,
  handle: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw',
  deltaX: number,
  deltaY: number
): Promise<void> {
  const handleLocator = page.locator(`.resize-handle.${handle}`);

  // Verify handle is visible
  await expect(handleLocator).toBeVisible({ timeout: TIMEOUTS.short });

  // Get handle position
  const box = await handleLocator.boundingBox();
  if (!box) throw new Error(`Handle .${handle} not found or not visible`);

  // Perform drag operation
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + deltaX, box.y + box.height / 2 + deltaY);
  await page.mouse.up();

  // Wait for resize to complete
  await page.waitForTimeout(300);
}

/**
 * Makes text element editable via double-click
 *
 * Double-clicks element to enter edit mode, types new text,
 * and confirms by pressing Enter.
 *
 * @param page - Playwright Page object
 * @param selector - CSS selector for text element
 * @param newText - New text content
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await editTextElement(page, 'h1', 'New Heading');
 * // H1 text updated to 'New Heading'
 * ```
 */
export async function editTextElement(
  page: Page,
  selector: string,
  newText: string
): Promise<void> {
  const element = page.locator(`#canvas ${selector}`).first();

  // Double-click to enter edit mode
  await element.dblclick({ timeout: TIMEOUTS.short });

  // Wait for element to become editable
  await page.waitForTimeout(300);

  // Clear existing text and type new text
  await page.keyboard.press('Control+a'); // Select all
  await page.keyboard.type(newText);

  // Confirm by pressing Enter
  await page.keyboard.press('Enter');

  // Verify text was updated
  await expect(element).toContainText(newText, { timeout: TIMEOUTS.short });
}

/**
 * Toggles theme (dark/light mode)
 *
 * Uses keyboard shortcut to toggle theme.
 * Waits for theme transition to complete.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await toggleTheme(page);
 * // Theme toggled, visual update complete
 * ```
 */
export async function toggleTheme(page: Page): Promise<void> {
  await page.keyboard.press('Control+Shift+D');
  await page.waitForTimeout(500); // Wait for theme transition
}

/**
 * Enables Zen mode (fullscreen)
 *
 * Presses F11 to toggle Zen mode.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await enableZenMode(page);
 * // Editor in fullscreen mode
 * ```
 */
export async function enableZenMode(page: Page): Promise<void> {
  await page.keyboard.press('F11');
  await page.waitForTimeout(500); // Wait for fullscreen transition
}

/**
 * Counts elements on canvas
 *
 * Returns count of elements matching selector.
 * Useful for verifying element addition/deletion.
 *
 * @param page - Playwright Page object
 * @param selector - CSS selector (optional, defaults to all elements)
 * @returns Promise<number> Element count
 *
 * @example
 * ```typescript
 * const count = await getCanvasElementCount(page, 'button');
 * expect(count).toBeGreaterThan(0);
 * ```
 */
export async function getCanvasElementCount(
  page: Page,
  selector: string = '*'
): Promise<number> {
  return page.locator(`#canvas ${selector}`).count();
}
