/**
 * KeyboardShortcutsManager - Gestiona atajos de teclado del editor
 */
class KeyboardShortcutsManager {
  constructor() {
    this.shortcuts = new Map();
    this.init();
  }

  /**
   * Inicializa el gestor
   */
  init() {
    this.registerDefaultShortcuts();
    this.setupEventListener();
  }

  /**
   * Registra atajos por defecto
   */
  registerDefaultShortcuts() {
    // Archivo
    this.register('ctrl+s', 'Guardar proyecto', () => {
      if (window.projectManager) {
        window.projectManager.saveCurrentProject();
      }
    });

    this.register('ctrl+shift+s', 'Guardar como...', () => {
      if (window.showProjectsPanel) {
        window.showProjectsPanel();
      }
    });

    this.register('ctrl+o', 'Abrir proyecto', () => {
      if (window.showProjectsPanel) {
        window.showProjectsPanel();
      }
    });

    this.register('ctrl+n', 'Nuevo proyecto', () => {
      if (window.newProject) {
        window.newProject();
      }
    });

    // Edición (gestionados por UndoRedoManager)
    this.register('ctrl+z', 'Deshacer', () => {
      if (window.undoRedoManager) {
        window.undoRedoManager.undo();
      }
    });

    this.register('ctrl+shift+z', 'Rehacer', () => {
      if (window.undoRedoManager) {
        window.undoRedoManager.redo();
      }
    });

    this.register('ctrl+y', 'Rehacer (alt)', () => {
      if (window.undoRedoManager) {
        window.undoRedoManager.redo();
      }
    });

    // Selección y edición
    this.register('delete', 'Eliminar elemento', () => {
      if (window.selectedElement && window.deleteElement) {
        window.deleteElement(window.selectedElement);
      }
    });

    this.register('backspace', 'Eliminar elemento (alt)', () => {
      const target = event.target;
      if (
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable &&
        window.selectedElement &&
        window.deleteElement
      ) {
        event.preventDefault();
        window.deleteElement(window.selectedElement);
      }
    });

    this.register('escape', 'Deseleccionar', () => {
      if (window.selectedElement) {
        window.selectedElement.classList.remove('selected');
        window.selectedElement = null;

        const propertiesPanel = document.getElementById('propertiesPanel');
        if (propertiesPanel) {
          propertiesPanel.innerHTML = `
                        <h2 class="panel-title">Propiedades</h2>
                        <div class="properties-empty">
                            ← Arrastra componentes al canvas o selecciona un elemento para editar sus propiedades
                        </div>
                    `;
        }
      }
    });

    this.register('ctrl+d', 'Duplicar elemento', () => {
      if (window.selectedElement) {
        const clone = window.selectedElement.cloneNode(true);
        clone.id = 'element-' + window.elementIdCounter++;

        // Re-aplicar eventos
        if (window.setupElementDragAndDrop) {
          window.setupElementDragAndDrop(clone);
        }

        window.selectedElement.parentNode.insertBefore(clone, window.selectedElement.nextSibling);

        if (window.showToast) {
          window.showToast('Elemento duplicado');
        }
      }
    });

    // Navegación
    this.register('ctrl+shift+p', 'Panel de comandos', () => {
      this.showCommandPalette();
    });

    this.register('ctrl+/', 'Ayuda rápida', () => {
      this.showQuickHelp();
    });

    // Vistas
    this.register('ctrl+1', 'Vista escritorio', () => {
      if (window.setCanvasSize) {
        window.setCanvasSize('desktop');
      }
    });

    this.register('ctrl+2', 'Vista tablet', () => {
      if (window.setCanvasSize) {
        window.setCanvasSize('tablet');
      }
    });

    this.register('ctrl+3', 'Vista móvil', () => {
      if (window.setCanvasSize) {
        window.setCanvasSize('mobile');
      }
    });

    // Exportar
    this.register('ctrl+e', 'Exportar HTML', () => {
      if (window.exportHTML) {
        window.exportHTML();
      }
    });

    this.register('ctrl+shift+e', 'Exportar todo', () => {
      if (window.exportZip) {
        window.exportZip();
      }
    });

    // Plantillas y componentes
    this.register('ctrl+t', 'Plantillas', () => {
      if (window.showGallery) {
        window.showGallery();
      }
    });

    this.register('ctrl+shift+c', 'Componentes', () => {
      if (window.showComponentsLibrary) {
        window.showComponentsLibrary();
      }
    });
  }

  /**
   * Registra un atajo de teclado
   */
  register(shortcut, description, callback) {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    this.shortcuts.set(normalizedShortcut, {
      description,
      callback,
      originalShortcut: shortcut,
    });
  }

  /**
   * Normaliza un atajo de teclado
   */
  normalizeShortcut(shortcut) {
    return shortcut
      .toLowerCase()
      .replace('command', 'ctrl')
      .replace('cmd', 'ctrl')
      .split('+')
      .sort()
      .join('+');
  }

  /**
   * Convierte evento a string de atajo
   */
  eventToShortcut(event) {
    const keys = [];

    if (event.ctrlKey || event.metaKey) keys.push('ctrl');
    if (event.shiftKey) keys.push('shift');
    if (event.altKey) keys.push('alt');

    const key = event.key.toLowerCase();
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      keys.push(key);
    }

    return keys.sort().join('+');
  }

  /**
   * Configura listener de eventos
   */
  setupEventListener() {
    document.addEventListener('keydown', event => {
      const shortcut = this.eventToShortcut(event);
      const shortcutData = this.shortcuts.get(shortcut);

      if (shortcutData) {
        // Evitar ejecución si estamos en input/textarea
        const target = event.target;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          // Permitir solo ciertos atajos en campos de texto
          if (!['ctrl+s', 'ctrl+z', 'ctrl+y', 'ctrl+shift+z'].includes(shortcut)) {
            return;
          }
        }

        event.preventDefault();
        shortcutData.callback(event);
      }
    });
  }

  /**
   * Muestra paleta de comandos
   */
  showCommandPalette() {
    const modal = document.createElement('div');
    modal.className = 'command-palette-modal';
    modal.innerHTML = `
            <div class="command-palette-content">
                <div class="command-palette-header">
                    <input type="text" id="commandSearch" placeholder="Buscar comando o atajo..." autofocus>
                    <button onclick="this.closest('.command-palette-modal').remove()">&times;</button>
                </div>
                <div class="command-palette-list" id="commandPaletteList">
                    ${this.renderCommandList()}
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Cerrar con ESC
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        modal.remove();
      }
    });

    // Búsqueda
    const searchInput = modal.querySelector('#commandSearch');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const list = modal.querySelector('#commandPaletteList');
      list.innerHTML = this.renderCommandList(query);
    });

    // Focus en input
    searchInput.focus();
  }

  /**
   * Renderiza lista de comandos
   */
  renderCommandList(filter = '') {
    const commands = Array.from(this.shortcuts.entries())
      .filter(([shortcut, data]) => {
        if (!filter) return true;
        return shortcut.includes(filter) || data.description.toLowerCase().includes(filter);
      })
      .map(
        ([shortcut, data]) => `
                <div class="command-item" onclick="event.stopPropagation(); this.closest('.command-palette-modal').querySelector('button').click(); ${data.callback.toString().match(/\{([\s\S]*)\}/)[1]}">
                    <span class="command-description">${data.description}</span>
                    <span class="command-shortcut">${data.originalShortcut.toUpperCase()}</span>
                </div>
            `
      );

    return commands.length > 0
      ? commands.join('')
      : '<div class="command-empty">No se encontraron comandos</div>';
  }

  /**
   * Muestra ayuda rápida
   */
  showQuickHelp() {
    const helpContent = Array.from(this.shortcuts.entries())
      .map(
        ([shortcut, data]) => `
                <tr>
                    <td><kbd>${data.originalShortcut.toUpperCase()}</kbd></td>
                    <td>${data.description}</td>
                </tr>
            `
      )
      .join('');

    const modal = document.createElement('div');
    modal.className = 'quick-help-modal';
    modal.innerHTML = `
            <div class="quick-help-content">
                <div class="quick-help-header">
                    <h3>Atajos de Teclado</h3>
                    <button onclick="this.closest('.quick-help-modal').remove()">&times;</button>
                </div>
                <div class="quick-help-body">
                    <table class="shortcuts-table">
                        <thead>
                            <tr>
                                <th>Atajo</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${helpContent}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Cerrar con ESC o click fuera
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        modal.remove();
      }
    });
  }

  /**
   * Obtiene todos los atajos
   */
  getAllShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([shortcut, data]) => ({
      shortcut: data.originalShortcut,
      description: data.description,
    }));
  }

  /**
   * Elimina un atajo
   */
  unregister(shortcut) {
    const normalized = this.normalizeShortcut(shortcut);
    return this.shortcuts.delete(normalized);
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardShortcutsManager;
}

export default KeyboardShortcutsManager;

window.KeyboardShortcutsManager = KeyboardShortcutsManager;
