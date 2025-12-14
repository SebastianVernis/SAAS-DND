/**
 * AI Features Integration - v1.0
 *
 * Main entry point for all AI features.
 * Loads and initializes all AI modules and exposes global APIs.
 */

// Load all AI modules
import './tokenTracker.js';
import './promptBuilder.js';
import './responseParser.js';
import './componentGenerator.js';
import './wcagRules.js';
import './accessibilityFixes.js';
import './accessibilityChecker.js';
import './seoRules.js';
import './seoOptimizer.js';

// Load UI components
import '../components/aiGenerator/GeneratorModal.js';
import '../components/A11yPanel.js';
import '../components/SEOPanel.js';

/**
 * Initialize AI features
 */
function initializeAIFeatures() {
  console.log('🤖 Initializing AI Features...');

  // Check if Gemini API key is configured
  const apiKey = localStorage.getItem('gemini_api_key');
  if (apiKey) {
    console.log('✅ Gemini API key found');
  } else {
    console.log('⚠️ Gemini API key not configured');
  }

  // Expose global APIs as specified in workflow documentation
  window.aiComponentGenerator = window.aiComponentGenerator || new window.AIComponentGenerator();
  window.accessibilityChecker = window.accessibilityChecker || new window.AccessibilityChecker();
  window.seoOptimizer = window.seoOptimizer || new window.SEOOptimizer();
  window.tokenTracker = window.tokenTracker || new window.TokenTracker();

  // Expose UI components
  window.generatorModal = window.generatorModal || new window.GeneratorModal();
  window.a11yPanel = window.a11yPanel || new window.A11yPanel();
  window.seoPanel = window.seoPanel || new window.SEOPanel();

  // Add event listeners for AI events
  setupEventListeners();

  console.log('✅ AI Features initialized');
}

/**
 * Setup event listeners for AI operations
 */
function setupEventListeners() {
  // Component generation events
  window.addEventListener('ai:generation:start', e => {
    console.log('🤖 Component generation started:', e.detail);
  });

  window.addEventListener('ai:generation:complete', e => {
    console.log('✅ Component generation complete:', e.detail);
  });

  window.addEventListener('ai:generation:error', e => {
    console.error('❌ Component generation error:', e.detail);
  });

  // Accessibility events
  window.addEventListener('ai:accessibility:scanned', e => {
    console.log('♿ Accessibility scan complete:', e.detail);
  });

  window.addEventListener('ai:accessibility:fixed', e => {
    console.log('🔧 Accessibility fixes applied:', e.detail);
  });

  // SEO events
  window.addEventListener('ai:seo:analyzed', e => {
    console.log('🔍 SEO analysis complete:', e.detail);
  });

  // Token tracking events
  window.addEventListener('ai:tokens:tracked', e => {
    console.log('📊 Tokens tracked:', e.detail);
  });
}

/**
 * Show AI Component Generator
 */
window.showAIGenerator = function () {
  if (!window.generatorModal) {
    console.error('Generator modal not initialized');
    return;
  }
  window.generatorModal.show();
};

/**
 * Show Accessibility Panel
 */
window.showA11yPanel = function () {
  if (!window.a11yPanel) {
    console.error('A11y panel not initialized');
    return;
  }
  window.a11yPanel.show();
};

/**
 * Show SEO Panel
 */
window.showSEOPanel = function () {
  if (!window.seoPanel) {
    console.error('SEO panel not initialized');
    return;
  }
  window.seoPanel.show();
};

/**
 * Show Token Usage Dashboard
 */
window.showTokenDashboard = function () {
  if (!window.tokenTracker) {
    console.error('Token tracker not initialized');
    return;
  }
  window.tokenTracker.showDashboard();
};

/**
 * Configure Gemini API Key
 */
window.configureGeminiAPI = function () {
  const modal = document.createElement('div');
  modal.className = 'gemini-config-modal';
  modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚙️ Configure Gemini API</h3>
                <button class="modal-close-btn">×</button>
            </div>
            <div class="modal-body">
                <div class="config-info">
                    <p>To use AI features, you need a Gemini API key from Google.</p>
                    <p><strong>Model:</strong> gemini-2.0-flash-lite (optimized for low cost)</p>
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener">
                        🔗 Get Free API Key
                    </a>
                </div>
                
                <div class="form-group">
                    <label for="gemini-api-key-input">API Key</label>
                    <input 
                        type="password" 
                        id="gemini-api-key-input" 
                        placeholder="AIza..." 
                        value="${localStorage.getItem('gemini_api_key') || ''}"
                    >
                </div>
                
                <div class="config-status">
                    ${
                      localStorage.getItem('gemini_api_key')
                        ? '<span class="status-enabled">✅ API Key Configured</span>'
                        : '<span class="status-disabled">⚠️ No API Key</span>'
                    }
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                ${
                  localStorage.getItem('gemini_api_key')
                    ? '<button class="btn btn-danger" data-action="remove">Remove Key</button>'
                    : ''
                }
                <button class="btn btn-primary" data-action="save">Save</button>
            </div>
        </div>
    `;

  const closeModal = () => modal.remove();

  modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);

  modal.querySelector('[data-action="save"]').addEventListener('click', () => {
    const input = modal.querySelector('#gemini-api-key-input');
    const key = input.value.trim();

    if (key) {
      localStorage.setItem('gemini_api_key', key);

      // Reinitialize AI components with new key
      window.aiComponentGenerator.loadApiKey();
      window.seoOptimizer.loadApiKey();

      if (window.showToast) {
        window.showToast('✅ Gemini API key saved successfully');
      }
      closeModal();
    } else {
      alert('Please enter a valid API key');
    }
  });

  const removeBtn = modal.querySelector('[data-action="remove"]');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (confirm('Remove Gemini API key?')) {
        localStorage.removeItem('gemini_api_key');
        window.aiComponentGenerator.loadApiKey();
        window.seoOptimizer.loadApiKey();

        if (window.showToast) {
          window.showToast('🗑️ API key removed');
        }
        closeModal();
      }
    });
  }

  document.body.appendChild(modal);
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAIFeatures);
} else {
  initializeAIFeatures();
}

// Export for module systems
export { initializeAIFeatures, setupEventListeners };
