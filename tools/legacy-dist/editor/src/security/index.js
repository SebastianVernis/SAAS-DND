/**
 * Security Module - Main Entry Point
 * @module security
 * @description Centralized security utilities for DragNDrop application
 * @version 1.0.0
 */

// Import all security modules
import * as csp from './csp.js';
import * as headers from './headers.js';
import * as secrets from './secrets.js';

// Re-export all modules
export { csp, headers, secrets };

// Export commonly used functions directly
export const {
  generateProductionCSP,
  generateDevelopmentCSP,
  generateNonce,
  handleCSPViolation,
} = csp;

export const {
  getSecurityHeaders,
  getDevelopmentHeaders,
  securityHeadersMiddleware,
  validateSecurityHeaders,
} = headers;

export const {
  secretsManager,
  env,
  envRequired,
} = secrets;

/**
 * Initialize all security modules
 * @param {Object} options - Initialization options
 */
export async function initSecurity(options = {}) {
  console.log('🔒 Initializing security modules...');
  
  // Initialize secrets manager
  await secrets.secretsManager.init(options.secrets || {});
  
  // Validate required secrets if specified
  if (options.requiredSecrets) {
    const validation = secrets.secretsManager.validate(options.requiredSecrets);
    if (!validation.valid) {
      console.warn('⚠️ Missing required secrets:', validation.missing);
    }
  }
  
  // Setup CSP violation reporting
  if (typeof window !== 'undefined') {
    window.addEventListener('securitypolicyviolation', (event) => {
      csp.handleCSPViolation({
        'document-uri': event.documentURI,
        'violated-directive': event.violatedDirective,
        'effective-directive': event.effectiveDirective,
        'original-policy': event.originalPolicy,
        'blocked-uri': event.blockedURI,
        'source-file': event.sourceFile,
        'line-number': event.lineNumber,
        'column-number': event.columnNumber,
      });
    });
  }
  
  console.log('✅ Security modules initialized');
}

/**
 * Security audit helper
 * @returns {Object} Security audit results
 */
export function auditSecurity() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    score: 100,
  };
  
  // Check if running over HTTPS
  if (typeof window !== 'undefined') {
    const isHTTPS = window.location.protocol === 'https:';
    results.checks.push({
      name: 'HTTPS',
      passed: isHTTPS,
      severity: 'critical',
      message: isHTTPS ? 'Site is served over HTTPS' : 'Site is not served over HTTPS',
    });
    if (!isHTTPS) results.score -= 30;
  }
  
  // Check for sensitive data in localStorage
  if (typeof localStorage !== 'undefined') {
    const sensitiveInStorage = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (secrets.secretsManager.isSensitiveKey(key)) {
        sensitiveInStorage.push(key);
      }
    }
    
    const hasSensitive = sensitiveInStorage.length > 0;
    results.checks.push({
      name: 'LocalStorage Security',
      passed: !hasSensitive,
      severity: 'high',
      message: hasSensitive 
        ? `Found sensitive data in localStorage: ${sensitiveInStorage.join(', ')}`
        : 'No sensitive data found in localStorage',
    });
    if (hasSensitive) results.score -= 20;
  }
  
  // Check for console exposure
  if (typeof window !== 'undefined') {
    const hasExposedSecrets = window.__SECRETS__ || window.__API_KEY__ || window.__TOKEN__;
    results.checks.push({
      name: 'Global Exposure',
      passed: !hasExposedSecrets,
      severity: 'critical',
      message: hasExposedSecrets 
        ? 'Sensitive data exposed on window object'
        : 'No sensitive data exposed globally',
    });
    if (hasExposedSecrets) results.score -= 30;
  }
  
  return results;
}

// Default export
export default {
  csp,
  headers,
  secrets,
  initSecurity,
  auditSecurity,
  generateProductionCSP,
  generateDevelopmentCSP,
  getSecurityHeaders,
  secretsManager,
  env,
  envRequired,
};
