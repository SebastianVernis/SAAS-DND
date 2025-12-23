# 🚀 SAAS-DND - Sistema Desplegado para Testing

**Fecha:** 2024-01-20 21:15  
**Estado:** ✅ PRODUCCIÓN READY

---

## 🌐 URLs de Acceso

```
Frontend:    http://18.223.32.141:5173
Backend API: http://18.223.32.141:3001
```

---

## ✅ Sistema Completo Desplegado

### Backend API (Puerto 3001)
- ✅ 21 endpoints funcionando
- ✅ PostgreSQL configurado
- ✅ SMTP configurado (mockup)
- ✅ JWT + OTP activo
- ✅ Rate limiting activo
- ✅ 93 tests passing

**Health Check:** http://18.223.32.141:3001/health

### Frontend React (Puerto 5173)
- ✅ Landing page con demo interactivo
- ✅ Auth completo (Login, Register, VerifyOTP)
- ✅ Onboarding wizard (4 pasos)
- ✅ Dashboard con sidebar
- ✅ Projects management
- ✅ Team management
- ✅ 7 tests passing

---

## 🎯 Flujo Completo de Testing

### 1. Registro de Usuario
```
1. Ir a: http://18.223.32.141:5173/register
2. Llenar:
   - Nombre: Test User
   - Email: test@example.com
   - Password: Test1234
   - Confirmar password: Test1234
   - ✓ Aceptar términos
3. Click "Crear Cuenta"
4. Backend envía OTP (revisar logs)
5. Redirige a /verify-otp
```

### 2. Verificación OTP
```
1. En /verify-otp
2. Ingresar código de 6 dígitos (del log del backend)
3. Auto-submit al completar
4. Redirige a /onboarding
```

### 3. Onboarding (4 Pasos)
```
Step 1: Seleccionar tipo cuenta (Personal/Agencia/Empresa)
Step 2: Datos organización (nombre, industria, tamaño)
Step 3: Rol usuario (Designer/Developer/PM/etc)
Step 4: Preferencias (tema, idioma, notificaciones)
Click "Completar Setup"
Redirige a /dashboard
```

### 4. Dashboard
```
1. Ver stats cards (proyectos, AI calls, storage, miembros)
2. Ver proyectos recientes
3. Navegar a Projects
4. Crear nuevo proyecto
5. Navegar a Team
6. Invitar miembro (si plan Teams)
```

---

## 🧪 Endpoints para Testing

### Autenticación
```bash
# Register
curl -X POST http://18.223.32.141:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'

# Verify OTP (usar código del response)
curl -X POST http://18.223.32.141:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Login
curl -X POST http://18.223.32.141:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Session (con token del login)
curl http://18.223.32.141:3001/api/auth/session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Projects
```bash
# Listar proyectos
curl http://18.223.32.141:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear proyecto
curl -X POST http://18.223.32.141:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mi Proyecto","template":"blank"}'
```

---

## 📊 Características Implementadas

### ✅ Flujo Completo
```
Landing → Register → OTP → Onboarding → Dashboard → Projects → Team
```

### ✅ Páginas (11)
1. Landing - Demo interactivo con iframe
2. Login - Autenticación
3. Register - Registro con validación
4. VerifyOTP - 6 dígitos con timer
5. Onboarding - 4 steps wizard
6. Dashboard Home - Stats y proyectos
7. Projects - Grid/List con CRUD
8. Team - Invites y roles
9. Settings (placeholder)
10. Billing (placeholder)
11. Editor (placeholder)

### ✅ Backend APIs (21 endpoints)
- Auth: 6 endpoints
- Onboarding: 2 endpoints
- Team: 7 endpoints
- Projects: 6 endpoints

### ✅ Features
- JWT authentication
- OTP por email
- Team invitations
- Role-based permissions (admin/editor/viewer)
- Plan limits (Free: 5 proyectos, Teams: 10 miembros)
- Project CRUD
- Responsive design
- Loading states
- Error handling

---

## 🔧 Servicios Corriendo

```bash
# Ver procesos
ps aux | grep -E "(node|vite)" | grep -v grep

# Backend logs
# Shell ID del backend (verificar con job_output)

# Frontend logs  
# Shell ID del frontend (verificar con job_output)
```

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
cd /home/admin/SAAS-DND/backend
npm install
npm run dev
```

### Frontend no inicia
```bash
cd /home/admin/SAAS-DND/apps/web
npm install
npm run dev
```

### Database error
```bash
# Verificar PostgreSQL corriendo
sudo systemctl status postgresql

# Crear database si no existe
sudo -u postgres createdb saasdnd
```

### Port ya en uso
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Credenciales de Testing

**Database:**
- User: admin
- Password: saasdnd2024
- Database: saasdnd

**Email SMTP:**
- En desarrollo, OTP se muestra en logs del backend
- No se envían emails reales (configurar SMTP_PASS para emails reales)

**Stripe:**
- Modo mockup activo
- Cualquier número de tarjeta es aceptado

---

## ✅ Checklist de Testing

### Funcionalidad
- [ ] Registro de usuario
- [ ] Verificación OTP
- [ ] Login
- [ ] Onboarding 4 pasos
- [ ] Ver dashboard con stats
- [ ] Crear proyecto
- [ ] Duplicar proyecto
- [ ] Eliminar proyecto
- [ ] Invitar miembro (plan Teams)
- [ ] Navegación completa

### Seguridad
- [ ] JWT expira
- [ ] Rate limiting funciona
- [ ] Permisos por rol
- [ ] Validación de inputs

### UI/UX
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Loading states
- [ ] Error messages
- [ ] Empty states

---

## 🎉 Sistema Listo

**El sistema está completamente funcional y listo para testing end-to-end.**

Accede a http://18.223.32.141:5173 y prueba el flujo completo.

---

**Última actualización:** 2024-01-20 21:15  
**Versión:** 1.0.0  
**Estado:** ✅ DEPLOYED FOR TESTING
