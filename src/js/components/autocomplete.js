/**
 * AutoComplete Component
 * Intelligent search suggestions with keyboard navigation
 * Compatible with jazer-brand.css styling
 */

class AutoComplete {
  /**
   * Creates a new autocomplete component
   * @param {HTMLInputElement} inputElement - Input element to attach autocomplete to
   * @param {Array|Function} dataSource - Array of suggestions or function returning promise
   * @param {Object} options - Configuration options
   */
  constructor(inputElement, dataSource, options = {}) {
    this.input = inputElement;
    this.dataSource = dataSource;
    this.options = {
      minChars: 2,
      maxSuggestions: 8,
      debounceTime: 300,
      highlightMatches: true,
      allowCustomValues: true,
      caseSensitive: false,
      ...options
    };
    
    this.suggestions = [];
    this.filteredSuggestions = [];
    this.isOpen = false;
    this.selectedIndex = -1;
    this.debounceTimer = null;
    
    this.init();
  }

  /**
   * Initializes the autocomplete component
   */
  init() {
    // Add necessary attributes
    this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-expanded', 'false');
    
    // Generate ID for the dropdown if not present
    if (!this.input.id) {
      this.input.id = `autocomplete-${Date.now()}`;
    }
    
    // Create suggestions dropdown
    this.createDropdown();
    
    // Bind events
    this.bindEvents();
  }

  /**
   * Creates the suggestions dropdown
   */
  createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'autocomplete-dropdown';
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.setAttribute('aria-labelledby', this.input.id);
    this.dropdown.style.cssText = `
      position: absolute;
      background: var(--bg-dark);
      border: 2px solid var(--border-cyan);
      border-radius: var(--radius-lg);
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      min-width: ${this.input.offsetWidth}px;
      margin-top: 0.5rem;
      box-shadow: var(--shadow-card);
      backdrop-filter: blur(10px);
    `;
    
    // Insert after the input element
    this.input.parentNode.insertBefore(this.dropdown, this.input.nextSibling);
  }

  /**
   * Binds event listeners
   */
  bindEvents() {
    // Input events
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
    
    // Document click to close dropdown
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }

  /**
   * Handles input events with debouncing
   */
  handleInput(e) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      const query = e.target.value;
      if (query.length >= this.options.minChars) {
        this.search(query);
      } else {
        this.closeDropdown();
      }
    }, this.options.debounceTime);
  }

  /**
   * Searches for suggestions based on query
   * @param {string} query - Search query
   */
  async search(query) {
    try {
      if (Array.isArray(this.dataSource)) {
        // Filter static data source
        const lowerQuery = this.options.caseSensitive ? query : query.toLowerCase();
        this.filteredSuggestions = this.dataSource.filter(item => {
          const text = typeof item === 'string' ? item : item.label || item.name || item.value;
          const lowerText = this.options.caseSensitive ? text : text.toLowerCase();
          return lowerText.includes(lowerQuery);
        }).slice(0, this.options.maxSuggestions);
      } else if (typeof this.dataSource === 'function') {
        // Call async data source function
        this.filteredSuggestions = await this.dataSource(query);
        this.filteredSuggestions = this.filteredSuggestions.slice(0, this.options.maxSuggestions);
      } else {
        throw new Error('Invalid data source: must be array or function');
      }
      
      this.renderSuggestions();
      this.openDropdown();
    } catch (error) {
      console.error('AutoComplete search error:', error);
    }
  }

  /**
   * Renders the suggestions in the dropdown
   */
  renderSuggestions() {
    this.dropdown.innerHTML = '';
    
    if (this.filteredSuggestions.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'autocomplete-no-results';
      noResults.textContent = 'No matches found';
      noResults.style.cssText = `
        padding: 1rem;
        color: var(--text-muted);
        text-align: center;
        font-style: italic;
      `;
      this.dropdown.appendChild(noResults);
      return;
    }
    
    this.filteredSuggestions.forEach((item, index) => {
      const suggestionItem = document.createElement('div');
      suggestionItem.className = 'autocomplete-suggestion';
      suggestionItem.setAttribute('role', 'option');
      suggestionItem.setAttribute('id', `autocomplete-option-${this.input.id}-${index}`);
      suggestionItem.style.cssText = `
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid var(--border-default);
      `;
      
      const text = typeof item === 'string' ? item : item.label || item.name || item.value;
      
      if (this.options.highlightMatches && this.input.value) {
        suggestionItem.innerHTML = this.highlightMatch(text, this.input.value);
      } else {
        suggestionItem.textContent = text;
      }
      
      // Hover effects
      suggestionItem.addEventListener('mouseenter', () => {
        this.selectSuggestion(index);
      });
      
      // Click event
      suggestionItem.addEventListener('click', () => {
        this.selectSuggestionByIndex(index);
      });
      
      this.dropdown.appendChild(suggestionItem);
    });
  }

  /**
   * Highlights matching text within the suggestion
   * @param {string} text - Full text
   * @param {string} query - Query to highlight
   * @returns {string} HTML with highlighted matches
   */
  highlightMatch(text, query) {
    const lowerText = this.options.caseSensitive ? text : text.toLowerCase();
    const lowerQuery = this.options.caseSensitive ? query : query.toLowerCase();
    
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return `${before}<strong style="color: var(--jazer-cyan);">${match}</strong>${after}`;
  }

  /**
   * Handles keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    if (!this.isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.navigateNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigatePrevious();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectSuggestionByIndex(this.selectedIndex);
        } else {
          this.closeDropdown();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.closeDropdown();
        break;
      case 'Tab':
        this.closeDropdown();
        break;
    }
  }

  /**
   * Navigates to the next suggestion
   */
  navigateNext() {
    if (this.selectedIndex < this.filteredSuggestions.length - 1) {
      this.selectSuggestion(this.selectedIndex + 1);
    } else if (this.options.loopNavigation) {
      this.selectSuggestion(0);
    }
  }

  /**
   * Navigates to the previous suggestion
   */
  navigatePrevious() {
    if (this.selectedIndex > 0) {
      this.selectSuggestion(this.selectedIndex - 1);
    } else if (this.options.loopNavigation) {
      this.selectSuggestion(this.filteredSuggestions.length - 1);
    }
  }

  /**
   * Selects a suggestion by index
   * @param {number} index - Index of the suggestion to select
   */
  selectSuggestionByIndex(index) {
    if (index < 0 || index >= this.filteredSuggestions.length) return;
    
    const item = this.filteredSuggestions[index];
    const value = typeof item === 'string' ? item : item.value || item.label || item.name;
    
    this.input.value = value;
    this.input.setAttribute('aria-activedescendant', `autocomplete-option-${this.input.id}-${index}`);
    
    // Trigger input event to notify any listeners
    const inputEvent = new Event('input', { bubbles: true });
    this.input.dispatchEvent(inputEvent);
    
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    this.input.dispatchEvent(changeEvent);
    
    this.closeDropdown();
    
    // Focus input after selection
    this.input.focus();
    
    // Call selection callback if provided
    if (this.options.onSelect) {
      this.options.onSelect(item, this.input);
    }
  }

  /**
   * Selects a suggestion (highlights it without confirming)
   * @param {number} index - Index of the suggestion to select
   */
  selectSuggestion(index) {
    const suggestions = this.dropdown.querySelectorAll('.autocomplete-suggestion');
    
    // Deselect current
    if (this.selectedIndex >= 0 && suggestions[this.selectedIndex]) {
      suggestions[this.selectedIndex].style.background = 'none';
    }
    
    // Select new
    if (index >= 0 && index < suggestions.length) {
      this.selectedIndex = index;
      suggestions[index].style.background = 'rgb(0 242 234 / 10%)';
      suggestions[index].style.borderLeft = '3px solid var(--jazer-cyan)';
      
      // Update ARIA
      this.input.setAttribute('aria-activedescendant', `autocomplete-option-${this.input.id}-${index}`);
      
      // Scroll to selected item if needed
      suggestions[index].scrollIntoView({ block: 'nearest' });
    } else {
      this.selectedIndex = -1;
      this.input.removeAttribute('aria-activedescendant');
    }
  }

  /**
   * Opens the suggestions dropdown
   */
  openDropdown() {
    if (this.isOpen) return;
    
    this.dropdown.style.display = 'block';
    this.input.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
    
    // Position dropdown
    this.positionDropdown();
  }

  /**
   * Closes the suggestions dropdown
   */
  closeDropdown() {
    if (!this.isOpen) return;
    
    this.dropdown.style.display = 'none';
    this.input.setAttribute('aria-expanded', 'false');
    this.input.removeAttribute('aria-activedescendant');
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  /**
   * Positions the dropdown relative to the input
   */
  positionDropdown() {
    const inputRect = this.input.getBoundingClientRect();
    const dropdownRect = this.dropdown.getBoundingClientRect();
    
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    this.dropdown.style.top = `${inputRect.bottom + scrollY}px`;
    this.dropdown.style.left = `${inputRect.left + scrollX}px`;
    this.dropdown.style.minWidth = `${inputRect.width}px`;
  }

  /**
   * Handles input focus
   */
  handleFocus() {
    if (this.input.value.length >= this.options.minChars && this.filteredSuggestions.length > 0) {
      this.openDropdown();
    }
  }

  /**
   * Handles input blur (with delay to allow clicking suggestions)
   */
  handleBlur() {
    // Delay closing to allow click on suggestion to register
    setTimeout(() => {
      if (!this.dropdown.matches(':hover') && !this.input.matches(':hover')) {
        this.closeDropdown();
      }
    }, 150);
  }

  /**
   * Updates the data source
   * @param {Array|Function} dataSource - New data source
   */
  updateDataSource(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Clears the input and suggestions
   */
  clear() {
    this.input.value = '';
    this.closeDropdown();
  }
}

/**
 * Initializes all autocomplete components on the page
 * @param {HTMLElement|Document} container - Container to search in
 * @returns {Array<AutoComplete>} Array of initialized instances
 */
function initAutoCompletes(container = document) {
  const autoCompleteInputs = container.querySelectorAll('input[data-autocomplete], input[role="combobox"]');
  const instances = [];
  
  autoCompleteInputs.forEach(input => {
    if (!input.hasAttribute('data-autocomplete-initialized')) {
      input.setAttribute('data-autocomplete-initialized', 'true');
      
      // Get data from various sources
      let dataSource = input.dataset.autocompleteSource || input.dataset.source || [];
      
      // If it's a JSON string, parse it
      if (typeof dataSource === 'string' && dataSource.startsWith('[')) {
        try {
          dataSource = JSON.parse(dataSource);
        } catch (e) {
          console.error('Invalid JSON data source:', dataSource);
        }
      }
      
      // Get options
      const options = {
        minChars: parseInt(input.dataset.autocompleteMinChars) || parseInt(input.dataset.minChars) || 2,
        maxSuggestions: parseInt(input.dataset.autocompleteMaxSuggestions) || parseInt(input.dataset.maxSuggestions) || 8,
        debounceTime: parseInt(input.dataset.autocompleteDebounceTime) || parseInt(input.dataset.debounceTime) || 300,
        highlightMatches: input.dataset.autocompleteHighlightMatches !== 'false',
        allowCustomValues: input.dataset.autocompleteAllowCustomValues !== 'false',
        loopNavigation: input.dataset.autocompleteLoopNavigation !== 'false'
      };
      
      const instance = new AutoComplete(input, dataSource, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize autocomplete components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initAutoCompletes();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AutoComplete, initAutoCompletes };
}

// Also make it available globally
window.AutoComplete = AutoComplete;
window.initAutoCompletes = initAutoCompletes;