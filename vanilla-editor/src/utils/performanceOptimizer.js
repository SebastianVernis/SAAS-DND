/**
 * Performance Optimizer
 * Handles lazy loading, throttling, debouncing, and performance monitoring
 */

class PerformanceOptimizer {
  constructor() {
    this.observers = new Map();
    this.rafCallbacks = new Map();
    this.metrics = {
      fps: 60,
      frameTime: 0,
      lastFrameTime: performance.now()
    };
    
    this.init();
  }
  
  init() {
    // Start FPS monitoring
    this.startFPSMonitoring();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Monitor performance
    this.monitorPerformance();
    
    console.log('✅ Performance Optimizer initialized');
  }
  
  /**
   * Throttle function execution
   */
  throttle(func, delay = 16) {
    let lastCall = 0;
    let timeoutId = null;
    
    return function(...args) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;
      
      if (timeSinceLastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          func.apply(this, args);
        }, delay - timeSinceLastCall);
      }
    };
  }
  
  /**
   * Debounce function execution
   */
  debounce(func, delay = 250) {
    let timeoutId = null;
    
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
  
  /**
   * Request Animation Frame wrapper
   */
  requestAnimationFrame(callback, id = 'default') {
    // Cancel previous RAF if exists
    if (this.rafCallbacks.has(id)) {
      cancelAnimationFrame(this.rafCallbacks.get(id));
    }
    
    const rafId = requestAnimationFrame(() => {
      callback();
      this.rafCallbacks.delete(id);
    });
    
    this.rafCallbacks.set(id, rafId);
    return rafId;
  }
  
  /**
   * Cancel Animation Frame
   */
  cancelAnimationFrame(id) {
    if (this.rafCallbacks.has(id)) {
      cancelAnimationFrame(this.rafCallbacks.get(id));
      this.rafCallbacks.delete(id);
    }
  }
  
  /**
   * Setup Intersection Observer for lazy loading
   */
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }
    
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Load image
          if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
          }
          
          // Load background image
          if (element.dataset.bgSrc) {
            element.style.backgroundImage = `url(${element.dataset.bgSrc})`;
            element.removeAttribute('data-bg-src');
          }
          
          // Execute lazy callback
          if (element.dataset.lazyCallback) {
            const callback = window[element.dataset.lazyCallback];
            if (typeof callback === 'function') {
              callback(element);
            }
          }
          
          lazyObserver.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01
    });
    
    this.observers.set('lazy', lazyObserver);
  }
  
  /**
   * Observe element for lazy loading
   */
  observeLazy(element) {
    const observer = this.observers.get('lazy');
    if (observer) {
      observer.observe(element);
    }
  }
  
  /**
   * Start FPS monitoring
   */
  startFPSMonitoring() {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - this.metrics.lastFrameTime;
      this.metrics.frameTime = delta;
      this.metrics.fps = Math.round(1000 / delta);
      this.metrics.lastFrameTime = now;
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }
  
  /**
   * Get current FPS
   */
  getFPS() {
    return this.metrics.fps;
  }
  
  /**
   * Monitor performance metrics
   */
  monitorPerformance() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }
    
    // Monitor Long Tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('⚠️ Long Task detected:', {
            duration: entry.duration,
            startTime: entry.startTime
          });
          
          // Dispatch event
          window.dispatchEvent(new CustomEvent('performance:longtask', {
            detail: {
              duration: entry.duration,
              startTime: entry.startTime
            }
          }));
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long Task API not supported
    }
    
    // Monitor Layout Shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          
          console.warn('⚠️ Layout Shift detected:', {
            value: entry.value,
            sources: entry.sources
          });
        }
      });
      
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout Shift API not supported
    }
  }
  
  /**
   * Measure function execution time
   */
  measure(name, func) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  }
  
  /**
   * Async measure
   */
  async measureAsync(name, func) {
    const start = performance.now();
    const result = await func();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  }
  
  /**
   * Optimize images
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
      
      // Add decoding="async" if not present
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  }
  
  /**
   * Preload critical resources
   */
  preloadResource(url, type = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  }
  
  /**
   * Prefetch resource
   */
  prefetchResource(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
  
  /**
   * Get memory usage (Chrome only)
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usedPercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
      };
    }
    return null;
  }
  
  /**
   * Get navigation timing
   */
  getNavigationTiming() {
    const timing = performance.timing;
    
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domComplete - timing.domLoading,
      load: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart
    };
  }
  
  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {
        LCP: null, // Largest Contentful Paint
        FID: null, // First Input Delay
        CLS: null  // Cumulative Layout Shift
      };
      
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          vitals.FID = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });
      
      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.CLS = clsValue;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
      
      // Return after 5 seconds
      setTimeout(() => resolve(vitals), 5000);
    });
  }
  
  /**
   * Virtual scrolling helper
   */
  createVirtualScroller(container, items, itemHeight, renderItem) {
    const totalHeight = items.length * itemHeight;
    const viewportHeight = container.clientHeight;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2;
    
    let scrollTop = 0;
    
    const render = () => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      
      container.innerHTML = '';
      container.style.height = `${totalHeight}px`;
      container.style.position = 'relative';
      
      for (let i = startIndex; i < endIndex; i++) {
        const item = items[i];
        const element = renderItem(item, i);
        element.style.position = 'absolute';
        element.style.top = `${i * itemHeight}px`;
        element.style.height = `${itemHeight}px`;
        container.appendChild(element);
      }
    };
    
    const handleScroll = this.throttle(() => {
      scrollTop = container.scrollTop;
      render();
    }, 16);
    
    container.addEventListener('scroll', handleScroll);
    render();
    
    return {
      update: (newItems) => {
        items = newItems;
        render();
      },
      destroy: () => {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }
  
  /**
   * Cleanup
   */
  destroy() {
    // Cancel all RAF callbacks
    this.rafCallbacks.forEach((rafId) => {
      cancelAnimationFrame(rafId);
    });
    this.rafCallbacks.clear();
    
    // Disconnect all observers
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.PerformanceOptimizer = PerformanceOptimizer;
}

export default PerformanceOptimizer;
