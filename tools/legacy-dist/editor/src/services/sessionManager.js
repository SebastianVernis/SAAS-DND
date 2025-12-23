/**
 * Session Manager
 *
 * Manages user session state and provides reactive updates
 */

import authService from './authService.js';

/**
 * Session Manager Class
 */
class SessionManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.isAuthenticated = false;
    this.listeners = new Set();
    this.refreshInterval = null;
    this.refreshIntervalTime = 5 * 60 * 1000; // 5 minutes

    // Subscribe to auth service
    authService.subscribe((event, data) => {
      this.handleAuthEvent(event, data);
    });

    // Initialize
    this.initialize();
  }

  /**
   * Initialize session manager
   */
  async initialize() {
    await this.refreshSession();

    // Start refresh interval
    this.startRefreshInterval();
  }

  /**
   * Handle auth events
   */
  handleAuthEvent(event, data) {
    switch (event) {
      case 'login':
      case 'session-update':
        this.user = data.user;
        this.session = data.session;
        this.isAuthenticated = !!(data.user && data.session);
        this.notifyListeners();
        break;

      case 'logout':
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;
        this.notifyListeners();
        break;
    }
  }

  /**
   * Refresh session from server
   */
  async refreshSession() {
    try {
      const session = await authService.getSession();

      if (session) {
        this.user = session.user;
        this.session = session.session;
        this.isAuthenticated = true;
      } else {
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;
      }

      this.notifyListeners();

      return session;
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
    }
  }

  /**
   * Start automatic session refresh
   */
  startRefreshInterval() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      if (this.isAuthenticated) {
        this.refreshSession();
      }
    }, this.refreshIntervalTime);
  }

  /**
   * Stop automatic session refresh
   */
  stopRefreshInterval() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current session
   */
  getSession() {
    return this.session;
  }

  /**
   * Check if authenticated
   */
  isAuth() {
    return this.isAuthenticated;
  }

  /**
   * Subscribe to session changes
   */
  subscribe(callback) {
    this.listeners.add(callback);

    // Call immediately with current state
    callback({
      user: this.user,
      session: this.session,
      isAuthenticated: this.isAuthenticated,
    });

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const state = {
      user: this.user,
      session: this.session,
      isAuthenticated: this.isAuthenticated,
    };

    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopRefreshInterval();
    this.listeners.clear();
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Export for global access
if (typeof window !== 'undefined') {
  window.sessionManager = sessionManager;
}

export default sessionManager;
