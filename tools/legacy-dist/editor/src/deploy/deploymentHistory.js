/**
 * DeploymentHistory - Manages deployment history
 * Stores and retrieves deployment records from localStorage
 */

export class DeploymentHistory {
  constructor() {
    this.storageKey = 'dragndrop_deployment_history';
    this.maxHistoryItems = 50;
  }

  /**
   * Add deployment to history
   * @param {Object} deployment - Deployment data
   * @returns {Object} Added deployment with ID
   */
  addDeployment(deployment) {
    const history = this.getHistory();

    const record = {
      id: this.generateId(),
      timestamp: Date.now(),
      projectName: deployment.projectName,
      url: deployment.url,
      deploymentId: deployment.deploymentId,
      status: deployment.status || 'READY',
      duration: deployment.duration || 0,
      filesCount: deployment.filesCount || 0,
      size: deployment.size || 0,
      ...deployment,
    };

    history.unshift(record);

    // Keep only max items
    if (history.length > this.maxHistoryItems) {
      history.splice(this.maxHistoryItems);
    }

    this.saveHistory(history);
    return record;
  }

  /**
   * Get all deployment history
   * @returns {Array} Deployment history
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading deployment history:', error);
      return [];
    }
  }

  /**
   * Get deployment by ID
   * @param {string} id - Deployment ID
   * @returns {Object|null} Deployment record
   */
  getDeployment(id) {
    const history = this.getHistory();
    return history.find(d => d.id === id || d.deploymentId === id) || null;
  }

  /**
   * Update deployment status
   * @param {string} id - Deployment ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated deployment
   */
  updateDeployment(id, updates) {
    const history = this.getHistory();
    const index = history.findIndex(d => d.id === id || d.deploymentId === id);

    if (index === -1) return null;

    history[index] = {
      ...history[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveHistory(history);
    return history[index];
  }

  /**
   * Delete deployment from history
   * @param {string} id - Deployment ID
   * @returns {boolean} Success status
   */
  deleteDeployment(id) {
    const history = this.getHistory();
    const filtered = history.filter(d => d.id !== id && d.deploymentId !== id);

    if (filtered.length === history.length) return false;

    this.saveHistory(filtered);
    return true;
  }

  /**
   * Clear all history
   */
  clearHistory() {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get recent deployments
   * @param {number} limit - Number of deployments to return
   * @returns {Array} Recent deployments
   */
  getRecent(limit = 10) {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * Get deployments by project name
   * @param {string} projectName - Project name
   * @returns {Array} Matching deployments
   */
  getByProject(projectName) {
    const history = this.getHistory();
    return history.filter(d => d.projectName === projectName);
  }

  /**
   * Get deployment statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const history = this.getHistory();

    if (history.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        avgDuration: 0,
        totalSize: 0,
      };
    }

    const successful = history.filter(d => d.status === 'READY').length;
    const failed = history.filter(d => d.status === 'ERROR').length;
    const totalDuration = history.reduce((sum, d) => sum + (d.duration || 0), 0);
    const totalSize = history.reduce((sum, d) => sum + (d.size || 0), 0);

    return {
      total: history.length,
      successful,
      failed,
      avgDuration: Math.round(totalDuration / history.length),
      totalSize: totalSize / (1024 * 1024), // Convert to MB
      successRate: Math.round((successful / history.length) * 100),
    };
  }

  /**
   * Export history as JSON
   * @returns {string} JSON string
   */
  exportHistory() {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Import history from JSON
   * @param {string} jsonData - JSON string
   * @returns {boolean} Success status
   */
  importHistory(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new Error('Invalid history format');
      }
      this.saveHistory(data);
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  /**
   * Save history to localStorage
   * @param {Array} history - History data
   */
  saveHistory(history) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving deployment history:', error);
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format deployment for display
   * @param {Object} deployment - Deployment record
   * @returns {Object} Formatted deployment
   */
  formatDeployment(deployment) {
    return {
      ...deployment,
      formattedDate: new Date(deployment.timestamp).toLocaleString(),
      formattedDuration: this.formatDuration(deployment.duration),
      formattedSize: this.formatSize(deployment.size),
      statusIcon: this.getStatusIcon(deployment.status),
      statusColor: this.getStatusColor(deployment.status),
    };
  }

  /**
   * Format duration
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  /**
   * Format size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  /**
   * Get status icon
   * @param {string} status - Deployment status
   * @returns {string} Icon
   */
  getStatusIcon(status) {
    const icons = {
      READY: '✅',
      ERROR: '❌',
      BUILDING: '🔨',
      DEPLOYING: '🚀',
      CANCELED: '⛔',
    };
    return icons[status] || '❓';
  }

  /**
   * Get status color
   * @param {string} status - Deployment status
   * @returns {string} Color
   */
  getStatusColor(status) {
    const colors = {
      READY: '#10b981',
      ERROR: '#ef4444',
      BUILDING: '#f59e0b',
      DEPLOYING: '#06b6d4',
      CANCELED: '#6b7280',
    };
    return colors[status] || '#9ca3af';
  }
}

export default DeploymentHistory;
