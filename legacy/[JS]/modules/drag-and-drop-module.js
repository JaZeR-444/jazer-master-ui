/**
 * Drag and Drop Module
 * Comprehensive drag and drop system with support for lists, grids, and custom behaviors
 * Compatible with jazer-brand.css styling for drag and drop elements
 */

class DragAndDrop {
  /**
   * Creates a new drag and drop instance
   * @param {HTMLElement} container - Container element for drag and drop operations
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      draggableSelector: '.draggable',
      dropZoneSelector: '.drop-zone',
      dragClass: 'dragging',
      dragOverClass: 'drag-over',
      dropEffect: 'move',
      allowReorder: true,
      allowCrossContainer: true,
      animationDuration: 150,
      onDragStart: null,
      onDragEnd: null,
      onDrop: null,
      onDragOver: null,
      cloneDraggedElement: false,
      handleSelector: null,
      ...options
    };

    this.draggedElement = null;
    this.dragImage = null;
    this.dragOffset = { x: 0, y: 0 };
    this.originalPosition = null;
    this.isDragging = false;
    this.dropZones = [];
    this.draggables = [];

    this.init();
  }

  /**
   * Initializes the drag and drop system
   */
  init() {
    // Find all draggable elements
    this.findDraggables();
    
    // Find all drop zones
    this.findDropZones();
    
    // Bind events
    this.bindEvents();
    
    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Finds all draggable elements in the container
   */
  findDraggables() {
    this.draggables = Array.from(this.container.querySelectorAll(this.options.draggableSelector));
    this.draggables.forEach(draggable => {
      this.setupDraggable(draggable);
    });
  }

  /**
   * Finds all drop zones in the container
   */
  findDropZones() {
    this.dropZones = Array.from(this.container.querySelectorAll(this.options.dropZoneSelector));
  }

  /**
   * Sets up a draggable element
   * @param {HTMLElement} element - Element to make draggable
   */
  setupDraggable(element) {
    element.draggable = true;
    
    // Add drag handle if specified
    if (this.options.handleSelector) {
      const handle = element.querySelector(this.options.handleSelector);
      if (handle) {
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          // Start drag operation
          element.setAttribute('draggable', 'true');
        });
      }
    }
    
    // Add drag events
    element.addEventListener('dragstart', this.handleDragStart.bind(this));
    element.addEventListener('drag', this.handleDrag.bind(this));
    element.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  /**
   * Sets up a drop zone
   * @param {HTMLElement} element - Element to make a drop zone
   */
  setupDropZone(element) {
    element.addEventListener('dragover', this.handleDragOver.bind(this));
    element.addEventListener('dragenter', this.handleDragEnter.bind(this));
    element.addEventListener('dragleave', this.handleDragLeave.bind(this));
    element.addEventListener('drop', this.handleDrop.bind(this));
  }

  /**
   * Binds events for the drag and drop system
   */
  bindEvents() {
    // Add document-level events for better UX
    document.addEventListener('dragover', this.handleDocumentDragOver.bind(this));
    document.addEventListener('mouseup', this.handleDocumentMouseUp.bind(this));
  }

  /**
   * Handles drag start event
   * @param {DragEvent} e - Drag event
   */
  handleDragStart(e) {
    this.draggedElement = e.target;
    this.isDragging = true;
    
    // Store original position
    this.originalPosition = {
      parent: this.draggedElement.parentNode,
      nextSibling: this.draggedElement.nextSibling
    };
    
    // Calculate offset
    const rect = this.draggedElement.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Add dragging class
    this.draggedElement.classList.add(this.options.dragClass);
    
    // Set drag image if needed
    if (!this.options.cloneDraggedElement) {
      e.dataTransfer.effectAllowed = this.options.dropEffect;
      e.dataTransfer.setData('text/html', this.draggedElement.outerHTML);
    } else {
      // Create custom drag image
      this.dragImage = this.draggedElement.cloneNode(true);
      this.dragImage.style.opacity = '0.8';
      this.dragImage.style.position = 'absolute';
      this.dragImage.style.pointerEvents = 'none';
      this.dragImage.style.zIndex = '9999';
      this.dragImage.style.transform = 'rotate(5deg)';
      document.body.appendChild(this.dragImage);
      e.dataTransfer.setDragImage(this.dragImage, 0, 0);
    }
    
    // Execute callback
    if (this.options.onDragStart) {
      this.options.onDragStart(e, this.draggedElement);
    }
  }

  /**
   * Handles drag event
   * @param {DragEvent} e - Drag event
   */
  handleDrag(e) {
    if (this.dragImage) {
      this.dragImage.style.left = `${e.clientX - this.dragOffset.x}px`;
      this.dragImage.style.top = `${e.clientY - this.dragOffset.y}px`;
    }
  }

  /**
   * Handles drag end event
   * @param {DragEvent} e - Drag event
   */
  handleDragEnd(e) {
    this.isDragging = false;
    
    // Remove dragging class
    if (this.draggedElement) {
      this.draggedElement.classList.remove(this.options.dragClass);
      
      // Remove custom drag image if exists
      if (this.dragImage && this.dragImage.parentNode) {
        this.dragImage.parentNode.removeChild(this.dragImage);
        this.dragImage = null;
      }
      
      // Execute callback
      if (this.options.onDragEnd) {
        this.options.onDragEnd(e, this.draggedElement);
      }
    }
    
    this.draggedElement = null;
  }

  /**
   * Handles drag over event
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = this.options.dropEffect;
    
    // Execute callback
    if (this.options.onDragOver) {
      this.options.onDragOver(e, e.target);
    }
    
    return false;
  }

  /**
   * Handles drag enter event
   * @param {DragEvent} e - Drag event
   */
  handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add(this.options.dragOverClass);
  }

  /**
   * Handles drag leave event
   * @param {DragEvent} e - Drag event
   */
  handleDragLeave(e) {
    e.preventDefault();
    e.target.classList.remove(this.options.dragOverClass);
  }

  /**
   * Handles drop event
   * @param {DragEvent} e - Drop event
   */
  handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove(this.options.dragOverClass);
    
    if (!this.draggedElement) return;
    
    // Handle different drop behaviors
    if (this.options.allowReorder && e.target.matches(this.options.dropZoneSelector)) {
      // Reorder within the same container or move to new container
      this.handleReorderDrop(e);
    }
    
    // Execute callback
    if (this.options.onDrop) {
      this.options.onDrop(e, this.draggedElement, e.target);
    }
  }

  /**
   * Handles reorder drop (when dropping on another draggable item)
   * @param {DragEvent} e - Drop event
   */
  handleReorderDrop(e) {
    const dropTarget = e.target;
    
    if (dropTarget && dropTarget !== this.draggedElement) {
      // Determine insert position based on mouse position
      const rect = dropTarget.getBoundingClientRect();
      const isAbove = e.clientY < (rect.top + rect.height / 2);
      
      // Insert before or after the drop target
      if (isAbove) {
        dropTarget.parentNode.insertBefore(this.draggedElement, dropTarget);
      } else {
        dropTarget.parentNode.insertBefore(this.draggedElement, dropTarget.nextSibling);
      }
      
      // Apply animation for smooth transition
      this.animateElement(this.draggedElement);
    }
  }

  /**
   * Handles document drag over (to prevent default behavior)
   * @param {DragEvent} e - Drag event
   */
  handleDocumentDragOver(e) {
    e.preventDefault();
  }

  /**
   * Handles document mouse up (to clean up in case of dropped outside containers)
   */
  handleDocumentMouseUp() {
    if (this.isDragging) {
      // Clean up if drag was released outside a valid drop zone
      if (this.draggedElement && this.originalPosition) {
        // Optional: Reset to original position
        // this.resetToOriginalPosition();
      }
    }
  }

  /**
   * Animate an element after drop
   * @param {HTMLElement} element - Element to animate
   */
  animateElement(element) {
    if (this.options.animationDuration <= 0) return;
    
    element.style.transition = `transform ${this.options.animationDuration}ms ease`;
    element.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      element.style.transition = '';
    }, this.options.animationDuration / 2);
  }

  /**
   * Adds a new draggable item to the container
   * @param {HTMLElement} element - Element to add as draggable
   */
  addDraggable(element) {
    element.classList.add('draggable');
    this.setupDraggable(element);
    this.container.appendChild(element);
    this.draggables.push(element);
  }

  /**
   * Adds a new drop zone to the container
   * @param {HTMLElement} element - Element to add as drop zone
   */
  addDropZone(element) {
    element.classList.add('drop-zone');
    this.setupDropZone(element);
    this.dropZones.push(element);
  }

  /**
   * Removes a draggable element
   * @param {HTMLElement} element - Element to remove
   */
  removeDraggable(element) {
    element.draggable = false;
    element.classList.remove('draggable');
    element.classList.remove(this.options.dragClass);
    this.draggables = this.draggables.filter(draggable => draggable !== element);
  }

  /**
   * Refreshes the drag and drop system (re-scans for elements)
   */
  refresh() {
    this.findDraggables();
    this.findDropZones();
  }

  /**
   * Enables the drag and drop system
   */
  enable() {
    this.container.setAttribute('data-dnd-enabled', 'true');
    this.draggables.forEach(draggable => {
      draggable.draggable = true;
    });
  }

  /**
   * Disables the drag and drop system
   */
  disable() {
    this.container.setAttribute('data-dnd-disabled', 'true');
    this.draggables.forEach(draggable => {
      draggable.draggable = false;
    });
  }

  /**
   * Resets dragged element to its original position
   */
  resetToOriginalPosition() {
    if (this.draggedElement && this.originalPosition) {
      const { parent, nextSibling } = this.originalPosition;
      if (parent) {
        if (nextSibling) parent.insertBefore(this.draggedElement, nextSibling);
        else parent.appendChild(this.draggedElement);
      }
    }
  }

  /**
   * Sorts items using a custom comparison function
   * @param {Function} compareFunction - Comparison function for sorting
   */
  sort(compareFunction) {
    const draggables = Array.from(this.container.querySelectorAll(this.options.draggableSelector));
    const sorted = draggables.sort(compareFunction);
    
    // Reorder the elements in the DOM
    sorted.forEach(item => {
      this.container.appendChild(item);
    });
  }

  /**
   * Gets all draggable items
   * @returns {Array} Array of draggable elements
   */
  getDraggables() {
    return Array.from(this.container.querySelectorAll(this.options.draggableSelector));
  }

  /**
   * Gets the index of a draggable element
   * @param {HTMLElement} element - Element to find index for
   * @returns {number} Index of the element
   */
  indexOf(element) {
    return this.getDraggables().indexOf(element);
  }

  /**
   * Moves an element to a specific position
   * @param {HTMLElement} element - Element to move
   * @param {number} position - New position (0-indexed)
   */
  moveTo(element, position) {
    const allDraggables = this.getDraggables();
    if (position < 0 || position >= allDraggables.length) return;
    
    const container = element.parentNode;
    const newElement = allDraggables[position];
    
    if (newElement && newElement !== element) {
      container.insertBefore(element, newElement);
    } else {
      container.appendChild(element);
    }
  }

  /**
   * Swaps two elements
   * @param {HTMLElement} element1 - First element
   * @param {HTMLElement} element2 - Second element
   */
  swap(element1, element2) {
    const parent1 = element1.parentNode;
    const parent2 = element2.parentNode;
    const next1 = element1.nextSibling;
    const next2 = element2.nextSibling;
    
    if (parent1 === parent2) {
      // Same parent: more efficient swap
      if (next1 === element2) {
        parent1.insertBefore(element2, element1);
      } else if (next2 === element1) {
        parent1.insertBefore(element1, element2);
      } else {
        parent1.insertBefore(element2, next1);
        parent1.insertBefore(element1, next2);
      }
    } else {
      // Different parents: swap between different containers
      parent1.insertBefore(element2, next1);
      parent2.insertBefore(element1, next2);
    }
  }

  /**
   * Adds dynamic styles for the drag and drop system
   */
  addDynamicStyles() {
    if (document.getElementById('drag-and-drop-styles')) return;

    const style = document.createElement('style');
    style.id = 'drag-and-drop-styles';
    style.textContent = `
      .draggable {
        cursor: move;
        user-select: none;
        transition: transform 0.2s ease;
      }
      
      .draggable:hover {
        transform: scale(1.02);
      }
      
      .dragging {
        opacity: 0.8;
        transform: rotate(5deg) scale(0.98);
        z-index: 1000;
      }
      
      .drop-zone {
        min-height: 50px;
        border: 2px dashed var(--border-default, #4facfe);
        border-radius: 6px;
        padding: 10px;
        transition: all 0.2s ease;
      }
      
      .drop-zone.drag-over {
        background-color: var(--bg-darker, #111);
        border-color: var(--jazer-cyan, #00f2ea);
        box-shadow: 0 0 10px rgba(0, 242, 234, 0.3);
      }
      
      .drop-zone.drag-over * {
        pointer-events: none;
      }
      
      /* Reorder styling */
      .draggable.drop-above {
        border-top: 2px solid var(--jazer-cyan, #00f2ea);
      }
      
      .draggable.drop-below {
        border-bottom: 2px solid var(--jazer-cyan, #00f2ea);
      }
      
      /* Animation for reorder */
      @keyframes dropHighlight {
        0% { background-color: rgba(0, 242, 234, 0.1); }
        50% { background-color: rgba(0, 242, 234, 0.3); }
        100% { background-color: rgba(0, 242, 234, 0.1); }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the drag and drop system and cleans up
   */
  destroy() {
    // Remove event listeners from all draggables
    this.draggables.forEach(draggable => {
      draggable.draggable = false;
      draggable.classList.remove('draggable');
      draggable.classList.remove(this.options.dragClass);
    });
    
    // Remove drag over classes from drop zones
    this.dropZones.forEach(zone => {
      zone.classList.remove('drop-zone');
      zone.classList.remove(this.options.dragOverClass);
    });
    
    // Remove document listeners
    document.removeEventListener('dragover', this.handleDocumentDragOver);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }
}

/**
 * Creates a sortable list with drag and drop functionality
 * @param {HTMLElement} container - Container element for the sortable list
 * @param {Object} options - Configuration options
 * @returns {DragAndDrop} New drag and drop instance
 */
function createSortable(container, options = {}) {
  return new DragAndDrop(container, {
    draggableSelector: '.sortable-item',
    dropZoneSelector: '.sortable-container, .sortable-list',
    allowReorder: true,
    allowCrossContainer: false,
    ...options
  });
}

/**
 * Creates a Kanban-style board with drag and drop functionality
 * @param {HTMLElement} container - Container element for the Kanban board
 * @param {Object} options - Configuration options
 * @returns {DragAndDrop} New drag and drop instance
 */
function createKanban(container, options = {}) {
  return new DragAndDrop(container, {
    draggableSelector: '.kanban-card',
    dropZoneSelector: '.kanban-column',
    allowReorder: true,
    allowCrossContainer: true,
    cloneDraggedElement: true,
    ...options
  });
}

/**
 * Creates a file upload area with drag and drop functionality
 * @param {HTMLElement} container - Container element for the file upload area
 * @param {Object} options - Configuration options
 * @returns {DragAndDrop} New drag and drop instance
 */
function createFileDrop(container, options = {}) {
  return new DragAndDrop(container, {
    draggableSelector: null, // No draggables in this case
    dropZoneSelector: '.file-drop-area',
    allowReorder: false,
    onDrop: (e, draggedElement, dropTarget) => {
      // Handle file drop
      if (e.dataTransfer.files.length > 0 && options.onFilesDrop) {
        options.onFilesDrop(e.dataTransfer.files, dropTarget);
      }
    },
    ...options
  });
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DragAndDrop,
    createSortable,
    createKanban,
    createFileDrop
  };
}

// Also make it available globally
window.DragAndDrop = DragAndDrop;
window.createSortable = createSortable;
window.createKanban = createKanban;
window.createFileDrop = createFileDrop;