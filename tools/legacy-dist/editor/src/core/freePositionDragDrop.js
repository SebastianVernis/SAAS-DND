/**
 * Free Position Drag & Drop Manager - v1.0
 *
 * Sistema avanzado de drag & drop con posicionamiento libre y ajuste automático del canvas.
 * Permite mover elementos libremente con coordenadas absolutas y ajusta el canvas dinámicamente.
 */

class FreePositionDragDropManager {
  constructor() {
    this.draggedElement = null;
    this.draggedType = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.ghostElement = null;
    this.dropIndicator = null;
    this.canvasElements = [];

    // Configuración del canvas
    this.canvasMinHeight = 800;
    this.canvasPadding = 40;
    this.gridSize = 1; // Sin snap por defecto (usar 10 para grid de 10px)

    this.init();
  }

  /**
   * Inicializa el sistema
   */
  init() {
    this.injectStyles();
    this.setupGlobalEvents();
    this.setupCanvas();

    console.log('✅ FreePositionDragDropManager inicializado');
  }

  /**
   * Configura el canvas con posicionamiento absoluto
   */
  setupCanvas() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Hacer el canvas un contenedor de posicionamiento absoluto
    canvas.style.position = 'relative';
    canvas.style.minHeight = this.canvasMinHeight + 'px';
    canvas.style.width = '100%';

    // Actualizar altura del canvas cuando sea necesario
    this.updateCanvasHeight();
  }

  /**
   * Actualiza la altura del canvas según los elementos
   */
  updateCanvasHeight() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const elements = canvas.querySelectorAll('.canvas-element');
    let maxBottom = this.canvasMinHeight;

    elements.forEach(el => {
      if (el.style.position === 'absolute') {
        const top = parseFloat(el.style.top) || 0;
        const height = el.offsetHeight;
        const bottom = top + height + this.canvasPadding;

        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
      }
    });

    canvas.style.minHeight = maxBottom + 'px';
  }

  /**
   * Configura eventos globales
   */
  setupGlobalEvents() {
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  /**
   * Habilita drag en componente del panel
   */
  setupComponentDrag(componentElement, type) {
    componentElement.draggable = true;
    componentElement.dataset.componentType = type;

    componentElement.addEventListener('dragstart', e => {
      this.startComponentDrag(e, componentElement, type);
    });

    componentElement.addEventListener('dragend', e => {
      this.endDrag();
    });
  }

  /**
   * Habilita drag en elemento del canvas
   */
  setupCanvasElementDrag(element) {
    // Agregar drag handle visual
    if (!element.querySelector('.free-drag-handle')) {
      const handle = document.createElement('div');
      handle.className = 'free-drag-handle';
      handle.innerHTML = '⋮⋮';
      handle.title = 'Arrastrar para mover libremente';
      element.appendChild(handle);

      // El handle es el que inicia el drag
      handle.addEventListener('mousedown', () => {
        element.draggable = true;
      });
    }

    element.addEventListener('dragstart', e => {
      if (!element.classList.contains('selected')) {
        e.preventDefault();
        return;
      }

      this.startCanvasElementDrag(e, element);
    });

    element.addEventListener('dragend', e => {
      this.endDrag();
      element.draggable = false;
    });
  }

  /**
   * Inicia drag de componente desde panel
   */
  startComponentDrag(e, componentElement, type) {
    this.isDragging = true;
    this.draggedType = type;
    this.draggedElement = null; // Es nuevo

    // Crear ghost element
    this.createGhostElement(componentElement, type);

    componentElement.classList.add('dragging');
    document.body.classList.add('dragging-active');

    // Resaltar canvas
    const canvas = document.getElementById('canvas');
    canvas?.classList.add('free-drop-zone-active');

    this.dispatchEvent('dragstart', { type, isNew: true });
  }

  /**
   * Inicia drag de elemento del canvas
   */
  startCanvasElementDrag(e, element) {
    this.isDragging = true;
    this.draggedElement = element;
    this.draggedType = element.dataset.componentType;

    // Calcular offset del mouse respecto al elemento
    const rect = element.getBoundingClientRect();
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    // Crear ghost
    this.createGhostElement(element, this.draggedType, true);

    element.classList.add('dragging-element');
    document.body.classList.add('dragging-active');

    const canvasEl = document.getElementById('canvas');
    canvasEl?.classList.add('free-drop-zone-active');

    this.dispatchEvent('dragstart', { element, type: this.draggedType, isNew: false });
  }

  /**
   * Crea elemento ghost para preview
   */
  createGhostElement(sourceElement, type, isCanvasElement = false) {
    if (this.ghostElement) {
      this.ghostElement.remove();
    }

    this.ghostElement = document.createElement('div');
    this.ghostElement.className = 'free-position-ghost';
    this.ghostElement.style.display = 'none';
    this.ghostElement.style.position = 'absolute';
    this.ghostElement.style.pointerEvents = 'none';
    this.ghostElement.style.zIndex = '9999';

    if (isCanvasElement) {
      // Clonar el elemento completo
      const clone = sourceElement.cloneNode(true);
      clone
        .querySelectorAll('.delete-btn, .resize-handles, .free-drag-handle')
        .forEach(el => el.remove());
      this.ghostElement.appendChild(clone);
    } else {
      // Mostrar nombre del componente
      this.ghostElement.textContent = sourceElement.textContent;
      this.ghostElement.style.padding = '12px 24px';
      this.ghostElement.style.background = 'rgba(37, 99, 235, 0.95)';
      this.ghostElement.style.color = 'white';
      this.ghostElement.style.borderRadius = '8px';
      this.ghostElement.style.fontWeight = 'bold';
      this.ghostElement.style.fontSize = '14px';
      this.ghostElement.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    }

    document.body.appendChild(this.ghostElement);
  }

  /**
   * Maneja dragover
   */
  handleDragOver(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = this.draggedElement ? 'move' : 'copy';

    // Actualizar posición del ghost
    this.updateGhostPosition(e);

    // Verificar si está sobre el canvas
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    const isOverCanvas =
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom;

    if (isOverCanvas) {
      canvas.classList.add('free-drop-zone-active');
    } else {
      canvas.classList.remove('free-drop-zone-active');
    }
  }

  /**
   * Actualiza posición del ghost element
   */
  updateGhostPosition(e) {
    if (!this.ghostElement) return;

    this.ghostElement.style.display = 'block';
    this.ghostElement.style.left = e.clientX + 10 + 'px';
    this.ghostElement.style.top = e.clientY + 10 + 'px';
  }

  /**
   * Maneja drop
   */
  handleDrop(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    // Verificar si el drop es dentro del canvas
    const isOverCanvas =
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom;

    if (!isOverCanvas) {
      if (window.showToast) {
        window.showToast('⚠️ Suelta el elemento dentro del canvas', 'warning');
      }
      this.endDrag();
      return;
    }

    // Calcular posición relativa al canvas
    const scrollTop = canvas.scrollTop || 0;
    const scrollLeft = canvas.scrollLeft || 0;

    let x = e.clientX - canvasRect.left + scrollLeft - this.dragOffset.x;
    let y = e.clientY - canvasRect.top + scrollTop - this.dragOffset.y;

    // Aplicar snap a grid si está habilitado
    if (this.gridSize > 1) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }

    // Asegurar que no sea negativo
    x = Math.max(0, x);
    y = Math.max(0, y);

    if (this.draggedElement) {
      // Mover elemento existente
      this.moveElementToPosition(this.draggedElement, x, y);
    } else {
      // Crear nuevo componente
      this.createNewComponentAtPosition(this.draggedType, x, y);
    }

    this.endDrag();
  }

  /**
   * Mueve elemento existente a nueva posición
   */
  moveElementToPosition(element, x, y) {
    element.style.position = 'absolute';
    element.style.left = x + 'px';
    element.style.top = y + 'px';

    // Actualizar altura del canvas
    this.updateCanvasHeight();

    // Mantener selección
    if (window.selectElement) {
      window.selectElement(element);
    }

    if (window.showToast) {
      window.showToast('✅ Elemento movido');
    }

    this.dispatchEvent('elementMoved', { element, x, y });
  }

  /**
   * Crea nuevo componente en posición específica
   */
  createNewComponentAtPosition(type, x, y) {
    // Usar la función global createComponent
    if (!window.createComponent) {
      console.error('createComponent no está disponible');
      return;
    }

    const newElement = window.createComponent(type);

    // Configurar posicionamiento absoluto
    newElement.style.position = 'absolute';
    newElement.style.left = x + 'px';
    newElement.style.top = y + 'px';

    // Si el elemento no tiene ancho definido, darle uno por defecto
    if (!newElement.style.width) {
      const defaultWidths = {
        h1: '100%',
        h2: '100%',
        h3: '100%',
        p: 'auto',
        button: 'auto',
        img: '200px',
        contenedor: '300px',
        seccion: '100%',
        card: '300px',
        default: 'auto',
      };

      newElement.style.width = defaultWidths[type] || defaultWidths.default;
    }

    // Agregar al canvas
    const canvas = document.getElementById('canvas');
    canvas.appendChild(newElement);

    // Actualizar altura del canvas
    this.updateCanvasHeight();

    // Seleccionar nuevo elemento
    if (window.selectElement) {
      window.selectElement(newElement);
    }

    if (window.showToast) {
      window.showToast('✅ Componente agregado');
    }

    this.dispatchEvent('elementCreated', { element: newElement, type, x, y });
  }

  /**
   * Finaliza drag
   */
  handleDragEnd(e) {
    this.endDrag();
  }

  /**
   * Limpia estado de drag
   */
  endDrag() {
    this.isDragging = false;
    this.draggedElement = null;
    this.draggedType = null;
    this.dragOffset = { x: 0, y: 0 };

    // Limpiar ghost
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }

    // Limpiar clases
    document.body.classList.remove('dragging-active');
    document.querySelectorAll('.dragging, .dragging-element').forEach(el => {
      el.classList.remove('dragging', 'dragging-element');
    });

    const canvas = document.getElementById('canvas');
    canvas?.classList.remove('free-drop-zone-active');
  }

  /**
   * Habilita/deshabilita snap a grid
   */
  setGridSnap(size) {
    this.gridSize = size;
    console.log(`Grid snap ${size > 1 ? 'habilitado' : 'deshabilitado'} (${size}px)`);
  }

  /**
   * Convierte todos los elementos existentes a posicionamiento absoluto
   */
  convertToAbsolutePositioning() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const elements = canvas.querySelectorAll('.canvas-element');

    elements.forEach((el, index) => {
      if (el.style.position !== 'absolute') {
        // Calcular posición basada en el orden actual
        const y = index * 120 + 20; // Espaciado vertical
        const x = 20;

        el.style.position = 'absolute';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
    });

    this.updateCanvasHeight();

    if (window.showToast) {
      window.showToast('✅ Elementos convertidos a posicionamiento libre');
    }
  }

  /**
   * Reorganiza elementos en layout automático
   */
  autoLayout(type = 'vertical') {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const elements = Array.from(canvas.querySelectorAll('.canvas-element'));

    if (type === 'vertical') {
      let currentY = 20;
      elements.forEach(el => {
        el.style.position = 'absolute';
        el.style.left = '20px';
        el.style.top = currentY + 'px';
        el.style.width = 'calc(100% - 40px)';

        currentY += el.offsetHeight + 20;
      });
    } else if (type === 'grid') {
      const columns = 3;
      const columnWidth = 300;
      const gap = 20;

      elements.forEach((el, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        el.style.position = 'absolute';
        el.style.left = gap + (columnWidth + gap) * col + 'px';
        el.style.top = gap + (120 + gap) * row + 'px';
        el.style.width = columnWidth + 'px';
      });
    }

    this.updateCanvasHeight();

    if (window.showToast) {
      window.showToast(`✅ Layout ${type} aplicado`);
    }
  }

  /**
   * Dispara evento customizado
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`freedragdrop:${eventName}`, {
      detail,
      bubbles: true,
    });

    window.dispatchEvent(event);
  }

  /**
   * Inyecta estilos
   */
  injectStyles() {
    const styleId = 'free-position-dragdrop-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
            /* Canvas con posicionamiento libre */
            #canvas {
                position: relative;
                background: 
                    linear-gradient(90deg, rgba(226, 232, 240, 0.3) 1px, transparent 1px),
                    linear-gradient(rgba(226, 232, 240, 0.3) 1px, transparent 1px);
                background-size: 20px 20px;
            }

            /* Elementos del canvas con posicionamiento absoluto */
            .canvas-element {
                position: absolute;
                cursor: move;
            }

            /* Drag handle mejorado */
            .free-drag-handle {
                position: absolute;
                top: 4px;
                left: 4px;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                display: none;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                cursor: grab;
                font-size: 10px;
                letter-spacing: -2px;
                z-index: 998;
                opacity: 0;
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            .canvas-element.selected .free-drag-handle {
                display: flex;
            }

            .canvas-element.selected:hover .free-drag-handle {
                opacity: 1;
            }

            .free-drag-handle:active {
                cursor: grabbing;
            }

            /* Ghost element */
            .free-position-ghost {
                pointer-events: none;
                opacity: 0.9;
                transform: rotate(-2deg);
            }

            /* Drop zone activa */
            .free-drop-zone-active {
                outline: 3px dashed #3b82f6 !important;
                outline-offset: -3px;
                background-color: rgba(59, 130, 246, 0.05) !important;
            }

            /* Elemento siendo arrastrado */
            .dragging-element {
                opacity: 0.3;
                outline: 2px dashed #3b82f6;
            }

            /* Componente del panel siendo arrastrado */
            .component-item.dragging {
                opacity: 0.5;
                transform: scale(0.95);
            }

            /* Cursor durante drag */
            body.dragging-active {
                cursor: grabbing !important;
            }

            body.dragging-active * {
                cursor: inherit !important;
            }
        `;

    document.head.appendChild(style);
  }

  /**
   * Destruir
   */
  destroy() {
    this.endDrag();
    console.log('🗑️ FreePositionDragDropManager destruido');
  }
}

// Exportar globalmente
window.FreePositionDragDropManager = FreePositionDragDropManager;

export default FreePositionDragDropManager;
