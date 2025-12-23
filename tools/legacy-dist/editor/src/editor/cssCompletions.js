/**
 * CSS Completions
 * Provides intelligent CSS property and value completions
 */

export async function setupCSSCompletions(monaco) {
  // Register CSS completion provider
  monaco.languages.registerCompletionItemProvider('css', {
    triggerCharacters: [':', ' ', '-'],
    
    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      // Check if we're after a colon (property value context)
      const isValueContext = /:\s*[a-zA-Z-]*$/.test(textUntilPosition);

      if (isValueContext) {
        return { suggestions: getCSSValueSuggestions(monaco, range, textUntilPosition) };
      } else {
        return { suggestions: getCSSPropertySuggestions(monaco, range) };
      }
    }
  });
}

/**
 * Get CSS property suggestions
 */
function getCSSPropertySuggestions(monaco, range) {
  const properties = [
    // Layout
    { label: 'display', detail: 'Display type', values: ['block', 'inline', 'flex', 'grid', 'none'] },
    { label: 'position', detail: 'Positioning', values: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
    { label: 'top', detail: 'Top position', values: ['auto', '0', '10px', '1rem'] },
    { label: 'right', detail: 'Right position', values: ['auto', '0', '10px', '1rem'] },
    { label: 'bottom', detail: 'Bottom position', values: ['auto', '0', '10px', '1rem'] },
    { label: 'left', detail: 'Left position', values: ['auto', '0', '10px', '1rem'] },
    { label: 'z-index', detail: 'Stack order', values: ['auto', '0', '1', '10', '100'] },
    
    // Flexbox
    { label: 'flex-direction', detail: 'Flex direction', values: ['row', 'column', 'row-reverse', 'column-reverse'] },
    { label: 'justify-content', detail: 'Main axis alignment', values: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'] },
    { label: 'align-items', detail: 'Cross axis alignment', values: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
    { label: 'flex-wrap', detail: 'Flex wrapping', values: ['nowrap', 'wrap', 'wrap-reverse'] },
    { label: 'flex', detail: 'Flex shorthand', values: ['1', '0 1 auto', '1 1 0'] },
    { label: 'gap', detail: 'Gap between items', values: ['0', '10px', '1rem', '20px'] },
    
    // Grid
    { label: 'grid-template-columns', detail: 'Grid columns', values: ['repeat(3, 1fr)', '1fr 2fr', 'auto'] },
    { label: 'grid-template-rows', detail: 'Grid rows', values: ['repeat(3, 1fr)', '1fr 2fr', 'auto'] },
    { label: 'grid-column', detail: 'Grid column span', values: ['1 / 3', 'span 2', 'auto'] },
    { label: 'grid-row', detail: 'Grid row span', values: ['1 / 3', 'span 2', 'auto'] },
    
    // Box Model
    { label: 'width', detail: 'Element width', values: ['auto', '100%', '100px', '10rem'] },
    { label: 'height', detail: 'Element height', values: ['auto', '100%', '100px', '10rem'] },
    { label: 'max-width', detail: 'Maximum width', values: ['none', '100%', '1200px'] },
    { label: 'max-height', detail: 'Maximum height', values: ['none', '100%', '600px'] },
    { label: 'min-width', detail: 'Minimum width', values: ['0', '100px', '10rem'] },
    { label: 'min-height', detail: 'Minimum height', values: ['0', '100px', '10rem'] },
    { label: 'margin', detail: 'Outer spacing', values: ['0', '10px', '1rem', 'auto'] },
    { label: 'padding', detail: 'Inner spacing', values: ['0', '10px', '1rem', '20px'] },
    
    // Typography
    { label: 'font-family', detail: 'Font family', values: ['Arial', 'sans-serif', 'monospace', 'Georgia'] },
    { label: 'font-size', detail: 'Font size', values: ['16px', '1rem', '1.2em', '14px'] },
    { label: 'font-weight', detail: 'Font weight', values: ['normal', 'bold', '400', '700'] },
    { label: 'font-style', detail: 'Font style', values: ['normal', 'italic', 'oblique'] },
    { label: 'line-height', detail: 'Line height', values: ['normal', '1.5', '1.6', '2'] },
    { label: 'text-align', detail: 'Text alignment', values: ['left', 'center', 'right', 'justify'] },
    { label: 'text-decoration', detail: 'Text decoration', values: ['none', 'underline', 'line-through'] },
    { label: 'text-transform', detail: 'Text transform', values: ['none', 'uppercase', 'lowercase', 'capitalize'] },
    { label: 'letter-spacing', detail: 'Letter spacing', values: ['normal', '0.05em', '1px'] },
    
    // Colors & Backgrounds
    { label: 'color', detail: 'Text color', values: ['#000', '#fff', 'rgb(0,0,0)', 'currentColor'] },
    { label: 'background-color', detail: 'Background color', values: ['transparent', '#fff', '#000', 'rgb(255,255,255)'] },
    { label: 'background-image', detail: 'Background image', values: ['none', 'url()', 'linear-gradient()'] },
    { label: 'background-size', detail: 'Background size', values: ['auto', 'cover', 'contain', '100%'] },
    { label: 'background-position', detail: 'Background position', values: ['center', 'top', 'bottom', 'left', 'right'] },
    { label: 'background-repeat', detail: 'Background repeat', values: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'] },
    
    // Borders
    { label: 'border', detail: 'Border shorthand', values: ['1px solid #000', 'none', '2px dashed #ccc'] },
    { label: 'border-width', detail: 'Border width', values: ['1px', '2px', 'thin', 'medium', 'thick'] },
    { label: 'border-style', detail: 'Border style', values: ['solid', 'dashed', 'dotted', 'none'] },
    { label: 'border-color', detail: 'Border color', values: ['#000', '#ccc', 'currentColor'] },
    { label: 'border-radius', detail: 'Border radius', values: ['0', '4px', '8px', '50%'] },
    
    // Effects
    { label: 'box-shadow', detail: 'Box shadow', values: ['none', '0 2px 4px rgba(0,0,0,0.1)', '0 4px 6px rgba(0,0,0,0.1)'] },
    { label: 'text-shadow', detail: 'Text shadow', values: ['none', '1px 1px 2px rgba(0,0,0,0.5)'] },
    { label: 'opacity', detail: 'Opacity', values: ['1', '0.5', '0'] },
    { label: 'transform', detail: 'Transform', values: ['none', 'rotate(45deg)', 'scale(1.1)', 'translate(10px, 10px)'] },
    { label: 'transition', detail: 'Transition', values: ['all 0.3s ease', 'opacity 0.2s', 'transform 0.3s ease-in-out'] },
    { label: 'animation', detail: 'Animation', values: ['none', 'name 1s ease infinite'] },
    
    // Overflow
    { label: 'overflow', detail: 'Overflow behavior', values: ['visible', 'hidden', 'scroll', 'auto'] },
    { label: 'overflow-x', detail: 'Horizontal overflow', values: ['visible', 'hidden', 'scroll', 'auto'] },
    { label: 'overflow-y', detail: 'Vertical overflow', values: ['visible', 'hidden', 'scroll', 'auto'] },
    
    // Cursor
    { label: 'cursor', detail: 'Cursor style', values: ['auto', 'pointer', 'default', 'text', 'move', 'not-allowed'] }
  ];

  return properties.map(prop => ({
    label: prop.label,
    kind: monaco.languages.CompletionItemKind.Property,
    detail: prop.detail,
    insertText: `${prop.label}: $1;`,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range,
    documentation: `Common values: ${prop.values.join(', ')}`
  }));
}

/**
 * Get CSS value suggestions based on property
 */
function getCSSValueSuggestions(monaco, range, context) {
  // Extract the property name
  const propertyMatch = context.match(/([a-z-]+)\s*:\s*[a-zA-Z-]*$/);
  if (!propertyMatch) return [];

  const property = propertyMatch[1];
  const valueMap = {
    'display': ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
    'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    'flex-direction': ['row', 'column', 'row-reverse', 'column-reverse'],
    'justify-content': ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
    'align-items': ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
    'text-align': ['left', 'center', 'right', 'justify'],
    'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    'cursor': ['auto', 'pointer', 'default', 'text', 'move', 'not-allowed', 'grab', 'grabbing']
  };

  const values = valueMap[property] || [];

  return values.map(value => ({
    label: value,
    kind: monaco.languages.CompletionItemKind.Value,
    insertText: value,
    range: range
  }));
}

export default { setupCSSCompletions };
