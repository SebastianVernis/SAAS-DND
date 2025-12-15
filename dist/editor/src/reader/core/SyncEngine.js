/**
 * Sync Engine
 * Handles bidirectional synchronization between editor and files
 * 
 * @module SyncEngine
 */

export class SyncEngine {
  constructor(project, options = {}) {
    this.project = project;
    this.options = {
      autoSync: true,
      debounceDelay: 500,
      ...options
    };

    this.isRunning = false;
    this.changeQueue = [];
    this.debounceTimer = null;
    this.listeners = new Map();
  }

  /**
   * Start sync engine
   * @returns {Promise<void>}
   */
  async start() {
    if (this.isRunning) {
      console.warn('Sync engine already running');
      return;
    }

    console.log('🔄 Starting sync engine...');
    this.isRunning = true;

    // Note: File watching is not available in browser environment
    // This is a placeholder for future implementation with File System Access API
    console.log('⚠️ File watching not available in browser environment');
    console.log('💡 Changes will be tracked manually through editor events');

    // Set up editor change listeners
    this.setupEditorListeners();
  }

  /**
   * Stop sync engine
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping sync engine...');
    this.isRunning = false;

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Remove listeners
    this.removeEditorListeners();

    // Process remaining changes
    if (this.changeQueue.length > 0) {
      await this.processChangeQueue();
    }
  }

  /**
   * Set up editor change listeners
   */
  setupEditorListeners() {
    // Listen for canvas changes
    const canvas = document.getElementById('canvas');
    if (canvas) {
      const observer = new MutationObserver((mutations) => {
        this.handleCanvasChange(mutations);
      });

      observer.observe(canvas, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true
      });

      this.listeners.set('canvasObserver', observer);
    }

    // Listen for property changes
    document.addEventListener('propertyChanged', this.handlePropertyChange.bind(this));
    this.listeners.set('propertyChanged', true);
  }

  /**
   * Remove editor change listeners
   */
  removeEditorListeners() {
    // Disconnect observers
    const canvasObserver = this.listeners.get('canvasObserver');
    if (canvasObserver) {
      canvasObserver.disconnect();
    }

    // Remove event listeners
    if (this.listeners.get('propertyChanged')) {
      document.removeEventListener('propertyChanged', this.handlePropertyChange.bind(this));
    }

    this.listeners.clear();
  }

  /**
   * Handle canvas changes
   * @param {MutationRecord[]} mutations - Mutations
   */
  handleCanvasChange(mutations) {
    if (!this.isRunning || !this.options.autoSync) {
      return;
    }

    mutations.forEach(mutation => {
      const change = {
        type: 'canvas',
        mutationType: mutation.type,
        target: mutation.target,
        timestamp: Date.now()
      };

      this.queueChange(change);
    });
  }

  /**
   * Handle property changes
   * @param {CustomEvent} event - Property change event
   */
  handlePropertyChange(event) {
    if (!this.isRunning || !this.options.autoSync) {
      return;
    }

    const change = {
      type: 'property',
      element: event.detail.element,
      property: event.detail.property,
      oldValue: event.detail.oldValue,
      newValue: event.detail.newValue,
      timestamp: Date.now()
    };

    this.queueChange(change);
  }

  /**
   * Queue a change
   * @param {Object} change - Change object
   */
  queueChange(change) {
    this.changeQueue.push(change);

    // Debounce processing
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChangeQueue();
    }, this.options.debounceDelay);
  }

  /**
   * Process change queue
   * @returns {Promise<void>}
   */
  async processChangeQueue() {
    if (this.changeQueue.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${this.changeQueue.length} changes...`);

    const changes = [...this.changeQueue];
    this.changeQueue = [];

    try {
      // Group changes by type
      const grouped = this.groupChanges(changes);

      // Process each group
      for (const [type, typeChanges] of Object.entries(grouped)) {
        await this.processChangeGroup(type, typeChanges);
      }

      console.log('✅ Changes processed successfully');

      // Emit sync event
      this.emitSyncEvent('synced', { changes });

    } catch (error) {
      console.error('❌ Error processing changes:', error);
      this.emitSyncEvent('error', { error, changes });
    }
  }

  /**
   * Group changes by type
   * @param {Array} changes - Changes
   * @returns {Object} Grouped changes
   */
  groupChanges(changes) {
    const grouped = {};

    changes.forEach(change => {
      if (!grouped[change.type]) {
        grouped[change.type] = [];
      }
      grouped[change.type].push(change);
    });

    return grouped;
  }

  /**
   * Process change group
   * @param {string} type - Change type
   * @param {Array} changes - Changes
   * @returns {Promise<void>}
   */
  async processChangeGroup(type, changes) {
    switch (type) {
      case 'canvas':
        await this.processCanvasChanges(changes);
        break;
      case 'property':
        await this.processPropertyChanges(changes);
        break;
      default:
        console.warn(`Unknown change type: ${type}`);
    }
  }

  /**
   * Process canvas changes
   * @param {Array} changes - Canvas changes
   * @returns {Promise<void>}
   */
  async processCanvasChanges(changes) {
    // Update project structure
    const canvas = document.getElementById('canvas');
    if (canvas) {
      // Extract current HTML structure
      const currentHTML = canvas.innerHTML;
      
      // Update project component
      if (this.project.components && this.project.components.length > 0) {
        const mainComponent = this.project.components[0];
        mainComponent.structure.body.innerHTML = currentHTML;
      }
    }
  }

  /**
   * Process property changes
   * @param {Array} changes - Property changes
   * @returns {Promise<void>}
   */
  async processPropertyChanges(changes) {
    // Update component properties
    changes.forEach(change => {
      if (change.element && change.property) {
        // Update in project structure
        console.log(`Property changed: ${change.property} = ${change.newValue}`);
      }
    });
  }

  /**
   * Export current state
   * @returns {Object} Current state
   */
  exportState() {
    const canvas = document.getElementById('canvas');
    
    return {
      html: canvas ? canvas.innerHTML : '',
      timestamp: Date.now(),
      project: this.project
    };
  }

  /**
   * Generate updated HTML
   * @returns {string} HTML content
   */
  generateHTML() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return '';

    const component = this.project.components[0];
    if (!component) return '';

    // Build complete HTML
    let html = component.structure.doctype + '\n';
    html += '<html';
    
    // Add html attributes
    if (component.structure.html?.attributes) {
      Object.entries(component.structure.html.attributes).forEach(([key, value]) => {
        html += ` ${key}="${value}"`;
      });
    }
    
    html += '>\n';

    // Add head
    html += '<head>\n';
    if (component.metadata.title) {
      html += `  <title>${component.metadata.title}</title>\n`;
    }
    if (component.metadata.charset) {
      html += `  <meta charset="${component.metadata.charset}">\n`;
    }
    if (component.metadata.viewport) {
      html += `  <meta name="viewport" content="${component.metadata.viewport}">\n`;
    }
    
    // Add styles
    if (component.styles?.internal) {
      component.styles.internal.forEach(style => {
        html += `  <style>\n${style.content}\n  </style>\n`;
      });
    }
    
    // Add external styles
    if (component.styles?.external) {
      component.styles.external.forEach(style => {
        html += `  <link rel="stylesheet" href="${style.href}">\n`;
      });
    }
    
    html += '</head>\n';

    // Add body
    html += '<body>\n';
    html += canvas.innerHTML;
    html += '\n</body>\n';
    html += '</html>';

    return html;
  }

  /**
   * Download updated file
   * @param {string} filename - File name
   */
  downloadUpdatedFile(filename = 'updated.html') {
    const html = this.generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Emit sync event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  emitSyncEvent(eventName, detail) {
    const event = new CustomEvent(`sync:${eventName}`, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Get sync status
   * @returns {Object} Status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      queueLength: this.changeQueue.length,
      hasListeners: this.listeners.size > 0
    };
  }
}
