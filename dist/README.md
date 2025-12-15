# 📦 SAAS-DND Distribution Package

**Versión:** 1.1.0  
**Fecha:** 14 Diciembre 2024

---

## 📁 Contenido

Este directorio contiene **versiones listas para producción** del proyecto SAAS-DND.

```
dist/
├── editor/              # Editor HTML autocontenido (1.8MB, 128 archivos)
│   ├── index.html       # Punto de entrada
│   ├── script.js        # Lógica principal (182KB)
│   ├── style.css        # Estilos (45KB)
│   ├── src/             # Módulos organizados (123 archivos)
│   ├── DEPLOY.md        # Guía de deployment
│   └── MANIFEST.json    # Metadata del paquete
├── deploy.sh            # Script universal de deployment
└── README.md            # Este archivo
```

---

## 🚀 Quick Deploy

### 1. Deploy Simple (Subdirectorio)

```bash
# Desde el directorio raíz del proyecto
cd dist/
./deploy.sh /var/www/saasdnd/editor www-data
```

**Parámetros:**
- `$1` - Directorio destino (default: `/var/www/saasdnd/editor`)
- `$2` - Usuario web server (default: `www-data`)

---

### 2. Deploy con Verificación (Dry Run)

```bash
# Verificar qué se hará sin ejecutar
DRY_RUN=true ./deploy.sh /ruta/destino
```

---

### 3. Deploy Manual

```bash
# Copiar archivos
sudo cp -r dist/editor /var/www/saasdnd/

# Ajustar permisos
sudo chown -R www-data:www-data /var/www/saasdnd/editor
sudo chmod -R 755 /var/www/saasdnd/editor
sudo find /var/www/saasdnd/editor -type f -exec chmod 644 {} \;
```

---

## 🌐 Configuración de Servidor

### Nginx (Recomendado)

**Subdirectorio:**
```nginx
location /editor {
    alias /var/www/saasdnd/editor;
    index index.html;
    try_files $uri $uri/ /editor/index.html;
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Dominio completo:**
```nginx
server {
    listen 80;
    server_name editor.tudominio.com;
    
    root /var/www/saasdnd/editor;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Apache

**Subdirectorio (.htaccess):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /editor/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /editor/index.html [L]
</IfModule>
```

---

## ✅ Verificación Post-Deploy

### Checklist Rápido

```bash
# 1. Verificar archivos copiados
ls -la /var/www/saasdnd/editor/ | head -10

# 2. Verificar permisos
ls -l /var/www/saasdnd/editor/index.html  # Debe ser 644

# 3. Contar archivos
find /var/www/saasdnd/editor -type f | wc -l  # Debe ser ~128

# 4. Verificar tamaño
du -sh /var/www/saasdnd/editor  # Debe ser ~1.8MB
```

### Testing en Navegador

1. Abrir URL del editor
2. Abrir DevTools → Console
3. Verificar sin errores
4. Probar funcionalidad básica:
   - Arrastrar componente
   - Editar texto (double-click)
   - Resize elemento (arrastrar handle)
   - Cargar plantilla
   - Exportar HTML

---

## 🔄 Actualización

Para actualizar el editor desplegado:

```bash
# 1. Rebuild dist (si es necesario)
cd /home/admin/SAAS-DND
cp -r vanilla-editor/* dist/editor/

# 2. Re-deploy
cd dist/
./deploy.sh /var/www/saasdnd/editor

# 3. Verificar
curl -I http://tudominio.com/editor
```

**Nota:** El script crea backup automático antes de sobrescribir.

---

## 📊 Contenido del Paquete `editor/`

### Características

- ✅ **25 plantillas** profesionales (Landing, Portfolio, Blog, E-commerce, etc.)
- ✅ **34 componentes** drag & drop (Buttons, Forms, Cards, etc.)
- ✅ **Edición inline** de textos (double-click)
- ✅ **Resize visual** con 8 handles direccionales
- ✅ **Panel de propiedades** con lectura de computed styles
- ✅ **Tema oscuro** por defecto
- ✅ **Export** HTML/CSS/JS completo
- ✅ **LocalStorage** persistence
- ✅ **Undo/Redo** (Ctrl+Z/Ctrl+Y)
- ✅ **Keyboard shortcuts** (Ctrl+B, Ctrl+P, F11, etc.)

### Sin Dependencias Externas

✅ No requiere Node.js  
✅ No requiere npm/pnpm  
✅ No requiere build step  
✅ No usa CDN externos  
✅ Todas las rutas son relativas  
✅ Funciona offline (con Service Worker)  

---

## 🔒 Seguridad

### Archivos a Excluir en Deploy

Ya excluidos automáticamente por `deploy.sh`:
- `node_modules/` (si existiera)
- `*.md` (documentación)
- `.DS_Store` (macOS)
- `.gitkeep`

### Headers de Seguridad (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## 📞 Soporte

**Issues:** https://github.com/SebastianVernis/SAAS-DND/issues  
**Docs:** `/docs/editor/`  
**Testing:** Issues #11 y #12 en GitHub

---

## 📝 Changelog

### v1.1.0 (14 Dic 2024)
- ✅ Panel de propiedades fix (getComputedStyle)
- ✅ Documentación completa
- ✅ Paquete dist/ autocontenido
- ✅ Deploy script universal
- ✅ Manifest.json con metadata

### v1.0.0 (13 Dic 2024)
- ✅ Release inicial
- ✅ 25 plantillas
- ✅ 34 componentes

---

**Autor:** Sebastian Vernis  
**Licencia:** PROPRIETARY  
**Proyecto:** SAAS-DND
