/**
 * LayerPanel - Visual UI component for layer management
 * Provides tree view, drag-drop reordering, and layer controls
 * @module ui/LayerPanel
 * @version 1.0.0
 */

class LayerPanel {
  constructor(options = {}) {
    this.container = null;
    this.layersManager = null;
    this.options = {
      containerId: 'layer-panel',
      position: 'left', // 'left' or 'right'
      width: 280,
      collapsible: true,
      showSearch: true,
      showToolbar: true,
      ...options,
    };

    this.state = {
      collapsed: false,
      searchQuery: '',
      draggedLayer: null,
      dropTarget: null,
      contextMenuLayer: null,
    };

    this.init();
  }

  /**
   * Initialize the layer panel
   */
  init() {
    // Get or create LayersManager
    if (window.layersManager) {
      this.layersManager = window.layersManager;
    } else if (window.LayersManager) {
      this.layersManager = new window.LayersManager();
      window.layersManager = this.layersManager;
    } else {
      console.error('LayersManager not found');
      return;
    }

    // Create panel container
    this.createPanel();

    // Bind events
    this.bindEvents();

    // Initial render
    this.render();

    console.log('🎨 LayerPanel initialized');
  }

  /**
   * Create the panel DOM structure
   */
  createPanel() {
    // Check if panel already exists
    let existingPanel = document.getElementById(this.options.containerId);
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create main container
    this.container = document.createElement('div');
    this.container.id = this.options.containerId;
    this.container.className = 'layer-panel';
    this.container.innerHTML = `
      <div class="layer-panel-header">
        <div class="layer-panel-title">
          <span class="layer-panel-icon">📑</span>
          <span>Layers</span>
        </div>
        <div class="layer-panel-actions">
          <button class="layer-btn layer-btn-collapse" title="Collapse Panel">
            <span>◀</span>
          </button>
        </div>
      </div>
      
      ${this.options.showSearch ? `
      <div class="layer-panel-search">
        <input type="text" placeholder="Search layers..." class="layer-search-input">
        <button class="layer-btn layer-btn-clear" title="Clear search">✕</button>
      </div>
      ` : ''}
      
      ${this.options.showToolbar ? `
      <div class="layer-panel-toolbar">
        <button class="layer-btn" data-action="expand-all" title="Expand All">
          <span>▼</span>
        </button>
        <button class="layer-btn" data-action="collapse-all" title="Collapse All">
          <span>▶</span>
        </button>
        <div class="layer-toolbar-divider"></div>
        <button class="layer-btn" data-action="lock-all" title="Lock All">
          <span>🔒</span>
        </button>
        <button class="layer-btn" data-action="unlock-all" title="Unlock All">
          <span>🔓</span>
        </button>
        <div class="layer-toolbar-divider"></div>
        <button class="layer-btn" data-action="show-all" title="Show All">
          <span>👁</span>
        </button>
        <button class="layer-btn" data-action="hide-all" title="Hide All">
          <span>👁‍🗨</span>
        </button>
      </div>
      ` : ''}
      
      <div class="layer-panel-tree">
        <div class="layer-tree-content"></div>
      </div>
      
      <div class="layer-panel-footer">
        <span class="layer-count">0 layers</span>
        <span class="layer-selected">None selected</span>
      </div>
    `;

    // Add styles
    this.injectStyles();

    // Insert into DOM
    const targetContainer = document.querySelector('.left-panel') || document.body;
    targetContainer.appendChild(this.container);
  }

  /**
   * Inject CSS styles for the panel
   */
  injectStyles() {
    const styleId = 'layer-panel-styles';
    if (document.getElementById(styleId)) return;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
      .layer-panel {
        position: relative;
        width: ${this.options.width}px;
        background: var(--bg-secondary, #1e1e2e);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        color: var(--text-primary, #cdd6f4);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        margin-top: 10px;
      }

      .layer-panel.collapsed {
        width: 40px;
      }

      .layer-panel.collapsed .layer-panel-search,
      .layer-panel.collapsed .layer-panel-toolbar,
      .layer-panel.collapsed .layer-panel-tree,
      .layer-panel.collapsed .layer-panel-footer,
      .layer-panel.collapsed .layer-panel-title span:last-child {
        display: none;
      }

      .layer-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--bg-tertiary, #313244);
        border-bottom: 1px solid var(--border-color, #45475a);
      }

      .layer-panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
      }

      .layer-panel-icon {
        font-size: 16px;
      }

      .layer-panel-actions {
        display: flex;
        gap: 4px;
      }

      .layer-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary, #a6adc8);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .layer-btn:hover {
        background: var(--bg-hover, #45475a);
        color: var(--text-primary, #cdd6f4);
      }

      .layer-btn:active {
        transform: scale(0.95);
      }

      .layer-panel-search {
        display: flex;
        padding: 8px 12px;
        gap: 8px;
        border-bottom: 1px solid var(--border-color, #45475a);
      }

      .layer-search-input {
        flex: 1;
        background: var(--bg-input, #1e1e2e);
        border: 1px solid var(--border-color, #45475a);
        border-radius: 4px;
        padding: 6px 10px;
        color: var(--text-primary, #cdd6f4);
        font-size: 12px;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .layer-search-input:focus {
        border-color: var(--accent-color, #89b4fa);
      }

      .layer-search-input::placeholder {
        color: var(--text-muted, #6c7086);
      }

      .layer-btn-clear {
        padding: 4px 6px;
        font-size: 10px;
      }

      .layer-panel-toolbar {
        display: flex;
        padding: 8px 12px;
        gap: 4px;
        border-bottom: 1px solid var(--border-color, #45475a);
        flex-wrap: wrap;
      }

      .layer-toolbar-divider {
        width: 1px;
        background: var(--border-color, #45475a);
        margin: 0 4px;
      }

      .layer-panel-tree {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 200px;
        max-height: 400px;
      }

      .layer-tree-content {
        padding: 8px 0;
      }

      .layer-item {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        cursor: pointer;
        transition: background 0.15s ease;
        user-select: none;
        border-left: 3px solid transparent;
      }

      .layer-item:hover {
        background: var(--bg-hover, #313244);
      }

      .layer-item.selected {
        background: var(--bg-selected, #45475a);
        border-left-color: var(--accent-color, #89b4fa);
      }

      .layer-item.drag-over {
        background: var(--bg-drag, #585b70);
        border-left-color: var(--accent-color, #89b4fa);
      }

      .layer-item.dragging {
        opacity: 0.5;
      }

      .layer-item.locked {
        opacity: 0.6;
      }

      .layer-item.hidden {
        opacity: 0.4;
      }

      .layer-expand {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: var(--text-muted, #6c7086);
        cursor: pointer;
        margin-right: 4px;
        transition: transform 0.2s ease;
      }

      .layer-expand.expanded {
        transform: rotate(90deg);
      }

      .layer-expand.no-children {
        visibility: hidden;
      }

      .layer-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        margin-right: 8px;
        color: var(--text-secondary, #a6adc8);
      }

      .layer-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
      }

      .layer-name-input {
        flex: 1;
        background: var(--bg-input, #1e1e2e);
        border: 1px solid var(--accent-color, #89b4fa);
        border-radius: 2px;
        padding: 2px 4px;
        color: var(--text-primary, #cdd6f4);
        font-size: 12px;
        outline: none;
      }

      .layer-controls {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .layer-item:hover .layer-controls {
        opacity: 1;
      }

      .layer-control-btn {
        background: transparent;
        border: none;
        color: var(--text-muted, #6c7086);
        cursor: pointer;
        padding: 2px 4px;
        font-size: 11px;
        border-radius: 2px;
        transition: all 0.15s ease;
      }

      .layer-control-btn:hover {
        background: var(--bg-hover, #45475a);
        color: var(--text-primary, #cdd6f4);
      }

      .layer-control-btn.active {
        color: var(--accent-color, #89b4fa);
      }

      .layer-children {
        margin-left: 16px;
        border-left: 1px dashed var(--border-color, #45475a);
      }

      .layer-children.collapsed {
        display: none;
      }

      .layer-panel-footer {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        font-size: 11px;
        color: var(--text-muted, #6c7086);
        background: var(--bg-tertiary, #313244);
        border-top: 1px solid var(--border-color, #45475a);
      }

      .layer-empty {
        padding: 20px;
        text-align: center;
        color: var(--text-muted, #6c7086);
        font-style: italic;
      }

      /* Context Menu */
      .layer-context-menu {
        position: fixed;
        background: var(--bg-secondary, #1e1e2e);
        border: 1px solid var(--border-color, #45475a);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        padding: 4px 0;
        min-width: 160px;
        z-index: 10000;
      }

      .layer-context-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
        color: var(--text-primary, #cdd6f4);
        transition: background 0.15s ease;
      }

      .layer-context-item:hover {
        background: var(--bg-hover, #45475a);
      }

      .layer-context-item.danger {
        color: var(--color-danger, #f38ba8);
      }

      .layer-context-divider {
        height: 1px;
        background: var(--border-color, #45475a);
        margin: 4px 0;
      }

      /* Scrollbar */
      .layer-panel-tree::-webkit-scrollbar {
        width: 6px;
      }

      .layer-panel-tree::-webkit-scrollbar-track {
        background: transparent;
      }

      .layer-panel-tree::-webkit-scrollbar-thumb {
        background: var(--border-color, #45475a);
        border-radius: 3px;
      }

      .layer-panel-tree::-webkit-scrollbar-thumb:hover {
        background: var(--text-muted, #6c7086);
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Collapse button
    const collapseBtn = this.container.querySelector('.layer-btn-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleCollapse());
    }

    // Search input
    const searchInput = this.container.querySelector('.layer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.render();
      });
    }

    // Clear search
    const clearBtn = this.container.querySelector('.layer-btn-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const input = this.container.querySelector('.layer-search-input');
        if (input) {
          input.value = '';
          this.state.searchQuery = '';
          this.render();
        }
      });
    }

    // Toolbar actions
    const toolbar = this.container.querySelector('.layer-panel-toolbar');
    if (toolbar) {
      toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
          this.handleToolbarAction(btn.dataset.action);
        }
      });
    }

    // Listen for layer manager events
    this.layersManager.addEventListener('layers:tree-built', () => this.render());
    this.layersManager.addEventListener('layers:selection', () => this.render());
    this.layersManager.addEventListener('layers:locked', () => this.render());
    this.layersManager.addEventListener('layers:visibility', () => this.render());
    this.layersManager.addEventListener('layers:renamed', () => this.render());

    // Close context menu on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.layer-context-menu')) {
        this.closeContextMenu();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeContextMenu();
      }
    });
  }

  /**
   * Handle toolbar actions
   */
  handleToolbarAction(action) {
    const layers = this.layersManager.getAllLayers();

    switch (action) {
      case 'expand-all':
        layers.forEach(layer => {
          layer.expanded = true;
          layer.element.dataset.layerExpanded = 'true';
        });
        break;

      case 'collapse-all':
        layers.forEach(layer => {
          layer.expanded = false;
          layer.element.dataset.layerExpanded = 'false';
        });
        break;

      case 'lock-all':
        layers.forEach(layer => {
          this.layersManager.lockLayer(layer.id);
        });
        break;

      case 'unlock-all':
        layers.forEach(layer => {
          this.layersManager.unlockLayer(layer.id);
        });
        break;

      case 'show-all':
        layers.forEach(layer => {
          this.layersManager.showLayer(layer.id);
        });
        break;

      case 'hide-all':
        layers.forEach(layer => {
          this.layersManager.hideLayer(layer.id);
        });
        break;
    }

    this.render();
  }

  /**
   * Toggle panel collapse state
   */
  toggleCollapse() {
    this.state.collapsed = !this.state.collapsed;
    this.container.classList.toggle('collapsed', this.state.collapsed);

    const collapseBtn = this.container.querySelector('.layer-btn-collapse span');
    if (collapseBtn) {
      collapseBtn.textContent = this.state.collapsed ? '▶' : '◀';
    }
  }

  /**
   * Render the layer tree
   */
  render() {
    // Build tree if not already built
    const tree = this.layersManager.buildTree();

    const treeContent = this.container.querySelector('.layer-tree-content');
    if (!treeContent) return;

    // Clear existing content
    treeContent.innerHTML = '';

    if (!tree || !tree.children || tree.children.length === 0) {
      treeContent.innerHTML = '<div class="layer-empty">No layers yet. Add elements to the canvas.</div>';
      this.updateFooter(0, 0);
      return;
    }

    // Render tree recursively
    const fragment = document.createDocumentFragment();
    this.renderLayerNode(tree, fragment, 0);
    treeContent.appendChild(fragment);

    // Update footer
    const totalLayers = this.layersManager.getAllLayers().length;
    const selectedCount = this.layersManager.getSelectedLayers().length;
    this.updateFooter(totalLayers, selectedCount);
  }

  /**
   * Render a single layer node
   */
  renderLayerNode(layer, container, depth) {
    // Skip root canvas element
    if (layer.element && layer.element.id === 'canvas') {
      layer.children.forEach(child => {
        this.renderLayerNode(child, container, depth);
      });
      return;
    }

    // Filter by search query
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      const matches = layer.name.toLowerCase().includes(query) ||
                     layer.type.toLowerCase().includes(query);
      if (!matches && (!layer.children || layer.children.length === 0)) {
        return;
      }
    }

    const hasChildren = layer.children && layer.children.length > 0;
    const isSelected = this.layersManager.selectedLayers.has(layer.id);

    // Create layer item
    const item = document.createElement('div');
    item.className = 'layer-item';
    item.dataset.layerId = layer.id;
    item.style.paddingLeft = `${12 + depth * 16}px`;

    if (isSelected) item.classList.add('selected');
    if (layer.locked) item.classList.add('locked');
    if (layer.hidden) item.classList.add('hidden');

    // Get icon for element type
    const icon = this.getElementIcon(layer.type);

    item.innerHTML = `
      <span class="layer-expand ${hasChildren ? (layer.expanded ? 'expanded' : '') : 'no-children'}">▶</span>
      <span class="layer-icon">${icon}</span>
      <span class="layer-name" title="${layer.name}">${layer.name}</span>
      <div class="layer-controls">
        <button class="layer-control-btn ${layer.locked ? 'active' : ''}" data-action="lock" title="${layer.locked ? 'Unlock' : 'Lock'}">
          ${layer.locked ? '🔒' : '🔓'}
        </button>
        <button class="layer-control-btn ${layer.hidden ? 'active' : ''}" data-action="visibility" title="${layer.hidden ? 'Show' : 'Hide'}">
          ${layer.hidden ? '👁‍🗨' : '👁'}
        </button>
      </div>
    `;

    // Bind item events
    this.bindLayerItemEvents(item, layer);

    container.appendChild(item);

    // Render children
    if (hasChildren) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = `layer-children ${layer.expanded ? '' : 'collapsed'}`;

      layer.children.forEach(child => {
        this.renderLayerNode(child, childrenContainer, depth + 1);
      });

      container.appendChild(childrenContainer);
    }
  }

  /**
   * Bind events to a layer item
   */
  bindLayerItemEvents(item, layer) {
    // Click to select
    item.addEventListener('click', (e) => {
      if (e.target.closest('.layer-controls') || e.target.closest('.layer-expand')) {
        return;
      }

      const addToSelection = e.ctrlKey || e.metaKey;
      this.layersManager.selectLayer(layer.id, addToSelection);
    });

    // Double click to rename
    item.addEventListener('dblclick', (e) => {
      if (e.target.closest('.layer-controls')) return;
      this.startRename(item, layer);
    });

    // Right click for context menu
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, layer);
    });

    // Expand/collapse toggle
    const expandBtn = item.querySelector('.layer-expand');
    if (expandBtn && !expandBtn.classList.contains('no-children')) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.layersManager.toggleExpanded(layer.id);
        this.render();
      });
    }

    // Lock button
    const lockBtn = item.querySelector('[data-action="lock"]');
    if (lockBtn) {
      lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (layer.locked) {
          this.layersManager.unlockLayer(layer.id);
        } else {
          this.layersManager.lockLayer(layer.id);
        }
      });
    }

    // Visibility button
    const visBtn = item.querySelector('[data-action="visibility"]');
    if (visBtn) {
      visBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (layer.hidden) {
          this.layersManager.showLayer(layer.id);
        } else {
          this.layersManager.hideLayer(layer.id);
        }
      });
    }

    // Drag and drop
    item.draggable = true;

    item.addEventListener('dragstart', (e) => {
      this.state.draggedLayer = layer;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      this.state.draggedLayer = null;
      this.clearDropTargets();
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (this.state.draggedLayer && this.state.draggedLayer.id !== layer.id) {
        item.classList.add('drag-over');
        this.state.dropTarget = layer;
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this.state.draggedLayer && this.state.dropTarget) {
        this.layersManager.moveLayer(
          this.state.draggedLayer.id,
          this.state.dropTarget.id,
          'after'
        );
      }
      this.clearDropTargets();
    });
  }

  /**
   * Clear all drop target indicators
   */
  clearDropTargets() {
    this.container.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    this.state.dropTarget = null;
  }

  /**
   * Start renaming a layer
   */
  startRename(item, layer) {
    const nameSpan = item.querySelector('.layer-name');
    const currentName = layer.name;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'layer-name-input';
    input.value = currentName;

    nameSpan.replaceWith(input);
    input.focus();
    input.select();

    const finishRename = () => {
      const newName = input.value.trim() || currentName;
      if (newName !== currentName) {
        this.layersManager.renameLayer(layer.id, newName);
      }
      this.render();
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishRename();
      } else if (e.key === 'Escape') {
        this.render();
      }
    });
  }

  /**
   * Show context menu
   */
  showContextMenu(event, layer) {
    this.closeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'layer-context-menu';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    menu.innerHTML = `
      <div class="layer-context-item" data-action="select">
        <span>📌</span> Select
      </div>
      <div class="layer-context-item" data-action="rename">
        <span>✏️</span> Rename
      </div>
      <div class="layer-context-item" data-action="duplicate">
        <span>📋</span> Duplicate
      </div>
      <div class="layer-context-divider"></div>
      <div class="layer-context-item" data-action="lock">
        <span>${layer.locked ? '🔓' : '🔒'}</span> ${layer.locked ? 'Unlock' : 'Lock'}
      </div>
      <div class="layer-context-item" data-action="visibility">
        <span>${layer.hidden ? '👁' : '👁‍🗨'}</span> ${layer.hidden ? 'Show' : 'Hide'}
      </div>
      <div class="layer-context-divider"></div>
      <div class="layer-context-item danger" data-action="delete">
        <span>🗑️</span> Delete
      </div>
    `;

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.layer-context-item');
      if (item) {
        this.handleContextAction(item.dataset.action, layer);
        this.closeContextMenu();
      }
    });

    document.body.appendChild(menu);
    this.state.contextMenuLayer = layer;

    // Adjust position if menu goes off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
  }

  /**
   * Close context menu
   */
  closeContextMenu() {
    const menu = document.querySelector('.layer-context-menu');
    if (menu) {
      menu.remove();
    }
    this.state.contextMenuLayer = null;
  }

  /**
   * Handle context menu action
   */
  handleContextAction(action, layer) {
    switch (action) {
      case 'select':
        this.layersManager.selectLayer(layer.id);
        break;

      case 'rename':
        const item = this.container.querySelector(`[data-layer-id="${layer.id}"]`);
        if (item) {
          this.startRename(item, layer);
        }
        break;

      case 'duplicate':
        this.layersManager.duplicateLayer(layer.id);
        break;

      case 'lock':
        if (layer.locked) {
          this.layersManager.unlockLayer(layer.id);
        } else {
          this.layersManager.lockLayer(layer.id);
        }
        break;

      case 'visibility':
        if (layer.hidden) {
          this.layersManager.showLayer(layer.id);
        } else {
          this.layersManager.hideLayer(layer.id);
        }
        break;

      case 'delete':
        this.layersManager.deleteLayer(layer.id);
        break;
    }
  }

  /**
   * Get icon for element type
   */
  getElementIcon(type) {
    const icons = {
      div: '📦',
      section: '📑',
      header: '🔝',
      footer: '🔚',
      nav: '🧭',
      main: '📄',
      article: '📰',
      aside: '📎',
      h1: 'H1',
      h2: 'H2',
      h3: 'H3',
      h4: 'H4',
      h5: 'H5',
      h6: 'H6',
      p: '¶',
      span: '📝',
      a: '🔗',
      img: '🖼️',
      video: '🎬',
      audio: '🔊',
      iframe: '🪟',
      form: '📋',
      input: '⌨️',
      textarea: '📝',
      button: '🔘',
      select: '📋',
      ul: '•',
      ol: '1.',
      li: '•',
      table: '📊',
      canvas: '🎨',
    };

    return icons[type] || '📦';
  }

  /**
   * Update footer information
   */
  updateFooter(total, selected) {
    const countEl = this.container.querySelector('.layer-count');
    const selectedEl = this.container.querySelector('.layer-selected');

    if (countEl) {
      countEl.textContent = `${total} layer${total !== 1 ? 's' : ''}`;
    }

    if (selectedEl) {
      selectedEl.textContent = selected > 0 
        ? `${selected} selected` 
        : 'None selected';
    }
  }

  /**
   * Destroy the panel
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }

    const styles = document.getElementById('layer-panel-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayerPanel;
}

// Make available globally
window.LayerPanel = LayerPanel;

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Only auto-init if LayersManager exists
      if (window.LayersManager || window.layersManager) {
        window.layerPanel = new LayerPanel();
      }
    });
  } else {
    // DOM already loaded
    setTimeout(() => {
      if (window.LayersManager || window.layersManager) {
        window.layerPanel = new LayerPanel();
      }
    }, 100);
  }
}
