/**
 * Diff Engine
 * Calculates differences between DOM states for efficient synchronization
 */

export class DiffEngine {
  constructor() {
    this.changeTypes = {
      ADD: 'add',
      REMOVE: 'remove',
      UPDATE: 'update',
      MOVE: 'move'
    };
  }

  /**
   * Calculate diff between two HTML strings
   */
  calculateDiff(oldHTML, newHTML) {
    const oldDOM = this.parseHTML(oldHTML);
    const newDOM = this.parseHTML(newHTML);

    return this.diffNodes(oldDOM, newDOM);
  }

  /**
   * Parse HTML string to DOM
   */
  parseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.firstChild;
  }

  /**
   * Diff two DOM nodes
   */
  diffNodes(oldNode, newNode, path = []) {
    const changes = [];

    // Both nodes are null
    if (!oldNode && !newNode) {
      return changes;
    }

    // Node was removed
    if (oldNode && !newNode) {
      changes.push({
        type: this.changeTypes.REMOVE,
        path: [...path],
        element: this.serializeNode(oldNode)
      });
      return changes;
    }

    // Node was added
    if (!oldNode && newNode) {
      changes.push({
        type: this.changeTypes.ADD,
        path: [...path],
        element: this.serializeNode(newNode)
      });
      return changes;
    }

    // Different node types
    if (oldNode.nodeType !== newNode.nodeType) {
      changes.push({
        type: this.changeTypes.UPDATE,
        path: [...path],
        oldElement: this.serializeNode(oldNode),
        newElement: this.serializeNode(newNode)
      });
      return changes;
    }

    // Text nodes
    if (oldNode.nodeType === Node.TEXT_NODE) {
      if (oldNode.textContent !== newNode.textContent) {
        changes.push({
          type: this.changeTypes.UPDATE,
          path: [...path],
          changes: {
            textContent: newNode.textContent
          }
        });
      }
      return changes;
    }

    // Element nodes
    if (oldNode.nodeType === Node.ELEMENT_NODE) {
      // Different tag names
      if (oldNode.tagName !== newNode.tagName) {
        changes.push({
          type: this.changeTypes.UPDATE,
          path: [...path],
          oldElement: this.serializeNode(oldNode),
          newElement: this.serializeNode(newNode)
        });
        return changes;
      }

      // Diff attributes
      const attrChanges = this.diffAttributes(oldNode, newNode);
      if (Object.keys(attrChanges).length > 0) {
        changes.push({
          type: this.changeTypes.UPDATE,
          path: [...path],
          changes: attrChanges
        });
      }

      // Diff children
      const childChanges = this.diffChildren(oldNode, newNode, path);
      changes.push(...childChanges);
    }

    return changes;
  }

  /**
   * Diff attributes between two elements
   */
  diffAttributes(oldElement, newElement) {
    const changes = {};

    // Check for changed/removed attributes
    Array.from(oldElement.attributes).forEach(attr => {
      const newValue = newElement.getAttribute(attr.name);
      if (newValue === null) {
        changes[attr.name] = null; // Attribute removed
      } else if (newValue !== attr.value) {
        changes[attr.name] = newValue; // Attribute changed
      }
    });

    // Check for added attributes
    Array.from(newElement.attributes).forEach(attr => {
      if (!oldElement.hasAttribute(attr.name)) {
        changes[attr.name] = attr.value; // Attribute added
      }
    });

    return changes;
  }

  /**
   * Diff children between two elements
   */
  diffChildren(oldElement, newElement, path) {
    const changes = [];
    const oldChildren = Array.from(oldElement.childNodes);
    const newChildren = Array.from(newElement.childNodes);

    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];
      const childPath = [...path, i];

      const childChanges = this.diffNodes(oldChild, newChild, childPath);
      changes.push(...childChanges);
    }

    return changes;
  }

  /**
   * Serialize node to simple object
   */
  serializeNode(node) {
    if (!node) return null;

    if (node.nodeType === Node.TEXT_NODE) {
      return {
        type: 'text',
        content: node.textContent
      };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = {
        type: 'element',
        tag: node.tagName.toLowerCase(),
        attributes: {}
      };

      Array.from(node.attributes).forEach(attr => {
        element.attributes[attr.name] = attr.value;
      });

      return element;
    }

    return null;
  }

  /**
   * Calculate minimal diff using LCS algorithm
   */
  calculateMinimalDiff(oldHTML, newHTML) {
    const oldDOM = this.parseHTML(oldHTML);
    const newDOM = this.parseHTML(newHTML);

    const oldNodes = this.flattenDOM(oldDOM);
    const newNodes = this.flattenDOM(newDOM);

    const lcs = this.longestCommonSubsequence(oldNodes, newNodes);
    
    return this.generateChangesFromLCS(oldNodes, newNodes, lcs);
  }

  /**
   * Flatten DOM to array of nodes
   */
  flattenDOM(node, result = []) {
    if (!node) return result;

    result.push(node);

    if (node.childNodes) {
      Array.from(node.childNodes).forEach(child => {
        this.flattenDOM(child, result);
      });
    }

    return result;
  }

  /**
   * Longest Common Subsequence algorithm
   */
  longestCommonSubsequence(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (this.nodesEqual(arr1[i - 1], arr2[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return this.backtrackLCS(dp, arr1, arr2, m, n);
  }

  /**
   * Backtrack LCS to get actual sequence
   */
  backtrackLCS(dp, arr1, arr2, i, j) {
    if (i === 0 || j === 0) {
      return [];
    }

    if (this.nodesEqual(arr1[i - 1], arr2[j - 1])) {
      return [...this.backtrackLCS(dp, arr1, arr2, i - 1, j - 1), arr1[i - 1]];
    }

    if (dp[i - 1][j] > dp[i][j - 1]) {
      return this.backtrackLCS(dp, arr1, arr2, i - 1, j);
    }

    return this.backtrackLCS(dp, arr1, arr2, i, j - 1);
  }

  /**
   * Check if two nodes are equal
   */
  nodesEqual(node1, node2) {
    if (!node1 || !node2) return false;
    if (node1.nodeType !== node2.nodeType) return false;

    if (node1.nodeType === Node.TEXT_NODE) {
      return node1.textContent === node2.textContent;
    }

    if (node1.nodeType === Node.ELEMENT_NODE) {
      if (node1.tagName !== node2.tagName) return false;
      
      // Check key attributes
      const id1 = node1.getAttribute('id');
      const id2 = node2.getAttribute('id');
      
      if (id1 && id2) {
        return id1 === id2;
      }

      return true; // Consider equal if same tag
    }

    return false;
  }

  /**
   * Generate changes from LCS
   */
  generateChangesFromLCS(oldNodes, newNodes, lcs) {
    const changes = [];
    let oldIndex = 0;
    let newIndex = 0;
    let lcsIndex = 0;

    while (oldIndex < oldNodes.length || newIndex < newNodes.length) {
      const oldNode = oldNodes[oldIndex];
      const newNode = newNodes[newIndex];
      const lcsNode = lcs[lcsIndex];

      if (oldNode === lcsNode && newNode === lcsNode) {
        // Nodes match, move forward
        oldIndex++;
        newIndex++;
        lcsIndex++;
      } else if (oldNode === lcsNode) {
        // Node added in new
        changes.push({
          type: this.changeTypes.ADD,
          element: this.serializeNode(newNode),
          index: newIndex
        });
        newIndex++;
      } else if (newNode === lcsNode) {
        // Node removed from old
        changes.push({
          type: this.changeTypes.REMOVE,
          element: this.serializeNode(oldNode),
          index: oldIndex
        });
        oldIndex++;
      } else {
        // Node updated
        changes.push({
          type: this.changeTypes.UPDATE,
          oldElement: this.serializeNode(oldNode),
          newElement: this.serializeNode(newNode),
          index: oldIndex
        });
        oldIndex++;
        newIndex++;
      }
    }

    return changes;
  }

  /**
   * Optimize changes by merging similar operations
   */
  optimizeChanges(changes) {
    // Group consecutive adds/removes
    const optimized = [];
    let currentGroup = null;

    changes.forEach(change => {
      if (!currentGroup || currentGroup.type !== change.type) {
        if (currentGroup) {
          optimized.push(currentGroup);
        }
        currentGroup = { ...change, batch: [change] };
      } else {
        currentGroup.batch.push(change);
      }
    });

    if (currentGroup) {
      optimized.push(currentGroup);
    }

    return optimized;
  }
}

export default DiffEngine;
