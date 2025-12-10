/**
 * Keyboard Shortcut Utilities Module
 * Advanced keyboard shortcut management and binding utilities
 * Compatible with jazer-brand.css styling for keyboard-related utilities
 */

class KeyboardShortcutUtils {
  /**
   * Creates a new keyboard shortcut utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      enableGlobalShortcuts: true,
      enableScopeShortcuts: true,
      preventDefault: true,
      stopPropagation: false,
      priority: 'normal', // 'low', 'normal', 'high'
      ...options
    };

    this.shortcuts = new Map();
    this.scopes = new Map();
    this.activeScopes = new Set(['global']);
    this.recorder = null;
    this.comboBuffer = [];
    this.bufferTimeout = null;
    this.bufferTime = 500; // milliseconds
    this.modifiers = {
      'control': ['Control', 'Ctrl'],
      'shift': ['Shift'],
      'alt': ['Alt', 'Option'],
      'meta': ['Meta', 'Command', 'Cmd']
    };
    this.keys = new Set();
    
    this.init();
  }

  /**
   * Initializes the keyboard shortcut utilities
   */
  init() {
    // Set up keyboard event listeners
    this.bindEvents();
    
    // Add dynamic styles
    this.addDynamicStyles();
  }

  /**
   * Binds keyboard events
   */
  bindEvents() {
    // Use capture phase to ensure we catch events before other handlers
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    
    // Handle focus changes for scoped shortcuts
    document.addEventListener('focusin', this.handleFocusChange.bind(this));
  }

  /**
   * Handles keyboard down events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    const key = this.normalizeKey(e);
    const modifiers = this.getModifiers(e);
    const combination = this.createCombination(modifiers, key);
    
    // Check for active recorders first
    if (this.recorder) {
      e.preventDefault();
      this.recorder.callback(key, e);
      return;
    }
    
    // Check for active shortcuts
    const shortcutsToCheck = this.getActiveShortcuts();
    
    for (const [combo, shortcut] of shortcutsToCheck) {
      if (this.matchesCombination(combination, combo)) {
        if (this.options.preventDefault) {
          e.preventDefault();
        }
        
        if (this.options.stopPropagation) {
          e.stopPropagation();
        }
        
        // Execute the handler
        const result = shortcut.handler(e, combination);
        
        // If handler returns false, stop processing other shortcuts
        if (result === false) {
          break;
        }
      }
    }
  }

  /**
   * Handles focus change events
   * @param {FocusEvent} e - Focus event
   */
  handleFocusChange(e) {
    const newScope = this.getScopeFromElement(e.target);
    
    // Update active scopes based on focused element
    if (newScope) {
      this.setActiveScope(newScope);
    }
  }

  /**
   * Normalizes a keyboard event key
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {string} Normalized key
   */
  normalizeKey(e) {
    // Convert common keys to standard names
    switch (e.key.toLowerCase()) {
      case ' ': return 'space';
      case 'arrowup': return 'up';
      case 'arrowdown': return 'down';
      case 'arrowleft': return 'left';
      case 'arrowright': return 'right';
      case 'escape': return 'esc';
      case 'delete': return 'del';
      case 'control': return 'ctrl';
      case 'alt': return 'alt';
      case 'shift': return 'shift';
      case 'meta': return 'meta';
      case 'enter': return 'enter';
      case 'backspace': return 'backspace';
      case 'tab': return 'tab';
      default: return e.key.toLowerCase();
    }
  }

  /**
   * Gets active modifiers from an event
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {Array} Array of active modifiers
   */
  getModifiers(e) {
    const modifiers = [];
    
    if (e.ctrlKey) modifiers.push('ctrl');
    if (e.shiftKey) modifiers.push('shift');
    if (e.altKey) modifiers.push('alt');
    if (e.metaKey) modifiers.push('meta');
    
    return modifiers;
  }

  /**
   * Creates a normalized combination string
   * @param {Array} modifiers - Array of modifiers
   * @param {string} key - Key name
   * @returns {string} Normalized combination
   */
  createCombination(modifiers, key) {
    // Sort modifiers to ensure consistent ordering
    const sortedModifiers = [...modifiers].sort();
    return [...sortedModifiers, key].join('+');
  }

  /**
   * Checks if a combination matches a shortcut pattern
   * @param {string} combination - Actual combination pressed
   * @param {string} pattern - Shortcut pattern
   * @returns {boolean} Whether the combination matches the pattern
   */
  matchesCombination(combination, pattern) {
    // Exact match
    if (combination === pattern) return true;
    
    // Handle wildcards and complex patterns
    const comboParts = combination.split('+');
    const patternParts = pattern.split('+');
    
    if (comboParts.length !== patternParts.length) return false;
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const comboPart = comboParts[i];
      
      // Wildcard match
      if (patternPart === '*') continue;
      
      // Modifier key aliases
      if (this.isModifierAlias(patternPart, comboPart)) continue;
      
      // Direct match
      if (patternPart.toLowerCase() !== comboPart.toLowerCase()) return false;
    }
    
    return true;
  }

  /**
   * Checks if two modifiers are aliases of each other
   * @param {string} patternModifier - Pattern modifier
   * @param {string} actualModifier - Actual modifier
   * @returns {boolean} Whether they are aliases
   */
  isModifierAlias(patternModifier, actualModifier) {
    const normalizedPattern = patternModifier.toLowerCase();
    const normalizedActual = actualModifier.toLowerCase();
    
    for (const [standard, aliases] of Object.entries(this.modifiers)) {
      if (standard === normalizedPattern && 
          (aliases.includes(normalizedActual) || normalizedActual === standard)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Gets all active shortcuts based on current scope
   * @returns {Map} Map of active shortcuts
   */
  getActiveShortcuts() {
    const activeShortcuts = new Map();
    
    // Add global shortcuts first
    if (this.shortcuts.has('global')) {
      const globalShortcuts = this.shortcuts.get('global');
      for (const [combo, handler] of globalShortcuts) {
        activeShortcuts.set(combo, handler);
      }
    }
    
    // Add active scope shortcuts
    for (const scope of this.activeScopes) {
      if (scope !== 'global' && this.shortcuts.has(scope)) {
        const scopeShortcuts = this.shortcuts.get(scope);
        for (const [combo, handler] of scopeShortcuts) {
          activeShortcuts.set(combo, handler);
        }
      }
    }
    
    return activeShortcuts;
  }

  /**
   * Registers a keyboard shortcut
   * @param {string|Array} keys - Key combination or array of key combinations
   * @param {Function} handler - Function to execute when shortcut is triggered
   * @param {string} scope - Scope for the shortcut (default: 'global')
   * @param {Object} options - Additional options
   * @returns {Function} Function to unregister the shortcut
   */
  register(keys, handler, scope = 'global', options = {}) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    
    // Ensure keys is an array
    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    // Create scope if it doesn't exist
    if (!this.shortcuts.has(scope)) {
      this.shortcuts.set(scope, new Map());
    }
    
    const scopeShortcuts = this.shortcuts.get(scope);
    const registeredCombos = [];
    
    for (const key of keyArray) {
      const normalizedCombo = this.normalizeCombination(key);
      scopeShortcuts.set(normalizedCombo, {
        handler,
        options: { ...this.options, ...options },
        registeredAt: Date.now()
      });
      
      registeredCombos.push(normalizedCombo);
    }
    
    // Return unregister function
    return () => {
      for (const combo of registeredCombos) {
        scopeShortcuts.delete(combo);
      }
    };
  }

  /**
   * Normalizes a key combination string
   * @param {string} combination - Raw combination string
   * @returns {string} Normalized combination
   */
  normalizeCombination(combination) {
    // Normalize the combination string
    return combination
      .toLowerCase()
      .split('+')
      .map(part => part.trim())
      .sort((a, b) => {
        // Put modifiers first
        const isModifierA = ['ctrl', 'shift', 'alt', 'meta'].includes(a);
        const isModifierB = ['ctrl', 'shift', 'alt', 'meta'].includes(b);
        
        if (isModifierA && !isModifierB) return -1;
        if (!isModifierA && isModifierB) return 1;
        return 0;
      })
      .join('+');
  }

  /**
   * Unregisters a keyboard shortcut
   * @param {string} keys - Key combination
   * @param {string} scope - Scope for the shortcut (default: 'global')
   * @returns {boolean} Whether the shortcut was successfully unregistered
   */
  unregister(keys, scope = 'global') {
    const normalizedCombo = this.normalizeCombination(keys);
    const scopeShortcuts = this.shortcuts.get(scope);
    
    if (scopeShortcuts) {
      return scopeShortcuts.delete(normalizedCombo);
    }
    
    return false;
  }

  /**
   * Creates a new scope for keyboard shortcuts
   * @param {string} name - Scope name
   * @returns {string} Scope name
   */
  createScope(name) {
    if (!name) {
      throw new Error('Scope name is required');
    }
    
    if (!this.shortcuts.has(name)) {
      this.shortcuts.set(name, new Map());
      this.scopes.set(name, {
        active: false,
        createdAt: Date.now()
      });
    }
    
    return name;
  }

  /**
   * Activates a scope
   * @param {string} scope - Scope name
   * @returns {boolean} Whether the scope was activated
   */
  setActiveScope(scope) {
    if (!this.scopes.has(scope)) {
      console.warn(`Scope '${scope}' does not exist`);
      return false;
    }
    
    // Deactivate all scopes except global
    for (const [scopeName, scopeData] of this.scopes) {
      if (scopeName !== 'global') {
        scopeData.active = scopeName === scope;
        if (scopeName === scope) {
          this.activeScopes.add(scopeName);
        } else {
          this.activeScopes.delete(scopeName);
        }
      }
    }
    
    return true;
  }

  /**
   * Gets the scope from an element based on data attributes
   * @param {Element} element - Element to check
   * @returns {string|null} Scope name or null
   */
  getScopeFromElement(element) {
    if (!element) return null;
    
    // Check element and its parents for data-shortcut-scope attribute
    let current = element;
    while (current) {
      if (current.dataset && current.dataset.shortcutScope) {
        return current.dataset.shortcutScope;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  /**
   * Sets up an element to be aware of keyboard shortcuts
   * @param {HTMLElement} element - Element to make shortcut-aware
   * @param {string} scope - Scope name for the element
   * @returns {Function} Function to remove shortcut awareness
   */
  setupElementShortcuts(element, scope) {
    if (!element) return () => {};
    
    // Set the scope attribute on the element
    element.setAttribute('data-shortcut-scope', scope);
    
    // Return function to remove the attribute
    return () => {
      element.removeAttribute('data-shortcut-scope');
    };
  }

  /**
   * Records a keyboard shortcut
   * @param {Function} callback - Function to call with the recorded shortcut
   * @param {Object} options - Recording options
   * @returns {Function} Function to cancel recording
   */
  recordShortcut(callback, options = {}) {
    if (this.recorder) {
      this.stopRecording();
    }
    
    this.recorder = {
      callback,
      options: { ...options }
    };
    
    // Show visual indicator
    this.showRecorderIndicator();
    
    // Return function to cancel recording
    return () => {
      this.stopRecording();
    };
  }

  /**
   * Shows a visual indicator for shortcut recording
   */
  showRecorderIndicator() {
    if (this.recordingIndicator) {
      this.recordingIndicator.remove();
    }
    
    this.recordingIndicator = document.createElement('div');
    this.recordingIndicator.className = 'keyboard-shortcut-recorder';
    this.recordingIndicator.textContent = 'Press a key combination...';
    this.recordingIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-darker, #111);
      color: var(--text-light, #fff);
      padding: 10px 20px;
      border: 1px solid var(--border-default, #4facfe);
      border-radius: 4px;
      z-index: 10000;
      font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(this.recordingIndicator);
  }

  /**
   * Stops recording a keyboard shortcut
   */
  stopRecording() {
    if (this.recorder) {
      this.recorder = null;
    }
    
    if (this.recordingIndicator && this.recordingIndicator.parentNode) {
      this.recordingIndicator.parentNode.removeChild(this.recordingIndicator);
      this.recordingIndicator = null;
    }
  }

  /**
   * Gets all registered shortcuts
   * @param {string} scope - Scope to get shortcuts for (default: all scopes)
   * @returns {Object} Object with scope names as keys and shortcuts as values
   */
  getShortcuts(scope) {
    if (scope) {
      if (this.shortcuts.has(scope)) {
        return Array.from(this.shortcuts.get(scope).keys());
      }
      return [];
    }
    
    const allShortcuts = {};
    for (const [scopeName, shortcuts] of this.shortcuts) {
      allShortcuts[scopeName] = Array.from(shortcuts.keys());
    }
    
    return allShortcuts;
  }

  /**
   * Clears all shortcuts in a scope
   * @param {string} scope - Scope name (default: 'all' for all scopes)
   * @returns {boolean} Whether the operation was successful
   */
  clearShortcuts(scope = 'all') {
    if (scope === 'all') {
      this.shortcuts.clear();
      return true;
    }
    
    if (this.shortcuts.has(scope)) {
      this.shortcuts.get(scope).clear();
      return true;
    }
    
    return false;
  }

  /**
   * Creates a keyboard shortcut provider for React-like contexts
   * @param {Object} defaultShortcuts - Default shortcuts for the provider
   * @returns {Object} Keyboard shortcut provider
   */
  createProvider(defaultShortcuts = {}) {
    const provider = {
      shortcuts: new Map(),
      listeners: [],
      
      // Add a shortcut
      add: (keys, handler, options = {}) => {
        const unregister = this.register(keys, handler, options.scope || 'global', options);
        
        // Store for potential cleanup
        const shortcutId = { keys, handler, options };
        this.shortcuts.set(shortcutId, unregister);
        
        return () => {
          unregister();
          this.shortcuts.delete(shortcutId);
        };
      },
      
      // Remove a shortcut
      remove: (keys) => {
        return this.unregister(keys);
      },
      
      // Activate the provider
      activate: () => {
        // Enable all shortcuts in this provider
      },
      
      // Deactivate the provider
      deactivate: () => {
        // Disable all shortcuts in this provider
      },
      
      // Add event listener for shortcut changes
      addListener: (listener) => {
        this.listeners.push(listener);
      },
      
      // Remove event listener
      removeListener: (listener) => {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
    
    // Register default shortcuts
    for (const [keys, handler] of Object.entries(defaultShortcuts)) {
      provider.add(keys, handler);
    }
    
    return provider;
  }

  /**
   * Creates a sequence of keyboard shortcuts that must be pressed in order
   * @param {Array} sequence - Array of key combinations in sequence
   * @param {Function} handler - Function to execute when sequence is completed
   * @param {string} scope - Scope for the sequence (default: 'global')
   * @param {Object} options - Additional options
   * @returns {Function} Function to unregister the sequence
   */
  createSequence(sequence, handler, scope = 'global', options = {}) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      throw new Error('Sequence must be a non-empty array of key combinations');
    }
    
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    
    let currentStep = 0;
    const sequenceTimeout = options.timeout || 1000;
    let sequenceTimer;
    
    // Function to handle the sequence progress
    const sequenceHandler = (e, combo) => {
      // Check if the current step matches the expected combination
      if (this.normalizeCombination(combo) === this.normalizeCombination(sequence[currentStep])) {
        currentStep++;
        
        // Reset the timeout
        clearTimeout(sequenceTimer);
        
        if (currentStep === sequence.length) {
          // Complete sequence
          currentStep = 0;
          return handler(e);
        } else {
          // Set timeout for next step
          sequenceTimer = setTimeout(() => {
            currentStep = 0; // Reset on timeout
          }, sequenceTimeout);
        }
      } else {
        // Wrong key pressed, reset
        currentStep = 0;
      }
    };
    
    // Register all sequence combinations as shortcuts
    const unregisterFuncs = [];
    for (const combo of sequence) {
      const unregister = this.register(combo, sequenceHandler, scope, options);
      unregisterFuncs.push(unregister);
    }
    
    // Return function to unregister the entire sequence
    return () => {
      for (const unregister of unregisterFuncs) {
        unregister();
      }
      clearTimeout(sequenceTimer);
    };
  }

  /**
   * Creates a chord (simultaneous keys) shortcut
   * @param {Array} keys - Array of keys that must be pressed simultaneously
   * @param {Function} handler - Function to execute when chord is pressed
   * @param {string} scope - Scope for the chord (default: 'global')
   * @param {Object} options - Additional options
   * @returns {Function} Function to unregister the chord
   */
  createChord(keys, handler, scope = 'global', options = {}) {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new Error('Keys must be a non-empty array of key combinations');
    }
    
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    
    // Combine keys into a single chord combination
    const chord = keys.join('+');
    
    return this.register(chord, handler, scope, options);
  }

  /**
   * Simulates a keyboard shortcut
   * @param {string} combination - Key combination to simulate
   * @param {Element} element - Element to dispatch event on (default: document)
   * @returns {boolean} Whether the simulation was successful
   */
  simulateShortcut(combination, element = document) {
    // Parse the combination into its parts
    const parts = combination.split('+');
    const key = parts.filter(part => !['ctrl', 'shift', 'alt', 'meta'].includes(part.toLowerCase())).pop() || '';
    const ctrl = parts.some(part => ['ctrl', 'control'].includes(part.toLowerCase()));
    const shift = parts.some(part => ['shift'].includes(part.toLowerCase()));
    const alt = parts.some(part => ['alt', 'option'].includes(part.toLowerCase()));
    const meta = parts.some(part => ['meta', 'cmd', 'command'].includes(part.toLowerCase()));
    
    // Create and dispatch the event
    const event = new KeyboardEvent('keydown', {
      key: key,
      ctrlKey: ctrl,
      shiftKey: shift,
      altKey: alt,
      metaKey: meta,
      bubbles: true
    });
    
    element.dispatchEvent(event);
    return event.defaultPrevented;
  }

  /**
   * Creates a keyboard shortcut hint display
   * @param {HTMLElement} container - Container for the hints
   * @param {Object} options - Hint display options
   * @returns {Object} Hint display controller
   */
  createHintDisplay(container, options = {}) {
    const defaults = {
      position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
      showDescriptions: true,
      showScope: true,
      maxHints: 10,
      ...options
    };

    const hintDisplay = document.createElement('div');
    hintDisplay.className = 'keyboard-hint-display';
    
    // Apply position classes
    hintDisplay.classList.add(`hint-position-${defaults.position}`);
    
    // Apply styles
    hintDisplay.style.cssText = `
      position: fixed;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid var(--border-default, #4facfe);
      border-radius: 6px;
      padding: 15px;
      max-width: 300px;
      max-height: 300px;
      overflow-y: auto;
    `;
    
    // Position based on option
    switch (defaults.position) {
      case 'top-left':
        hintDisplay.style.top = '10px';
        hintDisplay.style.left = '10px';
        break;
      case 'top-right':
        hintDisplay.style.top = '10px';
        hintDisplay.style.right = '10px';
        break;
      case 'bottom-left':
        hintDisplay.style.bottom = '10px';
        hintDisplay.style.left = '10px';
        break;
      default: // bottom-right
        hintDisplay.style.bottom = '10px';
        hintDisplay.style.right = '10px';
    }
    
    // Create the header
    const header = document.createElement('h3');
    header.className = 'hint-header';
    header.style.cssText = `
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--jazer-cyan, #00f2ea);
      font-size: 0.9rem;
      border-bottom: 1px solid var(--border-lighter, #222);
      padding-bottom: 5px;
    `;
    header.textContent = 'Keyboard Shortcuts';
    hintDisplay.appendChild(header);
    
    // Function to update the hint display
    const updateHints = () => {
      // Clear the hint display
      const existingHints = hintDisplay.querySelectorAll('.keyboard-hint-item');
      existingHints.forEach(hint => hint.remove());
      
      // Get active shortcuts
      const activeShortcuts = this.getActiveShortcuts();
      const shortcutList = Array.from(activeShortcuts.entries());
      
      // Limit to maxHints
      const hintsToShow = shortcutList.slice(0, defaults.maxHints);
      
      // Create hint elements
      for (const [combo, shortcut] of hintsToShow) {
        const hintItem = document.createElement('div');
        hintItem.className = 'keyboard-hint-item';
        hintItem.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        `;
        
        const comboDisplay = document.createElement('kbd');
        comboDisplay.className = 'shortcut-combo';
        comboDisplay.textContent = combo.toUpperCase();
        comboDisplay.style.cssText = `
          background: var(--bg-dark, #0a0a0a);
          border: 1px solid var(--border-default, #4facfe);
          color: var(--text-light, #fff);
          padding: 3px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.8rem;
        `;
        
        const description = document.createElement('span');
        description.className = 'shortcut-description';
        description.textContent = shortcut.description || shortcut.handler.name || 'Keyboard shortcut';
        description.style.cssText = `
          flex: 1;
          margin-left: 10px;
          font-size: 0.8rem;
        `;
        
        hintItem.appendChild(comboDisplay);
        if (defaults.showDescriptions) {
          hintItem.appendChild(description);
        }
        
        hintDisplay.appendChild(hintItem);
      }
    };
    
    // Add the hint display to the container
    container.appendChild(hintDisplay);
    
    // Update hints initially
    updateHints();
    
    return {
      display: hintDisplay,
      update: updateHints,
      show: () => { hintDisplay.style.display = 'block'; },
      hide: () => { hintDisplay.style.display = 'none'; },
      destroy: () => {
        if (hintDisplay.parentNode) {
          hintDisplay.parentNode.removeChild(hintDisplay);
        }
      }
    };
  }

  /**
   * Creates a modal dialog for capturing keyboard shortcuts
   * @param {Function} onCapture - Callback function for shortcut capture
   * @param {Object} options - Dialog options
   * @returns {Object} Dialog controller
   */
  createCaptureDialog(onCapture, options = {}) {
    const defaults = {
      title: 'Capture Shortcut',
      placeholder: 'Press a key combination...',
      confirmText: 'Save',
      cancelText: 'Cancel',
      width: '400px',
      ...options
    };

    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'shortcut-capture-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'shortcut-capture-modal';
    modal.style.cssText = `
      background: var(--bg-darker, #111);
      border: 2px solid var(--border-default, #4facfe);
      border-radius: 8px;
      padding: 20px;
      width: ${defaults.width};
      max-width: 90vw;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;

    // Create title
    const title = document.createElement('h2');
    title.className = 'capture-title';
    title.textContent = defaults.title;
    title.style.cssText = `
      margin-top: 0;
      margin-bottom: 15px;
      color: var(--jazer-cyan, #00f2ea);
      font-size: 1.2rem;
    `;
    modal.appendChild(title);

    // Create input display
    const display = document.createElement('div');
    display.className = 'capture-display';
    display.textContent = defaults.placeholder;
    display.style.cssText = `
      padding: 15px;
      background: var(--bg-dark, #0a0a0a);
      border: 1px solid var(--border-lighter, #222);
      border-radius: 6px;
      font-family: monospace;
      text-align: center;
      margin-bottom: 15px;
      font-size: 1.1rem;
      color: var(--text-light, #fff);
    `;
    modal.appendChild(display);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    `;

    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn-primary capture-confirm';
    confirmButton.textContent = defaults.confirmText;
    confirmButton.disabled = true;
    confirmButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid var(--border-default, #4facfe);
      border-radius: 4px;
      background: var(--bg-dark, #0a0a0a);
      color: white;
      cursor: pointer;
    `;
    confirmButton.addEventListener('click', () => {
      if (capturedCombination) {
        onCapture(capturedCombination);
        closeDialog();
      }
    });
    buttonsContainer.appendChild(confirmButton);

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary capture-cancel';
    cancelButton.textContent = defaults.cancelText;
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid var(--border-default, #4facfe);
      border-radius: 4px;
      background: var(--bg-darker, #111);
      color: white;
      cursor: pointer;
    `;
    cancelButton.addEventListener('click', closeDialog);
    buttonsContainer.appendChild(cancelButton);

    modal.appendChild(buttonsContainer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    let capturedCombination = null;

    // Event handler for capturing
    const captureHandler = (e) => {
      e.preventDefault();
      
      const key = this.normalizeKey(e);
      const modifiers = this.getModifiers(e);
      const combination = this.createCombination(modifiers, key);
      
      // Update display
      display.textContent = combination.toUpperCase();
      capturedCombination = combination;
      
      // Enable confirm button
      confirmButton.disabled = false;
    };

    // Add event listener to the modal
    modal.addEventListener('keydown', captureHandler, true);

    // Function to close the dialog
    const closeDialog = () => {
      document.removeEventListener('keydown', captureHandler, true);
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    };

    // Auto-close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeDialog();
      }
    });

    return {
      modal: backdrop,
      close: closeDialog
    };
  }

  /**
   * Adds dynamic styles for keyboard utilities
   */
  addDynamicStyles() {
    if (document.getElementById('keyboard-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'keyboard-utilities-styles';
    style.textContent = `
      /* Keyboard shortcut related styles */
      .keyboard-shortcut-recorder {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
        padding: 10px 20px;
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 4px;
        z-index: 10000;
        font-family: sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .keyboard-hint-display {
        position: fixed;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.85);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        padding: 15px;
        max-width: 300px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .hint-position-top-left {
        top: 10px;
        left: 10px;
      }
      
      .hint-position-top-right {
        top: 10px;
        right: 10px;
      }
      
      .hint-position-bottom-left {
        bottom: 10px;
        left: 10px;
      }
      
      .hint-position-bottom-right {
        bottom: 10px;
        right: 10px;
      }
      
      .keyboard-hint-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
      }
      
      .shortcut-combo {
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        color: var(--text-light, #fff);
        padding: 3px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.8rem;
      }
      
      .shortcut-description {
        flex: 1;
        margin-left: 10px;
        font-size: 0.8rem;
      }
      
      .shortcut-capture-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .shortcut-capture-modal {
        background: var(--bg-darker, #111);
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 8px;
        padding: 20px;
        width: 400px;
        max-width: 90vw;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      
      .capture-display {
        padding: 15px;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-lighter, #222);
        border-radius: 6px;
        font-family: monospace;
        text-align: center;
        margin-bottom: 15px;
        font-size: 1.1rem;
        color: var(--text-light, #fff);
      }
      
      .capture-confirm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* Focus style for keyboard navigation */
      .keyboard-focused {
        outline: 2px solid var(--jazer-cyan, #00f2ea);
        outline-offset: 2px;
      }
      
      /* Visually indicate active shortcuts */
      .shortcut-active {
        animation: highlightShortcut 0.2s ease;
      }
      
      @keyframes highlightShortcut {
        0% { background-color: rgba(0, 242, 234, 0.1); }
        50% { background-color: rgba(0, 242, 234, 0.3); }
        100% { background-color: rgba(0, 242, 234, 0.1); }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the keyboard shortcut utilities and cleans up
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.removeEventListener('focusin', this.handleFocusChange);
    
    // Stop any active recording
    this.stopRecording();
    
    // Clear all shortcuts
    this.shortcuts.clear();
    this.scopes.clear();
    this.activeScopes.clear();
  }
}

/**
 * Creates a new keyboard shortcut utilities instance
 * @param {Object} options - Configuration options
 * @returns {KeyboardShortcutUtils} New instance
 */
function createKeyboardShortcutUtils(options = {}) {
  return new KeyboardShortcutUtils(options);
}

// Create default instance
const keyboardShortcutUtils = new KeyboardShortcutUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    KeyboardShortcutUtils,
    createKeyboardShortcutUtils,
    keyboardShortcutUtils
  };
}

// Make available globally
window.KeyboardShortcutUtils = KeyboardShortcutUtils;
window.createKeyboardShortcutUtils = createKeyboardShortcutUtils;
window.keyboardShortcutUtils = keyboardShortcutUtils;