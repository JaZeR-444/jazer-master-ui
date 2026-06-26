/**
 * useClickOutside Hook
 * React-like hook for detecting clicks outside of an element in vanilla JS
 * Compatible with jazer-brand.css styling for hook-related utilities
 */

class ClickOutsideHook {
  constructor() {
    this.handlers = new Map();
    this.setupGlobalListener();
  }

  /**
   * Setup global click listener to handle all click outside events
   */
  setupGlobalListener() {
    document.addEventListener('mousedown', this.handleGlobalClick.bind(this), true);
    document.addEventListener('touchstart', this.handleGlobalClick.bind(this), true);
  }

  /**
   * Handles global click events to detect clicks outside elements
   * @param {Event} event - Click event
   */
  handleGlobalClick(event) {
    // Iterate through all registered handlers
    for (const [element, handler] of this.handlers) {
      if (!this.isEventTargetOutside(event, element)) {
        continue;
      }

      // Call the handler if the click was outside the element
      handler(event);
    }
  }

  /**
   * Checks if the event target is outside the specified element
   * @param {Event} event - Click event
   * @param {HTMLElement} element - Element to check against
   * @returns {boolean} Whether the event target is outside the element
   */
  isEventTargetOutside(event, element) {
    // Check if the clicked element is the same as the watched element
    if (event.target === element) {
      return false;
    }

    // Check if the clicked element is inside the watched element
    if (element.contains(event.target)) {
      return false;
    }

    return true;
  }

  /**
   * Registers a click outside handler for an element
   * @param {HTMLElement} element - Element to watch
   * @param {Function} handler - Handler function to call when clicked outside
   * @returns {Function} Function to unregister the handler
   */
  addClickListener(element, handler) {
    if (!element || typeof handler !== 'function') {
      throw new Error('Element and handler function are required for addClickListener');
    }

    // Store the handler
    this.handlers.set(element, handler);

    // Return function to remove the handler
    return () => {
      this.handlers.delete(element);
    };
  }

  /**
   * Removes a click listener for an element
   * @param {HTMLElement} element - Element to stop watching
   * @returns {boolean} Whether the handler was removed
   */
  removeClickListener(element) {
    return this.handlers.delete(element);
  }

  /**
   * Clears all click listeners
   */
  clearAllListeners() {
    this.handlers.clear();
  }
}

/**
 * useClickOutside hook implementation for vanilla JS
 * @param {HTMLElement} element - Element to watch for clicks outside
 * @param {Function} handler - Function to call when clicked outside
 * @returns {Function} Function to remove the click outside listener
 */
function useClickOutside(element, handler) {
  if (!element || typeof handler !== 'function') {
    throw new Error('Element and handler function are required for useClickOutside');
  }

  // Register the handler with the global click handler
  const unregister = clickOutsideHook.addClickListener(element, handler);

  // Return function to unregister
  return unregister;
}

/**
 * useClickOutsideMulti hook to handle clicks outside of multiple elements
 * @param {Array} elements - Array of elements to watch
 * @param {Function} handler - Function to call when clicked outside any element
 * @returns {Function} Function to remove all click outside listeners
 */
function useClickOutsideMulti(elements, handler) {
  if (!Array.isArray(elements) || elements.length === 0) {
    throw new Error('Elements must be a non-empty array for useClickOutsideMulti');
  }

  if (typeof handler !== 'function') {
    throw new Error('Handler must be a function for useClickOutsideMulti');
  }

  const unregisters = [];

  // Add click outside listener for each element
  elements.forEach(element => {
    if (element instanceof Element) {
      unregisters.push(useClickOutside(element, handler));
    }
  });

  // Return function to remove all listeners
  return () => {
    unregisters.forEach(unregister => unregister());
  };
}

/**
 * useHover hook implementation for vanilla JS
 * @param {HTMLElement} element - Element to watch for hover
 * @param {Function} onHover - Function to call when hovered
 * @param {Function} onLeave - Function to call when unhovered (optional)
 * @returns {Function} Function to remove the hover listener
 */
function useHover(element, onHover, onLeave) {
  if (!element || typeof onHover !== 'function') {
    throw new Error('Element and onHover function are required for useHover');
  }

  if (onLeave && typeof onLeave !== 'function') {
    throw new Error('onLeave must be a function if provided');
  }

  const handleMouseEnter = (e) => onHover(e);
  const handleMouseLeave = (e) => onLeave ? onLeave(e) : null;

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Return function to remove the listeners
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * useFocusWithin hook implementation for vanilla JS
 * @param {HTMLElement} element - Element to watch for focus within
 * @param {Function} onFocus - Function to call when focused within
 * @param {Function} onBlur - Function to call when focus leaves (optional)
 * @returns {Function} Function to remove the focus listener
 */
function useFocusWithin(element, onFocus, onBlur) {
  if (!element || typeof onFocus !== 'function') {
    throw new Error('Element and onFocus function are required for useFocusWithin');
  }

  if (onBlur && typeof onBlur !== 'function') {
    throw new Error('onBlur must be a function if provided');
  }

  const handleFocusIn = (e) => {
    if (element.contains(e.target)) {
      onFocus(e);
    }
  };

  const handleFocusOut = (e) => {
    if (!element.contains(e.relatedTarget)) {
      if (onBlur) onBlur(e);
    }
  };

  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);

  // Return function to remove the listeners
  return () => {
    document.removeEventListener('focusin', handleFocusIn);
    document.removeEventListener('focusout', handleFocusOut);
  };
}

/**
 * useActive hook implementation for vanilla JS
 * Updates element state when it becomes active (clicked)
 * @param {HTMLElement} element - Element to watch for active state
 * @param {Function} onActive - Function to call when element becomes active
 * @param {Function} onInactive - Function to call when element becomes inactive (optional)
 * @returns {Function} Function to remove the active listener
 */
function useActive(element, onActive, onInactive) {
  if (!element || typeof onActive !== 'function') {
    throw new Error('Element and onActive function are required for useActive');
  }

  if (onInactive && typeof onInactive !== 'function') {
    throw new Error('onInactive must be a function if provided');
  }

  const handleMouseDown = (e) => onActive(e);
  const handleMouseUp = (e) => onInactive ? onInactive(e) : null;

  element.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('mouseup', handleMouseUp);
  element.addEventListener('mouseleave', handleMouseUp); // In case mouse leaves button before release

  // Return function to remove the listeners
  return () => {
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mouseup', handleMouseUp);
    element.removeEventListener('mouseleave', handleMouseUp);
  };
}

/**
 * useVisibilityChange hook to detect when the page/tab visibility changes
 * @param {Function} onVisible - Callback when page becomes visible
 * @param {Function} onHidden - Callback when page becomes hidden (optional)
 * @returns {Function} Function to remove visibility change listener
 */
function useVisibilityChange(onVisible, onHidden) {
  if (typeof onVisible !== 'function') {
    throw new TypeError('Expected function for onVisible in useVisibilityChange');
  }

  if (onHidden && typeof onHidden !== 'function') {
    throw new TypeError('Expected function for onHidden in useVisibilityChange');
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (onHidden) onHidden();
    } else {
      onVisible();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * useBeforeUnload hook to handle beforeunload events
 * @param {Function} handler - Function to execute before page unload
 * @param {boolean} showConfirmation - Whether to show default confirmation dialog (default: true)
 * @returns {Function} Function to remove the beforeunload listener
 */
function useBeforeUnload(handler, showConfirmation = true) {
  if (typeof handler !== 'function') {
    throw new TypeError('Expected function for handler in useBeforeUnload');
  }

  const handleBeforeUnload = (e) => {
    const result = handler(e);

    if (showConfirmation || result) {
      // Set return value to trigger confirmation dialog
      e.returnValue = typeof result === 'string' ? result : 'Are you sure you want to leave?';
      return e.returnValue;
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/**
 * useOnlineStatus hook to detect online/offline state changes
 * @param {Function} onOnline - Function called when online
 * @param {Function} onOffline - Function called when offline (optional)
 * @returns {Function} Function to remove online status listeners
 */
function useOnlineStatus(onOnline, onOffline) {
  if (typeof onOnline !== 'function') {
    throw new TypeError('Expected function for onOnline in useOnlineStatus');
  }

  if (onOffline && typeof onOffline !== 'function') {
    throw new TypeError('Expected function for onOffline in useOnlineStatus');
  }

  const handleOnline = () => onOnline();
  const handleOffline = () => onOffline ? onOffline() : null;

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Execute initial check
  if (navigator.onLine) {
    onOnline();
  } else if (onOffline) {
    onOffline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * useIdle hook to track idle state
 * @param {Function} onIdle - Function to call when idle
 * @param {Function} onActive - Function to call when active after idle (optional)
 * @param {number} timeout - Time in milliseconds after which user is considered idle (default: 5000)
 * @returns {Object} Object with start, stop, isActive methods
 */
function useIdle(onIdle, onActive, timeout = 5000) {
  if (typeof onIdle !== 'function') {
    throw new TypeError('Expected function for onIdle in useIdle');
  }

  if (onActive && typeof onActive !== 'function') {
    throw new TypeError('Expected function for onActive in useIdle');
  }

  let idleTimer;
  let isIdle = false;

  const resetTimer = () => {
    if (isIdle) {
      isIdle = false;
      if (onActive) onActive();
    }
    
    // Clear any existing timer
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    
    // Set new timer
    idleTimer = setTimeout(() => {
      isIdle = true;
      onIdle();
    }, timeout);
  };

  // Events that reset the timer
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus'];

  // Set initial timer
  resetTimer();

  // Add event listeners
  events.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });

  return {
    start: resetTimer,
    stop: () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    },
    isActive: () => !isIdle,
    isIdle: () => isIdle
  };
}

/**
 * useWindowFocus hook to detect when the window gains or loses focus
 * @param {Function} onFocus - Function called when window gains focus
 * @param {Function} onBlur - Function called when window loses focus (optional)
 * @returns {Function} Function to remove the focus listeners
 */
function useWindowFocus(onFocus, onBlur) {
  if (typeof onFocus !== 'function') {
    throw new TypeError('Expected function for onFocus in useWindowFocus');
  }

  if (onBlur && typeof onBlur !== 'function') {
    throw new TypeError('Expected function for onBlur in useWindowFocus');
  }

  const handleFocus = () => onFocus();
  const handleBlur = () => onBlur ? onBlur() : null;

  window.addEventListener('focus', handleFocus);
  window.addEventListener('blur', handleBlur);

  return () => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
  };
}

/**
 * useElementFocus hook for tracking focus on an element
 * @param {HTMLElement} element - Element to track focus for
 * @param {Function} onFocus - Function called when element gains focus
 * @param {Function} onBlur - Function called when element loses focus (optional)
 * @returns {Function} Function to remove the focus listeners
 */
function useElementFocus(element, onFocus, onBlur) {
  if (!element) {
    throw new TypeError('Expected element in useElementFocus');
  }

  if (typeof onFocus !== 'function') {
    throw new TypeError('Expected function for onFocus in useElementFocus');
  }

  if (onBlur && typeof onBlur !== 'function') {
    throw new TypeError('Expected function for onBlur in useElementFocus');
  }

  const handleFocus = (e) => onFocus(e);
  const handleBlur = (e) => onBlur ? onBlur(e) : null;

  element.addEventListener('focus', handleFocus);
  element.addEventListener('blur', handleBlur);

  return () => {
    element.removeEventListener('focus', handleFocus);
    element.removeEventListener('blur', handleBlur);
  };
}

/**
 * useMouseEnterLeave hook for tracking mouse enter/leave events
 * @param {HTMLElement} element - Element to track mouse events for
 * @param {Function} onEnter - Function called when mouse enters
 * @param {Function} onLeave - Function called when mouse leaves
 * @returns {Function} Function to remove the mouse listeners
 */
function useMouseEnterLeave(element, onEnter, onLeave) {
  if (!element) {
    throw new TypeError('Expected element in useMouseEnterLeave');
  }

  if (typeof onEnter !== 'function' || typeof onLeave !== 'function') {
    throw new TypeError('Expected functions for onEnter and onLeave in useMouseEnterLeave');
  }

  const handleMouseEnter = (e) => onEnter(e);
  const handleMouseLeave = (e) => onLeave(e);

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * useClickAway hook using the ClickOutsideHook
 * @param {HTMLElement} element - Element to watch for clicks away from
 * @param {Function} callback - Callback when clicked away
 * @returns {Function} Function to remove the listener
 */
function useClickAway(element, callback) {
  return useClickOutside(element, callback);
}

/**
 * useGlobalClick hook to listen for all clicks on the document
 * @param {Function} handler - Handler function for all clicks
 * @returns {Function} Function to remove the listener
 */
function useGlobalClick(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('Expected function for handler in useGlobalClick');
  }

  const handleClick = (e) => handler(e);

  document.addEventListener('click', handleClick, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
  };
}

/**
 * useEscapeKey hook to listen for escape key presses
 * @param {Function} handler - Handler function for escape key press
 * @returns {Function} Function to remove the listener
 */
function useEscapeKey(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('Expected function for handler in useEscapeKey');
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handler(e);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * useKeyPress hook to listen for specific key presses
 * @param {string|Array} keys - Key or array of keys to listen for
 * @param {Function} handler - Handler function for key press
 * @returns {Function} Function to remove the listener
 */
function useKeyPress(keys, handler) {
  if (!keys || typeof handler !== 'function') {
    throw new TypeError('Expected keys and function for handler in useKeyPress');
  }

  const keysArray = Array.isArray(keys) ? keys : [keys];

  const handleKeyDown = (e) => {
    if (keysArray.some(key => key.toLowerCase() === e.key.toLowerCase())) {
      handler(e);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

// Create global instance for the hook
const clickOutsideHook = new ClickOutsideHook();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ClickOutsideHook,
    useClickOutside,
    useClickOutsideMulti,
    useHover,
    useFocusWithin,
    useActive,
    useVisibilityChange,
    useBeforeUnload,
    useOnlineStatus,
    useIdle,
    useWindowFocus,
    useElementFocus,
    useMouseEnterLeave,
    useClickAway,
    useGlobalClick,
    useEscapeKey,
    useKeyPress
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ClickOutsideHook = ClickOutsideHook;
  window.useClickOutside = useClickOutside;
  window.useClickOutsideMulti = useClickOutsideMulti;
  window.useHover = useHover;
  window.useFocusWithin = useFocusWithin;
  window.useActive = useActive;
  window.useVisibilityChange = useVisibilityChange;
  window.useBeforeUnload = useBeforeUnload;
  window.useOnlineStatus = useOnlineStatus;
  window.useIdle = useIdle;
  window.useWindowFocus = useWindowFocus;
  window.useElementFocus = useElementFocus;
  window.useMouseEnterLeave = useMouseEnterLeave;
  window.useClickAway = useClickAway;
  window.useGlobalClick = useGlobalClick;
  window.useEscapeKey = useEscapeKey;
  window.useKeyPress = useKeyPress;
}