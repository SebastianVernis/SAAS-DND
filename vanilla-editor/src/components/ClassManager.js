/**
 * ClassManager - Visual CSS Class Management Component
 * 
 * Features:
 * - Extract all CSS classes from stylesheets
 * - Add/remove classes from elements
 * - Autocomplete with available classes
 * - Display styles for each class
 * - Validate class existence
 * - Visual class tags with remove buttons
 * 
 * Dependencies: CSSUtils.js from Phoenix Code (TASK 2)
 */

import * as CSSUtils from '../phoenix/CSSUtils.js';

class ClassManager {
  constructor() {
    this.currentElement = null;
    this.availableClasses = new Set();
    this.classStyles = new Map();
    this.initialized = false;
    
    console.log('🏷️ ClassManager initialized');
  }

  /**
   * Initialize the class manager
   */
  init() {
    if (this.initialized) return;
    
    this.extractAvailableClasses();
    this.initialized = true;
    
    console.log(`✅ ClassManager ready with ${this.availableClasses.size} classes`);
  }

  /**
   * Extract all CSS classes from stylesheets in the document
   */
  extractAvailableClasses() {
    this.availableClasses.clear();
    this.classStyles.clear();

    try {
      // Get all stylesheets from the main document
      const stylesheets = Array.from(document.styleSheets);
      
      stylesheets.forEach(stylesheet => {
        try {
          // Skip cross-origin stylesheets
          if (!stylesheet.cssRules) return;
          
          const cssText = Array.from(stylesheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
          
          // Extract class names using CSSUtils
          const classNames = CSSUtils.extractAllClassNames(cssText);
          classNames.forEach(className => {
            this.availableClasses.add(className);
            
            // Store styles for this class
            const styles = this.getStylesForClass(className, cssText);
            if (styles) {
              this.classStyles.set(className, styles);
            }
          });
        } catch (e) {
          // Skip stylesheets that can't be accessed (CORS)
          console.debug('Skipping stylesheet due to CORS:', e);
        }
      });

      // Also check canvas for inline styles
      const canvas = document.getElementById('canvas');
      if (canvas) {
        const styleTags = canvas.querySelectorAll('style');
        styleTags.forEach(styleTag => {
          const cssText = styleTag.textContent;
          const classNames = CSSUtils.extractAllClassNames(cssText);
          classNames.forEach(className => {
            this.availableClasses.add(className);
            
            const styles = this.getStylesForClass(className, cssText);
            if (styles) {
              this.classStyles.set(className, styles);
            }
          });
        });
      }

      console.log(`📊 Extracted ${this.availableClasses.size} CSS classes`);
    } catch (error) {
      console.error('Error extracting CSS classes:', error);
    }
  }

  /**
   * Get CSS styles for a specific class
   * @param {string} className - Class name (without dot)
   * @param {string} cssText - CSS text to search
   * @returns {Object|null} Object with CSS properties
   */
  getStylesForClass(className, cssText) {
    try {
      const selector = `.${className}`;
      const matches = CSSUtils.findMatchingRules(cssText, selector, 'css');
      
      if (matches && matches.length > 0) {
        // Extract properties from the first match
        const match = matches[0];
        const lines = cssText.split('\n');
        
        if (match.lineStart >= 0 && match.lineEnd >= 0) {
          const ruleText = lines.slice(match.lineStart, match.lineEnd + 1).join('\n');
          
          // Parse CSS properties
          const propsMatch = ruleText.match(/\{([^}]+)\}/);
          if (propsMatch) {
            const propsText = propsMatch[1];
            const properties = {};
            
            propsText.split(';').forEach(prop => {
              const [key, value] = prop.split(':').map(s => s.trim());
              if (key && value) {
                properties[key] = value;
              }
            });
            
            return properties;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.debug('Error getting styles for class:', className, error);
      return null;
    }
  }

  /**
   * Update the class manager for a specific element
   * @param {HTMLElement} element - Element to manage classes for
   */
  update(element) {
    if (!element) return;
    
    this.currentElement = element;
    
    // Refresh available classes
    this.extractAvailableClasses();
    
    // Render the UI
    this.render();
  }

  /**
   * Render the class manager UI
   * @returns {string} HTML string for the class manager section
   */
  render() {
    if (!this.currentElement) return '';

    const currentClasses = this.getCurrentClasses();
    
    let html = '<div class="property-section class-manager-section">';
    html += '<div class="section-title">🏷️ Clases CSS</div>';
    
    // Current classes as tags
    html += '<div class="class-tags-container" id="class-tags-container">';
    if (currentClasses.length > 0) {
      currentClasses.forEach(className => {
        const isDefined = this.availableClasses.has(className);
        const warningClass = isDefined ? '' : 'undefined-class';
        const warningIcon = isDefined ? '' : '⚠️ ';
        
        html += `
          <span class="class-tag ${warningClass}" data-class="${className}">
            ${warningIcon}${className}
            <button class="class-tag-remove" onclick="window.classManager.removeClass('${className}')" title="Remover clase">×</button>
          </span>
        `;
      });
    } else {
      html += '<div class="class-tags-empty">Sin clases CSS</div>';
    }
    html += '</div>';
    
    // Add class input with autocomplete
    html += '<div class="class-input-container">';
    html += '<input type="text" id="class-input" class="property-input class-input" placeholder="Agregar clase..." list="available-classes" autocomplete="off">';
    html += '<button class="class-add-btn" onclick="window.classManager.addClassFromInput()">+</button>';
    html += '</div>';
    
    // Datalist for autocomplete
    html += '<datalist id="available-classes">';
    Array.from(this.availableClasses).sort().forEach(className => {
      html += `<option value="${className}">`;
    });
    html += '</datalist>';
    
    // Styles preview for current classes
    if (currentClasses.length > 0) {
      html += '<div class="class-styles-preview" id="class-styles-preview">';
      html += '<div class="styles-preview-title">Estilos aplicados:</div>';
      
      currentClasses.forEach(className => {
        const styles = this.classStyles.get(className);
        const isDefined = this.availableClasses.has(className);
        
        html += `<div class="class-style-item ${isDefined ? '' : 'undefined'}">`;
        html += `<div class="class-style-name">.${className}</div>`;
        
        if (styles && Object.keys(styles).length > 0) {
          html += '<div class="class-style-props">';
          Object.entries(styles).forEach(([prop, value]) => {
            html += `<div class="style-prop"><span class="prop-name">${prop}:</span> <span class="prop-value">${value}</span></div>`;
          });
          html += '</div>';
        } else if (!isDefined) {
          html += '<div class="class-style-warning">⚠️ Clase no definida en CSS</div>';
        } else {
          html += '<div class="class-style-empty">Sin estilos específicos</div>';
        }
        
        html += '</div>';
      });
      
      html += '</div>';
    }
    
    html += '</div>';
    
    return html;
  }

  /**
   * Get current classes from the element (excluding editor classes)
   * @returns {Array<string>} Array of class names
   */
  getCurrentClasses() {
    if (!this.currentElement) return [];
    
    const classes = Array.from(this.currentElement.classList);
    
    // Filter out editor-specific classes
    return classes.filter(cls => 
      cls !== 'canvas-element' && 
      cls !== 'selected' &&
      cls !== 'dragging' &&
      cls !== 'resizing'
    );
  }

  /**
   * Add a class to the current element
   * @param {string} className - Class name to add
   */
  addClass(className) {
    if (!this.currentElement || !className) return;
    
    className = className.trim();
    if (!className) return;
    
    // Remove leading dot if present
    if (className.startsWith('.')) {
      className = className.substring(1);
    }
    
    // Check if class already exists
    if (this.currentElement.classList.contains(className)) {
      console.log(`Class "${className}" already exists on element`);
      return;
    }
    
    // Add the class
    this.currentElement.classList.add(className);
    
    console.log(`✅ Added class: ${className}`);
    
    // Update the UI
    this.update(this.currentElement);
    
    // Trigger properties panel update
    if (typeof window.loadProperties === 'function') {
      window.loadProperties(this.currentElement);
    }
  }

  /**
   * Remove a class from the current element
   * @param {string} className - Class name to remove
   */
  removeClass(className) {
    if (!this.currentElement || !className) return;
    
    className = className.trim();
    
    // Remove the class
    this.currentElement.classList.remove(className);
    
    console.log(`✅ Removed class: ${className}`);
    
    // Update the UI
    this.update(this.currentElement);
    
    // Trigger properties panel update
    if (typeof window.loadProperties === 'function') {
      window.loadProperties(this.currentElement);
    }
  }

  /**
   * Toggle a class on the current element
   * @param {string} className - Class name to toggle
   */
  toggleClass(className) {
    if (!this.currentElement || !className) return;
    
    className = className.trim();
    
    if (this.currentElement.classList.contains(className)) {
      this.removeClass(className);
    } else {
      this.addClass(className);
    }
  }

  /**
   * Add class from input field
   */
  addClassFromInput() {
    const input = document.getElementById('class-input');
    if (!input) return;
    
    const className = input.value.trim();
    if (!className) return;
    
    this.addClass(className);
    
    // Clear input
    input.value = '';
    input.focus();
  }

  /**
   * Validate if a class exists in CSS
   * @param {string} className - Class name to validate
   * @returns {boolean} True if class is defined
   */
  validateClass(className) {
    return this.availableClasses.has(className);
  }

  /**
   * Get all available classes
   * @returns {Array<string>} Array of available class names
   */
  getAvailableClasses() {
    return Array.from(this.availableClasses).sort();
  }

  /**
   * Setup event listeners for the class input
   */
  setupEventListeners() {
    const input = document.getElementById('class-input');
    if (!input) return;
    
    // Add class on Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addClassFromInput();
      }
    });
    
    // Show suggestions on focus
    input.addEventListener('focus', () => {
      // Refresh available classes
      this.extractAvailableClasses();
    });
  }
}

// Create singleton instance
const classManager = new ClassManager();

// Export for use in other modules
export default classManager;

// Also expose globally for inline event handlers
if (typeof window !== 'undefined') {
  window.classManager = classManager;
}
