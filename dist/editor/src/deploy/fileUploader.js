/**
 * FileUploader - Handles file upload to Vercel
 * Calculates SHA-1 hashes and uploads files to Vercel's file API
 */

export class FileUploader {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.vercel.com';
  }

  /**
   * Calculate SHA-1 hash of file content
   * @param {string} content - File content
   * @returns {Promise<string>} SHA-1 hash
   */
  async calculateSHA(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Upload a single file to Vercel
   * @param {string} content - File content
   * @param {string} filename - File name
   * @returns {Promise<Object>} Upload result with SHA
   */
  async uploadFile(content, filename) {
    try {
      const sha = await this.calculateSHA(content);
      const size = new Blob([content]).size;

      const response = await fetch(`${this.baseURL}/v2/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'x-now-digest': sha,
          'x-now-size': size.toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: content,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Upload failed for ${filename}: ${error.error?.message || response.statusText}`
        );
      }

      return {
        file: filename,
        sha,
        size,
      };
    } catch (error) {
      console.error(`Error uploading ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Upload multiple files to Vercel
   * @param {Array<{name: string, content: string}>} files - Array of files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadFiles(files, onProgress = null) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          filename: file.name,
          percentage: Math.round(((i + 1) / total) * 100),
        });
      }

      const result = await this.uploadFile(file.content, file.name);
      results.push(result);
    }

    return results;
  }

  /**
   * Prepare files for deployment
   * Converts project data to Vercel file format
   * @param {Object} projectData - Project data with HTML, CSS, JS
   * @returns {Array} Array of files ready for upload
   */
  prepareFiles(projectData) {
    const files = [];

    // Add index.html
    if (projectData.html) {
      files.push({
        name: 'index.html',
        content: projectData.html,
      });
    }

    // Add styles.css if exists
    if (projectData.css) {
      files.push({
        name: 'styles.css',
        content: projectData.css,
      });
    }

    // Add script.js if exists
    if (projectData.js) {
      files.push({
        name: 'script.js',
        content: projectData.js,
      });
    }

    // Add additional files if any
    if (projectData.additionalFiles) {
      projectData.additionalFiles.forEach(file => {
        files.push({
          name: file.name,
          content: file.content,
        });
      });
    }

    return files;
  }

  /**
   * Validate files before upload
   * @param {Array} files - Files to validate
   * @returns {Object} Validation result
   */
  validateFiles(files) {
    const errors = [];
    const warnings = [];

    // Check if at least index.html exists
    const hasIndexHTML = files.some(f => f.name === 'index.html');
    if (!hasIndexHTML) {
      errors.push('Missing index.html file');
    }

    // Check file sizes
    files.forEach(file => {
      const size = new Blob([file.content]).size;
      const sizeMB = size / (1024 * 1024);

      if (sizeMB > 10) {
        errors.push(`File ${file.name} is too large (${sizeMB.toFixed(2)}MB). Max size is 10MB.`);
      } else if (sizeMB > 5) {
        warnings.push(`File ${file.name} is large (${sizeMB.toFixed(2)}MB). Consider optimizing.`);
      }
    });

    // Check total project size
    const totalSize = files.reduce((sum, file) => {
      return sum + new Blob([file.content]).size;
    }, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    if (totalSizeMB > 50) {
      errors.push(`Total project size (${totalSizeMB.toFixed(2)}MB) exceeds 50MB limit.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalSize: totalSizeMB,
    };
  }
}

export default FileUploader;
