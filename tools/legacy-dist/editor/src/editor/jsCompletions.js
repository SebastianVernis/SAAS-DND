/**
 * JavaScript Completions
 * Provides intelligent JavaScript API and method completions
 */

export async function setupJSCompletions(monaco) {
  // Register JavaScript completion provider
  monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.', '('],
    
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

      // Check context
      const isDocumentContext = /document\.$/.test(textUntilPosition);
      const isWindowContext = /window\.$/.test(textUntilPosition);
      const isConsoleContext = /console\.$/.test(textUntilPosition);
      const isArrayContext = /\[[^\]]*\]\.$/.test(textUntilPosition);
      const isStringContext = /['"][^'"]*['"]\.$/.test(textUntilPosition);

      if (isDocumentContext) {
        return { suggestions: getDocumentAPISuggestions(monaco, range) };
      } else if (isWindowContext) {
        return { suggestions: getWindowAPISuggestions(monaco, range) };
      } else if (isConsoleContext) {
        return { suggestions: getConsoleAPISuggestions(monaco, range) };
      } else if (isArrayContext) {
        return { suggestions: getArrayMethodSuggestions(monaco, range) };
      } else if (isStringContext) {
        return { suggestions: getStringMethodSuggestions(monaco, range) };
      } else {
        return { suggestions: getGlobalSuggestions(monaco, range) };
      }
    }
  });
}

/**
 * Document API suggestions
 */
function getDocumentAPISuggestions(monaco, range) {
  const methods = [
    { label: 'getElementById', detail: 'Get element by ID', insertText: 'getElementById("$1")' },
    { label: 'querySelector', detail: 'Query selector', insertText: 'querySelector("$1")' },
    { label: 'querySelectorAll', detail: 'Query all selectors', insertText: 'querySelectorAll("$1")' },
    { label: 'createElement', detail: 'Create element', insertText: 'createElement("$1")' },
    { label: 'createTextNode', detail: 'Create text node', insertText: 'createTextNode("$1")' },
    { label: 'getElementsByClassName', detail: 'Get elements by class', insertText: 'getElementsByClassName("$1")' },
    { label: 'getElementsByTagName', detail: 'Get elements by tag', insertText: 'getElementsByTagName("$1")' },
    { label: 'addEventListener', detail: 'Add event listener', insertText: 'addEventListener("$1", function(event) {\n\t$2\n})' },
    { label: 'body', detail: 'Document body', insertText: 'body' },
    { label: 'head', detail: 'Document head', insertText: 'head' },
    { label: 'title', detail: 'Document title', insertText: 'title' }
  ];

  return methods.map(method => ({
    label: method.label,
    kind: monaco.languages.CompletionItemKind.Method,
    detail: method.detail,
    insertText: method.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

/**
 * Window API suggestions
 */
function getWindowAPISuggestions(monaco, range) {
  const methods = [
    { label: 'alert', detail: 'Show alert', insertText: 'alert("$1")' },
    { label: 'confirm', detail: 'Show confirm dialog', insertText: 'confirm("$1")' },
    { label: 'prompt', detail: 'Show prompt dialog', insertText: 'prompt("$1", "$2")' },
    { label: 'setTimeout', detail: 'Set timeout', insertText: 'setTimeout(function() {\n\t$1\n}, $2)' },
    { label: 'setInterval', detail: 'Set interval', insertText: 'setInterval(function() {\n\t$1\n}, $2)' },
    { label: 'clearTimeout', detail: 'Clear timeout', insertText: 'clearTimeout($1)' },
    { label: 'clearInterval', detail: 'Clear interval', insertText: 'clearInterval($1)' },
    { label: 'location', detail: 'Window location', insertText: 'location' },
    { label: 'localStorage', detail: 'Local storage', insertText: 'localStorage' },
    { label: 'sessionStorage', detail: 'Session storage', insertText: 'sessionStorage' },
    { label: 'fetch', detail: 'Fetch API', insertText: 'fetch("$1")\n\t.then(response => response.json())\n\t.then(data => {\n\t\t$2\n\t})' }
  ];

  return methods.map(method => ({
    label: method.label,
    kind: monaco.languages.CompletionItemKind.Method,
    detail: method.detail,
    insertText: method.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

/**
 * Console API suggestions
 */
function getConsoleAPISuggestions(monaco, range) {
  const methods = [
    { label: 'log', detail: 'Log message', insertText: 'log($1)' },
    { label: 'error', detail: 'Log error', insertText: 'error($1)' },
    { label: 'warn', detail: 'Log warning', insertText: 'warn($1)' },
    { label: 'info', detail: 'Log info', insertText: 'info($1)' },
    { label: 'debug', detail: 'Log debug', insertText: 'debug($1)' },
    { label: 'table', detail: 'Log table', insertText: 'table($1)' },
    { label: 'group', detail: 'Start group', insertText: 'group("$1")' },
    { label: 'groupEnd', detail: 'End group', insertText: 'groupEnd()' },
    { label: 'clear', detail: 'Clear console', insertText: 'clear()' },
    { label: 'time', detail: 'Start timer', insertText: 'time("$1")' },
    { label: 'timeEnd', detail: 'End timer', insertText: 'timeEnd("$1")' }
  ];

  return methods.map(method => ({
    label: method.label,
    kind: monaco.languages.CompletionItemKind.Method,
    detail: method.detail,
    insertText: method.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

/**
 * Array method suggestions
 */
function getArrayMethodSuggestions(monaco, range) {
  const methods = [
    { label: 'map', detail: 'Map array', insertText: 'map(item => $1)' },
    { label: 'filter', detail: 'Filter array', insertText: 'filter(item => $1)' },
    { label: 'reduce', detail: 'Reduce array', insertText: 'reduce((acc, item) => $1, $2)' },
    { label: 'forEach', detail: 'For each item', insertText: 'forEach(item => {\n\t$1\n})' },
    { label: 'find', detail: 'Find item', insertText: 'find(item => $1)' },
    { label: 'findIndex', detail: 'Find index', insertText: 'findIndex(item => $1)' },
    { label: 'some', detail: 'Some items match', insertText: 'some(item => $1)' },
    { label: 'every', detail: 'Every item matches', insertText: 'every(item => $1)' },
    { label: 'push', detail: 'Add to end', insertText: 'push($1)' },
    { label: 'pop', detail: 'Remove from end', insertText: 'pop()' },
    { label: 'shift', detail: 'Remove from start', insertText: 'shift()' },
    { label: 'unshift', detail: 'Add to start', insertText: 'unshift($1)' },
    { label: 'slice', detail: 'Slice array', insertText: 'slice($1, $2)' },
    { label: 'splice', detail: 'Splice array', insertText: 'splice($1, $2)' },
    { label: 'join', detail: 'Join array', insertText: 'join("$1")' },
    { label: 'sort', detail: 'Sort array', insertText: 'sort((a, b) => $1)' },
    { label: 'reverse', detail: 'Reverse array', insertText: 'reverse()' },
    { label: 'includes', detail: 'Check if includes', insertText: 'includes($1)' },
    { label: 'indexOf', detail: 'Index of item', insertText: 'indexOf($1)' },
    { label: 'length', detail: 'Array length', insertText: 'length' }
  ];

  return methods.map(method => ({
    label: method.label,
    kind: monaco.languages.CompletionItemKind.Method,
    detail: method.detail,
    insertText: method.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

/**
 * String method suggestions
 */
function getStringMethodSuggestions(monaco, range) {
  const methods = [
    { label: 'charAt', detail: 'Character at index', insertText: 'charAt($1)' },
    { label: 'charCodeAt', detail: 'Char code at index', insertText: 'charCodeAt($1)' },
    { label: 'concat', detail: 'Concatenate strings', insertText: 'concat($1)' },
    { label: 'includes', detail: 'Check if includes', insertText: 'includes("$1")' },
    { label: 'indexOf', detail: 'Index of substring', insertText: 'indexOf("$1")' },
    { label: 'lastIndexOf', detail: 'Last index of', insertText: 'lastIndexOf("$1")' },
    { label: 'match', detail: 'Match regex', insertText: 'match(/$1/)' },
    { label: 'replace', detail: 'Replace substring', insertText: 'replace("$1", "$2")' },
    { label: 'search', detail: 'Search regex', insertText: 'search(/$1/)' },
    { label: 'slice', detail: 'Slice string', insertText: 'slice($1, $2)' },
    { label: 'split', detail: 'Split string', insertText: 'split("$1")' },
    { label: 'substring', detail: 'Get substring', insertText: 'substring($1, $2)' },
    { label: 'toLowerCase', detail: 'To lowercase', insertText: 'toLowerCase()' },
    { label: 'toUpperCase', detail: 'To uppercase', insertText: 'toUpperCase()' },
    { label: 'trim', detail: 'Trim whitespace', insertText: 'trim()' },
    { label: 'trimStart', detail: 'Trim start', insertText: 'trimStart()' },
    { label: 'trimEnd', detail: 'Trim end', insertText: 'trimEnd()' },
    { label: 'padStart', detail: 'Pad start', insertText: 'padStart($1, "$2")' },
    { label: 'padEnd', detail: 'Pad end', insertText: 'padEnd($1, "$2")' },
    { label: 'repeat', detail: 'Repeat string', insertText: 'repeat($1)' },
    { label: 'startsWith', detail: 'Starts with', insertText: 'startsWith("$1")' },
    { label: 'endsWith', detail: 'Ends with', insertText: 'endsWith("$1")' },
    { label: 'length', detail: 'String length', insertText: 'length' }
  ];

  return methods.map(method => ({
    label: method.label,
    kind: monaco.languages.CompletionItemKind.Method,
    detail: method.detail,
    insertText: method.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

/**
 * Global suggestions (keywords, common patterns)
 */
function getGlobalSuggestions(monaco, range) {
  const suggestions = [
    { label: 'function', detail: 'Function declaration', insertText: 'function $1($2) {\n\t$3\n}' },
    { label: 'const', detail: 'Const declaration', insertText: 'const $1 = $2;' },
    { label: 'let', detail: 'Let declaration', insertText: 'let $1 = $2;' },
    { label: 'var', detail: 'Var declaration', insertText: 'var $1 = $2;' },
    { label: 'if', detail: 'If statement', insertText: 'if ($1) {\n\t$2\n}' },
    { label: 'else', detail: 'Else statement', insertText: 'else {\n\t$1\n}' },
    { label: 'for', detail: 'For loop', insertText: 'for (let i = 0; i < $1; i++) {\n\t$2\n}' },
    { label: 'while', detail: 'While loop', insertText: 'while ($1) {\n\t$2\n}' },
    { label: 'switch', detail: 'Switch statement', insertText: 'switch ($1) {\n\tcase $2:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$4\n}' },
    { label: 'try', detail: 'Try-catch', insertText: 'try {\n\t$1\n} catch (error) {\n\t$2\n}' },
    { label: 'class', detail: 'Class declaration', insertText: 'class $1 {\n\tconstructor($2) {\n\t\t$3\n\t}\n}' },
    { label: 'return', detail: 'Return statement', insertText: 'return $1;' },
    { label: 'document', detail: 'Document object', insertText: 'document' },
    { label: 'window', detail: 'Window object', insertText: 'window' },
    { label: 'console', detail: 'Console object', insertText: 'console' }
  ];

  return suggestions.map(suggestion => ({
    label: suggestion.label,
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail: suggestion.detail,
    insertText: suggestion.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

export default { setupJSCompletions };
