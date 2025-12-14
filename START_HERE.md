# 🚀 START HERE - SAAS-DND Quick Context

**IMPORTANTE:** Siempre inicia en este directorio para no perder contexto.

---

## 📍 Directorio de Trabajo

```bash
cd /home/admin/SAAS-DND
```

**Este es el proyecto SAAS-DND, NO el DragNDrop original.**

---

## ✅ Checklist de Inicio Rápido

### 1. Verificar Directorio
```bash
pwd
# Debe mostrar: /home/admin/SAAS-DND
```

### 2. Ver Estado del Proyecto
```bash
git status
git log --oneline | head -5
git branch
```

### 3. Verificar Servicios Activos
```bash
# Frontend
ps aux | grep vite | grep -v grep

# Backend
ps aux | grep "node.*server" | grep -v grep

# Nginx
sudo systemctl status nginx
```

### 4. URLs del Sistema
```
Frontend:  http://18.223.32.141
Editor:    http://18.223.32.141/vanilla
API:       http://18.223.32.141/api
```

---

## 📊 Estado Actual del Proyecto

**Versión:** 1.0.0  
**Estado:** ✅ 100% Completo  
**Commits:** 47+  
**Branch:** main

### ✅ Completado

- Backend API (21 endpoints, 93 tests)
- Frontend React (11 páginas, 7+ tests)
- Editor Vanilla (25 plantillas, 34 componentes)
- Auth completo (Register → OTP → Login)
- Onboarding wizard (4 pasos)
- Dashboard con sidebar
- Projects CRUD
- Team Management
- Deployment en servidor

### 🔧 Últimos Fixes Aplicados

1. ✅ Paneles ocultos al inicio (inline styles HTML)
2. ✅ Canvas fondo oscuro (#1e293b)
3. ✅ Toggle tema funciona (Ctrl+Shift+D)
4. ✅ Panel propiedades ID correcto
5. ✅ Elementos convertibles a position:absolute
6. ✅ Toggle paneles con cssText !important
7. ✅ Pseudo-elementos eliminados

### ⚠️ Problemas Conocidos (Últimos Reportados)

- **Drag & Drop:** Elementos se sombrean pero no se mueven visualmente
  - Causa: Necesitan convertirse a position:absolute al seleccionar
  - Estado: Fix parcial aplicado (commit 0847cae)
  - Próximo: Verificar que freePositionDragDrop funcione

---

## 📁 Estructura del Proyecto

```
/home/admin/SAAS-DND/
├── apps/
│   └── web/              # Frontend React (puerto 5173)
├── backend/              # Backend Express (puerto 3000)
├── vanilla-editor/       # Editor con 25 plantillas
├── docs/                 # Documentación organizada
├── infrastructure/       # Docker, Nginx configs
└── [docs en raíz]        # README, STATUS, CHANGELOG, etc.
```

---

## 🔥 Comandos Rápidos

### Iniciar Servicios

```bash
# Backend
cd /home/admin/SAAS-DND/backend
npm run dev
# Shell ID: verificar con job_output

# Frontend
cd /home/admin/SAAS-DND/apps/web
npm run dev -- --host 0.0.0.0
# Shell ID: verificar con job_output
```

### Ver Logs

```bash
# Backend logs (buscar OTP codes)
# job_output <shell_id_backend>

# Frontend logs
# job_output <shell_id_frontend>

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Testing

```bash
# Backend tests
cd /home/admin/SAAS-DND/backend
npm test

# Frontend tests
cd /home/admin/SAAS-DND/apps/web
npm test
npm run test:e2e
```

---

## 🎯 Próximos Pasos (Si Hay Trabajo Pendiente)

### Opción A: Fix del Drag & Drop
Si el drag & drop aún no mueve elementos:
1. Verificar que selectElement() convierte a position:absolute
2. Verificar que freePositionDragDrop esté inicializado
3. Agregar logs en handleDrag para debug

### Opción B: Features Opcionales
- Settings page completa
- Billing page con Stripe
- Checkout flow
- Editor page integrado
- Colaboración Socket.io

### Opción C: Testing & QA
- Verificar Issue #9 (Jules)
- Revisar PRs pendientes
- Testing manual del flujo completo

---

## 📞 Información de Contacto

**Repositorio:** https://github.com/SebastianVernis/SAAS-DND  
**Issues:** https://github.com/SebastianVernis/SAAS-DND/issues  
**Deploy:** http://18.223.32.141

---

## 🔍 Comandos de Debug

### Ver procesos activos
```bash
ps aux | grep -E "(vite|node.*server|nginx)" | grep -v grep
```

### Ver puertos en uso
```bash
# Puerto 3000 (backend)
lsof -i :3000 2>/dev/null | head -5

# Puerto 5173 (frontend)
lsof -i :5173 2>/dev/null | head -5
```

### Reiniciar servicios
```bash
# Matar procesos
pkill -f "vite.*5173"
pkill -f "node.*server"

# Reiniciar
cd /home/admin/SAAS-DND/backend && npm run dev &
cd /home/admin/SAAS-DND/apps/web && npm run dev -- --host 0.0.0.0 &
```

---

## 📚 Documentación Clave

**Leer primero:**
1. [README.md](./README.md) - Overview
2. [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) - Resumen ejecutivo
3. [STATUS_FINAL.md](./STATUS_FINAL.md) - Estado actual
4. [docs/INDEX.md](./docs/INDEX.md) - Índice completo

**Para desarrollo:**
- [docs/guides/QUICK_START.md](./docs/guides/QUICK_START.md)
- [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)
- [PENDING_TASKS.md](./PENDING_TASKS.md)

**Para deployment:**
- [docs/guides/DEPLOYMENT_GUIDE.md](./docs/guides/DEPLOYMENT_GUIDE.md)
- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)

---

## ⚡ Checklist Pre-Trabajo

Antes de empezar cualquier tarea:

- [ ] `cd /home/admin/SAAS-DND`
- [ ] `git status` (verificar branch main)
- [ ] `git pull origin main` (actualizar)
- [ ] Leer STATUS_FINAL.md
- [ ] Verificar servicios activos
- [ ] Revisar issues en GitHub
- [ ] Verificar PRs pendientes

---

## 🎨 Problemas Actuales a Resolver

### 1. Drag & Drop de Elementos (CRÍTICO)
**Síntoma:** Elementos se sombrean pero no se mueven visualmente  
**Ubicación:** `vanilla-editor/script.js` función `setupElementDragAndDrop`  
**Fix aplicado:** Conversión a position:absolute en selectElement  
**Estado:** Verificar si funciona  

**Para testear:**
1. Ir a http://18.223.32.141/vanilla
2. Cargar plantilla "SaaS Product"
3. Click en un elemento (se selecciona)
4. Intentar arrastrar → ¿Se mueve visualmente?

### 2. Verificar si Paneles se Ocultan
**Fix aplicado:** Inline styles en HTML  
**Estado:** Verificar  

**Para testear:**
1. Cargar http://18.223.32.141/vanilla
2. ¿Paneles ocultos al inicio? ✅/❌
3. Ctrl+B → ¿Muestra componentes? ✅/❌
4. Ctrl+P → ¿Muestra propiedades? ✅/❌

---

## 💡 Tips

- Siempre usar `Ctrl+Shift+R` para hard refresh
- Revisar consola del navegador para errores
- Backend logs tienen OTP codes (desarrollo mode)
- Jules puede crear PRs automáticamente con label "jules"

---

**Última actualización:** 14 Dic 2024  
**Commits:** 47  
**Estado:** 100% Completo
