# Issue #12 - Recommended Code Improvements

This document contains recommended code improvements for the text editing and resize systems based on the validation testing.

## 🔧 Improvement 1: Add Esc Key Handler to Text Editing

**Priority:** High  
**Effort:** 30 minutes  
**Impact:** Better UX

### Current Issue
Users cannot cancel text editing with the Escape key.

### Proposed Fix

**File:** `vanilla-editor/script.js` (line ~2210)

**Replace the `makeElementEditable` function with:**

```javascript
function makeElementEditable(element) {
    const tagName = element.tagName.toLowerCase();

    // Only for text elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a', 'li', 'label'].includes(tagName)) {
        // Check if already editable to prevent duplicate listeners
        if (element.contentEditable === 'true') {
            return;
        }

        // Store original text for cancel functionality
        const originalText = element.textContent;
        
        element.contentEditable = true;
        element.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Save changes on blur
        element.addEventListener('blur', function() {
            element.contentEditable = false;
        }, { once: true });

        // Handle keyboard shortcuts
        element.addEventListener('keydown', function(e) {
            // Escape to cancel
            if (e.key === 'Escape') {
                e.preventDefault();
                element.textContent = originalText; // Restore original text
                element.contentEditable = false;
                element.blur();
                
                if (window.showToast) {
                    window.showToast('⏪ Edición cancelada');
                }
            }
            
            // Enter to save (Shift+Enter for new line)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
                
                if (window.showToast) {
                    window.showToast('✅ Texto guardado');
                }
            }
        }, { once: true });
    }
}
```

### Benefits
- ✅ Users can cancel editing with Esc
- ✅ Original text is restored
- ✅ Prevents duplicate event listeners
- ✅ Better user feedback with toasts

---

## 🔧 Improvement 2: Add Visual Feedback During Text Editing

**Priority:** Medium  
**Effort:** 20 minutes  
**Impact:** Better UX

### Proposed Enhancement

Add a visual indicator when an element is being edited.

**File:** `vanilla-editor/style.css`

**Add these CSS rules:**

```css
/* Text editing visual feedback */
.canvas-element[contenteditable="true"] {
    outline: 2px solid #10b981 !important;
    outline-offset: 2px;
    background-color: rgba(16, 185, 129, 0.05);
    animation: editingPulse 2s ease-in-out infinite;
}

@keyframes editingPulse {
    0%, 100% {
        outline-color: #10b981;
    }
    50% {
        outline-color: #34d399;
    }
}

/* Cursor style during editing */
.canvas-element[contenteditable="true"] {
    cursor: text !important;
}
```

### Benefits
- ✅ Clear visual indication of editing mode
- ✅ Prevents confusion about which element is being edited
- ✅ Professional appearance

---

## 🔧 Improvement 3: Improve Resize Handle Visibility on Small Elements

**Priority:** Medium  
**Effort:** 1 hour  
**Impact:** Better UX for small elements

### Current Issue
Resize handles may overlap on elements smaller than 50px.

### Proposed Fix

**File:** `vanilla-editor/src/core/resizeManager.js`

**Add to the `injectStyles()` method:**

```css
/* Responsive handle sizing for small elements */
.canvas-element.selected[data-element-size="small"] .resize-handle {
    width: 8px;
    height: 8px;
}

.canvas-element.selected[data-element-size="tiny"] .resize-handle {
    width: 6px;
    height: 6px;
}

/* Hide corner handles on very small elements */
.canvas-element.selected[data-element-size="tiny"] .resize-handle-nw,
.canvas-element.selected[data-element-size="tiny"] .resize-handle-ne,
.canvas-element.selected[data-element-size="tiny"] .resize-handle-sw,
.canvas-element.selected[data-element-size="tiny"] .resize-handle-se {
    display: none;
}
```

**Add to `enableResize()` method:**

```javascript
enableResize(element) {
    if (!element || element.classList.contains('resize-enabled')) {
        return;
    }

    element.classList.add('resize-enabled');
    
    // Determine element size category
    const rect = element.getBoundingClientRect();
    const minDimension = Math.min(rect.width, rect.height);
    
    if (minDimension < 30) {
        element.setAttribute('data-element-size', 'tiny');
    } else if (minDimension < 60) {
        element.setAttribute('data-element-size', 'small');
    } else {
        element.setAttribute('data-element-size', 'normal');
    }
    
    // Rest of the implementation...
}
```

### Benefits
- ✅ Handles scale appropriately for element size
- ✅ No overlapping on small elements
- ✅ Better usability

---

## 🔧 Improvement 4: Add Undo/Redo Integration for Text Editing

**Priority:** Medium  
**Effort:** 2 hours  
**Impact:** Better workflow

### Proposed Enhancement

Integrate text editing with the existing undo/redo system.

**File:** `vanilla-editor/script.js`

**Update `makeElementEditable` function:**

```javascript
function makeElementEditable(element) {
    const tagName = element.tagName.toLowerCase();

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a', 'li', 'label'].includes(tagName)) {
        if (element.contentEditable === 'true') {
            return;
        }

        const originalText = element.textContent;
        
        // Save state before editing (for undo)
        if (window.undoRedoManager) {
            window.undoRedoManager.saveState();
        }
        
        element.contentEditable = true;
        element.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Save changes on blur
        element.addEventListener('blur', function() {
            element.contentEditable = false;
            
            // Save state after editing (for redo)
            if (window.undoRedoManager && element.textContent !== originalText) {
                window.undoRedoManager.saveState();
            }
        }, { once: true });

        // Handle keyboard shortcuts
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                element.textContent = originalText;
                element.contentEditable = false;
                element.blur();
                
                if (window.showToast) {
                    window.showToast('⏪ Edición cancelada');
                }
            }
            
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
                
                if (window.showToast) {
                    window.showToast('✅ Texto guardado');
                }
            }
        }, { once: true });
    }
}
```

### Benefits
- ✅ Text edits can be undone/redone
- ✅ Consistent with other editor operations
- ✅ Better workflow for users

---

## 🔧 Improvement 5: Add Accessibility Features

**Priority:** Low  
**Effort:** 2 hours  
**Impact:** Accessibility compliance

### Proposed Enhancement

Add ARIA labels and keyboard-only support.

**File:** `vanilla-editor/src/core/resizeManager.js`

**Update handle creation in `enableResize()`:**

```javascript
this.handles.forEach(handleConfig => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${handleConfig.name}`;
    handle.dataset.handle = handleConfig.name;
    handle.style.cursor = handleConfig.cursor;
    
    // Accessibility improvements
    handle.setAttribute('role', 'button');
    handle.setAttribute('aria-label', `Resize ${handleConfig.position}`);
    handle.setAttribute('tabindex', '0');
    
    // Keyboard support
    handle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Activate resize mode with keyboard
            this.startKeyboardResize(element, handleConfig.name);
        }
    });
    
    handle.addEventListener('mousedown', e => {
        e.stopImmediatePropagation();
        e.preventDefault();
        e.stopPropagation();
        this.startResize(e, element, handleConfig.name);
        return false;
    }, { capture: true, passive: false });
    
    handlesContainer.appendChild(handle);
});
```

**Add keyboard resize method:**

```javascript
startKeyboardResize(element, handleName) {
    this.activeElement = element;
    this.currentHandle = handleName;
    
    const step = 10; // 10px per arrow key press
    
    const keyHandler = (e) => {
        if (!this.activeElement) return;
        
        let deltaX = 0;
        let deltaY = 0;
        
        switch(e.key) {
            case 'ArrowRight': deltaX = step; break;
            case 'ArrowLeft': deltaX = -step; break;
            case 'ArrowDown': deltaY = step; break;
            case 'ArrowUp': deltaY = -step; break;
            case 'Escape':
                document.removeEventListener('keydown', keyHandler);
                this.activeElement = null;
                return;
            default: return;
        }
        
        e.preventDefault();
        
        // Apply resize based on handle direction
        const computedStyle = window.getComputedStyle(this.activeElement);
        let newWidth = parseFloat(computedStyle.width);
        let newHeight = parseFloat(computedStyle.height);
        
        if (handleName.includes('e')) newWidth += deltaX;
        if (handleName.includes('w')) newWidth -= deltaX;
        if (handleName.includes('s')) newHeight += deltaY;
        if (handleName.includes('n')) newHeight -= deltaY;
        
        newWidth = Math.max(this.minWidth, newWidth);
        newHeight = Math.max(this.minHeight, newHeight);
        
        this.activeElement.style.width = newWidth + 'px';
        this.activeElement.style.height = newHeight + 'px';
        
        this.showDimensionsTooltip(newWidth, newHeight);
    };
    
    document.addEventListener('keydown', keyHandler);
    
    if (window.showToast) {
        window.showToast('⌨️ Usa las flechas para redimensionar. Esc para salir.');
    }
}
```

### Benefits
- ✅ Screen reader support
- ✅ Keyboard-only navigation
- ✅ WCAG compliance
- ✅ Better for all users

---

## 📊 Implementation Priority

### Phase 1 (Immediate - 1 hour)
1. ✅ Add Esc key handler to text editing
2. ✅ Add event listener guards

### Phase 2 (Short-term - 2-3 hours)
3. ✅ Add visual feedback during editing
4. ✅ Improve handle visibility on small elements

### Phase 3 (Medium-term - 4-6 hours)
5. ✅ Add undo/redo integration
6. ✅ Add accessibility features

---

## 🧪 Testing After Implementation

After implementing these improvements, run:

```bash
# Run the full test suite
npm run test:e2e -- text-editing-resize.spec.ts

# Run specific test suites
npm run test:e2e -- text-editing-resize.spec.ts -g "Suite 1"
npm run test:e2e -- text-editing-resize.spec.ts -g "Suite 7"
```

---

## 📝 Notes

- All improvements are backward compatible
- No breaking changes to existing functionality
- Improvements enhance UX without changing core behavior
- All changes follow existing code style and patterns

---

**Document Version:** 1.0  
**Date:** December 24, 2024  
**Related Issue:** #12
