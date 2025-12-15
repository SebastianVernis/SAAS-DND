/**
 * Cloud Sync Service
 *
 * Manages automatic synchronization of projects to the cloud
 * Features:
 * - Auto-save with debouncing
 * - Conflict resolution
 * - Offline support
 * - Sync status tracking
 */

import apiClient from './apiClient.js';
import authService from './authService.js';

/**
 * Cloud Sync Manager
 */
class CloudSync {
  constructor() {
    this.currentProjectId = null;
    this.isDirty = false;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.autoSaveEnabled = true;
    this.autoSaveDelay = 3000; // 3 seconds
    this.autoSaveTimer = null;
    this.listeners = new Set();
    this.offlineQueue = [];
    this.conflictStrategy = 'server-wins'; // 'server-wins', 'client-wins', 'manual'

    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen to auth events
    authService.subscribe(event => {
      if (event === 'logout') {
        this.reset();
      }
    });
  }

  /**
   * Initialize sync for a project
   */
  async initialize(projectId) {
    this.currentProjectId = projectId;
    this.isDirty = false;
    this.lastSyncTime = null;

    // Load project from cloud
    const result = await this.load(projectId);

    if (result.success) {
      this.notifyListeners('initialized', result.data);
    }

    return result;
  }

  /**
   * Mark project as dirty (needs sync)
   */
  markDirty() {
    if (!authService.isAuthenticated()) {
      console.warn('Cannot sync: User not authenticated');
      return;
    }

    this.isDirty = true;
    this.notifyListeners('dirty');

    // Schedule auto-save
    if (this.autoSaveEnabled) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutoSave() {
    // Clear existing timer
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    // Schedule new save
    this.autoSaveTimer = setTimeout(() => {
      this.save();
    }, this.autoSaveDelay);
  }

  /**
   * Save current project to cloud
   */
  async save(projectData = null) {
    if (!authService.isAuthenticated()) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    if (this.isSyncing) {
      console.warn('Sync already in progress');
      return {
        success: false,
        error: 'Sync in progress',
      };
    }

    try {
      this.isSyncing = true;
      this.notifyListeners('syncing');

      // Get project data if not provided
      if (!projectData) {
        projectData = this.getCurrentProjectData();
      }

      // Check if we're online
      if (!navigator.onLine) {
        this.offlineQueue.push({
          action: 'save',
          projectId: this.currentProjectId,
          data: projectData,
        });

        return {
          success: false,
          error: 'Offline - queued for sync',
          queued: true,
        };
      }

      // Save to API
      let result;
      if (this.currentProjectId) {
        // Update existing project
        result = await apiClient.updateProject(this.currentProjectId, projectData);
      } else {
        // Create new project
        result = await apiClient.createProject(projectData);

        if (result.success) {
          this.currentProjectId = result.data.id;
        }
      }

      if (result.success) {
        this.isDirty = false;
        this.lastSyncTime = new Date();
        this.notifyListeners('synced', result.data);

        // Dispatch global event
        window.dispatchEvent(
          new CustomEvent('sync:complete', {
            detail: result.data,
          })
        );
      } else {
        this.notifyListeners('error', result.error);

        window.dispatchEvent(
          new CustomEvent('sync:error', {
            detail: { error: result.error },
          })
        );
      }

      return result;
    } catch (error) {
      console.error('Save error:', error);
      this.notifyListeners('error', error.message);

      return {
        success: false,
        error: error.message,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Load project from cloud
   */
  async load(projectId) {
    if (!authService.isAuthenticated()) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    try {
      this.notifyListeners('loading');

      const result = await apiClient.getProject(projectId);

      if (result.success) {
        this.currentProjectId = projectId;
        this.isDirty = false;
        this.lastSyncTime = new Date();
        this.notifyListeners('loaded', result.data);
      }

      return result;
    } catch (error) {
      console.error('Load error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sync with conflict resolution
   */
  async sync() {
    if (!this.currentProjectId) {
      return this.save();
    }

    try {
      // Get server version
      const serverResult = await apiClient.getProject(this.currentProjectId);

      if (!serverResult.success) {
        return serverResult;
      }

      const serverData = serverResult.data;
      const localData = this.getCurrentProjectData();

      // Check for conflicts
      const hasConflict = this.detectConflict(serverData, localData);

      if (hasConflict) {
        return this.resolveConflict(serverData, localData);
      }

      // No conflict, just save
      return this.save(localData);
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detect conflicts between server and local data
   */
  detectConflict(serverData, localData) {
    // Check if server version is newer than last sync
    if (!this.lastSyncTime) {
      return false;
    }

    const serverUpdated = new Date(serverData.updatedAt);
    return serverUpdated > this.lastSyncTime;
  }

  /**
   * Resolve conflict based on strategy
   */
  async resolveConflict(serverData, localData) {
    this.notifyListeners('conflict', { serverData, localData });

    window.dispatchEvent(
      new CustomEvent('sync:conflict', {
        detail: { serverData, localData },
      })
    );

    switch (this.conflictStrategy) {
      case 'server-wins':
        // Use server version
        this.applyServerData(serverData);
        return {
          success: true,
          data: serverData,
          resolved: 'server-wins',
        };

      case 'client-wins':
        // Use local version
        return this.save(localData);

      case 'manual':
        // Wait for user decision
        return {
          success: false,
          error: 'Manual conflict resolution required',
          conflict: true,
          serverData,
          localData,
        };

      default:
        return {
          success: false,
          error: 'Unknown conflict strategy',
        };
    }
  }

  /**
   * Apply server data to local state
   */
  applyServerData(serverData) {
    // This should be implemented by the application
    // to update the UI with server data
    this.notifyListeners('server-data-applied', serverData);
  }

  /**
   * Get current project data from the editor
   */
  getCurrentProjectData() {
    // This should be implemented by the application
    // to extract current project state

    // For now, return a placeholder
    return {
      name: 'Untitled Project',
      htmlContent: '',
      cssContent: '',
      jsContent: '',
      metadata: {},
    };
  }

  /**
   * Handle online event
   */
  async handleOnline() {
    console.log('Back online - processing queue');
    this.notifyListeners('online');

    // Process offline queue
    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue.shift();

      if (item.action === 'save') {
        await this.save(item.data);
      }
    }
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('Gone offline');
    this.notifyListeners('offline');
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictStrategy(strategy) {
    this.conflictStrategy = strategy;
  }

  /**
   * Enable/disable auto-save
   */
  setAutoSave(enabled) {
    this.autoSaveEnabled = enabled;
  }

  /**
   * Set auto-save delay
   */
  setAutoSaveDelay(delay) {
    this.autoSaveDelay = delay;
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      projectId: this.currentProjectId,
      isDirty: this.isDirty,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      isOnline: navigator.onLine,
      queueLength: this.offlineQueue.length,
    };
  }

  /**
   * Reset sync state
   */
  reset() {
    this.currentProjectId = null;
    this.isDirty = false;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.offlineQueue = [];

    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Subscribe to sync events
   */
  subscribe(callback) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }
}

// Create singleton instance
const cloudSync = new CloudSync();

// Export for global access
if (typeof window !== 'undefined') {
  window.cloudSync = cloudSync;
}

export default cloudSync;
