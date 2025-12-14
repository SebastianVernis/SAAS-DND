# Guía de Deployment - SAAS-DND

## 🎯 Estrategia de Deployment con Subdirectorios

Este documento explica cómo desplegar SAAS-DND y todas las versiones demo en **UN SOLO servidor** usando **Nginx reverse proxy** con subdirectorios.

## 🌐 Arquitectura de URLs

### Producción (un solo dominio, múltiples paths)

```
https://saasdnd.com/              → App principal (Next.js)
https://saasdnd.com/api           → API Backend (Express)
https://saasdnd.com/vanilla       → Demo Vanilla (v1)
https://saasdnd.com/landing       → Demo Landing (v2)
https://saasdnd.com/catalog       → Catálogo de versiones
https://saasdnd.com/docs          → Documentación
```

**Ventajas:**
- ✅ Un solo puerto (80/443)
- ✅ Un solo certificado SSL
- ✅ Fácil de gestionar
- ✅ SEO optimizado
- ✅ Costos reducidos

## 🔧 Setup Nginx

### Paso 1: Instalar Nginx

```bash
cd /home/admin/SAAS-DND
sudo ./scripts/deploy/setup-nginx.sh
```

Este script:
1. Instala Nginx si no existe
2. Copia la configuración de subdirectorios
3. Habilita el sitio
4. Reinicia Nginx

### Paso 2: Desplegar Versiones a Subdirectorios

```bash
sudo ./scripts/deploy/deploy-subdirs.sh
```

Este script:
1. Crea estructura `/var/www/saasdnd/versions/`
2. Copia versiones desde DragNDrop original:
   - v1 Vanilla → `/var/www/saasdnd/versions/vanilla`
   - v2 Landing → `/var/www/saasdnd/versions/landing`
   - v9 React (build) → `/var/www/saasdnd/versions/react`
3. Genera página de catálogo
4. Configura permisos
5. Recarga Nginx

## 📂 Estructura en Servidor

```
/var/www/saasdnd/
├── versions/
│   ├── vanilla/
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── style.css
│   │   └── src/
│   ├── landing/
│   │   ├── landing.html
│   │   ├── landing.css
│   │   └── assets/
│   ├── react/
│   │   ├── index.html
│   │   └── assets/
│   └── catalog/
│       └── index.html
└── assets/
    └── shared-assets/
```

## 🚀 Deployment Completo

### Opción A: Deployment Local (Development)

```bash
# 1. Setup base de datos
cd /home/admin/SAAS-DND/apps/api
cp .env.example .env
# Editar .env con DATABASE_URL

# 2. Iniciar con Docker Compose
cd /home/admin/SAAS-DND
docker-compose -f infrastructure/docker-compose.yml up -d

# Servicios iniciados:
# - PostgreSQL:  localhost:5432
# - Redis:       localhost:6379
# - API:         localhost:3001
# - Web:         localhost:5173
# - Nginx:       localhost:80
# - Vanilla:     localhost:8080
# - Landing:     localhost:8081
```

Acceso:
- Main: http://localhost/
- API: http://localhost/api
- Vanilla: http://localhost/vanilla
- Landing: http://localhost/landing
- Catalog: http://localhost/catalog

### Opción B: Deployment en VPS (Producción)

#### 1. Preparar Servidor

```bash
# Conectar a VPS
ssh user@your-server-ip

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres createdb saasdnd
sudo -u postgres createuser saasdnd -P
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE saasdnd TO saasdnd;"
```

#### 2. Clonar Repositorio

```bash
cd /home/admin
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND
```

#### 3. Setup Nginx

```bash
sudo ./scripts/deploy/setup-nginx.sh
```

#### 4. Deploy Versiones

```bash
# Primero clonar el repo original con las versiones
cd /home/admin
git clone https://github.com/SebastianVernis/DragNDrop.git

# Luego deploy a subdirectorios
cd SAAS-DND
sudo ./scripts/deploy/deploy-subdirs.sh
```

#### 5. Configurar Backend

```bash
cd /home/admin/SAAS-DND/apps/api
cp .env.example .env

# Editar .env con credenciales de producción
nano .env
```

Variables críticas:
```env
DATABASE_URL=postgresql://saasdnd:password@localhost:5432/saasdnd
JWT_SECRET=<generar con: openssl rand -base64 32>
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### 6. Iniciar Backend con PM2

```bash
# Instalar PM2
sudo npm install -g pm2

# Instalar dependencias
cd /home/admin/SAAS-DND/apps/api
pnpm install

# Setup database
pnpm db:push

# Iniciar con PM2
pm2 start src/server.js --name saasdnd-api

# Auto-start en boot
pm2 startup
pm2 save
```

#### 7. Build y Deploy Frontend

```bash
cd /home/admin/SAAS-DND/apps/web
pnpm install
pnpm build

# Servir con PM2
pm2 start npm --name saasdnd-web -- start

# O copiar build a Nginx
sudo cp -r .next/standalone/* /var/www/saasdnd/web/
```

#### 8. Verificar Deployment

```bash
# Check servicios
pm2 status
sudo systemctl status nginx

# Check logs
pm2 logs saasdnd-api
pm2 logs saasdnd-web
sudo tail -f /var/log/nginx/saasdnd-access.log

# Health check
curl http://localhost/api/health
```

## 🔒 SSL/HTTPS (Producción)

### Con Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (automático)
sudo certbot --nginx -d saasdnd.com -d www.saasdnd.com

# Renovación automática
sudo systemctl status certbot.timer
```

La configuración de Nginx se actualiza automáticamente para usar HTTPS.

### Verificar SSL

```bash
# Test SSL
curl -I https://saasdnd.com

# Score SSL
# https://www.ssllabs.com/ssltest/
```

## 📊 Monitoreo

### PM2 Monitoring

```bash
# Dashboard
pm2 monit

# Metrics
pm2 show saasdnd-api

# Logs en tiempo real
pm2 logs --lines 100
```

### Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/saasdnd-access.log

# Error log
sudo tail -f /var/log/nginx/saasdnd-error.log

# Filtrar por subdirectorio
sudo grep "/api" /var/log/nginx/saasdnd-access.log
sudo grep "/vanilla" /var/log/nginx/saasdnd-access.log
```

## 🔄 Actualizar Deployment

### Backend Update

```bash
cd /home/admin/SAAS-DND
git pull origin main

cd apps/api
pnpm install

# Migraciones si hay cambios en DB
pnpm db:migrate

# Reiniciar servicio
pm2 restart saasdnd-api
```

### Frontend Update

```bash
cd /home/admin/SAAS-DND/apps/web
git pull origin main
pnpm install
pnpm build

pm2 restart saasdnd-web
```

### Demos Update

```bash
cd /home/admin/DragNDrop
git pull origin main

cd /home/admin/SAAS-DND
sudo ./scripts/deploy/deploy-subdirs.sh
```

## 🐳 Deployment con Docker

### Development

```bash
cd /home/admin/SAAS-DND
docker-compose -f infrastructure/docker-compose.yml up -d

# Ver logs
docker-compose logs -f api
docker-compose logs -f web

# Parar todo
docker-compose down
```

### Production

```bash
# Build production images
docker-compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.prod.yml build

# Start
docker-compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.prod.yml up -d

# Check
docker ps
```

## ☁️ Deployment a Cloud

### Vercel (Frontend)

```bash
cd apps/web

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod

# Environment variables en dashboard de Vercel:
# NEXT_PUBLIC_API_URL=https://api.saasdnd.com
```

### Railway (Backend + PostgreSQL)

```bash
cd apps/api

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up

# Set env vars en dashboard de Railway
```

### Render (Alternativa)

1. Conectar repo de GitHub
2. Crear "Web Service" para backend
3. Crear "Static Site" para frontend
4. Crear "PostgreSQL" database
5. Configurar variables de entorno

## 🎯 Configuración por Entorno

### Development

```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/saasdnd_dev
FRONTEND_URL=http://localhost:5173
```

### Staging

```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-url
FRONTEND_URL=https://staging.saasdnd.com
```

### Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url
FRONTEND_URL=https://saasdnd.com
SMTP_HOST=smtp.sendgrid.net  # Production SMTP
STRIPE_MOCKUP_MODE=false      # Real payments
```

## 📈 Performance Optimization

### Nginx Caching

```nginx
# Cache para assets estáticos
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache para API (si aplica)
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;
```

### CDN (CloudFlare)

1. Apuntar DNS a CloudFlare
2. Activar proxy
3. Configurar cache rules
4. Activar minify (JS, CSS, HTML)

## 🛠️ Troubleshooting

### Nginx no inicia

```bash
# Verificar configuración
sudo nginx -t

# Ver errores
sudo journalctl -u nginx -n 50

# Verificar puertos
sudo netstat -tlnp | grep nginx
```

### Subdirectorios no funcionan

```bash
# Verificar que archivos existen
ls -la /var/www/saasdnd/versions/vanilla/

# Verificar permisos
sudo chown -R www-data:www-data /var/www/saasdnd

# Ver logs de acceso
sudo tail -f /var/log/nginx/saasdnd-access.log
```

### API no responde

```bash
# Verificar que está corriendo
pm2 status

# Ver logs
pm2 logs saasdnd-api

# Reiniciar
pm2 restart saasdnd-api
```

## 📝 Checklist de Deployment

### Pre-deployment
- [ ] Todos los tests pasando
- [ ] Variables de entorno configuradas
- [ ] Database migrations ejecutadas
- [ ] SSL certificates listos
- [ ] Backups configurados
- [ ] Monitoring configurado

### Deployment
- [ ] Nginx instalado y configurado
- [ ] Versiones copiadas a `/var/www/saasdnd`
- [ ] Backend corriendo (PM2)
- [ ] Frontend corriendo
- [ ] Health checks respondiendo
- [ ] Logs monitoreándose

### Post-deployment
- [ ] Verificar todas las URLs
- [ ] Test de funcionalidades críticas
- [ ] Verificar emails se envían
- [ ] Monitorear métricas 24h
- [ ] Notificar stakeholders

## 🔗 URLs de Verificación

```bash
# Health check
curl http://your-ip/api/health

# Vanilla demo
curl -I http://your-ip/vanilla

# Landing demo
curl -I http://your-ip/landing

# Catalog
curl -I http://your-ip/catalog
```

---

**Para más información, ver:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura completa
- [QUICK_START.md](./QUICK_START.md) - Setup local
- [ORGANIZATIONAL_STRUCTURE.md](./ORGANIZATIONAL_STRUCTURE.md) - Estructura del proyecto
