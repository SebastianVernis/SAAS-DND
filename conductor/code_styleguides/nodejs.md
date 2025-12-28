# Node.js Style Guide

## Overview

This guide establishes Node.js and Express coding standards for the SAAS-DND backend API, covering architecture patterns, error handling, security, and best practices.

---

## General Principles

1. **MVC Architecture** - Separate concerns: routes, controllers, services, models
2. **Async/Await** - Use modern async patterns over callbacks
3. **Error Handling** - Centralized error handling with proper logging
4. **Security First** - Always validate input and sanitize output
5. **RESTful APIs** - Follow REST conventions for API design

---

## Project Structure

### Directory Organization

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── stripe.js
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── projectController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/           # Data models (Drizzle schemas)
│   │   ├── user.js
│   │   └── project.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── projects.js
│   ├── services/         # Business logic
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   └── paymentService.js
│   ├── utils/            # Utility functions
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── db/               # Database setup
│   │   └── index.js
│   └── server.js         # Entry point
├── tests/                # Test files
│   ├── unit/
│   └── integration/
├── .env.example          # Environment variables template
├── package.json
└── README.md
```

---

## Naming Conventions

### Files and Directories

```javascript
// ✅ Good - camelCase for files
authController.js
userService.js
emailHelper.js

// ✅ Good - Plural for route files
users.js
projects.js
teams.js

// ❌ Bad
AuthController.js
user-service.js
email_helper.js
```

### Variables and Functions

```javascript
// ✅ Good - camelCase
const userName = 'John';
const isAuthenticated = true;

async function getUserById(id) {
  // implementation
}

const createUser = async (data) => {
  // implementation
};

// ❌ Bad
const UserName = 'John';
const user_name = 'John';
const GetUserById = (id) => {};
```

### Constants

```javascript
// ✅ Good - UPPER_CASE for true constants
const MAX_LOGIN_ATTEMPTS = 5;
const TOKEN_EXPIRY_HOURS = 24;
const API_VERSION = 'v1';

// ✅ Good - camelCase for configuration objects
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'saas_dnd'
};

// ❌ Bad
const maxLoginAttempts = 5; // Should be UPPER_CASE
const DB_CONFIG = {}; // Should be camelCase
```

---

## Server Setup

### Entry Point (server.js)

```javascript
// ✅ Good - Well-structured server setup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

---

## Routes

### Route Definition

```javascript
// ✅ Good - Clean route definitions
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  validateRequest(createUserSchema),
  userController.register
);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put(
  '/:id',
  validateRequest(updateUserSchema),
  userController.updateUser
);
router.delete('/:id', userController.deleteUser);

export default router;
```

### RESTful Conventions

```javascript
// ✅ Good - Follow REST conventions
GET    /api/users           // Get all users
GET    /api/users/:id       // Get user by ID
POST   /api/users           // Create new user
PUT    /api/users/:id       // Update user (full)
PATCH  /api/users/:id       // Update user (partial)
DELETE /api/users/:id       // Delete user

// Nested resources
GET    /api/users/:id/projects      // Get user's projects
POST   /api/users/:id/projects      // Create project for user

// Actions (when REST doesn't fit)
POST   /api/users/:id/verify        // Verify user
POST   /api/projects/:id/duplicate  // Duplicate project

// ❌ Bad - Non-RESTful routes
GET    /api/getUsers
POST   /api/createUser
GET    /api/user/delete/:id
```

---

## Controllers

### Controller Pattern

```javascript
// ✅ Good - Clean controller with proper error handling
import { userService } from '../services/userService.js';
import { ApiError } from '../utils/errors.js';

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const result = await userService.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.json({
      success: true,
      data: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * @route POST /api/users
 * @access Public
 */
export const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    
    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Authorization check
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw new ApiError('Unauthorized', 403);
    }

    const user = await userService.updateUser(id, updates);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await userService.deleteUser(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## Services

### Service Layer Pattern

```javascript
// ✅ Good - Business logic in service layer
import { db } from '../db/index.js';
import { users } from '../models/user.js';
import { eq, like, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/errors.js';

class UserService {
  /**
   * Get all users with pagination and search
   */
  async getAllUsers({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;

    // Build query
    const conditions = [];
    if (search) {
      conditions.push(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      );
    }

    // Get users
    const userList = await db
      .select()
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      users: userList.map(this.sanitizeUser),
      page,
      limit,
      total: parseInt(count),
      totalPages: Math.ceil(parseInt(count) / limit)
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    // Check if user exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ApiError('Email already in use', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return this.sanitizeUser(user);
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return true;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Remove sensitive fields from user object
   */
  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

export const userService = new UserService();
```

---

## Middleware

### Authentication Middleware

```javascript
// ✅ Good - JWT authentication middleware
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../utils/errors.js';
import { userService } from '../services/userService.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from database
    const user = await userService.getUserById(decoded.userId);
    
    if (!user) {
      throw new ApiError('User not found', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Forbidden', 403));
    }

    next();
  };
};
```

### Validation Middleware

```javascript
// ✅ Good - Zod validation middleware
import { z } from 'zod';
import { ApiError } from '../utils/errors.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        next(new ApiError('Validation failed', 400, errors));
      } else {
        next(error);
      }
    }
  };
};

// Validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'editor', 'viewer']).optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional()
});
```

### Error Handler Middleware

```javascript
// ✅ Good - Centralized error handling
import { config } from '../config/index.js';

export class ApiError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  if (config.env === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.env === 'development' && { stack: err.stack })
  });
};
```

---

## Database

### Drizzle ORM Schema

```javascript
// ✅ Good - Well-defined schema
import { pgTable, uuid, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('viewer'),
  avatar: text('avatar'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  htmlContent: text('html_content'),
  cssContent: text('css_content'),
  jsContent: text('js_content'),
  thumbnail: text('thumbnail'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### Database Connection

```javascript
// ✅ Good - Connection pooling
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './config/index.js';

const client = postgres(config.databaseUrl, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(client);
```

---

## Error Handling

### Try-Catch Pattern

```javascript
// ✅ Good - Proper error handling
export const createProject = async (req, res, next) => {
  try {
    const projectData = req.body;
    const userId = req.user.id;

    const project = await projectService.createProject({
      ...projectData,
      userId
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
};

// ❌ Bad - Swallowing errors
export const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body);
    res.json({ data: project });
  } catch (error) {
    console.log(error); // Don't just log
    res.json({ error: 'Something went wrong' }); // Too vague
  }
};
```

---

## Security Best Practices

### Input Validation

```javascript
// ✅ Good - Always validate and sanitize input
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100)
});

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    // Process login
  } catch (error) {
    next(error);
  }
};
```

### Password Hashing

```javascript
// ✅ Good - Use bcrypt with appropriate rounds
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
```

### SQL Injection Prevention

```javascript
// ✅ Good - Use parameterized queries (Drizzle ORM)
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email)); // Safe

// ❌ Bad - String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`; // Vulnerable!
```

---

## Async/Await Best Practices

```javascript
// ✅ Good - Proper async/await usage
async function processUser(userId) {
  try {
    const user = await getUserById(userId);
    const projects = await getProjectsByUserId(userId);
    const stats = await calculateStats(projects);
    
    return { user, projects, stats };
  } catch (error) {
    console.error('Error processing user:', error);
    throw error;
  }
}

// ✅ Good - Parallel execution when possible
async function getUserData(userId) {
  const [user, projects, teams] = await Promise.all([
    getUserById(userId),
    getProjectsByUserId(userId),
    getTeamsByUserId(userId)
  ]);
  
  return { user, projects, teams };
}

// ❌ Bad - Sequential when parallel is possible
async function getUserData(userId) {
  const user = await getUserById(userId);
  const projects = await getProjectsByUserId(userId); // Could run in parallel
  const teams = await getTeamsByUserId(userId); // Could run in parallel
  
  return { user, projects, teams };
}
```

---

## Environment Variables

```javascript
// ✅ Good - Centralized configuration
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  STRIPE_SECRET_KEY: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string()
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  corsOrigin: env.CORS_ORIGIN,
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY
  },
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
};
```

---

## Testing

### Unit Tests

```javascript
// ✅ Good - Test business logic
import { describe, it, expect, beforeEach } from '@jest/globals';
import { userService } from '../services/userService.js';

describe('UserService', () => {
  beforeEach(async () => {
    // Setup test database
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = await userService.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user).not.toHaveProperty('password'); // Should be sanitized
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      await userService.createUser(userData);

      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Email already in use');
    });
  });
});
```

### Integration Tests

```javascript
// ✅ Good - Test API endpoints
import request from 'supertest';
import app from '../server.js';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should return 401 with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });
});
```

---

## Logging

```javascript
// ✅ Good - Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };

// Usage
logger.info('User logged in', { userId: user.id, email: user.email });
logger.error('Database error', { error: error.message, stack: error.stack });
```

---

## Conclusion

Following these Node.js guidelines ensures:
- Clean, maintainable backend architecture
- Secure API endpoints
- Proper error handling and logging
- Type-safe code with validation
- Scalable and testable codebase

Always prioritize security, error handling, and code organization.
