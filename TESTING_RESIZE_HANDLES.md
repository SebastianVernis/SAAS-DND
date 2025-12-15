# 🧪 Testing Resize Handles - Instrucciones de Debug

**Fecha:** 15 Diciembre 2024  
**Commit:** Último  
**URL:** http://18.223.32.141/vanilla

---

## 🎯 Problema Reportado

**"Los handles aparecen pero no me permiten usarlos"**

---

## 🔍 Debug Step by Step

### Paso 1: Verificar que Handles Aparecen

1. Abrir http://18.223.32.141/vanilla
2. **Hard refresh:** Ctrl+Shift+R
3. Cargar plantilla "SaaS Product"
4. Click en cualquier elemento (botón, h2, section)

**Verificar:**
- ✅ Elemento tiene borde azul punteado (selected)
- ✅ 8 círculos azules aparecen en los bordes
- ✅ Círculos son visibles (12px, azul con borde blanco)

---

### Paso 2: Abrir DevTools Console

1. Presionar **F12**
2. Ir a tab **Console**
3. Seleccionar un elemento en el canvas

**Buscar en console:**
```
🎯 Selecting element: BUTTON element-123
🔧 ResizeManager available: true
✅ Resize enabled for element
🔍 Resize handles found: 8
🔧 Resize enabled for: BUTTON {...}
```

**Si NO aparece esto:** ResizeManager no se está inicializando correctamente.

---

### Paso 3: Verificar Click en Handle

1. Con elemento seleccionado y handles visibles
2. **Click en handle derecho** (círculo azul en el centro-derecha)
3. Ver console inmediatamente

**Debe aparecer:**
```
🖱️ Handle mousedown detected: e
🎬 Starting resize: e on BUTTON
```

**Si NO aparece:**
- El evento mousedown no se está disparando
- Puede estar bloqueado por otro listener
- O el handle no está recibiendo pointer-events

---

### Paso 4: Verificar Handle con Inspector

1. Click derecho en un handle azul
2. Seleccionar "Inspect Element" (Inspeccionar)
3. Verificar en Elements tab

**Debe ser algo como:**
```html
<div class="resize-handles" style="...">
  <div class="resize-handle resize-handle-nw" 
       data-handle="nw" 
       style="cursor: nw-resize;">
  </div>
  <div class="resize-handle resize-handle-e" 
       data-handle="e" 
       style="cursor: e-resize;">
  </div>
  <!-- ... 6 handles más -->
</div>
```

**Verificar computed styles del handle:**
```
position: absolute
width: 12px
height: 12px
background: #2563eb (azul)
border: 2px solid white
pointer-events: auto  ← CRÍTICO
z-index: 10000
cursor: e-resize (o el que corresponda)
```

---

### Paso 5: Test Manual de Evento

En Console, ejecutar:

```javascript
// 1. Obtener el handle
const handle = document.querySelector('.resize-handle-e');

// 2. Verificar que existe
console.log('Handle encontrado:', handle);

// 3. Ver computed styles
const styles = window.getComputedStyle(handle);
console.log('pointer-events:', styles.pointerEvents);  // Debe ser 'auto'
console.log('display:', styles.display);  // Debe ser 'block' o no 'none'
console.log('z-index:', styles.zIndex);  // Debe ser '10000'

// 4. Forzar evento click
handle.click();

// 5. Forzar evento mousedown
handle.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100
}));

// Debe aparecer en console:
// 🖱️ Handle mousedown detected: e
```

---

### Paso 6: Verificar Contenedor de Handles

```javascript
// 1. Obtener elemento seleccionado
const el = document.querySelector('.canvas-element.selected');

// 2. Obtener contenedor de handles
const container = el.querySelector('.resize-handles');
console.log('Container:', container);

// 3. Verificar styles del contenedor
const containerStyles = window.getComputedStyle(container);
console.log('Container display:', containerStyles.display);  // Debe ser 'block'
console.log('Container pointer-events:', containerStyles.pointerEvents);  // 'none' OK
console.log('Container z-index:', containerStyles.zIndex);  // Debe ser '10001'

// 4. Contar handles hijos
const handles = container.querySelectorAll('.resize-handle');
console.log('Handles count:', handles.length);  // Debe ser 8

// 5. Verificar cada handle
handles.forEach((h, i) => {
    const s = window.getComputedStyle(h);
    console.log(`Handle ${i}:`, {
        class: h.className,
        pointerEvents: s.pointerEvents,  // Debe ser 'auto'
        zIndex: s.zIndex,
        cursor: s.cursor
    });
});
```

---

### Paso 7: Verificar Conflictos de Event Listeners

```javascript
// 1. Ver todos los event listeners en el handle
const handle = document.querySelector('.resize-handle-e');

// Chrome DevTools: Elements → Event Listeners
// Debe haber:
// - mousedown (1) → Del ResizeManager

// Si hay múltiples mousedown, puede haber conflicto

// 2. Verificar elemento padre
const el = document.querySelector('.canvas-element.selected');
console.log('Element draggable:', el.draggable);  // Debe ser true

// 3. Verificar si dragstart se dispara al click en handle
// (No debería si el fix funcionó)
```

---

## 🐛 Posibles Causas

### Causa 1: pointer-events: none

**Síntoma:** Handles visibles pero no responden a click

**Verificar:**
```javascript
const handle = document.querySelector('.resize-handle');
window.getComputedStyle(handle).pointerEvents  // Debe ser 'auto'
```

**Fix:**
```css
.resize-handle {
    pointer-events: auto !important;
}
```

---

### Causa 2: Z-index Bajo

**Síntoma:** Otro elemento bloquea los handles

**Verificar:**
```javascript
const handle = document.querySelector('.resize-handle');
window.getComputedStyle(handle).zIndex  // Debe ser '10000'
```

**Fix:**
```css
.resize-handle {
    z-index: 10000 !important;
}
```

---

### Causa 3: Evento Bloqueado por Drag

**Síntoma:** Al click en handle, se activa dragstart

**Verificar en console:**
```
Al hacer click en handle, NO debe aparecer:
- dragstart event
- dragging-canvas-element class añadida
```

**Fix aplicado en script.js:**
```javascript
element.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('resize-handle') || 
        e.target.closest('.resize-handles')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // ...
});
```

---

### Causa 4: Handles Dentro de Elemento con Overflow Hidden

**Síntoma:** Handles se cortan o no son clickeables

**Verificar:**
```javascript
const el = document.querySelector('.canvas-element.selected');
window.getComputedStyle(el).overflow  // Si es 'hidden', puede cortar handles
```

**Fix temporal:**
```javascript
el.style.overflow = 'visible';
```

---

## 🔧 Fix Temporal (Si aún no funciona)

### Opción 1: Forzar Handles con Inline Events

Ejecutar en console:

```javascript
// Deshabilitar handles actuales
window.resizeManager.disableResize(selectedElement);

// Crear handles manualmente con inline handlers
const el = selectedElement;
const container = document.createElement('div');
container.className = 'resize-handles';
container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10001;display:block;';

const handle = document.createElement('div');
handle.className = 'resize-handle resize-handle-e';
handle.style.cssText = 'position:absolute;top:50%;right:-6px;transform:translateY(-50%);width:12px;height:12px;background:#2563eb;border:2px solid white;border-radius:50%;pointer-events:auto;z-index:10000;cursor:e-resize;';

handle.onmousedown = function(e) {
    console.log('MANUAL HANDLE CLICKED');
    e.preventDefault();
    e.stopPropagation();
    
    let startX = e.clientX;
    let startWidth = parseFloat(window.getComputedStyle(el).width);
    
    document.onmousemove = function(e2) {
        const deltaX = e2.clientX - startX;
        el.style.width = (startWidth + deltaX) + 'px';
    };
    
    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
        console.log('RESIZE COMPLETE');
    };
};

container.appendChild(handle);
el.appendChild(container);

console.log('✅ Manual handle created - try clicking it');
```

---

## 📸 Screenshots Requeridos

Por favor tomar y enviar:

1. **Elemento seleccionado con handles visibles**
2. **DevTools Console** mostrando logs al seleccionar
3. **DevTools Elements** inspeccionando un handle
4. **Computed styles** del handle (pointer-events, z-index)
5. **Console después de click en handle** (debe mostrar logs)

---

## 📊 Datos para Reportar

Por favor incluir en el reporte:

```
Navegador: [Chrome/Firefox versión]
OS: [Sistema operativo]

✅ Handles aparecen: Sí
❌ Handles responden a click: No

Console logs al seleccionar elemento:
[copiar logs completos]

Console logs al click en handle:
[copiar logs - debe mostrar "🖱️ Handle mousedown detected"]

Computed styles del handle:
pointer-events: [valor]
z-index: [valor]
display: [valor]
cursor: [valor]

Screenshot adjunto: [sí/no]
```

---

**Próximo paso:** Ejecutar estos tests y reportar resultados con screenshots.
