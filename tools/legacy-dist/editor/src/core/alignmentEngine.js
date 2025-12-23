/**
 * AlignmentEngine - Handles element alignment calculations
 * Supports 8 alignment modes: left, center, right, top, middle, bottom, horizontal, vertical
 */

class AlignmentEngine {
  constructor() {
    this.snapThreshold = 5; // pixels
    console.log('📐 AlignmentEngine initialized');
  }

  /**
   * Align elements
   */
  align(elements, alignment) {
    if (!elements || elements.length < 2) {
      console.warn('Need at least 2 elements to align');
      return;
    }

    const bounds = this.getBounds(elements);

    switch (alignment) {
      case 'left':
        this.alignLeft(elements, bounds);
        break;
      case 'center':
      case 'horizontal-center':
        this.alignHorizontalCenter(elements, bounds);
        break;
      case 'right':
        this.alignRight(elements, bounds);
        break;
      case 'top':
        this.alignTop(elements, bounds);
        break;
      case 'middle':
      case 'vertical-center':
        this.alignVerticalCenter(elements, bounds);
        break;
      case 'bottom':
        this.alignBottom(elements, bounds);
        break;
      default:
        console.warn(`Unknown alignment: ${alignment}`);
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('multiselect:aligned', {
        detail: {
          elements: elements.map(el => el.dataset.layerId),
          alignment: alignment,
        },
      })
    );

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'align',
        elements: elements.map(el => el.dataset.layerId),
        alignment: alignment,
      });
    }
  }

  /**
   * Distribute elements
   */
  distribute(elements, direction) {
    if (!elements || elements.length < 3) {
      console.warn('Need at least 3 elements to distribute');
      return;
    }

    if (direction === 'horizontal') {
      this.distributeHorizontal(elements);
    } else if (direction === 'vertical') {
      this.distributeVertical(elements);
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('multiselect:distributed', {
        detail: {
          elements: elements.map(el => el.dataset.layerId),
          direction: direction,
        },
      })
    );

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'distribute',
        elements: elements.map(el => el.dataset.layerId),
        direction: direction,
      });
    }
  }

  /**
   * Get bounds of all elements
   */
  getBounds(elements) {
    const rects = elements.map(el => el.getBoundingClientRect());

    return {
      left: Math.min(...rects.map(r => r.left)),
      right: Math.max(...rects.map(r => r.right)),
      top: Math.min(...rects.map(r => r.top)),
      bottom: Math.max(...rects.map(r => r.bottom)),
      width: Math.max(...rects.map(r => r.right)) - Math.min(...rects.map(r => r.left)),
      height: Math.max(...rects.map(r => r.bottom)) - Math.min(...rects.map(r => r.top)),
    };
  }

  /**
   * Align left
   */
  alignLeft(elements, bounds) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offsetX = bounds.left - rect.left;

      const currentLeft = parseFloat(el.style.left) || rect.left - canvasRect.left;
      el.style.left = `${currentLeft + offsetX}px`;
    });
  }

  /**
   * Align horizontal center
   */
  alignHorizontalCenter(elements, bounds) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const offsetX = centerX - elementCenterX;

      const currentLeft = parseFloat(el.style.left) || rect.left - canvasRect.left;
      el.style.left = `${currentLeft + offsetX}px`;
    });
  }

  /**
   * Align right
   */
  alignRight(elements, bounds) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offsetX = bounds.right - rect.right;

      const currentLeft = parseFloat(el.style.left) || rect.left - canvasRect.left;
      el.style.left = `${currentLeft + offsetX}px`;
    });
  }

  /**
   * Align top
   */
  alignTop(elements, bounds) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offsetY = bounds.top - rect.top;

      const currentTop = parseFloat(el.style.top) || rect.top - canvasRect.top;
      el.style.top = `${currentTop + offsetY}px`;
    });
  }

  /**
   * Align vertical center
   */
  alignVerticalCenter(elements, bounds) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    const centerY = bounds.top + bounds.height / 2;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;
      const offsetY = centerY - elementCenterY;

      const currentTop = parseFloat(el.style.top) || rect.top - canvasRect.top;
      el.style.top = `${currentTop + offsetY}px`;
    });
  }

  /**
   * Align bottom
   */
  alignBottom(elements, bounds) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offsetY = bounds.bottom - rect.bottom;

      const currentTop = parseFloat(el.style.top) || rect.top - canvasRect.top;
      el.style.top = `${currentTop + offsetY}px`;
    });
  }

  /**
   * Distribute horizontal
   */
  distributeHorizontal(elements) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    // Sort by left position
    const sorted = [...elements].sort((a, b) => {
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });

    const first = sorted[0].getBoundingClientRect();
    const last = sorted[sorted.length - 1].getBoundingClientRect();

    const totalWidth = sorted.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
    const availableSpace = last.right - first.left - totalWidth;
    const gap = availableSpace / (sorted.length - 1);

    let currentX = first.left;

    sorted.forEach((el, index) => {
      if (index === 0) {
        currentX += el.getBoundingClientRect().width;
        return;
      }

      const rect = el.getBoundingClientRect();
      const offsetX = currentX + gap - rect.left;

      const currentLeft = parseFloat(el.style.left) || rect.left - canvasRect.left;
      el.style.left = `${currentLeft + offsetX}px`;

      currentX = currentX + gap + rect.width;
    });
  }

  /**
   * Distribute vertical
   */
  distributeVertical(elements) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    // Sort by top position
    const sorted = [...elements].sort((a, b) => {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });

    const first = sorted[0].getBoundingClientRect();
    const last = sorted[sorted.length - 1].getBoundingClientRect();

    const totalHeight = sorted.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
    const availableSpace = last.bottom - first.top - totalHeight;
    const gap = availableSpace / (sorted.length - 1);

    let currentY = first.top;

    sorted.forEach((el, index) => {
      if (index === 0) {
        currentY += el.getBoundingClientRect().height;
        return;
      }

      const rect = el.getBoundingClientRect();
      const offsetY = currentY + gap - rect.top;

      const currentTop = parseFloat(el.style.top) || rect.top - canvasRect.top;
      el.style.top = `${currentTop + offsetY}px`;

      currentY = currentY + gap + rect.height;
    });
  }

  /**
   * Check if position should snap
   */
  shouldSnap(value, target) {
    return Math.abs(value - target) <= this.snapThreshold;
  }

  /**
   * Snap value to target
   */
  snap(value, target) {
    if (this.shouldSnap(value, target)) {
      return target;
    }
    return value;
  }

  /**
   * Get snap points for an element
   */
  getSnapPoints(element, allElements) {
    const rect = element.getBoundingClientRect();
    const snapPoints = {
      x: [],
      y: [],
    };

    // Add canvas edges
    const canvas = document.getElementById('canvas');
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      snapPoints.x.push(canvasRect.left, canvasRect.right, canvasRect.left + canvasRect.width / 2);
      snapPoints.y.push(canvasRect.top, canvasRect.bottom, canvasRect.top + canvasRect.height / 2);
    }

    // Add other elements' edges
    allElements.forEach(other => {
      if (other === element) return;

      const otherRect = other.getBoundingClientRect();
      snapPoints.x.push(otherRect.left, otherRect.right, otherRect.left + otherRect.width / 2);
      snapPoints.y.push(otherRect.top, otherRect.bottom, otherRect.top + otherRect.height / 2);
    });

    return snapPoints;
  }
}

// Export
// Export para ES6 modules
export default AlignmentEngine;

// Compatibilidad CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlignmentEngine;
}

window.AlignmentEngine = AlignmentEngine;
