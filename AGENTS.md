# 🤖 AGENTS.md - Agent Guide for SAAS-DND

**Last Updated:** December 14, 2024  
**Project Version:** 1.0.0  
**Project Status:** ✅ 100% Complete (MVP)

---

## 📍 Critical Context

### Working Directory
```bash
# ALWAYS work from this directory
cd /home/admin/SAAS-DND
```

**Important:** This is SAAS-DND, NOT the original DragNDrop project. Verify with `pwd` before starting work.

### Project State
- **Status:** Production-ready MVP
- **Deploy:** http://18.223.32.141
- **Branch:** `main`
- **Commits:** 47+
- **Tests:** 100+ passing (93 backend, 7+ frontend)

---

## 🏗️ Project Architecture

### Monorepo Structure (Turborepo + pnpm)
```
/home/admin/SAAS-DND/
├── apps/
│   └── web/              # Frontend React app (Vite + React 19)
├── backend/              # Backend Express API (Node.js + PostgreSQL)
├── vanilla-editor/       # Standalone HTML editor (25 templates)
├── packages/
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configs
├── infrastructure/       # Docker, Nginx configs
├── scripts/              # Setup, deploy, db scripts
├── docs/                 # Comprehensive documentation
└── tests/e2e/           # End-to-end tests
```

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, Zustand
- **Backend:** Node.js, Express, PostgreSQL, Drizzle ORM
- **Editor:** Vanilla JS (25 templates, 34 components)
- **Monorepo:** Turborepo, pnpm workspaces
- **Testing:** Jest (backend), Vitest (frontend), Playwright (E2E)
- **Deployment:** Nginx reverse proxy, PM2 (backend), Vite (frontend)

---

## ⚡ Essential Commands

### Development
```bash
# Install dependencies (root)
pnpm install

# Start all services in dev mode
pnpm dev

# Start specific workspace
pnpm dev:api          # Backend only (port 3000)
pnpm dev:web          # Frontend only (port 5173)

# Backend development (manual)
cd backend
npm run dev           # Starts nodemon on port 3000

# Frontend development (manual)
cd apps/web
npm run dev -- --host 0.0.0.0   # Starts Vite on port 5173, binds to all interfaces
```

### Testing
```bash
# Run all tests
pnpm test

# Backend tests (93 tests)
cd backend
npm test                      # Run all with coverage
npm run test:watch           # Watch mode
npm run test:integration     # Integration tests only

# Frontend tests (7+ tests)
cd apps/web
npm test                      # Vitest unit tests
npm run test:ui              # Vitest UI mode
npm run test:e2e             # Playwright E2E tests
```

### Building
```bash
# Build all packages
pnpm build

# Build specific workspace
pnpm build:api        # Backend (no build needed, Node.js)
pnpm build:web        # Frontend (creates dist/)
```

### Linting & Formatting
```bash
# Lint all workspaces
pnpm lint
pnpm lint:fix         # Auto-fix issues

# Format all files
pnpm format           # Write formatted files
pnpm format:check     # Check formatting only

# Type checking
pnpm type-check       # All workspaces
```

### Database (Drizzle ORM)
```bash
# From root
pnpm db:studio        # Open Drizzle Studio (visual DB editor)
pnpm db:push          # Push schema changes to DB
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database

# From backend/
cd backend
npm run db:generate   # Generate migration files
npm run db:migrate    # Run migrations
npm run db:push       # Push schema without migrations
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Seed database
```

### Docker & Infrastructure
```bash
# Start infrastructure services
pnpm docker:up        # Start PostgreSQL, Redis, Nginx
pnpm docker:down      # Stop all services
pnpm docker:logs      # View logs

# Nginx deployment
pnpm nginx:setup      # Initial Nginx setup
pnpm nginx:deploy     # Deploy subdirectories configuration
```

### Cleaning
```bash
pnpm clean            # Clean build artifacts
pnpm clean:all        # Clean including all node_modules
```

---

## 🧪 Testing Patterns

### Backend Testing (Jest)
**Location:** `backend/tests/`

**Patterns:**
- Test files: `*.test.js`
- Test helpers: `backend/tests/helpers/testDb.js`
- Database cleanup before each test
- Use `supertest` for HTTP testing
- Mock external services (email, Stripe)

**Example:**
```javascript
import request from 'supertest';
import app from '../src/server.js';
import { cleanDatabase, createTestUser } from './helpers/testDb.js';

describe('Authentication API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'SecurePass123', name: 'Test' })
      .expect(201);
    
    expect(response.body).toHaveProperty('userId');
  });
});
```

**Coverage:** 93 tests passing, extensive coverage of:
- Auth endpoints (register, login, OTP, session)
- Onboarding flow
- Projects CRUD
- Team management

### Frontend Testing (Vitest + React Testing Library)
**Location:** `apps/web/src/**/__tests__/`

**Patterns:**
- Test files: `*.test.tsx` or `*.test.ts`
- Located in `__tests__/` subdirectories
- Setup file: `apps/web/src/test/setup.ts`
- Mock API calls with axios
- Test user interactions with `@testing-library/user-event`

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from '../Login';

describe('Login', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
```

### E2E Testing (Playwright)
**Location:** `tests/e2e/`

**Command:** `cd apps/web && npm run test:e2e`

---

## 📝 Code Conventions

### Naming Conventions
- **Files:** camelCase for JS/TS files, PascalCase for React components
  - Components: `Dashboard.tsx`, `LoginForm.tsx`
  - Services: `authService.ts`, `projectsController.js`
  - Tests: `Login.test.tsx`, `auth.test.js`
- **Variables/Functions:** camelCase (`getUserById`, `currentUser`)
- **Classes/Components:** PascalCase (`UserProfile`, `DashboardLayout`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **Database:** snake_case (Drizzle schema: `email_verified`, `created_at`)

### File Organization

#### Backend (`backend/src/`)
```
src/
├── server.js              # Entry point
├── config/
│   └── constants.js       # App-wide constants
├── controllers/           # Request handlers
│   ├── authController.js
│   └── projectsController.js
├── routes/                # Express routes
│   ├── auth.js
│   └── projects.js
├── middleware/            # Express middleware
│   ├── auth.js           # requireAuth, optionalAuth
│   └── permissions.js    # Role-based access
├── services/              # Business logic
│   ├── emailService.js
│   └── otpService.js
├── db/
│   ├── client.js         # Drizzle client
│   └── schema.js         # Database schema
└── utils/                 # Utility functions
    ├── validators.js     # Zod schemas
    └── jwt.js
```

#### Frontend (`apps/web/src/`)
```
src/
├── main.tsx               # Entry point
├── App.tsx                # Root component
├── pages/                 # Route components
│   ├── auth/             # Login, Register, VerifyOTP
│   ├── onboarding/       # Wizard steps
│   ├── dashboard/        # Dashboard pages
│   └── landing/          # Landing page
├── components/            # Reusable components
│   ├── auth/
│   ├── dashboard/
│   └── __tests__/
├── services/              # API clients
│   ├── api.ts            # Axios instance + interceptors
│   └── auth/
├── stores/                # Zustand state management
│   └── authStore.ts
├── types/                 # TypeScript types
└── utils/                 # Helper functions
```

### TypeScript Configuration
- **Strict mode enabled** (`tsconfig.base.json`)
- Use explicit types, avoid `any` (warn only)
- Unused vars/params are errors (except prefixed with `_`)
- ES2022 target, ESNext modules

### ESLint Rules
- **No console.log** (use console.warn/error only)
- **Unused vars:** Error (except `_` prefix)
- **No explicit any:** Warn (use if necessary)
- Auto-extends: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier`

### Prettier Configuration
- **Semi:** true
- **Single quotes:** true
- **Print width:** 100
- **Tab width:** 2 spaces
- **Trailing commas:** ES5
- **Line endings:** LF

---

## 🗄️ Database Schema (Drizzle ORM)

### Core Tables
```javascript
// users - User accounts
{
  id: uuid (PK),
  email: varchar(255) UNIQUE,
  emailVerified: boolean,
  name: varchar(255),
  passwordHash: varchar(255),
  createdAt: timestamp,
  updatedAt: timestamp
}

// otpCodes - Email verification codes
{
  id: uuid (PK),
  userId: uuid (FK -> users),
  code: varchar(6),
  expiresAt: timestamp,
  verified: boolean,
  createdAt: timestamp
}

// organizations - Companies/agencies/personal
{
  id: uuid (PK),
  name: varchar(255),
  slug: varchar(255) UNIQUE,
  type: varchar(50),  // personal, agency, enterprise
  industry: varchar(100),
  teamSize: varchar(50),
  createdAt: timestamp,
  updatedAt: timestamp
}

// organizationMembers - Team members
{
  id: uuid (PK),
  organizationId: uuid (FK -> organizations),
  userId: uuid (FK -> users),
  role: varchar(50),  // admin, editor, viewer
  status: varchar(50),  // active, pending, suspended
  joinedAt: timestamp
}

// projects - User projects
{
  id: uuid (PK),
  name: varchar(255),
  description: text,
  organizationId: uuid (FK -> organizations),
  createdBy: uuid (FK -> users),
  htmlContent: text,
  cssContent: text,
  jsContent: text,
  template: varchar(100),
  createdAt: timestamp,
  updatedAt: timestamp
}

// subscriptions - Billing plans
{
  id: uuid (PK),
  organizationId: uuid (FK -> organizations),
  plan: varchar(50),  // free, pro, teams, enterprise
  status: varchar(50),  // active, canceled, past_due
  stripeCustomerId: varchar(255),
  stripeSubscriptionId: varchar(255),
  currentPeriodStart: timestamp,
  currentPeriodEnd: timestamp,
  createdAt: timestamp
}
```

### Schema Location
- **File:** `backend/src/db/schema.js`
- **Migrations:** `backend/src/db/migrations/`
- **Config:** `backend/drizzle.config.js`

---

## 🔐 Authentication & Authorization

### Auth Flow
1. **Register:** POST `/api/auth/register` → Creates user, sends OTP
2. **Verify OTP:** POST `/api/auth/verify-otp` → Verifies code, marks email as verified
3. **Login:** POST `/api/auth/login` → Returns JWT token
4. **Session:** GET `/api/auth/session` (protected) → Returns user info

### JWT Tokens
- **Storage:** `localStorage.getItem('token')`
- **Header:** `Authorization: Bearer <token>`
- **Expiry:** Configurable in `.env` (default: 7 days)
- **Secret:** `JWT_SECRET` in `.env`

### Protected Routes (Backend)
```javascript
import { requireAuth } from '../middleware/auth.js';

router.get('/protected', requireAuth, (req, res) => {
  // req.user available (decoded JWT)
  res.json({ user: req.user });
});
```

### Protected Routes (Frontend)
```typescript
// Axios interceptor auto-adds token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Permissions & Roles
- **Roles:** `admin`, `editor`, `viewer`
- **Middleware:** `backend/src/middleware/permissions.js`
- **Usage:** Check `req.user.role` in controllers

---

## 🌐 API Endpoints

### Base URL
- **Local:** `http://localhost:3000/api`
- **Production:** `http://18.223.32.141/api`

### Authentication
```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # Login with email/password
POST   /api/auth/verify-otp       # Verify OTP code
POST   /api/auth/resend-otp       # Resend OTP
GET    /api/auth/session          # Get current session (protected)
POST   /api/auth/logout           # Logout (protected)
```

### Onboarding
```
POST   /api/onboarding/complete   # Complete onboarding wizard (protected)
```

### Projects
```
GET    /api/projects              # List user's projects (protected)
POST   /api/projects              # Create new project (protected)
GET    /api/projects/:id          # Get project by ID (protected)
PUT    /api/projects/:id          # Update project (protected)
DELETE /api/projects/:id          # Delete project (protected)
POST   /api/projects/:id/duplicate # Duplicate project (protected)
```

### Team Management
```
GET    /api/team/members          # List team members (protected)
POST   /api/team/invite           # Invite team member (admin only)
PATCH  /api/team/members/:id      # Update member role (admin only)
DELETE /api/team/members/:id      # Remove member (admin only)
GET    /api/team/invitations      # List pending invitations (protected)
DELETE /api/team/invitations/:id  # Revoke invitation (admin only)
```

### Rate Limiting
- **Auth endpoints:** 10 requests / 15 minutes
- **OTP endpoints:** 5 requests / 15 minutes
- **General API:** 100 requests / 15 minutes

---

## 🎨 Frontend Patterns

### State Management (Zustand)
```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
```

### API Service Pattern
```typescript
// services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Specific API modules
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const projectsApi = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
};
```

### Component Structure
- Use functional components (no class components)
- Custom hooks for reusable logic
- Props interface for TypeScript
- Destructure props in parameters

**Example:**
```tsx
interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
```

---

## 📦 Environment Variables

### Backend (`.env`)
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/saasdnd

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# Email (SendGrid or SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@saasdnd.com

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```bash
# API URL
VITE_API_URL=http://localhost:3000
```

**Important:** Copy `.env.example` to `.env` and customize values.

---

## 🚀 Deployment

### Current Production Setup
- **Server:** AWS EC2 (18.223.32.141)
- **Frontend:** Vite dev server (port 5173) behind Nginx
- **Backend:** Node.js with nodemon (port 3000) behind Nginx
- **Editor:** Static files served by Nginx (`/vanilla`)
- **Reverse Proxy:** Nginx
  - `/` → Frontend (5173)
  - `/api` → Backend (3000)
  - `/vanilla` → Vanilla editor (static)

### Nginx Configuration
**Location:** `infrastructure/nginx/sites-available/saasdnd-subdirs.conf`

**Key routes:**
```nginx
location / {
    proxy_pass http://localhost:5173;  # Frontend
}

location /api {
    proxy_pass http://localhost:3000;  # Backend
}

location /vanilla {
    alias /var/www/saasdnd/vanilla-editor;  # Static editor
}
```

### Starting Services (Manual)
```bash
# Backend (run in background)
cd /home/admin/SAAS-DND/backend
npm run dev &

# Frontend (run in background, bind to all interfaces)
cd /home/admin/SAAS-DND/apps/web
npm run dev -- --host 0.0.0.0 &

# Check Nginx
sudo systemctl status nginx
sudo systemctl restart nginx  # If needed
```

### Checking Running Processes
```bash
# View active processes
ps aux | grep -E "(vite|node.*server|nginx)" | grep -v grep

# Check ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :80    # Nginx
```

### Logs
```bash
# Backend logs (if using job_output with shell_id)
# job_output <shell_id>

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 Known Issues & Gotchas

### 1. Drag & Drop in Vanilla Editor
**Issue:** Elements may highlight but not move visually when dragging.

**Cause:** Elements need `position: absolute` to be freely draggable.

**Fix Applied:** When an element is selected, it's automatically converted to `position: absolute` with current computed position.

**Testing:**
1. Go to http://18.223.32.141/vanilla
2. Load a template (e.g., "SaaS Product")
3. Click an element to select it
4. Drag the element → should move visually

**Location:** `vanilla-editor/script.js` → `selectElement()` and `setupElementDragAndDrop()`

### 2. Properties Panel Reading Styles
**Issue FIXED:** Properties panel was not showing values from templates/external files.

**Cause:** Panel only read `element.style` (inline JS-set styles), not computed styles from HTML.

**Fix Applied (Commit: cdccda9):** Created `getStyleValue()` helper that reads from:
1. `element.style[property]` (inline styles)
2. `window.getComputedStyle(element)[property]` (computed styles)

**Testing:** Issue #11 created for Jules
- Load template → Select element → Open properties panel (Ctrl+P)
- Values should display correctly (fontSize, padding, colors, etc.)

**Location:** `vanilla-editor/script.js` → `loadProperties()` (~line 1700)

### 2. Editor Panels Hidden on Load
**Fix Applied:** Panels (components, properties) are hidden by default using inline styles in HTML.

**Toggle shortcuts:**
- `Ctrl+B` → Components panel
- `Ctrl+P` → Properties panel
- `Ctrl+Shift+D` → Theme toggle (dark/light)
- `F11` → Zen mode (fullscreen)

### 3. Canvas Dark Background
**Default:** Canvas uses dark background (`#1e293b`) by default.

**Toggle:** Press `Ctrl+Shift+D` to switch themes.

### 4. Hard Refresh Required
After editing `vanilla-editor/script.js` or styles, always hard refresh:
- **Chrome/Firefox:** `Ctrl+Shift+R`
- **Safari:** `Cmd+Shift+R`

### 5. Text Editing (Double-Click)
**Feature:** Double-click on text elements to edit inline.

**Compatible elements:** `h1-h6`, `p`, `span`, `button`, `a`, `li`, `label`

**Usage:**
- Double-click → Text becomes editable
- Type to edit
- Enter → Save and exit
- Shift+Enter → New line (multi-line elements)
- Click outside → Auto-save

**Location:** `vanilla-editor/script.js` → `makeElementEditable()` (~line 2103)

### 6. Resize Handles
**Feature:** 8 directional handles appear when element is selected.

**Handles:** nw, n, ne, e, se, s, sw, w (all compass directions)

**Usage:**
- Click element → Handles appear
- Drag handle → Element resizes
- Shift + Drag → Preserve aspect ratio
- Esc → Cancel resize

**Features:**
- Tooltip shows dimensions during resize: `{width}px × {height}px`
- Minimum size: 20px × 20px
- Updates properties panel in real-time

**Location:** `vanilla-editor/src/core/resizeManager.js` → `ResizeManager` class

**Testing:** Issue #12 created for Jules

### 5. OTP Codes in Development
In `NODE_ENV=development`, OTP codes are:
- Returned in API response
- Logged to backend console
- Valid for 10 minutes

**Production:** OTP sent via email only (no console logs).

### 6. Database Connection Issues
If backend fails to connect to PostgreSQL:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Start PostgreSQL
cd /home/admin/SAAS-DND
pnpm docker:up

# Verify DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL
```

### 7. Port Conflicts
If ports 3000 or 5173 are in use:
```bash
# Kill processes on port
pkill -f "vite.*5173"
pkill -f "node.*server"

# Or use lsof to find PID
lsof -ti :3000 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```

### 8. CORS Issues
If frontend can't reach backend:
- Check `FRONTEND_URL` in `backend/.env`
- Verify CORS middleware in `backend/src/server.js`
- Ensure Nginx proxy headers are correct

---

## 📚 Key Documentation Files

### Must Read First
1. **[START_HERE.md](./START_HERE.md)** - Quick context and current status
2. **[README.md](./README.md)** - Project overview
3. **[STATUS_FINAL.md](./STATUS_FINAL.md)** - Current completion status

### Architecture & Design
- **[docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)** - System architecture
- **[docs/guides/QUICK_START.md](./docs/guides/QUICK_START.md)** - Getting started guide

### Development
- **[PENDING_TASKS.md](./PENDING_TASKS.md)** - Future features roadmap
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Feature implementation details

### Deployment
- **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - Deployment checklist
- **[docs/guides/DEPLOYMENT_GUIDE.md](./docs/guides/DEPLOYMENT_GUIDE.md)** - Full deployment guide

### Testing & QA
- **[backend/QA_TEST_REPORT.md](./backend/QA_TEST_REPORT.md)** - Backend test results
- **[backend/TESTING_SUMMARY.md](./backend/TESTING_SUMMARY.md)** - Testing summary

---

## 🔄 Git Workflow

### Branches
- **main:** Production-ready code (protected)
- Feature branches: `feature/feature-name`
- Bugfix branches: `fix/bug-description`

### Commit Convention
Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Pre-commit Hooks (Husky)
Automatically runs on commit:
1. **lint-staged** - Lints and formats changed files
2. **type-check** - TypeScript type checking

**Location:** `.husky/pre-commit`

### Pull Request Template
**Location:** `.github/PULL_REQUEST_TEMPLATE.md`

---

## 🛠️ Common Tasks

### Adding a New API Endpoint
1. **Define route** in `backend/src/routes/`
2. **Create controller** in `backend/src/controllers/`
3. **Add validation** in `backend/src/utils/validators.js` (Zod)
4. **Write tests** in `backend/tests/`
5. **Update frontend service** in `apps/web/src/services/`

### Adding a New Frontend Page
1. **Create component** in `apps/web/src/pages/`
2. **Add route** in `apps/web/src/App.tsx`
3. **Create service methods** in `apps/web/src/services/`
4. **Write tests** in `apps/web/src/pages/**/__tests__/`

### Adding a Database Table
1. **Define schema** in `backend/src/db/schema.js`
2. **Generate migration:** `cd backend && npm run db:generate`
3. **Run migration:** `npm run db:migrate`
4. **Update types** if using TypeScript

### Adding a Vanilla Editor Template
1. **Edit** `vanilla-editor/script.js`
2. **Add to `plantillas` array** with:
   - `id`, `nombre`, `descripcion`, `categoria`, `emoji`
   - `contenido_html` (full HTML with inline styles)
3. **Test in browser:** http://18.223.32.141/vanilla
4. **Hard refresh:** `Ctrl+Shift+R`

---

## 🚦 Health Checks

### Quick System Health Check
```bash
# 1. Verify directory
pwd  # Should be /home/admin/SAAS-DND

# 2. Check git status
git status
git log --oneline | head -5

# 3. Check running services
ps aux | grep -E "(vite|node.*server|nginx)" | grep -v grep

# 4. Check ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend

# 5. Test endpoints
curl http://localhost:3000/api/health  # Backend health
curl http://localhost:5173             # Frontend
curl http://18.223.32.141             # Public access
```

### System URLs
- **Frontend:** http://18.223.32.141
- **API:** http://18.223.32.141/api
- **Editor:** http://18.223.32.141/vanilla

---

## 💡 Tips for Agents

### Do's ✅
- **Always** verify working directory (`pwd`)
- **Always** read files before editing (use `view` tool)
- **Always** run tests after changes (`pnpm test`)
- **Use** Turborepo commands from root (`pnpm dev`, `pnpm build`)
- **Use** exact whitespace matching when editing files
- **Check** START_HERE.md for current project status
- **Commit** changes with conventional commit messages
- **Test** endpoints manually after backend changes
- **Hard refresh** browser after frontend changes

### Don'ts ❌
- **Don't** assume monorepo structure without checking
- **Don't** edit files without reading them first
- **Don't** skip tests after making changes
- **Don't** guess environment variables (check `.env.example`)
- **Don't** edit node_modules or build artifacts
- **Don't** commit without running pre-commit hooks
- **Don't** push to main without PR (protected branch)
- **Don't** change core architecture without discussion

### When Stuck
1. Read [START_HERE.md](./START_HERE.md) for current context
2. Check [STATUS_FINAL.md](./STATUS_FINAL.md) for completion status
3. Review [PENDING_TASKS.md](./PENDING_TASKS.md) for planned features
4. Search codebase for similar patterns (grep/glob tools)
5. Check GitHub issues for relevant discussions

---

## 📊 Project Metrics

### Codebase Statistics
- **Total commits:** 47+
- **Lines of code:** 70,000+
- **Test coverage:** 93 backend tests, 7+ frontend tests
- **Pages:** 11 complete pages
- **Templates:** 25 professional templates
- **Components:** 34 drag-and-drop components
- **Documentation:** 21 markdown files

### Completion Status
```
Backend:           ████████████████████ 100%
Frontend Auth:     ████████████████████ 100%
Frontend Core:     ████████████████████ 100%
Editor:            ████████████████████ 100%
Testing:           ████████████████████ 100%
Deployment:        ████████████████████ 100%
Documentation:     ████████████████████ 100%
```

**Status:** ✅ Production-ready MVP

---

## 🎯 Next Steps (Optional Post-MVP Features)

These are **optional** enhancements documented in [PENDING_TASKS.md](./PENDING_TASKS.md):

1. Complete Settings page
2. Full Billing page with Stripe integration
3. Integrated Editor page (React version)
4. Real-time collaboration (Socket.io + Yjs)
5. Mobile app
6. Public API with documentation
7. Advanced analytics
8. White-label features

**Current state:** MVP is 100% complete and production-ready. These are enhancements for future iterations.

---

**Last Updated:** December 14, 2024  
**Maintained by:** Sebastian Vernis  
**For issues:** https://github.com/SebastianVernis/SAAS-DND/issues
