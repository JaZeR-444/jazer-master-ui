/**
 * Singleton Pattern Implementation
 * The Singleton pattern ensures a class has only one instance
 * and provides a global point of access to it.
 */

class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }

    // Initialize your instance properties here
    this.data = {};
    this.initialized = false;

    Singleton.instance = this;
    return this;
  }

  /**
   * Initialize the singleton instance
   * @param {Object} config - Configuration options
   * @returns {Singleton} The singleton instance
   */
  init(config = {}) {
    if (this.initialized) {
      console.warn('Singleton is already initialized');
      return this;
    }

    // Perform initialization tasks
    this.config = { ...config };
    this.initialized = true;

    return this;
  }

  /**
   * Set a value in the singleton's data store
   * @param {string} key - Key to set
   * @param {*} value - Value to set
   * @returns {Singleton} The singleton instance
   */
  set(key, value) {
    this.data[key] = value;
    return this;
  }

  /**
   * Get a value from the singleton's data store
   * @param {string} key - Key to retrieve
   * @returns {*} The value, or undefined if not found
   */
  get(key) {
    return this.data[key];
  }

  /**
   * Check if a key exists in the singleton's data store
   * @param {string} key - Key to check
   * @returns {boolean} Whether the key exists
   */
  has(key) {
    return this.data.hasOwnProperty(key);
  }

  /**
   * Remove a key from the singleton's data store
   * @param {string} key - Key to remove
   * @returns {boolean} Whether the key was removed
   */
  remove(key) {
    if (this.data.hasOwnProperty(key)) {
      delete this.data[key];
      return true;
    }
    return false;
  }

  /**
   * Get all data from the singleton
   * @returns {Object} The data object
   */
  getAll() {
    return { ...this.data };
  }

  /**
   * Clear all data in the singleton
   * @returns {Singleton} The singleton instance
   */
  clear() {
    this.data = {};
    return this;
  }

  /**
   * Get the current instance (alternative to constructor)
   * @returns {Singleton} The singleton instance
   */
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

// Example usage: Application configuration singleton
class AppConfig {
  constructor() {
    if (AppConfig.instance) {
      return AppConfig.instance;
    }

    this.settings = {
      apiEndpoint: 'https://api.example.com',
      theme: 'dark',
      language: 'en',
      version: '1.0.0'
    };

    AppConfig.instance = this;
    return this;
  }

  /**
   * Update application settings
   * @param {Object} newSettings - Settings to update
   * @returns {AppConfig} The singleton instance
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this;
  }

  /**
   * Get a specific setting
   * @param {string} key - Setting key to retrieve
   * @returns {*} The setting value
   */
  getSetting(key) {
    return this.settings[key];
  }

  /**
   * Get all settings
   * @returns {Object} All settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Get the current instance
   * @returns {AppConfig} The singleton instance
   */
  static getInstance() {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }
}

// Example usage: State management singleton
class StateManager {
  constructor() {
    if (StateManager.instance) {
      return StateManager.instance;
    }

    this.state = {};
    this.listeners = [];

    StateManager.instance = this;
    return this;
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state
   * @param {Object} newState - New state to merge
   * @returns {StateManager} The singleton instance
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    
    // Notify listeners of state change
    this.notifyListeners();
    
    return this;
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Function to call on state change
   * @returns {Function} Function to unsubscribe
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state change
   * @private
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Get the current instance
   * @returns {StateManager} The singleton instance
   */
  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }
}

// Export the classes
module.exports = {
  Singleton,
  AppConfig,
  StateManager
};