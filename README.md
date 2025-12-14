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

## 📊 Estado: 100% Completo

**Commits:** 34  
**Tests:** 100 automatizados (93 backend + 7 frontend)  
**Páginas:** 11 completas  
**Plantillas:** 25 profesionales  
**Documentos:** 18 archivos MD  

---

## 🛠️ Stack

**Frontend:** React 19, TypeScript, Vite, TailwindCSS  
**Backend:** Node.js, Express, PostgreSQL, Drizzle ORM  
**Editor:** Vanilla JS (25 templates, 34 components)  
**DevOps:** Turborepo, pnpm, Docker, Nginx, GitHub Actions  

---

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND
pnpm install
cd backend && cp .env.example .env
pnpm db:push
pnpm dev
\`\`\`

Ver [QUICK_START.md](./QUICK_START.md) para guía completa.

---

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Diseño completo
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy
- [PENDING_TASKS.md](./PENDING_TASKS.md) - Roadmap

---

## 📄 Licencia

Propietario © 2024 SAAS-DND

---

**Hecho con 💜 por Sebastian Vernis**
