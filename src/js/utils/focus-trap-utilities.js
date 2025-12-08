/**
 * Focus Trap Utilities Module
 * Advanced focus trapping utilities for accessibility and modal management
 * Compatible with jazer-brand.css styling for focus-related utilities
 */

class FocusTrapUtils {
  /**
   * Creates a new focus trap utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      enableAutoInit: true,
      defaultReturnFocus: true,
      defaultEscapeDeactivates: true,
      defaultClickOutsideDeactivates: true,
      defaultPauseOnFocusLost: false,
      ...options
    };

    this.traps = new Map();
    this.activeTrap = null;
    this.pausedTrap = null;
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[contenteditable]:not([contenteditable="false"])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    this.focusableSelector = this.focusableSelectors.join(',');
  }

  /**
   * Creates a focus trap for a container element
   * @param {HTMLElement} container - Container element to trap focus in
   * @param {Object} options - Focus trap options
   * @returns {Object} Focus trap controller with activate/deactivate methods
   */
  createTrap(container, options = {}) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Focus trap requires a valid container element');
    }

    const trapOptions = { ...this.options, ...options };

    // Store the starting element to return focus to
    let startElement = trapOptions.startFocused || document.activeElement;

    // Create the focus trap controller
    const trap = {
      container,
      options: trapOptions,
      active: false,
      paused: false,
      returnFocus: trapOptions.returnFocus !== false,
      startElement,
      focusableElements: [],

      // Activate the trap
      activate: () => {
        if (trap.active) return trap;

        // Store the currently focused element
        if (trapOptions.returnFocus) {
          trap.startElement = document.activeElement;
        }

        // Set up the trap
        trap.setup();

        // Focus the first focusable element
        if (trapOptions.autoFocus) {
          trap.focusFirst();
        }

        trap.active = true;
        trap.paused = false;
        this.activeTrap = trap;

        // Execute callback
        if (trapOptions.onActivate) {
          trapOptions.onActivate(trap);
        }

        return trap;
      },

      // Deactivate the trap
      deactivate: () => {
        if (!trap.active) return trap;

        // Remove event listeners
        trap.teardown();

        // Return focus if requested
        if (trap.returnFocus && trap.startElement && trap.startElement.focus) {
          try {
            trap.startElement.focus();
          } catch (err) {
            // If the original element is not focusable anymore, focus the body
            document.body.focus();
          }
        }

        trap.active = false;
        if (this.activeTrap === trap) {
          this.activeTrap = null;
        }

        // Execute callback
        if (trapOptions.onDeactivate) {
          trapOptions.onDeactivate(trap);
        }

        return trap;
      },

      // Pause the trap
      pause: () => {
        if (!trap.active) return trap;

        trap.paused = true;
        trap.teardownEventListeners();
        this.pausedTrap = trap;

        if (trapOptions.onPause) {
          trapOptions.onPause(trap);
        }

        return trap;
      },

      // Resume the trap
      resume: () => {
        if (!trap.active || !trap.paused) return trap;

        trap.paused = false;
        trap.setupEventListeners();
        this.pausedTrap = null;

        if (trapOptions.onResume) {
          trapOptions.onResume(trap);
        }

        return trap;
      },

      // Setup focus trap
      setup: () => {
        // Get all focusable elements in the container
        trap.focusableElements = Array.from(container.querySelectorAll(trap.focusableSelector));
        
        // Add container to focusable elements if it can accept focus
        if (container.matches(trap.focusableSelector)) {
          trap.focusableElements.unshift(container);
        }

        // Filter for truly focusable elements
        trap.focusableElements = trap.focusableElements.filter(el => 
          el.tabIndex !== -1 && 
          !el.disabled && 
          el.offsetParent !== null
        );

        // Setup event listeners
        trap.setupEventListeners();
      },

      // Teardown focus trap
      teardown: () => {
        trap.teardownEventListeners();
        trap.focusableElements = [];
      },

      // Setup event listeners
      setupEventListeners: () => {
        // Listen for focus events on the document
        trap.focusInHandler = (e) => trap.handleFocusIn(e);
        trap.focusOutHandler = (e) => trap.handleFocusOut(e);
        trap.keyDownHandler = (e) => trap.handleKeyDown(e);
        
        document.addEventListener('focusin', trap.focusInHandler, true);
        document.addEventListener('focusout', trap.focusOutHandler, true);
        document.addEventListener('keydown', trap.keyDownHandler, true);
      },

      // Teardown event listeners
      teardownEventListeners: () => {
        if (trap.focusInHandler) {
          document.removeEventListener('focusin', trap.focusInHandler, true);
        }
        if (trap.focusOutHandler) {
          document.removeEventListener('focusout', trap.focusOutHandler, true);
        }
        if (trap.keyDownHandler) {
          document.removeEventListener('keydown', trap.keyDownHandler, true);
        }
      },

      // Handle focus in events
      handleFocusIn: (e) => {
        if (trap.paused) return;
        
        // If focus is within the container, do nothing
        if (container.contains(e.target)) return;
        
        // If focus is outside the container, redirect to the appropriate element
        if (trap.focusableElements.length > 0) {
          if (trap.focusableElements.length === 1) {
            trap.focusableElements[0].focus();
          } else {
            // Focus the first element if we just tabbed to something after the container
            // or the last element if we tabbed to something before the container
            const containerIndex = trap.getContainerIndex();
            const targetIndex = trap.getElementIndex(e.target);
            
            if (targetIndex !== -1 && targetIndex < containerIndex) {
              trap.focusLast();
            } else {
              trap.focusFirst();
            }
          }
        } else {
          // If no focusable elements, focus the container itself
          container.focus();
        }
      },

      // Handle focus out events
      handleFocusOut: (e) => {
        if (trap.paused) return;
        
        // Check if focus is leaving the container and we need to refocus
        if (!container.contains(e.relatedTarget) && container.contains(e.target)) {
          if (trap.focusableElements.length > 0) {
            trap.focusFirst();
          } else {
            container.focus();
          }
        }
      },

      // Handle keydown events (especially Tab)
      handleKeyDown: (e) => {
        if (trap.paused) return;
        
        if (e.key === 'Tab') {
          trap.handleTabEvent(e);
        } else if (e.key === 'Escape' && trapOptions.escapeDeactivates) {
          e.preventDefault();
          trap.deactivate();
        }
      },

      // Handle Tab key events to cycle through focusable elements
      handleTabEvent: (e) => {
        if (trap.focusableElements.length === 0) return;

        const focusedElement = document.activeElement;
        const focusedIndex = trap.focusableElements.indexOf(focusedElement);

        // If no focused element in container, focus the first/last element
        if (focusedIndex === -1) {
          if (e.shiftKey) {
            trap.focusLast();
          } else {
            trap.focusFirst();
          }
          e.preventDefault();
          return;
        }

        // If shift-tabbing on the first element, go to the last
        if (e.shiftKey && focusedIndex === 0) {
          trap.focusLast();
          e.preventDefault();
          return;
        }

        // If tabbing on the last element, go to the first
        if (!e.shiftKey && focusedIndex === trap.focusableElements.length - 1) {
          trap.focusFirst();
          e.preventDefault();
          return;
        }
      },

      // Focus first focusable element
      focusFirst: () => {
        if (trap.focusableElements.length > 0) {
          trap.focusableElements[0].focus({ preventScroll: trapOptions.preventScroll });
        } else {
          container.focus({ preventScroll: trapOptions.preventScroll });
        }
      },

      // Focus last focusable element
      focusLast: () => {
        if (trap.focusableElements.length > 0) {
          trap.focusableElements[trap.focusableElements.length - 1].focus({ preventScroll: trapOptions.preventScroll });
        } else {
          container.focus({ preventScroll: trapOptions.preventScroll });
        }
      },

      // Get index of an element in focusable list
      getElementIndex: (element) => {
        return trap.focusableElements.indexOf(element);
      },

      // Get container index relative to focus order
      getContainerIndex: () => {
        const allFocusable = Array.from(document.querySelectorAll(trap.focusableSelector));
        return allFocusable.indexOf(container);
      }
    };

    // Store the trap instance
    this.traps.set(container, trap);

    // Auto-init if enabled
    if (trapOptions.autoInit !== false) {
      trap.setup();
    }

    return trap;
  }

  /**
   * Creates a focus trap specifically for modal dialogs
   * @param {HTMLElement} modalElement - Modal element to trap focus in
   * @param {Object} options - Focus trap options
   * @returns {Object} Focus trap controller for the modal
   */
  createModalTrap(modalElement, options = {}) {
    const modalOptions = {
      autoFocus: true,
      returnFocus: true,
      escapeDeactivates: true,
      clickOutsideDeactivates: true,
      pauseOnFocusLost: false,
      ...options
    };

    const trap = this.createTrap(modalElement, modalOptions);

    // Add specific modal behavior
    const originalActivate = trap.activate;
    const originalDeactivate = trap.deactivate;

    trap.activate = () => {
      originalActivate();
      
      // Ensure modal is visible
      if (modalElement.style.display === 'none') {
        modalElement.style.display = 'block';
      }
      
      // Add modal-specific classes
      modalElement.classList.add('focus-trap-modal-active');
      
      return trap;
    };

    trap.deactivate = () => {
      // Remove modal-specific classes
      modalElement.classList.remove('focus-trap-modal-active');
      
      // Hide modal if option is enabled
      if (modalOptions.hideOnDeactivate !== false) {
        modalElement.style.display = 'none';
      }
      
      return originalDeactivate();
    };

    // Handle click outside to close
    if (modalOptions.clickOutsideDeactivates) {
      trap.clickHandler = (e) => {
        if (!modalElement.contains(e.target)) {
          trap.deactivate();
        }
      };
      
      trap.container.addEventListener('click', (e) => {
        if (e.target === modalElement && modalOptions.closeOnOverlayClick !== false) {
          trap.deactivate();
        }
      });
      
      document.addEventListener('click', trap.clickHandler);
    }

    return trap;
  }

  /**
   * Creates a focus trap for sidebar/drawer elements
   * @param {HTMLElement} drawerElement - Drawer element to trap focus in
   * @param {Object} options - Focus trap options
   * @returns {Object} Focus trap controller for the drawer
   */
  createDrawerTrap(drawerElement, options = {}) {
    const drawerOptions = {
      autoFocus: true,
      returnFocus: true,
      escapeDeactivates: true,
      clickOutsideDeactivates: true,
      pauseOnFocusLost: false,
      ...options
    };

    const trap = this.createTrap(drawerElement, drawerOptions);

    // Add drawer-specific behavior
    const originalActivate = trap.activate;
    const originalDeactivate = trap.deactivate;

    trap.activate = () => {
      originalActivate();
      
      // Add drawer-specific classes
      drawerElement.classList.add('focus-trap-drawer-active');
      drawerElement.setAttribute('aria-hidden', 'false');
      
      // Add backdrop if needed
      if (drawerOptions.showBackdrop) {
        trap.createBackdrop();
      }
      
      return trap;
    };

    trap.deactivate = () => {
      // Remove drawer-specific classes
      drawerElement.classList.remove('focus-trap-drawer-active');
      drawerElement.setAttribute('aria-hidden', 'true');
      
      // Remove backdrop if needed
      if (trap.backdrop) {
        document.body.removeChild(trap.backdrop);
        trap.backdrop = null;
      }
      
      return originalDeactivate();
    };

    trap.createBackdrop = () => {
      trap.backdrop = document.createElement('div');
      trap.backdrop.classList.add('focus-trap-backdrop');
      trap.backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
      `;
      
      trap.backdrop.addEventListener('click', () => {
        if (drawerOptions.closeOnBackdropClick !== false) {
          trap.deactivate();
        }
      });
      
      document.body.appendChild(trap.backdrop);
    };

    return trap;
  }

  /**
   * Gets all focusable elements within a container
   * @param {HTMLElement} container - Container to search in
   * @returns {Array} Array of focusable elements
   */
  getFocusableElements(container) {
    if (!container) return [];

    const elements = Array.from(container.querySelectorAll(this.focusableSelector));
    
    // Filter for truly focusable elements
    return elements.filter(el => {
      // Check if element is visible
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      
      // Check if element is disabled
      if (el.disabled) return false;
      
      // Check if element has tabIndex -1
      if (el.tabIndex === -1) return false;
      
      return true;
    });
  }

  /**
   * Focuses the next element in the tab order
   * @param {HTMLElement} currentElement - Current element
   * @param {HTMLElement} container - Container to search within
   * @returns {boolean} Whether focusing was successful
   */
  focusNext(currentElement, container) {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) {
      // Focus first element if current element is not in list
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return true;
      }
      return false;
    }
    
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    if (nextIndex < focusableElements.length) {
      focusableElements[nextIndex].focus();
      return true;
    }
    
    // Wrap around to first element
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    
    return false;
  }

  /**
   * Focuses the previous element in the tab order
   * @param {HTMLElement} currentElement - Current element
   * @param {HTMLElement} container - Container to search within
   * @returns {boolean} Whether focusing was successful
   */
  focusPrevious(currentElement, container) {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) {
      // Focus first element if current element is not in list
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return true;
      }
      return false;
    }
    
    const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    if (prevIndex < focusableElements.length) {
      focusableElements[prevIndex].focus();
      return true;
    }
    
    // Wrap around to last element
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    
    return false;
  }

  /**
   * Moves focus to an element and returns a function to return focus back
   * @param {HTMLElement} element - Element to temporarily focus
   * @returns {Function} Function to return focus to the previous element
   */
  focusAndReturn(element) {
    const previousElement = document.activeElement;
    
    if (element && element.focus) {
      element.focus();
    }
    
    return () => {
      if (previousElement && previousElement.focus) {
        previousElement.focus();
      }
    };
  }

  /**
   * Creates a focus guard to prevent focus from leaving a container
   * @param {HTMLElement} container - Container to guard
   * @param {Object} options - Guard options
   * @returns {Object} Focus guard controller
   */
  createFocusGuard(container, options = {}) {
    const guard = {
      container,
      options: {
        preventLeaving: true,
        autoReturn: true,
        ...options
      },
      startElement: null,

      activate: () => {
        guard.startElement = document.activeElement;
        
        // Add a focus listener to the container
        container.addEventListener('focusout', (e) => {
          if (guard.options.preventLeaving && !container.contains(e.relatedTarget)) {
            e.preventDefault();
            
            if (guard.options.autoReturn) {
              guard.returnFocus();
            }
          }
        }, true);
        
        return guard;
      },

      deactivate: () => {
        container.removeEventListener('focusout', guard.focusOutHandler, true);
        return guard;
      },

      returnFocus: () => {
        if (guard.startElement && guard.startElement.focus) {
          guard.startElement.focus();
        } else {
          const focusable = container.querySelector(guard.focusableSelector);
          if (focusable) focusable.focus();
        }
      }
    };

    return guard;
  }

  /**
   * Creates an inert region to make elements unfocusable
   * @param {HTMLElement} element - Element to make inert
   * @returns {Function} Function to remove inert state
   */
  createInertRegion(element) {
    // Store current state
    const originalInert = element.inert;
    const originalTabIndex = element.getAttribute('tabindex');
    
    // Apply inert state
    element.inert = true;
    
    // Also set tabindex to -1 for older browsers that don't support inert
    const elements = element.querySelectorAll(this.focusableSelector);
    elements.forEach(el => {
      const originalTabIndex = el.getAttribute('tabindex');
      el.__originalTabIndex = originalTabIndex;
      el.setAttribute('tabindex', '-1');
    });

    // Return function to restore original state
    return () => {
      element.inert = originalInert;
      
      // Restore original tab indices
      elements.forEach(el => {
        if (el.__originalTabIndex !== null) {
          el.setAttribute('tabindex', el.__originalTabIndex);
        } else {
          el.removeAttribute('tabindex');
        }
        delete el.__originalTabIndex;
      });
    };
  }

  /**
   * Creates a focus lock that only allows focus within specific elements
   * @param {Array} elements - Array of elements that can receive focus
   * @returns {Object} Focus lock controller
   */
  createFocusLock(elements) {
    const focusableElements = Array.from(elements);
    let activeElement = document.activeElement;
    
    const handleFocus = (e) => {
      if (!focusableElements.some(el => el === e.target || el.contains(e.target))) {
        // Return focus to the last valid element
        if (activeElement && focusableElements.includes(activeElement)) {
          activeElement.focus();
        } else if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
        e.preventDefault();
      } else {
        activeElement = e.target;
      }
    };
    
    // Add focus listener to document
    document.addEventListener('focusin', handleFocus, true);
    
    return {
      unlock: () => {
        document.removeEventListener('focusin', handleFocus, true);
      },
      elements: focusableElements,
      refreshElements: (newElements) => {
        focusableElements.length = 0;
        Array.prototype.push.apply(focusableElements, Array.from(newElements));
      }
    };
  }

  /**
   * Checks if focus is currently trapped
   * @returns {boolean} Whether focus is currently trapped
   */
  isFocusTrapped() {
    return this.activeTrap !== null && this.activeTrap.active;
  }

  /**
   * Gets the currently active focus trap
   * @returns {Object|null} Active focus trap or null
   */
  getActiveTrap() {
    return this.activeTrap;
  }

  /**
   * Gets the currently paused focus trap
   * @returns {Object|null} Paused focus trap or null
   */
  getPausedTrap() {
    return this.pausedTrap;
  }

  /**
   * Creates a focus management utility for accessibility
   * @param {Object} options - Focus management options
   * @returns {Object} Focus management utility
   */
  createFocusManager(options = {}) {
    const manager = {
      options: {
        restoreOnDestroy: true,
        ...options
      },
      focusedElement: null,

      // Store the currently focused element
      remember: () => {
        manager.focusedElement = document.activeElement;
      },

      // Restore focus to the remembered element
      restore: () => {
        if (manager.focusedElement && manager.focusedElement.focus) {
          try {
            manager.focusedElement.focus();
            return true;
          } catch (e) {
            // If the element is no longer in the DOM or focusable, focus body
            document.body.focus();
            return false;
          }
        }
        return false;
      },

      // Focus an element and remember the previous one
      focus: (element) => {
        if (element && element.focus) {
          manager.remember();
          element.focus();
          return true;
        }
        return false;
      },

      // Shift focus to the next focusable element
      shiftFocus: (direction = 'forward') => {
        const allFocusable = Array.from(document.querySelectorAll(this.focusableSelector));
        const currentIndex = allFocusable.indexOf(document.activeElement);

        let nextIndex;
        if (direction === 'forward') {
          nextIndex = (currentIndex + 1) % allFocusable.length;
        } else {
          nextIndex = (currentIndex - 1 + allFocusable.length) % allFocusable.length;
        }

        if (allFocusable[nextIndex]) {
          allFocusable[nextIndex].focus();
          return true;
        }
        return false;
      },

      destroy: () => {
        if (manager.options.restoreOnDestroy) {
          manager.restore();
        }
      }
    };

    return manager;
  }

  /**
   * Creates a focus ring utility that enhances focus visibility
   * @param {Object} options - Focus ring options
   * @returns {Object} Focus ring utility controller
   */
  createFocusRing(options = {}) {
    const ringOptions = {
      className: 'enhanced-focus-ring',
      style: {
        outline: '2px solid var(--jazer-cyan, #00f2ea)',
        outlineOffset: '2px',
        borderRadius: '4px'
      },
      ...options
    };

    const focusRing = document.createElement('div');
    focusRing.className = ringOptions.className;
    focusRing.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 0 0 2px rgba(0, 242, 234, 0.5);
      transition: all 0.1s ease;
      display: none;
    `;

    // Apply custom styles
    for (const [prop, value] of Object.entries(ringOptions.style)) {
      focusRing.style.setProperty(prop.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`), value);
    }

    document.body.appendChild(focusRing);

    let focusedElement = null;

    const updateFocusRing = (element) => {
      if (!element) {
        focusRing.style.display = 'none';
        focusedElement = null;
        return;
      }

      focusedElement = element;

      // Get the element's position and dimensions
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Update focus ring position and size
      focusRing.style.width = `${rect.width}px`;
      focusRing.style.height = `${rect.height}px`;
      focusRing.style.left = `${rect.left + window.pageXOffset}px`;
      focusRing.style.top = `${rect.top + window.pageYOffset}px`;
      focusRing.style.display = 'block';

      // Apply element's border radius to the focus ring
      focusRing.style.borderRadius = computedStyle.borderRadius;
    };

    // Track focus changes
    document.addEventListener('focusin', (e) => {
      updateFocusRing(e.target);
    });

    document.addEventListener('focusout', (e) => {
      if (e.target === focusedElement) {
        updateFocusRing(null);
      }
    });

    return {
      element: focusRing,
      update: updateFocusRing,
      destroy: () => {
        if (focusRing.parentNode) {
          focusRing.parentNode.removeChild(focusRing);
        }
        document.removeEventListener('focusin', updateFocusRing);
        document.removeEventListener('focusout', (e) => {
          if (e.target === focusedElement) {
            updateFocusRing(null);
          }
        });
      }
    };
  }

  /**
   * Adds dynamic styles for focus utilities
   */
  addDynamicStyles() {
    if (document.getElementById('focus-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'focus-utilities-styles';
    style.textContent = `
      /* Focus trap styles */
      .focus-trap-modal-active {
        z-index: 9999 !important;
      }
      
      .focus-trap-drawer-active {
        z-index: 9999 !important;
      }
      
      .focus-trap-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
      }
      
      /* Enhanced focus ring styles */
      .enhanced-focus-ring {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 0 2px rgba(0, 242, 234, 0.5);
        transition: all 0.1s ease;
      }
      
      /* Default focus styles for accessibility */
      .accessible-focus :focus {
        outline: 2px solid var(--jazer-cyan, #00f2ea);
        outline-offset: 2px;
      }
      
      /* Focus guard styles */
      .focus-guard {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Focus ring animation */
      @keyframes focusPulse {
        0% {
          box-shadow: 0 0 0 2px var(--jazer-cyan, #00f2ea);
        }
        50% {
          box-shadow: 0 0 0 4px var(--jazer-cyan, #00f2ea);
        }
        100% {
          box-shadow: 0 0 0 2px var(--jazer-cyan, #00f2ea);
        }
      }
      
      .focus-pulse-ring {
        animation: focusPulse 1.5s infinite;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the focus trap utilities instance and cleans up
   */
  destroy() {
    // Deactivate all active traps
    for (const [container, trap] of this.traps) {
      if (trap.active) {
        trap.deactivate();
      }
    }
    
    // Clear all storage
    this.traps.clear();
    this.activeTrap = null;
    this.pausedTrap = null;
  }
}

/**
 * Creates a new focus trap utilities instance
 * @param {Object} options - Configuration options
 * @returns {FocusTrapUtils} New focus trap utilities instance
 */
function createFocusTrapUtils(options = {}) {
  return new FocusTrapUtils(options);
}

// Create default instance
const focusTrapUtils = new FocusTrapUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FocusTrapUtils,
    createFocusTrapUtils,
    focusTrapUtils
  };
}

// Make available globally
window.FocusTrapUtils = FocusTrapUtils;
window.createFocusTrapUtils = createFocusTrapUtils;
window.focusTrapUtils = focusTrapUtils;