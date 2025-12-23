/**
 * Touch Drag & Drop Manager
 * Handles drag and drop operations for touch devices
 * Provides visual feedback and smooth interactions
 */

class TouchDragDropManager {
  constructor() {
    this.isDragging = false;
    this.draggedElement = null;
    this.draggedClone = null;
    this.dropTarget = null;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scrollThreshold = 50;
    this.scrollSpeed = 10;
    this.autoScrollInterval = null;
    
    // Visual feedback settings
    this.dragOpacity = 0.7;
    this.dragScale = 1.05;
    this.dropHighlightClass = 'drop-target-highlight';
    
    this.init();
  }
  
  init() {
    // Enable touch drag for component items
    this.enableComponentDrag();
    
    // Enable canvas drop
    this.enableCanvasDrop();
    
    console.log('✅ Touch Drag & Drop Manager initialized');
  }
  
  /**
   * Enable drag for component items
   */
  enableComponentDrag() {
    const componentItems = document.querySelectorAll('.component-item');
    
    componentItems.forEach(item => {
      // Remove existing draggable attribute
      item.removeAttribute('draggable');
      
      // Add touch event listeners
      item.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      item.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      item.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      item.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    });
  }
  
  /**
   * Enable drop on canvas
   */
  enableCanvasDrop() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    // Canvas doesn't need touch listeners as we handle drop in touchend
    canvas.classList.add('touch-drop-zone');
  }
  
  /**
   * Handle touch start
   */
  handleTouchStart(event) {
    // Prevent default to avoid scrolling
    event.preventDefault();
    
    const touch = event.touches[0];
    const element = event.currentTarget;
    
    // Store start position
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    
    // Store dragged element
    this.draggedElement = element;
    
    // Calculate offset from touch point to element top-left
    const rect = element.getBoundingClientRect();
    this.offsetX = touch.clientX - rect.left;
    this.offsetY = touch.clientY - rect.top;
    
    // Create visual clone after a short delay (long press detection)
    this.longPressTimeout = setTimeout(() => {
      this.createDragClone(element, touch.clientX, touch.clientY);
      this.isDragging = true;
      
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Dispatch drag start event
      this.dispatchDragEvent('touchdragstart', element);
    }, 150);
  }
  
  /**
   * Handle touch move
   */
  handleTouchMove(event) {
    if (!this.isDragging) {
      // Check if moved enough to cancel long press
      const touch = event.touches[0];
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - this.startX, 2) +
        Math.pow(touch.clientY - this.startY, 2)
      );
      
      if (moveDistance > 10) {
        clearTimeout(this.longPressTimeout);
      }
      return;
    }
    
    event.preventDefault();
    
    const touch = event.touches[0];
    
    // Update clone position
    if (this.draggedClone) {
      this.draggedClone.style.left = `${touch.clientX - this.offsetX}px`;
      this.draggedClone.style.top = `${touch.clientY - this.offsetY}px`;
    }
    
    // Check for drop target
    this.updateDropTarget(touch.clientX, touch.clientY);
    
    // Auto-scroll if near edges
    this.handleAutoScroll(touch.clientY);
    
    // Dispatch drag move event
    this.dispatchDragEvent('touchdragmove', this.draggedElement, {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  }
  
  /**
   * Handle touch end
   */
  handleTouchEnd(event) {
    clearTimeout(this.longPressTimeout);
    
    if (!this.isDragging) return;
    
    event.preventDefault();
    
    const touch = event.changedTouches[0];
    
    // Stop auto-scroll
    this.stopAutoScroll();
    
    // Check if dropped on canvas
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    const isOverCanvas = (
      touch.clientX >= canvasRect.left &&
      touch.clientX <= canvasRect.right &&
      touch.clientY >= canvasRect.top &&
      touch.clientY <= canvasRect.bottom
    );
    
    if (isOverCanvas && this.draggedElement) {
      // Calculate position relative to canvas
      const x = touch.clientX - canvasRect.left;
      const y = touch.clientY - canvasRect.top;
      
      // Get component type
      const componentType = this.draggedElement.dataset.type;
      
      // Create component on canvas
      if (typeof window.createComponent === 'function') {
        window.createComponent(componentType, x, y);
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      // Dispatch drop event
      this.dispatchDragEvent('touchdrop', this.draggedElement, {
        clientX: touch.clientX,
        clientY: touch.clientY,
        canvasX: x,
        canvasY: y,
        componentType
      });
    }
    
    // Cleanup
    this.cleanup();
  }
  
  /**
   * Handle touch cancel
   */
  handleTouchCancel(event) {
    clearTimeout(this.longPressTimeout);
    this.stopAutoScroll();
    this.cleanup();
  }
  
  /**
   * Create visual clone for dragging
   */
  createDragClone(element, x, y) {
    const clone = element.cloneNode(true);
    clone.classList.add('drag-clone');
    
    // Style the clone
    clone.style.position = 'fixed';
    clone.style.left = `${x - this.offsetX}px`;
    clone.style.top = `${y - this.offsetY}px`;
    clone.style.width = `${element.offsetWidth}px`;
    clone.style.height = `${element.offsetHeight}px`;
    clone.style.opacity = this.dragOpacity;
    clone.style.transform = `scale(${this.dragScale})`;
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '10000';
    clone.style.transition = 'none';
    clone.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
    
    document.body.appendChild(clone);
    this.draggedClone = clone;
    
    // Add dragging class to original
    element.classList.add('dragging');
  }
  
  /**
   * Update drop target highlighting
   */
  updateDropTarget(x, y) {
    // Hide clone temporarily to get element underneath
    if (this.draggedClone) {
      this.draggedClone.style.display = 'none';
    }
    
    const elementBelow = document.elementFromPoint(x, y);
    
    // Show clone again
    if (this.draggedClone) {
      this.draggedClone.style.display = 'block';
    }
    
    // Check if over canvas
    const canvas = document.getElementById('canvas');
    const isOverCanvas = canvas && canvas.contains(elementBelow);
    
    // Update drop target
    if (isOverCanvas && this.dropTarget !== canvas) {
      // Remove highlight from previous target
      if (this.dropTarget) {
        this.dropTarget.classList.remove(this.dropHighlightClass);
      }
      
      // Add highlight to canvas
      canvas.classList.add(this.dropHighlightClass);
      this.dropTarget = canvas;
    } else if (!isOverCanvas && this.dropTarget) {
      // Remove highlight
      this.dropTarget.classList.remove(this.dropHighlightClass);
      this.dropTarget = null;
    }
  }
  
  /**
   * Handle auto-scroll when dragging near edges
   */
  handleAutoScroll(y) {
    const viewportHeight = window.innerHeight;
    
    // Stop existing auto-scroll
    this.stopAutoScroll();
    
    // Check if near top or bottom
    if (y < this.scrollThreshold) {
      // Scroll up
      this.autoScrollInterval = setInterval(() => {
        window.scrollBy(0, -this.scrollSpeed);
      }, 16);
    } else if (y > viewportHeight - this.scrollThreshold) {
      // Scroll down
      this.autoScrollInterval = setInterval(() => {
        window.scrollBy(0, this.scrollSpeed);
      }, 16);
    }
  }
  
  /**
   * Stop auto-scroll
   */
  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }
  
  /**
   * Cleanup after drag operation
   */
  cleanup() {
    // Remove clone
    if (this.draggedClone) {
      this.draggedClone.remove();
      this.draggedClone = null;
    }
    
    // Remove dragging class
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }
    
    // Remove drop target highlight
    if (this.dropTarget) {
      this.dropTarget.classList.remove(this.dropHighlightClass);
      this.dropTarget = null;
    }
    
    // Reset state
    this.isDragging = false;
    this.draggedElement = null;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  /**
   * Dispatch custom drag event
   */
  dispatchDragEvent(eventName, element, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        element,
        ...detail
      }
    }));
  }
  
  /**
   * Refresh component items (call after DOM updates)
   */
  refresh() {
    this.enableComponentDrag();
  }
  
  /**
   * Destroy and cleanup
   */
  destroy() {
    this.stopAutoScroll();
    this.cleanup();
    
    // Remove event listeners
    const componentItems = document.querySelectorAll('.component-item');
    componentItems.forEach(item => {
      item.removeEventListener('touchstart', this.handleTouchStart);
      item.removeEventListener('touchmove', this.handleTouchMove);
      item.removeEventListener('touchend', this.handleTouchEnd);
      item.removeEventListener('touchcancel', this.handleTouchCancel);
    });
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.TouchDragDropManager = TouchDragDropManager;
}

export default TouchDragDropManager;
