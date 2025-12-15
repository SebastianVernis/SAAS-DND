/**
 * Project Import Modal
 * UI for importing and analyzing projects
 * 
 * @module ProjectImportModal
 */

export class ProjectImportModal {
  constructor() {
    this.modal = null;
    this.onImport = null;
    this.onCancel = null;
  }

  /**
   * Show modal
   * @param {Function} onImport - Import callback
   * @param {Function} onCancel - Cancel callback
   */
  show(onImport, onCancel) {
    this.onImport = onImport;
    this.onCancel = onCancel;

    this.createModal();
    this.attachEventListeners();
    
    document.body.appendChild(this.modal);
    
    // Animate in
    setTimeout(() => {
      this.modal.classList.add('active');
    }, 10);
  }

  /**
   * Hide modal
   */
  hide() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
    }, 300);
  }

  /**
   * Create modal HTML
   */
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'project-import-modal';
    this.modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>📁 Import Existing Project</h2>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="import-options">
            <div class="import-option" data-type="directory">
              <div class="option-icon">📂</div>
              <h3>Import Directory</h3>
              <p>Select a project folder to analyze and import</p>
              <button class="btn-primary" id="selectDirectoryBtn">
                Select Directory
              </button>
              <input type="file" id="directoryInput" webkitdirectory multiple style="display: none;">
            </div>

            <div class="import-option" data-type="html">
              <div class="option-icon">📄</div>
              <h3>Import HTML File</h3>
              <p>Import a single HTML file for editing</p>
              <button class="btn-secondary" id="selectHTMLBtn">
                Select HTML File
              </button>
              <input type="file" id="htmlInput" accept=".html,.htm" style="display: none;">
            </div>
          </div>

          <div class="import-progress" style="display: none;">
            <div class="progress-header">
              <h3>Analyzing Project...</h3>
              <div class="progress-spinner"></div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <div class="progress-status">Initializing...</div>
            <div class="progress-details"></div>
          </div>

          <div class="import-results" style="display: none;">
            <div class="results-header">
              <h3>✅ Project Analyzed Successfully</h3>
            </div>
            <div class="results-summary"></div>
            <div class="results-actions">
              <button class="btn-primary" id="loadProjectBtn">
                Load into Editor
              </button>
              <button class="btn-secondary" id="cancelImportBtn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.handleCancel());

    // Overlay click
    const overlay = this.modal.querySelector('.modal-overlay');
    overlay.addEventListener('click', () => this.handleCancel());

    // Directory selection
    const selectDirBtn = this.modal.querySelector('#selectDirectoryBtn');
    const dirInput = this.modal.querySelector('#directoryInput');
    
    selectDirBtn.addEventListener('click', () => dirInput.click());
    dirInput.addEventListener('change', (e) => this.handleDirectorySelect(e));

    // HTML file selection
    const selectHTMLBtn = this.modal.querySelector('#selectHTMLBtn');
    const htmlInput = this.modal.querySelector('#htmlInput');
    
    selectHTMLBtn.addEventListener('click', () => htmlInput.click());
    htmlInput.addEventListener('change', (e) => this.handleHTMLSelect(e));

    // Load project button
    const loadBtn = this.modal.querySelector('#loadProjectBtn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.handleLoadProject());
    }

    // Cancel import button
    const cancelBtn = this.modal.querySelector('#cancelImportBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
    }
  }

  /**
   * Handle directory selection
   * @param {Event} event - Change event
   */
  async handleDirectorySelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.showProgress();
    
    try {
      await this.analyzeFiles(files, 'directory');
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Handle HTML file selection
   * @param {Event} event - Change event
   */
  async handleHTMLSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.showProgress();
    
    try {
      await this.analyzeFiles(files, 'html');
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Analyze files
   * @param {FileList} files - Files to analyze
   * @param {string} type - Import type
   */
  async analyzeFiles(files, type) {
    this.updateProgress(10, 'Reading files...');

    // Simulate analysis steps
    await this.delay(500);
    this.updateProgress(30, 'Detecting framework...');

    await this.delay(500);
    this.updateProgress(50, 'Parsing components...');

    await this.delay(500);
    this.updateProgress(70, 'Extracting styles...');

    await this.delay(500);
    this.updateProgress(90, 'Loading assets...');

    await this.delay(500);
    this.updateProgress(100, 'Analysis complete!');

    // Store files for import
    this.pendingFiles = files;
    this.importType = type;

    // Show results
    await this.delay(500);
    this.showResults(files, type);
  }

  /**
   * Show progress
   */
  showProgress() {
    const options = this.modal.querySelector('.import-options');
    const progress = this.modal.querySelector('.import-progress');
    
    options.style.display = 'none';
    progress.style.display = 'block';
  }

  /**
   * Update progress
   * @param {number} percent - Progress percentage
   * @param {string} status - Status message
   */
  updateProgress(percent, status) {
    const fill = this.modal.querySelector('.progress-fill');
    const statusEl = this.modal.querySelector('.progress-status');
    
    fill.style.width = `${percent}%`;
    statusEl.textContent = status;
  }

  /**
   * Show results
   * @param {FileList} files - Analyzed files
   * @param {string} type - Import type
   */
  showResults(files, type) {
    const progress = this.modal.querySelector('.import-progress');
    const results = this.modal.querySelector('.import-results');
    const summary = this.modal.querySelector('.results-summary');
    
    progress.style.display = 'none';
    results.style.display = 'block';

    // Generate summary
    const fileCount = files.length;
    const htmlFiles = Array.from(files).filter(f => f.name.endsWith('.html') || f.name.endsWith('.htm')).length;
    const cssFiles = Array.from(files).filter(f => f.name.endsWith('.css')).length;
    const jsFiles = Array.from(files).filter(f => f.name.endsWith('.js')).length;

    summary.innerHTML = `
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Total Files</div>
          <div class="summary-value">${fileCount}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">HTML Files</div>
          <div class="summary-value">${htmlFiles}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">CSS Files</div>
          <div class="summary-value">${cssFiles}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">JS Files</div>
          <div class="summary-value">${jsFiles}</div>
        </div>
      </div>
      <div class="summary-note">
        <strong>Framework:</strong> ${type === 'html' ? 'Plain HTML' : 'Detecting...'}
      </div>
    `;
  }

  /**
   * Show error
   * @param {string} message - Error message
   */
  showError(message) {
    const progress = this.modal.querySelector('.import-progress');
    const results = this.modal.querySelector('.import-results');
    
    progress.style.display = 'none';
    results.style.display = 'block';

    const summary = this.modal.querySelector('.results-summary');
    summary.innerHTML = `
      <div class="error-message">
        <div class="error-icon">❌</div>
        <h3>Import Failed</h3>
        <p>${message}</p>
      </div>
    `;

    const loadBtn = this.modal.querySelector('#loadProjectBtn');
    if (loadBtn) {
      loadBtn.style.display = 'none';
    }
  }

  /**
   * Handle load project
   */
  handleLoadProject() {
    if (this.onImport && this.pendingFiles) {
      this.onImport(this.pendingFiles, this.importType);
    }
    this.hide();
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.hide();
  }

  /**
   * Delay helper
   * @param {number} ms - Milliseconds
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
