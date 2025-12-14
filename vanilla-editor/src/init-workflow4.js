/**
 * Workflow 4 Initialization
 * Loads deployment, integrations, and tutorial modules
 */

// Import deployment modules
import { VercelDeployer } from './deploy/vercelDeployer.js';
import { DeploymentHistory } from './deploy/deploymentHistory.js';

// Import integration modules
import { GitIntegration } from './integrations/gitIntegration.js';
import { RepoManager } from './integrations/repoManager.js';

// Import tutorial modules
import { TutorialEngine } from './tutorial/tutorialEngine.js';

// Import UI components
import { DeployModal } from './components/DeployModal.js';

/**
 * Initialize Workflow 4 features
 */
export function initWorkflow4() {
  console.log('🚀 Initializing Workflow 4: Deploy & Integrations...');

  // Initialize Vercel Deployer
  if (!window.vercelDeployer) {
    window.vercelDeployer = new VercelDeployer();
    console.log('✅ Vercel Deployer initialized');
  }

  // Initialize Git Integration
  if (!window.gitIntegration) {
    window.gitIntegration = new GitIntegration();
    console.log('✅ Git Integration initialized');
  }

  // Initialize Repo Manager
  if (!window.repoManager) {
    window.repoManager = new RepoManager();
    console.log('✅ Repo Manager initialized');
  }

  // Initialize Tutorial Engine
  if (!window.tutorial) {
    window.tutorial = new TutorialEngine();
    console.log('✅ Tutorial Engine initialized');
  }

  // Initialize Deploy Modal
  if (!window.deployModal) {
    window.deployModal = new DeployModal();
    console.log('✅ Deploy Modal initialized');
  }

  // Setup event listeners
  setupEventListeners();

  // Load CSS
  loadStyles();

  console.log('✅ Workflow 4 initialized successfully!');
}

/**
 * Setup event listeners for deployment and git events
 */
function setupEventListeners() {
  // Vercel deployment events
  window.addEventListener('deploy:start', e => {
    console.log('🚀 Deployment started:', e.detail);
    showToast('Iniciando deployment...', 'info');
  });

  window.addEventListener('deploy:complete', e => {
    console.log('✅ Deployment complete:', e.detail);
    showToast(`¡Deployment exitoso! URL: ${e.detail.url}`, 'success');
  });

  window.addEventListener('deploy:error', e => {
    console.error('❌ Deployment error:', e.detail);
    showToast(`Error en deployment: ${e.detail.error}`, 'error');
  });

  // GitHub events
  window.addEventListener('github:connected', e => {
    console.log('✅ GitHub connected:', e.detail);
    showToast(`Conectado a GitHub como ${e.detail.user.login}`, 'success');
  });

  window.addEventListener('github:commit', e => {
    console.log('✅ GitHub commit:', e.detail);
    showToast(`Commit exitoso: ${e.detail.commitSHA.substring(0, 7)}`, 'success');
  });

  // Tutorial events
  window.addEventListener('tutorial:start', e => {
    console.log('📚 Tutorial started:', e.detail);
  });

  window.addEventListener('tutorial:complete', e => {
    console.log('🎉 Tutorial completed:', e.detail);
    showToast('¡Tutorial completado! 🎉', 'success');
  });
}

/**
 * Load CSS styles for workflow 4
 */
function loadStyles() {
  // Check if styles are already loaded (with or without leading slash or ./)
  const alreadyLoaded = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => link.getAttribute('href'));
  
  const stylesToLoad = ['/src/styles/deploy.css', '/src/styles/tutorial.css'];
  
  stylesToLoad.forEach(href => {
    // Check multiple possible paths
    const isLoaded = alreadyLoaded.some(loaded => 
      loaded === href || 
      loaded === `.${href}` || 
      loaded === href.substring(1) ||
      loaded.endsWith(href.split('/').pop())
    );
    
    if (!isLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      console.log(`✅ Loaded stylesheet: ${href}`);
    } else {
      console.log(`⏭️ Stylesheet already loaded: ${href}`);
    }
  });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Use existing toast system if available
  if (typeof window.showToast === 'function') {
    window.showToast(message);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

/**
 * Global functions for UI interactions
 */

// Show deploy modal
window.showDeployModal = function () {
  if (window.deployModal) {
    window.deployModal.show();
  } else {
    console.error('Deploy modal not initialized');
  }
};

// Show GitHub connection modal
window.showGitHubModal = function () {
  alert('GitHub integration modal - Coming soon!');
  // TODO: Implement GitHub modal UI
};

// Start tutorial
window.startTutorial = function () {
  if (window.tutorial) {
    window.tutorial.start();
  } else {
    console.error('Tutorial engine not initialized');
  }
};

// Show deployment history
window.showDeploymentHistory = function () {
  if (window.vercelDeployer) {
    const history = window.vercelDeployer.getDeploymentHistory(10);
    console.log('Deployment History:', history);
    // TODO: Show in UI modal
    alert(`Tienes ${history.length} deployments en el historial`);
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkflow4);
} else {
  initWorkflow4();
}

export default initWorkflow4;
