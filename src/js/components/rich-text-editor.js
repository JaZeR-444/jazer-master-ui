/**
 * Rich Text Editor Component
 * Advanced rich text editor with formatting tools and content management
 * Compatible with jazer-brand.css styling for editor components
 */

class RichTextEditor {
  /**
   * Creates a new rich text editor instance
   * @param {HTMLElement|string} container - Container element or selector for the editor
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('RichTextEditor: Container element not found');
    }

    this.options = {
      // Toolbar configuration
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['header', 'list'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      
      // Content configuration
      placeholder: 'Compose your content here...',
      theme: 'snow', // 'snow' or 'bubble'
      readOnly: false,
      maxLength: null,
      
      // Formatting options
      formats: [
        'bold', 'italic', 'underline', 'strike',
        'header', 'list', 'bullet', 'ordered',
        'link', 'image', 'video', 'blockquote', 'code', 'code-block',
        'color', 'background', 'align', 'indent'
      ],
      
      // Event callbacks
      onTextChange: null,
      onSelectionChange: null,
      onFocus: null,
      onBlur: null,
      ...options
    };

    this.editor = null;
    this.toolbar = null;
    this.modules = {};
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 100;
    
    this.init();
  }

  /**
   * Initializes the rich text editor
   */
  init() {
    // Create editor structure
    this.createEditorStructure();
    
    // Initialize Quill-like functionality
    this.initializeEditor();
    
    // Setup event listeners
    this.bindEvents();
    
    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Creates the editor structure
   */
  createEditorStructure() {
    // Create toolbar if needed
    if (this.options.toolbar) {
      this.createToolbar();
    }
    
    // Create editor content area
    this.editorElement = document.createElement('div');
    this.editorElement.classList.add('rich-text-editor-content');
    this.editorElement.setAttribute('contenteditable', !this.options.readOnly);
    this.editorElement.setAttribute('spellcheck', 'true');
    this.editorElement.setAttribute('aria-label', 'Rich text editor');
    this.editorElement.setAttribute('role', 'textbox');
    
    // Set placeholder if provided
    if (this.options.placeholder) {
      this.editorElement.setAttribute('data-placeholder', this.options.placeholder);
    }
    
    // Add to container
    this.container.appendChild(this.editorElement);
    
    // Create status bar if needed
    if (this.options.showStatusBar) {
      this.createStatusBar();
    }
  }

  /**
   * Creates the toolbar
   */
  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('rich-text-toolbar');
    this.toolbar.setAttribute('role', 'toolbar');
    
    // Create toolbar buttons based on options
    this.options.toolbar.forEach(toolbarGroup => {
      const group = document.createElement('div');
      group.classList.add('toolbar-group');
      
      toolbarGroup.forEach(buttonType => {
        const button = this.createToolbarButton(buttonType);
        if (button) {
          group.appendChild(button);
        }
      });
      
      this.toolbar.appendChild(group);
    });
    
    this.container.insertBefore(this.toolbar, this.editorElement);
  }

  /**
   * Creates a toolbar button
   * @param {string} type - Type of button to create
   * @returns {HTMLElement} Toolbar button element
   */
  createToolbarButton(type) {
    const button = document.createElement('button');
    button.classList.add('toolbar-button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', this.getButtonLabel(type));
    
    // Add button-specific classes and functionality
    button.classList.add(`toolbar-btn-${type}`);
    
    switch (type) {
      case 'bold':
        button.innerHTML = '<strong>B</strong>';
        button.addEventListener('click', () => this.formatText('bold'));
        break;
      case 'italic':
        button.innerHTML = '<em>I</em>';
        button.addEventListener('click', () => this.formatText('italic'));
        break;
      case 'underline':
        button.innerHTML = '<u>U</u>';
        button.addEventListener('click', () => this.formatText('underline'));
        break;
      case 'strike':
        button.innerHTML = '<s>S</s>';
        button.addEventListener('click', () => this.formatText('strike'));
        break;
      case 'link':
        button.innerHTML = '🔗';
        button.addEventListener('click', () => this.insertLink());
        break;
      case 'image':
        button.innerHTML = '🖼️';
        button.addEventListener('click', () => this.insertImage());
        break;
      case 'list':
        button.innerHTML = '•';
        button.addEventListener('click', () => this.formatText('list', 'bullet'));
        break;
      case 'ordered':
        button.innerHTML = '1.';
        button.addEventListener('click', () => this.formatText('list', 'ordered'));
        break;
      case 'blockquote':
        button.innerHTML = '”';
        button.addEventListener('click', () => this.formatText('blockquote'));
        break;
      case 'code':
        button.innerHTML = '{}';
        button.addEventListener('click', () => this.formatText('code'));
        break;
      case 'clean':
        button.innerHTML = '⌫';
        button.addEventListener('click', () => this.clean());
        break;
      default:
        button.textContent = type.charAt(0).toUpperCase();
        button.addEventListener('click', () => this.formatText(type));
    }
    
    return button;
  }

  /**
   * Gets the label for a toolbar button
   * @param {string} type - Button type
   * @returns {string} Button label
   */
  getButtonLabel(type) {
    const labels = {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strike: 'Strikethrough',
      link: 'Insert Link',
      image: 'Insert Image',
      list: 'Bullet List',
      ordered: 'Ordered List',
      blockquote: 'Blockquote',
      code: 'Code',
      clean: 'Clear Formatting'
    };
    
    return labels[type] || type;
  }

  /**
   * Initializes the editor functionality
   */
  initializeEditor() {
    // Set up mutation observer for content changes
    this.mutationObserver = new MutationObserver((mutations) => {
      this.handleContentChange();
    });
    
    this.mutationObserver.observe(this.editorElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
    
    // Set initial content if provided
    if (this.options.initialContent) {
      this.setContent(this.options.initialContent);
    }
  }

  /**
   * Binds editor events
   */
  bindEvents() {
    // Content change events
    this.editorElement.addEventListener('input', (e) => {
      this.saveHistory();
      if (this.options.onTextChange) {
        this.options.onTextChange({
          content: this.getContent(),
          text: this.getText(),
          wordCount: this.getWordCount(),
          characterCount: this.getCharacterCount()
        });
      }
    });
    
    // Selection change events
    document.addEventListener('selectionchange', () => {
      if (this.options.onSelectionChange) {
        const selection = this.getSelection();
        this.options.onSelectionChange(selection);
      }
    });
    
    // Focus and blur events
    this.editorElement.addEventListener('focus', (e) => {
      if (this.options.onFocus) {
        this.options.onFocus(e);
      }
    });
    
    this.editorElement.addEventListener('blur', (e) => {
      if (this.options.onBlur) {
        this.options.onBlur(e);
      }
    });
    
    // Keyboard shortcuts
    this.editorElement.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  /**
   * Handles content changes
   */
  handleContentChange() {
    // Update status bar if available
    if (this.statusBar) {
      this.updateStatusBar();
    }
    
    // Check for max length if configured
    if (this.options.maxLength) {
      const currentLength = this.getCharacterCount();
      if (currentLength > this.options.maxLength) {
        // Truncate content to fit within limit
        const text = this.getText().substring(0, this.options.maxLength);
        this.setText(text);
      }
    }
  }

  /**
   * Saves content to history for undo/redo functionality
   */
  saveHistory() {
    const content = this.getContent();
    
    // Don't save if content hasn't changed
    if (this.history.length > 0 && this.history[this.history.length - 1] === content) {
      return;
    }
    
    // Add to history
    this.history.push(content);
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex = this.history.length - 1;
    } else {
      this.historyIndex = this.history.length - 1;
    }
  }

  /**
   * Undo last action
   * @returns {boolean} Whether undo was successful
   */
  undo() {
    if (this.historyIndex <= 0) return false;
    
    this.historyIndex--;
    const content = this.history[this.historyIndex];
    this.setContent(content);
    
    return true;
  }

  /**
   * Redo last undone action
   * @returns {boolean} Whether redo was successful
   */
  redo() {
    if (this.historyIndex >= this.history.length - 1) return false;
    
    this.historyIndex++;
    const content = this.history[this.historyIndex];
    this.setContent(content);
    
    return true;
  }

  /**
   * Formats text with specified formatting
   * @param {string} format - Format to apply
   * @param {any} value - Value for the format (optional)
   */
  formatText(format, value = null) {
    // Save current state for history
    this.saveHistory();
    
    // Apply formatting based on format type
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      // If text is selected, apply format to selection
      document.execCommand(format, false, value);
    } else if (value) {
      // If no selection but value provided, apply to insertion point
      document.execCommand(format, false, value);
    } else {
      // Toggle format for empty selection
      document.execCommand(format, false, null);
    }
    
    // Focus back to editor
    this.editorElement.focus();
  }

  /**
   * Inserts a link
   */
  insertLink() {
    const url = prompt('Enter URL:', 'https://');
    if (url && url !== 'https://') {
      this.formatText('createLink', url);
    }
  }

  /**
   * Inserts an image
   */
  insertImage() {
    const url = prompt('Enter image URL:', 'https://');
    if (url && url !== 'https://') {
      document.execCommand('insertImage', false, url);
    }
  }

  /**
   * Cleans formatting from selected text
   */
  clean() {
    this.saveHistory();
    document.execCommand('removeFormat', false, null);
  }

  /**
   * Sets editor content
   * @param {string} html - HTML content to set
   */
  setContent(html) {
    this.editorElement.innerHTML = html;
  }

  /**
   * Gets editor content
   * @returns {string} Editor content as HTML
   */
  getContent() {
    return this.editorElement.innerHTML;
  }

  /**
   * Sets editor text content only
   * @param {string} text - Text content to set
   */
  setText(text) {
    this.editorElement.textContent = text;
  }

  /**
   * Gets editor text content only
   * @returns {string} Editor text content
   */
  getText() {
    return this.editorElement.textContent || '';
  }

  /**
   * Gets current selection info
   * @returns {Object} Selection information
   */
  getSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    return {
      text: selection.toString(),
      range: range,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      isCollapsed: selection.isCollapsed
    };
  }

  /**
   * Gets word count in editor
   * @returns {number} Word count
   */
  getWordCount() {
    const text = this.getText();
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * Gets character count in editor
   * @returns {number} Character count
   */
  getCharacterCount() {
    return this.getText().length;
  }

  /**
   * Handles keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboardShortcuts(e) {
    // Ctrl+Z for undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
      return;
    }
    
    // Ctrl+Shift+Z or Ctrl+Y for redo
    if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      this.redo();
      return;
    }
    
    // Ctrl+B for bold
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      this.formatText('bold');
      return;
    }
    
    // Ctrl+I for italic
    if (e.ctrlKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      this.formatText('italic');
      return;
    }
    
    // Ctrl+U for underline
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      this.formatText('underline');
      return;
    }
  }

  /**
   * Creates status bar
   */
  createStatusBar() {
    this.statusBar = document.createElement('div');
    this.statusBar.classList.add('editor-status-bar');
    this.statusBar.style.cssText = `
      padding: 8px 12px;
      font-size: 0.8rem;
      color: var(--text-gray, #aaa);
      border-top: 1px solid var(--border-lighter, #222);
      background: var(--bg-darker, #111);
    `;
    
    this.container.appendChild(this.statusBar);
    this.updateStatusBar();
  }

  /**
   * Updates status bar information
   */
  updateStatusBar() {
    if (!this.statusBar) return;
    
    const wordCount = this.getWordCount();
    const charCount = this.getCharacterCount();
    const content = this.getContent();
    
    let statusHTML = `Words: ${wordCount} | Characters: ${charCount}`;
    
    if (this.options.maxLength) {
      const remaining = this.options.maxLength - charCount;
      statusHTML += ` | Remaining: ${remaining}`;
      
      // Change color if approaching limit
      if (remaining < this.options.maxLength * 0.1) { // Less than 10% remaining
        this.statusBar.style.color = '#ff6b6b';
      } else {
        this.statusBar.style.color = 'var(--text-gray, #aaa)';
      }
    }
    
    this.statusBar.innerHTML = statusHTML;
  }

  /**
   * Adds dynamic styles for the editor
   */
  addDynamicStyles() {
    if (document.getElementById('rich-text-editor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'rich-text-editor-styles';
    style.textContent = `
      .rich-text-editor {
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 8px;
        overflow: hidden;
        background: var(--bg-darker, #111);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .rich-text-toolbar {
        background: var(--bg-dark, #0a0a0a);
        border-bottom: 1px solid var(--border-lighter, #222);
        padding: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      
      .toolbar-group {
        display: flex;
        gap: 4px;
        margin-right: 8px;
        padding-right: 8px;
        border-right: 1px solid var(--border-lighter, #222);
      }
      
      .toolbar-group:last-child {
        border-right: none;
        margin-right: 0;
        padding-right: 0;
      }
      
      .toolbar-button {
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        color: var(--text-light, #fff);
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }
      
      .toolbar-button:hover {
        background: var(--bg-dark, #0a0a0a);
        border-color: var(--jazer-cyan, #00f2ea);
      }
      
      .toolbar-button:active {
        transform: translateY(1px);
      }
      
      .rich-text-editor-content {
        min-height: 200px;
        padding: 16px;
        color: var(--text-light, #fff);
        background: var(--bg-darkest, #000);
        line-height: 1.6;
        outline: none;
        overflow-y: auto;
      }
      
      .rich-text-editor-content:focus {
        border-color: var(--jazer-cyan, #00f2ea);
      }
      
      .rich-text-editor-content p {
        margin: 0 0 1em 0;
      }
      
      .rich-text-editor-content h1,
      .rich-text-editor-content h2,
      .rich-text-editor-content h3 {
        margin: 1em 0 0.5em 0;
        line-height: 1.2;
      }
      
      .rich-text-editor-content blockquote {
        margin: 1em 0;
        padding-left: 1em;
        border-left: 3px solid var(--border-default, #4facfe);
        color: var(--text-lighter, #ddd);
        font-style: italic;
      }
      
      .rich-text-editor-content code {
        background: var(--bg-dark, #0a0a0a);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
      
      .rich-text-editor-content pre {
        background: var(--bg-dark, #0a0a0a);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1em 0;
      }
      
      .rich-text-editor-content a {
        color: var(--jazer-cyan, #00f2ea);
        text-decoration: underline;
      }
      
      .editor-status-bar {
        padding: 8px 12px;
        font-size: 0.8rem;
        color: var(--text-gray, #aaa);
        border-top: 1px solid var(--border-lighter, #222);
        background: var(--bg-darker, #111);
      }
      
      .rich-text-editor.readonly .toolbar-button {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .rich-text-editor.readonly .rich-text-editor-content {
        background: var(--bg-dark, #0a0a0a);
      }
      
      /* Placeholder styling */
      .rich-text-editor-content:empty:before {
        content: attr(data-placeholder);
        color: var(--text-gray, #aaa);
      }
      
      /* Selection highlighting */
      .rich-text-editor-content *::selection {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Enables editor (if previously disabled)
   */
  enable() {
    this.options.readOnly = false;
    this.container.classList.remove('readonly');
    this.editorElement.setAttribute('contenteditable', 'true');
  }

  /**
   * Disables editor
   */
  disable() {
    this.options.readOnly = true;
    this.container.classList.add('readonly');
    this.editorElement.setAttribute('contenteditable', 'false');
  }

  /**
   * Checks if editor is in read-only mode
   * @returns {boolean} Whether editor is read-only
   */
  isReadOnly() {
    return this.options.readOnly;
  }

  /**
   * Clears editor content
   */
  clear() {
    this.saveHistory();
    this.setContent('');
  }

  /**
   * Inserts text at cursor position
   * @param {string} text - Text to insert
   */
  insertText(text) {
    this.saveHistory();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    } else {
      this.editorElement.innerHTML += text;
    }
  }

  /**
   * Inserts HTML content at cursor position
   * @param {string} html - HTML to insert
   */
  insertHTML(html) {
    this.saveHistory();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const fragment = document.createRange().createContextualFragment(html);
      range.insertNode(fragment);
      
      // Move cursor to end of inserted content
      range.collapse(false);
    } else {
      this.editorElement.innerHTML += html;
    }
  }

  /**
   * Gets editor dimensions
   * @returns {Object} Object with width and height properties
   */
  getDimensions() {
    return {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight
    };
  }

  /**
   * Sets editor dimensions
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   */
  setDimensions(width, height) {
    if (width) this.container.style.width = `${width}px`;
    if (height) this.container.style.height = `${height}px`;
  }

  /**
   * Focuses the editor
   */
  focus() {
    this.editorElement.focus();
    
    // Move cursor to end if no selection
    if (!window.getSelection().toString()) {
      const range = document.createRange();
      range.selectNodeContents(this.editorElement);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Blurs the editor
   */
  blur() {
    this.editorElement.blur();
  }

  /**
   * Checks if editor has focus
   * @returns {boolean} Whether editor has focus
   */
  hasFocus() {
    return document.activeElement === this.editorElement;
  }

  /**
   * Sets editor theme
   * @param {string} theme - Theme name ('snow' or 'bubble')
   */
  setTheme(theme) {
    this.options.theme = theme;
    this.container.classList.remove('theme-snow', 'theme-bubble');
    this.container.classList.add(`theme-${theme}`);
  }

  /**
   * Gets current theme
   * @returns {string} Current theme name
   */
  getTheme() {
    return this.options.theme;
  }

  /**
   * Destroys the editor and cleans up resources
   */
  destroy() {
    // Remove event listeners
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Remove editor element
    if (this.editorElement && this.editorElement.parentNode) {
      this.editorElement.parentNode.removeChild(this.editorElement);
    }
    
    // Remove toolbar if it exists
    if (this.toolbar && this.toolbar.parentNode) {
      this.toolbar.parentNode.removeChild(this.toolbar);
    }
    
    // Remove status bar if it exists
    if (this.statusBar && this.statusBar.parentNode) {
      this.statusBar.parentNode.removeChild(this.statusBar);
    }
    
    // Clear history
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Serializes editor content to a portable format
   * @returns {Object} Serialized editor state
   */
  serialize() {
    return {
      content: this.getContent(),
      wordCount: this.getWordCount(),
      characterCount: this.getCharacterCount(),
      theme: this.getTheme(),
      readOnly: this.isReadOnly(),
      history: [...this.history],
      historyIndex: this.historyIndex
    };
  }

  /**
   * Deserializes editor state from a portable format
   * @param {Object} state - Serialized editor state
   */
  deserialize(state) {
    if (state.content !== undefined) {
      this.setContent(state.content);
    }
    if (state.theme !== undefined) {
      this.setTheme(state.theme);
    }
    if (state.readOnly !== undefined) {
      this.setReadOnly(state.readOnly);
    }
    if (state.history !== undefined) {
      this.history = [...state.history];
      this.historyIndex = state.historyIndex !== undefined ? state.historyIndex : -1;
    }
  }
}

/**
 * Initializes all rich text editors on the page
 * @param {HTMLElement|Document} container - Container to search for editors
 * @returns {Array<RichTextEditor>} Array of initialized editor instances
 */
function initRichTextEditors(container = document) {
  const editors = container.querySelectorAll('.rich-text-editor, [data-rich-text-editor]');
  const instances = [];

  editors.forEach(editorElement => {
    if (!editorElement.hasAttribute('data-editor-initialized')) {
      editorElement.setAttribute('data-editor-initialized', 'true');

      // Get options from data attributes
      const options = {
        theme: editorElement.dataset.theme || 'snow',
        readOnly: editorElement.dataset.readonly === 'true',
        maxLength: editorElement.dataset.maxlength ? parseInt(editorElement.dataset.maxlength) : null,
        placeholder: editorElement.dataset.placeholder || 'Compose your content here...',
        showStatusBar: editorElement.dataset.showStatusBar !== 'false',
        initialContent: editorElement.dataset.initialContent || null
      };

      const instance = new RichTextEditor(editorElement, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize rich text editors when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initRichTextEditors();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RichTextEditor, initRichTextEditors };
}

// Make available globally
window.RichTextEditor = RichTextEditor;
window.initRichTextEditors = initRichTextEditors;