/**
 * Secrets Management Module
 * @module security/secrets
 * @description Secure handling of sensitive configuration and API keys
 * @version 1.0.0
 */

/**
 * Environment variable prefixes that indicate sensitive data
 * @type {string[]}
 */
const SENSITIVE_PREFIXES = [
  'API_KEY',
  'SECRET',
  'PASSWORD',
  'TOKEN',
  'PRIVATE',
  'CREDENTIAL',
  'AUTH',
  'DATABASE_URL',
  'REDIS_URL',
  'SENTRY_DSN',
];

/**
 * SecretsManager class for secure secrets handling
 */
class SecretsManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 3600000; // 1 hour default TTL
    this.encryptionKey = null;
    this.initialized = false;
  }

  /**
   * Initialize the secrets manager
   * @param {Object} options - Configuration options
   */
  async init(options = {}) {
    this.ttl = options.ttl || this.ttl;
    
    // In browser environment, use Web Crypto API
    if (typeof window !== 'undefined' && window.crypto) {
      this.encryptionKey = await this.generateEncryptionKey();
    }
    
    this.initialized = true;
    console.log('🔐 SecretsManager initialized');
  }

  /**
   * Generate encryption key using Web Crypto API
   * @returns {Promise<CryptoKey>} Generated encryption key
   */
  async generateEncryptionKey() {
    if (typeof window === 'undefined' || !window.crypto) {
      return null;
    }

    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get a secret value
   * @param {string} key - Secret key name
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Secret value
   */
  get(key, defaultValue = null) {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Try environment variables (Node.js)
    if (typeof process !== 'undefined' && process.env) {
      const envValue = process.env[key];
      if (envValue !== undefined) {
        this.set(key, envValue);
        return envValue;
      }
    }

    // Try window config (browser)
    if (typeof window !== 'undefined' && window.__CONFIG__) {
      const configValue = window.__CONFIG__[key];
      if (configValue !== undefined) {
        this.set(key, configValue);
        return configValue;
      }
    }

    return defaultValue;
  }

  /**
   * Set a secret value in cache
   * @param {string} key - Secret key name
   * @param {*} value - Secret value
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = null) {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl || this.ttl),
    });
  }

  /**
   * Remove a secret from cache
   * @param {string} key - Secret key name
   */
  remove(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cached secrets
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Encrypt sensitive data
   * @param {string} data - Data to encrypt
   * @returns {Promise<string>} Encrypted data as base64
   */
  async encrypt(data) {
    if (!this.encryptionKey) {
      console.warn('Encryption key not available, returning plain data');
      return data;
    }

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Return as base64
    return btoa(String.fromCharCode.apply(null, combined));
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Base64 encrypted data
   * @returns {Promise<string>} Decrypted data
   */
  async decrypt(encryptedData) {
    if (!this.encryptionKey) {
      console.warn('Encryption key not available, returning data as-is');
      return encryptedData;
    }

    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Check if a key name indicates sensitive data
   * @param {string} key - Key name to check
   * @returns {boolean} True if key appears sensitive
   */
  isSensitiveKey(key) {
    const upperKey = key.toUpperCase();
    return SENSITIVE_PREFIXES.some(prefix => upperKey.includes(prefix));
  }

  /**
   * Mask sensitive value for logging
   * @param {string} value - Value to mask
   * @param {number} visibleChars - Number of characters to show
   * @returns {string} Masked value
   */
  mask(value, visibleChars = 4) {
    if (!value || typeof value !== 'string') {
      return '***';
    }

    if (value.length <= visibleChars * 2) {
      return '*'.repeat(value.length);
    }

    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    const middle = '*'.repeat(Math.min(value.length - visibleChars * 2, 10));

    return `${start}${middle}${end}`;
  }

  /**
   * Sanitize object by masking sensitive values
   * @param {Object} obj - Object to sanitize
   * @returns {Object} Sanitized object
   */
  sanitize(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = this.mask(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate that required secrets are present
   * @param {string[]} requiredKeys - List of required secret keys
   * @returns {Object} Validation result
   */
  validate(requiredKeys) {
    const missing = [];
    const present = [];

    for (const key of requiredKeys) {
      const value = this.get(key);
      if (value === null || value === undefined || value === '') {
        missing.push(key);
      } else {
        present.push(key);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      present,
    };
  }

  /**
   * Get all non-sensitive configuration
   * @returns {Object} Safe configuration object
   */
  getSafeConfig() {
    const config = {};

    // Add non-sensitive environment variables
    if (typeof process !== 'undefined' && process.env) {
      for (const [key, value] of Object.entries(process.env)) {
        if (!this.isSensitiveKey(key)) {
          config[key] = value;
        }
      }
    }

    return config;
  }

  /**
   * Destroy the secrets manager
   */
  destroy() {
    this.clearCache();
    this.encryptionKey = null;
    this.initialized = false;
  }
}

/**
 * Singleton instance
 */
const secretsManager = new SecretsManager();

/**
 * Environment configuration helper
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value
 * @returns {*} Environment value or default
 */
function env(key, defaultValue = null) {
  return secretsManager.get(key, defaultValue);
}

/**
 * Required environment variable helper
 * @param {string} key - Environment variable key
 * @returns {*} Environment value
 * @throws {Error} If variable is not set
 */
function envRequired(key) {
  const value = secretsManager.get(key);
  if (value === null || value === undefined) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SecretsManager,
    secretsManager,
    env,
    envRequired,
    SENSITIVE_PREFIXES,
  };
}

export {
  SecretsManager,
  secretsManager,
  env,
  envRequired,
  SENSITIVE_PREFIXES,
};

export default secretsManager;
