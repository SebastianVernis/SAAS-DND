# TypeScript Style Guide

## Overview

This guide establishes TypeScript coding standards for the SAAS-DND project, covering both frontend (React) and backend (Node.js) code.

---

## General Principles

1. **Type Safety First** - Leverage TypeScript's type system fully
2. **Explicit Over Implicit** - Prefer explicit types over inference when it improves clarity
3. **Consistency** - Follow established patterns throughout the codebase
4. **Readability** - Code is read more than written

---

## TypeScript Configuration

### Compiler Options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Naming Conventions

### Variables and Functions

```typescript
// ✅ Good - camelCase for variables and functions
const userName = 'John';
const isActive = true;
const getUserById = (id: string) => { /* ... */ };

// ❌ Bad
const UserName = 'John';
const user_name = 'John';
const GetUserById = (id: string) => { /* ... */ };
```

### Types and Interfaces

```typescript
// ✅ Good - PascalCase for types and interfaces
interface User {
  id: string;
  name: string;
}

type UserRole = 'admin' | 'editor' | 'viewer';

// ❌ Bad
interface user {
  id: string;
}

type userRole = 'admin' | 'editor';
```

### Enums

```typescript
// ✅ Good - PascalCase for enum name, UPPER_CASE for values
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

// ❌ Bad
enum userStatus {
  active = 'active',
  inactive = 'inactive'
}
```

### Constants

```typescript
// ✅ Good - UPPER_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// ✅ Good - camelCase for configuration objects
const apiConfig = {
  timeout: 5000,
  retries: 3
};

// ❌ Bad - Don't use UPPER_CASE for regular variables
const USER_NAME = 'John'; // This is not a constant
```

### File Names

```typescript
// ✅ Good - camelCase for files
// userService.ts
// authController.ts
// projectStore.ts

// ✅ Good - PascalCase for component files
// UserProfile.tsx
// ProjectCard.tsx
// DashboardLayout.tsx

// ❌ Bad
// user-service.ts
// UserService.ts (for non-component files)
// project_store.ts
```

---

## Type Definitions

### Prefer Interfaces for Objects

```typescript
// ✅ Good - Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ✅ Good - Use type for unions, intersections, primitives
type UserRole = 'admin' | 'editor' | 'viewer';
type ID = string | number;
type UserWithTimestamps = User & {
  createdAt: Date;
  updatedAt: Date;
};

// ❌ Bad - Don't use type for simple object shapes
type User = {
  id: string;
  name: string;
};
```

### Explicit Return Types

```typescript
// ✅ Good - Explicit return types for functions
function getUserById(id: string): User | null {
  // implementation
  return null;
}

const createUser = (data: CreateUserDto): Promise<User> => {
  // implementation
  return Promise.resolve({} as User);
};

// ❌ Bad - Implicit return types (except for simple cases)
function getUserById(id: string) {
  return null; // Type is inferred as null, not User | null
}
```

### Avoid `any`

```typescript
// ✅ Good - Use specific types
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // implementation
  return Promise.resolve({} as ApiResponse<T>);
}

// ✅ Good - Use unknown for truly unknown types
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}

// ❌ Bad - Using any
function fetchData(url: string): Promise<any> {
  // implementation
}
```

### Null and Undefined

```typescript
// ✅ Good - Be explicit about null/undefined
interface User {
  id: string;
  name: string;
  email: string | null; // Can be null
  phone?: string; // Optional (can be undefined)
}

// ✅ Good - Use nullish coalescing
const displayName = user.name ?? 'Anonymous';
const phoneNumber = user.phone ?? 'N/A';

// ✅ Good - Use optional chaining
const userEmail = user?.email?.toLowerCase();

// ❌ Bad - Using || for default values (doesn't handle 0, false, '')
const count = user.count || 0; // Use ?? instead
```

---

## Functions

### Function Declarations vs Arrow Functions

```typescript
// ✅ Good - Use arrow functions for callbacks and short functions
const numbers = [1, 2, 3].map(n => n * 2);

const handleClick = (event: MouseEvent) => {
  console.log(event.target);
};

// ✅ Good - Use function declarations for top-level functions
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good - Use arrow functions for class methods (auto-bind this)
class UserService {
  private users: User[] = [];

  getUser = (id: string): User | undefined => {
    return this.users.find(u => u.id === id);
  };
}
```

### Parameter Types

```typescript
// ✅ Good - Explicit parameter types
function createUser(
  name: string,
  email: string,
  role: UserRole = 'viewer'
): User {
  // implementation
  return {} as User;
}

// ✅ Good - Use object parameter for multiple params
interface CreateUserParams {
  name: string;
  email: string;
  role?: UserRole;
  metadata?: Record<string, unknown>;
}

function createUser(params: CreateUserParams): User {
  // implementation
  return {} as User;
}

// ❌ Bad - Too many parameters
function createUser(
  name: string,
  email: string,
  role: string,
  age: number,
  country: string,
  phone: string
): User {
  // Use object parameter instead
  return {} as User;
}
```

### Async/Await

```typescript
// ✅ Good - Use async/await for promises
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// ✅ Good - Handle errors properly
async function saveUser(user: User): Promise<void> {
  try {
    await api.post('/users', user);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}

// ❌ Bad - Using .then() chains (prefer async/await)
function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(data => data);
}
```

---

## Classes

### Class Structure

```typescript
// ✅ Good - Organized class structure
class UserService {
  // 1. Static properties
  private static instance: UserService;

  // 2. Instance properties
  private users: Map<string, User>;
  private readonly apiUrl: string;

  // 3. Constructor
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    this.users = new Map();
  }

  // 4. Static methods
  static getInstance(apiUrl: string): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(apiUrl);
    }
    return UserService.instance;
  }

  // 5. Public methods
  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const user = this.validateAndTransform(data);
    this.users.set(user.id, user);
    return user;
  }

  // 6. Private methods
  private validateAndTransform(data: CreateUserDto): User {
    // implementation
    return {} as User;
  }
}
```

### Access Modifiers

```typescript
// ✅ Good - Use appropriate access modifiers
class BankAccount {
  private balance: number; // Only accessible within class
  protected accountNumber: string; // Accessible in subclasses
  public owner: string; // Accessible everywhere

  constructor(owner: string, accountNumber: string) {
    this.owner = owner;
    this.accountNumber = accountNumber;
    this.balance = 0;
  }

  public deposit(amount: number): void {
    this.balance += amount;
  }

  protected getBalance(): number {
    return this.balance;
  }
}

// ❌ Bad - Everything public by default
class BankAccount {
  balance: number;
  accountNumber: string;
  owner: string;
}
```

---

## Generics

### Generic Functions

```typescript
// ✅ Good - Use generics for reusable functions
function first<T>(array: T[]): T | undefined {
  return array[0];
}

const firstNumber = first([1, 2, 3]); // Type: number | undefined
const firstString = first(['a', 'b']); // Type: string | undefined

// ✅ Good - Constrained generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
const name = getProperty(user, 'name'); // Type: string
const age = getProperty(user, 'age'); // Type: number
```

### Generic Interfaces

```typescript
// ✅ Good - Generic interfaces for data structures
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
}

// Usage
const userResponse: ApiResponse<User> = {
  data: { id: '1', name: 'John', email: 'john@example.com', role: 'admin' },
  status: 200,
  message: 'Success'
};

const usersResponse: PaginatedResponse<User> = {
  data: [],
  status: 200,
  message: 'Success',
  page: 1,
  totalPages: 10,
  totalItems: 100
};
```

---

## Type Guards

### Custom Type Guards

```typescript
// ✅ Good - Use type guards for runtime type checking
interface User {
  type: 'user';
  id: string;
  name: string;
}

interface Admin {
  type: 'admin';
  id: string;
  name: string;
  permissions: string[];
}

type Account = User | Admin;

// Type guard function
function isAdmin(account: Account): account is Admin {
  return account.type === 'admin';
}

// Usage
function getPermissions(account: Account): string[] {
  if (isAdmin(account)) {
    return account.permissions; // TypeScript knows this is Admin
  }
  return [];
}

// ✅ Good - Use discriminated unions
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>): void {
  if (result.success) {
    console.log(result.data); // TypeScript knows data exists
  } else {
    console.error(result.error); // TypeScript knows error exists
  }
}
```

---

## Utility Types

### Built-in Utility Types

```typescript
// ✅ Good - Use TypeScript utility types

// Partial - Make all properties optional
type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; role?: UserRole; }

// Required - Make all properties required
type RequiredUser = Required<PartialUser>;

// Pick - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: string; name: string; }

// Omit - Exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;
// { id: string; name: string; role: UserRole; }

// Record - Create object type with specific keys
type UserRoles = Record<string, UserRole>;
// { [key: string]: UserRole; }

// ReturnType - Extract return type of function
type UserServiceReturn = ReturnType<typeof getUserById>;
```

### Custom Utility Types

```typescript
// ✅ Good - Create custom utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};
```

---

## Error Handling

### Custom Error Classes

```typescript
// ✅ Good - Create custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Usage
async function createUser(data: CreateUserDto): Promise<User> {
  if (!data.email) {
    throw new ValidationError('Validation failed', {
      email: 'Email is required'
    });
  }

  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new ApiError('Failed to create user', response.status);
  }

  return response.json();
}
```

### Error Handling Patterns

```typescript
// ✅ Good - Type-safe error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new ApiError('User not found', response.status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error ${error.statusCode}:`, error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
```

---

## Best Practices

### 1. Avoid Type Assertions

```typescript
// ✅ Good - Use type guards
function processValue(value: unknown): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  }
}

// ❌ Bad - Using type assertions
function processValue(value: unknown): void {
  console.log((value as string).toUpperCase());
}
```

### 2. Use Const Assertions

```typescript
// ✅ Good - Use const assertions for literal types
const colors = ['red', 'green', 'blue'] as const;
type Color = typeof colors[number]; // 'red' | 'green' | 'blue'

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;
// All properties are readonly and have literal types
```

### 3. Prefer Union Types Over Enums

```typescript
// ✅ Good - Union types (more flexible)
type UserRole = 'admin' | 'editor' | 'viewer';

const roles: UserRole[] = ['admin', 'editor', 'viewer'];

// ✅ Also Good - Enums when you need reverse mapping
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

const status: HttpStatus = HttpStatus.OK;
const statusName = HttpStatus[200]; // 'OK'
```

### 4. Use Template Literal Types

```typescript
// ✅ Good - Template literal types for string patterns
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/${string}`;
type ApiRoute = `${HttpMethod} ${ApiEndpoint}`;
// 'GET /api/users' | 'POST /api/users' | etc.
```

### 5. Immutability

```typescript
// ✅ Good - Use readonly for immutable data
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly retries: number;
}

// ✅ Good - Use ReadonlyArray
function processItems(items: ReadonlyArray<string>): void {
  // items.push('new'); // Error: push doesn't exist on ReadonlyArray
  const newItems = [...items, 'new']; // Create new array instead
}

// ✅ Good - Use const for variables that won't be reassigned
const user = { name: 'John' };
// user = { name: 'Jane' }; // Error
user.name = 'Jane'; // OK (object is mutable)
```

---

## Documentation

### JSDoc Comments

```typescript
/**
 * Fetches a user by their ID from the API
 * 
 * @param id - The unique identifier of the user
 * @returns A promise that resolves to the user object
 * @throws {ApiError} When the API request fails
 * @throws {ValidationError} When the ID is invalid
 * 
 * @example
 * ```typescript
 * const user = await getUserById('123');
 * console.log(user.name);
 * ```
 */
async function getUserById(id: string): Promise<User> {
  // implementation
  return {} as User;
}

/**
 * Represents a user in the system
 */
interface User {
  /** Unique identifier */
  id: string;
  
  /** Full name of the user */
  name: string;
  
  /** Email address (nullable if not verified) */
  email: string | null;
  
  /** User's role in the system */
  role: UserRole;
}
```

---

## Conclusion

Following these TypeScript guidelines ensures:
- Type safety and fewer runtime errors
- Better IDE support and autocomplete
- Easier refactoring and maintenance
- Consistent code across the project
- Self-documenting code through types

Always prioritize type safety and clarity over brevity.
