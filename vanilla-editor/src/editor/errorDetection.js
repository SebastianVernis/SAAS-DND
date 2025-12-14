/**
 * Error Detection
 * Real-time syntax validation and error detection for HTML, CSS, and JavaScript
 */

export function setupErrorDetection(monaco, editor, onErrorsDetected) {
  const model = editor.getModel();
  if (!model) return;

  const language = model.getLanguageId();

  // Setup error detection based on language
  switch (language) {
    case 'html':
      setupHTMLErrorDetection(monaco, editor, onErrorsDetected);
      break;
    case 'css':
      setupCSSErrorDetection(monaco, editor, onErrorsDetected);
      break;
    case 'javascript':
      setupJSErrorDetection(monaco, editor, onErrorsDetected);
      break;
  }
}

/**
 * HTML Error Detection
 */
function setupHTMLErrorDetection(monaco, editor, onErrorsDetected) {
  let debounceTimer;

  editor.onDidChangeModelContent(() => {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      const value = editor.getValue();
      const errors = validateHTML(value);
      onErrorsDetected(errors);
    }, 300);
  });
}

/**
 * Validate HTML syntax
 */
function validateHTML(html) {
  const errors = [];
  const lines = html.split('\n');
  const tagStack = [];
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;

    // Check for unclosed tags
    const openTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)>/g;
    const selfClosingRegex = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*\/>/g;

    let match;

    // Find self-closing tags (ignore them)
    while ((match = selfClosingRegex.exec(line)) !== null) {
      // Self-closing tags are valid, no action needed
    }

    // Find opening tags
    while ((match = openTagRegex.exec(line)) !== null) {
      const tagName = match[1].toLowerCase();
      if (!selfClosingTags.includes(tagName) && !line.includes(`</${tagName}>`)) {
        tagStack.push({ tag: tagName, line: lineNumber, column: match.index + 1 });
      }
    }

    // Find closing tags
    while ((match = closeTagRegex.exec(line)) !== null) {
      const tagName = match[1].toLowerCase();
      const lastTag = tagStack[tagStack.length - 1];

      if (!lastTag) {
        errors.push({
          line: lineNumber,
          column: match.index + 1,
          endLine: lineNumber,
          endColumn: match.index + match[0].length,
          message: `Unexpected closing tag </${tagName}>`,
          source: 'HTML Validator'
        });
      } else if (lastTag.tag !== tagName) {
        errors.push({
          line: lineNumber,
          column: match.index + 1,
          endLine: lineNumber,
          endColumn: match.index + match[0].length,
          message: `Mismatched closing tag. Expected </${lastTag.tag}>, found </${tagName}>`,
          source: 'HTML Validator'
        });
      } else {
        tagStack.pop();
      }
    }

    // Check for invalid attribute syntax
    const invalidAttrRegex = /<[a-zA-Z][a-zA-Z0-9]*\s+[^>]*[a-zA-Z-]+=(?!["\s])[^>\s]+/g;
    while ((match = invalidAttrRegex.exec(line)) !== null) {
      errors.push({
        line: lineNumber,
        column: match.index + 1,
        endLine: lineNumber,
        endColumn: match.index + match[0].length,
        message: 'Attribute value should be quoted',
        source: 'HTML Validator'
      });
    }
  });

  // Check for unclosed tags at the end
  tagStack.forEach(tag => {
    errors.push({
      line: tag.line,
      column: tag.column,
      endLine: tag.line,
      endColumn: tag.column + tag.tag.length + 2,
      message: `Unclosed tag <${tag.tag}>`,
      source: 'HTML Validator'
    });
  });

  return errors;
}

/**
 * CSS Error Detection
 */
function setupCSSErrorDetection(monaco, editor, onErrorsDetected) {
  let debounceTimer;

  editor.onDidChangeModelContent(() => {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      const value = editor.getValue();
      const errors = validateCSS(value);
      onErrorsDetected(errors);
    }, 300);
  });
}

/**
 * Validate CSS syntax
 */
function validateCSS(css) {
  const errors = [];
  const lines = css.split('\n');
  let braceCount = 0;
  let inRule = false;

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const trimmedLine = line.trim();

    // Count braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceCount += openBraces - closeBraces;

    if (openBraces > 0) inRule = true;
    if (closeBraces > 0 && braceCount === 0) inRule = false;

    // Check for missing semicolons in property declarations
    if (inRule && trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && trimmedLine.includes(':')) {
      errors.push({
        line: lineNumber,
        column: line.length,
        endLine: lineNumber,
        endColumn: line.length + 1,
        message: 'Missing semicolon',
        source: 'CSS Validator'
      });
    }

    // Check for invalid property syntax
    if (inRule && trimmedLine.includes(':')) {
      const parts = trimmedLine.split(':');
      if (parts.length >= 2) {
        const property = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(';', '');

        // Check if property name is valid (basic check)
        if (!/^[a-z-]+$/.test(property)) {
          errors.push({
            line: lineNumber,
            column: line.indexOf(property) + 1,
            endLine: lineNumber,
            endColumn: line.indexOf(property) + property.length + 1,
            message: `Invalid property name: ${property}`,
            source: 'CSS Validator'
          });
        }

        // Check if value is empty
        if (!value) {
          errors.push({
            line: lineNumber,
            column: line.indexOf(':') + 2,
            endLine: lineNumber,
            endColumn: line.length,
            message: 'Property value is empty',
            source: 'CSS Validator'
          });
        }
      }
    }
  });

  // Check for unmatched braces
  if (braceCount !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      endLine: lines.length,
      endColumn: 2,
      message: braceCount > 0 ? 'Unclosed brace {' : 'Unexpected closing brace }',
      source: 'CSS Validator'
    });
  }

  return errors;
}

/**
 * JavaScript Error Detection
 */
function setupJSErrorDetection(monaco, editor, onErrorsDetected) {
  let debounceTimer;

  editor.onDidChangeModelContent(() => {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      const value = editor.getValue();
      const errors = validateJavaScript(value);
      onErrorsDetected(errors);
    }, 300);
  });
}

/**
 * Validate JavaScript syntax
 */
function validateJavaScript(js) {
  const errors = [];

  try {
    // Try to parse the JavaScript code
    new Function(js);
  } catch (error) {
    // Extract line and column from error message
    const match = error.message.match(/line (\d+)/i);
    const lineNumber = match ? parseInt(match[1]) : 1;

    errors.push({
      line: lineNumber,
      column: 1,
      endLine: lineNumber,
      endColumn: 100,
      message: error.message,
      source: 'JavaScript Validator'
    });
  }

  // Additional basic checks
  const lines = js.split('\n');
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;

    // Count brackets
    braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    parenCount += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
    bracketCount += (line.match(/\[/g) || []).length - (line.match(/]/g) || []).length;

    // Check for common mistakes
    if (line.includes('==') && !line.includes('===') && !line.includes('!==')) {
      const column = line.indexOf('==') + 1;
      errors.push({
        line: lineNumber,
        column: column,
        endLine: lineNumber,
        endColumn: column + 2,
        message: 'Use === instead of == for comparison',
        source: 'JavaScript Linter'
      });
    }
  });

  // Check for unmatched brackets
  if (braceCount !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      endLine: lines.length,
      endColumn: 2,
      message: braceCount > 0 ? 'Unclosed brace {' : 'Unexpected closing brace }',
      source: 'JavaScript Validator'
    });
  }

  if (parenCount !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      endLine: lines.length,
      endColumn: 2,
      message: parenCount > 0 ? 'Unclosed parenthesis (' : 'Unexpected closing parenthesis )',
      source: 'JavaScript Validator'
    });
  }

  if (bracketCount !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      endLine: lines.length,
      endColumn: 2,
      message: bracketCount > 0 ? 'Unclosed bracket [' : 'Unexpected closing bracket ]',
      source: 'JavaScript Validator'
    });
  }

  return errors;
}

export default { setupErrorDetection };
