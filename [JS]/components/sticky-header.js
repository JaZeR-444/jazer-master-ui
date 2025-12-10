/**
 * Sticky Header Component
 * Responsive sticky header that remains visible while scrolling
 * Compatible with jazer-brand.css styling
 */

class StickyHeader {
  /**
   * Creates a new sticky header component
   * @param {HTMLElement} headerElement - The header container element
   * @param {Object} options - Configuration options
   */
  constructor(headerElement, options = {}) {
    this.header = headerElement;
    this.options = {
      hideOnScroll: true,
      hideOffset: 100, // Hide header when scrolling down past this offset
      showOnUpScroll: true,
      animationDuration: 300,
      throttleDelay: 16, // ~60fps
      shadowOnScroll: true,
      backgroundColorOnScroll: null,
      zIndex: 1000,
      ...options
    };

    this.isVisible = true;
    this.lastScrollY = 0;
    this.currentScrollY = 0;
    this.isThrottled = false;
    this.observer = null;

    this.init();
  }

  /**
   * Initializes the sticky header
   */
  init() {
    // Set up the header structure
    this.setupHeader();

    // Bind events
    this.bindEvents();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the header structure
   */
  setupHeader() {
    // Add header classes
    this.header.classList.add('sticky-header');
    
    // Set initial styles
    this.header.style.position = 'sticky';
    this.header.style.top = '0';
    this.header.style.zIndex = this.options.zIndex;
    this.header.style.transition = `all ${this.options.animationDuration}ms ease`;
    
    // Add shadow class if enabled
    if (this.options.shadowOnScroll) {
      this.header.classList.add('sticky-header-shadow');
    }
    
    // Store original styles
    this.originalStyles = {
      backgroundColor: this.header.style.backgroundColor,
      boxShadow: this.header.style.boxShadow
    };
  }

  /**
   * Binds events for the header
   */
  bindEvents() {
    // Throttled scroll event
    window.addEventListener('scroll', this.throttledScrollHandler.bind(this), { passive: true });
    
    // Resize event to handle responsive changes
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
  }

  /**
   * Throttled scroll handler to improve performance
   */
  throttledScrollHandler() {
    if (this.isThrottled) return;
    
    this.isThrottled = true;
    
    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      this.handleScroll();
      setTimeout(() => {
        this.isThrottled = false;
      }, this.options.throttleDelay);
    });
  }

  /**
   * Handles scroll events
   */
  handleScroll() {
    this.currentScrollY = window.scrollY || window.pageYOffset;
    
    // Determine scroll direction
    const scrollDirection = this.currentScrollY > this.lastScrollY ? 'down' : 'up';
    
    // Update header appearance based on scroll
    this.updateHeaderOnScroll(scrollDirection);
    
    // Store current position for next comparison
    this.lastScrollY = this.currentScrollY;
  }

  /**
   * Updates header appearance based on scroll direction
   * @param {string} direction - Scroll direction ('up' or 'down')
   */
  updateHeaderOnScroll(direction) {
    // Update shadow based on scroll position
    const shouldShowShadow = this.currentScrollY > 5;
    
    if (this.options.shadowOnScroll) {
      this.header.classList.toggle('sticky-header-scrolled', shouldShowShadow);
    }
    
    // Update background color on scroll
    if (this.options.backgroundColorOnScroll) {
      if (this.currentScrollY > 5) {
        this.header.style.backgroundColor = this.options.backgroundColorOnScroll;
      } else {
        this.header.style.backgroundColor = this.originalStyles.backgroundColor;
      }
    }
    
    // Handle header visibility based on scroll direction
    if (this.options.hideOnScroll) {
      if (direction === 'down' && this.currentScrollY > this.options.hideOffset && this.isVisible) {
        this.hideHeader();
      } else if (direction === 'up' && this.currentScrollY <= this.options.hideOffset && !this.isVisible) {
        this.showHeader();
      } else if (this.options.showOnUpScroll && direction === 'up' && this.currentScrollY > this.options.hideOffset) {
        this.showHeader();
      }
    }
  }

  /**
   * Hides the header
   */
  hideHeader() {
    this.isVisible = false;
    this.header.style.transform = 'translateY(-100%)';
    
    // Add hidden class for additional styling
    this.header.classList.add('sticky-header-hidden');
    this.header.classList.remove('sticky-header-visible');
    
    // Trigger custom event
    this.header.dispatchEvent(new CustomEvent('headerhide', {
      detail: { scrollPosition: this.currentScrollY }
    }));
  }

  /**
   * Shows the header
   */
  showHeader() {
    this.isVisible = true;
    this.header.style.transform = 'translateY(0)';
    
    // Add visible class for additional styling
    this.header.classList.add('sticky-header-visible');
    this.header.classList.remove('sticky-header-hidden');
    
    // Trigger custom event
    this.header.dispatchEvent(new CustomEvent('headershow', {
      detail: { scrollPosition: this.currentScrollY }
    }));
  }

  /**
   * Handles resize events
   */
  handleResize() {
    // Re-evaluate header visibility on resize if needed
    // For example, if viewport size changes significantly
    if (this.currentScrollY > window.innerHeight) {
      // If user has scrolled down significantly, check if we need to update visibility
      const scrollDirection = this.currentScrollY > this.lastScrollY ? 'down' : 'up';
      this.updateHeaderOnScroll(scrollDirection);
    }
  }

  /**
   * Gets the header's visibility status
   * @returns {boolean} Whether the header is currently visible
   */
  isVisible() {
    return this.isVisible;
  }

  /**
   * Force shows the header
   */
  forceShow() {
    this.isVisible = true;
    this.header.style.transform = 'translateY(0)';
    this.header.classList.add('sticky-header-visible');
    this.header.classList.remove('sticky-header-hidden');
  }

  /**
   * Force hides the header
   */
  forceHide() {
    this.isVisible = false;
    this.header.style.transform = 'translateY(-100%)';
    this.header.classList.add('sticky-header-hidden');
    this.header.classList.remove('sticky-header-visible');
  }

  /**
   * Updates the header's options
   * @param {Object} newOptions - New options to update
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Update zIndex if changed
    if (newOptions.zIndex) {
      this.header.style.zIndex = newOptions.zIndex;
    }
    
    // Update animation duration if changed
    if (newOptions.animationDuration) {
      this.header.style.transition = `all ${newOptions.animationDuration}ms ease`;
    }
  }

  /**
   * Gets the current scroll position
   * @returns {number} Current scroll position
   */
  getCurrentScrollPosition() {
    return this.currentScrollY;
  }

  /**
   * Adds dynamic styles for the sticky header
   */
  addDynamicStyles() {
    if (document.getElementById('sticky-header-styles')) return;

    const style = document.createElement('style');
    style.id = 'sticky-header-styles';
    style.textContent = `
      .sticky-header {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        background: var(--bg-dark, #000);
        border-bottom: 1px solid var(--border-lighter, #222);
        transition: all 0.3s ease;
        z-index: 1000;
      }
      
      .sticky-header-shadow {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .sticky-header-scrolled {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      
      .sticky-header-hidden {
        transform: translateY(-100%);
      }
      
      .sticky-header-visible {
        transform: translateY(0);
      }
      
      /* Additional styling for header content */
      .sticky-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        width: 100%;
      }
      
      /* Animation for smoother transitions */
      .sticky-header {
        will-change: transform;
      }
      
      /* Responsive considerations */
      @media (max-width: 768px) {
        .sticky-header {
          padding: 0.5rem;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the sticky header and cleans up
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.throttledScrollHandler);
    window.removeEventListener('resize', this.handleResize);
    
    // Reset styles
    this.header.style.position = '';
    this.header.style.top = '';
    this.header.style.zIndex = '';
    this.header.style.transition = '';
    this.header.style.transform = '';
    
    // Remove classes
    this.header.classList.remove('sticky-header');
    this.header.classList.remove('sticky-header-shadow');
    this.header.classList.remove('sticky-header-scrolled');
    this.header.classList.remove('sticky-header-hidden');
    this.header.classList.remove('sticky-header-visible');
    
    // Reset background if we changed it
    if (this.options.backgroundColorOnScroll && this.originalStyles.backgroundColor) {
      this.header.style.backgroundColor = this.originalStyles.backgroundColor;
    }
  }
}

/**
 * Initializes all sticky headers on the page
 * @param {HTMLElement|Document} container - Container to search for sticky headers
 * @returns {Array<StickyHeader>} Array of initialized sticky header instances
 */
function initStickyHeaders(container = document) {
  const headers = container.querySelectorAll('.sticky-header, [data-sticky-header], header');
  const instances = [];

  headers.forEach(header => {
    if (!header.hasAttribute('data-sticky-header-initialized')) {
      header.setAttribute('data-sticky-header-initialized', 'true');

      // Get options from data attributes
      const options = {
        hideOnScroll: header.dataset.hideOnScroll !== 'false',
        hideOffset: parseInt(header.dataset.hideOffset) || 100,
        showOnUpScroll: header.dataset.showOnUpScroll !== 'false',
        animationDuration: parseInt(header.dataset.animationDuration) || 300,
        throttleDelay: parseInt(header.dataset.throttleDelay) || 16,
        shadowOnScroll: header.dataset.shadowOnScroll !== 'false',
        backgroundColorOnScroll: header.dataset.backgroundColorOnScroll || null,
        zIndex: parseInt(header.dataset.zIndex) || 1000
      };

      const instance = new StickyHeader(header, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize sticky headers when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initStickyHeaders();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StickyHeader, initStickyHeaders };
}

// Also make it available globally
window.StickyHeader = StickyHeader;
window.initStickyHeaders = initStickyHeaders;