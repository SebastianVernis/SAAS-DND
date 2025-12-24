# CSS Parser Integration Guide

This document shows how to integrate the CSS Parser into the vanilla editor for Task 3 (Class Manager).

---

## Integration Points

### 1. Properties Panel - Class Section

Add a new section to the Properties Panel for managing CSS classes:

```javascript
// In script.js or properties panel component

import { cssParser } from './src/utils/cssParser.js';

// Initialize class manager
let availableClasses = [];

async function initClassManager() {
    // Get all available classes from stylesheets
    availableClasses = await cssParser.getAllAvailableClasses();
    console.log('Loaded', availableClasses.length, 'CSS classes');
}

// Call on page load
initClassManager();
```

---

### 2. Class Autocomplete Input

Add autocomplete functionality to class input:

```javascript
function setupClassAutocomplete() {
    const classInput = document.getElementById('class-input');
    const datalist = document.getElementById('available-classes');
    
    // Populate datalist with available classes
    availableClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        datalist.appendChild(option);
    });
    
    // Add class on Enter or selection
    classInput.addEventListener('change', (e) => {
        const className = e.target.value.trim();
        if (className && selectedElement) {
            addClassToElement(selectedElement, className);
            e.target.value = '';
        }
    });
}
```

---

### 3. Add/Remove Class Functions

```javascript
function addClassToElement(element, className) {
    // Validate class exists
    if (!cssParser.classExists(className, getAllCSS())) {
        showWarning(`Class "${className}" is not defined in any stylesheet`);
    }
    
    // Add class
    element.classList.add(className);
    
    // Update UI
    renderClassTags(element);
    
    // Add to undo/redo history
    addToHistory({
        type: 'addClass',
        element: element,
        className: className
    });
}

function removeClassFromElement(element, className) {
    element.classList.remove(className);
    renderClassTags(element);
    
    addToHistory({
        type: 'removeClass',
        element: element,
        className: className
    });
}
```

---

### 4. Class Tags Display

Show current classes as removable tags:

```javascript
function renderClassTags(element) {
    const container = document.getElementById('class-tags-container');
    container.innerHTML = '';
    
    const classes = cssParser.getElementClasses(element);
    const undefinedClasses = cssParser.getUndefinedClasses(element, availableClasses);
    
    classes.forEach(className => {
        const tag = document.createElement('div');
        tag.className = 'class-tag';
        
        // Add warning badge if undefined
        if (undefinedClasses.includes(className)) {
            tag.classList.add('undefined');
            tag.title = 'This class is not defined in any stylesheet';
        }
        
        tag.innerHTML = `
            <span class="class-name">${className}</span>
            <button class="remove-btn" onclick="removeClassFromElement(selectedElement, '${className}')">
                ×
            </button>
        `;
        
        container.appendChild(tag);
    });
}
```

---

### 5. Style Preview

Show styles for each class:

```javascript
function renderStylesPreview(element) {
    const container = document.getElementById('class-styles-preview');
    container.innerHTML = '';
    
    const classes = cssParser.getElementClasses(element);
    const allCSS = getAllCSS();
    
    classes.forEach(className => {
        const styles = cssParser.getStylesForClass(className, allCSS);
        
        if (styles.length > 0) {
            const preview = document.createElement('div');
            preview.className = 'style-preview';
            preview.innerHTML = `
                <div class="preview-header">.${className}</div>
                <div class="preview-rules">
                    ${styles.map(rule => `
                        <div class="rule">
                            Lines ${rule.lineStart}-${rule.lineEnd}
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(preview);
        }
    });
}
```

---

### 6. Helper Functions

```javascript
// Get all CSS from document
function getAllCSS() {
    const styles = Array.from(document.querySelectorAll('style'))
        .map(s => s.textContent)
        .join('\n');
    return styles;
}

// Show warning message
function showWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'warning-message';
    warning.textContent = message;
    document.body.appendChild(warning);
    
    setTimeout(() => warning.remove(), 3000);
}

// Update on element selection
function onElementSelected(element) {
    selectedElement = element;
    renderClassTags(element);
    renderStylesPreview(element);
}
```

---

## HTML Structure

Add this to the Properties Panel:

```html
<!-- In Properties Panel -->
<div id="classes-section" class="property-section">
    <div class="section-header">
        <span>🏷️ CSS Classes</span>
        <button id="refresh-classes-btn" title="Refresh available classes">
            🔄
        </button>
    </div>
    
    <div class="section-content">
        <!-- Current classes as tags -->
        <div id="class-tags-container" class="class-tags">
            <!-- Tags will be rendered here -->
        </div>
        
        <!-- Add class input with autocomplete -->
        <div class="add-class-input">
            <input 
                type="text" 
                id="class-input"
                list="available-classes"
                placeholder="Add class..."
                autocomplete="off"
            >
            <datalist id="available-classes">
                <!-- Options will be populated by JS -->
            </datalist>
        </div>
        
        <!-- Styles preview per class -->
        <div id="class-styles-preview" class="styles-preview">
            <!-- Style previews will be rendered here -->
        </div>
    </div>
</div>
```

---

## CSS Styles

Add these styles:

```css
/* Classes Section */
#classes-section {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 15px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
}

#refresh-classes-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
}

/* Class Tags */
.class-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    min-height: 32px;
}

.class-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 4px;
    font-size: 12px;
}

.class-tag.undefined {
    background: #fff3e0;
    border-color: #ff9800;
}

.class-tag .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    color: #666;
}

.class-tag .remove-btn:hover {
    color: #f44336;
}

/* Add Class Input */
.add-class-input {
    margin-bottom: 10px;
}

#class-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

#class-input:focus {
    outline: none;
    border-color: #2196f3;
}

/* Styles Preview */
.styles-preview {
    max-height: 200px;
    overflow-y: auto;
}

.style-preview {
    margin-bottom: 10px;
    padding: 8px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
}

.preview-header {
    font-weight: bold;
    color: #2196f3;
    margin-bottom: 4px;
}

.preview-rules {
    color: #666;
}

/* Warning Message */
.warning-message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #ff9800;
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

---

## Complete Integration Example

```javascript
// Complete integration in script.js

import { cssParser } from './src/utils/cssParser.js';

class ClassManager {
    constructor() {
        this.parser = cssParser;
        this.availableClasses = [];
        this.selectedElement = null;
    }
    
    async init() {
        // Load available classes
        await this.refreshClasses();
        
        // Setup UI
        this.setupAutocomplete();
        this.setupEventListeners();
        
        console.log('Class Manager initialized');
    }
    
    async refreshClasses() {
        this.availableClasses = await this.parser.getAllAvailableClasses();
        this.updateAutocompleteOptions();
    }
    
    setupAutocomplete() {
        const input = document.getElementById('class-input');
        const datalist = document.getElementById('available-classes');
        
        input.addEventListener('change', (e) => {
            const className = e.target.value.trim();
            if (className && this.selectedElement) {
                this.addClass(className);
                e.target.value = '';
            }
        });
    }
    
    setupEventListeners() {
        document.getElementById('refresh-classes-btn')
            .addEventListener('click', () => this.refreshClasses());
    }
    
    updateAutocompleteOptions() {
        const datalist = document.getElementById('available-classes');
        datalist.innerHTML = '';
        
        this.availableClasses.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            datalist.appendChild(option);
        });
    }
    
    setSelectedElement(element) {
        this.selectedElement = element;
        this.render();
    }
    
    addClass(className) {
        if (!this.selectedElement) return;
        
        // Validate
        const allCSS = this.getAllCSS();
        if (!this.parser.classExists(className, allCSS)) {
            this.showWarning(`Class "${className}" is not defined`);
        }
        
        // Add class
        this.selectedElement.classList.add(className);
        this.render();
        
        // History
        this.addToHistory('addClass', className);
    }
    
    removeClass(className) {
        if (!this.selectedElement) return;
        
        this.selectedElement.classList.remove(className);
        this.render();
        
        this.addToHistory('removeClass', className);
    }
    
    render() {
        if (!this.selectedElement) return;
        
        this.renderClassTags();
        this.renderStylesPreview();
    }
    
    renderClassTags() {
        const container = document.getElementById('class-tags-container');
        container.innerHTML = '';
        
        const classes = this.parser.getElementClasses(this.selectedElement);
        const undefined = this.parser.getUndefinedClasses(
            this.selectedElement, 
            this.availableClasses
        );
        
        classes.forEach(className => {
            const tag = this.createClassTag(className, undefined.includes(className));
            container.appendChild(tag);
        });
    }
    
    createClassTag(className, isUndefined) {
        const tag = document.createElement('div');
        tag.className = 'class-tag' + (isUndefined ? ' undefined' : '');
        tag.title = isUndefined ? 'Not defined in any stylesheet' : '';
        
        tag.innerHTML = `
            <span class="class-name">${className}</span>
            <button class="remove-btn">×</button>
        `;
        
        tag.querySelector('.remove-btn').addEventListener('click', () => {
            this.removeClass(className);
        });
        
        return tag;
    }
    
    renderStylesPreview() {
        const container = document.getElementById('class-styles-preview');
        container.innerHTML = '';
        
        const classes = this.parser.getElementClasses(this.selectedElement);
        const allCSS = this.getAllCSS();
        
        classes.forEach(className => {
            const styles = this.parser.getStylesForClass(className, allCSS);
            if (styles.length > 0) {
                const preview = this.createStylePreview(className, styles);
                container.appendChild(preview);
            }
        });
    }
    
    createStylePreview(className, styles) {
        const preview = document.createElement('div');
        preview.className = 'style-preview';
        preview.innerHTML = `
            <div class="preview-header">.${className}</div>
            <div class="preview-rules">
                ${styles.map(rule => `
                    <div class="rule">Lines ${rule.lineStart}-${rule.lineEnd}</div>
                `).join('')}
            </div>
        `;
        return preview;
    }
    
    getAllCSS() {
        return Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
    }
    
    showWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'warning-message';
        warning.textContent = message;
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 3000);
    }
    
    addToHistory(action, className) {
        // Integrate with existing undo/redo system
        console.log('History:', action, className);
    }
}

// Initialize
const classManager = new ClassManager();
classManager.init();

// Export for use in other modules
window.classManager = classManager;
```

---

## Testing the Integration

```javascript
// Test in browser console

// 1. Check available classes
console.log(await cssParser.getAllAvailableClasses());

// 2. Add a class
const element = document.querySelector('.some-element');
classManager.setSelectedElement(element);
classManager.addClass('button');

// 3. Check for undefined classes
const undefined = cssParser.getUndefinedClasses(element, classManager.availableClasses);
console.log('Undefined classes:', undefined);

// 4. Get styles for a class
const styles = cssParser.getStylesForClass('button', classManager.getAllCSS());
console.log('Button styles:', styles);
```

---

## Next Steps for Task 3

1. ✅ CSS Parser is ready (Task 2 complete)
2. ⏭️ Implement ClassManager component (Task 3)
3. ⏭️ Add to Properties Panel
4. ⏭️ Integrate with undo/redo
5. ⏭️ Add E2E tests

---

**Ready for Task 3 Implementation!**
