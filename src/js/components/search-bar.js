/**
 * Search Bar Component
 * Accessible search bar with suggestions and advanced features
 * Compatible with jazer-brand.css styling
 */

class SearchBar {
  /**
   * Creates a new search bar component
   * @param {HTMLElement} searchBarElement - The search bar container element
   * @param {Object} options - Configuration options
   */
  constructor(searchBarElement, options = {}) {
    this.searchBar = searchBarElement;
    this.options = {
      placeholder: 'Search...',
      showSuggestions: true,
      suggestions: [],
      minCharsForSuggestions: 1,
      debounceDelay: 300,
      enableRecentSearches: true,
      maxRecentSearches: 5,
      showSearchButton: true,
      showClearButton: true,
      autoSelectFirst: true,
      caseSensitive: false,
      ...options
    };

    this.searchInput = null;
    this.suggestionsContainer = null;
    this.searchButton = null;
    this.clearButton = null;
    this.recentSearches = [];
    this.currentSuggestions = [];
    this.currentSuggestionIndex = -1;
    this.isSuggestionsVisible = false;
    this.debounceTimer = null;

    this.init();
  }

  /**
   * Initializes the search bar
   */
  init() {
    // Load recent searches from localStorage if enabled
    if (this.options.enableRecentSearches) {
      this.loadRecentSearches();
    }

    // Set up the search bar structure
    this.setupSearchBar();

    // Bind events
    this.bindEvents();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the search bar structure
   */
  setupSearchBar() {
    // Add search bar classes
    this.searchBar.classList.add('search-bar');
    
    // Create search input
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.classList.add('search-input');
    this.searchInput.placeholder = this.options.placeholder;
    this.searchInput.setAttribute('autocomplete', 'off');
    this.searchInput.setAttribute('role', 'combobox');
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.searchInput.setAttribute('aria-autocomplete', 'list');
    this.searchInput.setAttribute('aria-controls', 'search-suggestions');
    this.searchInput.setAttribute('aria-haspopup', 'listbox');
    
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');
    
    // Add search input to container
    searchContainer.appendChild(this.searchInput);
    
    // Create clear button if enabled
    if (this.options.showClearButton) {
      this.clearButton = document.createElement('button');
      this.clearButton.classList.add('search-clear-button');
      this.clearButton.innerHTML = '&times;';
      this.clearButton.setAttribute('aria-label', 'Clear search');
      this.clearButton.setAttribute('tabindex', '-1');
      this.clearButton.style.display = 'none'; // Initially hidden
      
      searchContainer.appendChild(this.clearButton);
    }
    
    // Create search button if enabled
    if (this.options.showSearchButton) {
      this.searchButton = document.createElement('button');
      this.searchButton.classList.add('search-button');
      this.searchButton.innerHTML = '🔍';
      this.searchButton.setAttribute('aria-label', 'Search');
      
      searchContainer.appendChild(this.searchButton);
    }
    
    // Add container to search bar
    this.searchBar.appendChild(searchContainer);
    
    // Create suggestions container if enabled
    if (this.options.showSuggestions) {
      this.suggestionsContainer = document.createElement('div');
      this.suggestionsContainer.id = 'search-suggestions';
      this.suggestionsContainer.classList.add('search-suggestions');
      this.suggestionsContainer.setAttribute('role', 'listbox');
      this.suggestionsContainer.setAttribute('aria-label', 'Search suggestions');
      this.suggestionsContainer.style.display = 'none';
      
      this.searchBar.appendChild(this.suggestionsContainer);
    }
  }

  /**
   * Binds event listeners for the search bar
   */
  bindEvents() {
    // Input event with debounce
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleInput(e.target.value);
      }, this.options.debounceDelay);
    });

    // Focus and blur events
    this.searchInput.addEventListener('focus', () => {
      this.showSuggestions();
    });

    this.searchInput.addEventListener('blur', (e) => {
      // Use setTimeout to allow click events on suggestions to register first
      setTimeout(() => {
        if (!this.searchBar.contains(document.activeElement)) {
          this.hideSuggestions();
        }
      }, 150);
    });

    // Keydown events for navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Search button click
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => {
        this.performSearch(this.searchInput.value);
      });
    }

    // Clear button click
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Document click to close suggestions
    document.addEventListener('click', (e) => {
      if (!this.searchBar.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  /**
   * Handles input event with debounce
   * @param {string} value - Current input value
   */
  handleInput(value) {
    // Show/hide clear button
    if (this.clearButton) {
      this.clearButton.style.display = value ? 'block' : 'none';
    }

    // Update suggestions if enabled
    if (this.options.showSuggestions) {
      this.updateSuggestions(value);
    }
  }

  /**
   * Handles keydown events for navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.navigateSuggestions(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateSuggestions(-1);
        break;
      case 'Enter':
        e.preventDefault();
        this.selectSuggestion();
        break;
      case 'Escape':
        this.hideSuggestions();
        this.searchInput.blur();
        break;
      case 'Tab':
        if (this.isSuggestionsVisible) {
          this.selectSuggestion();
        }
        break;
    }
  }

  /**
   * Updates suggestions based on input
   * @param {string} query - Current search query
   */
  updateSuggestions(query) {
    if (query.length < this.options.minCharsForSuggestions) {
      this.hideSuggestions();
      return;
    }

    // Get suggestions based on query
    this.currentSuggestions = this.getSuggestions(query);

    if (this.currentSuggestions.length > 0) {
      this.renderSuggestions();
      this.showSuggestions();
      
      // Auto-select first suggestion if enabled
      if (this.options.autoSelectFirst) {
        this.currentSuggestionIndex = 0;
        this.updateSuggestionSelection();
      } else {
        this.currentSuggestionIndex = -1;
      }
    } else {
      this.hideSuggestions();
    }
  }

  /**
   * Gets suggestions based on query
   * @param {string} query - Search query
   * @returns {Array} Array of suggestions
   */
  getSuggestions(query) {
    const lowerQuery = this.options.caseSensitive ? query : query.toLowerCase();
    let suggestions = [];

    // Add recent searches first if any match
    if (this.options.enableRecentSearches) {
      const recentMatches = this.recentSearches.filter(item => 
        this.options.caseSensitive ? 
          item.includes(query) : 
          item.toLowerCase().includes(lowerQuery)
      );
      suggestions = suggestions.concat(recentMatches);
    }

    // Add predefined suggestions
    const predefinedMatches = this.options.suggestions.filter(item => 
      this.options.caseSensitive ? 
        item.includes(query) : 
        item.toLowerCase().includes(lowerQuery)
    );
    
    // Filter out duplicates
    predefinedMatches.forEach(item => {
      if (!suggestions.includes(item)) {
        suggestions.push(item);
      }
    });

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Renders suggestions in the suggestions container
   */
  renderSuggestions() {
    if (!this.suggestionsContainer) return;

    this.suggestionsContainer.innerHTML = '';

    // Add "Recent Searches" header if showing recent searches
    if (this.options.enableRecentSearches && 
        this.currentSuggestions.some(item => this.recentSearches.includes(item))) {
      const recentHeader = document.createElement('div');
      recentHeader.classList.add('suggestion-header');
      recentHeader.textContent = 'Recent Searches';
      recentHeader.setAttribute('role', 'heading');
      recentHeader.setAttribute('aria-level', '3');
      this.suggestionsContainer.appendChild(recentHeader);
    }

    // Add suggestion items
    this.currentSuggestions.forEach((suggestion, index) => {
      const suggestionItem = document.createElement('div');
      suggestionItem.classList.add('suggestion-item');
      suggestionItem.setAttribute('role', 'option');
      suggestionItem.setAttribute('aria-selected', index === this.currentSuggestionIndex);
      suggestionItem.textContent = suggestion;

      // Add click event
      suggestionItem.addEventListener('click', () => {
        this.selectSuggestion(index);
      });

      // Add to container
      this.suggestionsContainer.appendChild(suggestionItem);
    });
  }

  /**
   * Shows the suggestions container
   */
  showSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = 'block';
      this.isSuggestionsVisible = true;
      this.searchInput.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Hides the suggestions container
   */
  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = 'none';
      this.isSuggestionsVisible = false;
      this.currentSuggestionIndex = -1;
      this.updateSuggestionSelection();
      this.searchInput.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Navigates through suggestions
   * @param {number} direction - Direction to navigate (1 for down, -1 for up)
   */
  navigateSuggestions(direction) {
    if (this.currentSuggestions.length === 0) return;

    // Calculate new index
    let newIndex = this.currentSuggestionIndex + direction;
    
    // Handle wrapping
    if (newIndex < -1) {
      newIndex = this.currentSuggestions.length - 1;
    } else if (newIndex >= this.currentSuggestions.length) {
      newIndex = -1; // Deselect all
    }

    this.currentSuggestionIndex = newIndex;
    this.updateSuggestionSelection();
  }

  /**
   * Updates the visual selection of suggestions
   */
  updateSuggestionSelection() {
    const suggestionItems = this.suggestionsContainer ? 
      this.suggestionsContainer.querySelectorAll('.suggestion-item') : [];

    // Remove selection from all items
    suggestionItems.forEach((item, index) => {
      item.classList.toggle('suggestion-selected', index === this.currentSuggestionIndex);
      item.setAttribute('aria-selected', index === this.currentSuggestionIndex);
    });

    // Scroll to selected item if needed
    if (this.currentSuggestionIndex >= 0 && suggestionItems[this.currentSuggestionIndex]) {
      suggestionItems[this.currentSuggestionIndex].scrollIntoView({
        block: 'nearest'
      });
    }
  }

  /**
   * Selects a suggestion
   * @param {number} index - Index of the suggestion to select (optional)
   */
  selectSuggestion(index = this.currentSuggestionIndex) {
    if (index >= 0 && index < this.currentSuggestions.length) {
      const selectedSuggestion = this.currentSuggestions[index];
      this.searchInput.value = selectedSuggestion;
      this.hideSuggestions();
      this.performSearch(selectedSuggestion);
    } else {
      // If no suggestion selected, just perform search with current input
      this.performSearch(this.searchInput.value);
    }
  }

  /**
   * Performs the search
   * @param {string} query - Search query
   */
  performSearch(query) {
    if (query.trim() === '') return;

    // Add to recent searches if enabled
    if (this.options.enableRecentSearches) {
      this.addRecentSearch(query);
    }

    // Trigger custom search event
    this.searchBar.dispatchEvent(new CustomEvent('search', {
      detail: { query: query }
    }));

    // Hide suggestions after search
    this.hideSuggestions();
  }

  /**
   * Adds a search term to recent searches
   * @param {string} query - Search query to add
   */
  addRecentSearch(query) {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(item => item !== query);
    
    // Add to beginning of array
    this.recentSearches.unshift(query);
    
    // Limit to max recent searches
    this.recentSearches = this.recentSearches.slice(0, this.options.maxRecentSearches);
    
    // Save to localStorage
    this.saveRecentSearches();
  }

  /**
   * Saves recent searches to localStorage
   */
  saveRecentSearches() {
    try {
      localStorage.setItem('jazer-search-recent', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.warn('Could not save recent searches to localStorage:', e);
    }
  }

  /**
   * Loads recent searches from localStorage
   */
  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('jazer-search-recent');
      if (saved) {
        this.recentSearches = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load recent searches from localStorage:', e);
      this.recentSearches = [];
    }
  }

  /**
   * Clears the search input
   */
  clearSearch() {
    this.searchInput.value = '';
    this.searchInput.focus();
    
    if (this.clearButton) {
      this.clearButton.style.display = 'none';
    }
    
    this.hideSuggestions();
    
    // Trigger clear event
    this.searchBar.dispatchEvent(new CustomEvent('searchclear'));
  }

  /**
   * Updates the suggestions list
   * @param {Array} suggestions - New suggestions array
   */
  updateSuggestionsList(suggestions) {
    this.options.suggestions = suggestions;
    
    // If currently showing suggestions, refresh them
    if (this.isSuggestionsVisible) {
      this.updateSuggestions(this.searchInput.value);
    }
  }

  /**
   * Gets the current search value
   * @returns {string} Current search value
   */
  getValue() {
    return this.searchInput.value;
  }

  /**
   * Sets the search value
   * @param {string} value - Value to set
   */
  setValue(value) {
    this.searchInput.value = value;
    
    if (this.clearButton) {
      this.clearButton.style.display = value ? 'block' : 'none';
    }
  }

  /**
   * Adds dynamic styles for the search bar
   */
  addDynamicStyles() {
    if (document.getElementById('search-bar-styles')) return;

    const style = document.createElement('style');
    style.id = 'search-bar-styles';
    style.textContent = `
      .search-bar {
        position: relative;
        display: inline-block;
        width: 100%;
      }
      
      .search-container {
        position: relative;
        display: flex;
        align-items: center;
        background: var(--bg-input, #1a1a1a);
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .search-input {
        flex: 1;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: var(--text-light, #fff);
        font-size: 1rem;
        outline: none;
      }
      
      .search-input:focus {
        border-color: var(--jazer-cyan, #00f2ea);
      }
      
      .search-button, .search-clear-button {
        background: none;
        border: none;
        color: var(--text-gray, #aaa);
        cursor: pointer;
        padding: 8px 12px;
        font-size: 1.2rem;
        outline: none;
      }
      
      .search-button:hover, .search-clear-button:hover {
        color: var(--text-light, #fff);
      }
      
      .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-dark, #000);
        border: 2px solid var(--border-default, #4facfe);
        border-top: none;
        border-radius: 0 0 8px 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      
      .suggestion-header {
        padding: 8px 12px;
        background: var(--bg-darker, #111);
        font-size: 0.8rem;
        text-transform: uppercase;
        color: var(--text-gray, #aaa);
        border-bottom: 1px solid var(--border-default, #4facfe);
      }
      
      .suggestion-item {
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--border-lighter, #222);
        transition: background-color 0.2s ease;
      }
      
      .suggestion-item:last-child {
        border-bottom: none;
      }
      
      .suggestion-item:hover, .suggestion-item.suggestion-selected {
        background: var(--bg-darker, #111);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the search bar and cleans up
   */
  destroy() {
    clearTimeout(this.debounceTimer);
    
    // Remove event listeners would normally be done here
    // For simplicity in this implementation, we'll just remove the element
    
    if (this.searchBar.parentNode) {
      this.searchBar.parentNode.removeChild(this.searchBar);
    }
  }
}

/**
 * Initializes all search bars on the page
 * @param {HTMLElement|Document} container - Container to search for search bars
 * @returns {Array<SearchBar>} Array of initialized search bar instances
 */
function initSearchBars(container = document) {
  const searchBars = container.querySelectorAll('.search-bar, [data-search]');
  const instances = [];

  searchBars.forEach(searchBar => {
    if (!searchBar.hasAttribute('data-search-initialized')) {
      searchBar.setAttribute('data-search-initialized', 'true');

      // Get options from data attributes
      const options = {
        placeholder: searchBar.dataset.placeholder || 'Search...',
        showSuggestions: searchBar.dataset.showSuggestions !== 'false',
        suggestions: (searchBar.dataset.suggestions || '').split(','),
        minCharsForSuggestions: parseInt(searchBar.dataset.minCharsForSuggestions) || 1,
        debounceDelay: parseInt(searchBar.dataset.debounceDelay) || 300,
        enableRecentSearches: searchBar.dataset.enableRecentSearches !== 'false',
        maxRecentSearches: parseInt(searchBar.dataset.maxRecentSearches) || 5,
        showSearchButton: searchBar.dataset.showSearchButton !== 'false',
        showClearButton: searchBar.dataset.showClearButton !== 'false',
        autoSelectFirst: searchBar.dataset.autoSelectFirst !== 'false',
        caseSensitive: searchBar.dataset.caseSensitive === 'true'
      };

      const instance = new SearchBar(searchBar, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize search bars when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initSearchBars();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchBar, initSearchBars };
}

// Also make it available globally
window.SearchBar = SearchBar;
window.initSearchBars = initSearchBars;