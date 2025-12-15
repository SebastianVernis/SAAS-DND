/**
 * Sistema de Resize Handles para elementos del canvas
 * Permite redimensionar elementos visualmente con 8 puntos de control
 */

export class ResizeHandles {
    constructor() {
        this.activeElement = null;
        this.handlesContainer = null;
        this.isResizing = false;
        this.resizeData = {
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            startLeft: 0,
            startTop: 0,
            handle: null,
            shiftKey: false
        };
        
        this.handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        this.init();
    }

    init() {
        // Crear contenedor de handles
        this.handlesContainer = document.createElement('div');
        this.handlesContainer.className = 'resize-handles-container';
        this.handlesContainer.style.cssText = `
            position: absolute;
            pointer-events: none;
            display: none;
            z-index: 10000;
        `;
        
        // Crear los 8 handles
        this.handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-handle-${position}`;
            handle.dataset.position = position;
            handle.style.cssText = this.getHandleStyles(position);
            this.handlesContainer.appendChild(handle);
        });
        
        document.body.appendChild(this.handlesContainer);
        
        // Event listeners
        this.handlesContainer.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    getHandleStyles(position) {
        const baseStyles = `
            position: absolute;
            background: #2563eb;
            border: 2px solid white;
            border-radius: 50%;
            width: 10px;
            height: 10px;
            pointer-events: auto;
            cursor: ${this.getCursor(position)};
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
        `;
        
        const positions = {
            'nw': 'top: -5px; left: -5px;',
            'n': 'top: -5px; left: 50%; transform: translateX(-50%);',
            'ne': 'top: -5px; right: -5px;',
            'e': 'top: 50%; right: -5px; transform: translateY(-50%);',
            'se': 'bottom: -5px; right: -5px;',
            's': 'bottom: -5px; left: 50%; transform: translateX(-50%);',
            'sw': 'bottom: -5px; left: -5px;',
            'w': 'top: 50%; left: -5px; transform: translateY(-50%);'
        };
        
        return baseStyles + positions[position];
    }

    getCursor(position) {
        const cursors = {
            'nw': 'nw-resize',
            'n': 'n-resize',
            'ne': 'ne-resize',
            'e': 'e-resize',
            'se': 'se-resize',
            's': 's-resize',
            'sw': 'sw-resize',
            'w': 'w-resize'
        };
        return cursors[position];
    }

    showHandles(element) {
        if (!element || element === this.handlesContainer) return;
        
        this.activeElement = element;
        this.updateHandlesPosition();
        this.handlesContainer.style.display = 'block';
    }

    hideHandles() {
        this.handlesContainer.style.display = 'none';
        this.activeElement = null;
    }

    updateHandlesPosition() {
        if (!this.activeElement) return;
        
        const rect = this.activeElement.getBoundingClientRect();
        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        this.handlesContainer.style.left = (rect.left - canvasRect.left + canvas.scrollLeft) + 'px';
        this.handlesContainer.style.top = (rect.top - canvasRect.top + canvas.scrollTop) + 'px';
        this.handlesContainer.style.width = rect.width + 'px';
        this.handlesContainer.style.height = rect.height + 'px';
    }

    onMouseDown(e) {
        if (!e.target.classList.contains('resize-handle')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.isResizing = true;
        const rect = this.activeElement.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(this.activeElement);
        
        this.resizeData = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: parseFloat(computedStyle.width),
            startHeight: parseFloat(computedStyle.height),
            startLeft: parseFloat(computedStyle.left) || 0,
            startTop: parseFloat(computedStyle.top) || 0,
            handle: e.target.dataset.position,
            shiftKey: e.shiftKey,
            aspectRatio: rect.width / rect.height
        };
        
        // Agregar clase de resizing
        this.activeElement.classList.add('is-resizing');
        document.body.style.cursor = this.getCursor(this.resizeData.handle);
        
        // Crear tooltip de dimensiones
        this.createDimensionTooltip();
    }

    onMouseMove(e) {
        if (!this.isResizing) return;
        
        e.preventDefault();
        
        const deltaX = e.clientX - this.resizeData.startX;
        const deltaY = e.clientY - this.resizeData.startY;
        const handle = this.resizeData.handle;
        
        let newWidth = this.resizeData.startWidth;
        let newHeight = this.resizeData.startHeight;
        let newLeft = this.resizeData.startLeft;
        let newTop = this.resizeData.startTop;
        
        // Calcular nuevas dimensiones según el handle
        if (handle.includes('e')) {
            newWidth = Math.max(20, this.resizeData.startWidth + deltaX);
        }
        if (handle.includes('w')) {
            newWidth = Math.max(20, this.resizeData.startWidth - deltaX);
            newLeft = this.resizeData.startLeft + deltaX;
        }
        if (handle.includes('s')) {
            newHeight = Math.max(20, this.resizeData.startHeight + deltaY);
        }
        if (handle.includes('n')) {
            newHeight = Math.max(20, this.resizeData.startHeight - deltaY);
            newTop = this.resizeData.startTop + deltaY;
        }
        
        // Mantener proporción si se presiona Shift
        if (e.shiftKey || this.resizeData.shiftKey) {
            if (handle.includes('e') || handle.includes('w')) {
                newHeight = newWidth / this.resizeData.aspectRatio;
            } else if (handle.includes('n') || handle.includes('s')) {
                newWidth = newHeight * this.resizeData.aspectRatio;
            }
        }
        
        // Aplicar cambios
        this.activeElement.style.width = newWidth + 'px';
        this.activeElement.style.height = newHeight + 'px';
        
        if (handle.includes('w') || handle.includes('n')) {
            this.activeElement.style.left = newLeft + 'px';
            this.activeElement.style.top = newTop + 'px';
        }
        
        // Actualizar posición de handles
        this.updateHandlesPosition();
        
        // Actualizar tooltip
        this.updateDimensionTooltip(newWidth, newHeight);
        
        // Actualizar panel de propiedades si existe
        if (window.updatePropertiesPanel) {
            window.updatePropertiesPanel(this.activeElement);
        }
    }

    onMouseUp(e) {
        if (!this.isResizing) return;
        
        this.isResizing = false;
        this.activeElement.classList.remove('is-resizing');
        document.body.style.cursor = '';
        
        // Remover tooltip
        this.removeDimensionTooltip();
        
        // Guardar en historial de undo/redo
        if (window.undoRedoManager) {
            window.undoRedoManager.saveState();
        }
    }

    createDimensionTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'resize-dimension-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            pointer-events: none;
            z-index: 100000;
            white-space: nowrap;
        `;
        document.body.appendChild(tooltip);
    }

    updateDimensionTooltip(width, height) {
        const tooltip = document.getElementById('resize-dimension-tooltip');
        if (!tooltip) return;
        
        tooltip.textContent = `${Math.round(width)}px × ${Math.round(height)}px`;
        tooltip.style.left = (this.resizeData.startX + 20) + 'px';
        tooltip.style.top = (this.resizeData.startY - 30) + 'px';
    }

    removeDimensionTooltip() {
        const tooltip = document.getElementById('resize-dimension-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    destroy() {
        if (this.handlesContainer) {
            this.handlesContainer.remove();
        }
    }
}

// Estilos CSS para los handles
const styles = document.createElement('style');
styles.textContent = `
    .resize-handle:hover {
        transform: scale(1.3) !important;
        background: #1d4ed8 !important;
    }
    
    .is-resizing {
        user-select: none;
        pointer-events: none;
    }
    
    .resize-handles-container {
        outline: 2px dashed #2563eb;
        outline-offset: -1px;
    }
`;
document.head.appendChild(styles);

// Exportar instancia global
export const resizeHandles = new ResizeHandles();
window.resizeHandles = resizeHandles;
