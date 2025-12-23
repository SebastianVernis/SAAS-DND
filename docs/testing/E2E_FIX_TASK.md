# 🐛 E2E Test Fixes Task - SAAS-DND

**Priority:** Critical  
**Status:** Ready to Execute  
**Expected Duration:** 45-60 minutes  
**Current State:** 86/110 tests failing (21.8% pass rate)

---

## 🎯 Objetivo

Analizar y corregir los 86 tests E2E fallando para alcanzar **>90% pass rate** (99+ tests pasando).

---

## 📊 Estado Actual

**Test Results:**
- Total: 110 tests
- Passing: 24 (21.8%)
- Failing: 86 (78.2%)
- Target: 99+ (90%+)

**Fallos por suite:**
- vanilla-editor.spec.ts: ~35/40 failing
- react-frontend.spec.ts: ~10/12 failing
- backend-api.spec.ts: ~41/44 failing

---

## 🔍 Análisis de Problemas

### Problema #1: Selectores Incorrectos (Estimado: 50% de fallos)

**Causa:** Tests creados sin ejecutar, selectores basados en documentación

**Ejemplos probables:**
```typescript
// Test usa:
'#property-panel'

// Pero DOM real tiene:
'#properties-panel'  // O
'.property-panel'    // O
'[data-panel="properties"]'
```

**Solución:** Inspeccionar DOM real y corregir selectores

---

### Problema #2: Timeouts Insuficientes (Estimado: 25% de fallos)

**Causa:** URLs remotas (18.223.32.141) tienen latencia de red

**Ejemplos:**
```typescript
// Timeout muy corto
await page.waitForSelector('#canvas h1', { timeout: 5000 });

// Para URLs remotas necesita más
await page.waitForSelector('#canvas h1', { timeout: 15000 });
```

---

### Problema #3: Legal Modal Bloqueando (Estimado: 15% de fallos)

**Causa:** Modal no se cierra correctamente en todos los tests

**Solución:**
```typescript
// Crear helper robusto
async function acceptLegalModal(page: Page) {
  try {
    const checkbox = page.locator('#accept-terms-checkbox');
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    await checkbox.check();
    await page.click('#accept-btn');
    await page.waitForTimeout(1000);
  } catch (error) {
    // Modal no presente o ya cerrado
    console.log('Legal modal not present or already accepted');
  }
}
```

---

### Problema #4: Network Issues (Estimado: 10% de fallos)

**Causa:** API calls a servidor remoto pueden fallar o tardar

**Solución:**
- Aumentar timeouts de API requests
- Agregar retry logic
- Verificar servicios están up antes de tests

---

## 🛠️ Plan de Corrección

### Fase 1: Setup y Análisis (10 min)

```bash
# 1. Instalar Playwright
npx playwright install chromium

# 2. Ejecutar tests y ver output detallado
npx playwright test --reporter=list > test-output.log 2>&1

# 3. Generar reporte HTML
npx playwright test --reporter=html

# 4. Abrir reporte
npx playwright show-report

# 5. Identificar patrones:
# - ¿Qué selectores fallan más?
# - ¿Qué timeouts se exceden?
# - ¿Hay errores de red?
```

---

### Fase 2: Inspección de DOM (10 min)

**Manual inspection:**

1. **Abrir editor en browser:**
   - URL: http://18.223.32.141/vanilla
   - Abrir DevTools (F12)
   - Inspeccionar elementos

2. **Verificar selectores críticos:**
   ```javascript
   // En console del browser
   document.querySelector('#property-panel')     // ¿Existe?
   document.querySelector('#properties-panel')   // ¿O este?
   document.querySelector('.property-panel')     // ¿O clase?
   
   // Resize handles
   document.querySelectorAll('.resize-handle')   // ¿Cuántos?
   
   // Canvas
   document.querySelector('#canvas')             // ¿Correcto?
   ```

3. **Documentar selectores reales** para referencia

---

### Fase 3: Correcciones en Helpers (15 min)

**Archivos a editar:**
- `tests/e2e/helpers/editor.ts`
- `tests/e2e/helpers/setup.ts`
- `tests/e2e/helpers/auth.ts`

**Cambios típicos:**

1. **Aumentar timeouts globales:**
```typescript
// helpers/setup.ts
export const TIMEOUTS = {
  short: 5000,
  medium: 15000,    // Era 10000
  long: 30000,      // Era 20000
  extraLong: 60000,
};
```

2. **Corregir selector de properties panel:**
```typescript
// helpers/editor.ts
export async function verifyPropertiesPanel(page: Page, ...) {
  // Buscar el selector correcto
  const panelSelectors = [
    '#properties-panel',
    '#property-panel',
    '.properties-panel',
    '[data-testid="properties-panel"]'
  ];
  
  let panel;
  for (const selector of panelSelectors) {
    panel = page.locator(selector);
    if (await panel.count() > 0) break;
  }
  
  await panel.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
  // ...
}
```

3. **Legal modal robusto:**
```typescript
// helpers/editor.ts
export async function acceptLegalModal(page: Page) {
  try {
    await page.waitForLoadState('networkidle');
    const checkbox = page.locator('#accept-terms-checkbox');
    const visible = await checkbox.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (visible) {
      await checkbox.check();
      await page.click('#accept-btn');
      await page.waitForTimeout(1500);  // Esperar animación
    }
  } catch (error) {
    // Modal no presente, continuar
  }
}
```

---

### Fase 4: Correcciones en Tests (15 min)

**Archivos a editar:**
- `tests/e2e/vanilla-editor.spec.ts`
- `tests/e2e/react-frontend.spec.ts`
- `tests/e2e/backend-api.spec.ts`

**Patrones de corrección:**

1. **Esperar networkidle para URLs remotas:**
```typescript
await page.goto('http://18.223.32.141/vanilla', {
  waitUntil: 'networkidle',
  timeout: 30000  // URL remota
});
```

2. **Usar helpers en lugar de código inline:**
```typescript
// Antes
await page.goto('...');
const checkbox = await page.locator('#accept-terms-checkbox');
// ... código duplicado

// Después
await loadEditor(page);  // Helper que hace todo
```

3. **Agregar waits adicionales para elementos dinámicos:**
```typescript
// Antes
await page.click('text=Plantillas');
await page.click('text=Landing Page SaaS');

// Después
await page.click('text=Plantillas');
await page.waitForTimeout(500);  // Esperar menú abrir
await page.click('text=Landing Page SaaS');
await page.waitForSelector('#canvas', { state: 'visible' });
```

---

### Fase 5: Validación y Re-Test (10 min)

```bash
# 1. Ejecutar tests corregidos
npx playwright test

# 2. Ver resultados
npx playwright show-report

# 3. Si aún fallan algunos:
#    - Revisar screenshots en test-results/
#    - Ver traces con: npx playwright show-trace <trace-file>
#    - Ajustar y re-ejecutar

# 4. Iterar hasta >90% pass rate
```

---

## 📝 Deliverables

### 1. Tests Corregidos
- `tests/e2e/vanilla-editor.spec.ts` (fixes aplicados)
- `tests/e2e/react-frontend.spec.ts` (fixes aplicados)
- `tests/e2e/backend-api.spec.ts` (fixes aplicados)

### 2. Helpers Mejorados
- `tests/e2e/helpers/editor.ts` (selectores corregidos)
- `tests/e2e/helpers/setup.ts` (timeouts ajustados)
- `tests/e2e/helpers/auth.ts` (robustez mejorada)

### 3. Documentación
- `docs/testing/E2E_FIXES_REPORT.md` (nuevo)
  * Lista de todos los fixes
  * Before/after comparisons
  * Lessons learned
  * Final test results

### 4. Test Results
- `playwright-report/` (HTML report actualizado)
- `test-results/` (screenshots de tests pasando)

---

## 🎯 Success Criteria

- [ ] **Pass rate >90%** (99+ de 110 tests)
- [ ] Todos los selectores validados contra DOM real
- [ ] Timeouts apropiados para URLs remotas
- [ ] Legal modal manejado en todos los tests
- [ ] Helpers robustos y reutilizables
- [ ] Documentación de fixes completa
- [ ] PR creado con cambios

---

## 🔧 Comandos de Debugging

### Ver test específico
```bash
npx playwright test vanilla-editor.spec.ts --grep "should load template"
```

### Debug mode (paso a paso)
```bash
npx playwright test --debug
```

### Ver trace de fallo
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Headed mode (ver browser)
```bash
npx playwright test --headed
```

---

## 📞 Recursos

**Documentación oficial:**
- Playwright: https://playwright.dev/docs/intro
- Playwright Selectors: https://playwright.dev/docs/selectors
- Playwright Best Practices: https://playwright.dev/docs/best-practices

**Proyecto:**
- Test README: `tests/e2e/README.md`
- Agent guide: `docs/guides/AGENTS.md`
- Structure: `STRUCTURE.md`

---

**Created:** 17/12/2024  
**For:** Remote Code Agent / Local Developer  
**Priority:** Critical (blocking test validation)
