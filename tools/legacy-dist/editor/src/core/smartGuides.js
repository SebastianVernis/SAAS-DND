/**
 * SmartGuides - Visual alignment guides with snap-to-grid
 * Shows guides when elements align with each other or canvas edges
 */

class SmartGuides {
  constructor(alignmentEngine) {
    this.alignmentEngine = alignmentEngine;
    this.enabled = true;
    this.snapEnabled = true;
    this.gridEnabled = false;
    this.gridSize = 10; // pixels
    this.guides = [];
    this.guideContainer = null;

    this.init();
  }

  init() {
    this.createGuideContainer();
    this.attachEventListeners();
    console.log('📏 SmartGuides initialized');
  }

  /**
   * Create container for guides
   */
  createGuideContainer() {
    this.guideContainer = document.createElement('div');
    this.guideContainer.id = 'smartGuidesContainer';
    this.guideContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;

    const canvasWrapper = document.getElementById('canvasWrapper');
    if (canvasWrapper) {
      canvasWrapper.appendChild(this.guideContainer);
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Listen for element drag events
    document.addEventListener('elementDragMove', e => {
      if (this.enabled) {
        this.showGuidesForElement(e.detail.element, e.detail.position);
      }
    });

    document.addEventListener('elementDragEnd', () => {
      this.clearGuides();
    });
  }

  /**
   * Show guides for an element being dragged
   */
  showGuidesForElement(element, position) {
    if (!this.enabled) return;

    this.clearGuides();

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Get all other elements
    const allElements = Array.from(canvas.querySelectorAll('.canvas-element')).filter(
      el => el !== element && !el.classList.contains('element-group')
    );

    // Check for alignment with other elements
    allElements.forEach(other => {
      const otherRect = other.getBoundingClientRect();

      // Horizontal alignment
      if (this.alignmentEngine.shouldSnap(elementRect.left, otherRect.left)) {
        this.showVerticalGuide(otherRect.left - canvasRect.left);
      }
      if (this.alignmentEngine.shouldSnap(elementRect.right, otherRect.right)) {
        this.showVerticalGuide(otherRect.right - canvasRect.left);
      }
      if (
        this.alignmentEngine.shouldSnap(
          elementRect.left + elementRect.width / 2,
          otherRect.left + otherRect.width / 2
        )
      ) {
        this.showVerticalGuide(otherRect.left + otherRect.width / 2 - canvasRect.left);
      }

      // Vertical alignment
      if (this.alignmentEngine.shouldSnap(elementRect.top, otherRect.top)) {
        this.showHorizontalGuide(otherRect.top - canvasRect.top);
      }
      if (this.alignmentEngine.shouldSnap(elementRect.bottom, otherRect.bottom)) {
        this.showHorizontalGuide(otherRect.bottom - canvasRect.top);
      }
      if (
        this.alignmentEngine.shouldSnap(
          elementRect.top + elementRect.height / 2,
          otherRect.top + otherRect.height / 2
        )
      ) {
        this.showHorizontalGuide(otherRect.top + otherRect.height / 2 - canvasRect.top);
      }
    });

    // Check for alignment with canvas edges
    if (this.alignmentEngine.shouldSnap(elementRect.left, canvasRect.left)) {
      this.showVerticalGuide(0);
    }
    if (this.alignmentEngine.shouldSnap(elementRect.right, canvasRect.right)) {
      this.showVerticalGuide(canvasRect.width);
    }
    if (
      this.alignmentEngine.shouldSnap(
        elementRect.left + elementRect.width / 2,
        canvasRect.left + canvasRect.width / 2
      )
    ) {
      this.showVerticalGuide(canvasRect.width / 2);
    }

    if (this.alignmentEngine.shouldSnap(elementRect.top, canvasRect.top)) {
      this.showHorizontalGuide(0);
    }
    if (this.alignmentEngine.shouldSnap(elementRect.bottom, canvasRect.bottom)) {
      this.showHorizontalGuide(canvasRect.height);
    }
    if (
      this.alignmentEngine.shouldSnap(
        elementRect.top + elementRect.height / 2,
        canvasRect.top + canvasRect.height / 2
      )
    ) {
      this.showHorizontalGuide(canvasRect.height / 2);
    }
  }

  /**
   * Show vertical guide
   */
  showVerticalGuide(x) {
    const guide = document.createElement('div');
    guide.className = 'smart-guide smart-guide-vertical';
    guide.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: 0;
            width: 1px;
            height: 100%;
            background: var(--accent-primary);
            pointer-events: none;
            animation: guideAppear 0.2s ease;
        `;

    this.guideContainer.appendChild(guide);
    this.guides.push(guide);
  }

  /**
   * Show horizontal guide
   */
  showHorizontalGuide(y) {
    const guide = document.createElement('div');
    guide.className = 'smart-guide smart-guide-horizontal';
    guide.style.cssText = `
            position: absolute;
            left: 0;
            top: ${y}px;
            width: 100%;
            height: 1px;
            background: var(--accent-primary);
            pointer-events: none;
            animation: guideAppear 0.2s ease;
        `;

    this.guideContainer.appendChild(guide);
    this.guides.push(guide);
  }

  /**
   * Clear all guides
   */
  clearGuides() {
    this.guides.forEach(guide => guide.remove());
    this.guides = [];
  }

  /**
   * Snap position to grid
   */
  snapToGrid(x, y) {
    if (!this.gridEnabled) {
      return { x, y };
    }

    return {
      x: Math.round(x / this.gridSize) * this.gridSize,
      y: Math.round(y / this.gridSize) * this.gridSize,
    };
  }

  /**
   * Snap position to guides
   */
  snapToGuides(element, x, y) {
    if (!this.snapEnabled) {
      return { x, y };
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return { x, y };

    const canvasRect = canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Get all other elements
    const allElements = Array.from(canvas.querySelectorAll('.canvas-element')).filter(
      el => el !== element
    );

    const snapPoints = this.alignmentEngine.getSnapPoints(element, allElements);

    // Snap X
    let snappedX = x;
    for (const snapX of snapPoints.x) {
      const relativeSnapX = snapX - canvasRect.left;
      if (this.alignmentEngine.shouldSnap(x, relativeSnapX)) {
        snappedX = relativeSnapX;
        break;
      }
    }

    // Snap Y
    let snappedY = y;
    for (const snapY of snapPoints.y) {
      const relativeSnapY = snapY - canvasRect.top;
      if (this.alignmentEngine.shouldSnap(y, relativeSnapY)) {
        snappedY = relativeSnapY;
        break;
      }
    }

    return { x: snappedX, y: snappedY };
  }

  /**
   * Toggle guides
   */
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.clearGuides();
    }
    return this.enabled;
  }

  /**
   * Toggle snap
   */
  toggleSnap() {
    this.snapEnabled = !this.snapEnabled;
    return this.snapEnabled;
  }

  /**
   * Toggle grid
   */
  toggleGrid() {
    this.gridEnabled = !this.gridEnabled;
    this.updateGridVisibility();
    return this.gridEnabled;
  }

  /**
   * Set grid size
   */
  setGridSize(size) {
    this.gridSize = Math.max(5, Math.min(50, size));
    if (this.gridEnabled) {
      this.updateGridVisibility();
    }
  }

  /**
   * Update grid visibility
   */
  updateGridVisibility() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    if (this.gridEnabled) {
      canvas.style.backgroundImage = `
                linear-gradient(var(--border-primary) 1px, transparent 1px),
                linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)
            `;
      canvas.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px`;
    } else {
      canvas.style.backgroundImage = '';
      canvas.style.backgroundSize = '';
    }
  }

  /**
   * Enable
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable
   */
  disable() {
    this.enabled = false;
    this.clearGuides();
  }

  /**
   * Destroy
   */
  destroy() {
    this.clearGuides();
    if (this.guideContainer) {
      this.guideContainer.remove();
    }
  }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes guideAppear {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartGuides;
}

window.SmartGuides = SmartGuides;

export default SmartGuides;
