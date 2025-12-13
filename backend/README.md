# DragNDrop Commercial Backend

Backend API para el sistema comercial de DragNDrop con autenticación, gestión de equipos, proyectos y más.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Setup base de datos
npm run db:push

# Iniciar servidor
npm run dev
```

El servidor estará corriendo en http://localhost:3001

## 📚 API Endpoints

### Autenticación

```bash
# Registrar usuario
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "User Name"
}

# Verificar OTP
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "code": "123456"
}

# Reenviar OTP
POST /api/auth/resend-otp
{
  "email": "user@example.com"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

# Obtener sesión actual
GET /api/auth/session
Headers: Authorization: Bearer {token}

# Logout
POST /api/auth/logout
Headers: Authorization: Bearer {token}
```

### Onboarding

```bash
# Completar onboarding
POST /api/onboarding/complete
Headers: Authorization: Bearer {token}
{
  "accountType": "agency",
  "organization": {
    "name": "Mi Agencia",
    "industry": "design",
    "teamSize": "6-20"
  },
  "userRole": "designer",
  "preferences": {
    "theme": "dark",
    "language": "es",
    "emailNotifications": true
  }
}

# Ver estado del onboarding
GET /api/onboarding/status
Headers: Authorization: Bearer {token}
```

### Team Management

```bash
# Obtener miembros del equipo
GET /api/team/members
Headers: Authorization: Bearer {token}

# Invitar miembro (solo admins)
POST /api/team/invite
Headers: Authorization: Bearer {token}
{
  "email": "nuevo@example.com",
  "role": "editor",
  "message": "Te invito al equipo"
}

# Aceptar invitación
POST /api/team/accept-invite
Headers: Authorization: Bearer {token}
{
  "token": "invitation-token"
}

# Actualizar rol de miembro (solo admins)
PATCH /api/team/members/:memberId
Headers: Authorization: Bearer {token}
{
  "role": "admin"
}

# Eliminar miembro (solo admins)
DELETE /api/team/members/:memberId
Headers: Authorization: Bearer {token}

# Ver invitaciones pendientes
GET /api/team/invitations
Headers: Authorization: Bearer {token}

# Revocar invitación (solo admins)
DELETE /api/team/invitations/:invitationId
Headers: Authorization: Bearer {token}
```

### Projects

```bash
# Listar proyectos
GET /api/projects?page=1&limit=20&search=landing
Headers: Authorization: Bearer {token}

# Crear proyecto
POST /api/projects
Headers: Authorization: Bearer {token}
{
  "name": "Mi Landing Page",
  "description": "Descripción opcional",
  "template": "blank"
}

# Obtener proyecto
GET /api/projects/:projectId
Headers: Authorization: Bearer {token}

# Actualizar proyecto
PUT /api/projects/:projectId
Headers: Authorization: Bearer {token}
{
  "name": "Nuevo nombre",
  "html": "<html>...</html>",
  "css": "body { ... }",
  "js": "console.log(...)"
}

# Eliminar proyecto
DELETE /api/projects/:projectId
Headers: Authorization: Bearer {token}

# Duplicar proyecto
POST /api/projects/:projectId/duplicate
Headers: Authorization: Bearer {token}
```

## 🔐 Autenticación

Todas las rutas protegidas requieren un JWT token en el header:

```
Authorization: Bearer {token}
```

El token se obtiene al hacer login o al verificar el OTP.

## 🎭 Roles y Permisos

### Admin
- Gestión completa de proyectos
- Invitar/remover miembros
- Cambiar roles
- Acceso a billing
- Configuración completa

### Editor
- CRUD de proyectos
- Ver equipo
- Ver billing
- Ver configuración

### Viewer
- Solo lectura de proyectos
- Ver equipo
- Ver configuración

## 📧 Sistema de Emails

El backend envía emails automáticamente para:

- ✅ Verificación OTP (registro)
- ✅ Invitaciones de equipo
- ✅ Bienvenida
- ✅ Confirmación de suscripción

Configura las credenciales SMTP en `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="DragNDrop <noreply@dragndrop.com>"
```

## 🗄️ Base de Datos

### Schema

El backend usa **Drizzle ORM** con PostgreSQL:

- `users` - Usuarios
- `otp_codes` - Códigos OTP
- `organizations` - Organizaciones
- `subscriptions` - Suscripciones
- `organization_members` - Miembros
- `invitations` - Invitaciones
- `projects` - Proyectos
- `components` - Componentes
- `user_preferences` - Preferencias
- `usage_tracking` - Uso/límites
- `audit_logs` - Auditoría

### Comandos DB

```bash
# Push schema a la DB
npm run db:push

# Generar migraciones
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Abrir Drizzle Studio (GUI)
npm run db:studio
```

## 🛡️ Seguridad

- ✅ JWT con expiración configurable
- ✅ Bcrypt para passwords (10 rounds)
- ✅ Rate limiting por endpoint
- ✅ Helmet headers
- ✅ CORS configurado
- ✅ Validación con Zod
- ✅ OTP con expiración

### Rate Limits

- General: 100 req/15min
- Auth: 5 req/15min
- OTP: 3 req/1min

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Watch mode
npm run test:watch

# Integration tests
npm run test:integration
```

## 📝 Scripts

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "test": "NODE_ENV=test jest --coverage",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "lint": "eslint src --ext .js"
}
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dragndrop

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Better Auth
BETTER_AUTH_SECRET=another-secret
BETTER_AUTH_URL=http://localhost:3001

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app-password
SMTP_FROM="DragNDrop <noreply@dragndrop.com>"

# Frontend
FRONTEND_URL=http://localhost:5173
```

Ver `.env.example` para la lista completa.

## 🐛 Troubleshooting

### Error: Database connection failed
```bash
# Verifica que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verifica la DATABASE_URL en .env
```

### Error: Email service not ready
```bash
# Para Gmail, necesitas "App Password"
# 1. Activa verificación en dos pasos
# 2. Genera "App Password" en Google
# 3. Usa esa password en SMTP_PASS
```

### Error: Port already in use
```bash
# Encuentra el proceso
lsof -i :3001

# Mátalo o cambia el puerto en .env
PORT=3002
```

## 📚 Documentación Adicional

- [Arquitectura Completa](../ARCHITECTURE.md)
- [Quick Start Guide](../QUICK_START.md)
- [Implementation Status](../IMPLEMENTATION_STATUS.md)

## 🚀 Deployment

### Vercel/Railway

```bash
# Instalar CLI
npm install -g vercel
# o
npm install -g @railway/cli

# Deploy
vercel deploy --prod
# o
railway up
```

Variables de entorno en producción:
- Configura todas las vars en el dashboard
- Usa Supabase para PostgreSQL
- SendGrid para SMTP
- Stripe en modo producción

## 📞 Soporte

- Docs: Ver `/docs` en la raíz del proyecto
- Issues: GitHub Issues
- Email: dev@dragndrop.com

---

**Última actualización:** 2024-01-20
**Versión:** 1.0.0
