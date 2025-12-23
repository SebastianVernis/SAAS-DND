/**
 * Toolbar Dropdown Menu Manager
 * Handles dropdown menu behavior and interactions
 */

class ToolbarDropdownManager {
  constructor() {
    this.dropdowns = [];
    this.currentOpen = null;
    this.init();
  }

  /**
   * Initialize dropdown menus
   */
  init() {
    console.log('🎯 Initializing Toolbar Dropdown Manager');
    
    // Find all dropdown triggers
    const dropdowns = document.querySelectorAll('.toolbar-dropdown');
    
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.dropdown-trigger');
      const menu = dropdown.querySelector('.toolbar-dropdown-menu');
      
      if (!trigger || !menu) return;
      
      this.dropdowns.push({ dropdown, trigger, menu });
      
      // Add hover handlers
      dropdown.addEventListener('mouseenter', () => this.openDropdown(dropdown, menu));
      dropdown.addEventListener('mouseleave', () => this.closeDropdown(dropdown, menu));
      
      // Add click handler for mobile/touch devices
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(dropdown, menu);
      });
      
      // Close dropdown when clicking menu item
      const items = menu.querySelectorAll('.dropdown-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          this.closeAllDropdowns();
        });
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.toolbar-dropdown')) {
        this.closeAllDropdowns();
      }
    });
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });
    
    // Update disabled states for undo/redo
    this.setupUndoRedoSync();
  }

  /**
   * Open dropdown menu
   */
  openDropdown(dropdown, menu) {
    if (this.currentOpen && this.currentOpen !== dropdown) {
      this.closeAllDropdowns();
    }
    
    dropdown.classList.add('dropdown-open');
    this.currentOpen = dropdown;
  }

  /**
   * Close dropdown menu
   */
  closeDropdown(dropdown, menu) {
    // Small delay to allow clicking menu items
    setTimeout(() => {
      if (!dropdown.matches(':hover')) {
        dropdown.classList.remove('dropdown-open');
        if (this.currentOpen === dropdown) {
          this.currentOpen = null;
        }
      }
    }, 100);
  }

  /**
   * Toggle dropdown (for click/touch)
   */
  toggleDropdown(dropdown, menu) {
    if (dropdown.classList.contains('dropdown-open')) {
      dropdown.classList.remove('dropdown-open');
      this.currentOpen = null;
    } else {
      this.closeAllDropdowns();
      dropdown.classList.add('dropdown-open');
      this.currentOpen = dropdown;
    }
  }

  /**
   * Close all dropdowns
   */
  closeAllDropdowns() {
    this.dropdowns.forEach(({ dropdown }) => {
      dropdown.classList.remove('dropdown-open');
    });
    this.currentOpen = null;
  }

  /**
   * Sync undo/redo button states across toolbar and dropdown
   */
  setupUndoRedoSync() {
    // Watch for changes in toolbar undo/redo buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          const target = mutation.target;
          const id = target.id;
          
          // Find corresponding dropdown item
          const dropdownItem = document.querySelector(`.dropdown-item[id="${id}"]`);
          if (dropdownItem) {
            if (target.hasAttribute('disabled')) {
              dropdownItem.setAttribute('disabled', '');
            } else {
              dropdownItem.removeAttribute('disabled');
            }
          }
        }
      });
    });
    
    // Observe undo/redo buttons
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      observer.observe(undoBtn, { attributes: true });
    }
    if (redoBtn) {
      observer.observe(redoBtn, { attributes: true });
    }
  }

  /**
   * Update dropdown item state
   */
  updateItemState(itemId, state) {
    const item = document.querySelector(`.dropdown-item[id="${itemId}"]`);
    if (!item) return;
    
    if (state.disabled) {
      item.setAttribute('disabled', '');
    } else {
      item.removeAttribute('disabled');
    }
    
    if (state.active) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  }

  /**
   * Destroy dropdown manager
   */
  destroy() {
    this.closeAllDropdowns();
    this.dropdowns = [];
    this.currentOpen = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.toolbarDropdownManager = new ToolbarDropdownManager();
  });
} else {
  window.toolbarDropdownManager = new ToolbarDropdownManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToolbarDropdownManager;
}
