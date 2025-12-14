---
name: Properties Panel Testing
about: Test manual del Panel de Propiedades del editor vanilla
title: '[TEST] Validar Panel de Propiedades con plantillas y archivos externos'
labels: 'testing, jules, editor, high-priority'
assignees: ''
---

## 🧪 Testing del Panel de Propiedades - Editor Vanilla

**Fecha:** 14 Diciembre 2024  
**Commit:** cdccda9  
**Documentación:** `/docs/editor/PROPERTIES_PANEL.md`

---

## 📋 Contexto

Se implementó un fix crítico en el Panel de Propiedades para que lea correctamente los estilos de elementos cargados desde plantillas o archivos externos usando `getComputedStyle()`.

**Cambio técnico:**
- Antes: Solo leía `element.style[property]` (inline styles seteados via JS)
- Ahora: Lee `element.style[property]` O `window.getComputedStyle(element)[property]`

---

## 🎯 Objetivo del Testing

Validar que el Panel de Propiedades muestra correctamente todos los valores CSS de elementos seleccionados, independientemente de su origen (plantilla precargada, drag & drop, archivo externo).

---

## 🌐 URLs de Testing

**Editor:** http://18.223.32.141/vanilla

**Usuario de prueba:**
- Email: `test@example.com`
- Password: (no requerido para editor standalone)

---

## ✅ Test Suite 1: Plantillas Precargadas

### Test 1.1: Plantilla "SaaS Product"

**Pasos:**
1. Cargar http://18.223.32.141/vanilla
2. Click en botón "Plantillas" (o abrir modal)
3. Seleccionar plantilla "Landing Page SaaS"
4. Esperar a que cargue en el canvas
5. Click en el `<h2>` del hero (texto "La solución perfecta para tu negocio")
6. Abrir panel de propiedades con `Ctrl+P`

**Resultados esperados:**
- ✅ Panel se abre correctamente
- ✅ Sección "Tipografía" muestra:
  - Font Size: `56px`
  - Font Weight: `bold` (700)
  - Color: Color blanco visible en picker
- ✅ Sección "Espaciado" muestra:
  - Margin: `0 0 20px 0` (o valores similares)
- ✅ Sección "Posicionamiento" muestra:
  - Display: `block`

**Verificación visual:**
- Valores no deben estar vacíos
- Valores deben coincidir con los estilos visibles en el canvas

---

### Test 1.2: Plantilla "Portfolio"

**Pasos:**
1. Cargar plantilla "Portafolio Profesional"
2. Click en el `<nav>` (barra de navegación superior)
3. Abrir panel propiedades (`Ctrl+P`)

**Resultados esperados:**
- ✅ Sección "Fondo y Bordes" muestra:
  - Background Color: Blanco (`#ffffff` o similar)
- ✅ Sección "Espaciado" muestra:
  - Padding: `20px 40px`
- ✅ Sección "Posicionamiento" muestra:
  - Display: `flex`
- ✅ Sección "Flexbox" aparece automáticamente
  - Justify Content: `space-between`
  - Align Items: `center`

---

### Test 1.3: Elementos con Flexbox

**Pasos:**
1. En cualquier plantilla, seleccionar un elemento con `display: flex`
2. Abrir panel propiedades

**Resultados esperados:**
- ✅ Sección "Flexbox" visible
- ✅ Todos los valores (flex-direction, justify-content, align-items, gap) cargados
- ✅ Opciones del dropdown marcadas correctamente

---

### Test 1.4: Elementos con Grid

**Pasos:**
1. Cargar plantilla que contenga `display: grid` (ej: sección de features con 3 columnas)
2. Seleccionar el contenedor grid
3. Abrir panel propiedades

**Resultados esperados:**
- ✅ Sección "Grid" visible
- ✅ Grid Template Columns muestra: `repeat(3, 1fr)` o `1fr 1fr 1fr`
- ✅ Grid Gap muestra valor en px
- ✅ Justify Items y Align Items con valores correctos

---

## ✅ Test Suite 2: Elementos Drag & Drop

### Test 2.1: Crear Botón

**Pasos:**
1. Abrir panel de componentes (`Ctrl+B`)
2. Arrastrar componente "Botón" al canvas
3. Click en el botón recién creado
4. Abrir panel propiedades

**Resultados esperados:**
- ✅ Padding muestra valores (ej: `12px 24px`)
- ✅ Background Color muestra color del botón
- ✅ Border Radius muestra valor (ej: `6px`)
- ✅ Font Weight cargado correctamente

---

### Test 2.2: Crear Card

**Pasos:**
1. Arrastrar componente "Card" al canvas
2. Seleccionar la card
3. Abrir panel propiedades

**Resultados esperados:**
- ✅ Sombra (Box Shadow) muestra "Sutil" o "Media"
- ✅ Border Radius cargado
- ✅ Background Color cargado
- ✅ Padding cargado

---

## ✅ Test Suite 3: Edición de Propiedades

### Test 3.1: Cambiar Font Size

**Pasos:**
1. Seleccionar cualquier `<h2>` de una plantilla
2. En panel propiedades, cambiar Font Size de `56px` a `64px`
3. Deseleccionar y volver a seleccionar el elemento

**Resultados esperados:**
- ✅ Cambio se aplica visualmente inmediatamente
- ✅ Al reseleccionar, el panel muestra `64px`
- ✅ Elemento en canvas tiene el nuevo tamaño

---

### Test 3.2: Cambiar Display a Flex

**Pasos:**
1. Seleccionar un `<div>` cualquiera
2. En "Posicionamiento", cambiar Display a `flex`
3. Observar panel

**Resultados esperados:**
- ✅ Sección "Flexbox" aparece automáticamente
- ✅ Canvas refleja cambio de layout
- ✅ Opciones de flexbox son editables

---

### Test 3.3: Cambiar Colores

**Pasos:**
1. Seleccionar un botón
2. Cambiar Background Color usando color picker
3. Cambiar Color (texto) usando color picker

**Resultados esperados:**
- ✅ Ambos cambios se aplican visualmente
- ✅ Color pickers muestran colores correctos al reabrir

---

### Test 3.4: Ajustar Espaciado

**Pasos:**
1. Seleccionar una sección
2. Cambiar Padding Top de `80px` a `120px`
3. Cambiar Margin Bottom de `0` a `40px`

**Resultados esperados:**
- ✅ Espaciado se ajusta visualmente
- ✅ Valores se mantienen al reseleccionar

---

## ✅ Test Suite 4: Casos Edge

### Test 4.1: Elemento sin Estilos

**Pasos:**
1. Crear un `<div>` básico via código o drag & drop
2. No aplicar estilos personalizados
3. Seleccionar y abrir panel

**Resultados esperados:**
- ✅ Panel muestra valores por defecto del navegador
- ✅ Display muestra `block`
- ✅ No hay errores en consola

---

### Test 4.2: Múltiples Selecciones Consecutivas

**Pasos:**
1. Seleccionar elemento A → Panel carga propiedades A
2. Seleccionar elemento B → Panel carga propiedades B
3. Seleccionar elemento A nuevamente

**Resultados esperados:**
- ✅ Panel se actualiza correctamente cada vez
- ✅ No hay valores "pegados" del elemento anterior
- ✅ Transiciones suaves entre elementos

---

### Test 4.3: Elemento con Estilos Complejos

**Pasos:**
1. Seleccionar elemento con:
   - Gradient background
   - Box shadow múltiple
   - Transform aplicado
2. Abrir panel propiedades

**Resultados esperados:**
- ✅ Background Color muestra color base (o último color del gradient)
- ✅ Box Shadow muestra alguna de las opciones (sutil/media/fuerte)
- ✅ No hay errores en consola
- ⚠️ Transform no se muestra (limitación conocida - OK)

---

## 🐛 Test Suite 5: Debugging y Logs

### Test 5.1: Console Logs

**Pasos:**
1. Abrir DevTools → Consola
2. Seleccionar cualquier elemento
3. Observar consola

**Resultados esperados:**
- ✅ Aparece log: `📋 Loading properties for: <tag>`
- ✅ Muestra objeto con valores: fontSize, padding, backgroundColor, display
- ✅ Valores son strings no vacíos (ej: `"56px"`, `"20px 40px"`)

**Ejemplo esperado:**
```
📋 Loading properties for: h2 {
  fontSize: "56px",
  padding: "0px 0px 20px 0px",
  backgroundColor: "rgba(0, 0, 0, 0)",
  display: "block"
}
```

---

### Test 5.2: Verificar getComputedStyle

**Pasos:**
1. Seleccionar elemento de plantilla
2. En consola ejecutar:
   ```javascript
   window.getComputedStyle(selectedElement).fontSize
   ```

**Resultados esperados:**
- ✅ Retorna valor (ej: `"56px"`)
- ✅ No es `null` ni `undefined`

---

## 🔴 Errores Críticos a Reportar

Si encuentras alguno de estos, es **BLOCKER**:

1. ❌ Panel de propiedades no se abre con `Ctrl+P`
2. ❌ Todos los valores aparecen vacíos al seleccionar elemento
3. ❌ Error en consola al seleccionar elemento
4. ❌ Cambios no se aplican visualmente
5. ❌ Navegador se congela o crashea

---

## ⚠️ Warnings Esperados (No son errores)

Estos son **comportamientos conocidos y aceptables**:

- ⚠️ Valores como `2rem` se muestran convertidos a `px` (ej: `32px`)
- ⚠️ Variables CSS (`var(--color)`) se muestran resueltas (`#667eea`)
- ⚠️ Transform, filter, clip-path no aparecen en el panel (no implementados aún)
- ⚠️ Pseudo-elementos (::before, ::after) no son seleccionables

---

## 📸 Screenshots a Incluir

Por favor incluir capturas de pantalla de:

1. **Panel de propiedades cargado** con valores visibles
2. **Sección Flexbox** (cuando display=flex)
3. **Sección Grid** (cuando display=grid)
4. **Console log** con el objeto de debugging
5. **Antes y después** de editar una propiedad

---

## 📝 Formato de Reporte

Para cada test fallido, reportar:

```markdown
### ❌ Test X.Y: [Nombre del test]

**Navegador:** [Chrome 120 / Firefox 121 / Safari 17]
**OS:** [Windows 11 / macOS 14 / Linux]

**Pasos realizados:**
1. ...
2. ...

**Resultado esperado:**
- ...

**Resultado obtenido:**
- ...

**Screenshot:** [adjuntar]

**Console errors:** [copiar errores si existen]
```

---

## ✅ Criterios de Aceptación

El testing se considera **APROBADO** si:

- ✅ Al menos 80% de tests pasan exitosamente
- ✅ No hay errores críticos bloqueantes
- ✅ Panel carga propiedades de plantillas correctamente
- ✅ Panel carga propiedades de elementos drag & drop
- ✅ Edición de propiedades funciona y persiste

---

## 🔗 Referencias

- **Documentación técnica:** `/docs/editor/PROPERTIES_PANEL.md`
- **Commit del fix:** `cdccda9`
- **Archivo modificado:** `vanilla-editor/script.js`
- **Función clave:** `getStyleValue()` (línea ~1706)

---

## 🤖 Instrucciones para Jules

**Prioridad:** Alta  
**Etiqueta:** `jules`, `testing`, `editor`, `high-priority`  
**Tiempo estimado:** 30-45 minutos

**Instrucciones:**
1. Ejecutar todos los test suites en orden
2. Documentar cada resultado (✅ pass / ❌ fail)
3. Capturar screenshots de casos importantes
4. Reportar errores críticos inmediatamente
5. Generar reporte final con:
   - Total de tests ejecutados
   - Tests pasados / fallidos
   - Lista de issues encontrados
   - Recomendaciones

**Navegadores a testear (orden de prioridad):**
1. Chrome (principal)
2. Firefox (secundario)
3. Safari (si disponible)

---

## 📊 Template de Reporte Final

```markdown
# 🧪 Reporte de Testing: Panel de Propiedades

**Fecha:** [fecha]
**Tester:** Jules
**Navegador:** [versión]
**Commit:** cdccda9

## Resumen Ejecutivo
- Tests ejecutados: X/Y
- Tests pasados: X ✅
- Tests fallidos: Y ❌
- Errores críticos: Z 🔴

## Resultados por Suite
- Suite 1 (Plantillas): X/Y ✅
- Suite 2 (Drag & Drop): X/Y ✅
- Suite 3 (Edición): X/Y ✅
- Suite 4 (Casos Edge): X/Y ✅
- Suite 5 (Debugging): X/Y ✅

## Issues Encontrados
1. [Descripción]
2. [Descripción]

## Recomendaciones
- [Recomendación 1]
- [Recomendación 2]

## Conclusión
[Aprobado / Requiere fixes / Bloqueado]
```

---

**Creado por:** Blackbox Pro via Crush  
**Fecha:** 14 Diciembre 2024  
**Documentación:** `/docs/editor/PROPERTIES_PANEL.md`
