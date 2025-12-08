/**
 * Object Utilities Module
 * Comprehensive object manipulation and utility functions
 * Compatible with jazer-brand.css styling for object-related utilities
 */

class ObjectUtils {
  /**
   * Creates a new object utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      deepClone: true,
      immutable: true,
      ...options
    };
  }

  /**
   * Creates a deep clone of an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Deep clone of the object
   */
  static deepClone(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    
    // Handle Date
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map(item => ObjectUtils.deepClone(item));
    }
    
    // Handle RegExp
    if (obj instanceof RegExp) {
      return new RegExp(obj);
    }
    
    // Handle Set
    if (obj instanceof Set) {
      const newSet = new Set();
      obj.forEach(value => newSet.add(ObjectUtils.deepClone(value)));
      return newSet;
    }
    
    // Handle Map
    if (obj instanceof Map) {
      const newMap = new Map();
      obj.forEach((value, key) => newMap.set(key, ObjectUtils.deepClone(value)));
      return newMap;
    }
    
    // Handle plain objects
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = ObjectUtils.deepClone(obj[key]);
      }
    }
    
    return clonedObj;
  }

  /**
   * Merges multiple objects deeply
   * @param {...Object} objects - Objects to merge
   * @returns {Object} Merged object
   */
  static deepMerge(...objects) {
    const result = {};
    
    for (const obj of objects) {
      if (!obj || typeof obj !== 'object') continue;
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            // Recursively merge nested objects
            result[key] = ObjectUtils.deepMerge(result[key] || {}, obj[key]);
          } else if (Array.isArray(obj[key])) {
            // Merge arrays by combining them
            if (!Array.isArray(result[key])) {
              result[key] = [];
            }
            result[key] = [...result[key], ...obj[key]];
          } else {
            // Simply assign primitive values
            result[key] = obj[key];
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Merges objects shallowly
   * @param {...Object} objects - Objects to merge
   * @returns {Object} Merged object
   */
  static shallowMerge(...objects) {
    const result = {};
    for (const obj of objects) {
      if (obj && typeof obj === 'object') {
        Object.assign(result, obj);
      }
    }
    return result;
  }

  /**
   * Gets a nested property from an object using a path string
   * @param {Object} obj - Object to get property from
   * @param {string} path - Path to property (e.g., 'user.profile.name')
   * @param {*} defaultValue - Default value if property doesn't exist
   * @returns {*} Value at the specified path or default value
   */
  static get(obj, path, defaultValue) {
    if (!obj || typeof obj !== 'object' || typeof path !== 'string') {
      return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Sets a nested property on an object using a path string
   * @param {Object} obj - Object to set property on
   * @param {string} path - Path to property (e.g., 'user.profile.name')
   * @param {*} value - Value to set
   * @param {boolean} createPath - Whether to create intermediate objects if they don't exist
   * @returns {Object} Modified object
   */
  static set(obj, path, value, createPath = true) {
    if (!obj || typeof obj !== 'object' || typeof path !== 'string') return obj;

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        if (createPath) {
          current[key] = {};
        } else {
          return obj;
        }
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
  }

  /**
   * Removes a nested property from an object using a path string
   * @param {Object} obj - Object to remove property from
   * @param {string} path - Path to property (e.g., 'user.profile.name')
   * @returns {boolean} Whether the property was successfully removed
   */
  static unset(obj, path) {
    if (!obj || typeof obj !== 'object' || typeof path !== 'string') return false;

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
        return false;
      }
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      delete current[lastKey];
      return true;
    }

    return false;
  }

  /**
   * Checks if an object has a nested property
   * @param {Object} obj - Object to check
   * @param {string} path - Path to property (e.g., 'user.profile.name')
   * @returns {boolean} Whether the property exists
   */
  static has(obj, path) {
    if (!obj || typeof obj !== 'object' || typeof path !== 'string') return false;

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  /**
   * Gets all nested property paths in an object
   * @param {Object} obj - Object to extract paths from
   * @param {string} prefix - Prefix for paths (internal use)
   * @returns {Array} Array of property path strings
   */
  static getPaths(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return [];

    const paths = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const path = prefix ? `${prefix}.${key}` : key;
        paths.push(path);

        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          paths.push(...ObjectUtils.getPaths(obj[key], path));
        }
      }
    }

    return paths;
  }

  /**
   * Flattens a nested object to a single level using dot notation
   * @param {Object} obj - Object to flatten
   * @param {string} prefix - Prefix for keys (internal use)
   * @returns {Object} Flattened object
   */
  static flatten(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return obj;

    const flattened = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, ObjectUtils.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  }

  /**
   * Unflattens a flattened object back to nested structure
   * @param {Object} obj - Flattened object to unflatten
   * @returns {Object} Unflattened object
   */
  static unflatten(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const result = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        ObjectUtils.set(result, key, obj[key], true);
      }
    }

    return result;
  }

  /**
   * Picks specific properties from an object
   * @param {Object} obj - Object to pick properties from
   * @param {Array} keys - Array of property names to pick
   * @returns {Object} Object with only the specified properties
   */
  static pick(obj, keys) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) return {};

    const result = {};
    
    for (const key of keys) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
    
    return result;
  }

  /**
   * Omits specific properties from an object
   * @param {Object} obj - Object to omit properties from
   * @param {Array} keys - Array of property names to omit
   * @returns {Object} Object without the specified properties
   */
  static omit(obj, keys) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) return obj;

    const result = { ...obj };
    
    for (const key of keys) {
      delete result[key];
    }
    
    return result;
  }

  /**
   * Filters an object by a predicate function
   * @param {Object} obj - Object to filter
   * @param {Function} predicate - Function to test each property
   * @returns {Object} Object with properties that passed the test
   */
  static filter(obj, predicate) {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') return {};

    const result = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && predicate(obj[key], key, obj)) {
        result[key] = obj[key];
      }
    }
    
    return result;
  }

  /**
   * Maps object values using a transform function
   * @param {Object} obj - Object to map values for
   * @param {Function} transform - Function to transform values
   * @returns {Object} Object with transformed values
   */
  static mapValues(obj, transform) {
    if (!obj || typeof obj !== 'object' || typeof transform !== 'function') return {};

    const result = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = transform(obj[key], key, obj);
      }
    }
    
    return result;
  }

  /**
   * Maps object keys using a transform function
   * @param {Object} obj - Object to map keys for
   * @param {Function} transform - Function to transform keys
   * @returns {Object} Object with transformed keys
   */
  static mapKeys(obj, transform) {
    if (!obj || typeof obj !== 'object' || typeof transform !== 'function') return {};

    const result = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = transform(key, obj[key], obj);
        result[newKey] = obj[key];
      }
    }
    
    return result;
  }

  /**
   * Checks if two objects are deeply equal
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} Whether the objects are deeply equal
   */
  static deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key)) return false;
      
      if (!ObjectUtils.deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }

  /**
   * Gets the size of an object (number of own enumerable properties)
   * @param {Object} obj - Object to measure
   * @returns {number} Number of own enumerable properties
   */
  static size(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.keys(obj).length;
  }

  /**
   * Checks if an object is empty (has no own enumerable properties)
   * @param {Object} obj - Object to check
   * @returns {boolean} Whether the object is empty
   */
  static isEmpty(obj) {
    if (!obj || typeof obj !== 'object') return true;
    return Object.keys(obj).length === 0;
  }

  /**
   * Checks if an object is not empty
   * @param {Object} obj - Object to check
   * @returns {boolean} Whether the object is not empty
   */
  static isNotEmpty(obj) {
    return !ObjectUtils.isEmpty(obj);
  }

  /**
   * Checks if an object is a plain object
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object is a plain object
   */
  static isPlainObject(obj) {
    return obj !== null && 
           typeof obj === 'object' && 
           obj.constructor === Object &&
           Object.prototype.toString.call(obj) === '[object Object]';
  }

  /**
   * Checks if an object is a plain object (alternative implementation)
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object is a plain object
   */
  static isPlainObject(obj) {
    if (ObjectUtils.isNull(obj) || ObjectUtils.isUndefined(obj)) return false;
    if (obj.constructor !== Object) return false;
    
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  /**
   * Checks if an object is null
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object is null
   */
  static isNull(obj) {
    return obj === null;
  }

  /**
   * Checks if an object is undefined
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object is undefined
   */
  static isUndefined(obj) {
    return obj === undefined;
  }

  /**
   * Checks if an object is null or undefined
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object is null or undefined
   */
  static isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
  }

  /**
   * Merges objects with a custom merger function
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @param {Function} merger - Function to merge properties
   * @returns {Object} Merged object
   */
  static mergeWith(obj1, obj2, merger) {
    if (!obj1 || typeof obj1 !== 'object' || !obj2 || typeof obj2 !== 'object') {
      return obj2 || obj1;
    }

    const result = { ...obj1 };

    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (obj1.hasOwnProperty(key) && typeof merger === 'function') {
          result[key] = merger(obj1[key], obj2[key], key);
        } else {
          result[key] = obj2[key];
        }
      }
    }

    return result;
  }

  /**
   * Creates a frozen object that prevents modifications
   * @param {Object} obj - Object to freeze
   * @returns {Object} Frozen object
   */
  static freeze(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const freezeDeep = (o) => {
      Object.getOwnPropertyNames(o).forEach(prop => {
        if (o[prop] !== null && typeof o[prop] === 'object') {
          freezeDeep(o[prop]);
        }
      });
      return Object.freeze(o);
    };
    
    return freezeDeep(obj);
  }

  /**
   * Creates a sealed object that prevents new properties from being added
   * @param {Object} obj - Object to seal
   * @returns {Object} Sealed object
   */
  static seal(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.seal(obj);
  }

  /**
   * Creates an object with properties that have getters/setters
   * @param {Object} obj - Object with property definitions
   * @returns {Object} Object with getters/setters
   */
  static createWithGettersSetters(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const result = {};

    for (const [key, def] of Object.entries(obj)) {
      Object.defineProperty(result, key, {
        get: def.get || (() => def.value),
        set: def.set || (() => {}),
        configurable: def.configurable !== false,
        enumerable: def.enumerable !== false
      });
    }

    return result;
  }

  /**
   * Converts an object to a query string
   * @param {Object} obj - Object to convert
   * @param {Object} options - Conversion options
   * @returns {string} Query string representation
   */
  static toQueryString(obj, options = {}) {
    if (!obj || typeof obj !== 'object') return '';

    const {
      arrayFormat = 'brackets',  // 'brackets', 'indices', 'repeat'
      encodeValuesOnly = false,
      delimiter = '&'
    } = options;

    const parts = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        switch (arrayFormat) {
          case 'brackets':
            value.forEach(v => parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`));
            break;
          case 'indices':
            value.forEach((v, i) => parts.push(`${encodeURIComponent(key)}[${i}]=${encodeURIComponent(v)}`));
            break;
          case 'repeat':
            value.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
            break;
        }
      } else if (typeof value === 'object') {
        // Recursively handle nested objects
        const nested = ObjectUtils.toQueryString(value, options);
        if (nested) {
          parts.push(`${encodeURIComponent(key)}=${encodeValuesOnly ? nested : encodeURIComponent(nested)}`);
        }
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }

    return parts.join(delimiter);
  }

  /**
   * Converts a query string to an object
   * @param {string} queryString - Query string to convert
   * @returns {Object} Object representation of query string
   */
  static fromQueryString(queryString) {
    if (typeof queryString !== 'string') return {};

    const obj = {};

    // Remove leading '?' if present
    const qs = queryString.startsWith('?') ? queryString.substring(1) : queryString;

    if (!qs) return obj;

    const pairs = qs.split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (!key) continue;

      const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
      const decodedValue = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';

      // Handle array notation (key[])
      if (decodedKey.endsWith('[]')) {
        const arrayKey = decodedKey.slice(0, -2);
        if (!obj[arrayKey]) {
          obj[arrayKey] = [];
        }
        obj[arrayKey].push(decodedValue);
      } 
      // Handle array indices (key[index])
      else if (/\[.*\]/.test(decodedKey)) {
        const match = decodedKey.match(/(.*?)\[(.*)\]/);
        if (match) {
          const [_, baseKey, index] = match;
          if (!obj[baseKey]) {
            obj[baseKey] = {};
          }
          obj[baseKey][index] = decodedValue;
        }
      } 
      // Handle regular key-value
      else {
        obj[decodedKey] = decodedValue;
      }
    }

    return obj;
  }

  /**
   * Creates an object from arrays of keys and values
   * @param {Array} keys - Array of keys
   * @param {Array} values - Array of values
   * @returns {Object} Object with keys mapped to values
   */
  static fromKeysValues(keys, values) {
    if (!Array.isArray(keys) || !Array.isArray(values)) return {};

    const obj = {};
    const length = Math.min(keys.length, values.length);

    for (let i = 0; i < length; i++) {
      obj[keys[i]] = values[i];
    }

    return obj;
  }

  /**
   * Creates an object from an array of key-value pairs
   * @param {Array} pairs - Array of [key, value] pairs
   * @returns {Object} Object with key-value mappings
   */
  static fromPairs(pairs) {
    if (!Array.isArray(pairs)) return {};

    const obj = {};

    for (const [key, value] of pairs) {
      if (Array.isArray(pair) && pair.length >= 2) {
        obj[Pair[0]] = Pair[1];
      }
    }

    return obj;
  }

  /**
   * Creates an array of key-value pairs from an object
   * @param {Object} obj - Object to convert to pairs
   * @returns {Array} Array of [key, value] pairs
   */
  static toPairs(obj) {
    if (!obj || typeof obj !== 'object') return [];

    return Object.entries(obj);
  }

  /**
   * Gets object values
   * @param {Object} obj - Object to get values from
   * @returns {Array} Array of object values
   */
  static values(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.values(obj);
  }

  /**
   * Gets object keys
   * @param {Object} obj - Object to get keys from
   * @returns {Array} Array of object keys
   */
  static keys(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj);
  }

  /**
   * Gets object entries
   * @param {Object} obj - Object to get entries from
   * @returns {Array} Array of [key, value] pairs
   */
  static entries(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj);
  }

  /**
   * Creates a deep pick that follows nested paths defined in an array
   * @param {Object} obj - Object to pick from
   * @param {Array} paths - Array of paths to pick
   * @returns {Object} Object with picked properties
   */
  static deepPick(obj, paths) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(paths)) return {};

    const result = {};

    for (const path of paths) {
      if (typeof path === 'string') {
        const value = ObjectUtils.get(obj, path);
        if (value !== undefined) {
          ObjectUtils.set(result, path, value);
        }
      }
    }

    return result;
  }

  /**
   * Creates a deep omit that removes nested paths defined in an array
   * @param {Object} obj - Object to omit from
   * @param {Array} paths - Array of paths to omit
   * @returns {Object} Object with omitted properties
   */
  static deepOmit(obj, paths) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(paths)) return obj;

    const result = ObjectUtils.deepClone(obj);

    for (const path of paths) {
      if (typeof path === 'string') {
        ObjectUtils.unset(result, path);
      }
    }

    return result;
  }

  /**
   * Maps an object's values recursively
   * @param {Object} obj - Object to map recursively
   * @param {Function} mapper - Function to transform values
   * @returns {Object} Object with transformed values
   */
  static deepMapValues(obj, mapper) {
    if (!obj || typeof obj !== 'object') return obj;
    if (typeof mapper !== 'function') return obj;

    const result = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
          result[key] = ObjectUtils.deepMapValues(obj[key], mapper);
        } else {
          result[key] = mapper(obj[key], key, obj);
        }
      }
    }

    return result;
  }

  /**
   * Filters an object recursively
   * @param {Object} obj - Object to filter recursively
   * @param {Function} predicate - Function to test values
   * @returns {Object} Object with filtered values
   */
  static deepFilter(obj, predicate) {
    if (!obj || typeof obj !== 'object') return obj;
    if (typeof predicate !== 'function') return obj;

    const result = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const filtered = ObjectUtils.deepFilter(value, predicate);
        if (Object.keys(filtered).length > 0) {
          result[key] = filtered;
        }
      } else if (predicate(value, key, obj)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Finds a property in a deeply nested object using a predicate
   * @param {Object} obj - Object to search in
   * @param {Function} predicate - Function to test values
   * @returns {*} Found value or undefined
   */
  static deepFind(obj, predicate) {
    if (!obj || typeof obj !== 'object') return undefined;
    if (typeof predicate !== 'function') return undefined;

    // Test current object
    if (predicate(obj)) return obj;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        const found = ObjectUtils.deepFind(value, predicate);
        if (found !== undefined) return found;
      } else if (predicate(value, key, obj)) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Creates an object with the same keys as the provided object but with values transformed by the provided function
   * @param {Object} obj - Source object
   * @param {Function} transform - Function to transform values
   * @returns {Object} New object with transformed values
   */
  static mapObject(obj, transform) {
    if (!obj || typeof obj !== 'object' || typeof transform !== 'function') return obj;

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = transform(value, key, obj);
    }

    return result;
  }

  /**
   * Creates an object with only the properties that satisfy a predicate
   * @param {Object} obj - Source object
   * @param {Function} predicate - Function to test properties
   * @returns {Object} New object with filtered properties
   */
  static pickBy(obj, predicate) {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value, key, obj)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Creates an object with all properties that don't satisfy a predicate
   * @param {Object} obj - Source object
   * @param {Function} predicate - Function to test properties
   * @returns {Object} New object with omitted properties
   */
  static omitBy(obj, predicate) {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') return obj;

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (!predicate(value, key, obj)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Inverts an object by swapping keys and values
   * @param {Object} obj - Object to invert
   * @returns {Object} Inverted object
   */
  static invert(obj) {
    if (!obj || typeof obj !== 'object') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[value] = key;
    }

    return result;
  }

  /**
   * Creates a new object with the same keys but values as the result of running each value through a function
   * @param {Object} obj - Object to transform values for
   * @param {Function} iteratee - Function to transform values
   * @returns {Object} New object with transformed values
   */
  static mapValues(obj, iteratee) {
    if (!obj || typeof obj !== 'object' || typeof iteratee !== 'function') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = iteratee(value, key, obj);
    }

    return result;
  }

  /**
   * Creates a new object with the same values but keys transformed by the provided function
   * @param {Object} obj - Object to transform keys for
   * @param {Function} iteratee - Function to transform keys
   * @returns {Object} New object with transformed keys
   */
  static mapKeys(obj, iteratee) {
    if (!obj || typeof obj !== 'object' || typeof iteratee !== 'function') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[iteratee(value, key, obj)] = value;
    }

    return result;
  }

  /**
   * Creates an object composed of the object properties predicate returns truthy for
   * @param {Object} obj - Object to filter
   * @param {Function} predicate - Function to test properties
   * @returns {Object} New object with filtered properties
   */
  static pickByPredicate(obj, predicate) {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value, key)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Creates an object composed of the object properties predicate returns falsy for
   * @param {Object} obj - Object to omit from
   * @param {Function} predicate - Function to test properties
   * @returns {Object} New object with omitted properties
   */
  static omitByPredicate(obj, predicate) {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') return obj;

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (!predicate(value, key)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Creates an object with values transformed according to a mapping
   * @param {Object} obj - Source object
   * @param {Object} mapping - Object mapping old values to new values
   * @returns {Object} New object with mapped values
   */
  static mapValuesWithMapping(obj, mapping) {
    if (!obj || typeof obj !== 'object' || !mapping || typeof mapping !== 'object') return obj;

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = mapping[value] !== undefined ? mapping[value] : value;
    }

    return result;
  }

  /**
   * Creates a property getter function for accessing nested properties
   * @param {string} path - Property path to get
   * @returns {Function} Getter function
   */
  static property(path) {
    if (typeof path !== 'string') return () => undefined;

    return (obj) => ObjectUtils.get(obj, path);
  }

  /**
   * Creates a property checker function for checking if nested property exists
   * @param {string} path - Property path to check
   * @returns {Function} Checker function
   */
  static hasProperty(path) {
    if (typeof path !== 'string') return () => false;

    return (obj) => ObjectUtils.has(obj, path);
  }

  /**
   * Creates a deep path setter function
   * @param {string} path - Property path to set
   * @param {*} value - Value to set
   * @returns {Function} Setter function
   */
  static propertySetter(path, value) {
    if (typeof path !== 'string') return (obj) => obj;

    return (obj) => {
      ObjectUtils.set(obj, path, value);
      return obj;
    };
  }

  /**
   * Creates a deep path remover function
   * @param {string} path - Property path to remove
   * @returns {Function} Remover function
   */
  static propertyRemover(path) {
    if (typeof path !== 'string') return (obj) => obj;

    return (obj) => {
      ObjectUtils.unset(obj, path);
      return obj;
    };
  }

  /**
   * Extends an object with properties from other objects
   * @param {Object} target - Target object to extend
   * @param {...Object} sources - Source objects to extend from
   * @returns {Object} Extended target object
   */
  static extend(target, ...sources) {
    if (!target || typeof target !== 'object') return target;

    for (const source of sources) {
      if (source && typeof source === 'object') {
        Object.assign(target, source);
      }
    }

    return target;
  }

  /**
   * Extends an object with properties from other objects deeply
   * @param {Object} target - Target object to extend
   * @param {...Object} sources - Source objects to extend from
   * @returns {Object} Extended target object
   */
  static deepExtend(target, ...sources) {
    for (const source of sources) {
      if (source && typeof source === 'object') {
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              // If target doesn't have the nested object, create it
              if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
              }
              
              // Recursively extend nested object
              ObjectUtils.deepExtend(target[key], source[key]);
            } else {
              // Copy primitive value or array
              target[key] = source[key];
            }
          }
        }
      }
    }

    return target;
  }

  /**
   * Creates an immutable copy of an object
   * @param {Object} obj - Object to make immutable
   * @returns {Object} Immutable copy of the object
   */
  static immutable(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Create a shallow copy and freeze it
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    
    // Prevent modifications
    return Object.freeze(copy);
  }

  /**
   * Creates a function that always returns the same value
   * @param {*} value - Value to return
   * @returns {Function} Constant function
   */
  static constant(value) {
    return () => value;
  }

  /**
   * Creates a function that returns the identity of the first argument
   * @param {*} value - Value to return
   * @returns {*} The first argument
   */
  static identity(value) {
    return value;
  }

  /**
   * Creates a function that returns whether the given value equals the target value
   * @param {*} target - Target value to compare with
   * @returns {Function} Equality function
   */
  static isEqualTo(target) {
    return (value) => value === target;
  }

  /**
   * Creates an object with properties having the given values
   * @param {Array} keys - Array of keys
   * @param {Array} values - Array of values
   * @returns {Object} Object with keys mapped to values
   */
  static zipObject(keys, values) {
    if (!Array.isArray(keys) || !Array.isArray(values)) return {};

    const result = {};
    const length = Math.min(keys.length, values.length);

    for (let i = 0; i < length; i++) {
      result[keys[i]] = values[i];
    }

    return result;
  }

  /**
   * Creates an array of grouped elements, the first of which contains the first elements of the given arrays
   * @param {...Array} arrays - Arrays to process
   * @returns {Array} Array of grouped elements
   */
  static zip(...arrays) {
    if (arrays.length === 0) return [];
    
    const minLength = Math.min(...arrays.map(arr => arr.length));
    const result = Array(minLength).fill().map((_, i) => 
      arrays.map(arr => arr[i])
    );
    
    return result;
  }

  /**
   * Creates an object with the same keys as the original but with values transformed through the function
   * @param {Object} obj - Source object
   * @param {Function} func - Transformation function
   * @returns {Object} New object with transformed values
   */
  static transformValues(obj, func) {
    if (!obj || typeof obj !== 'object' || typeof func !== 'function') return obj;

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = func(value, key, obj);
    }

    return result;
  }

  /**
   * Creates a function that memoizes the result of a function
   * @param {Function} func - Function to memoize
   * @param {Function} resolver - Function to resolve cache key (optional)
   * @returns {Function} Memoized function
   */
  static memoize(func, resolver) {
    if (typeof func !== 'function') {
      throw new TypeError('Expected a function');
    }

    const memoized = function(...args) {
      const key = resolver ? resolver.apply(this, args) : args[0];
      const cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    };
    
    memoized.cache = new Map();
    return memoized;
  }

  /**
   * Creates an object with values as the result of running each element in collection thru iteratee
   * @param {Object|Array} collection - Collection to iterate over
   * @param {Function} iteratee - Function to transform values
   * @returns {Object} New object with transformed values
   */
  static map(collection, iteratee) {
    if (!collection) return {};
    if (typeof iteratee !== 'function') return collection;

    const result = {};

    if (Array.isArray(collection)) {
      collection.forEach((value, index) => {
        result[index] = iteratee(value, index, collection);
      });
    } else if (typeof collection === 'object') {
      for (const [key, value] of Object.entries(collection)) {
        result[key] = iteratee(value, key, collection);
      }
    }

    return result;
  }

  /**
   * Creates an object composed of keys generated from the results of running each element of collection thru iteratee
   * @param {Object|Array} collection - Collection to iterate over
   * @param {Function} iteratee - Function to generate keys
   * @returns {Object} Composed object
   */
  static groupBy(collection, iteratee) {
    if (!collection) return {};
    if (typeof iteratee !== 'function') return {};

    const result = {};

    if (Array.isArray(collection)) {
      collection.forEach((value, index) => {
        const key = iteratee(value, index, collection);
        if (!result[key]) result[key] = [];
        result[key].push(value);
      });
    } else if (typeof collection === 'object') {
      for (const [key, value] of Object.entries(collection)) {
        const newKey = iteratee(value, key, collection);
        if (!result[newKey]) result[newKey] = [];
        result[newKey].push(value);
      }
    }

    return result;
  }

  /**
   * Creates an object with the same keys as the original but values toggled
   * @param {Object} obj - Object with boolean values to toggle
   * @returns {Object} New object with toggled boolean values
   */
  static toggleValues(obj) {
    if (!obj || typeof obj !== 'object') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'boolean' ? !value : value;
    }

    return result;
  }

  /**
   * Creates an object with only truthy values
   * @param {Object} obj - Object to compact
   * @returns {Object} New object with truthy values only
   */
  static compact(obj) {
    if (!obj || typeof obj !== 'object') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Creates an object with only falsy values
   * @param {Object} obj - Object to compact
   * @returns {Object} New object with falsy values only
   */
  static compactFalsy(obj) {
    if (!obj || typeof obj !== 'object') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (!value) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Creates a function that invokes the method at a given path of object
   * @param {string|Array} path - Path of the method to invoke
   * @returns {Function} Invoker function
   */
  static method(path) {
    const pathArray = Array.isArray(path) ? path : path.split('.');
    
    return (object, ...args) => {
      const func = ObjectUtils.get(object, pathArray);
      return typeof func === 'function' ? func.apply(object, args) : undefined;
    };
  }

  /**
   * Creates a function that gets the argument at index n
   * @param {number} n - Index of the argument to return
   * @returns {Function} Argument getter function
   */
  static nthArg(n = 0) {
    return (...args) => args[n];
  }

  /**
   * Creates an object with keys from the original object and values as a transformation result
   * @param {Object} obj - Source object
   * @param {Function} transformer - Function that returns [key, value] tuple
   * @returns {Object} New transformed object
   */
  static mapObjectWithTransformer(obj, transformer) {
    if (!obj || typeof obj !== 'object' || typeof transformer !== 'function') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      const [newKey, newValue] = transformer(value, key, obj);
      result[newKey] = newValue;
    }

    return result;
  }

  /**
   * Creates a deep clone of an object with only the specified paths
   * @param {Object} obj - Object to clone selectively
   * @param {Array} paths - Array of paths to include in the clone
   * @returns {Object} Deep clone with only specified paths
   */
  static deepPickPaths(obj, paths) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(paths)) return {};

    const result = {};

    for (const path of paths) {
      if (typeof path === 'string') {
        const value = ObjectUtils.get(obj, path);
        if (value !== undefined) {
          ObjectUtils.set(result, path, ObjectUtils.deepClone(value));
        }
      }
    }

    return result;
  }

  /**
   * Creates a new object with values as the result of running each element in collection through iteratee
   * and including only those elements that pass the predicate.
   * @param {Object} obj - Source object
   * @param {Function} predicate - Function to test values
   * @returns {Object} New object with filtered values
   */
  static filterObject(obj, predicate) {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') return {};

    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value, key, obj)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Adds dynamic styles for object utilities
   */
  static addDynamicStyles() {
    if (document.getElementById('object-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'object-utilities-styles';
    style.textContent = `
      /* Object utility related styles */
      .object-inspector {
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        padding: 15px;
        font-family: monospace;
        font-size: 0.9rem;
        overflow: auto;
      }
      
      .object-inspector-key {
        color: var(--jazer-cyan, #00f2ea);
        margin-right: 5px;
      }
      
      .object-inspector-string {
        color: #f0008c;
      }
      
      .object-inspector-number {
        color: #00ff88;
      }
      
      .object-inspector-boolean {
        color: #4facfe;
      }
      
      .object-inspector-null {
        color: #ffcc00;
      }
      
      .object-inspector-undefined {
        color: #aaa;
      }
      
      .object-inspector-nested {
        margin-left: 20px;
        border-left: 1px solid var(--border-lighter, #222);
        padding-left: 10px;
      }
      
      .object-editor {
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        padding: 10px;
      }
      
      .object-editor input,
      .object-editor textarea,
      .object-editor select {
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
        border: 1px solid var(--border-lighter, #222);
        padding: 5px;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      
      .object-editor button {
        background: var(--jazer-cyan, #00f2ea);
        color: var(--text-dark, #000);
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 5px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Inspects an object and creates a visual representation
   * @param {Object} obj - Object to inspect
   * @param {boolean} compact - Whether to create a compact representation
   * @returns {HTMLElement} Element representing the object
   */
  static inspect(obj, compact = false) {
    const container = document.createElement('div');
    container.className = 'object-inspector';
    
    const renderValue = (value, depth = 0) => {
      if (value === null) {
        const span = document.createElement('span');
        span.className = 'object-inspector-null';
        span.textContent = 'null';
        return span;
      }
      
      if (value === undefined) {
        const span = document.createElement('span');
        span.className = 'object-inspector-undefined';
        span.textContent = 'undefined';
        return span;
      }
      
      if (typeof value === 'string') {
        const span = document.createElement('span');
        span.className = 'object-inspector-string';
        span.textContent = `"${value}"`;
        return span;
      }
      
      if (typeof value === 'number') {
        const span = document.createElement('span');
        span.className = 'object-inspector-number';
        span.textContent = value;
        return span;
      }
      
      if (typeof value === 'boolean') {
        const span = document.createElement('span');
        span.className = 'object-inspector-boolean';
        span.textContent = value.toString();
        return span;
      }
      
      if (typeof value === 'function') {
        const span = document.createElement('span');
        span.className = 'object-inspector-function';
        span.textContent = `[Function: ${value.name || 'anonymous'}]`;
        return span;
      }
      
      if (Array.isArray(value)) {
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'object-inspector-array';
        
        if (compact && value.length > 5) {
          arrayContainer.textContent = `[Array: ${value.length} items]`;
          return arrayContainer;
        }
        
        arrayContainer.textContent = '[';
        
        value.forEach((item, index) => {
          if (index > 0) arrayContainer.appendChild(document.createTextNode(', '));
          arrayContainer.appendChild(renderValue(item, depth + 1));
        });
        
        arrayContainer.appendChild(document.createTextNode(']'));
        return arrayContainer;
      }
      
      if (typeof value === 'object') {
        const objContainer = document.createElement('div');
        objContainer.className = 'object-inspector-object';
        
        if (compact && depth > 2) {
          objContainer.textContent = '{...}';
          return objContainer;
        }
        
        objContainer.textContent = '{';
        
        const entries = Object.entries(value);
        entries.forEach(([key, val], index) => {
          if (index > 0) objContainer.appendChild(document.createTextNode(', '));
          
          const keySpan = document.createElement('span');
          keySpan.className = 'object-inspector-key';
          keySpan.textContent = `"${key}": `;
          
          objContainer.appendChild(keySpan);
          objContainer.appendChild(renderValue(val, depth + 1));
        });
        
        objContainer.appendChild(document.createTextNode('}'));
        return objContainer;
      }
      
      return document.createTextNode(String(value));
    };
    
    container.appendChild(renderValue(obj));
    
    return container;
  }

  /**
   * Creates an object editor UI
   * @param {Object} obj - Object to edit
   * @param {Function} onSave - Function to call when saving changes
   * @returns {HTMLElement} Object editor UI
   */
  static createEditor(obj, onSave) {
    const container = document.createElement('div');
    container.className = 'object-editor';
    
    const form = document.createElement('form');
    
    const createInput = (key, value, path = '') => {
      const fieldContainer = document.createElement('div');
      fieldContainer.style.marginBottom = '10px';
      
      const label = document.createElement('label');
      label.textContent = key;
      label.style.display = 'block';
      label.style.marginBottom = '5px';
      label.style.color = 'var(--text-light, #fff)';
      fieldContainer.appendChild(label);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.name = path ? `${path}.${key}` : key;
      input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
      input.style.width = '100%';
      
      fieldContainer.appendChild(input);
      return fieldContainer;
    };
    
    // Create fields for each property
    for (const [key, value] of Object.entries(obj)) {
      form.appendChild(createInput(key, value));
    }
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Collect form data and update object
      const formData = new FormData(form);
      const updatedObj = {};
      
      for (const [key, value] of formData.entries()) {
        // Try to parse as JSON if it looks like an object/array
        try {
          updatedObj[key] = JSON.parse(value);
        } catch {
          updatedObj[key] = value;
        }
      }
      
      if (onSave) onSave(updatedObj);
    });
    
    form.appendChild(saveButton);
    container.appendChild(form);
    
    return container;
  }

  /**
   * Creates a deep path validator
   * @param {Object} obj - Object to validate
   * @param {Array} paths - Array of paths to validate
   * @returns {Object} Validation result
   */
  static validatePaths(obj, paths) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(paths)) {
      return { valid: false, errors: ['Invalid input'] };
    }

    const result = {
      valid: true,
      errors: []
    };

    for (const path of paths) {
      if (typeof path !== 'string') continue;

      if (!ObjectUtils.has(obj, path)) {
        result.valid = false;
        result.errors.push(`Path "${path}" does not exist`);
      }
    }

    return result;
  }

  /**
   * Destroys the cache manager instance and cleans up resources
   */
  destroy() {
    // Clean up any running timers, listeners, or other resources
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = null;
    }
    
    // Clear all internal data structures
    this.shortcuts.clear();
    this.globalShortcuts.clear();
    this.activeTrap = null;
    this.pausedTrap = null;
  }
}

/**
 * Creates a new object utilities instance
 * @param {Object} options - Configuration options
 * @returns {ObjectUtils} New instance
 */
function createObjectUtils(options = {}) {
  return new ObjectUtils(options);
}

// Create default instance
const objectUtils = new ObjectUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ObjectUtils,
    createObjectUtils,
    objectUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ObjectUtils = ObjectUtils;
  window.createObjectUtils = createObjectUtils;
  window.objectUtils = objectUtils;
}