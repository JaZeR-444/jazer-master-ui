/**
 * Tree View Component with Drag and Drop
 * Hierarchical data display with collapsible nodes and drag-and-drop support
 * Compatible with jazer-brand.css styling
 */

class TreeView {
  /**
   * Creates a new tree view instance
   * @param {HTMLElement} container - Container element for the tree view
   * @param {Array} data - Tree data structure
   * @param {Object} options - Configuration options
   */
  constructor(container, data = [], options = {}) {
    this.container = container;
    this.data = data;
    this.options = {
      dragAndDrop: true,
      allowDropOnLeaf: false,
      allowDropBetween: true,
      multipleSelection: false,
      showIcons: true,
      iconOpen: '📂',
      iconClosed: '📁',
      iconFile: '📄',
      expandOnDoubleClick: true,
      expandOnClick: false,
      selectionMode: 'single', // 'single', 'multiple', 'none'
      enableContextMenu: true,
      contextMenuItems: [
        { label: 'New Folder', action: 'createFolder' },
        { label: 'Rename', action: 'rename' },
        { label: 'Delete', action: 'delete', separator: true },
        { label: 'Copy', action: 'copy' },
        { label: 'Cut', action: 'cut' },
        { label: 'Paste', action: 'paste' }
      ],
      onNodeClick: null,
      onNodeDoubleClick: null,
      onNodeExpand: null,
      onNodeCollapse: null,
      onNodeSelect: null,
      onNodeDragStart: null,
      onNodeDragOver: null,
      onNodeDrop: null,
      onNodeContextMenu: null,
      ...options
    };

    this.selectedNodes = new Set();
    this.expandedNodes = new Set();
    this.rootNode = null;
    this.draggedNode = null;
    this.dropPosition = null; // 'before', 'after', 'inside'
    this.contextMenu = null;

    this.init();
  }

  /**
   * Initializes the tree view
   */
  init() {
    // Clear container
    this.container.innerHTML = '';
    
    // Add tree view classes
    this.container.classList.add('tree-view');
    this.container.setAttribute('role', 'tree');
    this.container.setAttribute('aria-multiselectable', this.options.multipleSelection);
    
    // Create root node
    this.rootNode = document.createElement('ul');
    this.rootNode.classList.add('tree-root');
    this.container.appendChild(this.rootNode);
    
    // Render tree
    this.render();
    
    // Bind events
    this.bindEvents();
    
    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Renders the tree structure
   */
  render() {
    // Clear root
    this.rootNode.innerHTML = '';
    
    // Render each top-level node
    this.data.forEach(node => {
      const nodeElement = this.createNodeElement(node, 0);
      this.rootNode.appendChild(nodeElement);
    });
  }

  /**
   * Creates a node element
   * @param {Object} node - Node data
   * @param {number} level - Nesting level
   * @returns {HTMLElement} Node element
   */
  createNodeElement(node, level) {
    const li = document.createElement('li');
    li.classList.add('tree-node');
    li.setAttribute('role', 'treeitem');
    li.setAttribute('aria-level', level + 1);
    li.setAttribute('data-node-id', node.id || this.generateNodeId());
    
    // Create node content container
    const content = document.createElement('div');
    content.classList.add('tree-node-content');
    
    // Add indentation
    content.style.paddingLeft = `${level * 20}px`;
    
    // Create expand toggle
    const toggle = document.createElement('span');
    toggle.classList.add('tree-node-toggle');
    toggle.setAttribute('aria-label', 'Toggle node');
    
    // Add icon based on node type
    const icon = document.createElement('span');
    icon.classList.add('tree-node-icon');
    
    if (node.children && node.children.length > 0) {
      // Has children - determine if expanded
      const isExpanded = this.expandedNodes.has(node.id);
      icon.textContent = isExpanded ? this.options.iconOpen : this.options.iconClosed;
      toggle.textContent = isExpanded ? '▼' : '▶';
      li.setAttribute('aria-expanded', isExpanded);
    } else {
      // Leaf node
      icon.textContent = node.icon || this.options.iconFile;
      toggle.textContent = '・';
      li.setAttribute('aria-expanded', 'false');
    }
    
    // Create label
    const label = document.createElement('span');
    label.classList.add('tree-node-label');
    label.textContent = node.label || node.name || node.title || node.text;
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    
    // Add click handlers
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNode(node);
    });
    
    label.addEventListener('click', (e) => {
      this.handleNodeClick(node, e);
    });
    
    if (this.options.expandOnDoubleClick) {
      label.addEventListener('dblclick', (e) => {
        this.handleNodeDoubleClick(node, e);
      });
    }
    
    if (this.options.dragAndDrop) {
      content.setAttribute('draggable', 'true');
      content.addEventListener('dragstart', (e) => this.handleDragStart(e, node));
      content.addEventListener('dragover', (e) => this.handleDragOver(e, node));
      content.addEventListener('dragenter', (e) => this.handleDragEnter(e, node));
      content.addEventListener('dragleave', (e) => this.handleDragLeave(e, node));
      content.addEventListener('drop', (e) => this.handleDrop(e, node));
    }
    
    if (this.options.enableContextMenu) {
      label.addEventListener('contextmenu', (e) => this.handleContextMenu(e, node));
    }
    
    // Add elements to content
    content.appendChild(toggle);
    if (this.options.showIcons) content.appendChild(icon);
    content.appendChild(label);
    
    li.appendChild(content);
    
    // Add children if expanded
    if (node.children && node.children.length > 0 && this.expandedNodes.has(node.id)) {
      const childrenUl = document.createElement('ul');
      childrenUl.classList.add('tree-node-children');
      childrenUl.setAttribute('role', 'group');
      
      node.children.forEach(child => {
        const childLi = this.createNodeElement(child, level + 1);
        childrenUl.appendChild(childLi);
      });
      
      li.appendChild(childrenUl);
    }
    
    // Highlight if selected
    if (this.selectedNodes.has(node.id)) {
      li.classList.add('tree-node-selected');
    }
    
    return li;
  }

  /**
   * Expands a node
   * @param {Object} node - Node to expand
   */
  expandNode(node) {
    this.expandedNodes.add(node.id);
    this.updateNode(node);
    
    // Trigger callback
    if (this.options.onNodeExpand) {
      this.options.onNodeExpand(node);
    }
  }

  /**
   * Collapses a node
   * @param {Object} node - Node to collapse
   */
  collapseNode(node) {
    this.expandedNodes.delete(node.id);
    this.updateNode(node);
    
    // Collapse all children recursively
    this.collapseChildren(node);
    
    // Trigger callback
    if (this.options.onNodeCollapse) {
      this.options.onNodeCollapse(node);
    }
  }

  /**
   * Collapses all children of a node recursively
   * @param {Object} node - Parent node
   */
  collapseChildren(node) {
    if (node.children) {
      node.children.forEach(child => {
        this.expandedNodes.delete(child.id);
        this.collapseChildren(child);
      });
    }
  }

  /**
   * Toggles a node's expanded state
   * @param {Object} node - Node to toggle
   */
  toggleNode(node) {
    if (this.expandedNodes.has(node.id)) {
      this.collapseNode(node);
    } else {
      this.expandNode(node);
    }
  }

  /**
   * Updates a node's display
   * @param {Object} node - Node to update
   */
  updateNode(node) {
    const nodeElement = this.container.querySelector(`[data-node-id="${node.id}"]`);
    if (nodeElement) {
      nodeElement.remove();
      
      // Find parent element to insert after
      const parent = this.findNodeParent(node.id);
      if (parent) {
        const newElement = this.createNodeElement(node, this.getNodeLevel(node.id));
        parent.appendChild(newElement);
      } else {
        // If no parent found, it's a top-level node
        const newElement = this.createNodeElement(node, 0);
        this.rootNode.appendChild(newElement);
      }
    }
  }

  /**
   * Finds the parent of a node
   * @param {string} nodeId - ID of the node to find parent for
   * @returns {HTMLElement} Parent element or null if not found
   */
  findNodeParent(nodeId) {
    // Find the parent node in the data structure
    const findParent = (nodes, targetId) => {
      for (const node of nodes) {
        if (node.children) {
          if (node.children.some(child => child.id === targetId)) {
            const parentElement = this.container.querySelector(`[data-node-id="${node.id}"]`);
            return parentElement;
          }
          
          const result = findParent(node.children, targetId);
          if (result) return result;
        }
      }
      return null;
    };
    
    return findParent(this.data, nodeId);
  }

  /**
   * Gets the nesting level of a node
   * @param {string} nodeId - ID of the node
   * @returns {number} Nesting level or -1 if not found
   */
  getNodeLevel(nodeId) {
    const findLevel = (nodes, targetId, currentLevel = 0) => {
      for (const node of nodes) {
        if (node.id === targetId) return currentLevel;
        
        if (node.children) {
          const level = findLevel(node.children, targetId, currentLevel + 1);
          if (level !== -1) return level;
        }
      }
      return -1;
    };
    
    return findLevel(this.data, nodeId);
  }

  /**
   * Handles node click
   * @param {Object} node - Clicked node
   * @param {Event} e - Event object
   */
  handleNodeClick(node, e) {
    // Handle selection
    if (this.options.selectionMode !== 'none') {
      if (this.options.selectionMode === 'multiple' && (e.ctrlKey || e.metaKey)) {
        // Toggle selection for multiple selection
        if (this.selectedNodes.has(node.id)) {
          this.selectedNodes.delete(node.id);
        } else {
          this.selectedNodes.add(node.id);
        }
      } else if (this.options.selectionMode === 'multiple' && e.shiftKey && this.lastSelectedNode) {
        // Select range (not implemented in this simplified version)
        this.selectRange(this.lastSelectedNode, node);
      } else {
        // Single selection - clear others and select this
        this.clearSelection();
        this.selectedNodes.add(node.id);
        this.lastSelectedNode = node;
      }
      
      this.updateSelectionDisplay();
    }
    
    // Trigger callback
    if (this.options.onNodeClick) {
      this.options.onNodeClick(node, e);
    }
  }

  /**
   * Handles node double click
   * @param {Object} node - Double clicked node
   * @param {Event} e - Event object
   */
  handleNodeDoubleClick(node, e) {
    if (this.options.expandOnClick || (node.children && node.children.length > 0)) {
      this.toggleNode(node);
    }
    
    // Trigger callback
    if (this.options.onNodeDoubleClick) {
      this.options.onNodeDoubleClick(node, e);
    }
  }

  /**
   * Handles drag start event
   * @param {Event} e - Drag start event
   * @param {Object} node - Dragged node
   */
  handleDragStart(e, node) {
    e.dataTransfer.setData('text/plain', JSON.stringify(node));
    e.dataTransfer.effectAllowed = 'move';
    
    this.draggedNode = node;
    
    // Add dragging class
    const nodeElement = e.target.closest('.tree-node-content');
    if (nodeElement) {
      nodeElement.classList.add('tree-node-dragging');
    }
    
    // Trigger callback
    if (this.options.onNodeDragStart) {
      this.options.onNodeDragStart(node, e);
    }
  }

  /**
   * Handles drag over event
   * @param {Event} e - Drag over event
   * @param {Object} node - Target node
   */
  handleDragOver(e, node) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Determine position relative to target node
    const rect = e.target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';
    
    this.dropPosition = position;
    
    // Add drop indicator
    const nodeElement = e.target.closest('.tree-node-content');
    if (nodeElement) {
      nodeElement.classList.add('tree-node-drop-target');
      
      // Clear previous indicators
      const allTargets = this.container.querySelectorAll('.tree-node-drop-target');
      allTargets.forEach(el => {
        if (el !== nodeElement) {
          el.classList.remove('tree-node-drop-target');
        }
      });
    }
    
    // Trigger callback
    if (this.options.onNodeDragOver) {
      this.options.onNodeDragOver(node, e, position);
    }
  }

  /**
   * Handles drag enter event
   * @param {Event} e - Drag enter event
   * @param {Object} node - Target node
   */
  handleDragEnter(e, node) {
    e.preventDefault();
    
    // Add visual indication
    const nodeElement = e.target.closest('.tree-node-content');
    if (nodeElement) {
      nodeElement.classList.add('tree-node-drag-over');
    }
  }

  /**
   * Handles drag leave event
   * @param {Event} e - Drag leave event
   * @param {Object} node - Target node
   */
  handleDragLeave(e, node) {
    // Remove visual indication
    const nodeElement = e.target.closest('.tree-node-content');
    if (nodeElement) {
      nodeElement.classList.remove('tree-node-drag-over');
    }
  }

  /**
   * Handles drop event
   * @param {Event} e - Drop event
   * @param {Object} targetNode - Target node
   */
  handleDrop(e, targetNode) {
    e.preventDefault();
    
    // Remove visual indicators
    const allTargets = this.container.querySelectorAll('.tree-node-drop-target, .tree-node-drag-over');
    allTargets.forEach(el => {
      el.classList.remove('tree-node-drop-target', 'tree-node-drag-over');
    });
    
    if (!this.draggedNode) return;
    
    // Determine where to drop
    let position = this.dropPosition;
    if (!this.options.allowDropBetween) {
      position = 'inside';
    } else if (!this.options.allowDropOnLeaf && (!targetNode.children || targetNode.children.length === 0)) {
      position = 'inside';
    }
    
    // Perform the move operation
    this.moveNode(this.draggedNode, targetNode, position);
    
    // Clear drag state
    this.draggedNode = null;
    this.dropPosition = null;
    
    // Trigger callback
    if (this.options.onNodeDrop) {
      this.options.onNodeDrop(this.draggedNode, targetNode, position, e);
    }
  }

  /**
   * Moves a node within the tree
   * @param {Object} node - Node to move
   * @param {Object} targetNode - Target node
   * @param {string} position - Position relative to target ('before', 'after', 'inside')
   */
  moveNode(node, targetNode, position) {
    // Find and remove node from its current location (simplified implementation)
    const sourceParent = this.findNodeParent(node.id);
    
    // Remove from current parent
    if (sourceParent) {
      sourceParent.children = sourceParent.children.filter(child => child.id !== node.id);
    }
    
    // Add to new parent
    if (position === 'inside') {
      if (!targetNode.children) targetNode.children = [];
      targetNode.children.push(node);
    } else {
      const targetParent = this.findNodeParent(targetNode.id);
      if (targetParent && targetParent.children) {
        const targetIndex = targetParent.children.findIndex(child => child.id === targetNode.id);
        if (targetIndex !== -1) {
          if (position === 'after') {
            targetParent.children.splice(targetIndex + 1, 0, node);
          } else { // before
            targetParent.children.splice(targetIndex, 0, node);
          }
        }
      }
    }
    
    // Re-render the tree
    this.render();
  }

  /**
   * Handles context menu event
   * @param {Event} e - Context menu event
   * @param {Object} node - Node that was right-clicked
   */
  handleContextMenu(e, node) {
    e.preventDefault();
    
    // Create context menu
    this.createContextMenu(e.clientX, e.clientY, node);
    
    // Trigger callback
    if (this.options.onNodeContextMenu) {
      this.options.onNodeContextMenu(node, e);
    }
  }

  /**
   * Creates a context menu for a node
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} node - Node to create menu for
   */
  createContextMenu(x, y, node) {
    // Remove existing context menu
    if (this.contextMenu) {
      this.contextMenu.remove();
    }
    
    // Create menu
    this.contextMenu = document.createElement('div');
    this.contextMenu.classList.add('tree-context-menu');
    this.contextMenu.style.cssText = `
      position: fixed;
      top: ${y}px;
      left: ${x}px;
      background: var(--bg-darker, #111);
      border: 1px solid var(--border-default, #4facfe);
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    // Add menu items
    this.options.contextMenuItems.forEach(item => {
      if (item.separator) {
        const separator = document.createElement('hr');
        separator.classList.add('menu-separator');
        this.contextMenu.appendChild(separator);
        return;
      }
      
      const menuItem = document.createElement('div');
      menuItem.classList.add('menu-item');
      menuItem.textContent = item.label;
      menuItem.addEventListener('click', () => {
        this.handleMenuItemClick(item.action, node);
        this.contextMenu.remove();
        this.contextMenu = null;
      });
      
      this.contextMenu.appendChild(menuItem);
    });
    
    // Add click listener to close menu when clicking elsewhere
    const handleClickOutside = (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.contextMenu.remove();
        this.contextMenu = null;
        document.removeEventListener('click', handleClickOutside);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    document.body.appendChild(this.contextMenu);
  }

  /**
   * Handles context menu item click
   * @param {string} action - Action to perform
   * @param {Object} node - Node that menu belongs to
   */
  handleMenuItemClick(action, node) {
    // Handle menu actions (implementation depends on specific requirements)
    console.log(`Menu action: ${action} on node:`, node);
  }

  /**
   * Binds events to the tree view
   */
  bindEvents() {
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
    
    // Handle clicks outside to clear selection
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        if (this.options.selectionMode === 'single') {
          this.clearSelection();
        }
      }
    });
  }

  /**
   * Handles keyboard navigation
   * @param {Event} e - Keyboard event
   */
  handleKeyboardNavigation(e) {
    const selectedNodes = Array.from(this.selectedNodes);
    if (selectedNodes.length === 0) return;
    
    const currentId = selectedNodes[selectedNodes.length - 1]; // Use last selected
    const currentNode = this.findNodeById(currentId);
    if (!currentNode) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectNextNode(currentNode);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectPreviousNode(currentNode);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (this.hasChildren(currentNode) && !this.isExpanded(currentNode)) {
          this.expandNode(currentNode);
        } else if (this.hasChildren(currentNode) && this.isExpanded(currentNode)) {
          this.selectFirstChild(currentNode);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (this.isExpanded(currentNode)) {
          this.collapseNode(currentNode);
        } else {
          this.selectParentNode(currentNode);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleNodeClick(currentNode, e);
        break;
      case '*':
        e.preventDefault();
        // Expand all children
        this.expandAllChildren(currentNode);
        break;
    }
  }

  /**
   * Finds a node by its ID
   * @param {string} id - Node ID
   * @returns {Object|null} Node object or null if not found
   */
  findNodeById(id) {
    const search = (nodes) => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = search(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return search(this.data);
  }

  /**
   * Checks if a node has children
   * @param {Object} node - Node to check
   * @returns {boolean} Whether the node has children
   */
  hasChildren(node) {
    return node.children && node.children.length > 0;
  }

  /**
   * Checks if a node is expanded
   * @param {Object} node - Node to check
   * @returns {boolean} Whether the node is expanded
   */
  isExpanded(node) {
    return this.expandedNodes.has(node.id);
  }

  /**
   * Selects the next node in the tree
   * @param {Object} currentNode - Current node
   */
  selectNextNode(currentNode) {
    // Implementation would find and select the next node in visual order
    // Simplified implementation skips to next sibling
    const parent = this.findNodeParent(currentNode.id);
    if (parent && parent.children) {
      const currentIndex = parent.children.findIndex(child => child.id === currentNode.id);
      if (currentIndex < parent.children.length - 1) {
        const nextNode = parent.children[currentIndex + 1];
        this.selectNode(nextNode);
      }
    }
  }

  /**
   * Selects the previous node in the tree
   * @param {Object} currentNode - Current node
   */
  selectPreviousNode(currentNode) {
    // Implementation would find and select the previous node in visual order
    // Simplified implementation skips to previous sibling
    const parent = this.findNodeParent(currentNode.id);
    if (parent && parent.children) {
      const currentIndex = parent.children.findIndex(child => child.id === currentNode.id);
      if (currentIndex > 0) {
        const prevNode = parent.children[currentIndex - 1];
        this.selectNode(prevNode);
      }
    }
  }

  /**
   * Selects the first child of a node
   * @param {Object} parentNode - Parent node
   */
  selectFirstChild(parentNode) {
    if (parentNode.children && parentNode.children.length > 0) {
      this.selectNode(parentNode.children[0]);
    }
  }

  /**
   * Selects the parent of a node
   * @param {Object} childNode - Child node
   */
  selectParentNode(childNode) {
    const parent = this.findNodeParent(childNode.id);
    if (parent) {
      this.selectNode(parent);
    }
  }

  /**
   * Selects a specific node
   * @param {Object} node - Node to select
   */
  selectNode(node) {
    if (this.options.selectionMode === 'none') return;
    
    if (this.options.selectionMode === 'single') {
      this.clearSelection();
    }
    
    this.selectedNodes.add(node.id);
    this.updateSelectionDisplay();
    
    // Scroll to node if needed
    const nodeElement = this.container.querySelector(`[data-node-id="${node.id}"]`);
    if (nodeElement) {
      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Updates the visual selection display
   */
  updateSelectionDisplay() {
    // Remove all selection indicators
    const allNodes = this.container.querySelectorAll('.tree-node');
    allNodes.forEach(node => node.classList.remove('tree-node-selected'));
    
    // Add selection indicator to selected nodes
    this.selectedNodes.forEach(nodeId => {
      const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeElement) {
        nodeElement.classList.add('tree-node-selected');
      }
    });
  }

  /**
   * Clears the current selection
   */
  clearSelection() {
    this.selectedNodes.clear();
    this.updateSelectionDisplay();
  }

  /**
   * Gets currently selected nodes
   * @returns {Array} Array of selected node objects
   */
  getSelectedNodes() {
    return Array.from(this.selectedNodes).map(id => this.findNodeById(id)).filter(Boolean);
  }

  /**
   * Expands all nodes in the tree
   */
  expandAll() {
    const expandRecursive = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.expandedNodes.add(node.id);
          expandRecursive(node.children);
        }
      });
    };
    
    expandRecursive(this.data);
    this.render();
  }

  /**
   * Collapses all nodes in the tree
   */
  collapseAll() {
    this.expandedNodes.clear();
    this.render();
  }

  /**
   * Expands all children of a node recursively
   * @param {Object} node - Node whose children to expand
   */
  expandAllChildren(node) {
    if (node.children) {
      node.children.forEach(child => {
        this.expandedNodes.add(child.id);
        this.expandAllChildren(child);
      });
      this.expandedNodes.add(node.id); // Also expand the node itself
      this.updateNode(node);
    }
  }

  /**
   * Finds nodes matching a search criteria
   * @param {Function|string} predicate - Search function or string to match
   * @returns {Array} Array of matching nodes
   */
  findNodes(predicate) {
    const results = [];
    
    const search = (nodes) => {
      for (const node of nodes) {
        // Check if node matches predicate
        let matches = false;
        if (typeof predicate === 'function') {
          matches = predicate(node);
        } else if (typeof predicate === 'string') {
          const searchText = predicate.toLowerCase();
          matches = (node.label || node.name || node.title || node.text || '').toLowerCase().includes(searchText);
        }
        
        if (matches) {
          results.push(node);
        }
        
        // Search children if they exist
        if (node.children) {
          search(node.children);
        }
      }
    };
    
    search(this.data);
    return results;
  }

  /**
   * Filters the tree to show only matching nodes
   * @param {Function|string} predicate - Filter function or string to match
   */
  filter(predicate) {
    const matchingNodes = this.findNodes(predicate);
    
    // Collapse all nodes first
    this.collapseAll();
    
    // Expand nodes that have matching descendants
    const expandMatchingPaths = (nodes) => {
      return nodes.some(node => {
        // Check if this node matches
        let matches = false;
        if (typeof predicate === 'function') {
          matches = predicate(node);
        } else if (typeof predicate === 'string') {
          const searchText = predicate.toLowerCase();
          matches = (node.label || node.name || node.title || node.text || '').toLowerCase().includes(searchText);
        }
        
        let childMatches = false;
        if (node.children) {
          childMatches = expandMatchingPaths(node.children);
        }
        
        // If node or child matches, expand this node
        if (matches || childMatches) {
          this.expandedNodes.add(node.id);
        }
        
        return matches || childMatches;
      });
    };
    
    expandMatchingPaths(this.data);
    this.render();
    
    // Select matched nodes if in selection mode
    if (this.options.selectionMode !== 'none') {
      this.clearSelection();
      matchingNodes.forEach(node => this.selectedNodes.add(node.id));
      this.updateSelectionDisplay();
    }
  }

  /**
   * Adds a new node to the tree
   * @param {Object} nodeData - Node data to add
   * @param {string} parentId - ID of parent node (null for top-level)
   * @param {number} index - Index to insert at (default: at end)
   * @returns {Object} Added node
   */
  addNode(nodeData, parentId = null, index = -1) {
    // Generate ID if not provided
    if (!nodeData.id) {
      nodeData.id = this.generateNodeId();
    }
    
    if (parentId === null) {
      // Add to root level
      if (index === -1 || index >= this.data.length) {
        this.data.push(nodeData);
      } else {
        this.data.splice(index, 0, nodeData);
      }
    } else {
      // Find parent node and add as child
      const parentNode = this.findNodeById(parentId);
      if (parentNode) {
        if (!parentNode.children) parentNode.children = [];
        if (index === -1 || index >= parentNode.children.length) {
          parentNode.children.push(nodeData);
        } else {
          parentNode.children.splice(index, 0, nodeData);
        }
      } else {
        throw new Error(`Parent node with ID ${parentId} not found`);
      }
    }
    
    this.render();
    return nodeData;
  }

  /**
   * Removes a node from the tree
   * @param {string} nodeId - ID of node to remove
   * @returns {boolean} Whether the node was successfully removed
   */
  removeNode(nodeId) {
    const removeFromParent = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          nodes.splice(i, 1);
          return true;
        }
        
        if (nodes[i].children) {
          if (removeFromParent(nodes[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Try to remove from root level first
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].id === nodeId) {
        this.data.splice(i, 1);
        this.selectedNodes.delete(nodeId);
        this.expandedNodes.delete(nodeId);
        this.render();
        return true;
      }
    }
    
    // If not found at root level, search recursively
    const removed = removeFromParent(this.data);
    if (removed) {
      this.selectedNodes.delete(nodeId);
      this.expandedNodes.delete(nodeId);
      this.render();
    }
    
    return removed;
  }

  /**
   * Updates a node's data
   * @param {string} nodeId - ID of node to update
   * @param {Object} newData - New data for the node
   * @returns {boolean} Whether the node was successfully updated
   */
  updateNodeData(nodeId, newData) {
    const node = this.findNodeById(nodeId);
    if (!node) return false;
    
    // Update node properties
    Object.assign(node, newData);
    
    // Update node in the UI
    this.updateNode(node);
    return true;
  }

  /**
   * Gets the tree data structure
   * @returns {Array} Tree data
   */
  getData() {
    return this.data;
  }

  /**
   * Sets the tree data structure
   * @param {Array} data - New tree data
   */
  setData(data) {
    this.data = data;
    this.clearSelection();
    this.expandedNodes.clear();
    this.render();
  }

  /**
   * Gets the expanded nodes
   * @returns {Set} Set of expanded node IDs
   */
  getExpandedNodes() {
    return new Set(this.expandedNodes);
  }

  /**
   * Sets the expanded nodes
   * @param {Array|Set} nodeIds - Array or Set of node IDs to expand
   */
  setExpandedNodes(nodeIds) {
    this.expandedNodes = new Set(nodeIds);
    this.render();
  }

  /**
   * Generates a unique node ID
   * @returns {string} Unique node ID
   */
  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Selects a range of nodes (for multiple selection with shift key)
   * @param {Object} startNode - Starting node
   * @param {Object} endNode - Ending node
   */
  selectRange(startNode, endNode) {
    // This is a simplified implementation that just selects the end node
    // A full implementation would select all nodes between start and end
    this.clearSelection();
    this.selectedNodes.add(startNode.id);
    this.selectedNodes.add(endNode.id);
    this.updateSelectionDisplay();
  }

  /**
   * Gets the path to a node from the root
   * @param {string} nodeId - ID of node
   * @returns {Array} Array of node IDs representing the path
   */
  getNodePath(nodeId) {
    const path = [];
    
    const findPath = (nodes, targetId) => {
      for (const node of nodes) {
        path.push(node.id);
        
        if (node.id === targetId) {
          return true;
        }
        
        if (node.children) {
          if (findPath(node.children, targetId)) {
            return true;
          }
        }
        
        path.pop(); // Backtrack if this path didn't contain the target
      }
      return false;
    };
    
    findPath(this.data, nodeId);
    return path;
  }

  /**
   * Adds dynamic styles for the tree view
   */
  addDynamicStyles() {
    if (document.getElementById('tree-view-styles')) return;

    const style = document.createElement('style');
    style.id = 'tree-view-styles';
    style.textContent = `
      .tree-view {
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        background: var(--bg-dark, #0a0a0a);
        overflow: auto;
        max-height: 500px;
        min-width: 200px;
      }
      
      .tree-root {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .tree-node {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .tree-node-content {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .tree-node-content:hover {
        background: var(--bg-darker, #111);
      }
      
      .tree-node-selected > .tree-node-content {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
      }
      
      .tree-node-toggle {
        margin-right: 8px;
        font-size: 0.8em;
        width: 16px;
        text-align: center;
      }
      
      .tree-node-icon {
        margin-right: 8px;
        width: 16px;
        text-align: center;
      }
      
      .tree-node-label {
        flex: 1;
      }
      
      .tree-node-children {
        list-style: none;
        margin: 0;
        padding: 0;
        padding-left: 20px;
      }
      
      .tree-node-drop-target {
        background: var(--bg-darker, #111);
        border-left: 3px solid var(--jazer-cyan, #00f2ea);
      }
      
      .tree-node-dragging {
        opacity: 0.5;
      }
      
      .tree-context-menu {
        position: fixed;
        z-index: 10000;
        min-width: 150px;
      }
      
      .menu-item {
        padding: 8px 12px;
        cursor: pointer;
      }
      
      .menu-item:hover {
        background: var(--bg-darker, #111);
      }
      
      .menu-separator {
        margin: 4px 0;
        border: 0;
        height: 1px;
        background: var(--border-lighter, #222);
      }
      
      /* Animation for expanding/collapsing */
      .tree-node-children {
        transition: height 0.2s ease;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the tree view and cleans up
   */
  destroy() {
    // Remove container classes
    this.container.classList.remove('tree-view');
    
    // Remove event listeners would be handled here
    // In a complete implementation, we would track and remove all event listeners
    
    // Clear references
    this.container.innerHTML = '';
    this.data = [];
    this.selectedNodes.clear();
    this.expandedNodes.clear();
  }
}

/**
 * Initializes all tree views on the page
 * @param {HTMLElement|Document} container - Container to search for tree views
 * @returns {Array<TreeView>} Array of initialized tree view instances
 */
function initTreeViews(container = document) {
  const treeContainers = container.querySelectorAll('.tree-view, [data-tree-view]');
  const instances = [];

  treeContainers.forEach(treeContainer => {
    if (!treeContainer.hasAttribute('data-tree-view-initialized')) {
      treeContainer.setAttribute('data-tree-view-initialized', 'true');

      // Get data from attribute or initialize empty
      const treeData = treeContainer.dataset.treeData ? 
        JSON.parse(treeContainer.dataset.treeData) : 
        [];
      
      // Get options from data attributes
      const options = {
        dragAndDrop: treeContainer.dataset.dragAndDrop !== 'false',
        showIcons: treeContainer.dataset.showIcons !== 'false',
        expandOnDoubleClick: treeContainer.dataset.expandOnDoubleClick !== 'false',
        expandOnClick: treeContainer.dataset.expandOnClick === 'true',
        selectionMode: treeContainer.dataset.selectionMode || 'single',
        enableContextMenu: treeContainer.dataset.enableContextMenu !== 'false'
      };

      const instance = new TreeView(treeContainer, treeData, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize tree views when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initTreeViews();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TreeView, initTreeViews };
}

// Make available globally
window.TreeView = TreeView;
window.initTreeViews = initTreeViews;