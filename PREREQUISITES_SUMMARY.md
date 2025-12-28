# 📋 Resumen de Prerrequisitos - SAAS-DND

**Documento de referencia rápida para despliegue en Google Cloud Run**

---

## 🎯 Prerrequisitos en 5 Minutos

### 1. Cuenta y Facturación ☁️

| Requisito | Descripción | Link |
|-----------|-------------|------|
| **Cuenta GCP** | Cuenta de Google Cloud | https://cloud.google.com |
| **Facturación** | Tarjeta vinculada | https://console.cloud.google.com/billing |
| **Créditos** | $300 USD gratis por 90 días | Automático al crear cuenta |
| **Proyecto** | Proyecto GCP creado | `gcloud projects create saas-dnd-prod` |

### 2. Herramientas Locales 🛠️

| Herramienta | Versión Mínima | Instalación | Verificación |
|-------------|----------------|-------------|--------------|
| **gcloud CLI** | Latest | https://cloud.google.com/sdk | `gcloud --version` |
| **Node.js** | v18+ | https://nodejs.org | `node --version` |
| **npm** | v9+ | Incluido con Node.js | `npm --version` |
| **Git** | Latest | https://git-scm.com | `git --version` |
| **Docker** | Latest (opcional) | https://docker.com | `docker --version` |

### 3. Credenciales Necesarias 🔐

| Credencial | Cómo Obtener | Ejemplo |
|------------|--------------|---------|
| **JWT_SECRET** | `openssl rand -base64 32` | `Kx8vN2mP9qR4sT6uW8yZ0aB1cD3eF5gH...` |
| **DB_PASSWORD** | `openssl rand -base64 24` | `7iJ9kL1mN3oP5qR7sT9uW1xY3zA5bC7d` |
| **SMTP_HOST** | Gmail: `smtp.gmail.com` | `smtp.gmail.com` |
| **SMTP_PORT** | Gmail: `587` | `587` |
| **SMTP_USER** | Tu email de Gmail | `tu-email@gmail.com` |
| **SMTP_PASS** | App Password de Gmail | `xxxx xxxx xxxx xxxx` |

**Generar App Password de Gmail:**
1. Ir a: https://myaccount.google.com/apppasswords
2. Crear contraseña para "Correo"
3. Copiar la contraseña de 16 caracteres

### 4. APIs de Google Cloud 🔌

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com
```

---

## ✅ Checklist Rápido

### Antes de Empezar

- [ ] Cuenta Google Cloud creada
- [ ] Facturación habilitada
- [ ] Proyecto GCP creado
- [ ] gcloud CLI instalado
- [ ] Node.js 18+ instalado
- [ ] Git instalado

### Credenciales Preparadas

- [ ] JWT_SECRET generado
- [ ] DB_PASSWORD generado
- [ ] SMTP_HOST configurado
- [ ] SMTP_PORT configurado
- [ ] SMTP_USER configurado
- [ ] SMTP_PASS configurado

### Google Cloud Configurado

- [ ] gcloud autenticado (`gcloud auth login`)
- [ ] Proyecto configurado (`gcloud config set project PROJECT_ID`)
- [ ] APIs habilitadas
- [ ] Permisos verificados

### Código Preparado

- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Frontend compila (`cd apps/web && npm run build`)
- [ ] Backend valida (`cd backend && node -c src/server.js`)

---

## 🚀 Comandos de Verificación

### Verificar Herramientas

```bash
# Verificar gcloud
gcloud --version
gcloud auth list
gcloud config get-value project

# Verificar Node.js
node --version  # Debe ser v18+
npm --version   # Debe ser v9+

# Verificar Git
git --version

# Verificar Docker (opcional)
docker --version
```

### Verificar Google Cloud

```bash
# Verificar proyecto
gcloud config get-value project

# Verificar APIs habilitadas
gcloud services list --enabled

# Verificar permisos
gcloud projects get-iam-policy $(gcloud config get-value project)

# Verificar facturación
gcloud beta billing projects describe $(gcloud config get-value project)
```

### Verificar Código

```bash
# Clonar repositorio
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND

# Instalar dependencias
npm install
cd backend && npm install --legacy-peer-deps && cd ..
cd apps/web && npm install && cd ../..

# Verificar build frontend
cd apps/web && npm run build && cd ../..

# Verificar sintaxis backend
cd backend && node -c src/server.js && cd ..
```

---

## 🔍 Script de Verificación Automática

Ejecuta este script para verificar todos los prerrequisitos:

```bash
cd scripts/cloud-run
./check-prerequisites.sh
```

**Salida esperada:**
```
============================================================================
SAAS-DND Prerequisites Checker
============================================================================

>>> 1. Command Line Tools
✓ Google Cloud SDK is installed: Google Cloud SDK 400.0.0
✓ Docker is installed: Docker version 24.0.0
✓ Git is installed: git version 2.40.0
✓ Node.js version is sufficient: v18.17.0

>>> 2. Google Cloud Authentication
✓ gcloud authenticated as: your-email@gmail.com
✓ GCP project set: saas-dnd-prod

>>> 3. Google Cloud Configuration
✓ Billing is enabled for project

>>> 4. Required Google Cloud APIs
✓ Cloud Build API is enabled
✓ Cloud Run API is enabled
✓ Container Registry API is enabled
✓ Cloud SQL Admin API is enabled
✓ Secret Manager API is enabled

>>> 5. Project Structure
✓ Backend directory exists
✓ Frontend directory exists
✓ Deployment scripts directory exists

>>> 6. Configuration Files
✓ .env.example file exists
✓ Backend Dockerfile exists
✓ Frontend Dockerfile exists
✓ cloudbuild.yaml exists

>>> 7. Project Dependencies
✓ Dependencies are installed

============================================================================
Prerequisites Check Summary
============================================================================
Passed:   25
Warnings: 0
Failed:   0

✓ All critical prerequisites are met!

Next steps:
  1. Prepare your credentials (JWT_SECRET, SMTP, etc.)
  2. Run: cd scripts/cloud-run && ./setup-gcp.sh
  3. Run: ./deploy.sh
  4. Run: ./migrate-db.sh
```

---

## 📝 Plantilla de Credenciales

Copia esta plantilla y completa con tus valores:

```bash
# ============================================================================
# SAAS-DND - Credenciales para Despliegue
# ============================================================================

# Google Cloud
PROJECT_ID=_________________________
REGION=us-central1
BILLING_ACCOUNT_ID=_________________________

# JWT Authentication
JWT_SECRET=_________________________
JWT_EXPIRES_IN=7d

# Database
DB_PASSWORD=_________________________
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@/saasdnd?host=/cloudsql/${PROJECT_ID}:${REGION}:saas-dnd-db

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=_________________________
SMTP_PASS=_________________________
SMTP_FROM="SAAS-DND <noreply@saasdnd.com>"

# OAuth (Opcional)
GOOGLE_CLIENT_ID=_________________________
GOOGLE_CLIENT_SECRET=_________________________
GITHUB_CLIENT_ID=_________________________
GITHUB_CLIENT_SECRET=_________________________

# URLs (Se generan después del despliegue)
BACKEND_URL=_________________________
FRONTEND_URL=_________________________
```

---

## 💰 Costos Estimados

### Configuración Recomendada

| Servicio | Configuración | Costo Mensual |
|----------|---------------|---------------|
| Cloud Run Backend | 1 vCPU, 512Mi, 100k req/mes | ~$5 |
| Cloud Run Frontend | 1 vCPU, 256Mi, 100k req/mes | ~$3 |
| Cloud SQL | db-f1-micro, 10GB SSD | ~$10 |
| Container Registry | 5GB storage | ~$0.25 |
| Secret Manager | 10 secrets, 1k accesos | ~$0.10 |
| Networking | 10GB egress | ~$1 |
| **TOTAL** | | **~$20/mes** |

### Configurar Alerta de Presupuesto

```bash
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="SAAS-DND Monthly Budget" \
    --budget-amount=50USD \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100
```

---

## 🔄 Flujo de Despliegue

```
1. Prerrequisitos (30 min)
   ↓
2. Setup GCP (15 min)
   ./setup-gcp.sh
   ↓
3. Deploy (20 min)
   ./deploy.sh
   ↓
4. Migrate DB (10 min)
   ./migrate-db.sh
   ↓
5. Verificación (5 min)
   ✓ Health checks
   ✓ Logs
   ✓ Testing
```

**Tiempo total estimado:** 1-1.5 horas

---

## 📚 Documentación Completa

| Documento | Descripción | Tamaño |
|-----------|-------------|--------|
| **PREREQUISITES.md** | Guía completa de prerrequisitos | 14 KB |
| **QUICK_START_PREREQUISITES.md** | Guía rápida | 4.2 KB |
| **DEPLOYMENT_FLOW.md** | Diagramas de flujo visual | 26 KB |
| **GOOGLE_CLOUD_RUN_DEPLOYMENT.md** | Guía completa de despliegue | 19 KB |
| **DEPLOYMENT_CHECKLIST.md** | Checklist paso a paso | 5.9 KB |
| **CLOUD_RUN_SUMMARY.md** | Resumen ejecutivo | 8 KB |

---

## 🛠️ Scripts Disponibles

| Script | Descripción | Ubicación |
|--------|-------------|-----------|
| **check-prerequisites.sh** | Verificar prerrequisitos | `scripts/cloud-run/` |
| **setup-gcp.sh** | Configurar Google Cloud | `scripts/cloud-run/` |
| **deploy.sh** | Desplegar servicios | `scripts/cloud-run/` |
| **migrate-db.sh** | Migrar base de datos | `scripts/cloud-run/` |
| **update-env.sh** | Actualizar variables | `scripts/cloud-run/` |

---

## 🆘 Soporte y Recursos

### Documentación Oficial

- **Cloud Run**: https://cloud.google.com/run/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs
- **Secret Manager**: https://cloud.google.com/secret-manager/docs
- **gcloud CLI**: https://cloud.google.com/sdk/gcloud/reference

### Comunidad

- **Stack Overflow**: https://stackoverflow.com/questions/tagged/google-cloud-run
- **GitHub Issues**: https://github.com/SebastianVernis/SAAS-DND/issues
- **GCP Support**: https://cloud.google.com/support

### Tutoriales

- **Cloud Run Quickstart**: https://cloud.google.com/run/docs/quickstarts
- **Cloud SQL Quickstart**: https://cloud.google.com/sql/docs/postgres/quickstart

---

## ✅ Confirmación Final

**Antes de proceder, confirma que tienes:**

- [x] Cuenta Google Cloud con facturación habilitada
- [x] Todas las herramientas instaladas (gcloud, node, git)
- [x] Todas las credenciales generadas (JWT, SMTP, DB)
- [x] APIs de Google Cloud habilitadas
- [x] Código clonado y dependencias instaladas
- [x] Alertas de presupuesto configuradas

**Si todo está listo, ejecuta:**

```bash
# 1. Verificar prerrequisitos
cd scripts/cloud-run
./check-prerequisites.sh

# 2. Si todo pasa, continuar con setup
./setup-gcp.sh
```

---

## 🎯 Próximos Pasos

Una vez completados los prerrequisitos:

1. **Ejecutar verificación:**
   ```bash
   ./scripts/cloud-run/check-prerequisites.sh
   ```

2. **Configurar GCP:**
   ```bash
   ./scripts/cloud-run/setup-gcp.sh
   ```

3. **Desplegar:**
   ```bash
   ./scripts/cloud-run/deploy.sh
   ```

4. **Migrar DB:**
   ```bash
   ./scripts/cloud-run/migrate-db.sh
   ```

5. **Verificar:**
   ```bash
   gcloud run services list
   curl https://BACKEND_URL/health
   ```

---

**Última actualización**: 28 de Diciembre, 2025  
**Versión**: 1.0.0  
**Autor**: Sebastian Vernis  
**Licencia**: MIT
