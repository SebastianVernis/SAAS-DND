/**
 * API Client
 *
 * Wrapper for backend API requests
 * Handles authentication, error handling, and retries
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API Client Class
 */
class APIClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    };

    // Add body if present
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return {
        success: true,
        data: data.data || data,
        ...data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ================================================
  // PROJECTS API
  // ================================================

  /**
   * Get all projects
   */
  async getProjects(params = {}) {
    return this.get('/api/projects', params);
  }

  /**
   * Get single project
   */
  async getProject(id) {
    return this.get(`/api/projects/${id}`);
  }

  /**
   * Create project
   */
  async createProject(data) {
    return this.post('/api/projects', data);
  }

  /**
   * Update project
   */
  async updateProject(id, data) {
    return this.put(`/api/projects/${id}`, data);
  }

  /**
   * Delete project
   */
  async deleteProject(id) {
    return this.delete(`/api/projects/${id}`);
  }

  /**
   * Get project versions
   */
  async getProjectVersions(id) {
    return this.get(`/api/projects/${id}/versions`);
  }

  // ================================================
  // COMPONENTS API
  // ================================================

  /**
   * Get all components
   */
  async getComponents(params = {}) {
    return this.get('/api/components', params);
  }

  /**
   * Get single component
   */
  async getComponent(id) {
    return this.get(`/api/components/${id}`);
  }

  /**
   * Create component
   */
  async createComponent(data) {
    return this.post('/api/components', data);
  }

  /**
   * Update component
   */
  async updateComponent(id, data) {
    return this.put(`/api/components/${id}`, data);
  }

  /**
   * Delete component
   */
  async deleteComponent(id) {
    return this.delete(`/api/components/${id}`);
  }

  /**
   * Get component categories
   */
  async getComponentCategories() {
    return this.get('/api/components/meta/categories');
  }

  // ================================================
  // DEPLOYMENTS API
  // ================================================

  /**
   * Get all deployments
   */
  async getDeployments(params = {}) {
    return this.get('/api/deployments', params);
  }

  /**
   * Get single deployment
   */
  async getDeployment(id) {
    return this.get(`/api/deployments/${id}`);
  }

  /**
   * Create deployment
   */
  async createDeployment(data) {
    return this.post('/api/deployments', data);
  }

  /**
   * Update deployment
   */
  async updateDeployment(id, data) {
    return this.put(`/api/deployments/${id}`, data);
  }

  /**
   * Delete deployment
   */
  async deleteDeployment(id) {
    return this.delete(`/api/deployments/${id}`);
  }

  /**
   * Get deployments for project
   */
  async getProjectDeployments(projectId) {
    return this.get(`/api/deployments/project/${projectId}`);
  }

  // ================================================
  // HEALTH CHECK
  // ================================================

  /**
   * Check API health
   */
  async healthCheck() {
    return this.get('/api/health');
  }
}

// Create singleton instance
const apiClient = new APIClient();

// Export for global access
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
}

export default apiClient;
