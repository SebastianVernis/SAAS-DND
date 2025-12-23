/**
 * Snippets Library
 * Provides code snippets for common patterns (Bootstrap, Tailwind, custom)
 */

export class SnippetsLibrary {
  constructor(editor) {
    this.editor = editor;
    this.snippets = new Map();
    this.categories = new Map();
    
    this.registerDefaultSnippets();
  }

  /**
   * Register default snippets
   */
  registerDefaultSnippets() {
    // HTML Snippets
    this.registerSnippet({
      id: 'html-boilerplate',
      category: 'HTML',
      label: 'HTML5 Boilerplate',
      description: 'Complete HTML5 document structure',
      prefix: 'html5',
      body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${1:Document}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  \${2:<!-- Content here -->}
  <script src="script.js"></script>
</body>
</html>`
    });

    this.registerSnippet({
      id: 'html-form',
      category: 'HTML',
      label: 'Form',
      description: 'Basic form structure',
      prefix: 'form',
      body: `<form action="\${1:#}" method="\${2:post}">
  <label for="\${3:input-id}">\${4:Label}:</label>
  <input type="\${5:text}" id="\${3:input-id}" name="\${6:input-name}" required>
  <button type="submit">\${7:Submit}</button>
</form>`
    });

    // Bootstrap Snippets
    this.registerSnippet({
      id: 'bootstrap-navbar',
      category: 'Bootstrap',
      label: 'Bootstrap Navbar',
      description: 'Responsive Bootstrap navigation bar',
      prefix: 'bs-navbar',
      body: `<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">\${1:Brand}</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" href="#">\${2:Home}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">\${3:Features}</a>
        </li>
      </ul>
    </div>
  </div>
</nav>`
    });

    this.registerSnippet({
      id: 'bootstrap-card',
      category: 'Bootstrap',
      label: 'Bootstrap Card',
      description: 'Bootstrap card component',
      prefix: 'bs-card',
      body: `<div class="card" style="width: 18rem;">
  <img src="\${1:image.jpg}" class="card-img-top" alt="\${2:Image}">
  <div class="card-body">
    <h5 class="card-title">\${3:Card Title}</h5>
    <p class="card-text">\${4:Card description text goes here.}</p>
    <a href="#" class="btn btn-primary">\${5:Go somewhere}</a>
  </div>
</div>`
    });

    this.registerSnippet({
      id: 'bootstrap-grid',
      category: 'Bootstrap',
      label: 'Bootstrap Grid',
      description: 'Bootstrap responsive grid',
      prefix: 'bs-grid',
      body: `<div class="container">
  <div class="row">
    <div class="col-md-\${1:4}">
      \${2:Column 1}
    </div>
    <div class="col-md-\${3:4}">
      \${4:Column 2}
    </div>
    <div class="col-md-\${5:4}">
      \${6:Column 3}
    </div>
  </div>
</div>`
    });

    // Tailwind CSS Snippets
    this.registerSnippet({
      id: 'tailwind-card',
      category: 'Tailwind',
      label: 'Tailwind Card',
      description: 'Card component with Tailwind CSS',
      prefix: 'tw-card',
      body: `<div class="max-w-sm rounded overflow-hidden shadow-lg">
  <img class="w-full" src="\${1:image.jpg}" alt="\${2:Image}">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">\${3:Card Title}</div>
    <p class="text-gray-700 text-base">
      \${4:Card description text goes here.}
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">\${5:#tag}</span>
  </div>
</div>`
    });

    this.registerSnippet({
      id: 'tailwind-button',
      category: 'Tailwind',
      label: 'Tailwind Button',
      description: 'Button with Tailwind CSS',
      prefix: 'tw-btn',
      body: `<button class="bg-\${1:blue}-500 hover:bg-\${1:blue}-700 text-white font-bold py-2 px-4 rounded">
  \${2:Button Text}
</button>`
    });

    this.registerSnippet({
      id: 'tailwind-flex',
      category: 'Tailwind',
      label: 'Tailwind Flexbox',
      description: 'Flexbox layout with Tailwind',
      prefix: 'tw-flex',
      body: `<div class="flex \${1:justify-center} \${2:items-center} \${3:gap-4}">
  <div>\${4:Item 1}</div>
  <div>\${5:Item 2}</div>
  <div>\${6:Item 3}</div>
</div>`
    });

    // CSS Snippets
    this.registerSnippet({
      id: 'css-flexbox',
      category: 'CSS',
      label: 'Flexbox Container',
      description: 'Flexbox layout CSS',
      prefix: 'flex',
      body: `.container {
  display: flex;
  justify-content: \${1:center};
  align-items: \${2:center};
  gap: \${3:1rem};
}`
    });

    this.registerSnippet({
      id: 'css-grid',
      category: 'CSS',
      label: 'Grid Container',
      description: 'CSS Grid layout',
      prefix: 'grid',
      body: `.container {
  display: grid;
  grid-template-columns: \${1:repeat(3, 1fr)};
  gap: \${2:1rem};
}`
    });

    this.registerSnippet({
      id: 'css-animation',
      category: 'CSS',
      label: 'CSS Animation',
      description: 'Keyframe animation',
      prefix: 'animation',
      body: `@keyframes \${1:animationName} {
  0% {
    \${2:opacity: 0;}
  }
  100% {
    \${3:opacity: 1;}
  }
}

.animated {
  animation: \${1:animationName} \${4:1s} \${5:ease-in-out};
}`
    });

    // JavaScript Snippets
    this.registerSnippet({
      id: 'js-function',
      category: 'JavaScript',
      label: 'Function',
      description: 'Function declaration',
      prefix: 'fn',
      body: `function \${1:functionName}(\${2:params}) {
  \${3:// Function body}
}`
    });

    this.registerSnippet({
      id: 'js-arrow-function',
      category: 'JavaScript',
      label: 'Arrow Function',
      description: 'Arrow function expression',
      prefix: 'af',
      body: `const \${1:functionName} = (\${2:params}) => {
  \${3:// Function body}
};`
    });

    this.registerSnippet({
      id: 'js-event-listener',
      category: 'JavaScript',
      label: 'Event Listener',
      description: 'Add event listener',
      prefix: 'ael',
      body: `document.querySelector('\${1:#element}').addEventListener('\${2:click}', function(event) {
  \${3:// Event handler}
});`
    });

    this.registerSnippet({
      id: 'js-fetch',
      category: 'JavaScript',
      label: 'Fetch API',
      description: 'Fetch API request',
      prefix: 'fetch',
      body: `fetch('\${1:url}')
  .then(response => response.json())
  .then(data => {
    \${2:// Handle data}
  })
  .catch(error => {
    console.error('Error:', error);
  });`
    });

    this.registerSnippet({
      id: 'js-async-await',
      category: 'JavaScript',
      label: 'Async/Await',
      description: 'Async function with await',
      prefix: 'async',
      body: `async function \${1:functionName}() {
  try {
    const response = await fetch('\${2:url}');
    const data = await response.json();
    \${3:// Handle data}
  } catch (error) {
    console.error('Error:', error);
  }
}`
    });

    // DragNDrop Custom Snippets
    this.registerSnippet({
      id: 'dragndrop-hero',
      category: 'DragNDrop',
      label: 'Hero Section',
      description: 'Hero section with CTA',
      prefix: 'hero',
      body: `<section class="hero">
  <div class="hero-content">
    <h1>\${1:Welcome to Our Site}</h1>
    <p>\${2:Your journey starts here}</p>
    <button class="cta-button">\${3:Get Started}</button>
  </div>
</section>`
    });

    this.registerSnippet({
      id: 'dragndrop-features',
      category: 'DragNDrop',
      label: 'Features Grid',
      description: '3-column features section',
      prefix: 'features',
      body: `<section class="features">
  <div class="feature">
    <h3>\${1:Feature 1}</h3>
    <p>\${2:Description}</p>
  </div>
  <div class="feature">
    <h3>\${3:Feature 2}</h3>
    <p>\${4:Description}</p>
  </div>
  <div class="feature">
    <h3>\${5:Feature 3}</h3>
    <p>\${6:Description}</p>
  </div>
</section>`
    });
  }

  /**
   * Register a snippet
   */
  registerSnippet(snippet) {
    if (!snippet.id || !snippet.body) {
      console.error('Invalid snippet:', snippet);
      return;
    }

    this.snippets.set(snippet.id, snippet);

    // Add to category
    const category = snippet.category || 'Other';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(snippet);
  }

  /**
   * Get snippet by ID
   */
  getSnippet(id) {
    return this.snippets.get(id);
  }

  /**
   * Get snippets by category
   */
  getSnippetsByCategory(category) {
    return this.categories.get(category) || [];
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Search snippets
   */
  searchSnippets(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.snippets.values()).filter(snippet => {
      return (
        snippet.label.toLowerCase().includes(lowerQuery) ||
        snippet.description?.toLowerCase().includes(lowerQuery) ||
        snippet.prefix?.toLowerCase().includes(lowerQuery) ||
        snippet.category?.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Insert snippet into editor
   */
  insertSnippet(snippetId) {
    const snippet = this.getSnippet(snippetId);
    if (!snippet) {
      console.error('Snippet not found:', snippetId);
      return;
    }

    // Process snippet body (replace placeholders)
    const processedBody = this.processSnippetBody(snippet.body);
    
    // Insert into editor
    this.editor.insertText(processedBody);
    
    console.log(`✅ Inserted snippet: ${snippet.label}`);
  }

  /**
   * Process snippet body (handle placeholders)
   */
  processSnippetBody(body) {
    // Replace ${n:placeholder} with placeholder text
    return body.replace(/\$\{(\d+):([^}]+)\}/g, '$2');
  }

  /**
   * Get all snippets
   */
  getAllSnippets() {
    return Array.from(this.snippets.values());
  }

  /**
   * Remove snippet
   */
  removeSnippet(snippetId) {
    const snippet = this.snippets.get(snippetId);
    if (snippet) {
      this.snippets.delete(snippetId);
      
      // Remove from category
      const category = snippet.category || 'Other';
      const categorySnippets = this.categories.get(category);
      if (categorySnippets) {
        const index = categorySnippets.findIndex(s => s.id === snippetId);
        if (index !== -1) {
          categorySnippets.splice(index, 1);
        }
      }
    }
  }

  /**
   * Clear all snippets
   */
  clearSnippets() {
    this.snippets.clear();
    this.categories.clear();
  }
}

export default SnippetsLibrary;
