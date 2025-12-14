# Estructura Organizacional Completa - SAAS-DND

## 🏢 Estructura Enterprise-Grade desde Día 0

Este documento define la estructura organizacional completa siguiendo las mejores prácticas de la industria para proyectos SaaS profesionales.

## 📁 Estructura de Directorios Definitiva

```
SAAS-DND/
│
├── .github/                          # GitHub automation
│   ├── workflows/                    # CI/CD pipelines
│   │   ├── backend-ci.yml           # Backend testing y lint
│   │   ├── frontend-ci.yml          # Frontend testing y lint
│   │   ├── deploy-staging.yml       # Deploy a staging
│   │   ├── deploy-production.yml    # Deploy a producción
│   │   ├── security-scan.yml        # Análisis de seguridad
│   │   └── dependency-update.yml    # Dependabot
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── qa_testing.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS                   # Code review assignments
│
├── apps/                             # Applications (Turborepo pattern)
│   ├── web/                         # Frontend principal (Next.js/React)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                # App Router (Next.js 14+)
│   │   │   │   ├── (auth)/         # Auth group
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── verify-otp/
│   │   │   │   ├── (marketing)/    # Marketing group
│   │   │   │   │   ├── page.tsx    # Landing
│   │   │   │   │   ├── pricing/
│   │   │   │   │   └── about/
│   │   │   │   ├── (dashboard)/    # Dashboard group
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── team/
│   │   │   │   │   └── settings/
│   │   │   │   ├── checkout/
│   │   │   │   ├── onboarding/
│   │   │   │   ├── editor/[id]/
│   │   │   │   ├── api/            # API routes (Next.js)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/            # shadcn/ui components
│   │   │   │   ├── landing/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   └── editor/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── utils.ts
│   │   │   ├── hooks/
│   │   │   ├── stores/            # Zustand stores
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── api/                         # Backend API (Express)
│   │   ├── src/
│   │   │   ├── server.ts           # Entry point
│   │   │   ├── app.ts              # Express app
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── email.ts
│   │   │   │   ├── stripe.ts
│   │   │   │   └── constants.ts
│   │   │   ├── modules/            # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.types.ts
│   │   │   │   │   └── auth.test.ts
│   │   │   │   ├── onboarding/
│   │   │   │   │   ├── onboarding.controller.ts
│   │   │   │   │   ├── onboarding.service.ts
│   │   │   │   │   ├── onboarding.routes.ts
│   │   │   │   │   └── onboarding.test.ts
│   │   │   │   ├── team/
│   │   │   │   ├── projects/
│   │   │   │   ├── payments/
│   │   │   │   └── users/
│   │   │   ├── shared/             # Código compartido
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   ├── permissions.middleware.ts
│   │   │   │   │   ├── validation.middleware.ts
│   │   │   │   │   └── rate-limit.middleware.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── email.service.ts
│   │   │   │   │   ├── otp.service.ts
│   │   │   │   │   ├── stripe.service.ts
│   │   │   │   │   └── storage.service.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── jwt.ts
│   │   │   │   │   ├── bcrypt.ts
│   │   │   │   │   ├── validators.ts
│   │   │   │   │   └── logger.ts
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   ├── db/
│   │   │   │   ├── client.ts
│   │   │   │   ├── schema/
│   │   │   │   │   ├── users.schema.ts
│   │   │   │   │   ├── organizations.schema.ts
│   │   │   │   │   ├── projects.schema.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── migrations/
│   │   │   └── templates/
│   │   │       └── emails/
│   │   ├── tests/
│   │   │   ├── integration/
│   │   │   ├── unit/
│   │   │   └── e2e/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── drizzle.config.ts
│   │
│   └── docs/                        # Documentation site (opcional)
│       ├── pages/
│       ├── components/
│       └── package.json
│
├── packages/                         # Shared packages (Turborepo)
│   ├── ui/                          # UI components compartidos
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                      # Shared configs
│   │   ├── eslint-config/
│   │   ├── tsconfig/
│   │   ├── tailwind-config/
│   │   └── prettier-config/
│   │
│   ├── types/                       # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── organization.ts
│   │   │   ├── project.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                       # Shared utilities
│       ├── src/
│       │   ├── validators.ts
│       │   ├── formatters.ts
│       │   └── constants.ts
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/                   # Infrastructure as Code
│   ├── terraform/
│   │   ├── environments/
│   │   │   ├── staging/
│   │   │   │   ├── main.tf
│   │   │   │   └── variables.tf
│   │   │   └── production/
│   │   │       ├── main.tf
│   │   │       └── variables.tf
│   │   └── modules/
│   │       ├── database/
│   │       ├── networking/
│   │       └── compute/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── web.Dockerfile
│   │   └── nginx.Dockerfile
│   ├── kubernetes/                  # k8s configs (opcional)
│   │   ├── base/
│   │   └── overlays/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── sites-available/
│   │   │   ├── saasdnd-main.conf
│   │   │   ├── saasdnd-vanilla.conf
│   │   │   └── saasdnd-landing.conf
│   │   └── ssl/
│   └── docker-compose.yml           # Local development
│
├── scripts/                          # Automation scripts
│   ├── setup/
│   │   ├── init-project.sh
│   │   ├── install-deps.sh
│   │   └── setup-db.sh
│   ├── deploy/
│   │   ├── deploy-staging.sh
│   │   ├── deploy-production.sh
│   │   └── deploy-subdirs.sh       # Deploy a subdirectorios
│   ├── db/
│   │   ├── seed.ts
│   │   ├── migrate.sh
│   │   └── backup.sh
│   ├── ci/
│   │   ├── run-tests.sh
│   │   ├── build-all.sh
│   │   └── lint-all.sh
│   └── utils/
│       ├── generate-env.sh
│       └── check-health.sh
│
├── tools/                            # Development tools
│   ├── generators/                  # Code generators
│   │   ├── component-generator.js
│   │   ├── api-generator.js
│   │   └── migration-generator.js
│   └── validators/
│       └── env-validator.js
│
├── docs/                             # Documentation
│   ├── architecture/
│   │   ├── ARCHITECTURE.md          # Ya existe
│   │   ├── DATABASE.md
│   │   ├── API.md
│   │   └── DEPLOYMENT.md
│   ├── guides/
│   │   ├── CONTRIBUTING.md
│   │   ├── SETUP.md
│   │   ├── TESTING.md
│   │   └── DEPLOYMENT.md
│   ├── api/
│   │   ├── openapi.yaml            # OpenAPI spec
│   │   └── postman-collection.json
│   └── diagrams/
│       ├── architecture.png
│       ├── user-flow.png
│       └── database-schema.png
│
├── config/                           # Root configs
│   ├── .env.example
│   ├── .env.staging.example
│   ├── .env.production.example
│   └── environments/
│       ├── development.env
│       ├── staging.env
│       └── production.env
│
├── .husky/                          # Git hooks
│   ├── pre-commit                   # Lint, format, type-check
│   ├── pre-push                     # Tests
│   └── commit-msg                   # Conventional commits
│
├── .vscode/                         # VS Code settings
│   ├── settings.json
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
│
├── tests/                           # Root-level tests
│   ├── e2e/                        # End-to-end tests
│   │   ├── playwright.config.ts
│   │   ├── auth.spec.ts
│   │   ├── onboarding.spec.ts
│   │   └── team.spec.ts
│   └── load/                       # Load testing
│       ├── k6/
│       └── artillery/
│
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── .editorconfig
├── package.json                     # Root package (workspaces)
├── pnpm-workspace.yaml             # pnpm workspaces
├── turbo.json                      # Turborepo config
├── tsconfig.base.json              # Base TypeScript config
├── LICENSE
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

## 🎯 Principios de Organización

### 1. Monorepo con Turborepo
- **Apps:** Aplicaciones independientes (web, api, docs)
- **Packages:** Código compartido reutilizable
- **Isolation:** Cada app/package tiene sus propias dependencias
- **Build:** Cache compartido, builds paralelos

### 2. Separación por Features (Modules)
- Cada feature es un módulo autónomo
- Controller → Service → Repository pattern
- Tests junto al código
- Types colocated

### 3. Configuration as Code
- Todas las configuraciones versionadas
- Environment-specific configs
- Secrets en variables de entorno
- Infrastructure as Code (Terraform)

### 4. CI/CD desde Día 0
- Linting automático
- Tests en cada PR
- Deploy automático a staging
- Deploy manual a producción
- Security scanning

### 5. Developer Experience
- Hot reload en desarrollo
- Type safety end-to-end
- Shared configs
- Code generators
- Pre-commit hooks

## 📦 Package.json Root (Turborepo)

```json
{
  "name": "saas-dnd",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:api": "turbo run dev --filter=api",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "db:studio": "cd apps/api && npm run db:studio",
    "db:push": "cd apps/api && npm run db:push",
    "db:migrate": "cd apps/api && npm run db:migrate",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.1",
    "turbo": "^1.11.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

## 🔧 Configuración de Nginx para Subdirectorios

### Problema: Múltiples Puertos vs Subdirectorios

**Antes (múltiples puertos):**
```
http://ip:3001 → API
http://ip:5173 → Web
http://ip:8080 → Vanilla version
http://ip:8081 → Landing version
```

**Después (subdirectorios):**
```
http://ip/api           → API
http://ip/              → Web principal
http://ip/vanilla       → Vanilla version
http://ip/landing       → Landing version
http://ip/catalog       → Catálogo de versiones
```

### Configuración Nginx

```nginx
# /etc/nginx/sites-available/saasdnd.conf

upstream api_backend {
    server localhost:3001;
}

upstream web_frontend {
    server localhost:5173;
}

upstream vanilla_demo {
    server localhost:8080;
}

upstream landing_demo {
    server localhost:8081;
}

server {
    listen 80;
    server_name saasdnd.com www.saasdnd.com;

    # Redirect HTTP to HTTPS (producción)
    # return 301 https://$server_name$request_uri;

    # Logs
    access_log /var/log/nginx/saasdnd-access.log;
    error_log /var/log/nginx/saasdnd-error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API Backend
    location /api/ {
        proxy_pass http://api_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket (colaboración)
    location /socket.io/ {
        proxy_pass http://api_backend/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Vanilla Demo
    location /vanilla/ {
        rewrite ^/vanilla(/.*)$ $1 break;
        proxy_pass http://vanilla_demo/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Landing Demo
    location /landing/ {
        rewrite ^/landing(/.*)$ $1 break;
        proxy_pass http://landing_demo/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Catalog
    location /catalog/ {
        alias /var/www/saasdnd/catalog/;
        try_files $uri $uri/ /catalog/index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # Static assets
    location /assets/ {
        alias /var/www/saasdnd/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Web Frontend (React)
    location / {
        proxy_pass http://web_frontend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Fallback for client-side routing
        try_files $uri $uri/ @web_frontend;
    }

    location @web_frontend {
        proxy_pass http://web_frontend;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# HTTPS (producción)
server {
    listen 443 ssl http2;
    server_name saasdnd.com www.saasdnd.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/saasdnd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saasdnd.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Same locations as above...
}
```

## 🐳 Docker Compose para Desarrollo

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: saasdnd-postgres
    environment:
      POSTGRES_DB: saasdnd
      POSTGRES_USER: saasdnd
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - saasdnd-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saasdnd"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (cache & sessions)
  redis:
    image: redis:7-alpine
    container_name: saasdnd-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - saasdnd-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API Backend
  api:
    build:
      context: ./apps/api
      dockerfile: ../../infrastructure/docker/api.Dockerfile
    container_name: saasdnd-api
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://saasdnd:${DB_PASSWORD:-password}@postgres:5432/saasdnd
      REDIS_URL: redis://redis:6379
    env_file:
      - ./apps/api/.env
    ports:
      - "3001:3001"
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - saasdnd-network
    command: npm run dev

  # Web Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: ../../infrastructure/docker/web.Dockerfile
    container_name: saasdnd-web
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost/api
    env_file:
      - ./apps/web/.env
    ports:
      - "5173:5173"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    networks:
      - saasdnd-network
    command: npm run dev

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: saasdnd-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infrastructure/nginx/sites-available:/etc/nginx/conf.d:ro
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
      - web
    networks:
      - saasdnd-network

  # Vanilla Demo (puerto interno)
  vanilla-demo:
    image: nginx:alpine
    container_name: saasdnd-vanilla
    ports:
      - "8080:80"
    volumes:
      - ${VANILLA_PATH:-../DragNDrop/versions/v1-vanilla-standalone}:/usr/share/nginx/html:ro
    networks:
      - saasdnd-network

  # Landing Demo (puerto interno)
  landing-demo:
    image: nginx:alpine
    container_name: saasdnd-landing
    ports:
      - "8081:80"
    volumes:
      - ${LANDING_PATH:-../DragNDrop/versions/v2-landing-page}:/usr/share/nginx/html:ro
    networks:
      - saasdnd-network

volumes:
  postgres_data:
  redis_data:

networks:
  saasdnd-network:
    driver: bridge
```

## 🌐 Configuración de Subdirectorios (Nginx Detallado)

```nginx
# infrastructure/nginx/sites-available/saasdnd-subdirs.conf

# Configuración para servir múltiples versiones en subdirectorios

server {
    listen 80;
    server_name localhost;

    # Root para archivos estáticos del catálogo
    root /var/www/saasdnd;

    # Logs específicos
    access_log /var/log/nginx/saasdnd-access.log combined;
    error_log /var/log/nginx/saasdnd-error.log warn;

    # API Backend - Sin rewrite, pasa todo el path
    location /api/ {
        proxy_pass http://localhost:3001;
        include /etc/nginx/proxy_params;
    }

    # Vanilla Version - Servir archivos estáticos
    location /vanilla/ {
        alias /var/www/saasdnd/versions/vanilla/;
        index index.html;
        try_files $uri $uri/ /vanilla/index.html;
        
        # Headers de cache
        add_header Cache-Control "public, max-age=3600";
    }

    # Landing Version - Servir archivos estáticos
    location /landing/ {
        alias /var/www/saasdnd/versions/landing/;
        index landing.html index.html;
        try_files $uri $uri/ /landing/landing.html;
        
        add_header Cache-Control "public, max-age=3600";
    }

    # React Version - Proxy a servidor Vite/Next
    location /react/ {
        rewrite ^/react(/.*)$ $1 break;
        proxy_pass http://localhost:5173;
        include /etc/nginx/proxy_params;
    }

    # Fullstack Version - Proxy
    location /fullstack/ {
        rewrite ^/fullstack(/.*)$ $1 break;
        proxy_pass http://localhost:8082;
        include /etc/nginx/proxy_params;
    }

    # Catalog - Página índice de todas las versiones
    location /catalog/ {
        alias /var/www/saasdnd/catalog/;
        index index.html;
        try_files $uri $uri/ /catalog/index.html;
    }

    # Root - App principal (Web SaaS)
    location / {
        proxy_pass http://localhost:5173;
        include /etc/nginx/proxy_params;
        
        # Client-side routing support
        try_files $uri $uri/ @web;
    }

    location @web {
        proxy_pass http://localhost:5173;
    }
}
```

### Archivo de Proxy Params

```nginx
# /etc/nginx/proxy_params

proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_cache_bypass $http_upgrade;
```

## 📜 Scripts de Deployment

### Deploy a Subdirectorios

```bash
#!/bin/bash
# scripts/deploy/deploy-subdirs.sh

set -e

echo "🚀 Deploying SAAS-DND to subdirectories..."

# Variables
DEPLOY_DIR="/var/www/saasdnd"
VERSIONS_DIR="$DEPLOY_DIR/versions"

# Crear estructura de directorios
echo "📁 Creating directory structure..."
sudo mkdir -p $VERSIONS_DIR/{vanilla,landing,react,fullstack,catalog}

# Deploy Vanilla Version
echo "📦 Deploying Vanilla version to /vanilla..."
sudo cp -r /home/admin/DragNDrop/versions/v1-vanilla-standalone/* $VERSIONS_DIR/vanilla/

# Deploy Landing Version
echo "📦 Deploying Landing version to /landing..."
sudo cp -r /home/admin/DragNDrop/versions/v2-landing-page/* $VERSIONS_DIR/landing/

# Build y deploy React Version
echo "📦 Building and deploying React version to /react..."
cd /home/admin/DragNDrop/versions/v9-frontend-react-vite
npm run build
sudo cp -r dist/* $VERSIONS_DIR/react/

# Deploy Catalog
echo "📦 Deploying Catalog to /catalog..."
sudo cp /home/admin/DragNDrop/catalog-demo.html $VERSIONS_DIR/catalog/index.html

# Ajustar permisos
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Recargar Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URLs disponibles:"
echo "  Main App:    http://$(hostname -I | awk '{print $1}')/"
echo "  API:         http://$(hostname -I | awk '{print $1}')/api"
echo "  Vanilla:     http://$(hostname -I | awk '{print $1}')/vanilla"
echo "  Landing:     http://$(hostname -I | awk '{print $1}')/landing"
echo "  Catalog:     http://$(hostname -I | awk '{print $1}')/catalog"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### Script de Setup de Nginx

```bash
#!/bin/bash
# scripts/deploy/setup-nginx.sh

set -e

echo "⚙️  Setting up Nginx for SAAS-DND..."

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Copiar configuración
echo "📝 Copying Nginx configuration..."
sudo cp infrastructure/nginx/sites-available/saasdnd-subdirs.conf /etc/nginx/sites-available/saasdnd
sudo cp infrastructure/nginx/proxy_params /etc/nginx/

# Habilitar sitio
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/saasdnd /etc/nginx/sites-enabled/saasdnd

# Deshabilitar default si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
echo "✅ Testing Nginx configuration..."
sudo nginx -t

# Reiniciar Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx setup completed!"
echo "Status:"
sudo systemctl status nginx --no-pager
```

## 🎨 Estructura de Apps (Turborepo)

### apps/web/package.json

```json
{
  "name": "@saas-dnd/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 5173",
    "build": "next build",
    "start": "next start -p 5173",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@saas-dnd/types": "workspace:*",
    "@saas-dnd/ui": "workspace:*",
    "zustand": "^4.5.0",
    "axios": "^1.6.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### apps/api/package.json

```json
{
  "name": "@saas-dnd/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@saas-dnd/types": "workspace:*",
    "drizzle-orm": "^0.36.4",
    "postgres": "^3.4.5",
    "zod": "^3.22.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.7",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "drizzle-kit": "^0.28.1",
    "jest": "^29.7.0"
  }
}
```

## 🔄 CI/CD Workflows

### Backend CI

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/api/**'
      - 'packages/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'apps/api/**'
      - 'packages/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: saasdnd_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm --filter @saas-dnd/api type-check
      
      - name: Lint
        run: pnpm --filter @saas-dnd/api lint
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/saasdnd_test
          NODE_ENV: test
        run: pnpm --filter @saas-dnd/api test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/api/coverage/lcov.info
```

### Deploy a Subdirectorios

```yaml
# .github/workflows/deploy-subdirs.yml
name: Deploy Subdirectories

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'infrastructure/nginx/**'
      - 'scripts/deploy/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/admin/SAAS-DND
            git pull origin main
            chmod +x scripts/deploy/deploy-subdirs.sh
            ./scripts/deploy/deploy-subdirs.sh
```

## 📋 Pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## ⚡ Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## 🎯 Mejores Prácticas Implementadas

### 1. Arquitectura Modular
- ✅ Feature-based structure
- ✅ Separation of concerns
- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID principles

### 2. Type Safety
- ✅ TypeScript en todo el stack
- ✅ Shared types package
- ✅ Zod para runtime validation
- ✅ Drizzle ORM (type-safe)

### 3. Developer Experience
- ✅ Hot reload en desarrollo
- ✅ Shared configs (ESLint, Prettier, TS)
- ✅ Pre-commit hooks (Husky)
- ✅ Code generators

### 4. Security
- ✅ Environment variables
- ✅ Secrets management
- ✅ Rate limiting
- ✅ Input validation
- ✅ Security headers (Helmet)
- ✅ CORS configurado

### 5. Testing
- ✅ Unit tests (Jest)
- ✅ Integration tests
- ✅ E2E tests (Playwright)
- ✅ Coverage tracking

### 6. CI/CD
- ✅ Automated testing
- ✅ Automated linting
- ✅ Automated deployment
- ✅ Security scanning
- ✅ Dependency updates

### 7. Documentation
- ✅ Código auto-documentado
- ✅ JSDoc/TSDoc
- ✅ OpenAPI spec
- ✅ Architecture docs
- ✅ Contributing guidelines

### 8. Scalability
- ✅ Monorepo structure
- ✅ Microservices-ready
- ✅ Horizontal scaling
- ✅ Caching strategy
- ✅ Database optimization

### 9. Observability
- ✅ Structured logging
- ✅ Error tracking (Sentry)
- ✅ Analytics (Posthog)
- ✅ Performance monitoring
- ✅ Health checks

### 10. Deployment
- ✅ Docker containers
- ✅ Infrastructure as Code
- ✅ Blue-green deployment
- ✅ Rollback capability
- ✅ Environment separation

## 🗺️ Mapa de URLs (Producción)

```
https://saasdnd.com/                 → App principal (Next.js)
https://saasdnd.com/api              → API Backend
https://saasdnd.com/vanilla          → Demo versión Vanilla
https://saasdnd.com/landing          → Demo Landing Page
https://saasdnd.com/catalog          → Catálogo de versiones
https://saasdnd.com/docs             → Documentación
https://api.saasdnd.com              → API dedicada (opcional)
https://app.saasdnd.com              → App dedicada (opcional)
```

## 📊 Roadmap de Implementación

### ✅ Fase 0: Setup Organizacional (HOY)
- [x] Estructura de directorios enterprise
- [x] Configuración de monorepo
- [x] Docker compose
- [x] Nginx configuration
- [x] CI/CD workflows
- [ ] Implementar estructura física

### 📋 Fase 1: Backend Completo (3-5 días)
- [x] Backend actual migrar a structure modular
- [ ] Convertir a TypeScript
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] OpenAPI documentation

### 📋 Fase 2: Frontend Base (5-7 días)
- [ ] Setup Next.js 14 con App Router
- [ ] TailwindCSS + shadcn/ui
- [ ] Zustand stores
- [ ] Landing page
- [ ] Auth pages

### 📋 Fase 3: Features Core (7-10 días)
- [ ] Dashboard completo
- [ ] Team management
- [ ] Projects CRUD
- [ ] Settings
- [ ] Billing

### 📋 Fase 4: Deploy & Testing (3-5 días)
- [ ] Deploy a staging
- [ ] E2E tests
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy a producción

## 🎯 Beneficios de esta Estructura

### Desarrollo
- 🚀 Build times optimizados (Turborepo cache)
- 🔄 Hot reload instant
- 📦 Shared code reutilizable
- 🧪 Testing más fácil

### Deployment
- 🌐 Una sola URL para todo
- 🔀 Reverse proxy inteligente
- 📊 Fácil de monitorear
- 🔐 SSL/HTTPS centralizado

### Mantenimiento
- 📝 Código organizado
- 🔍 Fácil de encontrar cosas
- 🛠️ Fácil de extender
- 👥 Múltiples devs pueden trabajar

### Escalabilidad
- 📈 Horizontal scaling ready
- 🎯 Microservices-ready
- 🗄️ Database optimization
- ⚡ Caching strategy

---

**Última actualización:** 2024-01-20  
**Versión:** 1.0.0  
**Estado:** Estructura definida ✅ | Implementación pendiente 🚧
