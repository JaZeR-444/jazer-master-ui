/**
 * Virtual Scroll Module
 * Efficient virtual scrolling for large datasets with smooth performance
 * Compatible with jazer-brand.css styling for virtual scroll containers
 */

class VirtualScroll {
  /**
   * Creates a new virtual scroll instance
   * @param {HTMLElement} container - Container element for virtual scrolling
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemHeight: 50,
      buffer: 5,
      overscan: 3,
      data: [],
      renderItem: null,
      keyField: 'id',
      estimateItemSize: true,
      enableScrollTo: true,
      enableSmoothScroll: true,
      onScroll: null,
      onItemRender: null,
      onRangeChange: null,
      ...options
    };

    this.items = this.options.data;
    this.visibleRange = { start: 0, end: 0 };
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.placeholderHeight = 0;
    this.contentElement = null;
    this.scrollContainer = null;
    this.itemHeights = new Map();
    this.isScrolling = false;
    this.scrollTimeout = null;

    this.init();
  }

  /**
   * Initializes the virtual scroll system
   */
  init() {
    // Create scroll container
    this.createScrollContainer();
    
    // Calculate scroll height
    this.calculateScrollHeight();
    
    // Bind events
    this.bindEvents();
    
    // Add necessary CSS
    this.addDynamicStyles();
    
    // Render initial view
    this.render();
  }

  /**
   * Creates the scroll container structure
   */
  createScrollContainer() {
    // Create content container
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'virtual-scroll-content';
    
    // Create scroll container
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.className = 'virtual-scroll-container';
    this.scrollContainer.style.height = '100%';
    this.scrollContainer.style.overflow = 'auto';
    
    // Add container for scroll calculation
    this.scrollContainer.appendChild(this.contentElement);
    
    // Replace container content or append as needed
    this.container.innerHTML = '';
    this.container.appendChild(this.scrollContainer);
  }

  /**
   * Calculates the total scroll height
   */
  calculateScrollHeight() {
    if (this.options.estimateItemSize) {
      this.scrollHeight = this.items.length * this.options.itemHeight;
    } else {
      // Calculate based on actual item heights if available
      this.scrollHeight = 0;
      for (let i = 0; i < this.items.length; i++) {
        const height = this.itemHeights.get(this.items[i][this.options.keyField]) || this.options.itemHeight;
        this.scrollHeight += height;
      }
    }
    
    // Set the content height to create the scroll area
    this.contentElement.style.height = this.scrollHeight + 'px';
  }

  /**
   * Binds events for the virtual scroll system
   */
  bindEvents() {
    this.scrollContainer.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Add resize observer if available
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }
  }

  /**
   * Handles scroll events
   */
  handleScroll() {
    this.scrollTop = this.scrollContainer.scrollTop;
    
    // Clear previous scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Set scrolling flag with timeout
    this.isScrolling = true;
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150);
    
    // Render visible items
    this.render();
    
    // Execute callback
    if (this.options.onScroll) {
      this.options.onScroll({
        scrollTop: this.scrollTop,
        scrollHeight: this.scrollHeight,
        clientHeight: this.scrollContainer.clientHeight
      });
    }
  }

  /**
   * Handles resize events
   */
  handleResize() {
    this.calculateScrollHeight();
    this.render();
  }

  /**
   * Calculates the range of items to render based on scroll position
   * @returns {Object} Object with start and end indices
   */
  calculateVisibleRange() {
    const start = Math.max(0, Math.floor(this.scrollTop / this.options.itemHeight) - this.options.overscan);
    const visibleCount = Math.ceil(this.scrollContainer.clientHeight / this.options.itemHeight);
    const end = Math.min(this.items.length, start + visibleCount + (this.options.overscan * 2));

    return { start, end };
  }

  /**
   * Renders the visible items
   */
  render() {
    const range = this.calculateVisibleRange();
    
    // Only render if range has changed
    if (range.start !== this.visibleRange.start || range.end !== this.visibleRange.end) {
      this.visibleRange = range;
      
      // Clear existing content
      this.contentElement.innerHTML = '';
      
      // Calculate offset for top padding
      let offsetY = 0;
      for (let i = 0; i < range.start; i++) {
        offsetY += this.itemHeights.get(this.items[i]?.[this.options.keyField]) || this.options.itemHeight;
      }
      
      // Create top spacer
      const topSpacer = document.createElement('div');
      topSpacer.style.height = offsetY + 'px';
      this.contentElement.appendChild(topSpacer);
      
      // Render visible items
      for (let i = range.start; i < range.end; i++) {
        if (i >= 0 && i < this.items.length) {
          const item = this.items[i];
          const itemElement = this.renderItem(item, i);
          
          if (itemElement) {
            this.contentElement.appendChild(itemElement);
          }
        }
      }
      
      // Calculate bottom padding
      let bottomOffset = 0;
      for (let i = range.end; i < this.items.length; i++) {
        bottomOffset += this.itemHeights.get(this.items[i]?.[this.options.keyField]) || this.options.itemHeight;
      }
      
      // Create bottom spacer
      const bottomSpacer = document.createElement('div');
      bottomSpacer.style.height = bottomOffset + 'px';
      this.contentElement.appendChild(bottomSpacer);
      
      // Execute range change callback
      if (this.options.onRangeChange) {
        this.options.onRangeChange({
          start: range.start,
          end: range.end,
          total: this.items.length
        });
      }
    }
  }

  /**
   * Renders a single item
   * @param {*} item - Item data to render
   * @param {number} index - Index of the item
   * @returns {HTMLElement} Rendered item element
   */
  renderItem(item, index) {
    let element;
    
    if (this.options.renderItem) {
      element = this.options.renderItem(item, index);
    } else {
      // Default renderer
      element = document.createElement('div');
      element.className = 'virtual-scroll-item';
      element.style.height = this.options.itemHeight + 'px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.padding = '0 10px';
      element.style.borderBottom = '1px solid var(--border-lighter, #222)';
      element.textContent = typeof item === 'object' ? JSON.stringify(item) : item;
    }
    
    // Add unique identifier
    element.setAttribute('data-index', index);
    element.setAttribute('data-key', item[this.options.keyField] || index);
    
    // Execute item render callback
    if (this.options.onItemRender) {
      this.options.onItemRender(element, item, index);
    }
    
    return element;
  }

  /**
   * Updates the data for the virtual scroll
   * @param {Array} data - New data array
   * @param {boolean} resetScroll - Whether to reset scroll position
   */
  updateData(data, resetScroll = false) {
    this.items = data;
    
    if (resetScroll) {
      this.scrollTop = 0;
      if (this.scrollContainer) {
        this.scrollContainer.scrollTop = 0;
      }
    }
    
    this.calculateScrollHeight();
    this.render();
  }

  /**
   * Scrolls to a specific item
   * @param {number} index - Index of the item to scroll to
   * @param {string} behavior - Scroll behavior ('auto', 'smooth')
   */
  scrollToItem(index, behavior = 'auto') {
    if (!this.options.enableScrollTo || index < 0 || index >= this.items.length) return;
    
    const targetScrollTop = index * this.options.itemHeight;
    this.scrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: behavior === 'smooth' && this.options.enableSmoothScroll ? 'smooth' : 'auto'
    });
  }

  /**
   * Scrolls to a specific position
   * @param {number} scrollTop - Scroll position
   * @param {string} behavior - Scroll behavior ('auto', 'smooth')
   */
  scrollTo(scrollTop, behavior = 'auto') {
    this.scrollContainer.scrollTo({
      top: scrollTop,
      behavior: behavior === 'smooth' && this.options.enableSmoothScroll ? 'smooth' : 'auto'
    });
  }

  /**
   * Gets the current scroll position
   * @returns {number} Current scroll position
   */
  getScrollTop() {
    return this.scrollTop;
  }

  /**
   * Gets the total scroll height
   * @returns {number} Total scroll height
   */
  getScrollHeight() {
    return this.scrollHeight;
  }

  /**
   * Gets the visible range of items
   * @returns {Object} Object with start and end indices
   */
  getVisibleRange() {
    return { ...this.visibleRange };
  }

  /**
   * Gets the total number of items
   * @returns {number} Total number of items
   */
  getTotalItems() {
    return this.items.length;
  }

  /**
   * Prepends items to the virtual scroll
   * @param {Array} items - Items to prepend
   */
  prepend(items) {
    this.items = [...items, ...this.items];
    this.calculateScrollHeight();
    this.render();
  }

  /**
   * Appends items to the virtual scroll
   * @param {Array} items - Items to append
   */
  append(items) {
    this.items = [...this.items, ...items];
    this.calculateScrollHeight();
    this.render();
  }

  /**
   * Inserts an item at a specific index
   * @param {number} index - Index to insert at
   * @param {*} item - Item to insert
   */
  insertAt(index, item) {
    if (index < 0 || index > this.items.length) return;
    
    this.items.splice(index, 0, item);
    this.calculateScrollHeight();
    this.render();
  }

  /**
   * Removes an item at a specific index
   * @param {number} index - Index to remove from
   */
  removeAt(index) {
    if (index < 0 || index >= this.items.length) return;
    
    this.items.splice(index, 1);
    this.calculateScrollHeight();
    this.render();
  }

  /**
   * Updates an item at a specific index
   * @param {number} index - Index to update
   * @param {*} item - New item data
   */
  updateAt(index, item) {
    if (index < 0 || index >= this.items.length) return;
    
    this.items[index] = { ...this.items[index], ...item };
    this.render();
  }

  /**
   * Measures item heights dynamically
   * @param {HTMLElement} element - Item element to measure
   * @param {*} item - Item data
   */
  measureItem(element, item) {
    if (!element) return;
    
    const height = element.offsetHeight;
    const key = item[this.options.keyField];
    this.itemHeights.set(key, height);
    this.calculateScrollHeight();
  }

  /**
   * Gets the actual position of an item
   * @param {number} index - Index of the item
   * @returns {number} Position of the item
   */
  getItemPosition(index) {
    if (index < 0 || index >= this.items.length) return 0;
    
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += this.itemHeights.get(this.items[i]?.[this.options.keyField]) || this.options.itemHeight;
    }
    
    return position;
  }

  /**
   * Adds dynamic styles for the virtual scroll
   */
  addDynamicStyles() {
    if (document.getElementById('virtual-scroll-styles')) return;

    const style = document.createElement('style');
    style.id = 'virtual-scroll-styles';
    style.textContent = `
      .virtual-scroll-container {
        height: 100%;
        overflow: auto;
        position: relative;
      }

      .virtual-scroll-content {
        position: relative;
        width: 100%;
      }

      .virtual-scroll-item {
        width: 100%;
        box-sizing: border-box;
      }

      .virtual-scroll-item:hover {
        background-color: var(--bg-darker, #111);
      }

      /* Custom scrollbars for webkit browsers */
      .virtual-scroll-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .virtual-scroll-container::-webkit-scrollbar-track {
        background: var(--bg-darkest, #0a0a0a);
      }

      .virtual-scroll-container::-webkit-scrollbar-thumb {
        background: var(--border-lighter, #222);
        border-radius: 4px;
      }

      .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
        background: var(--jazer-cyan, #00f2ea);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the virtual scroll and cleans up
   */
  destroy() {
    // Remove event listeners
    this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    
    // Disconnect resize observer if available
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Clear timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Clear container
    this.container.innerHTML = '';
  }
}

/**
 * Creates a virtual scroll instance for a list
 * @param {HTMLElement} container - Container element for virtual scrolling
 * @param {Object} options - Configuration options
 * @returns {VirtualScroll} New virtual scroll instance
 */
function createVirtualList(container, options = {}) {
  return new VirtualScroll(container, {
    itemHeight: 50,
    buffer: 5,
    overscan: 3,
    renderItem: (item, index) => {
      const element = document.createElement('div');
      element.className = 'virtual-list-item';
      element.style.height = (options.itemHeight || 50) + 'px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.padding = '0 15px';
      element.style.borderBottom = '1px solid var(--border-lighter, #222)';
      element.textContent = typeof item === 'object' ? item.label || item.title || item.name || JSON.stringify(item) : item;
      return element;
    },
    ...options
  });
}

/**
 * Creates a virtual scroll instance for a table
 * @param {HTMLElement} container - Container element for virtual scrolling
 * @param {Object} options - Configuration options
 * @returns {VirtualScroll} New virtual scroll instance
 */
function createVirtualTable(container, options = {}) {
  return new VirtualScroll(container, {
    itemHeight: 40,
    buffer: 3,
    overscan: 2,
    renderItem: (item, index) => {
      const element = document.createElement('div');
      element.className = 'virtual-table-row';
      element.style.height = (options.itemHeight || 40) + 'px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.padding = '0 15px';
      element.style.borderBottom = '1px solid var(--border-lighter, #222)';
      
      // Create cell content based on columns if provided
      if (options.columns && Array.isArray(options.columns)) {
        element.style.display = 'grid';
        element.style.gridTemplateColumns = options.columns.map(col => col.width || '1fr').join(' ');
        
        options.columns.forEach(col => {
          const cell = document.createElement('div');
          cell.className = 'virtual-table-cell';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.padding = '0 8px';
          cell.textContent = item[col.key] || '';
          element.appendChild(cell);
        });
      } else {
        element.textContent = typeof item === 'object' ? JSON.stringify(item) : item;
      }
      
      return element;
    },
    ...options
  });
}

/**
 * Creates a virtual scroll instance for a grid
 * @param {HTMLElement} container - Container element for virtual scrolling
 * @param {Object} options - Configuration options
 * @returns {VirtualScroll} New virtual scroll instance
 */
function createVirtualGrid(container, options = {}) {
  return new VirtualScroll(container, {
    itemHeight: 100,
    buffer: 2,
    overscan: 1,
    renderItem: (item, index) => {
      const element = document.createElement('div');
      element.className = 'virtual-grid-item';
      element.style.height = (options.itemHeight || 100) + 'px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.border = '1px solid var(--border-lighter, #222)';
      element.style.borderRadius = '6px';
      element.style.margin = '5px';
      element.style.backgroundColor = 'var(--bg-darker, #111)';
      
      element.textContent = typeof item === 'object' ? item.title || item.name || JSON.stringify(item) : item;
      return element;
    },
    ...options
  });
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VirtualScroll,
    createVirtualList,
    createVirtualTable,
    createVirtualGrid
  };
}

// Also make it available globally
window.VirtualScroll = VirtualScroll;
window.createVirtualList = createVirtualList;
window.createVirtualTable = createVirtualTable;
window.createVirtualGrid = createVirtualGrid;