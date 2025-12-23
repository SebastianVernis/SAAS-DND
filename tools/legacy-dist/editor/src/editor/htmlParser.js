/**
 * HTML Parser
 * Parses HTML code into a structured DOM representation
 */

export class HTMLParser {
  constructor() {
    this.parser = new DOMParser();
  }

  /**
   * Parse HTML string into DOM structure
   */
  parse(htmlString) {
    try {
      // Wrap in a container to handle fragments
      const wrappedHTML = `<div class="dragndrop-canvas-wrapper">${htmlString}</div>`;
      
      const doc = this.parser.parseFromString(wrappedHTML, 'text/html');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.error('HTML parsing error:', parserError.textContent);
        return null;
      }

      // Extract the wrapper content
      const wrapper = doc.querySelector('.dragndrop-canvas-wrapper');
      
      return this.serializeNode(wrapper);
    } catch (error) {
      console.error('Failed to parse HTML:', error);
      return null;
    }
  }

  /**
   * Serialize DOM node to structured object
   */
  serializeNode(node) {
    if (!node) return null;

    // Handle text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      return text ? { type: 'text', content: text } : null;
    }

    // Handle element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = {
        type: 'element',
        tag: node.tagName.toLowerCase(),
        attributes: this.extractAttributes(node),
        children: []
      };

      // Serialize children
      Array.from(node.childNodes).forEach(child => {
        const serialized = this.serializeNode(child);
        if (serialized) {
          element.children.push(serialized);
        }
      });

      return element;
    }

    return null;
  }

  /**
   * Extract attributes from element
   */
  extractAttributes(element) {
    const attributes = {};
    
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });

    return attributes;
  }

  /**
   * Parse HTML and return flat list of elements with selectors
   */
  parseToFlatList(htmlString) {
    const parsed = this.parse(htmlString);
    if (!parsed) return [];

    const flatList = [];
    this.flattenNode(parsed, flatList, '');
    
    return flatList;
  }

  /**
   * Flatten node tree to list with selectors
   */
  flattenNode(node, list, parentSelector, index = 0) {
    if (!node || node.type !== 'element') return;

    // Generate selector for this node
    const selector = this.generateSelector(node, parentSelector, index);
    
    list.push({
      selector,
      tag: node.tag,
      attributes: node.attributes,
      children: node.children
    });

    // Flatten children
    node.children.forEach((child, childIndex) => {
      if (child.type === 'element') {
        this.flattenNode(child, list, selector, childIndex);
      }
    });
  }

  /**
   * Generate CSS selector for node
   */
  generateSelector(node, parentSelector, index) {
    let selector = node.tag;

    // Add ID if present
    if (node.attributes.id) {
      selector = `#${node.attributes.id}`;
    }
    // Add class if present
    else if (node.attributes.class) {
      const classes = node.attributes.class.split(' ').filter(c => c);
      if (classes.length > 0) {
        selector = `${node.tag}.${classes.join('.')}`;
      }
    }
    // Add nth-child selector
    else {
      selector = `${node.tag}:nth-child(${index + 1})`;
    }

    // Combine with parent selector
    if (parentSelector) {
      return `${parentSelector} > ${selector}`;
    }

    return selector;
  }

  /**
   * Validate HTML structure
   */
  validate(htmlString) {
    const errors = [];
    const warnings = [];

    try {
      const parsed = this.parse(htmlString);
      
      if (!parsed) {
        errors.push('Failed to parse HTML');
        return { valid: false, errors, warnings };
      }

      // Check for common issues
      this.validateNode(parsed, errors, warnings);

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(error.message);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Validate node recursively
   */
  validateNode(node, errors, warnings, depth = 0) {
    if (!node || node.type !== 'element') return;

    // Check nesting depth
    if (depth > 20) {
      warnings.push(`Deep nesting detected (depth: ${depth}) for tag <${node.tag}>`);
    }

    // Check for required attributes
    if (node.tag === 'img' && !node.attributes.alt) {
      warnings.push('Image missing alt attribute');
    }

    if (node.tag === 'a' && !node.attributes.href) {
      warnings.push('Anchor missing href attribute');
    }

    // Check for inline styles (best practice)
    if (node.attributes.style) {
      warnings.push(`Inline style detected on <${node.tag}>. Consider using CSS classes.`);
    }

    // Validate children
    node.children.forEach(child => {
      this.validateNode(child, errors, warnings, depth + 1);
    });
  }

  /**
   * Extract text content from parsed HTML
   */
  extractTextContent(parsed) {
    if (!parsed) return '';

    if (parsed.type === 'text') {
      return parsed.content;
    }

    if (parsed.type === 'element') {
      return parsed.children
        .map(child => this.extractTextContent(child))
        .join(' ')
        .trim();
    }

    return '';
  }

  /**
   * Find element by selector in parsed HTML
   */
  findElement(parsed, selector) {
    if (!parsed || parsed.type !== 'element') return null;

    // Simple selector matching (can be enhanced)
    if (this.matchesSelector(parsed, selector)) {
      return parsed;
    }

    // Search in children
    for (const child of parsed.children) {
      const found = this.findElement(child, selector);
      if (found) return found;
    }

    return null;
  }

  /**
   * Check if node matches selector
   */
  matchesSelector(node, selector) {
    if (!node || node.type !== 'element') return false;

    // ID selector
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      return node.attributes.id === id;
    }

    // Class selector
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      const classes = (node.attributes.class || '').split(' ');
      return classes.includes(className);
    }

    // Tag selector
    return node.tag === selector.toLowerCase();
  }
}

export default HTMLParser;
