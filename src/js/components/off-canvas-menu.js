/**
 * Off Canvas Menu Component
 * Mobile-friendly slide-in menu that overlays content
 * Compatible with jazer-brand.css styling
 */

class OffCanvasMenu {
  /**
   * Creates a new off-canvas menu component
   * @param {HTMLElement} menuElement - The menu container element
   * @param {Object} options - Configuration options
   */
  constructor(menuElement, options = {}) {
    this.menu = menuElement;
    this.options = {
      position: 'left', // 'left', 'right', 'top', 'bottom'
      width: '300px',
      height: '300px',
      overlay: true,
      closeOnClickOutside: true,
      closeOnEscape: true,
      animationDuration: 300,
      swipeToClose: true,
      showCloseButton: true,
      zIndex: 1000,
      ...options
    };

    this.isOpen = false;
    this.overlayElement = null;
    this.closeButton = null;
    this.startSwipePosition = 0;
    this.isSwiping = false;

    this.init();
  }

  /**
   * Initializes the off-canvas menu
   */
  init() {
    // Set up the menu structure
    this.setupMenu();

    // Bind events
    this.bindEvents();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the menu structure
   */
  setupMenu() {
    // Add menu classes
    this.menu.classList.add('off-canvas-menu');
    this.menu.classList.add(`off-canvas-menu-${this.options.position}`);
    this.menu.style.position = 'fixed';
    this.menu.style.zIndex = this.options.zIndex;
    this.menu.style.display = 'none';
    this.menu.setAttribute('aria-hidden', 'true');
    this.menu.setAttribute('aria-label', 'Off-canvas menu');

    // Set initial position based on position option
    this.setPositionStyles();

    // Add close button if enabled
    if (this.options.showCloseButton) {
      this.closeButton = document.createElement('button');
      this.closeButton.classList.add('off-canvas-close');
      this.closeButton.innerHTML = '&times;';
      this.closeButton.setAttribute('aria-label', 'Close menu');
      this.menu.appendChild(this.closeButton);
    }

    // Create overlay if enabled
    if (this.options.overlay) {
      this.overlayElement = document.createElement('div');
      this.overlayElement.classList.add('off-canvas-overlay');
      this.overlayElement.style.display = 'none';
      this.overlayElement.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.overlayElement);
    }
  }

  /**
   * Sets position-specific styles
   */
  setPositionStyles() {
    // Reset all position styles
    this.menu.style.left = '';
    this.menu.style.right = '';
    this.menu.style.top = '';
    this.menu.style.bottom = '';
    this.menu.style.width = '';
    this.menu.style.height = '';

    // Set styles based on position
    switch (this.options.position) {
      case 'left':
        this.menu.style.left = `-${this.options.width}`;
        this.menu.style.top = '0';
        this.menu.style.width = this.options.width;
        this.menu.style.height = '100%';
        this.menu.style.transform = 'translateX(-100%)';
        break;
      case 'right':
        this.menu.style.right = `-${this.options.width}`;
        this.menu.style.top = '0';
        this.menu.style.width = this.options.width;
        this.menu.style.height = '100%';
        this.menu.style.transform = 'translateX(100%)';
        break;
      case 'top':
        this.menu.style.top = `-${this.options.height}`;
        this.menu.style.left = '0';
        this.menu.style.width = '100%';
        this.menu.style.height = this.options.height;
        this.menu.style.transform = 'translateY(-100%)';
        break;
      case 'bottom':
        this.menu.style.bottom = `-${this.options.height}`;
        this.menu.style.left = '0';
        this.menu.style.width = '100%';
        this.menu.style.height = this.options.height;
        this.menu.style.transform = 'translateY(100%)';
        break;
    }

    // Set transition
    this.menu.style.transition = `transform ${this.options.animationDuration}ms ease`;
  }

  /**
   * Binds events for the menu
   */
  bindEvents() {
    // Close button event
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    // Click outside to close
    if (this.options.closeOnClickOutside) {
      document.addEventListener('click', (e) => {
        if (!this.menu.contains(e.target) && 
            (!this.overlayElement || e.target === this.overlayElement)) {
          this.close();
        }
      });
    }

    // Escape key to close
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    // Swipe events for mobile
    if (this.options.swipeToClose) {
      this.bindSwipeEvents();
    }
  }

  /**
   * Binds swipe events for mobile gestures
   */
  bindSwipeEvents() {
    // Touch events
    this.menu.addEventListener('touchstart', (e) => {
      this.startSwipe(e.touches[0]);
    });

    this.menu.addEventListener('touchmove', (e) => {
      this.swipe(e.touches[0]);
    });

    this.menu.addEventListener('touchend', () => {
      this.endSwipe();
    });

    // Mouse events for desktop testing
    this.menu.addEventListener('mousedown', (e) => {
      this.startSwipe(e);
      document.addEventListener('mousemove', this.swipe.bind(this));
      document.addEventListener('mouseup', this.endSwipe.bind(this));
    });
  }

  /**
   * Starts swipe tracking
   * @param {TouchEvent|MouseEvent} e - Touch or mouse event
   */
  startSwipe(e) {
    this.isSwiping = true;
    this.startSwipePosition = this.options.position === 'left' || this.options.position === 'right' 
      ? e.clientX 
      : e.clientY;
    
    // Add active class for visual feedback
    this.menu.classList.add('swiping');
  }

  /**
   * Handles swipe movement
   * @param {TouchEvent|MouseEvent} e - Touch or mouse event
   */
  swipe(e) {
    if (!this.isSwiping) return;

    const currentPosition = this.options.position === 'left' || this.options.position === 'right' 
      ? e.clientX 
      : e.clientY;
    
    const delta = currentPosition - this.startSwipePosition;
    
    // Calculate new position based on direction and position
    let translateValue;
    switch (this.options.position) {
      case 'left':
        translateValue = Math.min(0, delta); // Only allow swiping right
        break;
      case 'right':
        translateValue = Math.max(0, delta); // Only allow swiping left
        break;
      case 'top':
        translateValue = Math.min(0, delta); // Only allow swiping down
        break;
      case 'bottom':
        translateValue = Math.max(0, delta); // Only allow swiping up
        break;
    }

    // Apply transformation
    if (this.options.position === 'left' || this.options.position === 'right') {
      this.menu.style.transform = `translateX(${translateValue}px)`;
    } else {
      this.menu.style.transform = `translateY(${translateValue}px)`;
    }
  }

  /**
   * Ends swipe tracking and decides whether to close or return to open position
   */
  endSwipe() {
    if (!this.isSwiping) return;

    this.isSwiping = false;
    this.menu.classList.remove('swiping');

    // Calculate if swipe was significant enough to close
    const transformValue = this.getCurrentTransformValue();
    const threshold = this.options.position === 'left' || this.options.position === 'right' 
      ? this.menu.offsetWidth * 0.3  // 30% width
      : this.menu.offsetHeight * 0.3; // 30% height

    const shouldClose = Math.abs(transformValue) > threshold;

    if (shouldClose) {
      this.close();
    } else {
      // Return to open position
      this.menu.style.transform = 'translateX(0)' || 'translateY(0)';
    }

    // Remove document event listeners
    document.removeEventListener('mousemove', this.swipe);
    document.removeEventListener('mouseup', this.endSwipe);
  }

  /**
   * Gets current transform value
   * @returns {number} Current transform value in pixels
   */
  getCurrentTransformValue() {
    const transform = this.menu.style.transform;
    const match = transform.match(/translate(X|Y)\(([-\d.]+)px\)/);
    return match ? parseFloat(match[2]) : 0;
  }

  /**
   * Opens the menu
   */
  open() {
    if (this.isOpen) return;

    // Set initial position for animation
    this.menu.style.display = 'block';
    
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
      // Trigger reflow for animation
      this.overlayElement.offsetHeight;
      this.overlayElement.classList.add('show');
    }

    // Trigger reflow for animation
    this.menu.offsetHeight;
    
    // Animate to open position
    this.menu.style.transform = 'translateX(0) translateY(0)';
    
    this.isOpen = true;
    this.menu.setAttribute('aria-hidden', 'false');
    
    // Disable body scroll when menu is open
    document.body.style.overflow = 'hidden';

    // Trigger custom event
    this.menu.dispatchEvent(new CustomEvent('menuopen', {
      detail: { position: this.options.position }
    }));
  }

  /**
   * Closes the menu
   */
  close() {
    if (!this.isOpen) return;

    // Animate to closed position
    switch (this.options.position) {
      case 'left':
        this.menu.style.transform = 'translateX(-100%)';
        break;
      case 'right':
        this.menu.style.transform = 'translateX(100%)';
        break;
      case 'top':
        this.menu.style.transform = 'translateY(-100%)';
        break;
      case 'bottom':
        this.menu.style.transform = 'translateY(100%)';
        break;
    }

    // Handle overlay
    if (this.overlayElement) {
      this.overlayElement.classList.remove('show');
      setTimeout(() => {
        this.overlayElement.style.display = 'none';
      }, this.options.animationDuration);
    }

    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.menu.style.display = 'none';
      this.isOpen = false;
      this.menu.setAttribute('aria-hidden', 'true');
      
      // Re-enable body scroll
      document.body.style.overflow = '';
    }, this.options.animationDuration);

    // Trigger custom event
    this.menu.dispatchEvent(new CustomEvent('menuclose', {
      detail: { position: this.options.position }
    }));
  }

  /**
   * Toggles the menu open/closed state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Checks if the menu is currently open
   * @returns {boolean} Whether the menu is open
   */
  isOpen() {
    return this.isOpen;
  }

  /**
   * Updates the menu position
   * @param {string} position - New position ('left', 'right', 'top', 'bottom')
   */
  setPosition(position) {
    if (this.options.position === position) return;

    // Store current state
    const wasOpen = this.isOpen;

    // Close menu before changing position
    if (wasOpen) {
      this.close();
    }

    // Update position
    this.options.position = position;

    // Reapply position styles
    this.setPositionStyles();

    // Reopen if it was open
    if (wasOpen) {
      // Small delay to allow re-rendering
      setTimeout(() => {
        this.open();
      }, 50);
    }
  }

  /**
   * Updates the menu size
   * @param {string} size - New size (width for left/right, height for top/bottom)
   */
  setSize(size) {
    if (this.options.position === 'left' || this.options.position === 'right') {
      this.options.width = size;
      this.menu.style.width = size;
    } else {
      this.options.height = size;
      this.menu.style.height = size;
    }
  }

  /**
   * Changes the menu theme
   * @param {string} theme - New theme class to add
   */
  setTheme(theme) {
    // Remove old theme classes
    const themeClasses = Array.from(this.menu.classList).filter(cls => cls.startsWith('off-canvas-theme-'));
    themeClasses.forEach(cls => this.menu.classList.remove(cls));
    
    // Add new theme class
    this.menu.classList.add(`off-canvas-theme-${theme}`);
  }

  /**
   * Adds dynamic styles for the off-canvas menu
   */
  addDynamicStyles() {
    if (document.getElementById('off-canvas-menu-styles')) return;

    const style = document.createElement('style');
    style.id = 'off-canvas-menu-styles';
    style.textContent = `
      .off-canvas-menu {
        background: var(--bg-dark, #000);
        border: 1px solid var(--border-lighter, #222);
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        overflow-y: auto;
        box-sizing: border-box;
      }
      
      .off-canvas-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: var(--text-light, #fff);
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 1001;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      
      .off-canvas-close:hover {
        background: var(--bg-darker, #111);
      }
      
      .off-canvas-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all ${this.options.animationDuration}ms ease;
      }
      
      .off-canvas-overlay.show {
        opacity: 1;
        visibility: visible;
      }
      
      /* Position-specific styles */
      .off-canvas-menu-left {
        border-right: 1px solid var(--border-default, #4facfe);
      }
      
      .off-canvas-menu-right {
        border-left: 1px solid var(--border-default, #4facfe);
      }
      
      .off-canvas-menu-top {
        border-bottom: 1px solid var(--border-default, #4facfe);
      }
      
      .off-canvas-menu-bottom {
        border-top: 1px solid var(--border-default, #4facfe);
      }
      
      /* Swiping state */
      .off-canvas-menu.swiping {
        transition: none;
      }
      
      /* Menu content styling */
      .off-canvas-menu-content {
        padding: 1rem;
      }
      
      .off-canvas-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .off-canvas-menu li {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-lighter, #222);
      }
      
      .off-canvas-menu a {
        color: var(--text-light, #fff);
        text-decoration: none;
        display: block;
        padding: 0.5rem;
        transition: background-color 0.2s ease;
      }
      
      .off-canvas-menu a:hover {
        background: var(--bg-darker, #111);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the off-canvas menu and cleans up
   */
  destroy() {
    // Close menu if open
    if (this.isOpen) {
      this.close();
    }

    // Remove event listeners would normally be done here

    // Remove overlay if it exists
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }

    // Reset styles
    this.menu.style.position = '';
    this.menu.style.zIndex = '';
    this.menu.style.display = '';
    this.menu.style.transition = '';
    this.menu.style.transform = '';
    
    // Remove classes
    this.menu.classList.remove('off-canvas-menu');
    this.menu.classList.remove('off-canvas-menu-left');
    this.menu.classList.remove('off-canvas-menu-right');
    this.menu.classList.remove('off-canvas-menu-top');
    this.menu.classList.remove('off-canvas-menu-bottom');
  }
}

/**
 * Initializes all off-canvas menus on the page
 * @param {HTMLElement|Document} container - Container to search for off-canvas menus
 * @returns {Array<OffCanvasMenu>} Array of initialized off-canvas menu instances
 */
function initOffCanvasMenus(container = document) {
  const menus = container.querySelectorAll('.off-canvas-menu, [data-off-canvas-menu], nav[data-off-canvas]');
  const instances = [];

  menus.forEach(menu => {
    if (!menu.hasAttribute('data-off-canvas-menu-initialized')) {
      menu.setAttribute('data-off-canvas-menu-initialized', 'true');

      // Get options from data attributes
      const options = {
        position: menu.dataset.position || 'left',
        width: menu.dataset.width || '300px',
        height: menu.dataset.height || '300px',
        overlay: menu.dataset.overlay !== 'false',
        closeOnClickOutside: menu.dataset.closeOnClickOutside !== 'false',
        closeOnEscape: menu.dataset.closeOnEscape !== 'false',
        animationDuration: parseInt(menu.dataset.animationDuration) || 300,
        swipeToClose: menu.dataset.swipeToClose !== 'false',
        showCloseButton: menu.dataset.showCloseButton !== 'false',
        zIndex: parseInt(menu.dataset.zIndex) || 1000
      };

      const instance = new OffCanvasMenu(menu, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Helper function to open a menu by selector
 * @param {string} selector - CSS selector for the menu
 */
function openOffCanvasMenu(selector) {
  const menuElement = document.querySelector(selector);
  if (menuElement && menuElement.offCanvasMenuInstance) {
    menuElement.offCanvasMenuInstance.open();
  } else {
    // If no instance exists, try to initialize it
    const menu = new OffCanvasMenu(menuElement);
    menu.open();
  }
}

/**
 * Helper function to close a menu by selector
 * @param {string} selector - CSS selector for the menu
 */
function closeOffCanvasMenu(selector) {
  const menuElement = document.querySelector(selector);
  if (menuElement && menuElement.offCanvasMenuInstance) {
    menuElement.offCanvasMenuInstance.close();
  }
}

/**
 * Auto-initialize off-canvas menus when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const instances = initOffCanvasMenus();
    
    // Store instances on elements for later access
    instances.forEach((instance, index) => {
      const menuElement = instance.menu;
      menuElement.offCanvasMenuInstance = instance;
    });
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    OffCanvasMenu, 
    initOffCanvasMenus,
    openOffCanvasMenu,
    closeOffCanvasMenu
  };
}

// Also make it available globally
window.OffCanvasMenu = OffCanvasMenu;
window.initOffCanvasMenus = initOffCanvasMenus;
window.openOffCanvasMenu = openOffCanvasMenu;
window.closeOffCanvasMenu = closeOffCanvasMenu;