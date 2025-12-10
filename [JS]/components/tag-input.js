/**
 * Tag Input Component
 * Advanced tag input with validation, suggestions, and customization options
 * Compatible with jazer-brand.css styling for tag input components
 */

class TagInput {
  /**
   * Creates a new tag input instance
   * @param {HTMLElement} container - Container element for the tag input
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      // Basic options
      initialTags: [],
      placeholder: 'Enter tags...',
      maxTags: null, // No limit by default
      minLength: 1,  // Minimum length of a tag
      maxLength: 50, // Maximum length of a tag
      
      // Validation and processing
      allowedTags: null, // Array of allowed tags (null for all)
      blockedTags: [], // Array of blocked tags
      duplicateTags: true, // Allow duplicate tags
      validateOnAdd: null, // Custom validation function
      transformTag: null, // Function to transform tags
      
      // Input behavior
      delimiter: ',', // Delimiter for adding multiple tags
      addOnBlur: true, // Add tag when input loses focus
      addOnPaste: true, // Add tags when pasting content
      
      // UI options
      showSuggestions: true,
      suggestions: [],
      allowCustomTags: true, // Allow tags outside suggestions
      showRemainingCount: true,
      
      // Event callbacks
      onTagAdd: null,
      onTagRemove: null,
      onTagClick: null,
      onInput: null,
      onInvalidTag: null,
      
      // Styling
      tagClass: 'tag',
      containerClass: 'tag-input-container',
      inputClass: 'tag-input-field',
      ...options
    };

    this.tags = new Set();
    this.input = null;
    this.tagContainer = null;
    this.suggestionsContainer = null;
    this.remainingCountElement = null;
    
    this.init();
  }

  /**
   * Initializes the tag input
   */
  init() {
    // Create the tag input structure
    this.createStructure();
    
    // Add initial tags if provided
    this.options.initialTags.forEach(tag => this.addTag(tag));
    
    // Bind events
    this.bindEvents();
    
    // Add dynamic styles
    this.addDynamicStyles();
  }

  /**
   * Creates the tag input structure
   */
  createStructure() {
    // Add container classes
    this.container.classList.add('tag-input-component');
    this.container.classList.add(this.options.containerClass);
    
    // Create tag container
    this.tagContainer = document.createElement('div');
    this.tagContainer.classList.add('tag-container');
    
    // Create input field
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = this.options.placeholder;
    this.input.classList.add('tag-input');
    this.input.classList.add(this.options.inputClass);
    this.input.setAttribute('autocomplete', 'off');
    
    // Create suggestions container if enabled
    if (this.options.showSuggestions) {
      this.suggestionsContainer = document.createElement('div');
      this.suggestionsContainer.classList.add('tag-suggestions');
      this.suggestionsContainer.style.display = 'none';
    }
    
    // Create remaining count if enabled
    if (this.options.showRemainingCount && this.options.maxTags !== null) {
      this.remainingCountElement = document.createElement('div');
      this.remainingCountElement.classList.add('tag-input-remaining-count');
    }
    
    // Assemble the structure
    this.container.appendChild(this.tagContainer);
    this.container.appendChild(this.input);
    if (this.suggestionsContainer) {
      this.container.appendChild(this.suggestionsContainer);
    }
    if (this.remainingCountElement) {
      this.container.appendChild(this.remainingCountElement);
    }
    
    // Update remaining count display
    this.updateRemainingCount();
  }

  /**
   * Binds events for the tag input
   */
  bindEvents() {
    // Input events
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.input.addEventListener('blur', (e) => this.handleBlur(e));
    this.input.addEventListener('paste', (e) => this.handlePaste(e));
    
    // Click on container (to focus input)
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container || e.target === this.tagContainer) {
        this.input.focus();
      }
    });
  }

  /**
   * Handles input event
   * @param {Event} e - Input event
   */
  handleInput(e) {
    const value = e.target.value.trim();
    
    // Update suggestions if enabled
    if (this.options.showSuggestions) {
      this.updateSuggestions(value);
    }
    
    // Update remaining count
    if (this.options.showRemainingCount) {
      this.updateRemainingCount();
    }
    
    // Execute callback
    if (this.options.onInput) {
      this.options.onInput(value);
    }
  }

  /**
   * Handles keydown event
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
      case 'Tab':
      case this.options.delimiter:
        e.preventDefault();
        if (e.target.value.trim() !== '') {
          this.processInput();
        }
        break;
        
      case 'Backspace':
        if (e.target.value === '' && this.tags.size > 0) {
          // Remove the last tag if input is empty
          this.removeLastTag();
        }
        break;
        
      case 'ArrowDown':
        if (this.options.showSuggestions) {
          e.preventDefault();
          this.selectSuggestion(1); // Move down in suggestions
        }
        break;
        
      case 'ArrowUp':
        if (this.options.showSuggestions) {
          e.preventDefault();
          this.selectSuggestion(-1); // Move up in suggestions
        }
        break;
        
      case 'Escape':
        if (this.options.showSuggestions) {
          this.hideSuggestions();
        }
        break;
    }
  }

  /**
   * Handles blur event
   * @param {Event} e - Blur event
   */
  handleBlur(e) {
    if (this.options.addOnBlur && e.target.value.trim() !== '') {
      this.processInput();
    }
    
    // Hide suggestions on blur if not clicking on them
    setTimeout(() => {
      if (!this.container.contains(document.activeElement)) {
        this.hideSuggestions();
      }
    }, 150);
  }

  /**
   * Handles paste event
   * @param {Event} e - Paste event
   */
  handlePaste(e) {
    if (!this.options.addOnPaste) return;
    
    e.preventDefault();
    
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    const tagsToAdd = this.parseTags(pasteData);
    
    tagsToAdd.forEach(tag => this.addTag(tag));
    
    // Clear input after adding tags
    this.input.value = '';
  }

  /**
   * Processes the current input value
   */
  processInput() {
    const value = this.input.value.trim();
    
    if (value === '') return;
    
    // Split by delimiter if present
    const tagsToAdd = this.parseTags(value);
    
    // Add each tag
    tagsToAdd.forEach(tag => this.addTag(tag));
    
    // Clear input
    this.input.value = '';
    
    // Hide suggestions
    this.hideSuggestions();
  }

  /**
   * Parses tags from a string value (handles delimiters)
   * @param {string} value - Input value to parse
   * @returns {Array} Array of tag strings
   */
  parseTags(value) {
    let tags = [value];
    
    if (this.options.delimiter) {
      tags = value.split(this.options.delimiter)
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    }
    
    return tags;
  }

  /**
   * Adds a tag to the input
   * @param {string} tag - Tag to add
   * @returns {boolean} Whether the tag was added successfully
   */
  addTag(tag) {
    // Transform tag if transformer is provided
    if (this.options.transformTag && typeof this.options.transformTag === 'function') {
      tag = this.options.transformTag(tag);
    }
    
    // Validate the tag
    if (!this.validateTag(tag)) {
      if (this.options.onInvalidTag) {
        this.options.onInvalidTag(tag);
      }
      return false;
    }
    
    // Check if max tags limit is reached
    if (this.options.maxTags !== null && this.tags.size >= this.options.maxTags) {
      return false;
    }
    
    // Check for duplicates if not allowed
    if (!this.options.duplicateTags && this.tags.has(tag)) {
      return false;
    }
    
    // Add tag to set
    this.tags.add(tag);
    
    // Create tag element
    const tagElement = this.createTagElement(tag);
    this.tagContainer.appendChild(tagElement);
    
    // Update remaining count
    if (this.options.showRemainingCount) {
      this.updateRemainingCount();
    }
    
    // Execute callback
    if (this.options.onTagAdd) {
      this.options.onTagAdd(tag);
    }
    
    return true;
  }

  /**
   * Creates a tag element
   * @param {string} tag - Tag text
   * @returns {HTMLElement} Tag element
   */
  createTagElement(tag) {
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag-element');
    tagElement.classList.add(this.options.tagClass);
    tagElement.textContent = tag;
    tagElement.setAttribute('data-tag', tag);
    
    // Add click handler for tag removal or interaction
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('tag-remove-btn');
    removeBtn.innerHTML = '&times;';
    removeBtn.setAttribute('aria-label', `Remove tag: ${tag}`);
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeTag(tag);
    });
    
    tagElement.appendChild(removeBtn);
    
    // Add click handler for tag
    if (this.options.onTagClick) {
      tagElement.addEventListener('click', () => {
        this.options.onTagClick(tag);
      });
    }
    
    return tagElement;
  }

  /**
   * Removes a tag
   * @param {string} tag - Tag to remove
   * @returns {boolean} Whether the tag was removed
   */
  removeTag(tag) {
    if (this.tags.has(tag)) {
      // Remove from set
      this.tags.delete(tag);
      
      // Remove from UI
      const tagElement = this.container.querySelector(`.tag-element[data-tag="${tag}"]`);
      if (tagElement) {
        tagElement.remove();
      }
      
      // Update remaining count
      if (this.options.showRemainingCount) {
        this.updateRemainingCount();
      }
      
      // Execute callback
      if (this.options.onTagRemove) {
        this.options.onTagRemove(tag);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Removes the last tag
   */
  removeLastTag() {
    if (this.tags.size === 0) return;
    
    // Get the last tag (since Set doesn't maintain order in older browsers, 
    // we'll get the last element in the DOM)
    const tagElements = this.tagContainer.querySelectorAll('.tag-element');
    if (tagElements.length > 0) {
      const lastTagElement = tagElements[tagElements.length - 1];
      const tag = lastTagElement.getAttribute('data-tag');
      this.removeTag(tag);
    }
  }

  /**
   * Validates a tag
   * @param {string} tag - Tag to validate
   * @returns {boolean} Whether the tag is valid
   */
  validateTag(tag) {
    // Check length constraints
    if (tag.length < this.options.minLength) return false;
    if (tag.length > this.options.maxLength) return false;
    
    // Check if tag is blocked
    if (this.options.blockedTags.includes(tag)) return false;
    
    // Check if only allowed tags are permitted
    if (this.options.allowedTags && !this.options.allowedTags.includes(tag) && !this.options.allowCustomTags) return false;
    
    // Run custom validation if provided
    if (this.options.validateOnAdd && typeof this.options.validateOnAdd === 'function') {
      return this.options.validateOnAdd(tag);
    }
    
    return true;
  }

  /**
   * Updates the suggestions list based on input value
   * @param {string} inputValue - Current input value
   */
  updateSuggestions(inputValue) {
    if (!this.suggestionsContainer) return;
    
    // Clear previous suggestions
    this.suggestionsContainer.innerHTML = '';
    
    // Filter suggestions based on input
    const suggestions = this.options.suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !this.tags.has(suggestion) // Don't show tags that are already added
    );
    
    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('div');
        suggestionElement.classList.add('suggestion-item');
        suggestionElement.textContent = suggestion;
        
        suggestionElement.addEventListener('click', () => {
          this.addTag(suggestion);
          this.input.value = '';
          this.hideSuggestions();
          this.input.focus();
        });
        
        this.suggestionsContainer.appendChild(suggestionElement);
      });
      
      this.suggestionsContainer.style.display = 'block';
    } else {
      this.suggestionsContainer.style.display = 'none';
    }
  }

  /**
   * Selects a suggestion in the list (keyboard navigation)
   * @param {number} direction - Direction (-1 for up, 1 for down)
   */
  selectSuggestion(direction) {
    if (!this.suggestionsContainer || !this.suggestionsContainer.children.length) return;
    
    const suggestions = Array.from(this.suggestionsContainer.children);
    const currentIndex = suggestions.findIndex(el => el.classList.contains('suggestion-selected'));
    
    let newIndex;
    
    if (currentIndex === -1) {
      // No selection, start at first or last based on direction
      newIndex = direction === 1 ? 0 : suggestions.length - 1;
    } else {
      // Move selection based on direction
      newIndex = currentIndex + direction;
      
      // Handle wraparound
      if (newIndex < 0) {
        newIndex = suggestions.length - 1;
      } else if (newIndex >= suggestions.length) {
        newIndex = 0;
      }
    }
    
    // Update selection
    suggestions.forEach((suggestion, index) => {
      suggestion.classList.toggle('suggestion-selected', index === newIndex);
    });
  }

  /**
   * Hides the suggestions container
   */
  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = 'none';
    }
  }

  /**
   * Updates the remaining count display
   */
  updateRemainingCount() {
    if (!this.remainingCountElement || this.options.maxTags === null) return;
    
    const remaining = this.options.maxTags - this.tags.size;
    
    if (remaining <= 0) {
      this.remainingCountElement.textContent = 'No more tags allowed';
      this.remainingCountElement.style.color = '#ff6b6b';
    } else {
      this.remainingCountElement.textContent = `${remaining} tags remaining`;
      this.remainingCountElement.style.color = '#4facfe';
    }
  }

  /**
   * Gets all tags as an array
   * @returns {Array} Array of tags
   */
  getTags() {
    return Array.from(this.tags);
  }

  /**
   * Sets all tags at once
   * @param {Array} tags - Array of tags to set
   */
  setTags(tags) {
    // Clear existing tags
    this.clearTags();
    
    // Add new tags
    tags.forEach(tag => this.addTag(tag));
  }

  /**
   * Clears all tags
   */
  clearTags() {
    this.tags.clear();
    this.tagContainer.innerHTML = '';
    
    if (this.options.showRemainingCount) {
      this.updateRemainingCount();
    }
  }

  /**
   * Checks if a tag exists
   * @param {string} tag - Tag to check
   * @returns {boolean} Whether the tag exists
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * Gets the count of tags
   * @returns {number} Number of tags
   */
  getTagCount() {
    return this.tags.size;
  }

  /**
   * Updates the placeholder text
   * @param {string} placeholder - New placeholder text
   */
  setPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    this.input.placeholder = placeholder;
  }

  /**
   * Updates the maximum number of tags allowed
   * @param {number} maxTags - New maximum number of tags
   */
  setMaxTags(maxTags) {
    this.options.maxTags = maxTags;
    this.updateRemainingCount();
  }

  /**
   * Adds multiple tags at once
   * @param {Array} tags - Array of tags to add
   * @returns {Array} Array of booleans indicating success for each tag
   */
  addTags(tags) {
    return tags.map(tag => this.addTag(tag));
  }

  /**
   * Removes multiple tags at once
   * @param {Array} tags - Array of tags to remove
   * @returns {Array} Array of booleans indicating success for each tag
   */
  removeTags(tags) {
    return tags.map(tag => this.removeTag(tag));
  }

  /**
   * Adds dynamic styles for the tag input
   */
  addDynamicStyles() {
    if (document.getElementById('tag-input-styles')) return;

    const style = document.createElement('style');
    style.id = 'tag-input-styles';
    style.textContent = `
      .tag-input-component {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 6px;
        background: var(--bg-darker, #111);
        min-height: 40px;
        cursor: text;
      }
      
      .tag-container {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        flex-grow: 1;
      }
      
      .tag-element {
        display: inline-flex;
        align-items: center;
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        padding: 4px 8px 4px 12px;
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .tag-remove-btn {
        background: none;
        border: none;
        color: inherit;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin-left: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        transition: background-color 0.2s ease;
      }
      
      .tag-remove-btn:hover {
        background: rgba(0, 0, 0, 0.2);
      }
      
      .tag-input {
        flex: 1;
        min-width: 100px;
        border: none;
        background: transparent;
        color: var(--text-light, #fff);
        font-size: 0.9rem;
        outline: none;
      }
      
      .tag-input::placeholder {
        color: var(--text-gray, #aaa);
      }
      
      .tag-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-lighter, #222);
        border-top: none;
        border-radius: 0 0 6px 6px;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--border-lighter, #222);
        transition: background-color 0.2s ease;
      }
      
      .suggestion-item:hover, .suggestion-item.suggestion-selected {
        background: var(--bg-dark, #0a0a0a);
      }
      
      .suggestion-item:last-child {
        border-bottom: none;
      }
      
      .tag-input-remaining-count {
        font-size: 0.75rem;
        color: var(--text-gray, #aaa);
        align-self: flex-end;
        margin-left: auto;
        padding: 4px 8px;
      }
      
      .tag-input-component:focus-within {
        border-color: var(--jazer-cyan, #00f2ea);
        box-shadow: 0 0 0 2px rgba(0, 242, 234, 0.2);
      }
      
      .tag-invalid {
        border-color: #ff4757;
      }
      
      .tag-invalid .tag-element {
        background: #ff6b6b;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Enables or disables the tag input
   * @param {boolean} enabled - Whether to enable the input
   */
  setEnabled(enabled) {
    this.input.disabled = !enabled;
    
    if (enabled) {
      this.container.classList.remove('tag-input-disabled');
      this.input.removeAttribute('disabled');
    } else {
      this.container.classList.add('tag-input-disabled');
      this.input.setAttribute('disabled', 'disabled');
    }
  }

  /**
   * Focuses the tag input
   */
  focus() {
    this.input.focus();
  }

  /**
   * Blurs the tag input
   */
  blur() {
    this.input.blur();
  }

  /**
   * Gets the currently focused state
   * @returns {boolean} Whether the input is focused
   */
  hasFocus() {
    return document.activeElement === this.input;
  }

  /**
   * Adds tags from an array to the current tags
   * @param {Array} tags - Array of tags to add
   * @returns {Array} Array of booleans indicating success for each tag
   */
  addTagsFromArray(tags) {
    return tags.filter(tag => this.validateTag(tag)).map(tag => this.addTag(tag));
  }

  /**
   * Removes tags from an array if they exist
   * @param {Array} tags - Array of tags to remove
   * @returns {Array} Array of booleans indicating success for each tag
   */
  removeTagsFromArray(tags) {
    return tags.map(tag => this.removeTag(tag));
  }

  /**
   * Toggles a tag (adds if not present, removes if present)
   * @param {string} tag - Tag to toggle
   * @returns {boolean} Whether the tag was added (true) or removed (false)
   */
  toggleTag(tag) {
    if (this.tags.has(tag)) {
      this.removeTag(tag);
      return false; // Removed
    } else {
      this.addTag(tag);
      return true; // Added
    }
  }

  /**
   * Gets the input element
   * @returns {HTMLInputElement} The input element
   */
  getInput() {
    return this.input;
  }

  /**
   * Gets the tag container element
   * @returns {HTMLElement} The tag container element
   */
  getTagContainer() {
    return this.tagContainer;
  }

  /**
   * Sets the suggestions list
   * @param {Array} suggestions - Array of suggestion strings
   */
  setSuggestions(suggestions) {
    this.options.suggestions = suggestions;
    
    // Update suggestions if input has value
    if (this.input.value) {
      this.updateSuggestions(this.input.value);
    }
  }

  /**
   * Adds a suggestion to the list
   * @param {string} suggestion - Suggestion to add
   */
  addSuggestion(suggestion) {
    if (!this.options.suggestions.includes(suggestion)) {
      this.options.suggestions.push(suggestion);
    }
  }

  /**
   * Removes a suggestion from the list
   * @param {string} suggestion - Suggestion to remove
   * @returns {boolean} Whether the suggestion was removed
   */
  removeSuggestion(suggestion) {
    const index = this.options.suggestions.indexOf(suggestion);
    if (index !== -1) {
      this.options.suggestions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Destroys the tag input and cleans up
   */
  destroy() {
    // Remove event listeners would normally be done here
    // For simplicity in this implementation, we'll just remove the container content
    
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

/**
 * Initializes all tag inputs on the page
 * @param {HTMLElement|Document} container - Container to search for tag inputs
 * @returns {Array<TagInput>} Array of initialized tag input instances
 */
function initTagInputs(container = document) {
  const tagInputElements = container.querySelectorAll('.tag-input-component, [data-tag-input]');
  const instances = [];

  tagInputElements.forEach(element => {
    if (!element.hasAttribute('data-tag-input-initialized')) {
      element.setAttribute('data-tag-input-initialized', 'true');

      // Get options from data attributes
      const options = {
        initialTags: element.dataset.initialTags ? 
          JSON.parse(element.dataset.initialTags) : [],
        placeholder: element.dataset.placeholder || 'Enter tags...',
        maxTags: element.dataset.maxTags ? 
          parseInt(element.dataset.maxTags) : null,
        minLength: parseInt(element.dataset.minLength) || 1,
        maxLength: parseInt(element.dataset.maxLength) || 50,
        delimiter: element.dataset.delimiter || ',',
        addOnBlur: element.dataset.addOnBlur !== 'false',
        addOnPaste: element.dataset.addOnPaste !== 'false',
        showSuggestions: element.dataset.showSuggestions !== 'false',
        allowCustomTags: element.dataset.allowCustomTags !== 'false',
        showRemainingCount: element.dataset.showRemainingCount !== 'false',
        duplicateTags: element.dataset.duplicateTags !== 'false',
        blockedTags: element.dataset.blockedTags ? 
          JSON.parse(element.dataset.blockedTags) : [],
        suggestions: element.dataset.suggestions ? 
          JSON.parse(element.dataset.suggestions) : [],
        ...JSON.parse(element.dataset.options || '{}')
      };

      const instance = new TagInput(element, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize tag inputs when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initTagInputs();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TagInput, initTagInputs };
}

// Make available globally
window.TagInput = TagInput;
window.initTagInputs = initTagInputs;