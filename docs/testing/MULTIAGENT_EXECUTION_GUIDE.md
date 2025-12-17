# 🤖 GUÍA DE EJECUCIÓN MULTIAGENTE - E2E TESTING

**Fecha:** 16 de Diciembre 2024  
**Método:** 3 Tasks Paralelas (Manual Multi-Agent)

---

## 🎯 ESTRATEGIA DE EJECUCIÓN

Como Remote Code MCP no soporta multi-agent en una sola llamada, ejecutaremos **3 tasks independientes en paralelo** manualmente.

### Ventajas de Este Enfoque:
✅ Control total sobre cada agente  
✅ Ejecución simultánea real  
✅ Logs independientes por agente  
✅ Comparación manual (tú eres el "AI Judge")  
✅ Flexibilidad para ajustar prompts por agente

---

## 🚀 COMANDOS DE LANZAMIENTO

### Task 1: BLACKBOX Pro (Performance Focus)

```javascript
mcp_remote-code_task({
  "prompt": `🤖 E2E Testing SAAS-DND - Agent BLACKBOX (Performance Focus)

## Focus Areas
- Optimizar velocidad de ejecución
- Maximizar cobertura de tests
- Priorizar tests críticos primero

## Test Scope
96 tests totales:
- 40 Vanilla Editor (25 templates + features)
- 12 React Frontend (auth + dashboard)
- 44 Backend API (todos los endpoints)

URLs:
- http://18.223.32.141/vanilla
- http://18.223.32.141
- http://18.223.32.141/api

Ver E2E_MASTER_TASK.md para test cases detallados.

## Deliverables
- tests/e2e/ (3 spec files)
- screenshots/agent-blackbox/ (50+ images)
- reports/agent-blackbox.md (comprehensive report)

## Success Criteria
- 90%+ pass rate
- <43 minutes execution
- 50+ screenshots
- Performance metrics included

Prioridad: Performance + Coverage
`,
  "repoUrl": "https://github.com/SebastianVernis/SAAS-DND",
  "branch": "main",
  "agent": "blackbox",
  "model": "blackboxai/blackbox-pro",
  "maxDuration": 45,
  "installDependencies": true
})
```

### Task 2: Claude Sonnet (Code Quality Focus)

```javascript
mcp_remote-code_task({
  "prompt": `🤖 E2E Testing SAAS-DND - Agent Claude (Code Quality Focus)

## Focus Areas
- Código de tests limpio y mantenible
- Best practices en testing
- Documentación exhaustiva
- Mensajes de error claros

## Test Scope
96 tests totales:
- 40 Vanilla Editor (25 templates + features)
- 12 React Frontend (auth + dashboard)
- 44 Backend API (todos los endpoints)

URLs:
- http://18.223.32.141/vanilla
- http://18.223.32.141
- http://18.223.32.141/api

Ver E2E_MASTER_TASK.md para test cases detallados.

## Deliverables
- tests/e2e/ (3 spec files, highest quality code)
- screenshots/agent-claude/ (50+ images)
- reports/agent-claude.md (most detailed report)

## Success Criteria
- 90%+ pass rate
- Código siguiendo best practices
- Tests atómicos e independientes
- Reporte con métricas y análisis profundo

Prioridad: Code Quality + Documentation
`,
  "repoUrl": "https://github.com/SebastianVernis/SAAS-DND",
  "branch": "main",
  "agent": "claude",
  "model": "claude-3-5-sonnet-20241022",
  "maxDuration": 45,
  "installDependencies": true
})
```

### Task 3: Gemini Exp (Edge Cases Focus)

```javascript
mcp_remote-code_task({
  "prompt": `🤖 E2E Testing SAAS-DND - Agent Gemini (Edge Cases Focus)

## Focus Areas
- Validar edge cases y escenarios inusuales
- Error handling exhaustivo
- Retry logic robusto
- Maximum screenshot coverage

## Test Scope
96 tests totales:
- 40 Vanilla Editor (25 templates + edge cases)
- 12 React Frontend (auth + error scenarios)
- 44 Backend API (todos los endpoints + validation)

URLs:
- http://18.223.32.141/vanilla
- http://18.223.32.141
- http://18.223.32.141/api

Ver E2E_MASTER_TASK.md para test cases detallados.

## Deliverables
- tests/e2e/ (3 spec files con edge cases)
- screenshots/agent-gemini/ (60+ images)
- reports/agent-gemini.md (edge cases documented)

## Success Criteria
- 90%+ pass rate
- Edge cases cubiertos
- Retry logic implementado
- Maximum screenshots captured

Prioridad: Edge Cases + Error Handling
`,
  "repoUrl": "https://github.com/SebastianVernis/SAAS-DND",
  "branch": "main",
  "agent": "gemini",
  "model": "gemini-exp-1206",
  "maxDuration": 45,
  "installDependencies": true
})
```

---

## 📊 MONITOREO PARALELO

### Ver Todas las Tasks Activas

```javascript
mcp_remote-code_my_tasks({ "filter": "running" })
```

### Ver Estado Individual

```javascript
// Task BLACKBOX
mcp_remote-code_task_status({ "taskId": "BLACKBOX_TASK_ID" })

// Task Claude
mcp_remote-code_task_status({ "taskId": "CLAUDE_TASK_ID" })

// Task Gemini
mcp_remote-code_task_status({ "taskId": "GEMINI_TASK_ID" })
```

---

## 🏆 PROCESO DE EVALUACIÓN MANUAL

### Paso 1: Esperar Completion (~45 min)

Monitorear hasta que las 3 tasks completen:
```javascript
mcp_remote-code_my_tasks({ "filter": "completed" })
```

### Paso 2: Revisar PRs Individuales

Cada agente creará su propio PR:
- `feature/e2e-testing-blackbox-{timestamp}`
- `feature/e2e-testing-claude-{timestamp}`
- `feature/e2e-testing-gemini-{timestamp}`

### Paso 3: Comparar Resultados

Crear tabla de comparación:

| Métrica | BLACKBOX | Claude | Gemini |
|---------|----------|--------|--------|
| Tests Passed | ?/96 | ?/96 | ?/96 |
| Duration | ? min | ? min | ? min |
| Screenshots | ? | ? | ? |
| Issues Found | ? | ? | ? |
| Code Quality | ? | ? | ? |

### Paso 4: Seleccionar Mejor Implementación

**Criterios de selección:**
1. **Pass Rate** (peso: 40%)
2. **Code Quality** (peso: 30%)
3. **Coverage** (screenshots, peso: 15%)
4. **Performance** (duration, peso: 15%)

**Scoring:**
```javascript
score = (passRate * 0.4) + (codeQuality * 0.3) + (coverage * 0.15) + (performance * 0.15)
```

### Paso 5: Mergear Ganador

```bash
# Checkout del branch ganador
git checkout feature/e2e-testing-{winner}-{timestamp}

# Review final
git diff main

# Merge a main
git checkout main
git merge feature/e2e-testing-{winner}-{timestamp}

# Push
git push origin main
```

### Paso 6: Limpiar Branches Perdedores

```bash
# Eliminar branches locales
git branch -D feature/e2e-testing-{loser1}-{timestamp}
git branch -D feature/e2e-testing-{loser2}-{timestamp}

# Eliminar branches remotos
git push origin --delete feature/e2e-testing-{loser1}-{timestamp}
git push origin --delete feature/e2e-testing-{loser2}-{timestamp}
```

---

## 📋 CHECKLIST DE EJECUCIÓN

### Pre-Launch
- [ ] Leer E2E_MASTER_TASK.md completo
- [ ] Verificar URLs accesibles (http://18.223.32.141)
- [ ] Confirmar repo SAAS-DND existe
- [ ] Branch main actualizado

### Launch (Secuencial para evitar conflicts)
- [ ] Lanzar Task BLACKBOX (copiar comando arriba)
- [ ] Esperar 30 segundos
- [ ] Lanzar Task Claude (copiar comando arriba)
- [ ] Esperar 30 segundos
- [ ] Lanzar Task Gemini (copiar comando arriba)

### Monitoring (Cada 10 min)
- [ ] Verificar progreso con `my_tasks`
- [ ] Revisar logs si alguna falla
- [ ] Documentar observaciones

### Post-Completion
- [ ] Revisar los 3 PRs creados
- [ ] Comparar implementaciones
- [ ] Seleccionar ganador
- [ ] Mergear a main
- [ ] Limpiar branches perdedores
- [ ] Actualizar documentación

---

## 🎯 RESULTADOS ESPERADOS

### Por Cada Agente (x3)

**Archivos creados en PR:**
```
tests/
├── e2e/
│   ├── vanilla-editor.spec.ts
│   ├── react-frontend.spec.ts
│   ├── backend-api.spec.ts
│   └── helpers/
│       ├── setup.ts
│       ├── auth.ts
│       └── utils.ts
screenshots/
├── agent-{name}/
│   ├── vanilla/ (30+ images)
│   ├── frontend/ (15+ images)
│   └── api/ (10+ images)
reports/
└── agent-{name}.md
```

**Total esperado:**
- 3 PRs
- 9 test spec files (3 por agente)
- 150+ screenshots (50 por agente)
- 3 reportes individuales

### Consolidación Final

Después de seleccionar ganador:
```
tests/e2e/ (del ganador)
screenshots/ (los 3 agentes para comparación)
reports/
├── agent-blackbox.md
├── agent-claude.md
├── agent-gemini.md
├── COMPARISON_MATRIX.md (manual)
└── WINNER_SELECTION.md (manual)
```

---

## 📝 TEMPLATE DE COMPARACIÓN

Usar este template para documentar la comparación:

```markdown
# 🏆 Multi-Agent E2E Testing - Comparison Report

## 📊 Agent Performance Matrix

| Metric | BLACKBOX | Claude | Gemini |
|--------|----------|--------|--------|
| **Pass Rate** | X/96 (XX%) | X/96 (XX%) | X/96 (XX%) |
| **Duration** | X min | X min | X min |
| **Screenshots** | X | X | X |
| **Issues Found** | X | X | X |
| **Critical Issues** | X | X | X |
| **Code Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Self-Corrections** | X | X | X |
| **Report Detail** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Winner Selection

**Selected:** {Agent Name}

**Reasons:**
1. {Reason 1}
2. {Reason 2}
3. {Reason 3}

## 📁 Artifacts to Keep

From winner:
- All test suites
- Test helpers
- Playwright config

From all agents:
- All screenshots (for comparison)
- All reports (for documentation)

## 🔄 Merge Plan

1. Checkout winner branch
2. Review implementation
3. Merge to main
4. Delete other branches
5. Update documentation
```

---

## ⚙️ ALTERNATIVA: Ejecución Secuencial

Si prefieres evitar conflictos de branches, ejecutar uno a la vez:

```bash
# 1. Lanzar BLACKBOX
# Esperar completion (~45 min)
# Revisar PR

# 2. Lanzar Claude
# Esperar completion (~45 min)
# Revisar PR

# 3. Lanzar Gemini
# Esperar completion (~45 min)
# Revisar PR

# 4. Comparar y seleccionar
```

**Tiempo total:** ~135 minutos (secuencial)  
**vs.**  
**Tiempo paralelo:** ~45 minutos

---

## 🎓 CONCLUSIÓN

### Enfoque Recomendado: Paralelo

**Comandos:**
1. Copiar y ejecutar Task 1 (BLACKBOX)
2. Esperar 30 segundos
3. Copiar y ejecutar Task 2 (Claude)
4. Esperar 30 segundos
5. Copiar y ejecutar Task 3 (Gemini)

**Monitoreo:**
```javascript
// Cada 5-10 minutos
mcp_remote-code_my_tasks({ "filter": "running" })
```

**Post-Processing:**
- Revisar los 3 PRs
- Comparar usando template arriba
- Mergear el mejor
- Documentar decisión

**Tiempo total:** 45 minutos + 15 min review = 1 hora

---

**Ready to execute:** ✅  
**Next step:** Copiar y ejecutar los 3 comandos arriba
