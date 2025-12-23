# 🤖 Guía Rápida: Configurar Gemini AI en el Editor

**Tiempo estimado:** 2-3 minutos  
**Costo:** Gratis (con límites)

---

## 🎯 ¿Qué hace Gemini AI?

Al seleccionar elementos en el canvas, Gemini AI:
- ✅ Valida sintaxis HTML/CSS automáticamente
- ✅ Detecta errores (typos, propiedades inválidas)
- ✅ Sugiere correcciones
- ✅ Optimiza código

**Modelo:** gemini-2.0-flash-lite (económico)

---

## 📝 Paso a Paso

### 1. Obtener API Key (2 minutos)

1. Ir a: https://makersuite.google.com/app/apikey
2. Iniciar sesión con cuenta Google
3. Click en **"Create API Key"**
4. Copiar la key (empieza con `AIza...`)

**Límites gratuitos:**
- 60 requests/minuto
- 1500 requests/día

---

### 2. Configurar en el Editor (30 segundos)

**Opción A: Interfaz UI (Recomendado)**
1. Abrir: http://18.223.32.141/vanilla
2. Menú **"❓ Ayuda"** → **"🤖 Configurar Gemini AI"**
3. Pegar la API Key en el campo
4. Click **"Guardar"**
5. ✅ Listo!

**Opción B: Console del Navegador**
1. Abrir DevTools (F12)
2. Ir a tab "Console"
3. Ejecutar:
```javascript
localStorage.setItem('gemini_api_key', 'AIza_TU_API_KEY_AQUI');
location.reload();
```

---

### 3. Verificar que Funciona (30 segundos)

1. En el editor, abrir Console (F12)
2. Ejecutar:
```javascript
window.geminiValidator.isEnabled()
```
3. Debe retornar: `true`

4. Seleccionar cualquier elemento del canvas
5. Ver consola → Debe aparecer algo como:
```
🎯 Selecting element: H2 element-123
🔧 ResizeManager available: true
✅ Resize enabled for element
```

---

## 🧪 Probar Gemini (Opcional)

### Test 1: Elemento con Error

1. Arrastrar componente "Botón" al canvas
2. Abrir DevTools → Elements
3. Editar HTML del botón y agregar error:
```html
<button style="colour: red; padding: 20;">Test</button>
```
4. Deseleccionar y volver a seleccionar el botón
5. **Esperar 2-3 segundos**

**Resultado esperado:**
- Modal de Gemini aparece con sugerencias
- Detecta: `colour` → `color`, `padding: 20` → `padding: 20px`

### Test 2: Ver en Console

```javascript
// Ver si está habilitado
window.geminiValidator.isEnabled() // true

// Ver API key (primeros chars)
localStorage.getItem('gemini_api_key').substring(0, 10) // "AIzaSyB..."

// Test manual de validación
const el = document.querySelector('.selected');
window.geminiValidator.validateElement(el, {})
  .then(result => console.log('Result:', result))
  .catch(err => console.error('Error:', err));
```

---

## ⚠️ Troubleshooting

### Botón no abre el modal

**Solución:**
1. Verificar consola por errores
2. Ejecutar manualmente:
```javascript
window.geminiValidator.showConfigModal()
```
3. Si no funciona, recargar página

### Error 401 (Unauthorized)

**Causa:** API key inválida

**Solución:**
1. Regenerar API key en MakerSuite
2. Configurar nueva key

### Error 429 (Too Many Requests)

**Causa:** Límite excedido

**Solución:**
- Esperar 1 minuto
- O usar otra API key

### No aparece modal de sugerencias

**Causa:** Elemento no tiene errores (es correcto)

**Solución:**
- Es comportamiento esperado
- Gemini solo muestra modal si detecta mejoras
- Para forzar test, agregar error intencional

---

## 🎓 Tips

### Economizar Requests

- Gemini solo valida cuando seleccionas un elemento
- Tiene debounce de 1.5s (evita llamadas excesivas)
- No valida automáticamente al crear elementos nuevos
- No valida al editar texto inline

### Deshabilitar Temporalmente

```javascript
// Remover API key
window.geminiValidator.removeApiKey();

// Verificar
window.geminiValidator.isEnabled() // false
```

### Ver Historial de Validaciones

```javascript
// Ver todas las validaciones en cola
window.geminiValidator.validationQueue
```

---

## 📊 Monitoreo de Uso

### Ver Requests Restantes

Google no proporciona contador en tiempo real, pero puedes:

1. Ir a: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
2. Ver "Quotas" para tu proyecto
3. Monitorear uso

---

## ✅ Checklist Final

- [ ] API key obtenida de MakerSuite
- [ ] Configurada en el editor
- [ ] `geminiValidator.isEnabled()` retorna `true`
- [ ] Modal de configuración se abre correctamente
- [ ] Validación funciona al seleccionar elementos
- [ ] Sugerencias aparecen cuando hay errores

---

**Documentación completa:** `/docs/editor/GEMINI_AI_INTEGRATION.md`  
**Última actualización:** 14 Diciembre 2024
