/**
 * Security Checker
 *
 * Scans HTML/CSS/JS for security vulnerabilities
 * - XSS detection
 * - Malicious script detection
 * - Unsafe inline code
 * - External resource validation
 */

/**
 * Security Checker Class
 */
class SecurityChecker {
  constructor() {
    this.rules = {
      // XSS patterns
      xss: [
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=\s*["'][^"']*["']/gi,
        /<iframe[^>]*>/gi,
        /<embed[^>]*>/gi,
        /<object[^>]*>/gi,
      ],

      // Dangerous functions
      dangerousFunctions: [
        /eval\s*\(/gi,
        /Function\s*\(/gi,
        /setTimeout\s*\(\s*["']/gi,
        /setInterval\s*\(\s*["']/gi,
        /document\.write\s*\(/gi,
        /innerHTML\s*=/gi,
      ],

      // External resources
      externalResources: [
        /src\s*=\s*["']https?:\/\//gi,
        /href\s*=\s*["']https?:\/\//gi,
        /@import\s+url\s*\(\s*["']?https?:\/\//gi,
      ],

      // SQL injection patterns (for future backend validation)
      sqlInjection: [
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/gi,
        /--/g,
        /;/g,
      ],
    };

    this.severityLevels = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
      info: 'info',
    };
  }

  /**
   * Scan HTML content for security issues
   */
  scanHTML(html) {
    const issues = [];

    // Check for XSS patterns
    this.rules.xss.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        issues.push({
          type: 'xss',
          severity: this.severityLevels.critical,
          message: 'Potential XSS vulnerability detected',
          matches: matches.slice(0, 3), // Limit to 3 examples
          pattern: pattern.toString(),
        });
      }
    });

    // Check for external resources
    this.rules.externalResources.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        issues.push({
          type: 'external-resource',
          severity: this.severityLevels.medium,
          message: 'External resource detected - verify source',
          matches: matches.slice(0, 3),
          pattern: pattern.toString(),
        });
      }
    });

    return issues;
  }

  /**
   * Scan JavaScript content for security issues
   */
  scanJS(js) {
    const issues = [];

    // Check for dangerous functions
    this.rules.dangerousFunctions.forEach(pattern => {
      const matches = js.match(pattern);
      if (matches) {
        issues.push({
          type: 'dangerous-function',
          severity: this.severityLevels.high,
          message: 'Dangerous function detected',
          matches: matches.slice(0, 3),
          pattern: pattern.toString(),
        });
      }
    });

    return issues;
  }

  /**
   * Scan CSS content for security issues
   */
  scanCSS(css) {
    const issues = [];

    // Check for external imports
    const externalImports = css.match(/@import\s+url\s*\(\s*["']?https?:\/\//gi);
    if (externalImports) {
      issues.push({
        type: 'external-css',
        severity: this.severityLevels.low,
        message: 'External CSS import detected',
        matches: externalImports.slice(0, 3),
      });
    }

    // Check for expression() (IE-specific vulnerability)
    const expressions = css.match(/expression\s*\(/gi);
    if (expressions) {
      issues.push({
        type: 'css-expression',
        severity: this.severityLevels.high,
        message: 'CSS expression detected (IE vulnerability)',
        matches: expressions,
      });
    }

    return issues;
  }

  /**
   * Scan complete project
   */
  scanProject({ htmlContent = '', cssContent = '', jsContent = '' }) {
    const results = {
      html: this.scanHTML(htmlContent),
      css: this.scanCSS(cssContent),
      js: this.scanJS(jsContent),
    };

    // Calculate overall score
    const totalIssues = [...results.html, ...results.css, ...results.js];

    const criticalCount = totalIssues.filter(i => i.severity === 'critical').length;
    const highCount = totalIssues.filter(i => i.severity === 'high').length;
    const mediumCount = totalIssues.filter(i => i.severity === 'medium').length;
    const lowCount = totalIssues.filter(i => i.severity === 'low').length;

    // Calculate score (0-100)
    let score = 100;
    score -= criticalCount * 30;
    score -= highCount * 15;
    score -= mediumCount * 5;
    score -= lowCount * 2;
    score = Math.max(0, score);

    return {
      score,
      passed: score >= 70,
      issues: results,
      summary: {
        total: totalIssues.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      recommendations: this.generateRecommendations(totalIssues),
    };
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations(issues) {
    const recommendations = [];

    const hasCritical = issues.some(i => i.severity === 'critical');
    const hasHigh = issues.some(i => i.severity === 'high');

    if (hasCritical) {
      recommendations.push({
        priority: 'critical',
        message: 'Fix critical security issues immediately before deployment',
      });
    }

    if (hasHigh) {
      recommendations.push({
        priority: 'high',
        message: 'Address high-severity issues to improve security',
      });
    }

    if (issues.some(i => i.type === 'external-resource')) {
      recommendations.push({
        priority: 'medium',
        message: 'Review all external resources and use HTTPS',
      });
    }

    if (issues.some(i => i.type === 'dangerous-function')) {
      recommendations.push({
        priority: 'high',
        message: 'Avoid using eval() and similar dangerous functions',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        message: 'No major security issues detected',
      });
    }

    return recommendations;
  }

  /**
   * Sanitize HTML (basic XSS prevention)
   */
  sanitizeHTML(html) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }

  /**
   * Validate URL
   */
  isValidURL(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Check Content Security Policy compliance
   */
  checkCSP(content) {
    const issues = [];

    // Check for inline scripts
    if (content.match(/<script[^>]*>[\s\S]*?<\/script>/gi)) {
      issues.push({
        type: 'csp-inline-script',
        message: 'Inline scripts may violate CSP',
        severity: 'medium',
      });
    }

    // Check for inline styles
    if (content.match(/style\s*=\s*["'][^"']*["']/gi)) {
      issues.push({
        type: 'csp-inline-style',
        message: 'Inline styles may violate CSP',
        severity: 'low',
      });
    }

    return issues;
  }
}

// Create singleton instance
const securityChecker = new SecurityChecker();

// Export for global access
if (typeof window !== 'undefined') {
  window.securityChecker = securityChecker;
}

export default securityChecker;
