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
    
    // Asegurar que el elemento tiene position para que los handles absolutos funcionen
    const currentPosition = window.getComputedStyle(element).position;
    if (currentPosition === 'static') {
      element.style.position = 'relative';
    }

    // Crear contenedor de handles
    const handlesContainer = document.createElement('div');
    handlesContainer.className = 'resize-handles';

    // CRITICAL: Hacer el contenedor NO draggable
    handlesContainer.draggable = false;
    handlesContainer.setAttribute('data-resize-handles-container', 'true');

    // Crear handles
    this.handles.forEach(handleConfig => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${handleConfig.name}`;
      handle.dataset.handle = handleConfig.name;
      handle.style.cursor = handleConfig.cursor;

      // CRITICAL: Hacer el handle NO draggable
      handle.draggable = false;

      // CRITICAL: Agregar atributo para identificación
      handle.setAttribute('data-resize-handle', 'true');

      // CRITICAL FIX: Usar capture y stopImmediatePropagation para asegurar que el handle reciba el evento
      handle.addEventListener('mousedown', e => {
        console.log('🖱️ Handle mousedown detected:', handleConfig.name);
        console.log('📍 MouseDown Event Details:', {
          target: e.target.className,
          handle: handleConfig.name,
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: e.bubbles,
          eventPhase: e.eventPhase
        });
        e.stopImmediatePropagation(); // Detener TODOS los demás listeners
        e.preventDefault();
        e.stopPropagation();
        this.startResize(e, element, handleConfig.name);
        return false; // Prevenir cualquier comportamiento por defecto
      }, { capture: true, passive: false }); // capture: true para recibir el evento primero

      // CRITICAL: Prevenir cualquier intento de drag en el handle
      handle.addEventListener('dragstart', e => {
        console.log('🚫 Handle drag prevented');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }, { capture: true });

      handlesContainer.appendChild(handle);
    });

    element.appendChild(handlesContainer);
    
    console.log('🔧 Resize enabled for:', element.tagName, {
      id: element.id,
      position: element.style.position,
      handles: this.handles.length
    });
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
    console.log('🎬 Starting resize:', handleName, 'on', element.tagName);
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
    e.stopPropagation();

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    
    // Debug logging cada 100ms
    if (!this._lastLogTime || Date.now() - this._lastLogTime > 100) {
      console.log('📐 Resizing:', this.currentHandle, 'deltaX:', deltaX, 'deltaY:', deltaY);
      this._lastLogTime = Date.now();
    }

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
    
    console.log('✏️ Applied:', {
      width: newWidth + 'px',
      height: newHeight + 'px',
      element: this.activeElement.tagName
    });

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
                z-index: 10001;
                display: none;
            }

            .canvas-element.selected .resize-handles {
                display: block !important;
            }
            
            .canvas-element.resize-enabled {
                position: relative;
            }

            /* Handles individuales */
            .resize-handle {
                position: absolute;
                width: 12px;
                height: 12px;
                background: #2563eb;
                border: 2px solid white;
                border-radius: 50%;
                pointer-events: auto !important; /* CRITICAL: Asegurar que siempre reciba eventos */
                z-index: 10000;
                transition: all 0.2s;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                user-select: none; /* Prevenir selección de texto */
            }

            .resize-handle:hover {
                transform: scale(1.4);
                background: #1d4ed8;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
            }

            /* Posiciones de handles */
            .resize-handle-nw { top: -6px; left: -6px; cursor: nw-resize; }
            .resize-handle-n { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
            .resize-handle-ne { top: -6px; right: -6px; cursor: ne-resize; }
            .resize-handle-e { top: 50%; right: -6px; transform: translateY(-50%); cursor: e-resize; }
            .resize-handle-se { bottom: -6px; right: -6px; cursor: se-resize; }
            .resize-handle-s { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
            .resize-handle-sw { bottom: -6px; left: -6px; cursor: sw-resize; }
            .resize-handle-w { top: 50%; left: -6px; transform: translateY(-50%); cursor: w-resize; }

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
