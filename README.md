# DragNDrop - Sistema Comercial Completo

## 🎯 Descripción

Sistema SaaS profesional que transforma DragNDrop en una plataforma comercial completa con:

- ✅ Landing page con pricing
- ✅ Registro con verificación OTP vía SMTP
- ✅ Checkout con pagos (mockup → Stripe)
- ✅ Onboarding guiado
- ✅ Dashboard para gestión
- ✅ Team management con invitaciones
- ✅ Editor integrado completo

## 📁 Estructura del Proyecto

```
commercial-system/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + PostgreSQL
├── shared/            # Tipos y constantes compartidos
├── docs/              # Documentación
├── scripts/           # Scripts de utilidad
└── README.md
```

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm/pnpm

### Instalación

```bash
# Clonar el repo
cd /home/admin/DragNDrop/commercial-system

# Instalar dependencias del backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales

# Configurar base de datos
npm run db:push

# Iniciar backend
npm run dev

# En otra terminal, iniciar frontend
cd ../frontend
npm install
npm run dev
```

### Acceso

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Documentación: http://localhost:3001/docs

## 📚 Documentación

- [Arquitectura Completa](./ARCHITECTURE.md) - Diseño detallado del sistema
- [API Reference](./docs/API.md) - Documentación de endpoints
- [User Flows](./docs/USER_FLOWS.md) - Flujos de usuario
- [Deployment](./docs/DEPLOYMENT.md) - Guía de deploy

## 🔑 Flujo Principal

```
Landing → Register → OTP Verification → Checkout → Onboarding → Dashboard → Editor
```

## 📦 Tecnologías

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand
- React Router

### Backend
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Better Auth
- Socket.io (colaboración)
- Nodemailer (emails)
- Stripe (pagos)

## 🎨 Características Principales

### Landing Page
- Hero section con CTAs
- Features showcase
- Pricing con 4 planes (Free, Pro, Teams, Enterprise)
- Comparación de features
- FAQ y testimonials

### Autenticación
- Registro con email/password
- OAuth con Google y GitHub
- Verificación OTP de 6 dígitos
- Expiración a 10 minutos
- Rate limiting

### Checkout
- Selección de plan
- Mockup de pagos (fase 1)
- Integración real con Stripe (fase 2)
- Invoices automáticos

### Onboarding
- Wizard de 4 pasos
- Setup de organización
- Configuración de preferencias
- Proyecto inicial de bienvenida

### Dashboard
- Stats de uso y límites
- Proyectos recientes
- Team activity
- Quick actions

### Team Management
- Invitaciones vía email
- Roles: Admin, Editor, Viewer
- Permisos granulares
- Límites según plan

### Editor
- Drag & Drop visual
- Componentes reutilizables
- AI integration
- Colaboración en tiempo real
- Export/Deploy

## 🔐 Seguridad

- JWT tokens con expiración
- Rate limiting en todos los endpoints
- Validación con Zod
- Helmet headers
- CORS configurado
- Bcrypt para passwords
- OTP con expiración

## 📊 Planes y Pricing

| Feature | Free | Pro ($9/mes) | Teams ($29/mes) | Enterprise |
|---------|------|--------------|-----------------|------------|
| Proyectos | 5 | Ilimitados | Ilimitados | Ilimitados |
| AI Calls | 10/día | Ilimitados | Ilimitados | Ilimitados |
| Storage | 100MB | 10GB | 100GB | Ilimitado |
| Miembros | 1 | 1 | 10 | Ilimitados |
| Colaboración | ❌ | ❌ | ✅ | ✅ |
| Deploy automático | ❌ | ✅ | ✅ | ✅ |
| SSO | ❌ | ❌ | ✅ | ✅ |
| White-label | ❌ | ❌ | ❌ | ✅ |

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (Railway)
```bash
cd backend
railway up
```

Ver [DEPLOYMENT.md](./docs/DEPLOYMENT.md) para más detalles.

## 📈 Roadmap

### Fase 1: MVP (30 días) ✅ Actual
- Landing + Pricing
- Auth + OTP
- Checkout mockup
- Onboarding
- Dashboard básico
- Team management
- Editor integrado

### Fase 2: Mejoras (2 meses)
- Pagos reales con Stripe
- Colaboración en tiempo real
- Templates premium
- Mobile app
- API pública
- Webhooks

### Fase 3: Enterprise (3+ meses)
- Self-hosted option
- White-label
- Advanced analytics
- Custom integrations
- SLA guarantees
- Dedicated support

## 🤝 Contribuir

```bash
# Fork y clone
git clone https://github.com/tu-usuario/DragNDrop.git
cd DragNDrop/commercial-system

# Crear branch
git checkout -b feature/nueva-feature

# Desarrollar y commit
git commit -m "feat: nueva feature"

# Push y crear PR
git push origin feature/nueva-feature
```

## 📄 Licencia

Código propietario. Ver LICENSE para más información.

## 📞 Soporte

- Email: support@dragndrop.com
- Docs: https://docs.dragndrop.com
- Discord: https://discord.gg/dragndrop

## 🙏 Agradecimientos

- Comunidad de React
- Better Auth team
- Drizzle ORM
- Vercel & Railway

---

**Última actualización:** 2024-01-20
**Versión:** 1.0.0
**Estado:** 🚧 En desarrollo activo
