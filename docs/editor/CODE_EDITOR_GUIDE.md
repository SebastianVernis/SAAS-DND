# CodeMirror 6 Code Editor Guide

## Overview

The CodeMirror 6 Code Editor integration provides a professional code editing experience within the DragNDrop editor. It allows users to view and edit the HTML, CSS, and JavaScript code of their canvas directly.

## Features

### ✅ Implemented Features

1. **Multi-Tab Interface**
   - HTML tab for editing canvas HTML
   - CSS tab for editing styles
   - JavaScript tab for editing scripts
   - Easy tab switching with visual indicators

2. **Syntax Highlighting**
   - Full syntax highlighting for HTML, CSS, and JavaScript
   - Powered by CodeMirror 6 language extensions
   - Dark theme (One Dark) for comfortable editing

3. **Code Editing Features**
   - Line numbers
   - Auto-indentation
   - Bracket matching
   - Code folding
   - Search and replace (Ctrl+F)
   - Format document (Shift+Alt+F)

4. **Bidirectional Sync**
   - Extract code from canvas when opening editor
   - Apply code changes back to canvas
   - Automatic cleanup of editor artifacts (delete buttons, classes)
   - Reinitialize canvas elements after applying changes

5. **User Interface**
   - Modal overlay with dark theme
   - Responsive design (works on mobile and desktop)
   - Statistics display (line count, character count)
   - Apply and Cancel buttons
   - Keyboard shortcuts (Escape to close, Ctrl+S to apply)

## Usage

### Opening the Code Editor

There are three ways to open the code editor:

1. **Menu**: Click on "Vista" → "Editor de Código"
2. **Keyboard Shortcut**: Press `Ctrl+K`
3. **Programmatically**: Call `window.openCodeEditor()`

### Editing Code

1. **Switch Tabs**: Click on HTML, CSS, or JS tabs to switch between code types
2. **Edit Code**: Type directly in the editor
3. **Format Code**: Press `Shift+Alt+F` to format the current document
4. **Apply Changes**: Click "Aplicar Cambios" or press `Ctrl+S`
5. **Cancel**: Click "Cancelar" or press `Escape`

### Code Extraction

When you open the code editor, it automatically extracts:

- **HTML**: The innerHTML of the canvas, cleaned of editor artifacts
- **CSS**: Inline styles from canvas elements, converted to CSS rules
- **JavaScript**: Any inline scripts found in the canvas

### Applying Changes

When you click "Aplicar Cambios":

1. The HTML code is applied to the canvas
2. CSS code is injected into a `<style>` tag in the document head
3. Canvas elements are reinitialized with editor functionality
4. The change is saved to the undo/redo history
5. A success toast notification is shown

## Technical Details

### Dependencies

```json
{
  "codemirror": "^6.0.0",
  "@codemirror/lang-html": "^6.0.0",
  "@codemirror/lang-css": "^6.0.0",
  "@codemirror/lang-javascript": "^6.0.0",
  "@codemirror/view": "^6.0.0",
  "@codemirror/state": "^6.0.0",
  "@codemirror/commands": "^6.0.0",
  "@codemirror/language": "^6.0.0",
  "@codemirror/autocomplete": "^6.0.0"
}
```

### File Structure

```
vanilla-editor/
└── src/
    └── components/
        └── CodeEditorPanel.js  # Main code editor component
```

### Integration Points

1. **index.html**: Script import added
2. **script.js**: `reinitializeCanvasElements()` function added
3. **keyboardShortcuts.js**: Ctrl+K shortcut registered
4. **Toolbar**: "Editor de Código" menu item added

### API

#### Global Functions

```javascript
// Open the code editor
window.openCodeEditor()

// Close the code editor
window.closeCodeEditor()

// Reinitialize canvas elements after code changes
window.reinitializeCanvasElements()
```

#### CodeEditorPanel Class

```javascript
class CodeEditorPanel {
  constructor()
  init()
  open()
  close()
  isOpen()
  switchTab(tabName)
  extractCodeFromCanvas()
  applyChanges()
  destroy()
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open code editor |
| `Escape` | Close code editor |
| `Ctrl+S` | Apply changes |
| `Shift+Alt+F` | Format document |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find and replace |

## Code Cleaning

The editor automatically cleans the following from extracted HTML:

- Delete buttons (`.delete-btn`)
- Editor classes (`canvas-element`, `selected`)
- Empty class attributes
- Draggable attributes
- Data attributes used by the editor

## Styling

The code editor uses a dark theme with the following color scheme:

- Background: `#1e1e1e`
- Header: `#252526`
- Borders: `#3e3e42`
- Text: `#cccccc`
- Accent: `#007acc`

## Error Handling

The code editor includes error handling for:

- Invalid HTML/CSS/JavaScript syntax
- Missing canvas element
- Failed code application
- Editor initialization errors

Errors are displayed as toast notifications to the user.

## Future Enhancements

Potential improvements for future versions:

1. **Live Preview**: Real-time preview of code changes
2. **Code Validation**: Syntax validation before applying
3. **Prettier Integration**: Automatic code formatting
4. **Emmet Support**: Abbreviation expansion
5. **Code Snippets**: Predefined code templates
6. **Split View**: Side-by-side code and canvas view
7. **Version History**: Track code changes over time
8. **Export Options**: Export code to separate files

## Troubleshooting

### Code Editor Won't Open

- Check browser console for errors
- Ensure CodeMirror dependencies are loaded
- Verify `window.openCodeEditor` is defined

### Changes Not Applied

- Check for JavaScript errors in console
- Ensure HTML is valid
- Try closing and reopening the editor

### Formatting Issues

- Use `Shift+Alt+F` to format code
- Check for unclosed tags or brackets
- Ensure proper indentation

## Examples

### Opening the Editor Programmatically

```javascript
// Open the code editor
window.openCodeEditor();

// Wait for user to make changes...

// Check if editor is open
if (window.codeEditorInstance && window.codeEditorInstance.isOpen()) {
  console.log('Editor is open');
}
```

### Extracting Code Without Opening Editor

```javascript
// Get current canvas HTML
const canvas = document.getElementById('canvas');
const html = canvas.innerHTML;

// Clean HTML
const cleanHTML = html
  .replace(/<div class="delete-btn">×<\/div>/g, '')
  .replace(/class="canvas-element[^"]*"/g, '')
  .replace(/class="selected[^"]*"/g, '');

console.log(cleanHTML);
```

## Support

For issues or questions:

1. Check this documentation
2. Review the code in `CodeEditorPanel.js`
3. Check browser console for errors
4. Create an issue on GitHub

## License

This code editor integration is part of the DragNDrop SAAS project and follows the same license.

---

**Last Updated**: December 24, 2025  
**Version**: 1.0.0  
**Author**: BLACKBOX AI
