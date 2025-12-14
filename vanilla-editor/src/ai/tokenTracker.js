/**
 * Token Tracker - v1.0
 *
 * Tracks Gemini API token usage and manages cost estimation.
 * Provides usage analytics and quota management.
 */

class TokenTracker {
  constructor() {
    this.storageKey = 'gemini_token_usage';
    this.usage = this.loadUsage();
    this.limits = {
      daily: 1500,
      monthly: 45000,
      perRequest: 2048,
    };

    // Pricing (approximate for gemini-2.0-flash-lite)
    this.pricing = {
      inputTokensPer1M: 0.075, // $0.075 per 1M input tokens
      outputTokensPer1M: 0.3, // $0.30 per 1M output tokens
    };
  }

  /**
   * Load usage data from localStorage
   */
  loadUsage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Reset daily counter if it's a new day
        const today = new Date().toDateString();
        if (data.lastResetDate !== today) {
          data.daily = { input: 0, output: 0, requests: 0 };
          data.lastResetDate = today;
        }
        return data;
      }
    } catch (error) {
      console.error('Error loading token usage:', error);
    }

    return this.getDefaultUsage();
  }

  /**
   * Get default usage structure
   */
  getDefaultUsage() {
    return {
      daily: { input: 0, output: 0, requests: 0 },
      monthly: { input: 0, output: 0, requests: 0 },
      total: { input: 0, output: 0, requests: 0 },
      byFeature: {},
      history: [],
      lastResetDate: new Date().toDateString(),
      monthStartDate: new Date().toISOString().slice(0, 7), // YYYY-MM
    };
  }

  /**
   * Save usage data to localStorage
   */
  saveUsage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.usage));
    } catch (error) {
      console.error('Error saving token usage:', error);
    }
  }

  /**
   * Track token usage for a request
   */
  track(tokensUsed, feature = 'unknown', metadata = {}) {
    const { inputTokens = 0, outputTokens = 0 } = tokensUsed;
    const totalTokens = inputTokens + outputTokens;

    // Check if we need to reset monthly counter
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (this.usage.monthStartDate !== currentMonth) {
      this.usage.monthly = { input: 0, output: 0, requests: 0 };
      this.usage.monthStartDate = currentMonth;
    }

    // Update counters
    this.usage.daily.input += inputTokens;
    this.usage.daily.output += outputTokens;
    this.usage.daily.requests += 1;

    this.usage.monthly.input += inputTokens;
    this.usage.monthly.output += outputTokens;
    this.usage.monthly.requests += 1;

    this.usage.total.input += inputTokens;
    this.usage.total.output += outputTokens;
    this.usage.total.requests += 1;

    // Track by feature
    if (!this.usage.byFeature[feature]) {
      this.usage.byFeature[feature] = { input: 0, output: 0, requests: 0, cost: 0 };
    }
    this.usage.byFeature[feature].input += inputTokens;
    this.usage.byFeature[feature].output += outputTokens;
    this.usage.byFeature[feature].requests += 1;
    this.usage.byFeature[feature].cost += this.calculateCost(inputTokens, outputTokens);

    // Add to history
    this.usage.history.push({
      timestamp: Date.now(),
      feature,
      inputTokens,
      outputTokens,
      totalTokens,
      cost: this.calculateCost(inputTokens, outputTokens),
      metadata,
    });

    // Keep only last 100 entries in history
    if (this.usage.history.length > 100) {
      this.usage.history = this.usage.history.slice(-100);
    }

    this.saveUsage();

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('ai:tokens:tracked', {
        detail: { feature, tokensUsed, totalUsage: this.getUsage() },
      })
    );

    return this.getUsage();
  }

  /**
   * Calculate cost for tokens
   */
  calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000000) * this.pricing.inputTokensPer1M;
    const outputCost = (outputTokens / 1000000) * this.pricing.outputTokensPer1M;
    return inputCost + outputCost;
  }

  /**
   * Get current usage statistics
   */
  getUsage() {
    return {
      daily: { ...this.usage.daily },
      monthly: { ...this.usage.monthly },
      total: { ...this.usage.total },
      byFeature: { ...this.usage.byFeature },
      limits: { ...this.limits },
      costs: {
        daily: this.calculateCost(this.usage.daily.input, this.usage.daily.output),
        monthly: this.calculateCost(this.usage.monthly.input, this.usage.monthly.output),
        total: this.calculateCost(this.usage.total.input, this.usage.total.output),
      },
      percentages: {
        daily: ((this.usage.daily.input + this.usage.daily.output) / this.limits.daily) * 100,
        monthly:
          ((this.usage.monthly.input + this.usage.monthly.output) / this.limits.monthly) * 100,
      },
    };
  }

  /**
   * Check if limits are exceeded
   */
  checkLimits() {
    const dailyTotal = this.usage.daily.input + this.usage.daily.output;
    const monthlyTotal = this.usage.monthly.input + this.usage.monthly.output;

    const warnings = [];

    if (dailyTotal >= this.limits.daily) {
      warnings.push({
        type: 'daily',
        message: 'Daily token limit reached',
        current: dailyTotal,
        limit: this.limits.daily,
      });
    } else if (dailyTotal >= this.limits.daily * 0.8) {
      warnings.push({
        type: 'daily',
        message: 'Approaching daily token limit (80%)',
        current: dailyTotal,
        limit: this.limits.daily,
      });
    }

    if (monthlyTotal >= this.limits.monthly) {
      warnings.push({
        type: 'monthly',
        message: 'Monthly token limit reached',
        current: monthlyTotal,
        limit: this.limits.monthly,
      });
    } else if (monthlyTotal >= this.limits.monthly * 0.8) {
      warnings.push({
        type: 'monthly',
        message: 'Approaching monthly token limit (80%)',
        current: monthlyTotal,
        limit: this.limits.monthly,
      });
    }

    return {
      exceeded: warnings.some(w => w.current >= w.limit),
      warnings,
      canProceed: dailyTotal < this.limits.daily && monthlyTotal < this.limits.monthly,
    };
  }

  /**
   * Estimate tokens for a prompt
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    const estimated = Math.ceil(text.length / 4);
    return {
      estimated,
      canAfford: estimated < this.limits.perRequest,
      remaining: {
        daily: this.limits.daily - (this.usage.daily.input + this.usage.daily.output),
        monthly: this.limits.monthly - (this.usage.monthly.input + this.usage.monthly.output),
      },
    };
  }

  /**
   * Reset daily usage (for testing or manual reset)
   */
  resetDaily() {
    this.usage.daily = { input: 0, output: 0, requests: 0 };
    this.usage.lastResetDate = new Date().toDateString();
    this.saveUsage();
  }

  /**
   * Reset monthly usage (for testing or manual reset)
   */
  resetMonthly() {
    this.usage.monthly = { input: 0, output: 0, requests: 0 };
    this.usage.monthStartDate = new Date().toISOString().slice(0, 7);
    this.saveUsage();
  }

  /**
   * Reset all usage data
   */
  resetAll() {
    this.usage = this.getDefaultUsage();
    this.saveUsage();
  }

  /**
   * Get usage history
   */
  getHistory(limit = 20) {
    return this.usage.history.slice(-limit).reverse();
  }

  /**
   * Export usage data
   */
  exportData() {
    return {
      ...this.usage,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
  }

  /**
   * Show usage dashboard
   */
  showDashboard() {
    const usage = this.getUsage();
    const modal = document.createElement('div');
    modal.className = 'token-tracker-modal';
    modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Token Usage Dashboard</h3>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="usage-summary">
                        <div class="usage-card">
                            <h4>Daily Usage</h4>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${Math.min(usage.percentages.daily, 100)}%"></div>
                            </div>
                            <p>${usage.daily.input + usage.daily.output} / ${usage.limits.daily} tokens</p>
                            <p class="usage-cost">Cost: $${usage.costs.daily.toFixed(4)}</p>
                        </div>
                        <div class="usage-card">
                            <h4>Monthly Usage</h4>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${Math.min(usage.percentages.monthly, 100)}%"></div>
                            </div>
                            <p>${usage.monthly.input + usage.monthly.output} / ${usage.limits.monthly} tokens</p>
                            <p class="usage-cost">Cost: $${usage.costs.monthly.toFixed(4)}</p>
                        </div>
                        <div class="usage-card">
                            <h4>Total Usage</h4>
                            <p>${usage.total.input + usage.total.output} tokens</p>
                            <p>${usage.total.requests} requests</p>
                            <p class="usage-cost">Cost: $${usage.costs.total.toFixed(4)}</p>
                        </div>
                    </div>
                    
                    <div class="usage-by-feature">
                        <h4>Usage by Feature</h4>
                        ${Object.entries(usage.byFeature)
                          .map(
                            ([feature, data]) => `
                            <div class="feature-row">
                                <span class="feature-name">${feature}</span>
                                <span class="feature-tokens">${data.input + data.output} tokens</span>
                                <span class="feature-cost">$${data.cost.toFixed(4)}</span>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                    
                    <div class="usage-actions">
                        <button class="btn btn-secondary" onclick="window.tokenTracker.resetDaily()">Reset Daily</button>
                        <button class="btn btn-secondary" onclick="window.tokenTracker.resetMonthly()">Reset Monthly</button>
                        <button class="btn btn-danger" onclick="if(confirm('Reset all usage data?')) window.tokenTracker.resetAll()">Reset All</button>
                    </div>
                </div>
            </div>
        `;

    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

    document.body.appendChild(modal);
  }
}

// Export globally
window.TokenTracker = TokenTracker;
window.tokenTracker = new TokenTracker();
