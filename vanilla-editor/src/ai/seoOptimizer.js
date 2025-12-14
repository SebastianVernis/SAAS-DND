/**
 * SEO Optimizer - v1.0
 *
 * AI-powered SEO analyzer and optimizer.
 * Analyzes pages for SEO issues and generates optimized meta tags.
 */

class SEOOptimizer {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
    this.enabled = false;
    this.lastAnalysis = null;

    this.loadApiKey();
  }

  /**
   * Load API key from localStorage
   */
  loadApiKey() {
    this.apiKey = localStorage.getItem('gemini_api_key');
    this.enabled = !!this.apiKey;
  }

  /**
   * Check if optimizer is enabled
   */
  isEnabled() {
    return this.enabled && this.apiKey !== null;
  }

  /**
   * Analyze page for SEO
   */
  analyze() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Run SEO rules
    const issues = window.seoRules.checkAll(canvas);
    const score = window.seoRules.calculateScore(issues);

    // Group issues
    const grouped = this.groupIssues(issues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, score);

    // Store results
    this.lastAnalysis = {
      timestamp: Date.now(),
      score,
      totalIssues: issues.length,
      issues,
      grouped,
      recommendations,
      summary: this.generateSummary(score, issues),
    };

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('ai:seo:analyzed', {
        detail: this.lastAnalysis,
      })
    );

    return this.lastAnalysis;
  }

  /**
   * Group issues by category and severity
   */
  groupIssues(issues) {
    const grouped = {
      byCategory: {},
      bySeverity: { error: [], warning: [], info: [] },
    };

    issues.forEach(issue => {
      // By category
      if (!grouped.byCategory[issue.category]) {
        grouped.byCategory[issue.category] = [];
      }
      grouped.byCategory[issue.category].push(issue);

      // By severity
      if (grouped.bySeverity[issue.severity]) {
        grouped.bySeverity[issue.severity].push(issue);
      }
    });

    return grouped;
  }

  /**
   * Generate summary
   */
  generateSummary(score, issues) {
    const status = score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor';

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    return {
      score,
      status,
      errorCount,
      warningCount,
      message: this.getStatusMessage(score),
    };
  }

  /**
   * Get status message
   */
  getStatusMessage(score) {
    if (score >= 90) {
      return '✅ Excellent SEO! Your page is well-optimized.';
    } else if (score >= 70) {
      return '👍 Good SEO. Some improvements recommended.';
    } else if (score >= 50) {
      return '⚠️ Fair SEO. Several issues need attention.';
    } else {
      return '❌ Poor SEO. Critical issues must be fixed.';
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(issues, score) {
    const recommendations = [];

    // Priority recommendations
    const errors = issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `Fix ${errors.length} critical SEO errors first`,
        issues: errors.map(e => e.ruleId),
      });
    }

    // Category-specific recommendations
    const metaIssues = issues.filter(i => i.category === 'meta');
    if (metaIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        message: 'Optimize meta tags for better search visibility',
        action: 'Use AI to generate optimized meta tags',
      });
    }

    const contentIssues = issues.filter(i => i.category === 'content');
    if (contentIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: 'Improve content structure and quality',
        issues: contentIssues.map(i => i.ruleId),
      });
    }

    const socialIssues = issues.filter(i => i.category === 'social');
    if (socialIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: 'Add social media meta tags for better sharing',
        action: 'Use AI to generate Open Graph and Twitter Card tags',
      });
    }

    return recommendations;
  }

  /**
   * Generate optimized title with AI
   */
  async generateTitle(context = {}) {
    if (!this.isEnabled()) {
      throw new Error('SEO Optimizer is not enabled. Please configure Gemini API key.');
    }

    const canvas = document.getElementById('canvas');
    const content = canvas ? canvas.textContent.substring(0, 1000) : '';

    const prompt = `Generate an SEO-optimized page title (50-60 characters).

Content: ${content}
Context: ${JSON.stringify(context)}

Requirements:
- 50-60 characters
- Include primary keyword
- Compelling and descriptive
- Natural language

Return ONLY the title text, no explanations.`;

    try {
      const response = await this.callGeminiAPI(prompt, { maxOutputTokens: 100 });
      const parsed = window.responseParser.parseResponse(response);

      if (!parsed.success) {
        throw new Error('Failed to generate title');
      }

      window.tokenTracker.track(
        { inputTokens: parsed.tokens.input, outputTokens: parsed.tokens.output },
        'seo-title-generation',
        context
      );

      return {
        success: true,
        title: parsed.text.trim().replace(/^["']|["']$/g, ''),
        tokens: parsed.tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate meta description with AI
   */
  async generateMetaDescription(context = {}) {
    if (!this.isEnabled()) {
      throw new Error('SEO Optimizer is not enabled.');
    }

    const canvas = document.getElementById('canvas');
    const content = canvas ? canvas.textContent.substring(0, 1000) : '';

    const prompt = `Generate an SEO-optimized meta description (150-160 characters).

Content: ${content}
Context: ${JSON.stringify(context)}

Requirements:
- 150-160 characters
- Include primary keyword
- Compelling call-to-action
- Accurate summary

Return ONLY the description text, no explanations.`;

    try {
      const response = await this.callGeminiAPI(prompt, { maxOutputTokens: 150 });
      const parsed = window.responseParser.parseResponse(response);

      if (!parsed.success) {
        throw new Error('Failed to generate meta description');
      }

      window.tokenTracker.track(
        { inputTokens: parsed.tokens.input, outputTokens: parsed.tokens.output },
        'seo-description-generation',
        context
      );

      return {
        success: true,
        description: parsed.text.trim().replace(/^["']|["']$/g, ''),
        tokens: parsed.tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate Open Graph tags with AI
   */
  async generateOGTags(context = {}) {
    if (!this.isEnabled()) {
      throw new Error('SEO Optimizer is not enabled.');
    }

    const canvas = document.getElementById('canvas');
    const content = canvas ? canvas.textContent.substring(0, 1000) : '';

    const prompt = window.promptBuilder.buildMetaTagsPrompt(content, context);

    try {
      const response = await this.callGeminiAPI(prompt, { maxOutputTokens: 512 });
      const parsed = window.responseParser.parseMetaTagsResponse(response);

      if (!parsed.success) {
        throw new Error('Failed to generate OG tags');
      }

      window.tokenTracker.track(
        { inputTokens: parsed.tokens.input, outputTokens: parsed.tokens.output },
        'seo-og-tags-generation',
        context
      );

      return {
        success: true,
        metaTags: parsed.metaTags,
        tokens: parsed.tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate structured data (JSON-LD)
   */
  generateStructuredData(type = 'WebPage', data = {}) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    // Add common fields if not provided
    if (!structuredData.name && document.title) {
      structuredData.name = document.title;
    }

    if (!structuredData.url) {
      structuredData.url = window.location.href;
    }

    return {
      success: true,
      structuredData,
      script: `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n</script>`,
    };
  }

  /**
   * Get SEO score
   */
  getScore() {
    if (!this.lastAnalysis) {
      return null;
    }

    return {
      score: this.lastAnalysis.score,
      status: this.lastAnalysis.summary.status,
      message: this.lastAnalysis.summary.message,
    };
  }

  /**
   * Generate SEO report
   */
  generateReport() {
    if (!this.lastAnalysis) {
      throw new Error('No analysis available. Run analyze() first.');
    }

    const { score, totalIssues, issues, grouped, recommendations, summary } = this.lastAnalysis;

    return {
      metadata: {
        timestamp: new Date(this.lastAnalysis.timestamp).toISOString(),
        score,
        status: summary.status,
        totalIssues,
      },
      summary: {
        message: summary.message,
        errorCount: summary.errorCount,
        warningCount: summary.warningCount,
      },
      issues: issues.map((issue, index) => ({
        index,
        rule: issue.ruleName,
        ruleId: issue.ruleId,
        category: issue.category,
        severity: issue.severity,
        message: issue.message,
        fix: issue.fix,
      })),
      recommendations,
      categories: Object.keys(grouped.byCategory).map(category => ({
        name: category,
        issueCount: grouped.byCategory[category].length,
        issues: grouped.byCategory[category],
      })),
    };
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
    a.download = `seo-report-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt, config = {}) {
    const { maxOutputTokens = 512, temperature = 0.3 } = config;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        topK: 20,
        topP: 0.8,
        maxOutputTokens,
      },
    };

    const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get last analysis results
   */
  getLastAnalysis() {
    return this.lastAnalysis;
  }
}

// Export globally
window.SEOOptimizer = SEOOptimizer;
window.seoOptimizer = new SEOOptimizer();
