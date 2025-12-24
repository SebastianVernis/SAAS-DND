/**
 * CodeEditorPanel Component
 * CodeMirror 6 integration for DragNDrop Editor
 * Provides code editing with syntax highlighting for HTML, CSS, and JavaScript
 */

import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

export class CodeEditorPanel {
  constructor() {
    this.modal = null;
    this.editors = {
      html: null,
      css: null,
      js: null
    };
    this.currentTab = 'html';
    this.originalCode = {
      html: '',
      css: '',
      js: ''
    };
    this.init();
  }

  /**
   * Initialize the code editor panel
   */
  init() {
    this.createModal();
    this.setupEventListeners();
    console.log('✅ CodeEditorPanel initialized');
  }

  /**
   * Create the modal structure
   */
  createModal() {
    const modalHTML = `
      <div id="codeEditorModal" class="code-editor-modal hidden">
        <div class="code-editor-overlay" onclick="window.codeEditorPanel.close()"></div>
        <div class="code-editor-container">
          <div class="code-editor-header">
            <h2>📝 Editor de Código</h2>
            <button class="code-editor-close" onclick="window.codeEditorPanel.close()">&times;</button>
          </div>
          
          <div class="code-editor-tabs">
            <button class="code-tab active" data-tab="html" onclick="window.codeEditorPanel.switchTab('html')">
              HTML
            </button>
            <button class="code-tab" data-tab="css" onclick="window.codeEditorPanel.switchTab('css')">
              CSS
            </button>
            <button class="code-tab" data-tab="js" onclick="window.codeEditorPanel.switchTab('js')">
              JavaScript
            </button>
          </div>
          
          <div class="code-editor-content">
            <div id="htmlEditor" class="editor-pane active"></div>
            <div id="cssEditor" class="editor-pane"></div>
            <div id="jsEditor" class="editor-pane"></div>
          </div>
          
          <div class="code-editor-footer">
            <button class="code-btn secondary" onclick="window.codeEditorPanel.cancel()">
              Cancelar
            </button>
            <button class="code-btn primary" onclick="window.codeEditorPanel.apply()">
              Aplicar Cambios
            </button>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('codeEditorModal');

    // Add styles
    this.addStyles();
  }

  /**
   * Add CSS styles for the code editor
   */
  addStyles() {
    const styles = `
      <style id="codeEditorStyles">
        .code-editor-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .code-editor-modal.hidden {
          display: none;
        }

        .code-editor-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .code-editor-container {
          position: relative;
          width: 90%;
          max-width: 1200px;
          height: 80vh;
          background: #1e1e1e;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1;
        }

        .code-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #252526;
          border-bottom: 1px solid #3e3e42;
        }

        .code-editor-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #cccccc;
        }

        .code-editor-close {
          background: none;
          border: none;
          color: #cccccc;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .code-editor-close:hover {
          background: #3e3e42;
          color: #ffffff;
        }

        .code-editor-tabs {
          display: flex;
          gap: 4px;
          padding: 8px 24px 0;
          background: #252526;
          border-bottom: 1px solid #3e3e42;
        }

        .code-tab {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: #969696;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 4px 4px 0 0;
          transition: all 0.2s;
          position: relative;
        }

        .code-tab:hover {
          background: #2d2d30;
          color: #cccccc;
        }

        .code-tab.active {
          background: #1e1e1e;
          color: #ffffff;
        }

        .code-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #007acc;
        }

        .code-editor-content {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .editor-pane {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
        }

        .editor-pane.active {
          display: block;
        }

        .editor-pane .cm-editor {
          height: 100%;
          font-size: 14px;
          font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
        }

        .editor-pane .cm-scroller {
          overflow: auto;
        }

        .code-editor-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          background: #252526;
          border-top: 1px solid #3e3e42;
        }

        .code-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .code-btn.secondary {
          background: #3e3e42;
          color: #cccccc;
        }

        .code-btn.secondary:hover {
          background: #4e4e52;
        }

        .code-btn.primary {
          background: #007acc;
          color: #ffffff;
        }

        .code-btn.primary:hover {
          background: #0098ff;
        }

        /* CodeMirror theme customization */
        .cm-editor {
          background: #1e1e1e !important;
        }

        .cm-gutters {
          background: #1e1e1e !important;
          border-right: 1px solid #3e3e42 !important;
        }

        .cm-activeLineGutter {
          background: #2d2d30 !important;
        }

        .cm-activeLine {
          background: #2d2d30 !important;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
      
      // Ctrl+S to apply
      if (e.ctrlKey && e.key === 's' && !this.modal.classList.contains('hidden')) {
        e.preventDefault();
        this.apply();
      }
    });
  }

  /**
   * Initialize CodeMirror editors
   */
  initializeEditors() {
    // HTML Editor
    if (!this.editors.html) {
      this.editors.html = new EditorView({
        state: EditorState.create({
          doc: this.originalCode.html,
          extensions: [
            basicSetup,
            html(),
            EditorView.theme({
              '&': { height: '100%' },
              '.cm-scroller': { overflow: 'auto' }
            })
          ]
        }),
        parent: document.getElementById('htmlEditor')
      });
    }

    // CSS Editor
    if (!this.editors.css) {
      this.editors.css = new EditorView({
        state: EditorState.create({
          doc: this.originalCode.css,
          extensions: [
            basicSetup,
            css(),
            EditorView.theme({
              '&': { height: '100%' },
              '.cm-scroller': { overflow: 'auto' }
            })
          ]
        }),
        parent: document.getElementById('cssEditor')
      });
    }

    // JavaScript Editor
    if (!this.editors.js) {
      this.editors.js = new EditorView({
        state: EditorState.create({
          doc: this.originalCode.js,
          extensions: [
            basicSetup,
            javascript(),
            EditorView.theme({
              '&': { height: '100%' },
              '.cm-scroller': { overflow: 'auto' }
            })
          ]
        }),
        parent: document.getElementById('jsEditor')
      });
    }
  }

  /**
   * Extract code from canvas
   */
  extractCodeFromCanvas() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Extract HTML
    this.originalCode.html = this.formatHTML(canvas.innerHTML);

    // Extract inline CSS
    const inlineStyles = [];
    canvas.querySelectorAll('[style]').forEach(el => {
      const selector = el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
      inlineStyles.push(`${selector} {\n  ${el.getAttribute('style').replace(/;/g, ';\n  ')}\n}`);
    });
    this.originalCode.css = inlineStyles.join('\n\n');

    // Extract inline JavaScript
    const scripts = canvas.querySelectorAll('script');
    this.originalCode.js = Array.from(scripts).map(s => s.textContent).join('\n\n');
  }

  /**
   * Format HTML with proper indentation
   */
  formatHTML(html) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    html.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) {
        indent--;
      }
      formatted += tab.repeat(indent) + '<' + node + '>\n';
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input') && !node.startsWith('br') && !node.startsWith('img')) {
        indent++;
      }
    });

    return formatted.substring(1, formatted.length - 2);
  }

  /**
   * Open the code editor modal
   */
  open() {
    this.extractCodeFromCanvas();
    this.initializeEditors();
    
    // Update editor content
    if (this.editors.html) {
      this.editors.html.dispatch({
        changes: {
          from: 0,
          to: this.editors.html.state.doc.length,
          insert: this.originalCode.html
        }
      });
    }
    
    if (this.editors.css) {
      this.editors.css.dispatch({
        changes: {
          from: 0,
          to: this.editors.css.state.doc.length,
          insert: this.originalCode.css
        }
      });
    }
    
    if (this.editors.js) {
      this.editors.js.dispatch({
        changes: {
          from: 0,
          to: this.editors.js.state.doc.length,
          insert: this.originalCode.js
        }
      });
    }

    this.modal.classList.remove('hidden');
    console.log('📝 Code editor opened');
  }

  /**
   * Close the code editor modal
   */
  close() {
    this.modal.classList.add('hidden');
    console.log('📝 Code editor closed');
  }

  /**
   * Switch between tabs
   */
  switchTab(tab) {
    this.currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.code-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update editor panes
    document.querySelectorAll('.editor-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`${tab}Editor`).classList.add('active');

    console.log(`📝 Switched to ${tab.toUpperCase()} tab`);
  }

  /**
   * Apply code changes to canvas
   */
  apply() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Get current code from editors
    const htmlCode = this.editors.html ? this.editors.html.state.doc.toString() : '';
    const cssCode = this.editors.css ? this.editors.css.state.doc.toString() : '';
    const jsCode = this.editors.js ? this.editors.js.state.doc.toString() : '';

    // Save to undo/redo history
    if (window.undoRedoManager) {
      window.undoRedoManager.saveState();
    }

    // Apply HTML
    canvas.innerHTML = htmlCode;

    // Apply CSS (create or update style tag)
    let styleTag = document.getElementById('canvas-custom-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'canvas-custom-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssCode;

    // Apply JavaScript (create or update script tag)
    let scriptTag = document.getElementById('canvas-custom-script');
    if (scriptTag) {
      scriptTag.remove();
    }
    if (jsCode.trim()) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'canvas-custom-script';
      scriptTag.textContent = jsCode;
      document.body.appendChild(scriptTag);
    }

    // Re-setup canvas elements
    if (window.setupCanvasElements) {
      window.setupCanvasElements();
    }

    this.close();
    
    if (window.showToast) {
      window.showToast('✅ Cambios aplicados correctamente');
    }

    console.log('✅ Code changes applied to canvas');
  }

  /**
   * Cancel and discard changes
   */
  cancel() {
    if (confirm('¿Descartar los cambios realizados?')) {
      this.close();
    }
  }

  /**
   * Destroy the code editor panel
   */
  destroy() {
    // Destroy editors
    Object.values(this.editors).forEach(editor => {
      if (editor) editor.destroy();
    });

    // Remove modal
    if (this.modal) {
      this.modal.remove();
    }

    // Remove styles
    const styles = document.getElementById('codeEditorStyles');
    if (styles) {
      styles.remove();
    }

    console.log('🗑️ CodeEditorPanel destroyed');
  }
}

// Initialize and export globally
let codeEditorPanelInstance = null;

export function initCodeEditorPanel() {
  if (!codeEditorPanelInstance) {
    codeEditorPanelInstance = new CodeEditorPanel();
    window.codeEditorPanel = codeEditorPanelInstance;
    console.log('✅ CodeEditorPanel initialized globally');
  }
  return codeEditorPanelInstance;
}

export default CodeEditorPanel;
