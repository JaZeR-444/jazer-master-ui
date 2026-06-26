// Intersection Observer hook for JavaScript

function useIntersectionObserver(element, options = {}) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    triggerOnce = false,
    onIntersect = null,
    onEnter = null,
    onLeave = null
  } = options;

  // Get the element if it's a selector
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (!targetElement) {
    console.error('Target element not found for Intersection Observer');
    return { isIntersecting: false, observe: () => {}, unobserve: () => {} };
  }

  // State variables
  let isIntersecting = false;
  let observer = null;
  let hasIntersected = false;

  // Intersection callback
  const handleIntersection = (entries) => {
    entries.forEach(entry => {
      const currentlyIntersecting = entry.isIntersecting;
      
      // Update internal state
      isIntersecting = currentlyIntersecting;
      
      // Handle entry
      if (currentlyIntersecting) {
        if (onEnter && (!triggerOnce || !hasIntersected)) {
          onEnter(entry);
        }
        
        if (onIntersect && (!triggerOnce || !hasIntersected)) {
          onIntersect(entry);
        }
        
        hasIntersected = true;
      } 
      // Handle exit
      else if (!currentlyIntersecting && isIntersecting) {
        if (onLeave && !triggerOnce) {
          onLeave(entry);
        }
      }
      
      // If triggerOnce and has intersected, unobserve
      if (triggerOnce && hasIntersected && observer) {
        observer.unobserve(targetElement);
        observer.disconnect();
      }
    });
  };

  // Create the Intersection Observer
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold: Array.isArray(threshold) ? threshold : [threshold]
    });

    // Start observing
    observer.observe(targetElement);
  } else {
    console.warn('Intersection Observer not supported in this browser');
    // Fallback behavior for unsupported browsers
    if (onIntersect) {
      // Trigger immediately if the observer isn't supported
      const fallbackEntry = {
        target: targetElement,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: targetElement.getBoundingClientRect(),
        rootBounds: document.documentElement.getBoundingClientRect(),
        intersectionRect: targetElement.getBoundingClientRect()
      };
      onIntersect(fallbackEntry);
    }
  }

  // Function to get current intersection state
  function getIntersectingState() {
    return isIntersecting;
  }

  // Function to get observer instance
  function getObserver() {
    return observer;
  }

  // Function to disconnect observer
  function disconnect() {
    if (observer) {
      observer.disconnect();
    }
  }

  // Function to unobserve a specific element
  function unobserve() {
    if (observer) {
      observer.unobserve(targetElement);
    }
  }

  // Function to observe again (if previously unobserved)
  function observe() {
    if (observer) {
      observer.observe(targetElement);
    }
  }

  // Function to update observer options
  function updateOptions(newOptions) {
    if (observer) {
      observer.disconnect();
      Object.assign(options, newOptions);
      observer = new IntersectionObserver(handleIntersection, {
        root: newOptions.root || options.root,
        rootMargin: newOptions.rootMargin || options.rootMargin,
        threshold: Array.isArray(newOptions.threshold) ? newOptions.threshold : [newOptions.threshold || options.threshold]
      });
      observer.observe(targetElement);
    }
  }

  // Return the API
  return {
    isIntersecting: getIntersectingState,
    observe,
    unobserve,
    disconnect,
    getObserver,
    updateOptions
  };
}

// Hook for lazy loading images
function useLazyLoadImage(imageElement, options = {}) {
  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.01,
    placeholder = null,
    errorImage = null,
    onLoad = null,
    onError = null
  } = options;

  // Get the image element if it's a selector
  const imgElement = typeof imageElement === 'string' ? document.querySelector(imageElement) : imageElement;
  if (!imgElement) {
    console.error('Image element not found for lazy loading');
    return;
  }

  // Store the actual image source in a data attribute
  const actualSrc = imgElement.dataset.src || imgElement.src;
  
  // Set placeholder if provided
  if (placeholder) {
    imgElement.src = placeholder;
  }

  // Create intersection observer
  const observer = useIntersectionObserver(imgElement, {
    root,
    rootMargin,
    threshold,
    triggerOnce: true,
    onIntersect: () => {
      // Create a new image to load the actual source
      const newImg = new Image();
      newImg.src = actualSrc;
      
      newImg.onload = () => {
        // Replace the placeholder with the actual image
        imgElement.src = actualSrc;
        
        if (onLoad) onLoad(imgElement);
      };
      
      newImg.onerror = () => {
        // If there's an error image, use it
        if (errorImage) {
          imgElement.src = errorImage;
        }
        
        if (onError) onError(imgElement);
      };
    }
  });

  // Return the observer for potential cleanup
  return observer;
}

// Hook for infinite scrolling
function useInfiniteScroll(container, loadMore, options = {}) {
  const {
    rootMargin = '0px',
    threshold = 0.8,
    isLoading = false,
    hasMore = true
  } = options;

  // Get the container element if it's a selector
  const scrollContainer = typeof container === 'string' ? document.querySelector(container) : container;
  if (!scrollContainer) {
    console.error('Container element not found for infinite scroll');
    return;
  }

  // Create a sentinel element to observe
  const sentinel = document.createElement('div');
  sentinel.style.height = '20px';
  sentinel.style.width = '100%';
  scrollContainer.appendChild(sentinel);

  // State for loading and data
  let loading = isLoading;
  let hasMoreData = hasMore;

  // Intersection observer for sentinel
  const observer = useIntersectionObserver(sentinel, {
    rootMargin,
    threshold,
    onIntersect: async (entry) => {
      if (loading || !hasMoreData) return;
      
      loading = true;
      
      try {
        const result = await loadMore();
        if (result === false) {
          // If loadMore returns false, there's no more data
          hasMoreData = false;
        }
      } catch (error) {
        console.error('Error loading more data:', error);
      } finally {
        loading = false;
      }
    }
  });

  // Function to update loading state
  function setLoading(newState) {
    loading = newState;
  }

  // Function to update hasMore state
  function setHasMore(newState) {
    hasMoreData = newState;
  }

  // Function to reset the infinite scroll
  function reset() {
    loading = false;
    hasMoreData = true;
  }

  return {
    setLoading,
    setHasMore,
    reset,
    disconnect: observer.disconnect
  };
}

// Hook for scroll spy navigation
function useScrollSpy(navItems, contentSections, options = {}) {
  const {
    rootMargin = '-50%',
    threshold = 0,
    activeClass = 'active',
    onActiveChange = null
  } = options;

  // Convert selectors to elements
  const navElements = typeof navItems === 'string' ? 
    Array.from(document.querySelectorAll(navItems)) : 
    Array.isArray(navItems) ? navItems : [navItems];
    
  const contentElements = typeof contentSections === 'string' ? 
    Array.from(document.querySelectorAll(contentSections)) : 
    Array.isArray(contentSections) ? contentSections : [contentSections];

  // Track the currently active section
  let currentActive = null;

  // Create observers for each content section
  const observers = [];

  // Function to clear active class from all nav items
  function clearActiveClasses() {
    navElements.forEach(item => item.classList.remove(activeClass));
  }

  // Function to set active class on the specified nav item
  function setActiveClass(targetId) {
    clearActiveClasses();
    
    // Find the matching nav item based on the section ID
    const targetNavItem = navElements.find(item => {
      return item.getAttribute('href') === `#${targetId}` ||
             item.dataset.target === targetId;
    });
    
    if (targetNavItem) {
      targetNavItem.classList.add(activeClass);
      if (onActiveChange) {
        onActiveChange(targetId, targetNavItem);
      }
    }
  }

  // Create an observer for each content section
  contentElements.forEach(section => {
    const sectionId = section.id;
    if (!sectionId) {
      console.warn('Content section needs an ID to work with scroll spy');
      return;
    }

    const observer = useIntersectionObserver(section, {
      rootMargin,
      threshold,
      onIntersect: (entry) => {
        if (entry.isIntersecting) {
          // Only set as active if this is the first intersecting element or it has a higher ratio
          if (!currentActive || entry.intersectionRatio > 0.5) {
            currentActive = sectionId;
            setActiveClass(sectionId);
          }
        }
      }
    });
    
    observers.push(observer);
  });

  // Return the API
  return {
    setActive: setActiveClass,
    getCurrentActive: () => currentActive,
    disconnect: () => {
      observers.forEach(observer => observer.disconnect());
    }
  };
}

// Export the hooks
export { 
  useIntersectionObserver, 
  useLazyLoadImage, 
  useInfiniteScroll, 
  useScrollSpy 
};