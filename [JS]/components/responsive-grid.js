/**
 * Responsive Grid Component
 * Configurable grid system with responsive breakpoints and customization options
 * Compatible with jazer-brand.css styling
 */

class ResponsiveGrid {
  /**
   * Creates a new responsive grid component
   * @param {HTMLElement} gridElement - The grid container element
   * @param {Object} options - Configuration options
   */
  constructor(gridElement, options = {}) {
    this.grid = gridElement;
    this.options = {
      columns: 12,
      gap: '1rem',
      breakpoints: {
        xs: { max: 575, cols: 1 },      // Extra small devices
        sm: { max: 767, cols: 2 },      // Small devices
        md: { max: 991, cols: 3 },      // Medium devices
        lg: { max: 1199, cols: 4 },     // Large devices
        xl: { min: 1200, cols: 6 }      // Extra large devices
      },
      autoColumns: false,
      equalHeight: false,
      animationDuration: 300,
      ...options
    };

    this.currentBreakpoint = null;
    this.gridItems = [];
    this.resizeObserver = null;

    this.init();
  }

  /**
   * Initializes the responsive grid
   */
  init() {
    // Set up the grid structure
    this.setupGrid();

    // Bind events
    this.bindEvents();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the grid structure
   */
  setupGrid() {
    // Add grid classes
    this.grid.classList.add('responsive-grid');
    
    // Set CSS variables for properties
    this.grid.style.setProperty('--grid-gap', this.options.gap);
    this.grid.style.setProperty('--grid-columns', this.options.columns);
    
    // Process child elements as grid items
    this.gridItems = Array.from(this.grid.children);
    this.gridItems.forEach((item, index) => {
      item.classList.add('grid-item');
      item.setAttribute('data-grid-index', index);
      
      // Add default styles
      item.style.transition = `all ${this.options.animationDuration}ms ease`;
    });

    // Determine initial breakpoint
    this.updateGrid();
  }

  /**
   * Binds events for the grid
   */
  bindEvents() {
    // Create resize observer for responsive behavior
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.updateGrid();
        }
      });
      this.resizeObserver.observe(this.grid);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', this.updateGrid.bind(this));
    }
  }

  /**
   * Updates the grid layout based on current breakpoint
   */
  updateGrid() {
    const width = this.grid.offsetWidth;
    const newBreakpoint = this.getBreakpointForWidth(width);
    
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      
      // Apply new layout
      this.applyGridLayout(newBreakpoint);
      
      // Update grid items if needed
      this.updateGridItems(newBreakpoint);
      
      // Trigger custom event
      this.grid.dispatchEvent(new CustomEvent('gridupdate', {
        detail: { 
          breakpoint: newBreakpoint,
          width: width,
          columns: this.getColumnsForBreakpoint(newBreakpoint)
        }
      }));
    }
  }

  /**
   * Gets the appropriate breakpoint for a given width
   * @param {number} width - Width in pixels
   * @returns {string} Breakpoint name (xs, sm, md, lg, xl)
   */
  getBreakpointForWidth(width) {
    const breakpoints = this.options.breakpoints;
    
    // Check for xl first (min width)
    if (breakpoints.xl && width >= breakpoints.xl.min) {
      return 'xl';
    }
    
    // Check other breakpoints (max width)
    if (breakpoints.lg && width <= breakpoints.lg.max) return 'lg';
    if (breakpoints.md && width <= breakpoints.md.max) return 'md';
    if (breakpoints.sm && width <= breakpoints.sm.max) return 'sm';
    if (breakpoints.xs && width <= breakpoints.xs.max) return 'xs';
    
    // Default to largest if no match
    return 'xl';
  }

  /**
   * Applies grid layout for a specific breakpoint
   * @param {string} breakpoint - Breakpoint name
   */
  applyGridLayout(breakpoint) {
    const cols = this.getColumnsForBreakpoint(breakpoint);
    
    // Set grid template columns
    if (this.options.autoColumns) {
      this.grid.style.gridTemplateColumns = `repeat(auto-fit, minmax(${this.getMinColumnWidth()}, 1fr))`;
    } else {
      this.grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }
    
    // Update CSS variable
    this.grid.style.setProperty('--grid-current-columns', cols);
  }

  /**
   * Gets the number of columns for a specific breakpoint
   * @param {string} breakpoint - Breakpoint name
   * @returns {number} Number of columns
   */
  getColumnsForBreakpoint(breakpoint) {
    return this.options.breakpoints[breakpoint]?.cols || 1;
  }

  /**
   * Gets minimum column width based on grid configuration
   * @returns {string} Minimum width value
   */
  getMinColumnWidth() {
    // Calculate based on container width and gap
    // This is a simplified approach - in a real implementation, you might want more sophisticated logic
    return '250px'; // Default minimum width
  }

  /**
   * Updates grid items based on current configuration
   * @param {string} breakpoint - Current breakpoint
   */
  updateGridItems(breakpoint) {
    const cols = this.getColumnsForBreakpoint(breakpoint);
    
    // Update item classes based on column count
    this.gridItems.forEach((item, index) => {
      // Remove old breakpoint classes
      item.classList.remove('grid-xs', 'grid-sm', 'grid-md', 'grid-lg', 'grid-xl');
      
      // Add current breakpoint class
      item.classList.add(`grid-${breakpoint}`);
      
      // Update equal height if enabled
      if (this.options.equalHeight) {
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
      }
    });
  }

  /**
   * Adds a new item to the grid
   * @param {HTMLElement} item - The item element to add
   * @param {Object} options - Item options (e.g., span, offset)
   */
  addItem(item, options = {}) {
    item.classList.add('grid-item');
    item.setAttribute('data-grid-index', this.gridItems.length);
    
    // Apply options like column span
    if (options.span) {
      item.style.gridColumn = `span ${options.span}`;
    }
    
    // Add animation
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    this.grid.appendChild(item);
    this.gridItems.push(item);
    
    // Trigger reflow and animate in
    setTimeout(() => {
      item.style.transition = `all ${this.options.animationDuration}ms ease`;
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 10);
  }

  /**
   * Removes an item from the grid
   * @param {number} index - Index of the item to remove
   */
  removeItem(index) {
    if (index < 0 || index >= this.gridItems.length) return;
    
    const item = this.gridItems[index];
    
    // Animate out
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      if (item.parentNode) {
        item.parentNode.removeChild(item);
      }
      
      // Remove from array
      this.gridItems.splice(index, 1);
      
      // Update remaining indices
      this.gridItems.forEach((item, idx) => {
        item.setAttribute('data-grid-index', idx);
      });
    }, this.options.animationDuration);
  }

  /**
   * Gets the current number of columns
   * @returns {number} Current number of columns
   */
  getCurrentColumns() {
    return this.getColumnsForBreakpoint(this.currentBreakpoint);
  }

  /**
   * Gets the current items in the grid
   * @returns {Array} Array of grid item elements
   */
  getItems() {
    return [...this.gridItems];
  }

  /**
   * Updates the gap between grid items
   * @param {string} gap - New gap value (e.g., '1rem', '10px')
   */
  setGap(gap) {
    this.options.gap = gap;
    this.grid.style.setProperty('--grid-gap', gap);
  }

  /**
   * Updates the number of columns in the grid
   * @param {number} columns - New number of columns
   */
  setColumns(columns) {
    this.options.columns = columns;
    this.grid.style.setProperty('--grid-columns', columns);
  }

  /**
   * Updates the breakpoints configuration
   * @param {Object} breakpoints - New breakpoints configuration
   */
  setBreakpoints(breakpoints) {
    this.options.breakpoints = { ...this.options.breakpoints, ...breakpoints };
    this.updateGrid();
  }

  /**
   * Sorts grid items based on a comparison function
   * @param {Function} compareFunction - Function to compare items
   */
  sortItems(compareFunction) {
    this.gridItems.sort(compareFunction);
    
    // Reorder elements in DOM
    this.gridItems.forEach(item => {
      this.grid.appendChild(item);
    });
  }

  /**
   * Filters grid items based on a condition
   * @param {Function} condition - Function to test each item
   * @returns {Array} Array of matching items
   */
  filterItems(condition) {
    return this.gridItems.filter(condition);
  }

  /**
   * Highlights a specific grid item
   * @param {number} index - Index of the item to highlight
   */
  highlightItem(index) {
    if (index < 0 || index >= this.gridItems.length) return;
    
    const item = this.gridItems[index];
    item.classList.add('grid-item-highlighted');
    
    // Remove highlight after delay
    setTimeout(() => {
      item.classList.remove('grid-item-highlighted');
    }, 2000);
  }

  /**
   * Gets the current breakpoint
   * @returns {string} Current breakpoint name
   */
  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }

  /**
   * Adds dynamic styles for the grid
   */
  addDynamicStyles() {
    if (document.getElementById('responsive-grid-styles')) return;

    const style = document.createElement('style');
    style.id = 'responsive-grid-styles';
    style.textContent = `
      .responsive-grid {
        display: grid;
        gap: var(--grid-gap, 1rem);
        grid-template-columns: repeat(var(--grid-columns, 12), 1fr);
        width: 100%;
      }
      
      .grid-item {
        position: relative;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-lighter, #222);
        border-radius: 6px;
        padding: 1rem;
        transition: all 0.3s ease;
      }
      
      .grid-item-highlighted {
        background: var(--jazer-cyan, #00f2ea);
        border-color: var(--jazer-cyan, #00f2ea);
        transform: scale(1.02);
      }
      
      /* Responsive classes for different breakpoints */
      @media (max-width: 575px) {
        .grid-xs { grid-column: span 1; }
      }
      
      @media (max-width: 767px) and (min-width: 576px) {
        .grid-sm { grid-column: span 2; }
      }
      
      @media (max-width: 991px) and (min-width: 768px) {
        .grid-md { grid-column: span 3; }
      }
      
      @media (max-width: 1199px) and (min-width: 992px) {
        .grid-lg { grid-column: span 4; }
      }
      
      @media (min-width: 1200px) {
        .grid-xl { grid-column: span 1; } /* This will be overridden by grid-template-columns */
      }
      
      /* Equal height items */
      .grid-item.equal-height {
        display: flex;
        flex-direction: column;
      }
      
      /* Animation classes */
      .grid-item.fade-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .grid-item.slide-in-left {
        animation: slideInLeft 0.5s ease;
      }
      
      .grid-item.slide-in-right {
        animation: slideInRight 0.5s ease;
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the grid and cleans up
   */
  destroy() {
    // Disconnect resize observer if it exists
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      // Remove window resize listener if using fallback
      window.removeEventListener('resize', this.updateGrid.bind(this));
    }
    
    // Remove classes
    this.grid.classList.remove('responsive-grid');
    
    // Remove grid items classes
    this.gridItems.forEach(item => {
      item.classList.remove('grid-item');
    });
  }
}

/**
 * Initializes all responsive grids on the page
 * @param {HTMLElement|Document} container - Container to search for grids
 * @returns {Array<ResponsiveGrid>} Array of initialized grid instances
 */
function initResponsiveGrids(container = document) {
  const grids = container.querySelectorAll('.responsive-grid, [data-grid], .grid-container');
  const instances = [];

  grids.forEach(grid => {
    if (!grid.hasAttribute('data-grid-initialized')) {
      grid.setAttribute('data-grid-initialized', 'true');

      // Get options from data attributes
      const options = {
        columns: parseInt(grid.dataset.columns) || 12,
        gap: grid.dataset.gap || '1rem',
        autoColumns: grid.dataset.autoColumns === 'true',
        equalHeight: grid.dataset.equalHeight === 'true',
        animationDuration: parseInt(grid.dataset.animationDuration) || 300
      };

      // Get breakpoints from data attributes
      if (grid.dataset.breakpoints) {
        try {
          options.breakpoints = JSON.parse(grid.dataset.breakpoints);
        } catch (e) {
          console.error('Invalid breakpoints data:', e);
        }
      }

      const instance = new ResponsiveGrid(grid, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize responsive grids when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initResponsiveGrids();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ResponsiveGrid, initResponsiveGrids };
}

// Also make it available globally
window.ResponsiveGrid = ResponsiveGrid;
window.initResponsiveGrids = initResponsiveGrids;