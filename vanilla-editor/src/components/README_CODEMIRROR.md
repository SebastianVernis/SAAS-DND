# CodeMirror 6 Integration

## Overview

This directory contains the CodeMirror 6 integration for the DragNDrop visual editor. The implementation provides a professional code editing experience with syntax highlighting, line numbers, and bidirectional synchronization between the visual canvas and code.

## Files

- **CodeEditorPanel.js** - Main component implementing the code editor modal with tabs for HTML, CSS, and JavaScript

## Features Implemented

### ✅ Core Features

- [x] CodeMirror 6 installation and setup
- [x] Modal interface with tabs (HTML, CSS, JS)
- [x] Syntax highlighting for HTML, CSS, and JavaScript
- [x] Line numbers
- [x] Auto-indentation
- [x] Bracket matching
- [x] Bidirectional sync (canvas ↔ code)
- [x] Undo/redo integration
- [x] Keyboard shortcuts (Ctrl+E, Ctrl+S, Escape)
- [x] Dark theme
- [x] Apply and Cancel buttons

### 🎨 UI Components

- Modal overlay with backdrop blur
- Three-tab interface (HTML, CSS, JS)
- Professional dark theme
- Responsive design
- Close button and keyboard shortcuts

### 🔄 Synchronization

- **Canvas → Code**: Extracts HTML, inline CSS, and scripts from canvas
- **Code → Canvas**: Applies HTML, creates style tags for CSS, executes JavaScript
- **Element Re-initialization**: Re-attaches event listeners after code changes

## Usage

### Opening the Code Editor

```javascript
// Via global instance
window.codeEditorPanel.open();

// Via keyboard shortcut
// Press Ctrl+E

// Via menu
// Click Vista → Editor de Código
```

### Programmatic Access

```javascript
// Get current code
const htmlCode = window.codeEditorPanel.editors.html.state.doc.toString();
const cssCode = window.codeEditorPanel.editors.css.state.doc.toString();
const jsCode = window.codeEditorPanel.editors.js.state.doc.toString();

// Switch tabs
window.codeEditorPanel.switchTab('css');

// Apply changes
window.codeEditorPanel.apply();

// Close editor
window.codeEditorPanel.close();
```

## Architecture

```
CodeEditorPanel
│
├── Modal UI
│   ├── Header (title + close button)
│   ├── Tabs (HTML, CSS, JS)
│   ├── Editor Panes
│   │   ├── HTML Editor (CodeMirror instance)
│   │   ├── CSS Editor (CodeMirror instance)
│   │   └── JS Editor (CodeMirror instance)
│   └── Footer (Cancel + Apply buttons)
│
├── Code Extraction
│   ├── extractCodeFromCanvas()
│   ├── formatHTML()
│   └── Extract inline styles and scripts
│
├── Code Application
│   ├── Apply HTML to canvas
│   ├── Create/update style tag
│   ├── Create/update script tag
│   └── Re-initialize canvas elements
│
└── Event Handling
    ├── Keyboard shortcuts
    ├── Tab switching
    └── Modal open/close
```

## Integration Points

### 1. HTML (index.html)

```html
<!-- Import CodeEditorPanel -->
<script type="module" src="./src/components/CodeEditorPanel.js"></script>

<!-- Add button to toolbar -->
<button onclick="window.codeEditorPanel.open()">
  📝 Editor de Código
</button>
```

### 2. JavaScript (script.js)

```javascript
// Initialize CodeEditorPanel
import('./src/components/CodeEditorPanel.js').then(module => {
  const codeEditorPanel = module.initCodeEditorPanel();
  window.codeEditorPanel = codeEditorPanel;
});

// Setup canvas elements after code changes
window.setupCanvasElements = function() {
  // Re-initialize canvas elements
};
```

### 3. Undo/Redo Integration

```javascript
// Save state before applying changes
if (window.undoRedoManager) {
  window.undoRedoManager.saveState();
}
```

## Dependencies

```json
{
  "codemirror": "^6.0.2",
  "@codemirror/lang-html": "^6.4.11",
  "@codemirror/lang-css": "^6.3.1",
  "@codemirror/lang-javascript": "^6.2.4",
  "@codemirror/view": "^6.39.6",
  "@codemirror/state": "^6.5.3",
  "@codemirror/commands": "^6.10.1",
  "@codemirror/language": "^6.12.1",
  "@codemirror/autocomplete": "^6.20.0"
}
```

## Installation

```bash
npm install codemirror @codemirror/lang-html @codemirror/lang-css @codemirror/lang-javascript @codemirror/view @codemirror/state @codemirror/commands @codemirror/language @codemirror/autocomplete
```

## Testing

### Unit Tests

```bash
npm test tests/unit/codeEditorPanel.test.js
```

### Manual Testing

1. Open the editor in a browser
2. Add some elements to the canvas
3. Press `Ctrl+E` to open code editor
4. Verify HTML is extracted correctly
5. Switch to CSS tab
6. Verify inline styles are extracted
7. Make changes to the code
8. Click "Aplicar Cambios"
9. Verify changes appear on canvas
10. Test undo/redo functionality

## Troubleshooting

### Issue: Editor doesn't open

**Solution**: Check browser console for import errors. Ensure CodeMirror dependencies are installed.

### Issue: Syntax highlighting not working

**Solution**: Verify language extensions are imported correctly in CodeEditorPanel.js

### Issue: Changes not applying to canvas

**Solution**: Check if `setupCanvasElements()` function is defined in script.js

### Issue: Keyboard shortcuts not working

**Solution**: Ensure event listeners are attached and no other handlers are preventing default behavior

## Future Enhancements

- [ ] Code formatting (Prettier)
- [ ] Code linting (ESLint, HTMLHint, Stylelint)
- [ ] Emmet abbreviations
- [ ] Code snippets
- [ ] Multi-cursor editing
- [ ] Find and replace
- [ ] Code folding
- [ ] Minimap
- [ ] Git diff view
- [ ] Export to separate files

## Performance Considerations

- **Debouncing**: Consider adding debouncing for real-time sync
- **Large Files**: Optimize for large HTML files (>10,000 lines)
- **Memory**: Properly dispose of editors when not in use
- **Lazy Loading**: Load CodeMirror only when needed

## Security Considerations

- **XSS Prevention**: Sanitize user input before applying to canvas
- **Script Execution**: Be cautious when executing user-provided JavaScript
- **CSP**: Ensure Content Security Policy allows inline scripts if needed

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ⚠️ Limited support (small screens)

## License

Proprietary - SAAS-DND Project

## Contributors

- SAAS-DND Team
- CodeMirror 6 by Marijn Haverbeke

## References

- [CodeMirror 6 Documentation](https://codemirror.net/docs/)
- [CodeMirror 6 Examples](https://codemirror.net/examples/)
- [Language Support](https://codemirror.net/docs/ref/#language)

---

**Last Updated**: December 24, 2025  
**Version**: 1.0.0
