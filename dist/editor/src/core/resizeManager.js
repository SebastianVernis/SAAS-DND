/**
 * Resize Manager - v1.0
 *
 * Sistema avanzado de redimensionamiento de elementos con handles visuales.
 * Soporta redimensionamiento proporcional y límites mínimos/máximos.
 */

class ResizeManager {
  constructor() {
    this.activeElement = null;
    this.resizing = false;
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;
    this.currentHandle = null;
    this.minWidth = 20;
    this.minHeight = 20;
    this.aspectRatio = null;
    this.preserveAspectRatio = false;

    this.handles = [
      { name: 'nw', cursor: 'nw-resize', position: 'top-left' },
      { name: 'n', cursor: 'n-resize', position: 'top-center' },
      { name: 'ne', cursor: 'ne-resize', position: 'top-right' },
      { name: 'e', cursor: 'e-resize', position: 'middle-right' },
      { name: 'se', cursor: 'se-resize', position: 'bottom-right' },
      { name: 's', cursor: 's-resize', position: 'bottom-center' },
      { name: 'sw', cursor: 'sw-resize', position: 'bottom-left' },
      { name: 'w', cursor: 'w-resize', position: 'middle-left' },
    ];

    this.init();
  }

  /**
   * Inicializa el sistema de resize
   */
  init() {
    // Agregar estilos
    this.injectStyles();

    // Eventos globales
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    console.log('✅ ResizeManager inicializado');
  }

  /**
   * Habilita resize para un elemento
   */
  enableResize(element) {
    if (!element || element.classList.contains('resize-enabled')) {
      return;
    }

    element.classList.add('resize-enabled');

    // Crear contenedor de handles
    const handlesContainer = document.createElement('div');
    handlesContainer.className = 'resize-handles';

    // Crear handles
    this.handles.forEach(handleConfig => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${handleConfig.name}`;
      handle.dataset.handle = handleConfig.name;
      handle.style.cursor = handleConfig.cursor;

      handle.addEventListener('mousedown', e => {
        this.startResize(e, element, handleConfig.name);
      });

      handlesContainer.appendChild(handle);
    });

    element.appendChild(handlesContainer);
  }

  /**
   * Deshabilita resize para un elemento
   */
  disableResize(element) {
    if (!element) return;

    element.classList.remove('resize-enabled');
    const handlesContainer = element.querySelector('.resize-handles');
    if (handlesContainer) {
      handlesContainer.remove();
    }
  }

  /**
   * Inicia el proceso de resize
   */
  startResize(e, element, handleName) {
    e.preventDefault();
    e.stopPropagation();

    this.resizing = true;
    this.activeElement = element;
    this.currentHandle = handleName;
    this.startX = e.clientX;
    this.startY = e.clientY;

    // Obtener dimensiones iniciales
    const computedStyle = window.getComputedStyle(element);
    this.startWidth = parseFloat(computedStyle.width);
    this.startHeight = parseFloat(computedStyle.height);

    // Calcular aspect ratio
    this.aspectRatio = this.startWidth / this.startHeight;

    // Verificar si se debe preservar aspect ratio (Shift key)
    this.preserveAspectRatio = e.shiftKey;

    // Agregar clase visual
    element.classList.add('resizing');
    document.body.classList.add('resizing-active');

    // Disparar evento
    this.dispatchEvent('resizestart', {
      element,
      width: this.startWidth,
      height: this.startHeight,
    });
  }

  /**
   * Maneja el movimiento del mouse durante resize
   */
  handleMouseMove(e) {
    if (!this.resizing || !this.activeElement) {
      return;
    }

    e.preventDefault();

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;

    // Calcular nuevas dimensiones según el handle
    switch (this.currentHandle) {
      case 'e':
        newWidth = this.startWidth + deltaX;
        break;
      case 'w':
        newWidth = this.startWidth - deltaX;
        break;
      case 's':
        newHeight = this.startHeight + deltaY;
        break;
      case 'n':
        newHeight = this.startHeight - deltaY;
        break;
      case 'se':
        newWidth = this.startWidth + deltaX;
        newHeight = this.startHeight + deltaY;
        break;
      case 'sw':
        newWidth = this.startWidth - deltaX;
        newHeight = this.startHeight + deltaY;
        break;
      case 'ne':
        newWidth = this.startWidth + deltaX;
        newHeight = this.startHeight - deltaY;
        break;
      case 'nw':
        newWidth = this.startWidth - deltaX;
        newHeight = this.startHeight - deltaY;
        break;
    }

    // Preservar aspect ratio si está activado
    if (this.preserveAspectRatio || e.shiftKey) {
      if (this.currentHandle.includes('e') || this.currentHandle.includes('w')) {
        newHeight = newWidth / this.aspectRatio;
      } else if (this.currentHandle.includes('n') || this.currentHandle.includes('s')) {
        newWidth = newHeight * this.aspectRatio;
      }
    }

    // Aplicar límites mínimos
    newWidth = Math.max(this.minWidth, newWidth);
    newHeight = Math.max(this.minHeight, newHeight);

    // Aplicar dimensiones
    this.activeElement.style.width = newWidth + 'px';
    this.activeElement.style.height = newHeight + 'px';

    // Actualizar info tooltip
    this.showDimensionsTooltip(newWidth, newHeight);

    // Disparar evento
    this.dispatchEvent('resizing', {
      element: this.activeElement,
      width: newWidth,
      height: newHeight,
    });
  }

  /**
   * Finaliza el resize
   */
  handleMouseUp(e) {
    if (!this.resizing) {
      return;
    }

    this.resizing = false;

    if (this.activeElement) {
      this.activeElement.classList.remove('resizing');

      const finalWidth = parseFloat(this.activeElement.style.width);
      const finalHeight = parseFloat(this.activeElement.style.height);

      // Disparar evento
      this.dispatchEvent('resizeend', {
        element: this.activeElement,
        width: finalWidth,
        height: finalHeight,
      });
    }

    document.body.classList.remove('resizing-active');
    this.hideDimensionsTooltip();

    this.activeElement = null;
    this.currentHandle = null;
  }

  /**
   * Maneja teclas durante resize
   */
  handleKeyDown(e) {
    // ESC para cancelar
    if (e.key === 'Escape' && this.resizing) {
      this.cancelResize();
    }

    // Shift para preservar aspect ratio
    if (e.key === 'Shift' && this.resizing) {
      this.preserveAspectRatio = true;
    }
  }

  /**
   * Cancela el resize y restaura dimensiones originales
   */
  cancelResize() {
    if (!this.resizing || !this.activeElement) {
      return;
    }

    this.activeElement.style.width = this.startWidth + 'px';
    this.activeElement.style.height = this.startHeight + 'px';

    this.handleMouseUp(new Event('mouseup'));

    if (window.showToast) {
      window.showToast('⏪ Resize cancelado');
    }
  }

  /**
   * Muestra tooltip con dimensiones actuales
   */
  showDimensionsTooltip(width, height) {
    let tooltip = document.getElementById('resize-dimensions-tooltip');

    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'resize-dimensions-tooltip';
      tooltip.className = 'resize-dimensions-tooltip';
      document.body.appendChild(tooltip);
    }

    tooltip.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
    tooltip.style.display = 'block';

    // Posicionar cerca del cursor
    const rect = this.activeElement.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.bottom + 10 + 'px';
  }

  /**
   * Oculta tooltip de dimensiones
   */
  hideDimensionsTooltip() {
    const tooltip = document.getElementById('resize-dimensions-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Establece dimensiones específicas
   */
  setDimensions(element, width, height) {
    if (!element) return;

    element.style.width = width + 'px';
    element.style.height = height + 'px';

    this.dispatchEvent('dimensionschanged', {
      element,
      width,
      height,
    });
  }

  /**
   * Resetea dimensiones al valor automático
   */
  resetDimensions(element) {
    if (!element) return;

    element.style.width = '';
    element.style.height = '';

    this.dispatchEvent('dimensionsreset', { element });
  }

  /**
   * Ajusta elemento al contenido
   */
  fitToContent(element) {
    if (!element) return;

    element.style.width = 'fit-content';
    element.style.height = 'auto';

    this.dispatchEvent('fittocontent', { element });
  }

  /**
   * Dispara evento customizado
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`resize:${eventName}`, {
      detail,
      bubbles: true,
    });

    if (detail.element) {
      detail.element.dispatchEvent(event);
    }

    window.dispatchEvent(event);
  }

  /**
   * Inyecta estilos CSS
   */
  injectStyles() {
    const styleId = 'resize-manager-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
            /* Contenedor de handles */
            .resize-handles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999;
                display: none;
            }

            .canvas-element.selected .resize-handles {
                display: block;
            }

            /* Handles individuales */
            .resize-handle {
                position: absolute;
                width: 10px;
                height: 10px;
                background: white;
                border: 2px solid #2563eb;
                border-radius: 50%;
                pointer-events: auto;
                z-index: 1000;
                transition: all 0.2s;
            }

            .resize-handle:hover {
                transform: scale(1.3);
                background: #2563eb;
                box-shadow: 0 0 8px rgba(37, 99, 235, 0.5);
            }

            /* Posiciones de handles */
            .resize-handle-nw { top: -5px; left: -5px; }
            .resize-handle-n { top: -5px; left: 50%; transform: translateX(-50%); }
            .resize-handle-ne { top: -5px; right: -5px; }
            .resize-handle-e { top: 50%; right: -5px; transform: translateY(-50%); }
            .resize-handle-se { bottom: -5px; right: -5px; }
            .resize-handle-s { bottom: -5px; left: 50%; transform: translateX(-50%); }
            .resize-handle-sw { bottom: -5px; left: -5px; }
            .resize-handle-w { top: 50%; left: -5px; transform: translateY(-50%); }

            /* Estado resizing */
            .canvas-element.resizing {
                outline: 2px solid #2563eb !important;
                opacity: 0.8;
            }

            body.resizing-active {
                cursor: inherit !important;
                user-select: none;
            }

            body.resizing-active * {
                cursor: inherit !important;
            }

            /* Tooltip de dimensiones */
            .resize-dimensions-tooltip {
                position: fixed;
                background: rgba(37, 99, 235, 0.95);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                pointer-events: none;
                z-index: 10000;
                transform: translateX(-50%);
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                display: none;
                white-space: nowrap;
                animation: tooltipFadeIn 0.2s ease;
            }

            @keyframes tooltipFadeIn {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-5px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }

            /* Hints visuales */
            .canvas-element.resize-enabled::after {
                content: '';
                position: absolute;
                bottom: 3px;
                right: 3px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 0 10px 10px;
                border-color: transparent transparent #94a3b8 transparent;
                opacity: 0.3;
                pointer-events: none;
            }

            .canvas-element.resize-enabled.selected::after {
                border-color: transparent transparent #2563eb transparent;
                opacity: 0.5;
            }
        `;

    document.head.appendChild(style);
  }

  /**
   * Destruir el resize manager
   */
  destroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keydown', this.handleKeyDown);

    const tooltip = document.getElementById('resize-dimensions-tooltip');
    if (tooltip) {
      tooltip.remove();
    }

    console.log('🗑️ ResizeManager destruido');
  }
}

// Exportar globalmente
window.ResizeManager = ResizeManager;

export default ResizeManager;
