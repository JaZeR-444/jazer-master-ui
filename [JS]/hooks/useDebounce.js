/**
 * useDebounce Hook
 * React-like debounce hook implementation for vanilla JS
 * Compatible with jazer-brand.css styling for hook-related utilities
 */

class DebounceHook {
  constructor() {
    this.activeTimers = new Map();
  }

  /**
   * Creates a debounced function that delays execution until after wait milliseconds have elapsed
   * @param {Function} func - Function to debounce
   * @param {number} wait - Number of milliseconds to delay
   * @param {Object} options - Debounce options
   * @param {boolean} immediate - If true, trigger the function on the leading edge
   * @returns {Function} Debounced function
   */
  createDebounce(func, wait, options = {}) {
    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }
    
    const { immediate = false } = options;
    let timeoutId;
    
    const debounced = function(...args) {
      const callNow = immediate && !timeoutId;
      
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (!immediate) func.apply(this, args);
      }, wait);
      
      if (callNow) func.apply(this, args);
      
      // Store timeoutId for potential cancellation
      debounced.timeoutId = timeoutId;
      return timeoutId;
    };
    
    // Add cancellation function
    debounced.cancel = () => {
      clearTimeout(timeoutId);
      timeoutId = null;
    };
    
    // Add flush function to execute immediately
    debounced.flush = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = null;
      return func.apply(this, args);
    };
    
    // Add pending check
    debounced.pending = () => {
      return timeoutId !== null;
    };
    
    return debounced;
  }

  /**
   * Creates a throttled function that only executes once per specified interval
   * @param {Function} func - Function to throttle
   * @param {number} wait - Number of milliseconds to throttle execution to
   * @param {Object} options - Throttle options
   * @returns {Function} Throttled function
   */
  createThrottle(func, wait, options = {}) {
    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }
    
    const { 
      leading = true, 
      trailing = true 
    } = options;
    
    if (!leading && !trailing) {
      throw new Error('Either leading or trailing must be true for throttle');
    }
    
    let lastCallTime = 0;
    let lastArgs = null;
    let lastThis = null;
    let result;
    let timerId = null;
    
    const invoke = (time) => {
      lastCallTime = !leading ? Date.now() : time;
      result = func.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
      return result;
    };
    
    const throttled = function(...args) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);
      
      lastArgs = args;
      lastThis = this;
      
      if (isInvoking) {
        if (timerId === null) {
          lastCallTime = time;
          timerId = setTimeout(timerExpired, wait - (time - lastCallTime));
          return leading ? invoke(time) : result;
        }
        
        if (trailing) {
          timerId = setTimeout(timerExpired, wait);
        }
      }
      
      return result;
    };
    
    const shouldInvoke = (time) => {
      const timeSinceLastCall = time - lastCallTime;
      return (lastCallTime === 0 || 
              timeSinceLastCall >= wait || 
              timeSinceLastCall < 0);
    };
    
    const timerExpired = () => {
      timerId = null;
      if (trailing && lastArgs) {
        return invoke(Date.now());
      }
      lastArgs = lastThis = null;
    };
    
    const cancel = () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      lastCallTime = 0;
      lastArgs = lastThis = null;
      result = undefined;
    };
    
    const flush = () => {
      if (timerId !== null) {
        const result = invoke(Date.now());
        cancel();
        return result;
      }
      return result;
    };
    
    throttled.cancel = cancel;
    throttled.flush = flush;
    throttled.pending = () => timerId !== null;
    
    return throttled;
  }

  /**
   * Creates a debounce hook that returns a debounced value
   * @param {*} value - Value to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Array} Array with [debouncedValue, setDebouncedValue]
   */
  createDebounceState(value, delay) {
    let debouncedValue = value;
    let timeoutId = null;
    
    const setDebouncedValue = (newValue) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        debouncedValue = newValue;
      }, delay);
    };
    
    return [
      debouncedValue,
      setDebouncedValue,
      () => clearTimeout(timeoutId) // Cancel function
    ];
  }

  /**
   * Cancels a debounce associated with a specific ID
   * @param {string} id - ID of the debounce to cancel
   * @returns {boolean} Whether the debounce was successfully cancelled
   */
  cancelDebounce(id) {
    if (this.activeTimers.has(id)) {
      clearTimeout(this.activeTimers.get(id));
      this.activeTimers.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Gets all active debounces
   * @returns {Array} Array of debounce IDs
   */
  getActiveDebounces() {
    return Array.from(this.activeTimers.keys());
  }

  /**
   * Cancels all active debounces
   * @returns {number} Number of debounces cancelled
   */
  cancelAllDebounces() {
    let count = 0;
    
    for (const timerId of this.activeTimers.values()) {
      clearTimeout(timerId);
      count++;
    }
    
    this.activeTimers.clear();
    return count;
  }
}

// Create instance
const debounceHook = new DebounceHook();

/**
 * useDebounce hook for vanilla JS
 * Returns a debounced version of the provided function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array (for reference)
 * @returns {Function} Debounced function
 */
function useDebounce(func, delay, deps = []) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function for useDebounce');
  }
  
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useDebounce');
  }
  
  // In a vanilla JS implementation, we return the debounced function directly
  return debounceHook.createDebounce(func, delay);
}

/**
 * useDebouncedValue hook for vanilla JS
 * Maintains a debounced value that updates after a delay
 * @param {*} initialValue - Initial value
 * @param {number} delay - Delay in milliseconds
 * @returns {Array} Array with [value, setValue] similar to useState
 */
function useDebouncedValue(initialValue, delay) {
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useDebouncedValue');
  }
  
  let value = initialValue;
  let debouncedValue = initialValue;
  let timeoutId = null;
  
  // Setter function that implements debouncing
  const setValue = (newValue) => {
    value = newValue;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debouncedValue = newValue;
      
      // In a vanilla implementation, we can't trigger re-renders
      // So we'll use an event-based approach instead
      window.dispatchEvent(new CustomEvent('debouncedValueUpdate', {
        detail: { newValue, oldValue: value }
      }));
    }, delay);
  };
  
  // Getter function for the debounced value
  const getValue = () => debouncedValue;
  
  return [getValue, setValue];
}

/**
 * useThrottle hook for vanilla JS
 * Returns a throttled version of the provided function
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array (for reference)
 * @returns {Function} Throttled function
 */
function useThrottle(func, delay, deps = []) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function for useThrottle');
  }
  
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useThrottle');
  }
  
  // In a vanilla JS implementation, we return the throttled function directly
  return debounceHook.createThrottle(func, delay);
}

/**
 * useThrottledValue hook for vanilla JS
 * Maintains a throttled value that updates at most once per delay period
 * @param {*} initialValue - Initial value
 * @param {number} delay - Delay in milliseconds
 * @returns {Array} Array with [value, setValue] similar to useState
 */
function useThrottledValue(initialValue, delay) {
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useThrottledValue');
  }
  
  let value = initialValue;
  let throttledValue = initialValue;
  let lastCallTime = 0;
  let timerId = null;
  
  const setValue = (newValue) => {
    value = newValue;
    const now = Date.now();
    
    if (now - lastCallTime >= delay) {
      // Execute immediately
      throttledValue = newValue;
      lastCallTime = now;
      
      // Dispatch event for updates
      window.dispatchEvent(new CustomEvent('throttledValueUpdate', {
        detail: { newValue, oldValue: throttledValue }
      }));
    } else if (!timerId) {
      // Schedule execution after remaining time
      const remainingTime = delay - (now - lastCallTime);
      timerId = setTimeout(() => {
        throttledValue = value;
        lastCallTime = Date.now();
        timerId = null;
        
        window.dispatchEvent(new CustomEvent('throttledValueUpdate', {
          detail: { newValue: throttledValue, oldValue: throttledValue }
        }));
      }, remainingTime);
    }
  };
  
  const getValue = () => throttledValue;
  
  return [getValue, setValue];
}

/**
 * useDebounceCallback hook for vanilla JS
 * Creates a debounced callback function that can be called later
 * @param {Function} callback - Callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Whether to trigger immediately
 * @returns {Object} Object with debounced function and related methods
 */
function useDebounceCallback(callback, delay, immediate = false) {
  if (typeof callback !== 'function') {
    throw new TypeError('Expected a function for useDebounceCallback');
  }
  
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useDebounceCallback');
  }
  
  const debouncedFn = debounceHook.createDebounce(callback, delay, { immediate });
  
  return {
    callback: debouncedFn,
    cancel: () => debouncedFn.cancel(),
    flush: (...args) => debouncedFn.flush(...args),
    pending: () => debouncedFn.pending()
  };
}

/**
 * useThrottleCallback hook for vanilla JS
 * Creates a throttled callback function that can be called later
 * @param {Function} callback - Callback function to throttle
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Throttle options (leading, trailing)
 * @returns {Object} Object with throttled function and related methods
 */
function useThrottleCallback(callback, delay, options = {}) {
  if (typeof callback !== 'function') {
    throw new TypeError('Expected a function for useThrottleCallback');
  }
  
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useThrottleCallback');
  }
  
  const throttledFn = debounceHook.createThrottle(callback, delay, options);
  
  return {
    callback: throttledFn,
    cancel: () => throttledFn.cancel(),
    flush: (...args) => throttledFn.flush(...args),
    pending: () => throttledFn.pending()
  };
}

/**
 * Custom hook for debouncing async functions
 * @param {Function} asyncFunc - Async function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced async function
 */
function useDebounceAsync(asyncFunc, delay) {
  if (typeof asyncFunc !== 'function') {
    throw new TypeError('Expected a function for useDebounceAsync');
  }

  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useDebounceAsync');
  }

  let timeoutId;
  let lastPromise;

  return function(...args) {
    return new Promise((resolve, reject) => {
      // Cancel previous timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Store the previous promise to prevent race conditions
      const previousPromise = lastPromise;

      timeoutId = setTimeout(async () => {
        try {
          // Wait for the previous promise to resolve before executing
          if (previousPromise) {
            await previousPromise;
          }

          const result = await asyncFunc.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);

      // Store this promise so subsequent calls can wait for it
      lastPromise = new Promise((promiseResolve) => {
        // Resolve when the debounce timeout is completed
        setTimeout(() => {
          promiseResolve();
        }, delay);
      });
    });
  };
}

/**
 * useDebouncedEffect hook for vanilla JS
 * Similar to useEffect but runs after debounce period
 * @param {Function} effect - Effect function to execute
 * @param {Array} deps - Dependency array
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Cleanup function
 */
function useDebouncedEffect(effect, deps, delay) {
  if (typeof effect !== 'function') {
    throw new TypeError('Expected a function for useDebouncedEffect');
  }
  
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useDebouncedEffect');
  }

  let timeoutId;
  let isInitialRender = true;

  // This would be implemented differently in a real framework
  // For vanilla JS, we'll simulate the behavior
  const runEffect = () => {
    // Execute effect and capture cleanup function if it returns one
    const maybeCleanup = effect();
    
    // Return cleanup function or null
    return typeof maybeCleanup === 'function' ? maybeCleanup : null;
  };

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(runEffect, delay);
    
    // Return cleanup function
    return () => clearTimeout(timeoutId);
  };
}

/**
 * Hook for debouncing an input value
 * @param {string} initialValue - Initial input value
 * @param {number} delay - Delay in milliseconds
 * @returns {Array} Array with [inputValue, setInputValue, debouncedValue]
 */
function useDebouncedInput(initialValue = '', delay) {
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useDebouncedInput');
  }

  let value = initialValue;
  let debouncedValue = initialValue;
  let timeoutId = null;

  const setInputValue = (newValue) => {
    value = newValue;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debouncedValue = newValue;
    }, delay);
  };

  return [value, setInputValue, () => debouncedValue];
}

/**
 * Hook for debouncing multiple functions with the same delay
 * @param {Array} functions - Array of [function, delay] pairs
 * @returns {Array} Array of debounced functions
 */
function useMultipleDebounce(functions) {
  if (!Array.isArray(functions)) {
    throw new TypeError('Expected an array of [function, delay] pairs');
  }

  return functions.map(([fn, delay]) => {
    if (typeof fn !== 'function' || typeof delay !== 'number') {
      throw new TypeError('Each pair should have a function and a number');
    }
    return debounceHook.createDebounce(fn, delay);
  });
}

/**
 * Hook for debouncing function calls based on a condition
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} condition - Condition to enable debouncing
 * @returns {Function} Conditional debounced function
 */
function useConditionalDebounce(fn, delay, condition) {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function for useConditionalDebounce');
  }
  
  if (typeof delay !== 'number') {
    throw new TypeError('Expected a number for delay in useConditionalDebounce');
  }

  // If condition is false, return original function without debouncing
  if (!condition) {
    return fn;
  }

  // Otherwise return debounced function
  return debounceHook.createDebounce(fn, delay);
}

/**
 * Adds dynamic styles for hook-related elements
 */
function addHookStyles() {
  if (document.getElementById('hook-utilities-styles')) return;

  const style = document.createElement('style');
  style.id = 'hook-utilities-styles';
  style.textContent = `
    /* Styles for hook-related components */
    .debounced-element {
      transition: opacity 0.2s ease;
    }
    
    .debounced-element.active {
      opacity: 1;
    }
    
    .debounced-element.inactive {
      opacity: 0.5;
    }
    
    .throttled-element {
      transition: transform 0.3s ease;
    }
    
    .throttled-element.updated {
      transform: scale(1.02);
    }
    
    .throttled-element.normal {
      transform: scale(1);
    }
    
    .hook-demo-container {
      padding: 20px;
      background: var(--bg-darker, #111);
      border: 1px solid var(--border-default, #4facfe);
      border-radius: 8px;
      margin: 10px 0;
    }
    
    .hook-demo-input {
      width: 100%;
      padding: 10px;
      background: var(--bg-dark, #0a0a0a);
      border: 1px solid var(--border-lighter, #222);
      border-radius: 4px;
      color: var(--text-light, #fff);
    }
    
    .hook-demo-output {
      margin-top: 15px;
      padding: 10px;
      background: var(--bg-dark, #0a0a0a);
      border-radius: 4px;
      font-family: monospace;
    }
  `;

  document.head.appendChild(style);
}

// Initialize styles
addHookStyles();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DebounceHook,
    useDebounce,
    useDebouncedValue,
    useThrottle,
    useThrottledValue,
    useDebounceCallback,
    useThrottleCallback,
    useDebounceAsync,
    useDebouncedEffect,
    useDebouncedInput,
    useMultipleDebounce,
    useConditionalDebounce,
    debounceHook
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DebounceHook = DebounceHook;
  window.useDebounce = useDebounce;
  window.useDebouncedValue = useDebouncedValue;
  window.useThrottle = useThrottle;
  window.useThrottledValue = useThrottledValue;
  window.useDebounceCallback = useDebounceCallback;
  window.useThrottleCallback = useThrottleCallback;
  window.useDebounceAsync = useDebounceAsync;
  window.useDebouncedEffect = useDebouncedEffect;
  window.useDebouncedInput = useDebouncedInput;
  window.useMultipleDebounce = useMultipleDebounce;
  window.useConditionalDebounce = useConditionalDebounce;
  window.debounceHook = debounceHook;
}