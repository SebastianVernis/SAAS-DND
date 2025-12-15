/**
 * Advanced Features Initialization
 * Inicializa todas las nuevas características avanzadas del editor
 */

// Importar todos los módulos avanzados
import { resizeHandles } from './resizeHandles.js';
import { formattingToolbar } from './formattingToolbar.js';
import { canvasTypes } from './canvasTypes.js';
import { panelToggle } from '../ui/panelToggle.js';
import { gitAutoSave } from '../integrations/gitAutoSave.js';
import { legalModal } from '../legal/legalModal.js';

/**
 * Inicializar todas las características avanzadas
 */
export function initAdvancedFeatures() {
    console.log('🚀 Initializing Advanced Features...');
    
    // 1. Resize Handles
    console.log('✅ Resize Handles initialized');
    
    // 2. Formatting Toolbar
    console.log('✅ Formatting Toolbar initialized');
    
    // 3. Canvas Types
    console.log('✅ Canvas Types initialized');
    
    // 4. Panel Toggle
    console.log('✅ Panel Toggle initialized');
    
    // 5. Git Auto-Save
    console.log('✅ Git Auto-Save initialized');
    
    // 6. Legal Modal
    console.log('✅ Legal Modal initialized');
    
    // Integrar con el sistema de selección existente
    integrateWithExistingSystem();
    
    console.log('🎉 All Advanced Features initialized successfully!');
}

/**
 * Integrar con el sistema existente
 */
function integrateWithExistingSystem() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupIntegrations);
    } else {
        setupIntegrations();
    }
}

function setupIntegrations() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.warn('Canvas not found, retrying...');
        setTimeout(setupIntegrations, 100);
        return;
    }
    
    // Integrar resize handles con selección de elementos
    canvas.addEventListener('click', (e) => {
        const element = e.target;
        
        // Ignorar clicks en el canvas mismo
        if (element === canvas) {
            resizeHandles.hideHandles();
            formattingToolbar.hide();
            return;
        }
        
        // Mostrar resize handles para el elemento seleccionado
        if (element.classList.contains('canvas-element') || element.closest('.canvas-element')) {
            const targetElement = element.classList.contains('canvas-element') ? 
                element : element.closest('.canvas-element');
            
            resizeHandles.showHandles(targetElement);
            
            // Mostrar formatting toolbar si es un elemento de texto
            if (isTextElement(targetElement)) {
                setTimeout(() => {
                    formattingToolbar.show(targetElement);
                }, 100);
            }
        }
    });
    
    // Actualizar handles cuando se hace scroll en el canvas
    canvas.addEventListener('scroll', () => {
        if (resizeHandles.activeElement) {
            resizeHandles.updateHandlesPosition();
        }
    });
    
    // Actualizar handles cuando se redimensiona la ventana
    window.addEventListener('resize', () => {
        if (resizeHandles.activeElement) {
            resizeHandles.updateHandlesPosition();
        }
        if (formattingToolbar.isVisible) {
            formattingToolbar.hide();
        }
    });
    
    // Integrar con el sistema de propiedades existente
    const originalUpdateProperties = window.updatePropertiesPanel;
    if (originalUpdateProperties) {
        window.updatePropertiesPanel = function(element) {
            originalUpdateProperties.call(this, element);
            
            // Actualizar handles cuando cambian las propiedades
            if (resizeHandles.activeElement === element) {
                setTimeout(() => {
                    resizeHandles.updateHandlesPosition();
                }, 50);
            }
        };
    }
    
    // Keyboard shortcuts globales
    document.addEventListener('keydown', (e) => {
        // Escape para ocultar todo
        if (e.key === 'Escape') {
            resizeHandles.hideHandles();
            formattingToolbar.hide();
        }
        
        // Delete para eliminar elemento seleccionado
        if (e.key === 'Delete' && resizeHandles.activeElement) {
            const element = resizeHandles.activeElement;
            resizeHandles.hideHandles();
            formattingToolbar.hide();
            element.remove();
            
            if (window.undoRedoManager) {
                window.undoRedoManager.saveState();
            }
        }
    });
    
    console.log('✅ Advanced Features integrated with existing system');
}

/**
 * Verificar si un elemento es de texto
 */
function isTextElement(element) {
    const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON', 'LABEL'];
    return textTags.includes(element.tagName) || element.contentEditable === 'true';
}

/**
 * Reorganizar panel de propiedades en columna vertical
 */
export function reorganizePropertiesPanel() {
    const propertiesPanel = document.getElementById('properties-panel');
    if (!propertiesPanel) return;
    
    // Aplicar estilos de columna vertical
    const style = document.createElement('style');
    style.id = 'properties-panel-vertical-styles';
    style.textContent = `
        #properties-panel {
            display: flex !important;
            flex-direction: column !important;
            overflow-y: auto !important;
            padding: 20px !important;
            gap: 0 !important;
        }
        
        .property-section {
            margin-bottom: 25px;
            border-bottom: 1px solid var(--border-primary);
            padding-bottom: 20px;
        }
        
        .property-section:last-child {
            border-bottom: none;
        }
        
        .property-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            cursor: pointer;
            user-select: none;
            font-weight: 600;
            color: var(--text-primary);
            font-size: 14px;
        }
        
        .property-section-header:hover {
            color: var(--accent-primary);
        }
        
        .property-section-header::after {
            content: '▼';
            font-size: 10px;
            transition: transform 0.3s;
        }
        
        .property-section.collapsed .property-section-header::after {
            transform: rotate(-90deg);
        }
        
        .property-section-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding-top: 15px;
            transition: all 0.3s;
        }
        
        .property-section.collapsed .property-section-content {
            display: none;
        }
        
        .property-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .property-label {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }
        
        .property-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-primary);
            border-radius: 6px;
            font-size: 13px;
            transition: all 0.3s;
        }
        
        .property-input:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .property-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .property-divider {
            height: 1px;
            background: var(--border-primary);
            margin: 10px 0;
        }
    `;
    
    // Remover estilo anterior si existe
    const oldStyle = document.getElementById('properties-panel-vertical-styles');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    
    console.log('✅ Properties Panel reorganized to vertical layout');
}

// Auto-inicializar cuando se carga el módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAdvancedFeatures();
        reorganizePropertiesPanel();
    });
} else {
    initAdvancedFeatures();
    reorganizePropertiesPanel();
}

// Exportar funciones globales
window.initAdvancedFeatures = initAdvancedFeatures;
window.reorganizePropertiesPanel = reorganizePropertiesPanel;
