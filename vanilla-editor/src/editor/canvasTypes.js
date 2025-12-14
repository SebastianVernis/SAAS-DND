/**
 * Sistema de Tipos de Canvas
 * Permite seleccionar diferentes fondos: Blanco, Grid, Dots, Guías
 * Incluye reglas horizontales y verticales
 */

export class CanvasTypes {
    constructor() {
        this.canvas = null;
        this.currentType = 'blank';
        this.showRulers = true;
        this.gridSize = 20;
        this.snapToGrid = false;
        this.init();
    }

    init() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.createCanvasControls();
        this.createRulers();
        this.applyCanvasType('blank');
    }

    createCanvasControls() {
        // Buscar el menú de Vista en el toolbar
        const viewMenu = Array.from(document.querySelectorAll('.toolbar-dropdown-menu'))
            .find(menu => menu.previousElementSibling?.textContent.includes('Vista'));
        
        if (!viewMenu) return;
        
        // Agregar divider
        const divider = document.createElement('div');
        divider.className = 'dropdown-divider';
        viewMenu.appendChild(divider);
        
        // Agregar opciones de canvas
        const canvasOptions = [
            { id: 'blank', label: '⬜ Canvas Blanco', icon: '⬜' },
            { id: 'grid', label: '⊞ Canvas Grid', icon: '⊞' },
            { id: 'dots', label: '⋮ Canvas Dots', icon: '⋮' },
            { id: 'guides', label: '┼ Canvas Guías', icon: '┼' }
        ];
        
        canvasOptions.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'dropdown-item canvas-type-btn';
            btn.dataset.canvasType = option.id;
            btn.innerHTML = option.label;
            btn.onclick = () => this.setCanvasType(option.id);
            viewMenu.appendChild(btn);
        });
        
        // Agregar divider
        const divider2 = document.createElement('div');
        divider2.className = 'dropdown-divider';
        viewMenu.appendChild(divider2);
        
        // Toggle reglas
        const rulersBtn = document.createElement('button');
        rulersBtn.className = 'dropdown-item';
        rulersBtn.id = 'toggle-rulers-btn';
        rulersBtn.innerHTML = '📏 Mostrar Reglas';
        rulersBtn.onclick = () => this.toggleRulers();
        viewMenu.appendChild(rulersBtn);
        
        // Toggle snap to grid
        const snapBtn = document.createElement('button');
        snapBtn.className = 'dropdown-item';
        snapBtn.id = 'toggle-snap-btn';
        snapBtn.innerHTML = '🧲 Ajustar a Grid';
        snapBtn.onclick = () => this.toggleSnapToGrid();
        viewMenu.appendChild(snapBtn);
    }

    createRulers() {
        // Crear contenedor de reglas
        const rulersContainer = document.createElement('div');
        rulersContainer.id = 'rulers-container';
        rulersContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 5;
        `;
        
        // Regla horizontal
        const horizontalRuler = document.createElement('div');
        horizontalRuler.id = 'horizontal-ruler';
        horizontalRuler.className = 'ruler ruler-horizontal';
        horizontalRuler.style.cssText = `
            position: absolute;
            top: 0;
            left: 30px;
            right: 0;
            height: 30px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            overflow: hidden;
        `;
        
        // Regla vertical
        const verticalRuler = document.createElement('div');
        verticalRuler.id = 'vertical-ruler';
        verticalRuler.className = 'ruler ruler-vertical';
        verticalRuler.style.cssText = `
            position: absolute;
            top: 30px;
            left: 0;
            bottom: 0;
            width: 30px;
            background: #f8fafc;
            border-right: 1px solid #e2e8f0;
            overflow: hidden;
        `;
        
        // Esquina
        const corner = document.createElement('div');
        corner.className = 'ruler-corner';
        corner.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 30px;
            height: 30px;
            background: #f1f5f9;
            border-right: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #64748b;
        `;
        corner.textContent = '📐';
        
        rulersContainer.appendChild(horizontalRuler);
        rulersContainer.appendChild(verticalRuler);
        rulersContainer.appendChild(corner);
        
        // Insertar antes del canvas
        const canvasContainer = this.canvas.parentElement;
        canvasContainer.style.position = 'relative';
        canvasContainer.insertBefore(rulersContainer, this.canvas);
        
        // Ajustar canvas para dejar espacio a las reglas
        this.canvas.style.marginTop = '30px';
        this.canvas.style.marginLeft = '30px';
        
        // Dibujar marcas en las reglas
        this.drawRulerMarks();
    }

    drawRulerMarks() {
        const hRuler = document.getElementById('horizontal-ruler');
        const vRuler = document.getElementById('vertical-ruler');
        
        if (!hRuler || !vRuler) return;
        
        // Limpiar reglas
        hRuler.innerHTML = '';
        vRuler.innerHTML = '';
        
        const canvasWidth = this.canvas.offsetWidth;
        const canvasHeight = this.canvas.offsetHeight;
        
        // Marcas horizontales
        for (let i = 0; i <= canvasWidth; i += 50) {
            const mark = document.createElement('div');
            mark.style.cssText = `
                position: absolute;
                left: ${i}px;
                top: 0;
                width: 1px;
                height: ${i % 100 === 0 ? '20px' : '10px'};
                background: #cbd5e1;
            `;
            hRuler.appendChild(mark);
            
            if (i % 100 === 0) {
                const label = document.createElement('span');
                label.style.cssText = `
                    position: absolute;
                    left: ${i + 3}px;
                    top: 2px;
                    font-size: 10px;
                    color: #64748b;
                `;
                label.textContent = i;
                hRuler.appendChild(label);
            }
        }
        
        // Marcas verticales
        for (let i = 0; i <= canvasHeight; i += 50) {
            const mark = document.createElement('div');
            mark.style.cssText = `
                position: absolute;
                top: ${i}px;
                left: 0;
                height: 1px;
                width: ${i % 100 === 0 ? '20px' : '10px'};
                background: #cbd5e1;
            `;
            vRuler.appendChild(mark);
            
            if (i % 100 === 0) {
                const label = document.createElement('span');
                label.style.cssText = `
                    position: absolute;
                    top: ${i + 3}px;
                    left: 2px;
                    font-size: 10px;
                    color: #64748b;
                    writing-mode: vertical-lr;
                    transform: rotate(180deg);
                `;
                label.textContent = i;
                vRuler.appendChild(label);
            }
        }
    }

    setCanvasType(type) {
        this.currentType = type;
        this.applyCanvasType(type);
        
        // Actualizar botones activos
        document.querySelectorAll('.canvas-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.canvasType === type);
        });
    }

    applyCanvasType(type) {
        // Remover clases anteriores
        this.canvas.classList.remove('canvas-blank', 'canvas-grid', 'canvas-dots', 'canvas-guides');
        
        // Agregar nueva clase
        this.canvas.classList.add(`canvas-${type}`);
        
        // Aplicar estilos según el tipo
        switch(type) {
            case 'blank':
                this.canvas.style.background = '#ffffff';
                break;
            case 'grid':
                this.canvas.style.background = `
                    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                `;
                this.canvas.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px`;
                break;
            case 'dots':
                this.canvas.style.background = `
                    radial-gradient(circle, #cbd5e1 1px, transparent 1px)
                `;
                this.canvas.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px`;
                break;
            case 'guides':
                this.canvas.style.background = `
                    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px),
                    linear-gradient(to right, #2563eb 2px, transparent 2px),
                    linear-gradient(to bottom, #2563eb 2px, transparent 2px)
                `;
                this.canvas.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px, ${this.gridSize}px ${this.gridSize}px, ${this.gridSize * 5}px ${this.gridSize * 5}px, ${this.gridSize * 5}px ${this.gridSize * 5}px`;
                break;
        }
    }

    toggleRulers() {
        this.showRulers = !this.showRulers;
        const rulersContainer = document.getElementById('rulers-container');
        
        if (rulersContainer) {
            rulersContainer.style.display = this.showRulers ? 'block' : 'none';
            this.canvas.style.marginTop = this.showRulers ? '30px' : '0';
            this.canvas.style.marginLeft = this.showRulers ? '30px' : '0';
        }
        
        const btn = document.getElementById('toggle-rulers-btn');
        if (btn) {
            btn.innerHTML = this.showRulers ? '📏 Ocultar Reglas' : '📏 Mostrar Reglas';
        }
    }

    toggleSnapToGrid() {
        this.snapToGrid = !this.snapToGrid;
        
        const btn = document.getElementById('toggle-snap-btn');
        if (btn) {
            btn.innerHTML = this.snapToGrid ? '🧲 Desactivar Ajuste' : '🧲 Ajustar a Grid';
            btn.classList.toggle('active', this.snapToGrid);
        }
        
        // Notificar al sistema de drag & drop
        if (window.dragDropManager) {
            window.dragDropManager.snapToGrid = this.snapToGrid;
            window.dragDropManager.gridSize = this.gridSize;
        }
    }

    snapPosition(x, y) {
        if (!this.snapToGrid) return { x, y };
        
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }

    setGridSize(size) {
        this.gridSize = size;
        this.applyCanvasType(this.currentType);
        this.drawRulerMarks();
    }
}

// Estilos CSS
const styles = document.createElement('style');
styles.textContent = `
    .canvas-blank {
        background: #ffffff !important;
    }
    
    .ruler {
        font-family: system-ui, -apple-system, sans-serif;
    }
    
    .dropdown-item.active {
        background: #e0e7ff;
        color: #2563eb;
        font-weight: 600;
    }
    
    .dropdown-item.active::before {
        content: '✓ ';
        margin-right: 4px;
    }
`;
document.head.appendChild(styles);

// Exportar instancia global
export const canvasTypes = new CanvasTypes();
window.canvasTypes = canvasTypes;
