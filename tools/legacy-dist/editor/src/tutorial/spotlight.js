/**
 * Spotlight - Highlights elements during tutorial
 * Creates visual focus on specific UI elements
 */

export class Spotlight {
  constructor() {
    this.overlay = null;
    this.spotlight = null;
    this.isActive = false;
  }

  /**
   * Create spotlight overlay
   */
  createOverlay() {
    if (this.overlay) return;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'tutorial-spotlight-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;

    // Create spotlight cutout
    this.spotlight = document.createElement('div');
    this.spotlight.id = 'tutorial-spotlight';
    this.spotlight.style.cssText = `
      position: fixed;
      border: 3px solid #3b82f6;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.5);
      z-index: 9999;
      pointer-events: none;
      transition: all 0.3s ease;
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.spotlight);
  }

  /**
   * Highlight element
   * @param {string|HTMLElement} target - Target element or selector
   * @param {Object} options - Highlight options
   */
  highlight(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;

    if (!element) {
      console.warn('Spotlight target not found:', target);
      return;
    }

    this.createOverlay();

    const rect = element.getBoundingClientRect();
    const padding = options.padding || 8;

    // Position spotlight
    this.spotlight.style.top = `${rect.top - padding}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;

    // Show overlay and spotlight
    this.overlay.style.opacity = '1';
    this.spotlight.style.opacity = '1';

    this.isActive = true;

    // Allow clicks on highlighted element
    if (options.allowClicks) {
      this.spotlight.style.pointerEvents = 'auto';
      element.style.position = 'relative';
      element.style.zIndex = '10000';
    }
  }

  /**
   * Remove highlight
   */
  removeHighlight() {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
      }, 300);
    }

    if (this.spotlight) {
      this.spotlight.style.opacity = '0';
      setTimeout(() => {
        if (this.spotlight && this.spotlight.parentNode) {
          this.spotlight.parentNode.removeChild(this.spotlight);
        }
        this.spotlight = null;
      }, 300);
    }

    this.isActive = false;

    // Reset z-index of previously highlighted elements
    document.querySelectorAll('[style*="z-index: 10000"]').forEach(el => {
      el.style.zIndex = '';
    });
  }

  /**
   * Update spotlight position (for dynamic elements)
   * @param {string|HTMLElement} target - Target element or selector
   */
  update(target) {
    if (!this.isActive) return;

    const element = typeof target === 'string' ? document.querySelector(target) : target;

    if (!element || !this.spotlight) return;

    const rect = element.getBoundingClientRect();
    const padding = 8;

    this.spotlight.style.top = `${rect.top - padding}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;
  }

  /**
   * Pulse animation on spotlight
   */
  pulse() {
    if (!this.spotlight) return;

    this.spotlight.style.animation = 'tutorial-spotlight-pulse 1s ease-in-out';

    setTimeout(() => {
      if (this.spotlight) {
        this.spotlight.style.animation = '';
      }
    }, 1000);
  }

  /**
   * Check if spotlight is active
   * @returns {boolean} Active status
   */
  isSpotlightActive() {
    return this.isActive;
  }

  /**
   * Destroy spotlight
   */
  destroy() {
    this.removeHighlight();
  }
}

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tutorial-spotlight-pulse {
      0%, 100% {
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.5);
      }
      50% {
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.8);
      }
    }
  `;
  document.head.appendChild(style);
}

export default Spotlight;
