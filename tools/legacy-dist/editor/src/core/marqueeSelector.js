/**
 * MarqueeSelector - Visual marquee selection rectangle
 * Provides visual feedback during drag selection
 */

class MarqueeSelector {
  constructor() {
    this.active = false;
    this.startPoint = null;
    this.element = null;
    this.canvas = null;

    this.init();
  }

  init() {
    this.canvas = document.getElementById('canvas');
    console.log('🎯 MarqueeSelector initialized');
  }

  /**
   * Start marquee selection
   */
  start(x, y) {
    this.active = true;
    this.startPoint = { x, y };

    // Create marquee element
    this.element = document.createElement('div');
    this.element.className = 'marquee-selector';
    this.element.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border: 2px dashed var(--accent-primary);
            background: rgba(37, 99, 235, 0.1);
            pointer-events: none;
            z-index: 10000;
        `;

    document.body.appendChild(this.element);
  }

  /**
   * Update marquee position and size
   */
  update(x, y) {
    if (!this.active || !this.element || !this.startPoint) return;

    const left = Math.min(x, this.startPoint.x);
    const top = Math.min(y, this.startPoint.y);
    const width = Math.abs(x - this.startPoint.x);
    const height = Math.abs(y - this.startPoint.y);

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;

    return { left, top, width, height };
  }

  /**
   * End marquee selection
   */
  end() {
    this.active = false;

    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    this.startPoint = null;
  }

  /**
   * Check if element intersects with marquee
   */
  intersects(elementRect, marqueeRect) {
    return !(
      elementRect.right < marqueeRect.left ||
      elementRect.left > marqueeRect.left + marqueeRect.width ||
      elementRect.bottom < marqueeRect.top ||
      elementRect.top > marqueeRect.top + marqueeRect.height
    );
  }

  /**
   * Get elements within marquee
   */
  getIntersectingElements(marqueeRect) {
    if (!this.canvas) return [];

    const elements = this.canvas.querySelectorAll('.canvas-element');
    const intersecting = [];

    elements.forEach(element => {
      const rect = element.getBoundingClientRect();

      if (this.intersects(rect, marqueeRect)) {
        intersecting.push(element);
      }
    });

    return intersecting;
  }

  /**
   * Is active
   */
  isActive() {
    return this.active;
  }

  /**
   * Destroy
   */
  destroy() {
    this.end();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarqueeSelector;
}

window.MarqueeSelector = MarqueeSelector;
