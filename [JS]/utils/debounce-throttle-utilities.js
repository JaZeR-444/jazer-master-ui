/**
 * Debounce and Throttle Utilities Module
 * Advanced function debouncing and throttling utilities for performance optimization
 * Compatible with jazer-brand.css styling for performance-related utilities
 */

class DebounceThrottleUtils {
  /**
   * Creates a new debounce throttle utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultDelay: 300,
      defaultLeading: false,
      defaultTrailing: true,
      defaultMaxWait: null,
      ...options
    };
    
    this.activeFunctions = new Map(); // To track active debounced/throttled functions
  }

  /**
   * Creates a debounced function that delays execution
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Debounce options
   * @param {boolean} options.leading - Whether to trigger on leading edge
   * @param {boolean} options.trailing - Whether to trigger on trailing edge
   * @param {number} options.maxWait - Max wait time before execution
   * @returns {Function} Debounced function
   */
  debounce(func, delay = this.options.defaultDelay, options = {}) {
    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }
    
    const {
      leading = this.options.defaultLeading,
      trailing = this.options.defaultTrailing,
      maxWait = this.options.defaultMaxWait
    } = options;
    
    let timeoutId;
    let maxTimeoutId;
    let lastCallTime;
    let lastInvokeTime = 0;
    let lastArgs;
    let lastThis;
    let result;
    
    const invoke = (time) => {
      lastInvokeTime = time;
      result = func.apply(lastThis, lastArgs);
      
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
        maxTimeoutId = null;
      }
      
      return result;
    };
    
    const leadingEdge = (time) => {
      lastInvokeTime = time;
      timeoutId = setTimeout(timerExpired, delay);
      
      return leading ? invoke(time) : result;
    };
    
    const remainingWait = (time) => {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;
      const timeWaiting = delay - timeSinceLastCall;
      
      return maxWait === null || timeSinceLastInvoke < maxWait 
        ? timeWaiting 
        : maxWait - timeSinceLastInvoke;
    };
    
    const shouldInvoke = (time) => {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;
      
      // Leading edge
      return lastCallTime === undefined || 
             timeSinceLastCall >= delay || 
             timeSinceLastCall < 0 || 
             (maxWait !== null && timeSinceLastInvoke >= maxWait);
    };
    
    const timerExpired = () => {
      const time = Date.now();
      
      if (shouldInvoke(time)) {
        trailingEdge();
      } else {
        // Restart timer
        timeoutId = setTimeout(timerExpired, remainingWait(time));
      }
    };
    
    const trailingEdge = () => {
      timeoutId = null;
      
      if (trailing && lastArgs) {
        return invoke(Date.now());
      }
      
      lastArgs = lastThis = null;
      return result;
    };
    
    const cancel = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      
      if (maxTimeoutId !== undefined) {
        clearTimeout(maxTimeoutId);
        maxTimeoutId = undefined;
      }
      
      lastCallTime = 0;
      lastInvokeTime = 0;
      lastArgs = lastThis = undefined;
    };
    
    const flush = () => {
      return timeoutId === undefined ? result : trailingEdge();
    };
    
    const debounced = function(...args) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);
      
      lastArgs = args;
      lastThis = this;
      lastCallTime = time;
      
      if (isInvoking) {
        if (timeoutId === undefined) {
          return leadingEdge(lastCallTime);
        }
        
        if (maxWait !== null) {
          // Handle maxWait
          timeoutId = setTimeout(timerExpired, delay);
          maxTimeoutId = setTimeout(() => {
            maxTimeoutId = null;
            const time = Date.now();
            if (shouldInvoke(time)) {
              trailingEdge();
            }
          }, maxWait - (time - lastInvokeTime));
          return invoke(lastCallTime);
        }
      }
      
      if (timeoutId === undefined) {
        timeoutId = setTimeout(timerExpired, delay);
      }
      
      return result;
    };
    
    // Add utility methods to the debounced function
    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = () => timeoutId !== undefined;
    
    return debounced;
  }

  /**
   * Creates a throttled function that only executes once per specified interval
   * @param {Function} func - Function to throttle
   * @param {number} delay - Throttle delay in milliseconds
   * @param {Object} options - Throttle options
   * @param {boolean} options.leading - Whether to trigger on leading edge
   * @param {boolean} options.trailing - Whether to trigger on trailing edge
   * @returns {Function} Throttled function
   */
  throttle(func, delay = this.options.defaultDelay, options = {}) {
    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }
    
    const {
      leading = true,
      trailing = true
    } = options;
    
    let lastCallTime = 0;
    let lastArgs;
    let lastThis;
    let result;
    let timeoutId;
    let cancelled = false;
    
    const invoke = (time) => {
      lastCallTime = !leading ? Date.now() : time;
      result = func.apply(lastThis, lastArgs);
      lastArgs = lastThis = undefined;
      return result;
    };
    
    const trailingEdge = (time) => {
      timeoutId = undefined;
      
      if (trailing && lastArgs) {
        return invoke(time);
      }
      
      lastArgs = lastThis = undefined;
      return result;
    };
    
    const throttled = function(...args) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);
      
      lastArgs = args;
      lastThis = this;
      
      if (isInvoking) {
        if (timeoutId === undefined) {
          lastCallTime = time;
          timeoutId = setTimeout(() => trailingEdge(Date.now()), delay);
          return leading ? invoke(time) : result;
        }
        
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => trailingEdge(Date.now()), delay);
        }
      }
      
      return result;
    };
    
    const shouldInvoke = (time) => {
      const timeSinceLastCall = time - lastCallTime;
      return lastCallTime === 0 || 
             timeSinceLastCall >= delay || 
             timeSinceLastCall < 0;
    };
    
    const cancel = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      cancelled = true;
    };
    
    const flush = () => {
      if (timeoutId !== undefined) {
        const result = trailingEdge(Date.now());
        timeoutId = undefined;
        return result;
      }
      return result;
    };
    
    throttled.cancel = cancel;
    throttled.flush = flush;
    throttled.pending = () => timeoutId !== undefined;
    
    return throttled;
  }

  /**
   * Creates an advanced debounced function with additional features
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Advanced options
   * @returns {Function} Advanced debounced function
   */
  advancedDebounce(func, delay, options = {}) {
    const {
      leading = false,
      trailing = true,
      maxWait = null,
      cancelOnUnmount = false,
      key = null,
      ...advancedOptions
    } = options;
    
    // Create the base debounced function
    const baseDebounced = this.debounce(func, delay, { leading, trailing, maxWait });
    
    // If a key is provided, track this function in our registry
    if (key) {
      this.activeFunctions.set(key, {
        fn: baseDebounced,
        type: 'debounce',
        createdAt: Date.now()
      });
    }
    
    // Enhanced debounced function with additional methods
    const enhancedDebounced = function(...args) {
      return baseDebounced.apply(this, args);
    };
    
    enhancedDebounced.cancel = () => {
      baseDebounced.cancel();
      if (key) {
        this.activeFunctions.delete(key);
      }
    };
    
    enhancedDebounced.flush = () => {
      return baseDebounced.flush();
    };
    
    enhancedDebounced.pending = () => {
      return baseDebounced.pending();
    };
    
    // Add additional features based on options
    enhancedDebounced.timesCalled = 0;
    enhancedDebounced.originalFn = func;
    
    return enhancedDebounced;
  }

  /**
   * Creates an advanced throttled function with additional features
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Advanced options
   * @returns {Function} Advanced throttled function
   */
  advancedThrottle(func, delay, options = {}) {
    const {
      leading = true,
      trailing = true,
      key = null,
      ...advancedOptions
    } = options;
    
    // Create the base throttled function
    const baseThrottled = this.throttle(func, delay, { leading, trailing });
    
    // If a key is provided, track this function in our registry
    if (key) {
      this.activeFunctions.set(key, {
        fn: baseThrottled,
        type: 'throttle',
        createdAt: Date.now()
      });
    }
    
    // Enhanced throttled function with additional methods
    const enhancedThrottled = function(...args) {
      return baseThrottled.apply(this, args);
    };
    
    enhancedThrottled.cancel = () => {
      baseThrottled.cancel();
      if (key) {
        this.activeFunctions.delete(key);
      }
    };
    
    enhancedThrottled.flush = () => {
      return baseThrottled.flush();
    };
    
    enhancedThrottled.pending = () => {
      return baseThrottled.pending();
    };
    
    // Add additional features based on options
    enhancedThrottled.timesCalled = 0;
    enhancedThrottled.originalFn = func;
    
    return enhancedThrottled;
  }

  /**
   * Debounces a class method
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Debounce options
   * @returns {Function} Decorator function
   */
  static debounceMethod(delay, options = {}) {
    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;
      const debouncedMethod = (new DebounceThrottleUtils()).debounce(originalMethod, delay, options);
      
      descriptor.value = function(...args) {
        return debouncedMethod.apply(this, args);
      };
      
      // Store reference to original method
      descriptor.value.originalMethod = originalMethod;
      descriptor.value.debouncedMethod = debouncedMethod;
      
      return descriptor;
    };
  }

  /**
   * Throttles a class method
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Throttle options
   * @returns {Function} Decorator function
   */
  static throttleMethod(delay, options = {}) {
    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;
      const throttledMethod = (new DebounceThrottleUtils()).throttle(originalMethod, delay, options);
      
      descriptor.value = function(...args) {
        return throttledMethod.apply(this, args);
      };
      
      // Store reference to original method
      descriptor.value.originalMethod = originalMethod;
      descriptor.value.throttledMethod = throttledMethod;
      
      return descriptor;
    };
  }

  /**
   * Groups multiple function calls and executes them together after a delay
   * @param {Function} func - Function to group calls for
   * @param {number} delay - Delay in milliseconds
   * @param {Function} keyFn - Function to extract grouping key from arguments
   * @returns {Function} Grouped function
   */
  groupCalls(func, delay = 100, keyFn = (args) => JSON.stringify(args)) {
    const groups = new Map();
    
    return function(...args) {
      const key = keyFn(args);
      
      if (!groups.has(key)) {
        groups.set(key, { args, calls: 0 });
      }
      
      const group = groups.get(key);
      group.calls++;
      group.args = args; // Update with latest arguments
      
      // Clear previous timeout for this key if it exists
      if (group.timeoutId) {
        clearTimeout(group.timeoutId);
      }
      
      // Set new timeout
      group.timeoutId = setTimeout(() => {
        // Execute the function with the latest arguments
        func.apply(this, group.args);
        
        // Remove the group entry
        groups.delete(key);
      }, delay);
    };
  }

  /**
   * Creates a function that runs only once in a specified time window
   * @param {Function} func - Function to limit
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Function} Limited function
   */
  oncePerWindow(func, windowMs) {
    let lastRun = 0;
    
    return function(...args) {
      const now = Date.now();
      
      if (now - lastRun >= windowMs) {
        lastRun = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * Creates a function that runs only if called repeatedly within a time window
   * @param {Function} func - Function to apply rapid call logic to
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Function that executes after rapid calls stop
   */
  whenStopped(func, delay = 300) {
    let timeoutId;
    
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Debounces and caches the result of a function
   * @param {Function} func - Function to debounce and memoize
   * @param {number} delay - Delay in milliseconds
   * @param {Function} resolver - Function to resolve cache key
   * @returns {Function} Debounced and memoized function
   */
  debounceMemoize(func, delay, resolver) {
    const debounced = this.debounce(func, delay);
    const cache = new Map();
    
    return function(...args) {
      const key = resolver ? resolver.apply(this, args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = debounced.apply(this, args);
      
      // When the debounced function eventually executes, store the result
      if (result && typeof result.then === 'function') {
        // If it returns a promise, store the resolved value
        result.then(value => {
          cache.set(key, value);
        });
      } else {
        // If it's synchronous, store the result immediately
        cache.set(key, result);
      }
      
      return result;
    };
  }

  /**
   * Creates a function that executes immediately if first call, then debounces subsequent calls
   * @param {Function} func - Function to create immediate+debounce behavior for
   * @param {number} delay - Delay in milliseconds for subsequent calls
   * @param {Object} options - Options for behavior
   * @returns {Function} Function with immediate+debounce behavior
   */
  immediateThenDebounce(func, delay, options = {}) {
    const { 
      callFirst = true, 
      ...debounceOptions 
    } = options;
    
    let hasBeenCalled = false;
    const debounced = this.debounce(func, delay, debounceOptions);
    
    return function(...args) {
      if (!hasBeenCalled && callFirst) {
        hasBeenCalled = true;
        return func.apply(this, args);
      } else {
        return debounced.apply(this, args);
      }
    };
  }

  /**
   * Creates a function that executes immediately if first call, then throttles subsequent calls
   * @param {Function} func - Function to create immediate+throttle behavior for
   * @param {number} delay - Delay in milliseconds for throttling
   * @param {Object} options - Options for behavior
   * @returns {Function} Function with immediate+throttle behavior
   */
  immediateThenThrottle(func, delay, options = {}) {
    const { 
      callFirst = true, 
      ...throttleOptions 
    } = options;
    
    let hasBeenCalled = false;
    const throttled = this.throttle(func, delay, throttleOptions);
    
    return function(...args) {
      if (!hasBeenCalled && callFirst) {
        hasBeenCalled = true;
        return func.apply(this, args);
      } else {
        return throttled.apply(this, args);
      }
    };
  }

  /**
   * Creates a function with adaptive debouncing that adjusts delay based on call frequency
   * @param {Function} func - Function to adaptively debounce
   * @param {number} initialDelay - Initial delay in milliseconds
   * @param {number} maxDelay - Maximum delay in milliseconds
   * @param {number} minDelay - Minimum delay in milliseconds
   * @returns {Function} Function with adaptive debouncing
   */
  adaptiveDebounce(func, initialDelay, maxDelay = 2000, minDelay = 50) {
    let currentDelay = initialDelay;
    let lastCallTime = 0;
    
    // Track call intervals to adjust delay
    const callIntervals = [];
    const sampleSize = 10; // Number of calls to sample
    
    return this.debounce(function(...args) {
      // Calculate new delay based on recent call patterns
      const now = Date.now();
      if (lastCallTime > 0) {
        const interval = now - lastCallTime;
        callIntervals.push(interval);
        
        if (callIntervals.length > sampleSize) {
          callIntervals.shift(); // Remove oldest sample
        }
        
        // Adaptive logic: if calls are frequent, reduce delay
        if (callIntervals.length > 2) {
          const avgInterval = callIntervals.reduce((a, b) => a + b) / callIntervals.length;
          
          if (avgInterval < currentDelay) {
            // Increase delay when calls come faster than current delay
            currentDelay = Math.min(maxDelay, Math.max(minDelay, currentDelay * 1.2));
          } else if (avgInterval > currentDelay * 2) {
            // Decrease delay when there are gaps between calls
            currentDelay = Math.max(minDelay, currentDelay * 0.8);
          }
          
          // Update the debounce function with new delay
          return func.apply(this, args);
        }
      }
      
      lastCallTime = now;
      return func.apply(this, args);
    }, currentDelay);
  }

  /**
   * Creates a function that limits execution to only once per animation frame
   * @param {Function} func - Function to limit to animation frames
   * @returns {Function} Function limited to animation frames
   */
  frameLimit(func) {
    let queued = false;
    let args;
    
    return function(...callArgs) {
      args = callArgs;
      
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          func.apply(this, args);
          queued = false;
        });
      }
    };
  }

  /**
   * Creates a function that waits for a burst of activity to settle
   * @param {Function} func - Function to execute after settling
   * @param {number} settleDelay - Delay in milliseconds to wait for settling
   * @param {Object} options - Options including burst window and settle count
   * @returns {Function} Function that executes after activity settles
   */
  settle(func, settleDelay, options = {}) {
    const { 
      burstWindow = 100,  // Window in ms to consider calls part of a burst
      settleCount = 1,    // How many calls in burst window constitute a burst
      ...otherOptions
    } = options;
    
    let burstStartTime = 0;
    let burstCallCount = 0;
    let settleTimeout;
    let lastArgs;
    
    return function(...args) {
      lastArgs = args;
      const now = Date.now();
      
      // Check if this call is part of the current burst
      if (now - burstStartTime < burstWindow) {
        burstCallCount++;
      } else {
        // Reset burst tracking
        burstStartTime = now;
        burstCallCount = 1;
      }
      
      // Clear any existing settle timeout
      if (settleTimeout) {
        clearTimeout(settleTimeout);
      }
      
      // If we've detected a burst (multiple calls in window), wait longer before settling
      const waitTime = burstCallCount >= settleCount ? settleDelay : burstWindow;
      
      // Set timer to execute function after settle period
      settleTimeout = setTimeout(() => {
        func.apply(this, lastArgs);
        // Reset after execution
        burstStartTime = 0;
        burstCallCount = 0;
      }, waitTime);
    };
  }

  /**
   * Gets statistics about active debounced/throttled functions
   * @returns {Object} Statistics about active functions
   */
  getStats() {
    const totalFunctions = this.activeFunctions.size;
    let debounceCount = 0;
    let throttleCount = 0;
    
    this.activeFunctions.forEach((item) => {
      if (item.type === 'debounce') debounceCount++;
      if (item.type === 'throttle') throttleCount++;
    });
    
    return {
      totalActive: totalFunctions,
      debounced: debounceCount,
      throttled: throttleCount,
      functions: Array.from(this.activeFunctions.entries()).map(([key, item]) => ({
        key,
        type: item.type,
        age: Date.now() - item.createdAt
      }))
    };
  }

  /**
   * Cancels all active debounced/throttled functions
   * @returns {number} Number of functions cancelled
   */
  cancelAll() {
    let cancelledCount = 0;
    
    this.activeFunctions.forEach((item, key) => {
      if (item.fn) {
        item.fn.cancel && item.fn.cancel();
        cancelledCount++;
      }
    });
    
    this.activeFunctions.clear();
    return cancelledCount;
  }

  /**
   * Cancels a specific debounced/throttled function by key
   * @param {string} key - Key of the function to cancel
   * @returns {boolean} Whether the function was cancelled
   */
  cancelByKey(key) {
    const item = this.activeFunctions.get(key);
    
    if (item && item.fn) {
      item.fn.cancel && item.fn.cancel();
      this.activeFunctions.delete(key);
      return true;
    }
    
    return false;
  }

  /**
   * Creates a utility for debouncing DOM events
   * @param {HTMLElement} element - Element to add event listener to
   * @param {string} event - Event type (e.g., 'scroll', 'resize', 'input')
   * @param {Function} handler - Event handler function
   * @param {number} delay - Debounce delay in milliseconds
   * @param {Object} options - Debounce options
   * @returns {Function} Function to remove the event listener
   */
  debounceEvent(element, event, handler, delay = this.options.defaultDelay, options = {}) {
    if (!element || !handler) {
      throw new Error('Element and handler are required for debounceEvent');
    }
    
    const debouncedHandler = this.debounce(handler, delay, options);
    element.addEventListener(event, debouncedHandler);
    
    return () => {
      element.removeEventListener(event, debouncedHandler);
      debouncedHandler.cancel();
    };
  }

  /**
   * Creates a utility for throttling DOM events
   * @param {HTMLElement} element - Element to add event listener to
   * @param {string} event - Event type (e.g., 'scroll', 'resize', 'mousemove')
   * @param {Function} handler - Event handler function
   * @param {number} delay - Throttle delay in milliseconds
   * @param {Object} options - Throttle options
   * @returns {Function} Function to remove the event listener
   */
  throttleEvent(element, event, handler, delay = this.options.defaultDelay, options = {}) {
    if (!element || !handler) {
      throw new Error('Element and handler are required for throttleEvent');
    }
    
    const throttledHandler = this.throttle(handler, delay, options);
    element.addEventListener(event, throttledHandler, options.passive ? { passive: true } : false);
    
    return () => {
      element.removeEventListener(event, throttledHandler);
      throttledHandler.cancel();
    };
  }

  /**
   * Creates a function that debounces based on the execution time of the function
   * @param {Function} func - Function to adaptively debounce
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Function} Function with execution-time-adaptive debouncing
   */
  adaptiveOnExecutionTime(func, baseDelay) {
    let actualDelay = baseDelay;
    
    return this.debounce(function(...args) {
      const startTime = performance.now();
      const result = func.apply(this, args);
      const executionTime = performance.now() - startTime;
      
      // Adjust delay based on execution time - longer execution gets longer debounce
      actualDelay = Math.max(baseDelay, executionTime * 2);
      
      return result;
    }, actualDelay);
  }

  /**
   * Creates a function that runs after a series of different function calls settles
   * @param {Object} functions - Object with function names and callbacks
   * @param {number} delay - Delay in milliseconds
   * @returns {Object} Object with debounced functions and a global execution callback
   */
  createDebouncedGroup(functions, delay) {
    const debouncedFns = {};
    let timeoutId;
    const calls = new Set();
    
    // Create debounced versions of each function
    for (const [name, fn] of Object.entries(functions)) {
      debouncedFns[name] = this.debounce((...args) => {
        calls.add(name);
        const result = fn.apply(this, args);
        
        // Clear and reset timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          // Execute all collected calls
          const allResults = {};
          for (const call of calls) {
            if (functions[call]) {
              allResults[call] = functions[call].apply(this, args);
            }
          }
          
          calls.clear();
          
          // If there's a global callback, execute it
          if (debouncedFns.runAll) {
            debouncedFns.runAll(allResults);
          }
        }, delay);
        
        return result;
      }, delay);
    }
    
    // Add a runAll function to execute all pending functions immediately
    debouncedFns.runAllImmediately = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        
        const allResults = {};
        for (const call of calls) {
          if (functions[call]) {
            allResults[call] = functions[call].apply(this, []);
          }
        }
        
        calls.clear();
        return allResults;
      }
    };
    
    return debouncedFns;
  }

  /**
   * Creates a debounced async function that handles promises properly
   * @param {Function} func - Async function to debounce
   * @param {number} delay - Delay in milliseconds
   * @param {Object} options - Debounce options
   * @returns {Function} Debounced async function
   */
  debounceAsync(func, delay, options = {}) {
    if (typeof func !== 'function' || 
        (func.constructor.name !== 'AsyncFunction' && 
         !func.toString().includes('async'))) {
      throw new TypeError('Expected an async function');
    }
    
    const debounced = this.debounce((...args) => {
      return func.apply(this, args);
    }, delay, options);
    
    return async function(...args) {
      const result = debounced.apply(this, args);
      return result instanceof Promise ? await result : result;
    };
  }

  /**
   * Adds dynamic styles for debounce/throttle utilities
   */
  addDynamicStyles() {
    if (document.getElementById('debounce-throttle-styles')) return;

    const style = document.createElement('style');
    style.id = 'debounce-throttle-styles';
    style.textContent = `
      /* Styles for visualizing debounced/throttled events */
      .debounce-visualizer {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #00f2ea;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
      }
      
      .throttle-visualizer {
        position: fixed;
        top: 40px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #4facfe;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
      }
      
      .debounce-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        background-color: #00f2ea;
        border-radius: 50%;
        margin-right: 5px;
      }
      
      .throttle-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        background-color: #4facfe;
        border-radius: 50%;
        margin-right: 5px;
      }
      
      .debounce-active .debounce-indicator,
      .throttle-active .throttle-indicator {
        transform: scale(1.5);
        background-color: #00ff88;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Creates a visual indicator for debounced/throttled functions
   * @param {string} type - Indicator type ('debounce' or 'throttle')
   * @param {Object} options - Indicator options
   * @returns {HTMLElement} Visual indicator element
   */
  createVisualIndicator(type, options = {}) {
    const {
      position = 'top-right',
      autoHide = true,
      hideDelay = 1000,
      ...otherOptions
    } = options;

    const indicator = document.createElement('div');
    indicator.className = `${type}-visualizer`;
    
    const indicatorDot = document.createElement('span');
    indicatorDot.className = `${type}-indicator`;
    
    indicator.appendChild(indicatorDot);
    indicator.appendChild(document.createTextNode(`${type} active`));

    // Apply position styles
    const positionStyles = {
      'top-right': { top: '10px', right: '10px' },
      'top-left': { top: '10px', left: '10px' },
      'bottom-right': { bottom: '10px', right: '10px' },
      'bottom-left': { bottom: '10px', left: '10px' }
    };
    
    Object.assign(indicator.style, positionStyles[position] || positionStyles['top-right']);
    
    // Add to document
    document.body.appendChild(indicator);
    
    // Add class for active state
    indicator.classList.add(`${type}-active`);
    
    if (autoHide) {
      setTimeout(() => {
        indicator.classList.remove(`${type}-active`);
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
          }
        }, 300);
      }, hideDelay);
    }
    
    return indicator;
  }

  /**
   * Destroys the debounce/throttle utilities and cleans up
   */
  destroy() {
    // Cancel all active functions
    this.cancelAll();
    
    // Clear any remaining timeouts
    if (this.activeTimeouts) {
      this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      this.activeTimeouts.clear();
    }
  }
}

/**
 * Creates a new DebounceThrottleUtils instance
 * @param {Object} options - Configuration options
 * @returns {DebounceThrottleUtils} New instance
 */
function createDebounceThrottleUtils(options = {}) {
  return new DebounceThrottleUtils(options);
}

// Create default instance
const debounceThrottleUtils = new DebounceThrottleUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DebounceThrottleUtils,
    createDebounceThrottleUtils,
    debounceThrottleUtils
  };
}

// Make available globally
window.DebounceThrottleUtils = DebounceThrottleUtils;
window.createDebounceThrottleUtils = createDebounceThrottleUtils;
window.debounceThrottleUtils = debounceThrottleUtils;