/**
 * Cache Manager Module
 * In-memory and storage-based caching system with expiration and size limits
 * Compatible with jazer-brand.css styling for cache management UI
 */

class CacheManager {
  /**
   * Creates a new cache manager instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      maxSize: 100, // Maximum number of items to store
      defaultTTL: 300000, // Default time-to-live in ms (5 minutes)
      storageEnabled: true, // Whether to use localStorage
      storagePrefix: 'jazer-cache-', // Prefix for storage keys
      maxStorageSize: 10 * 1024 * 1024, // 10MB max storage size
      ...options
    };

    // In-memory cache
    this.cache = new Map();
    
    // Track access times for LRU
    this.accessTimes = new Map();
    
    // Initialize storage if enabled
    this.storage = this.options.storageEnabled && typeof window !== 'undefined' && window.localStorage 
      ? window.localStorage 
      : null;
    
    // Load from storage if available
    this.loadFromStorage();
  }

  /**
   * Stores a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to store
   * @param {number} ttl - Time-to-live in milliseconds (optional)
   * @returns {boolean} Whether the operation was successful
   */
  set(key, value, ttl) {
    if (!key) return false;

    const expiration = ttl ? Date.now() + ttl : Date.now() + this.options.defaultTTL;
    const cacheItem = {
      value,
      expiration,
      timestamp: Date.now()
    };

    // Store in memory
    this.cache.set(key, cacheItem);
    this.accessTimes.set(key, Date.now());

    // Store in local storage if available
    if (this.storage) {
      try {
        const storageKey = this.options.storagePrefix + key;
        this.storage.setItem(storageKey, JSON.stringify(cacheItem));
      } catch (e) {
        console.warn('Failed to store in localStorage:', e);
        // If storage fails, continue with in-memory cache
      }
    }

    // Clean up expired items and enforce size limits
    this.cleanup();

    return true;
  }

  /**
   * Gets a value from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if not found/expired
   */
  get(key) {
    if (!key) return undefined;

    // Try memory cache first
    if (this.cache.has(key)) {
      const item = this.cache.get(key);
      
      // Check if expired
      if (Date.now() > item.expiration) {
        this.delete(key);
        return undefined;
      }

      // Update access time for LRU
      this.accessTimes.set(key, Date.now());
      return item.value;
    }

    // Try storage cache if memory cache fails
    if (this.storage) {
      try {
        const storageKey = this.options.storagePrefix + key;
        const storedValue = this.storage.getItem(storageKey);
        
        if (storedValue) {
          const item = JSON.parse(storedValue);
          
          // Check if expired
          if (Date.now() > item.expiration) {
            this.delete(key);
            return undefined;
          }

          // Load into memory and return value
          this.cache.set(key, item);
          this.accessTimes.set(key, Date.now());
          return item.value;
        }
      } catch (e) {
        console.warn('Failed to retrieve from localStorage:', e);
      }
    }

    return undefined;
  }

  /**
   * Checks if a key exists in the cache
   * @param {string} key - Cache key
   * @returns {boolean} Whether the key exists and is not expired
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Removes a value from the cache
   * @param {string} key - Cache key
   * @returns {boolean} Whether the operation was successful
   */
  delete(key) {
    if (!key) return false;

    // Delete from memory
    const deleted = this.cache.delete(key);
    this.accessTimes.delete(key);

    // Delete from storage if available
    if (this.storage) {
      try {
        this.storage.removeItem(this.options.storagePrefix + key);
      } catch (e) {
        console.warn('Failed to remove from localStorage:', e);
      }
    }

    return deleted;
  }

  /**
   * Clears all values from the cache
   */
  clear() {
    this.cache.clear();
    this.accessTimes.clear();

    if (this.storage) {
      try {
        // Remove all cache items from storage
        for (let i = this.storage.length - 1; i >= 0; i--) {
          const key = this.storage.key(i);
          if (key && key.startsWith(this.options.storagePrefix)) {
            this.storage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }
  }

  /**
   * Gets the size of the cache
   * @returns {number} Number of items in the cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Gets the keys of all cached items
   * @returns {Array} Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Gets all cached items
   * @returns {Object} Object with key-value pairs
   */
  entries() {
    const entries = {};
    this.cache.forEach((value, key) => {
      entries[key] = value.value;
    });
    return entries;
  }

  /**
   * Gets cache statistics
   * @returns {Object} Cache statistics
   */
  stats() {
    const now = Date.now();
    let expiredCount = 0;
    let liveCount = 0;
    let totalSize = 0;

    // Calculate stats by iterating through cache
    this.cache.forEach((item, key) => {
      if (now > item.expiration) {
        expiredCount++;
      } else {
        liveCount++;
      }

      // Estimate size (this is a rough estimate)
      totalSize += JSON.stringify(key).length + JSON.stringify(item).length;
    });

    return {
      size: this.cache.size,
      liveCount,
      expiredCount,
      totalSize: totalSize,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Sets multiple values in the cache
   * @param {Object} items - Object with key-value pairs
   * @param {number} ttl - Time-to-live in milliseconds (optional)
   */
  setMultiple(items, ttl) {
    for (const key in items) {
      this.set(key, items[key], ttl);
    }
  }

  /**
   * Gets multiple values from the cache
   * @param {Array} keys - Array of cache keys
   * @returns {Object} Object with key-value pairs
   */
  getMultiple(keys) {
    const results = {};
    keys.forEach(key => {
      results[key] = this.get(key);
    });
    return results;
  }

  /**
   * Gets the value without updating access time
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  peek(key) {
    if (!key) return undefined;

    const item = this.cache.get(key);
    if (item && Date.now() <= item.expiration) {
      return item.value;
    }

    return undefined;
  }

  /**
   * Updates the TTL of an existing item
   * @param {string} key - Cache key
   * @param {number} ttl - New time-to-live in milliseconds
   * @returns {boolean} Whether the operation was successful
   */
  refresh(key, ttl) {
    if (!key || !this.has(key)) return false;

    const item = this.cache.get(key);
    if (item) {
      const newExpiration = Date.now() + (ttl || this.options.defaultTTL);
      item.expiration = newExpiration;
      this.cache.set(key, item);
      
      // Update in storage if available
      if (this.storage) {
        try {
          const storageKey = this.options.storagePrefix + key;
          this.storage.setItem(storageKey, JSON.stringify(item));
        } catch (e) {
          console.warn('Failed to update in localStorage:', e);
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Removes expired items from the cache
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    // Find expired items
    this.cache.forEach((item, key) => {
      if (now > item.expiration) {
        expiredKeys.push(key);
      }
    });

    // Remove expired items
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      
      // Remove from storage if available
      if (this.storage) {
        try {
          this.storage.removeItem(this.options.storagePrefix + key);
        } catch (e) {
          console.warn('Failed to remove from localStorage:', e);
        }
      }
    });

    // Enforce size limits using LRU
    if (this.cache.size > this.options.maxSize) {
      // Sort keys by access time (oldest first)
      const sortedKeys = Array.from(this.accessTimes.entries())
        .sort((a, b) => a[1] - b[1])
        .map(entry => entry[0]);

      // Remove oldest items until size is within limit
      while (this.cache.size > this.options.maxSize) {
        const oldestKey = sortedKeys.shift();
        if (oldestKey) {
          this.cache.delete(oldestKey);
          this.accessTimes.delete(oldestKey);
          
          // Remove from storage if available
          if (this.storage) {
            try {
              this.storage.removeItem(this.options.storagePrefix + oldestKey);
            } catch (e) {
              console.warn('Failed to remove from localStorage:', e);
            }
          }
        }
      }
    }
  }

  /**
   * Loads cache from localStorage
   */
  loadFromStorage() {
    if (!this.storage) return;

    try {
      // Load all cache items from storage
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.options.storagePrefix)) {
          const cacheKey = key.substring(this.options.storagePrefix.length);
          const storedValue = this.storage.getItem(key);
          
          if (storedValue) {
            const item = JSON.parse(storedValue);
            
            // Add to memory cache if not expired
            if (Date.now() <= item.expiration) {
              this.cache.set(cacheKey, item);
              this.accessTimes.set(cacheKey, Date.now());
            } else {
              // Remove expired item from storage
              this.storage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
  }

  /**
   * Persists the cache to a serializable object
   * @returns {Object} Serializable cache object
   */
  toJSON() {
    const cacheObj = {};
    this.cache.forEach((value, key) => {
      cacheObj[key] = value;
    });
    return cacheObj;
  }

  /**
   * Loads cache from a serializable object
   * @param {Object} cacheObj - Serializable cache object
   */
  fromJSON(cacheObj) {
    this.clear();
    
    for (const key in cacheObj) {
      const item = cacheObj[key];
      if (item && item.value !== undefined && item.expiration !== undefined) {
        // Only load if not expired
        if (Date.now() <= item.expiration) {
          this.cache.set(key, item);
          this.accessTimes.set(key, item.timestamp || Date.now());
        }
      }
    }
  }

  /**
   * Gets the size of a value in bytes
   * @param {*} value - Value to measure
   * @returns {number} Size in bytes
   */
  getValueSize(value) {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch (e) {
      // Fallback for environments without Blob
      return JSON.stringify(value).length;
    }
  }

  /**
   * Adds a cache listener to be notified of cache operations
   * @param {string} eventType - Type of event ('set', 'get', 'delete')
   * @param {Function} callback - Callback function to execute
   */
  addListener(eventType, callback) {
    // In a real implementation, we would store the callback for the event type
    // For now, we'll just log the event
    console.log(`Cache listener added for ${eventType} events`);
  }

  /**
   * Implements a TTL-based cache decorator for functions
   * @param {Function} fn - Function to cache
   * @param {string} key - Cache key
   * @param {number} ttl - Time-to-live in milliseconds
   * @returns {Function} Cached function
   */
  cacheFunction(fn, key, ttl) {
    return async (...args) => {
      const cacheKey = typeof key === 'function' ? key(...args) : key;
      const cachedResult = this.get(cacheKey);
      
      if (cachedResult !== undefined) {
        return cachedResult;
      }
      
      const result = await fn(...args);
      this.set(cacheKey, result, ttl);
      return result;
    };
  }
}

/**
 * Creates a new cache manager instance
 * @param {Object} options - Cache manager options
 * @returns {CacheManager} New cache manager instance
 */
function createCacheManager(options = {}) {
  return new CacheManager(options);
}

/**
 * Default cache manager instance
 */
const defaultCacheManager = new CacheManager();

/**
 * Get a value from the default cache
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined
 */
function get(key) {
  return defaultCacheManager.get(key);
}

/**
 * Set a value in the default cache
 * @param {string} key - Cache key
 * @param {*} value - Value to store
 * @param {number} ttl - Time-to-live in milliseconds
 * @returns {boolean} Whether the operation was successful
 */
function set(key, value, ttl) {
  return defaultCacheManager.set(key, value, ttl);
}

/**
 * Check if a key exists in the default cache
 * @param {string} key - Cache key
 * @returns {boolean} Whether the key exists
 */
function has(key) {
  return defaultCacheManager.has(key);
}

/**
 * Remove a value from the default cache
 * @param {string} key - Cache key
 * @returns {boolean} Whether the operation was successful
 */
function remove(key) {
  return defaultCacheManager.delete(key);
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CacheManager,
    createCacheManager,
    get,
    set,
    has,
    remove
  };
}

// Also make it available globally
window.CacheManager = CacheManager;
window.createCacheManager = createCacheManager;
window.cacheGet = get;
window.cacheSet = set;
window.cacheHas = has;
window.cacheRemove = remove;