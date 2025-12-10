/**
 * Multi Select Component
 * Enhanced multi-select dropdown with search and customization options
 * Compatible with jazer-brand.css styling
 */

class MultiSelect {
  /**
   * Creates a new multi-select component
   * @param {HTMLElement} selectElement - The original select element to enhance
   * @param {Object} options - Configuration options
   */
  constructor(selectElement, options = {}) {
    this.originalSelect = selectElement;
    this.options = {
      placeholder: 'Select options...',
      maxSelections: null, // null means unlimited
      searchable: true,
      allowNewOptions: false,
      caseSensitiveSearch: false,
      showSelectedCount: true,
      enableSelectAll: false,
      closeOnSelect: false,
      animationDuration: 200,
      ...options
    };

    this.selectedOptions = new Set();
    this.isVisible = false;
    this.searchQuery = '';
    this.dropdown = null;
    this.searchInput = null;
    this.selectedDisplay = null;
    this.optionsList = null;

    this.init();
  }

  /**
   * Initializes the multi-select
   */
  init() {
    // Hide the original select element
    this.originalSelect.style.display = 'none';
    
    // Set up the multi-select structure
    this.setupMultiSelect();

    // Bind events
    this.bindEvents();

    // Load initial selected options
    this.loadInitialSelections();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the multi-select structure
   */
  setupMultiSelect() {
    // Create container
    this.container = document.createElement('div');
    this.container.classList.add('multi-select-container');
    this.container.setAttribute('role', 'combobox');
    this.container.setAttribute('aria-haspopup', 'listbox');
    this.container.setAttribute('aria-expanded', 'false');
    
    // Create the selected display area
    this.selectedDisplay = document.createElement('div');
    this.selectedDisplay.classList.add('multi-select-selected');
    this.selectedDisplay.setAttribute('tabindex', '0');
    this.selectedDisplay.setAttribute('aria-label', 'Multi-select input');
    
    // Add placeholder initially
    this.placeholderElement = document.createElement('span');
    this.placeholderElement.classList.add('multi-select-placeholder');
    this.placeholderElement.textContent = this.options.placeholder;
    this.selectedDisplay.appendChild(this.placeholderElement);
    
    // Create dropdown arrow
    this.arrow = document.createElement('span');
    this.arrow.classList.add('multi-select-arrow');
    this.arrow.innerHTML = '▼';
    this.selectedDisplay.appendChild(this.arrow);
    
    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.classList.add('multi-select-dropdown');
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.setAttribute('aria-label', 'Selection options');
    this.dropdown.style.display = 'none';
    
    // Create search input if enabled
    if (this.options.searchable) {
      this.searchInput = document.createElement('input');
      this.searchInput.type = 'text';
      this.searchInput.classList.add('multi-select-search');
      this.searchInput.placeholder = 'Search...';
      this.searchInput.setAttribute('aria-label', 'Search options');
      this.dropdown.appendChild(this.searchInput);
    }
    
    // Create options list container
    this.optionsList = document.createElement('div');
    this.optionsList.classList.add('multi-select-options');
    this.dropdown.appendChild(this.optionsList);
    
    // Add elements to container
    this.container.appendChild(this.selectedDisplay);
    this.container.appendChild(this.dropdown);
    
    // Insert container after original select
    this.originalSelect.parentNode.insertBefore(this.container, this.originalSelect.nextSibling);
    
    // Create select all option if enabled
    if (this.options.enableSelectAll) {
      this.selectAllOption = document.createElement('div');
      this.selectAllOption.classList.add('multi-select-option', 'multi-select-select-all');
      this.selectAllOption.setAttribute('role', 'option');
      this.selectAllOption.setAttribute('tabindex', '-1');
      this.selectAllOption.textContent = 'Select All';
      this.selectAllOption.addEventListener('click', () => this.toggleSelectAll());
    }
    
    // Create options from original select
    this.createOptionsFromOriginal();
  }

  /**
   * Creates options from the original select element
   */
  createOptionsFromOriginal() {
    // Clear existing options
    this.optionsList.innerHTML = '';
    
    // Add select all option if enabled
    if (this.options.enableSelectAll) {
      this.optionsList.appendChild(this.selectAllOption);
    }
    
    // Create options from original select options
    Array.from(this.originalSelect.options).forEach((option, index) => {
      this.addOption(option.text, option.value, option.disabled);
    });
  }

  /**
   * Adds an option to the multi-select
   * @param {string} text - Option text
   * @param {string} value - Option value
   * @param {boolean} disabled - Whether the option is disabled
   */
  addOption(text, value, disabled = false) {
    const optionElement = document.createElement('div');
    optionElement.classList.add('multi-select-option');
    optionElement.setAttribute('role', 'option');
    optionElement.setAttribute('tabindex', disabled ? '-1' : '0');
    optionElement.setAttribute('data-value', value);
    optionElement.setAttribute('data-text', text);
    
    if (disabled) {
      optionElement.classList.add('multi-select-option-disabled');
      optionElement.setAttribute('aria-disabled', 'true');
    }
    
    // Create option content
    const checkbox = document.createElement('span');
    checkbox.classList.add('multi-select-checkbox');
    checkbox.innerHTML = '☐';
    
    const label = document.createElement('span');
    label.classList.add('multi-select-label');
    label.textContent = text;
    
    optionElement.appendChild(checkbox);
    optionElement.appendChild(label);
    
    // Add click event
    optionElement.addEventListener('click', () => {
      if (!disabled) {
        this.toggleOption(value);
      }
    });
    
    // Add keyboard events
    optionElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          this.toggleOption(value);
        }
      }
    });
    
    // Add to options list
    this.optionsList.appendChild(optionElement);
  }

  /**
   * Binds events for the multi-select
   */
  bindEvents() {
    // Toggle dropdown on selected display click
    this.selectedDisplay.addEventListener('click', () => {
      this.toggleDropdown();
    });
    
    // Keyboard events for the selected display
    this.selectedDisplay.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          this.showDropdown();
          break;
        case 'Escape':
        case 'Esc':
          this.hideDropdown();
          break;
      }
    });
    
    // Search input events
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.filterOptions();
      });
      
      // Keyboard navigation for search
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideDropdown();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.focusFirstOption();
        }
      });
    }
    
    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }

  /**
   * Loads initial selections from the original select element
   */
  loadInitialSelections() {
    Array.from(this.originalSelect.selectedOptions).forEach(option => {
      this.selectedOptions.add(option.value);
      this.updateOptionSelection(option.value, true);
    });
    
    this.updateSelectedDisplay();
  }

  /**
   * Shows the dropdown
   */
  showDropdown() {
    this.dropdown.style.display = 'block';
    this.isVisible = true;
    this.container.setAttribute('aria-expanded', 'true');
    
    if (this.searchInput) {
      this.searchInput.focus();
    } else {
      this.focusFirstOption();
    }
    
    // Filter options based on current search
    this.filterOptions();
  }

  /**
   * Hides the dropdown
   */
  hideDropdown() {
    this.dropdown.style.display = 'none';
    this.isVisible = false;
    this.container.setAttribute('aria-expanded', 'false');
    this.searchQuery = '';
    
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    
    // Show all options when hiding
    this.showAllOptions();
  }

  /**
   * Toggles the dropdown visibility
   */
  toggleDropdown() {
    if (this.isVisible) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  /**
   * Toggles an option's selection state
   * @param {string} value - Option value to toggle
   */
  toggleOption(value) {
    if (this.selectedOptions.has(value)) {
      this.deselectOption(value);
    } else {
      this.selectOption(value);
    }
    
    // Update original select element
    this.updateOriginalSelect();
    
    // Update selected display
    this.updateSelectedDisplay();
    
    // Hide dropdown if closeOnSelect is enabled
    if (this.options.closeOnSelect) {
      this.hideDropdown();
    }
    
    // Trigger change event
    this.originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Selects an option
   * @param {string} value - Option value to select
   */
  selectOption(value) {
    // Check max selections
    if (this.options.maxSelections && this.selectedOptions.size >= this.options.maxSelections) {
      return;
    }
    
    this.selectedOptions.add(value);
    this.updateOptionSelection(value, true);
    
    // Update select all state
    this.updateSelectAllState();
  }

  /**
   * Deselects an option
   * @param {string} value - Option value to deselect
   */
  deselectOption(value) {
    this.selectedOptions.delete(value);
    this.updateOptionSelection(value, false);
    
    // Ensure select all is deselected
    if (this.selectAllOption) {
      this.selectAllOption.classList.remove('multi-select-option-selected');
    }
  }

  /**
   * Updates the selection state of an option in the UI
   * @param {string} value - Option value
   * @param {boolean} isSelected - Whether the option is selected
   */
  updateOptionSelection(value, isSelected) {
    const optionElement = this.dropdown.querySelector(`.multi-select-option[data-value="${value}"]`);
    if (!optionElement) return;
    
    const checkbox = optionElement.querySelector('.multi-select-checkbox');
    
    if (isSelected) {
      optionElement.classList.add('multi-select-option-selected');
      checkbox.innerHTML = '☑';
    } else {
      optionElement.classList.remove('multi-select-option-selected');
      checkbox.innerHTML = '☐';
    }
  }

  /**
   * Updates the display of selected options
   */
  updateSelectedDisplay() {
    // Clear current display
    this.selectedDisplay.innerHTML = '';
    
    // Add selected options as tags if any are selected
    if (this.selectedOptions.size > 0) {
      this.selectedOptions.forEach(value => {
        const optionText = this.originalSelect.querySelector(`option[value="${value}"]`)?.text || value;
        
        const tag = document.createElement('span');
        tag.classList.add('multi-select-tag');
        tag.textContent = optionText;
        
        const removeBtn = document.createElement('span');
        removeBtn.classList.add('multi-select-tag-remove');
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deselectOption(value);
          this.updateSelectedDisplay();
          this.updateOriginalSelect();
          this.originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        tag.appendChild(removeBtn);
        this.selectedDisplay.appendChild(tag);
      });
      
      // Add back the arrow
      this.selectedDisplay.appendChild(this.arrow);
    } else {
      // Show placeholder if no options selected
      this.selectedDisplay.appendChild(this.placeholderElement);
      this.selectedDisplay.appendChild(this.arrow);
    }
    
    // Show count if enabled
    if (this.options.showSelectedCount) {
      const countElement = document.createElement('span');
      countElement.classList.add('multi-select-count');
      countElement.textContent = `(${this.selectedOptions.size})`;
      this.selectedDisplay.appendChild(countElement);
    }
  }

  /**
   * Updates the original select element with current selections
   */
  updateOriginalSelect() {
    Array.from(this.originalSelect.options).forEach(option => {
      option.selected = this.selectedOptions.has(option.value);
    });
  }

  /**
   * Filters options based on search query
   */
  filterOptions() {
    const options = this.dropdown.querySelectorAll('.multi-select-option:not(.multi-select-select-all)');
    const query = this.options.caseSensitiveSearch ? this.searchQuery : this.searchQuery.toLowerCase();
    
    options.forEach(option => {
      const text = this.options.caseSensitiveSearch 
        ? option.getAttribute('data-text') 
        : option.getAttribute('data-text').toLowerCase();
      
      const value = this.options.caseSensitiveSearch 
        ? option.getAttribute('data-value') 
        : option.getAttribute('data-value').toLowerCase();
      
      const isVisible = text.includes(query) || value.includes(query);
      option.style.display = isVisible ? 'flex' : 'none';
    });
  }

  /**
   * Shows all options (removes filter)
   */
  showAllOptions() {
    const options = this.dropdown.querySelectorAll('.multi-select-option');
    options.forEach(option => {
      option.style.display = 'flex';
    });
  }

  /**
   * Focuses the first option in the dropdown
   */
  focusFirstOption() {
    const firstOption = this.dropdown.querySelector('.multi-select-option:not([style*="display: none"])');
    if (firstOption) {
      firstOption.focus();
    }
  }

  /**
   * Gets all selected values
   * @returns {Array} Array of selected values
   */
  getSelectedValues() {
    return Array.from(this.selectedOptions);
  }

  /**
   * Sets selected values
   * @param {Array} values - Array of values to select
   */
  setSelectedValues(values) {
    // Clear current selections
    this.selectedOptions.clear();
    
    // Select new values
    values.forEach(value => {
      if (this.optionExists(value)) {
        this.selectedOptions.add(value);
      }
    });
    
    // Update UI
    this.updateUIAfterSelectionChange();
  }

  /**
   * Checks if an option exists
   * @param {string} value - Option value
   * @returns {boolean} Whether the option exists
   */
  optionExists(value) {
    return !!this.originalSelect.querySelector(`option[value="${value}"]`);
  }

  /**
   * Updates UI after selection change
   */
  updateUIAfterSelectionChange() {
    // Update option selections in UI
    const allOptions = this.dropdown.querySelectorAll('.multi-select-option');
    allOptions.forEach(option => {
      const value = option.getAttribute('data-value');
      const isSelected = this.selectedOptions.has(value);
      this.updateOptionSelection(value, isSelected);
    });
    
    // Update selected display
    this.updateSelectedDisplay();
    
    // Update original select
    this.updateOriginalSelect();
    
    // Update select all state
    this.updateSelectAllState();
  }

  /**
   * Clears all selections
   */
  clearSelections() {
    this.selectedOptions.clear();
    this.updateUIAfterSelectionChange();
    
    // Update original select
    this.updateOriginalSelect();
    
    // Trigger change event
    this.originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Toggles select all options
   */
  toggleSelectAll() {
    const allValues = Array.from(this.originalSelect.options)
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    if (this.isAllSelected()) {
      // Deselect all
      this.clearSelections();
    } else {
      // Select all (considering max selections)
      if (this.options.maxSelections && allValues.length > this.options.maxSelections) {
        allValues.length = this.options.maxSelections;
      }
      
      this.selectedOptions = new Set(allValues);
      this.updateUIAfterSelectionChange();
    }
    
    // Trigger change event
    this.originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Checks if all options are selected
   * @returns {boolean} Whether all options are selected
   */
  isAllSelected() {
    const availableOptions = Array.from(this.originalSelect.options)
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    if (this.selectedOptions.size !== availableOptions.length) {
      return false;
    }
    
    return availableOptions.every(value => this.selectedOptions.has(value));
  }

  /**
   * Updates the select all option state
   */
  updateSelectAllState() {
    if (!this.selectAllOption) return;
    
    const isAllSelected = this.isAllSelected();
    const someSelected = this.selectedOptions.size > 0;
    
    // Update select all option appearance
    this.selectAllOption.classList.toggle('multi-select-option-selected', isAllSelected);
    this.selectAllOption.querySelector('.multi-select-checkbox').innerHTML = isAllSelected ? '☑' : someSelected ? '☑' : '☐';
  }

  /**
   * Disables the multi-select
   */
  disable() {
    this.selectedDisplay.classList.add('multi-select-disabled');
    this.selectedDisplay.setAttribute('aria-disabled', 'true');
  }

  /**
   * Enables the multi-select
   */
  enable() {
    this.selectedDisplay.classList.remove('multi-select-disabled');
    this.selectedDisplay.setAttribute('aria-disabled', 'false');
  }

  /**
   * Updates the placeholder text
   * @param {string} placeholder - New placeholder text
   */
  setPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    if (this.selectedOptions.size === 0) {
      this.placeholderElement.textContent = placeholder;
    }
  }

  /**
   * Gets the number of selected options
   * @returns {number} Number of selected options
   */
  getSelectionCount() {
    return this.selectedOptions.size;
  }

  /**
   * Adds dynamic styles for the multi-select
   */
  addDynamicStyles() {
    if (document.getElementById('multi-select-styles')) return;

    const style = document.createElement('style');
    style.id = 'multi-select-styles';
    style.textContent = `
      .multi-select-container {
        position: relative;
        width: 100%;
        max-width: 100%;
      }
      
      .multi-select-selected {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: 8px 12px;
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 6px;
        background: var(--bg-darker, #111);
        min-height: 40px;
        cursor: pointer;
        position: relative;
        gap: 5px;
      }
      
      .multi-select-selected:focus {
        outline: none;
        border-color: var(--jazer-cyan, #00f2ea);
      }
      
      .multi-select-placeholder {
        color: var(--text-gray, #aaa);
        flex: 1;
      }
      
      .multi-select-tag {
        display: inline-flex;
        align-items: center;
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.9em;
      }
      
      .multi-select-tag-remove {
        margin-left: 5px;
        cursor: pointer;
        font-weight: bold;
      }
      
      .multi-select-count {
        margin-left: auto;
        color: var(--text-gray, #aaa);
        font-size: 0.9em;
      }
      
      .multi-select-arrow {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-gray, #aaa);
      }
      
      .multi-select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-darker, #111);
        border: 2px solid var(--border-default, #4facfe);
        border-top: none;
        border-radius: 0 0 6px 6px;
        z-index: 1000;
        max-height: 250px;
        overflow-y: auto;
        margin-top: -2px;
      }
      
      .multi-select-search {
        width: 100%;
        padding: 10px;
        border: none;
        background: var(--bg-dark, #0a0a0a);
        color: var(--text-light, #fff);
        border-bottom: 1px solid var(--border-lighter, #222);
      }
      
      .multi-select-search:focus {
        outline: none;
      }
      
      .multi-select-options {
        padding: 5px 0;
      }
      
      .multi-select-option {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--border-lighter, #222);
        transition: background-color 0.2s ease;
      }
      
      .multi-select-option:last-child {
        border-bottom: none;
      }
      
      .multi-select-option:hover:not(.multi-select-option-disabled) {
        background: var(--bg-dark, #0a0a0a);
      }
      
      .multi-select-option-selected {
        background: var(--bg-dark, #0a0a0a);
      }
      
      .multi-select-option-disabled {
        color: var(--text-gray, #666);
        cursor: not-allowed;
      }
      
      .multi-select-checkbox {
        margin-right: 10px;
        font-size: 0.8em;
      }
      
      .multi-select-label {
        flex: 1;
      }
      
      .multi-select-select-all {
        font-weight: bold;
        background: var(--bg-dark, #0a0a0a);
      }
      
      .multi-select-disabled {
        background: var(--bg-darkest, #0a0a0a);
        color: var(--text-gray, #666);
        cursor: not-allowed;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the multi-select and cleans up
   */
  destroy() {
    // Remove event listeners would normally be done here
    // For simplicity in this implementation, we'll just remove the container
    
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Show original select element
    this.originalSelect.style.display = 'inline-block';
  }
}

/**
 * Initializes all multi-selects on the page
 * @param {HTMLElement|Document} container - Container to search for multi-selects
 * @returns {Array<MultiSelect>} Array of initialized multi-select instances
 */
function initMultiSelects(container = document) {
  const selects = container.querySelectorAll('select[multiple], select[data-multi-select]');
  const instances = [];

  selects.forEach(select => {
    if (!select.hasAttribute('data-multi-select-initialized')) {
      select.setAttribute('data-multi-select-initialized', 'true');

      // Get options from data attributes
      const options = {
        placeholder: select.dataset.placeholder || 'Select options...',
        maxSelections: select.dataset.maxSelections ? parseInt(select.dataset.maxSelections) : null,
        searchable: select.dataset.searchable !== 'false',
        allowNewOptions: select.dataset.allowNewOptions === 'true',
        caseSensitiveSearch: select.dataset.caseSensitiveSearch === 'true',
        showSelectedCount: select.dataset.showSelectedCount !== 'false',
        enableSelectAll: select.dataset.enableSelectAll === 'true',
        closeOnSelect: select.dataset.closeOnSelect === 'true',
        animationDuration: parseInt(select.dataset.animationDuration) || 200
      };

      const instance = new MultiSelect(select, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize multi-selects when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initMultiSelects();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MultiSelect, initMultiSelects };
}

// Also make it available globally
window.MultiSelect = MultiSelect;
window.initMultiSelects = initMultiSelects;