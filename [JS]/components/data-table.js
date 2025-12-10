/**
 * Data Table Component
 * Sortable, filterable data table with pagination and search
 * Compatible with jazer-brand.css styling
 */

class DataTable {
  /**
   * Creates a new data table component
   * @param {HTMLTableElement} tableElement - The table element to enhance
   * @param {Object} options - Configuration options for the table
   */
  constructor(tableElement, options = {}) {
    this.table = tableElement;
    this.options = {
      sortable: true,
      searchable: true,
      pagination: true,
      rowsPerPage: 10,
      enableFilters: false,
      striped: true,
      hoverEffect: true,
      ...options
    };
    
    this.data = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.sortColumn = null;
    this.sortDirection = 'asc'; // 'asc' or 'desc'
    this.searchTerm = '';
    
    this.init();
  }

  /**
   * Initializes the data table component
   */
  init() {
    // Extract data from table HTML
    this.extractTableData();
    
    // Add table classes
    this.table.classList.add('data-table', 'table');
    
    // Create top controls if enabled
    if (this.options.searchable || this.options.enableFilters) {
      this.createControls();
    }
    
    // Add sorting functionality if enabled
    if (this.options.sortable) {
      this.addSorting();
    }
    
    // Add pagination if enabled
    if (this.options.pagination) {
      this.createPaginationControls();
    }
    
    // Initial render
    this.render();
  }

  /**
   * Extracts data from the existing table structure
   */
  extractTableData() {
    const rows = Array.from(this.table.querySelectorAll('tbody tr'));
    const headers = Array.from(this.table.querySelectorAll('thead th')).map(th => ({
      text: th.textContent.trim(),
      sortable: th.dataset.sortable !== 'false',
      filterable: th.dataset.filterable !== 'false',
      key: th.dataset.key || th.textContent.trim().toLowerCase().replace(/\s+/g, '-')
    }));
    
    // Extract row data
    this.data = rows.map(row => {
      const rowData = {};
      const cells = row.querySelectorAll('td');
      
      headers.forEach((header, index) => {
        if (cells[index]) {
          // Store both raw and text content for sorting/searching
          rowData[header.key] = {
            raw: cells[index].innerHTML,
            text: cells[index].textContent.trim()
          };
        }
      });
      
      return rowData;
    });
    
    this.filteredData = [...this.data];
    this.headers = headers;
  }

  /**
   * Creates controls for search, filters, etc.
   */
  createControls() {
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'table-controls';
    controlsContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      align-items: center;
    `;
    
    // Add search input if enabled
    if (this.options.searchable) {
      const searchContainer = document.createElement('div');
      searchContainer.style.cssText = `
        flex: 1 1 auto;
        min-width: 250px;
        position: relative;
      `;
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search table...';
      searchInput.className = 'search-input';
      searchInput.style.cssText = `
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 2px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--bg-card);
        color: var(--text-light);
      `;
      
      const searchIcon = document.createElement('span');
      searchIcon.innerHTML = '🔍';
      searchIcon.style.cssText = `
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-gray);
      `;
      
      searchContainer.appendChild(searchIcon);
      searchContainer.appendChild(searchInput);
      controlsContainer.appendChild(searchContainer);
      
      // Add search event listener
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterData();
      });
    }
    
    // Insert controls before the table
    this.table.parentNode.insertBefore(controlsContainer, this.table);
  }

  /**
   * Adds sorting functionality to table headers
   */
  addSorting() {
    const headerRow = this.table.querySelector('thead tr');
    if (!headerRow) return;
    
    const headers = headerRow.querySelectorAll('th');
    
    headers.forEach((header, index) => {
      if (header.dataset.sortable === 'false') return;
      
      header.style.cursor = 'pointer';
      header.style.position = 'relative';
      
      // Add sort indicator
      const sortIndicator = document.createElement('span');
      sortIndicator.className = 'sort-indicator';
      sortIndicator.style.cssText = `
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-gray);
        font-size: 0.75rem;
      `;
      sortIndicator.textContent = '↕️';
      
      header.appendChild(sortIndicator);
      
      // Add click event
      header.addEventListener('click', () => {
        this.handleSort(index);
      });
    });
  }

  /**
   * Handles column sorting
   * @param {number} columnIndex - Index of column to sort by
   */
  handleSort(columnIndex) {
    const header = this.table.querySelector('thead tr').children[columnIndex];
    const key = header.dataset.key || this.headers[columnIndex].key;
    
    if (this.sortColumn === columnIndex) {
      // Reverse sort direction if clicking same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort column and default to ascending
      this.sortColumn = columnIndex;
      this.sortDirection = 'asc';
    }
    
    // Update sort indicators
    this.updateSortIndicators(columnIndex);
    
    // Sort data
    this.sortData(key, this.sortDirection);
    
    // Reset to first page and re-render
    this.currentPage = 1;
    this.render();
  }

  /**
   * Updates sort indicators in table headers
   * @param {number} activeColumnIndex - Index of the actively sorted column
   */
  updateSortIndicators(activeColumnIndex) {
    const headers = this.table.querySelectorAll('thead th');
    headers.forEach((header, index) => {
      const indicator = header.querySelector('.sort-indicator');
      if (indicator) {
        indicator.textContent = index === activeColumnIndex ? 
          (this.sortDirection === 'asc' ? '↑' : '↓') : '↕️';
      }
    });
  }

  /**
   * Sorts the data by the specified key and direction
   * @param {string} key - Key to sort by
   * @param {string} direction - Direction to sort ('asc' or 'desc')
   */
  sortData(key, direction) {
    this.filteredData.sort((a, b) => {
      const valA = a[key]?.text || '';
      const valB = b[key]?.text || '';
      
      // For numeric values, compare as numbers
      const numA = parseFloat(valA.replace(/[^\d.-]/g, ''));
      const numB = parseFloat(valB.replace(/[^\d.-]/g, ''));
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === 'asc' ? numA - numB : numB - numA;
      }
      
      // For other values, compare as strings
      const comparison = valA.localeCompare(valB, undefined, { numeric: true });
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Applies filters to the data
   */
  filterData() {
    if (!this.searchTerm) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row => {
        return Object.values(row).some(cell => 
          cell.text.toLowerCase().includes(this.searchTerm)
        );
      });
    }
    
    // Update pagination info
    this.calculatePagination();
    
    // Reset to first page and re-render
    this.currentPage = 1;
    this.render();
  }

  /**
   * Calculates pagination information
   */
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredData.length / this.options.rowsPerPage);
  }

  /**
   * Creates pagination controls
   */
  createPaginationControls() {
    this.paginationContainer = document.createElement('div');
    this.paginationContainer.className = 'table-pagination';
    this.paginationContainer.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
    `;
    
    // Insert after the table
    this.table.parentNode.insertBefore(this.paginationContainer, this.table.nextSibling);
    
    this.renderPagination();
  }

  /**
   * Renders pagination controls
   */
  renderPagination() {
    if (!this.options.pagination || !this.paginationContainer) return;
    
    this.calculatePagination();
    
    this.paginationContainer.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '‹ Prev';
    prevButton.className = 'btn btn-sm';
    prevButton.disabled = this.currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.setCurrentPage(this.currentPage - 1);
      }
    });
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next ›';
    nextButton.className = 'btn btn-sm';
    nextButton.disabled = this.currentPage >= this.totalPages;
    nextButton.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.setCurrentPage(this.currentPage + 1);
      }
    });
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    pageInfo.className = 'page-info';
    pageInfo.style.cssText = `
      margin: 0 1rem;
      padding: 0 1rem;
      color: var(--text-gray);
    `;
    
    // Page size selector
    const pageSizeSelect = document.createElement('select');
    pageSizeSelect.className = 'page-size-select';
    pageSizeSelect.style.cssText = `
      margin: 0 1rem;
      padding: 0.25rem 0.5rem;
      border: 2px solid var(--border-default);
      border-radius: var(--radius-sm);
      background: var(--bg-card);
      color: var(--text-light);
    `;
    
    [5, 10, 25, 50].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      option.selected = size === this.options.rowsPerPage;
      pageSizeSelect.appendChild(option);
    });
    
    pageSizeSelect.addEventListener('change', (e) => {
      this.options.rowsPerPage = parseInt(e.target.value);
      this.currentPage = 1; // Reset to first page
      this.render();
    });
    
    // Page navigation
    const pageNav = document.createElement('div');
    pageNav.className = 'page-navigation';
    pageNav.style.cssText = `
      display: flex;
      gap: 0.25rem;
      margin: 0 1rem;
    `;
    
    // Add pagination buttons with ellipsis support
    this.addPaginationButtons(pageNav);
    
    // Assemble pagination
    this.paginationContainer.appendChild(prevButton);
    this.paginationContainer.appendChild(pageInfo);
    this.paginationContainer.appendChild(pageSizeSelect);
    this.paginationContainer.appendChild(pageNav);
    this.paginationContainer.appendChild(nextButton);
  }

  /**
   * Adds page number buttons to the navigation
   * @param {HTMLElement} container - Container to add buttons to
   */
  addPaginationButtons(container) {
    const maxVisiblePages = 5;
    let startPage, endPage;
    
    if (this.totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      // Calculate visible page range around current page
      const halfRange = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(1, this.currentPage - halfRange);
      endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust range if it extends beyond total pages
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // First page button
    if (startPage > 1) {
      const firstBtn = this.createPageButton(1);
      container.appendChild(firstBtn);
      
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.cssText = 'padding: 0.25rem 0.5rem; color: var(--text-gray);';
        container.appendChild(ellipsis);
      }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageNumBtn = this.createPageButton(i);
      container.appendChild(pageNumBtn);
    }
    
    // Last page button
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.cssText = 'padding: 0.25rem 0.5rem; color: var(--text-gray);';
        container.appendChild(ellipsis);
      }
      
      const lastBtn = this.createPageButton(this.totalPages);
      container.appendChild(lastBtn);
    }
  }

  /**
   * Creates a page button
   * @param {number} pageNum - Page number
   * @returns {HTMLButtonElement} Created button element
   */
  createPageButton(pageNum) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `btn ${pageNum === this.currentPage ? 'btn-primary' : 'btn-outline'} btn-sm`;
    pageBtn.textContent = pageNum;
    pageBtn.addEventListener('click', () => {
      this.setCurrentPage(pageNum);
    });
    
    return pageBtn;
  }

  /**
   * Sets the current page and re-renders
   * @param {number} page - Page number to set
   */
  setCurrentPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.render();
      this.renderPagination(); // Update pagination controls after page change
    }
  }

  /**
   * Renders the table with current filtered and sorted data
   */
  render() {
    if (!this.table) return;
    
    // Calculate start and end indexes for current page
    const startIndex = (this.currentPage - 1) * this.options.rowsPerPage;
    const endIndex = Math.min(startIndex + this.options.rowsPerPage, this.filteredData.length);
    const currentData = this.filteredData.slice(startIndex, endIndex);
    
    // Clear existing tbody content
    const tbody = this.table.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
    } else {
      // If tbody doesn't exist, create one
      const newTbody = document.createElement('tbody');
      this.table.appendChild(newTbody);
    }
    
    // Add rows to tbody
    currentData.forEach((rowData, index) => {
      const row = document.createElement('tr');
      row.style.cssText = `
        transition: background-color 0.2s ease;
      `;
      
      if (this.options.striped && index % 2 === 1) {
        row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }
      
      if (this.options.hoverEffect) {
        row.addEventListener('mouseenter', () => {
          row.style.backgroundColor = 'rgba(0, 242, 234, 0.1)';
        });
        
        row.addEventListener('mouseleave', () => {
          if (!this.options.striped || index % 2 === 1) {
            row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          } else {
            row.style.backgroundColor = 'transparent';
          }
        });
      }
      
      // Add cells for each header
      this.headers.forEach(header => {
        const cell = document.createElement('td');
        cell.innerHTML = rowData[header.key]?.raw || '';
        row.appendChild(cell);
      });
      
      // Add to tbody
      tbody.appendChild(row);
    });
    
    // Update status message showing current range
    this.updateStatusMessage(startIndex, endIndex, this.filteredData.length);
  }

  /**
   * Updates the status message showing current data range
   * @param {number} startIndex - Start index of current page
   * @param {number} endIndex - End index of current page
   * @param {number} totalCount - Total number of records
   */
  updateStatusMessage(startIndex, endIndex, totalCount) {
    if (!this.statusContainer) {
      this.statusContainer = document.createElement('div');
      this.statusContainer.className = 'table-status';
      this.statusContainer.style.cssText = `
        text-align: center;
        margin-top: 1rem;
        color: var(--text-gray);
        font-size: 0.9rem;
      `;
      
      // Insert below pagination controls
      if (this.paginationContainer) {
        this.paginationContainer.parentNode.insertBefore(this.statusContainer, this.paginationContainer.nextSibling);
      } else {
        this.table.parentNode.insertBefore(this.statusContainer, this.table.nextSibling);
      }
    }
    
    this.statusContainer.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalCount} results`;
  }

  /**
   * Refreshes the table data (useful if data was externally modified)
   */
  refresh() {
    this.extractTableData();
    this.filterData(); // This will also trigger render and pagination update
  }

  /**
   * Updates the data table with new data
   * @param {Array} newData - New data to use for the table
   * @param {Array} headers - Headers for the new data
   */
  updateData(newData, headers) {
    if (headers) {
      this.headers = headers;
    }
    
    this.data = newData.map(row => {
      const obj = {};
      if (Array.isArray(headers)) {
        headers.forEach((header, index) => {
          obj[header.key] = {
            raw: row[index],
            text: String(row[index])
          };
        });
      }
      return obj;
    });
    
    this.filterData(); // This will also trigger render and pagination update
  }
}

/**
 * Initializes all data tables on the page
 * @param {HTMLElement|Document} container - Container to search for tables
 * @returns {Array<DataTable>} Array of initialized data table instances
 */
function initDataTables(container = document) {
  const tables = container.querySelectorAll('table[data-table], .data-table, [data-datatable]');
  const instances = [];
  
  tables.forEach(table => {
    if (!table.hasAttribute('data-table-initialized')) {
      table.setAttribute('data-table-initialized', 'true');
      
      // Get options from data attributes
      const options = {
        sortable: table.dataset.sortable !== 'false',
        searchable: table.dataset.searchable !== 'false',
        pagination: table.dataset.pagination !== 'false',
        rowsPerPage: parseInt(table.dataset.rowsPerPage) || 10,
        striped: table.dataset.striped !== 'false',
        hoverEffect: table.dataset.hoverEffect !== 'false'
      };
      
      const instance = new DataTable(table, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize data tables when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initDataTables();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataTable, initDataTables };
}

// Also make it available globally
window.DataTable = DataTable;
window.initDataTables = initDataTables;