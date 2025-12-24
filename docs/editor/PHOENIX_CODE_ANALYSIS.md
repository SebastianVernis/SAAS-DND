# 🔥 ANÁLISIS: Phoenix Code - Brackets para Web

**Fecha:** 23 de Diciembre 2024  
**Proyecto:** Phoenix Code (phcode.dev)  
**Repo:** https://github.com/phcode-dev/phoenix  
**Demo Live:** https://phcode.dev

---

## 📋 RESUMEN EJECUTIVO

### ¿Qué es Phoenix Code?

**Phoenix Code** es el sucesor moderno de Adobe Brackets que **corre 100% en el navegador**.

**Características clave:**
- ✅ Runs entirely in web browser (no installation)
- ✅ Full code editor with syntax highlighting
- ✅ Based on CodeMirror 6
- ✅ CSS/HTML/JS parsing built-in
- ✅ CSSUtils.js incluido (mismo de Brackets)
- ✅ HTMLUtils.js incluido
- ✅ Live preview
- ✅ Extensions support
- ✅ **Open Source (MIT License)**

---

## 🆚 COMPARACIÓN CON NUESTRO EDITOR

### Nuestro Editor (Vanilla)

| Aspecto | Estado | Tamaño |
|---------|--------|--------|
| **Código** | Vanilla JS | ~4,000 líneas |
| **Editor de código** | ❌ No tiene | - |
| **CSS Parsing** | ❌ Básico | - |
| **Class management** | ❌ Básico (classList) | - |
| **Syntax highlighting** | ❌ No | - |
| **Live editing** | ✅ Inline (double-click) | - |
| **Templates** | ✅ 25 templates | - |
| **Drag & Drop** | ✅ 34 components | - |

### Phoenix Code

| Aspecto | Estado | Tamaño |
|---------|--------|--------|
| **Código** | Modular (AMD) | ~100,000+ líneas |
| **Editor de código** | ✅ CodeMirror 6 | Full-featured |
| **CSS Parsing** | ✅ CSSUtils.js | ~1,800 líneas |
| **Class management** | ✅ Auto-complete | Full |
| **Syntax highlighting** | ✅ All languages | 50+ modes |
| **Live editing** | ✅ Live preview | Real-time |
| **Templates** | ❌ No | - |
| **Drag & Drop** | ❌ No | - |

---

## 🎯 OPORTUNIDADES DE INTEGRACIÓN

### Opción 1: Usar Phoenix Code Directamente

**Concepto:** Integrar Phoenix Code como editor de código dentro de nuestro editor visual

```
┌─────────────────────────────────────────┐
│        Nuestro Editor Visual            │
│  ┌───────────────────────────────────┐  │
│  │ Canvas (Drag & Drop)              │  │
│  │ - 25 Templates                    │  │
│  │ - 34 Components                   │  │
│  │ - Visual editing                  │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ Phoenix Code Editor               │  │
│  │ - HTML tab (syntax highlight)     │  │
│  │ - CSS tab (auto-complete)         │  │
│  │ - JS tab (linting)                │  │
│  │ - Live sync with canvas           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Implementación:**
```html
<!-- Agregar iframe de Phoenix Code -->
<div id="code-editor-container">
  <iframe 
    src="https://phcode.dev/?embed=true&hideUI=true"
    id="phoenix-editor"
    width="100%"
    height="600px"
  ></iframe>
</div>
```

**Comunicación:**
```javascript
// Desde nuestro editor → Phoenix
const phoenixEditor = document.getElementById('phoenix-editor').contentWindow;

// Sincronizar HTML del canvas al editor
phoenixEditor.postMessage({
  type: 'updateHTML',
  content: canvas.innerHTML
}, '*');

// Phoenix → Nuestro editor
window.addEventListener('message', (event) => {
  if (event.data.type === 'codeChanged') {
    // Actualizar canvas con nuevo código
    canvas.innerHTML = event.data.html;
  }
});
```

**Pros:**
- ✅ Editor completo sin escribir código
- ✅ Syntax highlighting gratis
- ✅ Auto-completado CSS
- ✅ Mantenido activamente

**Cons:**
- ❌ Iframe puede tener limitaciones
- ❌ Dependencia externa
- ❌ Customización limitada
- ❌ Performance del iframe

---

### Opción 2: Extraer Módulos Específicos de Phoenix

**Módulos a extraer:**

1. **CSSUtils.js** (igual que Brackets, ya analizado)
2. **HTMLUtils.js** (parsing de HTML)
3. **CodeMirror CSS Mode** (syntax highlighting)

**Estructura propuesta:**
```
vanilla-editor/
└── src/
    ├── phoenix/  ✨ NEW
    │   ├── CSSUtils.js (adaptado)
    │   ├── HTMLUtils.js (adaptado)
    │   ├── TokenUtils.js (adaptado)
    │   └── codemirror-css-mode.js
    │
    └── components/
        └── CodePanel.js ✨ NEW (mini code editor)
```

**Implementación del Code Panel:**
```javascript
// src/components/CodePanel.js

import { CSSUtils } from '../phoenix/CSSUtils.js';
import { HTMLUtils } from '../phoenix/HTMLUtils.js';

export class CodePanel {
  constructor(canvas) {
    this.canvas = canvas;
    this.cssParser = new CSSUtils();
    this.htmlParser = new HTMLUtils();
  }
  
  render() {
    return `
      <div class="code-panel">
        <div class="tabs">
          <button onclick="codePanel.showTab('html')" class="active">HTML</button>
          <button onclick="codePanel.showTab('css')">CSS</button>
        </div>
        
        <div id="html-tab" class="tab-content">
          <textarea id="html-editor"></textarea>
        </div>
        
        <div id="css-tab" class="tab-content hidden">
          <textarea id="css-editor"></textarea>
          <div id="css-autocomplete"></div>
        </div>
      </div>
    `;
  }
  
  showTab(tabName) {
    // Switch tabs
  }
  
  syncFromCanvas() {
    // Canvas → Code
    document.getElementById('html-editor').value = this.canvas.innerHTML;
  }
  
  syncToCanvas() {
    // Code → Canvas
    this.canvas.innerHTML = document.getElementById('html-editor').value;
  }
  
  // CSS Auto-complete usando CSSUtils
  setupCSSAutocomplete() {
    const cssEditor = document.getElementById('css-editor');
    
    cssEditor.addEventListener('input', (e) => {
      const cursor = e.target.selectionStart;
      const text = e.target.value;
      const currentWord = this.getCurrentWord(text, cursor);
      
      if (currentWord.startsWith('.')) {
        // Auto-completar clases
        const suggestions = this.cssParser.getAvailableClasses();
        this.showSuggestions(suggestions);
      }
    });
  }
}
```

**Pros:**
- ✅ Control completo
- ✅ Customizable
- ✅ No dependencias externas pesadas
- ✅ Integración perfecta

**Cons:**
- ⚠️ Requiere adaptación de código
- ⚠️ Mantenimiento propio
- ⚠️ Más tiempo de desarrollo

---

### Opción 3: Integración Híbrida

**Mejor de ambos mundos:**

1. **Para visual editing:** Nuestro editor actual
2. **Para code editing:** Embed Phoenix Code en tab separado

```
┌─────────────────────────────────────────┐
│  Tabs: [Visual] [Code]                  │
├─────────────────────────────────────────┤
│                                          │
│  Tab "Visual" (Actual):                 │
│  ┌────────────────────────────────────┐ │
│  │ Canvas + Drag & Drop               │ │
│  │ Properties Panel                   │ │
│  │ Components Sidebar                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Tab "Code" (Phoenix Embedded):         │
│  ┌────────────────────────────────────┐ │
│  │ Phoenix Code iframe                │ │
│  │ - Full syntax highlighting         │ │
│  │ - CSS auto-complete                │ │
│  │ - Error detection                  │ │
│  │ - Sync bidireccional con Visual    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Implementación:**
```javascript
// Tabs switcher
const modes = {
  visual: document.getElementById('visual-mode'),
  code: document.getElementById('code-mode')
};

function switchToCodeMode() {
  // Ocultar canvas
  modes.visual.classList.add('hidden');
  
  // Mostrar Phoenix Code
  modes.code.classList.remove('hidden');
  
  // Sync: Canvas → Phoenix
  updatePhoenixCode(canvas.innerHTML);
}

function switchToVisualMode() {
  // Obtener código de Phoenix
  const code = getPhoenixCode();
  
  // Actualizar canvas
  canvas.innerHTML = code.html;
  
  // Mostrar visual
  modes.code.classList.add('hidden');
  modes.visual.classList.remove('hidden');
}
```

**Pros:**
- ✅ Lo mejor de ambos mundos
- ✅ Usuarios eligen modo preferido
- ✅ Fácil implementación
- ✅ Phoenix se encarga del code editing

**Cons:**
- ⚠️ Requiere sync bidireccional robusto
- ⚠️ Iframe puede ser pesado

---

## 💡 COMPARACIÓN DE ALTERNATIVAS WEB

### Editores de Código Web (Browser-based)

| Editor | URL | Open Source | CSS Parse | Tamaño | Embedding |
|--------|-----|-------------|-----------|--------|-----------|
| **Phoenix Code** | phcode.dev | ✅ MIT | ✅ CSSUtils | ~5MB | ✅ iframe |
| **CodeMirror 6** | codemirror.net | ✅ MIT | ✅ CSS mode | ~500KB | ✅ Librería |
| **Monaco Editor** | microsoft.github.io/monaco-editor | ✅ MIT | ✅ CSS | ~2MB | ✅ Librería |
| **Ace Editor** | ace.c9.io | ✅ BSD | ✅ CSS mode | ~1MB | ✅ Librería |

---

## 🔧 RECOMENDACIÓN: ENFOQUE POR FASES

### Fase 1: CodeMirror 6 Standalone (Recomendado) ⭐

**Por qué CodeMirror en lugar de Phoenix completo:**
- Más ligero (~500KB vs ~5MB)
- Más fácil de integrar
- Más customizable
- Phoenix está basado en CodeMirror de todos modos

**Implementación:**

```bash
npm install codemirror @codemirror/lang-css @codemirror/lang-html
```

```javascript
// vanilla-editor/src/components/CodeEditor.js

import { EditorView, basicSetup } from "codemirror";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";

export class CodeEditor {
  constructor(container, initialCode = '') {
    this.view = new EditorView({
      doc: initialCode,
      extensions: [
        basicSetup,
        html(),
        css(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.onCodeChange(update.state.doc.toString());
          }
        })
      ],
      parent: container
    });
  }
  
  onCodeChange(code) {
    // Sync con canvas
    this.syncToCanvas(code);
  }
  
  updateCode(newCode) {
    this.view.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: newCode
      }
    });
  }
  
  syncToCanvas(htmlCode) {
    // Actualizar canvas con nuevo código
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = htmlCode;
  }
}
```

**Agregar al editor:**
```javascript
// En script.js

// Botón para abrir code editor
function openCodeEditor() {
  const modal = document.createElement('div');
  modal.className = 'code-editor-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Editar Código</h2>
        <button onclick="closeCodeEditor()">×</button>
      </div>
      <div id="code-editor-container"></div>
      <div class="modal-footer">
        <button onclick="applyCode()">Aplicar</button>
        <button onclick="closeCodeEditor()">Cancelar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Inicializar CodeMirror
  const editor = new CodeEditor(
    document.getElementById('code-editor-container'),
    document.getElementById('canvas').innerHTML
  );
}
```

**Beneficio:**
- Editor profesional con syntax highlighting
- Auto-completado CSS
- Linting
- ~500KB adicionales (aceptable)

---

### Fase 2: Extraer CSSUtils de Phoenix

**Usar CSSUtils.js de Phoenix (mantenido, actualizado) en lugar de Brackets original**

```bash
# Descargar CSSUtils.js actualizado
curl -o vanilla-editor/src/phoenix/CSSUtils.js \
  https://raw.githubusercontent.com/phcode-dev/phoenix/main/src/language/CSSUtils.js

# También dependencies
curl -o vanilla-editor/src/phoenix/TokenUtils.js \
  https://raw.githubusercontent.com/phcode-dev/phoenix/main/src/utils/TokenUtils.js
```

**Adaptar a ES6:**
```javascript
// CSSUtils.js adaptado
// Remover AMD (define/require)
// Convertir a export/import

export class CSSUtils {
  static extractAllSelectors(text, mode) {
    // Código original de Phoenix/Brackets
  }
  
  static findMatchingRules(text, selector) {
    // Código original
  }
  
  // ... más funciones
}
```

---

### Fase 3: Class Manager con Phoenix CSSUtils

**Integrar gestión de clases usando CSSUtils de Phoenix:**

```javascript
// vanilla-editor/src/components/ClassManager.js

import { CSSUtils } from '../phoenix/CSSUtils.js';

export class ClassManager {
  constructor(element) {
    this.element = element;
    this.cssUtils = CSSUtils;
    this.availableClasses = this.extractClasses();
  }
  
  extractClasses() {
    // Obtener todos los <style> y <link>
    const styles = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent)
      .join('\n');
    
    // Usar CSSUtils de Phoenix
    const selectors = this.cssUtils.extractAllSelectors(styles, "css");
    
    // Extraer solo clases
    const classes = new Set();
    selectors.forEach(s => {
      const matches = s.selector.match(/\.([\w-]+)/g);
      if (matches) {
        matches.forEach(m => classes.add(m.substring(1)));
      }
    });
    
    return Array.from(classes);
  }
  
  getStylesForClass(className) {
    const styles = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent)
      .join('\n');
    
    return this.cssUtils.findMatchingRules(styles, `.${className}`, "css");
  }
  
  renderUI() {
    // Renderizar panel de clases con auto-completado
  }
}
```

---

## 🌐 PHOENIX CODE COMO SERVICIO

### Embedding Phoenix Code

**URLs de Phoenix:**
- **Main:** https://phcode.dev
- **Embed mode:** https://phcode.dev/?embed=true
- **Repo:** https://github.com/phcode-dev/phoenix

**Parámetros URL útiles:**
```
?embed=true          # Modo embed (sin UI completo)
?hideUI=true         # Ocultar UI extra
?file=index.html     # Abrir archivo específico
?theme=dark          # Tema
?readOnly=false      # Permitir edición
```

**Ejemplo de integración:**
```html
<iframe 
  src="https://phcode.dev/?embed=true&hideUI=true&theme=dark&file=index.html"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

**API de comunicación:**
```javascript
// Documentación: https://github.com/phcode-dev/phoenix/wiki/Embedding

// Obtener código
phoenixFrame.contentWindow.postMessage({
  type: 'getFile',
  path: 'index.html'
}, '*');

// Actualizar código
phoenixFrame.contentWindow.postMessage({
  type: 'setFile',
  path: 'index.html',
  content: newHTMLContent
}, '*');

// Escuchar cambios
window.addEventListener('message', (e) => {
  if (e.data.type === 'fileChanged') {
    console.log('Code changed:', e.data.content);
  }
});
```

---

## 📊 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### Timeline Completo

| Fase | Descripción | Tiempo | Complejidad |
|------|-------------|--------|-------------|
| **1. CodeMirror 6** | Integrar editor básico | 2-3h | Media |
| **2. CSSUtils** | Extraer de Phoenix | 3-4h | Alta |
| **3. Class Manager** | UI + funcionalidad | 4-5h | Media |
| **4. Testing** | Tests + polish | 2-3h | Baja |
| **TOTAL** | | **11-15h** | **Media-Alta** |

---

### Fase 1: CodeMirror 6 (2-3 horas)

```bash
# 1. Instalar
npm install codemirror @codemirror/lang-html @codemirror/lang-css

# 2. Crear componente
# vanilla-editor/src/components/CodeEditorPanel.js

# 3. Integrar en script.js
# Botón "Código" que abre modal con CodeMirror

# 4. Sync bidireccional
# Canvas ↔ CodeMirror
```

**Deliverable:**
- Modal de código con syntax highlighting
- Sync basic canvas ↔ code

---

### Fase 2: CSSUtils de Phoenix (3-4 horas)

```bash
# 1. Descargar archivos de Phoenix
curl https://raw.githubusercontent.com/phcode-dev/phoenix/main/src/language/CSSUtils.js \
  -o vanilla-editor/src/phoenix/CSSUtils.js

# 2. Adaptar a ES6
# Remover AMD (define/require)
# Convertir a export/import
# Testear funciones clave

# 3. Crear wrapper
# vanilla-editor/src/utils/cssParser.js
```

**Deliverable:**
- CSSUtils funcionando standalone
- Parser de selectores CSS
- Match de reglas

---

### Fase 3: Class Manager (4-5 horas)

```bash
# 1. Crear componente
# vanilla-editor/src/components/ClassManager.js

# 2. UI en properties panel
# Sección dedicada a clases

# 3. Features:
# - List current classes
# - Add class (autocomplete)
# - Remove class
# - View styles per class
# - Validation (undefined classes)

# 4. Integration
# Agregar a properties panel
# Sync con undo/redo
```

**Deliverable:**
- Class Manager funcional
- Auto-completado de clases
- Validación de clases

---

### Fase 4: Testing (2-3 horas)

```bash
# 1. Unit tests
# tests/unit/cssParser.test.js

# 2. Integration tests
# tests/e2e/code-editor.spec.ts

# 3. Manual testing
# Validar todos los workflows

# 4. Documentation
# docs/editor/CODE_EDITOR_GUIDE.md
```

---

## 🎯 RESULTADO ESPERADO

### Features Nuevas

1. **Code Editor Tab**
   - Syntax highlighting (HTML, CSS)
   - Line numbers
   - Auto-indentation
   - Bracket matching

2. **CSS Class Manager**
   - Auto-completado de clases
   - Agregar/remover visualmente
   - Ver estilos por clase
   - Validación de clases undefined

3. **Better Properties Panel**
   - Origen de cada estilo
   - Cascada CSS visible
   - Editar estilos en origen

---

## 📈 COMPARACIÓN FINAL

### Antes (Actual)

```
Editor Visual
├── Drag & Drop ✅
├── 25 Templates ✅
├── Properties Panel (básico) ✅
├── Inline editing ✅
└── Code editor ❌
└── CSS parsing ❌
└── Class management ❌
```

### Después (Con Phoenix/CodeMirror)

```
Editor Visual + Code
├── Drag & Drop ✅
├── 25 Templates ✅
├── Properties Panel (mejorado) ✅✨
│   └── Class Manager ✨
│   └── Style cascade ✨
├── Inline editing ✅
├── Code editor ✅✨
│   ├── Syntax highlighting ✨
│   ├── Auto-complete ✨
│   └── Linting ✨
└── CSS parsing ✅✨
    ├── extractAllSelectors() ✨
    ├── findMatchingRules() ✨
    └── Class autocomplete ✨
```

---

## 📊 RECURSOS

### Phoenix Code
- **Website:** https://phcode.dev
- **GitHub:** https://github.com/phcode-dev/phoenix
- **Docs:** https://github.com/phcode-dev/phoenix/wiki
- **License:** MIT (Open Source)

### CodeMirror 6
- **Website:** https://codemirror.net/
- **GitHub:** https://github.com/codemirror/dev
- **Docs:** https://codemirror.net/docs/
- **NPM:** `codemirror`

### Brackets (Original)
- **GitHub:** https://github.com/adobe/brackets
- **Archive:** No longer maintained (replaced by Phoenix)

---

## ✅ RECOMENDACIÓN FINAL

### Enfoque Recomendado: Híbrido CodeMirror + Phoenix CSSUtils

**Por qué:**
1. ✅ CodeMirror 6 es ligero y moderno
2. ✅ CSSUtils de Phoenix es robusto y mantenido
3. ✅ Combinación da lo mejor de ambos
4. ✅ Implementable en 11-15 horas
5. ✅ Gran valor para usuarios

**ROI:**
- Tiempo: 11-15h desarrollo
- Beneficio: Editor profesional + Class management
- Users: Mucho mejor UX
- Competencia: Feature diferenciadora

---

**Próximo paso:** Implementar Fase 1 (CodeMirror 6 integration)

---

**Análisis completado:** 23/12/2024  
**Documento:** docs/editor/PHOENIX_CODE_ANALYSIS.md  
**Estado:** Ready for implementation
