# 🛠️ UTILITY SCRIPTS

Scripts de utilidad para desarrollo, testing y mantenimiento.

---

## 📦 Scripts Disponibles

### 1. `install-dependencies.sh`
**Descripción:** Instala todas las dependencias del proyecto  
**Uso:**
```bash
./tools/scripts/install-dependencies.sh
```

**Qué hace:**
- Instala dependencias root (npm/pnpm)
- Instala dependencias backend
- Instala dependencias frontend
- Opcionalmente instala Playwright browsers

---

### 2. `setup-dev.sh`
**Descripción:** Setup completo del entorno de desarrollo  
**Uso:**
```bash
./tools/scripts/setup-dev.sh
```

**Qué hace:**
- Ejecuta `install-dependencies.sh`
- Crea archivos `.env` desde `.env.example`
- Configura base de datos (con confirmación)
- Seed data (opcional)
- Configura Git hooks
- Verifica que todo esté OK

**Tiempo:** ~5-10 minutos

---

### 3. `run-all-tests.sh`
**Descripción:** Ejecuta todos los tests del proyecto  
**Uso:**
```bash
./tools/scripts/run-all-tests.sh
```

**Qué hace:**
- Backend tests (Jest) - 93 tests
- Frontend tests (Vitest) - 7+ tests
- E2E tests (Playwright) - 110 tests

**Total:** 210+ tests

**Tiempo:** ~2-5 minutos (parallel execution)

---

## 🚀 Quick Start Workflows

### First Time Setup
```bash
# 1. Clone repo
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND

# 2. Run dev setup
./tools/scripts/setup-dev.sh

# 3. Edit .env files
nano backend/.env

# 4. Start development
npm run dev
```

---

### Daily Development
```bash
# Pull latest
git pull origin main

# Update dependencies (if needed)
./tools/scripts/install-dependencies.sh

# Start dev
npm run dev
```

---

### Before Committing
```bash
# Run all tests
./tools/scripts/run-all-tests.sh

# If all pass, commit
git add .
git commit -m "feat: your changes"
```

---

## 📝 Crear Nuevos Scripts

### Template

```bash
#!/bin/bash
# 📋 Script Name - SAAS-DND
# Description of what this script does

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Script Name${NC}"
echo "=============="
echo ""

# Your logic here

echo -e "${GREEN}✅ Complete!${NC}"
```

### Best Practices

- ✅ Use `set -e` to exit on error
- ✅ Add color output for better UX
- ✅ Check prerequisites (directory, files, commands)
- ✅ Provide clear feedback
- ✅ Add `chmod +x` to make executable
- ✅ Document in this README

---

## 🔧 Future Scripts (TODO)

- [ ] `build-all.sh` - Build all packages
- [ ] `clean.sh` - Clean build artifacts and node_modules
- [ ] `db-backup.sh` - Backup database
- [ ] `db-restore.sh` - Restore database from backup
- [ ] `lint-all.sh` - Run linters on all code
- [ ] `type-check-all.sh` - TypeScript checking
- [ ] `generate-docs.sh` - Generate docs from code

---

**Última actualización:** 17/12/2024
