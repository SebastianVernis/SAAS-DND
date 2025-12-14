/**
 * LayersManager - Core system for managing element layers/hierarchy
 * Provides tree structure, selection, lock/hide/rename operations
 * Integrates with UndoRedo system
 */

class LayersManager {
  constructor() {
    this.layers = new Map(); // id -> layer object
    this.selectedLayers = new Set();
    this.rootElement = null;
    this.eventListeners = new Map();
    this.layerCounter = 0;

    // Initialize
    this.init();
  }

  init() {
    console.log('🎨 LayersManager initialized');

    // Listen for canvas changes
    this.observeCanvasChanges();
  }

  /**
   * Build layer tree from canvas elements
   */
  buildTree(rootElement = null) {
    if (!rootElement) {
      rootElement = document.getElementById('canvas');
    }

    if (!rootElement) {
      console.warn('Canvas element not found');
      return null;
    }

    this.rootElement = rootElement;
    this.layers.clear();

    // Build tree recursively
    const tree = this._buildLayerNode(rootElement, null, 0);

    // Dispatch event
    this.dispatchEvent('layers:tree-built', { tree });

    return tree;
  }

  /**
   * Build a single layer node recursively
   */
  _buildLayerNode(element, parent, depth) {
    // Generate or get layer ID
    let layerId = element.dataset.layerId;
    if (!layerId) {
      layerId = `layer-${++this.layerCounter}`;
      element.dataset.layerId = layerId;
    }

    // Get element type and name
    const tagName = element.tagName.toLowerCase();
    const className = element.className
      .replace('canvas-element', '')
      .replace('selected', '')
      .trim();
    const elementId = element.id;

    // Generate display name
    let displayName = tagName;
    if (elementId) {
      displayName = `#${elementId}`;
    } else if (className) {
      displayName = `.${className.split(' ')[0]}`;
    } else if (element.textContent && element.textContent.length < 30) {
      const text = element.textContent.trim();
      if (text) {
        displayName = `${tagName} "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`;
      }
    }

    // Create layer object
    const layer = {
      id: layerId,
      element: element,
      name: element.dataset.layerName || displayName,
      type: tagName,
      parent: parent,
      children: [],
      depth: depth,
      locked: element.dataset.layerLocked === 'true',
      hidden: element.dataset.layerHidden === 'true',
      expanded: element.dataset.layerExpanded !== 'false', // default true
    };

    // Store in map
    this.layers.set(layerId, layer);

    // Process children (only canvas-element children)
    const children = Array.from(element.children).filter(
      child =>
        child.classList.contains('canvas-element') ||
        child.id === 'canvas' ||
        child.tagName.toLowerCase() !== 'button' // exclude delete buttons
    );

    children.forEach(child => {
      const childLayer = this._buildLayerNode(child, layerId, depth + 1);
      if (childLayer) {
        layer.children.push(childLayer);
      }
    });

    return layer;
  }

  /**
   * Get layer by ID
   */
  getLayer(layerId) {
    return this.layers.get(layerId);
  }

  /**
   * Get all layers as array
   */
  getAllLayers() {
    return Array.from(this.layers.values());
  }

  /**
   * Select a single layer
   */
  selectLayer(layerId, addToSelection = false) {
    const layer = this.getLayer(layerId);
    if (!layer) {
      console.warn(`Layer ${layerId} not found`);
      return;
    }

    if (layer.locked) {
      console.warn(`Layer ${layerId} is locked`);
      return;
    }

    if (!addToSelection) {
      this.clearSelection();
    }

    this.selectedLayers.add(layerId);

    // Update element selection
    if (layer.element) {
      layer.element.classList.add('selected');
    }

    // Dispatch event
    this.dispatchEvent('layers:selection', {
      selected: Array.from(this.selectedLayers),
      layer: layer,
    });

    // Update properties panel
    if (window.selectedElement !== layer.element) {
      window.selectedElement = layer.element;
      if (typeof window.updatePropertiesPanel === 'function') {
        window.updatePropertiesPanel(layer.element);
      }
    }
  }

  /**
   * Select multiple layers
   */
  selectMultiple(layerIds) {
    this.clearSelection();

    layerIds.forEach(id => {
      const layer = this.getLayer(id);
      if (layer && !layer.locked) {
        this.selectedLayers.add(id);
        if (layer.element) {
          layer.element.classList.add('selected');
        }
      }
    });

    this.dispatchEvent('layers:selection', {
      selected: Array.from(this.selectedLayers),
    });
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedLayers.forEach(id => {
      const layer = this.getLayer(id);
      if (layer && layer.element) {
        layer.element.classList.remove('selected');
      }
    });

    this.selectedLayers.clear();
  }

  /**
   * Get selected layers
   */
  getSelectedLayers() {
    return Array.from(this.selectedLayers)
      .map(id => this.getLayer(id))
      .filter(Boolean);
  }

  /**
   * Lock a layer
   */
  lockLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    layer.locked = true;
    layer.element.dataset.layerLocked = 'true';

    // Add visual indicator
    if (layer.element) {
      layer.element.style.pointerEvents = 'none';
      layer.element.style.opacity = '0.6';
    }

    this.dispatchEvent('layers:locked', { layerId, locked: true });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-lock',
        layerId: layerId,
        locked: true,
      });
    }
  }

  /**
   * Unlock a layer
   */
  unlockLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    layer.locked = false;
    layer.element.dataset.layerLocked = 'false';

    // Remove visual indicator
    if (layer.element) {
      layer.element.style.pointerEvents = '';
      layer.element.style.opacity = '';
    }

    this.dispatchEvent('layers:locked', { layerId, locked: false });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-lock',
        layerId: layerId,
        locked: false,
      });
    }
  }

  /**
   * Hide a layer
   */
  hideLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    layer.hidden = true;
    layer.element.dataset.layerHidden = 'true';

    if (layer.element) {
      layer.element.style.display = 'none';
    }

    this.dispatchEvent('layers:visibility', { layerId, hidden: true });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-visibility',
        layerId: layerId,
        hidden: true,
      });
    }
  }

  /**
   * Show a layer
   */
  showLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    layer.hidden = false;
    layer.element.dataset.layerHidden = 'false';

    if (layer.element) {
      layer.element.style.display = '';
    }

    this.dispatchEvent('layers:visibility', { layerId, hidden: false });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-visibility',
        layerId: layerId,
        hidden: false,
      });
    }
  }

  /**
   * Rename a layer
   */
  renameLayer(layerId, newName) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    const oldName = layer.name;
    layer.name = newName;
    layer.element.dataset.layerName = newName;

    this.dispatchEvent('layers:renamed', { layerId, oldName, newName });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-rename',
        layerId: layerId,
        oldName: oldName,
        newName: newName,
      });
    }
  }

  /**
   * Move layer in hierarchy
   */
  moveLayer(sourceId, targetId, position = 'after') {
    const sourceLayer = this.getLayer(sourceId);
    const targetLayer = this.getLayer(targetId);

    if (!sourceLayer || !targetLayer) return;

    const sourceElement = sourceLayer.element;
    const targetElement = targetLayer.element;
    const parentElement = targetElement.parentElement;

    // Move in DOM
    if (position === 'before') {
      parentElement.insertBefore(sourceElement, targetElement);
    } else if (position === 'after') {
      if (targetElement.nextSibling) {
        parentElement.insertBefore(sourceElement, targetElement.nextSibling);
      } else {
        parentElement.appendChild(sourceElement);
      }
    } else if (position === 'child') {
      targetElement.appendChild(sourceElement);
    }

    // Rebuild tree
    this.buildTree();

    this.dispatchEvent('layers:moved', { sourceId, targetId, position });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-move',
        sourceId: sourceId,
        targetId: targetId,
        position: position,
      });
    }
  }

  /**
   * Delete a layer
   */
  deleteLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    if (layer.locked) {
      console.warn(`Cannot delete locked layer ${layerId}`);
      return;
    }

    // Store for undo
    const elementHTML = layer.element.outerHTML;
    const parentId = layer.parent;

    // Remove from DOM
    layer.element.remove();

    // Remove from map
    this.layers.delete(layerId);
    this.selectedLayers.delete(layerId);

    // Rebuild tree
    this.buildTree();

    this.dispatchEvent('layers:deleted', { layerId });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-delete',
        layerId: layerId,
        elementHTML: elementHTML,
        parentId: parentId,
      });
    }
  }

  /**
   * Duplicate a layer
   */
  duplicateLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    // Clone element
    const clone = layer.element.cloneNode(true);

    // Remove layer ID to generate new one
    delete clone.dataset.layerId;

    // Insert after original
    layer.element.parentElement.insertBefore(clone, layer.element.nextSibling);

    // Rebuild tree
    this.buildTree();

    // Get new layer
    const newLayerId = clone.dataset.layerId;

    this.dispatchEvent('layers:duplicated', { originalId: layerId, newId: newLayerId });

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'layer-duplicate',
        originalId: layerId,
        newId: newLayerId,
      });
    }

    return newLayerId;
  }

  /**
   * Toggle layer expansion
   */
  toggleExpanded(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    layer.expanded = !layer.expanded;
    layer.element.dataset.layerExpanded = layer.expanded;

    this.dispatchEvent('layers:expanded', { layerId, expanded: layer.expanded });
  }

  /**
   * Observe canvas changes
   */
  observeCanvasChanges() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Use MutationObserver to detect changes
    const observer = new MutationObserver(mutations => {
      let shouldRebuild = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRebuild = true;
        }
      });

      if (shouldRebuild) {
        // Debounce rebuild
        clearTimeout(this._rebuildTimeout);
        this._rebuildTimeout = setTimeout(() => {
          this.buildTree();
        }, 100);
      }
    });

    observer.observe(canvas, {
      childList: true,
      subtree: true,
    });

    this._observer = observer;
  }

  /**
   * Event system
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  dispatchEvent(event, detail = {}) {
    // Custom event listeners
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        callback(detail);
      });
    }

    // Global window event
    window.dispatchEvent(new CustomEvent(event, { detail }));
  }

  /**
   * Destroy
   */
  destroy() {
    if (this._observer) {
      this._observer.disconnect();
    }
    this.layers.clear();
    this.selectedLayers.clear();
    this.eventListeners.clear();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayersManager;
}

// Make available globally
window.LayersManager = LayersManager;
