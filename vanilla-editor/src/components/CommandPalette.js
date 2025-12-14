/**
 * Command Palette
 * VS Code-style command palette for quick actions (Ctrl+Shift+P)
 */

export class CommandPalette {
  constructor(editor, options = {}) {
    this.editor = editor;
    this.options = {
      placeholder: options.placeholder || 'Type a command...',
      maxResults: options.maxResults || 10,
      ...options
    };

    this.commands = new Map();
    this.isVisible = false;
    this.selectedIndex = 0;
    this.filteredCommands = [];

    this.registerDefaultCommands();
    this.createUI();
    this.setupKeyboardShortcuts();
  }

  /**
   * Register default commands
   */
  registerDefaultCommands() {
    // File operations
    this.registerCommand({
      id: 'file.save',
      label: 'Save File',
      description: 'Save current file',
      keybinding: 'Ctrl+S',
      action: () => this.editor.save()
    });

    this.registerCommand({
      id: 'file.export',
      label: 'Export HTML',
      description: 'Export as HTML file',
      action: () => this.editor.exportHTML()
    });

    this.registerCommand({
      id: 'file.exportAll',
      label: 'Export All Files',
      description: 'Export HTML, CSS, and JS separately',
      action: () => this.editor.exportAll()
    });

    // Editor operations
    this.registerCommand({
      id: 'editor.format',
      label: 'Format Document',
      description: 'Format the current document',
      keybinding: 'Shift+Alt+F',
      action: () => this.editor.formatDocument()
    });

    this.registerCommand({
      id: 'editor.toggleMinimap',
      label: 'Toggle Minimap',
      description: 'Show/hide minimap',
      action: () => this.editor.toggleMinimap()
    });

    this.registerCommand({
      id: 'editor.toggleLineNumbers',
      label: 'Toggle Line Numbers',
      description: 'Show/hide line numbers',
      action: () => this.editor.toggleLineNumbers()
    });

    this.registerCommand({
      id: 'editor.toggleWordWrap',
      label: 'Toggle Word Wrap',
      description: 'Enable/disable word wrap',
      action: () => this.editor.toggleWordWrap()
    });

    // View operations
    this.registerCommand({
      id: 'view.toggleCodePanel',
      label: 'Toggle Code Panel',
      description: 'Show/hide code editor panel',
      action: () => this.editor.toggleCodePanel()
    });

    this.registerCommand({
      id: 'view.togglePropertiesPanel',
      label: 'Toggle Properties Panel',
      description: 'Show/hide properties panel',
      action: () => this.editor.togglePropertiesPanel()
    });

    this.registerCommand({
      id: 'view.toggleComponentsPanel',
      label: 'Toggle Components Panel',
      description: 'Show/hide components panel',
      action: () => this.editor.toggleComponentsPanel()
    });

    // Theme operations
    this.registerCommand({
      id: 'theme.dark',
      label: 'Dark Theme',
      description: 'Switch to dark theme',
      action: () => this.editor.setTheme('dragndrop-dark')
    });

    this.registerCommand({
      id: 'theme.light',
      label: 'Light Theme',
      description: 'Switch to light theme',
      action: () => this.editor.setTheme('dragndrop-light')
    });

    this.registerCommand({
      id: 'theme.highContrast',
      label: 'High Contrast Theme',
      description: 'Switch to high contrast theme',
      action: () => this.editor.setTheme('dragndrop-high-contrast')
    });

    // Language operations
    this.registerCommand({
      id: 'language.html',
      label: 'Set Language: HTML',
      description: 'Change editor language to HTML',
      action: () => this.editor.setLanguage('html')
    });

    this.registerCommand({
      id: 'language.css',
      label: 'Set Language: CSS',
      description: 'Change editor language to CSS',
      action: () => this.editor.setLanguage('css')
    });

    this.registerCommand({
      id: 'language.javascript',
      label: 'Set Language: JavaScript',
      description: 'Change editor language to JavaScript',
      action: () => this.editor.setLanguage('javascript')
    });

    // Help operations
    this.registerCommand({
      id: 'help.shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'Show keyboard shortcuts reference',
      action: () => this.editor.showShortcuts()
    });

    this.registerCommand({
      id: 'help.documentation',
      label: 'Documentation',
      description: 'Open documentation',
      action: () => this.editor.showDocumentation()
    });
  }

  /**
   * Register a command
   */
  registerCommand(command) {
    if (!command.id || !command.label || !command.action) {
      console.error('Invalid command:', command);
      return;
    }

    this.commands.set(command.id, command);
  }

  /**
   * Unregister a command
   */
  unregisterCommand(commandId) {
    this.commands.delete(commandId);
  }

  /**
   * Create UI elements
   */
  createUI() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'command-palette-overlay';
    this.overlay.style.display = 'none';
    this.overlay.addEventListener('click', () => this.hide());

    // Create palette container
    this.container = document.createElement('div');
    this.container.className = 'command-palette';
    this.container.style.display = 'none';

    // Create input
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'command-palette-input';
    this.input.placeholder = this.options.placeholder;
    this.input.addEventListener('input', () => this.handleInput());
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Create results list
    this.resultsList = document.createElement('div');
    this.resultsList.className = 'command-palette-results';

    // Assemble UI
    this.container.appendChild(this.input);
    this.container.appendChild(this.resultsList);

    // Add to document
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.container);
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+P or Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggle();
      }

      // Escape to close
      if (e.key === 'Escape' && this.isVisible) {
        e.preventDefault();
        this.hide();
      }
    });
  }

  /**
   * Handle input changes
   */
  handleInput() {
    const query = this.input.value.toLowerCase().trim();
    
    if (!query) {
      this.filteredCommands = Array.from(this.commands.values());
    } else {
      this.filteredCommands = Array.from(this.commands.values()).filter(cmd => {
        const labelMatch = cmd.label.toLowerCase().includes(query);
        const descMatch = cmd.description?.toLowerCase().includes(query);
        const idMatch = cmd.id.toLowerCase().includes(query);
        return labelMatch || descMatch || idMatch;
      });
    }

    // Limit results
    this.filteredCommands = this.filteredCommands.slice(0, this.options.maxResults);
    
    this.selectedIndex = 0;
    this.renderResults();
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
        this.renderResults();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderResults();
        break;

      case 'Enter':
        e.preventDefault();
        this.executeSelected();
        break;

      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
    }
  }

  /**
   * Render results list
   */
  renderResults() {
    this.resultsList.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'command-palette-no-results';
      noResults.textContent = 'No commands found';
      this.resultsList.appendChild(noResults);
      return;
    }

    this.filteredCommands.forEach((cmd, index) => {
      const item = document.createElement('div');
      item.className = 'command-palette-item';
      
      if (index === this.selectedIndex) {
        item.classList.add('selected');
      }

      // Label
      const label = document.createElement('div');
      label.className = 'command-palette-item-label';
      label.textContent = cmd.label;

      // Description
      const description = document.createElement('div');
      description.className = 'command-palette-item-description';
      description.textContent = cmd.description || '';

      // Keybinding
      if (cmd.keybinding) {
        const keybinding = document.createElement('div');
        keybinding.className = 'command-palette-item-keybinding';
        keybinding.textContent = cmd.keybinding;
        item.appendChild(keybinding);
      }

      item.appendChild(label);
      item.appendChild(description);

      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.executeSelected();
      });

      this.resultsList.appendChild(item);
    });
  }

  /**
   * Execute selected command
   */
  executeSelected() {
    const command = this.filteredCommands[this.selectedIndex];
    
    if (command) {
      try {
        command.action();
        this.hide();
        console.log(`✅ Executed command: ${command.label}`);
      } catch (error) {
        console.error(`❌ Failed to execute command: ${command.label}`, error);
      }
    }
  }

  /**
   * Show palette
   */
  show() {
    this.isVisible = true;
    this.overlay.style.display = 'block';
    this.container.style.display = 'block';
    this.input.value = '';
    this.input.focus();
    this.handleInput();
  }

  /**
   * Hide palette
   */
  hide() {
    this.isVisible = false;
    this.overlay.style.display = 'none';
    this.container.style.display = 'none';
    this.input.value = '';
  }

  /**
   * Toggle palette visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Dispose palette
   */
  dispose() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.commands.clear();
  }
}

export default CommandPalette;
