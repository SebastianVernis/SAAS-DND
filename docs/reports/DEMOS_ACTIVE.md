# 🎨 Demos Activos - SAAS-DND

## ✅ Servidor Unificado Activo

**Puerto único:** 3000  
**IP Pública:** 18.223.32.141  
**Protocolo:** HTTP (sin restricciones de puerto)

## 📍 URLs de Acceso (UN SOLO PUERTO)

```
🏠 Catálogo Principal:
   http://18.223.32.141:3000/catalog

🎨 Vanilla Editor (v1):
   http://18.223.32.141:3000/vanilla

🌐 Landing Page (v2):
   http://18.223.32.141:3000/landing

🔍 Health Check:
   http://18.223.32.141:3000/health
```

## 🎯 Ventajas de Esta Configuración

✅ **Un solo puerto (3000)** - Compatible con todos los navegadores  
✅ **Subdirectorios claros** - /vanilla, /landing, /catalog  
✅ **Express.js** - Routing profesional  
✅ **CORS habilitado** - Sin problemas de cross-origin  
✅ **Logging centralizado** - Todos los requests logueados  
✅ **Cache headers** - Performance optimizado  

## 🚀 Características por Demo

### 1. Catálogo (/catalog)
- **URL:** http://18.223.32.141:3000/catalog
- Índice de las 9 versiones del proyecto
- Cards interactivas con detalles
- Iframe preview integrado
- Links a cada demo

### 2. Vanilla Editor (/vanilla)
- **URL:** http://18.223.32.141:3000/vanilla
- Editor visual completo
- 34 componentes drag & drop
- Templates profesionales (Landing, Dashboard, Portfolio, E-commerce)
- AI integrada con Gemini
- Export HTML/CSS/JS
- Sistema de proyectos
- Tutorial interactivo
- Responsive preview (Desktop/Tablet/Mobile)

### 3. Landing Page (/landing)
- **URL:** http://18.223.32.141:3000/landing
- Hero section con gradiente
- Features showcase (9 características)
- Pricing cards (4 planes)
- Use cases (4 perfiles)
- CTA sections
- Footer completo
- 100% responsive

## 🔧 Gestión del Servidor

### Ver logs en tiempo real
```bash
# Desde el job background
# Shell ID: 052
```

### Detener servidor
```bash
# Desde SAAS-DND directorio
pkill -f "node server.js"

# O matar el job background
# job_kill con shell ID: 052
```

### Reiniciar servidor
```bash
cd /home/admin/demos
node server.js &
```

### Verificar estado
```bash
ps aux | grep "node server.js" | grep -v grep
```

## 📁 Estructura de Archivos

```
/home/admin/demos/
├── server.js              # Express server
├── package.json           # Dependencies
├── vanilla/               # v1 Vanilla Editor
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── src/
├── landing/               # v2 Landing Page
│   ├── landing.html
│   ├── landing.css
│   └── assets/
└── catalog/               # Catálogo
    └── index.html
```

## 🧪 Testing de URLs

### Health Check
```bash
curl http://18.223.32.141:3000/health
# Response: {"status":"ok","timestamp":"..."}
```

### Vanilla Editor
```
Abrir en navegador: http://18.223.32.141:3000/vanilla
- Probar drag & drop
- Seleccionar template
- Exportar HTML
```

### Landing Page
```
Abrir en navegador: http://18.223.32.141:3000/landing
- Verificar responsive
- Probar pricing cards
- Scroll suave
```

### Catalog
```
Abrir en navegador: http://18.223.32.141:3000/catalog
- Click en versiones
- Ver iframe previews
- Navegar entre demos
```

## 🎯 Próximos Pasos

### Fase 1: Integración con SAAS Backend ✅
- Backend API corriendo en puerto 3001 (cuando se inicie)
- Frontend React en puerto 5173 (cuando se implemente)

### Fase 2: Nginx Reverse Proxy (Opcional)
```
http://18.223.32.141/           → SAAS App
http://18.223.32.141/api        → Backend (proxy a :3001)
http://18.223.32.141/vanilla    → Demo (proxy a :3000/vanilla)
http://18.223.32.141/landing    → Demo (proxy a :3000/landing)
http://18.223.32.141/catalog    → Demo (proxy a :3000/catalog)
```

**Por ahora:** Usando puerto 3000 directamente (funciona en todos los navegadores)

## 📊 Estado Actual

```
Demos Server:    ████████████████████ 100% ✅
Vanilla Demo:    ████████████████████ 100% ✅
Landing Demo:    ████████████████████ 100% ✅
Catalog:         ████████████████████ 100% ✅
Backend API:     ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Frontend React:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

## 💡 Notas

- El servidor corre en background (shell ID: 052)
- Los logs se muestran en tiempo real
- Cache de 1 hora para assets estáticos
- CORS habilitado para desarrollo
- Fallback 404 con redirect a catalog

---

**Servidor activo desde:** 2024-01-20 17:20  
**PID:** 52790  
**Estado:** ✅ Running  
**Accesible públicamente:** Sí
