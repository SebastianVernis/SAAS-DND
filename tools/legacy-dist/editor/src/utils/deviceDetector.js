/**
 * Device Detector
 * Detects device type, touch capabilities, and provides feature detection
 */

class DeviceDetector {
  constructor() {
    this.userAgent = navigator.userAgent || navigator.vendor || window.opera;
    this.isTouchDevice = this.detectTouch();
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.isDesktop = !this.isMobile && !this.isTablet;
    this.os = this.detectOS();
    this.browser = this.detectBrowser();
    this.screenSize = this.getScreenSize();
    this.orientation = this.getOrientation();
    
    // Listen for orientation changes
    this.setupOrientationListener();
    
    // Listen for resize events
    this.setupResizeListener();
    
    console.log('📱 Device Detection:', {
      isTouchDevice: this.isTouchDevice,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isDesktop: this.isDesktop,
      os: this.os,
      browser: this.browser,
      screenSize: this.screenSize,
      orientation: this.orientation
    });
  }
  
  /**
   * Detect touch capability
   */
  detectTouch() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }
  
  /**
   * Detect mobile device
   */
  detectMobile() {
    const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(this.userAgent) && window.innerWidth < 768;
  }
  
  /**
   * Detect tablet device
   */
  detectTablet() {
    const tabletRegex = /iPad|Android/i;
    const isTabletUA = tabletRegex.test(this.userAgent);
    const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
    return isTabletUA && isTabletSize;
  }
  
  /**
   * Detect operating system
   */
  detectOS() {
    if (/iPad|iPhone|iPod/.test(this.userAgent)) return 'iOS';
    if (/Android/.test(this.userAgent)) return 'Android';
    if (/Win/.test(this.userAgent)) return 'Windows';
    if (/Mac/.test(this.userAgent)) return 'MacOS';
    if (/Linux/.test(this.userAgent)) return 'Linux';
    return 'Unknown';
  }
  
  /**
   * Detect browser
   */
  detectBrowser() {
    if (/Chrome/.test(this.userAgent) && !/Edge/.test(this.userAgent)) return 'Chrome';
    if (/Safari/.test(this.userAgent) && !/Chrome/.test(this.userAgent)) return 'Safari';
    if (/Firefox/.test(this.userAgent)) return 'Firefox';
    if (/Edge/.test(this.userAgent)) return 'Edge';
    if (/MSIE|Trident/.test(this.userAgent)) return 'IE';
    return 'Unknown';
  }
  
  /**
   * Get screen size category
   */
  getScreenSize() {
    const width = window.innerWidth;
    if (width < 576) return 'xs'; // Extra small (mobile)
    if (width < 768) return 'sm'; // Small (mobile landscape)
    if (width < 992) return 'md'; // Medium (tablet)
    if (width < 1200) return 'lg'; // Large (desktop)
    return 'xl'; // Extra large (large desktop)
  }
  
  /**
   * Get device orientation
   */
  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
  
  /**
   * Setup orientation change listener
   */
  setupOrientationListener() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        this.screenSize = this.getScreenSize();
        this.dispatchOrientationChange();
      }, 100);
    });
  }
  
  /**
   * Setup resize listener
   */
  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const oldScreenSize = this.screenSize;
        this.screenSize = this.getScreenSize();
        this.orientation = this.getOrientation();
        
        if (oldScreenSize !== this.screenSize) {
          this.dispatchScreenSizeChange();
        }
      }, 250);
    });
  }
  
  /**
   * Dispatch orientation change event
   */
  dispatchOrientationChange() {
    window.dispatchEvent(new CustomEvent('device:orientationchange', {
      detail: {
        orientation: this.orientation,
        screenSize: this.screenSize
      }
    }));
  }
  
  /**
   * Dispatch screen size change event
   */
  dispatchScreenSizeChange() {
    window.dispatchEvent(new CustomEvent('device:screensizechange', {
      detail: {
        screenSize: this.screenSize,
        orientation: this.orientation
      }
    }));
  }
  
  /**
   * Check if device supports specific feature
   */
  supportsFeature(feature) {
    const features = {
      touch: this.isTouchDevice,
      multitouch: navigator.maxTouchPoints > 1,
      geolocation: 'geolocation' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      webGL: this.supportsWebGL(),
      localStorage: this.supportsLocalStorage(),
      sessionStorage: this.supportsSessionStorage(),
      indexedDB: 'indexedDB' in window,
      webWorker: typeof Worker !== 'undefined',
      vibration: 'vibrate' in navigator,
      battery: 'getBattery' in navigator,
      networkInfo: 'connection' in navigator,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      deviceMotion: 'DeviceMotionEvent' in window
    };
    
    return features[feature] || false;
  }
  
  /**
   * Check WebGL support
   */
  supportsWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check localStorage support
   */
  supportsLocalStorage() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check sessionStorage support
   */
  supportsSessionStorage() {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Get device pixel ratio
   */
  getPixelRatio() {
    return window.devicePixelRatio || 1;
  }
  
  /**
   * Get viewport dimensions
   */
  getViewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight
    };
  }
  
  /**
   * Check if device is in standalone mode (PWA)
   */
  isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }
  
  /**
   * Get connection info
   */
  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.DeviceDetector = DeviceDetector;
}

export default DeviceDetector;
