# Demos Desplegados - URLs de Acceso

## ✅ Servidores Activos

Todos los demos están corriendo en puertos dedicados:

### 📍 URLs Públicas

```
Vanilla Editor:   http://18.223.32.141:8080
Landing Page:     http://18.223.32.141:8081
Catalog:          http://18.223.32.141:8082
```

### 🎨 Demos Disponibles

#### 1. Vanilla Editor (Puerto 8080)
**URL:** http://18.223.32.141:8080  
**Características:**
- Editor visual completo
- 34 componentes drag & drop
- Templates profesionales
- Export HTML/CSS/JS
- AI integrada (Gemini)
- Colaboración en tiempo real
- PWA con offline support

**Estado:** ✅ Funcionando

#### 2. Landing Page (Puerto 8081)
**URL:** http://18.223.32.141:8081/landing.html  
**Características:**
- Hero section
- Features showcase
- Pricing (4 planes: Free, Pro, Teams, Enterprise)
- Responsive design
- Animaciones smooth scroll

**Estado:** ✅ Funcionando

#### 3. Catalog (Puerto 8082)
**URL:** http://18.223.32.141:8082  
**Características:**
- Índice de todas las versiones
- Cards con descripciones
- Links a cada demo
- Iframe integrado para preview

**Estado:** ✅ Funcionando

## 🔧 Gestión de Servidores

### Ver logs

```bash
# Vanilla demo
tail -f /tmp/vanilla-demo.log

# Landing demo
tail -f /tmp/landing-demo.log

# Catalog
tail -f /tmp/catalog-demo.log
```

### Reiniciar demos

```bash
/home/admin/demos/start-all-demos.sh
```

### Detener todos los demos

```bash
pkill -f 'http-server'
```

### Verificar que están corriendo

```bash
ps aux | grep http-server
```

## 📂 Ubicación de Archivos

```
/home/admin/demos/
├── vanilla/          # Versión 1 completa
├── landing/          # Landing page
├── catalog/          # Catálogo de versiones
└── start-all-demos.sh
```

## 🎯 Próximos Pasos: Nginx Reverse Proxy

Actualmente los demos usan puertos dedicados. Para tener todo en subdirectorios (un solo puerto 80):

### Configuración Nginx Planeada:

```
http://18.223.32.141/           → App principal (SAAS)
http://18.223.32.141/api        → Backend API
http://18.223.32.141/vanilla    → Vanilla demo (8080)
http://18.223.32.141/landing    → Landing demo (8081)
http://18.223.32.141/catalog    → Catalog (8082)
```

**Requiere:**
1. Configuración de Nginx (ya creada en `/infrastructure/nginx/`)
2. Permisos de administrador para instalar/configurar Nginx
3. Copiar archivos a `/var/www/saasdnd/` (requiere sudo)

## 🧪 Testing de Demos

### Vanilla Editor
```bash
# Abrir en navegador
xdg-open http://18.223.32.141:8080

# Probar features:
# - Drag & drop de componentes
# - Panel de propiedades
# - Export HTML
# - Templates
# - Responsive preview
```

### Landing Page
```bash
# Abrir en navegador
xdg-open http://18.223.32.141:8081/landing.html

# Probar:
# - Navegación
# - Pricing cards
# - Mobile responsive
# - Smooth scroll
```

### Catalog
```bash
# Abrir en navegador
xdg-open http://18.223.32.141:8082

# Probar:
# - Click en cada versión
# - Preview en iframe
# - Links externos
```

## 📊 Estado de Deployment

```
Demos:          ████████████████████ 100% ✅
Nginx Config:   ████████████████████ 100% ✅ (archivos creados)
Nginx Install:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳ (requiere sudo)
SSL/HTTPS:      ░░░░░░░░░░░░░░░░░░░░   0% ⏳ (después de Nginx)
```

## 💡 Notas

- Los demos están corriendo con `http-server` en background
- Los procesos sobrevivirán hasta que se detengan manualmente
- Los logs se guardan en `/tmp/`
- Para producción, usar Nginx reverse proxy

---

**Última actualización:** 2024-01-20 17:20  
**IP Pública:** 18.223.32.141  
**Servidores activos:** 3/3 ✅
