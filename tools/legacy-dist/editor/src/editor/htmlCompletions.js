/**
 * HTML Completions
 * Provides intelligent HTML tag and attribute completions
 */

export async function setupHTMLCompletions(monaco) {
  // Register HTML completion provider
  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['<', ' ', '"', '='],
    
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

      // Check if we're in a tag context
      const isInTag = /<[a-zA-Z]*$/.test(textUntilPosition);
      const isInAttribute = /<[a-zA-Z]+\s+[^>]*$/.test(textUntilPosition);

      if (isInTag) {
        return { suggestions: getHTMLTagSuggestions(monaco, range) };
      } else if (isInAttribute) {
        return { suggestions: getHTMLAttributeSuggestions(monaco, range, textUntilPosition) };
      }

      return { suggestions: [] };
    }
  });
}

/**
 * Get HTML tag suggestions
 */
function getHTMLTagSuggestions(monaco, range) {
  const tags = [
    // Structure
    { label: 'div', detail: 'Container element', insertText: 'div>\n\t$0\n</div>' },
    { label: 'span', detail: 'Inline container', insertText: 'span>$0</span>' },
    { label: 'section', detail: 'Section element', insertText: 'section>\n\t$0\n</section>' },
    { label: 'article', detail: 'Article element', insertText: 'article>\n\t$0\n</article>' },
    { label: 'header', detail: 'Header element', insertText: 'header>\n\t$0\n</header>' },
    { label: 'footer', detail: 'Footer element', insertText: 'footer>\n\t$0\n</footer>' },
    { label: 'nav', detail: 'Navigation element', insertText: 'nav>\n\t$0\n</nav>' },
    { label: 'main', detail: 'Main content', insertText: 'main>\n\t$0\n</main>' },
    { label: 'aside', detail: 'Sidebar content', insertText: 'aside>\n\t$0\n</aside>' },
    
    // Text
    { label: 'h1', detail: 'Heading 1', insertText: 'h1>$0</h1>' },
    { label: 'h2', detail: 'Heading 2', insertText: 'h2>$0</h2>' },
    { label: 'h3', detail: 'Heading 3', insertText: 'h3>$0</h3>' },
    { label: 'h4', detail: 'Heading 4', insertText: 'h4>$0</h4>' },
    { label: 'h5', detail: 'Heading 5', insertText: 'h5>$0</h5>' },
    { label: 'h6', detail: 'Heading 6', insertText: 'h6>$0</h6>' },
    { label: 'p', detail: 'Paragraph', insertText: 'p>$0</p>' },
    { label: 'a', detail: 'Anchor link', insertText: 'a href="$1">$0</a>' },
    { label: 'strong', detail: 'Bold text', insertText: 'strong>$0</strong>' },
    { label: 'em', detail: 'Italic text', insertText: 'em>$0</em>' },
    { label: 'code', detail: 'Code snippet', insertText: 'code>$0</code>' },
    { label: 'pre', detail: 'Preformatted text', insertText: 'pre>\n\t$0\n</pre>' },
    
    // Lists
    { label: 'ul', detail: 'Unordered list', insertText: 'ul>\n\t<li>$0</li>\n</ul>' },
    { label: 'ol', detail: 'Ordered list', insertText: 'ol>\n\t<li>$0</li>\n</ol>' },
    { label: 'li', detail: 'List item', insertText: 'li>$0</li>' },
    
    // Forms
    { label: 'form', detail: 'Form element', insertText: 'form action="$1" method="$2">\n\t$0\n</form>' },
    { label: 'input', detail: 'Input field', insertText: 'input type="$1" name="$2" />' },
    { label: 'textarea', detail: 'Text area', insertText: 'textarea name="$1">$0</textarea>' },
    { label: 'button', detail: 'Button', insertText: 'button type="$1">$0</button>' },
    { label: 'select', detail: 'Select dropdown', insertText: 'select name="$1">\n\t<option value="$2">$0</option>\n</select>' },
    { label: 'option', detail: 'Select option', insertText: 'option value="$1">$0</option>' },
    { label: 'label', detail: 'Form label', insertText: 'label for="$1">$0</label>' },
    
    // Media
    { label: 'img', detail: 'Image', insertText: 'img src="$1" alt="$2" />' },
    { label: 'video', detail: 'Video element', insertText: 'video src="$1" controls>\n\t$0\n</video>' },
    { label: 'audio', detail: 'Audio element', insertText: 'audio src="$1" controls>\n\t$0\n</audio>' },
    { label: 'iframe', detail: 'Inline frame', insertText: 'iframe src="$1"></iframe>' },
    
    // Table
    { label: 'table', detail: 'Table', insertText: 'table>\n\t<tr>\n\t\t<td>$0</td>\n\t</tr>\n</table>' },
    { label: 'tr', detail: 'Table row', insertText: 'tr>\n\t<td>$0</td>\n</tr>' },
    { label: 'td', detail: 'Table cell', insertText: 'td>$0</td>' },
    { label: 'th', detail: 'Table header', insertText: 'th>$0</th>' },
    { label: 'thead', detail: 'Table head', insertText: 'thead>\n\t$0\n</thead>' },
    { label: 'tbody', detail: 'Table body', insertText: 'tbody>\n\t$0\n</tbody>' },
    { label: 'tfoot', detail: 'Table footer', insertText: 'tfoot>\n\t$0\n</tfoot>' }
  ];

  return tags.map(tag => ({
    label: tag.label,
    kind: monaco.languages.CompletionItemKind.Property,
    detail: tag.detail,
    insertText: tag.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

/**
 * Get HTML attribute suggestions
 */
function getHTMLAttributeSuggestions(monaco, range, context) {
  const commonAttributes = [
    { label: 'id', detail: 'Element ID', insertText: 'id="$1"' },
    { label: 'class', detail: 'CSS classes', insertText: 'class="$1"' },
    { label: 'style', detail: 'Inline styles', insertText: 'style="$1"' },
    { label: 'title', detail: 'Tooltip text', insertText: 'title="$1"' },
    { label: 'data-', detail: 'Data attribute', insertText: 'data-$1="$2"' },
    { label: 'aria-label', detail: 'Accessibility label', insertText: 'aria-label="$1"' },
    { label: 'aria-hidden', detail: 'Hide from screen readers', insertText: 'aria-hidden="$1"' },
    { label: 'role', detail: 'ARIA role', insertText: 'role="$1"' }
  ];

  const eventAttributes = [
    { label: 'onclick', detail: 'Click event', insertText: 'onclick="$1"' },
    { label: 'onchange', detail: 'Change event', insertText: 'onchange="$1"' },
    { label: 'onsubmit', detail: 'Submit event', insertText: 'onsubmit="$1"' },
    { label: 'onload', detail: 'Load event', insertText: 'onload="$1"' },
    { label: 'onmouseover', detail: 'Mouse over event', insertText: 'onmouseover="$1"' },
    { label: 'onmouseout', detail: 'Mouse out event', insertText: 'onmouseout="$1"' }
  ];

  const allAttributes = [...commonAttributes, ...eventAttributes];

  return allAttributes.map(attr => ({
    label: attr.label,
    kind: monaco.languages.CompletionItemKind.Property,
    detail: attr.detail,
    insertText: attr.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range
  }));
}

export default { setupHTMLCompletions };
