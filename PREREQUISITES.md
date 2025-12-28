# 📋 Prerrequisitos para Despliegue en Google Cloud Run

**Guía completa de requisitos antes de desplegar SAAS-DND**

---

## 🎯 Resumen Ejecutivo

Antes de desplegar tu aplicación SAAS-DND en Google Cloud Run, necesitas:

1. **Cuenta de Google Cloud** con facturación habilitada
2. **Herramientas instaladas** (gcloud CLI, Docker, Node.js)
3. **Credenciales configuradas** (SMTP, JWT, Base de datos)
4. **Proyecto GCP configurado** (APIs habilitadas, permisos)

**Tiempo estimado de configuración**: 30-45 minutos

---

## 1️⃣ Cuenta y Proyecto de Google Cloud

### ✅ Requisitos

- [ ] **Cuenta de Google Cloud**
  - Crear cuenta en: https://cloud.google.com
  - Incluye $300 USD de crédito gratuito por 90 días
  - Requiere tarjeta de crédito/débito para verificación

- [ ] **Facturación Habilitada**
  - Ir a: https://console.cloud.google.com/billing
  - Vincular cuenta de facturación al proyecto
  - Configurar alertas de presupuesto (recomendado: $50/mes)

- [ ] **Proyecto GCP Creado**
  ```bash
  # Crear nuevo proyecto
  gcloud projects create saas-dnd-prod --name="SAAS-DND Production"
  
  # O usar proyecto existente
  gcloud config set project YOUR_PROJECT_ID
  ```

### 📝 Información Necesaria

Anota estos valores (los necesitarás después):

```
PROJECT_ID: ___________________________
PROJECT_NUMBER: ________________________
BILLING_ACCOUNT_ID: ____________________
```

Para obtenerlos:
```bash
# Ver PROJECT_ID
gcloud config get-value project

# Ver PROJECT_NUMBER
gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"

# Ver BILLING_ACCOUNT_ID
gcloud billing accounts list
```

---

## 2️⃣ Herramientas Locales

### ✅ Google Cloud SDK (gcloud CLI)

**Instalación:**

**Linux/macOS:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**Windows:**
- Descargar: https://cloud.google.com/sdk/docs/install
- Ejecutar instalador
- Abrir "Google Cloud SDK Shell"

**Verificación:**
```bash
gcloud --version
# Debe mostrar: Google Cloud SDK 400.0.0+
```

**Autenticación:**
```bash
# Login con tu cuenta de Google
gcloud auth login

# Configurar proyecto por defecto
gcloud config set project YOUR_PROJECT_ID

# Configurar región por defecto
gcloud config set run/region us-central1
```

### ✅ Docker

**¿Por qué?** Para construir imágenes de contenedores localmente (opcional pero recomendado para testing)

**Instalación:**

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Logout y login para aplicar cambios
```

**macOS:**
- Descargar Docker Desktop: https://www.docker.com/products/docker-desktop

**Windows:**
- Descargar Docker Desktop: https://www.docker.com/products/docker-desktop

**Verificación:**
```bash
docker --version
# Debe mostrar: Docker version 24.0.0+
```

### ✅ Node.js 18+

**¿Por qué?** Para ejecutar builds locales y testing

**Instalación:**

**Linux/macOS (usando nvm):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Windows:**
- Descargar: https://nodejs.org/en/download/

**Verificación:**
```bash
node --version
# Debe mostrar: v18.x.x o superior

npm --version
# Debe mostrar: 9.x.x o superior
```

### ✅ Git

**Instalación:**
```bash
# Linux (Debian/Ubuntu)
sudo apt-get install git

# macOS
brew install git

# Windows
# Descargar: https://git-scm.com/download/win
```

**Verificación:**
```bash
git --version
```

---

## 3️⃣ Credenciales y Secretos

### ✅ JWT Secret

**¿Qué es?** Clave secreta para firmar tokens de autenticación

**Generar:**
```bash
# Generar string aleatorio seguro (32+ caracteres)
openssl rand -base64 32
```

**Ejemplo de salida:**
```
Kx8vN2mP9qR4sT6uW8yZ0aB1cD3eF5gH7iJ9kL1mN3oP5qR7sT9uW1xY3zA5bC7d
```

**Guardar para después:**
```
JWT_SECRET: ___________________________
```

### ✅ Configuración SMTP (Email)

**¿Para qué?** Enviar emails de verificación, recuperación de contraseña, etc.

**Opción 1: Gmail (Recomendado para desarrollo)**

1. Ir a: https://myaccount.google.com/security
2. Habilitar "Verificación en 2 pasos"
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear "Contraseña de aplicación" para "Correo"
5. Copiar la contraseña generada (16 caracteres)

**Valores necesarios:**
```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: tu-email@gmail.com
SMTP_PASS: xxxx xxxx xxxx xxxx (contraseña de aplicación)
```

**Opción 2: SendGrid (Recomendado para producción)**

1. Crear cuenta: https://sendgrid.com
2. Crear API Key en: Settings > API Keys
3. Verificar dominio (opcional pero recomendado)

**Valores necesarios:**
```
SMTP_HOST: smtp.sendgrid.net
SMTP_PORT: 587
SMTP_USER: apikey
SMTP_PASS: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Opción 3: AWS SES, Mailgun, Postmark**

Consultar documentación del proveedor elegido.

**Guardar para después:**
```
SMTP_HOST: ___________________________
SMTP_PORT: ___________________________
SMTP_USER: ___________________________
SMTP_PASS: ___________________________
```

### ✅ Base de Datos PostgreSQL

**¿Qué necesitas?** Contraseña segura para el usuario de base de datos

**Generar contraseña segura:**
```bash
openssl rand -base64 24
```

**Guardar para después:**
```
DB_PASSWORD: ___________________________
```

**Nota:** La base de datos se creará automáticamente en Cloud SQL durante el setup.

### ✅ OAuth Providers (Opcional)

**¿Para qué?** Login con Google/GitHub (opcional para MVP)

**Google OAuth:**
1. Ir a: https://console.cloud.google.com/apis/credentials
2. Crear "OAuth 2.0 Client ID"
3. Tipo: "Web application"
4. Authorized redirect URIs: `https://YOUR_BACKEND_URL/auth/google/callback`

**GitHub OAuth:**
1. Ir a: https://github.com/settings/developers
2. New OAuth App
3. Authorization callback URL: `https://YOUR_BACKEND_URL/auth/github/callback`

**Guardar para después (si usas OAuth):**
```
GOOGLE_CLIENT_ID: ___________________________
GOOGLE_CLIENT_SECRET: ___________________________
GITHUB_CLIENT_ID: ___________________________
GITHUB_CLIENT_SECRET: ___________________________
```

---

## 4️⃣ Configuración de Google Cloud

### ✅ Habilitar APIs Necesarias

**Ejecutar:**
```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    compute.googleapis.com \
    servicenetworking.googleapis.com
```

**Tiempo estimado:** 2-3 minutos

**Verificar:**
```bash
gcloud services list --enabled
```

### ✅ Configurar Permisos IAM

**Verificar que tu usuario tiene los roles necesarios:**

```bash
# Ver roles actuales
gcloud projects get-iam-policy $(gcloud config get-value project) \
    --flatten="bindings[].members" \
    --filter="bindings.members:user:$(gcloud config get-value account)"
```

**Roles necesarios:**
- `roles/owner` (recomendado para setup inicial)
- O combinación de:
  - `roles/run.admin`
  - `roles/cloudsql.admin`
  - `roles/secretmanager.admin`
  - `roles/iam.serviceAccountAdmin`
  - `roles/cloudbuild.builds.editor`

**Si no tienes permisos suficientes:**
```bash
# Solicitar a administrador del proyecto que ejecute:
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="user:YOUR_EMAIL@gmail.com" \
    --role="roles/owner"
```

### ✅ Configurar Cuotas y Límites

**Verificar cuotas disponibles:**
```bash
gcloud compute project-info describe --project=$(gcloud config get-value project)
```

**Cuotas mínimas necesarias:**
- Cloud Run: 10 servicios
- Cloud SQL: 1 instancia
- Container Registry: 10 GB storage
- Secret Manager: 10 secretos

**Si necesitas aumentar cuotas:**
- Ir a: https://console.cloud.google.com/iam-admin/quotas
- Solicitar aumento de cuota

---

## 5️⃣ Configuración de Facturación

### ✅ Configurar Alertas de Presupuesto

**Crear alerta de presupuesto:**
```bash
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="SAAS-DND Monthly Budget" \
    --budget-amount=50USD \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100
```

**O configurar en consola:**
1. Ir a: https://console.cloud.google.com/billing/budgets
2. Crear presupuesto
3. Configurar alertas al 50%, 90%, 100%

### ✅ Estimar Costos

**Costos mensuales estimados:**

| Servicio | Configuración | Costo Mensual |
|----------|---------------|---------------|
| Cloud Run Backend | 1 vCPU, 512Mi, 100k req | ~$5 |
| Cloud Run Frontend | 1 vCPU, 256Mi, 100k req | ~$3 |
| Cloud SQL | db-f1-micro, 10GB | ~$10 |
| Container Registry | 5GB storage | ~$0.25 |
| Secret Manager | 10 secrets | ~$0.10 |
| Networking | 10GB egress | ~$1 |
| **Total** | | **~$20/mes** |

**Calculadora de costos:**
https://cloud.google.com/products/calculator

---

## 6️⃣ Preparación del Código

### ✅ Clonar Repositorio

```bash
# Clonar proyecto
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND

# Verificar estructura
ls -la
```

### ✅ Instalar Dependencias

```bash
# Instalar dependencias raíz
npm install

# Instalar dependencias backend
cd backend
npm install --legacy-peer-deps
cd ..

# Instalar dependencias frontend
cd apps/web
npm install
cd ../..
```

### ✅ Verificar Builds Locales

```bash
# Verificar build del frontend
cd apps/web
npm run build
cd ../..

# Verificar sintaxis del backend
cd backend
node -c src/server.js
cd ..
```

**Si hay errores:** Revisar y corregir antes de continuar.

---

## 7️⃣ Checklist Final Pre-Despliegue

### ✅ Herramientas Instaladas

- [ ] gcloud CLI instalado y autenticado
- [ ] Docker instalado (opcional)
- [ ] Node.js 18+ instalado
- [ ] Git instalado

### ✅ Google Cloud Configurado

- [ ] Proyecto GCP creado
- [ ] Facturación habilitada
- [ ] APIs habilitadas
- [ ] Permisos IAM configurados
- [ ] Alertas de presupuesto configuradas

### ✅ Credenciales Preparadas

- [ ] JWT_SECRET generado
- [ ] SMTP configurado (host, port, user, pass)
- [ ] DB_PASSWORD generado
- [ ] OAuth configurado (opcional)

### ✅ Código Preparado

- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Frontend compila sin errores
- [ ] Backend valida sin errores

### ✅ Información Recopilada

Completa esta tabla con tus valores:

```
PROJECT_ID: ___________________________
REGION: us-central1 (o tu región preferida)
JWT_SECRET: ___________________________
DB_PASSWORD: ___________________________
SMTP_HOST: ___________________________
SMTP_PORT: ___________________________
SMTP_USER: ___________________________
SMTP_PASS: ___________________________
```

---

## 8️⃣ Próximos Pasos

Una vez completados todos los prerrequisitos:

### 1. Ejecutar Setup Automático

```bash
cd scripts/cloud-run
./setup-gcp.sh
```

Este script:
- Creará service accounts
- Configurará Cloud SQL
- Almacenará secretos en Secret Manager
- Generará archivo `.env.gcp`

### 2. Desplegar Servicios

```bash
./deploy.sh
```

### 3. Migrar Base de Datos

```bash
./migrate-db.sh
```

### 4. Verificar Despliegue

```bash
# Ver servicios desplegados
gcloud run services list

# Probar backend
curl https://YOUR_BACKEND_URL/health

# Probar frontend
curl https://YOUR_FRONTEND_URL/health
```

---

## 🆘 Solución de Problemas Comunes

### Error: "gcloud: command not found"

**Solución:**
```bash
# Reiniciar terminal después de instalar gcloud
exec -l $SHELL

# O agregar al PATH manualmente
export PATH=$PATH:$HOME/google-cloud-sdk/bin
```

### Error: "Permission denied" al ejecutar scripts

**Solución:**
```bash
chmod +x scripts/cloud-run/*.sh
```

### Error: "Billing account not found"

**Solución:**
1. Ir a: https://console.cloud.google.com/billing
2. Vincular cuenta de facturación
3. Verificar: `gcloud billing accounts list`

### Error: "API not enabled"

**Solución:**
```bash
# Habilitar API específica
gcloud services enable SERVICE_NAME.googleapis.com

# Ejemplo:
gcloud services enable run.googleapis.com
```

### Error: "Insufficient permissions"

**Solución:**
```bash
# Verificar roles actuales
gcloud projects get-iam-policy PROJECT_ID

# Solicitar rol de owner al administrador
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **Google Cloud Run**: https://cloud.google.com/run/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs
- **Secret Manager**: https://cloud.google.com/secret-manager/docs
- **gcloud CLI**: https://cloud.google.com/sdk/gcloud/reference

### Tutoriales

- **Cloud Run Quickstart**: https://cloud.google.com/run/docs/quickstarts
- **Cloud SQL Quickstart**: https://cloud.google.com/sql/docs/postgres/quickstart
- **Secret Manager Quickstart**: https://cloud.google.com/secret-manager/docs/quickstart

### Soporte

- **GCP Support**: https://cloud.google.com/support
- **Community**: https://stackoverflow.com/questions/tagged/google-cloud-run
- **GitHub Issues**: https://github.com/SebastianVernis/SAAS-DND/issues

---

## ✅ Confirmación Final

**Antes de proceder al despliegue, confirma:**

- [ ] He completado TODOS los prerrequisitos
- [ ] He recopilado TODAS las credenciales necesarias
- [ ] He verificado que el código compila sin errores
- [ ] He configurado alertas de presupuesto
- [ ] Tengo acceso completo al proyecto GCP
- [ ] He leído la documentación de despliegue

**Si marcaste todas las casillas, estás listo para desplegar! 🚀**

**Siguiente paso:** Ejecutar `./scripts/cloud-run/setup-gcp.sh`

---

**Última actualización**: 28 de Diciembre, 2025  
**Versión**: 1.0.0  
**Tiempo estimado total**: 30-45 minutos
