# DragNDrop - Sistema Comercial Completo
## Arquitectura Integrada y Plan de Implementación

## 📋 Resumen Ejecutivo

Sistema comercial completo que transforma DragNDrop de herramienta gratuita a plataforma SaaS profesional con:
- Landing page con pricing y planes
- Sistema de registro y autenticación con OTP
- Checkout con pagos (mockup inicial, producción después)
- Onboarding guiado para nuevos usuarios
- Dashboard para gestión de usuarios y equipos
- Invitaciones vía SMTP
- Editor integrado con todas las funcionalidades existentes

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  Landing/Pricing → Register → OTP → Checkout → Onboarding  │
│                          ↓                                   │
│           Dashboard → Editor → Collaboration                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js + Express)                │
├─────────────────────────────────────────────────────────────┤
│  • Better Auth (OAuth + Email)                              │
│  • OTP Generation & Validation                              │
│  • Payment Processing (Stripe/mockup)                       │
│  • User Management                                           │
│  • Email Service (SMTP - Nodemailer)                        │
│  • Collaboration (Socket.io + Yjs)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  Users, Organizations, Subscriptions, Projects, Teams       │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Flujo de Usuario Completo

### 1. Landing Page
**Ruta:** `/`
**Componentes:**
- Hero con CTA principal
- Features showcase
- Pricing con 4 planes (Free, Pro, Teams, Enterprise)
- Testimonials
- FAQ
- Footer con links legales

**Objetivos:**
- Conversión a registro
- Comparación de planes
- Trust building

### 2. Página de Pricing
**Ruta:** `/pricing`
**Componentes:**
- Toggle Monthly/Yearly (20% descuento anual)
- Cards de planes con features detalladas
- Comparación lado a lado
- CTAs por plan

**Planes:**
```javascript
{
  free: {
    price: 0,
    features: ['5 proyectos', 'Componentes básicos', 'Export HTML/CSS', 'AI limitado 10/día'],
    limits: { projects: 5, aiCalls: 10, storage: '100MB' }
  },
  pro: {
    price: { monthly: 9, yearly: 86.4 },
    features: ['Proyectos ilimitados', 'AI ilimitado', 'Templates premium', 'Deploy automático', 'Sin marca de agua'],
    limits: { projects: -1, aiCalls: -1, storage: '10GB' }
  },
  teams: {
    price: { monthly: 29, yearly: 278.4 },
    features: ['Todo Pro +', '10 miembros', 'Colaboración tiempo real', 'SSO', 'Roles y permisos'],
    limits: { projects: -1, aiCalls: -1, storage: '100GB', members: 10 }
  },
  enterprise: {
    price: 'custom',
    features: ['Todo Teams +', 'Usuarios ilimitados', 'Self-hosted', 'White-label', 'SLA', 'Soporte dedicado'],
    limits: { projects: -1, aiCalls: -1, storage: 'unlimited', members: -1 }
  }
}
```

### 3. Registro
**Ruta:** `/register`
**Componentes:**
- Formulario de registro (email, password, name)
- OAuth buttons (Google, GitHub)
- Términos y condiciones checkbox
- Link a login si ya tiene cuenta

**Validaciones:**
- Email válido y único
- Password mínimo 8 caracteres, 1 mayúscula, 1 número
- Nombre requerido

**Flujo:**
```
Usuario completa formulario
  ↓
POST /api/auth/register
  ↓
Se genera OTP de 6 dígitos
  ↓
Se envía email con OTP (válido 10 minutos)
  ↓
Usuario es redirigido a /verify-otp
```

### 4. Verificación OTP
**Ruta:** `/verify-otp`
**Componentes:**
- Input de 6 dígitos separados
- Timer de expiración (10:00)
- Botón "Reenviar código"
- Auto-submit al completar 6 dígitos

**Flujo:**
```
Usuario ingresa OTP de email
  ↓
POST /api/auth/verify-otp { email, otp }
  ↓
Si válido: genera session token
  ↓
Redirige a /checkout?plan=selected
```

### 5. Checkout
**Ruta:** `/checkout?plan=free|pro|teams`
**Componentes:**
- Resumen del plan seleccionado
- Formulario de pago (mockup inicialmente)
- Información de facturación
- Cupones/descuentos
- Total y botón de confirmación

**Mockup Payment:**
```javascript
// Fase 1: Simulación de pago
const mockPayment = {
  cardNumber: '4242 4242 4242 4242', // Cualquier número acepta
  simulate: true,
  delay: 2000 // 2 segundos de "procesamiento"
}

// Fase 2: Integración real con Stripe
const stripePayment = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhooks: '/api/webhooks/stripe'
}
```

**Flujo:**
```
Usuario selecciona plan
  ↓
Si Free: skip payment, redirige a /onboarding
  ↓
Si Pro/Teams: muestra formulario de pago
  ↓
POST /api/payments/create-subscription
  ↓
(Mockup) Simula procesamiento 2 segundos
  ↓
(Producción) Stripe procesa pago real
  ↓
Actualiza subscription en DB
  ↓
Redirige a /onboarding
```

### 6. Onboarding (Primer Login)
**Ruta:** `/onboarding`
**Componentes:**
- Wizard multi-step (3-4 pasos)
- Progress indicator
- Skip option (guarda progreso)

**Steps:**

**Step 1: Tipo de Cuenta**
```
¿Qué tipo de cuenta necesitas?
[ ] Personal (solo yo)
[ ] Agencia (equipo de diseño/desarrollo)
[ ] Empresa (departamento interno)
```

**Step 2: Datos de Organización** (si eligió Agencia/Empresa)
```
Nombre de la organización: [__________]
Industria: [dropdown]
Tamaño del equipo: [ 1-5 / 6-20 / 21-50 / 51+ ]
```

**Step 3: Rol del Usuario**
```
¿Cuál es tu rol?
[ ] Designer
[ ] Developer
[ ] Product Manager
[ ] Marketing
[ ] Otro: [_______]
```

**Step 4: Setup Inicial**
```
Preferencias:
- Tema: [ Claro / Oscuro / Auto ]
- Idioma: [ Español / English ]
- Notificaciones email: [ Sí / No ]

[Botón: Completar Setup]
```

**Flujo Backend:**
```javascript
POST /api/onboarding/complete
{
  accountType: 'agency',
  organization: {
    name: 'Mi Agencia',
    industry: 'design',
    teamSize: '6-20'
  },
  userRole: 'designer',
  preferences: {
    theme: 'dark',
    language: 'es',
    emailNotifications: true
  }
}

// Backend crea:
- Organization record (si aplica)
- User profile completo
- Default settings
- First project (template)
- Marca onboarding como completado

// Redirige a /dashboard
```

### 7. Dashboard Principal
**Ruta:** `/dashboard`
**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Sidebar     │  Main Content                        │
│              │                                       │
│  Dashboard   │  [Stats Cards]                       │
│  Projects    │  Projects: 3/5  AI Calls: 7/10       │
│  Team        │  Storage: 45MB/100MB                  │
│  Settings    │                                       │
│  Billing     │  [Recent Projects Grid]              │
│              │  ┌─────┐ ┌─────┐ ┌─────┐             │
│              │  │ Proj│ │ Proj│ │ New │             │
│              │  │  1  │ │  2  │ │  +  │             │
│              │  └─────┘ └─────┘ └─────┘             │
│              │                                       │
│              │  [Team Activity] (si Teams plan)     │
│              │  • María editó "Landing Page"        │
│              │  • Juan creó "Dashboard"              │
└─────────────────────────────────────────────────────┘
```

**Secciones:**

**7.1 Dashboard Home**
- Stats cards (proyectos, uso AI, storage)
- Proyectos recientes (grid con previews)
- Actividad del equipo (si aplica)
- Quick actions (Nuevo proyecto, Templates)

**7.2 Projects**
- Lista/Grid de todos los proyectos
- Filtros (Fecha, Nombre, Colaboradores)
- Search
- Acciones: Editar, Duplicar, Eliminar, Compartir

**7.3 Team Management** (Solo Teams/Enterprise)
- Lista de miembros del equipo
- Botón "Invite Member"
- Roles: Admin, Editor, Viewer
- Estado: Active, Pending invitation
- Acciones: Edit role, Remove

**7.4 Settings**
- Profile (nombre, email, avatar)
- Security (cambiar password, 2FA)
- Preferences (tema, idioma, notificaciones)
- Integrations (GitHub, Vercel, Figma)

**7.5 Billing**
- Plan actual y features
- Uso del mes actual
- Métodos de pago
- Historial de facturas
- Upgrade/Downgrade plan

### 8. Gestión de Usuarios (Team Management)
**Ruta:** `/dashboard/team`

**Componentes:**

**Lista de Miembros:**
```javascript
[
  {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'admin', // admin, editor, viewer
    status: 'active', // active, pending, suspended
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20 14:30'
  }
]
```

**Invitar Miembro:**
```
Modal "Invite Team Member"

Email: [_______________]
Role: [Dropdown: Admin/Editor/Viewer]
Message (optional): [Textarea]

[Send Invitation]
```

**Flujo de Invitación:**
```
Admin click "Invite Member"
  ↓
POST /api/team/invite
{
  email: 'nuevo@example.com',
  role: 'editor',
  message: 'Te invito a unirte al equipo'
}
  ↓
Backend:
- Verifica límite de miembros según plan
- Crea invitation record
- Genera invitation token (válido 7 días)
- Envía email SMTP
  ↓
Email contiene:
- Nombre del invitador
- Nombre de la organización
- Link: https://app.dragndrop.com/accept-invite?token=xyz
- Botón CTA "Accept Invitation"
  ↓
Usuario nuevo/existente click link
  ↓
Si no tiene cuenta: register + verify OTP + accept
Si tiene cuenta: login + accept
  ↓
POST /api/team/accept-invite { token }
  ↓
Usuario se une al team
Redirige a /dashboard
```

**Permisos por Rol:**
```javascript
const permissions = {
  admin: {
    projects: ['create', 'read', 'update', 'delete'],
    team: ['invite', 'remove', 'changeRole'],
    billing: ['read', 'update'],
    settings: ['read', 'update']
  },
  editor: {
    projects: ['create', 'read', 'update', 'delete'],
    team: ['read'],
    billing: ['read'],
    settings: ['read']
  },
  viewer: {
    projects: ['read'],
    team: ['read'],
    billing: [],
    settings: ['read']
  }
}
```

### 9. Editor Integrado
**Ruta:** `/editor/:projectId`
**Componente:** Editor completo de v1 + mejoras de v9

- Drag & Drop visual
- Panel de componentes
- Panel de propiedades
- Canvas responsive
- Code view (HTML/CSS/JS)
- AI assistant
- Collaboration cursors (si Teams plan)
- Export/Deploy

## 🗄️ Estructura de Base de Datos

```sql
-- Users (Better Auth compatible)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name VARCHAR(255),
  image VARCHAR(500),
  password_hash VARCHAR(255), -- bcrypt
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP Codes
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50), -- personal, agency, enterprise
  industry VARCHAR(100),
  team_size VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL, -- free, pro, teams, enterprise
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- admin, editor, viewer
  status VARCHAR(50) DEFAULT 'active', -- active, pending, suspended
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired, revoked
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (de v8)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  html TEXT,
  css TEXT,
  js TEXT,
  thumbnail VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Components (de v8)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  html TEXT NOT NULL,
  css TEXT,
  props JSONB,
  position JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'es',
  email_notifications BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage Tracking (para límites de plan)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- '2024-01'
  ai_calls INTEGER DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  UNIQUE(organization_id, month)
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_otp_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_components_project ON components(project_id);
CREATE INDEX idx_usage_org_month ON usage_tracking(organization_id, month);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
```

## 🔌 APIs del Backend

### Autenticación

```javascript
// POST /api/auth/register
{
  email: 'user@example.com',
  password: 'SecurePass123',
  name: 'Juan Pérez'
}
// Response: { message: 'OTP sent to email' }

// POST /api/auth/verify-otp
{
  email: 'user@example.com',
  code: '123456'
}
// Response: { token: 'jwt-token', user: {...} }

// POST /api/auth/resend-otp
{
  email: 'user@example.com'
}
// Response: { message: 'OTP resent' }

// POST /api/auth/login
{
  email: 'user@example.com',
  password: 'SecurePass123'
}
// Response: { token: 'jwt-token', user: {...} }

// GET /api/auth/session
// Headers: Authorization: Bearer {token}
// Response: { user: {...}, organization: {...}, subscription: {...} }

// POST /api/auth/logout
// Headers: Authorization: Bearer {token}
// Response: { message: 'Logged out' }
```

### Onboarding

```javascript
// POST /api/onboarding/complete
// Headers: Authorization: Bearer {token}
{
  accountType: 'agency',
  organization: {
    name: 'Mi Agencia',
    industry: 'design',
    teamSize: '6-20'
  },
  userRole: 'designer',
  preferences: {
    theme: 'dark',
    language: 'es',
    emailNotifications: true
  }
}
// Response: { organization: {...}, user: {...} }

// GET /api/onboarding/status
// Headers: Authorization: Bearer {token}
// Response: { completed: true, step: 4 }
```

### Pagos

```javascript
// POST /api/payments/create-subscription
// Headers: Authorization: Bearer {token}
{
  plan: 'pro',
  billingCycle: 'monthly', // monthly, yearly
  paymentMethod: 'pm_1234567890', // Stripe payment method
  // Mockup mode:
  mockup: true,
  mockupCard: '4242424242424242'
}
// Response: { subscription: {...}, status: 'active' }

// GET /api/payments/subscription
// Headers: Authorization: Bearer {token}
// Response: { subscription: {...}, plan: {...}, nextBilling: '2024-02-15' }

// POST /api/payments/update-subscription
// Headers: Authorization: Bearer {token}
{
  plan: 'teams'
}
// Response: { subscription: {...}, prorationDate: '...' }

// POST /api/payments/cancel-subscription
// Headers: Authorization: Bearer {token}
{
  cancelAtPeriodEnd: true
}
// Response: { subscription: {...}, endsAt: '2024-02-28' }

// GET /api/payments/invoices
// Headers: Authorization: Bearer {token}
// Response: { invoices: [{id, amount, date, status, pdf}] }
```

### Team Management

```javascript
// GET /api/team/members
// Headers: Authorization: Bearer {token}
// Response: { members: [{id, name, email, role, status, joinedAt}] }

// POST /api/team/invite
// Headers: Authorization: Bearer {token}
{
  email: 'nuevo@example.com',
  role: 'editor',
  message: 'Te invito al equipo'
}
// Response: { invitation: {...}, emailSent: true }

// POST /api/team/accept-invite
{
  token: 'invite-token-xyz'
}
// Response: { organization: {...}, member: {...} }

// PATCH /api/team/members/:memberId
// Headers: Authorization: Bearer {token}
{
  role: 'admin'
}
// Response: { member: {...} }

// DELETE /api/team/members/:memberId
// Headers: Authorization: Bearer {token}
// Response: { message: 'Member removed' }

// DELETE /api/team/invitations/:invitationId
// Headers: Authorization: Bearer {token}
// Response: { message: 'Invitation revoked' }
```

### Projects (extendido de v8)

```javascript
// GET /api/projects
// Headers: Authorization: Bearer {token}
// Query: ?page=1&limit=20&search=landing
// Response: { projects: [...], total, page, pages }

// POST /api/projects
// Headers: Authorization: Bearer {token}
{
  name: 'Mi Landing Page',
  description: 'Landing para producto',
  template: 'blank' // blank, landing, dashboard, portfolio
}
// Response: { project: {...} }

// GET /api/projects/:projectId
// Headers: Authorization: Bearer {token}
// Response: { project: {...}, components: [...], collaborators: [...] }

// PUT /api/projects/:projectId
// Headers: Authorization: Bearer {token}
{
  name: 'Nuevo nombre',
  html: '<html>...</html>',
  css: 'body {...}',
  js: 'console.log(...)'
}
// Response: { project: {...} }

// DELETE /api/projects/:projectId
// Headers: Authorization: Bearer {token}
// Response: { message: 'Project deleted' }

// POST /api/projects/:projectId/duplicate
// Headers: Authorization: Bearer {token}
// Response: { project: {...} }
```

### Usage & Limits

```javascript
// GET /api/usage/current
// Headers: Authorization: Bearer {token}
// Response: {
//   plan: 'pro',
//   limits: { projects: -1, aiCalls: -1, storage: 10GB },
//   usage: { projects: 8, aiCalls: 245, storage: '1.2GB' },
//   percentage: { projects: 0, aiCalls: 0, storage: 12 }
// }

// POST /api/usage/track
// Headers: Authorization: Bearer {token}
{
  type: 'ai_call', // ai_call, storage, project
  amount: 1
}
// Response: { updated: true, remaining: 999 }
```

## 📧 Sistema de Emails (SMTP)

### Configuración

```javascript
// utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com, smtp.sendgrid.net
  port: process.env.SMTP_PORT, // 587
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"DragNDrop" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html
  });
};
```

### Templates de Email

**1. OTP Verification**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 DragNDrop</h1>
      <p>Verify your email</p>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Thanks for signing up! Use this code to verify your email:</p>
      <div class="otp-code">{{otpCode}}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2024 DragNDrop. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

**2. Team Invitation**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Same styles as above */
    .btn { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 DragNDrop</h1>
      <p>Team Invitation</p>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p><strong>{{inviterName}}</strong> has invited you to join <strong>{{organizationName}}</strong> on DragNDrop.</p>
      
      {{#if message}}
      <blockquote style="border-left: 4px solid #667eea; padding-left: 15px; color: #666;">
        "{{message}}"
      </blockquote>
      {{/if}}
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{inviteLink}}" class="btn">Accept Invitation</a>
      </p>
      
      <p style="font-size: 12px; color: #666;">
        This invitation expires in 7 days. If you don't want to join, you can ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 DragNDrop. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

**3. Welcome Email**
```html
<!-- Similar structure -->
<div class="content">
  <p>Hi {{name}},</p>
  <h2>Welcome to DragNDrop! 🎉</h2>
  <p>You're now part of a community of creators building amazing web experiences.</p>
  
  <h3>Get Started:</h3>
  <ul>
    <li>✅ Create your first project</li>
    <li>🎨 Explore our template library</li>
    <li>🤖 Try AI-powered components</li>
    <li>📚 Check our documentation</li>
  </ul>
  
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{dashboardLink}}" class="btn">Go to Dashboard</a>
  </p>
</div>
```

**4. Subscription Confirmation**
```html
<!-- Receipt style -->
<div class="content">
  <h2>Subscription Confirmed ✅</h2>
  <p>Thanks for upgrading to <strong>{{planName}}</strong>!</p>
  
  <table style="width: 100%; margin: 20px 0;">
    <tr><td>Plan:</td><td><strong>{{planName}}</strong></td></tr>
    <tr><td>Billing Cycle:</td><td>{{billingCycle}}</td></tr>
    <tr><td>Amount:</td><td><strong>${{amount}}</strong></td></tr>
    <tr><td>Next Billing:</td><td>{{nextBillingDate}}</td></tr>
  </table>
  
  <p><a href="{{invoiceLink}}">Download Invoice</a></p>
</div>
```

## 🔐 Seguridad y Validaciones

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

// General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: 'Too many requests from this IP'
});

// Auth endpoints (más estricto)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos
  message: 'Too many login attempts, please try again later'
});

// OTP verification (muy estricto)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 3, // 3 intentos
  message: 'Too many verification attempts'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
```

### Validación de Inputs

```javascript
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(2, 'Name too short')
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
  message: z.string().max(500).optional()
});

// Middleware
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ errors: error.errors });
  }
};
```

### Permisos y Middleware

```javascript
// middleware/auth.js
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await getUserById(decoded.userId);
    req.organization = await getOrganizationByUserId(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// middleware/permissions.js
export const requireRole = (...roles) => (req, res, next) => {
  const member = req.organization.members.find(m => m.userId === req.user.id);
  if (!member || !roles.includes(member.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// middleware/planLimits.js
export const checkPlanLimit = (limitType) => async (req, res, next) => {
  const usage = await getUsage(req.organization.id);
  const limits = PLAN_LIMITS[req.organization.subscription.plan];
  
  if (limits[limitType] !== -1 && usage[limitType] >= limits[limitType]) {
    return res.status(403).json({ 
      error: `${limitType} limit reached`,
      limit: limits[limitType],
      current: usage[limitType],
      upgrade: true
    });
  }
  next();
};

// Uso:
app.post('/api/projects', 
  requireAuth, 
  checkPlanLimit('projects'),
  createProject
);

app.post('/api/team/invite',
  requireAuth,
  requireRole('admin'),
  checkPlanLimit('members'),
  inviteMember
);
```

## 📦 Estructura de Archivos del Proyecto

```
commercial-system/
├── frontend/                    # React + TypeScript
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── logo.svg
│   │       └── screenshots/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routes.tsx
│   │   ├── components/
│   │   │   ├── Landing/
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   ├── Pricing.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── OTPVerification.tsx
│   │   │   │   └── ResetPassword.tsx
│   │   │   ├── Checkout/
│   │   │   │   ├── PlanSelection.tsx
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   └── OrderSummary.tsx
│   │   │   ├── Onboarding/
│   │   │   │   ├── Wizard.tsx
│   │   │   │   ├── AccountType.tsx
│   │   │   │   ├── OrganizationInfo.tsx
│   │   │   │   └── Preferences.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Projects.tsx
│   │   │   │   ├── Team/
│   │   │   │   │   ├── MembersList.tsx
│   │   │   │   │   ├── InviteModal.tsx
│   │   │   │   │   └── RoleSelector.tsx
│   │   │   │   ├── Settings/
│   │   │   │   │   ├── Profile.tsx
│   │   │   │   │   ├── Security.tsx
│   │   │   │   │   └── Preferences.tsx
│   │   │   │   └── Billing/
│   │   │   │       ├── CurrentPlan.tsx
│   │   │   │       ├── Usage.tsx
│   │   │   │       └── Invoices.tsx
│   │   │   ├── Editor/
│   │   │   │   ├── EditorLayout.tsx
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── ComponentPanel.tsx
│   │   │   │   ├── PropertiesPanel.tsx
│   │   │   │   └── Toolbar.tsx
│   │   │   └── UI/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Card.tsx
│   │   │       └── Loader.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSubscription.ts
│   │   │   ├── useTeam.ts
│   │   │   └── useProjects.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── organizationStore.ts
│   │   │   ├── editorStore.ts
│   │   │   └── uiStore.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── payments.ts
│   │   │   ├── team.ts
│   │   │   └── projects.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── organization.ts
│   │   │   ├── subscription.ts
│   │   │   └── project.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       └── themes.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── auth.js
│   │   │   ├── smtp.js
│   │   │   └── stripe.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── onboarding.js
│   │   │   ├── payments.js
│   │   │   ├── team.js
│   │   │   ├── projects.js
│   │   │   └── usage.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── onboardingController.js
│   │   │   ├── paymentsController.js
│   │   │   ├── teamController.js
│   │   │   └── projectsController.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── otpService.js
│   │   │   ├── stripeService.js
│   │   │   └── collaborationService.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Organization.js
│   │   │   ├── Subscription.js
│   │   │   ├── Project.js
│   │   │   └── Invitation.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── permissions.js
│   │   │   ├── planLimits.js
│   │   │   ├── validation.js
│   │   │   └── rateLimit.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── bcrypt.js
│   │   │   ├── validators.js
│   │   │   └── logger.js
│   │   ├── db/
│   │   │   ├── schema.js         # Drizzle ORM schema
│   │   │   ├── client.js
│   │   │   └── migrations/
│   │   ├── templates/
│   │   │   ├── emails/
│   │   │   │   ├── otp.html
│   │   │   │   ├── invitation.html
│   │   │   │   ├── welcome.html
│   │   │   │   └── subscription.html
│   │   │   └── invoices/
│   │   │       └── invoice.html
│   │   └── tests/
│   │       ├── auth.test.js
│   │       ├── payments.test.js
│   │       ├── team.test.js
│   │       └── projects.test.js
│   ├── package.json
│   ├── .env.example
│   └── drizzle.config.js
│
├── shared/                      # Código compartido
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── plans.ts
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md (este archivo)
│   ├── DEPLOYMENT.md
│   └── USER_FLOWS.md
│
├── scripts/
│   ├── setup-db.sh
│   ├── seed-data.js
│   └── migrate.sh
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Plan de Implementación

### Fase 1: Setup Base (Días 1-2)
- [x] Crear estructura de carpetas
- [ ] Configurar monorepo (Turborepo o pnpm workspaces)
- [ ] Setup frontend (Vite + React + TypeScript)
- [ ] Setup backend (Express + TypeScript)
- [ ] Configurar PostgreSQL local/Supabase
- [ ] Configurar variables de entorno
- [ ] Docker compose para desarrollo

### Fase 2: Autenticación y OTP (Días 3-5)
- [ ] Implementar registro con validaciones
- [ ] Sistema de generación OTP
- [ ] Servicio de email con Nodemailer
- [ ] Templates de email OTP
- [ ] Verificación OTP con expiración
- [ ] Login y JWT tokens
- [ ] Middleware de autenticación
- [ ] Frontend: páginas de registro, OTP, login

### Fase 3: Landing y Pricing (Días 6-7)
- [ ] Diseño responsive de landing
- [ ] Sección Hero con animaciones
- [ ] Grid de features
- [ ] Pricing cards con comparación
- [ ] Toggle monthly/yearly
- [ ] Footer con links
- [ ] Optimización SEO básica

### Fase 4: Checkout y Pagos (Días 8-10)
- [ ] Página de checkout
- [ ] Formulario de pago mockup
- [ ] Simulación de procesamiento
- [ ] Integración Stripe (modo test)
- [ ] Webhooks de Stripe
- [ ] Manejo de subscripciones
- [ ] Generación de invoices
- [ ] Emails de confirmación

### Fase 5: Onboarding (Días 11-12)
- [ ] Wizard multi-step
- [ ] Step 1: Tipo de cuenta
- [ ] Step 2: Datos organización
- [ ] Step 3: Rol usuario
- [ ] Step 4: Preferencias
- [ ] API de onboarding
- [ ] Creación de organización
- [ ] Proyecto inicial de bienvenida

### Fase 6: Dashboard Base (Días 13-15)
- [ ] Layout con sidebar
- [ ] Dashboard home con stats
- [ ] Lista de proyectos
- [ ] Modal nuevo proyecto
- [ ] Settings básico (profile)
- [ ] Integración con API
- [ ] Carga y estados

### Fase 7: Team Management (Días 16-18)
- [ ] Página de team members
- [ ] Modal de invitación
- [ ] Generación de tokens
- [ ] Email de invitación
- [ ] Página accept invitation
- [ ] Gestión de roles
- [ ] Eliminación de miembros
- [ ] Permisos por rol

### Fase 8: Billing y Usage (Días 19-20)
- [ ] Página de billing
- [ ] Mostrar plan actual
- [ ] Tracking de usage
- [ ] Progress bars de límites
- [ ] Upgrade/downgrade plan
- [ ] Historial de facturas
- [ ] Métodos de pago

### Fase 9: Integración Editor (Días 21-23)
- [ ] Migrar editor de v1
- [ ] Adaptar a React (v9)
- [ ] Conectar con API de proyectos
- [ ] Guardar automático
- [ ] Export/Deploy
- [ ] Verificar límites de plan

### Fase 10: Testing y QA (Días 24-26)
- [ ] Tests unitarios backend
- [ ] Tests de integración
- [ ] Tests E2E con Playwright
- [ ] Testing manual de flujos
- [ ] Validación de emails
- [ ] Testing de límites
- [ ] Security audit básico

### Fase 11: Deploy y Producción (Días 27-28)
- [ ] Configurar Vercel/Railway
- [ ] Database en producción
- [ ] Variables de entorno prod
- [ ] SMTP production (SendGrid)
- [ ] Stripe production mode
- [ ] SSL/HTTPS
- [ ] Monitoring (Sentry)
- [ ] Analytics (Posthog)

### Fase 12: Pulido y Lanzamiento (Días 29-30)
- [ ] Optimización de performance
- [ ] Lighthouse scores > 90
- [ ] Accesibilidad (WCAG)
- [ ] Documentación de API
- [ ] Guías de usuario
- [ ] Preparar marketing
- [ ] Soft launch beta

## 🔧 Variables de Entorno

```bash
# Backend .env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dragndrop

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Better Auth
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=http://localhost:3001

# OAuth (opcional para MVP)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@dragndrop.com

# Stripe (mockup para MVP)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MOCKUP_MODE=true

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Redis (opcional para cache)
REDIS_URL=redis://localhost:6379

# Sentry (opcional para errores)
SENTRY_DSN=https://...

# Logs
LOG_LEVEL=debug
```

```bash
# Frontend .env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_NAME=DragNDrop
VITE_APP_URL=http://localhost:5173
```

## 📊 Métricas y KPIs

### Negocio
- Conversión Landing → Register: > 10%
- Conversión Register → Paid: > 5%
- Churn mensual: < 5%
- NPS: > 50

### Técnico
- API response time: < 200ms p95
- Frontend bundle size: < 500KB
- Lighthouse score: > 90
- Error rate: < 1%
- Uptime: > 99.5%

### Engagement
- DAU/MAU ratio: > 40%
- Proyectos por usuario: > 3
- Invitaciones enviadas: > 30% de teams
- Tiempo en editor: > 20min promedio

## 🎨 Stack Tecnológico Final

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- React Router (routing)
- React Hook Form (forms)
- Zod (validation)
- Axios (HTTP client)
- Socket.io-client (realtime)

### Backend
- Node.js 18+
- Express.js
- Better Auth (autenticación)
- Drizzle ORM (database)
- PostgreSQL (database)
- Socket.io (websockets)
- Yjs (CRDT collaboration)
- Nodemailer (emails)
- Stripe (pagos)
- Zod (validation)

### DevOps
- Vercel (frontend hosting)
- Railway/Render (backend hosting)
- Supabase (PostgreSQL managed)
- SendGrid/Resend (SMTP)
- Sentry (error tracking)
- Posthog (analytics)
- GitHub Actions (CI/CD)

### Testing
- Vitest (unit tests)
- Jest (backend tests)
- Playwright (E2E tests)
- Supertest (API tests)

## ✅ Checklist de Lanzamiento

### Pre-lanzamiento
- [ ] Todos los tests pasando
- [ ] Security audit completado
- [ ] Performance optimization
- [ ] Database backups configurados
- [ ] Monitoring activo
- [ ] Error tracking configurado
- [ ] Analytics configurado
- [ ] Emails funcionando
- [ ] Pagos en modo test verificados
- [ ] Documentación completa

### Lanzamiento
- [ ] Deploy a producción
- [ ] DNS configurado
- [ ] SSL activo
- [ ] Stripe en modo producción
- [ ] Smoke tests en prod
- [ ] Anuncio en redes
- [ ] Email a beta testers
- [ ] Monitor métricas 24h

### Post-lanzamiento
- [ ] Recopilar feedback
- [ ] Priorizar bugs
- [ ] Planear siguiente iteración
- [ ] Crear roadmap público

---

## 📞 Soporte

Para preguntas sobre esta arquitectura:
- Email: dev@dragndrop.com
- Slack: #dragndrop-dev
- Docs: https://docs.dragndrop.com

---

**Última actualización:** 2024-01-20
**Versión:** 1.0.0
**Autor:** Sebastian Vernis
