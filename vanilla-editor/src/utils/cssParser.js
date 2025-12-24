/**
 * CSS Parser Wrapper
 * 
 * Provides a clean, easy-to-use API for CSS parsing functionality
 * Built on top of adapted Phoenix Code CSSUtils
 * 
 * @module cssParser
 */

import * as CSSUtils from '../phoenix/CSSUtils.js';

/**
 * CSSParser class - Main interface for CSS parsing operations
 */
export class CSSParser {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5 seconds
    }

    /**
     * Extract all CSS selectors from text
     * @param {string} cssText - CSS text to parse
     * @param {string} [mode='css'] - Language mode (css, less, scss)
     * @returns {Array<Object>} Array of selector info objects
     */
    extractSelectors(cssText, mode = 'css') {
        const cacheKey = `selectors_${mode}_${this._hash(cssText)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const selectors = CSSUtils.extractAllSelectors(cssText, mode);
        
        this.cache.set(cacheKey, {
            data: selectors,
            timestamp: Date.now()
        });

        return selectors;
    }

    /**
     * Extract all class names from CSS text
     * @param {string} cssText - CSS text to parse
     * @returns {Array<string>} Array of class names (without leading dot)
     */
    extractClassNames(cssText) {
        const cacheKey = `classes_${this._hash(cssText)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const classes = CSSUtils.extractAllClassNames(cssText);
        
        this.cache.set(cacheKey, {
            data: classes,
            timestamp: Date.now()
        });

        return classes;
    }

    /**
     * Extract all ID selectors from CSS text
     * @param {string} cssText - CSS text to parse
     * @returns {Array<string>} Array of ID names (without leading #)
     */
    extractIds(cssText) {
        const cacheKey = `ids_${this._hash(cssText)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const ids = CSSUtils.extractAllIds(cssText);
        
        this.cache.set(cacheKey, {
            data: ids,
            timestamp: Date.now()
        });

        return ids;
    }

    /**
     * Find all rules matching a specific selector
     * @param {string} cssText - CSS text to search
     * @param {string} selector - Selector to match
     * @param {string} [mode='css'] - Language mode
     * @returns {Array<Object>} Array of matching rules
     */
    findMatchingRules(cssText, selector, mode = 'css') {
        return CSSUtils.findMatchingRules(cssText, selector, mode);
    }

    /**
     * Get all available classes from multiple style sources
     * @param {Array<HTMLStyleElement|HTMLLinkElement>} [styleElements] - Style elements to parse
     * @returns {Promise<Array<string>>} Array of all available class names
     */
    async getAllAvailableClasses(styleElements = null) {
        const allClasses = new Set();
        
        // If no elements provided, get all from document
        if (!styleElements) {
            styleElements = [
                ...document.querySelectorAll('style'),
                ...document.querySelectorAll('link[rel="stylesheet"]')
            ];
        }

        for (const element of styleElements) {
            try {
                let cssText = '';
                
                if (element.tagName === 'STYLE') {
                    cssText = element.textContent;
                } else if (element.tagName === 'LINK') {
                    // For external stylesheets, try to fetch
                    const response = await fetch(element.href);
                    if (response.ok) {
                        cssText = await response.text();
                    }
                }

                if (cssText) {
                    const classes = this.extractClassNames(cssText);
                    classes.forEach(cls => allClasses.add(cls));
                }
            } catch (error) {
                console.warn('Error parsing stylesheet:', error);
            }
        }

        return Array.from(allClasses).sort();
    }

    /**
     * Get styles for a specific class name
     * @param {string} className - Class name to search for (without leading dot)
     * @param {string} cssText - CSS text to search
     * @returns {Array<Object>} Array of rules containing the class
     */
    getStylesForClass(className, cssText) {
        return this.findMatchingRules(cssText, `.${className}`);
    }

    /**
     * Validate if a class exists in CSS text
     * @param {string} className - Class name to validate
     * @param {string} cssText - CSS text to search
     * @returns {boolean} True if class exists
     */
    classExists(className, cssText) {
        const classes = this.extractClassNames(cssText);
        return classes.includes(className);
    }

    /**
     * Get all classes used by an element
     * @param {HTMLElement} element - Element to check
     * @returns {Array<string>} Array of class names
     */
    getElementClasses(element) {
        if (!element || !element.classList) {
            return [];
        }
        return Array.from(element.classList);
    }

    /**
     * Check if element has undefined classes (classes not in any stylesheet)
     * @param {HTMLElement} element - Element to check
     * @param {Array<string>} availableClasses - List of available classes
     * @returns {Array<string>} Array of undefined class names
     */
    getUndefinedClasses(element, availableClasses) {
        const elementClasses = this.getElementClasses(element);
        return elementClasses.filter(cls => !availableClasses.includes(cls));
    }

    /**
     * Reduce CSS text for regex parsing (remove comments, normalize whitespace)
     * @param {string} cssText - CSS text to reduce
     * @returns {string} Reduced CSS text
     */
    reduceStyleSheet(cssText) {
        return CSSUtils.reduceStyleSheetForRegExParsing(cssText);
    }

    /**
     * Check if file is a CSS preprocessor file
     * @param {string} filePath - File path to check
     * @returns {boolean} True if LESS or SCSS
     */
    isPreprocessorFile(filePath) {
        return CSSUtils.isCSSPreprocessorFile(filePath);
    }

    /**
     * Clear the parser cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Simple hash function for cache keys
     * @private
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    _hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
}

/**
 * Create a singleton instance for convenience
 */
export const cssParser = new CSSParser();

/**
 * Convenience functions that use the singleton instance
 */

export function extractSelectors(cssText, mode) {
    return cssParser.extractSelectors(cssText, mode);
}

export function extractClassNames(cssText) {
    return cssParser.extractClassNames(cssText);
}

export function extractIds(cssText) {
    return cssParser.extractIds(cssText);
}

export function findMatchingRules(cssText, selector, mode) {
    return cssParser.findMatchingRules(cssText, selector, mode);
}

export function getAllAvailableClasses(styleElements) {
    return cssParser.getAllAvailableClasses(styleElements);
}

export function getStylesForClass(className, cssText) {
    return cssParser.getStylesForClass(className, cssText);
}

export function classExists(className, cssText) {
    return cssParser.classExists(className, cssText);
}

// Export CSSUtils constants
export { SELECTOR, PROP_NAME, PROP_VALUE, IMPORT_URL } from '../phoenix/CSSUtils.js';
