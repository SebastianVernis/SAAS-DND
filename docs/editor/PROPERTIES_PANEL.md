# 📋 Panel de Propiedades - Documentación Técnica

**Última actualización:** 14 Diciembre 2024  
**Versión:** 1.1.0  
**Archivo:** `vanilla-editor/script.js`

---

## 🎯 Descripción General

El Panel de Propiedades es una herramienta visual que permite editar en tiempo real las propiedades CSS de cualquier elemento seleccionado en el canvas del editor.

---

## 🔧 Funcionalidad

### Activación
- **Shortcut:** `Ctrl+P` (toggle)
- **Visual:** Panel lateral derecho
- **Estado inicial:** Oculto por defecto

### Selección de Elementos
Cuando un elemento del canvas es seleccionado (click):
1. Se ejecuta `selectElement(element)`
2. Se llama a `loadProperties(element)`
3. El panel se actualiza con las propiedades del elemento

---

## 📊 Secciones del Panel

### 1. **General**
- Tag HTML (readonly)
- ID del elemento
- Clases CSS

### 2. **Dimensiones**
- Ancho (width)
- Alto (height)
- Ancho máximo (maxWidth)
- Alto máximo (maxHeight)

### 3. **Espaciado**
- Padding (top, right, bottom, left)
- Margin (top, right, bottom, left)

### 4. **Posicionamiento**
- Display (block, inline-block, flex, grid, none)
- Position (static, relative, absolute, fixed)

### 5. **Tipografía** (solo elementos de texto)
- Font Size
- Font Weight (normal, medium, semibold, bold)
- Color (color picker)
- Text Align (left, center, right, justify)

**Aplica a:** `h1, h2, h3, h4, h5, h6, p, span, a, button, label`

### 6. **Fondo y Bordes**
- Background Color (color picker)
- Border Width (px)
- Border Style (none, solid, dashed, dotted)
- Border Color (color picker)
- Border Radius (px)

### 7. **Sombra y Efectos**
- Box Shadow (ninguna, sutil, media, fuerte)
- Opacity (slider 0-100%)

### 8. **Flexbox** (solo si display=flex)
- Flex Direction (row, column, row-reverse, column-reverse)
- Justify Content (flex-start, center, flex-end, space-between, space-around, space-evenly)
- Align Items (flex-start, center, flex-end, stretch, baseline)
- Align Content (flex-start, center, flex-end, space-between, space-around, stretch)
- Gap (px)

### 9. **Grid** (solo si display=grid)
- Grid Template Columns (ej: `1fr 1fr`)
- Grid Template Rows (ej: `auto auto`)
- Grid Gap (px)
- Justify Items (stretch, center, start, end)
- Align Items (stretch, center, start, end)

### 10. **Transiciones**
- Transition (ninguna, suave 0.3s, lenta 0.5s)

### 11. **Atributos Específicos**
- **Para `<img>`:** src, alt
- **Para `<a>`:** href, target
- **Para `<button>`:** type, disabled

---

## 🔄 Sistema de Lectura de Propiedades

### Problema Original
Al cargar plantillas o archivos externos, las propiedades no se mostraban porque solo se leían `element.style[property]` (inline styles seteados via JavaScript), pero las plantillas tienen estilos en el atributo HTML `style=""`.

### Solución: `getStyleValue()`

```javascript
const getStyleValue = (property, unit = '') => {
    let value = element.style[property];
    if (!value || value === '') {
        value = computedStyle[property];
    }
    if (unit && value && value.includes(unit)) {
        value = value.replace(unit, '');
    }
    return value || '';
};
```

**Lógica:**
1. **Prioridad 1:** Lee desde `element.style[property]` (inline styles editados)
2. **Prioridad 2:** Si vacío, lee desde `window.getComputedStyle(element)[property]` (estilos computados)
3. **Limpieza:** Remueve unidades si se especifica (`px`, `%`, etc.)
4. **Fallback:** Retorna string vacío

**Ventajas:**
- ✅ Lee estilos de plantillas HTML precargadas
- ✅ Lee estilos de archivos externos cargados
- ✅ Lee estilos de elementos creados via drag & drop
- ✅ Respeta inline styles editados previamente
- ✅ Maneja valores computados del navegador

---

## ⚙️ Sistema de Actualización

### `updateStyle(property, value)`

**Función:**
```javascript
function updateStyle(property, value) {
    if (selectedElement) {
        selectedElement.style[property] = value;
        // Recargar propiedades si cambia display
        if (property === 'display') {
            loadProperties(selectedElement);
        }
    }
}
```

**Comportamiento:**
- Aplica cambios directamente a `element.style[property]`
- Los cambios son inline styles que tienen máxima prioridad CSS
- Si cambia `display`, recarga el panel (para mostrar/ocultar Flexbox/Grid)
- Cambios son instantáneos y visibles en el canvas

### `updateAttribute(attribute, value)`

**Función:**
```javascript
function updateAttribute(attribute, value) {
    if (selectedElement) {
        if (attribute === 'class') {
            selectedElement.className = 'canvas-element selected ' + value;
        } else {
            selectedElement.setAttribute(attribute, value);
        }
    }
}
```

**Comportamiento:**
- Para `class`: preserva clases del sistema (`canvas-element`, `selected`)
- Para otros atributos: usa `setAttribute()`
- Cambios son inmediatos

---

## 🎨 Helpers de Color

### `rgbToHex(rgb)`

Convierte valores `rgb(r, g, b)` o `rgba(r, g, b, a)` a formato hexadecimal para color pickers.

**Ejemplos:**
```javascript
rgbToHex('rgb(255, 0, 0)')      // → '#ff0000'
rgbToHex('rgba(0, 255, 0, 0.5)') // → '#00ff00'
rgbToHex('#0000ff')              // → '#0000ff' (ya es hex)
```

**Ubicación:** Línea ~2140 en `script.js`

---

## 🐛 Debug y Logging

### Console Logs

Al seleccionar un elemento, se imprime en consola:

```javascript
console.log('📋 Loading properties for:', tagName, {
    fontSize: getStyleValue('fontSize'),
    padding: getStyleValue('padding'),
    backgroundColor: getStyleValue('backgroundColor'),
    display: getStyleValue('display')
});
```

**Ejemplo de salida:**
```
📋 Loading properties for: h2 {
  fontSize: "56px",
  padding: "0px",
  backgroundColor: "rgba(0, 0, 0, 0)",
  display: "block"
}
```

**Utilidad:**
- Verificar que los valores se están leyendo correctamente
- Debugging de problemas de lectura de estilos
- Confirmar que `getComputedStyle()` funciona

---

## 📍 Casos de Uso

### 1. Plantillas Precargadas

**Escenario:** Usuario carga plantilla "SaaS Product"

**Proceso:**
1. `loadTemplate('saas-landing')` inserta HTML en canvas
2. Cada elemento tiene estilos inline en HTML: `style="font-size: 56px; ..."`
3. Usuario hace click en `<h2>`
4. `selectElement(h2)` → `loadProperties(h2)`
5. `getStyleValue('fontSize')` lee `computedStyle.fontSize` → `"56px"`
6. Panel muestra `56px` en input de Font Size ✅

### 2. Elementos Creados via Drag & Drop

**Escenario:** Usuario arrastra componente "Botón" al canvas

**Proceso:**
1. `createComponentElement('button')` crea elemento
2. Elemento tiene estilos inline seteados via JS: `element.style.padding = '12px 24px'`
3. Usuario selecciona el botón
4. `getStyleValue('padding')` lee `element.style.padding` → `"12px 24px"`
5. Panel muestra valores de padding correctamente ✅

### 3. Archivos HTML Externos

**Escenario:** Usuario carga archivo HTML desde su computadora

**Proceso:**
1. File Loader lee el HTML y lo inserta en canvas
2. Elementos tienen estilos inline o clases CSS
3. Usuario selecciona un elemento
4. `getStyleValue()` lee estilos computados del navegador
5. Panel muestra propiedades reales aplicadas ✅

### 4. Edición de Propiedades

**Escenario:** Usuario cambia font-size de 56px a 64px

**Proceso:**
1. Usuario edita input en panel: `64px`
2. Evento `onchange` ejecuta: `updateStyle('fontSize', '64px')`
3. Se aplica: `element.style.fontSize = '64px'`
4. Canvas actualiza visualmente ✅
5. En próxima selección, `getStyleValue('fontSize')` retorna `"64px"` desde inline style

---

## ⚠️ Limitaciones Conocidas

### 1. Estilos Shorthand
**Problema:** Propiedades shorthand como `padding: 20px 40px` no se descomponen automáticamente.

**Workaround:** El panel muestra inputs separados (paddingTop, paddingRight, etc.) que leen los valores computados individuales.

### 2. Propiedades No Soportadas
El panel no incluye (aún):
- Transform (rotate, scale, translate)
- Filter (blur, brightness, contrast)
- Clip-path
- Pseudo-elementos (::before, ::after)

### 3. Unidades Relativas
**Problema:** Valores como `1rem`, `2em`, `50%` se convierten a px en computed styles.

**Ejemplo:**
- HTML: `font-size: 2rem`
- Computed: `font-size: 32px`
- Panel muestra: `32px`

**Impacto:** Al editar, se guarda en px absolutos, perdiendo la relatividad.

### 4. Variables CSS
**Problema:** Variables como `var(--primary-color)` se resuelven a su valor final.

**Ejemplo:**
- CSS: `color: var(--primary-color)`
- Computed: `color: rgb(102, 126, 234)`
- Panel muestra: `#667eea`

---

## 🧪 Testing

### Test Manual Básico

**Checklist:**
1. ✅ Cargar plantilla "SaaS Product"
2. ✅ Click en `<h2>` del hero → Panel muestra `font-size: 56px`
3. ✅ Cambiar a `64px` → Se aplica visualmente
4. ✅ Deseleccionar y reseleccionar → Muestra `64px`
5. ✅ Click en `<section>` → Panel muestra `padding: 80px 20px`
6. ✅ Cambiar display a `flex` → Aparece sección Flexbox
7. ✅ Ajustar justify-content → Se aplica al layout

### Test con Archivo Externo

**Checklist:**
1. ✅ Crear HTML simple con estilos inline
2. ✅ Cargar con File Loader
3. ✅ Seleccionar elementos → Propiedades se cargan
4. ✅ Editar propiedades → Cambios se aplican

### Casos Edge

**Test de valores vacíos:**
- Elemento sin estilos → Panel muestra valores por defecto del navegador

**Test de múltiples unidades:**
- `padding: 20px 40px` → Cada lado se lee correctamente

**Test de colores:**
- `rgb(255, 0, 0)` → Se convierte a `#ff0000` en color picker
- `rgba(0, 0, 0, 0.5)` → Se convierte a `#000000` (opacidad separada)

---

## 🔧 Troubleshooting

### Panel no se abre
**Causa:** JavaScript error o panel no existe en DOM

**Solución:**
```javascript
// Verificar en consola
document.getElementById('properties-panel') // Debe existir
```

### Propiedades aparecen vacías
**Causa:** `getComputedStyle()` no funciona o elemento no está en DOM

**Debug:**
```javascript
// En consola del navegador
const el = document.querySelector('.selected');
window.getComputedStyle(el).fontSize; // Debe retornar valor
```

### Cambios no se aplican
**Causa:** `selectedElement` es null o updateStyle no está definido

**Debug:**
```javascript
// En consola
selectedElement // Debe ser un elemento DOM
typeof window.updateStyle // Debe ser 'function'
```

### Color picker no muestra color correcto
**Causa:** Color en formato no hexadecimal

**Solución:** Verificar que `rgbToHex()` está funcionando

```javascript
// Test en consola
rgbToHex('rgb(255, 0, 0)') // Debe retornar '#ff0000'
```

---

## 📚 Referencias

### Funciones Relacionadas

- `selectElement(element)` - Línea ~1646
- `loadProperties(element)` - Línea ~1700
- `updateStyle(property, value)` - Línea ~2069
- `updateAttribute(attribute, value)` - Línea ~2080
- `getStyleValue(property, unit)` - Línea ~1706 (helper interno)
- `rgbToHex(rgb)` - Línea ~2140

### Variables Globales

- `selectedElement` - Elemento actualmente seleccionado
- `window.updateStyle` - Expuesta globalmente para onchange inline
- `window.updateAttribute` - Expuesta globalmente para onchange inline

### Eventos

- `onclick="updateStyle('property', value)"` - Inline en HTML del panel
- `onchange="updateStyle('property', this.value)"` - Inputs del panel

---

## 📝 Changelog

### v1.1.0 (14 Dic 2024)
- ✅ **FIX:** Agregado helper `getStyleValue()` para leer computed styles
- ✅ **FEAT:** Ahora lee propiedades de plantillas y archivos externos
- ✅ **DEBUG:** Agregado console.log para verificar lectura
- ✅ **DOCS:** Documentación completa creada

### v1.0.0 (13 Dic 2024)
- ✅ Panel de propiedades básico funcional
- ✅ Secciones: General, Dimensiones, Espaciado, Posicionamiento, Tipografía, Fondo/Bordes, Sombra, Flexbox, Grid, Transiciones, Atributos
- ✅ Shortcuts (Ctrl+P)
- ✅ Integración con selectElement()

---

## 🤝 Contribuir

### Agregar Nueva Propiedad CSS

1. **Ubicar sección apropiada** en `loadProperties()`
2. **Leer valor con helper:**
   ```javascript
   const miPropiedad = getStyleValue('miPropiedad', 'unidad');
   ```
3. **Agregar HTML al panel:**
   ```javascript
   html += `<div class="property-group">
               <label class="property-label">Mi Propiedad</label>
               <input class="property-input" value="${miPropiedad}" 
                      onchange="updateStyle('miPropiedad', this.value)">
            </div>`;
   ```

### Agregar Nueva Sección

```javascript
html += '<div class="property-section">';
html += '<div class="section-title">Mi Sección</div>';
// ... agregar property-groups aquí ...
html += '</div>';
```

---

## 📧 Contacto y Soporte

**Issues:** https://github.com/SebastianVernis/SAAS-DND/issues  
**Docs:** `/docs/editor/PROPERTIES_PANEL.md`  
**Autor:** Sebastian Vernis

---

**Última actualización:** 14 Diciembre 2024  
**Versión del documento:** 1.0.0
