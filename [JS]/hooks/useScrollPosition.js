// Scroll position hook for JavaScript

function useScrollPosition(element = window, options = {}) {
  const {
    handler = null,
    throttleMs = 100,
    includeScrollEnd = true
  } = options;

  // State variables
  let scrollState = {
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    direction: 'idle',
    speed: 0,
    isScrolling: false
  };
  
  // Internal state
  let lastScrollTime = Date.now();
  let scrollEndTimer = null;
  let throttled = false;

  // Callbacks
  let onScroll = null;
  let onScrollStart = null;
  let onScrollStop = null;
  let onScrollDirectionChange = null;

  // Get element based on whether it's window or DOM element
  const scrollElement = element === window ? document.documentElement || document.body.parentNode || document.body : 
                        typeof element === 'string' ? document.querySelector(element) : element;

  // Update scroll state
  function updateScrollState() {
    const now = Date.now();
    const timeDiff = now - lastScrollTime;
    
    // Calculate current scroll position
    const currentX = element === window ? window.pageXOffset : scrollElement.scrollLeft;
    const currentY = element === window ? window.pageYOffset : scrollElement.scrollTop;
    
    // Calculate speed (pixels per second)
    const distanceX = currentX - scrollState.x;
    const distanceY = currentY - scrollState.y;
    const speed = timeDiff > 0 ? Math.sqrt(distanceX * distanceX + distanceY * distanceY) / (timeDiff / 1000) : 0;
    
    // Determine direction
    let direction = 'idle';
    if (currentY > scrollState.y) {
      direction = 'down';
    } else if (currentY < scrollState.y) {
      direction = 'up';
    } else if (currentX > scrollState.x) {
      direction = 'right';
    } else if (currentX < scrollState.x) {
      direction = 'left';
    }
    
    // Update state
    scrollState.previousX = scrollState.x;
    scrollState.previousY = scrollState.y;
    scrollState.x = currentX;
    scrollState.y = currentY;
    scrollState.speed = speed;
    
    // Update direction if it changed
    if (scrollState.direction !== direction && direction !== 'idle') {
      const oldDirection = scrollState.direction;
      scrollState.direction = direction;
      
      // Call direction change callback if provided
      if (onScrollDirectionChange) {
        onScrollDirectionChange(direction, oldDirection, { ...scrollState });
      }
    }
    
    // Update scrolling state
    scrollState.isScrolling = true;
    
    // Call the general scroll callback if provided
    if (onScroll) {
      onScroll({ ...scrollState });
    }
    
    // Call the handler callback if provided
    if (handler) {
      handler({ ...scrollState });
    }
    
    lastScrollTime = now;
    
    // Clear any existing scroll end timer
    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer);
    }
    
    // Set a timer to detect scroll end
    if (includeScrollEnd) {
      scrollEndTimer = setTimeout(() => {
        scrollState.isScrolling = false;
        if (onScrollStop) {
          onScrollStop({ ...scrollState });
        }
      }, 150); // 150ms after last scroll event
    }
  }

  // Throttled scroll handler
  function throttledScrollHandler() {
    if (!throttled) {
      throttled = true;
      requestAnimationFrame(() => {
        updateScrollState();
        throttled = false;
      });
    }
  }

  // Add scroll event listener
  scrollElement.addEventListener('scroll', throttledScrollHandler, { passive: true });

  // Function to subscribe to scroll events
  function subscribe(callback) {
    onScroll = callback;
  }

  // Function to subscribe to scroll start events
  function subscribeToScrollStart(callback) {
    onScrollStart = callback;
  }

  // Function to subscribe to scroll stop events
  function subscribeToScrollStop(callback) {
    onScrollStop = callback;
  }

  // Function to subscribe to direction changes
  function subscribeToDirectionChange(callback) {
    onScrollDirectionChange = callback;
  }

  // Function to unsubscribe from all events
  function unsubscribe() {
    onScroll = null;
    onScrollStart = null;
    onScrollStop = null;
    onScrollDirectionChange = null;
  }

  // Function to get current state
  function getState() {
    return { ...scrollState };
  }

  // Function to update options
  function updateOptions(newOptions) {
    Object.assign(options, newOptions);
    if (newOptions.throttleMs) {
      // Reinitialize with new throttle value
      scrollElement.removeEventListener('scroll', throttledScrollHandler);
      throttled = false;
      scrollElement.addEventListener('scroll', throttledScrollHandler, { passive: true });
    }
  }

  // Update initial state
  updateScrollState();

  // Return the API
  return {
    getState,
    subscribe,
    subscribeToScrollStart,
    subscribeToScrollStop,
    subscribeToDirectionChange,
    unsubscribe,
    updateOptions
  };
}

// Hook to detect when elements enter or leave the viewport
function useVisibilityObserver(element, options = {}) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    onChange = null
  } = options;

  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  let isVisible = false;
  let observer = null;

  // Callback for visibility changes
  const handleIntersection = (entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      
      if (onChange) {
        onChange({
          visible: isVisible,
          entry
        });
      }
    });
  };

  // Create the Intersection Observer
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(handleIntersection, {
      threshold,
      root,
      rootMargin
    });

    // Start observing
    observer.observe(targetElement);
  } else {
    // Fallback if Intersection Observer is not supported
    console.warn('Intersection Observer not supported in this browser');
  }

  // Function to get current visibility state
  function isVisibleNow() {
    return isVisible;
  }

  // Function to stop observing
  function disconnect() {
    if (observer) {
      observer.disconnect();
    }
  }

  // Return the API
  return {
    isVisible: isVisibleNow,
    disconnect
  };
}

// Hook to control scroll behavior (smooth scrolling, etc.)
function useScrollController(element = window) {
  const scrollElement = element === window ? 
    (document.documentElement || document.body.parentNode || document.body) : 
    (typeof element === 'string' ? document.querySelector(element) : element);

  // Scroll to a position smoothly
  function smoothScrollTo(x, y, duration = 500) {
    return new Promise((resolve) => {
      const startX = element === window ? window.pageXOffset : scrollElement.scrollLeft;
      const startY = element === window ? window.pageYOffset : scrollElement.scrollTop;
      const endX = x !== undefined ? x : startX;
      const endY = y !== undefined ? y : startY;

      const distanceX = endX - startX;
      const distanceY = endY - startY;

      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) {
          startTime = currentTime;
        }

        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        const currentX = startX + distanceX * easeOutCubic;
        const currentY = startY + distanceY * easeOutCubic;

        if (element === window) {
          window.scrollTo(currentX, currentY);
        } else {
          scrollElement.scrollLeft = currentX;
          scrollElement.scrollTop = currentY;
        }

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(animation);
    });
  }

  // Scroll to element smoothly
  function smoothScrollToElement(targetElement, offset = 0) {
    const target = typeof targetElement === 'string' ? 
      document.querySelector(targetElement) : targetElement;
    
    if (!target) {
      console.error(`Element not found: ${targetElement}`);
      return Promise.reject(new Error(`Element not found: ${targetElement}`));
    }

    const elementTop = target.getBoundingClientRect().top;
    const scrollToY = window.pageYOffset + elementTop - offset;

    return smoothScrollTo(undefined, scrollToY);
  }

  // Disable scrolling
  function disableScroll() {
    if (element === window) {
      // Store the current scroll position
      const scrollX = window.pageXOffset;
      const scrollY = window.pageYOffset;

      // Apply styles to prevent scrolling
      document.body.style.overflow = 'hidden';
      // Keep the page in its current position
      document.body.style.position = 'fixed';
      document.body.style.top = -scrollY + 'px';
      document.body.style.left = -scrollX + 'px';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
    } else {
      scrollElement.style.overflow = 'hidden';
    }
  }

  // Enable scrolling
  function enableScroll() {
    if (element === window) {
      // Get the stored scroll position
      const scrollY = document.body.style.top;
      const scrollX = document.body.style.left;
      
      // Remove the scroll-lock styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      
      // Restore the original scroll position
      window.scrollTo(
        parseInt(scrollX || '0') * -1, 
        parseInt(scrollY || '0') * -1
      );
    } else {
      scrollElement.style.overflow = '';
    }
  }

  // Return the API
  return {
    scrollTo: smoothScrollTo,
    scrollToElement: smoothScrollToElement,
    disableScroll,
    enableScroll
  };
}

// Export the hooks
export { useScrollPosition, useVisibilityObserver, useScrollController };