/**
 * ProjectManager - Gestiona proyectos, persistencia y historial
 */
class ProjectManager {
  constructor() {
    this.storageKey = 'dragndrop_projects';
    this.currentProjectKey = 'dragndrop_current_project';
    this.autoSaveInterval = 30000; // 30 segundos
    this.autoSaveTimer = null;
    this.currentProject = null;

    this.init();
  }

  /**
   * Inicializa el gestor de proyectos
   */
  init() {
    this.loadCurrentProject();
    this.startAutoSave();
    this.setupEventListeners();
  }

  /**
   * Crea un nuevo proyecto
   */
  createNewProject(name = null) {
    const projectName = name || `Proyecto ${new Date().toLocaleDateString()}`;

    this.currentProject = {
      id: this.generateId(),
      name: projectName,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      html: '',
      version: 1,
      thumbnail: null,
    };

    this.saveCurrentProject();
    this.showSuccess(`Nuevo proyecto "${projectName}" creado`);

    return this.currentProject;
  }

  /**
   * Guarda el proyecto actual
   */
  saveCurrentProject() {
    if (!this.currentProject) {
      this.createNewProject();
    }

    // Capturar contenido actual del canvas
    const canvas = document.getElementById('canvas');
    if (canvas) {
      this.currentProject.html = canvas.innerHTML;
      this.currentProject.modified = new Date().toISOString();

      // Generar thumbnail
      this.generateThumbnail().then(thumbnail => {
        this.currentProject.thumbnail = thumbnail;
        this.saveToStorage();
      });
    }

    // Guardar en localStorage como proyecto actual
    localStorage.setItem(this.currentProjectKey, JSON.stringify(this.currentProject));
  }

  /**
   * Guarda proyecto en el historial
   */
  saveToStorage() {
    const projects = this.getStoredProjects();

    // Buscar si ya existe el proyecto
    const existingIndex = projects.findIndex(p => p.id === this.currentProject.id);

    if (existingIndex >= 0) {
      // Actualizar proyecto existente
      projects[existingIndex] = { ...this.currentProject };
    } else {
      // Agregar nuevo proyecto
      projects.unshift(this.currentProject);
    }

    // Limitar a 20 proyectos máximo
    if (projects.length > 20) {
      projects.splice(20);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }

  /**
   * Carga el proyecto actual desde localStorage
   */
  loadCurrentProject() {
    try {
      const stored = localStorage.getItem(this.currentProjectKey);
      if (stored) {
        this.currentProject = JSON.parse(stored);
        this.loadProjectToCanvas(this.currentProject);
        this.showSuccess(`Proyecto "${this.currentProject.name}" restaurado`);
      }
    } catch (error) {
      console.error('Error al cargar proyecto actual:', error);
    }
  }

  /**
   * Carga un proyecto específico
   */
  loadProject(projectId) {
    const projects = this.getStoredProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
      this.currentProject = { ...project };
      this.loadProjectToCanvas(project);
      this.saveCurrentProject(); // Actualizar como proyecto actual
      this.showSuccess(`Proyecto "${project.name}" cargado`);
      return true;
    }

    this.showError('Proyecto no encontrado');
    return false;
  }

  /**
   * Carga proyecto al canvas
   */
  loadProjectToCanvas(project) {
    const canvas = document.getElementById('canvas');
    if (canvas && project.html) {
      canvas.innerHTML = project.html;

      // Re-aplicar eventos a los elementos cargados
      this.reapplyEditorEvents();
    }
  }

  /**
   * Re-aplica eventos del editor a elementos cargados
   */
  reapplyEditorEvents() {
    const elements = document.querySelectorAll('.canvas-element');
    elements.forEach(element => {
      // Limpiar eventos existentes
      element.replaceWith(element.cloneNode(true));
      const newElement = document.querySelector(`#${element.id}`);

      // Aplicar eventos del editor
      newElement.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.selectElement) {
          window.selectElement(newElement);
        }
      });

      newElement.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        if (window.makeElementEditable) {
          window.makeElementEditable(newElement);
        }
      });

      // Re-aplicar botón de eliminar
      const deleteBtn = newElement.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.onclick = function (e) {
          e.stopPropagation();
          if (window.deleteElement) {
            window.deleteElement(newElement);
          }
        };
      }
    });
  }

  /**
   * Obtiene todos los proyectos guardados
   */
  getStoredProjects() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      return [];
    }
  }

  /**
   * Elimina un proyecto
   */
  deleteProject(projectId) {
    const projects = this.getStoredProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);

    localStorage.setItem(this.storageKey, JSON.stringify(filteredProjects));

    // Si es el proyecto actual, crear uno nuevo
    if (this.currentProject && this.currentProject.id === projectId) {
      this.createNewProject();
    }

    this.showSuccess('Proyecto eliminado');
  }

  /**
   * Duplica un proyecto
   */
  duplicateProject(projectId) {
    const projects = this.getStoredProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
      const duplicated = {
        ...project,
        id: this.generateId(),
        name: `${project.name} (Copia)`,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };

      projects.unshift(duplicated);
      localStorage.setItem(this.storageKey, JSON.stringify(projects));

      this.showSuccess(`Proyecto duplicado: "${duplicated.name}"`);
      return duplicated;
    }

    return null;
  }

  /**
   * Renombra un proyecto
   */
  renameProject(projectId, newName) {
    const projects = this.getStoredProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
      project.name = newName;
      project.modified = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(projects));

      // Actualizar proyecto actual si es el mismo
      if (this.currentProject && this.currentProject.id === projectId) {
        this.currentProject.name = newName;
        this.saveCurrentProject();
      }

      this.showSuccess(`Proyecto renombrado a "${newName}"`);
      return true;
    }

    return false;
  }

  /**
   * Exporta proyecto como JSON
   */
  exportProject(projectId = null) {
    const project = projectId
      ? this.getStoredProjects().find(p => p.id === projectId)
      : this.currentProject;

    if (project) {
      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.showSuccess(`Proyecto "${project.name}" exportado`);
    }
  }

  /**
   * Importa proyecto desde JSON
   */
  async importProject(file) {
    try {
      const content = await this.readFileAsText(file);
      const project = JSON.parse(content);

      // Validar estructura del proyecto
      if (!project.id || !project.name || !project.html) {
        throw new Error('Formato de proyecto inválido');
      }

      // Asignar nuevo ID para evitar conflictos
      project.id = this.generateId();
      project.name = `${project.name} (Importado)`;
      project.modified = new Date().toISOString();

      // Guardar proyecto
      const projects = this.getStoredProjects();
      projects.unshift(project);
      localStorage.setItem(this.storageKey, JSON.stringify(projects));

      this.showSuccess(`Proyecto "${project.name}" importado`);
      return project;
    } catch (error) {
      this.showError(`Error al importar proyecto: ${error.message}`);
      return null;
    }
  }

  /**
   * Inicia auto-guardado
   */
  startAutoSave() {
    this.stopAutoSave(); // Limpiar timer existente

    this.autoSaveTimer = setInterval(() => {
      if (this.currentProject) {
        this.saveCurrentProject();
        console.log('Auto-guardado realizado');
      }
    }, this.autoSaveInterval);
  }

  /**
   * Detiene auto-guardado
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Guardar antes de cerrar la ventana
    window.addEventListener('beforeunload', () => {
      this.saveCurrentProject();
    });

    // Detectar cambios en el canvas para auto-guardado
    const canvas = document.getElementById('canvas');
    if (canvas) {
      const observer = new MutationObserver(() => {
        if (this.currentProject) {
          // Marcar como modificado
          this.currentProject.modified = new Date().toISOString();
        }
      });

      observer.observe(canvas, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
  }

  /**
   * Genera thumbnail del proyecto
   */
  async generateThumbnail() {
    try {
      const canvas = document.getElementById('canvas');
      if (!canvas) return null;

      // Usar html2canvas si está disponible, sino retornar null
      if (typeof html2canvas !== 'undefined') {
        const canvasElement = await html2canvas(canvas, {
          width: 300,
          height: 200,
          scale: 0.3,
        });
        return canvasElement.toDataURL('image/jpeg', 0.7);
      }

      return null;
    } catch (error) {
      console.error('Error generando thumbnail:', error);
      return null;
    }
  }

  /**
   * Genera ID único
   */
  generateId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Lee archivo como texto
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Error al leer archivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Obtiene información del proyecto actual
   */
  getCurrentProjectInfo() {
    return this.currentProject ? { ...this.currentProject } : null;
  }

  /**
   * Obtiene estadísticas de proyectos
   */
  getProjectStats() {
    const projects = this.getStoredProjects();
    return {
      total: projects.length,
      current: this.currentProject ? this.currentProject.name : 'Sin proyecto',
      lastModified: projects.length > 0 ? projects[0].modified : null,
    };
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccess(message) {
    if (window.showToast) {
      window.showToast(message);
    } else {
      console.log('SUCCESS:', message);
    }
  }

  /**
   * Muestra mensaje de error
   */
  showError(message) {
    if (window.showToast) {
      window.showToast(message);
    } else {
      console.error('ERROR:', message);
    }
  }
}

window.ProjectManager = ProjectManager;
