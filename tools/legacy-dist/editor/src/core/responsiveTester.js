/**
 * ResponsiveTester - Herramienta para probar diseños responsive
 */
class ResponsiveTester {
  constructor() {
    this.devices = {
      'mobile-small': {
        name: 'Mobile S',
        width: 320,
        height: 568,
        icon: '📱',
      },
      mobile: {
        name: 'Mobile',
        width: 375,
        height: 667,
        icon: '📱',
      },
      'mobile-large': {
        name: 'Mobile L',
        width: 425,
        height: 812,
        icon: '📱',
      },
      tablet: {
        name: 'Tablet',
        width: 768,
        height: 1024,
        icon: '📱',
      },
      laptop: {
        name: 'Laptop',
        width: 1024,
        height: 768,
        icon: '💻',
      },
      'laptop-large': {
        name: 'Laptop L',
        width: 1440,
        height: 900,
        icon: '💻',
      },
      desktop: {
        name: 'Desktop',
        width: 1920,
        height: 1080,
        icon: '🖥️',
      },
      '4k': {
        name: '4K',
        width: 2560,
        height: 1440,
        icon: '🖥️',
      },
    };

    this.customSizes = this.loadCustomSizes();
    this.currentDevice = 'desktop';
    this.orientation = 'portrait';
  }

  /**
   * Inicializa el tester
   */
  init() {
    this.createTestPanel();
    this.setupEventListeners();
  }

  /**
   * Crea panel de testing responsive
   */
  createTestPanel() {
    const existingPanel = document.getElementById('responsiveTesterPanel');
    if (existingPanel) return;

    const panel = document.createElement('div');
    panel.id = 'responsiveTesterPanel';
    panel.className = 'responsive-tester-panel hidden';
    panel.innerHTML = `
            <div class="panel-overlay" onclick="closeResponsiveTester()"></div>
            <div class="panel-content">
                <div class="panel-header">
                    <h2>🔍 Responsive Tester</h2>
                    <button class="close-panel-btn" onclick="closeResponsiveTester()">&times;</button>
                </div>
                <div class="panel-body">
                    <div class="device-selector">
                        <h3>Dispositivos Predefinidos</h3>
                        <div class="device-grid" id="deviceGrid">
                            ${this.renderDeviceButtons()}
                        </div>
                    </div>
                    
                    <div class="custom-size-section">
                        <h3>Tamaño Personalizado</h3>
                        <div class="custom-size-inputs">
                            <div class="input-group">
                                <label>Ancho (px)</label>
                                <input type="number" id="customWidth" value="1024" min="320" max="3840">
                            </div>
                            <div class="input-group">
                                <label>Alto (px)</label>
                                <input type="number" id="customHeight" value="768" min="320" max="2160">
                            </div>
                            <button class="btn primary" onclick="applyCustomSize()">Aplicar</button>
                        </div>
                    </div>
                    
                    <div class="orientation-section">
                        <h3>Orientación</h3>
                        <div class="orientation-buttons">
                            <button class="btn" id="portraitBtn" onclick="setOrientation('portrait')">📱 Portrait</button>
                            <button class="btn" id="landscapeBtn" onclick="setOrientation('landscape')">📱 Landscape</button>
                        </div>
                    </div>
                    
                    <div class="test-info">
                        <div class="current-size" id="currentSizeInfo">
                            <strong>Tamaño actual:</strong> <span id="currentSizeDisplay">1920 x 1080</span>
                        </div>
                        <div class="breakpoint-info" id="breakpointInfo">
                            <strong>Breakpoint:</strong> <span id="breakpointDisplay">Desktop</span>
                        </div>
                    </div>
                    
                    <div class="test-actions">
                        <button class="btn" onclick="takeScreenshot()">📸 Capturar Pantalla</button>
                        <button class="btn" onclick="testAllSizes()">🎯 Probar Todos los Tamaños</button>
                        <button class="btn" onclick="resetCanvas()">↺ Restablecer</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(panel);
  }

  /**
   * Renderiza botones de dispositivos
   */
  renderDeviceButtons() {
    return Object.entries(this.devices)
      .map(
        ([key, device]) => `
            <button class="device-btn" onclick="setDeviceSize('${key}')">
                <span class="device-icon">${device.icon}</span>
                <span class="device-name">${device.name}</span>
                <span class="device-size">${device.width} × ${device.height}</span>
            </button>
        `
      )
      .join('');
  }

  /**
   * Establece tamaño del canvas
   */
  setSize(width, height) {
    const wrapper = document.getElementById('canvasWrapper');
    if (!wrapper) return;

    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';
    wrapper.style.transition = 'all 0.3s ease';

    this.updateSizeDisplay(width, height);
    this.updateBreakpointDisplay(width);
  }

  /**
   * Establece tamaño por dispositivo
   */
  setDeviceSize(deviceKey) {
    const device = this.devices[deviceKey];
    if (!device) return;

    this.currentDevice = deviceKey;

    let width = device.width;
    let height = device.height;

    if (this.orientation === 'landscape') {
      [width, height] = [height, width];
    }

    this.setSize(width, height);

    if (window.showToast) {
      window.showToast(`Vista ${device.name} aplicada`);
    }
  }

  /**
   * Establece orientación
   */
  setOrientation(orientation) {
    this.orientation = orientation;

    // Actualizar botones
    const portraitBtn = document.getElementById('portraitBtn');
    const landscapeBtn = document.getElementById('landscapeBtn');

    if (portraitBtn && landscapeBtn) {
      portraitBtn.classList.toggle('active', orientation === 'portrait');
      landscapeBtn.classList.toggle('active', orientation === 'landscape');
    }

    // Re-aplicar tamaño actual con nueva orientación
    if (this.currentDevice) {
      this.setDeviceSize(this.currentDevice);
    }
  }

  /**
   * Aplica tamaño personalizado
   */
  applyCustomSize() {
    const widthInput = document.getElementById('customWidth');
    const heightInput = document.getElementById('customHeight');

    if (widthInput && heightInput) {
      const width = parseInt(widthInput.value);
      const height = parseInt(heightInput.value);

      if (width && height && width >= 320 && height >= 320) {
        this.setSize(width, height);

        if (window.showToast) {
          window.showToast(`Tamaño personalizado ${width}×${height} aplicado`);
        }
      }
    }
  }

  /**
   * Actualiza display de tamaño
   */
  updateSizeDisplay(width, height) {
    const display = document.getElementById('currentSizeDisplay');
    if (display) {
      display.textContent = `${width} × ${height}`;
    }
  }

  /**
   * Actualiza display de breakpoint
   */
  updateBreakpointDisplay(width) {
    const display = document.getElementById('breakpointDisplay');
    if (!display) return;

    let breakpoint = '';

    if (width < 576) {
      breakpoint = 'Extra Small (< 576px)';
    } else if (width < 768) {
      breakpoint = 'Small (576px - 768px)';
    } else if (width < 992) {
      breakpoint = 'Medium (768px - 992px)';
    } else if (width < 1200) {
      breakpoint = 'Large (992px - 1200px)';
    } else if (width < 1400) {
      breakpoint = 'Extra Large (1200px - 1400px)';
    } else {
      breakpoint = 'XXL (> 1400px)';
    }

    display.textContent = breakpoint;
  }

  /**
   * Captura pantalla del canvas
   */
  async takeScreenshot() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    try {
      if (typeof html2canvas !== 'undefined') {
        const canvasElement = await html2canvas(canvas);
        const dataUrl = canvasElement.toDataURL('image/png');

        // Descargar imagen
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `screenshot-${Date.now()}.png`;
        a.click();

        if (window.showToast) {
          window.showToast('Captura guardada');
        }
      } else {
        if (window.showToast) {
          window.showToast('html2canvas no está disponible', 'error');
        }
      }
    } catch (error) {
      console.error('Error capturando pantalla:', error);
      if (window.showToast) {
        window.showToast('Error al capturar pantalla', 'error');
      }
    }
  }

  /**
   * Prueba todos los tamaños
   */
  async testAllSizes() {
    const devices = Object.keys(this.devices);
    let currentIndex = 0;

    const testNext = () => {
      if (currentIndex >= devices.length) {
        if (window.showToast) {
          window.showToast('Prueba de todos los tamaños completada');
        }
        return;
      }

      this.setDeviceSize(devices[currentIndex]);
      currentIndex++;

      setTimeout(testNext, 1500);
    };

    testNext();
  }

  /**
   * Restablece canvas
   */
  resetCanvas() {
    this.setDeviceSize('desktop');
    this.setOrientation('portrait');

    if (window.showToast) {
      window.showToast('Canvas restablecido');
    }
  }

  /**
   * Configura listeners
   */
  setupEventListeners() {
    // Listeners ya configurados en los botones HTML
  }

  /**
   * Guarda tamaños personalizados
   */
  saveCustomSize(name, width, height) {
    this.customSizes.push({ name, width, height });
    localStorage.setItem('dragndrop_custom_sizes', JSON.stringify(this.customSizes));
  }

  /**
   * Carga tamaños personalizados
   */
  loadCustomSizes() {
    try {
      const stored = localStorage.getItem('dragndrop_custom_sizes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }
}

// Funciones globales para los botones
function openResponsiveTester() {
  const panel = document.getElementById('responsiveTesterPanel');
  if (panel) {
    panel.classList.remove('hidden');
  } else {
    const tester = new ResponsiveTester();
    tester.init();
    tester.createTestPanel();
    const newPanel = document.getElementById('responsiveTesterPanel');
    if (newPanel) {
      newPanel.classList.remove('hidden');
    }
  }
}

function closeResponsiveTester() {
  const panel = document.getElementById('responsiveTesterPanel');
  if (panel) {
    panel.classList.add('hidden');
  }
}

function setDeviceSize(deviceKey) {
  if (window.responsiveTester) {
    window.responsiveTester.setDeviceSize(deviceKey);
  }
}

function setOrientation(orientation) {
  if (window.responsiveTester) {
    window.responsiveTester.setOrientation(orientation);
  }
}

function applyCustomSize() {
  if (window.responsiveTester) {
    window.responsiveTester.applyCustomSize();
  }
}

function takeScreenshot() {
  if (window.responsiveTester) {
    window.responsiveTester.takeScreenshot();
  }
}

function testAllSizes() {
  if (window.responsiveTester) {
    window.responsiveTester.testAllSizes();
  }
}

function resetCanvas() {
  if (window.responsiveTester) {
    window.responsiveTester.resetCanvas();
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveTester;
}

window.ResponsiveTester = ResponsiveTester;
