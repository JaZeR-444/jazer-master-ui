/**
 * Request Interceptor Module
 * Comprehensive HTTP request/response interception with mocking, logging, and transformation capabilities
 * Compatible with jazer-brand.css styling for request monitoring UI
 */

class RequestInterceptor {
  /**
   * Creates a new request interceptor instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      enableIntercept: true,
      enableLogging: true,
      enableMocking: false,
      logLevel: 'info', // 'debug', 'info', 'warn', 'error'
      maxLogEntries: 100,
      enableRequestTransform: true,
      enableResponseTransform: true,
      enableCaching: false,
      cacheDuration: 300000, // 5 minutes
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      retryOnNetworkError: true,
      retryOnTimeout: true,
      timeout: 10000,
      ...options
    };

    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.mockRules = [];
    this.cache = new Map();
    this.requestLog = [];
    this.originalFetch = window.fetch;
    this.originalXMLHttpRequest = window.XMLHttpRequest;

    if (this.options.enableIntercept) {
      this.enableInterception();
    }

    // Add dynamic styles
    this.addDynamicStyles();
  }

  /**
   * Enables request interception by wrapping fetch and XMLHttpRequest
   */
  enableInterception() {
    // Intercept fetch
    if (this.originalFetch) {
      window.fetch = this.interceptFetch.bind(this);
    }

    // Intercept XMLHttpRequest
    this.interceptXMLHttpRequest();
  }

  /**
   * Intercepts fetch requests
   * @param {string} input - Request URL or Request object
   * @param {Object} init - Request init object
   * @returns {Promise} Intercepted fetch response
   */
  async interceptFetch(input, init = {}) {
    const request = new Request(input, init);
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Log the request
    this.logRequest(requestId, request, startTime);

    try {
      // Apply request interceptors
      let processedRequest = request.clone();
      for (const interceptor of this.requestInterceptors) {
        processedRequest = await interceptor(processedRequest, this) || processedRequest;
      }

      // Check if there's a mock rule for this request
      const mockResponse = this.getMockResponse(processedRequest);
      if (mockResponse && this.options.enableMocking) {
        this.logResponse(requestId, mockResponse, startTime, 'mocked');
        return mockResponse;
      }

      // Check cache if enabled
      if (this.options.enableCaching && processedRequest.method === 'GET') {
        const cachedResponse = this.getCachedResponse(processedRequest);
        if (cachedResponse) {
          this.logResponse(requestId, cachedResponse, startTime, 'cached');
          return cachedResponse;
        }
      }

      // Execute the actual request with retry logic
      let response;
      if (this.options.enableRetry) {
        response = await this.executeRequestWithRetry(processedRequest);
      } else {
        response = await this.originalFetch(processedRequest);
      }

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse, this) || processedResponse;
      }

      // Cache response if enabled
      if (this.options.enableCaching && request.method === 'GET' && processedResponse.ok) {
        this.setCachedResponse(request, processedResponse.clone());
      }

      this.logResponse(requestId, processedResponse, startTime, 'completed');
      return processedResponse;
    } catch (error) {
      this.logError(requestId, error, startTime);
      throw error;
    }
  }

  /**
   * Executes a request with retry logic
   * @param {Request} request - Request object
   * @returns {Promise} Response promise
   */
  async executeRequestWithRetry(request) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        const response = await this.originalFetch(request.clone());
        
        // Don't retry on successful responses
        if (response.ok) {
          return response;
        }
        
        // Only retry on specific status codes
        if ([502, 503, 504].includes(response.status)) {
          if (attempt < this.options.maxRetries) {
            await this.delay(this.getRetryDelay(attempt));
            continue;
          }
        }
        
        return response;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry on this type of error
        if (this.shouldRetryOnError(error) && attempt < this.options.maxRetries) {
          await this.delay(this.getRetryDelay(attempt));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Determines if a request should be retried based on the error
   * @param {Error} error - Error object
   * @returns {boolean} Whether to retry
   */
  shouldRetryOnError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network errors
      return this.options.retryOnNetworkError;
    }
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      // Timeout errors
      return this.options.retryOnTimeout;
    }
    
    return false;
  }

  /**
   * Calculates retry delay with exponential backoff
   * @param {number} attempt - Attempt number
   * @returns {number} Delay in milliseconds
   */
  getRetryDelay(attempt) {
    // Exponential backoff: baseDelay * 2^attempt
    return this.options.retryDelay * Math.pow(2, attempt);
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
   * Intercepts XMLHttpRequest
   */
  interceptXMLHttpRequest() {
    const self = this;
    
    // Create a new XMLHttpRequest constructor with intercept methods
    const NewXMLHttpRequest = function() {
      const xhr = new self.originalXMLHttpRequest();
      let originalOpen = xhr.open;
      let originalSend = xhr.send;
      let originalSetRequestHeader = xhr.setRequestHeader;
      
      // Track request details
      let requestDetails = {};
      
      xhr.open = function(method, url) {
        requestDetails = { method, url };
        
        // Log the request before opening
        const startTime = Date.now();
        const requestId = self.generateRequestId();
        
        // Create a request-like object for logging
        const request = {
          method: method,
          url: url,
          headers: new Headers()
        };
        
        self.logRequest(requestId, request, startTime);
        
        return originalOpen.apply(xhr, arguments);
      };
      
      xhr.setRequestHeader = function(header, value) {
        if (!requestDetails.headers) requestDetails.headers = {};
        requestDetails.headers[header] = value;
        return originalSetRequestHeader.apply(xhr, arguments);
      };
      
      xhr.send = function(body) {
        // Apply request interceptors here would require more complex implementation
        // For simplicity, we'll just call the original method
        return originalSend.apply(xhr, arguments);
      };
      
      // We'll also need to track readyState changes to log responses
      Object.defineProperty(xhr, 'onreadystatechange', {
        set: function(handler) {
          this._originalHandler = handler;
          const selfXhr = this;
          
          this._interceptedHandler = function() {
            if (selfXhr.readyState === 4) { // Complete
              // Log response
              const response = {
                status: selfXhr.status,
                statusText: selfXhr.statusText,
                headers: selfXhr.getAllResponseHeaders()
              };
              // This is a simplified response logging
            }
            
            if (selfXhr._originalHandler) {
              selfXhr._originalHandler.apply(selfXhr, arguments);
            }
          };
          
          this.onreadystatechange = this._interceptedHandler;
        },
        get: function() {
          return this._originalHandler;
        }
      });
      
      return xhr;
    };
    
    // Replace XMLHttpRequest globally
    window.XMLHttpRequest = NewXMLHttpRequest;
  }

  /**
   * Adds a request interceptor
   * @param {Function} interceptor - Interceptor function
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Adds a response interceptor
   * @param {Function} interceptor - Interceptor function
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Removes a request interceptor
   * @param {Function} interceptor - Interceptor function to remove
   * @returns {boolean} Whether the interceptor was removed
   */
  removeRequestInterceptor(interceptor) {
    const index = this.requestInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this.requestInterceptors.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes a response interceptor
   * @param {Function} interceptor - Interceptor function to remove
   * @returns {boolean} Whether the interceptor was removed
   */
  removeResponseInterceptor(interceptor) {
    const index = this.responseInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this.responseInterceptors.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Adds a mock rule
   * @param {Object} rule - Mock rule object
   * @param {string|RegExp} rule.url - URL pattern to match
   * @param {string} rule.method - HTTP method to match (default: 'GET')
   * @param {Object|Function} rule.response - Response to return
   */
  addMockRule(rule) {
    this.mockRules.push(rule);
  }

  /**
   * Removes all mock rules
   */
  clearMockRules() {
    this.mockRules = [];
  }

  /**
   * Gets a mock response for a request
   * @param {Request} request - Request object
   * @returns {Response|null} Mock response or null if no match
   */
  getMockResponse(request) {
    for (const rule of this.mockRules) {
      const urlMatches = typeof rule.url === 'string' 
        ? request.url.includes(rule.url)
        : rule.url.test(request.url);
      
      const methodMatches = !rule.method || rule.method.toUpperCase() === request.method.toUpperCase();
      
      if (urlMatches && methodMatches) {
        const response = typeof rule.response === 'function'
          ? rule.response(request)
          : rule.response;
        
        return this.createResponse(response);
      }
    }
    
    return null;
  }

  /**
   * Creates a Response object from various input types
   * @param {any} input - Input to create response from
   * @returns {Response} Response object
   */
  createResponse(input) {
    if (input instanceof Response) {
      return input;
    }
    
    if (typeof input === 'string') {
      return new Response(input, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    if (typeof input === 'object') {
      const body = input.body || JSON.stringify(input.data || input);
      const status = input.status || 200;
      const headers = new Headers(input.headers || { 'Content-Type': 'application/json' });
      
      return new Response(body, { status, headers });
    }
    
    return new Response(JSON.stringify(input), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Gets a cached response
   * @param {Request} request - Request object
   * @returns {Response|null} Cached response or null if not found/cached
   */
  getCachedResponse(request) {
    if (!this.options.enableCaching) return null;

    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      const { response, timestamp } = cached;
      
      if (Date.now() - timestamp < this.options.cacheDuration) {
        return response;
      } else {
        // Remove expired cache entry
        this.cache.delete(cacheKey);
      }
    }

    return null;
  }

  /**
   * Sets a cached response
   * @param {Request} request - Request object
   * @param {Response} response - Response object to cache
   */
  setCachedResponse(request, response) {
    if (!this.options.enableCaching) return;

    const cacheKey = this.getCacheKey(request);
    const cloneResponse = response.clone(); // Clone to allow multiple reads

    this.cache.set(cacheKey, {
      response: cloneResponse,
      timestamp: Date.now()
    });
  }

  /**
   * Gets a cache key for a request
   * @param {Request} request - Request object
   * @returns {string} Cache key
   */
  getCacheKey(request) {
    return `${request.method}:${request.url}`;
  }

  /**
   * Clears the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Logs a request
   * @param {string} requestId - Request ID
   * @param {Request} request - Request object
   * @param {number} startTime - Start time in milliseconds
   */
  logRequest(requestId, request, startTime) {
    if (!this.options.enableLogging) return;

    const entry = {
      id: requestId,
      type: 'request',
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: this.headersToObject(request.headers),
      startTime: startTime,
      status: null,
      duration: null,
      size: null
    };

    this.addToLog(entry);
  }

  /**
   * Logs a response
   * @param {string} requestId - Request ID
   * @param {Response} response - Response object
   * @param {number} startTime - Start time in milliseconds
   * @param {string} status - Status of the response
   */
  logResponse(requestId, response, startTime, status) {
    if (!this.options.enableLogging) return;

    const duration = Date.now() - startTime;
    const contentLength = response.headers.get('content-length');
    
    const entry = {
      id: requestId,
      type: 'response',
      timestamp: new Date().toISOString(),
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: this.headersToObject(response.headers),
      duration: duration,
      size: contentLength ? parseInt(contentLength) : null,
      success: response.ok,
      source: status
    };

    this.addToLog(entry);
  }

  /**
   * Logs an error
   * @param {string} requestId - Request ID
   * @param {Error} error - Error object
   * @param {number} startTime - Start time in milliseconds
   */
  logError(requestId, error, startTime) {
    if (!this.options.enableLogging) return;

    const duration = Date.now() - startTime;

    const entry = {
      id: requestId,
      type: 'error',
      timestamp: new Date().toISOString(),
      error: error.message || error.toString(),
      duration: duration,
      success: false
    };

    this.addToLog(entry);
  }

  /**
   * Adds an entry to the request log
   * @param {Object} entry - Log entry
   */
  addToLog(entry) {
    this.requestLog.push(entry);

    // Limit log size
    if (this.requestLog.length > this.options.maxLogEntries) {
      this.requestLog.shift();
    }
  }

  /**
   * Clears the request log
   */
  clearLog() {
    this.requestLog = [];
  }

  /**
   * Gets the request log
   * @returns {Array} Array of log entries
   */
  getLog() {
    return [...this.requestLog];
  }

  /**
   * Gets request statistics
   * @returns {Object} Request statistics
   */
  getStats() {
    const totalRequests = this.requestLog.length;
    const successfulRequests = this.requestLog.filter(entry => 
      entry.type === 'response' && entry.success
    ).length;
    const failedRequests = this.requestLog.filter(entry => 
      entry.type === 'response' && !entry.success
    ).length;
    const errorRequests = this.requestLog.filter(entry => 
      entry.type === 'error'
    ).length;

    return {
      total: totalRequests,
      successful: successfulRequests,
      failed: failedRequests + errorRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    };
  }

  /**
   * Converts Headers object to a plain object
   * @param {Headers} headers - Headers object
   * @returns {Object} Plain object with headers
   */
  headersToObject(headers) {
    const obj = {};
    for (const [key, value] of headers.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Generates a unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Restores original fetch and XMLHttpRequest
   */
  restoreOriginals() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }
    if (this.originalXMLHttpRequest) {
      window.XMLHttpRequest = this.originalXMLHttpRequest;
    }
  }

  /**
   * Gets all active interceptors
   * @returns {Object} Object containing request and response interceptors
   */
  getInterceptors() {
    return {
      request: [...this.requestInterceptors],
      response: [...this.responseInterceptors]
    };
  }

  /**
   * Disables request interception
   */
  disableInterception() {
    this.restoreOriginals();
  }

  /**
   * Adds dynamic styles for request monitoring
   */
  addDynamicStyles() {
    if (document.getElementById('request-interceptor-styles')) return;

    const style = document.createElement('style');
    style.id = 'request-interceptor-styles';
    style.textContent = `
      .request-monitor {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        max-height: 400px;
        background: var(--bg-dark, #000);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
      }

      .request-monitor-header {
        padding: 10px;
        background: var(--bg-darker, #111);
        border-bottom: 1px solid var(--border-lighter, #222);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .request-monitor-content {
        padding: 10px;
        max-height: 300px;
        overflow-y: auto;
      }

      .request-monitor-entry {
        padding: 5px 0;
        border-bottom: 1px solid var(--border-lighter, #222);
      }

      .request-monitor-entry.request {
        color: #90caf9;
      }

      .request-monitor-entry.response.success {
        color: #a5d6a7;
      }

      .request-monitor-entry.response.failed {
        color: #ef9a9a;
      }

      .request-monitor-entry.error {
        color: #f48fb1;
      }

      .request-monitor-controls {
        padding: 10px;
        display: flex;
        gap: 10px;
      }

      .request-monitor-btn {
        flex: 1;
        padding: 5px;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        color: white;
        cursor: pointer;
        border-radius: 4px;
      }

      .request-monitor-btn:hover {
        background: var(--bg-dark, #0a0a0a);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Creates a request monitor UI
   * @returns {HTMLElement} Monitor UI element
   */
  createMonitor() {
    const monitor = document.createElement('div');
    monitor.className = 'request-monitor';

    const header = document.createElement('div');
    header.className = 'request-monitor-header';
    header.innerHTML = '<strong>Request Monitor</strong>';

    const content = document.createElement('div');
    content.className = 'request-monitor-content';
    content.id = 'request-monitor-content';

    const controls = document.createElement('div');
    controls.className = 'request-monitor-controls';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'request-monitor-btn';
    clearBtn.textContent = 'Clear';
    clearBtn.onclick = () => this.clearLog();

    const statsBtn = document.createElement('button');
    statsBtn.className = 'request-monitor-btn';
    statsBtn.textContent = 'Stats';
    statsBtn.onclick = () => {
      const stats = this.getStats();
      console.log('Request Statistics:', stats);
      alert(JSON.stringify(stats, null, 2));
    };

    controls.appendChild(clearBtn);
    controls.appendChild(statsBtn);

    monitor.appendChild(header);
    monitor.appendChild(content);
    monitor.appendChild(controls);

    document.body.appendChild(monitor);

    // Update content periodically
    setInterval(() => {
      this.updateMonitorContent(content);
    }, 1000);

    return monitor;
  }

  /**
   * Updates the monitor content
   * @param {HTMLElement} contentElement - Content element to update
   */
  updateMonitorContent(contentElement) {
    contentElement.innerHTML = '';

    // Show last 10 entries
    const recentEntries = this.requestLog.slice(-10).reverse();
    
    recentEntries.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = `request-monitor-entry ${entry.type} ${entry.success === false ? 'failed' : ''} ${entry.success === true ? 'success' : ''}`;
      
      if (entry.type === 'request') {
        entryElement.textContent = `${entry.method} ${new URL(entry.url).pathname}`;
      } else if (entry.type === 'response') {
        entryElement.textContent = `${entry.status} ${entry.statusText} ${new URL(entry.url).pathname} (${entry.duration}ms)`;
      } else if (entry.type === 'error') {
        entryElement.textContent = `ERROR: ${entry.error}`;
      }
      
      contentElement.appendChild(entryElement);
    });
  }
}

/**
 * Creates a new request interceptor instance
 * @param {Object} options - Configuration options
 * @returns {RequestInterceptor} New request interceptor instance
 */
function createRequestInterceptor(options = {}) {
  return new RequestInterceptor(options);
}

/**
 * Request interceptor utilities
 */
const RequestInterceptorUtils = {
  /**
   * Creates a request transform interceptor
   * @param {Function} transform - Transform function
   * @returns {Function} Interceptor function
   */
  createRequestTransform(transform) {
    return async (request) => {
      return transform(request);
    };
  },

  /**
   * Creates a response transform interceptor
   * @param {Function} transform - Transform function
   * @returns {Function} Interceptor function
   */
  createResponseTransform(transform) {
    return async (response) => {
      return transform(response);
    };
  },

  /**
   * Creates an authentication interceptor
   * @param {string} token - Authentication token
   * @param {string} headerName - Header name (default: 'Authorization')
   * @param {string} headerPrefix - Header prefix (default: 'Bearer ')
   * @returns {Function} Interceptor function
   */
  createAuthInterceptor(token, headerName = 'Authorization', headerPrefix = 'Bearer ') {
    return async (request) => {
      const newHeaders = new Headers(request.headers);
      newHeaders.set(headerName, `${headerPrefix}${token}`);
      
      return new Request(request, {
        headers: newHeaders
      });
    };
  },

  /**
   * Creates a request logger interceptor
   * @param {Function} logger - Logger function
   * @returns {Function} Interceptor function
   */
  createLoggerInterceptor(logger = console.log) {
    return async (request) => {
      logger(`Outgoing request: ${request.method} ${request.url}`);
      return request;
    };
  },

  /**
   * Creates a response error handler interceptor
   * @param {Function} errorHandler - Error handler function
   * @returns {Function} Interceptor function
   */
  createErrorHandler(errorHandler) {
    return async (response) => {
      if (!response.ok) {
        if (errorHandler) {
          await errorHandler(response);
        } else {
          console.error(`Request failed: ${response.status} ${response.statusText}`);
        }
      }
      return response;
    };
  }
};

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RequestInterceptor,
    createRequestInterceptor,
    RequestInterceptorUtils
  };
}

// Also make it available globally
window.RequestInterceptor = RequestInterceptor;
window.createRequestInterceptor = createRequestInterceptor;
window.RequestInterceptorUtils = RequestInterceptorUtils;