/**
 * BatchOperations - Handles batch operations on multiple elements
 * Supports align, distribute, group, ungroup, and batch style application
 */

class BatchOperations {
  constructor(multiSelectManager, alignmentEngine, groupManager) {
    this.multiSelectManager = multiSelectManager;
    this.alignmentEngine = alignmentEngine;
    this.groupManager = groupManager;

    console.log('⚡ BatchOperations initialized');
  }

  /**
   * Align selected elements
   */
  align(alignment) {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length < 2) {
      if (window.showToast) {
        window.showToast('⚠️ Selecciona al menos 2 elementos para alinear');
      }
      return;
    }

    this.alignmentEngine.align(elements, alignment);

    if (window.showToast) {
      window.showToast(`✅ ${elements.length} elementos alineados: ${alignment}`);
    }
  }

  /**
   * Distribute selected elements
   */
  distribute(direction) {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length < 3) {
      if (window.showToast) {
        window.showToast('⚠️ Selecciona al menos 3 elementos para distribuir');
      }
      return;
    }

    this.alignmentEngine.distribute(elements, direction);

    if (window.showToast) {
      window.showToast(`✅ ${elements.length} elementos distribuidos: ${direction}`);
    }
  }

  /**
   * Group selected elements
   */
  group(name = null) {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length < 2) {
      if (window.showToast) {
        window.showToast('⚠️ Selecciona al menos 2 elementos para agrupar');
      }
      return;
    }

    const groupId = this.groupManager.createGroup(elements, name);

    if (window.showToast) {
      window.showToast(`✅ Grupo creado con ${elements.length} elementos`);
    }

    return groupId;
  }

  /**
   * Ungroup selected group
   */
  ungroup() {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length !== 1) {
      if (window.showToast) {
        window.showToast('⚠️ Selecciona un grupo para desagrupar');
      }
      return;
    }

    const element = elements[0];
    const groupId = element.dataset.groupId;

    if (!groupId) {
      if (window.showToast) {
        window.showToast('⚠️ El elemento seleccionado no es un grupo');
      }
      return;
    }

    this.groupManager.destroyGroup(groupId);

    if (window.showToast) {
      window.showToast('✅ Grupo desagrupado');
    }
  }

  /**
   * Apply style to all selected elements
   */
  applyBatchStyle(property, value) {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    elements.forEach(element => {
      element.style[property] = value;
    });

    if (window.showToast) {
      window.showToast(`✅ Estilo aplicado a ${elements.length} elementos`);
    }

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'batch-style',
        elements: elements.map(el => el.dataset.layerId),
        property: property,
        value: value,
      });
    }
  }

  /**
   * Delete all selected elements
   */
  deleteSelected() {
    const ids = this.multiSelectManager.getSelectedIds();

    if (ids.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    if (!confirm(`¿Eliminar ${ids.length} elementos seleccionados?`)) {
      return;
    }

    ids.forEach(id => {
      if (window.layersManager) {
        window.layersManager.deleteLayer(id);
      }
    });

    this.multiSelectManager.clearSelection();

    if (window.showToast) {
      window.showToast(`✅ ${ids.length} elementos eliminados`);
    }
  }

  /**
   * Duplicate all selected elements
   */
  duplicateSelected() {
    const ids = this.multiSelectManager.getSelectedIds();

    if (ids.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    const newIds = [];
    ids.forEach(id => {
      if (window.layersManager) {
        const newId = window.layersManager.duplicateLayer(id);
        if (newId) {
          newIds.push(newId);
        }
      }
    });

    // Select duplicated elements
    if (newIds.length > 0) {
      this.multiSelectManager.clearSelection();
      newIds.forEach(id => this.multiSelectManager.toggleSelection(id));
    }

    if (window.showToast) {
      window.showToast(`✅ ${ids.length} elementos duplicados`);
    }
  }

  /**
   * Lock all selected elements
   */
  lockSelected() {
    const ids = this.multiSelectManager.getSelectedIds();

    if (ids.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    ids.forEach(id => {
      if (window.layersManager) {
        window.layersManager.lockLayer(id);
      }
    });

    if (window.showToast) {
      window.showToast(`🔒 ${ids.length} elementos bloqueados`);
    }
  }

  /**
   * Unlock all selected elements
   */
  unlockSelected() {
    const ids = this.multiSelectManager.getSelectedIds();

    if (ids.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    ids.forEach(id => {
      if (window.layersManager) {
        window.layersManager.unlockLayer(id);
      }
    });

    if (window.showToast) {
      window.showToast(`🔓 ${ids.length} elementos desbloqueados`);
    }
  }

  /**
   * Hide all selected elements
   */
  hideSelected() {
    const ids = this.multiSelectManager.getSelectedIds();

    if (ids.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    ids.forEach(id => {
      if (window.layersManager) {
        window.layersManager.hideLayer(id);
      }
    });

    if (window.showToast) {
      window.showToast(`👁️‍🗨️ ${ids.length} elementos ocultados`);
    }
  }

  /**
   * Show all selected elements
   */
  showSelected() {
    const ids = this.multiSelectManager.getSelectedIds();

    if (ids.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    ids.forEach(id => {
      if (window.layersManager) {
        window.layersManager.showLayer(id);
      }
    });

    if (window.showToast) {
      window.showToast(`👁️ ${ids.length} elementos mostrados`);
    }
  }

  /**
   * Bring selected elements to front
   */
  bringToFront() {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    elements.forEach(element => {
      const parent = element.parentElement;
      if (parent) {
        parent.appendChild(element);
      }
    });

    if (window.showToast) {
      window.showToast(`⬆️ ${elements.length} elementos al frente`);
    }

    // Rebuild layers tree
    if (window.layersManager) {
      window.layersManager.buildTree();
    }
  }

  /**
   * Send selected elements to back
   */
  sendToBack() {
    const elements = this.multiSelectManager.getSelected();

    if (elements.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ No hay elementos seleccionados');
      }
      return;
    }

    elements.forEach(element => {
      const parent = element.parentElement;
      if (parent && parent.firstChild) {
        parent.insertBefore(element, parent.firstChild);
      }
    });

    if (window.showToast) {
      window.showToast(`⬇️ ${elements.length} elementos al fondo`);
    }

    // Rebuild layers tree
    if (window.layersManager) {
      window.layersManager.buildTree();
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BatchOperations;
}

window.BatchOperations = BatchOperations;
