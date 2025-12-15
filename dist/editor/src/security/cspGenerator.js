/**
 * Content Security Policy Generator
 *
 * Generates CSP headers for secure deployment
 */

class CSPGenerator {
  constructor() {
    this.defaultPolicy = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"], // Allow inline styles for now
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    };
  }

  /**
   * Generate CSP header from policy object
   */
  generate(customPolicy = {}) {
    const policy = { ...this.defaultPolicy, ...customPolicy };

    const directives = Object.entries(policy)
      .map(([key, values]) => {
        if (values.length === 0) {
          return key;
        }
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');

    return directives;
  }

  /**
   * Generate CSP for project content
   */
  generateForProject({ htmlContent = '', cssContent = '', jsContent = '' }) {
    const policy = { ...this.defaultPolicy };

    // Analyze content for external resources
    const externalDomains = this.extractExternalDomains(htmlContent);

    if (externalDomains.length > 0) {
      policy['script-src'].push(...externalDomains);
      policy['style-src'].push(...externalDomains);
      policy['img-src'].push(...externalDomains);
    }

    // Check for inline scripts
    if (htmlContent.includes('<script>') || jsContent.length > 0) {
      // For development, allow unsafe-inline
      // In production, use nonces or hashes
      policy['script-src'].push("'unsafe-inline'");
    }

    return this.generate(policy);
  }

  /**
   * Extract external domains from HTML
   */
  extractExternalDomains(html) {
    const domains = new Set();

    // Match src and href attributes
    const urlPattern = /(src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
    let match;

    while ((match = urlPattern.exec(html)) !== null) {
      try {
        const url = new URL(match[2]);
        domains.add(url.origin);
      } catch (e) {
        // Invalid URL, skip
      }
    }

    return Array.from(domains);
  }

  /**
   * Generate CSP meta tag
   */
  generateMetaTag(customPolicy = {}) {
    const csp = this.generate(customPolicy);
    return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
  }

  /**
   * Validate CSP compliance
   */
  validateCompliance(html, policy) {
    const issues = [];

    // Check for inline scripts
    if (html.match(/<script[^>]*>[\s\S]*?<\/script>/gi)) {
      if (!policy['script-src']?.includes("'unsafe-inline'")) {
        issues.push({
          type: 'inline-script',
          message: 'Inline scripts violate CSP',
        });
      }
    }

    // Check for inline event handlers
    if (html.match(/on\w+\s*=\s*["'][^"']*["']/gi)) {
      issues.push({
        type: 'inline-handler',
        message: 'Inline event handlers violate CSP',
      });
    }

    return issues;
  }
}

// Create singleton instance
const cspGenerator = new CSPGenerator();

// Export for global access
if (typeof window !== 'undefined') {
  window.cspGenerator = cspGenerator;
}

export default cspGenerator;
