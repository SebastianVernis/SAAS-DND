/**
 * HTML Sanitizer Module
 * Provides XSS protection by sanitizing user input before DOM insertion
 * @module utils/sanitizer
 */

/**
 * Sanitizes HTML to prevent XSS by removing disallowed tags and dangerous attributes.
 * @param {string} html - Input HTML to sanitize.
 * @param {Object} [options] - Sanitization options.
 * @param {boolean} [options.allowStyles=true] - Whether to allow inline `style` attributes.
 * @param {boolean} [options.allowScripts=false] - Whether to allow `<script>` tags.
 * @param {Array<string>} [options.allowedTags] - Whitelist of allowed tag names; defaults to a common-safe set.
 * @returns {string} The sanitized HTML string.
 */
function sanitizeHTML(html, options = {}) {
    const {
        allowStyles = true,
        allowScripts = false,
        allowedTags = [
            'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
            'button', 'input', 'textarea', 'select', 'option', 'label', 'form',
            'nav', 'header', 'footer', 'section', 'article', 'aside', 'main',
            'strong', 'em', 'b', 'i', 'u', 'br', 'hr', 'video', 'audio', 'iframe'
        ]
    } = options;

    if (typeof html !== 'string') {
        console.warn('sanitizeHTML: Input is not a string', typeof html);
        return '';
    }

    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Recursively sanitize all elements
    sanitizeNode(temp, { allowStyles, allowScripts, allowedTags });

    return temp.innerHTML;
}

/**
 * Recursively sanitize a DOM node and its descendant nodes according to the given options.
 *
 * Removes elements whose tag name is not in `options.allowedTags`, removes non-element/non-text nodes,
 * removes `<script>` elements when `options.allowScripts` is false, and sanitizes retained element attributes
 * using `sanitizeAttributes` (respecting `options.allowStyles`).
 *
 * @param {Node} node - The DOM node whose subtree will be sanitized in place.
 * @param {Object} options - Sanitization options.
 * @param {boolean} options.allowStyles - If true, allow `style` attributes on elements.
 * @param {boolean} options.allowScripts - If true, retain `<script>` elements; otherwise they are removed.
 * @param {string[]} options.allowedTags - List of allowed lowercase tag names; elements not in this list are removed.
 * @private
 */
function sanitizeNode(node, options) {
    const { allowStyles, allowScripts, allowedTags } = options;

    // Process all child nodes
    Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const tagName = child.tagName.toLowerCase();

            // Remove script tags unless explicitly allowed
            if (tagName === 'script' && !allowScripts) {
                child.remove();
                return;
            }

            // Remove disallowed tags
            if (!allowedTags.includes(tagName)) {
                console.warn(`Removing disallowed tag: ${tagName}`);
                child.remove();
                return;
            }

            // Sanitize attributes
            sanitizeAttributes(child, allowStyles);

            // Recursively sanitize children
            sanitizeNode(child, options);
        } else if (child.nodeType === Node.TEXT_NODE) {
            // Text nodes are safe, but we can escape special characters if needed
            // For now, we keep them as-is since they're already text
        } else {
            // Remove other node types (comments, etc.)
            child.remove();
        }
    });
}

/**
 * Remove unsafe attributes from an element, enforcing an allowlist and optional style support.
 *
 * This function mutates the provided element by removing event-handler attributes, blocking
 * `javascript:` and `data:text/html` values on `href`/`src`, allowing `data-` and `aria-` attributes,
 * and removing any attribute not present in the internal allowlist (optionally including `style`).
 *
 * @param {Element} element - Element whose attributes will be sanitized (attributes may be removed).
 * @param {boolean} allowStyles - If true, permit the `style` attribute; otherwise `style` will be removed.
 * @private
 */
function sanitizeAttributes(element, allowStyles) {
    const dangerousAttributes = [
        'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
        'onmousemove', 'onmousedown', 'onmouseup', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'
    ];

    const allowedAttributes = [
        'id', 'class', 'href', 'src', 'alt', 'title', 'width', 'height',
        'type', 'name', 'value', 'placeholder', 'data-*', 'aria-*'
    ];

    if (allowStyles) {
        allowedAttributes.push('style');
    }

    // Get all attributes
    const attributes = Array.from(element.attributes);

    attributes.forEach(attr => {
        const attrName = attr.name.toLowerCase();

        // Remove dangerous event handlers
        if (dangerousAttributes.includes(attrName)) {
            element.removeAttribute(attrName);
            console.warn(`Removed dangerous attribute: ${attrName}`);
            return;
        }

        // Check for javascript: protocol in href/src
        if ((attrName === 'href' || attrName === 'src') && attr.value) {
            const value = attr.value.toLowerCase().trim();
            if (value.startsWith('javascript:') || value.startsWith('data:text/html')) {
                element.removeAttribute(attrName);
                console.warn(`Removed dangerous ${attrName}: ${attr.value}`);
                return;
            }
        }

        // Allow data-* and aria-* attributes
        if (attrName.startsWith('data-') || attrName.startsWith('aria-')) {
            return;
        }

        // Check if attribute is in allowed list
        if (!allowedAttributes.includes(attrName)) {
            element.removeAttribute(attrName);
        }
    });
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text safe for HTML insertion
 */
function escapeHTML(text) {
    if (typeof text !== 'string') {
        return '';
    }

    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, char => escapeMap[char]);
}

/**
 * Convert HTML entities in a string back into their corresponding characters.
 * @param {string} text - String that may contain HTML entities.
 * @returns {string} The decoded string with HTML entities replaced by their characters; returns an empty string if `text` is not a string.
 */
function unescapeHTML(text) {
    if (typeof text !== 'string') {
        return '';
    }

    const temp = document.createElement('div');
    temp.innerHTML = text;
    return temp.textContent || temp.innerText || '';
}

/**
 * Normalize and validate a URL against an allowlist of protocols.
 * @param {string} url - The URL to validate and normalize.
 * @param {Array<string>} allowedProtocols - Permitted protocols (for example: 'http:', 'https:', 'mailto:', 'tel:').
 * @returns {string} The normalized absolute URL if valid and protocol is allowed, otherwise an empty string.
 */
function sanitizeURL(url, allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']) {
    if (typeof url !== 'string') {
        return '';
    }

    try {
        const urlObj = new URL(url, window.location.origin);
        
        if (!allowedProtocols.includes(urlObj.protocol)) {
            console.warn(`Blocked URL with disallowed protocol: ${urlObj.protocol}`);
            return '';
        }

        return urlObj.href;
    } catch (error) {
        console.warn('Invalid URL:', url, error);
        return '';
    }
}

/**
 * Set an element's innerHTML to a sanitized version of the provided HTML string.
 * @param {Element} element - Target DOM element whose innerHTML will be replaced.
 * @param {string} html - HTML string to sanitize and insert.
 * @param {Object} [options] - Sanitization options.
 * @param {boolean} [options.allowStyles=true] - Whether to allow inline `style` attributes.
 * @param {boolean} [options.allowScripts=false] - Whether to allow `<script>` elements.
 * @param {Array<string>} [options.allowedTags] - Whitelist of allowed tag names (defaults to module's built-in list).
 */
function safeSetInnerHTML(element, html, options = {}) {
    if (!element || !(element instanceof Element)) {
        console.error('safeSetInnerHTML: Invalid element');
        return;
    }

    const sanitized = sanitizeHTML(html, options);
    element.innerHTML = sanitized;
}

/**
 * Create a new DOM element and apply attributes and content with safety checks.
 *
 * Attributes whose names start with "on" (event handlers) are ignored. If an attribute
 * named `style` is an object, its properties are applied to element.style. If
 * `attributes.allowHTML` is truthy, `content` is inserted as sanitized HTML; otherwise
 * `content` is set as text content.
 * @param {string} tagName - Tag name for the new element (e.g., "div", "span").
 * @param {Object} attributes - Key/value map of attributes to set. Special keys:
 *                              `style` may be an object of CSS properties;
 *                              `allowHTML` controls whether `content` is treated as HTML.
 * @param {string} content - Text or HTML to insert into the element.
 * @returns {Element} The created element with applied attributes and content.
 */
function safeCreateElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);

    // Set attributes safely
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on')) {
            // Don't allow event handlers as attributes
            console.warn(`Blocked event handler attribute: ${key}`);
        } else {
            element.setAttribute(key, String(value));
        }
    });

    // Set content safely
    if (content) {
        if (attributes.allowHTML) {
            safeSetInnerHTML(element, content);
        } else {
            element.textContent = content;
        }
    }

    return element;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeHTML,
        escapeHTML,
        unescapeHTML,
        sanitizeURL,
        safeSetInnerHTML,
        safeCreateElement
    };
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.Sanitizer = {
        sanitizeHTML,
        escapeHTML,
        unescapeHTML,
        sanitizeURL,
        safeSetInnerHTML,
        safeCreateElement
    };
}