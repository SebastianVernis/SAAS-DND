/**
 * Language Services
 * Provides IntelliSense, autocompletion, and language support for HTML, CSS, and JavaScript
 */

import { setupHTMLCompletions } from './htmlCompletions.js';
import { setupCSSCompletions } from './cssCompletions.js';
import { setupJSCompletions } from './jsCompletions.js';

/**
 * Initialize all language services
 */
export async function initializeLanguageServices(monaco, editor) {
  try {
    console.log('🔧 Initializing language services...');

    // Setup HTML language support
    await setupHTMLCompletions(monaco);
    console.log('✅ HTML completions configured');

    // Setup CSS language support
    await setupCSSCompletions(monaco);
    console.log('✅ CSS completions configured');

    // Setup JavaScript language support
    await setupJSCompletions(monaco);
    console.log('✅ JavaScript completions configured');

    // Configure language defaults
    configureLanguageDefaults(monaco);

    console.log('✅ All language services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize language services:', error);
    throw error;
  }
}

/**
 * Configure default language settings
 */
function configureLanguageDefaults(monaco) {
  // HTML defaults
  monaco.languages.html.htmlDefaults.setOptions({
    format: {
      tabSize: 2,
      insertSpaces: true,
      wrapLineLength: 120,
      unformatted: 'wbr',
      contentUnformatted: 'pre,code,textarea',
      indentInnerHtml: false,
      preserveNewLines: true,
      maxPreserveNewLines: null,
      indentHandlebars: false,
      endWithNewline: false,
      extraLiners: 'head, body, /html',
      wrapAttributes: 'auto'
    },
    suggest: {
      html5: true,
      angular1: false,
      ionic: false
    }
  });

  // CSS defaults
  monaco.languages.css.cssDefaults.setOptions({
    validate: true,
    lint: {
      compatibleVendorPrefixes: 'warning',
      vendorPrefix: 'warning',
      duplicateProperties: 'warning',
      emptyRules: 'warning',
      importStatement: 'ignore',
      boxModel: 'ignore',
      universalSelector: 'ignore',
      zeroUnits: 'ignore',
      fontFaceProperties: 'warning',
      hexColorLength: 'error',
      argumentsInColorFunction: 'error',
      unknownProperties: 'warning',
      ieHack: 'ignore',
      unknownVendorSpecificProperties: 'ignore',
      propertyIgnoredDueToDisplay: 'warning',
      important: 'ignore',
      float: 'ignore',
      idSelector: 'ignore'
    }
  });

  // JavaScript/TypeScript defaults
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types']
  });

  // Add DOM type definitions
  addDOMTypeDefinitions(monaco);
}

/**
 * Add DOM type definitions for better IntelliSense
 */
function addDOMTypeDefinitions(monaco) {
  const domTypes = `
    declare const document: Document;
    declare const window: Window;
    declare const console: Console;
    
    interface Document {
      getElementById(id: string): HTMLElement | null;
      querySelector(selector: string): Element | null;
      querySelectorAll(selector: string): NodeListOf<Element>;
      createElement(tagName: string): HTMLElement;
      createTextNode(text: string): Text;
      body: HTMLBodyElement;
      head: HTMLHeadElement;
      title: string;
    }
    
    interface Window {
      alert(message: string): void;
      confirm(message: string): boolean;
      prompt(message: string, defaultValue?: string): string | null;
      setTimeout(callback: Function, delay: number): number;
      setInterval(callback: Function, delay: number): number;
      clearTimeout(id: number): void;
      clearInterval(id: number): void;
      location: Location;
      localStorage: Storage;
      sessionStorage: Storage;
    }
    
    interface HTMLElement extends Element {
      style: CSSStyleDeclaration;
      innerHTML: string;
      innerText: string;
      textContent: string;
      className: string;
      id: string;
      onclick: ((event: MouseEvent) => void) | null;
      addEventListener(type: string, listener: EventListener): void;
      removeEventListener(type: string, listener: EventListener): void;
    }
  `;

  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    domTypes,
    'ts:dom-types.d.ts'
  );
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeLanguageServices };
}
