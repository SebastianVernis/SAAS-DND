# React Style Guide

## Overview

This guide establishes React coding standards for the SAAS-DND frontend, covering component patterns, hooks, state management, and best practices for React 19 with TypeScript.

---

## General Principles

1. **Component Composition** - Build complex UIs from simple, reusable components
2. **Single Responsibility** - Each component should do one thing well
3. **Props Over State** - Prefer props for data flow, use state only when necessary
4. **Hooks First** - Use functional components with hooks over class components
5. **Performance Matters** - Optimize re-renders and bundle size

---

## Component Structure

### File Organization

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── dashboard/        # Feature-specific components
│   │   ├── DashboardLayout.tsx
│   │   ├── StatsCard.tsx
│   │   └── RecentProjects.tsx
│   └── __tests__/        # Component tests
├── pages/                # Page components (routes)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── dashboard/
│       └── DashboardPage.tsx
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   └── useProjects.ts
├── stores/               # Zustand stores
│   ├── authStore.ts
│   └── projectStore.ts
├── services/             # API services
│   └── api.ts
├── types/                # TypeScript types
│   └── index.ts
└── utils/                # Utility functions
    └── helpers.ts
```

### Component Template

```typescript
// ✅ Good - Well-structured component
import { useState, useEffect } from 'react';
import type { FC } from 'react';

// 1. Types/Interfaces
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  className?: string;
}

// 2. Component
export const UserCard: FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  className = ''
}) => {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Side effects
  }, []);

  // 4. Event handlers
  const handleEdit = () => {
    onEdit?.(user);
  };

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      onDelete?.(user.id);
    }
  };

  // 5. Render helpers (if needed)
  const renderActions = () => (
    <div className="flex gap-2">
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );

  // 6. Return JSX
  return (
    <div className={`card ${className}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {renderActions()}
    </div>
  );
};

// 7. Display name (for debugging)
UserCard.displayName = 'UserCard';
```

---

## Naming Conventions

### Components

```typescript
// ✅ Good - PascalCase for components
export const UserProfile = () => { /* ... */ };
export const DashboardLayout = () => { /* ... */ };
export const ProjectCard = () => { /* ... */ };

// ❌ Bad
export const userProfile = () => { /* ... */ };
export const dashboard_layout = () => { /* ... */ };
```

### Props

```typescript
// ✅ Good - Descriptive prop names
interface ButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

// ❌ Bad - Vague or abbreviated names
interface ButtonProps {
  click: () => void;
  load?: boolean;
  dis?: boolean;
  type?: string;
}
```

### Event Handlers

```typescript
// ✅ Good - Use handle* for handlers, on* for props
interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const Form: FC<FormProps> = ({ onSubmit, onCancel }) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
  );
};

// ❌ Bad
const Form = ({ submit, cancel }) => {
  const onSubmit = (e) => { /* ... */ };
  const clickCancel = () => { /* ... */ };
};
```

---

## Props and Types

### Props Interface

```typescript
// ✅ Good - Explicit props interface
interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const UserList: FC<UserListProps> = ({
  users,
  onUserSelect,
  isLoading = false,
  emptyMessage = 'No users found',
  className = ''
}) => {
  // implementation
  return null;
};

// ❌ Bad - No types
export const UserList = ({ users, onUserSelect, isLoading }) => {
  // implementation
};
```

### Children Prop

```typescript
// ✅ Good - Explicit children type
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: FC<CardProps> = ({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    <div>{children}</div>
  </div>
);

// ✅ Good - Render prop pattern
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function DataList<T>({ data, renderItem }: DataListProps<T>) {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

### Default Props

```typescript
// ✅ Good - Use default parameters (React 19)
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children
}) => {
  return <button className={`btn-${variant} btn-${size}`}>{children}</button>;
};

// ❌ Bad - Don't use defaultProps (deprecated in React 19)
Button.defaultProps = {
  variant: 'primary',
  size: 'md'
};
```

---

## Hooks

### useState

```typescript
// ✅ Good - Explicit state types
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [errors, setErrors] = useState<Record<string, string>>({});

// ✅ Good - Functional updates for state based on previous state
const [count, setCount] = useState(0);
const increment = () => setCount(prev => prev + 1);

// ❌ Bad - Direct state mutation
const [user, setUser] = useState({ name: 'John' });
user.name = 'Jane'; // Don't mutate state directly
setUser(user); // This won't trigger re-render

// ✅ Good - Create new object
setUser({ ...user, name: 'Jane' });
```

### useEffect

```typescript
// ✅ Good - Clear dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]); // Re-run when userId changes

// ✅ Good - Cleanup function
useEffect(() => {
  const subscription = subscribeToUpdates();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// ✅ Good - Separate effects for different concerns
useEffect(() => {
  // Fetch user data
  fetchUser(userId);
}, [userId]);

useEffect(() => {
  // Track analytics
  trackPageView();
}, []);

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchUser(userId);
}, []); // userId is missing from dependencies

// ❌ Bad - Too many dependencies
useEffect(() => {
  // This will run on every render
}, [user, projects, teams, settings, config]);
```

### Custom Hooks

```typescript
// ✅ Good - Custom hook for reusable logic
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await loginUser(email, password);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    clearAuthToken();
  };

  return { user, isLoading, login, logout };
}

// Usage
const MyComponent = () => {
  const { user, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Welcome, {user?.name}</div>;
};
```

### useMemo and useCallback

```typescript
// ✅ Good - Memoize expensive calculations
const ExpensiveComponent = ({ data }: { data: number[] }) => {
  const sortedData = useMemo(() => {
    console.log('Sorting data...');
    return [...data].sort((a, b) => a - b);
  }, [data]);

  return <div>{sortedData.join(', ')}</div>;
};

// ✅ Good - Memoize callbacks passed to child components
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []); // No dependencies, function never changes

  return <ChildComponent onClick={handleClick} />;
};

// ❌ Bad - Overusing useMemo/useCallback
const Component = () => {
  // Don't memoize simple calculations
  const doubled = useMemo(() => count * 2, [count]); // Unnecessary
  
  // Just do this:
  const doubled = count * 2;
};
```

### useRef

```typescript
// ✅ Good - DOM references
const InputComponent = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus</button>
    </>
  );
};

// ✅ Good - Storing mutable values
const Timer = () => {
  const intervalRef = useRef<number | null>(null);
  const [count, setCount] = useState(0);

  const startTimer = () => {
    intervalRef.current = window.setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => stopTimer(); // Cleanup
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
};
```

---

## Component Patterns

### Composition

```typescript
// ✅ Good - Composition over configuration
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="card">{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="card-header">{children}</div>
);

const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>

// ❌ Bad - Too many props
<Card 
  title="Title"
  content="Content"
  showHeader={true}
  headerClassName="custom"
  bodyClassName="custom"
/>
```

### Compound Components

```typescript
// ✅ Good - Compound component pattern
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

const TabList = ({ children }: { children: React.ReactNode }) => (
  <div className="tab-list">{children}</div>
);

const Tab = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

const TabPanel = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  const { activeTab } = context;

  return activeTab === id ? <div className="tab-panel">{children}</div> : null;
};

// Usage
<Tabs>
  <TabList>
    <Tab id="tab1">Tab 1</Tab>
    <Tab id="tab2">Tab 2</Tab>
  </TabList>
  <TabPanel id="tab1">Content 1</TabPanel>
  <TabPanel id="tab2">Content 2</TabPanel>
</Tabs>
```

### Render Props

```typescript
// ✅ Good - Render props for flexible rendering
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => React.ReactNode;
}

const MouseTracker: FC<MouseTrackerProps> = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{render(position)}</>;
};

// Usage
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse position: {x}, {y}</div>
  )}
/>
```

### Higher-Order Components (HOC)

```typescript
// ✅ Good - HOC for cross-cutting concerns
function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    return <Component {...props} />;
  };
}

// Usage
const ProtectedPage = withAuth(DashboardPage);
```

---

## State Management

### Local State

```typescript
// ✅ Good - Use local state for component-specific data
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### Zustand Store

```typescript
// ✅ Good - Zustand for global state
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

// Usage in component
const MyComponent = () => {
  const { user, login, logout } = useAuthStore();
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(userData, token)}>Login</button>
      )}
    </div>
  );
};
```

### Context API

```typescript
// ✅ Good - Context for theme, localization, etc.
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

---

## Performance Optimization

### React.memo

```typescript
// ✅ Good - Memoize expensive components
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  console.log('Rendering UserCard for', user.name);
  
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user)}>Edit</button>
    </div>
  );
});

// Custom comparison function
export const UserCard = React.memo<UserCardProps>(
  ({ user, onEdit }) => {
    // component implementation
    return null;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### Code Splitting

```typescript
// ✅ Good - Lazy load routes
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
    </Routes>
  </Suspense>
);
```

### Virtualization

```typescript
// ✅ Good - Virtualize long lists (use react-window or similar)
import { FixedSizeList } from 'react-window';

const VirtualizedList = ({ items }: { items: string[] }) => (
  <FixedSizeList
    height={600}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </FixedSizeList>
);
```

---

## Forms

### Controlled Components

```typescript
// ✅ Good - Controlled form inputs
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    try {
      await login(email, password);
    } catch (error) {
      setErrors({ form: 'Login failed' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <span className="error">{errors.password}</span>}
      
      {errors.form && <div className="error">{errors.form}</div>}
      
      <button type="submit">Login</button>
    </form>
  );
};
```

---

## Testing

### Component Tests

```typescript
// ✅ Good - Test user interactions
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count when button is clicked', () => {
    render(<Counter />);
    
    const button = screen.getByText('Increment');
    const count = screen.getByText(/Count: 0/);
    
    expect(count).toBeInTheDocument();
    
    fireEvent.click(button);
    
    expect(screen.getByText(/Count: 1/)).toBeInTheDocument();
  });
});
```

---

## Best Practices

### 1. Keep Components Small

```typescript
// ✅ Good - Small, focused components
const UserAvatar = ({ user }: { user: User }) => (
  <img src={user.avatar} alt={user.name} className="avatar" />
);

const UserName = ({ user }: { user: User }) => (
  <span className="user-name">{user.name}</span>
);

const UserCard = ({ user }: { user: User }) => (
  <div className="user-card">
    <UserAvatar user={user} />
    <UserName user={user} />
  </div>
);

// ❌ Bad - Monolithic component
const UserCard = ({ user }) => {
  // 200+ lines of JSX
};
```

### 2. Avoid Prop Drilling

```typescript
// ✅ Good - Use context or state management
const App = () => {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
};

const Dashboard = () => {
  const { user } = useAuth(); // No prop drilling
  return <div>Welcome, {user.name}</div>;
};

// ❌ Bad - Prop drilling through many levels
<App user={user}>
  <Layout user={user}>
    <Dashboard user={user}>
      <Header user={user} />
    </Dashboard>
  </Layout>
</App>
```

### 3. Use Fragments

```typescript
// ✅ Good - Use fragments to avoid extra DOM nodes
const Component = () => (
  <>
    <Header />
    <Main />
    <Footer />
  </>
);

// ❌ Bad - Unnecessary wrapper div
const Component = () => (
  <div>
    <Header />
    <Main />
    <Footer />
  </div>
);
```

### 4. Key Prop in Lists

```typescript
// ✅ Good - Use stable, unique keys
const UserList = ({ users }: { users: User[] }) => (
  <ul>
    {users.map(user => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);

// ❌ Bad - Using index as key (can cause issues)
const UserList = ({ users }) => (
  <ul>
    {users.map((user, index) => (
      <li key={index}>{user.name}</li>
    ))}
  </ul>
);
```

---

## Conclusion

Following these React guidelines ensures:
- Maintainable and scalable component architecture
- Optimal performance and user experience
- Type-safe components with TypeScript
- Consistent patterns across the codebase
- Easier testing and debugging

Always prioritize component composition, type safety, and performance optimization.
