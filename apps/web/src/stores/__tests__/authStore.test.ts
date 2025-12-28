import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      organization: null,
      subscription: null,
      token: null,
      isAuthenticated: false,
    });
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.organization).toBeNull();
      expect(state.subscription).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('should set authentication data correctly', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'agency',
        },
        subscription: {
          plan: 'pro',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(authData.user);
      expect(state.organization).toEqual(authData.organization);
      expect(state.subscription).toEqual(authData.subscription);
      expect(state.token).toBe(authData.token);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should store token in localStorage', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'test-token-456',
      };

      useAuthStore.getState().setAuth(authData);

      expect(localStorage.getItem('token')).toBe('test-token-456');
    });

    it('should update existing auth data', () => {
      const initialAuth = {
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          emailVerified: true,
        },
        organization: {
          id: 'org-1',
          name: 'Org 1',
          slug: 'org-1',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'token-1',
      };

      const newAuth = {
        user: {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          emailVerified: true,
        },
        organization: {
          id: 'org-2',
          name: 'Org 2',
          slug: 'org-2',
          type: 'agency',
        },
        subscription: {
          plan: 'pro',
          status: 'active',
        },
        token: 'token-2',
      };

      useAuthStore.getState().setAuth(initialAuth);
      useAuthStore.getState().setAuth(newAuth);

      const state = useAuthStore.getState();
      expect(state.user?.id).toBe('user-2');
      expect(state.token).toBe('token-2');
      expect(localStorage.getItem('token')).toBe('token-2');
    });
  });

  describe('clearAuth', () => {
    it('should clear all authentication data', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'pro',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.organization).toBeNull();
      expect(state.subscription).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remove token from localStorage', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      expect(localStorage.getItem('token')).toBe('test-token-123');

      useAuthStore.getState().clearAuth();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should be safe to call when already cleared', () => {
      useAuthStore.getState().clearAuth();
      useAuthStore.getState().clearAuth(); // Call twice

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user data partially', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: false,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      useAuthStore.getState().updateUser({ name: 'Updated Name' });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.email).toBe('test@example.com'); // Unchanged
      expect(state.user?.id).toBe('user-123'); // Unchanged
    });

    it('should update multiple user fields', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: false,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      useAuthStore.getState().updateUser({
        name: 'New Name',
        emailVerified: true,
      });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('New Name');
      expect(state.user?.emailVerified).toBe(true);
    });

    it('should do nothing when user is null', () => {
      useAuthStore.getState().updateUser({ name: 'New Name' });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should not affect other state properties', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'pro',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      useAuthStore.getState().updateUser({ name: 'Updated' });

      const state = useAuthStore.getState();
      expect(state.organization).toEqual(authData.organization);
      expect(state.subscription).toEqual(authData.subscription);
      expect(state.token).toBe(authData.token);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete auth flow: login -> update -> logout', () => {
      // Login
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Update user
      useAuthStore.getState().updateUser({ name: 'Updated Name' });
      expect(useAuthStore.getState().user?.name).toBe('Updated Name');

      // Logout
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should persist state across store instances', () => {
      const authData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
          type: 'personal',
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        token: 'test-token-123',
      };

      useAuthStore.getState().setAuth(authData);

      // Simulate getting state from another component
      const newState = useAuthStore.getState();
      expect(newState.user?.id).toBe('user-123');
      expect(newState.isAuthenticated).toBe(true);
    });
  });
});
