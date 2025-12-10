/**
 * useLocalStorage Hook
 * React-like hook for localStorage interaction with synchronization across tabs
 * Compatible with jazer-brand.css styling for hook-related utilities
 */

// Define the hook as a standalone utility that can work independently of React
class LocalStorageHook {
  constructor(key, initialValue) {
    this.key = key;
    this.initialValue = initialValue;

    // Initialize with value from localStorage or initial value
    this.value = this.getLocalStorageValue();
    this.listeners = [];
    
    // Listen for storage changes from other tabs
    this.setupStorageSync();
  }

  /**
   * Gets the value from localStorage, with fallback to initial value
   * @returns {*} Stored value or initial value
   */
  getLocalStorageValue() {
    try {
      // Get from localStorage
      const item = window.localStorage.getItem(this.key);
      
      // If item exists and can be parsed, return it
      if (item !== null) {
        return JSON.parse(item);
      }
      
      // If no item exists, set and return the initial value
      if (this.initialValue !== undefined) {
        this.set(this.initialValue);
        return this.initialValue;
      }
      
      return null;
    } catch (error) {
      console.error(`Error reading localStorage key "${this.key}":`, error);
      return this.initialValue !== undefined ? this.initialValue : null;
    }
  }

  /**
   * Sets a value in localStorage
   * @param {*} value - Value to set
   * @param {boolean} notify - Whether to notify listeners (default: true)
   */
  set(value, notify = true) {
    // Handle function updater pattern
    const setValue = typeof value === 'function' ? value(this.value) : value;

    try {
      window.localStorage.setItem(this.key, JSON.stringify(setValue));
      this.value = setValue;

      // Notify listeners if requested and value actually changed
      if (notify) {
        this.notifyListeners(setValue);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${this.key}":`, error);
    }
  }

  /**
   * Gets the current value
   * @returns {*} Current value
   */
  get() {
    return this.value;
  }

  /**
   * Removes the item from localStorage
   * @param {boolean} notify - Whether to notify listeners (default: true)
   */
  remove(notify = true) {
    try {
      window.localStorage.removeItem(this.key);
      this.value = undefined;

      if (notify) {
        this.notifyListeners(undefined);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${this.key}":`, error);
    }
  }

  /**
   * Clears all localStorage values with the same prefix as this key
   */
  clearPrefixed() {
    try {
      const prefix = this.key.split(':')[0] + ':';
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing prefixed localStorage:', error);
    }
  }

  /**
   * Adds a listener for value changes
   * @param {Function} listener - Function to call when value changes
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    this.listeners.push(listener);

    // Return function to remove listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifies all listeners of a value change
   * @param {*} newValue - New value
   */
  notifyListeners(newValue) {
    // Create event for listeners
    const event = {
      key: this.key,
      oldValue: this.value,
      newValue: newValue,
      timestamp: Date.now()
    };

    // Call all listeners
    this.listeners.forEach(listener => {
      try {
        listener(newValue, this.value, event);
      } catch (error) {
        console.error('Error in localStorage listener:', error);
      }
    });
  }

  /**
   * Sets up synchronization between tabs/windows
   */
  setupStorageSync() {
    // Listen for storage events to sync changes across tabs
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (e) => {
        if (e.key === this.key) {
          if (e.newValue !== e.oldValue) {
            try {
              const parsedValue = e.newValue ? JSON.parse(e.newValue) : undefined;
              this.value = parsedValue;
              
              // Notify listeners of external change
              this.notifyListeners(parsedValue);
            } catch (error) {
              console.error('Error parsing storage event value:', error);
            }
          }
        }
      });
    }
  }

  /**
   * Creates a debounced setter to limit storage writes
   * @param {number} delay - Debounce delay in milliseconds
   * @returns {Function} Debounced setter function
   */
  createDebouncedSetter(delay = 300) {
    let timeoutId;
    
    return (value) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        this.set(value);
      }, delay);
    };
  }

  /**
   * Creates a throttled setter to limit storage writes
   * @param {number} limit - Throttle limit in milliseconds
   * @returns {Function} Throttled setter function
   */
  createThrottledSetter(limit = 500) {
    let lastCallTime = 0;
    let pendingValue = null;
    let pending = false;
    
    return (value) => {
      const now = Date.now();
      
      if (now - lastCallTime >= limit) {
        this.set(value);
        lastCallTime = now;
      } else {
        // Schedule update for when throttle allows
        if (pending) {
          pendingValue = value; // Update pending value
        } else {
          pending = true;
          pendingValue = value;
          
          setTimeout(() => {
            this.set(pendingValue);
            pending = false;
            lastCallTime = Date.now();
          }, limit - (now - lastCallTime));
        }
      }
    };
  }

  /**
   * Gets the size of the stored value in bytes
   * @returns {number} Size in bytes
   */
  getValueSize() {
    try {
      const value = window.localStorage.getItem(this.key);
      if (value === null) return 0;
      return new Blob([value]).size;
    } catch (error) {
      console.error(`Error getting size for key "${this.key}":`, error);
      return 0;
    }
  }

  /**
   * Gets metadata about the stored value
   * @returns {Object} Metadata object
   */
  getMetadata() {
    try {
      const value = window.localStorage.getItem(this.key);
      if (value === null) return null;
      
      return {
        key: this.key,
        size: new Blob([value]).size,
        timestamp: Date.now(),
        type: typeof JSON.parse(value),
        exists: true
      };
    } catch (error) {
      console.error(`Error getting metadata for key "${this.key}":`, error);
      return {
        key: this.key,
        exists: false
      };
    }
  }
}

/**
 * Creates a localStorage hook instance
 * @param {string} key - Key to store/retrieve
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Object} Object with { value, set, remove, addListener } methods
 */
function createLocalStorageHook(key, initialValue) {
  const hook = new LocalStorageHook(key, initialValue);
  
  return {
    value: hook.get(),
    set: hook.set.bind(hook),
    remove: hook.remove.bind(hook),
    addListener: hook.addListener.bind(hook),
    createDebouncedSetter: hook.createDebouncedSetter.bind(hook),
    createThrottledSetter: hook.createThrottledSetter.bind(hook),
    getValueSize: hook.getValueSize.bind(hook),
    getMetadata: hook.getMetadata.bind(hook)
  };
}

/**
 * useLocalStorage hook implementation for vanilla JS
 * @param {string} key - Key to use in localStorage
 * @param {*} initialValue - Initial value to use if key doesn't exist
 * @returns {Array} Array with [value, setter] similar to React hooks
 */
function useLocalStorage(key, initialValue) {
  // Create a unique instance for this hook call
  const hook = new LocalStorageHook(key, initialValue);
  
  // Return value and setter function similar to React's useState
  return [
    hook.get(),
    (newValue) => hook.set(newValue)
  ];
}

/**
 * useSessionStorage hook implementation for vanilla JS
 * @param {string} key - Key to use in sessionStorage
 * @param {*} initialValue - Initial value to use if key doesn't exist
 * @returns {Array} Array with [value, setter] similar to React hooks
 */
function useSessionStorage(key, initialValue) {
  // Similar implementation to localStorage but using sessionStorage
  const value = sessionStorage.getItem(key);
  const storedValue = value !== null ? JSON.parse(value) : initialValue;

  const setter = (newValue) => {
    try {
      const setValue = typeof newValue === 'function' ? newValue(storedValue) : newValue;
      sessionStorage.setItem(key, JSON.stringify(setValue));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  // On initial load, set the value if it doesn't exist
  if (value === null && initialValue !== undefined) {
    setter(initialValue);
  }

  return [storedValue, setter];
}

/**
 * useStorage hook with configurable storage type
 * @param {string} key - Key to use in storage
 * @param {*} initialValue - Initial value to use if key doesn't exist
 * @param {string} storageType - Type of storage ('local' or 'session')
 * @returns {Array} Array with [value, setter] similar to React hooks
 */
function useStorage(key, initialValue, storageType = 'local') {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  
  const value = storage.getItem(key);
  const storedValue = value !== null ? JSON.parse(value) : initialValue;

  const setter = (newValue) => {
    try {
      const setValue = typeof newValue === 'function' ? newValue(storedValue) : newValue;
      storage.setItem(key, JSON.stringify(setValue));
    } catch (error) {
      console.error(`Error setting ${storageType}Storage key "${key}":`, error);
    }
  };

  // On initial load, set the value if it doesn't exist
  if (value === null && initialValue !== undefined) {
    setter(initialValue);
  }

  return [storedValue, setter];
}

/**
 * useLocalStorageState hook with built-in state management
 * @param {string} key - Key to use in localStorage
 * @param {*} initialState - Initial state to use if key doesn't exist
 * @returns {Array} Array with [state, setState, removeState, metadata]
 */
function useLocalStorageState(key, initialState) {
  const [state, setState] = useLocalStorage(key, initialState);
  
  const removeState = () => {
    localStorage.removeItem(key);
  };
  
  const metadata = useMemo(() => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return { exists: false };
      
      return {
        exists: true,
        size: new Blob([value]).size,
        timestamp: Date.now(),
        type: typeof JSON.parse(value)
      };
    } catch (e) {
      return { exists: false, error: e.message };
    }
  }, [key]);

  return [state, setState, removeState, metadata];
}

/**
 * useMultipleStorage hook to manage multiple localStorage keys as one state
 * @param {Object} keyMap - Object mapping state keys to localStorage keys
 * @param {Object} initialStates - Object with initial states for each key
 * @returns {Array} Array with [state, setState] similar to React hooks
 */
function useMultipleStorage(keyMap, initialStates = {}) {
  // Initialize state from localStorage
  const state = {};
  for (const [stateKey, storageKey] of Object.entries(keyMap)) {
    const storedValue = localStorage.getItem(storageKey);
    state[stateKey] = storedValue !== null ? JSON.parse(storedValue) : initialStates[stateKey];
  }

  // Create setter function
  const setState = (updates) => {
    const updateObj = typeof updates === 'function' ? updates(state) : updates;
    
    for (const [stateKey, newValue] of Object.entries(updateObj)) {
      const storageKey = keyMap[stateKey];
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newValue));
        } catch (error) {
          console.error(`Error setting localStorage key "${storageKey}":`, error);
        }
      }
    }
  };

  // Set initial values if they don't exist
  for (const [stateKey, storageKey] of Object.entries(keyMap)) {
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue === null && initialStates[stateKey] !== undefined) {
      localStorage.setItem(storageKey, JSON.stringify(initialStates[stateKey]));
    }
  }

  return [state, setState];
}

/**
 * useLocalStorageReducer hook with reducer pattern
 * @param {string} key - Key to use in localStorage
 * @param {Function} reducer - Reducer function
 * @param {*} initialState - Initial state
 * @returns {Array} Array with [state, dispatch] similar to React's useReducer
 */
function useLocalStorageReducer(key, reducer, initialState) {
  const [state, setState] = useLocalStorage(key, initialState);
  
  const dispatch = (action) => {
    const newState = reducer(state, action);
    setState(newState);
  };
  
  // Initialize if needed
  if (localStorage.getItem(key) === null && initialState !== undefined) {
    localStorage.setItem(key, JSON.stringify(initialState));
  }
  
  return [state, dispatch];
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LocalStorageHook,
    createLocalStorageHook,
    useLocalStorage,
    useSessionStorage,
    useStorage,
    useLocalStorageState,
    useMultipleStorage,
    useLocalStorageReducer
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LocalStorageHook = LocalStorageHook;
  window.createLocalStorageHook = createLocalStorageHook;
  window.useLocalStorage = useLocalStorage;
  window.useSessionStorage = useSessionStorage;
  window.useStorage = useStorage;
  window.useLocalStorageState = useLocalStorageState;
  window.useMultipleStorage = useMultipleStorage;
  window.useLocalStorageReducer = useLocalStorageReducer;
}