# 🐛 Fix Requerido: Panel de Propiedades del Editor Vanilla

## Problema Identificado

El panel de propiedades del editor Vanilla **no aplica cambios** cuando se modifican los valores.

### Causa Raíz

La función `loadProperties()` en `script.js` (línea 1256) genera el HTML del panel dinámicamente, pero **no agrega event listeners** a los inputs después de crearlos.

```javascript
// Genera HTML
html += `<input type="number" value="${width}" />`;

// Pero NO agrega:
// input.addEventListener('change', (e) => updateProperty('width', e.target.value));
```

### Archivos Afectados

- `/home/admin/demos/vanilla/script.js` - Línea 1256 (`loadProperties`)
- Event listeners necesitan agregarse después de `panel.innerHTML = html`

## Solución Requerida

### Opción A: Modificar script.js directamente

Después de `panel.innerHTML = html;` agregar:

```javascript
// Agregar event listeners a todos los inputs
panel.querySelectorAll('input, select, textarea').forEach(input => {
  const propertyName = input.dataset.property;
  if (propertyName) {
    input.addEventListener('change', (e) => {
      if (selectedElement) {
        selectedElement.style[propertyName] = e.target.value;
      }
    });
  }
});
```

Y en cada input del HTML, agregar `data-property`:

```javascript
html += `<input type="number" data-property="width" value="${width}" />`;
```

### Opción B: Crear task remota para Jules/Blackbox

Crear issue para que agente arregle el editor Vanilla automáticamente.

### Opción C: Usar evento delegation

Agregar un solo listener al panel:

```javascript
document.getElementById('propertiesPanel').addEventListener('input', (e) => {
  const target = e.target;
  if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
    const property = target.dataset.property;
    if (property && selectedElement) {
      selectedElement.style[property] = target.value;
    }
  }
});
```

## Recomendación

**Crear task remota** para que agente corrija el editor Vanilla:
- Agregar event listeners correctos
- Probar que width, height, colors, etc. se aplican
- Mantener toda la funcionalidad existente
- No romper nada

## Ubicación del Archivo

```
/home/admin/demos/vanilla/script.js
Línea ~1256: function loadProperties(element)
Línea ~1585: function updateProperty(property, value)
```

El editor tiene 4,300+ líneas. Se necesita cuidado para no romper funcionalidad existente.

---

**Prioridad:** Alta  
**Bloqueador:** Sí (demo principal no funciona)  
**Estimación:** 1-2 horas para fix manual, 30 min para task remota
