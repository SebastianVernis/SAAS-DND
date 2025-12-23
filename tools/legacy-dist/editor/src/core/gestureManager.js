/**
 * Gesture Manager
 * Handles multi-touch gestures: pinch, rotate, two-finger pan, long-press, swipe
 */

class GestureManager {
  constructor() {
    this.gestures = {
      tap: { enabled: true, threshold: 10, timeout: 300 },
      longPress: { enabled: true, duration: 500 },
      swipe: { enabled: true, threshold: 50, velocity: 0.3 },
      pinch: { enabled: true, threshold: 10 },
      rotate: { enabled: true, threshold: 5 },
      pan: { enabled: true, threshold: 10 }
    };
    
    this.activeGesture = null;
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.initialDistance = 0;
    this.initialAngle = 0;
    this.initialScale = 1;
    this.initialRotation = 0;
    this.longPressTimer = null;
    
    this.init();
  }
  
  init() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    // Add touch event listeners
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    
    console.log('✅ Gesture Manager initialized');
  }
  
  /**
   * Handle touch start
   */
  handleTouchStart(event) {
    const touches = event.touches;
    this.touchStartTime = Date.now();
    
    if (touches.length === 1) {
      // Single touch - potential tap or long press
      const touch = touches[0];
      this.touchStartPos = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      // Start long press timer
      if (this.gestures.longPress.enabled) {
        this.longPressTimer = setTimeout(() => {
          this.handleLongPress(touch);
        }, this.gestures.longPress.duration);
      }
      
    } else if (touches.length === 2) {
      // Two touches - potential pinch or rotate
      event.preventDefault();
      
      // Cancel long press
      this.cancelLongPress();
      
      // Calculate initial distance and angle
      this.initialDistance = this.getDistance(touches[0], touches[1]);
      this.initialAngle = this.getAngle(touches[0], touches[1]);
      
      // Store initial transform values
      const selectedElement = document.querySelector('.canvas-element.selected');
      if (selectedElement) {
        const transform = this.getTransform(selectedElement);
        this.initialScale = transform.scale;
        this.initialRotation = transform.rotation;
      }
      
      this.activeGesture = 'multi-touch';
    }
  }
  
  /**
   * Handle touch move
   */
  handleTouchMove(event) {
    const touches = event.touches;
    
    // Cancel long press on move
    this.cancelLongPress();
    
    if (touches.length === 1 && this.gestures.pan.enabled) {
      // Single touch pan
      const touch = touches[0];
      const deltaX = touch.clientX - this.touchStartPos.x;
      const deltaY = touch.clientY - this.touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > this.gestures.pan.threshold) {
        this.activeGesture = 'pan';
        this.handlePan(touch, deltaX, deltaY);
      }
      
    } else if (touches.length === 2) {
      // Multi-touch gestures
      event.preventDefault();
      
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const currentAngle = this.getAngle(touches[0], touches[1]);
      
      // Pinch gesture
      if (this.gestures.pinch.enabled) {
        const scale = currentDistance / this.initialDistance;
        const scaleChange = Math.abs(scale - 1);
        
        if (scaleChange > 0.1) {
          this.activeGesture = 'pinch';
          this.handlePinch(scale);
        }
      }
      
      // Rotate gesture
      if (this.gestures.rotate.enabled) {
        const rotation = currentAngle - this.initialAngle;
        
        if (Math.abs(rotation) > this.gestures.rotate.threshold) {
          this.activeGesture = 'rotate';
          this.handleRotate(rotation);
        }
      }
    }
  }
  
  /**
   * Handle touch end
   */
  handleTouchEnd(event) {
    const touches = event.changedTouches;
    const touch = touches[0];
    
    // Cancel long press
    this.cancelLongPress();
    
    // Check for tap
    if (this.activeGesture === null && this.gestures.tap.enabled) {
      const deltaX = touch.clientX - this.touchStartPos.x;
      const deltaY = touch.clientY - this.touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - this.touchStartTime;
      
      if (distance < this.gestures.tap.threshold && duration < this.gestures.tap.timeout) {
        this.handleTap(touch);
      }
    }
    
    // Check for swipe
    if (this.activeGesture === 'pan' && this.gestures.swipe.enabled) {
      const deltaX = touch.clientX - this.touchStartPos.x;
      const deltaY = touch.clientY - this.touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - this.touchStartTime;
      const velocity = distance / duration;
      
      if (distance > this.gestures.swipe.threshold && velocity > this.gestures.swipe.velocity) {
        this.handleSwipe(deltaX, deltaY, velocity);
      }
    }
    
    // Reset gesture state
    if (event.touches.length === 0) {
      this.activeGesture = null;
    }
  }
  
  /**
   * Handle touch cancel
   */
  handleTouchCancel(event) {
    this.cancelLongPress();
    this.activeGesture = null;
  }
  
  /**
   * Handle tap gesture
   */
  handleTap(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Dispatch tap event
    this.dispatchGestureEvent('gesture:tap', {
      x: touch.clientX,
      y: touch.clientY,
      target: element
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  /**
   * Handle long press gesture
   */
  handleLongPress(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Dispatch long press event
    this.dispatchGestureEvent('gesture:longpress', {
      x: touch.clientX,
      y: touch.clientY,
      target: element
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
    
    this.activeGesture = 'longpress';
  }
  
  /**
   * Handle pan gesture
   */
  handlePan(touch, deltaX, deltaY) {
    // Dispatch pan event
    this.dispatchGestureEvent('gesture:pan', {
      x: touch.clientX,
      y: touch.clientY,
      deltaX,
      deltaY
    });
  }
  
  /**
   * Handle swipe gesture
   */
  handleSwipe(deltaX, deltaY, velocity) {
    // Determine swipe direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    let direction;
    
    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    // Dispatch swipe event
    this.dispatchGestureEvent('gesture:swipe', {
      direction,
      deltaX,
      deltaY,
      velocity
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }
  
  /**
   * Handle pinch gesture
   */
  handlePinch(scale) {
    const selectedElement = document.querySelector('.canvas-element.selected');
    if (!selectedElement) return;
    
    // Apply scale
    const newScale = this.initialScale * scale;
    this.applyTransform(selectedElement, { scale: newScale });
    
    // Dispatch pinch event
    this.dispatchGestureEvent('gesture:pinch', {
      scale: newScale,
      delta: scale - 1
    });
  }
  
  /**
   * Handle rotate gesture
   */
  handleRotate(rotation) {
    const selectedElement = document.querySelector('.canvas-element.selected');
    if (!selectedElement) return;
    
    // Apply rotation
    const newRotation = this.initialRotation + rotation;
    this.applyTransform(selectedElement, { rotation: newRotation });
    
    // Dispatch rotate event
    this.dispatchGestureEvent('gesture:rotate', {
      rotation: newRotation,
      delta: rotation
    });
  }
  
  /**
   * Get distance between two touches
   */
  getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Get angle between two touches
   */
  getAngle(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }
  
  /**
   * Get current transform values
   */
  getTransform(element) {
    const transform = window.getComputedStyle(element).transform;
    
    if (transform === 'none') {
      return { scale: 1, rotation: 0 };
    }
    
    // Parse matrix
    const values = transform.match(/matrix\(([^)]+)\)/);
    if (!values) {
      return { scale: 1, rotation: 0 };
    }
    
    const parts = values[1].split(',').map(parseFloat);
    const a = parts[0];
    const b = parts[1];
    
    const scale = Math.sqrt(a * a + b * b);
    const rotation = Math.atan2(b, a) * (180 / Math.PI);
    
    return { scale, rotation };
  }
  
  /**
   * Apply transform to element
   */
  applyTransform(element, { scale, rotation }) {
    const currentTransform = this.getTransform(element);
    
    const finalScale = scale !== undefined ? scale : currentTransform.scale;
    const finalRotation = rotation !== undefined ? rotation : currentTransform.rotation;
    
    element.style.transform = `scale(${finalScale}) rotate(${finalRotation}deg)`;
  }
  
  /**
   * Cancel long press timer
   */
  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
  
  /**
   * Dispatch gesture event
   */
  dispatchGestureEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  
  /**
   * Enable/disable specific gesture
   */
  setGestureEnabled(gestureName, enabled) {
    if (this.gestures[gestureName]) {
      this.gestures[gestureName].enabled = enabled;
    }
  }
  
  /**
   * Configure gesture settings
   */
  configureGesture(gestureName, settings) {
    if (this.gestures[gestureName]) {
      Object.assign(this.gestures[gestureName], settings);
    }
  }
  
  /**
   * Destroy and cleanup
   */
  destroy() {
    this.cancelLongPress();
    
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.removeEventListener('touchstart', this.handleTouchStart);
      canvas.removeEventListener('touchmove', this.handleTouchMove);
      canvas.removeEventListener('touchend', this.handleTouchEnd);
      canvas.removeEventListener('touchcancel', this.handleTouchCancel);
    }
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.GestureManager = GestureManager;
}

export default GestureManager;
