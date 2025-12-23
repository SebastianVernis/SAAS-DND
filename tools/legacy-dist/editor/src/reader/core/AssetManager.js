/**
 * Asset Manager
 * Manages project assets (images, fonts, videos, etc.)
 * 
 * @module AssetManager
 */

export class AssetManager {
  constructor() {
    this.assets = [];
  }

  /**
   * Load assets from files
   * @param {File[]} assetFiles - Asset files
   * @returns {Promise<Array>} Loaded assets
   */
  async load(assetFiles) {
    this.assets = [];

    for (const file of assetFiles) {
      const asset = await this.processAsset(file);
      this.assets.push(asset);
    }

    return this.assets;
  }

  /**
   * Process single asset
   * @param {File} file - Asset file
   * @returns {Promise<Object>} Processed asset
   */
  async processAsset(file) {
    const type = this.detectAssetType(file);
    const url = await this.createObjectURL(file);

    const asset = {
      id: this.generateId(file.name),
      name: file.name,
      type,
      size: file.size,
      path: file.webkitRelativePath || file.name,
      url,
      file,
      metadata: {}
    };

    // Add type-specific metadata
    if (type === 'image') {
      asset.metadata = await this.getImageMetadata(file, url);
    } else if (type === 'video') {
      asset.metadata = await this.getVideoMetadata(file, url);
    } else if (type === 'font') {
      asset.metadata = this.getFontMetadata(file);
    }

    return asset;
  }

  /**
   * Detect asset type
   * @param {File} file - File
   * @returns {string} Asset type
   */
  detectAssetType(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    const types = {
      image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'],
      video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
      audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
      font: ['woff', 'woff2', 'ttf', 'otf', 'eot'],
      document: ['pdf', 'doc', 'docx', 'txt']
    };

    for (const [type, extensions] of Object.entries(types)) {
      if (extensions.includes(ext)) {
        return type;
      }
    }

    return 'other';
  }

  /**
   * Create object URL for file
   * @param {File} file - File
   * @returns {Promise<string>} Object URL
   */
  createObjectURL(file) {
    return Promise.resolve(URL.createObjectURL(file));
  }

  /**
   * Get image metadata
   * @param {File} file - Image file
   * @param {string} url - Object URL
   * @returns {Promise<Object>} Metadata
   */
  getImageMetadata(file, url) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
          format: file.name.split('.').pop().toUpperCase()
        });
      };

      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          aspectRatio: 0,
          format: file.name.split('.').pop().toUpperCase(),
          error: 'Failed to load image'
        });
      };

      img.src = url;
    });
  }

  /**
   * Get video metadata
   * @param {File} file - Video file
   * @param {string} url - Object URL
   * @returns {Promise<Object>} Metadata
   */
  getVideoMetadata(file, url) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          format: file.name.split('.').pop().toUpperCase()
        });
      };

      video.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          duration: 0,
          format: file.name.split('.').pop().toUpperCase(),
          error: 'Failed to load video'
        });
      };

      video.src = url;
    });
  }

  /**
   * Get font metadata
   * @param {File} file - Font file
   * @returns {Object} Metadata
   */
  getFontMetadata(file) {
    return {
      format: file.name.split('.').pop().toUpperCase(),
      family: this.extractFontFamily(file.name)
    };
  }

  /**
   * Extract font family from filename
   * @param {string} filename - Font filename
   * @returns {string} Font family
   */
  extractFontFamily(filename) {
    // Remove extension and common suffixes
    let family = filename.replace(/\.(woff2?|ttf|otf|eot)$/i, '');
    family = family.replace(/-(regular|bold|italic|light|medium|black)/i, '');
    return family;
  }

  /**
   * Extract assets from HTML
   * @param {Object} parsed - Parsed HTML
   * @returns {Array} Assets
   */
  extractFromHTML(parsed) {
    const assets = [];

    if (parsed.assets) {
      // Images
      if (parsed.assets.images) {
        parsed.assets.images.forEach(img => {
          if (img.src) {
            assets.push({
              type: 'image',
              src: img.src,
              alt: img.alt,
              usage: 'img-tag'
            });
          }
        });
      }

      // Videos
      if (parsed.assets.videos) {
        parsed.assets.videos.forEach(video => {
          if (video.src) {
            assets.push({
              type: 'video',
              src: video.src,
              usage: 'video-tag'
            });
          }
        });
      }

      // Fonts
      if (parsed.assets.fonts) {
        parsed.assets.fonts.forEach(font => {
          if (font.href) {
            assets.push({
              type: 'font',
              src: font.href,
              usage: 'link-tag'
            });
          }
        });
      }
    }

    return assets;
  }

  /**
   * Get assets by type
   * @param {string} type - Asset type
   * @returns {Array} Assets
   */
  getAssetsByType(type) {
    return this.assets.filter(asset => asset.type === type);
  }

  /**
   * Get asset by ID
   * @param {string} id - Asset ID
   * @returns {Object|null} Asset
   */
  getAssetById(id) {
    return this.assets.find(asset => asset.id === id) || null;
  }

  /**
   * Get asset by name
   * @param {string} name - Asset name
   * @returns {Object|null} Asset
   */
  getAssetByName(name) {
    return this.assets.find(asset => asset.name === name) || null;
  }

  /**
   * Get all assets
   * @returns {Array} All assets
   */
  getAllAssets() {
    return this.assets;
  }

  /**
   * Get asset statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const stats = {
      total: this.assets.length,
      byType: {},
      totalSize: 0
    };

    this.assets.forEach(asset => {
      // Count by type
      stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
      
      // Sum sizes
      stats.totalSize += asset.size;
    });

    // Format total size
    stats.totalSizeFormatted = this.formatBytes(stats.totalSize);

    return stats;
  }

  /**
   * Format bytes to human readable
   * @param {number} bytes - Bytes
   * @returns {string} Formatted size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Generate unique ID
   * @param {string} name - Asset name
   * @returns {string} ID
   */
  generateId(name) {
    return `asset_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up object URLs
   */
  cleanup() {
    this.assets.forEach(asset => {
      if (asset.url) {
        URL.revokeObjectURL(asset.url);
      }
    });
    this.assets = [];
  }
}
