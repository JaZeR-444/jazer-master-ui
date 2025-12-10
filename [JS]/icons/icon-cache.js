// Icon caching system for improved performance

class IconCache {
  constructor(options = {}) {
    this.options = {
      maxSize: options.maxSize || 100,
      expirationTime: options.expirationTime || 300000, // 5 minutes in ms
      enableCompression: options.enableCompression || false
    };
    
    this.cache = new Map();
    this.accessLog = new Map(); // Track access times
    this.size = 0;
  }

  // Add an icon to the cache
  set(key, value) {
    // Check if key already exists
    if (this.cache.has(key)) {
      // Update the value and access time
      this.cache.set(key, value);
      this.accessLog.set(key, Date.now());
      return;
    }

    // Check if cache is at max size
    if (this.size >= this.options.maxSize) {
      this.evictOldest();
    }

    // Add the new entry
    this.cache.set(key, value);
    this.accessLog.set(key, Date.now());
    this.size++;

    // Apply compression if enabled
    if (this.options.enableCompression) {
      this.compress(key);
    }
  }

  // Get an icon from the cache
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    // Check if the entry has expired
    const accessTime = this.accessLog.get(key);
    if (Date.now() - accessTime > this.options.expirationTime) {
      this.delete(key);
      return null;
    }

    // Update access time
    this.accessLog.set(key, Date.now());
    return this.cache.get(key);
  }

  // Check if an icon exists in the cache
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    // Check if the entry has expired
    const accessTime = this.accessLog.get(key);
    if (Date.now() - accessTime > this.options.expirationTime) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // Remove an icon from the cache
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.accessLog.delete(key);
      this.size--;
      return true;
    }
    return false;
  }

  // Clear the entire cache
  clear() {
    this.cache.clear();
    this.accessLog.clear();
    this.size = 0;
  }

  // Get the number of cached items
  get size() {
    return this.size;
  }

  // Get the oldest accessed item to evict
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, accessTime] of this.accessLog) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Compress icon data if possible
  compress(key) {
    // In a real implementation, this would use compression algorithms
    // For now, we'll just store the data as-is
    const value = this.cache.get(key);
    if (typeof value === 'string') {
      this.cache.set(key, value); // Would be compressed in a real implementation
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.size,
      maxSize: this.options.maxSize,
      keys: Array.from(this.cache.keys()),
      utilization: (this.size / this.options.maxSize) * 100
    };
  }
}

// Advanced icon cache with multiple storage tiers
class MultiTierIconCache {
  constructor(options = {}) {
    this.options = {
      memoryCacheSize: options.memoryCacheSize || 50,
      sessionCache: options.sessionCache !== false,
      localCache: options.localCache !== false,
      expirationTime: options.expirationTime || 300000 // 5 minutes
    };

    // Create memory cache
    this.memoryCache = new IconCache({
      maxSize: this.options.memoryCacheSize,
      expirationTime: this.options.expirationTime
    });

    // Initialize session storage cache if enabled
    if (this.options.sessionCache && typeof sessionStorage !== 'undefined') {
      this.sessionCache = new Map();
    }

    // Initialize local storage cache if enabled
    if (this.options.localCache && typeof localStorage !== 'undefined') {
      this.localCache = new Map();
      
      // Load existing cache from localStorage
      try {
        const stored = localStorage.getItem('iconCache');
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.entries(parsed).forEach(([key, value]) => {
            // Check expiration
            if (Date.now() - value.timestamp < this.options.expirationTime) {
              this.localCache.set(key, value);
            }
          });
        }
      } catch (e) {
        console.warn('Could not load icon cache from localStorage:', e);
      }
    }
  }

  // Get an icon, checking all cache tiers
  get(key) {
    // Check memory cache first
    let value = this.memoryCache.get(key);
    if (value) {
      return value;
    }

    // Check session cache
    if (this.sessionCache) {
      const sessionKey = `icon_${key}`;
      const sessionValue = sessionStorage.getItem(sessionKey);
      if (sessionValue) {
        try {
          const parsed = JSON.parse(sessionValue);
          if (Date.now() - parsed.timestamp < this.options.expirationTime) {
            // Put it back in memory cache for faster access next time
            this.memoryCache.set(key, parsed.value);
            return parsed.value;
          } else {
            // Remove expired item
            sessionStorage.removeItem(sessionKey);
          }
        } catch (e) {
          console.warn(`Error parsing session cached icon ${key}:`, e);
        }
      }
    }

    // Check local cache
    if (this.localCache) {
      const localValue = this.localCache.get(key);
      if (localValue && Date.now() - localValue.timestamp < this.options.expirationTime) {
        // Put it back in memory cache for faster access next time
        this.memoryCache.set(key, localValue.value);
        return localValue.value;
      } else if (localValue) {
        // Remove expired item
        this.localCache.delete(key);
        this.saveLocalCache();
      }
    }

    return null;
  }

  // Set an icon in all applicable cache tiers
  set(key, value) {
    // Set in memory cache
    this.memoryCache.set(key, value);

    // Set in session cache
    if (this.sessionCache) {
      const sessionKey = `icon_${key}`;
      sessionStorage.setItem(sessionKey, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    }

    // Set in local cache
    if (this.localCache) {
      this.localCache.set(key, {
        value,
        timestamp: Date.now()
      });
      this.saveLocalCache();
    }
  }

  // Save local cache to localStorage
  saveLocalCache() {
    if (this.localCache && typeof localStorage !== 'undefined') {
      try {
        const obj = {};
        for (const [key, value] of this.localCache) {
          obj[key] = value;
        }
        localStorage.setItem('iconCache', JSON.stringify(obj));
      } catch (e) {
        console.warn('Could not save icon cache to localStorage:', e);
      }
    }
  }

  // Clear all cache tiers
  clear() {
    this.memoryCache.clear();
    
    if (this.sessionCache) {
      // Remove all icon entries from sessionStorage
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith('icon_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
    
    if (this.localCache) {
      this.localCache.clear();
      localStorage.removeItem('iconCache');
    }
  }

  // Get cache statistics
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      session: this.sessionCache ? sessionStorage.length : 0,
      local: this.localCache ? this.localCache.size : 0
    };
  }
}

// Export the classes
export { IconCache, MultiTierIconCache };