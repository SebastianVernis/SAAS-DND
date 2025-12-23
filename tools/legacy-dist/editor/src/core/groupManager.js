/**
 * GroupManager - Handles grouping and ungrouping of elements
 * Supports nested groups and group manipulation
 */

class GroupManager {
  constructor(layersManager) {
    this.layersManager = layersManager;
    this.groups = new Map(); // groupId -> group object
    this.groupCounter = 0;

    console.log('📦 GroupManager initialized');
  }

  /**
   * Create a group from elements
   */
  createGroup(elements, name = null) {
    if (!elements || elements.length < 2) {
      console.warn('Need at least 2 elements to create a group');
      return null;
    }

    const groupId = `group-${++this.groupCounter}`;
    const groupName = name || `Grupo ${this.groupCounter}`;

    // Create group container
    const groupElement = document.createElement('div');
    groupElement.className = 'canvas-element element-group';
    groupElement.dataset.groupId = groupId;
    groupElement.dataset.layerName = groupName;
    groupElement.style.cssText = `
            position: relative;
            display: inline-block;
            border: 2px dashed var(--accent-primary);
            padding: 10px;
            background: rgba(37, 99, 235, 0.05);
        `;

    // Get common parent
    const parent = elements[0].parentElement;

    // Calculate group bounds
    const bounds = this.calculateBounds(elements);

    // Position group
    groupElement.style.position = 'absolute';
    groupElement.style.left = `${bounds.left}px`;
    groupElement.style.top = `${bounds.top}px`;
    groupElement.style.width = `${bounds.width}px`;
    groupElement.style.height = `${bounds.height}px`;

    // Move elements into group
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const groupRect = bounds;

      // Adjust element position relative to group
      const relativeLeft = rect.left - groupRect.left;
      const relativeTop = rect.top - groupRect.top;

      element.style.position = 'absolute';
      element.style.left = `${relativeLeft}px`;
      element.style.top = `${relativeTop}px`;

      groupElement.appendChild(element);
    });

    // Add to parent
    parent.appendChild(groupElement);

    // Store group info
    const group = {
      id: groupId,
      name: groupName,
      element: groupElement,
      children: elements.map(el => el.dataset.layerId),
      created: Date.now(),
    };

    this.groups.set(groupId, group);

    // Rebuild layers tree
    if (this.layersManager) {
      this.layersManager.buildTree();
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('group:created', {
        detail: { groupId, group },
      })
    );

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'group-create',
        groupId: groupId,
        elements: elements.map(el => el.dataset.layerId),
      });
    }

    return groupId;
  }

  /**
   * Destroy a group
   */
  destroyGroup(groupId) {
    const group = this.groups.get(groupId);
    if (!group) {
      console.warn(`Group ${groupId} not found`);
      return;
    }

    const groupElement = group.element;
    const parent = groupElement.parentElement;
    const groupRect = groupElement.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // Move children out of group
    const children = Array.from(groupElement.children).filter(child =>
      child.classList.contains('canvas-element')
    );

    children.forEach(child => {
      const rect = child.getBoundingClientRect();

      // Calculate absolute position
      const absoluteLeft = rect.left - parentRect.left;
      const absoluteTop = rect.top - parentRect.top;

      child.style.left = `${absoluteLeft}px`;
      child.style.top = `${absoluteTop}px`;

      parent.appendChild(child);
    });

    // Remove group element
    groupElement.remove();

    // Remove from map
    this.groups.delete(groupId);

    // Rebuild layers tree
    if (this.layersManager) {
      this.layersManager.buildTree();
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('group:destroyed', {
        detail: { groupId },
      })
    );

    // Record for undo
    if (window.undoRedoManager) {
      window.undoRedoManager.recordAction({
        type: 'group-destroy',
        groupId: groupId,
      });
    }
  }

  /**
   * Get group by ID
   */
  getGroup(groupId) {
    return this.groups.get(groupId);
  }

  /**
   * Get all groups
   */
  getAllGroups() {
    return Array.from(this.groups.values());
  }

  /**
   * Check if element is in a group
   */
  isInGroup(element) {
    let parent = element.parentElement;
    while (parent) {
      if (parent.dataset.groupId) {
        return parent.dataset.groupId;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  /**
   * Get group of element
   */
  getGroupOfElement(element) {
    const groupId = this.isInGroup(element);
    return groupId ? this.getGroup(groupId) : null;
  }

  /**
   * Calculate bounds of elements
   */
  calculateBounds(elements) {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    const rects = elements.map(el => el.getBoundingClientRect());

    const left = Math.min(...rects.map(r => r.left)) - canvasRect.left;
    const top = Math.min(...rects.map(r => r.top)) - canvasRect.top;
    const right = Math.max(...rects.map(r => r.right)) - canvasRect.left;
    const bottom = Math.max(...rects.map(r => r.bottom)) - canvasRect.top;

    return {
      left: left - 10, // padding
      top: top - 10,
      width: right - left + 20,
      height: bottom - top + 20,
    };
  }

  /**
   * Rename group
   */
  renameGroup(groupId, newName) {
    const group = this.getGroup(groupId);
    if (!group) return;

    group.name = newName;
    group.element.dataset.layerName = newName;

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('group:renamed', {
        detail: { groupId, newName },
      })
    );
  }

  /**
   * Add element to group
   */
  addToGroup(groupId, element) {
    const group = this.getGroup(groupId);
    if (!group) return;

    const groupElement = group.element;
    const rect = element.getBoundingClientRect();
    const groupRect = groupElement.getBoundingClientRect();

    // Calculate relative position
    const relativeLeft = rect.left - groupRect.left;
    const relativeTop = rect.top - groupRect.top;

    element.style.position = 'absolute';
    element.style.left = `${relativeLeft}px`;
    element.style.top = `${relativeTop}px`;

    groupElement.appendChild(element);

    // Update group children
    group.children.push(element.dataset.layerId);

    // Rebuild layers tree
    if (this.layersManager) {
      this.layersManager.buildTree();
    }
  }

  /**
   * Remove element from group
   */
  removeFromGroup(element) {
    const groupId = this.isInGroup(element);
    if (!groupId) return;

    const group = this.getGroup(groupId);
    if (!group) return;

    const groupElement = group.element;
    const parent = groupElement.parentElement;
    const rect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // Calculate absolute position
    const absoluteLeft = rect.left - parentRect.left;
    const absoluteTop = rect.top - parentRect.top;

    element.style.left = `${absoluteLeft}px`;
    element.style.top = `${absoluteTop}px`;

    parent.appendChild(element);

    // Update group children
    const index = group.children.indexOf(element.dataset.layerId);
    if (index > -1) {
      group.children.splice(index, 1);
    }

    // If group is empty, destroy it
    if (group.children.length === 0) {
      this.destroyGroup(groupId);
    } else {
      // Rebuild layers tree
      if (this.layersManager) {
        this.layersManager.buildTree();
      }
    }
  }

  /**
   * Destroy all groups
   */
  destroyAll() {
    const groupIds = Array.from(this.groups.keys());
    groupIds.forEach(id => this.destroyGroup(id));
  }

  /**
   * Destroy
   */
  destroy() {
    this.destroyAll();
    this.groups.clear();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroupManager;
}

export default GroupManager;

window.GroupManager = GroupManager;
