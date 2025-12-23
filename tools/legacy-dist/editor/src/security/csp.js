/**
 * Content Security Policy (CSP) Configuration
 * @module security/csp
 * @description Generates and manages Content Security Policy headers
 * @version 1.0.0
 */

/**
 * CSP Directives Configuration
 * @type {Object}
 */
const CSP_DIRECTIVES = {
  // Default fallback for all resource types
  'default-src': ["'self'"],
  
  // JavaScript sources
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for inline event handlers - TODO: migrate to nonces
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://cdnjs.cloudflare.com",
  ],
  
  // CSS sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for dynamic styles in editor
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net",
  ],
  
  // Image sources
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ],
  
  // Font sources
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net",
  ],
  
  // AJAX/Fetch/WebSocket connections
  'connect-src': [
    "'self'",
    "https://api.dragndrop.dev",
    "https://*.sentry.io",
    "wss://dragndrop.dev",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  
  // Media sources (audio/video)
  'media-src': [
    "'self'",
    "blob:",
    "https:",
  ],
  
  // Object/embed/applet sources
  'object-src': ["'none'"],
  
  // Frame sources
  'frame-src': [
    "'self'",
    "https://www.youtube.com",
    "https://player.vimeo.com",
  ],
  
  // Frame ancestors (who can embed this page)
  'frame-ancestors': ["'self'"],
  
  // Form action targets
  'form-action': ["'self'"],
  
  // Base URI restriction
  'base-uri': ["'self'"],
  
  // Manifest sources
  'manifest-src': ["'self'"],
  
  // Worker sources
  'worker-src': ["'self'", "blob:"],
  
  // Child sources (deprecated but included for compatibility)
  'child-src': ["'self'", "blob:"],
};

/**
 * CSP Directives for Report-Only mode (more permissive for testing)
 * @type {Object}
 */
const CSP_REPORT_ONLY_DIRECTIVES = {
  ...CSP_DIRECTIVES,
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint'],
};

/**
 * Generate CSP header string from directives object
 * @param {Object} directives - CSP directives configuration
 * @param {string} [nonce] - Optional nonce for inline scripts
 * @returns {string} CSP header value
 */
function generateCSPString(directives, nonce = null) {
  const processedDirectives = { ...directives };
  
  // Add nonce to script-src if provided
  if (nonce) {
    processedDirectives['script-src'] = [
      ...processedDirectives['script-src'].filter(s => s !== "'unsafe-inline'"),
      `'nonce-${nonce}'`,
    ];
    processedDirectives['style-src'] = [
      ...processedDirectives['style-src'].filter(s => s !== "'unsafe-inline'"),
      `'nonce-${nonce}'`,
    ];
  }
  
  return Object.entries(processedDirectives)
    .filter(([, values]) => values && values.length > 0)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Generate CSP header for production
 * @param {string} [nonce] - Optional nonce for inline scripts
 * @returns {string} CSP header value
 */
function generateProductionCSP(nonce = null) {
  return generateCSPString(CSP_DIRECTIVES, nonce);
}

/**
 * Generate CSP header for development (more permissive)
 * @returns {string} CSP header value
 */
function generateDevelopmentCSP() {
  const devDirectives = {
    ...CSP_DIRECTIVES,
    'connect-src': [
      ...CSP_DIRECTIVES['connect-src'],
      "http://localhost:*",
      "ws://localhost:*",
      "http://127.0.0.1:*",
      "ws://127.0.0.1:*",
    ],
  };
  
  return generateCSPString(devDirectives);
}

/**
 * Generate Report-Only CSP header
 * @returns {string} CSP header value for report-only mode
 */
function generateReportOnlyCSP() {
  return generateCSPString(CSP_REPORT_ONLY_DIRECTIVES);
}

/**
 * Generate nonce for inline scripts
 * @returns {string} Base64-encoded random nonce
 */
function generateNonce() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return btoa(crypto.randomUUID());
  }
  // Fallback for older environments
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode.apply(null, array));
}

/**
 * CSP violation report handler
 * @param {Object} report - CSP violation report
 */
function handleCSPViolation(report) {
  const violation = {
    timestamp: new Date().toISOString(),
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    effectiveDirective: report['effective-directive'],
    originalPolicy: report['original-policy'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
  };
  
  // Log violation (in production, send to monitoring service)
  console.warn('[CSP Violation]', violation);
  
  return violation;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CSP_DIRECTIVES,
    generateCSPString,
    generateProductionCSP,
    generateDevelopmentCSP,
    generateReportOnlyCSP,
    generateNonce,
    handleCSPViolation,
  };
}

// ES Module export
export {
  CSP_DIRECTIVES,
  generateCSPString,
  generateProductionCSP,
  generateDevelopmentCSP,
  generateReportOnlyCSP,
  generateNonce,
  handleCSPViolation,
};

export default {
  CSP_DIRECTIVES,
  generateCSPString,
  generateProductionCSP,
  generateDevelopmentCSP,
  generateReportOnlyCSP,
  generateNonce,
  handleCSPViolation,
};
