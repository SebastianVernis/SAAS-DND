/**
 * MultiSelectManager - Handles multi-selection of elements
 * Supports click, ctrl+click, shift+click, and marquee selection
 */

class MultiSelectManager {
  constructor(layersManager) {
    this.layersManager = layersManager;
    this.selectedElements = new Set();
    this.lastSelectedElement = null;
    this.selectionMode = 'single'; // 'single', 'multi', 'range'
    this.marqueeActive = false;
    this.marqueeStart = null;
    this.marqueeElement = null;

    this.init();
  }

  init() {
    this.attachEventListeners();
    console.log('🎯 MultiSelectManager initialized');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Click selection
    canvas.addEventListener(
      'click',
      e => {
        this.handleClick(e);
      },
      true
    );

    // Marquee selection
    canvas.addEventListener('mousedown', e => {
      // Only start marquee if clicking on canvas background
      if (e.target.id === 'canvas' && !e.target.classList.contains('canvas-element')) {
        this.startMarquee(e);
      }
    });

    document.addEventListener('mousemove', e => {
      if (this.marqueeActive) {
        this.updateMarquee(e);
      }
    });

    document.addEventListener('mouseup', e => {
      if (this.marqueeActive) {
        this.endMarquee(e);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      // Ctrl+A - Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        this.selectAll();
      }

      // Escape - Clear selection
      if (e.key === 'Escape') {
        this.clearSelection();
      }
    });
  }

  /**
   * Handle click selection
   */
  handleClick(e) {
    const element = e.target.closest('.canvas-element');

    if (!element) {
      // Clicked on canvas background
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        this.clearSelection();
      }
      return;
    }

    // Get layer ID
    const layerId = element.dataset.layerId;
    if (!layerId) return;

    const layer = this.layersManager.getLayer(layerId);
    if (!layer || layer.locked) return;

    // Determine selection mode
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      this.toggleSelection(layerId);
    } else if (e.shiftKey && this.lastSelectedElement) {
      // Range selection
      this.selectRange(this.lastSelectedElement, layerId);
    } else {
      // Single selection
      this.selectSingle(layerId);
    }

    this.lastSelectedElement = layerId;
  }

  /**
   * Select a single element
   */
  selectSingle(layerId) {
    this.clearSelection();
    this.selectedElements.add(layerId);
    this.layersManager.selectLayer(layerId, false);
    this.updateVisualSelection();
    this.dispatchSelectionEvent();
  }

  /**
   * Toggle element selection
   */
  toggleSelection(layerId) {
    if (this.selectedElements.has(layerId)) {
      this.selectedElements.delete(layerId);
      const layer = this.layersManager.getLayer(layerId);
      if (layer && layer.element) {
        layer.element.classList.remove('selected');
      }
    } else {
      this.selectedElements.add(layerId);
      this.layersManager.selectLayer(layerId, true);
    }

    this.updateVisualSelection();
    this.dispatchSelectionEvent();
  }

  /**
   * Select range of elements
   */
  selectRange(startId, endId) {
    const allLayers = this.layersManager.getAllLayers();
    const startIndex = allLayers.findIndex(l => l.id === startId);
    const endIndex = allLayers.findIndex(l => l.id === endId);

    if (startIndex === -1 || endIndex === -1) return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    this.clearSelection();

    for (let i = minIndex; i <= maxIndex; i++) {
      const layer = allLayers[i];
      if (layer && !layer.locked) {
        this.selectedElements.add(layer.id);
      }
    }

    this.layersManager.selectMultiple(Array.from(this.selectedElements));
    this.updateVisualSelection();
    this.dispatchSelectionEvent();
  }

  /**
   * Select all elements
   */
  selectAll() {
    this.clearSelection();

    const allLayers = this.layersManager.getAllLayers();
    allLayers.forEach(layer => {
      if (!layer.locked && layer.element && layer.element.classList.contains('canvas-element')) {
        this.selectedElements.add(layer.id);
      }
    });

    this.layersManager.selectMultiple(Array.from(this.selectedElements));
    this.updateVisualSelection();
    this.dispatchSelectionEvent();

    if (window.showToast) {
      window.showToast(`✅ ${this.selectedElements.size} elementos seleccionados`);
    }
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedElements.forEach(id => {
      const layer = this.layersManager.getLayer(id);
      if (layer && layer.element) {
        layer.element.classList.remove('selected', 'multi-selected');
      }
    });

    this.selectedElements.clear();
    this.layersManager.clearSelection();
    this.dispatchSelectionEvent();
  }

  /**
   * Get selected elements
   */
  getSelected() {
    return Array.from(this.selectedElements)
      .map(id => {
        const layer = this.layersManager.getLayer(id);
        return layer ? layer.element : null;
      })
      .filter(Boolean);
  }

  /**
   * Get selected layer IDs
   */
  getSelectedIds() {
    return Array.from(this.selectedElements);
  }

  /**
   * Update visual selection
   */
  updateVisualSelection() {
    // Remove all selection classes
    document.querySelectorAll('.canvas-element').forEach(el => {
      el.classList.remove('selected', 'multi-selected');
    });

    // Add selection classes
    this.selectedElements.forEach(id => {
      const layer = this.layersManager.getLayer(id);
      if (layer && layer.element) {
        if (this.selectedElements.size > 1) {
          layer.element.classList.add('multi-selected');
        } else {
          layer.element.classList.add('selected');
        }
      }
    });
  }

  /**
   * Start marquee selection
   */
  startMarquee(e) {
    this.marqueeActive = true;
    this.marqueeStart = {
      x: e.clientX,
      y: e.clientY,
    };

    // Create marquee element
    this.marqueeElement = document.createElement('div');
    this.marqueeElement.className = 'marquee-selector';
    this.marqueeElement.style.left = `${e.clientX}px`;
    this.marqueeElement.style.top = `${e.clientY}px`;
    document.body.appendChild(this.marqueeElement);

    // Clear selection if not holding ctrl
    if (!e.ctrlKey && !e.metaKey) {
      this.clearSelection();
    }
  }

  /**
   * Update marquee selection
   */
  updateMarquee(e) {
    if (!this.marqueeElement || !this.marqueeStart) return;

    const x = Math.min(e.clientX, this.marqueeStart.x);
    const y = Math.min(e.clientY, this.marqueeStart.y);
    const width = Math.abs(e.clientX - this.marqueeStart.x);
    const height = Math.abs(e.clientY - this.marqueeStart.y);

    this.marqueeElement.style.left = `${x}px`;
    this.marqueeElement.style.top = `${y}px`;
    this.marqueeElement.style.width = `${width}px`;
    this.marqueeElement.style.height = `${height}px`;

    // Check for intersecting elements
    this.checkMarqueeIntersection({ x, y, width, height });
  }

  /**
   * End marquee selection
   */
  endMarquee(e) {
    this.marqueeActive = false;

    if (this.marqueeElement) {
      this.marqueeElement.remove();
      this.marqueeElement = null;
    }

    this.marqueeStart = null;
    this.updateVisualSelection();
    this.dispatchSelectionEvent();
  }

  /**
   * Check marquee intersection with elements
   */
  checkMarqueeIntersection(marqueeRect) {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const elements = canvas.querySelectorAll('.canvas-element');

    elements.forEach(element => {
      const rect = element.getBoundingClientRect();

      // Check if element intersects with marquee
      const intersects = !(
        rect.right < marqueeRect.x ||
        rect.left > marqueeRect.x + marqueeRect.width ||
        rect.bottom < marqueeRect.y ||
        rect.top > marqueeRect.y + marqueeRect.height
      );

      const layerId = element.dataset.layerId;
      if (!layerId) return;

      const layer = this.layersManager.getLayer(layerId);
      if (!layer || layer.locked) return;

      if (intersects) {
        this.selectedElements.add(layerId);
        element.classList.add('multi-selected');
      } else if (!this.marqueeStart) {
        // Only remove if not holding ctrl
        this.selectedElements.delete(layerId);
        element.classList.remove('multi-selected');
      }
    });
  }

  /**
   * Dispatch selection event
   */
  dispatchSelectionEvent() {
    window.dispatchEvent(
      new CustomEvent('multiselect:changed', {
        detail: {
          selected: Array.from(this.selectedElements),
          count: this.selectedElements.size,
        },
      })
    );
  }

  /**
   * Destroy
   */
  destroy() {
    this.clearSelection();
    if (this.marqueeElement) {
      this.marqueeElement.remove();
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiSelectManager;
}

export default MultiSelectManager;

window.MultiSelectManager = MultiSelectManager;
