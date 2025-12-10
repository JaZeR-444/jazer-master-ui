/**
 * Offline Sync Module
 * Comprehensive offline data synchronization with queue management and conflict resolution
 * Compatible with jazer-brand.css styling for offline status indicators
 */

class OfflineSync {
  /**
   * Creates a new offline sync instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      enable: true,
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000,
      storageKey: 'offline-sync-queue',
      conflictResolution: 'server-wins', // 'server-wins', 'client-wins', 'merge'
      enableBackgroundSync: 'serviceWorker' in navigator,
      onSyncStart: null,
      onSyncComplete: null,
      onSyncError: null,
      onOfflineChange: null,
      onConflict: null,
      ...options
    };

    this.queue = [];
    this.syncInProgress = false;
    this.syncIntervalId = null;
    this.isOnline = navigator.onLine;
    this.storage = window.localStorage;
    this.pendingRequests = new Map();

    // Initialize
    this.init();
  }

  /**
   * Initializes the offline sync system
   */
  init() {
    // Load queue from storage
    this.loadQueue();

    // Set up online/offline detection
    this.setupNetworkDetection();

    // Start sync interval if enabled
    if (this.options.autoSync) {
      this.startSyncInterval();
    }

    // Add dynamic styles
    this.addDynamicStyles();
  }

  /**
   * Sets up network online/offline detection
   */
  setupNetworkDetection() {
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Initialize online status
    this.isOnline = navigator.onLine;
  }

  /**
   * Handles online event
   */
  handleOnline() {
    this.isOnline = true;
    if (this.options.onOfflineChange) {
      this.options.onOfflineChange(true);
    }

    // Sync when back online
    if (this.options.autoSync && this.queue.length > 0) {
      setTimeout(() => {
        this.sync();
      }, 1000);
    }
  }

  /**
   * Handles offline event
   */
  handleOffline() {
    this.isOnline = false;
    if (this.options.onOfflineChange) {
      this.options.onOfflineChange(false);
    }
  }

  /**
   * Starts the sync interval
   */
  startSyncInterval() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.sync();
      }
    }, this.options.syncInterval);
  }

  /**
   * Stops the sync interval
   */
  stopSyncInterval() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Adds a request to the offline queue
   * @param {Object} request - Request object
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   * @param {Object} options - Additional options
   * @returns {string} Request ID
   */
  async addRequest(method, url, data, options = {}) {
    if (!this.options.enable) return;

    const requestId = this.generateRequestId();
    const request = {
      id: requestId,
      method: method.toUpperCase(),
      url: url,
      data: data,
      options: options,
      timestamp: Date.now(),
      retries: 0,
      lastAttempt: null
    };

    // Add to queue
    this.queue.push(request);
    
    // Save to storage
    this.saveQueue();

    // Sync if online and auto-sync is enabled
    if (this.isOnline && this.options.autoSync) {
      setTimeout(() => {
        this.sync();
      }, 100);
    }

    return requestId;
  }

  /**
   * Processes a request in offline mode (queues it)
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   * @param {Object} options - Additional options
   * @returns {Promise} Promise that resolves when request is processed
   */
  async processOfflineRequest(method, url, data, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const requestId = await this.addRequest(method, url, data, options);
        
        // Store the resolve/reject functions to call later when synced
        this.pendingRequests.set(requestId, { resolve, reject });
        
        // Return a response indicating it's queued
        resolve({
          queued: true,
          requestId: requestId,
          timestamp: Date.now(),
          message: 'Request queued for offline sync'
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Synchronizes the offline queue with the server
   */
  async sync() {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    if (this.options.onSyncStart) {
      this.options.onSyncStart();
    }

    try {
      // Process each request in the queue
      for (let i = 0; i < this.queue.length; i++) {
        const request = this.queue[i];
        
        try {
          await this.syncRequest(request);
          
          // Remove successful request from queue
          this.queue.splice(i, 1);
          i--; // Adjust index after removal
          
          // Resolve pending promise if it exists
          if (this.pendingRequests.has(request.id)) {
            const { resolve } = this.pendingRequests.get(request.id);
            resolve({ synced: true, requestId: request.id });
            this.pendingRequests.delete(request.id);
          }
        } catch (error) {
          // Handle request failure
          request.retries = (request.retries || 0) + 1;
          request.lastAttempt = Date.now();
          
          if (request.retries >= this.options.maxRetries) {
            // Remove request after max retries
            this.queue.splice(i, 1);
            i--; // Adjust index after removal
            
            // Reject pending promise if it exists
            if (this.pendingRequests.has(request.id)) {
              const { reject } = this.pendingRequests.get(request.id);
              reject(new Error(`Sync failed after ${this.options.maxRetries} attempts: ${error.message}`));
              this.pendingRequests.delete(request.id);
            }
          } else {
            // Keep in queue for retry
            // Add a delay before next sync attempt for this request
            await this.delay(this.options.retryDelay);
          }
        }
      }

      // Save updated queue
      this.saveQueue();

      if (this.options.onSyncComplete) {
        this.options.onSyncComplete({
          synced: this.queue.length === 0,
          remaining: this.queue.length
        });
      }
    } catch (error) {
      if (this.options.onSyncError) {
        this.options.onSyncError(error);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Syncs a specific request
   * @param {Object} request - Request object to sync
   * @returns {Promise} Promise that resolves when sync is complete
   */
  async syncRequest(request) {
    const { method, url, data, options } = request;
    
    // Prepare fetch options
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (data && method !== 'GET') {
      fetchOptions.body = JSON.stringify(data);
    }

    // Execute the request
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle response
    const result = await response.json();
    
    return result;
  }

  /**
   * Handles data conflicts during sync
   * @param {Object} localData - Local data
   * @param {Object} serverData - Server data
   * @returns {Object} Resolved data
   */
  handleConflict(localData, serverData) {
    switch (this.options.conflictResolution) {
      case 'server-wins':
        return serverData;
      case 'client-wins':
        return localData;
      case 'merge':
        return this.mergeData(localData, serverData);
      default:
        return serverData;
    }
  }

  /**
   * Merges local and server data
   * @param {Object} localData - Local data
   * @param {Object} serverData - Server data
   * @returns {Object} Merged data
   */
  mergeData(localData, serverData) {
    // Simple deep merge implementation
    const merged = { ...serverData };
    
    for (const key in localData) {
      if (localData.hasOwnProperty(key) && merged[key] === undefined) {
        merged[key] = localData[key];
      }
    }
    
    return merged;
  }

  /**
   * Loads the request queue from storage
   */
  loadQueue() {
    try {
      const stored = this.storage.getItem(this.options.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline sync queue:', error);
      this.queue = [];
    }
  }

  /**
   * Saves the request queue to storage
   */
  saveQueue() {
    try {
      this.storage.setItem(this.options.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline sync queue:', error);
    }
  }

  /**
   * Clears the offline request queue
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Gets the current offline request queue
   * @returns {Array} Queue of offline requests
   */
  getQueue() {
    return [...this.queue];
  }

  /**
   * Gets the count of offline requests
   * @returns {number} Count of offline requests
   */
  getQueueCount() {
    return this.queue.length;
  }

  /**
   * Checks if there are pending offline requests
   * @returns {boolean} Whether there are pending requests
   */
  hasPendingRequests() {
    return this.queue.length > 0;
  }

  /**
   * Gets the online status
   * @returns {boolean} Whether the application is online
   */
  isOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Manually triggers synchronization
   */
  async manualSync() {
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Generates a unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simple delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets sync statistics
   * @returns {Object} Sync statistics
   */
  getStats() {
    const totalSynced = this.getQueueCount();
    const oldestRequest = this.queue.length > 0 
      ? Math.min(...this.queue.map(r => r.timestamp)) 
      : null;
    
    return {
      online: this.isOnline,
      queueSize: this.queue.length,
      oldestRequest: oldestRequest ? new Date(oldestRequest) : null,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Removes a specific request from the queue
   * @param {string} requestId - Request ID to remove
   * @returns {boolean} Whether the request was removed
   */
  removeRequest(requestId) {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveQueue();
      return true;
    }
    return false;
  }

  /**
   * Sets conflict resolution strategy
   * @param {string} strategy - Conflict resolution strategy
   */
  setConflictResolution(strategy) {
    if (['server-wins', 'client-wins', 'merge'].includes(strategy)) {
      this.options.conflictResolution = strategy;
    }
  }

  /**
   * Adds a data adapter for specific API endpoints
   * @param {string} endpoint - API endpoint pattern
   * @param {Object} adapter - Data adapter with serialize/deserialize methods
   */
  addDataAdapter(endpoint, adapter) {
    if (!this.dataAdapters) {
      this.dataAdapters = new Map();
    }
    this.dataAdapters.set(endpoint, adapter);
  }

  /**
   * Updates the sync interval
   * @param {number} interval - New sync interval in milliseconds
   */
  updateSyncInterval(interval) {
    this.options.syncInterval = interval;
    this.stopSyncInterval();
    this.startSyncInterval();
  }

  /**
   * Enables or disables offline sync
   * @param {boolean} enable - Whether to enable offline sync
   */
  setEnabled(enable) {
    this.options.enable = enable;
  }

  /**
   * Adds dynamic styles for offline status indicator
   */
  addDynamicStyles() {
    if (document.getElementById('offline-sync-styles')) return;

    const style = document.createElement('style');
    style.id = 'offline-sync-styles';
    style.textContent = `
      .offline-status {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: bold;
        z-index: 10000;
        transition: all 0.3s ease;
      }

      .offline-status.online {
        background-color: #28a745;
        color: white;
      }

      .offline-status.offline {
        background-color: #dc3545;
        color: white;
      }

      .offline-status.syncing {
        background-color: #ffc107;
        color: #212529;
      }

      .offline-sync-queue-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 8px 12px;
        background: var(--bg-dark, #000);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 16px;
        font-size: 0.8rem;
        z-index: 10000;
      }

      .offline-sync-queue-indicator.has-requests {
        background: var(--bg-darker, #111);
        border-color: var(--jazer-cyan, #00f2ea);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Creates an offline status indicator element
   * @returns {HTMLElement} Status indicator element
   */
  createStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'offline-status';
    indicator.textContent = 'ONLINE';
    document.body.appendChild(indicator);

    // Update status when it changes
    const updateStatus = () => {
      indicator.textContent = this.isOnline ? 'ONLINE' : 'OFFLINE';
      indicator.className = `offline-status ${this.isOnline ? 'online' : 'offline'}`;
    };

    // Set up listener for status changes
    this.options.onOfflineChange = updateStatus;

    // Initial update
    updateStatus();

    return indicator;
  }

  /**
   * Creates a queue indicator element
   * @returns {HTMLElement} Queue indicator element
   */
  createQueueIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'offline-sync-queue-indicator';
    document.body.appendChild(indicator);

    // Update queue count when it changes
    const updateQueueCount = () => {
      const count = this.getQueueCount();
      indicator.textContent = `Queue: ${count}`;
      indicator.className = `offline-sync-queue-indicator ${count > 0 ? 'has-requests' : ''}`;
    };

    // Update initially
    updateQueueCount();

    // Set up periodic updates
    setInterval(updateQueueCount, 1000);

    return indicator;
  }

  /**
   * Destroys the offline sync instance and cleans up
   */
  destroy() {
    this.stopSyncInterval();
    this.syncInProgress = false;
  }
}

/**
 * Creates a new offline sync instance
 * @param {Object} options - Configuration options
 * @returns {OfflineSync} New offline sync instance
 */
function createOfflineSync(options = {}) {
  return new OfflineSync(options);
}

/**
 * Offline sync utilities
 */
const OfflineSyncUtils = {
  /**
   * Creates an offline-aware fetch function
   * @param {OfflineSync} syncManager - Offline sync manager
   * @param {string} endpoint - API endpoint
   * @returns {Function} Offline-aware fetch function
   */
  createOfflineFetch(syncManager, endpoint) {
    return async (method, data, options = {}) => {
      if (syncManager.isOnlineStatus()) {
        try {
          const response = await fetch(endpoint, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers
            },
            body: method !== 'GET' ? JSON.stringify(data) : undefined,
            ...options
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          // If online request fails, queue it for offline sync
          return syncManager.processOfflineRequest(method, endpoint, data, options);
        }
      } else {
        // Offline - queue the request
        return syncManager.processOfflineRequest(method, endpoint, data, options);
      }
    };
  },

  /**
   * Creates an offline-aware API client
   * @param {OfflineSync} syncManager - Offline sync manager
   * @param {string} baseUrl - Base URL for API
   * @returns {Object} API client with offline support
   */
  createOfflineAPI(syncManager, baseUrl) {
    return {
      get: async (path, options) => {
        const url = `${baseUrl}${path}`;
        if (syncManager.isOnlineStatus()) {
          const response = await fetch(url, { method: 'GET', ...options });
          return response.json();
        } else {
          // For GET requests offline, we might want to return cached data
          // or queue for later sync - implement based on needs
          return { error: 'Offline - data not available', queued: false };
        }
      },
      
      post: async (path, data, options) => {
        const url = `${baseUrl}${path}`;
        return OfflineSyncUtils.createOfflineFetch(syncManager, url)('POST', data, options);
      },
      
      put: async (path, data, options) => {
        const url = `${baseUrl}${path}`;
        return OfflineSyncUtils.createOfflineFetch(syncManager, url)('PUT', data, options);
      },
      
      delete: async (path, options) => {
        const url = `${baseUrl}${path}`;
        return OfflineSyncUtils.createOfflineFetch(syncManager, url)('DELETE', null, options);
      }
    };
  },

  /**
   * Checks if the browser supports the required features for offline sync
   * @returns {Object} Object with feature support status
   */
  checkSupport() {
    return {
      localStorage: typeof Storage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in navigator.serviceWorker,
      onlineDetection: 'onLine' in navigator
    };
  }
};

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OfflineSync,
    createOfflineSync,
    OfflineSyncUtils
  };
}

// Also make it available globally
window.OfflineSync = OfflineSync;
window.createOfflineSync = createOfflineSync;
window.OfflineSyncUtils = OfflineSyncUtils;