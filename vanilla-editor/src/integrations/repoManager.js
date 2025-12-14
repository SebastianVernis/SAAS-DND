/**
 * RepoManager - Manages Git repository operations
 * Handles commits, pushes, and file management
 */

import { GitIntegration } from './gitIntegration.js';

export class RepoManager {
  constructor(gitIntegration) {
    this.git = gitIntegration || window.gitIntegration;
    this.currentRepo = null;
  }

  /**
   * Set current repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   */
  setRepository(owner, repo) {
    this.currentRepo = { owner, repo };
  }

  /**
   * Get current repository
   * @returns {Object|null} Current repository
   */
  getCurrentRepository() {
    return this.currentRepo;
  }

  /**
   * Create blob (file content)
   * @param {string} content - File content
   * @returns {Promise<string>} Blob SHA
   */
  async createBlob(content) {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    const response = await this.git.request('POST', `/repos/${owner}/${repo}/git/blobs`, {
      content,
      encoding: 'utf-8',
    });

    return response.sha;
  }

  /**
   * Create tree
   * @param {Array} files - Array of {path, content} objects
   * @param {string} baseTreeSHA - Base tree SHA
   * @returns {Promise<string>} Tree SHA
   */
  async createTree(files, baseTreeSHA = null) {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    // Create blobs for all files
    const tree = await Promise.all(
      files.map(async file => {
        const blobSHA = await this.createBlob(file.content);
        return {
          path: file.path,
          mode: '100644', // Regular file
          type: 'blob',
          sha: blobSHA,
        };
      })
    );

    // Create tree
    const treeData = {
      tree,
    };

    if (baseTreeSHA) {
      treeData.base_tree = baseTreeSHA;
    }

    const response = await this.git.request('POST', `/repos/${owner}/${repo}/git/trees`, treeData);

    return response.sha;
  }

  /**
   * Create commit
   * @param {string} message - Commit message
   * @param {string} treeSHA - Tree SHA
   * @param {Array} parentSHAs - Parent commit SHAs
   * @returns {Promise<string>} Commit SHA
   */
  async createCommit(message, treeSHA, parentSHAs = []) {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    const response = await this.git.request('POST', `/repos/${owner}/${repo}/git/commits`, {
      message,
      tree: treeSHA,
      parents: parentSHAs,
    });

    return response.sha;
  }

  /**
   * Update reference (branch)
   * @param {string} ref - Reference (e.g., 'heads/main')
   * @param {string} sha - Commit SHA
   * @param {boolean} force - Force update
   * @returns {Promise<Object>} Updated reference
   */
  async updateReference(ref, sha, force = false) {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    return await this.git.request('PATCH', `/repos/${owner}/${repo}/git/refs/${ref}`, {
      sha,
      force,
    });
  }

  /**
   * Commit and push files
   * @param {Array} files - Array of {path, content} objects
   * @param {string} message - Commit message
   * @param {string} branch - Branch name
   * @returns {Promise<Object>} Commit result
   */
  async commitAndPush(files, message, branch = 'main') {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    try {
      // Get latest commit SHA
      const latestCommitSHA = await this.git.getLatestCommitSHA(owner, repo, branch);

      // Get current tree
      const commitData = await this.git.request(
        'GET',
        `/repos/${owner}/${repo}/git/commits/${latestCommitSHA}`
      );
      const baseTreeSHA = commitData.tree.sha;

      // Create new tree with files
      const treeSHA = await this.createTree(files, baseTreeSHA);

      // Create commit
      const commitSHA = await this.createCommit(message, treeSHA, [latestCommitSHA]);

      // Update branch reference
      await this.updateReference(`heads/${branch}`, commitSHA);

      this.git.dispatchEvent('github:commit', {
        owner,
        repo,
        branch,
        commitSHA,
        message,
        filesCount: files.length,
      });

      return {
        success: true,
        commitSHA,
        branch,
        filesCount: files.length,
        url: `https://github.com/${owner}/${repo}/commit/${commitSHA}`,
      };
    } catch (error) {
      console.error('Commit and push error:', error);
      throw error;
    }
  }

  /**
   * Initialize repository with files
   * @param {string} repoName - Repository name
   * @param {Array} files - Initial files
   * @param {Object} options - Repository options
   * @returns {Promise<Object>} Repository data
   */
  async initializeRepository(repoName, files, options = {}) {
    try {
      // Create repository
      const repo = await this.git.createRepository(repoName, {
        description: options.description || 'Created with DragNDrop Editor',
        private: options.private || false,
        auto_init: false, // We'll create initial commit manually
      });

      // Set as current repository
      this.setRepository(repo.owner.login, repo.name);

      // Wait a bit for repo to be ready
      await this.sleep(2000);

      // Create initial commit
      const treeSHA = await this.createTree(files);
      const commitSHA = await this.createCommit('Initial commit', treeSHA, []);

      // Create main branch
      await this.git.request('POST', `/repos/${repo.owner.login}/${repo.name}/git/refs`, {
        ref: 'refs/heads/main',
        sha: commitSHA,
      });

      return {
        success: true,
        repo,
        commitSHA,
        url: repo.html_url,
      };
    } catch (error) {
      console.error('Repository initialization error:', error);
      throw error;
    }
  }

  /**
   * Get repository files
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} Files
   */
  async getFiles(branch = 'main') {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    try {
      const tree = await this.git.getTree(owner, repo, branch);
      return tree.tree.filter(item => item.type === 'blob');
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * Get file content
   * @param {string} path - File path
   * @param {string} branch - Branch name
   * @returns {Promise<string>} File content
   */
  async getFileContent(path, branch = 'main') {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    const fileData = await this.git.getFileContent(owner, repo, path, branch);
    return fileData.decodedContent;
  }

  /**
   * Update single file
   * @param {string} path - File path
   * @param {string} content - New content
   * @param {string} message - Commit message
   * @param {string} branch - Branch name
   * @returns {Promise<Object>} Update result
   */
  async updateFile(path, content, message, branch = 'main') {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    try {
      // Get current file to get its SHA
      const currentFile = await this.git.getFileContent(owner, repo, path, branch);

      // Update file
      const response = await this.git.request('PUT', `/repos/${owner}/${repo}/contents/${path}`, {
        message,
        content: btoa(content), // Base64 encode
        sha: currentFile.sha,
        branch,
      });

      return {
        success: true,
        commit: response.commit,
        url: response.content.html_url,
      };
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @param {string} message - Commit message
   * @param {string} branch - Branch name
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(path, message, branch = 'main') {
    if (!this.currentRepo) {
      throw new Error('No repository selected');
    }

    const { owner, repo } = this.currentRepo;

    try {
      // Get current file to get its SHA
      const currentFile = await this.git.getFileContent(owner, repo, path, branch);

      // Delete file
      const response = await this.git.request(
        'DELETE',
        `/repos/${owner}/${repo}/contents/${path}`,
        {
          message,
          sha: currentFile.sha,
          branch,
        }
      );

      return {
        success: true,
        commit: response.commit,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.repoManager = new RepoManager();
}

export default RepoManager;
