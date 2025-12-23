/**
 * Generator Modal - v1.0
 *
 * UI modal for AI component generation.
 * Provides interface for description input, style selection, and preview.
 */

class GeneratorModal {
  constructor() {
    this.modal = null;
    this.currentGeneration = null;
    this.isGenerating = false;
  }

  /**
   * Show the generator modal
   */
  show() {
    if (this.modal) {
      this.modal.remove();
    }

    const stylePresets = window.promptBuilder.getStylePresets();

    this.modal = document.createElement('div');
    this.modal.className = 'ai-generator-modal';
    this.modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 AI Component Generator</h3>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="generator-form">
                        <div class="form-group">
                            <label for="component-description">Describe your component</label>
                            <textarea 
                                id="component-description" 
                                placeholder="E.g., A pricing card with three tiers, each with a title, price, features list, and call-to-action button"
                                rows="4"
                            ></textarea>
                            <div class="form-hint">
                                <span id="char-count">0</span> characters
                                <span id="token-estimate"></span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Style Preset</label>
                            <div class="style-presets">
                                ${Object.entries(stylePresets)
                                  .map(
                                    ([key, preset]) => `
                                    <div class="style-preset-card ${key === 'modern' ? 'active' : ''}" data-style="${key}">
                                        <div class="preset-name">${preset.name}</div>
                                        <div class="preset-description">${preset.description}</div>
                                    </div>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Options</label>
                            <div class="options-grid">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="opt-responsive" checked>
                                    <span>Responsive Design</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="opt-accessible" checked>
                                    <span>WCAG Accessible</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="opt-javascript">
                                    <span>Include JavaScript</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="generation-preview" style="display: none;">
                        <div class="preview-header">
                            <h4>Generated Component</h4>
                            <div class="preview-actions">
                                <button class="btn btn-secondary" id="btn-regenerate">🔄 Regenerate</button>
                                <button class="btn btn-secondary" id="btn-variations">🎨 Variations</button>
                                <button class="btn btn-primary" id="btn-insert">✓ Insert to Canvas</button>
                            </div>
                        </div>
                        <div class="preview-frame">
                            <iframe id="preview-iframe"></iframe>
                        </div>
                        <div class="preview-stats">
                            <span id="preview-tokens"></span>
                            <span id="preview-validation"></span>
                        </div>
                    </div>

                    <div class="generation-loading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>Generating component with AI...</p>
                        <p class="loading-hint">This may take a few seconds</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn btn-primary" id="btn-generate">🚀 Generate</button>
                </div>
            </div>
        `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close modal
    const closeModal = () => this.close();
    this.modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    this.modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    this.modal.querySelector('#btn-cancel').addEventListener('click', closeModal);

    // Description input
    const descriptionInput = this.modal.querySelector('#component-description');
    descriptionInput.addEventListener('input', () => this.updateCharCount());

    // Style preset selection
    this.modal.querySelectorAll('.style-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        this.modal
          .querySelectorAll('.style-preset-card')
          .forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    // Generate button
    this.modal.querySelector('#btn-generate').addEventListener('click', () => this.generate());

    // Preview actions
    this.modal.querySelector('#btn-regenerate')?.addEventListener('click', () => this.generate());
    this.modal
      .querySelector('#btn-variations')
      ?.addEventListener('click', () => this.generateVariations());
    this.modal.querySelector('#btn-insert')?.addEventListener('click', () => this.insertToCanvas());
  }

  /**
   * Update character count
   */
  updateCharCount() {
    const description = this.modal.querySelector('#component-description').value;
    const charCount = description.length;

    this.modal.querySelector('#char-count').textContent = charCount;

    // Estimate tokens
    if (charCount > 0) {
      const activeStyle = this.modal.querySelector('.style-preset-card.active').dataset.style;
      const estimation = window.aiComponentGenerator.estimateTokens(description, activeStyle);

      const estimateEl = this.modal.querySelector('#token-estimate');
      estimateEl.textContent = `≈ ${estimation.estimated} tokens`;
      estimateEl.className = estimation.canAfford ? 'token-ok' : 'token-warning';
    }
  }

  /**
   * Generate component
   */
  async generate() {
    if (this.isGenerating) return;

    const description = this.modal.querySelector('#component-description').value.trim();
    if (!description) {
      alert('Please describe the component you want to generate');
      return;
    }

    const activeStyle = this.modal.querySelector('.style-preset-card.active').dataset.style;
    const options = {
      style: activeStyle,
      responsive: this.modal.querySelector('#opt-responsive').checked,
      accessible: this.modal.querySelector('#opt-accessible').checked,
      includeJS: this.modal.querySelector('#opt-javascript').checked,
    };

    this.isGenerating = true;
    this.showLoading();

    try {
      const result = await window.aiComponentGenerator.generate(description, options);

      if (result.success) {
        this.currentGeneration = result;
        this.showPreview(result);

        if (window.showToast) {
          window.showToast('✅ Component generated successfully!');
        }
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error generating component: ${error.message}`);
      this.hideLoading();
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate variations
   */
  async generateVariations() {
    if (!this.currentGeneration || this.isGenerating) return;

    this.isGenerating = true;
    this.showLoading();

    try {
      const result = await window.aiComponentGenerator.generateVariations(
        this.currentGeneration.html,
        3
      );

      if (result.success) {
        this.showVariationsModal(result.variations);
      }
    } catch (error) {
      console.error('Variations error:', error);
      alert(`Error generating variations: ${error.message}`);
    } finally {
      this.isGenerating = false;
      this.hideLoading();
    }
  }

  /**
   * Show variations modal
   */
  showVariationsModal(variations) {
    const variationsModal = document.createElement('div');
    variationsModal.className = 'variations-modal';
    variationsModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎨 Component Variations</h3>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="variations-grid">
                        ${variations
                          .map(
                            (variation, index) => `
                            <div class="variation-card" data-index="${index}">
                                <div class="variation-preview">
                                    <iframe srcdoc="${this.escapeHtml(variation.html)}"></iframe>
                                </div>
                                <div class="variation-footer">
                                    <span class="variation-style">${variation.style}</span>
                                    <button class="btn btn-sm btn-primary" onclick="window.generatorModal.selectVariation(${index})">
                                        Select
                                    </button>
                                </div>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(variationsModal);

    variationsModal.querySelector('.modal-close-btn').addEventListener('click', () => {
      variationsModal.remove();
    });
    variationsModal.querySelector('.modal-overlay').addEventListener('click', () => {
      variationsModal.remove();
    });

    // Store variations for selection
    this.currentVariations = variations;
  }

  /**
   * Select variation
   */
  selectVariation(index) {
    if (this.currentVariations && this.currentVariations[index]) {
      this.currentGeneration.html = this.currentVariations[index].html;
      this.showPreview(this.currentGeneration);
      document.querySelector('.variations-modal')?.remove();
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.modal.querySelector('.generator-form').style.display = 'none';
    this.modal.querySelector('.generation-preview').style.display = 'none';
    this.modal.querySelector('.generation-loading').style.display = 'block';
    this.modal.querySelector('#btn-generate').disabled = true;
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.modal.querySelector('.generation-loading').style.display = 'none';
    this.modal.querySelector('.generator-form').style.display = 'block';
    this.modal.querySelector('#btn-generate').disabled = false;
  }

  /**
   * Show preview
   */
  showPreview(result) {
    this.modal.querySelector('.generator-form').style.display = 'none';
    this.modal.querySelector('.generation-loading').style.display = 'none';
    this.modal.querySelector('.generation-preview').style.display = 'block';

    // Update iframe
    const iframe = this.modal.querySelector('#preview-iframe');
    iframe.srcdoc = result.html;

    // Update stats
    this.modal.querySelector('#preview-tokens').textContent =
      `Tokens used: ${result.tokens.total} (${result.tokens.input} in, ${result.tokens.output} out)`;

    const validationStatus = result.validation.valid ? '✅ Valid HTML' : '⚠️ Validation issues';
    this.modal.querySelector('#preview-validation').textContent = validationStatus;
  }

  /**
   * Insert to canvas
   */
  insertToCanvas() {
    if (!this.currentGeneration) return;

    const canvas = document.getElementById('canvas');
    if (!canvas) {
      alert('Canvas not found');
      return;
    }

    // Create temporary container
    const temp = document.createElement('div');
    temp.innerHTML = this.currentGeneration.html;
    const element = temp.firstElementChild;

    if (element) {
      // Add canvas element class
      element.classList.add('canvas-element');
      element.id = `element-${Date.now()}`;

      // Make it selectable
      element.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.selectElement) {
          window.selectElement(this);
        }
      });

      canvas.appendChild(element);

      if (window.showToast) {
        window.showToast('✅ Component inserted to canvas');
      }

      this.close();
    }
  }

  /**
   * Escape HTML for srcdoc
   */
  escapeHtml(html) {
    return html.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * Close modal
   */
  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.currentGeneration = null;
    this.currentVariations = null;
    this.isGenerating = false;
  }
}

// Export globally
window.GeneratorModal = GeneratorModal;
window.generatorModal = new GeneratorModal();
