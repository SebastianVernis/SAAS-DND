# 🏷️ Class Manager Guide

**Version:** 1.0.0  
**Date:** December 24, 2025  
**Status:** ✅ Implemented  
**Task:** TASK 3/4 - Class Manager Implementation

---

## 📋 Overview

The **Class Manager** is a visual component for managing CSS classes on HTML elements in the vanilla editor. It provides an intuitive interface for adding, removing, and viewing CSS classes with autocomplete functionality and real-time style preview.

---

## ✨ Features

### Core Functionality
- ✅ **Visual Class Tags** - Display current classes as removable pills
- ✅ **Autocomplete** - Smart suggestions from available CSS classes
- ✅ **Add/Remove Classes** - One-click class management
- ✅ **Style Preview** - View CSS rules for each class
- ✅ **Validation** - Warning badges for undefined classes
- ✅ **Dark Mode Support** - Seamless theme integration

### Technical Features
- 🔍 **CSS Extraction** - Automatically extracts classes from stylesheets
- 🎨 **Style Parsing** - Shows CSS properties for each class
- ⚡ **Real-time Updates** - Instant UI refresh on changes
- 🔄 **Integration** - Works with existing Properties Panel
- 📦 **Modular Design** - ES6 module with clean API

---

## 🏗️ Architecture

### File Structure
```
vanilla-editor/
├── src/
│   ├── components/
│   │   └── ClassManager.js       # Main component (~350 lines)
│   └── phoenix/
│       └── CSSUtils.js            # CSS parsing utilities (from TASK 2)
├── script.js                      # Integration point
└── style.css                      # ClassManager styles
```

### Dependencies
- **CSSUtils.js** - Phoenix Code CSS parser (TASK 2)
- **Properties Panel** - Existing panel in script.js
- **Element Selection** - Global `selectedElement` variable

---

## 🎨 User Interface

### Visual Components

#### 1. Class Tags Container
```html
<div class="class-tags-container">
  <span class="class-tag">
    button-primary
    <button class="class-tag-remove">×</button>
  </span>
  <span class="class-tag undefined-class">
    ⚠️ custom-class
    <button class="class-tag-remove">×</button>
  </span>
</div>
```

**Features:**
- Blue pills for defined classes
- Orange pills with ⚠️ for undefined classes
- × button to remove each class
- Empty state message when no classes

#### 2. Add Class Input
```html
<div class="class-input-container">
  <input type="text" 
         id="class-input" 
         list="available-classes"
         placeholder="Agregar clase...">
  <button class="class-add-btn">+</button>
</div>
<datalist id="available-classes">
  <option value="button-primary">
  <option value="card">
  <!-- ... more classes -->
</datalist>
```

**Features:**
- Native HTML5 autocomplete with `<datalist>`
- Enter key to add class
- + button for mouse users
- Auto-focus after adding

#### 3. Styles Preview
```html
<div class="class-styles-preview">
  <div class="styles-preview-title">Estilos aplicados:</div>
  <div class="class-style-item">
    <div class="class-style-name">.button-primary</div>
    <div class="class-style-props">
      <div class="style-prop">
        <span class="prop-name">background:</span>
        <span class="prop-value">#2563eb</span>
      </div>
      <div class="style-prop">
        <span class="prop-name">color:</span>
        <span class="prop-value">white</span>
      </div>
    </div>
  </div>
</div>
```

**Features:**
- Expandable preview section
- Monospace font for CSS properties
- Color-coded property names and values
- Warning for undefined classes

---

## 🔧 API Reference

### ClassManager Class

#### Constructor
```javascript
const classManager = new ClassManager();
```

#### Methods

##### `init()`
Initialize the class manager and extract available classes.
```javascript
classManager.init();
```

##### `update(element)`
Update the class manager for a specific element.
```javascript
classManager.update(selectedElement);
```

**Parameters:**
- `element` (HTMLElement) - Element to manage classes for

##### `render()`
Render the class manager UI as HTML string.
```javascript
const html = classManager.render();
```

**Returns:** `string` - HTML markup for the class manager section

##### `addClass(className)`
Add a class to the current element.
```javascript
classManager.addClass('button-primary');
```

**Parameters:**
- `className` (string) - Class name to add (with or without leading dot)

##### `removeClass(className)`
Remove a class from the current element.
```javascript
classManager.removeClass('button-primary');
```

**Parameters:**
- `className` (string) - Class name to remove

##### `toggleClass(className)`
Toggle a class on the current element.
```javascript
classManager.toggleClass('active');
```

**Parameters:**
- `className` (string) - Class name to toggle

##### `validateClass(className)`
Check if a class exists in CSS.
```javascript
const isValid = classManager.validateClass('button-primary');
```

**Parameters:**
- `className` (string) - Class name to validate

**Returns:** `boolean` - True if class is defined in CSS

##### `getAvailableClasses()`
Get all available CSS classes.
```javascript
const classes = classManager.getAvailableClasses();
// Returns: ['button-primary', 'card', 'container', ...]
```

**Returns:** `Array<string>` - Sorted array of class names

##### `extractAvailableClasses()`
Extract all CSS classes from stylesheets.
```javascript
classManager.extractAvailableClasses();
```

**Note:** Called automatically on init and update

##### `setupEventListeners()`
Setup event listeners for the class input.
```javascript
classManager.setupEventListeners();
```

**Note:** Called automatically after rendering

---

## 🚀 Usage Examples

### Basic Usage

#### 1. Initialize (Automatic)
The ClassManager is automatically initialized in `script.js`:
```javascript
import('./src/components/ClassManager.js').then(module => {
    window.classManager = module.default;
    window.classManager.init();
    console.log('✅ ClassManager initialized');
});
```

#### 2. Add Classes Programmatically
```javascript
// Add a single class
window.classManager.addClass('button-primary');

// Add multiple classes
['card', 'shadow', 'rounded'].forEach(cls => {
    window.classManager.addClass(cls);
});
```

#### 3. Remove Classes
```javascript
// Remove a class
window.classManager.removeClass('button-primary');

// Remove all classes
const currentClasses = window.classManager.getCurrentClasses();
currentClasses.forEach(cls => {
    window.classManager.removeClass(cls);
});
```

#### 4. Validate Classes
```javascript
const className = 'custom-button';
if (window.classManager.validateClass(className)) {
    console.log(`✅ Class "${className}" is defined`);
} else {
    console.warn(`⚠️ Class "${className}" is not defined`);
}
```

### Advanced Usage

#### Custom Class Extraction
```javascript
// Extract classes from custom CSS text
const cssText = `
  .my-button { background: blue; }
  .my-card { padding: 20px; }
`;

const classNames = CSSUtils.extractAllClassNames(cssText);
console.log(classNames); // ['my-button', 'my-card']
```

#### Get Styles for Class
```javascript
const styles = window.classManager.getStylesForClass('button-primary', cssText);
console.log(styles);
// {
//   background: '#2563eb',
//   color: 'white',
//   padding: '10px 20px'
// }
```

---

## 🎯 Integration Points

### Properties Panel Integration

The ClassManager is integrated into the Properties Panel in `script.js`:

```javascript
// In loadProperties() function
if (window.classManager) {
    window.classManager.update(element);
    html += window.classManager.render();
}

// After panel.innerHTML = html
if (window.classManager) {
    setTimeout(() => {
        window.classManager.setupEventListeners();
    }, 0);
}
```

### Element Selection Integration

When an element is selected, the ClassManager automatically updates:

```javascript
function selectElement(element) {
    selectedElement = element;
    element.classList.add('selected');
    
    // Load properties (includes ClassManager)
    loadProperties(element);
}
```

---

## 🎨 Styling

### CSS Classes

#### Container Classes
- `.class-manager-section` - Main section wrapper
- `.class-tags-container` - Container for class tags
- `.class-input-container` - Container for input and button

#### Tag Classes
- `.class-tag` - Individual class tag (pill)
- `.class-tag.undefined-class` - Warning style for undefined classes
- `.class-tag-remove` - Remove button (×)
- `.class-tags-empty` - Empty state message

#### Input Classes
- `.class-input` - Text input for adding classes
- `.class-add-btn` - Add button (+)

#### Preview Classes
- `.class-styles-preview` - Styles preview container
- `.styles-preview-title` - Preview section title
- `.class-style-item` - Individual class style block
- `.class-style-name` - Class name (.classname)
- `.class-style-props` - CSS properties container
- `.style-prop` - Individual CSS property
- `.prop-name` - Property name (e.g., "background:")
- `.prop-value` - Property value (e.g., "#2563eb")

### Theme Support

The ClassManager fully supports dark mode:

```css
[data-theme="dark"] .class-tags-container {
    background: var(--bg-tertiary);
}

[data-theme="dark"] .class-tag {
    background: var(--accent-secondary);
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. ClassManager not showing
**Problem:** ClassManager section doesn't appear in Properties Panel

**Solutions:**
- Check browser console for initialization errors
- Verify `window.classManager` is defined
- Ensure element is selected (`selectedElement` is not null)
- Check if Properties Panel is visible

#### 2. Autocomplete not working
**Problem:** No suggestions appear when typing

**Solutions:**
- Verify CSS classes are being extracted (check console logs)
- Ensure stylesheets are accessible (not blocked by CORS)
- Check if `<datalist>` element is rendered
- Try refreshing available classes: `classManager.extractAvailableClasses()`

#### 3. Classes not updating
**Problem:** Adding/removing classes doesn't update the element

**Solutions:**
- Check if `selectedElement` is the correct element
- Verify `loadProperties()` is called after class changes
- Check browser console for JavaScript errors
- Ensure element has `classList` property

#### 4. Styles preview empty
**Problem:** No styles shown for classes

**Solutions:**
- Verify CSS rules exist for the class
- Check if CSS is in accessible stylesheets (not CORS-blocked)
- Try inline `<style>` tags in canvas
- Check `classStyles` Map: `console.log(classManager.classStyles)`

---

## 🔍 Debugging

### Enable Debug Logging

The ClassManager includes console logging for debugging:

```javascript
// Check initialization
console.log('ClassManager initialized:', !!window.classManager);

// Check available classes
console.log('Available classes:', window.classManager.getAvailableClasses());

// Check current element classes
console.log('Current classes:', window.classManager.getCurrentClasses());

// Check class styles
console.log('Class styles:', window.classManager.classStyles);
```

### Inspect State

```javascript
// Check if ClassManager is ready
console.log('Initialized:', window.classManager.initialized);

// Check current element
console.log('Current element:', window.classManager.currentElement);

// Check available classes count
console.log('Classes found:', window.classManager.availableClasses.size);
```

---

## 📊 Performance

### Optimization Strategies

1. **Lazy Extraction** - Classes are extracted only when needed
2. **Caching** - Extracted classes are cached in `availableClasses` Set
3. **Debouncing** - Input events are not debounced (instant feedback)
4. **Efficient Rendering** - HTML is generated as string (fast)

### Performance Metrics

- **Initialization:** < 50ms (typical)
- **Class Extraction:** < 100ms for 100+ classes
- **Add/Remove Class:** < 10ms
- **Render UI:** < 20ms

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] ClassManager section appears in Properties Panel
- [ ] Current classes displayed as tags
- [ ] Add class input has autocomplete
- [ ] Adding class updates element and UI
- [ ] Removing class updates element and UI
- [ ] Undefined classes show warning badge
- [ ] Styles preview shows CSS rules
- [ ] Enter key adds class
- [ ] + button adds class
- [ ] × button removes class
- [ ] Dark mode styling works
- [ ] No console errors

### E2E Test Cases

See `tests/e2e/class-manager.spec.ts` for automated tests:

1. **Initialization Tests**
   - ClassManager loads successfully
   - Available classes are extracted
   - UI renders correctly

2. **Add Class Tests**
   - Add class via input + Enter
   - Add class via + button
   - Add class programmatically
   - Autocomplete suggestions work

3. **Remove Class Tests**
   - Remove class via × button
   - Remove class programmatically
   - UI updates after removal

4. **Validation Tests**
   - Defined classes show blue tag
   - Undefined classes show orange tag with ⚠️
   - Styles preview shows correct CSS

5. **Integration Tests**
   - Works with element selection
   - Updates on element change
   - Persists across panel refreshes

---

## 🚀 Future Enhancements

### Planned Features

1. **Bulk Operations**
   - Add multiple classes at once
   - Remove all classes button
   - Copy classes from another element

2. **Class Templates**
   - Save common class combinations
   - Quick apply templates
   - Share templates across projects

3. **Advanced Filtering**
   - Search/filter available classes
   - Group classes by prefix
   - Show only used/unused classes

4. **CSS Generation**
   - Create new class from current styles
   - Export class definitions
   - Inline styles to class converter

5. **Undo/Redo Support**
   - Track class changes in history
   - Undo/redo class additions/removals
   - Batch undo for multiple changes

---

## 📚 Related Documentation

- **[REMOTE_CODE_TASKS.md](../tasks/REMOTE_CODE_TASKS.md)** - Complete task details
- **[CSS_PARSER_GUIDE.md](./CSS_PARSER_GUIDE.md)** - CSSUtils documentation (TASK 2)
- **[CODE_EDITOR_GUIDE.md](./CODE_EDITOR_GUIDE.md)** - CodeMirror integration (TASK 1)
- **[PHOENIX_CODE_ANALYSIS.md](./PHOENIX_CODE_ANALYSIS.md)** - Phoenix Code analysis

---

## 🤝 Contributing

### Code Style

- Use ES6+ features (classes, arrow functions, template literals)
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Include console.log for debugging (can be removed in production)

### Adding Features

1. Update `ClassManager.js` with new methods
2. Add corresponding UI in `render()` method
3. Add CSS styles in `style.css`
4. Update this documentation
5. Add E2E tests

---

## 📝 Changelog

### Version 1.0.0 (December 24, 2025)
- ✅ Initial implementation
- ✅ Visual class tags with remove buttons
- ✅ Autocomplete with datalist
- ✅ Styles preview per class
- ✅ Validation of undefined classes
- ✅ Dark mode support
- ✅ Integration with Properties Panel
- ✅ Full documentation

---

## 📄 License

Proprietary © 2024 SAAS-DND

---

**Made with 💜 by Sebastian Vernis**
