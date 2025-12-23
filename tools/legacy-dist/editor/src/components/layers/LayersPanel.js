/**
 * LayersPanel - Main UI component for layers panel
 * Renders layer tree with controls
 */

class LayersPanel {
  constructor(layersManager) {
    this.layersManager = layersManager;
    this.container = null;
    this.treeContainer = null;
    this.draggedLayer = null;
    this.dropTarget = null;

    this.init();
  }

  init() {
    this.createPanel();
    this.attachEventListeners();
    console.log('🎨 LayersPanel initialized');
  }

  /**
   * Create panel HTML structure
   */
  createPanel() {
    // Find or create container
    let container = document.getElementById('layersPanel');

    if (!container) {
      // Create new panel
      container = document.createElement('div');
      container.id = 'layersPanel';
      container.className = 'layers-panel';

      // Insert into components panel
      const componentsPanel = document.querySelector('.components-panel');
      if (componentsPanel) {
        componentsPanel.appendChild(container);
      }
    }

    container.innerHTML = `
            <div class="layers-header">
                <h3 class="layers-title">Capas</h3>
                <div class="layers-toolbar">
                    <button class="layers-btn" id="layersRefreshBtn" title="Actualizar árbol">
                        🔄
                    </button>
                    <button class="layers-btn" id="layersCollapseAllBtn" title="Colapsar todo">
                        ⊟
                    </button>
                    <button class="layers-btn" id="layersExpandAllBtn" title="Expandir todo">
                        ⊞
                    </button>
                </div>
            </div>
            <div class="layers-search">
                <input type="text" id="layersSearchInput" placeholder="Buscar capas..." />
            </div>
            <div class="layers-tree" id="layersTree">
                <div class="layers-empty">
                    No hay elementos en el canvas
                </div>
            </div>
        `;

    this.container = container;
    this.treeContainer = container.querySelector('#layersTree');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toolbar buttons
    document.getElementById('layersRefreshBtn')?.addEventListener('click', () => {
      this.refresh();
    });

    document.getElementById('layersCollapseAllBtn')?.addEventListener('click', () => {
      this.collapseAll();
    });

    document.getElementById('layersExpandAllBtn')?.addEventListener('click', () => {
      this.expandAll();
    });

    // Search
    document.getElementById('layersSearchInput')?.addEventListener('input', e => {
      this.search(e.target.value);
    });

    // Listen to layers manager events
    this.layersManager.addEventListener('layers:tree-built', () => {
      this.render();
    });

    this.layersManager.addEventListener('layers:selection', () => {
      this.updateSelection();
    });

    this.layersManager.addEventListener('layers:renamed', () => {
      this.render();
    });

    this.layersManager.addEventListener('layers:locked', () => {
      this.render();
    });

    this.layersManager.addEventListener('layers:visibility', () => {
      this.render();
    });

    this.layersManager.addEventListener('layers:moved', () => {
      this.render();
    });

    this.layersManager.addEventListener('layers:deleted', () => {
      this.render();
    });

    this.layersManager.addEventListener('layers:duplicated', () => {
      this.render();
    });
  }

  /**
   * Render the layer tree
   */
  render() {
    if (!this.treeContainer) return;

    const tree = this.layersManager.buildTree();

    if (!tree || !tree.children || tree.children.length === 0) {
      this.treeContainer.innerHTML =
        '<div class="layers-empty">No hay elementos en el canvas</div>';
      return;
    }

    // Render tree
    this.treeContainer.innerHTML = '';
    this.renderNode(tree, this.treeContainer);
  }

  /**
   * Render a single node
   */
  renderNode(layer, container) {
    if (!layer.children || layer.children.length === 0) return;

    layer.children.forEach(child => {
      const node = this.createLayerNode(child);
      container.appendChild(node);

      // Render children if expanded
      if (child.children && child.children.length > 0 && child.expanded) {
        const childrenContainer = node.querySelector('.layer-children');
        if (childrenContainer) {
          this.renderNode(child, childrenContainer);
        }
      }
    });
  }

  /**
   * Create a layer node element
   */
  createLayerNode(layer) {
    const node = document.createElement('div');
    node.className = 'layer-node';
    node.dataset.layerId = layer.id;
    node.style.paddingLeft = `${layer.depth * 16}px`;

    const hasChildren = layer.children && layer.children.length > 0;
    const isSelected = this.layersManager.selectedLayers.has(layer.id);

    // Get icon based on element type
    const icon = this.getElementIcon(layer.type);

    node.innerHTML = `
            <div class="layer-content ${isSelected ? 'selected' : ''} ${layer.locked ? 'locked' : ''} ${layer.hidden ? 'hidden' : ''}">
                ${
                  hasChildren
                    ? `
                    <button class="layer-expand-btn ${layer.expanded ? 'expanded' : ''}" data-layer-id="${layer.id}">
                        ${layer.expanded ? '▼' : '▶'}
                    </button>
                `
                    : '<span class="layer-expand-spacer"></span>'
                }
                <span class="layer-icon">${icon}</span>
                <span class="layer-name" data-layer-id="${layer.id}">${this.escapeHtml(layer.name)}</span>
                <div class="layer-actions">
                    <button class="layer-action-btn" data-action="visibility" data-layer-id="${layer.id}" title="${layer.hidden ? 'Mostrar' : 'Ocultar'}">
                        ${layer.hidden ? '👁️‍🗨️' : '👁️'}
                    </button>
                    <button class="layer-action-btn" data-action="lock" data-layer-id="${layer.id}" title="${layer.locked ? 'Desbloquear' : 'Bloquear'}">
                        ${layer.locked ? '🔒' : '🔓'}
                    </button>
                    <button class="layer-action-btn" data-action="duplicate" data-layer-id="${layer.id}" title="Duplicar">
                        📋
                    </button>
                    <button class="layer-action-btn" data-action="delete" data-layer-id="${layer.id}" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
            ${hasChildren ? '<div class="layer-children"></div>' : ''}
        `;

    // Attach event listeners
    this.attachNodeListeners(node, layer);

    return node;
  }

  /**
   * Attach listeners to a node
   */
  attachNodeListeners(node, layer) {
    // Click to select
    const content = node.querySelector('.layer-content');
    content.addEventListener('click', e => {
      if (e.target.closest('.layer-action-btn') || e.target.closest('.layer-expand-btn')) {
        return; // Don't select if clicking action buttons
      }

      if (e.ctrlKey || e.metaKey) {
        // Add to selection
        this.layersManager.selectLayer(layer.id, true);
      } else {
        // Single selection
        this.layersManager.selectLayer(layer.id, false);
      }
    });

    // Double-click to rename
    const nameSpan = node.querySelector('.layer-name');
    nameSpan.addEventListener('dblclick', e => {
      e.stopPropagation();
      this.startRename(layer.id, nameSpan);
    });

    // Expand/collapse
    const expandBtn = node.querySelector('.layer-expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.layersManager.toggleExpanded(layer.id);
        this.render();
      });
    }

    // Action buttons
    const actionBtns = node.querySelectorAll('.layer-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const layerId = btn.dataset.layerId;
        this.handleAction(action, layerId);
      });
    });

    // Drag and drop
    content.draggable = true;
    content.addEventListener('dragstart', e => {
      this.draggedLayer = layer.id;
      e.dataTransfer.effectAllowed = 'move';
      content.classList.add('dragging');
    });

    content.addEventListener('dragend', () => {
      content.classList.remove('dragging');
      this.draggedLayer = null;
      this.clearDropIndicators();
    });

    content.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (this.draggedLayer && this.draggedLayer !== layer.id) {
        this.showDropIndicator(content, e);
      }
    });

    content.addEventListener('drop', e => {
      e.preventDefault();

      if (this.draggedLayer && this.draggedLayer !== layer.id) {
        const position = this.getDropPosition(content, e);
        this.layersManager.moveLayer(this.draggedLayer, layer.id, position);
      }

      this.clearDropIndicators();
    });
  }

  /**
   * Handle action button clicks
   */
  handleAction(action, layerId) {
    const layer = this.layersManager.getLayer(layerId);
    if (!layer) return;

    switch (action) {
      case 'visibility':
        if (layer.hidden) {
          this.layersManager.showLayer(layerId);
        } else {
          this.layersManager.hideLayer(layerId);
        }
        break;

      case 'lock':
        if (layer.locked) {
          this.layersManager.unlockLayer(layerId);
        } else {
          this.layersManager.lockLayer(layerId);
        }
        break;

      case 'duplicate':
        this.layersManager.duplicateLayer(layerId);
        break;

      case 'delete':
        if (confirm(`¿Eliminar capa "${layer.name}"?`)) {
          this.layersManager.deleteLayer(layerId);
        }
        break;
    }
  }

  /**
   * Start renaming a layer
   */
  startRename(layerId, nameElement) {
    const layer = this.layersManager.getLayer(layerId);
    if (!layer || layer.locked) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'layer-name-input';
    input.value = layer.name;

    nameElement.replaceWith(input);
    input.focus();
    input.select();

    const finishRename = () => {
      const newName = input.value.trim();
      if (newName && newName !== layer.name) {
        this.layersManager.renameLayer(layerId, newName);
      }
      this.render();
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        finishRename();
      } else if (e.key === 'Escape') {
        this.render();
      }
    });
  }

  /**
   * Update selection visual state
   */
  updateSelection() {
    const selectedIds = this.layersManager.selectedLayers;

    this.treeContainer.querySelectorAll('.layer-content').forEach(content => {
      const node = content.closest('.layer-node');
      const layerId = node?.dataset.layerId;

      if (layerId && selectedIds.has(layerId)) {
        content.classList.add('selected');
      } else {
        content.classList.remove('selected');
      }
    });
  }

  /**
   * Show drop indicator
   */
  showDropIndicator(element, event) {
    this.clearDropIndicators();

    const rect = element.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const height = rect.height;

    if (y < height / 3) {
      element.classList.add('drop-before');
    } else if (y > (height * 2) / 3) {
      element.classList.add('drop-after');
    } else {
      element.classList.add('drop-child');
    }
  }

  /**
   * Get drop position
   */
  getDropPosition(element, event) {
    const rect = element.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const height = rect.height;

    if (y < height / 3) {
      return 'before';
    } else if (y > (height * 2) / 3) {
      return 'after';
    } else {
      return 'child';
    }
  }

  /**
   * Clear drop indicators
   */
  clearDropIndicators() {
    this.treeContainer.querySelectorAll('.layer-content').forEach(content => {
      content.classList.remove('drop-before', 'drop-after', 'drop-child');
    });
  }

  /**
   * Get icon for element type
   */
  getElementIcon(type) {
    const icons = {
      div: '📦',
      section: '📄',
      article: '📰',
      header: '🎯',
      footer: '⬇️',
      nav: '🧭',
      aside: '📌',
      main: '🏠',
      h1: '📝',
      h2: '📝',
      h3: '📝',
      h4: '📝',
      h5: '📝',
      h6: '📝',
      p: '📄',
      span: '✏️',
      a: '🔗',
      button: '🔘',
      input: '📝',
      textarea: '📝',
      select: '📋',
      img: '🖼️',
      video: '🎬',
      audio: '🎵',
      iframe: '🌐',
      ul: '📋',
      ol: '📋',
      li: '•',
      table: '📊',
      form: '📝',
    };

    return icons[type] || '📦';
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Refresh tree
   */
  refresh() {
    this.layersManager.buildTree();
    this.render();
  }

  /**
   * Collapse all nodes
   */
  collapseAll() {
    this.layersManager.getAllLayers().forEach(layer => {
      layer.expanded = false;
      layer.element.dataset.layerExpanded = 'false';
    });
    this.render();
  }

  /**
   * Expand all nodes
   */
  expandAll() {
    this.layersManager.getAllLayers().forEach(layer => {
      layer.expanded = true;
      layer.element.dataset.layerExpanded = 'true';
    });
    this.render();
  }

  /**
   * Search layers
   */
  search(query) {
    if (!query) {
      // Show all
      this.treeContainer.querySelectorAll('.layer-node').forEach(node => {
        node.style.display = '';
      });
      return;
    }

    const lowerQuery = query.toLowerCase();

    this.treeContainer.querySelectorAll('.layer-node').forEach(node => {
      const layerId = node.dataset.layerId;
      const layer = this.layersManager.getLayer(layerId);

      if (layer && layer.name.toLowerCase().includes(lowerQuery)) {
        node.style.display = '';
      } else {
        node.style.display = 'none';
      }
    });
  }

  /**
   * Destroy
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayersPanel;
}

window.LayersPanel = LayersPanel;

export default LayersPanel;
