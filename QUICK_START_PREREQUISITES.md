# ⚡ Guía Rápida: Prerrequisitos para Despliegue

**Checklist ultra-rápido para desplegar SAAS-DND en Google Cloud Run**

---

## 🎯 Lo Esencial (5 minutos de lectura)

### 1. Cuenta Google Cloud ☁️

```bash
✅ Crear cuenta: https://cloud.google.com
✅ Habilitar facturación ($300 gratis por 90 días)
✅ Crear proyecto: gcloud projects create saas-dnd-prod
```

### 2. Instalar Herramientas 🛠️

```bash
# gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Docker (opcional para testing local)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Node.js 18+
node --version  # Debe ser v18+
```

### 3. Habilitar APIs 🔌

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com
```

### 4. Generar Credenciales 🔐

```bash
# JWT Secret (para autenticación)
openssl rand -base64 32

# Database Password
openssl rand -base64 24

# SMTP: Usar Gmail App Password
# https://myaccount.google.com/apppasswords
```

---

## 📋 Checklist Completo

### ✅ Antes de Empezar

- [ ] Cuenta Google Cloud creada
- [ ] Tarjeta de crédito vinculada (para verificación)
- [ ] Proyecto GCP creado
- [ ] gcloud CLI instalado
- [ ] Autenticado: `gcloud auth login`

### ✅ Información Necesaria

Completa estos valores:

```bash
PROJECT_ID: ___________________________
REGION: us-central1
JWT_SECRET: ___________________________
DB_PASSWORD: ___________________________
SMTP_USER: ___________________________
SMTP_PASS: ___________________________
```

### ✅ Comandos de Verificación

```bash
# Verificar gcloud
gcloud --version

# Verificar proyecto
gcloud config get-value project

# Verificar APIs habilitadas
gcloud services list --enabled

# Verificar permisos
gcloud projects get-iam-policy $(gcloud config get-value project)
```

---

## 🚀 Despliegue en 3 Pasos

Una vez completados los prerrequisitos:

### Paso 1: Setup
```bash
cd scripts/cloud-run
./setup-gcp.sh
```

### Paso 2: Deploy
```bash
./deploy.sh
```

### Paso 3: Migrate
```bash
./migrate-db.sh
```

---

## 💰 Costos Estimados

| Servicio | Costo/Mes |
|----------|-----------|
| Cloud Run (Backend + Frontend) | ~$8 |
| Cloud SQL (PostgreSQL) | ~$10 |
| Storage + Networking | ~$2 |
| **Total** | **~$20/mes** |

**Configurar alerta de presupuesto:**
```bash
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="SAAS-DND Budget" \
    --budget-amount=50USD
```

---

## 🔐 Configuración SMTP (Email)

### Opción 1: Gmail (Desarrollo)

1. Ir a: https://myaccount.google.com/apppasswords
2. Crear "Contraseña de aplicación"
3. Usar valores:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

### Opción 2: SendGrid (Producción)

1. Crear cuenta: https://sendgrid.com
2. Crear API Key
3. Usar valores:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxx
   ```

---

## 🆘 Problemas Comunes

### "gcloud: command not found"
```bash
exec -l $SHELL
# O reinstalar: curl https://sdk.cloud.google.com | bash
```

### "Permission denied"
```bash
chmod +x scripts/cloud-run/*.sh
```

### "API not enabled"
```bash
gcloud services enable SERVICE_NAME.googleapis.com
```

### "Billing not enabled"
```bash
# Ir a: https://console.cloud.google.com/billing
# Vincular cuenta de facturación
```

---

## 📚 Documentación Completa

Para información detallada, ver:

- **PREREQUISITES.md** - Guía completa de prerrequisitos
- **GOOGLE_CLOUD_RUN_DEPLOYMENT.md** - Guía de despliegue completa
- **DEPLOYMENT_CHECKLIST.md** - Checklist paso a paso
- **CLOUD_RUN_SUMMARY.md** - Resumen ejecutivo

---

## ✅ Listo para Desplegar?

**Verifica que tienes:**

- [x] Cuenta GCP con facturación
- [x] gcloud CLI instalado y autenticado
- [x] APIs habilitadas
- [x] Credenciales generadas (JWT, SMTP, DB)
- [x] Código clonado y dependencias instaladas

**Si todo está listo:**
```bash
cd scripts/cloud-run
./setup-gcp.sh
```

---

**Tiempo total estimado**: 30-45 minutos  
**Dificultad**: Intermedia  
**Costo mensual**: ~$20 USD
