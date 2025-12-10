/**
 * WebSocket Manager Module
 * Comprehensive WebSocket connection management with reconnection, authentication, and message handling
 * Compatible with jazer-brand.css styling for connection status indicators
 */

class WebSocketManager {
  /**
   * Creates a new WebSocket manager instance
   * @param {string} url - WebSocket server URL
   * @param {Object} options - Configuration options
   */
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      autoConnect: true,
      reconnect: true,
      maxReconnectAttempts: 10,
      reconnectInterval: 5000,
      pingInterval: 30000,
      timeout: 10000,
      protocols: null,
      binaryType: 'blob',
      authentication: null,
      onOpen: null,
      onClose: null,
      onError: null,
      onMessage: null,
      onReconnect: null,
      onReconnectFailed: null,
      ...options
    };

    this.ws = null;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.pingIntervalId = null;
    this.messageQueue = [];
    this.messageHandlers = new Map();
    this.connectionStatus = 'disconnected'; // disconnected, connecting, connected, error
    this.connectionStatusElement = null;

    if (this.options.autoConnect) {
      this.connect();
    }
  }

  /**
   * Establishes a WebSocket connection
   */
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.connectionStatus = 'connecting';
    this.updateConnectionStatus();

    try {
      // Apply protocols if provided
      const protocols = this.options.protocols;
      this.ws = protocols ? new WebSocket(this.url, protocols) : new WebSocket(this.url);
      this.ws.binaryType = this.options.binaryType;

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.updateConnectionStatus();
      this.handleConnectionError(error);
    }
  }

  /**
   * Handles WebSocket open event
   * @param {Event} event - Open event
   */
  handleOpen(event) {
    this.connectionStatus = 'connected';
    this.updateConnectionStatus();
    this.reconnectAttempts = 0;
    this.isReconnecting = false;

    // Start ping/pong mechanism
    this.startPing();

    // Send queued messages
    this.flushMessageQueue();

    // Execute callback
    if (this.options.onOpen) {
      this.options.onOpen(event, this);
    }
  }

  /**
   * Handles WebSocket message event
   * @param {MessageEvent} event - Message event
   */
  handleMessage(event) {
    let data;
    
    try {
      // Parse JSON if it's a string, otherwise keep as is
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (e) {
      // If it's not JSON, use the raw data
      data = event.data;
    }

    // Check if message has a specific type that needs special handling
    if (data && typeof data === 'object' && data.type) {
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        handler(data);
      }
    }

    // Execute general message callback
    if (this.options.onMessage) {
      this.options.onMessage(data, event, this);
    }
  }

  /**
   * Handles WebSocket close event
   * @param {CloseEvent} event - Close event
   */
  handleClose(event) {
    this.connectionStatus = 'disconnected';
    this.updateConnectionStatus();
    this.stopPing();

    // Execute callback
    if (this.options.onClose) {
      this.options.onClose(event, this);
    }

    // Attempt to reconnect if configured and not manually closed
    if (this.options.reconnect && !event.wasClean && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnect();
    } else if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.connectionStatus = 'error';
      this.updateConnectionStatus();
      if (this.options.onReconnectFailed) {
        this.options.onReconnectFailed(this);
      }
    }
  }

  /**
   * Handles WebSocket error event
   * @param {Event} event - Error event
   */
  handleError(event) {
    this.connectionStatus = 'error';
    this.updateConnectionStatus();

    // Execute callback
    if (this.options.onError) {
      this.options.onError(event, this);
    }
  }

  /**
   * Attempts to reconnect to the WebSocket server
   */
  reconnect() {
    if (this.isReconnecting) return;

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    this.connectionStatus = 'reconnecting';
    this.updateConnectionStatus();

    // Execute callback
    if (this.options.onReconnect) {
      this.options.onReconnect(this.reconnectAttempts, this);
    }

    setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  /**
   * Handles connection errors
   * @param {Error} error - The error that occurred
   */
  handleConnectionError(error) {
    this.connectionStatus = 'error';
    this.updateConnectionStatus();

    if (this.options.onError) {
      this.options.onError(error, this);
    }

    // Attempt to reconnect
    if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnect();
    }
  }

  /**
   * Starts the ping/pong mechanism to keep connection alive
   */
  startPing() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
    }

    this.pingIntervalId = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.options.pingInterval);
  }

  /**
   * Stops the ping/pong mechanism
   */
  stopPing() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  /**
   * Sends a message through the WebSocket
   * @param {any} message - Message to send
   * @param {Function} callback - Optional callback for confirmation
   */
  send(message, callback) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message if not connected
      this.messageQueue.push({ message, callback });
      return false;
    }

    try {
      const serializedMessage = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(serializedMessage);
      
      if (callback) callback(null, message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      if (callback) callback(error, message);
      return false;
    }
  }

  /**
   * Queues a message to be sent when connection is established
   * @param {any} message - Message to queue
   */
  queueMessage(message) {
    this.messageQueue.push({ message });
  }

  /**
   * Flushes all queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift();
      this.send(queuedMessage.message, queuedMessage.callback);
    }
  }

  /**
   * Registers a message handler for a specific message type
   * @param {string} type - Message type
   * @param {Function} handler - Handler function
   */
  registerMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Unregisters a message handler
   * @param {string} type - Message type
   */
  unregisterMessageHandler(type) {
    this.messageHandlers.delete(type);
  }

  /**
   * Checks if the WebSocket is currently connected
   * @returns {boolean} Whether the WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Checks if the WebSocket is currently connecting
   * @returns {boolean} Whether the WebSocket is connecting
   */
  isConnecting() {
    return this.ws && this.ws.readyState === WebSocket.CONNECTING;
  }

  /**
   * Checks if the WebSocket is closed
   * @returns {boolean} Whether the WebSocket is closed
   */
  isClosed() {
    return this.ws && this.ws.readyState === WebSocket.CLOSED;
  }

  /**
   * Checks if the WebSocket is in any state other than closed
   * @returns {boolean} Whether the WebSocket is in an active state
   */
  isActive() {
    return this.ws && this.ws.readyState !== WebSocket.CLOSED;
  }

  /**
   * Closes the WebSocket connection
   * @param {number} code - Close code (optional)
   * @param {string} reason - Close reason (optional)
   */
  close(code, reason) {
    this.options.reconnect = false; // Disable reconnection
    this.isReconnecting = false;
    this.stopPing();

    if (this.ws) {
      this.ws.close(code, reason);
    }
  }

  /**
   * Gets the current connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    return this.connectionStatus;
  }

  /**
   * Updates the connection status UI element if provided
   */
  updateConnectionStatus() {
    if (this.connectionStatusElement) {
      this.connectionStatusElement.textContent = this.connectionStatus;
      this.connectionStatusElement.className = `connection-status connection-status-${this.connectionStatus}`;
    }
  }

  /**
   * Sets up a connection status display element
   * @param {HTMLElement} element - Element to display connection status
   */
  setConnectionStatusElement(element) {
    this.connectionStatusElement = element;
    this.updateConnectionStatus();
  }

  /**
   * Authenticates with the WebSocket server
   * @param {Object} credentials - Authentication credentials
   * @returns {Promise} Promise that resolves when authentication is complete
   */
  authenticate(credentials) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      // Add authentication message to the queue
      const authMessage = {
        type: 'authenticate',
        credentials: credentials
      };

      // Create a temporary handler for the auth response
      const authHandler = (response) => {
        if (response.type === 'auth-result') {
          this.unregisterMessageHandler('auth-result');
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Authentication failed'));
          }
        }
      };

      this.registerMessageHandler('auth-result', authHandler);
      
      // Send authentication request
      this.send(authMessage, (error) => {
        if (error) {
          this.unregisterMessageHandler('auth-result');
          reject(error);
        }
      });
    });
  }

  /**
   * Subscribes to a specific channel
   * @param {string} channel - Channel name
   * @param {Function} handler - Message handler for this channel
   * @returns {Promise} Promise that resolves when subscription is confirmed
   */
  subscribe(channel, handler) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      // Register the handler for messages from this channel
      if (handler) {
        this.registerMessageHandler(`channel-${channel}`, handler);
      }

      const subscribeMessage = {
        type: 'subscribe',
        channel: channel
      };

      // Create a temporary handler for the subscription response
      const subHandler = (response) => {
        if (response.type === 'subscribe-result' && response.channel === channel) {
          this.unregisterMessageHandler('subscribe-result');
          if (response.success) {
            resolve(response);
          } else {
            this.unregisterMessageHandler(`channel-${channel}`);
            reject(new Error(response.error || 'Subscription failed'));
          }
        }
      };

      this.registerMessageHandler('subscribe-result', subHandler);
      
      // Send subscription request
      this.send(subscribeMessage, (error) => {
        if (error) {
          this.unregisterMessageHandler('subscribe-result');
          this.unregisterMessageHandler(`channel-${channel}`);
          reject(error);
        }
      });
    });
  }

  /**
   * Unsubscribes from a specific channel
   * @param {string} channel - Channel name
   * @returns {Promise} Promise that resolves when unsubscription is confirmed
   */
  unsubscribe(channel) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const unsubscribeMessage = {
        type: 'unsubscribe',
        channel: channel
      };

      // Create a temporary handler for the unsubscription response
      const unsubHandler = (response) => {
        if (response.type === 'unsubscribe-result' && response.channel === channel) {
          this.unregisterMessageHandler('unsubscribe-result');
          this.unregisterMessageHandler(`channel-${channel}`);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Unsubscription failed'));
          }
        }
      };

      this.registerMessageHandler('unsubscribe-result', unsubHandler);
      
      // Send unsubscription request
      this.send(unsubscribeMessage, (error) => {
        if (error) {
          this.unregisterMessageHandler('unsubscribe-result');
          reject(error);
        }
      });
    });
  }

  /**
   * Gets connection statistics
   * @returns {Object} Connection statistics
   */
  getStats() {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      isReconnecting: this.isReconnecting,
      connected: this.isConnected(),
      connecting: this.isConnecting(),
      closed: this.isClosed(),
      active: this.isActive(),
      messageQueueSize: this.messageQueue.length,
      messageHandlersCount: this.messageHandlers.size
    };
  }

  /**
   * Resets the reconnect attempts counter
   */
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  /**
   * Updates the WebSocket URL and reconnects
   * @param {string} newUrl - New WebSocket URL
   */
  updateUrl(newUrl) {
    this.url = newUrl;
    this.close();
    this.resetReconnectAttempts();
    this.connect();
  }

  /**
   * Adds dynamic styles for the connection status indicator
   */
  addDynamicStyles() {
    if (document.getElementById('websocket-manager-styles')) return;

    const style = document.createElement('style');
    style.id = 'websocket-manager-styles';
    style.textContent = `
      .connection-status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
      }

      .connection-status-disconnected {
        background-color: #495057;
        color: #fff;
      }

      .connection-status-connecting {
        background-color: #ffc107;
        color: #212529;
      }

      .connection-status-reconnecting {
        background-color: #fd7e14;
        color: #fff;
      }

      .connection-status-connected {
        background-color: #28a745;
        color: #fff;
      }

      .connection-status-error {
        background-color: #dc3545;
        color: #fff;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Creates a new WebSocket manager instance
 * @param {string} url - WebSocket server URL
 * @param {Object} options - Configuration options
 * @returns {WebSocketManager} New WebSocket manager instance
 */
function createWebSocketManager(url, options = {}) {
  return new WebSocketManager(url, options);
}

/**
 * WebSocket manager utilities
 */
const WebSocketUtils = {
  /**
   * Validates a WebSocket URL
   * @param {string} url - URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
      return false;
    }
  },

  /**
   * Formats a WebSocket URL with proper protocol
   * @param {string} url - URL to format
   * @returns {string} Formatted URL
   */
  formatUrl(url) {
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      // If it starts with http, replace with ws, else default to ws
      if (url.startsWith('http://')) {
        return url.replace('http://', 'ws://');
      } else if (url.startsWith('https://')) {
        return url.replace('https://', 'wss://');
      } else {
        return `ws://${url}`;
      }
    }
    return url;
  },

  /**
   * Creates a message with timestamp and ID
   * @param {string} type - Message type
   * @param {any} data - Message data
   * @param {string} id - Optional message ID
   * @returns {Object} Formatted message
   */
  createMessage(type, data, id) {
    return {
      id: id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now()
    };
  }
};

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WebSocketManager,
    createWebSocketManager,
    WebSocketUtils
  };
}

// Also make it available globally
window.WebSocketManager = WebSocketManager;
window.createWebSocketManager = createWebSocketManager;
window.WebSocketUtils = WebSocketUtils;