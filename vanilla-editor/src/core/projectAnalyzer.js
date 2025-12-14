/**
 * Project Analyzer - v1.0
 *
 * Analiza y mapea proyectos JS/HTML completos usando Gemini API.
 * Carga directorios completos y genera un árbol de estructura.
 */

class ProjectAnalyzer {
  constructor() {
    this.geminiValidator = null;
    this.currentProject = null;
    this.fileTree = null;
    this.analysisCache = new Map();
    this.supportedExtensions = ['.html', '.htm', '.js', '.jsx', '.css', '.scss', '.sass', '.json'];
    this.maxFileSize = 500 * 1024; // 500KB por archivo

    this.init();
  }

  /**
   * Inicializa el analizador
   */
  init() {
    // Esperar a que GeminiValidator esté disponible
    if (window.GeminiSyntaxValidator) {
      this.geminiValidator = new window.GeminiSyntaxValidator();
    }

    console.log('✅ ProjectAnalyzer inicializado');
  }

  /**
   * Carga y analiza un directorio completo
   */
  async loadDirectory(fileList) {
    try {
      if (!fileList || fileList.length === 0) {
        throw new Error('No se seleccionaron archivos');
      }

      this.showLoadingModal('Analizando proyecto...');

      // Construir árbol de archivos
      this.fileTree = await this.buildFileTree(fileList);

      // Analizar estructura
      const structure = await this.analyzeProjectStructure(this.fileTree);

      // Identificar archivos principales
      const mainFiles = this.identifyMainFiles(this.fileTree);

      // Construir proyecto
      this.currentProject = {
        name: this.extractProjectName(this.fileTree),
        tree: this.fileTree,
        structure,
        mainFiles,
        totalFiles: fileList.length,
        timestamp: Date.now(),
      };

      this.hideLoadingModal();

      // Mostrar modal de resultados
      this.showAnalysisResults(this.currentProject);

      return this.currentProject;
    } catch (error) {
      this.hideLoadingModal();
      console.error('Error analizando proyecto:', error);

      if (window.showToast) {
        window.showToast(`❌ Error: ${error.message}`, 'error');
      }

      throw error;
    }
  }

  /**
   * Construye árbol de archivos desde FileList
   */
  async buildFileTree(fileList) {
    const tree = {
      name: 'root',
      type: 'directory',
      children: new Map(),
      files: [],
    };

    for (const file of fileList) {
      // Verificar extensión
      const ext = this.getFileExtension(file.name);
      if (!this.supportedExtensions.includes(ext)) {
        continue;
      }

      // Verificar tamaño
      if (file.size > this.maxFileSize) {
        console.warn(`Archivo muy grande, ignorando: ${file.name}`);
        continue;
      }

      // Leer contenido
      const content = await this.readFileContent(file);

      // Parsear ruta
      const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [file.name];

      // Insertar en árbol
      this.insertIntoTree(tree, pathParts, {
        name: file.name,
        path: file.webkitRelativePath || file.name,
        type: 'file',
        extension: ext,
        size: file.size,
        content,
        lastModified: file.lastModified,
      });
    }

    return tree;
  }

  /**
   * Inserta archivo en el árbol
   */
  insertIntoTree(node, pathParts, fileData) {
    if (pathParts.length === 1) {
      // Es un archivo en este nivel
      node.files.push(fileData);
      return;
    }

    // Es un directorio
    const dirName = pathParts[0];

    if (!node.children.has(dirName)) {
      node.children.set(dirName, {
        name: dirName,
        type: 'directory',
        children: new Map(),
        files: [],
      });
    }

    this.insertIntoTree(node.children.get(dirName), pathParts.slice(1), fileData);
  }

  /**
   * Lee contenido de archivo
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Error leyendo archivo'));

      reader.readAsText(file);
    });
  }

  /**
   * Analiza estructura del proyecto
   */
  async analyzeProjectStructure(tree) {
    const structure = {
      hasPackageJson: false,
      hasIndexHtml: false,
      framework: 'vanilla',
      buildTool: null,
      dependencies: [],
      scripts: {},
      directories: {
        src: false,
        public: false,
        dist: false,
        components: false,
        assets: false,
      },
    };

    // Buscar archivos clave
    const allFiles = this.flattenTree(tree);

    for (const file of allFiles) {
      const fileName = file.name.toLowerCase();

      // package.json
      if (fileName === 'package.json') {
        structure.hasPackageJson = true;
        try {
          const pkg = JSON.parse(file.content);
          structure.dependencies = Object.keys(pkg.dependencies || {});
          structure.scripts = pkg.scripts || {};
          structure.framework = this.detectFramework(pkg);
          structure.buildTool = this.detectBuildTool(pkg);
        } catch (e) {
          console.warn('Error parseando package.json');
        }
      }

      // index.html
      if (fileName === 'index.html' || fileName === 'index.htm') {
        structure.hasIndexHtml = true;
      }
    }

    // Detectar directorios comunes
    this.detectCommonDirectories(tree, structure.directories);

    return structure;
  }

  /**
   * Detecta framework usado
   */
  detectFramework(packageJson) {
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (deps['react']) return 'react';
    if (deps['vue']) return 'vue';
    if (deps['@angular/core']) return 'angular';
    if (deps['svelte']) return 'svelte';
    if (deps['next']) return 'next';
    if (deps['nuxt']) return 'nuxt';

    return 'vanilla';
  }

  /**
   * Detecta build tool
   */
  detectBuildTool(packageJson) {
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (deps['vite']) return 'vite';
    if (deps['webpack']) return 'webpack';
    if (deps['rollup']) return 'rollup';
    if (deps['parcel']) return 'parcel';
    if (deps['esbuild']) return 'esbuild';

    return null;
  }

  /**
   * Detecta directorios comunes
   */
  detectCommonDirectories(node, directories) {
    const dirName = node.name.toLowerCase();

    if (dirName === 'src') directories.src = true;
    if (dirName === 'public') directories.public = true;
    if (dirName === 'dist' || dirName === 'build') directories.dist = true;
    if (dirName === 'components') directories.components = true;
    if (dirName === 'assets' || dirName === 'static') directories.assets = true;

    // Recursivo
    for (const child of node.children.values()) {
      this.detectCommonDirectories(child, directories);
    }
  }

  /**
   * Identifica archivos principales
   */
  identifyMainFiles(tree) {
    const allFiles = this.flattenTree(tree);
    const mainFiles = {
      html: [],
      entry: [],
      config: [],
    };

    for (const file of allFiles) {
      const fileName = file.name.toLowerCase();
      const ext = file.extension;

      // HTML principales
      if (
        (ext === '.html' || ext === '.htm') &&
        (fileName === 'index.html' || fileName === 'index.htm' || fileName.includes('main'))
      ) {
        mainFiles.html.push(file);
      }

      // Entry points JS
      if (
        (ext === '.js' || ext === '.jsx') &&
        (fileName === 'index.js' ||
          fileName === 'main.js' ||
          fileName === 'app.js' ||
          fileName.includes('entry'))
      ) {
        mainFiles.entry.push(file);
      }

      // Configs
      if (
        fileName === 'package.json' ||
        fileName === 'vite.config.js' ||
        fileName === 'webpack.config.js' ||
        fileName === 'tsconfig.json'
      ) {
        mainFiles.config.push(file);
      }
    }

    return mainFiles;
  }

  /**
   * Aplana árbol de archivos
   */
  flattenTree(node, result = []) {
    // Agregar archivos de este nivel
    if (node.files) {
      result.push(...node.files);
    }

    // Recursivo en hijos
    if (node.children) {
      for (const child of node.children.values()) {
        this.flattenTree(child, result);
      }
    }

    return result;
  }

  /**
   * Extrae nombre del proyecto
   */
  extractProjectName(tree) {
    // Buscar en package.json
    const allFiles = this.flattenTree(tree);
    const pkgFile = allFiles.find(f => f.name === 'package.json');

    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        if (pkg.name) return pkg.name;
      } catch (e) {}
    }

    // Usar nombre del primer directorio
    if (tree.children.size > 0) {
      return Array.from(tree.children.keys())[0];
    }

    return 'Proyecto sin nombre';
  }

  /**
   * Importa archivos HTML al canvas
   */
  async importHTMLFiles(htmlFiles) {
    if (!htmlFiles || htmlFiles.length === 0) {
      throw new Error('No hay archivos HTML para importar');
    }

    // Usar el primer HTML encontrado
    const mainHTML = htmlFiles[0];

    // Parsear y cargar en canvas
    if (window.htmlParser) {
      const parsed = window.htmlParser.parse(mainHTML.content);
      this.loadParsedHTMLToCanvas(parsed);

      if (window.showToast) {
        window.showToast(`✅ ${mainHTML.name} importado correctamente`);
      }
    } else {
      // Fallback: cargar HTML directo
      const canvas = document.getElementById('canvas');
      if (canvas) {
        // Extraer body content
        const bodyMatch = mainHTML.content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : mainHTML.content;

        canvas.innerHTML = bodyContent;

        // Reaplicar eventos a elementos
        if (window.setupElementsEvents) {
          window.setupElementsEvents();
        }
      }
    }
  }

  /**
   * Carga HTML parseado al canvas
   */
  loadParsedHTMLToCanvas(parsedData) {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    canvas.innerHTML = parsedData.html;

    // Reaplicar eventos
    if (window.setupElementsEvents) {
      window.setupElementsEvents();
    }
  }

  /**
   * Obtiene extensión de archivo
   */
  getFileExtension(fileName) {
    const parts = fileName.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Muestra modal de carga
   */
  showLoadingModal(message) {
    let modal = document.getElementById('project-loading-modal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'project-loading-modal';
      modal.className = 'project-analysis-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="loading-spinner"></div>
                <h3>${message}</h3>
                <p>Esto puede tomar unos segundos...</p>
            </div>
        `;

    modal.style.display = 'flex';
  }

  /**
   * Oculta modal de carga
   */
  hideLoadingModal() {
    const modal = document.getElementById('project-loading-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Muestra resultados del análisis
   */
  showAnalysisResults(project) {
    const modal = document.createElement('div');
    modal.className = 'project-analysis-modal';

    const treeHTML = this.renderFileTree(project.tree);

    modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content analysis-results">
                <div class="modal-header">
                    <h3>📊 Análisis del Proyecto</h3>
                    <button class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="project-info">
                        <h4>${project.name}</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Archivos:</span>
                                <span class="info-value">${project.totalFiles}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Framework:</span>
                                <span class="info-value">${project.structure.framework}</span>
                            </div>
                            ${
                              project.structure.buildTool
                                ? `
                            <div class="info-item">
                                <span class="info-label">Build Tool:</span>
                                <span class="info-value">${project.structure.buildTool}</span>
                            </div>
                            `
                                : ''
                            }
                        </div>
                    </div>

                    <div class="file-tree-container">
                        <h4>📁 Estructura de Archivos</h4>
                        <div class="file-tree">
                            ${treeHTML}
                        </div>
                    </div>

                    ${
                      project.mainFiles.html.length > 0
                        ? `
                    <div class="main-files">
                        <h4>📄 Archivos HTML Encontrados</h4>
                        <ul class="files-list">
                            ${project.mainFiles.html
                              .map(
                                f => `
                                <li>
                                    <span class="file-icon">📄</span>
                                    <span class="file-name">${f.name}</span>
                                    <span class="file-path">${f.path}</span>
                                </li>
                            `
                              )
                              .join('')}
                        </ul>
                    </div>
                    `
                        : ''
                    }
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                    ${
                      project.mainFiles.html.length > 0
                        ? `
                    <button class="btn btn-primary" data-action="import">
                        Importar HTML Principal
                    </button>
                    `
                        : ''
                    }
                </div>
            </div>
        `;

    // Eventos
    modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());

    const importBtn = modal.querySelector('[data-action="import"]');
    if (importBtn) {
      importBtn.addEventListener('click', async () => {
        try {
          await this.importHTMLFiles(project.mainFiles.html);
          modal.remove();
        } catch (error) {
          alert(`Error importando: ${error.message}`);
        }
      });
    }

    document.body.appendChild(modal);
  }

  /**
   * Renderiza árbol de archivos como HTML
   */
  renderFileTree(node, level = 0) {
    let html = '';

    // Renderizar archivos
    if (node.files && node.files.length > 0) {
      for (const file of node.files) {
        const icon = this.getFileIcon(file.extension);
        html += `
                    <div class="tree-item file" style="padding-left: ${level * 20}px;">
                        <span class="tree-icon">${icon}</span>
                        <span class="tree-name">${file.name}</span>
                        <span class="tree-size">${this.formatFileSize(file.size)}</span>
                    </div>
                `;
      }
    }

    // Renderizar directorios
    if (node.children && node.children.size > 0) {
      for (const [name, child] of node.children.entries()) {
        html += `
                    <div class="tree-item directory" style="padding-left: ${level * 20}px;">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">${name}/</span>
                    </div>
                `;
        html += this.renderFileTree(child, level + 1);
      }
    }

    return html;
  }

  /**
   * Obtiene ícono según extensión
   */
  getFileIcon(ext) {
    const icons = {
      '.html': '📄',
      '.htm': '📄',
      '.js': '📜',
      '.jsx': '⚛️',
      '.css': '🎨',
      '.scss': '🎨',
      '.sass': '🎨',
      '.json': '📋',
      '.md': '📝',
    };

    return icons[ext] || '📄';
  }

  /**
   * Formatea tamaño de archivo
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Estilos
const analyzerStyles = document.createElement('style');
analyzerStyles.textContent = `
    .project-analysis-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 3000;
        display: none;
        align-items: center;
        justify-content: center;
    }

    .project-analysis-modal .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
    }

    .project-analysis-modal .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 800px;
        max-height: 85vh;
        position: relative;
        z-index: 10;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
    }

    .project-analysis-modal .modal-content.analysis-results {
        max-width: 900px;
    }

    .project-analysis-modal .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .project-analysis-modal .modal-header h3 {
        margin: 0;
        font-size: 18px;
        color: #1e293b;
    }

    .project-analysis-modal .modal-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
    }

    .project-analysis-modal .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
    }

    .project-analysis-modal .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .project-analysis-modal .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .project-info h4 {
        margin: 0 0 16px 0;
        color: #1e293b;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
    }

    .info-item {
        background: #f8fafc;
        padding: 12px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .info-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
    }

    .info-value {
        font-size: 16px;
        color: #1e293b;
        font-weight: 600;
    }

    .file-tree-container {
        margin: 24px 0;
    }

    .file-tree-container h4 {
        margin: 0 0 12px 0;
        color: #1e293b;
    }

    .file-tree {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px;
        max-height: 300px;
        overflow-y: auto;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
    }

    .tree-item {
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .tree-item:hover {
        background: #e2e8f0;
    }

    .tree-item.directory {
        font-weight: 600;
        color: #475569;
    }

    .tree-item.file {
        color: #64748b;
    }

    .tree-icon {
        font-size: 14px;
        flex-shrink: 0;
    }

    .tree-name {
        flex: 1;
    }

    .tree-size {
        font-size: 11px;
        color: #94a3b8;
    }

    .main-files {
        margin-top: 24px;
    }

    .main-files h4 {
        margin: 0 0 12px 0;
        color: #1e293b;
    }

    .files-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .files-list li {
        padding: 10px 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .file-icon {
        font-size: 18px;
    }

    .file-name {
        font-weight: 600;
        color: #1e293b;
    }

    .file-path {
        font-size: 12px;
        color: #64748b;
        margin-left: auto;
    }
`;

document.head.appendChild(analyzerStyles);

// Exportar globalmente
window.ProjectAnalyzer = ProjectAnalyzer;

export default ProjectAnalyzer;
