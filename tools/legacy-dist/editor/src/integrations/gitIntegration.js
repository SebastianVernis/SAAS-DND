/**
 * GitIntegration - GitHub API wrapper
 * Handles authentication and basic GitHub operations
 */

export class GitIntegration {
  constructor() {
    this.token = null;
    this.user = null;
    this.baseURL = 'https://api.github.com';

    // Load saved token
    this.loadToken();
  }

  /**
   * Connect to GitHub with token
   * @param {string} token - GitHub personal access token
   */
  async connect(token) {
    this.token = token;

    try {
      // Verify token by getting user info
      this.user = await this.getCurrentUser();

      // Save token
      this.saveToken();

      this.dispatchEvent('github:connected', { user: this.user });

      return this.user;
    } catch (error) {
      this.token = null;
      this.user = null;
      throw new Error(`GitHub connection failed: ${error.message}`);
    }
  }

  /**
   * Disconnect from GitHub
   */
  disconnect() {
    this.token = null;
    this.user = null;

    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');

    this.dispatchEvent('github:disconnected');
  }

  /**
   * Check if connected to GitHub
   * @returns {boolean} Connection status
   */
  isConnected() {
    return !!this.token && !!this.user;
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    const response = await this.request('GET', '/user');
    return response;
  }

  /**
   * Get user repositories
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Repositories
   */
  async getRepositories(options = {}) {
    const params = new URLSearchParams({
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: options.perPage || 30,
      page: options.page || 1,
    });

    return await this.request('GET', `/user/repos?${params}`);
  }

  /**
   * Get repository details
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Repository data
   */
  async getRepository(owner, repo) {
    return await this.request('GET', `/repos/${owner}/${repo}`);
  }

  /**
   * Create a new repository
   * @param {string} name - Repository name
   * @param {Object} options - Repository options
   * @returns {Promise<Object>} Created repository
   */
  async createRepository(name, options = {}) {
    const data = {
      name,
      description: options.description || '',
      private: options.private || false,
      auto_init: options.autoInit || false,
      gitignore_template: options.gitignoreTemplate || null,
      license_template: options.licenseTemplate || null,
    };

    const repo = await this.request('POST', '/user/repos', data);

    this.dispatchEvent('github:repo:created', { repo });

    return repo;
  }

  /**
   * Delete a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<void>}
   */
  async deleteRepository(owner, repo) {
    await this.request('DELETE', `/repos/${owner}/${repo}`);

    this.dispatchEvent('github:repo:deleted', { owner, repo });
  }

  /**
   * Get repository branches
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} Branches
   */
  async getBranches(owner, repo) {
    return await this.request('GET', `/repos/${owner}/${repo}/branches`);
  }

  /**
   * Get default branch
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<string>} Default branch name
   */
  async getDefaultBranch(owner, repo) {
    const repoData = await this.getRepository(owner, repo);
    return repoData.default_branch || 'main';
  }

  /**
   * Get file content from repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} ref - Branch/commit ref
   * @returns {Promise<Object>} File data
   */
  async getFileContent(owner, repo, path, ref = null) {
    const url = ref
      ? `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
      : `/repos/${owner}/${repo}/contents/${path}`;

    const response = await this.request('GET', url);

    // Decode base64 content
    if (response.content) {
      response.decodedContent = atob(response.content.replace(/\n/g, ''));
    }

    return response;
  }

  /**
   * Get repository tree
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} sha - Tree SHA
   * @returns {Promise<Object>} Tree data
   */
  async getTree(owner, repo, sha) {
    return await this.request('GET', `/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`);
  }

  /**
   * Get latest commit SHA
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<string>} Commit SHA
   */
  async getLatestCommitSHA(owner, repo, branch = 'main') {
    const ref = await this.request('GET', `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    return ref.object.sha;
  }

  /**
   * Make API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<any>} Response data
   */
  async request(method, endpoint, data = null) {
    if (!this.token) {
      throw new Error('Not connected to GitHub');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const options = {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        throw new Error(
          `GitHub API rate limit exceeded. Resets at ${new Date(resetTime * 1000).toLocaleString()}`
        );
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  /**
   * Save token to localStorage
   */
  saveToken() {
    if (this.token) {
      localStorage.setItem('github_token', this.token);
    }
    if (this.user) {
      localStorage.setItem('github_user', JSON.stringify(this.user));
    }
  }

  /**
   * Load token from localStorage
   */
  loadToken() {
    const token = localStorage.getItem('github_token');
    const userStr = localStorage.getItem('github_user');

    if (token && userStr) {
      this.token = token;
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        this.user = null;
      }
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

  /**
   * Mask token for display
   * @param {string} token - API token
   * @returns {string} Masked token
   */
  maskToken(token) {
    if (!token || token.length < 10) return '***';
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.gitIntegration = new GitIntegration();
}

export default GitIntegration;
