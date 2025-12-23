/**
 * Accessibility Checker - v1.0
 *
 * WCAG 2.1 Level AA accessibility checker with auto-fix capabilities.
 * Scans elements for accessibility issues and provides automated fixes.
 */

class AccessibilityChecker {
  constructor() {
    this.lastScanResults = null;
    this.scanHistory = [];
  }

  /**
   * Scan entire canvas for accessibility issues
   */
  scan() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    return this.scanElement(canvas);
  }

  /**
   * Scan specific element for accessibility issues
   */
  scanElement(element) {
    if (!element) {
      throw new Error('Element is required');
    }

    // Run all WCAG rules
    const issues = window.wcagRules.checkAll(element);

    // Calculate score
    const score = window.wcagRules.calculateScore(issues);

    // Group issues by severity
    const grouped = this.groupIssues(issues);

    // Store results
    this.lastScanResults = {
      timestamp: Date.now(),
      element: element,
      score,
      totalIssues: issues.length,
      issues,
      grouped,
      summary: this.generateSummary(issues, score),
    };

    // Add to history
    this.scanHistory.push({
      timestamp: Date.now(),
      score,
      issueCount: issues.length,
    });

    // Keep only last 10 scans
    if (this.scanHistory.length > 10) {
      this.scanHistory = this.scanHistory.slice(-10);
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('ai:accessibility:scanned', {
        detail: this.lastScanResults,
      })
    );

    return this.lastScanResults;
  }

  /**
   * Group issues by severity and rule
   */
  groupIssues(issues) {
    const grouped = {
      byLevel: { A: [], AA: [], AAA: [] },
      byRule: {},
      critical: [],
      warnings: [],
    };

    issues.forEach(issue => {
      // By level
      if (grouped.byLevel[issue.level]) {
        grouped.byLevel[issue.level].push(issue);
      }

      // By rule
      if (!grouped.byRule[issue.ruleId]) {
        grouped.byRule[issue.ruleId] = [];
      }
      grouped.byRule[issue.ruleId].push(issue);

      // By severity
      if (issue.level === 'A') {
        grouped.critical.push(issue);
      } else {
        grouped.warnings.push(issue);
      }
    });

    return grouped;
  }

  /**
   * Generate summary of scan results
   */
  generateSummary(issues, score) {
    const levelCounts = {
      A: issues.filter(i => i.level === 'A').length,
      AA: issues.filter(i => i.level === 'AA').length,
      AAA: issues.filter(i => i.level === 'AAA').length,
    };

    const status = score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor';

    return {
      score,
      status,
      levelCounts,
      message: this.getStatusMessage(score, levelCounts),
    };
  }

  /**
   * Get status message based on score
   */
  getStatusMessage(score, levelCounts) {
    if (score >= 90) {
      return '✅ Excellent accessibility! Minor improvements possible.';
    } else if (score >= 70) {
      return '👍 Good accessibility. Some issues to address.';
    } else if (score >= 50) {
      return '⚠️ Fair accessibility. Several issues need attention.';
    } else {
      return '❌ Poor accessibility. Critical issues must be fixed.';
    }
  }

  /**
   * Auto-fix all issues
   */
  autoFixAll() {
    if (!this.lastScanResults) {
      throw new Error('No scan results available. Run scan() first.');
    }

    const element = this.lastScanResults.element;
    const result = window.accessibilityFixes.applyAllFixes(element);

    // Re-scan to verify fixes
    const newResults = this.scanElement(element);

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('ai:accessibility:fixed', {
        detail: {
          fixResults: result,
          newScore: newResults.score,
          improvement: newResults.score - this.lastScanResults.score,
        },
      })
    );

    return {
      ...result,
      newScore: newResults.score,
      improvement: newResults.score - this.lastScanResults.score,
    };
  }

  /**
   * Auto-fix specific issue
   */
  autoFixIssue(issueIndex) {
    if (!this.lastScanResults) {
      throw new Error('No scan results available. Run scan() first.');
    }

    const issue = this.lastScanResults.issues[issueIndex];
    if (!issue) {
      throw new Error('Issue not found');
    }

    const element = this.lastScanResults.element;
    const result = window.accessibilityFixes.applyFix(issue.ruleId, element);

    // Re-scan to verify fix
    const newResults = this.scanElement(element);

    return {
      ...result,
      newScore: newResults.score,
      improvement: newResults.score - this.lastScanResults.score,
    };
  }

  /**
   * Get accessibility score
   */
  getScore() {
    if (!this.lastScanResults) {
      return null;
    }

    return {
      score: this.lastScanResults.score,
      status: this.lastScanResults.summary.status,
      message: this.lastScanResults.summary.message,
    };
  }

  /**
   * Generate accessibility report
   */
  generateReport() {
    if (!this.lastScanResults) {
      throw new Error('No scan results available. Run scan() first.');
    }

    const { score, totalIssues, issues, grouped, summary } = this.lastScanResults;

    const report = {
      metadata: {
        timestamp: new Date(this.lastScanResults.timestamp).toISOString(),
        score,
        status: summary.status,
        totalIssues,
      },
      summary: {
        message: summary.message,
        levelCounts: summary.levelCounts,
        criticalIssues: grouped.critical.length,
        warnings: grouped.warnings.length,
      },
      issues: issues.map((issue, index) => ({
        index,
        rule: issue.ruleName,
        ruleId: issue.ruleId,
        level: issue.level,
        wcag: issue.wcag,
        message: issue.message,
        fix: issue.fix,
        hasAutoFix: window.accessibilityFixes.hasFixFor(issue.ruleId),
      })),
      recommendations: this.generateRecommendations(issues, score),
      history: this.scanHistory,
    };

    return report;
  }

  /**
   * Generate recommendations based on issues
   */
  generateRecommendations(issues, score) {
    const recommendations = [];

    // Priority recommendations based on level A issues
    const levelAIssues = issues.filter(i => i.level === 'A');
    if (levelAIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `Fix ${levelAIssues.length} Level A issues first (required for basic accessibility)`,
      });
    }

    // Specific recommendations
    const ruleGroups = {};
    issues.forEach(issue => {
      if (!ruleGroups[issue.ruleId]) {
        ruleGroups[issue.ruleId] = [];
      }
      ruleGroups[issue.ruleId].push(issue);
    });

    Object.entries(ruleGroups).forEach(([ruleId, ruleIssues]) => {
      if (ruleIssues.length > 3) {
        recommendations.push({
          priority: 'medium',
          message: `Multiple ${ruleIssues[0].ruleName} issues (${ruleIssues.length} found)`,
        });
      }
    });

    // Score-based recommendations
    if (score < 50) {
      recommendations.push({
        priority: 'high',
        message: 'Consider using auto-fix to quickly resolve common issues',
      });
    }

    return recommendations;
  }

  /**
   * Export report as JSON
   */
  exportReport() {
    const report = this.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Get last scan results
   */
  getLastResults() {
    return this.lastScanResults;
  }

  /**
   * Get scan history
   */
  getHistory() {
    return this.scanHistory;
  }

  /**
   * Clear scan history
   */
  clearHistory() {
    this.scanHistory = [];
    this.lastScanResults = null;
  }
}

// Export globally
window.AccessibilityChecker = AccessibilityChecker;
window.accessibilityChecker = new AccessibilityChecker();
