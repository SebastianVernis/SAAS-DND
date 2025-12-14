---
name: Text Editing & Resize Testing
about: Test manual de edición de textos y redimensionamiento de elementos
title: '[TEST] Validar Edición de Textos y Sistema de Resize'
labels: 'testing, jules, editor, high-priority'
assignees: ''
---

## 🧪 Testing de Edición de Textos y Resize - Editor Vanilla

**Fecha:** 14 Diciembre 2024  
**Versión:** 1.0.0  
**Documentación:** `/docs/editor/TEXT_EDITING_AND_RESIZE.md`

---

## 📋 Contexto

El editor vanilla incluye dos sistemas de edición visual:

1. **Edición de Textos** - Double-click para editar contenido inline
2. **Resize de Elementos** - 8 handles direccionales para redimensionar

Ambos sistemas están implementados y requieren validación manual en navegador.

---

## 🎯 Objetivo del Testing

Validar que:
- La edición de textos funciona en todos los elementos compatibles
- Los 8 handles de resize aparecen y funcionan correctamente
- Las funcionalidades no interfieren entre sí
- Los cambios persisten y se reflejan en el panel de propiedades

---

## 🌐 URLs de Testing

**Editor:** http://18.223.32.141/vanilla

---

## ✅ Test Suite 1: Edición de Textos

### Test 1.1: Editar Título (H1)

**Pasos:**
1. Cargar http://18.223.32.141/vanilla
2. Cargar plantilla "Landing Page SaaS"
3. **Double-click** en el `<h1>` del navbar ("TuProducto")
4. Verificar que se activa `contentEditable`
5. Escribir: "MiProducto"
6. Presionar **Enter**

**Resultados esperados:**
- ✅ Al hacer double-click, todo el texto se selecciona
- ✅ Cursor parpadeante visible
- ✅ Se puede escribir normalmente
- ✅ Al presionar Enter, se guarda y sale de edición
- ✅ Nuevo texto visible: "MiProducto"
- ✅ Estilos preservados (color, tamaño, peso)

**Screenshot:** Capturar antes/después de edición

---

### Test 1.2: Editar Párrafo (P)

**Pasos:**
1. Double-click en `<p>` (descripción de hero)
2. Escribir nuevo texto
3. **Click fuera** del elemento (en canvas vacío)

**Resultados esperados:**
- ✅ Texto editable
- ✅ Al hacer click fuera, se guarda automáticamente (blur)
- ✅ `contentEditable` se desactiva
- ✅ Cambios persisten

---

### Test 1.3: Editar Botón

**Pasos:**
1. Double-click en `<button>`
2. Cambiar texto de "Comienza gratis" a "Prueba ahora"
3. Presionar Enter

**Resultados esperados:**
- ✅ Botón editable
- ✅ Texto cambia correctamente
- ✅ Estilos del botón intactos

---

### Test 1.4: Editar Múltiples Elementos

**Pasos:**
1. Editar `<h2>` → Guardar
2. Editar `<p>` → Guardar
3. Editar `<button>` → Guardar
4. Verificar cambios

**Resultados esperados:**
- ✅ Todas las ediciones se guardan
- ✅ No hay conflictos entre elementos
- ✅ Texto anterior no se restaura

---

### Test 1.5: Elementos NO Editables

**Pasos:**
1. Double-click en `<div>` (contenedor)
2. Double-click en `<section>`
3. Double-click en `<nav>`

**Resultados esperados:**
- ✅ NO se activa edición
- ✅ Elementos siguen seleccionados normalmente
- ✅ No hay errores en consola

**Confirmación:** Solo elementos de texto (`h1-h6`, `p`, `span`, `button`, `a`, `li`, `label`) deben ser editables.

---

## ✅ Test Suite 2: Resize de Elementos

### Test 2.1: Aparición de Handles

**Pasos:**
1. Cargar plantilla "SaaS Product"
2. **Click simple** en cualquier elemento (ej: botón)
3. Observar los bordes del elemento

**Resultados esperados:**
- ✅ Aparecen **8 handles circulares azules** en los bordes
- ✅ Handles ubicados en: nw, n, ne, e, se, s, sw, w
- ✅ Tamaño: ~10px × 10px
- ✅ Color: Azul con borde blanco
- ✅ Forma: Circular

**Screenshot:** Capturar elemento seleccionado con handles visibles

---

### Test 2.2: Resize Horizontal (Handle Este)

**Pasos:**
1. Seleccionar un botón
2. Posicionar cursor sobre handle **'e'** (centro derecho)
3. Verificar que cursor cambia a `e-resize` (↔)
4. Presionar y mantener click
5. Arrastrar **50px hacia la derecha**
6. Soltar mouse

**Resultados esperados:**
- ✅ Cursor cambia a `e-resize`
- ✅ Al arrastrar, botón se ensancha horizontalmente
- ✅ Tooltip aparece mostrando: `{width}px × {height}px`
- ✅ Alto se mantiene constante
- ✅ Al soltar, nuevo ancho se aplica
- ✅ Handles se actualizan a nueva posición

**Screenshot:** Durante resize con tooltip visible

---

### Test 2.3: Resize Vertical (Handle Sur)

**Pasos:**
1. Seleccionar elemento `<section>`
2. Arrastrar handle **'s'** (centro inferior) **100px hacia abajo**

**Resultados esperados:**
- ✅ Cursor cambia a `s-resize` (↕)
- ✅ Sección se alarga verticalmente
- ✅ Ancho se mantiene constante
- ✅ Tooltip actualizado en tiempo real

---

### Test 2.4: Resize Diagonal (Handle Sureste)

**Pasos:**
1. Seleccionar card o div
2. Arrastrar handle **'se'** (esquina inferior derecha) diagonalmente

**Resultados esperados:**
- ✅ Cursor cambia a `se-resize` (↘)
- ✅ Elemento crece en ambas direcciones (ancho y alto)
- ✅ Tooltip muestra ambas dimensiones cambiando

---

### Test 2.5: Resize con Aspect Ratio (Shift)

**Pasos:**
1. Seleccionar elemento (ej: imagen o botón)
2. **Mantener presionada tecla Shift**
3. Arrastrar handle 'se' (esquina)
4. Observar comportamiento

**Resultados esperados:**
- ✅ Elemento mantiene proporción original
- ✅ Si arrastro más horizontal, el alto se ajusta proporcionalmente
- ✅ Si arrastro más vertical, el ancho se ajusta proporcionalmente
- ✅ Aspect ratio preservado durante todo el arrastre

---

### Test 2.6: Resize desde Handle Noroeste (NW)

**Pasos:**
1. Seleccionar elemento
2. Arrastrar handle **'nw'** (esquina superior izquierda)

**Resultados esperados:**
- ✅ Elemento se redimensiona desde la esquina superior izquierda
- ✅ Esquina inferior derecha permanece fija
- ✅ Ancho y alto cambian simultáneamente

---

### Test 2.7: Todos los 8 Handles

**Pasos:**
1. Seleccionar elemento grande (ej: section)
2. Probar cada handle individualmente:
   - **nw** (esquina superior izquierda) → `nw-resize` cursor
   - **n** (centro superior) → `n-resize` cursor
   - **ne** (esquina superior derecha) → `ne-resize` cursor
   - **e** (centro derecha) → `e-resize` cursor
   - **se** (esquina inferior derecha) → `se-resize` cursor
   - **s** (centro inferior) → `s-resize` cursor
   - **sw** (esquina inferior izquierda) → `sw-resize` cursor
   - **w** (centro izquierda) → `w-resize` cursor

**Resultados esperados:**
- ✅ Todos los handles responden al hover (cursor correcto)
- ✅ Todos los handles permiten arrastrar
- ✅ Cada handle redimensiona en su dirección correcta
- ✅ Handles de esquinas redimensionan en ambas direcciones
- ✅ Handles de lados redimensionan solo en una dirección

---

### Test 2.8: Límite Mínimo

**Pasos:**
1. Seleccionar elemento
2. Intentar reducir tamaño arrastrando handle 'w' muy a la izquierda
3. Intentar hacer elemento muy pequeño

**Resultados esperados:**
- ✅ Elemento NO se hace más pequeño que 20px × 20px
- ✅ Límite mínimo aplicado
- ✅ No se puede crear elemento invisible

---

### Test 2.9: Cancelar Resize (Esc)

**Pasos:**
1. Seleccionar elemento
2. Iniciar resize arrastrando handle 'e'
3. Arrastrar ~100px
4. **Sin soltar el mouse**, presionar **Esc**

**Resultados esperados:**
- ✅ Resize se cancela
- ✅ Dimensiones originales restauradas
- ✅ Toast notification: "⏪ Resize cancelado"
- ✅ Handles vuelven a posición original

---

## ✅ Test Suite 3: Integración Panel de Propiedades

### Test 3.1: Resize Actualiza Panel

**Pasos:**
1. Seleccionar elemento
2. Abrir Panel de Propiedades (Ctrl+P)
3. Observar valor de "Ancho" (ej: `200px`)
4. Arrastrar handle 'e' para cambiar ancho a ~300px
5. Verificar panel de propiedades

**Resultados esperados:**
- ✅ Durante resize, panel muestra valores actualizándose
- ✅ Al finalizar, panel muestra nuevo valor (`300px`)
- ✅ Sincronización en tiempo real entre resize y panel

---

### Test 3.2: Panel Actualiza Resize

**Pasos:**
1. Seleccionar elemento con handles visibles
2. Abrir Panel de Propiedades
3. Cambiar "Ancho" de `200px` a `350px` en el input
4. Observar elemento y handles

**Resultados esperado:**
- ✅ Elemento cambia de tamaño inmediatamente
- ✅ Handles se reposicionan a nuevas dimensiones
- ✅ Bidireccionalidad funciona

---

## ✅ Test Suite 4: Edición + Resize Combinados

### Test 4.1: Editar Texto y Luego Resize

**Pasos:**
1. Seleccionar `<h2>`
2. Double-click → Editar texto
3. Presionar Enter para guardar
4. Arrastrar handle 'e' para ensanchar

**Resultados esperados:**
- ✅ Edición funciona correctamente
- ✅ Después de guardar, handles siguen disponibles
- ✅ Resize funciona después de editar
- ✅ No hay conflictos

---

### Test 4.2: Resize y Luego Editar Texto

**Pasos:**
1. Seleccionar botón
2. Resize con handle 'se' → Hacer más grande
3. Double-click para editar texto
4. Cambiar texto
5. Guardar

**Resultados esperados:**
- ✅ Resize aplicado correctamente
- ✅ Edición funciona después de resize
- ✅ Nuevo tamaño se mantiene al editar
- ✅ Texto se adapta al nuevo tamaño

---

### Test 4.3: Editar Durante Resize (No Permitido)

**Pasos:**
1. Iniciar resize (arrastrar handle)
2. Intentar double-click durante el arrastre

**Resultados esperados:**
- ✅ Double-click no activa edición durante resize
- ✅ Resize continúa normalmente
- ✅ No hay conflictos de eventos

---

## ✅ Test Suite 5: Casos Edge y Performance

### Test 5.1: Resize Elementos Anidados

**Pasos:**
1. Seleccionar `<div>` contenedor con hijos
2. Resize del contenedor
3. Verificar elementos hijos

**Resultados esperados:**
- ✅ Contenedor se redimensiona
- ✅ Elementos hijos se adaptan (si tienen width/height relativos)
- ✅ No se rompe layout interno

---

### Test 5.2: Resize Múltiple Consecutivo

**Pasos:**
1. Resize elemento A (handle 'e')
2. Seleccionar elemento B
3. Resize elemento B (handle 's')
4. Volver a seleccionar elemento A
5. Verificar tamaño de A

**Resultados esperados:**
- ✅ Cada elemento mantiene su nuevo tamaño
- ✅ Handles aparecen correctamente en cada selección
- ✅ No hay "bleeding" de tamaños entre elementos

---

### Test 5.3: Resize Rápido (Performance)

**Pasos:**
1. Seleccionar elemento grande
2. Arrastrar handle muy rápido (movimiento rápido del mouse)
3. Observar suavidad

**Resultados esperados:**
- ✅ Resize es suave (60 FPS)
- ✅ No hay lag o saltos
- ✅ Tooltip actualiza correctamente
- ✅ No hay glitches visuales

---

### Test 5.4: Elementos con Display Flex

**Pasos:**
1. Seleccionar elemento con `display: flex` (ej: navbar)
2. Resize con handle 'e'
3. Verificar items internos

**Resultados esperados:**
- ✅ Contenedor flex se redimensiona
- ✅ Items flex se reorganizan según propiedades flex
- ✅ No se rompe el layout flexbox

---

### Test 5.5: Elementos con Display Grid

**Pasos:**
1. Seleccionar grid container (ej: sección features con 3 columnas)
2. Resize con handle 's'
3. Verificar grid items

**Resultados esperados:**
- ✅ Grid container se redimensiona
- ✅ Grid items mantienen su distribución
- ✅ Columnas se ajustan proporcionalmente

---

## ✅ Test Suite 6: Tooltip y Feedback Visual

### Test 6.1: Tooltip de Dimensiones

**Pasos:**
1. Seleccionar elemento
2. Iniciar resize (cualquier handle)
3. Observar tooltip

**Resultados esperados:**
- ✅ Tooltip aparece inmediatamente al arrastrar
- ✅ Muestra formato: `{width}px × {height}px` (ej: `250px × 120px`)
- ✅ Tooltip sigue al elemento durante resize
- ✅ Tooltip desaparece al soltar mouse
- ✅ Valores en tooltip son exactos (coinciden con dimensiones reales)

**Screenshot:** Tooltip visible durante resize

---

### Test 6.2: Cursor de Resize

**Pasos:**
1. Seleccionar elemento
2. Hover sobre cada handle sin hacer click
3. Verificar cursor

**Resultados esperados:**
- ✅ Handle 'nw' → Cursor `nw-resize` (↖)
- ✅ Handle 'n' → Cursor `n-resize` (↑)
- ✅ Handle 'ne' → Cursor `ne-resize` (↗)
- ✅ Handle 'e' → Cursor `e-resize` (→)
- ✅ Handle 'se' → Cursor `se-resize` (↘)
- ✅ Handle 's' → Cursor `s-resize` (↓)
- ✅ Handle 'sw' → Cursor `sw-resize` (↙)
- ✅ Handle 'w' → Cursor `w-resize` (←)

---

### Test 6.3: Estados Visuales

**Pasos:**
1. Seleccionar elemento → Verificar handles
2. Deseleccionar (click en canvas vacío) → Verificar handles
3. Seleccionar otro elemento → Verificar handles

**Resultados esperados:**
- ✅ Handles solo visibles en elemento seleccionado
- ✅ Handles desaparecen al deseleccionar
- ✅ Handles se mueven al nuevo elemento seleccionado
- ✅ Solo un conjunto de handles visible a la vez

---

## ✅ Test Suite 7: Keyboard Shortcuts

### Test 7.1: Enter para Guardar Texto

**Pasos:**
1. Double-click en `<p>` para editar
2. Escribir texto
3. Presionar **Enter**

**Resultados esperados:**
- ✅ Edición se guarda
- ✅ `contentEditable` se desactiva
- ✅ Elemento vuelve a estado normal

---

### Test 7.2: Shift+Enter para Nueva Línea

**Pasos:**
1. Double-click en `<p>` (párrafo)
2. Escribir "Línea 1"
3. Presionar **Shift+Enter**
4. Escribir "Línea 2"
5. Presionar Enter para guardar

**Resultados esperados:**
- ✅ Shift+Enter crea nueva línea (no guarda)
- ✅ Texto en dos líneas
- ✅ Enter final guarda ambas líneas

---

### Test 7.3: Esc para Cancelar Resize

**Pasos:**
1. Seleccionar elemento con ancho `200px`
2. Iniciar resize arrastrando a `400px`
3. **Antes de soltar**, presionar **Esc**

**Resultados esperados:**
- ✅ Resize se cancela
- ✅ Elemento vuelve a `200px` original
- ✅ Toast: "⏪ Resize cancelado"

---

### Test 7.4: Shift para Aspect Ratio

**Pasos:**
1. Seleccionar elemento cuadrado (100px × 100px)
2. Mantener **Shift**
3. Arrastrar handle 'e' hacia la derecha (ancho → 200px)

**Resultados esperados:**
- ✅ Alto se ajusta automáticamente a 200px
- ✅ Elemento mantiene proporción cuadrada
- ✅ Aspect ratio 1:1 preservado

---

## ✅ Test Suite 8: Browsers & Cross-Platform

### Test 8.1: Chrome

**Navegador:** Google Chrome (latest)

**Tests a ejecutar:**
- ✅ Suite 1: Edición de textos
- ✅ Suite 2: Resize de elementos
- ✅ Suite 3: Integración panel

**Resultado:** ✅ / ❌

---

### Test 8.2: Firefox

**Navegador:** Mozilla Firefox (latest)

**Tests a ejecutar:**
- ✅ Suite 1: Edición de textos
- ✅ Suite 2: Resize de elementos

**Resultado:** ✅ / ❌

---

### Test 8.3: Safari (Opcional)

**Navegador:** Safari (si disponible)

**Tests a ejecutar:**
- ✅ Suite 1: Edición de textos (básico)
- ✅ Suite 2: Resize (básico)

**Resultado:** ✅ / ❌

---

## 🐛 Errores Críticos a Reportar

Si encuentras alguno de estos, es **BLOCKER**:

1. ❌ Double-click no activa edición en elementos de texto
2. ❌ Handles de resize no aparecen al seleccionar elemento
3. ❌ Resize no funciona (elementos no cambian tamaño)
4. ❌ Resize hace que elemento desaparezca o se rompa
5. ❌ Navegador se congela durante resize
6. ❌ JavaScript error en consola al editar o resize

---

## ⚠️ Warnings Esperados (No son errores)

Estos son **comportamientos conocidos y aceptables**:

- ⚠️ Elementos `<div>`, `<section>`, `<article>` NO son editables (solo seleccionables)
- ⚠️ Resize puede cambiar layout de elementos hijos (esperado)
- ⚠️ Tooltip puede quedar fuera de viewport en elementos muy grandes (cosmético)
- ⚠️ Handles pueden superponerse en elementos muy pequeños (< 50px)

---

## 📸 Screenshots Requeridos

Por favor incluir capturas de pantalla de:

1. **Handles visibles** - Elemento seleccionado con 8 handles circulares
2. **Tooltip de dimensiones** - Durante resize mostrando `{width}px × {height}px`
3. **Edición de texto activa** - Elemento con cursor parpadeante y texto seleccionado
4. **Antes/Después de resize** - Mismo elemento antes y después de redimensionar
5. **Aspect ratio preservado** - Resize con Shift mostrando proporción
6. **Console logs** - Panel de DevTools con logs de resize/edición

---

## 📝 Formato de Reporte

Para cada test fallido, reportar:

```markdown
### ❌ Test Suite X - Test Y: [Nombre del test]

**Navegador:** [Chrome 120 / Firefox 121 / Safari 17]
**OS:** [Windows 11 / macOS 14 / Linux]
**Fecha:** [fecha y hora]

**Pasos realizados:**
1. ...
2. ...

**Resultado esperado:**
- ...

**Resultado obtenido:**
- ...

**Screenshot:** [adjuntar]

**Console errors:** 
```
[copiar errores completos]
```

**Reproducibilidad:** [Siempre / A veces / Una vez]
```

---

## ✅ Criterios de Aceptación

El testing se considera **APROBADO** si:

- ✅ **Edición de textos:** Al menos 4/5 tests de Suite 1 pasan
- ✅ **Resize de elementos:** Al menos 7/9 tests de Suite 2 pasan
- ✅ **Integración:** Ambos tests de Suite 3 pasan
- ✅ **Combinados:** Todos los tests de Suite 4 pasan
- ✅ **No hay errores críticos** bloqueantes
- ✅ **Al menos 1 navegador** (Chrome) completamente funcional

**Mínimo aceptable:** 85% de tests pasando

---

## 🎯 Checklist de Testing Rápido

Versión corta para testing express:

- [ ] Double-click edita texto
- [ ] Enter guarda texto
- [ ] Handles aparecen al seleccionar
- [ ] Arrastrar handle 'e' ensancha elemento
- [ ] Arrastrar handle 's' alarga elemento
- [ ] Arrastrar handle 'se' redimensiona ambas direcciones
- [ ] Shift mantiene proporción
- [ ] Esc cancela resize
- [ ] Tooltip muestra dimensiones
- [ ] Panel de propiedades actualiza

---

## 🔗 Referencias

### Documentación
- **Técnica completa:** `/docs/editor/TEXT_EDITING_AND_RESIZE.md`
- **Panel de Propiedades:** `/docs/editor/PROPERTIES_PANEL.md`

### Código Fuente
- **Edición:** `vanilla-editor/script.js` → `makeElementEditable()` (~línea 2103)
- **Resize:** `vanilla-editor/src/core/resizeManager.js` → clase `ResizeManager`
- **Integración:** `vanilla-editor/src/init.js` (línea 66)

### Issues Relacionados
- **#11** - Validar Panel de Propiedades

---

## 🤖 Instrucciones para Jules

**Prioridad:** Alta  
**Etiquetas:** `testing`, `jules`, `editor`, `high-priority`  
**Tiempo estimado:** 45-60 minutos

**Navegadores a testear (en orden):**
1. **Chrome** (principal - testing completo)
2. **Firefox** (secundario - tests básicos)
3. **Safari** (opcional - si disponible)

**Entregables:**
1. Reporte completo con formato especificado
2. Screenshots de casos importantes (mínimo 6)
3. Lista de errores encontrados (si existen)
4. % de tests pasados
5. Recomendación: Aprobado / Requiere fixes / Bloqueado

---

## 📊 Template de Reporte Final

```markdown
# 🧪 Reporte de Testing: Edición de Textos y Resize

**Fecha:** [fecha]
**Tester:** Jules
**Navegador principal:** Chrome [versión]
**Navegadores adicionales:** Firefox [versión]
**Commits testeados:** cdccda9, de0bc6b

## Resumen Ejecutivo
- Tests totales: X
- Tests pasados: Y ✅
- Tests fallidos: Z ❌
- Errores críticos: N 🔴
- % Aprobación: XX%

## Resultados por Suite
- Suite 1 (Edición Textos): X/5 ✅
- Suite 2 (Resize): X/9 ✅
- Suite 3 (Integración Panel): X/2 ✅
- Suite 4 (Combinados): X/3 ✅
- Suite 5 (Edge Cases): X/5 ✅
- Suite 6 (Tooltip/Visual): X/3 ✅
- Suite 7 (Shortcuts): X/4 ✅
- Suite 8 (Cross-browser): X/3 ✅

## Screenshots
[Adjuntar 6+ capturas]

## Issues Críticos Encontrados
1. [Si existen]

## Issues Menores Encontrados
1. [Si existen]

## Observaciones y Mejoras Sugeridas
- [Observación 1]
- [Observación 2]

## Recomendación Final
[✅ APROBADO / ⚠️ REQUIERE FIXES / 🔴 BLOQUEADO]

## Justificación
[Explicar decisión]
```

---

**Creado por:** Blackbox Pro via Crush  
**Fecha:** 14 Diciembre 2024  
**Documentación:** `/docs/editor/TEXT_EDITING_AND_RESIZE.md`  
**Commit:** de0bc6b
