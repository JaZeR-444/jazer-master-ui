// Browser history hook for JavaScript

function useHistory(initialEntries = ['/'], options = {}) {
  const {
    onChange = null,
    maxEntries = 50
  } = options;

  // State variables
  let historyState = {
    entries: [...initialEntries],
    index: initialEntries.length - 1,
    current: initialEntries[initialEntries.length - 1]
  };

  // Callback for history changes
  let onHistoryChange = onChange;

  // Listen to browser's popstate event (when user navigates with back/forward buttons)
  window.addEventListener('popstate', (event) => {
    const newIndex = historyState.entries.findIndex(entry => entry === location.pathname);
    if (newIndex !== -1) {
      historyState.index = newIndex;
      historyState.current = historyState.entries[newIndex];
      
      if (onHistoryChange) {
        onHistoryChange({
          action: 'POP',
          location: { pathname: historyState.current },
          history: { ...historyState }
        });
      }
    }
  });

  // Function to navigate to a new entry
  function push(path, state = null) {
    // Add the new entry
    const newEntries = historyState.entries.slice(0, historyState.index + 1);
    newEntries.push(path);
    
    if (newEntries.length > maxEntries) {
      newEntries.shift(); // Remove oldest entry if exceeding max
    }
    
    historyState.entries = newEntries;
    historyState.index = newEntries.length - 1;
    historyState.current = path;
    
    // Update browser history
    window.history.pushState(state, null, path);
    
    if (onHistoryChange) {
      onHistoryChange({
        action: 'PUSH',
        location: { pathname: path },
        history: { ...historyState }
      });
    }
  }

  // Function to replace current entry
  function replace(path, state = null) {
    historyState.entries[historyState.index] = path;
    historyState.current = path;
    
    // Update browser history
    window.history.replaceState(state, null, path);
    
    if (onHistoryChange) {
      onHistoryChange({
        action: 'REPLACE',
        location: { pathname: path },
        history: { ...historyState }
      });
    }
  }

  // Function to go back in history
  function back() {
    if (historyState.index > 0) {
      historyState.index--;
      historyState.current = historyState.entries[historyState.index];
      
      window.history.back();
      
      if (onHistoryChange) {
        onHistoryChange({
          action: 'BACK',
          location: { pathname: historyState.current },
          history: { ...historyState }
        });
      }
    }
  }

  // Function to go forward in history
  function forward() {
    if (historyState.index < historyState.entries.length - 1) {
      historyState.index++;
      historyState.current = historyState.entries[historyState.index];
      
      window.history.forward();
      
      if (onHistoryChange) {
        onHistoryChange({
          action: 'FORWARD',
          location: { pathname: historyState.current },
          history: { ...historyState }
        });
      }
    }
  }

  // Function to go to specific index
  function go(delta) {
    const newIndex = historyState.index + delta;
    if (newIndex >= 0 && newIndex < historyState.entries.length) {
      const targetPath = historyState.entries[newIndex];
      historyState.index = newIndex;
      historyState.current = targetPath;
      
      if (delta > 0) {
        // Going forward
        for (let i = 0; i < delta; i++) {
          window.history.forward();
        }
      } else {
        // Going backward
        for (let i = 0; i < Math.abs(delta); i++) {
          window.history.back();
        }
      }
      
      if (onHistoryChange) {
        onHistoryChange({
          action: delta > 0 ? 'FORWARD' : 'BACK',
          location: { pathname: historyState.current },
          history: { ...historyState }
        });
      }
    }
  }

  // Function to get current location
  function getCurrentLocation() {
    return { pathname: historyState.current };
  }

  // Function to get current history state
  function getHistoryState() {
    return { ...historyState };
  }

  // Function to subscribe to changes
  function subscribe(callback) {
    onHistoryChange = callback;
  }

  // Function to unsubscribe
  function unsubscribe() {
    onHistoryChange = null;
  }

  // Function to check if can go back
  function canGoBack() {
    return historyState.index > 0;
  }

  // Function to check if can go forward
  function canGoForward() {
    return historyState.index < historyState.entries.length - 1;
  }

  // Return the API
  return {
    push,
    replace,
    back,
    forward,
    go,
    location: getCurrentLocation,
    history: getHistoryState,
    subscribe,
    unsubscribe,
    canGoBack,
    canGoForward
  };
}

// Navigation guard hook to prevent navigation
function useNavigationGuard(guardFunction, options = {}) {
  const {
    message = 'Are you sure you want to leave? Changes you made may not be saved.',
    preventGoBack = true,
    preventGoForward = true
  } = options;

  let isBlocking = true;

  // Store the original pushState and replaceState
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  // Override pushState to add blocking logic
  window.history.pushState = function(...args) {
    if (isBlocking && guardFunction()) {
      const result = window.confirm(message);
      if (!result) {
        return; // Cancel navigation
      }
    }
    return originalPushState.apply(this, args);
  };

  // Override replaceState to add blocking logic
  window.history.replaceState = function(...args) {
    if (isBlocking && guardFunction()) {
      const result = window.confirm(message);
      if (!result) {
        return; // Cancel navigation
      }
    }
    return originalReplaceState.apply(this, args);
  };

  // Listen to beforeunload to prevent accidental tab closing
  window.addEventListener('beforeunload', (event) => {
    if (isBlocking && guardFunction()) {
      event.preventDefault();
      event.returnValue = message; // For older browsers
      return message; // For modern browsers
    }
  });

  // Function to enable blocking
  function enableBlock() {
    isBlocking = true;
  }

  // Function to disable blocking
  function disableBlock() {
    isBlocking = false;
  }

  // Function to set a new guard function
  function setGuard(newGuardFunction) {
    guardFunction = newGuardFunction;
  }

  // Return the API
  return {
    enableBlock,
    disableBlock,
    setGuard
  };
}

// Hook for tracking page views
function usePageTracking(options = {}) {
  const {
    onVisit = null,
    trackInitialVisit = true,
    includePageTitle = true
  } = options;

  // Track the initial page load
  if (trackInitialVisit) {
    trackPageVisit(window.location.pathname, {
      title: includePageTitle ? document.title : null,
      timestamp: Date.now()
    });
  }

  // Track page visits using the browser's popstate event
  window.addEventListener('popstate', () => {
    trackPageVisit(window.location.pathname, {
      title: includePageTitle ? document.title : null,
      timestamp: Date.now()
    });
  });

  // Watch for changes to the URL hash (for single-page applications)
  let currentPath = window.location.pathname + window.location.hash;
  const pathWatcher = setInterval(() => {
    const newPath = window.location.pathname + window.location.hash;
    if (newPath !== currentPath) {
      trackPageVisit(newPath, {
        title: includePageTitle ? document.title : null,
        timestamp: Date.now()
      });
      currentPath = newPath;
    }
  }, 500); // Check every 500ms

  // Function to track a page visit
  function trackPageVisit(path, metadata = {}) {
    const pageData = {
      path,
      ...metadata
    };

    if (onVisit) {
      onVisit(pageData);
    }

    // You could also send this data to an analytics service here
    console.log(`Page visited: ${path}`, pageData);
  }

  // Return a cleanup function
  return function cleanup() {
    clearInterval(pathWatcher);
  };
}

// Hook for URL query parameters
function useQueryParams() {
  // Parse query parameters from URL
  function getQueryParams(url = window.location.search) {
    const params = new URLSearchParams(url);
    const obj = {};
    
    for (const [key, value] of params) {
      // If the key already exists, make it an array
      if (obj[key]) {
        if (Array.isArray(obj[key])) {
          obj[key].push(value);
        } else {
          obj[key] = [obj[key], value];
        }
      } else {
        obj[key] = value;
      }
    }
    
    return obj;
  }

  // Update query parameters in the URL
  function updateQueryParams(newParams, options = {}) {
    const {
      method = 'push', // 'push' or 'replace'
      includeCurrentParams = true
    } = options;

    let params = includeCurrentParams ? getQueryParams() : {};
    params = { ...params, ...newParams };

    // Build the query string
    const queryString = new URLSearchParams(params).toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}${window.location.hash}`;

    if (method === 'replace') {
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.pushState(null, '', newUrl);
    }
  }

  // Get a specific query parameter
  function getQueryParam(key, defaultValue = null) {
    const params = getQueryParams();
    return params[key] !== undefined ? params[key] : defaultValue;
  }

  // Remove a specific query parameter
  function removeQueryParam(key, options = {}) {
    const {
      method = 'push'
    } = options;

    const params = getQueryParams();
    delete params[key];

    // Build the query string without the removed parameter
    const queryString = new URLSearchParams(params).toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}${window.location.hash}`;

    if (method === 'replace') {
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.pushState(null, '', newUrl);
    }
  }

  // Return the API
  return {
    get: getQueryParams,
    set: updateQueryParams,
    getOne: getQueryParam,
    remove: removeQueryParam
  };
}

// Export the hooks
export { 
  useHistory, 
  useNavigationGuard, 
  usePageTracking, 
  useQueryParams 
};