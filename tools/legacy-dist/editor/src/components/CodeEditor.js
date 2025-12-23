/**
 * CodeEditor Component
 * Monaco Editor integration for DragNDrop
 * Provides professional code editing with IntelliSense, syntax highlighting, and error detection
 */

import * as monaco from 'monaco-editor';
import { setupMonacoThemes } from '../utils/monacoThemes.js';
import { initializeLanguageServices } from '../editor/languageServices.js';
import { setupErrorDetection } from '../editor/errorDetection.js';
import { PerformanceMonitor } from '../utils/performanceMonitor.js';

export class CodeEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.editor = null;
    this.options = {
      language: options.language || 'html',
      theme: options.theme || 'dragndrop-dark',
      readOnly: options.readOnly || false,
      minimap: { enabled: options.minimap !== false },
      fontSize: options.fontSize || 14,
      lineNumbers: options.lineNumbers !== false ? 'on' : 'off',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: options.wordWrap || 'on',
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      parameterHints: {
        enabled: true
      },
      ...options
    };

    this.performanceMonitor = new PerformanceMonitor();
    this.changeListeners = [];
    this.errorMarkers = [];
    
    this.init();
  }

  /**
   * Initialize Monaco Editor
   */
  async init() {
    try {
      this.performanceMonitor.start('editor-init');

      // Setup custom themes
      setupMonacoThemes(monaco);

      // Create editor instance
      this.editor = monaco.editor.create(this.container, {
        value: this.options.value || '',
        language: this.options.language,
        theme: this.options.theme,
        ...this.options
      });

      // Initialize language services (IntelliSense)
      await initializeLanguageServices(monaco, this.editor);

      // Setup error detection
      setupErrorDetection(monaco, this.editor, (errors) => {
        this.updateErrorMarkers(errors);
      });

      // Setup change listener with debouncing
      this.setupChangeListener();

      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();

      this.performanceMonitor.end('editor-init');
      console.log('✅ Monaco Editor initialized successfully');

      return this.editor;
    } catch (error) {
      console.error('❌ Failed to initialize Monaco Editor:', error);
      throw error;
    }
  }

  /**
   * Setup change listener with debouncing for performance
   */
  setupChangeListener() {
    let debounceTimer;
    const debounceDelay = 300; // 300ms debounce

    this.editor.onDidChangeModelContent((event) => {
      clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        const value = this.editor.getValue();
        this.notifyChangeListeners(value, event);
      }, debounceDelay);
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Format document (Shift+Alt+F)
    this.editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        this.formatDocument();
      }
    );

    // Save (Ctrl+S)
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        this.notifyChangeListeners(this.editor.getValue(), { type: 'save' });
      }
    );
  }

  /**
   * Format document using Prettier
   */
  async formatDocument() {
    try {
      await this.editor.getAction('editor.action.formatDocument').run();
      console.log('✅ Document formatted');
    } catch (error) {
      console.error('❌ Format failed:', error);
    }
  }

  /**
   * Update error markers in the editor
   */
  updateErrorMarkers(errors) {
    const model = this.editor.getModel();
    if (!model) return;

    const markers = errors.map(error => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.endLine || error.line,
      endColumn: error.endColumn || error.column + 1,
      message: error.message,
      source: error.source || 'DragNDrop'
    }));

    monaco.editor.setModelMarkers(model, 'dragndrop', markers);
    this.errorMarkers = markers;
  }

  /**
   * Get current value
   */
  getValue() {
    return this.editor ? this.editor.getValue() : '';
  }

  /**
   * Set value
   */
  setValue(value) {
    if (this.editor) {
      this.editor.setValue(value || '');
    }
  }

  /**
   * Get selected text
   */
  getSelectedText() {
    if (!this.editor) return '';
    const selection = this.editor.getSelection();
    return this.editor.getModel().getValueInRange(selection);
  }

  /**
   * Insert text at cursor position
   */
  insertText(text) {
    if (!this.editor) return;
    
    const selection = this.editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = {
      identifier: id,
      range: selection,
      text: text,
      forceMoveMarkers: true
    };
    
    this.editor.executeEdits('dragndrop', [op]);
  }

  /**
   * Set language
   */
  setLanguage(language) {
    if (this.editor) {
      const model = this.editor.getModel();
      monaco.editor.setModelLanguage(model, language);
    }
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    if (this.editor) {
      monaco.editor.setTheme(theme);
    }
  }

  /**
   * Add change listener
   */
  onChange(callback) {
    this.changeListeners.push(callback);
  }

  /**
   * Notify all change listeners
   */
  notifyChangeListeners(value, event) {
    this.changeListeners.forEach(callback => {
      try {
        callback(value, event);
      } catch (error) {
        console.error('Error in change listener:', error);
      }
    });
  }

  /**
   * Focus editor
   */
  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  /**
   * Resize editor
   */
  resize() {
    if (this.editor) {
      this.editor.layout();
    }
  }

  /**
   * Dispose editor
   */
  dispose() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
    this.changeListeners = [];
    this.errorMarkers = [];
  }

  /**
   * Get editor instance
   */
  getEditor() {
    return this.editor;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}

export default CodeEditor;
