/**
 * useIntersectionObserver Hook
 * Vanilla JS implementation of intersection observer hook
 * Compatible with jazer-brand.css styling for hook-related utilities
 */

class IntersectionObserverHook {
  constructor() {
    this.observers = new Map(); // Store active observers
    this.elements = new Map();  // Store element references
    this.callbacks = new Map(); // Store callback references
  }

  /**
   * Creates an intersection observer hook
   * @param {Function} callback - Callback function when intersection occurs
   * @param {Object} options - Observer options
   * @param {Array} deps - Dependencies array
   * @returns {Function} Function to observe an element
   */
  create(callback, options = {}, deps = []) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a function for useIntersectionObserver');
    }

    const observerOptions = {
      threshold: options.threshold || 0.1,
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      ...options
    };

    // Create the observer
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        callback(entry, obs);
      });
    }, observerOptions);

    // Store observer reference
    const observerId = `io-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.observers.set(observerId, observer);

    // Return observing function
    const observe = (element) => {
      if (element && element instanceof Element) {
        observer.observe(element);
        return () => {
          observer.unobserve(element);
        };
      } else {
        console.error('Invalid element provided to IntersectionObserverHook.observe');
        return () => {};
      }
    };

    // Add cleanup function
    observe.cleanup = () => {
      observer.disconnect();
      this.observers.delete(observerId);
    };

    return observe;
  }

  /**
   * Use intersection observer to detect when an element enters or exits the viewport
   * @param {Function} callback - Callback function to execute on intersection
   * @param {Object} options - Intersection Observer options
   * @returns {Function} Function to observe an element
   */
  useIntersectionObserver(callback, options = {}) {
    const observerOptions = {
      threshold: options.threshold || [0, 0.25, 0.5, 0.75, 1],
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      ...options
    };

    let observer = null;

    // Only create observer if supported
    if (window.IntersectionObserver) {
      observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          callback({
            isIntersecting: entry.isIntersecting,
            isVisible: entry.intersectionRatio > 0,
            entry: entry,
            observer: obs
          });
        });
      }, observerOptions);
    }

    // Return function to observe an element
    const observe = (element) => {
      if (observer && element && element instanceof Element) {
        observer.observe(element);
        
        // Return unobservation function
        return () => {
          observer.unobserve(element);
        };
      }
      
      // Fallback for non-supported browsers
      if (element && typeof callback === 'function') {
        // Simulate intersection by checking if element is in viewport
        const checkInitialVisibility = () => {
          const rect = element.getBoundingClientRect();
          const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
          
          callback({
            isIntersecting: isInViewport,
            isVisible: isInViewport,
            entry: { target: element },
            observer: null
          });
        };
        
        // Check immediately
        checkInitialVisibility();
        
        // Check periodically
        const intervalId = setInterval(checkInitialVisibility, 100);
        
        // Return cleanup function
        return () => {
          clearInterval(intervalId);
        };
      }
      
      return () => {};
    };

    // Add method to stop observing all elements
    observe.disconnect = () => {
      if (observer) {
        observer.disconnect();
      }
    };

    return observe;
  }

  /**
   * Use hook to trigger lazy loading when element is in viewport
   * @param {Function} loadFunction - Function to execute when element is visible
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element for lazy loading
   */
  useLazyLoad(loadFunction, options = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    };

    let loadedElements = new WeakSet();

    const loadCallback = ({ isIntersecting, entry }) => {
      if (isIntersecting && !loadedElements.has(entry.target)) {
        loadedElements.add(entry.target);
        loadFunction(entry.target);
      }
    };

    return this.useIntersectionObserver(loadCallback, defaultOptions);
  }

  /**
   * Use hook to detect when an element is on screen
   * @param {Object} options - Observer options
   * @returns {Array} Array with [isOnScreen, observerCallback]
   */
  useOnScreen(options = {}) {
    const [isOnScreen, setIsOnScreen] = [false, (newVal) => {}]; // Placeholder for vanilla JS
    let currentIsOnScreen = false;
    
    const observer = this.useIntersectionObserver(
      ({ isIntersecting, isVisible }) => {
        currentIsOnScreen = isIntersecting;
        // In vanilla JS, we can't directly update a state variable
        // But we can dispatch an event to communicate the change
        window.dispatchEvent(new CustomEvent('onScreenChange', {
          detail: { isOnScreen: isIntersecting }
        }));
      },
      options
    );

    return [() => currentIsOnScreen, observer];
  }

  /**
   * Use hook to detect when an element is fully visible in the viewport
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useFullyVisible(callback, options = {}) {
    const observerOptions = {
      threshold: 1, // Fully visible
      ...options
    };

    return this.useIntersectionObserver(
      ({ isIntersecting, entry }) => {
        callback(isIntersecting, entry);
      },
      observerOptions
    );
  }

  /**
   * Use hook to detect when an element is partially visible in the viewport
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  usePartiallyVisible(callback, options = {}) {
    const observerOptions = {
      threshold: [0.1, 0.25, 0.5, 0.75], // At least 10% visible
      ...options
    };

    return this.useIntersectionObserver(
      ({ isIntersecting, entry }) => {
        callback(isIntersecting, entry);
      },
      observerOptions
    );
  }

  /**
   * Use hook to observe multiple elements
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Object} Object with observe and unobserve methods
   */
  useMultipleElements(callback, options = {}) {
    const observer = this.useIntersectionObserver(callback, options);
    
    const observedElements = new Set();
    
    return {
      observe: (element) => {
        if (element && element instanceof Element) {
          observedElements.add(element);
          return observer(element);
        }
        return () => {};
      },
      unobserve: (element) => {
        if (observedElements.has(element)) {
          observedElements.delete(element);
          // In this implementation, we don't have direct unobserve access
          // We can only disconnect the observer entirely
          console.warn('Element unobserving not supported in this implementation');
        }
      },
      disconnect: () => {
        observer.disconnect();
        observedElements.clear();
      },
      getObserved: () => [...observedElements]
    };
  }

  /**
   * Use hook to detect element visibility with custom thresholds
   * @param {number|Array} thresholds - Visibility thresholds
   * @param {Function} callback - Callback function
   * @returns {Function} Function to observe an element
   */
  useVisibility(thresholds, callback) {
    const thresholdsArray = Array.isArray(thresholds) ? thresholds : [thresholds];
    
    return this.useIntersectionObserver(
      ({ entry }) => {
        callback({
          visible: entry.isIntersecting,
          ratio: entry.intersectionRatio,
          entry: entry
        });
      },
      { threshold: thresholdsArray }
    );
  }

  /**
   * Use hook to create a scroll progress indicator
   * @param {Function} callback - Callback function with progress information
   * @returns {Function} Function to observe an element for scroll progress
   */
  useScrollProgress(callback) {
    const updateProgress = ({ entry, observer }) => {
      const { top, bottom, height } = entry.boundingClientRect;
      const { height: rootHeight } = observer.rootBounds || { height: window.innerHeight };
      
      // Calculate visibility progress (0 to 1)
      const totalHeight = rootHeight + height;
      const progress = Math.max(0, Math.min(1, (rootHeight - top) / totalHeight));
      
      callback({
        progress,
        isEntering: entry.intersectionRatio > 0 && entry.isIntersecting,
        isExiting: entry.isIntersecting === false && entry.intersectionRatio === 0,
        entry
      });
    };

    return this.useIntersectionObserver(updateProgress, {
      threshold: Array.from({ length: 101 }, (_, i) => i / 100) // [0, 0.01, 0.02, ..., 1]
    });
  }

  /**
   * Use hook to trigger animations when elements enter the viewport
   * @param {string|Function} animationClass - CSS class name or function to apply animation
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element for animation
   */
  useAnimateOnScroll(animationClass, options = {}) {
    const defaultOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
      ...options
    };

    const animateCallback = ({ isIntersecting, entry }) => {
      if (isIntersecting) {
        if (typeof animationClass === 'string') {
          entry.target.classList.add(animationClass);
        } else if (typeof animationClass === 'function') {
          animationClass(entry.target);
        }
      }
    };

    return this.useIntersectionObserver(animateCallback, defaultOptions);
  }

  /**
   * Use hook to detect when an element scrolls into a specific area
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useScrollIntoView(container, callback, options = {}) {
    const containerElement = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    const scrollCallback = ({ isIntersecting, entry }) => {
      callback({
        isIntersecting,
        container: containerElement,
        entry
      });
    };

    return this.useIntersectionObserver(scrollCallback, {
      root: containerElement,
      ...options
    });
  }

  /**
   * Use hook to detect when an element enters a specific container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Function} onEnter - Callback when entering container
   * @param {Function} onExit - Callback when exiting container
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useContainerIntersection(container, onEnter, onExit, options = {}) {
    const containerElement = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;

    if (!containerElement) {
      console.warn(`Container not found: ${container}`);
      return () => {};
    }

    const containerCallback = ({ isIntersecting, entry }) => {
      if (isIntersecting && onEnter) {
        onEnter(entry);
      } else if (!isIntersecting && onExit) {
        onExit(entry);
      }
    };

    return this.useIntersectionObserver(containerCallback, {
      root: containerElement,
      ...options
    });
  }

  /**
   * Use hook to create an infinite scroll trigger
   * @param {Function} callback - Callback when reaching trigger point
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useInfiniteScrollTrigger(callback, options = {}) {
    const infiniteOptions = {
      rootMargin: options.rootMargin || '0px 0px 300px 0px',
      threshold: options.threshold || 0,
      ...options
    };

    const triggerCallback = ({ isIntersecting, entry }) => {
      if (isIntersecting) {
        callback(entry);
      }
    };

    return this.useIntersectionObserver(triggerCallback, infiniteOptions);
  }

  /**
   * Use hook to detect when an element is near the top of the viewport
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useNearTop(callback, options = {}) {
    const nearTopOptions = {
      rootMargin: options.rootMargin || '0px 0px -75% 0px', // Viewport height - 75%
      threshold: options.threshold || 0,
      ...options
    };

    return this.useIntersectionObserver(
      ({ isIntersecting, entry }) => {
        callback(isIntersecting, entry);
      },
      nearTopOptions
    );
  }

  /**
   * Use hook to detect when an element is near the bottom of the viewport
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useNearBottom(callback, options = {}) {
    const nearBottomOptions = {
      rootMargin: options.rootMargin || '75% 0px 0px 0px', // 75% above viewport
      threshold: options.threshold || 0,
      ...options
    };

    return this.useIntersectionObserver(
      ({ isIntersecting, entry }) => {
        callback(isIntersecting, entry);
      },
      nearBottomOptions
    );
  }

  /**
   * Use hook to observe when an element crosses the horizontal center of the viewport
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useHorizontalCenter(callback, options = {}) {
    const centerOptions = {
      rootMargin: options.rootMargin || '-50% 0px -50% 0px',
      threshold: options.threshold || 0,
      ...options
    };

    return this.useIntersectionObserver(
      ({ isIntersecting, entry }) => {
        callback(isIntersecting, entry);
      },
      centerOptions
    );
  }

  /**
   * Use hook to observe when an element crosses the vertical center of the viewport
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Function} Function to observe an element
   */
  useVerticalCenter(callback, options = {}) {
    const centerOptions = {
      rootMargin: options.rootMargin || '0px -50% 0px -50%',
      threshold: options.threshold || 0,
      ...options
    };

    return this.useIntersectionObserver(
      ({ isIntersecting, entry }) => {
        callback(isIntersecting, entry);
      },
      centerOptions
    );
  }

  /**
   * Creates an element-specific intersection observer
   * @param {HTMLElement} element - Element to observe
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {Object} Observer object with methods
   */
  createSpecificObserver(element, callback, options = {}) {
    if (!element || !(element instanceof Element)) {
      throw new Error('Element must be a valid DOM element');
    }

    const observerInstance = new IntersectionObserver((entries, observer) => {
      const specificEntry = entries.find(entry => entry.target === element);
      if (specificEntry) {
        callback(specificEntry, observer);
      }
    }, options);

    observerInstance.observe(element);

    return {
      element,
      observer: observerInstance,
      stop: () => {
        observerInstance.unobserve(element);
        observerInstance.disconnect();
      }
    };
  }

  /**
   * Adds dynamic styles for intersection observer utilities
   */
  addDynamicStyles() {
    if (document.getElementById('intersection-observer-hook-styles')) return;

    const style = document.createElement('style');
    style.id = 'intersection-observer-hook-styles';
    style.textContent = `
      .intersection-observed {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .intersection-entered {
        opacity: 1;
        transform: translateX(0) translateY(0) scale(1);
      }
      
      .intersection-entering {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      
      .intersection-exited {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      
      .scroll-trigger {
        height: 1px;
        width: 100%;
        opacity: 0;
        position: absolute;
        pointer-events: none;
      }
      
      .lazy-load-placeholder {
        background: var(--bg-darker, #111);
        border: 1px dashed var(--border-default, #4facfe);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys all active observers
   */
  destroy() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    
    this.observers.clear();
    this.elements.clear();
    this.callbacks.clear();
  }
}

// Create instance
const intersectionObserverHook = new IntersectionObserverHook();

/**
 * useWindowScroll hook for vanilla JS
 * Tracks window scroll position with debouncing
 * @param {Function} callback - Callback function with scroll information
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Function to stop watching scroll
 */
function useWindowScroll(callback, delay = 16) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function for useWindowScroll');
  }

  // Throttle the scroll event
  const handleScroll = () => {
    const scrollInfo = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
      percent: {
        x: window.scrollX / (document.documentElement.scrollWidth - window.innerWidth),
        y: window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      },
      direction: {
        x: 0,
        y: 0
      }
    };

    callback(scrollInfo);
  };

  // Debounced scroll handler
  let ticking = false;
  const debouncedScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  // Add scroll listener
  window.addEventListener('scroll', debouncedScroll, { passive: true });

  // Return function to stop watching
  return () => {
    window.removeEventListener('scroll', debouncedScroll);
  };
}

/**
 * useElementScroll hook for vanilla JS
 * Tracks scroll position of a specific element
 * @param {HTMLElement} element - Element to track scroll for
 * @param {Function} callback - Callback function
 * @param {number} delay - Debounce delay
 * @returns {Function} Function to stop watching element scroll
 */
function useElementScroll(element, callback, delay = 16) {
  if (!element) {
    throw new Error('Element must be provided for useElementScroll');
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function for useElementScroll');
  }

  let ticking = false;
  const handleScroll = () => {
    const scrollInfo = {
      x: element.scrollLeft,
      y: element.scrollTop,
      max: {
        x: element.scrollWidth - element.clientWidth,
        y: element.scrollHeight - element.clientHeight
      },
      percent: {
        x: element.scrollLeft / (element.scrollWidth - element.clientWidth),
        y: element.scrollTop / (element.scrollHeight - element.clientHeight)
      }
    };

    callback(scrollInfo);
  };

  const debouncedScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  element.addEventListener('scroll', debouncedScroll, { passive: true });

  return () => {
    element.removeEventListener('scroll', debouncedScroll);
  };
}

/**
 * useMousePosition hook for vanilla JS
 * Tracks mouse position across the document
 * @param {Function} callback - Callback function with mouse position
 * @returns {Function} Function to stop watching mouse position
 */
function useMousePosition(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function for useMousePosition');
  }

  let lastPosition = { x: 0, y: 0 };
  const handleMouseMove = (e) => {
    const newPosition = { x: e.clientX, y: e.clientY };
    const movement = {
      x: e.movementX || e.mozMovementX || e.webkitMovementX || (newPosition.x - lastPosition.x),
      y: e.movementY || e.mozMovementY || e.webkitMovementY || (newPosition.y - lastPosition.y)
    };
    
    callback({
      ...newPosition,
      movement,
      lastPosition
    });
    
    lastPosition = newPosition;
  };

  document.addEventListener('mousemove', handleMouseMove);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
  };
}

/**
 * useResizeObserver hook for vanilla JS
 * Tracks resize changes for an element
 * @param {Function} callback - Callback function with resize information
 * @returns {Function} Function to observe an element for resize
 */
function useResizeObserver(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function for useResizeObserver');
  }

  if (!window.ResizeObserver) {
    console.warn('ResizeObserver not supported in this browser');
    return () => {};
  }

  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.target.getBoundingClientRect();
      
      callback({
        width,
        height,
        entry,
        isResizing: true
      });
    }
  });

  const observe = (element) => {
    if (element && element instanceof Element) {
      resizeObserver.observe(element);
      
      return () => {
        resizeObserver.unobserve(element);
      };
    }
    
    return () => {};
  };

  // Add method to stop observing all elements
  observe.disconnect = () => {
    resizeObserver.disconnect();
  };

  return observe;
}

// Initialize styles
intersectionObserverHook.addDynamicStyles();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    IntersectionObserverHook,
    useIntersectionObserver,
    useWindowScroll,
    useElementScroll,
    useMousePosition,
    useResizeObserver
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.IntersectionObserverHook = IntersectionObserverHook;
  window.useIntersectionObserver = useIntersectionObserver;
  window.useWindowScroll = useWindowScroll;
  window.useElementScroll = useElementScroll;
  window.useMousePosition = useMousePosition;
  window.useResizeObserver = useResizeObserver;
}