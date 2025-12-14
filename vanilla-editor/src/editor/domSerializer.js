/**
 * DOM Serializer
 * Serializes DOM elements to clean, formatted HTML code
 */

export class DOMSerializer {
  constructor(options = {}) {
    this.options = {
      indent: options.indent || '  ',
      lineBreak: options.lineBreak || '\n',
      selfClosingTags: options.selfClosingTags || ['img', 'br', 'hr', 'input', 'meta', 'link'],
      skipAttributes: options.skipAttributes || ['data-dragndrop-id', 'data-selected'],
      formatInline: options.formatInline || ['span', 'a', 'strong', 'em', 'code'],
      ...options
    };
  }

  /**
   * Serialize DOM element to HTML string
   */
  serialize(element, depth = 0) {
    if (!element) return '';

    // Handle text nodes
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent.trim();
      return text ? text : '';
    }

    // Handle element nodes
    if (element.nodeType === Node.ELEMENT_NODE) {
      return this.serializeElement(element, depth);
    }

    return '';
  }

  /**
   * Serialize element node
   */
  serializeElement(element, depth) {
    const tagName = element.tagName.toLowerCase();
    const indent = this.options.indent.repeat(depth);
    const isInline = this.options.formatInline.includes(tagName);
    const isSelfClosing = this.options.selfClosingTags.includes(tagName);

    // Build opening tag
    let html = indent + '<' + tagName;

    // Add attributes
    const attributes = this.serializeAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }

    // Self-closing tags
    if (isSelfClosing) {
      html += ' />';
      return html;
    }

    html += '>';

    // Serialize children
    const children = Array.from(element.childNodes);
    
    if (children.length === 0) {
      // Empty element
      html += '</' + tagName + '>';
      return html;
    }

    // Check if element has only text content
    const hasOnlyText = children.every(child => child.nodeType === Node.TEXT_NODE);

    if (hasOnlyText || isInline) {
      // Inline content
      const content = children.map(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          return child.textContent.trim();
        }
        return this.serialize(child, 0).trim();
      }).join('');
      
      html += content + '</' + tagName + '>';
    } else {
      // Block content with children
      html += this.options.lineBreak;
      
      children.forEach(child => {
        const serialized = this.serialize(child, depth + 1);
        if (serialized) {
          html += serialized + this.options.lineBreak;
        }
      });
      
      html += indent + '</' + tagName + '>';
    }

    return html;
  }

  /**
   * Serialize element attributes
   */
  serializeAttributes(element) {
    const attributes = [];

    Array.from(element.attributes).forEach(attr => {
      // Skip certain attributes
      if (this.options.skipAttributes.includes(attr.name)) {
        return;
      }

      // Format attribute
      if (attr.value === '') {
        attributes.push(attr.name);
      } else {
        attributes.push(`${attr.name}="${this.escapeAttributeValue(attr.value)}"`);
      }
    });

    return attributes.join(' ');
  }

  /**
   * Escape attribute value
   */
  escapeAttributeValue(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Serialize with pretty formatting
   */
  serializePretty(element) {
    const html = this.serialize(element, 0);
    return this.formatHTML(html);
  }

  /**
   * Format HTML with proper indentation
   */
  formatHTML(html) {
    // Remove extra whitespace
    html = html.replace(/\s+/g, ' ').trim();

    let formatted = '';
    let depth = 0;
    const indent = this.options.indent;
    const lineBreak = this.options.lineBreak;

    // Split by tags
    const tokens = html.match(/<[^>]+>|[^<]+/g) || [];

    tokens.forEach(token => {
      if (token.startsWith('</')) {
        // Closing tag
        depth--;
        formatted += lineBreak + indent.repeat(depth) + token;
      } else if (token.startsWith('<')) {
        // Opening tag
        formatted += lineBreak + indent.repeat(depth) + token;
        
        // Check if self-closing
        if (!token.endsWith('/>') && !this.isSelfClosingTag(token)) {
          depth++;
        }
      } else {
        // Text content
        const text = token.trim();
        if (text) {
          formatted += text;
        }
      }
    });

    return formatted.trim();
  }

  /**
   * Check if tag is self-closing
   */
  isSelfClosingTag(tag) {
    const tagName = tag.match(/<([a-zA-Z]+)/);
    if (!tagName) return false;
    
    return this.options.selfClosingTags.includes(tagName[1].toLowerCase());
  }

  /**
   * Serialize to minified HTML
   */
  serializeMinified(element) {
    const html = this.serialize(element, 0);
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  /**
   * Serialize only inner HTML
   */
  serializeInnerHTML(element) {
    if (!element) return '';

    const children = Array.from(element.childNodes);
    return children.map(child => this.serialize(child, 0)).join(this.options.lineBreak);
  }

  /**
   * Serialize with inline styles extracted
   */
  serializeWithExtractedStyles(element) {
    const styles = new Map();
    const html = this.serializeAndExtractStyles(element, styles, 0);

    // Generate CSS from extracted styles
    let css = '';
    styles.forEach((styleObj, selector) => {
      css += `${selector} {\n`;
      Object.entries(styleObj).forEach(([prop, value]) => {
        css += `  ${prop}: ${value};\n`;
      });
      css += '}\n\n';
    });

    return { html, css };
  }

  /**
   * Serialize and extract inline styles
   */
  serializeAndExtractStyles(element, styles, depth) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return this.serialize(element, depth);
    }

    // Extract inline styles
    if (element.hasAttribute('style')) {
      const selector = this.generateSelector(element);
      const styleText = element.getAttribute('style');
      const styleObj = this.parseInlineStyle(styleText);
      
      if (Object.keys(styleObj).length > 0) {
        styles.set(selector, styleObj);
      }

      // Remove inline style
      element.removeAttribute('style');
    }

    return this.serializeElement(element, depth);
  }

  /**
   * Generate CSS selector for element
   */
  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c);
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Parse inline style string to object
   */
  parseInlineStyle(styleText) {
    const styleObj = {};
    
    styleText.split(';').forEach(declaration => {
      const [prop, value] = declaration.split(':').map(s => s.trim());
      if (prop && value) {
        styleObj[prop] = value;
      }
    });

    return styleObj;
  }

  /**
   * Serialize to React JSX
   */
  serializeToJSX(element, depth = 0) {
    if (!element) return '';

    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent.trim();
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
      const tagName = element.tagName.toLowerCase();
      const indent = '  '.repeat(depth);
      
      let jsx = indent + '<' + tagName;

      // Convert attributes to JSX format
      Array.from(element.attributes).forEach(attr => {
        let attrName = attr.name;
        let attrValue = attr.value;

        // Convert to camelCase for JSX
        if (attrName === 'class') attrName = 'className';
        if (attrName.includes('-')) {
          attrName = attrName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        }

        jsx += ` ${attrName}="${attrValue}"`;
      });

      jsx += '>';

      // Serialize children
      const children = Array.from(element.childNodes);
      if (children.length > 0) {
        jsx += '\n';
        children.forEach(child => {
          jsx += this.serializeToJSX(child, depth + 1) + '\n';
        });
        jsx += indent;
      }

      jsx += '</' + tagName + '>';

      return jsx;
    }

    return '';
  }
}

export default DOMSerializer;
