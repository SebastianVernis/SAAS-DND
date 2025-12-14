# Quick Start Guide - DragNDrop Sistema Comercial

## 🚀 Instalación en 5 minutos

### Prerrequisitos

```bash
# Verificar versiones
node --version  # debe ser >= 18.0.0
npm --version   # debe ser >= 9.0.0
psql --version  # PostgreSQL >= 14
```

### 1. Clonar y preparar el proyecto

```bash
cd /home/admin/DragNDrop/commercial-system

# Instalar dependencias (raíz y workspaces)
npm install

# O usar el script de setup
npm run setup
```

### 2. Configurar PostgreSQL

**Opción A: PostgreSQL Local**
```bash
# Crear base de datos
createdb dragndrop_commercial

# O con psql
psql -U postgres
CREATE DATABASE dragndrop_commercial;
\q
```

**Opción B: Supabase (Recomendado para desarrollo)**
1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Copia la "Connection String" (Database URL)

### 3. Configurar variables de entorno

```bash
cd backend
cp .env.example .env
nano .env  # o usa tu editor favorito
```

**Mínimo requerido para empezar:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dragndrop_commercial

# JWT
JWT_SECRET=cambiar-esto-por-una-cadena-larga-y-aleatoria-min-32-caracteres

# Better Auth
BETTER_AUTH_SECRET=otra-cadena-larga-y-aleatoria-diferente

# SMTP (usa Gmail para testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password  # Ver nota abajo
SMTP_FROM="DragNDrop <noreply@dragndrop.com>"

# Frontend
FRONTEND_URL=http://localhost:5173

# Stripe (mockup mode por ahora)
STRIPE_MOCKUP_MODE=true
```

**📧 Nota sobre Gmail App Password:**
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en dos pasos (actívala)
3. Contraseñas de aplicaciones → Crear nueva
4. Usa esa contraseña en SMTP_PASS

### 4. Inicializar la base de datos

```bash
cd backend

# Push schema a la base de datos
npm run db:push

# O generar y ejecutar migraciones
npm run db:generate
npm run db:migrate

# (Opcional) Abrir Drizzle Studio para ver las tablas
npm run db:studio
```

### 5. Iniciar el backend

```bash
cd backend
npm run dev

# Deberías ver:
# ✅ Database connected successfully
# ✅ Email service ready
# 🚀 Server running on http://localhost:3001
```

### 6. Verificar que el backend funciona

```bash
# En otra terminal
curl http://localhost:3001/health

# Respuesta esperada:
# { "status": "ok", "timestamp": "..." }
```

### 7. Iniciar el frontend (cuando esté implementado)

```bash
# En otra terminal
cd frontend
npm run dev

# Abrirá: http://localhost:5173
```

### 8. Modo desarrollo completo (ambos a la vez)

```bash
# Desde la raíz del proyecto
npm run dev

# Esto inicia backend (3001) y frontend (5173) simultáneamente
```

## 🧪 Testing rápido

### Probar el registro y OTP

```bash
# Registrar usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'

# Deberías recibir un email con el código OTP
# Verificar OTP
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# Respuesta incluirá un token JWT
```

## 📁 Estructura del Proyecto

```
commercial-system/
├── backend/               ← Backend Express + PostgreSQL
│   ├── src/
│   │   ├── server.js     ← Entry point
│   │   ├── routes/       ← API endpoints
│   │   ├── controllers/  ← Lógica de negocio
│   │   ├── services/     ← Email, OTP, Stripe
│   │   ├── middleware/   ← Auth, permisos
│   │   └── db/           ← Schema Drizzle
│   └── package.json
├── frontend/              ← Frontend React (próximamente)
│   └── package.json
└── package.json          ← Scripts globales
```

## 🔧 Scripts Útiles

```bash
# Desde la raíz
npm run dev              # Iniciar todo (backend + frontend)
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
npm test                 # Ejecutar tests
npm run lint             # Lint todo el código
npm run format           # Formatear con Prettier

# Desde backend/
npm run dev              # Dev mode con nodemon
npm start                # Producción
npm run db:studio        # Abrir Drizzle Studio
npm run db:push          # Actualizar DB con schema
npm test                 # Tests con Jest
```

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"
```bash
# Asegúrate de estar en la carpeta correcta
cd backend

# Verifica que .env existe
ls -la .env

# Verifica que DATABASE_URL está configurado
cat .env | grep DATABASE_URL
```

### Error: "Email service error"
```bash
# Revisa las credenciales SMTP en .env
# Para Gmail, necesitas "App Password" no tu contraseña normal
# Activa "Verificación en dos pasos" primero
```

### Error: "Connection refused" al conectar a PostgreSQL
```bash
# Verifica que PostgreSQL está corriendo
sudo systemctl status postgresql

# O si usas Supabase, verifica tu connection string
```

### Error: "Port 3001 already in use"
```bash
# Encuentra el proceso
lsof -i :3001

# Mátalo
kill -9 <PID>

# O cambia el puerto en .env
PORT=3002
```

## 📚 Próximos Pasos

1. **Lee la arquitectura completa:** [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Revisa el estado:** [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
3. **Contribuye:** Lee el README para guidelines

## 💡 Tips de Desarrollo

### Usar Drizzle Studio
```bash
cd backend
npm run db:studio
# Abre http://localhost:4983 para ver tu DB visualmente
```

### Watch mode para desarrollo
```bash
# Backend se recarga automáticamente con nodemon
cd backend
npm run dev

# Haz cambios en src/ y se recargarán automáticamente
```

### Ver logs estructurados
```bash
# El backend usa console.log con emojis para clarity:
# ✅ = success
# ❌ = error
# 📧 = email
# 🔐 = auth
# 💾 = database
```

### Testing de APIs con Thunder Client (VS Code)
1. Instala "Thunder Client" extension
2. Importa collection desde `docs/api-collection.json` (próximamente)
3. Prueba todos los endpoints visualmente

## 🎯 Checklist de Setup Completo

- [ ] Node.js >= 18 instalado
- [ ] PostgreSQL corriendo (local o Supabase)
- [ ] `npm install` ejecutado
- [ ] `.env` configurado en backend/
- [ ] `npm run db:push` ejecutado
- [ ] Backend inicia sin errores (puerto 3001)
- [ ] Health check responde OK
- [ ] Email de prueba recibido
- [ ] Frontend inicia (puerto 5173) - próximamente

## 📞 Ayuda

Si tienes problemas:
1. Revisa [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
2. Busca en los issues de GitHub
3. Contacta al equipo

---

**¿Todo funcionando?** 🎉 ¡Excelente! Ahora puedes empezar a desarrollar.

Lee [ARCHITECTURE.md](./ARCHITECTURE.md) para entender el flujo completo.
