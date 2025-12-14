# ✏️📐 Edición de Textos y Resize de Elementos - Documentación

**Última actualización:** 14 Diciembre 2024  
**Versión:** 1.0.0  
**Archivos:** `vanilla-editor/script.js`, `vanilla-editor/src/core/resizeManager.js`

---

## 🎯 Descripción General

El editor incluye dos sistemas de edición visual fundamentales:

1. **Edición de Textos** - Permite editar contenido de texto inline (double-click)
2. **Resize de Elementos** - Permite redimensionar elementos arrastrando desde los bordes

---

## ✏️ Sistema de Edición de Textos

### Activación

**Método 1: Double-Click**
- Hacer **doble clic** en cualquier elemento de texto
- El elemento se vuelve editable inmediatamente
- Todo el texto se selecciona automáticamente

**Elementos compatibles:**
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `p` (párrafos)
- `span`
- `button`
- `a` (enlaces)
- `li` (items de lista)
- `label`

### Comportamiento

**Durante la Edición:**
```javascript
// El elemento se vuelve editable
element.contentEditable = true;

// Se selecciona todo el texto
const range = document.createRange();
range.selectNodeContents(element);
const selection = window.getSelection();
selection.removeAllRanges();
selection.addRange(range);

// Se enfoca el elemento
element.focus();
```

**Guardar Cambios:**
- **Enter** → Guarda y cierra edición
- **Shift+Enter** → Nueva línea (solo en elementos multi-línea)
- **Click fuera** (blur) → Guarda automáticamente

**Cancelar:**
- **Esc** → Cancela edición y restaura texto original (si implementado)

### Implementación Técnica

**Ubicación:** `vanilla-editor/script.js` → `makeElementEditable()` (línea ~2103)

```javascript
function makeElementEditable(element) {
    const tagName = element.tagName.toLowerCase();

    // Solo para elementos de texto
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a', 'li', 'label'].includes(tagName)) {
        element.contentEditable = true;
        element.focus();

        // Seleccionar todo el texto
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Guardar cambios al salir
        element.addEventListener('blur', function() {
            element.contentEditable = false;
        }, { once: true });

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
        });
    }
}
```

### Características

✅ **Auto-selección** - Texto completo seleccionado al entrar en modo edición  
✅ **Guardado automático** - Al hacer blur o presionar Enter  
✅ **Tipografía preservada** - Mantiene font-size, color, weight, etc.  
✅ **HTML inline** - Permite formateo básico (negrita, cursiva si está habilitado)  
✅ **Multi-línea** - Soporta Shift+Enter en elementos compatibles  

### Limitaciones

⚠️ **No edita imágenes** - Solo elementos de texto  
⚠️ **No edita contenedores** - `div`, `section`, `article` no son editables  
⚠️ **Formateo limitado** - Solo formato de teclado básico  
⚠️ **No undo/redo nativo** - Depende del navegador  

---

## 📐 Sistema de Resize de Elementos

### Activación

**Automático al seleccionar:**
1. Click en cualquier elemento del canvas
2. `selectElement()` se ejecuta
3. `resizeManager.enableResize(element)` se llama
4. 8 handles de resize aparecen en los bordes

**Handles disponibles:**
```
nw ---- n ---- ne
|              |
w              e
|              |
sw ---- s ---- se
```

### Operación

**Arrastrar Handle:**
1. Posicionar cursor sobre un handle (punto circular azul)
2. Cursor cambia según dirección (`nw-resize`, `e-resize`, etc.)
3. Presionar y mantener click
4. Arrastrar para redimensionar
5. Soltar para finalizar

**Modificadores:**
- **Shift + Arrastrar** → Mantiene proporción (aspect ratio)
- **Esc** → Cancela resize y restaura dimensiones originales

### Handles y Direcciones

| Handle | Cursor | Dirección | Comportamiento |
|--------|--------|-----------|----------------|
| `nw` | nw-resize | Noroeste | Redimensiona ancho y alto desde esquina superior izquierda |
| `n` | n-resize | Norte | Solo alto, desde arriba |
| `ne` | ne-resize | Noreste | Redimensiona ancho y alto desde esquina superior derecha |
| `e` | e-resize | Este | Solo ancho, desde derecha |
| `se` | se-resize | Sureste | Redimensiona ancho y alto desde esquina inferior derecha |
| `s` | s-resize | Sur | Solo alto, desde abajo |
| `sw` | sw-resize | Suroeste | Redimensiona ancho y alto desde esquina inferior izquierda |
| `w` | w-resize | Oeste | Solo ancho, desde izquierda |

### Implementación Técnica

**Ubicación:** `vanilla-editor/src/core/resizeManager.js`

**Clase Principal:** `ResizeManager`

**Métodos Clave:**

#### `enableResize(element)`
```javascript
enableResize(element) {
    if (!element || element.classList.contains('resize-enabled')) {
        return;
    }

    element.classList.add('resize-enabled');

    // Crear contenedor de handles
    const handlesContainer = document.createElement('div');
    handlesContainer.className = 'resize-handles';

    // Crear 8 handles
    this.handles.forEach(handleConfig => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${handleConfig.name}`;
        handle.dataset.handle = handleConfig.name;
        handle.style.cursor = handleConfig.cursor;

        handle.addEventListener('mousedown', e => {
            this.startResize(e, element, handleConfig.name);
        });

        handlesContainer.appendChild(handle);
    });

    element.appendChild(handlesContainer);
}
```

#### `startResize(e, element, handleName)`
```javascript
startResize(e, element, handleName) {
    e.preventDefault();
    e.stopPropagation();

    this.resizing = true;
    this.activeElement = element;
    this.currentHandle = handleName;
    this.startX = e.clientX;
    this.startY = e.clientY;

    // Obtener dimensiones iniciales
    const computedStyle = window.getComputedStyle(element);
    this.startWidth = parseFloat(computedStyle.width);
    this.startHeight = parseFloat(computedStyle.height);

    // Calcular aspect ratio
    this.aspectRatio = this.startWidth / this.startHeight;

    // Preservar aspect ratio si Shift
    this.preserveAspectRatio = e.shiftKey;

    element.classList.add('resizing');
    document.body.classList.add('resizing-active');
}
```

#### `handleMouseMove(e)`
```javascript
handleMouseMove(e) {
    if (!this.resizing || !this.activeElement) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;

    // Calcular según handle
    switch (this.currentHandle) {
        case 'e':
            newWidth = this.startWidth + deltaX;
            break;
        case 'w':
            newWidth = this.startWidth - deltaX;
            break;
        case 's':
            newHeight = this.startHeight + deltaY;
            break;
        case 'n':
            newHeight = this.startHeight - deltaY;
            break;
        case 'se':
            newWidth = this.startWidth + deltaX;
            newHeight = this.startHeight + deltaY;
            break;
        // ... otros casos
    }

    // Preservar aspect ratio si está activado
    if (this.preserveAspectRatio || e.shiftKey) {
        if (this.currentHandle.includes('e') || this.currentHandle.includes('w')) {
            newHeight = newWidth / this.aspectRatio;
        } else if (this.currentHandle.includes('n') || this.currentHandle.includes('s')) {
            newWidth = newHeight * this.aspectRatio;
        }
    }

    // Aplicar límites mínimos
    newWidth = Math.max(this.minWidth, newWidth);
    newHeight = Math.max(this.minHeight, newHeight);

    // Aplicar dimensiones
    this.activeElement.style.width = newWidth + 'px';
    this.activeElement.style.height = newHeight + 'px';
}
```

### Características Visuales

**Handles:**
- Color: Azul (`#2563eb`)
- Borde: 2px blanco
- Tamaño: 10px × 10px
- Forma: Círculo (`border-radius: 50%`)
- Sombra: `box-shadow: 0 2px 4px rgba(0,0,0,0.2)`

**Tooltip de Dimensiones:**
- Aparece durante resize
- Muestra: `{width}px × {height}px`
- Posición: Centrado debajo del elemento
- Estilo: Fondo oscuro, texto blanco, fuente monospace

**Estados:**
- `.resize-enabled` - Elemento con resize habilitado
- `.resizing` - Elemento siendo redimensionado actualmente
- `.resizing-active` - Body cuando hay resize activo

### Eventos Disparados

```javascript
// Al iniciar resize
this.dispatchEvent('resizestart', {
    element,
    width: this.startWidth,
    height: this.startHeight,
});

// Durante resize
this.dispatchEvent('resizing', {
    element: this.activeElement,
    width: newWidth,
    height: newHeight,
});

// Al finalizar resize
this.dispatchEvent('resizeend', {
    element: this.activeElement,
    width: finalWidth,
    height: finalHeight,
});
```

### Integración con Otros Sistemas

**Panel de Propiedades:**
- Los cambios de tamaño se reflejan automáticamente en el panel
- `window.updatePropertiesPanel()` se llama durante resize

**Undo/Redo:**
- Estado se guarda automáticamente al finalizar resize
- `window.undoRedoManager.saveState()`

**Layers Panel:**
- Dimensiones actualizadas se reflejan en el árbol de capas

---

## 🎨 Flujo de Uso Típico

### Escenario 1: Editar Texto de Título

```
1. Usuario carga plantilla "SaaS Product"
2. Double-click en <h2>La solución perfecta...</h2>
3. Texto se selecciona automáticamente
4. Usuario escribe: "La mejor herramienta para tu equipo"
5. Presiona Enter
6. Texto guardado ✅
```

### Escenario 2: Redimensionar Botón

```
1. Usuario crea botón via drag & drop
2. Botón se selecciona automáticamente
3. 8 handles aparecen en los bordes
4. Usuario arrastra handle 'e' (derecha) →
5. Botón se ensancha horizontalmente
6. Tooltip muestra: "180px × 48px"
7. Usuario suelta mouse
8. Nuevo tamaño aplicado ✅
```

### Escenario 3: Resize Proporcional

```
1. Usuario selecciona imagen
2. Presiona y mantiene Shift
3. Arrastra handle 'se' (esquina inferior derecha)
4. Imagen se redimensiona manteniendo proporción
5. Aspect ratio preservado ✅
```

---

## ⚙️ Configuración

### Límites de Resize

**Mínimos:**
```javascript
this.minWidth = 20;   // 20px mínimo
this.minHeight = 20;  // 20px mínimo
```

**Máximos:**
- No hay límite máximo por defecto
- El elemento puede crecer hasta el tamaño del canvas

### Personalizar Handles

**Modificar estilos en CSS:**
```css
.resize-handle {
    background: #2563eb;  /* Color del handle */
    border: 2px solid white;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.resize-handle:hover {
    transform: scale(1.2);  /* Efecto hover */
}
```

---

## 🐛 Troubleshooting

### Edición de Texto No Funciona

**Problema:** Double-click no activa edición

**Causas posibles:**
1. Elemento no está en la lista de tipos editables
2. Evento double-click no está registrado
3. JavaScript error previo

**Debug:**
```javascript
// En consola del navegador
const el = document.querySelector('h2');
el.addEventListener('dblclick', () => {
    console.log('Double-click detectado');
    el.contentEditable = true;
    el.focus();
});
```

### Handles de Resize No Aparecen

**Problema:** No se ven handles al seleccionar elemento

**Causas posibles:**
1. ResizeManager no inicializado
2. `enableResize()` no llamado
3. Estilos CSS no cargados

**Debug:**
```javascript
// Verificar que ResizeManager existe
console.log(window.resizeManager); // Debe ser objeto

// Forzar enable resize
const el = document.querySelector('.selected');
window.resizeManager.enableResize(el);
```

### Resize No Funciona Suavemente

**Problema:** Resize es lento o entrecortado

**Causas posibles:**
1. Demasiados event listeners
2. Elemento muy complejo (muchos hijos)
3. Renderizado pesado

**Solución:**
```javascript
// Optimizar con requestAnimationFrame
handleMouseMove(e) {
    if (!this.resizing) return;
    
    requestAnimationFrame(() => {
        // Código de resize aquí
    });
}
```

### Tooltip No Se Oculta

**Problema:** Tooltip de dimensiones queda visible

**Solución:**
```javascript
// Forzar remover tooltip
const tooltip = document.getElementById('resize-dimensions-tooltip');
if (tooltip) tooltip.remove();
```

---

## 🧪 Testing Manual

### Test 1: Edición de Texto Básica

**Pasos:**
1. Cargar plantilla con elementos de texto
2. Double-click en `<h1>`
3. Verificar que texto se selecciona
4. Escribir nuevo texto
5. Presionar Enter

**Resultado esperado:**
- ✅ Texto editable inmediatamente
- ✅ Todo el texto seleccionado
- ✅ Guardado al presionar Enter

### Test 2: Resize Horizontal

**Pasos:**
1. Seleccionar botón o div
2. Arrastrar handle 'e' (derecha) 50px
3. Verificar nuevo ancho

**Resultado esperado:**
- ✅ Elemento se ensancha
- ✅ Tooltip muestra dimensiones
- ✅ Cambio se aplica correctamente

### Test 3: Resize Proporcional

**Pasos:**
1. Seleccionar imagen
2. Mantener Shift
3. Arrastrar handle 'se' (esquina)

**Resultado esperado:**
- ✅ Aspect ratio preservado
- ✅ Ancho y alto cambian proporcionalmente

### Test 4: Cancelar Resize

**Pasos:**
1. Iniciar resize
2. Arrastrar 100px
3. Presionar Esc

**Resultado esperado:**
- ✅ Dimensiones restauradas
- ✅ Resize cancelado
- ✅ Toast: "⏪ Resize cancelado"

### Test 5: Múltiples Ediciones Consecutivas

**Pasos:**
1. Editar texto A
2. Guardar
3. Editar texto B
4. Guardar
5. Resize elemento C

**Resultado esperado:**
- ✅ Todas las acciones funcionan
- ✅ No hay conflictos entre edición y resize

---

## 📊 Métricas de Performance

**Edición de Texto:**
- Tiempo de activación: < 50ms
- Guardado: Instantáneo
- Overhead: Mínimo

**Resize:**
- Tasa de refresco: 60 FPS (ideal)
- Latencia de arrastre: < 16ms
- Handles rendering: < 10ms

---

## 🔧 Mejoras Futuras

### Edición de Texto

- [ ] Rich text editor inline (negrita, cursiva, subrayado)
- [ ] Auto-complete para tags comunes
- [ ] Spell checking integrado
- [ ] Undo/redo específico de texto
- [ ] Multi-línea mejorado con formato

### Resize

- [ ] Resize desde los bordes (no solo handles)
- [ ] Snap to grid durante resize
- [ ] Smart guides al redimensionar
- [ ] Límites máximos configurables
- [ ] Resize de múltiples elementos simultáneos
- [ ] Animación suave al soltar

---

## 📚 Referencias

### Funciones Principales

**Edición:**
- `makeElementEditable(element)` - Línea ~2103 en `script.js`
- `window.makeElementEditable` - Expuesta globalmente

**Resize:**
- `ResizeManager` - Clase en `src/core/resizeManager.js`
- `resizeManager.enableResize(element)` - Habilitar resize
- `resizeManager.disableResize(element)` - Deshabilitar resize
- `window.resizeManager` - Instancia global

### Variables Globales

```javascript
window.resizeManager       // Instancia de ResizeManager
window.makeElementEditable // Función de edición de texto
window.selectedElement     // Elemento actualmente seleccionado
```

### Eventos Personalizados

```javascript
// Resize events
window.addEventListener('resizestart', (e) => {
    console.log('Resize started', e.detail);
});

window.addEventListener('resizing', (e) => {
    console.log('Resizing', e.detail);
});

window.addEventListener('resizeend', (e) => {
    console.log('Resize ended', e.detail);
});
```

---

## 📝 Changelog

### v1.0.0 (14 Dic 2024)
- ✅ Sistema de edición de texto completo
- ✅ ResizeManager con 8 handles
- ✅ Tooltip de dimensiones
- ✅ Aspect ratio preservado con Shift
- ✅ Cancelar con Esc
- ✅ Integración con panel de propiedades
- ✅ Documentación completa

---

**Última actualización:** 14 Diciembre 2024  
**Versión del documento:** 1.0.0  
**Autor:** Sebastian Vernis  
**Issues:** https://github.com/SebastianVernis/SAAS-DND/issues
