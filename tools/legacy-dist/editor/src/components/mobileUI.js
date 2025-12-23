/**
 * Mobile UI Manager
 * Handles mobile-specific UI adaptations: collapsible panels, bottom sheets, FABs
 */

class MobileUIManager {
  constructor() {
    this.isMobile = window.innerWidth < 768;
    this.panelsCollapsed = false;
    this.bottomSheetOpen = false;
    this.fabMenuOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.isMobile) {
      console.log('📱 Mobile UI: Desktop mode, skipping mobile adaptations');
      return;
    }
    
    // Apply mobile adaptations
    this.adaptPanels();
    this.createBottomSheet();
    this.createFAB();
    this.adaptToolbar();
    this.setupTouchTargets();
    this.setupSafeAreas();
    
    // Listen for orientation changes
    window.addEventListener('device:orientationchange', this.handleOrientationChange.bind(this));
    
    console.log('✅ Mobile UI Manager initialized');
  }
  
  /**
   * Adapt panels for mobile
   */
  adaptPanels() {
    const componentsPanel = document.querySelector('.components-panel');
    const propertiesPanel = document.querySelector('.properties-panel');
    
    if (componentsPanel) {
      // Make components panel collapsible
      componentsPanel.classList.add('mobile-collapsible');
      
      // Add toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-panel-toggle';
      toggleBtn.innerHTML = '☰';
      toggleBtn.onclick = () => this.toggleComponentsPanel();
      componentsPanel.insertBefore(toggleBtn, componentsPanel.firstChild);
      
      // Collapse by default on mobile
      componentsPanel.classList.add('collapsed');
    }
    
    if (propertiesPanel) {
      // Convert properties panel to bottom sheet
      propertiesPanel.classList.add('mobile-bottom-sheet');
      propertiesPanel.classList.add('hidden');
    }
  }
  
  /**
   * Create bottom sheet for properties
   */
  createBottomSheet() {
    const propertiesPanel = document.querySelector('.properties-panel');
    if (!propertiesPanel) return;
    
    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'bottom-sheet-handle';
    dragHandle.innerHTML = '<div class="handle-bar"></div>';
    propertiesPanel.insertBefore(dragHandle, propertiesPanel.firstChild);
    
    // Add swipe to close
    let startY = 0;
    let currentY = 0;
    
    dragHandle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    dragHandle.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        propertiesPanel.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });
    
    dragHandle.addEventListener('touchend', (e) => {
      const deltaY = currentY - startY;
      
      if (deltaY > 100) {
        // Close bottom sheet
        this.closeBottomSheet();
      } else {
        // Snap back
        propertiesPanel.style.transform = '';
      }
    }, { passive: true });
  }
  
  /**
   * Create Floating Action Button (FAB)
   */
  createFAB() {
    const fab = document.createElement('div');
    fab.className = 'mobile-fab';
    fab.innerHTML = `
      <button class="fab-main" onclick="window.mobileUI.toggleFABMenu()">
        <span class="fab-icon">+</span>
      </button>
      <div class="fab-menu hidden">
        <button class="fab-action" onclick="showGallery()" title="Plantillas">
          <span>🎨</span>
        </button>
        <button class="fab-action" onclick="newProject()" title="Nuevo">
          <span>📄</span>
        </button>
        <button class="fab-action" onclick="saveProject()" title="Guardar">
          <span>💾</span>
        </button>
        <button class="fab-action" onclick="exportHTML()" title="Exportar">
          <span>📥</span>
        </button>
      </div>
    `;
    
    document.body.appendChild(fab);
  }
  
  /**
   * Adapt toolbar for mobile
   */
  adaptToolbar() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;
    
    // Make toolbar scrollable horizontally
    toolbar.classList.add('mobile-toolbar');
    
    // Add hamburger menu for overflow items
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-hamburger';
    hamburger.innerHTML = '☰';
    hamburger.onclick = () => this.toggleMobileMenu();
    
    toolbar.insertBefore(hamburger, toolbar.firstChild);
  }
  
  /**
   * Setup touch targets (minimum 44x44px)
   */
  setupTouchTargets() {
    // Ensure all interactive elements meet minimum touch target size
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, .component-item');
    
    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      if (rect.width < 44 || rect.height < 44) {
        el.style.minWidth = '44px';
        el.style.minHeight = '44px';
        el.classList.add('touch-target');
      }
    });
  }
  
  /**
   * Setup safe areas for notched devices
   */
  setupSafeAreas() {
    // Add safe area padding for iOS devices with notch
    const root = document.documentElement;
    root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left, 0px)');
    root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right, 0px)');
    
    // Apply to toolbar
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
      toolbar.style.paddingTop = 'var(--safe-area-top)';
    }
    
    // Apply to FAB
    const fab = document.querySelector('.mobile-fab');
    if (fab) {
      fab.style.bottom = 'calc(20px + var(--safe-area-bottom))';
      fab.style.right = 'calc(20px + var(--safe-area-right))';
    }
  }
  
  /**
   * Toggle components panel
   */
  toggleComponentsPanel() {
    const panel = document.querySelector('.components-panel');
    if (!panel) return;
    
    panel.classList.toggle('collapsed');
    this.panelsCollapsed = panel.classList.contains('collapsed');
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  /**
   * Open bottom sheet
   */
  openBottomSheet() {
    const panel = document.querySelector('.properties-panel');
    if (!panel) return;
    
    panel.classList.remove('hidden');
    panel.classList.add('open');
    this.bottomSheetOpen = true;
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'bottom-sheet-overlay';
    overlay.onclick = () => this.closeBottomSheet();
    document.body.appendChild(overlay);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  /**
   * Close bottom sheet
   */
  closeBottomSheet() {
    const panel = document.querySelector('.properties-panel');
    if (!panel) return;
    
    panel.classList.add('hidden');
    panel.classList.remove('open');
    panel.style.transform = '';
    this.bottomSheetOpen = false;
    
    // Remove overlay
    const overlay = document.querySelector('.bottom-sheet-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
  
  /**
   * Toggle FAB menu
   */
  toggleFABMenu() {
    const menu = document.querySelector('.fab-menu');
    const icon = document.querySelector('.fab-icon');
    
    if (!menu || !icon) return;
    
    menu.classList.toggle('hidden');
    this.fabMenuOpen = !this.fabMenuOpen;
    
    // Rotate icon
    icon.style.transform = this.fabMenuOpen ? 'rotate(45deg)' : '';
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;
    
    toolbar.classList.toggle('menu-open');
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  /**
   * Handle orientation change
   */
  handleOrientationChange(event) {
    const { orientation } = event.detail;
    
    console.log('📱 Orientation changed:', orientation);
    
    // Re-adapt UI for new orientation
    this.setupTouchTargets();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('mobileui:orientationchange', {
      detail: { orientation }
    }));
  }
  
  /**
   * Show properties for selected element
   */
  showProperties() {
    if (this.isMobile) {
      this.openBottomSheet();
    }
  }
  
  /**
   * Hide properties
   */
  hideProperties() {
    if (this.isMobile) {
      this.closeBottomSheet();
    }
  }
  
  /**
   * Refresh UI (call after DOM updates)
   */
  refresh() {
    this.setupTouchTargets();
  }
  
  /**
   * Destroy and cleanup
   */
  destroy() {
    // Remove FAB
    const fab = document.querySelector('.mobile-fab');
    if (fab) {
      fab.remove();
    }
    
    // Remove overlay
    const overlay = document.querySelector('.bottom-sheet-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Remove mobile classes
    document.querySelectorAll('.mobile-collapsible, .mobile-bottom-sheet, .mobile-toolbar').forEach(el => {
      el.classList.remove('mobile-collapsible', 'mobile-bottom-sheet', 'mobile-toolbar');
    });
  }
}

// Export as global
if (typeof window !== 'undefined') {
  window.MobileUIManager = MobileUIManager;
}

export default MobileUIManager;
