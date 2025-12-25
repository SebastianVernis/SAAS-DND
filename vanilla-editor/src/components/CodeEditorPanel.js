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
import { oneDark } from '@codemirror/theme-one-dark';

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
            <div class="code-editor-pane active" data-pane="html">
              <div id="htmlEditor" class="codemirror-editor"></div>
            </div>
            <div class="code-editor-pane" data-pane="css">
              <div id="cssEditor" class="codemirror-editor"></div>
            </div>
            <div class="code-editor-pane" data-pane="js">
              <div id="jsEditor" class="codemirror-editor"></div>
            </div>
          </div>
          
          <div class="code-editor-footer">
            <div class="code-editor-info">
              <span class="info-item">
                <span class="info-label">Líneas:</span>
                <span class="info-value" id="lineCount">0</span>
              </span>
              <span class="info-item">
                <span class="info-label">Caracteres:</span>
                <span class="info-value" id="charCount">0</span>
              </span>
            </div>
            <div class="code-editor-actions">
              <button class="code-btn secondary" id="cancelCodeEditor">Cancelar</button>
              <button class="code-btn primary" id="applyCodeEditor">Aplicar Cambios</button>
            </div>
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
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .code-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
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
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: #969696;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .code-tab:hover {
          color: #cccccc;
          background: rgba(255, 255, 255, 0.05);
        }

        .code-tab.active {
          color: #ffffff;
          border-bottom-color: #007acc;
          background: rgba(0, 122, 204, 0.1);
        }

        .tab-icon {
          font-size: 16px;
        }

        .code-editor-content {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .code-editor-pane {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
        }

        .code-editor-pane.active {
          display: block;
        }

        .codemirror-editor {
          width: 100%;
          height: 100%;
        }

        .codemirror-editor .cm-editor {
          height: 100%;
        }

        .codemirror-editor .cm-scroller {
          overflow: auto;
        }

        .code-editor-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #252526;
          border-top: 1px solid #3e3e42;
        }

        .code-editor-info {
          display: flex;
          gap: 24px;
        }

        .info-item {
          display: flex;
          gap: 8px;
          font-size: 13px;
          color: #969696;
        }

        .info-label {
          font-weight: 500;
        }

        .info-value {
          color: #cccccc;
          font-weight: 600;
        }

        .code-editor-actions {
          display: flex;
          gap: 12px;
        }

        .code-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
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

        /* Responsive */
        @media (max-width: 768px) {
          .code-editor-container {
            width: 95%;
            height: 90vh;
          }

          .code-editor-header {
            padding: 16px;
          }

          .code-editor-tabs {
            padding: 0 16px;
          }

          .code-tab {
            padding: 10px 16px;
            font-size: 13px;
          }

          .code-editor-footer {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .code-editor-info {
            width: 100%;
            justify-content: space-around;
          }

          .code-editor-actions {
            width: 100%;
          }

          .code-btn {
            flex: 1;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    document.getElementById('closeCodeEditor').addEventListener('click', () => {
      this.close();
    });

    // Cancel button
    document.getElementById('cancelCodeEditor').addEventListener('click', () => {
      this.close();
    });

    // Apply button
    document.getElementById('applyCodeEditor').addEventListener('click', () => {
      this.applyChanges();
    });

    // Overlay click to close
    this.modal.querySelector('.code-editor-overlay').addEventListener('click', () => {
      this.close();
    });

    // Tab switching
    const tabs = this.modal.querySelectorAll('.code-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.isOpen()) {
        // Escape to close
        if (e.key === 'Escape') {
          this.close();
        }
        // Ctrl+S to apply
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          this.applyChanges();
        }
      }
    });
  }

  /**
   * Initialize CodeMirror editors
   */
  initializeEditors() {
    // HTML Editor
    const htmlContainer = document.getElementById('htmlEditor');
    this.editors.html = new EditorView({
      state: EditorState.create({
        doc: this.originalCode.html,
        extensions: [
          basicSetup,
          html(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.updateStats();
            }
          })
        ]
      }),
      parent: htmlContainer
    });

    // CSS Editor
    const cssContainer = document.getElementById('cssEditor');
    this.editors.css = new EditorView({
      state: EditorState.create({
        doc: this.originalCode.css,
        extensions: [
          basicSetup,
          css(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.updateStats();
            }
          })
        ]
      }),
      parent: cssContainer
    });

    // JavaScript Editor
    const jsContainer = document.getElementById('jsEditor');
    this.editors.js = new EditorView({
      state: EditorState.create({
        doc: this.originalCode.js,
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.updateStats();
            }
          })
        ]
      }),
      parent: jsContainer
    });

    this.updateStats();
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    const tabs = this.modal.querySelectorAll('.code-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panes
    const panes = this.modal.querySelectorAll('.code-editor-pane');
    panes.forEach(pane => {
      pane.classList.toggle('active', pane.dataset.pane === tabName);
    });

    this.updateStats();
  }

  /**
   * Update statistics (line count, character count)
   */
  updateStats() {
    const editor = this.editors[this.currentTab];
    if (!editor) return;

    const doc = editor.state.doc;
    const lineCount = doc.lines;
    const charCount = doc.length;

    document.getElementById('lineCount').textContent = lineCount;
    document.getElementById('charCount').textContent = charCount;
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
    const inlineStyles = this.extractInlineStyles(canvas);
    this.originalCode.css = inlineStyles;

    // Extract inline JavaScript (if any)
    const inlineScripts = this.extractInlineScripts(canvas);
    this.originalCode.js = inlineScripts;
  }

  /**
   * Format HTML for better readability
   */
  formatHTML(html) {
    // Remove delete buttons and other editor artifacts
    let formatted = html.replace(/<div class="delete-btn">×<\/div>/g, '');
    formatted = formatted.replace(/class="canvas-element[^"]*"/g, '');
    formatted = formatted.replace(/class="selected[^"]*"/g, '');
    formatted = formatted.replace(/class=""/g, '');
    formatted = formatted.replace(/\s+class=""/g, '');
    
    // Basic formatting (simple indentation)
    return this.indentHTML(formatted);
  }

  /**
   * Simple HTML indentation
   */
  indentHTML(html) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    html.split(/>\s*</).forEach((node, index) => {
      if (index > 0) {
        formatted += '>';
      }
      if (index < html.split(/>\s*</).length - 1) {
        formatted += '\n';
      }

      if (node.match(/^\/\w/)) {
        indent--;
      }

      formatted += tab.repeat(Math.max(0, indent)) + '<' + node;

      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input') && !node.startsWith('img') && !node.startsWith('br')) {
        indent++;
      }
    });

    return formatted.substring(1, formatted.length - 1);
  }

  /**
   * Extract inline styles from elements
   */
  extractInlineStyles(container) {
    let styles = '/* Estilos extraídos del canvas */\n\n';
    const elements = container.querySelectorAll('[style]');
    
    elements.forEach((el, index) => {
      const id = el.id || `element-${index}`;
      const styleAttr = el.getAttribute('style');
      
      if (styleAttr) {
        styles += `#${id} {\n`;
        styleAttr.split(';').forEach(rule => {
          const trimmed = rule.trim();
          if (trimmed) {
            styles += `  ${trimmed};\n`;
          }
        });
        styles += `}\n\n`;
      }
    });

    return styles;
  }

  /**
   * Extract inline scripts
   */
  extractInlineScripts(container) {
    let scripts = '// Scripts extraídos del canvas\n\n';
    const scriptElements = container.querySelectorAll('script');
    
    scriptElements.forEach((script, index) => {
      if (script.textContent) {
        scripts += `// Script ${index + 1}\n`;
        scripts += script.textContent + '\n\n';
      }
    });

    return scripts || '// No hay scripts en el canvas';
  }

  /**
   * Apply changes to canvas
   */
  applyChanges() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    try {
      // Get code from editors
      const htmlCode = this.editors.html.state.doc.toString();
      const cssCode = this.editors.css.state.doc.toString();
      const jsCode = this.editors.js.state.doc.toString();

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

      // Re-initialize canvas elements
      if (window.reinitializeCanvasElements) {
        window.reinitializeCanvasElements();
      }

      // Save to undo/redo history
      if (window.undoRedoManager) {
        window.undoRedoManager.saveState();
      }

      // Show success message
      if (window.showToast) {
        window.showToast('✅ Cambios aplicados correctamente');
      }

      this.close();
    } catch (error) {
      console.error('Error applying code changes:', error);
      if (window.showToast) {
        window.showToast('❌ Error al aplicar cambios: ' + error.message, 'error');
      }
    }
  }

  /**
   * Open the code editor
   */
  open() {
    // Extract current code from canvas
    this.extractCodeFromCanvas();

    // Initialize editors if not already done
    if (!this.editors.html) {
      this.initializeEditors();
    } else {
      // Update editor content
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

    // Show modal
    this.modal.classList.remove('hidden');
    this.updateStats();

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
  }
}

// Initialize and export
let codeEditorInstance = null;

export function initCodeEditor() {
  if (!codeEditorInstance) {
    codeEditorInstance = new CodeEditorPanel();
  }
  return codeEditorInstance;
}

export function openCodeEditor() {
  const editor = initCodeEditor();
  editor.open();
}

export function closeCodeEditor() {
  if (codeEditorInstance) {
    codeEditorInstance.close();
  }
}

// Make available globally
window.openCodeEditor = openCodeEditor;
window.closeCodeEditor = closeCodeEditor;

export default CodeEditorPanel;
