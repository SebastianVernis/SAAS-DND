/**
 * Frontend Reader Integration
 * Integrates the Frontend Reader with the existing editor
 * 
 * @module FrontendReaderIntegration
 */

import { frontendReader } from './index.js';
import { ProjectImportModal } from './ui/ProjectImportModal.js';

/**
 * Initialize Frontend Reader integration
 */
export function initFrontendReader() {
  console.log('🔌 Initializing Frontend Reader integration...');

  // Add import modal styles
  addStyles();

  // Set up global functions for toolbar buttons
  setupGlobalFunctions();

  console.log('✅ Frontend Reader integration initialized');
}

/**
 * Add CSS styles
 */
function addStyles() {
  const href = './src/reader/ui/styles.css';
  
  // Check if already loaded
  const alreadyLoaded = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .some(link => {
      const linkHref = link.getAttribute('href');
      return linkHref === href || linkHref === href.substring(2) || linkHref.endsWith('styles.css');
    });
  
  if (!alreadyLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    console.log('✅ Loaded reader styles');
  } else {
    console.log('⏭️ Reader styles already loaded');
  }
}

/**
 * Set up global functions
 */
function setupGlobalFunctions() {
  // Analyze directory function
  window.analyzeDirectory = async function(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      showToast('🔍 Analyzing project...', 'info');
      
      const project = await frontendReader.loadProject(files);
      
      showToast('✅ Project analyzed successfully!', 'success');
      
      // Show project info modal
      showProjectInfo(project);
      
      // Ask user if they want to load it
      if (confirm('Load this project into the editor?')) {
        await loadProjectIntoEditor(project);
      }
      
    } catch (error) {
      console.error('Error analyzing directory:', error);
      showToast('❌ Error analyzing project: ' + error.message, 'error');
    }
  };

  // Import HTML file function
  window.importHTMLFile = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      showToast('📄 Loading HTML file...', 'info');
      
      const project = await frontendReader.loadHTMLFile(file);
      
      showToast('✅ HTML file loaded successfully!', 'success');
      
      // Load into editor
      await loadProjectIntoEditor(project);
      
    } catch (error) {
      console.error('Error importing HTML:', error);
      showToast('❌ Error importing HTML: ' + error.message, 'error');
    }
  };

  // Show project import modal
  window.showProjectImportModal = function() {
    const modal = new ProjectImportModal();
    
    modal.show(
      async (files, type) => {
        try {
          showToast('🔍 Analyzing project...', 'info');
          
          let project;
          if (type === 'html') {
            project = await frontendReader.loadHTMLFile(files[0]);
          } else {
            project = await frontendReader.loadProject(files);
          }
          
          showToast('✅ Project loaded successfully!', 'success');
          
          await loadProjectIntoEditor(project);
          
        } catch (error) {
          console.error('Error loading project:', error);
          showToast('❌ Error loading project: ' + error.message, 'error');
        }
      },
      () => {
        console.log('Import cancelled');
      }
    );
  };
}

/**
 * Show project info modal
 * @param {Object} project - Project data
 */
function showProjectInfo(project) {
  const info = `
📊 Project Analysis Results:

📁 Name: ${project.metadata.name}
🎯 Framework: ${project.framework.name} ${project.framework.version}
📄 Components: ${project.components.length}
🎨 CSS Files: ${project.styles.cssFiles?.length || 0}
🖼️ Assets: ${project.assets.length}

${project.framework.typescript ? '✅ TypeScript detected' : ''}
${project.styles.tailwind?.detected ? '✅ Tailwind CSS detected' : ''}
${project.styles.cssInJs?.detected ? '✅ CSS-in-JS detected' : ''}
  `.trim();

  alert(info);
}

/**
 * Load project into editor
 * @param {Object} project - Project data
 */
async function loadProjectIntoEditor(project) {
  try {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Clear current canvas
    canvas.innerHTML = '';

    // Load main component
    if (project.components && project.components.length > 0) {
      const mainComponent = project.components[0];
      
      // Load body content
      if (mainComponent.structure?.body?.innerHTML) {
        canvas.innerHTML = mainComponent.structure.body.innerHTML;
      } else if (mainComponent.structure?.body?.children) {
        // Reconstruct from parsed structure
        const html = reconstructHTML(mainComponent.structure.body.children);
        canvas.innerHTML = html;
      }

      // Load styles
      await loadStyles(project.styles);

      // Load assets
      await loadAssets(project.assets);

      // Update document title
      if (mainComponent.metadata?.title) {
        document.title = mainComponent.metadata.title + ' - Editor';
      }

      // Make elements selectable
      makeElementsSelectable();

      // Store project reference
      window.currentImportedProject = project;

      showToast('✅ Project loaded into editor!', 'success');
    }

  } catch (error) {
    console.error('Error loading project into editor:', error);
    throw error;
  }
}

/**
 * Reconstruct HTML from parsed structure
 * @param {Array} children - Child elements
 * @returns {string} HTML string
 */
function reconstructHTML(children) {
  if (!children || children.length === 0) return '';

  let html = '';
  
  children.forEach(child => {
    if (child.outerHTML) {
      html += child.outerHTML;
    } else if (child.tag) {
      html += `<${child.tag}`;
      
      // Add attributes
      if (child.attributes) {
        Object.entries(child.attributes).forEach(([key, value]) => {
          html += ` ${key}="${value}"`;
        });
      }
      
      html += '>';
      
      // Add children
      if (child.children) {
        html += reconstructHTML(child.children);
      }
      
      // Add text content
      if (child.textContent) {
        html += child.textContent;
      }
      
      html += `</${child.tag}>`;
    }
  });

  return html;
}

/**
 * Load styles into editor
 * @param {Object} styles - Styles data
 */
async function loadStyles(styles) {
  // Load internal styles
  if (styles.internal && styles.internal.length > 0) {
    styles.internal.forEach(style => {
      const styleEl = document.createElement('style');
      styleEl.textContent = style.content;
      document.head.appendChild(styleEl);
    });
  }

  // Load external styles (if URLs are accessible)
  if (styles.external && styles.external.length > 0) {
    styles.external.forEach(style => {
      if (style.href && !style.href.startsWith('http')) {
        console.warn('Cannot load external stylesheet:', style.href);
      }
    });
  }

  // Load CSS files
  if (styles.cssFiles && styles.cssFiles.length > 0) {
    styles.cssFiles.forEach(cssFile => {
      const styleEl = document.createElement('style');
      styleEl.textContent = cssFile.content;
      styleEl.setAttribute('data-filename', cssFile.filename);
      document.head.appendChild(styleEl);
    });
  }
}

/**
 * Load assets into editor
 * @param {Array} assets - Assets data
 */
async function loadAssets(assets) {
  // Assets are already loaded as object URLs
  // Just log for now
  console.log(`📦 ${assets.length} assets available`);
  
  // Store assets globally for reference
  window.importedAssets = assets;
}

/**
 * Make elements selectable
 */
function makeElementsSelectable() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const elements = canvas.querySelectorAll('*');
  elements.forEach(element => {
    // Add click handler for selection
    element.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Remove previous selection
      const selected = canvas.querySelector('.selected');
      if (selected) {
        selected.classList.remove('selected');
      }
      
      // Add selection to clicked element
      this.classList.add('selected');
      
      // Update properties panel if available
      if (window.updatePropertiesPanel) {
        window.updatePropertiesPanel(this);
      }
    });

    // Add double-click handler for text editing
    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON'].includes(element.tagName)) {
      element.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        this.contentEditable = true;
        this.focus();
        
        this.addEventListener('blur', function() {
          this.contentEditable = false;
        }, { once: true });
      });
    }
  });
}

/**
 * Show toast notification
 * @param {string} message - Message
 * @param {string} type - Type (success, error, info)
 */
function showToast(message, type = 'info') {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

/**
 * Export current project
 * @returns {Object} Project data
 */
export function exportCurrentProject() {
  if (!window.currentImportedProject) {
    return null;
  }

  const canvas = document.getElementById('canvas');
  if (!canvas) {
    return null;
  }

  // Update project with current canvas state
  const project = window.currentImportedProject;
  if (project.components && project.components.length > 0) {
    project.components[0].structure.body.innerHTML = canvas.innerHTML;
  }

  return project;
}

/**
 * Get sync engine
 * @returns {SyncEngine|null} Sync engine
 */
export function getSyncEngine() {
  return frontendReader.syncEngine;
}

/**
 * Download updated project
 */
export function downloadUpdatedProject() {
  const syncEngine = getSyncEngine();
  if (syncEngine) {
    syncEngine.downloadUpdatedFile();
  } else {
    showToast('⚠️ No project loaded', 'warning');
  }
}
