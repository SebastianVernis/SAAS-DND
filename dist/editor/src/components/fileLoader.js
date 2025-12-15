/**
 * FileLoader - Maneja la carga de archivos HTML, CSS, JS e imágenes
 */
class FileLoader {
  constructor() {
    this.supportedTypes = {
      html: ['text/html', '.html', '.htm'],
      css: ['text/css', '.css'],
      js: ['text/javascript', 'application/javascript', '.js'],
      images: [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.svg',
      ],
    };
    this.setupDropZone();
  }

  /**
   * Configura la zona de drop para archivos
   */
  setupDropZone() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      throw new Error("Element with id 'canvas' not found.");
    }

    // Prevenir comportamiento por defecto del navegador
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      canvas.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });

    // Resaltar zona de drop
    ['dragenter', 'dragover'].forEach(eventName => {
      canvas.addEventListener(eventName, this.highlight.bind(this), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      canvas.addEventListener(eventName, this.unhighlight.bind(this), false);
    });

    // Manejar archivos soltados
    canvas.addEventListener('drop', this.handleDrop.bind(this), false);
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(e) {
    const canvas = document.getElementById('canvas');
    canvas.classList.add('file-drop-zone');
  }

  unhighlight(e) {
    const canvas = document.getElementById('canvas');
    canvas.classList.remove('file-drop-zone');
  }

  /**
   * Maneja archivos soltados en el canvas
   */
  async handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      await this.processFiles(files);
    }
  }

  /**
   * Procesa múltiples archivos
   */
  async processFiles(files) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      await this.processFile(file);
    }
  }

  /**
   * Procesa un archivo individual
   */
  async processFile(file) {
    // Validación de tamaño de archivo para prevenir ataques
    const MAX_FILE_SIZE_MB = 10; // 10 MB
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.showError(`El archivo ${file.name} es demasiado grande. Máximo ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    const fileType = this.getFileType(file);

    try {
      // Función de sanitización de contenido para prevenir XSS
      const sanitizeContent = (content) => {
        return content
          .replace(/<script.*?>.*?<\/script>/gim, '') // Eliminar scripts
          .replace(/on\w+=".*?"/gim, '') // Eliminar manejadores de eventos inline
          .replace(/<iframe.*?>.*?<\/iframe>/gim, ''); // Eliminar iframes
      };

      switch (fileType) {
        case 'html':
          await this.loadHTMLFile(file, sanitizeContent);
          break;
        case 'css':
          await this.loadCSSFile(file, sanitizeContent);
          break;
        case 'js':
          await this.loadJSFile(file, sanitizeContent);
          break;
        case 'images':
          await this.loadImageFile(file);
          break;
        default:
          this.showError(`Tipo de archivo no soportado: ${file.name}`);
      }
    } catch (error) {
      console.error('[FileLoader Error]', error);
      this.showError(`Error al cargar ${file.name}: ${error.message}`);
    }
  }

  /**
   * Determina el tipo de archivo con validaciones estrictas
   */
  getFileType(file) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Validaciones adicionales de seguridad
    if (!this.isValidFileName(file.name)) {
      console.warn(`[Archivo Inseguro] Nombre inválido: ${file.name}`);
      return null;
    }

    // Lista de tipos permitidos con validaciones adicionales
    const strictTypes = {
      html: {
        mimeTypes: ['text/html', 'text/plain'],
        extensions: ['.html', '.htm']
      },
      css: {
        mimeTypes: ['text/css', 'text/plain'],
        extensions: ['.css']
      },
      js: {
        mimeTypes: ['text/javascript', 'application/javascript', 'text/plain'],
        extensions: ['.js']
      },
      images: {
        mimeTypes: [
          'image/png', 
          'image/jpeg', 
          'image/gif', 
          'image/webp', 
          'image/svg+xml'
        ],
        extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
      }
    };

    for (const [type, typeConfig] of Object.entries(strictTypes)) {
      // Validación de tipo MIME
      const mimeValid = typeConfig.mimeTypes.includes(fileType);
      
      // Validación de extensión
      const extensionValid = typeConfig.extensions.some(ext => fileName.endsWith(ext));

      if (mimeValid || extensionValid) {
        return type;
      }
    }

    return null;
  }

  /**
   * Carga archivo HTML con validaciones adicionales
   */
  async loadHTMLFile(file, sanitizeContent) {
    try {
      const content = await this.readFileAsText(file);

      // Validación de longitud del contenido
      if (content.length > 1024 * 1024) { // 1 MB
        this.showError(`El archivo HTML es demasiado grande. Máximo 1 MB`);
        return;
      }

      // Sanitización de contenido
      const sanitizedContent = sanitizeContent ? sanitizeContent(content) : content;

      // Mostrar preview antes de cargar
      const shouldLoad = await this.showHTMLPreview(sanitizedContent, file.name);

      if (shouldLoad) {
        const htmlParser = new HTMLParser();
        await htmlParser.parseAndLoad(sanitizedContent);

        // Extraer componentes automáticamente
        if (window.componentExtractor) {
          const extractedComponents = window.componentExtractor.extractComponents(sanitizedContent);
          if (extractedComponents.length > 0) {
            const saved = window.componentExtractor.saveExtractedComponents();
            this.showSuccess(
              `Archivo HTML "${file.name}" cargado correctamente. ${saved} componentes extraídos.`
            );
          } else {
            this.showSuccess(`Archivo HTML "${file.name}" cargado correctamente`);
          }
        } else {
          this.showSuccess(`Archivo HTML "${file.name}" cargado correctamente`);
        }
      }
    } catch (error) {
      console.error('[HTML Loading Error]', error);
      this.showError(`Error al procesar ${file.name}: ${error.message}`);
    }
  }

  /**
   * Carga archivo CSS
   */
  async loadCSSFile(file, sanitizeContent) {
    const content = await this.readFileAsText(file);

    // Sanitizar contenido CSS para prevenir inyección
    const sanitizedContent = sanitizeContent ? sanitizeContent(content) : content;

    // Validar longitud máxima de archivo CSS
    if (sanitizedContent.length > 100 * 1024) { // 100 KB
      this.showError(`El archivo CSS es demasiado grande. Máximo 100 KB`);
      return;
    }

    // Aplicar estilos CSS al documento
    const styleElement = document.createElement('style');
    styleElement.textContent = sanitizedContent;
    styleElement.setAttribute('data-source', file.name);
    styleElement.setAttribute('data-sanitized', 'true');
    document.head.appendChild(styleElement);

    this.showSuccess(`Estilos CSS de "${file.name}" aplicados`);
  }

  /**
   * Carga archivo JavaScript
   */
  async loadJSFile(file, sanitizeContent) {
    const content = await this.readFileAsText(file);

    // Validar longitud máxima de archivo JavaScript
    if (content.length > 100 * 1024) { // 100 KB
      this.showError(`El archivo JavaScript es demasiado grande. Máximo 100 KB`);
      return;
    }

    // Sanitizar contenido JavaScript
    const sanitizedContent = sanitizeContent ? sanitizeContent(content) : content;

    // Mostrar advertencia antes de ejecutar JavaScript
    const shouldExecute = confirm(
      `¿Deseas ejecutar el código JavaScript de "${file.name}"?\n\n` +
        'ADVERTENCIA: Solo ejecuta código de fuentes confiables. El código será sanitizado.'
    );

    if (shouldExecute) {
      try {
        // Crear script element con restricciones de seguridad
        const scriptElement = document.createElement('script');
        scriptElement.textContent = sanitizedContent;
        scriptElement.setAttribute('data-source', file.name);
        scriptElement.setAttribute('data-sanitized', 'true');
        scriptElement.setAttribute('nonce', this.generateNonce()); // Añadir nonce para CSP
        document.head.appendChild(scriptElement);

        this.showSuccess(`JavaScript de "${file.name}" ejecutado`);
      } catch (error) {
        console.error('[JavaScript Loading Error]', error);
        this.showError(`Error al ejecutar JavaScript: ${error.message}`);
      }
    }
  }

  /**
   * Carga archivo de imagen
   */
  async loadImageFile(file) {
    const imageUrl = await this.readFileAsDataURL(file);

    // Crear elemento de imagen en el canvas
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = file.name;
    imgElement.style.maxWidth = '100%';
    imgElement.style.height = 'auto';

    // Aplicar clases y eventos del editor
    imgElement.id = 'element-' + window.elementIdCounter++;
    imgElement.classList.add('canvas-element');
    imgElement.setAttribute('data-component-type', 'img');

    // Agregar botón de eliminar
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = function (e) {
      e.stopPropagation();
      window.deleteElement(imgElement);
    };
    imgElement.appendChild(deleteBtn);

    // Eventos
    imgElement.addEventListener('click', function (e) {
      e.stopPropagation();
      window.selectElement(imgElement);
    });

    imgElement.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      window.makeElementEditable(imgElement);
    });

    // Agregar al canvas
    document.getElementById('canvas').appendChild(imgElement);

    this.showSuccess(`Imagen "${file.name}" agregada al canvas`);
  }

  /**
   * Muestra preview del HTML antes de cargar
   */
  async showHTMLPreview(content, fileName) {
    return new Promise(resolve => {
      const modal = this.createPreviewModal(content, fileName);
      document.body.appendChild(modal);

      const loadBtn = modal.querySelector('.load-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');

      loadBtn.onclick = () => {
        modal.remove();
        resolve(true);
      };

      cancelBtn.onclick = () => {
        modal.remove();
        resolve(false);
      };
    });
  }

  /**
   * Crea modal de preview
   */
  createPreviewModal(content, fileName) {
    const modal = document.createElement('div');
    modal.className = 'file-preview-modal';
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Vista previa: ${fileName}</h3>
                    <button class="modal-close cancel-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-content">
                        <iframe srcdoc="${this.escapeHtml(content)}" style="width: 100%; height: 400px; border: 1px solid #e2e8f0;"></iframe>
                    </div>
                    <div class="preview-actions">
                        <button class="load-btn">Cargar archivo</button>
                        <button class="cancel-btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    return modal;
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
   * Lee archivo como Data URL
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Escapa HTML para preview seguro
   */
  // Método de escape de HTML para prevenir XSS
  escapeHtml(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Generar nonce para políticas de seguridad de contenido
  generateNonce() {
    return btoa(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => String.fromCharCode(b)).join(''));
  }

  /**
   * Validador de nombres de archivo
   */
  isValidFileName(filename) {
    if (!filename || filename.length > 255) {
      return false;
    }
    // Evitar caracteres de control, / \ y null byte
    if (/[\x00-\x1F/\\?%*:|"<>]/ .test(filename)) {
      return false;
    }
    // Evitar travesía de directorios
    if (filename.includes('..')) {
      return false;
    }
    // Evitar nombres reservados de Windows (insensible a mayúsculas)
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(filename.split('.')[0])) {
      return false;
    }
    // Evitar archivos que comienzan o terminan con punto o espacio
    if (/^[\. ]|[\. ]$/ .test(filename)) {
      return false;
    }
    // Asegurarse de que haya una extensión
    if (!/\.[a-zA-Z0-9]{1,10}$/ .test(filename)) {
      return false;
    }
    return true;
  }

  /**
   * Muestra mensaje de éxito con registro de actividad
   */
  showSuccess(message) {
    // Log de actividad para auditoría
    this.logActivity('SUCCESS', message);

    if (window.showToast) {
      window.showToast(message);
    } else {
      console.log('SUCCESS:', message);
    }
  }

  /**
   * Muestra mensaje de error con registro de seguridad
   */
  showError(message) {
    // Log de errores para monitoreo de seguridad
    this.logActivity('ERROR', message);

    if (window.showToast) {
      window.showToast(message);
    } else {
      console.error('ERROR:', message);
    }
    
    // Mostrar alerta de manera controlada
    const sanitizedMessage = this.escapeHtml(message);
    alert(sanitizedMessage);
  }

  /**
   * Registro de actividades para auditoría
   */
  logActivity(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      message
    };

    // Guardar en localStorage para revisión posterior
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    logs.push(logEntry);

    // Mantener solo los últimos 100 registros
    const trimmedLogs = logs.slice(-100);
    localStorage.setItem('activityLogs', JSON.stringify(trimmedLogs));

    // Log en consola solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${type}] ${timestamp}: ${message}`);
    }
  }
}

module.exports = FileLoader;
