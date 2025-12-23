/**
 * Enhanced Drag & Drop Manager - v1.0
 *
 * Sistema mejorado de drag & drop con preview visual, ghost elements,
 * y mejor detección de zonas de drop.
 */

class EnhancedDragDropManager {
  constructor() {
    this.draggedElement = null;
    this.draggedType = null;
    this.ghostElement = null;
    this.dropIndicator = null;
    this.dragPreview = null;
    this.isDragging = false;
    this.dropZones = [];
    this.snapThreshold = 10; // px para snap
    this.scrollSpeed = 5;
    this.scrollEdgeSize = 50;

    this.init();
  }

  /**
   * Inicializa el sistema
   */
  init() {
    this.injectStyles();
    this.createDropIndicator();
    this.setupGlobalEvents();

    console.log('✅ EnhancedDragDropManager inicializado');
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
      this.endComponentDrag(e, componentElement);
    });
  }

  /**
   * Habilita drag en elemento del canvas
   */
  setupCanvasElementDrag(element) {
    // Solo habilitar drag si el elemento está seleccionado
    element.draggable = element.classList.contains('selected');

    // Agregar drag handle visual
    if (!element.querySelector('.drag-handle')) {
      const handle = document.createElement('div');
      handle.className = 'drag-handle';
      handle.innerHTML = '⋮⋮';
      handle.title = 'Arrastrar para reordenar (o seleccionar elemento)';
      element.appendChild(handle);
    }

    element.addEventListener('dragstart', e => {
      // Solo permitir si está seleccionado
      if (!element.classList.contains('selected')) {
        e.preventDefault();
        return;
      }

      this.startCanvasElementDrag(e, element);
    });

    element.addEventListener('dragend', e => {
      this.endCanvasElementDrag(e, element);
    });

    // Habilitar/deshabilitar drag según selección
    element.addEventListener('click', () => {
      element.draggable = element.classList.contains('selected');
    });
  }

  /**
   * Inicia drag de componente desde panel
   */
  startComponentDrag(e, componentElement, type) {
    this.isDragging = true;
    this.draggedType = type;
    this.draggedElement = null; // Es un nuevo componente

    // Crear preview customizado
    this.createDragPreview(componentElement, true);
    e.dataTransfer.setDragImage(this.dragPreview, 0, 0);
    e.dataTransfer.effectAllowed = 'copy';

    // Marcar elemento como arrastrando
    componentElement.classList.add('dragging');

    // Resaltar zonas de drop disponibles
    this.highlightDropZones();

    this.dispatchEvent('dragstart', { type, isNewComponent: true });
  }

  /**
   * Inicia drag de elemento del canvas
   */
  startCanvasElementDrag(e, element) {
    this.isDragging = true;
    this.draggedElement = element;
    this.draggedType = element.dataset.componentType;

    // Crear preview
    this.createDragPreview(element, false);
    e.dataTransfer.setDragImage(this.dragPreview, 0, 0);
    e.dataTransfer.effectAllowed = 'move';

    // Marcar elemento
    element.classList.add('dragging-canvas-element');

    // Resaltar zonas de drop
    this.highlightDropZones();

    this.dispatchEvent('dragstart', { element, type: this.draggedType, isNewComponent: false });
  }

  /**
   * Crea preview visual del elemento arrastrándose
   */
  createDragPreview(sourceElement, isNewComponent) {
    // Eliminar preview anterior si existe
    if (this.dragPreview) {
      this.dragPreview.remove();
    }

    this.dragPreview = document.createElement('div');
    this.dragPreview.className = 'drag-preview';

    if (isNewComponent) {
      this.dragPreview.textContent = sourceElement.textContent;
      this.dragPreview.style.padding = '10px 20px';
    } else {
      // Clonar contenido visual
      const clone = sourceElement.cloneNode(true);
      // Limpiar elementos de UI del editor
      clone
        .querySelectorAll('.delete-btn, .resize-handles, .drag-handle')
        .forEach(el => el.remove());
      this.dragPreview.appendChild(clone);
    }

    document.body.appendChild(this.dragPreview);
  }

  /**
   * Maneja evento dragover global
   */
  handleDragOver(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = this.draggedElement ? 'move' : 'copy';

    // Auto-scroll cuando está cerca del borde
    this.handleAutoScroll(e);

    // Encontrar drop zone más cercana
    const dropTarget = this.findDropTarget(e);

    if (dropTarget) {
      this.showDropIndicator(dropTarget, e);
    } else {
      this.hideDropIndicator();
    }
  }

  /**
   * Maneja drop
   */
  handleDrop(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    const dropTarget = this.findDropTarget(e);

    if (!dropTarget) {
      if (window.showToast) {
        window.showToast('⚠️ Zona de drop inválida', 'warning');
      }
      return;
    }

    // Determinar posición de inserción
    const insertPosition = this.calculateInsertPosition(dropTarget.element, e);

    if (this.draggedElement) {
      // Mover elemento existente
      this.moveElement(this.draggedElement, dropTarget.element, insertPosition);
    } else {
      // Crear nuevo componente
      this.createNewComponent(this.draggedType, dropTarget.element, insertPosition);
    }

    this.dispatchEvent('drop', {
      type: this.draggedType,
      target: dropTarget.element,
      position: insertPosition,
    });
  }

  /**
   * Finaliza drag de componente
   */
  endComponentDrag(e, componentElement) {
    componentElement.classList.remove('dragging');
    this.cleanup();
  }

  /**
   * Finaliza drag de elemento canvas
   */
  endCanvasElementDrag(e, element) {
    element.classList.remove('dragging-canvas-element');
    this.cleanup();
  }

  /**
   * Maneja finalización de drag
   */
  handleDragEnd(e) {
    this.cleanup();
  }

  /**
   * Encuentra el target de drop más apropiado
   */
  findDropTarget(e) {
    const canvas = document.getElementById('canvas');
    const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);

    // Buscar canvas o elementos canvas
    for (const el of elementsUnderCursor) {
      if (el.id === 'canvas') {
        return {
          element: el,
          type: 'canvas',
          canAcceptChildren: true,
        };
      }

      if (el.classList.contains('canvas-element') && el !== this.draggedElement) {
        // Verificar si puede aceptar hijos
        const canAcceptChildren = this.canAcceptChildren(el);

        return {
          element: el,
          type: 'element',
          canAcceptChildren,
        };
      }
    }

    return null;
  }

  /**
   * Verifica si un elemento puede aceptar hijos
   */
  canAcceptChildren(element) {
    const containerTags = ['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'];
    return containerTags.includes(element.tagName.toLowerCase());
  }

  /**
   * Calcula la posición de inserción
   */
  calculateInsertPosition(targetElement, e) {
    if (targetElement.id === 'canvas') {
      // Si el canvas está vacío o se suelta al final
      const children = Array.from(targetElement.children).filter(el =>
        el.classList.contains('canvas-element')
      );

      if (children.length === 0) {
        return { type: 'append', reference: null };
      }

      // Buscar elemento más cercano
      let closestElement = null;
      let closestDistance = Infinity;
      let insertBefore = false;

      children.forEach(child => {
        const rect = child.getBoundingClientRect();
        const childCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(childCenterY - e.clientY);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = child;
          insertBefore = e.clientY < childCenterY;
        }
      });

      return {
        type: insertBefore ? 'before' : 'after',
        reference: closestElement,
      };
    }

    // Insertar relativo al elemento
    const rect = targetElement.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const threshold = rect.height / 3;

    if (relativeY < threshold) {
      return { type: 'before', reference: targetElement };
    } else if (relativeY > rect.height - threshold) {
      return { type: 'after', reference: targetElement };
    } else if (this.canAcceptChildren(targetElement)) {
      return { type: 'append', reference: targetElement };
    } else {
      return { type: 'after', reference: targetElement };
    }
  }

  /**
   * Mueve elemento existente
   */
  moveElement(element, target, position) {
    if (position.type === 'before') {
      position.reference.parentNode.insertBefore(element, position.reference);
    } else if (position.type === 'after') {
      const nextSibling = position.reference.nextSibling;
      if (nextSibling) {
        position.reference.parentNode.insertBefore(element, nextSibling);
      } else {
        position.reference.parentNode.appendChild(element);
      }
    } else if (position.type === 'append') {
      (position.reference || target).appendChild(element);
    }

    // Mantener selección
    if (window.selectElement) {
      window.selectElement(element);
    }

    if (window.showToast) {
      window.showToast('✅ Elemento reordenado');
    }
  }

  /**
   * Crea nuevo componente
   */
  createNewComponent(type, target, position) {
    // Usar la función global createComponent
    if (!window.createComponent) {
      console.error('createComponent no está disponible');
      return;
    }

    const newElement = window.createComponent(type);

    if (position.type === 'before') {
      position.reference.parentNode.insertBefore(newElement, position.reference);
    } else if (position.type === 'after') {
      const nextSibling = position.reference.nextSibling;
      if (nextSibling) {
        position.reference.parentNode.insertBefore(newElement, nextSibling);
      } else {
        position.reference.parentNode.appendChild(newElement);
      }
    } else if (position.type === 'append') {
      (position.reference || target).appendChild(newElement);
    }

    // Seleccionar nuevo elemento
    if (window.selectElement) {
      window.selectElement(newElement);
    }

    if (window.showToast) {
      window.showToast('✅ Componente agregado');
    }
  }

  /**
   * Crea indicador de drop
   */
  createDropIndicator() {
    this.dropIndicator = document.createElement('div');
    this.dropIndicator.className = 'enhanced-drop-indicator';
    this.dropIndicator.innerHTML = '<div class="indicator-line"></div>';
    document.body.appendChild(this.dropIndicator);
  }

  /**
   * Muestra indicador de drop
   */
  showDropIndicator(dropTarget, e) {
    if (!this.dropIndicator) return;

    const position = this.calculateInsertPosition(dropTarget.element, e);
    let rect;

    if (position.type === 'append' && position.reference) {
      rect = position.reference.getBoundingClientRect();
      this.dropIndicator.style.left = rect.left + 'px';
      this.dropIndicator.style.top = rect.top + rect.height / 2 + 'px';
      this.dropIndicator.style.width = rect.width + 'px';
      this.dropIndicator.classList.add('mode-append');
      this.dropIndicator.classList.remove('mode-insert');
    } else if (position.reference) {
      rect = position.reference.getBoundingClientRect();
      this.dropIndicator.style.left = rect.left + 'px';
      this.dropIndicator.style.width = rect.width + 'px';

      if (position.type === 'before') {
        this.dropIndicator.style.top = rect.top - 2 + 'px';
      } else {
        this.dropIndicator.style.top = rect.bottom - 2 + 'px';
      }

      this.dropIndicator.classList.add('mode-insert');
      this.dropIndicator.classList.remove('mode-append');
    }

    this.dropIndicator.style.display = 'block';
  }

  /**
   * Oculta indicador de drop
   */
  hideDropIndicator() {
    if (this.dropIndicator) {
      this.dropIndicator.style.display = 'none';
    }
  }

  /**
   * Resalta zonas de drop disponibles
   */
  highlightDropZones() {
    const canvas = document.getElementById('canvas');
    canvas?.classList.add('drop-zone-active');

    document.querySelectorAll('.canvas-element').forEach(el => {
      if (el !== this.draggedElement && this.canAcceptChildren(el)) {
        el.classList.add('potential-drop-zone');
      }
    });
  }

  /**
   * Limpia resaltado de zonas
   */
  clearDropZones() {
    document.getElementById('canvas')?.classList.remove('drop-zone-active');
    document.querySelectorAll('.potential-drop-zone').forEach(el => {
      el.classList.remove('potential-drop-zone');
    });
  }

  /**
   * Auto-scroll cuando está cerca del borde
   */
  handleAutoScroll(e) {
    const canvasPanel = document.querySelector('.canvas-panel');
    if (!canvasPanel) return;

    const rect = canvasPanel.getBoundingClientRect();
    const scrollY = canvasPanel.scrollTop;

    // Scroll hacia arriba
    if (e.clientY - rect.top < this.scrollEdgeSize) {
      canvasPanel.scrollTop = scrollY - this.scrollSpeed;
    }
    // Scroll hacia abajo
    else if (rect.bottom - e.clientY < this.scrollEdgeSize) {
      canvasPanel.scrollTop = scrollY + this.scrollSpeed;
    }
  }

  /**
   * Limpieza después de drag
   */
  cleanup() {
    this.isDragging = false;
    this.draggedElement = null;
    this.draggedType = null;

    this.hideDropIndicator();
    this.clearDropZones();

    if (this.dragPreview) {
      this.dragPreview.remove();
      this.dragPreview = null;
    }

    // Limpiar clases
    document.querySelectorAll('.dragging, .dragging-canvas-element').forEach(el => {
      el.classList.remove('dragging', 'dragging-canvas-element');
    });
  }

  /**
   * Dispara evento customizado
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`dragdrop:${eventName}`, {
      detail,
      bubbles: true,
    });

    window.dispatchEvent(event);
  }

  /**
   * Inyecta estilos
   */
  injectStyles() {
    const styleId = 'enhanced-dragdrop-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
            /* Drag handle */
            .drag-handle {
                position: absolute;
                top: 50%;
                left: -20px;
                transform: translateY(-50%);
                width: 16px;
                height: 30px;
                background: #2563eb;
                color: white;
                display: none;
                align-items: center;
                justify-content: center;
                border-radius: 4px 0 0 4px;
                cursor: grab;
                font-size: 10px;
                letter-spacing: -1px;
                z-index: 998;
                opacity: 0;
                transition: all 0.2s;
            }

            .canvas-element.selected .drag-handle {
                display: flex;
            }

            .canvas-element.selected:hover .drag-handle {
                opacity: 1;
                left: -22px;
            }

            .drag-handle:active {
                cursor: grabbing;
            }

            /* Preview de drag */
            .drag-preview {
                position: fixed;
                top: -9999px;
                left: -9999px;
                background: white;
                border: 2px solid #2563eb;
                border-radius: 6px;
                padding: 8px 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                font-size: 13px;
                font-weight: 500;
                color: #1e293b;
                z-index: 10000;
                opacity: 0.9;
                pointer-events: none;
            }

            /* Indicador de drop mejorado */
            .enhanced-drop-indicator {
                position: fixed;
                height: 4px;
                z-index: 9999;
                display: none;
                pointer-events: none;
            }

            .enhanced-drop-indicator .indicator-line {
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                border-radius: 2px;
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
                animation: indicatorPulse 1s infinite;
            }

            .enhanced-drop-indicator.mode-append .indicator-line {
                background: linear-gradient(90deg, #10b981, #059669);
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
            }

            @keyframes indicatorPulse {
                0%, 100% { opacity: 1; transform: scaleX(1); }
                50% { opacity: 0.7; transform: scaleX(0.95); }
            }

            /* Zonas de drop */
            .drop-zone-active {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
                outline: 2px dashed #3b82f6 !important;
                outline-offset: 4px;
            }

            .potential-drop-zone {
                outline: 2px dashed #10b981 !important;
                outline-offset: 2px;
                background: rgba(16, 185, 129, 0.05) !important;
            }

            /* Estados de arrastre */
            .component-item.dragging {
                opacity: 0.5;
                transform: scale(0.95);
                background: #e0f2fe !important;
            }

            .canvas-element.dragging-canvas-element {
                opacity: 0.4;
                outline: 2px dashed #3b82f6 !important;
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
    this.cleanup();

    if (this.dropIndicator) {
      this.dropIndicator.remove();
    }

    console.log('🗑️ EnhancedDragDropManager destruido');
  }
}

// Exportar globalmente
window.EnhancedDragDropManager = EnhancedDragDropManager;

// ES6 export
export default EnhancedDragDropManager;
