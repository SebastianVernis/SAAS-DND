/**
 * HTML Parser
 * Parses HTML files and extracts component structure
 * 
 * @module HTMLParser
 */

export class HTMLParser {
  constructor() {
    this.parser = new DOMParser();
  }

  /**
   * Parse HTML content
   * @param {string} content - HTML content
   * @param {string} filename - File name
   * @returns {Promise<Object>} Parsed component
   */
  async parse(content, filename) {
    try {
      const doc = this.parser.parseFromString(content, 'text/html');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('HTML parsing error: ' + parserError.textContent);
      }

      const component = {
        id: this.generateId(filename),
        name: filename.replace(/\.(html|htm)$/, ''),
        type: 'html',
        filePath: filename,
        
        structure: {
          doctype: this.extractDoctype(content),
          html: this.parseElement(doc.documentElement),
          head: this.parseHead(doc.head),
          body: this.parseBody(doc.body)
        },

        metadata: {
          title: doc.title || '',
          charset: this.extractCharset(doc),
          viewport: this.extractViewport(doc),
          meta: this.extractMetaTags(doc),
          links: this.extractLinks(doc),
          scripts: this.extractScripts(doc)
        },

        elements: this.extractAllElements(doc.body),
        styles: this.extractStyles(doc),
        assets: this.extractAssets(doc)
      };

      return component;

    } catch (error) {
      console.error('Error parsing HTML:', error);
      throw error;
    }
  }

  /**
   * Extract DOCTYPE
   * @param {string} content - HTML content
   * @returns {string} DOCTYPE
   */
  extractDoctype(content) {
    const doctypeMatch = content.match(/<!DOCTYPE[^>]*>/i);
    return doctypeMatch ? doctypeMatch[0] : '<!DOCTYPE html>';
  }

  /**
   * Parse HTML element
   * @param {Element} element - HTML element
   * @returns {Object} Parsed element
   */
  parseElement(element) {
    if (!element) return null;

    return {
      tag: element.tagName.toLowerCase(),
      attributes: this.extractAttributes(element),
      children: Array.from(element.children).map(child => this.parseElement(child)),
      textContent: this.getDirectTextContent(element),
      innerHTML: element.innerHTML,
      outerHTML: element.outerHTML
    };
  }

  /**
   * Parse head element
   * @param {HTMLHeadElement} head - Head element
   * @returns {Object} Parsed head
   */
  parseHead(head) {
    if (!head) return null;

    return {
      title: head.querySelector('title')?.textContent || '',
      meta: Array.from(head.querySelectorAll('meta')).map(meta => ({
        name: meta.getAttribute('name'),
        property: meta.getAttribute('property'),
        content: meta.getAttribute('content'),
        charset: meta.getAttribute('charset'),
        httpEquiv: meta.getAttribute('http-equiv')
      })),
      links: Array.from(head.querySelectorAll('link')).map(link => ({
        rel: link.getAttribute('rel'),
        href: link.getAttribute('href'),
        type: link.getAttribute('type'),
        media: link.getAttribute('media')
      })),
      scripts: Array.from(head.querySelectorAll('script')).map(script => ({
        src: script.getAttribute('src'),
        type: script.getAttribute('type'),
        async: script.hasAttribute('async'),
        defer: script.hasAttribute('defer'),
        content: script.textContent
      })),
      styles: Array.from(head.querySelectorAll('style')).map(style => ({
        content: style.textContent,
        media: style.getAttribute('media')
      }))
    };
  }

  /**
   * Parse body element
   * @param {HTMLBodyElement} body - Body element
   * @returns {Object} Parsed body
   */
  parseBody(body) {
    if (!body) return null;

    return {
      attributes: this.extractAttributes(body),
      children: Array.from(body.children).map(child => this.parseElement(child)),
      scripts: Array.from(body.querySelectorAll('script')).map(script => ({
        src: script.getAttribute('src'),
        type: script.getAttribute('type'),
        async: script.hasAttribute('async'),
        defer: script.hasAttribute('defer'),
        content: script.textContent
      }))
    };
  }

  /**
   * Extract attributes from element
   * @param {Element} element - HTML element
   * @returns {Object} Attributes
   */
  extractAttributes(element) {
    const attrs = {};
    Array.from(element.attributes).forEach(attr => {
      attrs[attr.name] = attr.value;
    });
    return attrs;
  }

  /**
   * Get direct text content (excluding children)
   * @param {Element} element - HTML element
   * @returns {string} Text content
   */
  getDirectTextContent(element) {
    let text = '';
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    });
    return text.trim();
  }

  /**
   * Extract charset
   * @param {Document} doc - Document
   * @returns {string} Charset
   */
  extractCharset(doc) {
    const charsetMeta = doc.querySelector('meta[charset]');
    if (charsetMeta) {
      return charsetMeta.getAttribute('charset');
    }

    const httpEquivMeta = doc.querySelector('meta[http-equiv="Content-Type"]');
    if (httpEquivMeta) {
      const content = httpEquivMeta.getAttribute('content');
      const match = content?.match(/charset=([^;]+)/);
      return match ? match[1] : 'UTF-8';
    }

    return 'UTF-8';
  }

  /**
   * Extract viewport
   * @param {Document} doc - Document
   * @returns {string|null} Viewport
   */
  extractViewport(doc) {
    const viewportMeta = doc.querySelector('meta[name="viewport"]');
    return viewportMeta?.getAttribute('content') || null;
  }

  /**
   * Extract meta tags
   * @param {Document} doc - Document
   * @returns {Array} Meta tags
   */
  extractMetaTags(doc) {
    return Array.from(doc.querySelectorAll('meta')).map(meta => ({
      name: meta.getAttribute('name'),
      property: meta.getAttribute('property'),
      content: meta.getAttribute('content'),
      charset: meta.getAttribute('charset'),
      httpEquiv: meta.getAttribute('http-equiv')
    }));
  }

  /**
   * Extract link tags
   * @param {Document} doc - Document
   * @returns {Array} Links
   */
  extractLinks(doc) {
    return Array.from(doc.querySelectorAll('link')).map(link => ({
      rel: link.getAttribute('rel'),
      href: link.getAttribute('href'),
      type: link.getAttribute('type'),
      media: link.getAttribute('media'),
      sizes: link.getAttribute('sizes')
    }));
  }

  /**
   * Extract script tags
   * @param {Document} doc - Document
   * @returns {Array} Scripts
   */
  extractScripts(doc) {
    return Array.from(doc.querySelectorAll('script')).map(script => ({
      src: script.getAttribute('src'),
      type: script.getAttribute('type'),
      async: script.hasAttribute('async'),
      defer: script.hasAttribute('defer'),
      module: script.getAttribute('type') === 'module',
      content: script.textContent,
      location: script.parentElement.tagName.toLowerCase() // 'head' or 'body'
    }));
  }

  /**
   * Extract all elements from body
   * @param {HTMLBodyElement} body - Body element
   * @returns {Array} Elements
   */
  extractAllElements(body) {
    if (!body) return [];

    const elements = [];
    const traverse = (element, depth = 0) => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

      elements.push({
        id: element.id || null,
        tag: element.tagName.toLowerCase(),
        classes: Array.from(element.classList),
        attributes: this.extractAttributes(element),
        depth,
        hasChildren: element.children.length > 0,
        childCount: element.children.length,
        textContent: this.getDirectTextContent(element)
      });

      Array.from(element.children).forEach(child => traverse(child, depth + 1));
    };

    Array.from(body.children).forEach(child => traverse(child, 0));
    return elements;
  }

  /**
   * Extract styles
   * @param {Document} doc - Document
   * @returns {Object} Styles
   */
  extractStyles(doc) {
    return {
      inline: this.extractInlineStyles(doc),
      internal: this.extractInternalStyles(doc),
      external: this.extractExternalStyles(doc)
    };
  }

  /**
   * Extract inline styles
   * @param {Document} doc - Document
   * @returns {Array} Inline styles
   */
  extractInlineStyles(doc) {
    const elementsWithStyle = doc.querySelectorAll('[style]');
    return Array.from(elementsWithStyle).map(el => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      classes: Array.from(el.classList),
      style: el.getAttribute('style')
    }));
  }

  /**
   * Extract internal styles
   * @param {Document} doc - Document
   * @returns {Array} Internal styles
   */
  extractInternalStyles(doc) {
    const styleTags = doc.querySelectorAll('style');
    return Array.from(styleTags).map(style => ({
      content: style.textContent,
      media: style.getAttribute('media'),
      location: style.parentElement.tagName.toLowerCase()
    }));
  }

  /**
   * Extract external styles
   * @param {Document} doc - Document
   * @returns {Array} External styles
   */
  extractExternalStyles(doc) {
    const linkTags = doc.querySelectorAll('link[rel="stylesheet"]');
    return Array.from(linkTags).map(link => ({
      href: link.getAttribute('href'),
      media: link.getAttribute('media'),
      type: link.getAttribute('type')
    }));
  }

  /**
   * Extract assets
   * @param {Document} doc - Document
   * @returns {Object} Assets
   */
  extractAssets(doc) {
    return {
      images: this.extractImages(doc),
      videos: this.extractVideos(doc),
      audio: this.extractAudio(doc),
      iframes: this.extractIframes(doc),
      fonts: this.extractFonts(doc)
    };
  }

  /**
   * Extract images
   * @param {Document} doc - Document
   * @returns {Array} Images
   */
  extractImages(doc) {
    const images = doc.querySelectorAll('img');
    return Array.from(images).map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      loading: img.getAttribute('loading'),
      srcset: img.getAttribute('srcset')
    }));
  }

  /**
   * Extract videos
   * @param {Document} doc - Document
   * @returns {Array} Videos
   */
  extractVideos(doc) {
    const videos = doc.querySelectorAll('video');
    return Array.from(videos).map(video => ({
      src: video.getAttribute('src'),
      poster: video.getAttribute('poster'),
      controls: video.hasAttribute('controls'),
      autoplay: video.hasAttribute('autoplay'),
      loop: video.hasAttribute('loop'),
      sources: Array.from(video.querySelectorAll('source')).map(source => ({
        src: source.getAttribute('src'),
        type: source.getAttribute('type')
      }))
    }));
  }

  /**
   * Extract audio
   * @param {Document} doc - Document
   * @returns {Array} Audio
   */
  extractAudio(doc) {
    const audios = doc.querySelectorAll('audio');
    return Array.from(audios).map(audio => ({
      src: audio.getAttribute('src'),
      controls: audio.hasAttribute('controls'),
      autoplay: audio.hasAttribute('autoplay'),
      loop: audio.hasAttribute('loop')
    }));
  }

  /**
   * Extract iframes
   * @param {Document} doc - Document
   * @returns {Array} Iframes
   */
  extractIframes(doc) {
    const iframes = doc.querySelectorAll('iframe');
    return Array.from(iframes).map(iframe => ({
      src: iframe.getAttribute('src'),
      width: iframe.getAttribute('width'),
      height: iframe.getAttribute('height'),
      title: iframe.getAttribute('title'),
      loading: iframe.getAttribute('loading')
    }));
  }

  /**
   * Extract fonts
   * @param {Document} doc - Document
   * @returns {Array} Fonts
   */
  extractFonts(doc) {
    const fontLinks = doc.querySelectorAll('link[rel="preload"][as="font"], link[href*="fonts"]');
    return Array.from(fontLinks).map(link => ({
      href: link.getAttribute('href'),
      type: link.getAttribute('type'),
      crossorigin: link.getAttribute('crossorigin')
    }));
  }

  /**
   * Generate unique ID
   * @param {string} filename - File name
   * @returns {string} ID
   */
  generateId(filename) {
    return `html_${filename.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  }
}
