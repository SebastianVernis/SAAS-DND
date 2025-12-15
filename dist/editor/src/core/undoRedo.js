/**
 * UndoRedoManager - Sistema de deshacer/rehacer cambios
 */
class UndoRedoManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
    this.isProcessing = false;
  }

  /**
   * Inicializa el gestor
   */
  init() {
    this.saveInitialState();
    this.setupEventListeners();
  }

  /**
   * Guarda estado inicial
   */
  saveInitialState() {
    const canvas = document.getElementById('canvas');
    if (canvas) {
      this.saveState({
        type: 'initial',
        description: 'Estado inicial',
      });
    }
  }

  /**
   * Guarda estado actual
   */
  saveState(action = {}) {
    if (this.isProcessing) return;

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Capturar estado del canvas
    const state = {
      html: canvas.innerHTML,
      timestamp: Date.now(),
      action: {
        type: action.type || 'unknown',
        description: action.description || 'Cambio',
        elementId: action.elementId || null,
      },
    };

    // Eliminar estados futuros si estamos en medio del historial
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }

    // Agregar nuevo estado
    this.history.push(state);
    this.currentIndex++;

    // Limitar tamaño del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.updateUI();
  }

  /**
   * Deshace último cambio
   */
  undo() {
    if (!this.canUndo()) {
      this.showMessage('No hay cambios para deshacer');
      return false;
    }

    this.currentIndex--;
    this.restoreState(this.history[this.currentIndex]);
    this.updateUI();
    this.showMessage('Deshecho');
    return true;
  }

  /**
   * Rehace cambio
   */
  redo() {
    if (!this.canRedo()) {
      this.showMessage('No hay cambios para rehacer');
      return false;
    }

    this.currentIndex++;
    this.restoreState(this.history[this.currentIndex]);
    this.updateUI();
    this.showMessage('Rehecho');
    return true;
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo() {
    return this.currentIndex > 0;
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Restaura un estado
   */
  restoreState(state) {
    this.isProcessing = true;

    const canvas = document.getElementById('canvas');
    if (canvas && state) {
      canvas.innerHTML = state.html;

      // Re-aplicar eventos del editor
      if (window.projectManager) {
        window.projectManager.reapplyEditorEvents();
      }
    }

    this.isProcessing = false;
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Atajos de teclado
    document.addEventListener('keydown', e => {
      // Ctrl+Z o Cmd+Z: Deshacer
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }

      // Ctrl+Shift+Z o Cmd+Shift+Z: Rehacer
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this.redo();
      }

      // Ctrl+Y o Cmd+Y: Rehacer (alternativo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        this.redo();
      }
    });

    // Detectar cambios en el canvas
    const canvas = document.getElementById('canvas');
    if (canvas) {
      // Usar MutationObserver para detectar cambios
      const observer = new MutationObserver(mutations => {
        if (!this.isProcessing && mutations.length > 0) {
          // Debounce para evitar guardar demasiados estados
          clearTimeout(this.saveTimeout);
          this.saveTimeout = setTimeout(() => {
            this.saveState({
              type: 'edit',
              description: 'Edición de contenido',
            });
          }, 500);
        }
      });

      observer.observe(canvas, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
  }

  /**
   * Actualiza UI (botones deshacer/rehacer)
   */
  updateUI() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (undoBtn) {
      undoBtn.disabled = !this.canUndo();
      undoBtn.title = this.canUndo()
        ? `Deshacer: ${this.history[this.currentIndex - 1]?.action.description || ''}`
        : 'No hay cambios para deshacer';
    }

    if (redoBtn) {
      redoBtn.disabled = !this.canRedo();
      redoBtn.title = this.canRedo()
        ? `Rehacer: ${this.history[this.currentIndex + 1]?.action.description || ''}`
        : 'No hay cambios para rehacer';
    }
  }

  /**
   * Obtiene historial
   */
  getHistory() {
    return this.history.map((state, index) => ({
      index: index,
      isCurrent: index === this.currentIndex,
      description: state.action.description,
      timestamp: new Date(state.timestamp).toLocaleString(),
    }));
  }

  /**
   * Salta a un estado específico del historial
   */
  jumpToState(index) {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      this.restoreState(this.history[this.currentIndex]);
      this.updateUI();
      return true;
    }
    return false;
  }

  /**
   * Limpia historial
   */
  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
    this.saveInitialState();
  }

  /**
   * Muestra mensaje
   */
  showMessage(message) {
    if (window.showToast) {
      window.showToast(message);
    } else {
      console.log(message);
    }
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UndoRedoManager;
}

export default UndoRedoManager;

window.UndoRedoManager = UndoRedoManager;
