/**
 * Style Extractor
 * Extracts and analyzes styles from components
 * 
 * @module StyleExtractor
 */

export class StyleExtractor {
  constructor() {
    this.styles = [];
  }

  /**
   * Extract styles from files and components
   * @param {Object} files - Organized files
   * @param {Array} components - Parsed components
   * @returns {Promise<Object>} Extracted styles
   */
  async extract(files, components) {
    const extracted = {
      inline: [],
      internal: [],
      external: [],
      cssFiles: [],
      scssFiles: [],
      cssModules: [],
      tailwind: {
        detected: false,
        classes: []
      },
      cssInJs: {
        detected: false,
        libraries: []
      },
      stats: {}
    };

    // Extract from components
    components.forEach(component => {
      if (component.styles) {
        if (component.styles.inline) {
          extracted.inline.push(...component.styles.inline);
        }
        if (component.styles.internal) {
          extracted.internal.push(...component.styles.internal);
        }
        if (component.styles.external) {
          extracted.external.push(...component.styles.external);
        }
      }
    });

    // Parse CSS files
    for (const file of files.css) {
      const content = await this.readFile(file);
      const parsed = this.parseCSS(content, file.name);
      extracted.cssFiles.push(parsed);
    }

    // Parse SCSS files
    for (const file of files.scss) {
      const content = await this.readFile(file);
      const parsed = this.parseSCSS(content, file.name);
      extracted.scssFiles.push(parsed);
    }

    // Detect Tailwind
    extracted.tailwind = this.detectTailwind(components, files);

    // Detect CSS-in-JS
    extracted.cssInJs = await this.detectCSSinJS(files);

    // Calculate statistics
    extracted.stats = this.calculateStats(extracted);

    return extracted;
  }

  /**
   * Extract inline styles from parsed HTML
   * @param {Object} parsed - Parsed HTML
   * @returns {Array} Inline styles
   */
  extractInline(parsed) {
    if (!parsed.styles?.inline) return [];
    return parsed.styles.inline;
  }

  /**
   * Parse CSS content
   * @param {string} content - CSS content
   * @param {string} filename - File name
   * @returns {Object} Parsed CSS
   */
  parseCSS(content, filename) {
    const rules = this.extractCSSRules(content);
    const variables = this.extractCSSVariables(content);
    const mediaQueries = this.extractMediaQueries(content);
    const keyframes = this.extractKeyframes(content);

    return {
      filename,
      type: 'css',
      content,
      rules,
      variables,
      mediaQueries,
      keyframes,
      stats: {
        totalRules: rules.length,
        totalVariables: variables.length,
        totalMediaQueries: mediaQueries.length,
        totalKeyframes: keyframes.length,
        size: content.length
      }
    };
  }

  /**
   * Parse SCSS content
   * @param {string} content - SCSS content
   * @param {string} filename - File name
   * @returns {Object} Parsed SCSS
   */
  parseSCSS(content, filename) {
    // Basic SCSS parsing (without full SCSS compiler)
    const variables = this.extractSCSSVariables(content);
    const mixins = this.extractSCSSMixins(content);
    const nesting = this.detectNesting(content);

    return {
      filename,
      type: 'scss',
      content,
      variables,
      mixins,
      hasNesting: nesting,
      stats: {
        totalVariables: variables.length,
        totalMixins: mixins.length,
        size: content.length
      }
    };
  }

  /**
   * Extract CSS rules
   * @param {string} content - CSS content
   * @returns {Array} CSS rules
   */
  extractCSSRules(content) {
    const rules = [];
    
    // Simple regex to match CSS rules
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(content)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();

      // Skip @media, @keyframes, etc.
      if (selector.startsWith('@')) continue;

      rules.push({
        selector,
        declarations: this.parseDeclarations(declarations),
        specificity: this.calculateSpecificity(selector)
      });
    }

    return rules;
  }

  /**
   * Parse CSS declarations
   * @param {string} declarations - CSS declarations
   * @returns {Array} Parsed declarations
   */
  parseDeclarations(declarations) {
    const parsed = [];
    const lines = declarations.split(';').filter(l => l.trim());

    lines.forEach(line => {
      const [property, value] = line.split(':').map(s => s.trim());
      if (property && value) {
        parsed.push({ property, value });
      }
    });

    return parsed;
  }

  /**
   * Calculate CSS selector specificity
   * @param {string} selector - CSS selector
   * @returns {number} Specificity score
   */
  calculateSpecificity(selector) {
    let score = 0;
    
    // IDs
    score += (selector.match(/#/g) || []).length * 100;
    
    // Classes, attributes, pseudo-classes
    score += (selector.match(/\.|\[|:/g) || []).length * 10;
    
    // Elements
    score += (selector.match(/[a-z]/g) || []).length;

    return score;
  }

  /**
   * Extract CSS variables
   * @param {string} content - CSS content
   * @returns {Array} CSS variables
   */
  extractCSSVariables(content) {
    const variables = [];
    const varRegex = /--([\w-]+):\s*([^;]+);/g;
    let match;

    while ((match = varRegex.exec(content)) !== null) {
      variables.push({
        name: `--${match[1]}`,
        value: match[2].trim()
      });
    }

    return variables;
  }

  /**
   * Extract media queries
   * @param {string} content - CSS content
   * @returns {Array} Media queries
   */
  extractMediaQueries(content) {
    const queries = [];
    const mediaRegex = /@media\s*([^{]+)\{/g;
    let match;

    while ((match = mediaRegex.exec(content)) !== null) {
      queries.push({
        query: match[1].trim(),
        type: this.classifyMediaQuery(match[1])
      });
    }

    return queries;
  }

  /**
   * Classify media query type
   * @param {string} query - Media query
   * @returns {string} Type
   */
  classifyMediaQuery(query) {
    if (query.includes('max-width')) return 'mobile-first';
    if (query.includes('min-width')) return 'desktop-first';
    if (query.includes('print')) return 'print';
    if (query.includes('screen')) return 'screen';
    return 'other';
  }

  /**
   * Extract keyframes
   * @param {string} content - CSS content
   * @returns {Array} Keyframes
   */
  extractKeyframes(content) {
    const keyframes = [];
    const keyframeRegex = /@keyframes\s+([\w-]+)/g;
    let match;

    while ((match = keyframeRegex.exec(content)) !== null) {
      keyframes.push({
        name: match[1]
      });
    }

    return keyframes;
  }

  /**
   * Extract SCSS variables
   * @param {string} content - SCSS content
   * @returns {Array} SCSS variables
   */
  extractSCSSVariables(content) {
    const variables = [];
    const varRegex = /\$([\w-]+):\s*([^;]+);/g;
    let match;

    while ((match = varRegex.exec(content)) !== null) {
      variables.push({
        name: `$${match[1]}`,
        value: match[2].trim()
      });
    }

    return variables;
  }

  /**
   * Extract SCSS mixins
   * @param {string} content - SCSS content
   * @returns {Array} SCSS mixins
   */
  extractSCSSMixins(content) {
    const mixins = [];
    const mixinRegex = /@mixin\s+([\w-]+)/g;
    let match;

    while ((match = mixinRegex.exec(content)) !== null) {
      mixins.push({
        name: match[1]
      });
    }

    return mixins;
  }

  /**
   * Detect SCSS nesting
   * @param {string} content - SCSS content
   * @returns {boolean} Has nesting
   */
  detectNesting(content) {
    // Simple check for nested selectors
    return /\{[^}]*\{/.test(content);
  }

  /**
   * Detect Tailwind CSS
   * @param {Array} components - Components
   * @param {Object} files - Files
   * @returns {Object} Tailwind info
   */
  detectTailwind(components, files) {
    const tailwindClasses = new Set();
    const commonTailwindPrefixes = [
      'flex', 'grid', 'block', 'hidden', 'inline',
      'text-', 'bg-', 'border-', 'rounded-', 'p-', 'm-',
      'w-', 'h-', 'max-', 'min-', 'space-', 'gap-'
    ];

    let detected = false;

    // Check components for Tailwind classes
    components.forEach(component => {
      if (component.elements) {
        component.elements.forEach(el => {
          el.classes.forEach(cls => {
            if (commonTailwindPrefixes.some(prefix => cls.startsWith(prefix))) {
              tailwindClasses.add(cls);
              detected = true;
            }
          });
        });
      }
    });

    return {
      detected,
      classes: Array.from(tailwindClasses),
      count: tailwindClasses.size
    };
  }

  /**
   * Detect CSS-in-JS
   * @param {Object} files - Files
   * @returns {Promise<Object>} CSS-in-JS info
   */
  async detectCSSinJS(files) {
    const libraries = [];
    let detected = false;

    // Check package.json
    const packageJson = files.json.find(f => f.name === 'package.json');
    if (packageJson) {
      const content = await this.readFile(packageJson);
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['styled-components']) {
        libraries.push('styled-components');
        detected = true;
      }
      if (deps['@emotion/react'] || deps['@emotion/styled']) {
        libraries.push('emotion');
        detected = true;
      }
      if (deps['@mui/material']) {
        libraries.push('mui');
        detected = true;
      }
    }

    return {
      detected,
      libraries
    };
  }

  /**
   * Calculate statistics
   * @param {Object} extracted - Extracted styles
   * @returns {Object} Statistics
   */
  calculateStats(extracted) {
    let totalRules = 0;
    let totalVariables = 0;
    let totalMediaQueries = 0;

    extracted.cssFiles.forEach(file => {
      totalRules += file.stats.totalRules;
      totalVariables += file.stats.totalVariables;
      totalMediaQueries += file.stats.totalMediaQueries;
    });

    return {
      totalCSSFiles: extracted.cssFiles.length,
      totalSCSSFiles: extracted.scssFiles.length,
      totalInlineStyles: extracted.inline.length,
      totalInternalStyles: extracted.internal.length,
      totalExternalStyles: extracted.external.length,
      totalRules,
      totalVariables,
      totalMediaQueries,
      hasTailwind: extracted.tailwind.detected,
      hasCSSinJS: extracted.cssInJs.detected
    };
  }

  /**
   * Read file content
   * @param {File} file - File to read
   * @returns {Promise<string>} Content
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
