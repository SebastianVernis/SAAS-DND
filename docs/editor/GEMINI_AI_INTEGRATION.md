# 🤖 Integración Gemini AI - Validación Sintáctica Automática

**Versión:** 1.0.0  
**Fecha:** 14 Diciembre 2024  
**Modelo:** gemini-2.0-flash-lite (optimizado bajo costo)

---

## 🎯 Descripción

El editor incluye integración con **Google Gemini AI** para validación automática de sintaxis HTML/CSS al seleccionar elementos del canvas.

**Beneficios:**
- ✅ Detecta errores de sintaxis HTML
- ✅ Valida propiedades CSS
- ✅ Sugiere correcciones automáticas
- ✅ Optimiza código en tiempo real
- ✅ Modelo económico (gemini-2.0-flash-lite)

---

## 🔑 Configuración de API Key

### Obtener API Key Gratuita

1. Ir a https://makersuite.google.com/app/apikey
2. Iniciar sesión con cuenta de Google
3. Click en "Create API Key"
4. Copiar la key (formato: `AIza...`)

**Límites gratuitos:**
- 60 requests por minuto
- 1500 requests por día
- Suficiente para uso normal del editor

---

### Configurar en el Editor

**Método 1: Interfaz UI (Recomendado)**

1. Abrir editor: http://18.223.32.141/vanilla
2. Menú "❓ Ayuda" → "🤖 Configurar Gemini AI"
3. Pegar API Key en el campo
4. Click "Guardar"
5. ✅ Validación habilitada

**Método 2: Console del Navegador**

```javascript
// Configurar key
window.geminiValidator.setApiKey('AIza_TU_API_KEY_AQUI');

// Verificar estado
window.geminiValidator.isEnabled(); // true

// Eliminar key
window.geminiValidator.removeApiKey();
```

**Método 3: LocalStorage Directo**

```javascript
// En DevTools → Console
localStorage.setItem('gemini_api_key', 'AIza_TU_API_KEY_AQUI');

// Recargar página
location.reload();
```

---

## 🚀 Funcionamiento

### Validación Automática

**Trigger:** Al seleccionar cualquier elemento del canvas

**Proceso:**
```
1. Usuario hace click en elemento
2. selectElement() se ejecuta
3. Si geminiValidator.isEnabled() === true:
   → validateElementSyntax(element) se llama
4. Gemini analiza el HTML/CSS del elemento
5. Si hay errores/mejoras:
   → Modal con sugerencias aparece
6. Usuario puede aceptar o rechazar cambios
```

**Debounce:** 1.5 segundos para evitar llamadas excesivas

---

## 🎨 Características de Validación

### Qué Valida

**HTML:**
- ✅ Tags correctamente cerrados
- ✅ Atributos válidos
- ✅ Estructura semántica
- ✅ Anidamiento correcto

**CSS:**
- ✅ Propiedades válidas
- ✅ Valores correctos
- ✅ Unidades apropiadas
- ✅ Sintaxis de colores
- ✅ Shorthand properties

**Mejoras Sugeridas:**
- ✅ Optimización de código
- ✅ Accessibility improvements
- ✅ Best practices
- ✅ Performance tips

---

## 📝 Ejemplo de Validación

### Código Original
```html
<div style="colour: red; padding: 20; display: flexbox;">
  <p>Texto sin cerrar
</div>
```

### Gemini Detecta
```
❌ colour → color (typo)
❌ padding: 20 → padding: 20px (falta unidad)
❌ display: flexbox → display: flex (valor inválido)
❌ <p> sin cerrar
```

### Código Corregido
```html
<div style="color: red; padding: 20px; display: flex;">
  <p>Texto sin cerrar</p>
</div>
```

---

## ⚙️ Configuración Técnica

### Ubicación del Código

**Archivo:** `vanilla-editor/src/core/geminiValidator.js`

**Clase:** `GeminiSyntaxValidator`

**Métodos principales:**
- `setApiKey(key)` - Configura API key
- `isEnabled()` - Verifica si está habilitado
- `validateElement(element, context)` - Valida elemento
- `showConfigModal()` - Muestra modal de configuración
- `showCorrectionSuggestion(element, result)` - Muestra sugerencias

### Prompt Optimizado

```javascript
buildPrompt(element, context) {
    return `Fix HTML/CSS syntax only. Return valid code.

Element: <${tagName}>
HTML: ${elementHTML.substring(0, 500)}
Styles: ${styles}
Parent: ${context.parent || 'body'}

Rules:
- Fix syntax errors only
- Keep semantic structure
- Validate CSS properties
- No explanations
- Return only corrected HTML+inline CSS`;
}
```

**Optimizaciones:**
- Prompt conciso (< 100 tokens)
- Solo 500 chars de HTML (evita tokens excesivos)
- Sin explicaciones (solo código)
- Modelo flash-lite (más económico)

---

## 🔄 Flujo de Trabajo

### Escenario 1: Elemento Correcto

```
1. Usuario selecciona <h1>
2. Gemini valida → No errores
3. No se muestra modal
4. Panel de propiedades carga normalmente
```

### Escenario 2: Elemento con Errores

```
1. Usuario selecciona elemento con errores
2. Gemini valida → Detecta 3 errores
3. Modal aparece con sugerencias:
   ┌─────────────────────────────────┐
   │ 🤖 Sugerencias de Gemini AI     │
   │                                 │
   │ Se detectaron mejoras:          │
   │ • color: red → color: #ff0000   │
   │ • padding: 20 → padding: 20px   │
   │ • <p> tag sin cerrar            │
   │                                 │
   │ [Aplicar] [Ignorar]             │
   └─────────────────────────────────┘
4. Usuario hace click en "Aplicar"
5. Código se corrige automáticamente
6. ✅ Elemento actualizado
```

---

## 🧪 Testing de Gemini

### Test 1: Configurar API Key

**Pasos:**
1. Abrir http://18.223.32.141/vanilla
2. Menú Ayuda → Configurar Gemini AI
3. Pegar API key válida
4. Click Guardar

**Resultado esperado:**
- ✅ Toast: "✅ API Key guardada correctamente"
- ✅ Modal se cierra
- ✅ En consola: "✅ Gemini API key configurada"

### Test 2: Validación Automática

**Pasos:**
1. Cargar plantilla "SaaS Product"
2. Click en cualquier elemento
3. Observar consola y UI

**Resultado esperado:**
- ✅ En consola: Logs de validación
- ✅ Si hay errores: Modal con sugerencias
- ✅ Si está correcto: No modal, carga normal

### Test 3: Aplicar Correcciones

**Pasos:**
1. Crear elemento con error intencional:
   ```html
   <div style="colour: blue;">Test</div>
   ```
2. Seleccionar el elemento
3. Esperar validación (1.5s debounce)
4. Modal con sugerencias aparece
5. Click "Aplicar"

**Resultado esperado:**
- ✅ Código corregido a `color: blue;`
- ✅ Cambio visible en canvas
- ✅ Panel de propiedades actualizado

---

## 🔒 Seguridad y Privacidad

### Dónde se Guarda la API Key

```javascript
// LocalStorage del navegador
localStorage.getItem('gemini_api_key');
```

**Ubicación:** Solo en el navegador del usuario  
**No se envía a:** Backend, otros usuarios, terceros  
**Persistencia:** Hasta que usuario la elimine

### Datos Enviados a Google

**Por cada validación:**
- HTML del elemento (máximo 500 caracteres)
- Inline CSS del elemento
- Tag name y contexto (parent)
- Prompt de instrucciones

**NO se envía:**
- Contenido completo del canvas
- Proyectos guardados
- Datos personales del usuario
- API key (se envía como query param en URL)

---

## ⚠️ Limitaciones

### Costos y Límites

**Gratis:**
- 60 requests/minuto
- 1500 requests/día

**Si excedes:**
- HTTP 429 (Too Many Requests)
- Editor sigue funcionando (validación deshabilitada temporalmente)
- Se muestra mensaje de error en consola

### Precisión

**Gemini es bueno para:**
- ✅ Errores sintácticos obvios
- ✅ Typos en propiedades CSS
- ✅ Tags no cerrados
- ✅ Valores inválidos

**Puede no detectar:**
- ⚠️ Problemas de lógica de negocio
- ⚠️ Preferencias de estilo subjetivas
- ⚠️ Incompatibilidades específicas de navegador
- ⚠️ Problemas de performance

---

## 🔧 Troubleshooting

### Validación No Funciona

**Síntomas:** No aparece modal de sugerencias

**Causas:**
1. API key no configurada
2. API key inválida
3. Límite de requests excedido
4. Error de red

**Debug:**
```javascript
// Verificar estado
window.geminiValidator.isEnabled() // Debe ser true

// Ver API key (primeros caracteres)
localStorage.getItem('gemini_api_key').substring(0, 10)

// Test manual
window.geminiValidator.validateElement(selectedElement, {})
  .then(result => console.log(result))
  .catch(err => console.error(err));
```

### Error 401 Unauthorized

**Causa:** API key inválida

**Solución:**
1. Reconfigurar API key
2. Verificar que copiaste completa
3. Generar nueva key en Google MakerSuite

### Error 429 Too Many Requests

**Causa:** Límite excedido

**Solución:**
- Esperar 1 minuto
- O deshabilitar temporalmente
- O usar otra API key

---

## 💡 Mejores Prácticas

### Cuándo Usar

**Recomendado:**
- ✅ Al editar código manualmente
- ✅ Al importar HTML externo
- ✅ Al crear componentes complejos
- ✅ Para aprender best practices

**No necesario:**
- ⚠️ Elementos de plantillas (ya validados)
- ⚠️ Componentes drag & drop (pre-validados)
- ⚠️ Ediciones simples (cambiar texto)

### Deshabilitar Temporalmente

```javascript
// Método 1: Remover API key
window.geminiValidator.removeApiKey();

// Método 2: En código (para desarrollo)
// Comentar en script.js línea ~1684:
// if (window.geminiValidator && window.geminiValidator.isEnabled()) {
//     validateElementSyntax(element);
// }
```

---

## 📊 Estadísticas de Uso

### Tokens Consumidos

**Por validación:**
- Input: ~50-150 tokens (prompt + HTML)
- Output: ~50-200 tokens (código corregido)
- **Total:** ~100-350 tokens por validación

**Costo estimado:**
- Flash-lite: $0.000075 per 1K tokens input
- 1000 validaciones ≈ $0.03 USD (prácticamente gratis)

---

## 🔮 Futuro

### v1.1 (Próximo)
- [ ] Batch validation (validar todo el canvas)
- [ ] Guardar historial de correcciones
- [ ] Settings para customizar prompt
- [ ] Toggle on/off desde toolbar

### v2.0 (Largo plazo)
- [ ] Gemini Pro para componentes complejos
- [ ] AI-generated components desde descripción
- [ ] Smart suggestions (no solo correcciones)
- [ ] Aprende de las preferencias del usuario

---

## 📝 Configuración Rápida (Copiar y Pegar)

### Paso 1: Obtener API Key
```
https://makersuite.google.com/app/apikey
```

### Paso 2: Configurar en Editor
```javascript
// En consola del navegador
localStorage.setItem('gemini_api_key', 'TU_API_KEY_AQUI');
location.reload();
```

### Paso 3: Verificar
```javascript
// Debe retornar true
window.geminiValidator.isEnabled();
```

### Paso 4: Testear
```
1. Seleccionar cualquier elemento
2. Ver consola: debe mostrar logs de Gemini
3. Si hay errores: modal con sugerencias
```

---

## 🤝 Contribuir

### Mejorar el Prompt

Editar `geminiValidator.js` línea ~65:

```javascript
buildPrompt(element, context) {
    return `Tu prompt optimizado aquí...`;
}
```

### Personalizar Validación

```javascript
// Agregar reglas personalizadas
validateElement(element, context) {
    // Validación custom
    if (element.tagName === 'BUTTON' && !element.textContent) {
        // Sugerir agregar texto
    }
    
    // Luego llamar a Gemini
    return super.validateElement(element, context);
}
```

---

## 📞 Soporte

**API Issues:** https://ai.google.dev/gemini-api/docs  
**Editor Issues:** https://github.com/SebastianVernis/SAAS-DND/issues  
**Docs:** `/docs/editor/`

---

## 📋 Checklist de Configuración

- [ ] Obtener API key de Google MakerSuite
- [ ] Configurar key en el editor (UI o console)
- [ ] Verificar `geminiValidator.isEnabled() === true`
- [ ] Seleccionar elemento → Ver logs en consola
- [ ] Probar con elemento con error
- [ ] Verificar que modal de sugerencias aparece
- [ ] Aplicar corrección y verificar cambio

---

**Última actualización:** 14 Diciembre 2024  
**Versión:** 1.0.0  
**Modelo:** gemini-2.0-flash-lite
