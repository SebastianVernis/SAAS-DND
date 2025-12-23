/**
 * Component Tree Builder
 * Builds component tree and relationships
 * 
 * @module ComponentTreeBuilder
 */

export class ComponentTreeBuilder {
  constructor() {
    this.tree = null;
    this.components = new Map();
  }

  /**
   * Build component tree
   * @param {Array} parsedComponents - Parsed components
   * @param {Object} framework - Framework info
   * @returns {Promise<Object>} Component tree
   */
  async build(parsedComponents, framework) {
    // Clear previous data
    this.components.clear();

    // Store components in map
    parsedComponents.forEach(component => {
      this.components.set(component.id, component);
    });

    // Build relationships
    this.buildRelationships(parsedComponents);

    // Find root components
    const roots = this.findRootComponents(parsedComponents);

    // Create tree structure
    this.tree = {
      roots,
      components: parsedComponents,
      relationships: this.buildRelationshipMap(),
      hierarchy: this.buildHierarchy(roots),
      stats: this.calculateStats(parsedComponents)
    };

    return this.tree;
  }

  /**
   * Build relationships between components
   * @param {Array} components - Components
   */
  buildRelationships(components) {
    components.forEach(component => {
      // Initialize relationship arrays
      component.relationships = {
        parent: null,
        children: [],
        dependencies: [],
        usedBy: []
      };

      // For HTML components, analyze element structure
      if (component.type === 'html' && component.elements) {
        component.relationships.children = this.findChildElements(component);
        component.relationships.dependencies = this.findDependencies(component);
      }
    });
  }

  /**
   * Find child elements
   * @param {Object} component - Component
   * @returns {Array} Child elements
   */
  findChildElements(component) {
    const children = [];
    
    if (component.elements) {
      // Group elements by depth to understand hierarchy
      const byDepth = {};
      component.elements.forEach(el => {
        if (!byDepth[el.depth]) {
          byDepth[el.depth] = [];
        }
        byDepth[el.depth].push(el);
      });

      // Root level elements (depth 0) are direct children
      if (byDepth[0]) {
        children.push(...byDepth[0]);
      }
    }

    return children;
  }

  /**
   * Find dependencies (scripts, styles, assets)
   * @param {Object} component - Component
   * @returns {Array} Dependencies
   */
  findDependencies(component) {
    const dependencies = [];

    // Add external scripts
    if (component.metadata?.scripts) {
      component.metadata.scripts.forEach(script => {
        if (script.src) {
          dependencies.push({
            type: 'script',
            path: script.src,
            module: script.module
          });
        }
      });
    }

    // Add external styles
    if (component.styles?.external) {
      component.styles.external.forEach(style => {
        dependencies.push({
          type: 'stylesheet',
          path: style.href,
          media: style.media
        });
      });
    }

    // Add images
    if (component.assets?.images) {
      component.assets.images.forEach(img => {
        if (img.src) {
          dependencies.push({
            type: 'image',
            path: img.src,
            alt: img.alt
          });
        }
      });
    }

    return dependencies;
  }

  /**
   * Find root components
   * @param {Array} components - Components
   * @returns {Array} Root components
   */
  findRootComponents(components) {
    // For HTML projects, files with 'index' or 'main' in name are roots
    const roots = components.filter(component => {
      const name = component.name.toLowerCase();
      return name.includes('index') || 
             name.includes('main') || 
             name.includes('home') ||
             components.length === 1; // If only one file, it's the root
    });

    // If no roots found, use first component
    return roots.length > 0 ? roots : [components[0]];
  }

  /**
   * Build relationship map
   * @returns {Object} Relationship map
   */
  buildRelationshipMap() {
    const map = {};

    this.components.forEach((component, id) => {
      map[id] = {
        id,
        name: component.name,
        type: component.type,
        hasChildren: component.relationships?.children?.length > 0,
        childCount: component.relationships?.children?.length || 0,
        dependencyCount: component.relationships?.dependencies?.length || 0
      };
    });

    return map;
  }

  /**
   * Build hierarchy tree
   * @param {Array} roots - Root components
   * @returns {Array} Hierarchy
   */
  buildHierarchy(roots) {
    const buildNode = (component) => {
      return {
        id: component.id,
        name: component.name,
        type: component.type,
        children: (component.relationships?.children || []).map(child => ({
          tag: child.tag,
          id: child.id,
          classes: child.classes,
          depth: child.depth
        })),
        dependencies: component.relationships?.dependencies || []
      };
    };

    return roots.map(root => buildNode(root));
  }

  /**
   * Calculate statistics
   * @param {Array} components - Components
   * @returns {Object} Statistics
   */
  calculateStats(components) {
    let totalElements = 0;
    let totalDependencies = 0;
    const elementTypes = {};

    components.forEach(component => {
      if (component.elements) {
        totalElements += component.elements.length;

        // Count element types
        component.elements.forEach(el => {
          elementTypes[el.tag] = (elementTypes[el.tag] || 0) + 1;
        });
      }

      if (component.relationships?.dependencies) {
        totalDependencies += component.relationships.dependencies.length;
      }
    });

    // Sort element types by count
    const sortedTypes = Object.entries(elementTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalComponents: components.length,
      totalElements,
      totalDependencies,
      topElementTypes: sortedTypes,
      averageElementsPerComponent: Math.round(totalElements / components.length)
    };
  }

  /**
   * Get tree
   * @returns {Object|null} Tree
   */
  getTree() {
    return this.tree;
  }

  /**
   * Get component by ID
   * @param {string} id - Component ID
   * @returns {Object|null} Component
   */
  getComponent(id) {
    return this.components.get(id);
  }

  /**
   * Find components by name
   * @param {string} name - Component name
   * @returns {Array} Components
   */
  findComponentsByName(name) {
    const results = [];
    this.components.forEach(component => {
      if (component.name.toLowerCase().includes(name.toLowerCase())) {
        results.push(component);
      }
    });
    return results;
  }
}
