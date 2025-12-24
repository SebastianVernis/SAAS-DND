/**
 * Unit Tests for CodeEditorPanel
 * Tests the CodeMirror 6 integration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CodeEditorPanel } from '../../vanilla-editor/src/components/CodeEditorPanel.js';

describe('CodeEditorPanel', () => {
  let codeEditorPanel;
  let mockCanvas;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="canvas">
        <h1 style="color: red;">Test Title</h1>
        <p>Test paragraph</p>
      </div>
    `;

    // Create instance
    codeEditorPanel = new CodeEditorPanel();
  });

  afterEach(() => {
    // Cleanup
    if (codeEditorPanel) {
      codeEditorPanel.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create modal element', () => {
      const modal = document.getElementById('codeEditorModal');
      expect(modal).toBeTruthy();
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should create all three editor panes', () => {
      const htmlEditor = document.getElementById('htmlEditor');
      const cssEditor = document.getElementById('cssEditor');
      const jsEditor = document.getElementById('jsEditor');

      expect(htmlEditor).toBeTruthy();
      expect(cssEditor).toBeTruthy();
      expect(jsEditor).toBeTruthy();
    });

    it('should add styles to document head', () => {
      const styles = document.getElementById('codeEditorStyles');
      expect(styles).toBeTruthy();
    });
  });

  describe('Code Extraction', () => {
    it('should extract HTML from canvas', () => {
      codeEditorPanel.extractCodeFromCanvas();
      expect(codeEditorPanel.originalCode.html).toContain('Test Title');
      expect(codeEditorPanel.originalCode.html).toContain('Test paragraph');
    });

    it('should extract inline CSS from canvas', () => {
      codeEditorPanel.extractCodeFromCanvas();
      expect(codeEditorPanel.originalCode.css).toContain('color');
      expect(codeEditorPanel.originalCode.css).toContain('red');
    });

    it('should format HTML with proper indentation', () => {
      const html = '<div><h1>Title</h1><p>Text</p></div>';
      const formatted = codeEditorPanel.formatHTML(html);
      expect(formatted).toContain('\n');
      expect(formatted.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('Modal Operations', () => {
    it('should open modal', () => {
      codeEditorPanel.open();
      const modal = document.getElementById('codeEditorModal');
      expect(modal.classList.contains('hidden')).toBe(false);
    });

    it('should close modal', () => {
      codeEditorPanel.open();
      codeEditorPanel.close();
      const modal = document.getElementById('codeEditorModal');
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should extract code when opening', () => {
      const spy = jest.spyOn(codeEditorPanel, 'extractCodeFromCanvas');
      codeEditorPanel.open();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to CSS tab', () => {
      codeEditorPanel.switchTab('css');
      expect(codeEditorPanel.currentTab).toBe('css');
      
      const cssTab = document.querySelector('[data-tab="css"]');
      expect(cssTab.classList.contains('active')).toBe(true);
    });

    it('should switch to JS tab', () => {
      codeEditorPanel.switchTab('js');
      expect(codeEditorPanel.currentTab).toBe('js');
      
      const jsTab = document.querySelector('[data-tab="js"]');
      expect(jsTab.classList.contains('active')).toBe(true);
    });

    it('should show correct editor pane', () => {
      codeEditorPanel.switchTab('css');
      const cssPane = document.getElementById('cssEditor');
      expect(cssPane.classList.contains('active')).toBe(true);
    });
  });

  describe('Code Application', () => {
    it('should apply HTML changes to canvas', () => {
      // Mock editors
      codeEditorPanel.editors.html = {
        state: {
          doc: {
            toString: () => '<h2>New Title</h2>'
          }
        }
      };

      codeEditorPanel.apply();
      
      const canvas = document.getElementById('canvas');
      expect(canvas.innerHTML).toContain('New Title');
    });

    it('should create style tag for CSS', () => {
      codeEditorPanel.editors.css = {
        state: {
          doc: {
            toString: () => 'body { background: blue; }'
          }
        }
      };

      codeEditorPanel.apply();
      
      const styleTag = document.getElementById('canvas-custom-styles');
      expect(styleTag).toBeTruthy();
      expect(styleTag.textContent).toContain('background: blue');
    });

    it('should close modal after applying', () => {
      codeEditorPanel.open();
      codeEditorPanel.editors.html = {
        state: { doc: { toString: () => '<div>Test</div>' } }
      };
      
      codeEditorPanel.apply();
      
      const modal = document.getElementById('codeEditorModal');
      expect(modal.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should close on Escape key', () => {
      codeEditorPanel.open();
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      const modal = document.getElementById('codeEditorModal');
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should apply on Ctrl+S', () => {
      codeEditorPanel.open();
      const spy = jest.spyOn(codeEditorPanel, 'apply');
      
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true 
      });
      document.dispatchEvent(event);
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should destroy editors on cleanup', () => {
      codeEditorPanel.editors.html = { destroy: jest.fn() };
      codeEditorPanel.editors.css = { destroy: jest.fn() };
      codeEditorPanel.editors.js = { destroy: jest.fn() };
      
      codeEditorPanel.destroy();
      
      expect(codeEditorPanel.editors.html.destroy).toHaveBeenCalled();
      expect(codeEditorPanel.editors.css.destroy).toHaveBeenCalled();
      expect(codeEditorPanel.editors.js.destroy).toHaveBeenCalled();
    });

    it('should remove modal from DOM', () => {
      codeEditorPanel.destroy();
      const modal = document.getElementById('codeEditorModal');
      expect(modal).toBeFalsy();
    });

    it('should remove styles from DOM', () => {
      codeEditorPanel.destroy();
      const styles = document.getElementById('codeEditorStyles');
      expect(styles).toBeFalsy();
    });
  });
});

describe('Global Initialization', () => {
  it('should initialize globally', async () => {
    const { initCodeEditorPanel } = await import('../../vanilla-editor/src/components/CodeEditorPanel.js');
    const instance = initCodeEditorPanel();
    
    expect(instance).toBeTruthy();
    expect(window.codeEditorPanel).toBe(instance);
    
    instance.destroy();
  });

  it('should return same instance on multiple calls', async () => {
    const { initCodeEditorPanel } = await import('../../vanilla-editor/src/components/CodeEditorPanel.js');
    const instance1 = initCodeEditorPanel();
    const instance2 = initCodeEditorPanel();
    
    expect(instance1).toBe(instance2);
    
    instance1.destroy();
  });
});
