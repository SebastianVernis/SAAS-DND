# Technology Stack: SAAS-DND

## Overview

This document provides a comprehensive overview of the technology stack used in SAAS-DND, including architectural decisions, frameworks, libraries, tools, and infrastructure components.

---

## Architecture

### Monorepo Structure

**Tool:** Turborepo

**Rationale:**
- Unified codebase for frontend and backend
- Shared configuration and dependencies
- Efficient build caching and parallelization
- Simplified dependency management
- Consistent tooling across projects

**Structure:**
```
SAAS-DND/
├── apps/
│   └── web/          # Frontend React application
├── backend/          # Backend API server
├── packages/         # Shared packages (if any)
└── infrastructure/   # Docker, deployment configs
```

### Package Manager

**Tool:** pnpm 8.15.0+

**Rationale:**
- Faster installation than npm/yarn
- Efficient disk space usage (content-addressable storage)
- Strict dependency resolution
- Native monorepo support
- Better security with isolated node_modules

---

## Frontend Stack

### Core Framework

**React 19.2.0**

**Why React 19:**
- Latest features and performance improvements
- Improved concurrent rendering
- Better TypeScript support
- Server Components support (future-ready)
- Large ecosystem and community

**TypeScript 5.9.3**

**Why TypeScript:**
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring
- Industry standard for large applications

### Build Tool

**Vite 7.2.4**

**Why Vite:**
- Lightning-fast HMR (Hot Module Replacement)
- Native ES modules support
- Optimized production builds
- Plugin ecosystem
- Better developer experience than Webpack

**Configuration:**
- React plugin for JSX/TSX support
- Path aliases for clean imports
- Environment variable handling
- Production optimizations (minification, tree-shaking)

### Styling

**TailwindCSS 3.4.19**

**Why Tailwind:**
- Utility-first approach for rapid development
- Consistent design system
- Minimal CSS bundle size (purged unused styles)
- Responsive design utilities
- Dark mode support built-in

**PostCSS 8.5.6 + Autoprefixer 10.4.22**

**Purpose:**
- CSS processing and optimization
- Automatic vendor prefixing
- Future CSS features support

### Routing

**React Router DOM 7.10.1**

**Why React Router:**
- Industry standard for React routing
- Declarative routing
- Nested routes support
- Code splitting integration
- Type-safe routes with TypeScript

**Routes:**
- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registration
- `/auth/verify` - OTP verification
- `/onboarding` - Multi-step onboarding
- `/dashboard` - Main dashboard
- `/editor/:projectId` - Visual editor
- `/projects` - Project management
- `/team` - Team management
- `/settings` - User settings

### State Management

**Zustand 5.0.9**

**Why Zustand:**
- Lightweight (< 1KB)
- Simple API, minimal boilerplate
- No Provider wrapper needed
- TypeScript-first design
- DevTools support
- Better performance than Context API for global state

**Stores:**
- `authStore` - Authentication state
- `projectStore` - Project data
- `editorStore` - Editor state
- `teamStore` - Team management
- `uiStore` - UI state (modals, toasts)

### HTTP Client

**Axios 1.13.2**

**Why Axios:**
- Interceptors for auth tokens
- Request/response transformation
- Automatic JSON handling
- Better error handling than fetch
- Request cancellation support

**Configuration:**
- Base URL from environment variables
- JWT token injection via interceptors
- Error handling and retry logic
- Request/response logging (dev mode)

### UI Components

**Headless UI 2.2.9**

**Why Headless UI:**
- Unstyled, accessible components
- Perfect for Tailwind integration
- WAI-ARIA compliant
- Keyboard navigation built-in
- Maintained by Tailwind team

**Components Used:**
- Dialog (modals)
- Menu (dropdowns)
- Listbox (select inputs)
- Transition (animations)
- Tab (tabbed interfaces)

**Heroicons 2.2.0**

**Why Heroicons:**
- Designed for Tailwind
- Outline and solid variants
- Consistent design language
- SVG-based (scalable, customizable)
- MIT licensed

---

## Backend Stack

### Runtime & Framework

**Node.js 18.0.0+**

**Why Node.js:**
- JavaScript/TypeScript across full stack
- Large ecosystem (npm)
- Excellent performance for I/O operations
- Non-blocking, event-driven architecture
- Strong community support

**Express 4.21.2**

**Why Express:**
- Minimalist, unopinionated framework
- Extensive middleware ecosystem
- Easy to understand and maintain
- Battle-tested in production
- Flexible routing

**Architecture Pattern:** MVC (Model-View-Controller)

```
backend/src/
├── controllers/    # Request handlers
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── middleware/     # Custom middleware
├── config/         # Configuration
├── db/             # Database setup
└── utils/          # Utilities
```

### Database

**PostgreSQL 14+**

**Why PostgreSQL:**
- ACID compliance
- Advanced features (JSON, full-text search)
- Excellent performance
- Strong data integrity
- Open source, mature

**Drizzle ORM 0.36.4**

**Why Drizzle:**
- TypeScript-first ORM
- Type-safe queries
- Lightweight (no runtime overhead)
- SQL-like syntax
- Excellent migration system
- Better performance than Prisma

**Drizzle Kit 0.28.1**

**Purpose:**
- Schema migrations
- Database introspection
- Studio UI for database management

**Schema Design:**
- `users` - User accounts
- `projects` - Website projects
- `teams` - Team/organization data
- `team_members` - Team membership
- `subscriptions` - Payment subscriptions
- `otp_codes` - Email verification codes
- `sessions` - User sessions

### Authentication

**Better Auth 1.0.7**

**Why Better Auth:**
- Modern authentication library
- Multiple auth strategies
- Session management
- TypeScript support
- Extensible architecture

**JWT (jsonwebtoken 9.0.2)**

**Why JWT:**
- Stateless authentication
- Scalable across multiple servers
- Contains user claims
- Industry standard

**bcryptjs 2.4.3**

**Why bcrypt:**
- Secure password hashing
- Adaptive hashing (configurable rounds)
- Salt generation built-in
- Resistant to rainbow table attacks

**Authentication Flow:**
1. User registers → Password hashed with bcrypt
2. OTP sent via email → Stored in database with expiry
3. User verifies OTP → JWT token issued
4. Token stored in localStorage → Sent in Authorization header
5. Backend validates JWT → User authenticated

### Real-time Communication

**Socket.io 4.8.1**

**Why Socket.io:**
- WebSocket with fallbacks
- Room-based communication
- Automatic reconnection
- Event-based API
- Cross-browser support

**Use Cases:**
- Real-time collaborative editing
- Live cursor positions
- User presence indicators
- Instant notifications

**Yjs 13.6.27 + y-websocket 3.0.0**

**Why Yjs:**
- CRDT (Conflict-free Replicated Data Types)
- Automatic conflict resolution
- Offline-first support
- Efficient synchronization
- Perfect for collaborative editing

**Integration:**
- WebSocket provider for real-time sync
- Shared document state across users
- Undo/redo support
- Awareness (cursor positions, selections)

### Payment Processing

**Stripe 14.10.0**

**Why Stripe:**
- Industry-leading payment platform
- Comprehensive API
- Subscription management
- Webhook support
- PCI compliance handled
- Excellent documentation

**Features Used:**
- Customer creation
- Subscription management
- Payment method handling
- Invoice generation
- Webhook events

### Email Service

**Nodemailer 6.9.7**

**Why Nodemailer:**
- Simple API
- Multiple transport options
- HTML email support
- Attachment handling
- Template integration

**Use Cases:**
- OTP verification emails
- Team invitations
- Password reset
- Subscription notifications
- Welcome emails

### Caching

**Redis 5.10.0**

**Why Redis:**
- In-memory data store (extremely fast)
- Key-value storage
- TTL (Time To Live) support
- Pub/Sub capabilities
- Session storage

**Use Cases:**
- Session management
- OTP code storage (with expiry)
- Rate limiting data
- Temporary data caching
- Real-time features

### Security

**Helmet 8.0.0**

**Why Helmet:**
- Sets secure HTTP headers
- XSS protection
- Content Security Policy
- Clickjacking prevention
- MIME type sniffing prevention

**CORS (cors 2.8.5)**

**Why CORS:**
- Cross-origin request handling
- Configurable origins
- Credential support
- Preflight request handling

**express-rate-limit 7.5.0**

**Why Rate Limiting:**
- Prevent brute force attacks
- API abuse prevention
- DDoS mitigation
- Per-endpoint configuration

### Validation

**Zod 3.23.8**

**Why Zod:**
- TypeScript-first validation
- Type inference
- Composable schemas
- Excellent error messages
- Runtime type checking

**Usage:**
- Request body validation
- Environment variable validation
- API response validation
- Form validation schemas

---

## Testing Stack

### Frontend Testing

**Vitest 4.0.15**

**Why Vitest:**
- Vite-native (same config)
- Extremely fast
- Jest-compatible API
- ESM support
- TypeScript support

**@testing-library/react 16.3.0**

**Why Testing Library:**
- User-centric testing
- Encourages accessibility
- Simple API
- No implementation details

**@testing-library/user-event 14.6.1**

**Purpose:**
- Realistic user interactions
- Keyboard, mouse, clipboard events
- Async interaction handling

**jsdom 27.3.0**

**Purpose:**
- DOM implementation for Node.js
- Browser environment simulation

### E2E Testing

**Playwright 1.57.0**

**Why Playwright:**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-wait for elements
- Network interception
- Screenshot/video recording
- Parallel test execution
- Excellent debugging tools

**Test Coverage:**
- 110 E2E tests
- Authentication flows
- Onboarding process
- Project CRUD operations
- Team management
- Editor functionality

### Backend Testing

**Jest 29.7.0**

**Why Jest:**
- Comprehensive testing framework
- Snapshot testing
- Mocking capabilities
- Code coverage reports
- Parallel test execution

**Supertest 7.1.4**

**Why Supertest:**
- HTTP assertion library
- Express integration
- Fluent API
- Request/response testing

**Test Coverage:**
- 93 backend tests
- API endpoint testing
- Authentication logic
- Database operations
- Service layer testing

---

## Code Quality Tools

### Linting

**ESLint 8.56.0**

**Configuration:**
- TypeScript parser
- React plugin
- React Hooks plugin
- Prettier integration

**Rules:**
- Enforce TypeScript best practices
- React Hooks rules
- Import order
- Unused variables detection

### Formatting

**Prettier 3.1.1**

**Configuration:**
- Single quotes
- 2-space indentation
- Trailing commas
- Semicolons
- Line width: 100

**Integration:**
- Pre-commit hooks via Husky
- Editor integration
- CI/CD checks

### Type Checking

**TypeScript 5.9.3**

**Configuration:**
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals/parameters
- ES2022 target

### Git Hooks

**Husky 8.0.3**

**Hooks:**
- `pre-commit`: Lint staged files
- `pre-push`: Run tests

**lint-staged 15.2.0**

**Purpose:**
- Run linters on staged files only
- Faster pre-commit checks
- Auto-fix when possible

---

## DevOps & Infrastructure

### Containerization

**Docker**

**Containers:**
- Frontend (Nginx + static files)
- Backend (Node.js)
- PostgreSQL
- Redis

**docker-compose.yml**

**Purpose:**
- Local development environment
- Service orchestration
- Network configuration
- Volume management

### Web Server

**Nginx**

**Purpose:**
- Reverse proxy
- Static file serving
- Load balancing
- SSL termination
- Gzip compression

### CI/CD

**GitHub Actions**

**Workflows:**
- Lint and type-check on PR
- Run tests on PR
- Build verification
- Deployment automation

### Deployment

**Current:** Self-hosted (AWS EC2)

**URL:** http://18.223.32.141

**Future Considerations:**
- Vercel (frontend)
- Railway/Render (backend)
- AWS RDS (PostgreSQL)
- Redis Cloud (Redis)

---

## Development Tools

### Version Control

**Git**

**Branching Strategy:**
- `main` - Production
- `develop` - Development
- Feature branches: `feature/feature-name`
- Bugfix branches: `bugfix/bug-name`

### Package Management

**pnpm 8.15.0**

**Workspaces:**
- Root workspace
- apps/web workspace
- backend workspace

### Environment Management

**dotenv 16.4.5**

**Environment Files:**
- `.env.example` - Template
- `.env` - Local development (gitignored)
- `.env.production` - Production (secure storage)

**Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Token signing key
- `STRIPE_SECRET_KEY` - Stripe API key
- `SMTP_*` - Email configuration
- `VITE_API_URL` - Backend API URL

### Monitoring & Logging

**Current:** Console logging

**Future:**
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (APM)
- Prometheus + Grafana (metrics)

---

## Third-Party Services

### Payment

**Stripe**
- Payment processing
- Subscription management
- Webhook handling

### Email

**SMTP Provider** (Configurable)
- Nodemailer transport
- OTP delivery
- Transactional emails

### Storage

**Current:** Local filesystem

**Future:**
- AWS S3 (project assets)
- Cloudinary (image optimization)

---

## Performance Optimization

### Frontend

**Code Splitting**
- Route-based splitting
- Dynamic imports
- Lazy loading components

**Asset Optimization**
- Image lazy loading
- WebP format
- SVG optimization
- Font subsetting

**Caching**
- Service Worker (future)
- Browser caching headers
- CDN integration (future)

### Backend

**Database Optimization**
- Connection pooling
- Query optimization
- Indexes on frequently queried fields
- Pagination for large datasets

**Caching Strategy**
- Redis for session data
- In-memory caching for static data
- Cache invalidation on updates

**API Optimization**
- Response compression (gzip)
- Rate limiting
- Request batching (future)

---

## Security Measures

### Authentication & Authorization

- JWT with expiration
- Refresh token rotation
- Role-based access control (RBAC)
- Session management

### Data Protection

- Password hashing (bcrypt)
- SQL injection prevention (ORM)
- XSS prevention (sanitization)
- CSRF protection

### Network Security

- HTTPS enforcement
- CORS configuration
- Rate limiting
- Helmet security headers

### Compliance

- GDPR considerations
- Data encryption at rest (future)
- Audit logging (future)
- Privacy policy implementation

---

## Scalability Considerations

### Horizontal Scaling

- Stateless backend (JWT)
- Redis for shared session storage
- Load balancer ready
- Database read replicas (future)

### Vertical Scaling

- Optimized queries
- Connection pooling
- Efficient algorithms
- Memory management

### Microservices (Future)

- Auth service
- Project service
- Payment service
- Notification service

---

## Dependencies Summary

### Frontend Core
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.10.1",
  "typescript": "~5.9.3",
  "vite": "^7.2.4"
}
```

### Frontend UI
```json
{
  "@headlessui/react": "^2.2.9",
  "@heroicons/react": "^2.2.0",
  "tailwindcss": "^3.4.19",
  "zustand": "^5.0.9",
  "axios": "^1.13.2"
}
```

### Backend Core
```json
{
  "express": "^4.21.2",
  "drizzle-orm": "^0.36.4",
  "postgres": "^3.4.5",
  "better-auth": "^1.0.7",
  "jsonwebtoken": "^9.0.2"
}
```

### Backend Services
```json
{
  "socket.io": "^4.8.1",
  "yjs": "^13.6.27",
  "stripe": "^14.10.0",
  "redis": "^5.10.0",
  "nodemailer": "^6.9.7"
}
```

### Testing
```json
{
  "vitest": "^4.0.15",
  "@playwright/test": "^1.57.0",
  "jest": "^29.7.0",
  "@testing-library/react": "^16.3.0"
}
```

---

## Technology Decision Matrix

| Category | Technology | Alternatives Considered | Decision Rationale |
|----------|-----------|------------------------|-------------------|
| Frontend Framework | React 19 | Vue, Svelte, Angular | Ecosystem, team expertise, job market |
| Build Tool | Vite | Webpack, Parcel | Speed, DX, modern features |
| Styling | TailwindCSS | CSS Modules, Styled Components | Rapid development, consistency |
| State Management | Zustand | Redux, MobX, Jotai | Simplicity, performance, bundle size |
| Backend Framework | Express | Fastify, Koa, NestJS | Simplicity, ecosystem, flexibility |
| Database | PostgreSQL | MySQL, MongoDB | Features, reliability, ACID |
| ORM | Drizzle | Prisma, TypeORM | Performance, type safety, lightweight |
| Auth | Better Auth + JWT | Auth0, Clerk, Supabase Auth | Control, cost, customization |
| Real-time | Socket.io + Yjs | WebRTC, Firebase | Reliability, CRDT support |
| Testing | Vitest + Playwright | Jest + Cypress | Speed, modern, Vite integration |

---

## Conclusion

The SAAS-DND technology stack is carefully chosen to balance:
- **Developer Experience:** Modern tools with excellent DX
- **Performance:** Fast builds, runtime efficiency
- **Scalability:** Ready for growth
- **Maintainability:** Type safety, testing, clear architecture
- **Cost:** Open source where possible, efficient resource usage

This stack provides a solid foundation for a production-ready SaaS application while remaining flexible for future enhancements and scaling needs.
