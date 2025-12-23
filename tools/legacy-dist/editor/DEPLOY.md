# 🚀 Editor HTML Drag & Drop - Deployment Package

**Versión:** 1.1.0  
**Fecha:** 14 Diciembre 2024  
**Licencia:** Proprietary

---

## 📦 Contenido del Paquete

Este directorio contiene una **versión completa y autocontenida** del Editor HTML Drag & Drop, lista para desplegar en cualquier servidor web.

### Estructura
```
editor/
├── index.html              # Punto de entrada principal
├── script.js               # Lógica principal del editor (182KB)
├── style.css               # Estilos globales (45KB)
├── service-worker.js       # PWA service worker (offline support)
├── DEPLOY.md              # Este archivo
└── src/                    # Módulos organizados
    ├── ai/                 # AI features (Gemini validation, code generation)
    ├── components/         # UI components (panels, modals, toolbars)
    ├── core/               # Core systems (drag&drop, resize, undo/redo)
    ├── editor/             # Editor features (formatting, resize handles)
    ├── integrations/       # External integrations (Git, analytics)
    ├── legal/              # Legal modals (terms, privacy)
    ├── reader/             # File/directory reader
    ├── storage/            # LocalStorage and project management
    ├── styles/             # Additional CSS modules
    └── utils/              # Utility functions
```

**Total:** 128 archivos, ~1.8MB

---

## ✅ Características del Paquete

### Autocontenido
✅ **Sin CDN** - No depende de recursos externos  
✅ **Sin NPM** - No requiere node_modules  
✅ **Sin build** - Listo para usar directamente  
✅ **Rutas relativas** - Funciona en cualquier ruta base  
✅ **ES6 Modules** - Código modular y mantenible  

### Sin Dependencias Externas Críticas
- ⚠️ Placeholders de imágenes usan `via.placeholder.com` (opcional, solo en plantillas demo)
- ⚠️ AI features requieren API keys (Gemini) pero son opcionales
- ✅ Todo lo demás es autocontenido

---

## 🚀 Deployment

### Opción 1: Servidor Web Simple

**Nginx:**
```nginx
server {
    listen 80;
    server_name editor.tudominio.com;
    
    root /var/www/editor;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache:**
```apache
<VirtualHost *:80>
    ServerName editor.tudominio.com
    DocumentRoot /var/www/editor
    
    <Directory /var/www/editor>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Comando de deploy:**
```bash
# Copiar archivos
sudo cp -r dist/editor/* /var/www/editor/

# Ajustar permisos
sudo chown -R www-data:www-data /var/www/editor
sudo chmod -R 755 /var/www/editor
```

---

### Opción 2: Subdirectorio

Si despliegas en un subdirectorio (ej: `tudominio.com/editor`):

**Nginx:**
```nginx
location /editor {
    alias /var/www/saasdnd/editor;
    index index.html;
    try_files $uri $uri/ /editor/index.html;
}
```

**Comando de deploy:**
```bash
sudo cp -r dist/editor /var/www/saasdnd/
sudo chown -R www-data:www-data /var/www/saasdnd/editor
sudo chmod -R 755 /var/www/saasdnd/editor
```

---

### Opción 3: Docker

**Dockerfile:**
```dockerfile
FROM nginx:alpine

# Copiar archivos del editor
COPY dist/editor /usr/share/nginx/html

# Configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
services:
  editor:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

---

### Opción 4: Vercel / Netlify

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/editor/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/editor/(.*)",
      "dest": "/dist/editor/$1"
    }
  ]
}
```

**Deploy:**
```bash
vercel --prod
# O arrastrar carpeta dist/editor a Netlify
```

---

## 🔧 Configuración Post-Deploy

### 1. Service Worker (Opcional)

Si NO deseas soporte PWA/offline:
```bash
rm /var/www/editor/service-worker.js
```

Y remover registro en HTML (línea ~580):
```javascript
// Comentar o eliminar:
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}
```

---

### 2. API Keys para AI Features (Opcional)

Si deseas usar validación con Gemini:

1. Obtener API key: https://makersuite.google.com/app/apikey
2. Agregar al localStorage en el navegador:
```javascript
localStorage.setItem('gemini_api_key', 'TU_API_KEY_AQUI');
```

O configurar en el código (NO recomendado para producción):
```javascript
// En src/core/geminiValidator.js
this.apiKey = 'TU_API_KEY_AQUI';
```

---

### 3. Personalización de Branding

**Título y meta tags** (`index.html`):
```html
<title>Tu Editor HTML</title>
<meta name="description" content="Tu descripción">
<meta name="theme-color" content="#TU_COLOR">
```

**Logo y branding** (`script.js` línea ~60):
```javascript
<h1>Tu Editor HTML</h1>
```

---

## ✅ Verificación Post-Deploy

### Checklist de Funcionalidad

```bash
# 1. Acceder a la URL
curl -I http://tudominio.com/editor

# 2. Verificar que index.html se carga
curl http://tudominio.com/editor | grep "<title>"

# 3. Verificar script.js
curl -I http://tudominio.com/editor/script.js

# 4. Verificar módulos src/
curl -I http://tudominio.com/editor/src/init.js
```

### Testing en Navegador

1. ✅ Abrir URL del editor
2. ✅ Verificar que se carga sin errores en consola
3. ✅ Abrir panel de componentes (Ctrl+B)
4. ✅ Arrastrar un componente al canvas
5. ✅ Seleccionar elemento → Handles de resize aparecen
6. ✅ Double-click en texto → Se vuelve editable
7. ✅ Abrir panel de propiedades (Ctrl+P) → Valores cargados
8. ✅ Cargar plantilla "SaaS Product"
9. ✅ Exportar HTML (debe funcionar)
10. ✅ Guardar proyecto en localStorage

---

## 🔒 Seguridad

### Headers Recomendados (Nginx)

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# CSP (ajustar según necesidades)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

### Archivos Sensibles a Proteger

```nginx
# Bloquear acceso a archivos sensibles
location ~ /\. {
    deny all;
}

location ~ \.(md|json|yml|yaml)$ {
    deny all;
}
```

---

## 📊 Performance

### Métricas Esperadas

- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s
- **Total Bundle Size:** ~1.8MB
- **Script.js:** 182KB (sin minificar)
- **Lighthouse Score:** 85+ (Performance)

### Optimizaciones Aplicadas

✅ **ES6 Modules** - Carga lazy de módulos  
✅ **CSS separado** - Sin inline styles críticos  
✅ **Service Worker** - Cache de assets  
✅ **Eventos delegados** - Performance mejorado  

### Optimizaciones Futuras (Opcional)

- [ ] Minificar script.js (→ ~90KB)
- [ ] Comprimir CSS (→ ~30KB)
- [ ] Lazy load de templates (solo cargar al usar)
- [ ] Code splitting por feature
- [ ] WebP para imágenes

---

## 🌍 Compatibilidad

### Navegadores Soportados

✅ **Chrome/Edge:** 90+  
✅ **Firefox:** 88+  
✅ **Safari:** 14+  
⚠️ **IE11:** NO soportado (requiere ES6)

### Features Requeridas

- ES6 Modules (`import/export`)
- `contentEditable` API
- Drag & Drop API
- `getComputedStyle()` API
- Local Storage
- CSS Grid & Flexbox

---

## 📁 Archivos Clave

### Core
- `index.html` - Punto de entrada (37KB)
- `script.js` - Lógica principal (182KB)
- `style.css` - Estilos globales (45KB)

### Modules Críticos
- `src/init.js` - Inicialización de todos los módulos
- `src/core/resizeManager.js` - Sistema de resize con handles
- `src/core/freePositionDragDrop.js` - Drag & drop libre
- `src/core/undoRedo.js` - Historial de cambios
- `src/storage/projectManager.js` - Gestión de proyectos

### UI Components
- `src/components/layers/LayersPanel.js` - Panel de capas
- `src/components/AdvancedPropertiesPanel.js` - Panel de propiedades avanzado
- `src/editor/resizeHandles.js` - Handles visuales de resize

---

## 🐛 Troubleshooting

### El editor no carga

**Síntoma:** Pantalla blanca o error en consola

**Causas:**
1. Rutas incorrectas (verificar base path)
2. Módulos no encontrados (verificar src/)
3. MIME types incorrectos en servidor

**Solución:**
```bash
# Verificar que todos los archivos existan
find /var/www/editor -type f | wc -l  # Debe ser 128

# Verificar permisos
ls -la /var/www/editor/

# Verificar consola del navegador
# Abrir DevTools → Console → Buscar errores
```

### Componentes no se pueden arrastrar

**Causa:** Event listeners no registrados

**Solución:**
```javascript
// En consola del navegador
window.freePositionDragDrop  // Debe existir
```

### Panel de propiedades vacío

**Causa:** `getComputedStyle()` no funciona

**Solución:**
- Verificar que estás en navegador moderno
- Ver consola para errores JavaScript

---

## 📞 Soporte

**Repositorio:** https://github.com/SebastianVernis/SAAS-DND  
**Issues:** https://github.com/SebastianVernis/SAAS-DND/issues  
**Documentación:** `/docs/editor/`

**Contacto:** sebastianvernis@example.com

---

## 📝 Changelog

### v1.1.0 (14 Dic 2024)
- ✅ Fix: Panel de propiedades lee computed styles
- ✅ Feature: Edición inline de textos (double-click)
- ✅ Feature: Resize con 8 handles direccionales
- ✅ Feature: Aspect ratio con Shift
- ✅ Feature: Tooltip de dimensiones
- ✅ Docs: Documentación completa agregada
- ✅ Deploy: Paquete autocontenido creado

### v1.0.0 (13 Dic 2024)
- ✅ 25 plantillas profesionales
- ✅ 34 componentes drag & drop
- ✅ Panel de propiedades funcional
- ✅ Tema oscuro por defecto
- ✅ Export HTML/CSS/JS
- ✅ LocalStorage persistence

---

**Generado por:** Blackbox Pro via Crush  
**Fecha:** 14 Diciembre 2024  
**Proyecto:** SAAS-DND
