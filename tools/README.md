# 🛠️ TOOLS & SCRIPTS

Herramientas, scripts y archivos legacy del proyecto.

---

## 📂 Estructura

```
tools/
├── scripts/             # Utility Scripts ✨ NEW
│   ├── install-dependencies.sh
│   ├── setup-dev.sh
│   ├── run-all-tests.sh
│   └── README.md
│
├── deployment/          # Deployment Scripts
│   ├── deploy-nginx.sh
│   ├── deploy-vanilla.sh
│   ├── download-fonts.sh
│   └── update-nginx-vanilla.sh
│
└── legacy-dist/         # Legacy Distribution Files
    └── editor/          # Old editor build (archived)
```

---

## 🔧 Utility Scripts

**Ubicación:** `scripts/`  
**Documentación:** [scripts/README.md](./scripts/README.md)

### Quick Reference

| Script | Descripción | Tiempo |
|--------|-------------|--------|
| **`setup-dev.sh`** | Setup completo del entorno de desarrollo | ~5-10 min |
| **`install-dependencies.sh`** | Instala todas las dependencias | ~3-5 min |
| **`run-all-tests.sh`** | Ejecuta todos los tests (210+) | ~2-5 min |

### Ejemplo: First Time Setup
```bash
cd SAAS-DND
./tools/scripts/setup-dev.sh
# Sigue las instrucciones en pantalla
```

---

## 🚀 Deployment Scripts

**Ubicación:** `deployment/`

| Script | Descripción | Uso |
|--------|-------------|-----|
| `deploy-nginx.sh` | Deploy Nginx configuration | `./tools/deployment/deploy-nginx.sh` |
| `deploy-vanilla.sh` | Deploy vanilla editor to /var/www | `./tools/deployment/deploy-vanilla.sh` |
| `download-fonts.sh` | Download Google Fonts for editor | `./tools/deployment/download-fonts.sh` |
| `update-nginx-vanilla.sh` | Update Nginx config for vanilla | `./tools/deployment/update-nginx-vanilla.sh` |

**Ver:** [../../DEPLOYMENT.md](../../DEPLOYMENT.md) para guía completa

---

## 📦 Legacy Distribution

**Ubicación:** `legacy-dist/`

Archivos de distribución antiguos del editor (build standalone con features avanzadas).

**Contenido:**
- Editor completo con AI features
- Service worker
- Monaco editor integration
- Deployment tools
- Vercel deployer

**Nota:** Estos archivos son para referencia histórica. El editor actual está en `vanilla-editor/`.

**Tamaño:** ~1.8 MB (116 archivos)

---

## 🔨 Añadir Nuevos Scripts

### Ubicación por Tipo

- **Development utilities** → `scripts/`
- **Deployment automation** → `deployment/`
- **Database management** → `../scripts/db/`
- **Build automation** → `../scripts/build/`

### Template

```bash
#!/bin/bash
# 📋 Script Description - SAAS-DND

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Script Name${NC}"

# Logic here

echo -e "${GREEN}✅ Done!${NC}"
```

### Checklist

- [ ] Add shebang (`#!/bin/bash`)
- [ ] Use `set -e` for safety
- [ ] Add color output
- [ ] Make executable (`chmod +x`)
- [ ] Document in README
- [ ] Test script works

---

**Última actualización:** 17/12/2024  
**Scripts disponibles:** 7 (3 new + 4 deployment)

