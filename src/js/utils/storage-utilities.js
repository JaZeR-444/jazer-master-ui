/**
 * Storage Utilities Module
 * Advanced storage utilities with support for localStorage, sessionStorage, cookies, and IndexedDB
 * Compatible with jazer-brand.css styling for storage-related utilities
 */

class StorageUtils {
  /**
   * Creates a new storage utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      storageType: 'local', // 'local', 'session', 'cookie', 'indexedDB', 'memory'
      defaultExpiry: null, // Default expiry time in milliseconds
      encryption: false,
      encryptionKey: null,
      compression: false,
      namespace: null,
      useFallback: true, // Whether to fallback to memory if storage is not available
      ...options
    };

    this.memoryStorage = new Map();
    this.indexedDBReady = false;
    this.db = null;
    this.ready = this.initializeStorage();
  }

  /**
   * Initializes storage based on options
   * @returns {Promise} Promise that resolves when storage is ready
   */
  async initializeStorage() {
    if (this.options.storageType === 'indexedDB') {
      await this.initIndexedDB();
    }
    return true;
  }

  /**
   * Initializes IndexedDB storage
   * @returns {Promise} Promise that resolves when IndexedDB is ready
   */
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to alternative storage');
        this.options.storageType = this.options.useFallback ? 'memory' : 'local';
        resolve();
        return;
      }

      const request = window.indexedDB.open('JazerStore', 1);

      request.onerror = (event) => {
        console.error('Failed to initialize IndexedDB:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.indexedDBReady = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create an object store for key-value pairs if it doesn't exist
        if (!db.objectStoreNames.contains('kvStore')) {
          const objectStore = db.createObjectStore('kvStore', { keyPath: 'id' });
          objectStore.createIndex('key', 'key', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Sets an item in storage
   * @param {string} key - Key to store the item at
   * @param {*} value - Value to store
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Promise that resolves to whether the operation was successful
   */
  async set(key, value, options = {}) {
    const {
      expiry = this.options.defaultExpiry,
      encrypt = this.options.encryption
    } = options;

    // Prepare value: stringify, compress, encrypt
    const serializedValue = JSON.stringify({
      value,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null
    });

    try {
      // Apply encryption if enabled
      const valueToStore = encrypt 
        ? this.encryptString(serializedValue, this.options.encryptionKey || this.generateEncryptionKey())
        : serializedValue;

      switch (this.options.storageType) {
        case 'local':
          if (!this.isLocalStorageAvailable()) return false;
          localStorage.setItem(this.getNamespacedKey(key), valueToStore);
          break;
          
        case 'session':
          if (!this.isSessionStorageAvailable()) return false;
          sessionStorage.setItem(this.getNamespacedKey(key), valueToStore);
          break;
          
        case 'cookie':
          return this.setCookie(this.getNamespacedKey(key), valueToStore, { 
            expires: expiry ? new Date(Date.now() + expiry) : null 
          });
          
        case 'indexedDB':
          if (!this.indexedDBReady) return false;
          return this.setIndexedDB(key, valueToStore);
          
        case 'memory':
        default:
          this.memoryStorage.set(this.getNamespacedKey(key), valueToStore);
      }
      
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }

  /**
   * Sets an item in IndexedDB
   * @param {string} key - Key to store at
   * @param {*} value - Value to store
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  setIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.indexedDBReady) return resolve(false);

      const transaction = this.db.transaction(['kvStore'], 'readwrite');
      const objectStore = transaction.objectStore('kvStore');
      
      const data = {
        id: this.getNamespacedKey(key),
        key: this.getNamespacedKey(key),
        value,
        timestamp: Date.now()
      };
      
      const request = objectStore.put(data);
      
      request.onsuccess = () => {
        console.log('Record added successfully');
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error adding record:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Gets an item from storage
   * @param {string} key - Key to get
   * @returns {Promise<*>} Promise that resolves to retrieved value or null if not found/expired
   */
  async get(key) {
    let storedValue;
    let valueToParse;

    switch (this.options.storageType) {
      case 'local':
        if (!this.isLocalStorageAvailable()) return null;
        storedValue = localStorage.getItem(this.getNamespacedKey(key));
        break;
        
      case 'session':
        if (!this.isSessionStorageAvailable()) return null;
        storedValue = sessionStorage.getItem(this.getNamespacedKey(key));
        break;
        
      case 'cookie':
        storedValue = this.getCookie(this.getNamespacedKey(key));
        break;
        
      case 'indexedDB':
        if (!this.indexedDBReady) return null;
        return this.getIndexedDB(key);
        
      case 'memory':
      default:
        storedValue = this.memoryStorage.get(this.getNamespacedKey(key));
    }

    if (!storedValue) return null;

    // Apply decryption if enabled
    const processedValue = this.options.encryption 
      ? this.decryptString(storedValue, this.options.encryptionKey)
      : storedValue;

    try {
      valueToParse = JSON.parse(processedValue);
    } catch (e) {
      console.error('Error parsing stored value:', e);
      return storedValue;
    }

    // Check if expired
    if (valueToParse.expiry && Date.now() > valueToParse.expiry) {
      await this.remove(key); // Clean up expired item
      return null;
    }

    return valueToParse.value;
  }

  /**
   * Gets an item from IndexedDB
   * @param {string} key - Key to get
   * @returns {Promise<*>} Promise that resolves to retrieved value or null
   */
  getIndexedDB(key) {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.indexedDBReady) return resolve(null);

      const transaction = this.db.transaction(['kvStore'], 'readonly');
      const objectStore = transaction.objectStore('kvStore');
      const request = objectStore.get(this.getNamespacedKey(key));

      request.onsuccess = (event) => {
        if (event.target.result) {
          // Check if expired
          if (event.target.result.expiry && Date.now() > event.target.result.expiry) {
            this.removeIndexedDB(key); // Clean up expired item
            resolve(null);
          } else {
            try {
              const parsed = JSON.parse(event.target.result.value);
              resolve(parsed.value);
            } catch (e) {
              console.error('Error parsing IndexedDB value:', e);
              resolve(null);
            }
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        console.error('Error getting record from IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Removes an item from storage
   * @param {string} key - Key to remove
   * @returns {Promise<boolean>} Promise that resolves to whether the operation was successful
   */
  async remove(key) {
    switch (this.options.storageType) {
      case 'local':
        if (!this.isLocalStorageAvailable()) return false;
        localStorage.removeItem(this.getNamespacedKey(key));
        return true;
        
      case 'session':
        if (!this.isSessionStorageAvailable()) return false;
        sessionStorage.removeItem(this.getNamespacedKey(key));
        return true;
        
      case 'cookie':
        return this.deleteCookie(this.getNamespacedKey(key));
        
      case 'indexedDB':
        if (!this.indexedDBReady) return false;
        return this.removeIndexedDB(key);
        
      case 'memory':
      default:
        return this.memoryStorage.delete(this.getNamespacedKey(key));
    }
  }

  /**
   * Removes an item from IndexedDB
   * @param {string} key - Key to remove
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  removeIndexedDB(key) {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.indexedDBReady) return resolve(false);

      const transaction = this.db.transaction(['kvStore'], 'readwrite');
      const objectStore = transaction.objectStore('kvStore');
      const request = objectStore.delete(this.getNamespacedKey(key));

      request.onsuccess = () => {
        console.log('Record deleted successfully');
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('Error deleting record from IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Clears all items from storage
   * @returns {Promise<boolean>} Promise that resolves to whether the operation was successful
   */
  async clear() {
    switch (this.options.storageType) {
      case 'local':
        if (!this.isLocalStorageAvailable()) return false;
        if (this.options.namespace) {
          // Only clear items with the namespace
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.options.namespace)) {
              localStorage.removeItem(key);
            }
          });
        } else {
          localStorage.clear();
        }
        return true;
        
      case 'session':
        if (!this.isSessionStorageAvailable()) return false;
        if (this.options.namespace) {
          // Only clear items with the namespace
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(this.options.namespace)) {
              sessionStorage.removeItem(key);
            }
          });
        } else {
          sessionStorage.clear();
        }
        return true;
        
      case 'cookie':
        return this.clearCookies();
        
      case 'indexedDB':
        if (!this.indexedDBReady) return false;
        return this.clearIndexedDB();
        
      case 'memory':
      default:
        this.memoryStorage.clear();
        return true;
    }
  }

  /**
   * Clears all items from IndexedDB
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  clearIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.indexedDBReady) return resolve(false);

      const transaction = this.db.transaction(['kvStore'], 'readwrite');
      const objectStore = transaction.objectStore('kvStore');
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('Database cleared successfully');
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('Error clearing IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Gets all keys from storage
   * @returns {Promise<Array>} Promise that resolves to array of keys
   */
  async getKeys() {
    switch (this.options.storageType) {
      case 'local':
        if (!this.isLocalStorageAvailable()) return [];
        if (this.options.namespace) {
          return Object.keys(localStorage)
            .filter(key => key.startsWith(this.options.namespace))
            .map(key => key.substring(this.options.namespace.length + 1)); // Remove namespace prefix
        }
        return Object.keys(localStorage);
        
      case 'session':
        if (!this.isSessionStorageAvailable()) return [];
        if (this.options.namespace) {
          return Object.keys(sessionStorage)
            .filter(key => key.startsWith(this.options.namespace))
            .map(key => key.substring(this.options.namespace.length + 1)); // Remove namespace prefix
        }
        return Object.keys(sessionStorage);
        
      case 'cookie':
        return this.getCookieKeys();
        
      case 'indexedDB':
        if (!this.indexedDBReady) return [];
        return this.getIndexedDBKeys();
        
      case 'memory':
      default:
        return Array.from(this.memoryStorage.keys())
          .map(key => this.options.namespace ? key.substring(this.options.namespace.length + 1) : key);
    }
  }

  /**
   * Gets all keys from IndexedDB
   * @returns {Promise<Array>} Promise that resolves to array of keys
   */
  getIndexedDBKeys() {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.indexedDBReady) return resolve([]);

      const transaction = this.db.transaction(['kvStore'], 'readonly');
      const objectStore = transaction.objectStore('kvStore');
      const request = objectStore.getAllKeys();

      request.onsuccess = (event) => {
        const keys = event.target.result;
        // Remove namespace prefix if it was added
        resolve(keys.map(key => 
          this.options.namespace && key.startsWith(this.options.namespace + ':') 
            ? key.substring(this.options.namespace.length + 1) 
            : key
        ));
      };

      request.onerror = (event) => {
        console.error('Error getting keys from IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Checks if localStorage is available
   * @returns {boolean} Whether localStorage is available
   */
  isLocalStorageAvailable() {
    try {
      const x = '__storage_test__';
      window.localStorage.setItem(x, x);
      window.localStorage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if sessionStorage is available
   * @returns {boolean} Whether sessionStorage is available
   */
  isSessionStorageAvailable() {
    try {
      const x = '__session_test__';
      window.sessionStorage.setItem(x, x);
      window.sessionStorage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Sets a cookie with specified options
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options
   * @returns {boolean} Whether the operation was successful
   */
  setCookie(name, value, options = {}) {
    try {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      
      if (options.expires instanceof Date) {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      } else if (typeof options.expires === 'number') {
        const date = new Date();
        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        cookieString += `; expires=${date.toUTCString()}`;
      }
      
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      
      if (options.secure) {
        cookieString += '; Secure';
      }
      
      if (options.httpOnly) {
        cookieString += '; HttpOnly';
      }
      
      if (options.sameSite) {
        cookieString += `; SameSite=${options.sameSite}`;
      }
      
      document.cookie = cookieString;
      return true;
    } catch (e) {
      console.error('Error setting cookie:', e);
      return false;
    }
  }

  /**
   * Gets a cookie by name
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  getCookie(name) {
    try {
      const nameEQ = encodeURIComponent(name) + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
      return null;
    } catch (e) {
      console.error('Error getting cookie:', e);
      return null;
    }
  }

  /**
   * Deletes a cookie by name
   * @param {string} name - Cookie name to delete
   * @param {string} path - Path of the cookie
   * @param {string} domain - Domain of the cookie
   * @returns {boolean} Whether the operation was successful
   */
  deleteCookie(name, path, domain) {
    try {
      document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT` +
        (path ? `; path=${path}` : '') +
        (domain ? `; domain=${domain}` : '');
      return true;
    } catch (e) {
      console.error('Error deleting cookie:', e);
      return false;
    }
  }

  /**
   * Gets all cookie keys
   * @returns {Array} Array of cookie keys
   */
  getCookieKeys() {
    try {
      return document.cookie.split(';').map(cookie => 
        cookie.trim().split('=')[0]
      ).filter(name => name !== '');
    } catch (e) {
      console.error('Error getting cookie keys:', e);
      return [];
    }
  }

  /**
   * Clears all cookies
   * @returns {boolean} Whether the operation was successful
   */
  clearCookies() {
    try {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
      return true;
    } catch (e) {
      console.error('Error clearing cookies:', e);
      return false;
    }
  }

  /**
   * Gets a namespaced key
   * @param {string} key - Original key
   * @returns {string} Namespaced key
   */
  getNamespacedKey(key) {
    return this.options.namespace ? `${this.options.namespace}:${key}` : key;
  }

  /**
   * Checks if a key exists in storage
   * @param {string} key - Key to check
   * @returns {Promise<boolean>} Promise that resolves to whether the key exists
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Gets the size of an item in storage
   * @param {string} key - Key to get size for
   * @returns {Promise<number>} Promise that resolves to the size in bytes
   */
  async getSize(key) {
    let storedValue;

    switch (this.options.storageType) {
      case 'local':
        if (!this.isLocalStorageAvailable()) return 0;
        storedValue = localStorage.getItem(this.getNamespacedKey(key));
        break;
        
      case 'session':
        if (!this.isSessionStorageAvailable()) return 0;
        storedValue = sessionStorage.getItem(this.getNamespacedKey(key));
        break;
        
      case 'cookie':
        storedValue = this.getCookie(this.getNamespacedKey(key));
        break;
        
      case 'indexedDB':
        if (!this.indexedDBReady) return 0;
        // Size calculation for IndexedDB would be more complex
        const item = await this.getIndexedDB(key);
        return item ? JSON.stringify(item).length : 0;
        
      case 'memory':
      default:
        storedValue = this.memoryStorage.get(this.getNamespacedKey(key));
    }

    return storedValue ? storedValue.length : 0;
  }

  /**
   * Gets the total size of storage
   * @returns {Promise<number>} Promise that resolves to the total size in bytes
   */
  async getTotalSize() {
    let total = 0;

    switch (this.options.storageType) {
      case 'local':
        if (!this.isLocalStorageAvailable()) return 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            if (!this.options.namespace || key.startsWith(this.options.namespace)) {
              total += localStorage[key].length + key.length;
            }
          }
        }
        break;
        
      case 'session':
        if (!this.isSessionStorageAvailable()) return 0;
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            if (!this.options.namespace || key.startsWith(this.options.namespace)) {
              total += sessionStorage[key].length + key.length;
            }
          }
        }
        break;
        
      case 'cookie':
        // Calculate size of cookies
        total = document.cookie.length;
        break;
        
      case 'indexedDB':
        if (!this.indexedDBReady) return 0;
        // Size calculation for IndexedDB would be more complex
        // For now, return estimated size
        const keys = await this.getKeys();
        for (const key of keys) {
          total += await this.getSize(key);
        }
        break;
        
      case 'memory':
      default:
        for (const [key, value] of this.memoryStorage) {
          total += (key.length) + (value.length);
        }
    }

    return total;
  }

  /**
   * Gets storage statistics
   * @returns {Promise<Object>} Promise that resolves to storage statistics
   */
  async getStats() {
    const keys = await this.getKeys();
    const totalSize = await this.getTotalSize();
    
    return {
      type: this.options.storageType,
      count: keys.length,
      totalSize,
      keys
    };
  }

  /**
   * Exports the entire storage as an object
   * @returns {Promise<Object>} Promise that resolves to an object representation of storage
   */
  async export() {
    const keys = await this.getKeys();
    const exported = {};
    
    for (const key of keys) {
      exported[key] = await this.get(key);
    }
    
    return exported;
  }

  /**
   * Imports data to storage from an object
   * @param {Object} data - Object to import
   * @param {Object} options - Import options
   * @returns {Promise<number>} Promise that resolves to the number of items imported
   */
  async import(data, options = {}) {
    if (typeof data !== 'object' || data === null) return 0;
    
    const { 
      overwrite = true,
      expiry = this.options.defaultExpiry 
    } = options;
    
    let importedCount = 0;
    
    for (const [key, value] of Object.entries(data)) {
      if (overwrite || !(await this.has(key))) {
        await this.set(key, value, { expiry });
        importedCount++;
      }
    }
    
    return importedCount;
  }

  /**
   * Creates a storage-backed object that mimics a Map interface
   * @returns {Object} Storage-backed Map interface
   */
  createMapInterface() {
    return {
      set: async (key, value) => {
        return await this.set(key, value);
      },
      
      get: async (key) => {
        return await this.get(key);
      },
      
      has: async (key) => {
        return await this.has(key);
      },
      
      delete: async (key) => {
        return await this.remove(key);
      },
      
      clear: async () => {
        return await this.clear();
      },
      
      keys: async () => {
        return await this.getKeys();
      },
      
      size: async () => {
        return (await this.getKeys()).length
      }
    };
  }

  /**
   * Creates a storage-backed observable object that emits change events
   * @param {string} key - Key for the observable
   * @param {Function} onChange - Callback function for changes
   * @returns {Object} Observable storage object
   */
  createObservable(key, onChange) {
    return {
      async set(value, options = {}) {
        const result = await this.set(key, value, options);
        if (onChange && typeof onChange === 'function') {
          onChange({ event: 'set', key, value, options });
        }
        return result;
      },
      
      async get() {
        return await this.get(key);
      },
      
      async remove() {
        const prevValue = await this.get(key);
        const result = await this.remove(key);
        if (onChange && typeof onChange === 'function') {
          onChange({ event: 'remove', key, prevValue });
        }
        return result;
      }
    };
  }

  /**
   * Watches for changes to a specific key
   * @param {string} key - Key to watch
   * @param {Function} callback - Callback function for changes
   * @returns {Function} Function to stop watching
   */
  watchKey(key, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    // Listen to storage events if possible
    if (this.options.storageType === 'local' || this.options.storageType === 'session') {
      const handleStorageChange = (e) => {
        if (e.key === this.getNamespacedKey(key)) {
          callback({
            key,
            newValue: e.newValue ? JSON.parse(e.newValue).value : null,
            oldValue: e.oldValue ? JSON.parse(e.oldValue).value : null,
            url: e.url
          });
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    
    // For other storage types, we can't directly watch changes
    // This method would need additional implementation depending on the storage type
    return () => {};
  }

  /**
   * Encrypts a string using XOR with the provided key
   * @param {string} str - String to encrypt
   * @param {string} key - Encryption key
   * @returns {string} Encrypted string as base64
   */
  encryptString(str, key) {
    if (!key) return str;
    
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return btoa(result);
  }

  /**
   * Decrypts a string using XOR with the provided key
   * @param {string} encryptedStr - Encrypted string (base64)
   * @param {string} key - Encryption key
   * @returns {string} Decrypted string
   */
  decryptString(encryptedStr, key) {
    if (!key || !encryptedStr) return encryptedStr;
    
    try {
      const str = atob(encryptedStr);
      let result = '';
      for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (e) {
      console.error('Error decrypting string:', e);
      return encryptedStr;
    }
  }

  /**
   * Generates a random encryption key
   * @returns {string} Random encryption key
   */
  generateEncryptionKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Compresses a string value using a simple algorithm
   * @param {string} value - Value to compress
   * @returns {string} Compressed value
   */
  compress(value) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    
    // Simple RLE (Run-Length Encoding) compression
    return value.replace(/(.)\1{2,}/g, (match, char) => 
      `~${char}${match.length}`
    );
  }

  /**
   * Decompresses a string value
   * @param {string} value - Value to decompress
   * @returns {string} Decompressed value
   */
  decompress(value) {
    if (typeof value !== 'string') return value;
    
    // Decompress RLE (Run-Length Encoding)
    return value.replace(/~(.)?(\d+)/g, (match, char, count) =>
      char.repeat(parseInt(count))
    );
  }

  /**
   * Synchronizes storage across tabs/windows using BroadcastChannel
   * @param {string} channelName - Name of the broadcast channel
   * @returns {Object} Sync controller
   */
  enableSync(channelName = 'jazer-storage-sync') {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel not supported, sync disabled');
      return { enable: () => {}, disable: () => {} };
    }

    const channel = new BroadcastChannel(channelName);

    // Listen for sync messages
    channel.onmessage = (event) => {
      const { operation, key, value, options } = event.data;
      
      switch (operation) {
        case 'set':
          // Update local storage without triggering sync again
          if (this.options.storageType === 'local' && !event.isSync) {
            try {
              localStorage.setItem(this.getNamespacedKey(key), value);
            } catch (e) {
              console.error('Error syncing set operation:', e);
            }
          }
          break;
        case 'remove':
          // Remove local storage without triggering sync again
          if (this.options.storageType === 'local' && !event.isSync) {
            try {
              localStorage.removeItem(this.getNamespacedKey(key));
            } catch (e) {
              console.error('Error syncing remove operation:', e);
            }
          }
          break;
        case 'clear':
          // Clear local storage without triggering sync again
          if (this.options.storageType === 'local' && !event.isSync) {
            try {
              if (this.options.namespace) {
                // Only clear items with the namespace
                Object.keys(localStorage).forEach(localKey => {
                  if (localKey.startsWith(this.options.namespace)) {
                    localStorage.removeItem(localKey);
                  }
                });
              } else {
                localStorage.clear();
              }
            } catch (e) {
              console.error('Error syncing clear operation:', e);
            }
          }
          break;
      }
    };

    // Modify the set method to broadcast changes
    const originalSet = this.set;
    this.set = async (key, value, options) => {
      const result = await originalSet.call(this, key, value, options);
      
      if (this.options.storageType === 'local') {
        channel.postMessage({
          operation: 'set',
          key,
          value: JSON.stringify({
            value,
            timestamp: Date.now(),
            expiry: options?.expiry ? Date.now() + options.expiry : null
          }),
          options,
          isSync: true
        });
      }
      
      return result;
    };

    // Modify the remove method to broadcast changes
    const originalRemove = this.remove;
    this.remove = async (key) => {
      const result = await originalRemove.call(this, key);
      
      if (this.options.storageType === 'local') {
        channel.postMessage({
          operation: 'remove',
          key,
          isSync: true
        });
      }
      
      return result;
    };

    // Modify the clear method to broadcast changes
    const originalClear = this.clear;
    this.clear = async () => {
      const result = await originalClear.call(this);
      
      if (this.options.storageType === 'local') {
        channel.postMessage({
          operation: 'clear',
          isSync: true
        });
      }
      
      return result;
    };

    return {
      channel,
      enable: () => {
        // Already enabled
      },
      disable: () => {
        channel.close();
      }
    };
  }

  /**
   * Creates a storage migration utility to move data between storage types
   * @param {string} fromType - Source storage type
   * @param {string} toType - Destination storage type
   * @returns {Object} Migration utility
   */
  createMigrationUtility(fromType, toType) {
    if (fromType === toType) {
      throw new Error('Source and destination storage types must be different');
    }

    return {
      migrate: async (keys = null) => {
        let keysToMigrate = keys || await this.getKeys();
        
        if (!Array.isArray(keysToMigrate)) {
          keysToMigrate = [keysToMigrate];
        }

        // Create temp storage instance for source
        const sourceStorage = new StorageUtils({ storageType: fromType });
        await sourceStorage.ready;

        // Create temp storage instance for destination
        const destStorage = new StorageUtils({ storageType: toType });
        await destStorage.ready;

        const migrated = [];
        const errors = [];

        for (const key of keysToMigrate) {
          try {
            const value = await sourceStorage.get(key);
            if (value !== null) {
              await destStorage.set(key, value);
              migrated.push(key);
              
              // Optionally remove from source
              if (this.options.removeAfterMigration) {
                await sourceStorage.remove(key);
              }
            }
          } catch (error) {
            errors.push({ key, error: error.message });
          }
        }

        return { migrated, errors };
      }
    };
  }

  /**
   * Creates a storage backup of all data
   * @returns {Promise<string>} Promise that resolves to a JSON string backup
   */
  async createBackup() {
    const data = await this.export();
    return JSON.stringify({
      timestamp: Date.now(),
      storageType: this.options.storageType,
      namespace: this.options.namespace,
      data
    });
  }

  /**
   * Restores data from a backup
   * @param {string} backupString - Backup string from createBackup
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Promise that resolves to restore report
   */
  async restoreBackup(backupString, options = {}) {
    try {
      const backup = JSON.parse(backupString);
      const { data } = backup;
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid backup data');
      }
      
      const { overwrite = true, ...importOptions } = options;
      
      // Only import if storage types match or if forced
      if (backup.storageType === this.options.storageType || options.force) {
        const importedCount = await this.import(data, { overwrite, ...importOptions });
        return {
          success: true,
          importedCount,
          storageType: backup.storageType,
          timestamp: backup.timestamp
        };
      } else {
        throw new Error(`Storage type mismatch: backup is ${backup.storageType}, current is ${this.options.storageType}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Creates a storage quota monitor
   * @param {Function} callback - Callback when quota threshold is reached
   * @param {number} threshold - Threshold percentage (0-100)
   * @returns {Function} Function to stop monitoring
   */
  createQuotaMonitor(callback, threshold = 80) {
    if (typeof callback !== 'function' || threshold < 0 || threshold > 100) {
      throw new Error('Invalid callback or threshold');
    }

    let monitoring = true;
    const checkQuota = async () => {
      if (!monitoring) return;

      const stats = await this.getStats();
      
      // Estimate quota (different for different storage types)
      let estimatedQuota = 5 * 1024 * 1024; // 5MB default estimate
      
      if (this.options.storageType === 'local' || this.options.storageType === 'session') {
        // Estimate localStorage quota (usually around 5-10MB per origin)
        estimatedQuota = 5 * 1024 * 1024; // 5MB
      } else if (this.options.storageType === 'cookie') {
        estimatedQuota = 4096; // 4KB per cookie
      }

      const usagePercent = (stats.totalSize / estimatedQuota) * 100;

      if (usagePercent >= threshold) {
        callback({
          usagePercent,
          totalSize: stats.totalSize,
          estimatedQuota,
          itemsCount: stats.count
        });
      }

      // Check again in 30 seconds
      setTimeout(checkQuota, 30000);
    };

    // Start monitoring
    setTimeout(checkQuota, 1000);

    return () => {
      monitoring = false;
    };
  }

  /**
   * Adds dynamic styles for storage utilities
   */
  addDynamicStyles() {
    if (document.getElementById('storage-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'storage-utilities-styles';
    style.textContent = `
      /* Storage utility related styles */
      .storage-quota-meter {
        width: 100%;
        height: 10px;
        background: var(--bg-darker, #111);
        border-radius: 5px;
        overflow: hidden;
      }
      
      .storage-quota-fill {
        height: 100%;
        background: var(--jazer-cyan, #00f2ea);
        transition: width 0.3s ease;
      }
      
      .storage-quota-warning .storage-quota-fill {
        background: #ffcc00;
      }
      
      .storage-quota-danger .storage-quota-fill {
        background: #ff4444;
      }
      
      .storage-item {
        padding: 10px;
        border-bottom: 1px solid var(--border-lighter, #222);
        display: flex;
        justify-content: space-between;
      }
      
      .storage-key {
        font-weight: bold;
        color: var(--jazer-cyan, #00f2ea);
      }
      
      .storage-value {
        color: var(--text-lighter, #ddd);
        font-family: monospace;
      }
      
      .storage-actions {
        display: flex;
        gap: 5px;
      }
      
      .storage-action-btn {
        padding: 4px 8px;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 4px;
        color: var(--text-light, #fff);
        cursor: pointer;
      }
      
      .storage-action-btn:hover {
        background: var(--bg-dark, #0a0a0a);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the storage utility instance and cleans up resources
   */
  destroy() {
    // Clean up any resources, event listeners, or channels
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    
    // Clear any outstanding timeouts/intervals
    if (this.quotaMonitorInterval) {
      clearInterval(this.quotaMonitorInterval);
    }
  }
}

/**
 * Creates a new storage utilities instance
 * @param {Object} options - Configuration options
 * @returns {StorageUtils} New storage utilities instance
 */
function createStorageUtils(options = {}) {
  return new StorageUtils(options);
}

// Create default instance
const storageUtils = new StorageUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StorageUtils,
    createStorageUtils,
    storageUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.StorageUtils = StorageUtils;
  window.createStorageUtils = createStorageUtils;
  window.storageUtils = storageUtils;
}