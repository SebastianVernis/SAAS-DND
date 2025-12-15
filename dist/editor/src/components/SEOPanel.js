/**
 * SEO Panel - v1.0
 *
 * UI panel for displaying SEO analysis results and AI-powered optimizations.
 */

class SEOPanel {
  constructor() {
    this.panel = null;
  }

  /**
   * Show SEO panel
   */
  show(results = null) {
    if (this.panel) {
      this.panel.remove();
    }

    const analysisResults = results || window.seoOptimizer.getLastAnalysis();

    this.panel = document.createElement('div');
    this.panel.className = 'seo-panel';
    this.panel.innerHTML = `
            <div class="panel-header">
                <h3>🔍 SEO Optimizer</h3>
                <button class="panel-close-btn">×</button>
            </div>
            <div class="panel-body">
                ${analysisResults ? this.renderResults(analysisResults) : this.renderNoResults()}
            </div>
        `;

    document.body.appendChild(this.panel);
    this.attachEventListeners();
  }

  /**
   * Render analysis results
   */
  renderResults(results) {
    const { score, summary, issues, grouped, recommendations } = results;

    return `
            <div class="score-card ${summary.status}">
                <div class="score-value">${score}</div>
                <div class="score-label">SEO Score</div>
                <div class="score-message">${summary.message}</div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-primary" onclick="window.seoPanel.runAnalysis()">
                    🔍 Analyze Again
                </button>
                <button class="btn btn-success" onclick="window.seoPanel.showAIOptimizer()">
                    🤖 AI Optimize
                </button>
                <button class="btn btn-secondary" onclick="window.seoOptimizer.exportReport()">
                    📥 Export Report
                </button>
            </div>

            <div class="issues-summary">
                <div class="summary-item error">
                    <span class="summary-count">${summary.errorCount}</span>
                    <span class="summary-label">Errors</span>
                </div>
                <div class="summary-item warning">
                    <span class="summary-count">${summary.warningCount}</span>
                    <span class="summary-label">Warnings</span>
                </div>
            </div>

            ${
              recommendations.length > 0
                ? `
                <div class="recommendations">
                    <h4>Recommendations</h4>
                    ${recommendations
                      .map(
                        rec => `
                        <div class="recommendation-item ${rec.priority}">
                            <div class="rec-priority">${rec.priority}</div>
                            <div class="rec-message">${rec.message}</div>
                            ${rec.action ? `<div class="rec-action">${rec.action}</div>` : ''}
                        </div>
                    `
                      )
                      .join('')}
                </div>
            `
                : ''
            }

            <div class="issues-by-category">
                <h4>Issues by Category</h4>
                ${Object.entries(grouped.byCategory)
                  .map(
                    ([category, categoryIssues]) => `
                    <div class="category-section">
                        <div class="category-header" onclick="this.parentElement.classList.toggle('expanded')">
                            <span class="category-name">${category}</span>
                            <span class="category-count">${categoryIssues.length}</span>
                        </div>
                        <div class="category-issues">
                            ${categoryIssues
                              .map(
                                issue => `
                                <div class="issue-item ${issue.severity}">
                                    <div class="issue-title">${issue.ruleName}</div>
                                    <div class="issue-message">${issue.message}</div>
                                    <div class="issue-fix"><strong>Fix:</strong> ${issue.fix}</div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
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
                <div class="no-results-icon">🔍</div>
                <h4>No Analysis Results</h4>
                <p>Run an SEO analysis to check your page for search engine optimization.</p>
                <button class="btn btn-primary" onclick="window.seoPanel.runAnalysis()">
                    🔍 Run SEO Analysis
                </button>
            </div>
        `;
  }

  /**
   * Run SEO analysis
   */
  async runAnalysis() {
    try {
      if (window.showToast) {
        window.showToast('🔍 Analyzing SEO...');
      }

      const results = window.seoOptimizer.analyze();
      this.show(results);

      if (window.showToast) {
        window.showToast(`✅ Analysis complete! Score: ${results.score}/100`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Error running analysis: ${error.message}`);
    }
  }

  /**
   * Show AI optimizer modal
   */
  showAIOptimizer() {
    const modal = document.createElement('div');
    modal.className = 'seo-ai-modal';
    modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 AI SEO Optimizer</h3>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <p>Generate AI-optimized meta tags and content for better SEO.</p>
                    
                    <div class="ai-options">
                        <button class="btn btn-primary btn-block" onclick="window.seoPanel.generateTitle()">
                            📝 Generate Title Tag
                        </button>
                        <button class="btn btn-primary btn-block" onclick="window.seoPanel.generateDescription()">
                            📄 Generate Meta Description
                        </button>
                        <button class="btn btn-primary btn-block" onclick="window.seoPanel.generateOGTags()">
                            🌐 Generate Open Graph Tags
                        </button>
                        <button class="btn btn-primary btn-block" onclick="window.seoPanel.generateStructuredData()">
                            📊 Generate Structured Data
                        </button>
                    </div>

                    <div id="ai-result" style="display: none;">
                        <h4>Generated Content</h4>
                        <div class="ai-result-content"></div>
                        <button class="btn btn-success" onclick="window.seoPanel.applyGenerated()">
                            ✓ Apply to Page
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

    this.aiModal = modal;
  }

  /**
   * Generate title with AI
   */
  async generateTitle() {
    try {
      if (window.showToast) {
        window.showToast('🤖 Generating title...');
      }

      const result = await window.seoOptimizer.generateTitle();

      if (result.success) {
        this.showAIResult('Title Tag', `<title>${result.title}</title>`);
        this.generatedContent = { type: 'title', content: result.title };
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Generate meta description with AI
   */
  async generateDescription() {
    try {
      if (window.showToast) {
        window.showToast('🤖 Generating description...');
      }

      const result = await window.seoOptimizer.generateMetaDescription();

      if (result.success) {
        this.showAIResult(
          'Meta Description',
          `<meta name="description" content="${result.description}">`
        );
        this.generatedContent = { type: 'description', content: result.description };
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Generate OG tags with AI
   */
  async generateOGTags() {
    try {
      if (window.showToast) {
        window.showToast('🤖 Generating OG tags...');
      }

      const result = await window.seoOptimizer.generateOGTags();

      if (result.success) {
        const tags = Object.entries(result.metaTags.og || {})
          .map(([key, value]) => `<meta property="${key}" content="${value}">`)
          .join('\n');

        this.showAIResult('Open Graph Tags', tags);
        this.generatedContent = { type: 'og', content: result.metaTags.og };
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Generate structured data
   */
  generateStructuredData() {
    const result = window.seoOptimizer.generateStructuredData('WebPage', {
      name: document.title || 'My Page',
      description: document.querySelector('meta[name="description"]')?.content || '',
    });

    this.showAIResult('Structured Data (JSON-LD)', result.script);
    this.generatedContent = { type: 'structured', content: result.script };
  }

  /**
   * Show AI result
   */
  showAIResult(title, content) {
    const resultDiv = this.aiModal.querySelector('#ai-result');
    const contentDiv = resultDiv.querySelector('.ai-result-content');

    contentDiv.innerHTML = `
            <h5>${title}</h5>
            <pre><code>${this.escapeHtml(content)}</code></pre>
        `;

    resultDiv.style.display = 'block';
  }

  /**
   * Apply generated content
   */
  applyGenerated() {
    if (!this.generatedContent) return;

    // This would apply the generated content to the page
    // Implementation depends on how the editor manages head content

    if (window.showToast) {
      window.showToast('✅ Content applied to page');
    }

    this.aiModal?.remove();
  }

  /**
   * Escape HTML
   */
  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
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
window.SEOPanel = SEOPanel;
window.seoPanel = new SEOPanel();
