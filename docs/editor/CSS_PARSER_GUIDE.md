# CSS Parser Guide

**Version:** 1.0.0  
**Date:** December 24, 2024  
**Status:** Production Ready

---

## 📋 Overview

The CSS Parser is a standalone JavaScript module adapted from Phoenix Code's CSSUtils. It provides robust CSS parsing capabilities for extracting selectors, class names, IDs, and matching rules from CSS text.

### Key Features

- ✅ Extract all CSS selectors from text
- ✅ Extract class names and ID selectors
- ✅ Find matching rules for specific selectors
- ✅ Support for CSS, LESS, and SCSS
- ✅ Built-in caching for performance
- ✅ No external dependencies (except CodeMirror for advanced features)
- ✅ ES6 modules with clean API

---

## 🚀 Quick Start

### Basic Usage

```javascript
import { CSSParser } from './src/utils/cssParser.js';

const parser = new CSSParser();

// Extract all class names
const css = `
  .button { color: red; }
  .card { background: white; }
`;

const classes = parser.extractClassNames(css);
console.log(classes); // ['button', 'card']
```

### Using Convenience Functions

```javascript
import { extractClassNames, findMatchingRules } from './src/utils/cssParser.js';

// Extract classes
const classes = extractClassNames(cssText);

// Find matching rules
const rules = findMatchingRules(cssText, '.button');
```

---

## 📚 API Reference

### CSSParser Class

#### Constructor

```javascript
const parser = new CSSParser();
```

Creates a new CSS parser instance with its own cache.

---

### Methods

#### `extractSelectors(cssText, mode = 'css')`

Extracts all CSS selectors from the given text.

**Parameters:**
- `cssText` (string): CSS text to parse
- `mode` (string, optional): Language mode - 'css', 'less', or 'scss'. Default: 'css'

**Returns:** Array of selector info objects

**Example:**
```javascript
const selectors = parser.extractSelectors(`
  .button { color: red; }
  #header { height: 100px; }
`);

console.log(selectors);
// [
//   {
//     selector: 'button',
//     ruleStartLine: 1,
//     selectorStartLine: 1,
//     declListStartLine: 1,
//     level: 0,
//     ...
//   },
//   ...
// ]
```

---

#### `extractClassNames(cssText)`

Extracts all class names from CSS text (without the leading dot).

**Parameters:**
- `cssText` (string): CSS text to parse

**Returns:** Array of class names (sorted)

**Example:**
```javascript
const classes = parser.extractClassNames(`
  .button { color: red; }
  .button.primary { background: blue; }
  .card { padding: 20px; }
`);

console.log(classes); // ['button', 'card', 'primary']
```

---

#### `extractIds(cssText)`

Extracts all ID selectors from CSS text (without the leading #).

**Parameters:**
- `cssText` (string): CSS text to parse

**Returns:** Array of ID names (sorted)

**Example:**
```javascript
const ids = parser.extractIds(`
  #header { height: 100px; }
  #footer { height: 50px; }
`);

console.log(ids); // ['footer', 'header']
```

---

#### `findMatchingRules(cssText, selector, mode = 'css')`

Finds all rules that match a specific selector.

**Parameters:**
- `cssText` (string): CSS text to search
- `selector` (string): Selector to match (e.g., '.button', '#header', 'div')
- `mode` (string, optional): Language mode. Default: 'css'

**Returns:** Array of matching rule objects

**Example:**
```javascript
const rules = parser.findMatchingRules(cssText, '.button');

console.log(rules);
// [
//   {
//     name: 'button',
//     lineStart: 5,
//     lineEnd: 8,
//     selectorGroup: '.button, .btn'
//   },
//   ...
// ]
```

---

#### `getAllAvailableClasses(styleElements = null)`

Gets all available classes from style elements in the document.

**Parameters:**
- `styleElements` (Array, optional): Array of style/link elements. If null, searches entire document.

**Returns:** Promise<Array<string>> - Array of all available class names

**Example:**
```javascript
// Get all classes from document
const classes = await parser.getAllAvailableClasses();

// Get classes from specific elements
const styleElements = document.querySelectorAll('style');
const classes = await parser.getAllAvailableClasses(Array.from(styleElements));
```

---

#### `getStylesForClass(className, cssText)`

Gets all rules that contain a specific class.

**Parameters:**
- `className` (string): Class name to search for (without leading dot)
- `cssText` (string): CSS text to search

**Returns:** Array of matching rules

**Example:**
```javascript
const styles = parser.getStylesForClass('button', cssText);
```

---

#### `classExists(className, cssText)`

Checks if a class exists in the CSS text.

**Parameters:**
- `className` (string): Class name to validate
- `cssText` (string): CSS text to search

**Returns:** boolean

**Example:**
```javascript
if (parser.classExists('button', cssText)) {
  console.log('Class exists!');
}
```

---

#### `getElementClasses(element)`

Gets all classes from an HTML element.

**Parameters:**
- `element` (HTMLElement): Element to check

**Returns:** Array of class names

**Example:**
```javascript
const button = document.querySelector('.button');
const classes = parser.getElementClasses(button);
```

---

#### `getUndefinedClasses(element, availableClasses)`

Finds classes on an element that don't exist in any stylesheet.

**Parameters:**
- `element` (HTMLElement): Element to check
- `availableClasses` (Array<string>): List of available classes

**Returns:** Array of undefined class names

**Example:**
```javascript
const availableClasses = await parser.getAllAvailableClasses();
const undefinedClasses = parser.getUndefinedClasses(element, availableClasses);

if (undefinedClasses.length > 0) {
  console.warn('Undefined classes:', undefinedClasses);
}
```

---

#### `reduceStyleSheet(cssText)`

Reduces CSS text by removing comments and normalizing whitespace.

**Parameters:**
- `cssText` (string): CSS text to reduce

**Returns:** string - Reduced CSS text

**Example:**
```javascript
const reduced = parser.reduceStyleSheet(`
  /* Comment */
  .button   {
    color:  red;
  }
`);
// Result: ".button { color: red; }"
```

---

#### `isPreprocessorFile(filePath)`

Checks if a file is a CSS preprocessor file (LESS or SCSS).

**Parameters:**
- `filePath` (string): File path to check

**Returns:** boolean

**Example:**
```javascript
parser.isPreprocessorFile('styles.less'); // true
parser.isPreprocessorFile('styles.css');  // false
```

---

#### `clearCache()`

Clears the parser's internal cache.

**Example:**
```javascript
parser.clearCache();
```

---

## 🎯 Common Use Cases

### 1. Class Autocomplete

```javascript
import { CSSParser } from './src/utils/cssParser.js';

class ClassAutocomplete {
  constructor() {
    this.parser = new CSSParser();
  }

  async getAvailableClasses() {
    return await this.parser.getAllAvailableClasses();
  }

  filterClasses(query, availableClasses) {
    return availableClasses.filter(cls => 
      cls.toLowerCase().includes(query.toLowerCase())
    );
  }

  setupAutocomplete(inputElement) {
    inputElement.addEventListener('input', async (e) => {
      const query = e.target.value;
      const classes = await this.getAvailableClasses();
      const filtered = this.filterClasses(query, classes);
      
      // Show suggestions
      this.showSuggestions(filtered);
    });
  }
}
```

---

### 2. Class Validation

```javascript
async function validateElementClasses(element) {
  const parser = new CSSParser();
  const availableClasses = await parser.getAllAvailableClasses();
  const undefinedClasses = parser.getUndefinedClasses(element, availableClasses);
  
  if (undefinedClasses.length > 0) {
    console.warn(`Element has undefined classes: ${undefinedClasses.join(', ')}`);
    
    // Add visual indicator
    element.classList.add('has-undefined-classes');
  }
}
```

---

### 3. Style Inspector

```javascript
function inspectElementStyles(element, cssText) {
  const parser = new CSSParser();
  const classes = parser.getElementClasses(element);
  
  const allStyles = classes.map(className => {
    const rules = parser.getStylesForClass(className, cssText);
    return {
      className,
      rules
    };
  });
  
  return allStyles;
}
```

---

### 4. CSS Class Manager

```javascript
class CSSClassManager {
  constructor() {
    this.parser = new CSSParser();
    this.availableClasses = [];
  }

  async init() {
    this.availableClasses = await this.parser.getAllAvailableClasses();
  }

  addClass(element, className) {
    if (!this.availableClasses.includes(className)) {
      console.warn(`Class "${className}" is not defined in any stylesheet`);
    }
    element.classList.add(className);
  }

  removeClass(element, className) {
    element.classList.remove(className);
  }

  toggleClass(element, className) {
    element.classList.toggle(className);
  }

  getClassStyles(className, cssText) {
    return this.parser.getStylesForClass(className, cssText);
  }
}
```

---

## 🔧 Advanced Usage

### Working with Multiple Stylesheets

```javascript
async function getAllClassesFromProject() {
  const parser = new CSSParser();
  const allClasses = new Set();

  // Get inline styles
  const styleElements = document.querySelectorAll('style');
  for (const style of styleElements) {
    const classes = parser.extractClassNames(style.textContent);
    classes.forEach(cls => allClasses.add(cls));
  }

  // Get external stylesheets
  const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
  for (const link of linkElements) {
    try {
      const response = await fetch(link.href);
      const cssText = await response.text();
      const classes = parser.extractClassNames(cssText);
      classes.forEach(cls => allClasses.add(cls));
    } catch (error) {
      console.error('Error loading stylesheet:', error);
    }
  }

  return Array.from(allClasses).sort();
}
```

---

### Custom Selector Matching

```javascript
function findComplexSelectors(cssText, pattern) {
  const parser = new CSSParser();
  const allSelectors = parser.extractSelectors(cssText);
  
  return allSelectors.filter(selectorInfo => {
    return pattern.test(selectorInfo.selector);
  });
}

// Find all selectors with pseudo-classes
const pseudoSelectors = findComplexSelectors(cssText, /:hover|:focus|:active/);

// Find all BEM selectors
const bemSelectors = findComplexSelectors(cssText, /__|-/);
```

---

## ⚡ Performance Tips

### 1. Use Caching

The parser automatically caches results. Reuse the same parser instance:

```javascript
// Good - reuses cache
const parser = new CSSParser();
const classes1 = parser.extractClassNames(css);
const classes2 = parser.extractClassNames(css); // Uses cache

// Less efficient - creates new instance
const classes3 = new CSSParser().extractClassNames(css);
```

---

### 2. Use Singleton for Global Operations

```javascript
import { cssParser } from './src/utils/cssParser.js';

// Use the singleton instance
const classes = cssParser.extractClassNames(css);
```

---

### 3. Clear Cache When Needed

```javascript
// Clear cache after major CSS changes
parser.clearCache();
```

---

### 4. Reduce CSS Before Parsing

```javascript
// For large CSS files, reduce first
const reduced = parser.reduceStyleSheet(largeCssText);
const classes = parser.extractClassNames(reduced);
```

---

## 🐛 Troubleshooting

### Issue: Classes not being extracted

**Solution:** Check if CSS is valid and properly formatted.

```javascript
// Debug: Log selectors first
const selectors = parser.extractSelectors(css);
console.log('Found selectors:', selectors);

// Then extract classes
const classes = parser.extractClassNames(css);
console.log('Found classes:', classes);
```

---

### Issue: Performance problems with large CSS

**Solution:** Use caching and reduce CSS first.

```javascript
// Reduce CSS to remove comments and whitespace
const reduced = parser.reduceStyleSheet(largeCss);

// Extract classes from reduced CSS
const classes = parser.extractClassNames(reduced);
```

---

### Issue: Preprocessor syntax not working

**Solution:** Specify the correct mode.

```javascript
// For SCSS
const classes = parser.extractClassNames(scssText, 'scss');

// For LESS
const classes = parser.extractClassNames(lessText, 'less');
```

---

## 📊 Comparison with Other Solutions

| Feature | CSS Parser | postcss | css-tree |
|---------|-----------|---------|----------|
| Size | ~15KB | ~100KB | ~50KB |
| Dependencies | None | Many | Few |
| ES6 Modules | ✅ | ✅ | ✅ |
| Class Extraction | ✅ | ✅ | ✅ |
| Selector Matching | ✅ | ✅ | ✅ |
| LESS/SCSS Support | ✅ | ⚠️ | ❌ |
| Browser Ready | ✅ | ⚠️ | ✅ |

---

## 🔗 Related Documentation

- [Phoenix Code Analysis](./PHOENIX_CODE_ANALYSIS.md)
- [Brackets Integration Analysis](./BRACKETS_INTEGRATION_ANALYSIS.md)
- [Class Manager Guide](./CLASS_MANAGER_GUIDE.md) (Coming in Task 3)

---

## 📝 License

Adapted from Phoenix Code (phcode-dev/phoenix)  
Original License: GNU AGPL-3.0

Copyright (c) 2021 - present core.ai . All rights reserved.  
Original work Copyright (c) 2012 - 2021 Adobe Systems Incorporated.

---

## 🤝 Contributing

This module is part of the SAAS-DND project. For contributions:

1. Follow the existing code style
2. Add tests for new features
3. Update this documentation
4. Submit a pull request

---

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/SebastianVernis/SAAS-DND/issues
- Documentation: `/docs/editor/`

---

**Last Updated:** December 24, 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
