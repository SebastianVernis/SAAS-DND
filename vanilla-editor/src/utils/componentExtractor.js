/**
 * ComponentExtractor - Extrae y crea componentes reutilizables desde HTML importado
 */
class ComponentExtractor {
  constructor() {
    this.extractedComponents = [];
    this.componentPatterns = {
      navbar: {
        selectors: ['nav', '.navbar', '.nav', '.navigation', '.header-nav'],
        minElements: 2,
        requiredElements: ['a', 'ul', 'li'],
      },
      card: {
        selectors: ['.card', '.box', '.panel', '.item', '.product'],
        minElements: 2,
        requiredElements: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img'],
      },
      hero: {
        selectors: ['.hero', '.banner', '.jumbotron', '.intro', '.header-section'],
        minElements: 2,
        requiredElements: ['h1', 'h2', 'p', 'button', 'a'],
      },
      footer: {
        selectors: ['footer', '.footer', '.site-footer'],
        minElements: 1,
        requiredElements: ['p', 'a', 'ul'],
      },
      form: {
        selectors: ['form', '.form', '.contact-form'],
        minElements: 2,
        requiredElements: ['input', 'textarea', 'button', 'select'],
      },
      gallery: {
        selectors: ['.gallery', '.grid', '.portfolio', '.images'],
        minElements: 3,
        requiredElements: ['img'],
      },
      testimonial: {
        selectors: ['.testimonial', '.review', '.quote'],
        minElements: 2,
        requiredElements: ['p', 'blockquote'],
      },
      pricing: {
        selectors: ['.pricing', '.price', '.plan'],
        minElements: 2,
        requiredElements: ['h1', 'h2', 'h3', 'h4', 'span', 'button'],
      },
    };
  }

  /**
   * Extrae componentes de un documento HTML
   */
  extractComponents(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    this.extractedComponents = [];

    // Buscar patrones de componentes
    for (const [componentType, pattern] of Object.entries(this.componentPatterns)) {
      this.findComponentsByPattern(doc, componentType, pattern);
    }

    // Buscar componentes por estructura
    this.findComponentsByStructure(doc);

    return this.extractedComponents;
  }

  /**
   * Busca componentes basado en patrones predefinidos
   */
  findComponentsByPattern(doc, componentType, pattern) {
    pattern.selectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);

      elements.forEach(element => {
        if (this.validateComponent(element, pattern)) {
          const component = this.createComponent(element, componentType);
          if (component) {
            this.extractedComponents.push(component);
          }
        }
      });
    });
  }

  /**
   * Busca componentes basado en estructura HTML
   */
  findComponentsByStructure(doc) {
    // Buscar divs con múltiples elementos hijos que podrían ser componentes
    const containers = doc.querySelectorAll('div, section, article');

    containers.forEach(container => {
      if (this.couldBeComponent(container)) {
        const componentType = this.guessComponentType(container);
        const component = this.createComponent(container, componentType);
        if (component) {
          this.extractedComponents.push(component);
        }
      }
    });
  }

  /**
   * Valida si un elemento cumple con los requisitos de un patrón
   */
  validateComponent(element, pattern) {
    const childElements = element.querySelectorAll('*');

    // Verificar cantidad mínima de elementos
    if (childElements.length < pattern.minElements) {
      return false;
    }

    // Verificar elementos requeridos
    const hasRequiredElements = pattern.requiredElements.some(
      selector => element.querySelector(selector) !== null
    );

    return hasRequiredElements;
  }

  /**
   * Determina si un elemento podría ser un componente
   */
  couldBeComponent(element) {
    const childElements = element.children;
    const textContent = element.textContent.trim();

    // Debe tener al menos 2 elementos hijos o contenido significativo
    if (childElements.length < 2 && textContent.length < 50) {
      return false;
    }

    // No debe ser demasiado grande (probablemente sea un layout)
    if (childElements.length > 20) {
      return false;
    }

    // Debe tener cierta diversidad de elementos
    const tagTypes = new Set(Array.from(childElements).map(el => el.tagName));
    return tagTypes.size >= 2;
  }

  /**
   * Intenta adivinar el tipo de componente basado en su contenido
   */
  guessComponentType(element) {
    const classes = element.className.toLowerCase();
    const textContent = element.textContent.toLowerCase();

    // Buscar palabras clave en clases
    if (classes.includes('nav')) return 'navbar';
    if (classes.includes('card') || classes.includes('box')) return 'card';
    if (classes.includes('hero') || classes.includes('banner')) return 'hero';
    if (classes.includes('footer')) return 'footer';
    if (classes.includes('form')) return 'form';
    if (classes.includes('gallery') || classes.includes('grid')) return 'gallery';

    // Buscar por contenido
    if (element.querySelector('form')) return 'form';
    if (element.querySelectorAll('img').length >= 3) return 'gallery';
    if (element.querySelector('blockquote')) return 'testimonial';
    if (textContent.includes('$') || textContent.includes('precio')) return 'pricing';

    // Por estructura
    const hasHeading = element.querySelector('h1, h2, h3, h4, h5, h6');
    const hasImage = element.querySelector('img');
    const hasButton = element.querySelector('button, .btn, a[class*="btn"]');

    if (hasHeading && hasImage && hasButton) return 'card';
    if (hasHeading && hasButton && element.children.length <= 5) return 'hero';

    return 'custom';
  }

  /**
   * Crea un objeto componente a partir de un elemento
   */
  createComponent(element, type) {
    try {
      // Limpiar elemento (remover scripts, etc.)
      const cleanElement = this.cleanElement(element.cloneNode(true));

      const component = {
        id: this.generateComponentId(),
        type: type,
        name: this.generateComponentName(cleanElement, type),
        html: cleanElement.outerHTML,
        css: this.extractElementCSS(element),
        preview: this.generatePreview(cleanElement),
        tags: this.generateTags(cleanElement, type),
        created: new Date().toISOString(),
      };

      return component;
    } catch (error) {
      console.error('Error creando componente:', error);
      return null;
    }
  }

  /**
   * Limpia un elemento removiendo scripts y elementos no deseados
   */
  cleanElement(element) {
    // Remover scripts
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remover comentarios
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null, false);

    const comments = [];
    let node;
    while ((node = walker.nextNode())) {
      comments.push(node);
    }
    comments.forEach(comment => comment.remove());

    // Limpiar atributos problemáticos
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('onerror');
    });

    return element;
  }

  /**
   * Extrae CSS relevante para un elemento
   */
  extractElementCSS(element) {
    const css = [];

    // CSS inline
    if (element.style.cssText) {
      css.push(
        `/* Estilos inline */\n.${element.className || 'component'} {\n  ${element.style.cssText}\n}`
      );
    }

    // CSS de elementos hijos con estilos inline
    const styledElements = element.querySelectorAll('[style]');
    styledElements.forEach((el, index) => {
      if (el.style.cssText) {
        const selector = el.className ? `.${el.className}` : `element-${index}`;
        css.push(`${selector} {\n  ${el.style.cssText}\n}`);
      }
    });

    return css.join('\n\n');
  }

  /**
   * Genera preview del componente
   */
  generatePreview(element) {
    // Crear una versión miniatura del HTML
    const preview = element.cloneNode(true);

    // Simplificar contenido para preview
    const textElements = preview.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    textElements.forEach(el => {
      if (el.textContent.length > 50) {
        el.textContent = el.textContent.substring(0, 50) + '...';
      }
    });

    return preview.outerHTML;
  }

  /**
   * Genera tags para el componente
   */
  generateTags(element, type) {
    const tags = [type];

    // Tags basados en elementos contenidos
    if (element.querySelector('img')) tags.push('imagen');
    if (element.querySelector('button, .btn')) tags.push('botón');
    if (element.querySelector('form')) tags.push('formulario');
    if (element.querySelector('ul, ol')) tags.push('lista');
    if (element.querySelector('table')) tags.push('tabla');

    // Tags basados en clases CSS
    const classes = element.className.toLowerCase();
    if (classes.includes('responsive')) tags.push('responsive');
    if (classes.includes('dark')) tags.push('oscuro');
    if (classes.includes('light')) tags.push('claro');

    return [...new Set(tags)]; // Remover duplicados
  }

  /**
   * Genera nombre para el componente
   */
  generateComponentName(element, type) {
    // Buscar texto representativo
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      const text = heading.textContent.trim().substring(0, 30);
      return `${this.capitalizeFirst(type)} - ${text}`;
    }

    // Buscar por clase CSS
    if (element.className) {
      const className = element.className.split(' ')[0];
      return `${this.capitalizeFirst(type)} - ${className}`;
    }

    // Nombre genérico
    const timestamp = new Date().toLocaleTimeString();
    return `${this.capitalizeFirst(type)} ${timestamp}`;
  }

  /**
   * Genera ID único para componente
   */
  generateComponentId() {
    return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Capitaliza primera letra
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Guarda componentes extraídos en localStorage
   */
  saveExtractedComponents() {
    const storageKey = 'dragndrop_extracted_components';
    const existing = this.getStoredComponents();

    // Agregar nuevos componentes
    const updated = [...existing, ...this.extractedComponents];

    // Limitar a 50 componentes máximo
    if (updated.length > 50) {
      updated.splice(50);
    }

    localStorage.setItem(storageKey, JSON.stringify(updated));

    return this.extractedComponents.length;
  }

  /**
   * Obtiene componentes guardados
   */
  getStoredComponents() {
    try {
      const storageKey = 'dragndrop_extracted_components';
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al obtener componentes:', error);
      return [];
    }
  }

  /**
   * Elimina componente guardado
   */
  deleteStoredComponent(componentId) {
    const storageKey = 'dragndrop_extracted_components';
    const components = this.getStoredComponents();
    const filtered = components.filter(c => c.id !== componentId);

    localStorage.setItem(storageKey, JSON.stringify(filtered));
  }

  /**
   * Busca componentes por tags
   */
  searchComponents(query) {
    const components = this.getStoredComponents();
    const searchTerm = query.toLowerCase();

    return components.filter(
      component =>
        component.name.toLowerCase().includes(searchTerm) ||
        component.type.toLowerCase().includes(searchTerm) ||
        component.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
}

window.ComponentExtractor = ComponentExtractor;
