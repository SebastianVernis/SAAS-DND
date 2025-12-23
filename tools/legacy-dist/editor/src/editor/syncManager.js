/**
 * Sync Manager
 * Manages bidirectional synchronization between code editor and visual canvas
 */

import { HTMLParser } from './htmlParser.js';
import { DOMSerializer } from './domSerializer.js';
import { DiffEngine } from './diffEngine.js';
import { PerformanceMonitor } from '../utils/performanceMonitor.js';

export class SyncManager {
  constructor(codeEditor, visualCanvas) {
    this.codeEditor = codeEditor;
    this.visualCanvas = visualCanvas;
    this.htmlParser = new HTMLParser();
    this.domSerializer = new DOMSerializer();
    this.diffEngine = new DiffEngine();
    this.performanceMonitor = new PerformanceMonitor();
    
    this.isSyncing = false;
    this.syncDirection = null; // 'code-to-visual' or 'visual-to-code'
    this.lastCodeValue = '';
    this.lastVisualHTML = '';
    
    this.setupListeners();
  }

  /**
   * Setup bidirectional sync listeners
   */
  setupListeners() {
    // Listen to code editor changes
    if (this.codeEditor) {
      this.codeEditor.onChange((value) => {
        if (!this.isSyncing && this.syncDirection !== 'visual-to-code') {
          this.syncCodeToVisual(value);
        }
      });
    }

    // Listen to visual canvas changes
    if (this.visualCanvas) {
      this.setupVisualCanvasObserver();
    }
  }

  /**
   * Setup MutationObserver for visual canvas
   */
  setupVisualCanvasObserver() {
    const observer = new MutationObserver((mutations) => {
      if (!this.isSyncing && this.syncDirection !== 'code-to-visual') {
        // Debounce visual changes
        clearTimeout(this.visualChangeTimeout);
        this.visualChangeTimeout = setTimeout(() => {
          this.syncVisualToCode();
        }, 100);
      }
    });

    observer.observe(this.visualCanvas, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    });

    this.canvasObserver = observer;
  }

  /**
   * Sync code changes to visual canvas
   */
  async syncCodeToVisual(htmlCode) {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;
      this.syncDirection = 'code-to-visual';
      this.performanceMonitor.start('sync-code-to-visual');

      // Parse HTML code
      const parsedDOM = this.htmlParser.parse(htmlCode);

      // Calculate diff between current canvas and parsed DOM
      const diff = this.diffEngine.calculateDiff(
        this.visualCanvas.innerHTML,
        parsedDOM
      );

      // Apply diff to visual canvas
      this.applyDiffToCanvas(diff);

      this.lastCodeValue = htmlCode;
      
      const duration = this.performanceMonitor.end('sync-code-to-visual');
      
      if (duration > 100) {
        console.warn(`⚠️ Code-to-visual sync took ${duration.toFixed(2)}ms (target: <100ms)`);
      }

      console.log('✅ Code synced to visual canvas');
    } catch (error) {
      console.error('❌ Failed to sync code to visual:', error);
    } finally {
      this.isSyncing = false;
      setTimeout(() => {
        this.syncDirection = null;
      }, 50);
    }
  }

  /**
   * Sync visual canvas changes to code
   */
  async syncVisualToCode() {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;
      this.syncDirection = 'visual-to-code';
      this.performanceMonitor.start('sync-visual-to-code');

      // Serialize visual canvas to HTML
      const serializedHTML = this.domSerializer.serialize(this.visualCanvas);

      // Update code editor if content changed
      if (serializedHTML !== this.lastVisualHTML) {
        this.codeEditor.setValue(serializedHTML);
        this.lastVisualHTML = serializedHTML;
      }

      const duration = this.performanceMonitor.end('sync-visual-to-code');
      
      if (duration > 100) {
        console.warn(`⚠️ Visual-to-code sync took ${duration.toFixed(2)}ms (target: <100ms)`);
      }

      console.log('✅ Visual canvas synced to code');
    } catch (error) {
      console.error('❌ Failed to sync visual to code:', error);
    } finally {
      this.isSyncing = false;
      setTimeout(() => {
        this.syncDirection = null;
      }, 50);
    }
  }

  /**
   * Apply diff to visual canvas
   */
  applyDiffToCanvas(diff) {
    diff.forEach(change => {
      switch (change.type) {
        case 'add':
          this.addElementToCanvas(change.element, change.parent, change.index);
          break;
        case 'remove':
          this.removeElementFromCanvas(change.element);
          break;
        case 'update':
          this.updateElementInCanvas(change.element, change.changes);
          break;
        case 'move':
          this.moveElementInCanvas(change.element, change.newParent, change.newIndex);
          break;
      }
    });
  }

  /**
   * Add element to canvas
   */
  addElementToCanvas(elementData, parentSelector, index) {
    try {
      const parent = parentSelector ? this.visualCanvas.querySelector(parentSelector) : this.visualCanvas;
      if (!parent) return;

      const element = this.createElementFromData(elementData);
      
      if (index !== undefined && index < parent.children.length) {
        parent.insertBefore(element, parent.children[index]);
      } else {
        parent.appendChild(element);
      }
    } catch (error) {
      console.error('Failed to add element to canvas:', error);
    }
  }

  /**
   * Remove element from canvas
   */
  removeElementFromCanvas(selector) {
    try {
      const element = this.visualCanvas.querySelector(selector);
      if (element) {
        element.remove();
      }
    } catch (error) {
      console.error('Failed to remove element from canvas:', error);
    }
  }

  /**
   * Update element in canvas
   */
  updateElementInCanvas(selector, changes) {
    try {
      const element = this.visualCanvas.querySelector(selector);
      if (!element) return;

      Object.entries(changes).forEach(([key, value]) => {
        if (key === 'textContent') {
          element.textContent = value;
        } else if (key === 'innerHTML') {
          element.innerHTML = value;
        } else if (key.startsWith('style.')) {
          const styleProp = key.substring(6);
          element.style[styleProp] = value;
        } else {
          element.setAttribute(key, value);
        }
      });
    } catch (error) {
      console.error('Failed to update element in canvas:', error);
    }
  }

  /**
   * Move element in canvas
   */
  moveElementInCanvas(selector, newParentSelector, newIndex) {
    try {
      const element = this.visualCanvas.querySelector(selector);
      const newParent = newParentSelector ? this.visualCanvas.querySelector(newParentSelector) : this.visualCanvas;
      
      if (!element || !newParent) return;

      if (newIndex !== undefined && newIndex < newParent.children.length) {
        newParent.insertBefore(element, newParent.children[newIndex]);
      } else {
        newParent.appendChild(element);
      }
    } catch (error) {
      console.error('Failed to move element in canvas:', error);
    }
  }

  /**
   * Create element from data
   */
  createElementFromData(data) {
    const element = document.createElement(data.tag || 'div');
    
    if (data.attributes) {
      Object.entries(data.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (data.textContent) {
      element.textContent = data.textContent;
    }

    if (data.children) {
      data.children.forEach(childData => {
        const child = this.createElementFromData(childData);
        element.appendChild(child);
      });
    }

    return element;
  }

  /**
   * Force sync from code to visual
   */
  forceSyncCodeToVisual() {
    const value = this.codeEditor.getValue();
    this.syncCodeToVisual(value);
  }

  /**
   * Force sync from visual to code
   */
  forceSyncVisualToCode() {
    this.syncVisualToCode();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }

  /**
   * Dispose sync manager
   */
  dispose() {
    if (this.canvasObserver) {
      this.canvasObserver.disconnect();
    }
    clearTimeout(this.visualChangeTimeout);
  }
}

export default SyncManager;
