/**
 * Authentication Service
 *
 * Frontend client for Better Auth
 * Provides authentication methods and session management
 */

import { createAuthClient } from 'better-auth/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create Better Auth client
export const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: '/api/auth',
});

/**
 * Authentication Service Class
 */
class AuthService {
  constructor() {
    this.user = null;
    this.session = null;
    this.listeners = new Set();
    this.initialized = false;
  }

  /**
   * Initialize auth service and restore session
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.refreshSession();
      this.initialized = true;
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp({ email, password, name }) {
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Sign up failed');
      }

      await this.refreshSession();
      this.notifyListeners('login');

      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Sign in failed');
      }

      await this.refreshSession();
      this.notifyListeners('login');

      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    try {
      const response = await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/auth/callback',
      });

      // This will redirect to Google OAuth
      return {
        success: true,
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with GitHub OAuth
   */
  async signInWithGitHub() {
    try {
      const response = await authClient.signIn.social({
        provider: 'github',
        callbackURL: window.location.origin + '/auth/callback',
      });

      // This will redirect to GitHub OAuth
      return {
        success: true,
      };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await authClient.signOut();

      this.user = null;
      this.session = null;
      this.notifyListeners('logout');

      return {
        success: true,
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const response = await authClient.getSession();

      if (response.data) {
        this.user = response.data.user;
        this.session = response.data.session;
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    const session = await this.getSession();

    if (session) {
      this.notifyListeners('session-update');
    }

    return session;
  }

  /**
   * Update user profile
   */
  async updateUser(data) {
    try {
      const response = await authClient.updateUser(data);

      if (response.error) {
        throw new Error(response.error.message || 'Update failed');
      }

      await this.refreshSession();
      this.notifyListeners('user-update');

      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user && !!this.session;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Subscribe to auth events
   */
  subscribe(callback) {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event, {
          user: this.user,
          session: this.session,
        });
      } catch (error) {
        console.error('Listener error:', error);
      }
    });

    // Dispatch custom events
    window.dispatchEvent(
      new CustomEvent(`auth:${event}`, {
        detail: {
          user: this.user,
          session: this.session,
        },
      })
    );
  }
}

// Create singleton instance
const authService = new AuthService();

// Auto-initialize
authService.initialize();

// Export for global access
if (typeof window !== 'undefined') {
  window.authService = authService;
  window.authClient = authClient;
}

export default authService;
