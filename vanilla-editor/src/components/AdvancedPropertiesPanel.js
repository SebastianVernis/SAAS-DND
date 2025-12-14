/**
 * AdvancedPropertiesPanel - Enhanced properties panel with computed styles
 * Shows both inline and computed CSS properties
 */

class AdvancedPropertiesPanel {
  constructor() {
    this.currentElement = null;
    this.showComputed = false;
    this.colorPicker = null;

    this.init();
  }

  init() {
    this.enhancePropertiesPanel();
    console.log('🎨 AdvancedPropertiesPanel initialized');
  }

  /**
   * Enhance existing properties panel
   */
  enhancePropertiesPanel() {
    const panel = document.getElementById('propertiesPanel');
    if (!panel) return;

    // Add toggle for computed styles
    const header = panel.querySelector('.panel-title');
    if (header && !document.getElementById('computedStylesToggle')) {
      const toggle = document.createElement('button');
      toggle.id = 'computedStylesToggle';
      toggle.className = 'properties-toggle-btn';
      toggle.textContent = '💻 Computed';
      toggle.title = 'Mostrar estilos computados';
      toggle.onclick = () => this.toggleComputedStyles();

      header.parentElement.style.display = 'flex';
      header.parentElement.style.justifyContent = 'space-between';
      header.parentElement.style.alignItems = 'center';
      header.parentElement.appendChild(toggle);
    }
  }

  /**
   * Update panel for element
   */
  update(element) {
    this.currentElement = element;

    if (this.showComputed) {
      this.showComputedStyles(element);
    }
  }

  /**
   * Toggle computed styles view
   */
  toggleComputedStyles() {
    this.showComputed = !this.showComputed;

    const toggle = document.getElementById('computedStylesToggle');
    if (toggle) {
      toggle.classList.toggle('active', this.showComputed);
    }

    if (this.currentElement) {
      if (this.showComputed) {
        this.showComputedStyles(this.currentElement);
      } else {
        // Restore normal properties panel
        if (typeof window.updatePropertiesPanel === 'function') {
          window.updatePropertiesPanel(this.currentElement);
        }
      }
    }
  }

  /**
   * Show computed styles
   */
  showComputedStyles(element) {
    const panel = document.getElementById('propertiesPanel');
    if (!panel) return;

    const computed = window.getComputedStyle(element);

    // Get important properties
    const importantProps = [
      'display',
      'position',
      'width',
      'height',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'font-size',
      'font-weight',
      'font-family',
      'line-height',
      'color',
      'background-color',
      'border',
      'border-radius',
      'box-shadow',
      'opacity',
      'z-index',
      'overflow',
      'flex-direction',
      'justify-content',
      'align-items',
      'grid-template-columns',
      'grid-template-rows',
      'gap',
    ];

    let html = `
            <div class="computed-styles-container">
                <div class="computed-styles-header">
                    <h3>Estilos Computados</h3>
                    <p class="computed-styles-info">Valores finales aplicados al elemento</p>
                </div>
                <div class="computed-styles-tabs">
                    <button class="computed-tab active" data-tab="important">Importantes</button>
                    <button class="computed-tab" data-tab="all">Todos</button>
                    <button class="computed-tab" data-tab="box">Box Model</button>
                </div>
                <div class="computed-styles-content">
                    <div class="computed-tab-content active" data-content="important">
        `;

    // Important properties
    importantProps.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value) {
        const inlineValue = element.style[this.camelCase(prop)];
        const isInline = inlineValue !== '';

        html += `
                    <div class="computed-property ${isInline ? 'inline' : ''}">
                        <span class="computed-property-name">${prop}</span>
                        <span class="computed-property-value">${this.formatValue(value)}</span>
                        ${isInline ? '<span class="computed-property-badge">inline</span>' : ''}
                    </div>
                `;
      }
    });

    html += `
                    </div>
                    <div class="computed-tab-content" data-content="all">
                        <div class="computed-search">
                            <input type="text" id="computedSearch" placeholder="Buscar propiedad..." />
                        </div>
                        <div class="computed-all-properties" id="computedAllProperties">
        `;

    // All properties
    const allProps = Array.from(computed);
    allProps.sort().forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value) {
        html += `
                    <div class="computed-property computed-property-small">
                        <span class="computed-property-name">${prop}</span>
                        <span class="computed-property-value">${this.formatValue(value)}</span>
                    </div>
                `;
      }
    });

    html += `
                        </div>
                    </div>
                    <div class="computed-tab-content" data-content="box">
                        ${this.renderBoxModel(element, computed)}
                    </div>
                </div>
            </div>
        `;

    // Find properties content area
    const propertiesContent = panel.querySelector('.properties-empty') || panel;
    if (propertiesContent.classList.contains('properties-empty')) {
      propertiesContent.classList.remove('properties-empty');
    }
    propertiesContent.innerHTML = html;

    // Attach tab listeners
    this.attachComputedTabListeners();

    // Attach search listener
    const searchInput = document.getElementById('computedSearch');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        this.filterComputedProperties(e.target.value);
      });
    }
  }

  /**
   * Render box model visualizer
   */
  renderBoxModel(element, computed) {
    const margin = {
      top: parseFloat(computed.marginTop),
      right: parseFloat(computed.marginRight),
      bottom: parseFloat(computed.marginBottom),
      left: parseFloat(computed.marginLeft),
    };

    const border = {
      top: parseFloat(computed.borderTopWidth),
      right: parseFloat(computed.borderRightWidth),
      bottom: parseFloat(computed.borderBottomWidth),
      left: parseFloat(computed.borderLeftWidth),
    };

    const padding = {
      top: parseFloat(computed.paddingTop),
      right: parseFloat(computed.paddingRight),
      bottom: parseFloat(computed.paddingBottom),
      left: parseFloat(computed.paddingLeft),
    };

    const width = parseFloat(computed.width);
    const height = parseFloat(computed.height);

    return `
            <div class="box-model-visualizer">
                <div class="box-model-title">Box Model</div>
                <div class="box-model-diagram">
                    <div class="box-model-layer box-model-margin">
                        <div class="box-model-label">margin</div>
                        <div class="box-model-values">
                            <span class="box-model-value-top">${margin.top}</span>
                            <span class="box-model-value-right">${margin.right}</span>
                            <span class="box-model-value-bottom">${margin.bottom}</span>
                            <span class="box-model-value-left">${margin.left}</span>
                        </div>
                        <div class="box-model-layer box-model-border">
                            <div class="box-model-label">border</div>
                            <div class="box-model-values">
                                <span class="box-model-value-top">${border.top}</span>
                                <span class="box-model-value-right">${border.right}</span>
                                <span class="box-model-value-bottom">${border.bottom}</span>
                                <span class="box-model-value-left">${border.left}</span>
                            </div>
                            <div class="box-model-layer box-model-padding">
                                <div class="box-model-label">padding</div>
                                <div class="box-model-values">
                                    <span class="box-model-value-top">${padding.top}</span>
                                    <span class="box-model-value-right">${padding.right}</span>
                                    <span class="box-model-value-bottom">${padding.bottom}</span>
                                    <span class="box-model-value-left">${padding.left}</span>
                                </div>
                                <div class="box-model-layer box-model-content">
                                    <div class="box-model-label">content</div>
                                    <div class="box-model-dimensions">
                                        ${width.toFixed(1)} × ${height.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Attach computed tab listeners
   */
  attachComputedTabListeners() {
    const tabs = document.querySelectorAll('.computed-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active content
        const contents = document.querySelectorAll('.computed-tab-content');
        contents.forEach(content => {
          if (content.dataset.content === tabName) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      });
    });
  }

  /**
   * Filter computed properties
   */
  filterComputedProperties(query) {
    const container = document.getElementById('computedAllProperties');
    if (!container) return;

    const properties = container.querySelectorAll('.computed-property');
    const lowerQuery = query.toLowerCase();

    properties.forEach(prop => {
      const name = prop.querySelector('.computed-property-name').textContent;
      if (name.toLowerCase().includes(lowerQuery)) {
        prop.style.display = '';
      } else {
        prop.style.display = 'none';
      }
    });
  }

  /**
   * Format value for display
   */
  formatValue(value) {
    // Truncate long values
    if (value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    return value;
  }

  /**
   * Convert kebab-case to camelCase
   */
  camelCase(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
  }

  /**
   * Create color picker
   */
  createColorPicker(input, property) {
    // Simple color picker implementation
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'color-picker-input';
    picker.value = this.rgbToHex(input.value) || '#000000';

    picker.addEventListener('change', e => {
      input.value = e.target.value;
      input.dispatchEvent(new Event('input'));
    });

    input.parentElement.appendChild(picker);
  }

  /**
   * Convert RGB to Hex
   */
  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return null;

    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Destroy
   */
  destroy() {
    this.currentElement = null;
    this.showComputed = false;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedPropertiesPanel;
}

window.AdvancedPropertiesPanel = AdvancedPropertiesPanel;

export default AdvancedPropertiesPanel;
