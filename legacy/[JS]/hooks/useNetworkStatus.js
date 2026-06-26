// Network status hook for JavaScript

function useNetworkStatus() {
  // State variables
  let networkState = {
    online: navigator.onLine,
    type: getConnectionType(),
    effectiveType: getEffectiveType(),
    downlink: getDownlink(),
    saveData: getSaveData(),
    rtt: getRtt()
  };

  // Callbacks
  let onStatusChange = null;

  // Function to get connection type
  function getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || navigator.connection.type;
    }
    return 'unknown';
  }

  // Function to get effective type
  function getEffectiveType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // Function to get downlink speed
  function getDownlink() {
    if ('connection' in navigator) {
      return navigator.connection.downlink || null;
    }
    return null;
  }

  // Function to check if save data is enabled
  function getSaveData() {
    if ('connection' in navigator) {
      return navigator.connection.saveData || false;
    }
    return false;
  }

  // Function to get round-trip time
  function getRtt() {
    if ('connection' in navigator) {
      return navigator.connection.rtt || null;
    }
    return null;
  }

  // Update network state
  function updateNetworkState() {
    networkState = {
      online: navigator.onLine,
      type: getConnectionType(),
      effectiveType: getEffectiveType(),
      downlink: getDownlink(),
      saveData: getSaveData(),
      rtt: getRtt()
    };

    if (onStatusChange) {
      onStatusChange(networkState);
    }
  }

  // Handle online event
  function handleOnline() {
    updateNetworkState();
  }

  // Handle offline event
  function handleOffline() {
    updateNetworkState();
  }

  // Add event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // If the Network Information API is available, add additional listeners
  if ('connection' in navigator) {
    navigator.connection.addEventListener('change', updateNetworkState);
  }

  // Function to subscribe to status changes
  function subscribe(callback) {
    onStatusChange = callback;
  }

  // Function to unsubscribe
  function unsubscribe() {
    onStatusChange = null;
  }

  // Function to get current state
  function getState() {
    return networkState;
  }

  // Function to check if connection is fast
  function isFastConnection() {
    const effectiveType = getEffectiveType();
    return effectiveType === '4g' || effectiveType === 'wifi';
  }

  // Function to check if connection is slow
  function isSlowConnection() {
    const effectiveType = getEffectiveType();
    return effectiveType === 'slow-2g' || effectiveType === '2g';
  }

  // Function to get connection quality
  function getConnectionQuality() {
    const effectiveType = getEffectiveType();
    switch (effectiveType) {
      case '4g':
      case 'wifi':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
        return 'poor';
      case 'slow-2g':
        return 'very-poor';
      default:
        return 'unknown';
    }
  }

  // Return the API
  return {
    getState,
    subscribe,
    unsubscribe,
    isFastConnection,
    isSlowConnection,
    getConnectionQuality,
    // Expose the state directly as well
    ...networkState
  };
}

// Hook to monitor network requests
function useNetworkMonitor() {
  const requests = [];
  let ongoingRequests = 0;

  // Store original fetch and XMLHttpRequest
  const originalFetch = window.fetch;
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  // Track fetch requests
  window.fetch = function(...args) {
    ongoingRequests++;
    
    const startTime = Date.now();
    const url = args[0];
    
    // Add to requests array
    const requestId = Date.now() + Math.random();
    requests.push({
      id: requestId,
      url,
      method: args[1]?.method || 'GET',
      status: 'pending',
      startTime,
      endTime: null,
      duration: null,
      size: null
    });
    
    // Call original fetch
    const result = originalFetch.apply(this, args);
    
    // Track when request completes
    result.then(response => {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.status = response.status;
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        
        // Try to get content length if possible
        if (response.headers) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            request.size = parseInt(contentLength);
          }
        }
      }
      ongoingRequests--;
    }).catch(error => {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.status = 'error';
        request.error = error;
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
      }
      ongoingRequests--;
    });
    
    return result;
  };

  // Track XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    ongoingRequests++;
    
    const startTime = Date.now();
    const requestId = Date.now() + Math.random();
    
    // Add to requests array
    requests.push({
      id: requestId,
      url: this._url,
      method: this._method,
      status: 'pending',
      startTime,
      endTime: null,
      duration: null,
      size: null
    });
    
    // Add event listener for when request completes
    this.addEventListener('load', function() {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.status = this.status;
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        
        // Try to get response size
        try {
          const contentLength = this.getResponseHeader('Content-Length');
          if (contentLength) {
            request.size = parseInt(contentLength);
          }
        } catch (e) {
          // Ignore errors getting header
        }
      }
      ongoingRequests--;
    });
    
    this.addEventListener('error', function() {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.status = 'error';
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
      }
      ongoingRequests--;
    });
    
    return originalXhrSend.apply(this, arguments);
  };

  // Function to get all requests
  function getRequests() {
    return [...requests];
  }

  // Function to get ongoing request count
  function getOngoingRequests() {
    return ongoingRequests;
  }

  // Function to reset tracking
  function reset() {
    requests.length = 0;
    ongoingRequests = 0;
  }

  // Function to restore original methods
  function restore() {
    window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXhrOpen;
    XMLHttpRequest.prototype.send = originalXhrSend;
  }

  // Return the API
  return {
    getRequests,
    getOngoingRequests,
    reset,
    restore
  };
}

// Export the hooks
export { useNetworkStatus, useNetworkMonitor };