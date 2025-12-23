/**
 * Problems Panel
 * Displays errors, warnings, and hints from code validation
 */

export class ProblemsPanel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      maxProblems: options.maxProblems || 100,
      groupByFile: options.groupByFile !== false,
      ...options
    };

    this.problems = [];
    this.filteredProblems = [];
    this.filters = {
      errors: true,
      warnings: true,
      info: true
    };

    this.createUI();
  }

  /**
   * Create UI elements
   */
  createUI() {
    this.panel = document.createElement('div');
    this.panel.className = 'problems-panel';

    // Create header
    this.header = document.createElement('div');
    this.header.className = 'problems-panel-header';

    // Title
    const title = document.createElement('div');
    title.className = 'problems-panel-title';
    title.textContent = 'Problems';

    // Counters
    this.counters = document.createElement('div');
    this.counters.className = 'problems-panel-counters';

    // Filter buttons
    this.errorFilter = this.createFilterButton('error', 'Errors', 0);
    this.warningFilter = this.createFilterButton('warning', 'Warnings', 0);
    this.infoFilter = this.createFilterButton('info', 'Info', 0);

    this.counters.appendChild(this.errorFilter);
    this.counters.appendChild(this.warningFilter);
    this.counters.appendChild(this.infoFilter);

    // Clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'problems-panel-clear';
    clearButton.textContent = 'Clear';
    clearButton.addEventListener('click', () => this.clearProblems());

    this.header.appendChild(title);
    this.header.appendChild(this.counters);
    this.header.appendChild(clearButton);

    // Create content area
    this.content = document.createElement('div');
    this.content.className = 'problems-panel-content';

    // Assemble panel
    this.panel.appendChild(this.header);
    this.panel.appendChild(this.content);

    // Add to container
    if (this.container) {
      this.container.appendChild(this.panel);
    }
  }

  /**
   * Create filter button
   */
  createFilterButton(type, label, count) {
    const button = document.createElement('button');
    button.className = `problems-filter problems-filter-${type} active`;
    button.innerHTML = `
      <span class="problems-filter-icon"></span>
      <span class="problems-filter-label">${label}</span>
      <span class="problems-filter-count">${count}</span>
    `;

    button.addEventListener('click', () => {
      this.toggleFilter(type);
      button.classList.toggle('active');
    });

    return button;
  }

  /**
   * Toggle filter
   */
  toggleFilter(type) {
    if (type === 'error') {
      this.filters.errors = !this.filters.errors;
    } else if (type === 'warning') {
      this.filters.warnings = !this.filters.warnings;
    } else if (type === 'info') {
      this.filters.info = !this.filters.info;
    }

    this.applyFilters();
  }

  /**
   * Add problem
   */
  addProblem(problem) {
    if (!problem.message || !problem.severity) {
      console.error('Invalid problem:', problem);
      return;
    }

    // Normalize severity
    problem.severity = problem.severity.toLowerCase();

    this.problems.push(problem);
    this.applyFilters();
    this.updateCounters();
  }

  /**
   * Add multiple problems
   */
  addProblems(problems) {
    problems.forEach(problem => {
      if (problem.message && problem.severity) {
        problem.severity = problem.severity.toLowerCase();
        this.problems.push(problem);
      }
    });

    this.applyFilters();
    this.updateCounters();
  }

  /**
   * Clear all problems
   */
  clearProblems() {
    this.problems = [];
    this.filteredProblems = [];
    this.updateCounters();
    this.render();
  }

  /**
   * Apply filters
   */
  applyFilters() {
    this.filteredProblems = this.problems.filter(problem => {
      if (problem.severity === 'error' && !this.filters.errors) return false;
      if (problem.severity === 'warning' && !this.filters.warnings) return false;
      if (problem.severity === 'info' && !this.filters.info) return false;
      return true;
    });

    this.render();
  }

  /**
   * Update counters
   */
  updateCounters() {
    const errorCount = this.problems.filter(p => p.severity === 'error').length;
    const warningCount = this.problems.filter(p => p.severity === 'warning').length;
    const infoCount = this.problems.filter(p => p.severity === 'info').length;

    this.errorFilter.querySelector('.problems-filter-count').textContent = errorCount;
    this.warningFilter.querySelector('.problems-filter-count').textContent = warningCount;
    this.infoFilter.querySelector('.problems-filter-count').textContent = infoCount;
  }

  /**
   * Render problems list
   */
  render() {
    this.content.innerHTML = '';

    if (this.filteredProblems.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'problems-panel-empty';
      emptyState.textContent = 'No problems detected';
      this.content.appendChild(emptyState);
      return;
    }

    // Group by file if enabled
    if (this.options.groupByFile) {
      this.renderGrouped();
    } else {
      this.renderFlat();
    }
  }

  /**
   * Render problems grouped by file
   */
  renderGrouped() {
    const grouped = new Map();

    this.filteredProblems.forEach(problem => {
      const file = problem.file || 'Unknown File';
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file).push(problem);
    });

    grouped.forEach((problems, file) => {
      // File header
      const fileHeader = document.createElement('div');
      fileHeader.className = 'problems-file-header';
      fileHeader.textContent = `${file} (${problems.length})`;
      this.content.appendChild(fileHeader);

      // Problems list
      problems.forEach(problem => {
        this.content.appendChild(this.createProblemItem(problem));
      });
    });
  }

  /**
   * Render problems in flat list
   */
  renderFlat() {
    this.filteredProblems.forEach(problem => {
      this.content.appendChild(this.createProblemItem(problem));
    });
  }

  /**
   * Create problem item element
   */
  createProblemItem(problem) {
    const item = document.createElement('div');
    item.className = `problems-item problems-item-${problem.severity}`;

    // Icon
    const icon = document.createElement('span');
    icon.className = `problems-item-icon problems-icon-${problem.severity}`;
    item.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'problems-item-content';

    // Message
    const message = document.createElement('div');
    message.className = 'problems-item-message';
    message.textContent = problem.message;
    content.appendChild(message);

    // Location
    if (problem.line !== undefined) {
      const location = document.createElement('div');
      location.className = 'problems-item-location';
      
      let locationText = `Line ${problem.line}`;
      if (problem.column !== undefined) {
        locationText += `, Column ${problem.column}`;
      }
      if (problem.file) {
        locationText = `${problem.file} - ${locationText}`;
      }
      
      location.textContent = locationText;
      content.appendChild(location);
    }

    // Source
    if (problem.source) {
      const source = document.createElement('div');
      source.className = 'problems-item-source';
      source.textContent = problem.source;
      content.appendChild(source);
    }

    item.appendChild(content);

    // Click to navigate
    if (problem.line !== undefined) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        this.onProblemClick(problem);
      });
    }

    return item;
  }

  /**
   * Handle problem click
   */
  onProblemClick(problem) {
    if (this.options.onProblemClick) {
      this.options.onProblemClick(problem);
    }
  }

  /**
   * Get problems by severity
   */
  getProblemsBySeverity(severity) {
    return this.problems.filter(p => p.severity === severity);
  }

  /**
   * Get problems by file
   */
  getProblemsByFile(file) {
    return this.problems.filter(p => p.file === file);
  }

  /**
   * Get problem count
   */
  getProblemCount() {
    return {
      total: this.problems.length,
      errors: this.problems.filter(p => p.severity === 'error').length,
      warnings: this.problems.filter(p => p.severity === 'warning').length,
      info: this.problems.filter(p => p.severity === 'info').length
    };
  }

  /**
   * Show panel
   */
  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
    }
  }

  /**
   * Hide panel
   */
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.panel) {
      const isVisible = this.panel.style.display !== 'none';
      this.panel.style.display = isVisible ? 'none' : 'block';
    }
  }

  /**
   * Dispose panel
   */
  dispose() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.problems = [];
    this.filteredProblems = [];
  }
}

export default ProblemsPanel;
