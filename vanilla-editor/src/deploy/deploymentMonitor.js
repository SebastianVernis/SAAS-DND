/**
 * DeploymentMonitor - Monitors Vercel deployment status
 * Polls deployment status and provides real-time updates
 */

export class DeploymentMonitor {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.vercel.com';
    this.pollingInterval = 5000; // 5 seconds
    this.maxPollingTime = 300000; // 5 minutes
  }

  /**
   * Get deployment status
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Deployment status
   */
  async getDeploymentStatus(deploymentId) {
    try {
      const response = await fetch(`${this.baseURL}/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get deployment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting deployment status:', error);
      throw error;
    }
  }

  /**
   * Monitor deployment until completion
   * @param {string} deploymentId - Deployment ID
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Final deployment status
   */
  async monitorDeployment(deploymentId, onProgress = null) {
    const startTime = Date.now();
    let attempts = 0;

    while (true) {
      attempts++;
      const elapsed = Date.now() - startTime;

      // Check timeout
      if (elapsed > this.maxPollingTime) {
        throw new Error('Deployment monitoring timeout (5 minutes exceeded)');
      }

      try {
        const status = await this.getDeploymentStatus(deploymentId);

        // Call progress callback
        if (onProgress) {
          onProgress({
            deploymentId,
            readyState: status.readyState,
            url: status.url,
            attempts,
            elapsed: Math.round(elapsed / 1000),
            status,
          });
        }

        // Check if deployment is ready
        if (status.readyState === 'READY') {
          return {
            success: true,
            url: status.url,
            deploymentId,
            readyState: status.readyState,
            elapsed: Math.round(elapsed / 1000),
          };
        }

        // Check if deployment failed
        if (status.readyState === 'ERROR' || status.readyState === 'CANCELED') {
          throw new Error(
            `Deployment ${status.readyState.toLowerCase()}: ${status.error?.message || 'Unknown error'}`
          );
        }

        // Wait before next poll
        await this.sleep(this.pollingInterval);
      } catch (error) {
        if (error.message.includes('Deployment')) {
          throw error;
        }
        // Retry on network errors
        console.warn(`Polling attempt ${attempts} failed, retrying...`, error);
        await this.sleep(this.pollingInterval);
      }
    }
  }

  /**
   * Get deployment logs
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Array>} Deployment logs
   */
  async getDeploymentLogs(deploymentId) {
    try {
      const response = await fetch(`${this.baseURL}/v2/deployments/${deploymentId}/events`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get deployment logs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting deployment logs:', error);
      throw error;
    }
  }

  /**
   * Get deployment builds
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Array>} Build information
   */
  async getDeploymentBuilds(deploymentId) {
    try {
      const response = await fetch(`${this.baseURL}/v1/deployments/${deploymentId}/builds`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get deployment builds: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting deployment builds:', error);
      throw error;
    }
  }

  /**
   * Cancel a deployment
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelDeployment(deploymentId) {
    try {
      const response = await fetch(`${this.baseURL}/v12/deployments/${deploymentId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel deployment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling deployment:', error);
      throw error;
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format deployment state for display
   * @param {string} readyState - Deployment ready state
   * @returns {Object} Formatted state
   */
  formatState(readyState) {
    const states = {
      INITIALIZING: { label: 'Inicializando', icon: '⏳', color: '#3b82f6' },
      BUILDING: { label: 'Construyendo', icon: '🔨', color: '#f59e0b' },
      UPLOADING: { label: 'Subiendo', icon: '📤', color: '#8b5cf6' },
      DEPLOYING: { label: 'Desplegando', icon: '🚀', color: '#06b6d4' },
      READY: { label: 'Listo', icon: '✅', color: '#10b981' },
      ERROR: { label: 'Error', icon: '❌', color: '#ef4444' },
      CANCELED: { label: 'Cancelado', icon: '⛔', color: '#6b7280' },
      QUEUED: { label: 'En cola', icon: '⏸️', color: '#64748b' },
    };

    return states[readyState] || { label: readyState, icon: '❓', color: '#9ca3af' };
  }
}

export default DeploymentMonitor;
