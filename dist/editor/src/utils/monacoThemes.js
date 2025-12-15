/**
 * Monaco Editor Themes
 * Custom themes matching DragNDrop's visual identity
 */

export function setupMonacoThemes(monaco) {
  // DragNDrop Dark Theme
  monaco.editor.defineTheme('dragndrop-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'class', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'delimiter.html', foreground: '808080' },
      { token: 'delimiter.bracket', foreground: 'FFD700' }
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorCursor.foreground': '#aeafad',
      'editorWhitespace.foreground': '#404040',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editorBracketMatch.background': '#0064001a',
      'editorBracketMatch.border': '#888888',
      'editorError.foreground': '#f48771',
      'editorWarning.foreground': '#cca700',
      'editorInfo.foreground': '#75beff',
      'editorHint.foreground': '#eeeeeeb3'
    }
  });

  // DragNDrop Light Theme
  monaco.editor.defineTheme('dragndrop-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'regexp', foreground: '811F3F' },
      { token: 'type', foreground: '267F99' },
      { token: 'class', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
      { token: 'constant', foreground: '0070C1' },
      { token: 'tag', foreground: '800000' },
      { token: 'attribute.name', foreground: 'FF0000' },
      { token: 'attribute.value', foreground: '0000FF' },
      { token: 'delimiter.html', foreground: '383838' },
      { token: 'delimiter.bracket', foreground: '000000' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#f0f0f0',
      'editor.selectionBackground': '#add6ff',
      'editor.inactiveSelectionBackground': '#e5ebf1',
      'editorCursor.foreground': '#000000',
      'editorWhitespace.foreground': '#d3d3d3',
      'editorIndentGuide.background': '#d3d3d3',
      'editorIndentGuide.activeBackground': '#939393',
      'editorLineNumber.foreground': '#237893',
      'editorLineNumber.activeForeground': '#0b216f',
      'editorBracketMatch.background': '#0064001a',
      'editorBracketMatch.border': '#b9b9b9',
      'editorError.foreground': '#e51400',
      'editorWarning.foreground': '#bf8803',
      'editorInfo.foreground': '#1a85ff',
      'editorHint.foreground': '#6c6c6c'
    }
  });

  // DragNDrop High Contrast Theme
  monaco.editor.defineTheme('dragndrop-high-contrast', {
    base: 'hc-black',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7CA668', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' }
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#FFFFFF',
      'editor.lineHighlightBackground': '#0A0A0A',
      'editor.selectionBackground': '#264F78',
      'editorCursor.foreground': '#FFFFFF',
      'editorLineNumber.foreground': '#FFFFFF',
      'editorError.foreground': '#FF0000',
      'editorWarning.foreground': '#FFD700'
    }
  });

  console.log('✅ Monaco themes configured');
}

/**
 * Get theme based on DragNDrop's current theme
 */
export function getMonacoTheme(dragndropTheme) {
  const themeMap = {
    'dark': 'dragndrop-dark',
    'light': 'dragndrop-light',
    'high-contrast': 'dragndrop-high-contrast',
    'default': 'dragndrop-dark'
  };

  return themeMap[dragndropTheme] || themeMap['default'];
}

export default { setupMonacoThemes, getMonacoTheme };
