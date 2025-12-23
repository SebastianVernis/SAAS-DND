/**
 * Main Initialization Module
 * Initializes all application modules after DOM and all ES6 modules are loaded
 */

// Import all required modules
import DeviceDetector from './utils/deviceDetector.js';
import PerformanceOptimizer from './utils/performanceOptimizer.js';
import ThemeManager from './core/themeManager.js';
import AICodeGenerator from './core/aiCodeGenerator.js';
import UndoRedoManager from './core/undoRedo.js';
import KeyboardShortcutsManager from './core/keyboardShortcuts.js';
import ResponsiveTester from './core/responsiveTester.js';
import LivePreview from './core/livePreview.js';
import GeminiSyntaxValidator from './core/geminiValidator.js';
import ResizeManager from './core/resizeManager.js';
import FreePositionDragDropManager from './core/freePositionDragDrop.js';
import ProjectAnalyzer from './core/projectAnalyzer.js';
import LayersManager from './core/layersManager.js';
import GroupManager from './core/groupManager.js';
import MultiSelectManager from './core/multiSelect.js';
import AlignmentEngine from './core/alignmentEngine.js';
import BatchOperations from './core/batchOperations.js';
import SmartGuides from './core/smartGuides.js';
import LayersPanel from './components/layers/LayersPanel.js';
import AdvancedPropertiesPanel from './components/AdvancedPropertiesPanel.js';
import TouchDragDropManager from './core/touchDragDrop.js';
import GestureManager from './core/gestureManager.js';
import MobileUIManager from './components/mobileUI.js';

/**
 * Initialize all application modules
 */
function initializeApp() {
  console.log('🚀 Initializing application...');

  try {
    // Device Detection (first to detect capabilities)
    window.deviceDetector = new DeviceDetector();
    
    // Performance Optimizer
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Theme Manager (primero para aplicar tema)
    window.themeManager = new ThemeManager();
    
    // AI Code Generator
    window.aiCodeGenerator = new AICodeGenerator();
    
    // Undo/Redo Manager
    window.undoRedoManager = new UndoRedoManager();
    window.undoRedoManager.init();
    
    // Keyboard Shortcuts Manager
    window.keyboardShortcutsManager = new KeyboardShortcutsManager();
    
    // Responsive Tester
    window.responsiveTester = new ResponsiveTester();
    window.responsiveTester.init();
    
    // Live Preview
    window.livePreview = new LivePreview();
    
    // Nuevos módulos mejorados
    window.geminiValidator = new GeminiSyntaxValidator();
    window.resizeManager = new ResizeManager();
    window.freePositionDragDrop = new FreePositionDragDropManager();
    window.projectAnalyzer = new ProjectAnalyzer();
    
    // Workflow 1: UI/UX Core - Layers, Multi-Select & Inspector
    window.layersManager = new LayersManager();
    window.groupManager = new GroupManager(window.layersManager);
    window.multiSelectManager = new MultiSelectManager(window.layersManager);
    window.alignmentEngine = new AlignmentEngine();
    window.batchOperations = new BatchOperations(window.multiSelectManager, window.alignmentEngine, window.groupManager);
    window.smartGuides = new SmartGuides(window.alignmentEngine);
    window.layersPanel = new LayersPanel(window.layersManager);
    window.advancedPropertiesPanel = new AdvancedPropertiesPanel();
    
    // Mobile-First Modules (initialize after device detection)
    if (window.deviceDetector.isTouchDevice) {
      window.touchDragDrop = new TouchDragDropManager();
      window.gestureManager = new GestureManager();
      console.log('✅ Touch & Gesture support enabled');
    }
    
    if (window.deviceDetector.isMobile) {
      window.mobileUI = new MobileUIManager();
      console.log('✅ Mobile UI adaptations enabled');
    }
    
    // Build initial layers tree
    setTimeout(() => {
      window.layersManager.buildTree();
      window.layersPanel.render();
    }, 500);
    
    // Listen for multi-select changes
    window.addEventListener('multiselect:changed', (e) => {
      const count = e.detail.count;
      const toolbar = document.getElementById('multiselectToolbar');
      const countSpan = document.getElementById('multiselectCount');
      const selectionInfo = document.getElementById('selectionInfo');
      const selectionInfoCount = document.getElementById('selectionInfoCount');
      
      if (count > 1) {
        toolbar.classList.remove('hidden');
        selectionInfo.classList.remove('hidden');
        countSpan.textContent = `${count} seleccionados`;
        selectionInfoCount.textContent = count;
      } else {
        toolbar.classList.add('hidden');
        selectionInfo.classList.add('hidden');
      }
    });
    
    console.log('✅ Todos los módulos inicializados correctamente');
  } catch (error) {
    console.error('❌ Error initializing application:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

// Export for external use
export default initializeApp;
