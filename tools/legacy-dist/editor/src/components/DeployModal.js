/**
 * DeployModal - UI component for Vercel deployment
 */

export class DeployModal {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.onDeploy = null;
  }

  /**
   * Show deploy modal
   * @param {Object} options - Modal options
   */
  show(options = {}) {
    if (this.isOpen) return;

    this.onDeploy = options.onDeploy || null;
    this.createModal();
    this.isOpen = true;

    // Check connection status
    this.updateConnectionStatus();
  }

  /**
   * Hide deploy modal
   */
  hide() {
    if (!this.modal) return;

    const overlay = this.modal.querySelector('.deploy-modal-overlay');
    overlay.classList.remove('visible');

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
      this.isOpen = false;
    }, 300);
  }

  /**
   * Create modal HTML
   */
  createModal() {
    this.modal = document.createElement('div');
    this.modal.innerHTML = `
      <div class="deploy-modal-overlay">
        <div class="deploy-modal">
          <div class="deploy-modal-header">
            <h2>🚀 Desplegar a Vercel</h2>
            <button class="deploy-modal-close" onclick="window.deployModal.hide()">✕</button>
          </div>
          <div class="deploy-modal-body">
            <div id="deployConnectionStatus"></div>
            <div id="deployFormContainer"></div>
            <div id="deployProgressContainer" style="display: none;"></div>
          </div>
          <div class="deploy-modal-footer">
            <button class="deploy-btn deploy-btn-secondary" onclick="window.deployModal.hide()">
              Cancelar
            </button>
            <button class="deploy-btn deploy-btn-primary" id="deployButton" onclick="window.deployModal.startDeploy()">
              Desplegar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Show with animation
    setTimeout(() => {
      const overlay = this.modal.querySelector('.deploy-modal-overlay');
      overlay.classList.add('visible');
    }, 10);

    // Render form
    this.renderForm();
  }

  /**
   * Update connection status
   */
  updateConnectionStatus() {
    const container = document.getElementById('deployConnectionStatus');
    if (!container) return;

    const isConnected = window.vercelDeployer && window.vercelDeployer.isConnected();

    if (isConnected) {
      container.innerHTML = `
        <div class="deploy-connection-status">
          <div class="deploy-connection-indicator"></div>
          <div class="deploy-connection-text">
            Conectado a Vercel
          </div>
          <button class="deploy-btn deploy-btn-secondary" onclick="window.deployModal.disconnect()" style="padding: 6px 12px; font-size: 12px;">
            Desconectar
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="deploy-connection-status">
          <div class="deploy-connection-indicator disconnected"></div>
          <div class="deploy-connection-text">
            No conectado a Vercel
          </div>
          <button class="deploy-btn deploy-btn-primary" onclick="window.deployModal.showConnectForm()" style="padding: 6px 12px; font-size: 12px;">
            Conectar
          </button>
        </div>
      `;
    }
  }

  /**
   * Show connect form
   */
  showConnectForm() {
    const container = document.getElementById('deployFormContainer');
    container.innerHTML = `
      <div class="deploy-form-group">
        <label>Token de Vercel</label>
        <input type="password" id="vercelToken" placeholder="vercel_..." />
        <small>
          Obtén tu token en: 
          <a href="https://vercel.com/account/tokens" target="_blank">vercel.com/account/tokens</a>
        </small>
      </div>
      <div class="deploy-form-group">
        <label>Team ID (Opcional)</label>
        <input type="text" id="vercelTeamId" placeholder="team_..." />
        <small>Solo si despliegas en un equipo</small>
      </div>
      <button class="deploy-btn deploy-btn-primary" onclick="window.deployModal.connect()" style="width: 100%; margin-top: 12px;">
        Conectar a Vercel
      </button>
    `;
  }

  /**
   * Connect to Vercel
   */
  async connect() {
    const token = document.getElementById('vercelToken')?.value;
    const teamId = document.getElementById('vercelTeamId')?.value;

    if (!token) {
      this.showStatus('error', 'Por favor ingresa tu token de Vercel');
      return;
    }

    try {
      this.showStatus('info', 'Conectando a Vercel...');

      window.vercelDeployer.connect(token, teamId || null);

      this.showStatus('success', '¡Conectado exitosamente!');

      setTimeout(() => {
        this.updateConnectionStatus();
        this.renderForm();
      }, 1000);
    } catch (error) {
      this.showStatus('error', `Error al conectar: ${error.message}`);
    }
  }

  /**
   * Disconnect from Vercel
   */
  disconnect() {
    if (confirm('¿Estás seguro de que quieres desconectar de Vercel?')) {
      window.vercelDeployer.disconnect();
      this.updateConnectionStatus();
      this.renderForm();
    }
  }

  /**
   * Render deployment form
   */
  renderForm() {
    const container = document.getElementById('deployFormContainer');
    if (!container) return;

    const isConnected = window.vercelDeployer && window.vercelDeployer.isConnected();

    if (!isConnected) {
      this.showConnectForm();
      return;
    }

    container.innerHTML = `
      <div class="deploy-form-group">
        <label>Nombre del Proyecto</label>
        <input type="text" id="projectName" placeholder="mi-proyecto" value="${this.getDefaultProjectName()}" />
        <small>Solo letras minúsculas, números y guiones</small>
      </div>
      <div class="deploy-form-group">
        <label>Descripción (Opcional)</label>
        <textarea id="projectDescription" placeholder="Descripción de tu proyecto..."></textarea>
      </div>
    `;
  }

  /**
   * Get default project name
   */
  getDefaultProjectName() {
    const timestamp = Date.now();
    return `dragndrop-project-${timestamp}`;
  }

  /**
   * Start deployment
   */
  async startDeploy() {
    const isConnected = window.vercelDeployer && window.vercelDeployer.isConnected();

    if (!isConnected) {
      this.showStatus('error', 'Por favor conecta a Vercel primero');
      return;
    }

    const projectName = document.getElementById('projectName')?.value;

    if (!projectName) {
      this.showStatus('error', 'Por favor ingresa un nombre de proyecto');
      return;
    }

    try {
      // Get project data
      const projectData = this.getProjectData();

      // Show progress
      this.showProgress();

      // Deploy
      const result = await window.vercelDeployer.deploy(projectName, projectData);

      // Show success
      this.showSuccess(result);

      // Call callback
      if (this.onDeploy) {
        this.onDeploy(result);
      }
    } catch (error) {
      this.showStatus('error', `Error al desplegar: ${error.message}`);
      this.hideProgress();
    }
  }

  /**
   * Get project data from canvas
   */
  getProjectData() {
    // Get HTML from canvas
    const canvas = document.getElementById('canvas');
    const html = canvas ? canvas.innerHTML : '<h1>Hello World</h1>';

    // Get CSS (inline styles)
    const css = this.extractStyles();

    // Get JS (if any)
    const js = '';

    return { html, css, js };
  }

  /**
   * Extract styles from canvas elements
   */
  extractStyles() {
    let css = '* { margin: 0; padding: 0; box-sizing: border-box; }\n';
    css += 'body { font-family: system-ui, -apple-system, sans-serif; }\n';
    return css;
  }

  /**
   * Show progress
   */
  showProgress() {
    const formContainer = document.getElementById('deployFormContainer');
    const progressContainer = document.getElementById('deployProgressContainer');
    const deployButton = document.getElementById('deployButton');

    if (formContainer) formContainer.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'block';
    if (deployButton) deployButton.disabled = true;

    if (progressContainer) {
      progressContainer.innerHTML = `
        <div class="deploy-progress">
          <div class="deploy-progress-bar-container">
            <div class="deploy-progress-bar" id="deployProgressBar" style="width: 0%"></div>
          </div>
          <div class="deploy-progress-text" id="deployProgressText">Iniciando...</div>
        </div>
      `;
    }

    // Listen to deploy events
    this.setupProgressListeners();
  }

  /**
   * Setup progress listeners
   */
  setupProgressListeners() {
    window.addEventListener('deploy:progress', e => {
      const { message, progress } = e.detail;
      const progressBar = document.getElementById('deployProgressBar');
      const progressText = document.getElementById('deployProgressText');

      if (progressBar && progress) {
        progressBar.style.width = `${progress}%`;
      }

      if (progressText && message) {
        progressText.textContent = message;
      }
    });
  }

  /**
   * Hide progress
   */
  hideProgress() {
    const formContainer = document.getElementById('deployFormContainer');
    const progressContainer = document.getElementById('deployProgressContainer');
    const deployButton = document.getElementById('deployButton');

    if (formContainer) formContainer.style.display = 'block';
    if (progressContainer) progressContainer.style.display = 'none';
    if (deployButton) deployButton.disabled = false;
  }

  /**
   * Show success message
   */
  showSuccess(result) {
    const progressContainer = document.getElementById('deployProgressContainer');

    if (progressContainer) {
      progressContainer.innerHTML = `
        <div class="deploy-status success">
          <div class="deploy-status-icon">✅</div>
          <div class="deploy-status-content">
            <div class="deploy-status-title">¡Desplegado exitosamente!</div>
            <div class="deploy-status-message">
              Tu proyecto está disponible en:
              <br>
              <a href="https://${result.url}" target="_blank" style="color: inherit; font-weight: 600;">
                ${result.url}
              </a>
            </div>
          </div>
        </div>
        <button class="deploy-btn deploy-btn-primary" onclick="window.open('https://${result.url}', '_blank')" style="width: 100%; margin-top: 12px;">
          Abrir Sitio
        </button>
      `;
    }

    const deployButton = document.getElementById('deployButton');
    if (deployButton) {
      deployButton.textContent = 'Cerrar';
      deployButton.onclick = () => this.hide();
    }
  }

  /**
   * Show status message
   */
  showStatus(type, message) {
    const container = document.getElementById('deployFormContainer');
    if (!container) return;

    const existingStatus = container.querySelector('.deploy-status');
    if (existingStatus) {
      existingStatus.remove();
    }

    const status = document.createElement('div');
    status.className = `deploy-status ${type}`;
    status.innerHTML = `
      <div class="deploy-status-icon">${this.getStatusIcon(type)}</div>
      <div class="deploy-status-content">
        <div class="deploy-status-message">${message}</div>
      </div>
    `;

    container.insertBefore(status, container.firstChild);
  }

  /**
   * Get status icon
   */
  getStatusIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
    };
    return icons[type] || 'ℹ️';
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.deployModal = new DeployModal();
}

export default DeployModal;
