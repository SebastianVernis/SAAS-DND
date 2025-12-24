# 🔧 ANÁLISIS: Integración de Brackets Code Editor

**Fecha:** 23 de Diciembre 2024  
**Objetivo:** Mejorar parseo y gestión de clases CSS en el editor  
**Proyecto Fuente:** Adobe Brackets (Open Source)

---

## 📋 RESUMEN EJECUTIVO

### Contexto

**Editor Actual:**
- Vanilla JavaScript (~4,000 líneas)
- Gestión básica de clases con `classList`
- Sin parser CSS robusto
- Inline styles predominantes
- Panel de propiedades lee computed styles

**Oportunidad:**
Integrar componentes de parseo de **Adobe Brackets** para mejorar:
- Parseo de CSS (clases, selectores, reglas)
- Gestión inteligente de clases
- Auto-completado de propiedades CSS
- Validación de sintaxis

---

## 🔍 COMPONENTES CLAVE DE BRACKETS

### 1. CSSUtils.js - Parser CSS Robusto

**Ubicación:** `src/language/CSSUtils.js`  
**Tamaño:** ~1,800 líneas  
**Funciones Clave:**

#### extractAllSelectors()
```javascript
// Extrae todos los selectores de un stylesheet
function extractAllSelectors(text, mode) {
  var selectors = [];
  var mode = CodeMirror.getMode({}, "css");
  
  // Parse CSS usando CodeMirror
  var lines = CodeMirror.splitLines(text);
  var stream = new CodeMirror.StringStream(lines[0]);
  
  // Tokenize y extraer selectores
  // Returns: Array of {selector, line, declList, etc}
  return selectors;
}
```

**Beneficio:** Parseo preciso de selectores complejos (`.class1.class2`, `div > .class`, etc.)

---

#### findMatchingRules()
```javascript
// Encuentra reglas CSS que aplican a un selector específico
function findMatchingRules(text, selector, mode) {
  var allSelectors = extractAllSelectors(text, mode);
  
  // Regex para matching
  var classOrIdSelector = selector[0] === "." || selector[0] === "#";
  
  // Match selectores
  return matchedRules;
}
```

**Beneficio:** Identificar qué estilos aplican a un elemento

---

#### reduceStyleSheetForRegExParsing()
```javascript
// Limpia CSS para parsing con RegEx
function reduceStyleSheetForRegExParsing(text) {
  // Remueve comentarios
  // Remueve strings (content: '...')
  // Remueve urls (url('...'))
  return cleanedCSS;
}
```

**Beneficio:** Pre-procesamiento para análisis más confiable

---

### 2. HTMLUtils.js - Parser HTML

**Ubicación:** `src/language/HTMLUtils.js`  
**Tamaño:** ~600 líneas  
**Funciones Clave:**

#### getTagInfo()
```javascript
// Obtiene información completa de un tag y sus atributos
function getTagInfo(editor, pos, isHtmlMode) {
  return {
    tagName: "div",
    attr: {
      name: "class",
      value: "container flex",
      valueAssigned: true,
      quoteChar: '"',
      hasEndQuote: true
    },
    position: {
      tokenType: "ATTR_VALUE",
      offset: 5
    }
  };
}
```

**Beneficio:** Parseo preciso de atributos HTML (incluyendo `class=""`)

---

#### findStyleBlocks()
```javascript
// Encuentra todos los bloques <style> en HTML
function findStyleBlocks(editor) {
  return [
    {
      start: {line: 5, ch: 0},
      end: {line: 20, ch: 8},
      text: ".class { color: red; }"
    }
  ];
}
```

**Beneficio:** Extrae CSS inline de HTML

---

### 3. TokenUtils.js - Utilidades de Tokenización

**Funciones:**
- `getInitialContext()` - Contexto de token en posición
- `moveNextToken()` - Navegar tokens
- `movePrevToken()` - Retroceder tokens
- `offsetInToken()` - Offset dentro del token

**Beneficio:** Navegación precisa por código

---

## 🎯 CASOS DE USO EN NUESTRO EDITOR

### Caso 1: Panel de Propiedades Mejorado

**Situación Actual:**
```javascript
// script.js - Panel básico
const fontSize = window.getComputedStyle(element).fontSize;
const color = window.getComputedStyle(element).color;
```

**Con Brackets CSSUtils:**
```javascript
// Extraer TODAS las reglas que aplican al elemento
function getAllAppliedStyles(element) {
  // 1. Obtener todas las hojas de estilo
  const allStyles = Array.from(document.styleSheets)
    .map(sheet => sheet.cssText)
    .join('\n');
  
  // 2. Extraer selectores
  const selectors = CSSUtils.extractAllSelectors(allStyles, "css");
  
  // 3. Encontrar reglas que aplican a este elemento
  const elementClasses = Array.from(element.classList);
  const matchedRules = [];
  
  elementClasses.forEach(className => {
    const matches = CSSUtils.findMatchingRules(
      allStyles, 
      `.${className}`, 
      "css"
    );
    matchedRules.push(...matches);
  });
  
  // 4. Mostrar en panel: origen de cada estilo
  return {
    computed: window.getComputedStyle(element),
    rules: matchedRules  // Con línea, archivo, especificidad
  };
}
```

**Beneficio:**
- Ver de dónde viene cada estilo
- Mostrar cascada CSS completa
- Editar estilos en su origen

---

### Caso 2: Auto-Completado de Clases CSS

**Situación Actual:**
- Usuario tipea clases manualmente
- Sin sugerencias
- Sin validación

**Con Brackets:**
```javascript
// Extraer todas las clases definidas en stylesheets
function getAvailableCSSClasses() {
  const allStyles = getAllStylesheets();
  const selectors = CSSUtils.extractAllSelectors(allStyles, "css");
  
  // Filtrar solo clases
  const classes = selectors
    .map(s => s.selector)
    .filter(s => s.includes('.'))
    .map(s => {
      // Extraer clases del selector
      const matches = s.match(/\.([\w-]+)/g);
      return matches ? matches.map(m => m.substring(1)) : [];
    })
    .flat();
  
  return [...new Set(classes)];  // Unique classes
}

// En el panel de propiedades
<input 
  type="text" 
  id="class-input"
  list="available-classes"
  placeholder="Agregar clase..."
>
<datalist id="available-classes">
  ${getAvailableCSSClasses().map(c => `<option value="${c}">`).join('')}
</datalist>
```

**Beneficio:**
- Auto-completado de clases existentes
- Previene typos
- Descubre clases disponibles

---

### Caso 3: Validación de CSS

**Situación Actual:**
- Sin validación de sintaxis CSS
- Errores solo visibles al renderizar

**Con Brackets:**
```javascript
function validateCSSInlineStyle(styleString) {
  try {
    // Crear pseudo-CSS para parsing
    const cssText = `.temp { ${styleString} }`;
    
    // Usar CSSUtils para parsear
    const reduced = CSSUtils.reduceStyleSheetForRegExParsing(cssText);
    const selectors = CSSUtils.extractAllSelectors(reduced, "css");
    
    if (selectors.length === 0) {
      return { valid: false, error: "Sintaxis CSS inválida" };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// En el panel de propiedades
document.getElementById('style-input').addEventListener('blur', (e) => {
  const validation = validateCSSInlineStyle(e.target.value);
  
  if (!validation.valid) {
    showError(validation.error);
    e.target.classList.add('error');
  } else {
    e.target.classList.remove('error');
  }
});
```

**Beneficio:**
- Validación en tiempo real
- Feedback inmediato de errores
- Mejor UX

---

### Caso 4: Class Manager Inteligente

**Nuevo feature propuesto:**

```javascript
// Class Manager - Panel dedicado
class ClassManager {
  constructor(element) {
    this.element = element;
    this.availableClasses = this.extractAvailableClasses();
  }
  
  extractAvailableClasses() {
    // Usar CSSUtils para extraer todas las clases
    const allStyles = this.getAllStylesheets();
    return CSSUtils.extractAllSelectors(allStyles, "css")
      .filter(s => s.selector.includes('.'))
      .map(s => this.extractClassNames(s.selector))
      .flat();
  }
  
  addClass(className) {
    if (!this.availableClasses.includes(className)) {
      console.warn(`Class "${className}" not defined in stylesheets`);
    }
    this.element.classList.add(className);
    this.updatePanel();
  }
  
  removeClass(className) {
    this.element.classList.remove(className);
    this.updatePanel();
  }
  
  toggleClass(className) {
    this.element.classList.toggle(className);
    this.updatePanel();
  }
  
  getAppliedStyles() {
    // Para cada clase del elemento
    const classes = Array.from(this.element.classList);
    const styles = {};
    
    classes.forEach(className => {
      // Encontrar reglas que definen esta clase
      const rules = CSSUtils.findMatchingRules(
        this.getAllStylesheets(),
        `.${className}`,
        "css"
      );
      
      styles[className] = rules;
    });
    
    return styles;
  }
  
  renderPanel() {
    return `
      <div class="class-manager">
        <h3>Gestión de Clases</h3>
        
        <div class="current-classes">
          ${Array.from(this.element.classList).map(c => `
            <span class="class-tag">
              ${c}
              <button onclick="classManager.removeClass('${c}')">×</button>
            </span>
          `).join('')}
        </div>
        
        <input 
          type="text" 
          list="available-classes"
          placeholder="Agregar clase..."
          onchange="classManager.addClass(this.value); this.value='';"
        >
        
        <datalist id="available-classes">
          ${this.availableClasses.map(c => `<option value="${c}">`).join('')}
        </datalist>
        
        <div class="class-styles">
          <h4>Estilos Aplicados</h4>
          ${this.renderAppliedStyles()}
        </div>
      </div>
    `;
  }
}
```

**Beneficio:**
- Gestión visual de clases
- Ver estilos por clase
- Auto-completado inteligente
- Warnings de clases no definidas

---

## 🏗️ PLAN DE INTEGRACIÓN

### Fase 1: Extracción de Módulos (2-3 horas)

**Archivos a extraer de Brackets:**

1. **CSSUtils.js** (core)
   - `extractAllSelectors()`
   - `findMatchingRules()`
   - `reduceStyleSheetForRegExParsing()`
   - Dependencies: CodeMirror modes

2. **HTMLUtils.js** (opcional)
   - `getTagInfo()`
   - `findStyleBlocks()`
   - Para parseo de HTML + clases

3. **TokenUtils.js** (support)
   - Utilidades de tokenización
   - Navegación de tokens

**Adaptaciones necesarias:**
- Remover dependencies de Brackets (define/require AMD)
- Convertir a ES6 modules
- Adaptar para usar con DOM directo (no CodeMirror editor)

---

### Fase 2: Integración en Editor (3-4 horas)

**Crear nuevo módulo:**

```javascript
// vanilla-editor/src/utils/cssParser.js

import { extractAllSelectors, findMatchingRules } from './bracketsCSS.js';

export class CSSParser {
  constructor() {
    this.stylesheets = this.loadAllStylesheets();
    this.allSelectors = this.parseSelectors();
  }
  
  loadAllStylesheets() {
    // Combinar todos los <style> y <link> del documento
    const styleElements = Array.from(document.querySelectorAll('style'));
    const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    return {
      inline: styleElements.map(s => s.textContent).join('\n'),
      external: [] // Por ahora
    };
  }
  
  parseSelectors() {
    return extractAllSelectors(this.stylesheets.inline, "css");
  }
  
  getClassesForElement(element) {
    return Array.from(element.classList);
  }
  
  getAvailableClasses() {
    // Todas las clases definidas en CSS
    return this.allSelectors
      .map(s => this.extractClassNames(s.selector))
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i); // Unique
  }
  
  getStylesForClass(className) {
    return findMatchingRules(
      this.stylesheets.inline,
      `.${className}`,
      "css"
    );
  }
  
  extractClassNames(selector) {
    // Extraer clases de un selector
    const matches = selector.match(/\.([\w-]+)/g);
    return matches ? matches.map(m => m.substring(1)) : [];
  }
}
```

---

### Fase 3: UI Mejorada (2-3 horas)

**Agregar a Panel de Propiedades:**

```html
<!-- Sección de Clases en Properties Panel -->
<div id="classes-section" class="property-section">
  <div class="section-header" onclick="toggleSection('classes')">
    <span>🏷️ Clases CSS</span>
    <span class="toggle-icon">▼</span>
  </div>
  
  <div class="section-content">
    <!-- Classes aplicadas actualmente -->
    <div class="current-classes">
      <label>Clases Actuales:</label>
      <div id="class-tags-container">
        <!-- Generado dinámicamente -->
      </div>
    </div>
    
    <!-- Agregar nueva clase -->
    <div class="add-class">
      <input 
        type="text" 
        id="class-input"
        list="available-classes"
        placeholder="Agregar clase (auto-completado)"
      >
      <button onclick="addClass()">+</button>
    </div>
    
    <!-- Classes disponibles (datalist) -->
    <datalist id="available-classes">
      <!-- Generado dinámicamente con CSSParser -->
    </datalist>
    
    <!-- Ver estilos de cada clase -->
    <div class="class-styles-preview">
      <label>Vista previa de estilos:</label>
      <div id="class-styles-list">
        <!-- Para cada clase, mostrar sus estilos -->
      </div>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
const cssParser = new CSSParser();

function loadClassesSection() {
  if (!selectedElement) return;
  
  const classes = Array.from(selectedElement.classList);
  
  // Renderizar tags de clases actuales
  const tagsContainer = document.getElementById('class-tags-container');
  tagsContainer.innerHTML = classes.map(c => `
    <span class="class-tag">
      ${c}
      <button onclick="removeClass('${c}')" title="Remover clase">×</button>
    </span>
  `).join('');
  
  // Popular datalist con clases disponibles
  const datalist = document.getElementById('available-classes');
  const availableClasses = cssParser.getAvailableClasses();
  datalist.innerHTML = availableClasses.map(c => 
    `<option value="${c}">`
  ).join('');
  
  // Mostrar estilos aplicados
  renderClassStyles(classes);
}

function addClass() {
  const input = document.getElementById('class-input');
  const className = input.value.trim();
  
  if (className && selectedElement) {
    selectedElement.classList.add(className);
    input.value = '';
    loadClassesSection();
    
    // Guardar en historial
    undoRedo.saveState();
  }
}

function removeClass(className) {
  if (selectedElement) {
    selectedElement.classList.remove(className);
    loadClassesSection();
    undoRedo.saveState();
  }
}

function renderClassStyles(classes) {
  const container = document.getElementById('class-styles-list');
  
  container.innerHTML = classes.map(className => {
    const rules = cssParser.getStylesForClass(className);
    
    return `
      <div class="class-style-item">
        <div class="class-name">.${className}</div>
        ${rules.map(rule => `
          <div class="style-rule">
            ${renderCSSProperties(rule.properties)}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}
```

---

### Caso 2: CSS Class Autocomplete

**Input con auto-completado:**

```javascript
// Al tipear en class input
document.getElementById('class-input').addEventListener('input', (e) => {
  const value = e.target.value;
  const suggestions = cssParser.getAvailableClasses()
    .filter(c => c.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 10);
  
  // Mostrar dropdown de sugerencias
  showSuggestions(suggestions);
});
```

---

### Caso 3: Validación de Clases

**Alertar clases no definidas:**

```javascript
function validateClasses(element) {
  const classes = Array.from(element.classList);
  const availableClasses = cssParser.getAvailableClasses();
  const undefinedClasses = classes.filter(c => !availableClasses.includes(c));
  
  if (undefinedClasses.length > 0) {
    console.warn(`⚠️ Clases no definidas:`, undefinedClasses);
    
    // Mostrar en UI
    undefinedClasses.forEach(c => {
      const tag = document.querySelector(`.class-tag:contains('${c}')`);
      tag.classList.add('undefined');
      tag.title = 'Clase no definida en CSS';
    });
  }
}
```

---

## 📊 COMPARACIÓN: Antes vs Después

### Gestión de Clases

| Feature | Actual | Con Brackets |
|---------|--------|--------------|
| **Agregar clase** | Manual (`element.classList.add()`) | ✅ + Auto-completado |
| **Ver clases disponibles** | ❌ No | ✅ Lista completa |
| **Ver estilos de clase** | ❌ Solo computed | ✅ Rules + cascada |
| **Validación** | ❌ No | ✅ Alertas de undefined |
| **Auto-completado** | ❌ No | ✅ Basado en CSS real |
| **Origen de estilos** | ❌ No | ✅ Línea + archivo |

---

### Parseo CSS

| Feature | Actual | Con Brackets |
|---------|--------|--------------|
| **Parse selectores** | ❌ No | ✅ extractAllSelectors() |
| **Match rules** | ❌ No | ✅ findMatchingRules() |
| **Clean CSS** | ❌ No | ✅ reduceStyleSheet() |
| **Handle comments** | ❌ No | ✅ Automático |
| **Handle strings** | ❌ No | ✅ Automático |
| **Nested selectors** | ❌ No | ✅ SCSS/LESS support |

---

## 🔧 IMPLEMENTACIÓN RECOMENDADA

### Opción A: Integración Completa (Recomendado)

**Tiempo:** 8-10 horas  
**Complejidad:** Alta  
**Beneficio:** Máximo

**Steps:**
1. Extraer CSSUtils.js de Brackets
2. Adaptar a ES6 modules (remover AMD)
3. Integrar CodeMirror CSS mode (solo parsing, no editor)
4. Crear CSSParser class wrapper
5. Integrar en panel de propiedades
6. Crear Class Manager UI
7. Testing completo

**Deliverables:**
- `vanilla-editor/src/utils/cssParser.js` (nuevo)
- `vanilla-editor/src/utils/bracketsCSS.js` (adaptado)
- `vanilla-editor/src/components/ClassManager.js` (nuevo)
- Panel de propiedades mejorado
- Tests de parseo

---

### Opción B: Integración Ligera

**Tiempo:** 3-4 horas  
**Complejidad:** Media  
**Beneficio:** Moderado

**Steps:**
1. Extraer solo `extractAllSelectors()` de CSSUtils
2. Simplificar (usar regex en lugar de CodeMirror)
3. Implementar auto-completado básico
4. Agregar sección de clases a properties panel

**Deliverables:**
- `vanilla-editor/src/utils/simpleClassParser.js` (nuevo, ~200 líneas)
- Auto-completado de clases
- Sección de clases en panel

---

### Opción C: NPM Package (Más Fácil)

**Tiempo:** 1-2 horas  
**Complejidad:** Baja  
**Beneficio:** Básico

**Package:** `css-selector-parser` o `postcss`

```bash
npm install css-selector-parser
```

```javascript
import { parse } from 'css-selector-parser';

// Parse selector
const selector = parse('.class1.class2 > div');
console.log(selector);
// { type: 'selector', nodes: [...] }
```

**Pros:**
- Rápido de implementar
- Bien testeado
- Mantenido activamente

**Cons:**
- Menos control
- Dependencia externa
- Bundle size aumenta

---

## 💡 RECOMENDACIÓN FINAL

### Enfoque Híbrido (Recomendado)

**Fase 1: Quick Win (1-2 horas)**
- Usar NPM package para parsing básico
- Implementar auto-completado de clases
- Agregar sección de clases al panel

**Fase 2: Mejora Profunda (4-6 horas)**
- Extraer CSSUtils de Brackets (selectivo)
- Implementar Class Manager completo
- Validación de clases
- Ver cascada CSS

**Fase 3: Features Avanzadas (futuro)**
- CSS editing inline (como Brackets)
- Live CSS editing
- CSS refactoring tools

---

## 📦 ARCHIVOS A CREAR

### Estructura Propuesta

```
vanilla-editor/
└── src/
    ├── utils/
    │   ├── cssParser.js ✨ NEW
    │   └── bracketsCSS.js ✨ NEW (adaptado de Brackets)
    │
    ├── components/
    │   └── ClassManager.js ✨ NEW
    │
    └── core/
        └── (existing files)
```

---

## 🎯 BENEFICIOS DE LA INTEGRACIÓN

### Para Usuarios
1. ✅ Auto-completado de clases CSS
2. ✅ Gestión visual de clases
3. ✅ Ver estilos aplicados por clase
4. ✅ Validación en tiempo real
5. ✅ Mejor UX al editar estilos

### Para Desarrollo
1. ✅ Código más mantenible
2. ✅ Parser robusto y testeado
3. ✅ Extensible para futuras features
4. ✅ Base para CSS editing avanzado

### Para el Proyecto
1. ✅ Feature diferenciadora
2. ✅ Acercarse a editores profesionales
3. ✅ Mejor calidad de código
4. ✅ Preparado para features avanzadas

---

## 📊 ESTIMACIÓN DE ESFUERZO

| Enfoque | Tiempo | Complejidad | Beneficio | Prioridad |
|---------|--------|-------------|-----------|-----------|
| **Opción C (NPM)** | 1-2h | Baja | Básico | 🟢 Quick win |
| **Opción B (Light)** | 3-4h | Media | Moderado | 🟡 Good balance |
| **Opción A (Full)** | 8-10h | Alta | Máximo | 🔴 Long term |
| **Híbrido** | 3-4h + 4-6h | Media-Alta | Alto | ⭐ **Recomendado** |

---

## 🚀 PRÓXIMOS PASOS

### Inmediatos
1. Revisar y mergear PR #16 de Jules
2. Ejecutar tests E2E localmente
3. Validar estado del proyecto

### Corto Plazo (Esta semana)
4. Implementar Opción C (NPM package)
5. Agregar auto-completado de clases
6. Testear con usuarios

### Medio Plazo (Próximo sprint)
7. Extraer CSSUtils de Brackets
8. Implementar Class Manager completo
9. Mejorar panel de propiedades

---

## 📚 RECURSOS

**Brackets Source:**
- Repo: https://github.com/adobe/brackets
- CSSUtils: `src/language/CSSUtils.js`
- HTMLUtils: `src/language/HTMLUtils.js`
- TokenUtils: `src/utils/TokenUtils.js`

**NPM Alternatives:**
- css-selector-parser: https://www.npmjs.com/package/css-selector-parser
- postcss: https://postcss.org/
- stylis: https://www.npmjs.com/package/stylis

**Documentation:**
- Brackets Developer Guide: https://github.com/adobe/brackets/wiki
- CodeMirror CSS Mode: https://codemirror.net/5/mode/css/

---

**Análisis completado:** 23/12/2024  
**Siguiente:** Decidir enfoque e implementar  
**Estado:** Ready for implementation
