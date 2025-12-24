# 📝 Code Editor Guide

## Overview

The Code Editor Panel provides a professional code editing experience using CodeMirror 6, allowing you to directly edit the HTML, CSS, and JavaScript of your canvas content.

## Features

### ✨ Core Features

- **Syntax Highlighting**: Full syntax highlighting for HTML, CSS, and JavaScript
- **Line Numbers**: Easy navigation with line numbers
- **Auto-Indentation**: Automatic code indentation for better readability
- **Bracket Matching**: Visual bracket matching for easier code navigation
- **Tab Interface**: Switch between HTML, CSS, and JS tabs
- **Bidirectional Sync**: Changes sync between canvas and code editor
- **Undo/Redo Integration**: Code changes are saved in the undo/redo history

### 🎨 User Interface

- **Dark Theme**: Professional dark theme optimized for coding
- **Modal Interface**: Full-screen modal for distraction-free editing
- **Keyboard Shortcuts**: Quick access via keyboard shortcuts
- **Responsive Design**: Works on all screen sizes

## Usage

### Opening the Code Editor

There are multiple ways to open the code editor:

1. **Via Menu**: Click `Vista` → `Editor de Código`
2. **Keyboard Shortcut**: Press `Ctrl+E` (or `Cmd+E` on Mac)
3. **Programmatically**: Call `window.codeEditorPanel.open()`

### Editing Code

1. **Select Tab**: Click on HTML, CSS, or JavaScript tab
2. **Edit Code**: Make your changes in the editor
3. **Apply Changes**: Click "Aplicar Cambios" button or press `Ctrl+S`
4. **Cancel**: Click "Cancelar" to discard changes

### Keyboard Shortcuts

- `Ctrl+E` - Open code editor
- `Ctrl+S` - Apply changes (when editor is open)
- `Escape` - Close code editor
- `Ctrl+Z` - Undo (in editor)
- `Ctrl+Y` - Redo (in editor)

## Technical Details

### Architecture

```
CodeEditorPanel
├── Modal UI
│   ├── Header (title + close button)
│   ├── Tabs (HTML, CSS, JS)
│   ├── Editor Panes (CodeMirror instances)
│   └── Footer (Cancel + Apply buttons)
└── CodeMirror Editors
    ├── HTML Editor (with html() language support)
    ├── CSS Editor (with css() language support)
    └── JS Editor (with javascript() language support)
```

### Code Extraction

When you open the code editor, it automatically extracts:

- **HTML**: The innerHTML of the canvas element
- **CSS**: Inline styles from elements (converted to CSS rules)
- **JavaScript**: Any inline scripts in the canvas

### Code Application

When you apply changes:

1. HTML is inserted into the canvas
2. CSS is added to a `<style>` tag in the document head
3. JavaScript is executed via a `<script>` tag
4. Canvas elements are re-initialized with event listeners
5. Changes are saved to undo/redo history

### Integration Points

The code editor integrates with:

- **Canvas**: Reads from and writes to the canvas element
- **Undo/Redo Manager**: Saves state before applying changes
- **Element Setup**: Re-initializes canvas elements after changes
- **Toast Notifications**: Shows success/error messages

## API Reference

### CodeEditorPanel Class

```javascript
class CodeEditorPanel {
  // Open the code editor modal
  open()
  
  // Close the code editor modal
  close()
  
  // Switch between tabs (html, css, js)
  switchTab(tab)
  
  // Apply code changes to canvas
  apply()
  
  // Cancel and discard changes
  cancel()
  
  // Extract code from canvas
  extractCodeFromCanvas()
  
  // Format HTML with indentation
  formatHTML(html)
  
  // Destroy the code editor panel
  destroy()
}
```

### Global Access

```javascript
// Access the code editor panel globally
window.codeEditorPanel.open();
window.codeEditorPanel.close();
window.codeEditorPanel.switchTab('css');
```

### Initialization

```javascript
// Initialize in script.js
import('./src/components/CodeEditorPanel.js').then(module => {
  const codeEditorPanel = module.initCodeEditorPanel();
  window.codeEditorPanel = codeEditorPanel;
});
```

## Customization

### Styling

The code editor styles can be customized by modifying the CSS in `CodeEditorPanel.js`:

```javascript
addStyles() {
  // Modify colors, sizes, fonts, etc.
}
```

### Editor Configuration

CodeMirror editor configuration can be modified in the `initializeEditors()` method:

```javascript
this.editors.html = new EditorView({
  state: EditorState.create({
    doc: this.originalCode.html,
    extensions: [
      basicSetup,
      html(),
      // Add more extensions here
    ]
  }),
  parent: document.getElementById('htmlEditor')
});
```

## Troubleshooting

### Editor Not Opening

**Problem**: Code editor doesn't open when clicking the button

**Solutions**:
1. Check browser console for errors
2. Verify CodeMirror dependencies are installed
3. Ensure `window.codeEditorPanel` is initialized
4. Check if modal element exists in DOM

### Code Not Applying

**Problem**: Changes don't appear on canvas after clicking "Apply"

**Solutions**:
1. Check for JavaScript errors in console
2. Verify canvas element exists
3. Check if `setupCanvasElements()` function is defined
4. Ensure undo/redo manager is initialized

### Syntax Highlighting Not Working

**Problem**: Code appears without syntax highlighting

**Solutions**:
1. Verify language extensions are imported correctly
2. Check CodeMirror version compatibility
3. Ensure editor is initialized with correct language mode
4. Check browser console for import errors

## Best Practices

### 1. Save Before Editing

Always save your project before making major code changes in the editor.

### 2. Test Changes

After applying code changes, test your page thoroughly to ensure everything works as expected.

### 3. Use Undo/Redo

If something goes wrong, use the undo feature (`Ctrl+Z`) to revert changes.

### 4. Format Code

Keep your code well-formatted for better readability and maintainability.

### 5. Backup Regularly

Create backups of your projects regularly, especially before major code edits.

## Examples

### Example 1: Adding Custom CSS

1. Open code editor (`Ctrl+E`)
2. Switch to CSS tab
3. Add your custom CSS:
```css
.my-custom-class {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
}
```
4. Click "Aplicar Cambios"

### Example 2: Adding JavaScript Functionality

1. Open code editor
2. Switch to JavaScript tab
3. Add your script:
```javascript
document.querySelectorAll('.my-button').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Button clicked!');
  });
});
```
4. Apply changes

### Example 3: Editing HTML Structure

1. Open code editor
2. Stay on HTML tab (default)
3. Modify the HTML structure
4. Apply changes to see updates on canvas

## Future Enhancements

Planned features for future versions:

- [ ] Code formatting (Prettier integration)
- [ ] Code linting (ESLint, HTMLHint, Stylelint)
- [ ] Emmet abbreviations support
- [ ] Code snippets library
- [ ] Multi-cursor editing
- [ ] Find and replace
- [ ] Code folding
- [ ] Minimap
- [ ] Git diff view
- [ ] Export code to separate files

## Support

For issues or questions:

1. Check this documentation
2. Review the troubleshooting section
3. Check browser console for errors
4. Create an issue on GitHub

## Version History

### v1.0.0 (Current)
- Initial release
- CodeMirror 6 integration
- HTML, CSS, JS syntax highlighting
- Tab interface
- Bidirectional sync
- Undo/redo integration
- Keyboard shortcuts

---

**Last Updated**: December 24, 2025  
**Author**: SAAS-DND Team  
**License**: Proprietary
