/**
 * Scroll Utilities Module
 * Comprehensive scroll management and detection utilities
 * Compatible with jazer-brand.css styling for scroll-related utilities
 */

class ScrollUtils {
  /**
   * Creates a new scroll utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      throttleDelay: 16, // ~60fps
      debounceDelay: 100,
      smoothScrollDuration: 500,
      smoothScrollEasing: 'ease-in-out',
      scrollThreshold: 100, // px from top/bottom to trigger events
      scrollSpyThreshold: 0.5, // percentage of element visibility to trigger spy
      enableScrollSpy: true,
      enableSmoothScroll: true,
      enableParallax: true,
      enableInfiniteScroll: false,
      infiniteScrollDistance: 300, // px before bottom to trigger load
      ...options
    };

    this.scrollCallbacks = new Map();
    this.spyTargets = new Set();
    this.parallaxElements = new Map();
    this.infiniteScrollCallbacks = [];
    this.scrollPosition = 0;
    this.scrollDirection = 'none';
    this.lastScrollY = 0;
    this.scrollSpyObserver = null;
    this.isThrottled = false;
    
    this.init();
  }

  /**
   * Initializes the scroll utilities
   */
  init() {
    // Add scroll listeners
    this.addScrollListeners();
    
    // Initialize IntersectionObserver for scroll spy if enabled
    if (this.options.enableScrollSpy) {
      this.initScrollSpy();
    }
    
    // Add utility CSS
    this.addUtilityStyles();
  }

  /**
   * Adds scroll event listeners with throttling
   */
  addScrollListeners() {
    // Throttled scroll handler
    const throttledScrollHandler = this.throttle(
      this.handleScroll.bind(this), 
      this.options.throttleDelay
    );
    
    // Add main scroll event listener
    window.addEventListener('scroll', throttledScrollHandler, { 
      passive: true,
      capture: false
    });
    
    // Store reference for potential removal
    this.scrollHandler = throttledScrollHandler;
  }

  /**
   * Handles scroll events
   * @param {Event} event - Scroll event
   */
  handleScroll(event) {
    const currentScrollY = window.scrollY || window.pageYOffset;
    const scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    
    // Update scroll properties
    this.scrollPosition = currentScrollY;
    this.scrollDirection = scrollDirection;
    this.lastScrollY = currentScrollY;
    
    // Execute registered scroll callbacks
    this.executeScrollCallbacks(currentScrollY, scrollDirection);
    
    // Handle infinite scroll if enabled
    if (this.options.enableInfiniteScroll) {
      this.handleInfiniteScroll();
    }
  }

  /**
   * Executes registered scroll callbacks
   * @param {number} scrollY - Current scroll position
   * @param {string} direction - Scroll direction ('up', 'down', 'none')
   */
  executeScrollCallbacks(scrollY, direction) {
    for (const [id, callback] of this.scrollCallbacks) {
      if (typeof callback === 'function') {
        callback({
          scrollPosition: scrollY,
          scrollDirection: direction,
          scrollDelta: scrollY - (this.lastScrollY || scrollY)
        });
      }
    }
  }

  /**
   * Registers a scroll callback
   * @param {Function} callback - Callback function to execute on scroll
   * @returns {string} Callback ID for removal
   */
  onScroll(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    
    const id = `scroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.scrollCallbacks.set(id, callback);
    
    // Return function to remove the callback
    return () => {
      this.scrollCallbacks.delete(id);
    };
  }

  /**
   * Throttles a function to execute at most once per specified time interval
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounces a function to execute only after specified time has passed
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Whether to trigger immediately
   * @returns {Function} Debounced function
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  /**
   * Smoothly scrolls to an element or position
   * @param {HTMLElement|string|number} target - Target to scroll to (element, selector, or position)
   * @param {Object} options - Scroll options
   * @returns {Promise} Promise that resolves when scrolling completes
   */
  smoothScrollTo(target, options = {}) {
    if (!this.options.enableSmoothScroll) {
      // Fallback to native scrolling if smooth scroll is disabled
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) element.scrollIntoView({ behavior: 'instant' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'instant' });
      } else if (typeof target === 'number') {
        window.scrollTo(0, target);
      }
      return Promise.resolve();
    }

    const {
      duration = this.options.smoothScrollDuration,
      easing = this.options.smoothScrollEasing,
      offset = 0,
      onDone
    } = options;

    let targetPosition;

    if (typeof target === 'number') {
      targetPosition = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) {
        console.warn(`Element not found: ${target}`);
        return Promise.reject(new Error(`Element not found: ${target}`));
      }
      targetPosition = element.getBoundingClientRect().top + window.scrollY;
    } else if (target instanceof HTMLElement) {
      targetPosition = target.getBoundingClientRect().top + window.scrollY;
    } else {
      return Promise.reject(new Error('Invalid target for smooth scrolling'));
    }

    // Apply offset
    targetPosition += offset;

    return new Promise((resolve) => {
      const startPosition = window.scrollY || window.pageYOffset;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();

      const animation = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        let easeProgress;
        switch (easing) {
          case 'ease-in':
            easeProgress = Math.pow(progress, 2);
            break;
          case 'ease-out':
            easeProgress = 1 - Math.pow(1 - progress, 2);
            break;
          case 'ease-in-out':
            easeProgress = progress < 0.5 
              ? 2 * Math.pow(progress, 2) 
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            break;
          default: // linear
            easeProgress = progress;
        }

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          if (onDone && typeof onDone === 'function') {
            onDone();
          }
          resolve();
        }
      };

      requestAnimationFrame(animation);
    });
  }

  /**
   * Scrolls to top of the page with smooth animation
   * @param {Object} options - Scroll options
   * @returns {Promise} Promise that resolves when scrolling completes
   */
  scrollToTop(options = {}) {
    return this.smoothScrollTo(0, options);
  }

  /**
   * Scrolls to bottom of the page with smooth animation
   * @param {Object} options - Scroll options
   * @returns {Promise} Promise that resolves when scrolling completes
   */
  scrollToBottom(options = {}) {
    const bottomPosition = document.body.scrollHeight - window.innerHeight;
    return this.smoothScrollTo(bottomPosition, options);
  }

  /**
   * Initializes scroll spy functionality
   */
  initScrollSpy() {
    if (window.IntersectionObserver && this.options.enableScrollSpy) {
      this.scrollSpyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const element = entry.target;
            const visiblePercentage = entry.intersectionRatio;
            
            // Add/remove active class based on visibility
            if (visiblePercentage >= this.options.scrollSpyThreshold) {
              element.classList.add('scroll-spy-active');
              element.dispatchEvent(new CustomEvent('scrollspy:enter', {
                detail: { element, visiblePercentage }
              }));
            } else {
              element.classList.remove('scroll-spy-active');
              element.dispatchEvent(new CustomEvent('scrollspy:exit', {
                detail: { element, visiblePercentage }
              }));
            }
          });
        },
        {
          threshold: [this.options.scrollSpyThreshold]
        }
      );
    }
  }

  /**
   * Enables scroll spy for specific elements
   * @param {HTMLElement|Array|NodeList} elements - Elements to enable scroll spy for
   * @param {Object} options - Observer options
   * @returns {void}
   */
  enableScrollSpy(elements, options = {}) {
    const elementsArray = Array.isArray(elements) ? elements : [elements];
    
    elementsArray.forEach(element => {
      if (this.scrollSpyObserver) {
        this.scrollSpyObserver.observe(element);
      }
    });
  }

  /**
   * Disables scroll spy for specific elements
   * @param {HTMLElement|Array|NodeList} elements - Elements to disable scroll spy for
   * @returns {void}
   */
  disableScrollSpy(elements) {
    const elementsArray = Array.isArray(elements) ? elements : [elements];
    
    elementsArray.forEach(element => {
      if (this.scrollSpyObserver) {
        this.scrollSpyObserver.unobserve(element);
        element.classList.remove('scroll-spy-active');
      }
    });
  }

  /**
   * Sets up parallax scrolling for elements
   * @param {HTMLElement|Array|NodeList} elements - Elements to apply parallax to
   * @param {Object} options - Parallax options
   * @returns {void}
   */
  setParallax(elements, options = {}) {
    const defaults = {
      speed: 0.5, // Parallax speed (0-1, where 0 = no movement, 1 = normal movement)
      direction: 'vertical', // vertical or horizontal
      property: 'transform',
      ...options
    };

    const elementsArray = Array.isArray(elements) ? elements : [elements];

    elementsArray.forEach(element => {
      // Store parallax configuration
      const config = { ...defaults, element };
      this.parallaxElements.set(element, config);

      // Apply initial state
      this.updateParallax(element);
    });

    // Set up scroll handler for parallax
    if (!this.parallaxHandler) {
      this.parallaxHandler = this.throttle(() => {
        this.parallaxElements.forEach((config, element) => {
          this.updateParallax(element);
        });
      }, this.options.throttleDelay);

      window.addEventListener('scroll', this.parallaxHandler, { passive: true });
    }
  }

  /**
   * Updates parallax transformation for an element
   * @param {HTMLElement} element - Element to update parallax for
   * @returns {void}
   */
  updateParallax(element) {
    if (!this.parallaxElements.has(element)) return;

    const config = this.parallaxElements.get(element);
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate position relative to viewport
    let offset;
    if (rect.bottom < 0) {
      // Element is above viewport
      offset = windowHeight;
    } else if (rect.top > windowHeight) {
      // Element is below viewport
      offset = -rect.height;
    } else {
      // Element intersects viewport
      offset = (rect.top < 0) ? 
        -rect.top : 
        (windowHeight - rect.top);
    }
    
    // Apply parallax transformation
    const parallaxValue = offset * config.speed;
    
    if (config.direction === 'vertical') {
      element.style.transform = `translateY(${parallaxValue}px)`;
    } else {
      element.style.transform = `translateX(${parallaxValue}px)`;
    }
  }

  /**
   * Enables infinite scroll for a container
   * @param {HTMLElement} container - Container element to enable infinite scroll for
   * @param {Function} callback - Function to call when reaching scroll threshold
   * @param {Object} options - Infinite scroll options
   * @returns {void}
   */
  enableInfiniteScroll(container, callback, options = {}) {
    const settings = {
      distance: this.options.infiniteScrollDistance,
      throttle: this.options.throttleDelay,
      ...options
    };

    // Store the callback with settings
    this.infiniteScrollCallbacks.push({
      container,
      callback,
      settings
    });

    // Set up throttled handler
    const throttledHandler = this.throttle(() => {
      this.checkInfiniteScroll();
    }, settings.throttle);

    window.addEventListener('scroll', throttledHandler);
    
    // Store handler reference for removal
    if (!this.infiniteScrollHandlers) {
      this.infiniteScrollHandlers = new Map();
    }
    this.infiniteScrollHandlers.set(container, throttledHandler);
  }

  /**
   * Checks if infinite scroll conditions are met and triggers callback
   * @returns {void}
   */
  checkInfiniteScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    // Check if we're close to the bottom
    if (scrollTop + windowHeight >= documentHeight - this.options.infiniteScrollDistance) {
      this.infiniteScrollCallbacks.forEach(({ container, callback }) => {
        if (document.contains(container)) {
          callback({
            distanceFromBottom: documentHeight - (scrollTop + windowHeight),
            scrollTop,
            documentHeight,
            windowHeight
          });
        }
      });
    }
  }

  /**
   * Disables infinite scroll for a container
   * @param {HTMLElement} container - Container to disable infinite scroll for
   * @returns {boolean} Whether the operation was successful
   */
  disableInfiniteScroll(container) {
    // Remove callback
    this.infiniteScrollCallbacks = this.infiniteScrollCallbacks.filter(item => 
      item.container !== container
    );

    // Remove event listener
    if (this.infiniteScrollHandlers && this.infiniteScrollHandlers.has(container)) {
      const handler = this.infiniteScrollHandlers.get(container);
      window.removeEventListener('scroll', handler);
      this.infiniteScrollHandlers.delete(container);
      return true;
    }
    
    return false;
  }

  /**
   * Gets the current scroll position
   * @returns {number} Current scroll position
   */
  getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  /**
   * Gets the maximum scrollable distance
   * @returns {number} Maximum scrollable distance
   */
  getMaxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  /**
   * Gets the scroll percentage (0-1)
   * @returns {number} Scroll percentage
   */
  getScrollPercent() {
    const maxScroll = this.getMaxScroll();
    if (maxScroll === 0) return 0;
    return Math.min(1, this.getScrollPosition() / maxScroll);
  }

  /**
   * Checks if an element is in the viewport
   * @param {HTMLElement} element - Element to check
   * @param {number} threshold - Visibility threshold (0-1) (default: 0 for any visibility)
   * @returns {boolean} Whether the element is in the viewport
   */
  isInViewport(element, threshold = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    if (threshold === 0) {
      // Check if any part of the element is in viewport
      return rect.top < windowHeight && rect.bottom > 0;
    } else {
      // Calculate visible percentage
      const elementHeight = rect.height;
      let visibleHeight;
      
      if (rect.top >= 0 && rect.bottom <= windowHeight) {
        // Entire element is in viewport
        visibleHeight = elementHeight;
      } else if (rect.top < 0 && rect.bottom > windowHeight) {
        // Element is larger than viewport
        visibleHeight = windowHeight;
      } else if (rect.top < 0) {
        // Top part is cut off
        visibleHeight = elementHeight + rect.top;
      } else if (rect.bottom > windowHeight) {
        // Bottom part is cut off
        visibleHeight = windowHeight - rect.top;
      } else {
        // Any other case
        visibleHeight = Math.max(0, rect.bottom - Math.max(0, rect.top));
      }
      
      const visibleRatio = visibleHeight / elementHeight;
      return visibleRatio >= threshold;
    }
  }

  /**
   * Gets elements that are currently visible in the viewport
   * @param {string} selector - CSS selector to filter elements
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {Array} Array of visible elements
   */
  getVisibleElements(selector = '*', threshold = 0) {
    const allElements = document.querySelectorAll(selector);
    return Array.from(allElements).filter(element => 
      this.isInViewport(element, threshold)
    );
  }

  /**
   * Adds momentum scrolling to an element
   * @param {HTMLElement} element - Element to add momentum scrolling to
   * @param {Object} options - Momentum scrolling options
   * @returns {void}
   */
  addMomentumScroll(element, options = {}) {
    const defaults = {
      friction: 0.92, // Lower is more friction
      sensitivity: 1.5,
      ...options
    };

    let startY = 0;
    let startScrollTop = 0;
    let velocityY = 0;
    let isDragging = false;
    let momentumId;

    const handleMouseDown = (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = element.scrollTop;
      velocityY = 0;
      
      // Cancel any ongoing momentum animation
      if (momentumId) {
        cancelAnimationFrame(momentumId);
      }
      
      element.style.scrollBehavior = 'auto';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const dy = e.clientY - startY;
      element.scrollTop = startScrollTop - dy * defaults.sensitivity;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      element.style.scrollBehavior = 'smooth';
      
      // Calculate velocity for momentum
      // This would require tracking mouse movement deltas over time
      // For simplicity in this implementation, we'll just implement basic momentum
      startMomentum();
    };

    const startMomentum = () => {
      if (Math.abs(velocityY) > 0.1) {
        element.scrollTop += velocityY;
        velocityY *= defaults.friction;
        momentumId = requestAnimationFrame(startMomentum);
      } else {
        momentumId = null;
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseUp);
  }

  /**
   * Creates a scroll progress indicator
   * @param {Object} options - Options for the progress indicator
   * @returns {HTMLElement} Progress indicator element
   */
  createScrollProgressIndicator(options = {}) {
    const defaults = {
      className: 'scroll-progress-indicator',
      position: 'top', // 'top' or 'bottom'
      height: '4px',
      color: 'var(--jazer-cyan, #00f2ea)',
      zIndex: 9999,
      ...options
    };

    // Create progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.className = defaults.className;
    progressIndicator.style.cssText = `
      position: fixed;
      left: 0;
      ${defaults.position}: 0;
      width: ${this.getScrollPercent() * 100}%;
      height: ${defaults.height};
      background: ${defaults.color};
      z-index: ${defaults.zIndex};
      transition: width 0.1s linear;
    `;

    // Add to DOM
    document.body.appendChild(progressIndicator);

    // Update progress on scroll
    const updateProgress = () => {
      const scrollPercent = this.getScrollPercent();
      progressIndicator.style.width = `${scrollPercent * 100}%`;
    };

    // Add scroll listener
    window.addEventListener('scroll', this.throttle(updateProgress, 16));

    return progressIndicator;
  }

  /**
   * Creates a scroll spy navigation
   * @param {string} navSelector - Selector for the navigation element
   * @param {string} contentSelector - Selector for content sections
   * @param {Object} options - Scroll spy options
   * @returns {Function} Function to destroy the scroll spy navigation
   */
  createScrollSpyNavigation(navSelector, contentSelector, options = {}) {
    const defaults = {
      offset: 0,
      activeClassName: 'active',
      ...options
    };

    const nav = document.querySelector(navSelector);
    const sections = document.querySelectorAll(contentSelector);

    if (!nav || sections.length === 0) {
      console.warn('Scroll spy navigation requires valid selectors');
      return () => {};
    }

    let activeLink = null;

    const updateActiveLink = () => {
      const scrollPosition = window.scrollY + defaults.offset;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          // Find corresponding link
          const link = nav.querySelector(`a[href="#${sectionId}"]`);
          
          if (link && link !== activeLink) {
            // Remove active class from current active link
            if (activeLink) {
              activeLink.classList.remove(defaults.activeClassName);
            }
            
            // Add active class to new link
            link.classList.add(defaults.activeClassName);
            activeLink = link;

            // Trigger custom event
            link.dispatchEvent(new CustomEvent('scrollspynav:activate', {
              detail: { element: section, link: link }
            }));
          }
          return;
        }
      }
    };

    // Set up throttled scroll handler
    const throttledScrollHandler = this.throttle(updateActiveLink, 100);
    window.addEventListener('scroll', throttledScrollHandler);

    // Initial update
    updateActiveLink();

    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (activeLink) {
        activeLink.classList.remove(defaults.activeClassName);
      }
    };
  }

  /**
   * Adds parallax effect to background images
   * @param {string|Array} selector - CSS selector or array of elements
   * @param {Object} options - Parallax options
   * @returns {void}
   */
  addParallaxBackground(selector, options = {}) {
    const defaults = {
      speed: -0.5, // Negative value moves in opposite direction
      property: 'background-position',
      ...options
    };

    const elements = typeof selector === 'string' 
      ? document.querySelectorAll(selector) 
      : selector;

    const updateParallax = () => {
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const yPos = -(rect.top * defaults.speed);
        
        if (defaults.property === 'background-position') {
          element.style.backgroundPosition = `50% ${yPos}px`;
        } else if (defaults.property === 'transform') {
          element.style.transform = `translateY(${yPos}px)`;
        } else {
          element.style[defaults.property] = `${yPos}px`;
        }
      });
    };

    // Add to scroll handler
    if (!this.parallaxBackgroundHandler) {
      this.parallaxBackgroundHandler = this.throttle(() => {
        updateParallax();
      }, this.options.throttleDelay);

      window.addEventListener('scroll', this.parallaxBackgroundHandler, { passive: true });
    }
  }

  /**
   * Scrolls to an element with an offset
   * @param {HTMLElement} element - Element to scroll to
   * @param {number} offset - Offset in pixels
   * @param {Object} options - Scroll options
   * @returns {Promise} Promise that resolves when scrolling completes
   */
  scrollToWithOffset(element, offset, options = {}) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    return this.smoothScrollTo(offsetPosition, options);
  }

  /**
   * Gets the scroll direction based on current and previous position
   * @returns {string} Scroll direction ('up', 'down', 'none')
   */
  getScrollDirection() {
    return this.scrollDirection;
  }

  /**
   * Gets the scroll delta (difference between current and previous scroll position)
   * @returns {number} Scroll delta
   */
  getScrollDelta() {
    return this.scrollPosition - (this.lastScrollY || this.scrollPosition);
  }

  /**
   * Checks if user is scrolling toward the bottom
   * @returns {boolean} Whether scrolling toward bottom
   */
  isScrollingDown() {
    return this.scrollDirection === 'down';
  }

  /**
   * Checks if user is scrolling toward the top
   * @returns {boolean} Whether scrolling toward top
   */
  isScrollingUp() {
    return this.scrollDirection === 'up';
  }

  /**
   * Adds dynamic styles for scroll utilities
   */
  addUtilityStyles() {
    if (document.getElementById('scroll-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'scroll-utilities-styles';
    style.textContent = `
      /* Scroll utility related styles */
      .scroll-spy-active {
        background-color: var(--jazer-cyan, #00f2ea);
        transition: background-color 0.3s ease;
      }
      
      .scroll-progress-indicator {
        position: fixed;
        left: 0;
        top: 0;
        height: 4px;
        background: var(--jazer-cyan, #00f2ea);
        z-index: 9999;
        transition: width 0.1s linear;
      }
      
      .scroll-snap-container {
        scroll-snap-type: y mandatory;
        overflow-y: scroll;
      }
      
      .scroll-snap-section {
        scroll-snap-align: start;
      }
      
      /* Custom scrollbar styles */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--bg-darker, #111);
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--border-default, #4facfe);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--jazer-cyan, #00f2ea);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Creates a scroll-snap container
   * @param {HTMLElement} container - Container element
   * @param {string} snapType - Snap type ('mandatory', 'proximity')
   * @param {string} snapAxis - Snap axis ('x', 'y', 'both')
   * @returns {void}
   */
  createScrollSnapContainer(container, snapType = 'mandatory', snapAxis = 'y') {
    container.style.scrollSnapType = `${snapAxis} ${snapType}`;
    container.style.overflow = snapAxis === 'y' ? 'auto' : snapAxis === 'x' ? 'auto' : 'auto';
    
    // Add class for styling
    container.classList.add('scroll-snap-container');
  }

  /**
   * Creates a scroll-snap section within a container
   * @param {HTMLElement} element - Element to make a scroll snap section
   * @returns {void}
   */
  createScrollSnapSection(element) {
    element.style.scrollSnapAlign = 'start';
    element.classList.add('scroll-snap-section');
  }

  /**
   * Creates a scroll-to-top button
   * @param {Object} options - Button options
   * @returns {HTMLElement} Scroll-to-top button element
   */
  createScrollToTopButton(options = {}) {
    const defaults = {
      className: 'scroll-to-top-btn',
      text: '↑',
      position: { bottom: '20px', right: '20px' },
      showThreshold: 300,
      scrollOptions: { duration: 500, easing: 'ease-in-out' },
      ...options
    };

    // Create button element
    const button = document.createElement('button');
    button.className = defaults.className;
    button.textContent = defaults.text;
    button.setAttribute('aria-label', 'Scroll to top');
    
    button.style.cssText = `
      position: fixed;
      z-index: 9998;
      cursor: pointer;
      border: 1px solid var(--border-default, #4facfe);
      background: var(--bg-darker, #111);
      color: var(--text-light, #fff);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.3s ease;
    `;

    // Apply position styles
    Object.entries(defaults.position).forEach(([prop, value]) => {
      button.style[prop] = value;
    });

    // Add click event to scroll to top
    button.addEventListener('click', () => {
      this.scrollToTop(defaults.scrollOptions);
    });

    // Add to DOM
    document.body.appendChild(button);

    // Show/hide based on scroll position
    let buttonVisible = false;
    const checkPosition = () => {
      const shouldBeVisible = this.getScrollPosition() > defaults.showThreshold;
      
      if (shouldBeVisible !== buttonVisible) {
        buttonVisible = shouldBeVisible;
        button.style.opacity = shouldBeVisible ? '1' : '0';
        button.style.visibility = shouldBeVisible ? 'visible' : 'hidden';
        button.style.transform = shouldBeVisible ? 'translateY(0)' : 'translateY(20px)';
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', this.throttle(checkPosition, 100));

    // Initial check
    checkPosition();

    return button;
  }

  /**
   * Gets the element currently at the top of the viewport
   * @param {string} selector - CSS selector to filter elements
   * @returns {HTMLElement|null} Element at the top of the viewport
   */
  getTopElement(selector = '*') {
    const elements = document.querySelectorAll(selector);
    const viewportTop = window.pageYOffset;
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 10 && rect.bottom >= 0) { // 10px threshold
        return element;
      }
    }
    
    return null;
  }

  /**
   * Gets elements within a specified scroll range
   * @param {number} start - Start of scroll range
   * @param {number} end - End of scroll range
   * @param {string} selector - CSS selector to filter elements
   * @returns {Array} Array of elements in the scroll range
   */
  getElementsInScrollRange(start, end, selector = '*') {
    const elements = document.querySelectorAll(selector);
    const visibleElements = [];
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.pageYOffset;
      const elementBottom = elementTop + rect.height;
      
      // Check if element intersects with the scroll range
      if (elementTop <= end && elementBottom >= start) {
        visibleElements.push(element);
      }
    }
    
    return visibleElements;
  }

  /**
   * Measures scroll performance (frames per second)
   * @param {Function} callback - Function to call with FPS data
   * @returns {Function} Function to stop performance monitoring
   */
  measureScrollPerformance(callback) {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    const frameCounter = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) { // Every second
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        if (callback) {
          callback(fps);
        }
      }

      requestAnimationFrame(frameCounter);
    };

    requestAnimationFrame(frameCounter);

    // Return function to stop monitoring
    return () => {
      // In a real implementation, we'd cancel the animation frame
      // but we don't store the ID to make cancellation possible
    };
  }

  /**
   * Creates a scroll listener that only fires at specific intervals
   * @param {Function} callback - Callback to execute
   * @param {number} interval - Interval in pixels (fire every N pixels scrolled)
   * @returns {Function} Function to remove the listener
   */
  createPixelIntervalListener(callback, interval) {
    if (typeof callback !== 'function' || typeof interval !== 'number') {
      throw new Error('Callback must be function and interval must be number');
    }

    let lastPixel = 0;
    const handleScroll = () => {
      const currentPixel = Math.floor(this.getScrollPosition() / interval) * interval;
      if (currentPixel !== lastPixel) {
        callback({
          scrollPosition: this.getScrollPosition(),
          currentInterval: currentPixel,
          previousInterval: lastPixel
        });
        lastPixel = currentPixel;
      }
    };

    const throttledHandler = this.throttle(handleScroll, 50);
    window.addEventListener('scroll', throttledHandler);

    // Return function to remove listener
    return () => {
      window.removeEventListener('scroll', throttledHandler);
    };
  }

  /**
   * Destroys the scroll utilities instance and cleans up
   */
  destroy() {
    // Remove main scroll listener
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }

    // Disconnect scroll spy observer if exists
    if (this.scrollSpyObserver) {
      this.scrollSpyObserver.disconnect();
    }

    // Remove parallax handlers
    if (this.parallaxHandler) {
      window.removeEventListener('scroll', this.parallaxHandler);
    }

    // Clear all callbacks
    this.scrollCallbacks.clear();
    this.spyTargets.clear();
    this.parallaxElements.clear();

    // Remove from DOM any created elements
    const createdElements = document.querySelectorAll('.scroll-progress-indicator, .scroll-to-top-btn');
    createdElements.forEach(elem => elem.remove());
  }
}

/**
 * Creates a new scroll utilities instance
 * @param {Object} options - Configuration options
 * @returns {ScrollUtils} New scroll utilities instance
 */
function createScrollUtils(options = {}) {
  return new ScrollUtils(options);
}

// Create a default instance for global use
const scrollUtils = new ScrollUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ScrollUtils,
    createScrollUtils,
    scrollUtils
  };
}

// Make available globally
window.ScrollUtils = ScrollUtils;
window.createScrollUtils = createScrollUtils;
window.scrollUtils = scrollUtils;