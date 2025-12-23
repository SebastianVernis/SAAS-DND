/**
 * HTMLParser - Convierte HTML existente en componentes editables del editor
 */
class HTMLParser {
  constructor() {
    this.componentTypes = {
      nav: 'navbar',
      header: 'header',
      footer: 'footer',
      section: 'seccion',
      article: 'article',
      div: 'contenedor',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      p: 'p',
      span: 'span',
      img: 'img',
      video: 'video',
      iframe: 'iframe',
      button: 'button',
      input: 'input',
      textarea: 'textarea',
      select: 'select',
      ul: 'ul',
      ol: 'ol',
      li: 'li',
      a: 'link',
      form: 'form',
    };

    this.skipElements = ['script', 'style', 'meta', 'link', 'title', 'head'];
    this.elementIdCounter = window.elementIdCounter || 0;
  }

  /**
   * Parsea HTML y lo carga en el canvas
   */
  async parseAndLoad(htmlContent) {
    try {
      // Crear parser DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Extraer estilos CSS
      await this.extractStyles(doc);

      // Extraer y preservar scripts
      await this.extractScripts(doc);

      // Procesar el body
      const body = doc.body;
      if (body) {
        const canvas = document.getElementById('canvas');

        // Limpiar canvas actual si el usuario confirma
        if (canvas.children.length > 0) {
          const shouldReplace = confirm('¿Deseas reemplazar el contenido actual del canvas?');
          if (!shouldReplace) {
            return;
          }
          canvas.innerHTML = '';
        }

        // Procesar elementos del body
        await this.processElements(body.children, canvas);

        // Actualizar contador global
        window.elementIdCounter = this.elementIdCounter;

        this.showSuccess('HTML convertido exitosamente a componentes editables');
      }
    } catch (error) {
      this.showError(`Error al parsear HTML: ${error.message}`);
    }
  }

  /**
   * Extrae y aplica estilos CSS del documento
   */
  async extractStyles(doc) {
    // Extraer estilos inline del head
    const styleElements = doc.querySelectorAll('style');
    styleElements.forEach((styleEl, index) => {
      const newStyle = document.createElement('style');
      newStyle.textContent = styleEl.textContent;
      newStyle.setAttribute('data-source', `imported-style-${index}`);
      document.head.appendChild(newStyle);
    });

    // Extraer links a CSS externos
    const linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
    linkElements.forEach((linkEl, index) => {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = linkEl.href;
      newLink.setAttribute('data-source', `imported-link-${index}`);
      document.head.appendChild(newLink);
    });
  }

  /**
   * Extrae y preserva scripts JavaScript
   */
  async extractScripts(doc) {
    const scriptElements = doc.querySelectorAll('script');
    const scripts = [];

    scriptElements.forEach(scriptEl => {
      if (scriptEl.src) {
        // Script externo
        scripts.push({
          type: 'external',
          src: scriptEl.src,
          content: null,
        });
      } else if (scriptEl.textContent.trim()) {
        // Script inline
        scripts.push({
          type: 'inline',
          src: null,
          content: scriptEl.textContent,
        });
      }
    });

    // Mostrar scripts encontrados al usuario
    if (scripts.length > 0) {
      const shouldInclude = confirm(
        `Se encontraron ${scripts.length} script(s) JavaScript.\n` +
          '¿Deseas incluirlos? (Solo acepta si confías en el código)'
      );

      if (shouldInclude) {
        scripts.forEach((script, index) => {
          const newScript = document.createElement('script');
          if (script.type === 'external') {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.content;
          }
          newScript.setAttribute('data-source', `imported-script-${index}`);
          document.head.appendChild(newScript);
        });
      }
    }
  }

  /**
   * Procesa elementos HTML y los convierte en componentes editables
   */
  async processElements(elements, container) {
    for (const element of elements) {
      if (this.shouldSkipElement(element)) {
        continue;
      }

      const convertedElement = await this.convertElement(element);
      if (convertedElement) {
        container.appendChild(convertedElement);
      }
    }
  }

  /**
   * Verifica si un elemento debe ser omitido
   */
  shouldSkipElement(element) {
    const tagName = element.tagName.toLowerCase();
    return this.skipElements.includes(tagName) || element.nodeType !== Node.ELEMENT_NODE;
  }

  /**
   * Convierte un elemento HTML en componente editable
   */
  async convertElement(originalElement) {
    const tagName = originalElement.tagName.toLowerCase();
    const componentType = this.componentTypes[tagName] || 'contenedor';

    // Crear nuevo elemento
    const newElement = document.createElement(tagName);

    // Copiar atributos (excepto id que será regenerado)
    Array.from(originalElement.attributes).forEach(attr => {
      if (attr.name !== 'id') {
        newElement.setAttribute(attr.name, attr.value);
      }
    });

    // Asignar nuevo ID único
    newElement.id = 'element-' + this.elementIdCounter++;
    newElement.classList.add('canvas-element');
    newElement.setAttribute('data-component-type', componentType);

    // Copiar estilos inline
    if (originalElement.style.cssText) {
      newElement.style.cssText = originalElement.style.cssText;
    }

    // Procesar contenido
    await this.processElementContent(originalElement, newElement);

    // Agregar funcionalidad del editor
    this.addEditorFunctionality(newElement);

    return newElement;
  }

  /**
   * Procesa el contenido de un elemento
   */
  async processElementContent(originalElement, newElement) {
    // Si el elemento tiene solo texto, copiarlo directamente
    if (originalElement.children.length === 0) {
      newElement.textContent = originalElement.textContent;
    } else {
      // Procesar elementos hijos recursivamente
      await this.processElements(originalElement.children, newElement);

      // Preservar texto que no esté en elementos hijos
      const textNodes = Array.from(originalElement.childNodes).filter(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );

      if (textNodes.length > 0) {
        textNodes.forEach(textNode => {
          newElement.appendChild(document.createTextNode(textNode.textContent));
        });
      }
    }
  }

  /**
   * Agrega funcionalidad del editor al elemento
   */
  addEditorFunctionality(element) {
    // Agregar botón de eliminar
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = e => {
      e.stopPropagation();
      if (window.deleteElement) {
        window.deleteElement(element);
      } else {
        element.remove();
      }
    };
    element.appendChild(deleteBtn);

    // Eventos de selección
    element.addEventListener('click', e => {
      e.stopPropagation();
      if (window.selectElement) {
        window.selectElement(element);
      }
    });

    // Eventos de edición
    element.addEventListener('dblclick', e => {
      e.stopPropagation();
      if (window.makeElementEditable) {
        window.makeElementEditable(element);
      }
    });
  }

  /**
   * Detecta y convierte patrones comunes en componentes especializados
   */
  detectSpecialComponents(element) {
    const classes = element.className.toLowerCase();
    const tagName = element.tagName.toLowerCase();

    // Detectar navbar
    if (tagName === 'nav' || classes.includes('nav') || classes.includes('navbar')) {
      return this.convertToNavbar(element);
    }

    // Detectar hero section
    if (classes.includes('hero') || classes.includes('banner') || classes.includes('jumbotron')) {
      return this.convertToHero(element);
    }

    // Detectar card
    if (classes.includes('card') || classes.includes('box') || classes.includes('panel')) {
      return this.convertToCard(element);
    }

    // Detectar footer
    if (tagName === 'footer' || classes.includes('footer')) {
      return this.convertToFooter(element);
    }

    return null;
  }

  /**
   * Convierte elemento en navbar especializado
   */
  convertToNavbar(element) {
    element.setAttribute('data-component-type', 'navbar');
    element.classList.add('component-navbar');
    return element;
  }

  /**
   * Convierte elemento en hero section
   */
  convertToHero(element) {
    element.setAttribute('data-component-type', 'hero');
    element.classList.add('component-hero');
    return element;
  }

  /**
   * Convierte elemento en card
   */
  convertToCard(element) {
    element.setAttribute('data-component-type', 'card');
    element.classList.add('component-card');
    return element;
  }

  /**
   * Convierte elemento en footer
   */
  convertToFooter(element) {
    element.setAttribute('data-component-type', 'footer');
    element.classList.add('component-footer');
    return element;
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
    alert(message);
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HTMLParser;
}

// Exportar globalmente para compatibilidad
window.HTMLParser = HTMLParser;
