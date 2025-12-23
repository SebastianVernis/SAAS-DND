/**
 * Security Headers Configuration
 * @module security/headers
 * @description Comprehensive security headers for web application protection
 * @version 1.0.0
 */

import { generateProductionCSP, generateDevelopmentCSP, generateNonce } from './csp.js';

/**
 * Security headers configuration
 * @type {Object}
 */
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  
  // XSS Protection (legacy, but still useful for older browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy - control information sent in Referer header
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy - control browser features
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
  
  // Cross-Origin policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/**
 * HSTS (HTTP Strict Transport Security) configuration
 * @type {Object}
 */
const HSTS_CONFIG = {
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true,
};

/**
 * Generate HSTS header value
 * @returns {string} HSTS header value
 */
function generateHSTSHeader() {
  let value = `max-age=${HSTS_CONFIG.maxAge}`;
  if (HSTS_CONFIG.includeSubDomains) {
    value += '; includeSubDomains';
  }
  if (HSTS_CONFIG.preload) {
    value += '; preload';
  }
  return value;
}

/**
 * Get all security headers for production
 * @param {Object} options - Configuration options
 * @param {boolean} options.useNonce - Whether to use nonces for CSP
 * @param {boolean} options.isHTTPS - Whether the connection is HTTPS
 * @returns {Object} Headers object with nonce if applicable
 */
function getSecurityHeaders(options = {}) {
  const { useNonce = false, isHTTPS = true } = options;
  
  const headers = { ...SECURITY_HEADERS };
  
  // Add HSTS only for HTTPS
  if (isHTTPS) {
    headers['Strict-Transport-Security'] = generateHSTSHeader();
  }
  
  // Add CSP
  let nonce = null;
  if (useNonce) {
    nonce = generateNonce();
    headers['Content-Security-Policy'] = generateProductionCSP(nonce);
  } else {
    headers['Content-Security-Policy'] = generateProductionCSP();
  }
  
  return { headers, nonce };
}

/**
 * Get security headers for development
 * @returns {Object} Headers object
 */
function getDevelopmentHeaders() {
  return {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': generateDevelopmentCSP(),
    },
    nonce: null,
  };
}

/**
 * Express/Connect middleware for security headers
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware function
 */
function securityHeadersMiddleware(options = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (req, res, next) => {
    const { headers, nonce } = isDevelopment 
      ? getDevelopmentHeaders()
      : getSecurityHeaders({
          useNonce: options.useNonce || false,
          isHTTPS: req.secure || req.headers['x-forwarded-proto'] === 'https',
        });
    
    // Set all security headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Store nonce in locals for template use
    if (nonce) {
      res.locals.nonce = nonce;
    }
    
    next();
  };
}

/**
 * Cloudflare Workers security headers handler
 * @param {Request} request - Incoming request
 * @param {Response} response - Response to modify
 * @returns {Response} Response with security headers
 */
function cloudflareSecurityHeaders(request, response) {
  const { headers } = getSecurityHeaders({
    useNonce: false,
    isHTTPS: true,
  });
  
  const newHeaders = new Headers(response.headers);
  
  Object.entries(headers).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * HTML meta tags for CSP (fallback for static hosting)
 * @returns {string} HTML meta tag
 */
function getCSPMetaTag() {
  const csp = generateProductionCSP();
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
}

/**
 * Validate security headers on a response
 * @param {Object} headers - Headers object to validate
 * @returns {Object} Validation result with missing/weak headers
 */
function validateSecurityHeaders(headers) {
  const required = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
  ];
  
  const recommended = [
    'Strict-Transport-Security',
    'Permissions-Policy',
    'Cross-Origin-Opener-Policy',
  ];
  
  const missing = [];
  const weak = [];
  
  required.forEach(header => {
    if (!headers[header] && !headers[header.toLowerCase()]) {
      missing.push({ header, severity: 'critical' });
    }
  });
  
  recommended.forEach(header => {
    if (!headers[header] && !headers[header.toLowerCase()]) {
      missing.push({ header, severity: 'warning' });
    }
  });
  
  // Check for weak configurations
  const csp = headers['Content-Security-Policy'] || headers['content-security-policy'];
  if (csp) {
    if (csp.includes("'unsafe-eval'")) {
      weak.push({ header: 'Content-Security-Policy', issue: "Contains 'unsafe-eval'" });
    }
    if (csp.includes('*') && !csp.includes('*.')) {
      weak.push({ header: 'Content-Security-Policy', issue: 'Contains wildcard (*)' });
    }
  }
  
  const xfo = headers['X-Frame-Options'] || headers['x-frame-options'];
  if (xfo && xfo.toUpperCase() === 'ALLOWALL') {
    weak.push({ header: 'X-Frame-Options', issue: 'Set to ALLOWALL' });
  }
  
  return {
    valid: missing.filter(m => m.severity === 'critical').length === 0 && weak.length === 0,
    missing,
    weak,
    score: calculateSecurityScore(missing, weak),
  };
}

/**
 * Calculate security score based on headers
 * @param {Array} missing - Missing headers
 * @param {Array} weak - Weak configurations
 * @returns {number} Score from 0-100
 */
function calculateSecurityScore(missing, weak) {
  let score = 100;
  
  missing.forEach(m => {
    if (m.severity === 'critical') {
      score -= 20;
    } else {
      score -= 5;
    }
  });
  
  weak.forEach(() => {
    score -= 10;
  });
  
  return Math.max(0, score);
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SECURITY_HEADERS,
    HSTS_CONFIG,
    getSecurityHeaders,
    getDevelopmentHeaders,
    securityHeadersMiddleware,
    cloudflareSecurityHeaders,
    getCSPMetaTag,
    validateSecurityHeaders,
    generateHSTSHeader,
  };
}

export {
  SECURITY_HEADERS,
  HSTS_CONFIG,
  getSecurityHeaders,
  getDevelopmentHeaders,
  securityHeadersMiddleware,
  cloudflareSecurityHeaders,
  getCSPMetaTag,
  validateSecurityHeaders,
  generateHSTSHeader,
};

export default {
  SECURITY_HEADERS,
  HSTS_CONFIG,
  getSecurityHeaders,
  getDevelopmentHeaders,
  securityHeadersMiddleware,
  cloudflareSecurityHeaders,
  getCSPMetaTag,
  validateSecurityHeaders,
  generateHSTSHeader,
};
