/**
 * Pagination Module
 * Comprehensive pagination system with multiple display styles and remote data support
 * Compatible with jazer-brand.css styling for pagination elements
 */

class Pagination {
  /**
   * Creates a new pagination instance
   * @param {HTMLElement} container - Container element for pagination controls
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemsPerPage: 10,
      maxVisiblePages: 5,
      showFirstLast: true,
      showPrevNext: true,
      showPageNumbers: true,
      showInfo: true,
      infoTemplate: 'Showing {start} to {end} of {total} items',
      pageUrl: '#',
      hideIfSinglePage: true,
      onPageChange: null,
      dataCallback: null,
      displayStyle: 'normal', // 'normal', 'compact', 'minimal'
      ...options
    };

    this.currentPage = 1;
    this.totalItems = 0;
    this.pages = [];
    this.element = null;

    this.init();
  }

  /**
   * Initializes the pagination system
   */
  init() {
    // Create pagination element
    this.createElement();
    
    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Creates the pagination element
   */
  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'pagination-container';
    this.element.setAttribute('role', 'navigation');
    this.element.setAttribute('aria-label', 'Pagination navigation');

    this.container.appendChild(this.element);
  }

  /**
   * Sets up pagination with data
   * @param {number} totalItems - Total number of items
   * @param {number} currentPage - Current page number
   * @param {number} itemsPerPage - Number of items per page
   */
  setup(totalItems, currentPage = 1, itemsPerPage = this.options.itemsPerPage) {
    this.totalItems = totalItems || 0;
    this.currentPage = Math.max(1, Math.min(currentPage, this.getTotalPages()));
    this.options.itemsPerPage = itemsPerPage;

    this.render();
  }

  /**
   * Renders the pagination controls
   */
  render() {
    const totalPages = this.getTotalPages();

    // Clear previous content
    this.element.innerHTML = '';

    // Hide if single page and option is enabled
    if (this.options.hideIfSinglePage && totalPages <= 1) {
      this.element.style.display = 'none';
      return;
    } else {
      this.element.style.display = 'flex';
    }

    // Add info display if enabled
    if (this.options.showInfo) {
      this.addInfoDisplay();
    }

    // Add navigation controls
    if (this.options.showPrevNext || this.options.showFirstLast || this.options.showPageNumbers) {
      this.addNavigationControls();
    }
  }

  /**
   * Adds info display showing current page range
   */
  addInfoDisplay() {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'pagination-info';
    
    const start = this.getStartIndex() + 1;
    const end = Math.min(this.getEndIndex() + 1, this.totalItems);
    
    infoDiv.textContent = this.options.infoTemplate
      .replace('{start}', start)
      .replace('{end}', end)
      .replace('{total}', this.totalItems)
      .replace('{currentPage}', this.currentPage)
      .replace('{totalPages}', this.getTotalPages());

    this.element.appendChild(infoDiv);
  }

  /**
   * Adds navigation controls
   */
  addNavigationControls() {
    const navContainer = document.createElement('div');
    navContainer.className = `pagination-nav ${this.options.displayStyle}`;
    
    // Calculate visible page range
    const totalPages = this.getTotalPages();
    const { startPage, endPage } = this.getVisiblePageRange(totalPages);

    // Add first page button
    if (this.options.showFirstLast) {
      const firstButton = this.createPageButton(1, 'First', this.currentPage === 1);
      navContainer.appendChild(firstButton);
    }

    // Add previous button
    if (this.options.showPrevNext) {
      const prevPage = Math.max(1, this.currentPage - 1);
      const prevButton = this.createPageButton(prevPage, 'Previous', this.currentPage === 1, 'prev');
      navContainer.appendChild(prevButton);
    }

    // Add page numbers if enabled
    if (this.options.showPageNumbers) {
      // Add ellipsis if needed
      if (startPage > 1) {
        const ellipsis = this.createEllipsis();
        navContainer.appendChild(ellipsis);
      }

      // Add visible page buttons
      for (let i = startPage; i <= endPage; i++) {
        const pageButton = this.createPageButton(i, i.toString(), i === this.currentPage);
        navContainer.appendChild(pageButton);
      }

      // Add ellipsis if needed
      if (endPage < totalPages) {
        const ellipsis = this.createEllipsis();
        navContainer.appendChild(ellipsis);
      }
    }

    // Add next button
    if (this.options.showPrevNext) {
      const nextPage = Math.min(totalPages, this.currentPage + 1);
      const nextButton = this.createPageButton(nextPage, 'Next', this.currentPage === totalPages, 'next');
      navContainer.appendChild(nextButton);
    }

    // Add last page button
    if (this.options.showFirstLast && totalPages > 1) {
      const lastButton = this.createPageButton(totalPages, 'Last', this.currentPage === totalPages);
      navContainer.appendChild(lastButton);
    }

    this.element.appendChild(navContainer);
  }

  /**
   * Creates a page button
   * @param {number} pageNumber - Page number
   * @param {string} text - Button text
   * @param {boolean} disabled - Whether button is disabled
   * @param {string} type - Button type ('prev', 'next', or undefined)
   * @returns {HTMLElement} Page button element
   */
  createPageButton(pageNumber, text, disabled, type) {
    const button = document.createElement(type === 'prev' || type === 'next' ? 'button' : 'a');
    
    if (type === 'prev' || type === 'next') {
      button.className = `pagination-btn pagination-${type}`;
      button.textContent = text;
    } else {
      button.className = `pagination-btn ${pageNumber === this.currentPage ? 'pagination-current' : ''}`;
      button.textContent = text;
      button.href = this.getPageUrl(pageNumber);
    }

    button.setAttribute('aria-label', type ? `${type} page` : `Page ${pageNumber}`);
    button.setAttribute('aria-current', pageNumber === this.currentPage ? 'page' : 'false');

    if (disabled) {
      button.classList.add('pagination-disabled');
      button.setAttribute('aria-disabled', 'true');
      if (type !== 'prev' && type !== 'next') {
        button.style.pointerEvents = 'none';
      }
    } else {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(pageNumber);
      });
    }

    return button;
  }

  /**
   * Creates an ellipsis element
   * @returns {HTMLElement} Ellipsis element
   */
  createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    ellipsis.setAttribute('aria-hidden', 'true');
    return ellipsis;
  }

  /**
   * Gets the total number of pages
   * @returns {number} Total number of pages
   */
  getTotalPages() {
    if (this.options.itemsPerPage <= 0) return 1;
    return Math.ceil(this.totalItems / this.options.itemsPerPage);
  }

  /**
   * Gets the visible page range
   * @param {number} totalPages - Total number of pages
   * @returns {Object} Object with startPage and endPage
   */
  getVisiblePageRange(totalPages) {
    const maxVisible = this.options.maxVisiblePages;
    let startPage, endPage;

    if (totalPages <= maxVisible) {
      // Less pages than max visible - show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // Calculate range based on current page
      const maxPagesBeforeCurrent = Math.floor(maxVisible / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisible / 2) - 1;

      if (this.currentPage <= maxPagesBeforeCurrent) {
        // Current page near the beginning
        startPage = 1;
        endPage = maxVisible;
      } else if (this.currentPage + maxPagesAfterCurrent >= totalPages) {
        // Current page near the end
        startPage = totalPages - maxVisible + 1;
        endPage = totalPages;
      } else {
        // Current page somewhere in the middle
        startPage = this.currentPage - maxPagesBeforeCurrent;
        endPage = this.currentPage + maxPagesAfterCurrent;
      }
    }

    return { startPage, endPage };
  }

  /**
   * Gets the start index for current page
   * @returns {number} Start index
   */
  getStartIndex() {
    return (this.currentPage - 1) * this.options.itemsPerPage;
  }

  /**
   * Gets the end index for current page
   * @returns {number} End index
   */
  getEndIndex() {
    return Math.min(this.getStartIndex() + this.options.itemsPerPage - 1, this.totalItems - 1);
  }

  /**
   * Gets the URL for a specific page
   * @param {number} pageNumber - Page number
   * @returns {string} Page URL
   */
  getPageUrl(pageNumber) {
    if (this.options.pageUrl === '#') {
      return `#${pageNumber}`;
    }
    return this.options.pageUrl.replace('{page}', pageNumber);
  }

  /**
   * Navigates to a specific page
   * @param {number} pageNumber - Page number to navigate to
   */
  goToPage(pageNumber) {
    const totalPages = this.getTotalPages();
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));

    if (newPage === this.currentPage) return;

    const oldPage = this.currentPage;
    this.currentPage = newPage;

    // Update UI
    this.render();

    // Execute callback if provided
    if (this.options.onPageChange) {
      this.options.onPageChange({
        currentPage: this.currentPage,
        previousPage: oldPage,
        totalPages: totalPages,
        startIndex: this.getStartIndex(),
        endIndex: this.getEndIndex()
      });
    }

    // Fetch data if callback is provided
    if (this.options.dataCallback) {
      this.fetchDataForPage(this.currentPage);
    }
  }

  /**
   * Navigates to the next page
   */
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Navigates to the previous page
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Fetches data for a specific page
   * @param {number} pageNumber - Page number to fetch data for
   */
  fetchDataForPage(pageNumber) {
    if (this.options.dataCallback) {
      const startIndex = (pageNumber - 1) * this.options.itemsPerPage;
      const endIndex = startIndex + this.options.itemsPerPage;

      this.options.dataCallback({
        page: pageNumber,
        startIndex: startIndex,
        endIndex: endIndex,
        itemsPerPage: this.options.itemsPerPage
      });
    }
  }

  /**
   * Updates the total number of items and refreshes pagination
   * @param {number} totalItems - New total number of items
   */
  updateTotalItems(totalItems) {
    this.totalItems = totalItems;
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.getTotalPages()));
    this.render();
  }

  /**
   * Updates the current page
   * @param {number} pageNumber - New current page
   */
  setCurrentPage(pageNumber) {
    this.goToPage(pageNumber);
  }

  /**
   * Updates the items per page
   * @param {number} itemsPerPage - New items per page value
   */
  setItemsPerPage(itemsPerPage) {
    this.options.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.render();
  }

  /**
   * Gets the current page number
   * @returns {number} Current page number
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * Gets the total number of items
   * @returns {number} Total number of items
   */
  getTotalItems() {
    return this.totalItems;
  }

  /**
   * Updates multiple options at once
   * @param {Object} newOptions - New options to update
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.render();
  }

  /**
   * Adds dynamic styles for the pagination
   */
  addDynamicStyles() {
    if (document.getElementById('pagination-styles')) return;

    const style = document.createElement('style');
    style.id = 'pagination-styles';
    style.textContent = `
      .pagination-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 0;
      }

      .pagination-nav {
        display: flex;
        gap: 0.25rem;
        align-items: center;
      }

      .pagination-container.minimal .pagination-nav {
        justify-content: center;
        width: 100%;
      }

      .pagination-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 0.75rem;
        min-width: 2.5rem;
        height: 2.5rem;
        text-decoration: none;
        border: 1px solid var(--border-default, #4facfe);
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
        cursor: pointer;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }

      .pagination-btn:hover:not(.pagination-disabled) {
        background: var(--bg-dark, #0a0a0a);
        border-color: var(--jazer-cyan, #00f2ea);
      }

      .pagination-btn.pagination-current {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        border-color: var(--jazer-cyan, #00f2ea);
      }

      .pagination-btn.pagination-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pagination-ellipsis {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 0.25rem;
        color: var(--text-gray, #aaa);
      }

      .pagination-info {
        color: var(--text-gray, #aaa);
        font-size: 0.9rem;
        white-space: nowrap;
      }

      @media (max-width: 768px) {
        .pagination-container {
          flex-direction: column;
          gap: 0.5rem;
        }

        .pagination-nav {
          flex-wrap: wrap;
          justify-content: center;
        }

        .pagination-btn {
          padding: 0.4rem 0.6rem;
          min-width: 2.2rem;
          height: 2.2rem;
          font-size: 0.8rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the pagination and cleans up
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * Creates a new pagination instance
 * @param {HTMLElement} container - Container element for pagination controls
 * @param {Object} options - Configuration options
 * @returns {Pagination} New pagination instance
 */
function createPagination(container, options = {}) {
  return new Pagination(container, options);
}

/**
 * Pagination utility functions for common tasks
 */
const PaginationUtils = {
  /**
   * Paginates an array of data
   * @param {Array} data - Array of data to paginate
   * @param {number} page - Page number (1-indexed)
   * @param {number} itemsPerPage - Number of items per page
   * @returns {Array} Array of items for the specified page
   */
  paginateArray(data, page, itemsPerPage) {
    if (!Array.isArray(data)) return [];
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return data.slice(startIndex, endIndex);
  },

  /**
   * Calculates pagination info
   * @param {number} totalItems - Total number of items
   * @param {number} currentPage - Current page number
   * @param {number} itemsPerPage - Number of items per page
   * @returns {Object} Pagination info object
   */
  getPaginationInfo(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      totalItems,
      itemsPerPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages
    };
  },

  /**
   * Generates page number array for display
   * @param {number} totalItems - Total number of items
   * @param {number} currentPage - Current page number
   * @param {number} itemsPerPage - Number of items per page
   * @param {number} maxVisiblePages - Maximum visible page numbers
   * @returns {Array} Array of page numbers to display
   */
  getPageNumbers(totalItems, currentPage, itemsPerPage, maxVisiblePages = 5) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return [];
    
    let startPage, endPage;
    
    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
};

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Pagination,
    createPagination,
    PaginationUtils
  };
}

// Also make it available globally
window.Pagination = Pagination;
window.createPagination = createPagination;
window.PaginationUtils = PaginationUtils;