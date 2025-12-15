/**
 * VercelDeployer - Main Vercel deployment orchestrator
 * Handles the complete deployment flow to Vercel
 */

import { FileUploader } from './fileUploader.js';
import { DeploymentMonitor } from './deploymentMonitor.js';
import { DeploymentHistory } from './deploymentHistory.js';

export class VercelDeployer {
  constructor() {
    this.token = null;
    this.teamId = null;
    this.fileUploader = null;
    this.deploymentMonitor = null;
    this.deploymentHistory = new DeploymentHistory();
    this.baseURL = 'https://api.vercel.com';

    // Load saved token
    this.loadToken();
  }

  /**
   * Connect to Vercel with token
   * @param {string} token - Vercel API token
   * @param {string} teamId - Optional team ID
   */
  connect(token, teamId = null) {
    this.token = token;
    this.teamId = teamId;
    this.fileUploader = new FileUploader(token);
    this.deploymentMonitor = new DeploymentMonitor(token);

    // Save token to localStorage
    this.saveToken();

    this.dispatchEvent('vercel:connected', { token: this.maskToken(token) });
  }

  /**
   * Disconnect from Vercel
   */
  disconnect() {
    this.token = null;
    this.teamId = null;
    this.fileUploader = null;
    this.deploymentMonitor = null;

    localStorage.removeItem('vercel_token');
    localStorage.removeItem('vercel_team_id');

    this.dispatchEvent('vercel:disconnected');
  }

  /**
   * Check if connected to Vercel
   * @returns {boolean} Connection status
   */
  isConnected() {
    return !!this.token;
  }

  /**
   * Deploy project to Vercel
   * @param {string} projectName - Project name
   * @param {Object} projectData - Project data (html, css, js)
   * @param {Object} options - Deployment options
   * @returns {Promise<Object>} Deployment result
   */
  async deploy(projectName, projectData, options = {}) {
    if (!this.isConnected()) {
      throw new Error('Not connected to Vercel. Please connect first.');
    }

    const startTime = Date.now();

    try {
      // Dispatch start event
      this.dispatchEvent('deploy:start', { projectName });

      // Prepare files
      const files = this.fileUploader.prepareFiles(projectData);

      // Validate files
      const validation = this.fileUploader.validateFiles(files);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Deployment warnings:', validation.warnings);
      }

      // Upload files
      this.dispatchEvent('deploy:progress', {
        stage: 'uploading',
        message: 'Subiendo archivos...',
      });

      const uploadedFiles = await this.fileUploader.uploadFiles(files, progress => {
        this.dispatchEvent('deploy:progress', {
          stage: 'uploading',
          message: `Subiendo ${progress.filename}...`,
          progress: progress.percentage,
        });
      });

      // Create deployment
      this.dispatchEvent('deploy:progress', {
        stage: 'creating',
        message: 'Creando deployment...',
      });

      const deployment = await this.createDeployment(projectName, uploadedFiles, options);

      // Monitor deployment
      this.dispatchEvent('deploy:progress', {
        stage: 'building',
        message: 'Construyendo proyecto...',
      });

      const result = await this.deploymentMonitor.monitorDeployment(deployment.id, status => {
        const stateInfo = this.deploymentMonitor.formatState(status.readyState);
        this.dispatchEvent('deploy:progress', {
          stage: 'monitoring',
          message: `${stateInfo.label}... (${status.elapsed}s)`,
          readyState: status.readyState,
          elapsed: status.elapsed,
        });
      });

      // Calculate duration
      const duration = Math.round((Date.now() - startTime) / 1000);

      // Save to history
      const historyRecord = this.deploymentHistory.addDeployment({
        projectName,
        url: result.url,
        deploymentId: result.deploymentId,
        status: 'READY',
        duration,
        filesCount: files.length,
        size: files.reduce((sum, f) => sum + new Blob([f.content]).size, 0),
      });

      // Dispatch success event
      this.dispatchEvent('deploy:complete', {
        projectName,
        url: result.url,
        deploymentId: result.deploymentId,
        duration,
        historyId: historyRecord.id,
      });

      return {
        success: true,
        url: result.url,
        deploymentId: result.deploymentId,
        duration,
        historyId: historyRecord.id,
      };
    } catch (error) {
      console.error('Deployment error:', error);

      // Save failed deployment to history
      this.deploymentHistory.addDeployment({
        projectName,
        status: 'ERROR',
        error: error.message,
        duration: Math.round((Date.now() - startTime) / 1000),
      });

      // Dispatch error event
      this.dispatchEvent('deploy:error', {
        projectName,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Create deployment on Vercel
   * @param {string} projectName - Project name
   * @param {Array} files - Uploaded files
   * @param {Object} options - Deployment options
   * @returns {Promise<Object>} Deployment data
   */
  async createDeployment(projectName, files, options = {}) {
    const deploymentData = {
      name: this.sanitizeProjectName(projectName),
      files: files.map(f => ({
        file: f.file,
        sha: f.sha,
        size: f.size,
      })),
      target: options.target || 'production',
      projectSettings: {
        framework: null,
        buildCommand: null,
        outputDirectory: null,
      },
    };

    // Add team ID if available
    const url = this.teamId
      ? `${this.baseURL}/v13/deployments?teamId=${this.teamId}`
      : `${this.baseURL}/v13/deployments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Deployment creation failed: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get deployment by ID
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Deployment data
   */
  async getDeployment(deploymentId) {
    if (!this.isConnected()) {
      throw new Error('Not connected to Vercel');
    }

    return await this.deploymentMonitor.getDeploymentStatus(deploymentId);
  }

  /**
   * Delete deployment
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteDeployment(deploymentId) {
    if (!this.isConnected()) {
      throw new Error('Not connected to Vercel');
    }

    const url = this.teamId
      ? `${this.baseURL}/v13/deployments/${deploymentId}?teamId=${this.teamId}`
      : `${this.baseURL}/v13/deployments/${deploymentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete deployment: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get deployment history
   * @param {number} limit - Number of items to return
   * @returns {Array} Deployment history
   */
  getDeploymentHistory(limit = 10) {
    return this.deploymentHistory.getRecent(limit);
  }

  /**
   * Get deployment statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return this.deploymentHistory.getStatistics();
  }

  /**
   * Sanitize project name for Vercel
   * @param {string} name - Project name
   * @returns {string} Sanitized name
   */
  sanitizeProjectName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  /**
   * Mask token for display
   * @param {string} token - API token
   * @returns {string} Masked token
   */
  maskToken(token) {
    if (!token || token.length < 10) return '***';
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }

  /**
   * Save token to localStorage
   */
  saveToken() {
    if (this.token) {
      localStorage.setItem('vercel_token', this.token);
    }
    if (this.teamId) {
      localStorage.setItem('vercel_team_id', this.teamId);
    }
  }

  /**
   * Load token from localStorage
   */
  loadToken() {
    const token = localStorage.getItem('vercel_token');
    const teamId = localStorage.getItem('vercel_team_id');

    if (token) {
      this.connect(token, teamId);
    }
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  dispatchEvent(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.vercelDeployer = new VercelDeployer();
}

export default VercelDeployer;
