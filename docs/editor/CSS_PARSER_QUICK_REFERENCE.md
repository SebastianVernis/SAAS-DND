# CSS Parser Quick Reference

One-page reference for the CSS Parser API.

---

## 🚀 Import

```javascript
// Full class
import { CSSParser } from './src/utils/cssParser.js';

// Convenience functions
import { 
    extractClassNames, 
    findMatchingRules,
    getAllAvailableClasses 
} from './src/utils/cssParser.js';

// Singleton instance
import { cssParser } from './src/utils/cssParser.js';
```

---

## 📦 Core Methods

### Extract Class Names
```javascript
const classes = parser.extractClassNames(cssText);
// Returns: ['button', 'card', 'nav']
```

### Extract IDs
```javascript
const ids = parser.extractIds(cssText);
// Returns: ['header', 'footer']
```

### Extract Selectors
```javascript
const selectors = parser.extractSelectors(cssText, 'css');
// Returns: [{ selector: 'button', lineStart: 1, ... }]
```

### Find Matching Rules
```javascript
const rules = parser.findMatchingRules(cssText, '.button');
// Returns: [{ name: 'button', lineStart: 5, lineEnd: 8 }]
```

---

## 🎯 Common Operations

### Get All Available Classes
```javascript
const classes = await parser.getAllAvailableClasses();
// Fetches from all <style> and <link> elements
```

### Check if Class Exists
```javascript
if (parser.classExists('button', cssText)) {
    console.log('Class exists!');
}
```

### Get Styles for Class
```javascript
const styles = parser.getStylesForClass('button', cssText);
// Returns all rules containing .button
```

### Get Element Classes
```javascript
const classes = parser.getElementClasses(element);
// Returns: ['button', 'primary', 'large']
```

### Find Undefined Classes
```javascript
const undefined = parser.getUndefinedClasses(element, availableClasses);
// Returns classes on element not in availableClasses
```

---

## 🛠️ Utilities

### Reduce CSS
```javascript
const clean = parser.reduceStyleSheet(cssText);
// Removes comments, normalizes whitespace
```

### Check Preprocessor File
```javascript
parser.isPreprocessorFile('styles.scss'); // true
parser.isPreprocessorFile('styles.css');  // false
```

### Clear Cache
```javascript
parser.clearCache();
```

---

## 💡 Quick Examples

### Autocomplete
```javascript
const input = document.getElementById('class-input');
const classes = await parser.getAllAvailableClasses();

input.addEventListener('input', (e) => {
    const suggestions = classes.filter(cls => 
        cls.startsWith(e.target.value)
    );
    showSuggestions(suggestions);
});
```

### Validation
```javascript
function validateClass(className) {
    const css = getAllCSS();
    if (!parser.classExists(className, css)) {
        alert('Class not defined!');
        return false;
    }
    return true;
}
```

### Class Manager
```javascript
class ClassManager {
    async init() {
        this.classes = await parser.getAllAvailableClasses();
    }
    
    addClass(element, className) {
        if (!this.classes.includes(className)) {
            console.warn('Undefined class');
        }
        element.classList.add(className);
    }
}
```

---

## 📊 Return Types

### SelectorInfo
```typescript
{
    selector: string,
    ruleStartLine: number,
    selectorStartLine: number,
    declListStartLine: number,
    level: number,
    parentSelectors: string | null
}
```

### RuleInfo
```typescript
{
    name: string,
    lineStart: number,
    lineEnd: number,
    selectorGroup: string | undefined
}
```

---

## ⚡ Performance Tips

1. **Reuse Parser Instance**
   ```javascript
   // Good
   const parser = new CSSParser();
   parser.extractClassNames(css1);
   parser.extractClassNames(css2);
   
   // Less efficient
   new CSSParser().extractClassNames(css1);
   new CSSParser().extractClassNames(css2);
   ```

2. **Use Singleton**
   ```javascript
   import { cssParser } from './cssParser.js';
   cssParser.extractClassNames(css);
   ```

3. **Cache Results**
   ```javascript
   // Automatic caching (5s timeout)
   const classes1 = parser.extractClassNames(css);
   const classes2 = parser.extractClassNames(css); // Cached!
   ```

4. **Reduce Large CSS**
   ```javascript
   const reduced = parser.reduceStyleSheet(largeCss);
   const classes = parser.extractClassNames(reduced);
   ```

---

## 🎨 CSS Support

| Feature | Supported |
|---------|-----------|
| Simple selectors | ✅ |
| Class selectors | ✅ |
| ID selectors | ✅ |
| Compound selectors | ✅ |
| Descendant selectors | ✅ |
| Pseudo-classes | ✅ |
| @media queries | ✅ |
| @import rules | ⚠️ (skipped) |
| LESS syntax | ⚠️ (basic) |
| SCSS syntax | ⚠️ (basic) |
| Complex nesting | ⚠️ (limited) |

---

## 🐛 Common Issues

### Issue: Classes not found
```javascript
// Check if CSS is loaded
const css = getAllCSS();
console.log('CSS length:', css.length);

// Check selectors
const selectors = parser.extractSelectors(css);
console.log('Selectors:', selectors);
```

### Issue: External CSS not loading
```javascript
// Check CORS
try {
    const response = await fetch(cssUrl);
    const css = await response.text();
} catch (error) {
    console.error('CORS error:', error);
}
```

### Issue: Cache not updating
```javascript
// Clear cache manually
parser.clearCache();
const classes = parser.extractClassNames(newCss);
```

---

## 📚 Full Documentation

- **Complete Guide:** `/docs/editor/CSS_PARSER_GUIDE.md`
- **Examples:** `/vanilla-editor/src/utils/cssParser.example.js`
- **Integration:** `/vanilla-editor/src/utils/cssParser.integration.md`
- **Architecture:** `/docs/editor/CSS_PARSER_ARCHITECTURE.md`
- **Tests:** `/tests/unit/cssParser.test.js`

---

## 🔗 Links

- **GitHub:** https://github.com/SebastianVernis/SAAS-DND
- **Phoenix Code:** https://github.com/phcode-dev/phoenix
- **Issue #18:** Task 2 - Phoenix CSSUtils Extraction

---

**Version:** 1.0.0  
**Last Updated:** December 24, 2024  
**Status:** Production Ready ✅
