// Session storage hook for JavaScript

function useSessionStorage(key, initialValue, options = {}) {
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
      // Handle null or undefined values by removing the item
      if (newValue === null || newValue === undefined) {
        return remove();
      }

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
    // Re-read from sessionStorage to ensure it's current
    try {
      const item = window.sessionStorage.getItem(key);
      currentValue = item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from sessionStorage with key "${key}":`, error);
    }
    
    return currentValue;
  }

  // Function to remove the item
  function remove() {
    try {
      window.sessionStorage.removeItem(key);
      
      // Update current value to initial value
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

  // Function to check if key exists
  function hasKey() {
    return window.sessionStorage.getItem(key) !== null;
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

  // Function to unsubscribe
  function unsubscribe() {
    onChange = null;
  }

  // Function to clear all sessionStorage
  function clearAll() {
    window.sessionStorage.clear();
    currentValue = initialValue;
  }

  // Function to get the actual sessionStorage object
  function getStorageObject() {
    return window.sessionStorage;
  }

  // Function to get all session storage keys
  function getAllKeys() {
    const keys = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      keys.push(window.sessionStorage.key(i));
    }
    return keys;
  }

  // Function to get all values
  function getAllValues() {
    const values = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      try {
        values[key] = deserialize(window.sessionStorage.getItem(key));
      } catch (error) {
        // If deserialization fails, return as string
        values[key] = window.sessionStorage.getItem(key);
      }
    }
    return values;
  }

  // Return the API
  return {
    value: getValue,
    update: updateValue,
    remove,
    hasKey,
    subscribe,
    unsubscribe,
    clearAll,
    getStorageObject,
    getAllKeys,
    getAllValues
  };
}

// Multiple session storage items hook
function useMultipleSessionStorage(initialState, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onChange = null
  } = options;

  // Store the state
  const state = { ...initialState };

  // Store the callbacks for each key
  const callbacks = {};

  // Create a handler for each key in the initial state
  const handlers = {};
  Object.keys(initialState).forEach(key => {
    // Initialize from sessionStorage if available
    try {
      const item = window.sessionStorage.getItem(key);
      if (item !== null) {
        state[key] = deserialize(item);
      }
    } catch (error) {
      console.error(`Error reading from sessionStorage with key "${key}":`, error);
    }

    // Create handler functions for this key
    handlers[key] = {
      get: () => {
        // Re-read from sessionStorage to ensure it's current
        try {
          const item = window.sessionStorage.getItem(key);
          state[key] = item ? deserialize(item) : initialState[key];
        } catch (error) {
          console.error(`Error reading from sessionStorage with key "${key}":`, error);
        }
        return state[key];
      },
      set: (newValue) => {
        // Handle null or undefined values by removing the item
        if (newValue === null || newValue === undefined) {
          return handlers[key].remove();
        }

        state[key] = newValue;
        try {
          const serializedValue = serialize(newValue);
          window.sessionStorage.setItem(key, serializedValue);
          
          // Call any registered callbacks for this key
          if (callbacks[key]) {
            callbacks[key].forEach(callback => callback(newValue, key));
          }
          
          return true;
        } catch (error) {
          console.error(`Error saving to sessionStorage with key "${key}":`, error);
          return false;
        }
      },
      remove: () => {
        try {
          window.sessionStorage.removeItem(key);
          delete state[key];
          
          // Call any registered callbacks for this key
          if (callbacks[key]) {
            callbacks[key].forEach(callback => callback(undefined, key));
          }
          
          return true;
        } catch (error) {
          console.error(`Error removing from sessionStorage with key "${key}":`, error);
          return false;
        }
      },
      hasKey: () => {
        return window.sessionStorage.getItem(key) !== null;
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

  // Return the handlers for all keys
  return handlers;
}

// Session storage with object path access
function useSessionStoragePath(key, initialValue = {}, options = {}) {
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

  // Function to get value at path
  function getValueAt(path) {
    const keys = path.split('.');
    let value = currentValue;

    for (const key of keys) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = value[key];
    }

    return value;
  }

  // Function to set value at path
  function setValueAt(path, newValue) {
    // Create a deep clone of the current value
    let newObj = JSON.parse(JSON.stringify(currentValue));
    const keys = path.split('.');
    let current = newObj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = newValue;

    // Update the session storage
    try {
      const serializedValue = serialize(newObj);
      window.sessionStorage.setItem(key, serializedValue);
      currentValue = newObj;
      
      if (onChange) {
        onChange(newObj, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving to sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to remove value at path
  function removeValueAt(path) {
    // Create a deep clone of the current value
    let newObj = JSON.parse(JSON.stringify(currentValue));
    const keys = path.split('.');
    let current = newObj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined || current[key] === null) {
        return false;
      }
      current = current[key];
    }

    delete current[keys[keys.length - 1]];

    // Update the session storage
    try {
      const serializedValue = serialize(newObj);
      window.sessionStorage.setItem(key, serializedValue);
      currentValue = newObj;
      
      if (onChange) {
        onChange(newObj, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving to sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to update value
  function updateValue(newValue) {
    try {
      const serializedValue = serialize(newValue);
      window.sessionStorage.setItem(key, serializedValue);
      currentValue = newValue;
      
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
    try {
      const item = window.sessionStorage.getItem(key);
      currentValue = item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from sessionStorage with key "${key}":`, error);
    }
    
    return currentValue;
  }

  // Function to remove the item
  function remove() {
    try {
      window.sessionStorage.removeItem(key);
      currentValue = initialValue;
      
      if (onChange) {
        onChange(undefined, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Return the API
  return {
    value: getValue,
    get: getValueAt,
    set: setValueAt,
    removeAt: removeValueAt,
    update: updateValue,
    remove
  };
}

// Hook for session storage with transformation functions
function useTransformedSessionStorage(key, initialValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    transformGet = (value) => value,
    transformSet = (value) => value,
    onChange = null
  } = options;

  // Initialize value from sessionStorage or use initial value
  let currentValue;
  let transformedValue;
  try {
    const item = window.sessionStorage.getItem(key);
    currentValue = item ? deserialize(item) : initialValue;
    transformedValue = transformGet(currentValue);
  } catch (error) {
    console.error(`Error reading from sessionStorage with key "${key}":`, error);
    currentValue = initialValue;
    transformedValue = transformGet(currentValue);
  }

  // Function to update value in sessionStorage
  function updateValue(newValue) {
    try {
      // Apply transformation before saving
      const transformed = transformSet(newValue);
      const serializedValue = serialize(transformed);
      window.sessionStorage.setItem(key, serializedValue);
      
      // Update current value
      currentValue = transformed;
      transformedValue = transformGet(transformed);
      
      // Notify change if callback exists
      if (onChange) {
        onChange(transformedValue, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving to sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Function to get transformed current value
  function getValue() {
    // Re-read from sessionStorage to ensure it's current
    try {
      const item = window.sessionStorage.getItem(key);
      currentValue = item ? deserialize(item) : initialValue;
      transformedValue = transformGet(currentValue);
    } catch (error) {
      console.error(`Error reading from sessionStorage with key "${key}":`, error);
    }
    
    return transformedValue;
  }

  // Function to remove the item
  function remove() {
    try {
      window.sessionStorage.removeItem(key);
      
      // Update current value to initial value
      currentValue = initialValue;
      transformedValue = transformGet(initialValue);
      
      // Notify removal if callback exists
      if (onChange) {
        onChange(transformedValue, key);
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage with key "${key}":`, error);
      return false;
    }
  }

  // Return the API
  return {
    value: getValue,
    update: updateValue,
    remove
  };
}

// Export the hooks
export { 
  useSessionStorage, 
  useMultipleSessionStorage, 
  useSessionStoragePath, 
  useTransformedSessionStorage 
};