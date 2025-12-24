# 🧪 ESTRUCTURA DE TESTING - SAAS-DND

**Última Actualización:** 23 de Diciembre 2024  
**Total Tests:** 210+  
**Branch:** main (única rama)

---

## 📊 OVERVIEW

### Test Suites Disponibles

| Suite | Tests | Framework | Status | Location |
|-------|-------|-----------|--------|----------|
| **Backend** | 93 | Jest | ✅ Passing | `backend/tests/` |
| **Frontend** | 7+ | Vitest | ✅ Passing | `apps/web/src/**/__tests__/` |
| **E2E** | 110 | Playwright | ⚠️ 78% failing | `tests/e2e/` |
| **TOTAL** | **210+** | Mixed | 🔄 In Progress | - |

---

## 🗂️ ESTRUCTURA DE DIRECTORIOS

```
SAAS-DND/
│
├── backend/tests/              # Backend Tests (Jest)
│   ├── auth.test.js            # Authentication (20+ tests)
│   ├── projects.test.js        # Projects CRUD (25+ tests)
│   ├── team.test.js            # Team management (25+ tests)
│   ├── onboarding.test.js      # Onboarding flow (20+ tests)
│   ├── helpers/
│   │   └── testDb.js           # DB helpers
│   └── setup.js                # Test setup
│
├── apps/web/src/               # Frontend Tests (Vitest)
│   └── **/__tests__/           # Co-located with components
│       ├── Login.test.tsx
│       ├── Dashboard.test.tsx
│       └── ...
│
├── tests/e2e/                  # E2E Tests (Playwright) ⭐
│   ├── helpers/                # Reusable utilities
│   │   ├── setup.ts            # Common setup (239 lines)
│   │   ├── auth.ts             # Auth helpers (352 lines)
│   │   └── editor.ts           # Editor helpers (444 lines)
│   ├── vanilla-editor.spec.ts  # Editor tests (40 tests)
│   ├── react-frontend.spec.ts  # Frontend tests (12 tests)
│   ├── backend-api.spec.ts     # API tests (44 tests)
│   └── README.md               # Usage guide
│
├── tests/legacy/               # Archived Tests
│   ├── suite1-5.spec.ts        # Old Playwright
│   └── puppeteer-*.js          # Old Puppeteer
│
└── playwright.config.ts        # Playwright configuration
```

---

## 🚀 EJECUTAR TESTS

### Todos los Tests (One Command)

```bash
./tools/scripts/run-all-tests.sh
```

**Ejecuta:**
1. Backend (Jest) - 93 tests
2. Frontend (Vitest) - 7+ tests
3. E2E (Playwright) - 110 tests

**Tiempo:** ~3-5 minutos

---

### Backend Tests (Jest)

```bash
cd backend
npm test                    # All tests with coverage
npm run test:watch         # Watch mode
npm run test:integration   # Only integration tests
```

**Coverage:**
```
Statements   : 85%
Branches     : 78%
Functions    : 82%
Lines        : 85%
```

---

### Frontend Tests (Vitest)

```bash
cd apps/web
npm test              # Run all
npm run test:ui       # UI mode
npm run test:watch    # Watch mode
```

---

### E2E Tests (Playwright)

```bash
# All tests
npx playwright test

# Specific suite
npx playwright test vanilla-editor.spec.ts
npx playwright test react-frontend.spec.ts
npx playwright test backend-api.spec.ts

# With UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Headed (ver browser)
npx playwright test --headed

# HTML report
npx playwright test --reporter=html
npx playwright show-report
```

---

## 📋 TEST SCRIPTS DISPONIBLES

### En package.json

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd apps/web && npm test",
    "test:e2e": "playwright test",
    "test:all": "./tools/scripts/run-all-tests.sh"
  }
}
```

### Scripts Personalizados

| Script | Ubicación | Descripción |
|--------|-----------|-------------|
| `run-all-tests.sh` | `tools/scripts/` | Ejecuta todos los tests |
| `setup-dev.sh` | `tools/scripts/` | Setup completo (incluye test setup) |
| `install-dependencies.sh` | `tools/scripts/` | Instala deps (incluye Playwright) |

---

## 🎯 ESTADO ACTUAL DE TESTS

### Backend: ✅ 100% Passing

**93 tests en 4 suites:**
- `auth.test.js` - Authentication flows
- `projects.test.js` - Projects CRUD
- `team.test.js` - Team management
- `onboarding.test.js` - Onboarding wizard

**Última ejecución:** Exitosa  
**Coverage:** >85% en todos los aspectos

---

### Frontend: ✅ 100% Passing

**7+ tests:**
- Login component
- Dashboard component
- Navigation
- State management

**Framework:** Vitest + React Testing Library

---

### E2E: ⚠️ 78% Failing (Trabajo en progreso)

**110 tests implementados:**
- Vanilla Editor: 40 tests
- React Frontend: 12 tests
- Backend API: 44 tests
- Additional: 14 tests

**Status:**
- Passing: ~24 (21.8%)
- Failing: ~86 (78.2%)
- **Jules fixes aplicados** (PR #16 merged)
- Pendiente: Ejecución local completa

**Issues conocidos:**
- Selectores incorrectos (corregidos parcialmente)
- Timeouts insuficientes (ajustados)
- Legal modal (mejorado)
- React frontend 502 errors (servidor remoto en sandbox de Jules)

---

## 🔧 CONFIGURACIÓN DE TESTING

### Jest (Backend)

**Archivo:** `backend/jest.config.js`

```javascript
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
};
```

---

### Vitest (Frontend)

**Archivo:** `apps/web/vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

---

### Playwright (E2E)

**Archivo:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://18.223.32.141',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

---

## 📊 TEST HELPERS & UTILITIES

### Backend Helpers

**Ubicación:** `backend/tests/helpers/testDb.js`

```javascript
export async function cleanDatabase() {
  // Clean all tables
}

export async function createTestUser(data) {
  // Create user for testing
}

export async function createTestOrganization(userId) {
  // Create org for testing
}
```

---

### E2E Helpers

**Ubicación:** `tests/e2e/helpers/`

#### setup.ts (Common utilities)
```typescript
export const BASE_URLS = {
  editor: 'http://18.223.32.141/vanilla',
  frontend: 'http://18.223.32.141',
  api: 'http://18.223.32.141/api',
};

export const TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
};

export async function takeScreenshot(page, category, name) {
  // Organized screenshots
}
```

#### auth.ts (Auth helpers)
```typescript
export async function registerUserUI(page, userData) {
  // UI registration flow
}

export async function loginUserAPI(request, credentials) {
  // API login with token
}
```

#### editor.ts (Editor helpers)
```typescript
export async function loadTemplate(page, templateName) {
  // Load template in editor
}

export async function acceptLegalModal(page) {
  // Handle legal modal
}
```

---

## 🎯 PRÓXIMOS PASOS

### Inmediato
1. ✅ Estructura documentada
2. ✅ Branch única (main)
3. ⏳ Ejecutar E2E tests localmente
4. ⏳ Validar pass rate actual

### Corto Plazo
5. Crear tasks para remote-code (4 fases)
6. Verificar MCPs disponibles
7. Implementar integraciones

---

**Estructura:** ✅ Completa  
**Branch:** ✅ main (única)  
**Docs:** ✅ Actualizadas  
**Next:** Remote-code tasks
