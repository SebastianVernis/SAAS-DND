/**
 * Unified Event Manager
 * Provides a unified interface for mouse and touch events
 * Automatically detects device capabilities and uses appropriate events
 */

class UnifiedEventManager {
  constructor() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.isPointerDevice = 'PointerEvent' in window;
    
    // Event type mappings
    this.eventTypes = this.getEventTypes();
    
    // Active listeners registry
    this.listeners = new Map();
    
    console.log('🎯 Unified Event Manager initialized:', {
      isTouchDevice: this.isTouchDevice,
      isPointerDevice: this.isPointerDevice,
      eventTypes: this.eventTypes
    });
  }
  
  /**
   * Get appropriate event types based on device capabilities
   */
  getEventTypes() {
    if (this.isPointerDevice) {
      // Use Pointer Events (best for hybrid devices)
      return {
        start: 'pointerdown',
        move: 'pointermove',
        end: 'pointerup',
        cancel: 'pointercancel',
        enter: 'pointerenter',
        leave: 'pointerleave'
      };
    } else if (this.isTouchDevice) {
      // Use Touch Events
      return {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend',
        cancel: 'touchcancel',
        enter: 'touchstart',
        leave: 'touchend'
      };
    } else {
      // Use Mouse Events
      return {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        cancel: 'mouseleave',
        enter: 'mouseenter',
        leave: 'mouseleave'
      };
    }
  }
  
  /**
   * Normalize event to unified format
   */
  normalizeEvent(event) {
    const normalized = {
      originalEvent: event,
      type: event.type,
      target: event.target,
      currentTarget: event.currentTarget,
      timeStamp: event.timeStamp,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    };
    
    // Get position based on event type
    if (event.type.startsWith('touch')) {
      const touch = event.touches[0] || event.changedTouches[0];
      if (touch) {
        normalized.clientX = touch.clientX;
        normalized.clientY = touch.clientY;
        normalized.pageX = touch.pageX;
        normalized.pageY = touch.pageY;
        normalized.screenX = touch.screenX;
        normalized.screenY = touch.screenY;
        normalized.touches = Array.from(event.touches);
        normalized.changedTouches = Array.from(event.changedTouches);
      }
    } else if (event.type.startsWith('pointer')) {
      normalized.clientX = event.clientX;
      normalized.clientY = event.clientY;
      normalized.pageX = event.pageX;
      normalized.pageY = event.pageY;
      normalized.screenX = event.screenX;
      normalized.screenY = event.screenY;
      normalized.pointerId = event.pointerId;
      normalized.pointerType = event.pointerType;
      normalized.pressure = event.pressure;
    } else {
      // Mouse event
      normalized.clientX = event.clientX;
      normalized.clientY = event.clientY;
      normalized.pageX = event.pageX;
      normalized.pageY = event.pageY;
      normalized.screenX = event.screenX;
      normalized.screenY = event.screenY;
      normalized.button = event.button;
      normalized.buttons = event.buttons;
    }
    
    return normalized;
  }
  
  /**
   * Add unified event listener
   */
  on(element, eventType, handler, options = {}) {
    const nativeEventType = this.eventTypes[eventType] || eventType;
    
    // Wrap handler to normalize event
    const wrappedHandler = (event) => {
      const normalizedEvent = this.normalizeEvent(event);
      handler(normalizedEvent);
    };
    
    // Store listener for cleanup
    const listenerId = `${element}_${eventType}_${handler}`;
    this.listeners.set(listenerId, {
      element,
      nativeEventType,
      wrappedHandler,
      options
    });
    
    // Add event listener
    element.addEventListener(nativeEventType, wrappedHandler, options);
    
    return listenerId;
  }
  
  /**
   * Remove unified event listener
   */
  off(listenerId) {
    const listener = this.listeners.get(listenerId);
    if (!listener) return;
    
    const { element, nativeEventType, wrappedHandler, options } = listener;
    element.removeEventListener(nativeEventType, wrappedHandler, options);
    this.listeners.delete(listenerId);
  }
  
  /**
   * Remove all listeners for an element
   */
  offAll(element) {
    const toRemove = [];
    this.listeners.forEach((listener, id) => {
      if (listener.element === element) {
        toRemove.push(id);
      }
    });
    
    toRemove.forEach(id => this.off(id));
  }
  
  /**
   * Add start event listener (mousedown/touchstart/pointerdown)
   */
  onStart(element, handler, options = {}) {
    return this.on(element, 'start', handler, options);
  }
  
  /**
   * Add move event listener (mousemove/touchmove/pointermove)
   */
  onMove(element, handler, options = {}) {
    return this.on(element, 'move', handler, options);
  }
  
  /**
   * Add end event listener (mouseup/touchend/pointerup)
   */
  onEnd(element, handler, options = {}) {
    return this.on(element, 'end', handler, options);
  }
  
  /**
   * Add cancel event listener
   */
  onCancel(element, handler, options = {}) {
    return this.on(element, 'cancel', handler, options);
  }
  
  /**
   * Prevent default touch behaviors
   */
  preventDefaultTouch(element) {
    if (this.isTouchDevice) {
      element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
  }
  
  /**
   * Enable passive touch events for better performance
   */
  enablePassiveTouch(element) {
    if (this.isTouchDevice) {
      element.addEventListener('touchstart', () => {}, { passive: true });
      element.addEventListener('touchmove', () => {}, { passive: true });
    }
  }
  
  /**
   * Get distance between two points
   */
  getDistance(point1, point2) {
    const dx = point2.clientX - point1.clientX;
    const dy = point2.clientY - point1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Get angle between two points
   */
  getAngle(point1, point2) {
    const dx = point2.clientX - point1.clientX;
    const dy = point2.clientY - point1.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }
  
  /**
   * Get center point between multiple touches
   */
  getCenterPoint(touches) {
    if (!touches || touches.length === 0) return null;
    
    const sum = touches.reduce((acc, touch) => ({
      clientX: acc.clientX + touch.clientX,
      clientY: acc.clientY + touch.clientY
    }), { clientX: 0, clientY: 0 });
    
    return {
      clientX: sum.clientX / touches.length,
      clientY: sum.clientY / touches.length
    };
  }
  
  /**
   * Cleanup all listeners
   */
  destroy() {
    this.listeners.forEach((listener, id) => {
      this.off(id);
    });
    this.listeners.clear();
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.UnifiedEventManager = UnifiedEventManager;
}

export default UnifiedEventManager;
