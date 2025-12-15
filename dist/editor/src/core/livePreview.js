/**
 * LivePreview - Vista previa en tiempo real en navegador separado
 */
class LivePreview {
  constructor() {
    this.previewWindow = null;
    this.isLive = false;
    this.updateInterval = null;
    this.updateDelay = 1000; // 1 segundo
  }

  /**
   * Inicia vista previa en vivo
   */
  start() {
    if (this.isLive) {
      if (window.showToast) {
        window.showToast('Vista previa ya está activa');
      }
      return;
    }

    // Abrir ventana de preview
    this.openPreviewWindow();

    // Iniciar actualizaciones
    this.startUpdates();

    this.isLive = true;

    if (window.showToast) {
      window.showToast('Vista previa en vivo iniciada');
    }
  }

  /**
   * Detiene vista previa
   */
  stop() {
    if (!this.isLive) return;

    this.stopUpdates();

    if (this.previewWindow && !this.previewWindow.closed) {
      this.previewWindow.close();
    }

    this.previewWindow = null;
    this.isLive = false;

    if (window.showToast) {
      window.showToast('Vista previa detenida');
    }
  }

  /**
   * Abre ventana de preview
   */
  openPreviewWindow() {
    const width = 1200;
    const height = 800;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;

    this.previewWindow = window.open(
      '',
      'Live Preview',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (this.previewWindow) {
      this.updatePreview();
    } else {
      if (window.showToast) {
        window.showToast(
          'No se pudo abrir la ventana de vista previa. Verifica los permisos de ventanas emergentes.',
          'error'
        );
      }
    }
  }

  /**
   * Actualiza contenido de preview
   */
  updatePreview() {
    if (!this.previewWindow || this.previewWindow.closed) {
      this.stop();
      return;
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const html = this.generatePreviewHTML(canvas);

    try {
      this.previewWindow.document.open();
      this.previewWindow.document.write(html);
      this.previewWindow.document.close();
    } catch (error) {
      console.error('Error actualizando preview:', error);
      this.stop();
    }
  }

  /**
   * Genera HTML completo para preview
   */
  generatePreviewHTML(canvas) {
    const clone = canvas.cloneNode(true);

    // Limpiar elementos del editor
    const elements = clone.querySelectorAll('.canvas-element');
    elements.forEach(el => {
      el.classList.remove('canvas-element', 'selected');
      const deleteBtn = el.querySelector('.delete-btn');
      if (deleteBtn) deleteBtn.remove();
      el.removeAttribute('draggable');
      el.removeAttribute('data-component-type');
    });

    // Recopilar estilos
    const styles = this.collectStyles();

    // Recopilar scripts
    const scripts = this.collectScripts();

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista Previa en Vivo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: system-ui, -apple-system, sans-serif;
        }
        ${styles}
    </style>
</head>
<body>
    ${clone.innerHTML}
    ${scripts}
    <script>
        // Auto-actualización cada 2 segundos
        setInterval(() => {
            if (window.opener && !window.opener.closed) {
                // La ventana padre actualizará este contenido
            } else {
                document.body.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;"><h2>Vista previa desconectada</h2><p>La ventana del editor fue cerrada.</p></div>';
            }
        }, 2000);
    </script>
</body>
</html>`;
  }

  /**
   * Recopila estilos del documento
   */
  collectStyles() {
    const styles = [];

    // Estilos inline del head
    document.querySelectorAll('style').forEach((styleEl, index) => {
      if (
        styleEl.getAttribute('data-source') &&
        styleEl.getAttribute('data-source').startsWith('imported')
      ) {
        styles.push(styleEl.textContent);
      }
    });

    // Estilos de componentes
    styles.push(`
            .component-card {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                max-width: 400px;
            }
            .component-card img {
                width: 100%;
                border-radius: 8px 8px 0 0;
            }
            .component-card-body {
                padding: 20px;
            }
            .component-navbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 32px;
                background: #1e293b;
                color: white;
            }
            .component-navbar-brand {
                font-size: 1.5rem;
                font-weight: bold;
            }
            .component-navbar-nav {
                display: flex;
                gap: 20px;
                list-style: none;
            }
            .component-navbar-nav a {
                color: white;
                text-decoration: none;
            }
            .component-hero {
                min-height: 400px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 60px 20px;
            }
            .component-footer {
                background: #1e293b;
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
        `);

    return styles.join('\n\n');
  }

  /**
   * Recopila scripts del documento
   */
  collectScripts() {
    const scripts = [];

    document.querySelectorAll('script').forEach(scriptEl => {
      if (
        scriptEl.getAttribute('data-source') &&
        scriptEl.getAttribute('data-source').startsWith('imported')
      ) {
        if (scriptEl.src) {
          scripts.push(`<script src="${scriptEl.src}"><\/script>`);
        } else {
          scripts.push(`<script>${scriptEl.textContent}<\/script>`);
        }
      }
    });

    return scripts.join('\n');
  }

  /**
   * Inicia actualizaciones automáticas
   */
  startUpdates() {
    this.stopUpdates();

    // Actualizar inmediatamente
    this.updatePreview();

    // Actualizar periódicamente
    this.updateInterval = setInterval(() => {
      this.updatePreview();
    }, this.updateDelay);

    // Observar cambios en el canvas
    const canvas = document.getElementById('canvas');
    if (canvas) {
      this.canvasObserver = new MutationObserver(() => {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.updatePreview();
        }, 500);
      });

      this.canvasObserver.observe(canvas, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
  }

  /**
   * Detiene actualizaciones
   */
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    if (this.canvasObserver) {
      this.canvasObserver.disconnect();
      this.canvasObserver = null;
    }
  }

  /**
   * Alterna vista previa
   */
  toggle() {
    if (this.isLive) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Verifica si está activa
   */
  isActive() {
    return this.isLive && this.previewWindow && !this.previewWindow.closed;
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LivePreview;
}

window.LivePreview = LivePreview;
