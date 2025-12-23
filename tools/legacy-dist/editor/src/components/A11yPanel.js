/**
 * Accessibility Panel - v1.0
 *
 * UI panel for displaying accessibility scan results and fixes.
 */

class A11yPanel {
  constructor() {
    this.panel = null;
  }

  /**
   * Show accessibility panel
   */
  show(results = null) {
    if (this.panel) {
      this.panel.remove();
    }

    const scanResults = results || window.accessibilityChecker.getLastResults();

    this.panel = document.createElement('div');
    this.panel.className = 'a11y-panel';
    this.panel.innerHTML = `
            <div class="panel-header">
                <h3>♿ Accessibility Checker</h3>
                <button class="panel-close-btn">×</button>
            </div>
            <div class="panel-body">
                ${scanResults ? this.renderResults(scanResults) : this.renderNoResults()}
            </div>
        `;

    document.body.appendChild(this.panel);
    this.attachEventListeners();
  }

  /**
   * Render scan results
   */
  renderResults(results) {
    const { score, summary, issues, grouped } = results;

    return `
            <div class="score-card ${summary.status}">
                <div class="score-value">${score}</div>
                <div class="score-label">Accessibility Score</div>
                <div class="score-message">${summary.message}</div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-primary" onclick="window.a11yPanel.runScan()">
                    🔍 Scan Again
                </button>
                <button class="btn btn-success" onclick="window.a11yPanel.autoFixAll()">
                    🔧 Auto-Fix All
                </button>
                <button class="btn btn-secondary" onclick="window.accessibilityChecker.exportReport()">
                    📥 Export Report
                </button>
            </div>

            <div class="issues-summary">
                <div class="summary-item error">
                    <span class="summary-count">${grouped.critical.length}</span>
                    <span class="summary-label">Critical (Level A)</span>
                </div>
                <div class="summary-item warning">
                    <span class="summary-count">${grouped.warnings.length}</span>
                    <span class="summary-label">Warnings (Level AA)</span>
                </div>
            </div>

            <div class="issues-list">
                <h4>Issues Found (${issues.length})</h4>
                ${issues.length === 0 ? '<p class="no-issues">✅ No accessibility issues found!</p>' : ''}
                ${issues
                  .map(
                    (issue, index) => `
                    <div class="issue-item ${issue.level}">
                        <div class="issue-header">
                            <span class="issue-level">${issue.level}</span>
                            <span class="issue-wcag">WCAG ${issue.wcag}</span>
                        </div>
                        <div class="issue-title">${issue.ruleName}</div>
                        <div class="issue-message">${issue.message}</div>
                        <div class="issue-fix">
                            <strong>Fix:</strong> ${issue.fix}
                        </div>
                        ${
                          window.accessibilityFixes.hasFixFor(issue.ruleId)
                            ? `
                            <button class="btn btn-sm btn-primary" onclick="window.a11yPanel.fixIssue(${index})">
                                🔧 Auto-Fix
                            </button>
                        `
                            : ''
                        }
                    </div>
                `
                  )
                  .join('')}
            </div>
        `;
  }

  /**
   * Render no results state
   */
  renderNoResults() {
    return `
            <div class="no-results">
                <div class="no-results-icon">♿</div>
                <h4>No Scan Results</h4>
                <p>Run an accessibility scan to check your page for WCAG 2.1 AA compliance.</p>
                <button class="btn btn-primary" onclick="window.a11yPanel.runScan()">
                    🔍 Run Accessibility Scan
                </button>
            </div>
        `;
  }

  /**
   * Run accessibility scan
   */
  async runScan() {
    try {
      if (window.showToast) {
        window.showToast('🔍 Scanning for accessibility issues...');
      }

      const results = window.accessibilityChecker.scan();
      this.show(results);

      if (window.showToast) {
        window.showToast(`✅ Scan complete! Score: ${results.score}/100`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert(`Error running scan: ${error.message}`);
    }
  }

  /**
   * Auto-fix all issues
   */
  async autoFixAll() {
    try {
      if (window.showToast) {
        window.showToast('🔧 Applying auto-fixes...');
      }

      const result = window.accessibilityChecker.autoFixAll();

      if (window.showToast) {
        window.showToast(`✅ Fixed ${result.totalFixed} issues! New score: ${result.newScore}/100`);
      }

      this.show();
    } catch (error) {
      console.error('Auto-fix error:', error);
      alert(`Error applying fixes: ${error.message}`);
    }
  }

  /**
   * Fix specific issue
   */
  async fixIssue(index) {
    try {
      const result = window.accessibilityChecker.autoFixIssue(index);

      if (window.showToast) {
        window.showToast(`✅ ${result.message}`);
      }

      this.show();
    } catch (error) {
      console.error('Fix error:', error);
      alert(`Error applying fix: ${error.message}`);
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    this.panel.querySelector('.panel-close-btn').addEventListener('click', () => this.close());
  }

  /**
   * Close panel
   */
  close() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }
}

// Export globally
window.A11yPanel = A11yPanel;
window.a11yPanel = new A11yPanel();
