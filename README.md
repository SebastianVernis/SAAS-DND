# 🎨 SAAS-DND - Sistema Comercial DragNDrop

**Sistema SaaS completo para editor visual HTML con autenticación, gestión de equipos, pagos y colaboración.**

[![Deploy](https://img.shields.io/badge/Deploy-Live-success)](http://18.223.32.141)
[![Tests](https://img.shields.io/badge/Tests-100%20passing-success)](./backend/QA_TEST_REPORT.md)
[![License](https://img.shields.io/badge/License-Proprietary-blue)](./LICENSE)

---

## 🚀 Demo en Vivo

**URL:** http://18.223.32.141

**Características del Sistema:**
- 🎨 Editor visual con 25 plantillas profesionales
- 🔐 Auth completo (Register → OTP → Onboarding → Dashboard)
- 📊 Dashboard con stats en tiempo real
- 📁 Gestión de proyectos (CRUD completo)
- 👥 Team management con invitaciones
- ⏱️ Demo gratuito de 5 minutos

---

## ✨ Características Principales

### Editor Visual Avanzado
- **25 plantillas profesionales** (Landing, Portfolio, E-commerce, Blog, Business)
- **34 componentes drag & drop**
- **Panel de propiedades** funcionando (width, height, colors, styles)
- **Tema oscuro** por defecto, canvas fullscreen
- **Shortcuts:** Ctrl+P (propiedades), Ctrl+B (componentes), F11 (Zen mode)
- **Export** HTML/CSS/JS completo

### Autenticación
- Registro con validación completa
- OTP por email (6 dígitos, 10 min)
- Login JWT
- Session management

### Onboarding (4 Pasos)
1. Tipo cuenta (Personal/Agencia/Empresa)
2. Datos organización
3. Rol usuario
4. Preferencias

### Dashboard
- Sidebar navigation
- Stats cards (proyectos, AI calls, storage, miembros)
- Recent projects
- Quick actions

### Gestión
- **Projects:** Grid/List, Search, Create, Duplicate, Delete
- **Team:** Invite, Roles (Admin/Editor/Viewer), Remove

---

## 📊 Estado: 100% Completo + Suite E2E

**Commits:** 85+  
**Tests:** 203 automatizados (93 backend + 110 E2E)  
**Páginas:** 11 completas  
**Plantillas:** 25 profesionales  
**Documentación:** 33 archivos organizados  
**Código de Tests:** 2,963 líneas TypeScript  

---

## 🛠️ Stack

**Frontend:** React 19, TypeScript, Vite, TailwindCSS  
**Backend:** Node.js, Express, PostgreSQL, Drizzle ORM  
**Editor:** Vanilla JS (25 templates, 34 components)  
**DevOps:** Turborepo, pnpm, Docker, Nginx, GitHub Actions  

---

## 🚀 Quick Start

### Opción 1: Script Automatizado (Recomendado)
```bash
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND
./tools/scripts/setup-dev.sh
npm run dev
```

### Opción 2: Manual
```bash
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND
npm install
cd backend && cp .env.example .env && npm install && npm run db:push && cd ..
cd apps/web && npm install && cd ../..
npm run dev
```

**Ver:** [DEPLOYMENT.md](./DEPLOYMENT.md) para guía completa de deployment

---

## 📚 Documentación

### 🎯 Esenciales
- **[START_HERE.md](./START_HERE.md)** - Contexto rápido ⚡
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment 🚀
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Índice navegable de toda la documentación 📖

### 📖 Por Categoría
- **Desarrollo:** [docs/guides/AGENTS.md](./docs/guides/AGENTS.md) (1,012 líneas)
- **Testing:** [tests/e2e/README.md](./tests/e2e/README.md) (110 tests)
- **Arquitectura:** [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)
- **Estado:** [docs/STATUS_FINAL.md](./docs/STATUS_FINAL.md) (100% completo)
- **Roadmap:** [docs/PENDING_TASKS.md](./docs/PENDING_TASKS.md)

---

## 📄 Licencia

Propietario © 2024 SAAS-DND

---

**Hecho con 💜 por Sebastian Vernis**
