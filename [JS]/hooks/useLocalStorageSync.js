// Local storage sync hook for JavaScript

function useLocalStorageSync(key, initialValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
    onChange = null
  } = options;

  // Initialize value from localStorage or use initial value
  let currentValue;
  try {
    const item = window.localStorage.getItem(key);
    currentValue = item ? deserialize(item) : initialValue;
  } catch (error) {
    console.error(`Error reading from localStorage with key "${key}":`, error);
    currentValue = initialValue;
  }

  // Function to update value in localStorage
  function updateValue(newValue) {
    try {
      const serializedValue = serialize(newValue);
      window.localStorage.setItem(key, serializedValue);
      
      // Update current value
      currentValue = newValue;
      
      // Notify change if callback exists
      if (onChange) {
        onChange(newValue, key);
      }
      
      // Dispatch custom event for cross-tab synchronization
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, newValue }
        }));
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to get current value
  function getValue() {
    return currentValue;
  }

  // Function to remove the item
  function remove() {
    try {
      window.localStorage.removeItem(key);
      
      // Update current value
      currentValue = initialValue;
      
      // Notify removal if callback exists
      if (onChange) {
        onChange(undefined, key);
      }
      
      // Dispatch custom event for cross-tab synchronization
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, newValue: undefined }
        }));
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to subscribe to changes
  function subscribe(callback) {
    if (onChange) {
      // If there's already a callback, create a function that calls both
      const originalCallback = onChange;
      onChange = (value, key) => {
        originalCallback(value, key);
        callback(value, key);
      };
    } else {
      onChange = callback;
    }
  }

  // Add event listener for cross-tab synchronization
  if (syncAcrossTabs) {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? deserialize(e.newValue) : undefined;
          currentValue = newValue;
          if (onChange) {
            onChange(newValue, key);
          }
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    // Listen for changes to localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom event
    window.addEventListener('local-storage-change', (e) => {
      if (e.detail.key === key) {
        currentValue = e.detail.newValue;
        if (onChange) {
          onChange(e.detail.newValue, key);
        }
      }
    });

    // Return a function to remove the event listener
    const unsubscribe = () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', (e) => {
        if (e.detail.key === key) {
          currentValue = e.detail.newValue;
          if (onChange) {
            onChange(e.detail.newValue, key);
          }
        }
      });
    };
  }

  // Return the API
  return {
    value: getValue,
    update: updateValue,
    remove,
    subscribe
  };
}

// Session storage sync hook
function useSessionStorageSync(key, initialValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onChange = null
  } = options;

  // Initialize value from sessionStorage or use initial value
  let currentValue;
  try {
    const item = window.sessionStorage.getItem(key);
    currentValue = item ? deserialize(item) : initialValue;
  } catch (error) {
    console.error(`Error reading from sessionStorage with key "${key}":`, error);
    currentValue = initialValue;
  }

  // Function to update value in sessionStorage
  function updateValue(newValue) {
    try {
      const serializedValue = serialize(newValue);
      window.sessionStorage.setItem(key, serializedValue);
      
      // Update current value
      currentValue = newValue;
      
      // Notify change if callback exists
      if (onChange) {
        onChange(newValue, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving to sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to get current value
  function getValue() {
    return currentValue;
  }

  // Function to remove the item
  function remove() {
    try {
      window.sessionStorage.removeItem(key);
      
      // Update current value
      currentValue = initialValue;
      
      // Notify removal if callback exists
      if (onChange) {
        onChange(undefined, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to subscribe to changes
  function subscribe(callback) {
    if (onChange) {
      // If there's already a callback, create a function that calls both
      const originalCallback = onChange;
      onChange = (value, key) => {
        originalCallback(value, key);
        callback(value, key);
      };
    } else {
      onChange = callback;
    }
  }

  // Return the API
  return {
    value: getValue,
    update: updateValue,
    remove,
    subscribe
  };
}

// Multiple local storage items hook
function useMultipleLocalStorage(initialState, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true
  } = options;

  // Store the state
  const state = { ...initialState };

  // Store the callbacks for each key
  const callbacks = {};

  // Create a handler for each key in the initial state
  const handlers = {};
  Object.keys(initialState).forEach(key => {
    // Initialize from localStorage if available
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        state[key] = deserialize(item);
      }
    } catch (error) {
      console.error(`Error reading from localStorage with key "${key}":`, error);
    }

    // Create handler functions for this key
    handlers[key] = {
      get: () => state[key],
      set: (newValue) => {
        state[key] = newValue;
        try {
          const serializedValue = serialize(newValue);
          window.localStorage.setItem(key, serializedValue);
          
          // Call any registered callbacks for this key
          if (callbacks[key]) {
            callbacks[key].forEach(callback => callback(newValue, key));
          }
          
          // Dispatch custom event for cross-tab synchronization
          if (syncAcrossTabs) {
            window.dispatchEvent(new CustomEvent('local-storage-change', {
              detail: { key, newValue }
            }));
          }
          
          return true;
        } catch (error) {
          console.error(`Error saving to localStorage with key "${key}":`, error);
          return false;
        }
      },
      remove: () => {
        try {
          window.localStorage.removeItem(key);
          delete state[key];
          
          // Call any registered callbacks for this key
          if (callbacks[key]) {
            callbacks[key].forEach(callback => callback(undefined, key));
          }
          
          // Dispatch custom event for cross-tab synchronization
          if (syncAcrossTabs) {
            window.dispatchEvent(new CustomEvent('local-storage-change', {
              detail: { key, newValue: undefined }
            }));
          }
          
          return true;
        } catch (error) {
          console.error(`Error removing from localStorage with key "${key}":`, error);
          return false;
        }
      },
      subscribe: (callback) => {
        if (!callbacks[key]) {
          callbacks[key] = [];
        }
        callbacks[key].push(callback);
        
        // Return an unsubscribe function
        return () => {
          const index = callbacks[key].indexOf(callback);
          if (index > -1) {
            callbacks[key].splice(index, 1);
          }
        };
      }
    };
  });

  // Add event listener for cross-tab synchronization
  if (syncAcrossTabs) {
    const handleStorageChange = (e) => {
      if (Object.keys(initialState).includes(e.key)) {
        try {
          const newValue = e.newValue ? deserialize(e.newValue) : undefined;
          state[e.key] = newValue;
          
          // Call any registered callbacks for this key
          if (callbacks[e.key]) {
            callbacks[e.key].forEach(callback => callback(newValue, e.key));
          }
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${e.key}":`, error);
        }
      }
    };

    // Listen for changes to localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom event
    window.addEventListener('local-storage-change', (e) => {
      if (Object.keys(initialState).includes(e.detail.key)) {
        state[e.detail.key] = e.detail.newValue;
        
        // Call any registered callbacks for this key
        if (callbacks[e.detail.key]) {
          callbacks[e.detail.key].forEach(callback => callback(e.detail.newValue, e.detail.key));
        }
      }
    });
  }

  // Return the handlers for all keys
  return handlers;
}

// Hook for localStorage with expiration
function useExpiringLocalStorage(key, initialValue, expirationMs = 24 * 60 * 60 * 1000) { // Default to 24 hours
  // Initialize value from localStorage or use initial value
  let currentValue;
  let expirationTime;
  
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      expirationTime = parsed.expiration;
      
      if (Date.now() < expirationTime) {
        currentValue = parsed.value;
      } else {
        // Item has expired, remove it
        window.localStorage.removeItem(key);
        currentValue = initialValue;
      }
    } else {
      currentValue = initialValue;
    }
  } catch (error) {
    console.error(`Error reading from expiring localStorage with key "${key}":`, error);
    currentValue = initialValue;
  }

  // Function to update value with expiration
  function updateValue(newValue) {
    try {
      const item = {
        value: newValue,
        expiration: Date.now() + expirationMs
      };
      
      window.localStorage.setItem(key, JSON.stringify(item));
      currentValue = newValue;
      
      return true;
    } catch (error) {
      console.error(`Error saving to expiring localStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to get current value
  function getValue() {
    // Check if the value has expired
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() < parsed.expiration) {
          return parsed.value;
        } else {
          // Item has expired, remove it
          window.localStorage.removeItem(key);
          return initialValue;
        }
      }
    } catch (error) {
      console.error(`Error checking expiration for key "${key}":`, error);
    }
    
    return currentValue;
  }

  // Function to check if value is expired
  function isExpired() {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return Date.now() >= parsed.expiration;
      }
      return true;
    } catch (error) {
      console.error(`Error checking expiration for key "${key}":`, error);
      return true;
    }
  }

  return {
    value: getValue,
    update: updateValue,
    isExpired
  };
}

// Export the hooks
export { 
  useLocalStorageSync, 
  useSessionStorageSync, 
  useMultipleLocalStorage, 
  useExpiringLocalStorage 
};