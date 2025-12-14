/**
 * Sistema de Toggle de Paneles Laterales
 * Permite ocultar/mostrar paneles de componentes y propiedades
 * Incluye modo "Zen" para ocultar ambos
 */

export class PanelToggle {
    constructor() {
        this.leftPanelVisible = true;
        this.rightPanelVisible = true;
        this.zenMode = false;
        this.init();
    }

    init() {
        this.createToggleButtons();
        this.loadPanelStates();
        this.attachEventListeners();
    }

    createToggleButtons() {
        // Buscar el menú de Vista
        const viewMenu = Array.from(document.querySelectorAll('.toolbar-dropdown-menu'))
            .find(menu => menu.previousElementSibling?.textContent.includes('Vista'));
        
        if (!viewMenu) {
            console.warn('View menu not found, creating standalone buttons');
            this.createStandaloneButtons();
            return;
        }
        
        // Agregar divider
        const divider = document.createElement('div');
        divider.className = 'dropdown-divider';
        viewMenu.appendChild(divider);
        
        // Botón para panel de componentes
        const componentsBtn = document.createElement('button');
        componentsBtn.className = 'dropdown-item';
        componentsBtn.id = 'toggle-components-panel-btn';
        componentsBtn.innerHTML = '◧ Panel de Componentes';
        componentsBtn.onclick = () => this.toggleLeftPanel();
        viewMenu.appendChild(componentsBtn);
        
        // Botón para panel de propiedades
        const propertiesBtn = document.createElement('button');
        propertiesBtn.className = 'dropdown-item';
        propertiesBtn.id = 'toggle-properties-panel-btn';
        propertiesBtn.innerHTML = '◨ Panel de Propiedades';
        propertiesBtn.onclick = () => this.toggleRightPanel();
        viewMenu.appendChild(propertiesBtn);
        
        // Agregar divider
        const divider2 = document.createElement('div');
        divider2.className = 'dropdown-divider';
        viewMenu.appendChild(divider2);
        
        // Botón modo Zen
        const zenBtn = document.createElement('button');
        zenBtn.className = 'dropdown-item';
        zenBtn.id = 'toggle-zen-mode-btn';
        zenBtn.innerHTML = '🧘 Modo Zen <span class="shortcut">F11</span>';
        zenBtn.onclick = () => this.toggleZenMode();
        viewMenu.appendChild(zenBtn);
    }

    createStandaloneButtons() {
        // Crear botones flotantes si no hay menú
        const toolbar = document.querySelector('.toolbar');
        if (!toolbar) return;
        
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = `
            display: flex;
            gap: 4px;
            margin-left: auto;
        `;
        
        // Botón panel izquierdo
        const leftBtn = document.createElement('button');
        leftBtn.className = 'toolbar-btn';
        leftBtn.id = 'toggle-left-panel-standalone';
        leftBtn.innerHTML = '◧';
        leftBtn.title = 'Toggle Panel de Componentes';
        leftBtn.onclick = () => this.toggleLeftPanel();
        btnGroup.appendChild(leftBtn);
        
        // Botón panel derecho
        const rightBtn = document.createElement('button');
        rightBtn.className = 'toolbar-btn';
        rightBtn.id = 'toggle-right-panel-standalone';
        rightBtn.innerHTML = '◨';
        rightBtn.title = 'Toggle Panel de Propiedades';
        rightBtn.onclick = () => this.toggleRightPanel();
        btnGroup.appendChild(rightBtn);
        
        // Botón modo Zen
        const zenBtn = document.createElement('button');
        zenBtn.className = 'toolbar-btn';
        zenBtn.id = 'toggle-zen-standalone';
        zenBtn.innerHTML = '🧘';
        zenBtn.title = 'Modo Zen (F11)';
        zenBtn.onclick = () => this.toggleZenMode();
        btnGroup.appendChild(zenBtn);
        
        toolbar.appendChild(btnGroup);
    }

    attachEventListeners() {
        // Keyboard shortcut para modo Zen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleZenMode();
            }
            
            // Ctrl+B para panel izquierdo
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleLeftPanel();
            }
            
            // Ctrl+P para panel derecho
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.toggleRightPanel();
            }
        });
    }

    toggleLeftPanel() {
        this.leftPanelVisible = !this.leftPanelVisible;
        const panel = document.getElementById('components-panel');
        
        if (panel) {
            if (this.leftPanelVisible) {
                panel.style.display = 'flex';
                panel.style.animation = 'slideInLeft 0.3s ease';
            } else {
                panel.style.animation = 'slideOutLeft 0.3s ease';
                setTimeout(() => {
                    panel.style.display = 'none';
                }, 300);
            }
        }
        
        this.updateButtonStates();
        this.savePanelStates();
        this.adjustCanvasWidth();
    }

    toggleRightPanel() {
        this.rightPanelVisible = !this.rightPanelVisible;
        const panel = document.getElementById('properties-panel');
        
        if (panel) {
            if (this.rightPanelVisible) {
                panel.style.display = 'flex';
                panel.style.animation = 'slideInRight 0.3s ease';
            } else {
                panel.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    panel.style.display = 'none';
                }, 300);
            }
        }
        
        this.updateButtonStates();
        this.savePanelStates();
        this.adjustCanvasWidth();
    }

    toggleZenMode() {
        this.zenMode = !this.zenMode;
        
        if (this.zenMode) {
            // Guardar estados actuales
            this.previousLeftState = this.leftPanelVisible;
            this.previousRightState = this.rightPanelVisible;
            
            // Ocultar ambos paneles
            if (this.leftPanelVisible) this.toggleLeftPanel();
            if (this.rightPanelVisible) this.toggleRightPanel();
            
            // Ocultar toolbar
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.style.animation = 'slideOutTop 0.3s ease';
                setTimeout(() => {
                    toolbar.style.display = 'none';
                }, 300);
            }
            
            // Mostrar indicador de modo Zen
            this.showZenIndicator();
        } else {
            // Restaurar estados anteriores
            if (this.previousLeftState && !this.leftPanelVisible) {
                this.toggleLeftPanel();
            }
            if (this.previousRightState && !this.rightPanelVisible) {
                this.toggleRightPanel();
            }
            
            // Mostrar toolbar
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.style.display = 'flex';
                toolbar.style.animation = 'slideInTop 0.3s ease';
            }
            
            // Ocultar indicador
            this.hideZenIndicator();
        }
        
        this.updateButtonStates();
        this.savePanelStates();
    }

    showZenIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'zen-mode-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 100000;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: fadeIn 0.3s ease;
            cursor: pointer;
        `;
        indicator.innerHTML = '🧘 Modo Zen Activado - Presiona F11 para salir';
        indicator.onclick = () => this.toggleZenMode();
        document.body.appendChild(indicator);
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            if (indicator && this.zenMode) {
                indicator.style.opacity = '0.3';
            }
        }, 3000);
    }

    hideZenIndicator() {
        const indicator = document.getElementById('zen-mode-indicator');
        if (indicator) {
            indicator.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => indicator.remove(), 300);
        }
    }

    adjustCanvasWidth() {
        const canvasContainer = document.querySelector('.canvas-container');
        if (!canvasContainer) return;
        
        // Calcular ancho disponible
        let leftWidth = this.leftPanelVisible ? 280 : 0;
        let rightWidth = this.rightPanelVisible ? 320 : 0;
        
        canvasContainer.style.width = `calc(100% - ${leftWidth + rightWidth}px)`;
        canvasContainer.style.transition = 'width 0.3s ease';
    }

    updateButtonStates() {
        // Actualizar botones del menú
        const componentsBtn = document.getElementById('toggle-components-panel-btn');
        if (componentsBtn) {
            componentsBtn.classList.toggle('active', this.leftPanelVisible);
            componentsBtn.innerHTML = this.leftPanelVisible ? 
                '◧ Ocultar Componentes' : '◧ Mostrar Componentes';
        }
        
        const propertiesBtn = document.getElementById('toggle-properties-panel-btn');
        if (propertiesBtn) {
            propertiesBtn.classList.toggle('active', this.rightPanelVisible);
            propertiesBtn.innerHTML = this.rightPanelVisible ? 
                '◨ Ocultar Propiedades' : '◨ Mostrar Propiedades';
        }
        
        const zenBtn = document.getElementById('toggle-zen-mode-btn');
        if (zenBtn) {
            zenBtn.classList.toggle('active', this.zenMode);
            zenBtn.innerHTML = this.zenMode ? 
                '🧘 Salir de Modo Zen <span class="shortcut">F11</span>' : 
                '🧘 Modo Zen <span class="shortcut">F11</span>';
        }
        
        // Actualizar botones standalone
        const leftStandalone = document.getElementById('toggle-left-panel-standalone');
        if (leftStandalone) {
            leftStandalone.classList.toggle('active', this.leftPanelVisible);
        }
        
        const rightStandalone = document.getElementById('toggle-right-panel-standalone');
        if (rightStandalone) {
            rightStandalone.classList.toggle('active', this.rightPanelVisible);
        }
        
        const zenStandalone = document.getElementById('toggle-zen-standalone');
        if (zenStandalone) {
            zenStandalone.classList.toggle('active', this.zenMode);
        }
    }

    savePanelStates() {
        localStorage.setItem('panelStates', JSON.stringify({
            leftPanelVisible: this.leftPanelVisible,
            rightPanelVisible: this.rightPanelVisible,
            zenMode: this.zenMode
        }));
    }

    loadPanelStates() {
        const saved = localStorage.getItem('panelStates');
        if (saved) {
            try {
                const states = JSON.parse(saved);
                this.leftPanelVisible = states.leftPanelVisible !== false;
                this.rightPanelVisible = states.rightPanelVisible !== false;
                // No restaurar zenMode automáticamente
            } catch (e) {
                console.error('Error loading panel states:', e);
            }
        }
        
        this.updateButtonStates();
    }
}

// Estilos CSS para animaciones
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideInLeft {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutLeft {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(-100%);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideInTop {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutTop {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    #zen-mode-indicator:hover {
        opacity: 1 !important;
        background: rgba(0, 0, 0, 0.9);
    }
    
    .shortcut {
        float: right;
        font-size: 11px;
        color: #94a3b8;
        margin-left: 20px;
    }
`;
document.head.appendChild(styles);

// Exportar instancia global
export const panelToggle = new PanelToggle();
window.panelToggle = panelToggle;
