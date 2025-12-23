# ✅ Checklist de Tareas Pendientes - SAAS-DND

**Fecha:** 2024-01-20 20:15  
**Progreso General:** 80%  
**Commits:** 12

---

## 🎯 Pendientes Críticos (Para MVP Funcional)

### 1. Frontend - Páginas Core (Issue #3, #4)

#### 🚀 Onboarding Wizard (Issue #3) - ALTA PRIORIDAD
- [ ] Crear layout del wizard con progress bar (1/4, 2/4, 3/4, 4/4)
- [ ] **Step 1:** Tipo de cuenta (Personal/Agencia/Empresa)
  - [ ] Radio buttons con descripciones
  - [ ] Validación requerida
  - [ ] Botón "Siguiente"
- [ ] **Step 2:** Datos de organización (si Agencia/Empresa)
  - [ ] Input nombre organización
  - [ ] Dropdown industria
  - [ ] Dropdown tamaño equipo
  - [ ] Botones "Anterior" y "Siguiente"
- [ ] **Step 3:** Rol del usuario
  - [ ] Radio buttons (Designer/Developer/PM/Marketing/Otro)
  - [ ] Input text si "Otro"
  - [ ] Navegación anterior/siguiente
- [ ] **Step 4:** Preferencias
  - [ ] Toggle tema (Claro/Oscuro/Auto)
  - [ ] Dropdown idioma (ES/EN)
  - [ ] Toggle notificaciones email
  - [ ] Botón "Completar Setup"
- [ ] Integración POST /api/onboarding/complete
- [ ] Redirección a /dashboard
- [ ] Skip option (guardar progreso)
- [ ] Responsive design
- [ ] Loading states

**Estimación:** 4-6 horas

---

#### 📊 Dashboard Principal (Issue #4) - ALTA PRIORIDAD
- [ ] Crear DashboardLayout con Sidebar
- [ ] **Sidebar Navigation:**
  - [ ] Dashboard (home)
  - [ ] Projects
  - [ ] Team (solo Teams/Enterprise)
  - [ ] Settings
  - [ ] Billing
  - [ ] User menu (avatar, nombre, logout)
  - [ ] Collapse/expand en mobile
- [ ] **Dashboard Home:**
  - [ ] Stats Cards:
    - [ ] Proyectos (X/Y según plan)
    - [ ] AI Calls (X/Y por día)
    - [ ] Storage (X GB / Y GB)
    - [ ] Miembros (X/Y según plan)
  - [ ] Recent Projects Grid (últimos 6)
  - [ ] Botón "Nuevo Proyecto"
  - [ ] Team Activity Feed (si Teams plan)
  - [ ] Quick Actions section
- [ ] Integración GET /api/projects
- [ ] Integración GET /api/team/members
- [ ] Integración GET /api/usage/current (pendiente en backend)
- [ ] Loading states
- [ ] Empty states (sin proyectos)
- [ ] Responsive design

**Estimación:** 6-8 horas

---

#### 👥 Team Management Page - MEDIA PRIORIDAD
- [ ] Crear página /dashboard/team
- [ ] Lista de miembros con tabla/cards:
  - [ ] Avatar, nombre, email
  - [ ] Rol (badge)
  - [ ] Estado (active/pending)
  - [ ] Fecha de ingreso
  - [ ] Acciones (editar rol, eliminar)
- [ ] Botón "Invite Member"
- [ ] Modal de invitación:
  - [ ] Input email
  - [ ] Dropdown rol
  - [ ] Textarea mensaje opcional
  - [ ] Botón "Send Invitation"
- [ ] Lista de invitaciones pendientes
- [ ] Acción "Revoke" en invitaciones
- [ ] Integración GET /api/team/members
- [ ] Integración POST /api/team/invite
- [ ] Integración PATCH /api/team/members/:id
- [ ] Integración DELETE /api/team/members/:id
- [ ] Permisos: solo admins ven botones de acción
- [ ] Validación límite de miembros por plan
- [ ] Loading y error states

**Estimación:** 4-5 horas

---

#### 📁 Projects Page - MEDIA PRIORIDAD
- [ ] Crear página /dashboard/projects
- [ ] Vista Grid/List toggle
- [ ] Cards de proyecto con:
  - [ ] Thumbnail (screenshot o placeholder)
  - [ ] Nombre del proyecto
  - [ ] Última modificación
  - [ ] Acciones (Editar, Duplicar, Eliminar)
- [ ] Botón "New Project"
- [ ] Modal crear proyecto:
  - [ ] Input nombre
  - [ ] Textarea descripción
  - [ ] Dropdown template (blank, landing, dashboard)
  - [ ] Botón "Create"
- [ ] Search bar (buscar por nombre)
- [ ] Filtros (Fecha, Template)
- [ ] Paginación
- [ ] Integración GET /api/projects
- [ ] Integración POST /api/projects
- [ ] Integración DELETE /api/projects/:id
- [ ] Integración POST /api/projects/:id/duplicate
- [ ] Validación límite proyectos por plan
- [ ] Confirmación antes de eliminar
- [ ] Loading skeleton
- [ ] Empty state (sin proyectos)

**Estimación:** 5-6 horas

---

#### ⚙️ Settings Pages - BAJA PRIORIDAD
- [ ] Crear layout /dashboard/settings con tabs
- [ ] **Tab Profile:**
  - [ ] Input nombre
  - [ ] Input email (read-only)
  - [ ] Upload avatar
  - [ ] Botón "Save Changes"
- [ ] **Tab Security:**
  - [ ] Cambiar contraseña
  - [ ] 2FA (futuro)
  - [ ] Sessions activas
- [ ] **Tab Preferences:**
  - [ ] Toggle tema
  - [ ] Dropdown idioma
  - [ ] Toggle notificaciones
  - [ ] Botón "Save"
- [ ] **Tab Integrations:**
  - [ ] GitHub connect
  - [ ] Vercel connect
  - [ ] API keys (futuro)
- [ ] Integración PATCH /api/users/:id (pendiente en backend)
- [ ] Integración GET /api/integrations (pendiente)

**Estimación:** 3-4 horas

---

#### 💳 Billing Page - BAJA PRIORIDAD
- [ ] Crear página /dashboard/billing
- [ ] **Current Plan Section:**
  - [ ] Card con plan actual
  - [ ] Features incluidas
  - [ ] Botón "Upgrade" o "Manage Plan"
- [ ] **Usage Stats:**
  - [ ] Progress bars de uso (proyectos, AI calls, storage)
  - [ ] Porcentaje usado
  - [ ] Límites del plan
- [ ] **Payment Methods:**
  - [ ] Lista de tarjetas guardadas
  - [ ] Botón "Add Payment Method"
  - [ ] Default payment method
- [ ] **Invoices History:**
  - [ ] Tabla con facturas
  - [ ] Botón "Download PDF"
  - [ ] Filtros por fecha
- [ ] Modal "Upgrade Plan" con pricing
- [ ] Integración GET /api/payments/subscription (pendiente)
- [ ] Integración POST /api/payments/update-subscription (pendiente)
- [ ] Integración GET /api/payments/invoices (pendiente)

**Estimación:** 4-5 horas

---

#### 💰 Checkout Page - MEDIA PRIORIDAD
- [ ] Crear página /checkout?plan=pro
- [ ] **Plan Summary:**
  - [ ] Plan seleccionado
  - [ ] Precio (monthly/yearly toggle)
  - [ ] Features incluidas
- [ ] **Payment Form (Mockup):**
  - [ ] Input card number
  - [ ] Input expiry date
  - [ ] Input CVV
  - [ ] Input billing address
  - [ ] Checkbox "Save card"
- [ ] **Order Summary:**
  - [ ] Subtotal
  - [ ] Tax (si aplica)
  - [ ] Total
  - [ ] Próxima fecha de cobro
- [ ] Coupon code input
- [ ] Botón "Complete Purchase"
- [ ] Loading durante procesamiento (2s mockup)
- [ ] Success page
- [ ] Integración POST /api/payments/create-subscription
- [ ] Stripe Elements (fase 2)

**Estimación:** 3-4 horas

---

#### 🎨 Editor Page - ALTA PRIORIDAD
- [ ] Crear página /editor/:projectId
- [ ] Integrar editor Vanilla completo (no iframe)
- [ ] O crear versión React del editor
- [ ] Botones: Save, Export, Deploy
- [ ] Auto-save cada 30 segundos
- [ ] Integración GET /api/projects/:id
- [ ] Integración PUT /api/projects/:id
- [ ] Collaboration cursors (si Teams plan)
- [ ] Indicador de guardado

**Estimación:** 8-10 horas (complejo)

---

### 2. Backend - Features Adicionales

#### 📊 Usage Tracking API - MEDIA PRIORIDAD
- [ ] Endpoint GET /api/usage/current
- [ ] Endpoint POST /api/usage/track
- [ ] Tracking automático de AI calls
- [ ] Tracking de storage usado
- [ ] Cálculo de porcentajes vs límites
- [ ] Reset mensual automático

**Estimación:** 2-3 horas

---

#### 💳 Payments API - BAJA PRIORIDAD (Mockup primero)
- [ ] Endpoint POST /api/payments/create-subscription
- [ ] Endpoint GET /api/payments/subscription
- [ ] Endpoint POST /api/payments/update-subscription
- [ ] Endpoint POST /api/payments/cancel-subscription
- [ ] Endpoint GET /api/payments/invoices
- [ ] Modo mockup (simula procesamiento)
- [ ] Integración real con Stripe (fase 2)
- [ ] Webhooks de Stripe
- [ ] Generación de invoices PDF

**Estimación:** 6-8 horas (mockup), 12-15 horas (Stripe real)

---

#### 🔌 Collaboration (Socket.io + Yjs) - BAJA PRIORIDAD
- [ ] Migrar de v8: socketServer.js
- [ ] Migrar de v8: yjs-handler.js
- [ ] Adaptar auth middleware
- [ ] Endpoint WebSocket /socket.io
- [ ] Events: join-room, leave-room, sync-update
- [ ] Cursors en tiempo real
- [ ] User presence
- [ ] Solo para planes Teams y Enterprise

**Estimación:** 8-10 horas

---

### 3. Testing

#### Frontend Tests Adicionales - MEDIA PRIORIDAD
- [ ] Tests para Onboarding wizard
- [ ] Tests para Dashboard
- [ ] Tests para Team Management
- [ ] Tests para Projects page
- [ ] Tests de integración con API real
- [ ] Lighthouse CI en GitHub Actions
- [ ] Coverage >80%

**Estimación:** 4-6 horas

---

#### E2E Tests Completos - BAJA PRIORIDAD
- [ ] Flujo completo: Register → OTP → Onboarding → Dashboard
- [ ] Flujo: Login → Dashboard → Create Project
- [ ] Flujo: Invite Member → Accept → Collaborate
- [ ] Flujo: Upgrade Plan → Checkout → Success
- [ ] Tests con múltiples roles (admin/editor/viewer)
- [ ] Tests de límites por plan

**Estimación:** 6-8 horas

---

### 4. Deployment

#### Staging Environment - ALTA PRIORIDAD
- [ ] Deploy frontend a Vercel (staging)
- [ ] Deploy backend a Railway (staging)
- [ ] PostgreSQL en Supabase (staging)
- [ ] SMTP con SendGrid (staging)
- [ ] Variables de entorno staging
- [ ] DNS staging (staging.saasdnd.com)
- [ ] Smoke tests en staging

**Estimación:** 3-4 horas

---

#### Production Environment - MEDIA PRIORIDAD
- [ ] Deploy frontend a Vercel (production)
- [ ] Deploy backend a Railway (production)
- [ ] PostgreSQL en Supabase (production)
- [ ] SMTP con SendGrid (production)
- [ ] Stripe en modo producción
- [ ] SSL/HTTPS (Let's Encrypt)
- [ ] CDN (CloudFlare)
- [ ] Monitoring (Sentry)
- [ ] Analytics (Posthog)
- [ ] DNS production (saasdnd.com)

**Estimación:** 4-6 horas

---

### 5. Documentación

#### Docs Site (Opcional) - BAJA PRIORIDAD
- [ ] Crear apps/docs con Docusaurus
- [ ] API Reference (OpenAPI)
- [ ] User Guides
- [ ] Developer Docs
- [ ] Deployment Guides

**Estimación:** 8-10 horas

---

#### Videos y Marketing - BAJA PRIORIDAD
- [ ] Video demo del producto (2-3 min)
- [ ] Screenshots de alta calidad
- [ ] GIFs de features
- [ ] Tutorial en video
- [ ] Social media posts

**Estimación:** 4-6 horas

---

## 📊 Resumen por Prioridad

### 🔴 ALTA PRIORIDAD (MVP Blocker)
```
1. Onboarding Wizard          ████████░░░░░░░░░░░░  4-6h
2. Dashboard Principal         ████████████░░░░░░░░  6-8h
3. Editor Page                 ████████████████░░░░  8-10h
4. Staging Deployment          ██████░░░░░░░░░░░░░░  3-4h
                               ─────────────────────
                               Total: 21-28 horas
```

### 🟡 MEDIA PRIORIDAD
```
1. Team Management Page        ████████░░░░░░░░░░░░  4-5h
2. Projects Page               ██████████░░░░░░░░░░  5-6h
3. Checkout Page               ██████░░░░░░░░░░░░░░  3-4h
4. Usage Tracking API          ████░░░░░░░░░░░░░░░░  2-3h
5. Frontend Tests              ████████░░░░░░░░░░░░  4-6h
6. Production Deployment       ████████░░░░░░░░░░░░  4-6h
                               ─────────────────────
                               Total: 22-30 horas
```

### 🟢 BAJA PRIORIDAD (Post-MVP)
```
1. Settings Pages              ██████░░░░░░░░░░░░░░  3-4h
2. Billing Page                ████████░░░░░░░░░░░░  4-5h
3. Payments API (real)         ████████████████████  12-15h
4. Collaboration (Socket.io)   ████████████████░░░░  8-10h
5. E2E Tests Completos         ████████████░░░░░░░░  6-8h
6. Docs Site                   ████████████████░░░░  8-10h
7. Videos/Marketing            ████████░░░░░░░░░░░░  4-6h
                               ─────────────────────
                               Total: 45-58 horas
```

---

## 🎯 Roadmap Sugerido

### Semana 1: MVP Core (21-28h)
**Objetivo:** Sistema funcional end-to-end

**Día 1-2:**
- ✅ Onboarding Wizard (4-6h)
- ✅ Dashboard base (6-8h)

**Día 3:**
- ✅ Editor Page básico (8-10h)

**Día 4:**
- ✅ Staging deployment (3-4h)
- ✅ Testing manual completo (2h)

**Entregable:** MVP funcional en staging

---

### Semana 2: Features Secundarios (22-30h)
**Objetivo:** Completar features de gestión

**Día 1:**
- Team Management page (4-5h)
- Projects page (5-6h)

**Día 2:**
- Checkout page (3-4h)
- Usage Tracking API (2-3h)

**Día 3:**
- Frontend tests adicionales (4-6h)

**Día 4:**
- Production deployment (4-6h)
- Smoke testing (2h)

**Entregable:** Sistema completo en producción

---

### Semana 3-4: Pulido y Extras (45-58h)
**Objetivo:** Features premium y optimización

- Settings pages completas
- Billing page completa
- Payments real con Stripe
- Collaboration en tiempo real
- E2E tests exhaustivos
- Docs site
- Marketing materials

**Entregable:** Producto listo para lanzamiento

---

## 📋 Checklist MVP Mínimo

Para considerar el MVP completo necesitamos:

### Must Have ✅
- [x] Backend API funcionando
- [x] Auth completa (Register, Login, OTP)
- [x] Landing page
- [ ] Onboarding wizard
- [ ] Dashboard básico
- [ ] Projects CRUD (UI)
- [ ] Deploy en staging

### Should Have ⏳
- [ ] Team management
- [ ] Checkout (mockup)
- [ ] Settings básico
- [ ] Tests E2E

### Nice to Have 📋
- [ ] Billing completo
- [ ] Payments real (Stripe)
- [ ] Collaboration
- [ ] Docs site
- [ ] Marketing

---

## 🚀 Próximos Pasos Inmediatos

### Opción A: Desarrollo Manual
1. Implementar Onboarding Wizard
2. Implementar Dashboard
3. Testing manual
4. Deploy a staging

### Opción B: Asignar a Agente Remoto
1. Crear task para Onboarding (Issue #3)
2. Crear task para Dashboard (Issue #4)
3. Review y merge PRs
4. Iterar

### Opción C: Híbrido
1. Desarrollar Onboarding manualmente (4-6h)
2. Asignar Dashboard a agente
3. Desarrollar Editor page manualmente
4. Asignar features secundarios a agentes

---

## 📊 Estado Actual vs Objetivo

### Ahora (80%)
```
Backend:           ████████████████████ 100%
Frontend Auth:     ████████████████████ 100%
Frontend Core:     ░░░░░░░░░░░░░░░░░░░░   0%
Testing:           ████████████████████ 100%
Deployment:        ░░░░░░░░░░░░░░░░░░░░   0%
```

### MVP Target (100%)
```
Backend:           ████████████████████ 100%
Frontend Auth:     ████████████████████ 100%
Frontend Core:     ████████████████████ 100%  ← Necesario
Testing:           ████████████████████ 100%
Deployment:        ████████████████████ 100%  ← Necesario
```

**Gap:** Frontend Core (Onboarding + Dashboard + Editor) + Deployment

---

## 💡 Recomendación

**Para MVP Funcional (1-2 semanas):**

1. ⚡ **Onboarding Wizard** (Issue #3) - 1 día
2. ⚡ **Dashboard** (Issue #4) - 1-2 días
3. ⚡ **Projects Page** - 1 día
4. ⚡ **Editor Page básico** - 1-2 días
5. ⚡ **Staging Deploy** - 0.5 día
6. ⚡ **Testing** - 0.5 día

**Total:** 5-7 días de desarrollo → **MVP funcional**

Luego agregar features premium (Team, Billing, Payments) en siguientes iteraciones.

---

**¿Continuar con Onboarding Wizard (Issue #3)?**
