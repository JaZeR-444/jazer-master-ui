/**
 * Dropdown Menu Component
 * A fully accessible and customizable dropdown menu system
 * Compatible with jazer-brand.css styling
 */

class DropdownMenu {
  /**
   * Creates a new dropdown menu
   * @param {HTMLElement} triggerElement - The element that triggers the dropdown
   * @param {Object} options - Configuration options for the dropdown
   */
  constructor(triggerElement, options = {}) {
    this.trigger = triggerElement;
    this.options = {
      closeOnClickOutside: true,
      closeOnEscape: true,
      animationDuration: 300,
      position: 'bottom-start', // bottom-start, bottom-end, top-start, top-end
      ...options
    };
    
    this.dropdown = null;
    this.isOpen = false;
    
    this.init();
  }

  /**
   * Initializes the dropdown menu
   */
  init() {
    this.dropdown = this.findOrCreateDropdown();
    if (!this.dropdown) return;
    
    // Initially hide the dropdown
    this.dropdown.style.display = 'none';
    
    // Set up accessibility attributes
    this.setupAccessibility();
    
    // Bind event listeners
    this.bindEvents();
  }

  /**
   * Finds the dropdown menu element
   * @returns {HTMLElement} The dropdown menu element
   */
  findOrCreateDropdown() {
    // Look for dropdown specified in data attribute
    const dropdownId = this.trigger.dataset.dropdownMenuId;
    if (dropdownId) {
      return document.getElementById(dropdownId);
    }
    
    // Look for dropdown as next sibling or within trigger
    if (this.trigger.nextElementSibling?.classList.contains('dropdown-menu')) {
      return this.trigger.nextElementSibling;
    }
    
    // Look within the trigger element
    const dropdownInTrigger = this.trigger.querySelector('.dropdown-menu');
    if (dropdownInTrigger) {
      return dropdownInTrigger;
    }
    
    // Try to find dropdown by trigger ID convention
    const triggerId = this.trigger.id;
    if (triggerId) {
      return document.querySelector(`#${triggerId.replace(/-/g, '_')}_menu, #${triggerId}-menu, #${triggerId}Menu`);
    }
    
    return null;
  }

  /**
   * Sets up accessibility attributes
   */
  setupAccessibility() {
    // Generate IDs if not present
    if (!this.trigger.id) {
      this.trigger.id = this.generateId();
    }
    if (!this.dropdown.id) {
      this.dropdown.id = `${this.trigger.id}-menu`;
    }
    
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('role', 'button');
    this.trigger.setAttribute('tabindex', '0');
    
    if (this.dropdown) {
      this.dropdown.setAttribute('role', 'menu');
      this.dropdown.setAttribute('aria-labelledby', this.trigger.id);
      this.dropdown.setAttribute('aria-hidden', 'true');
      
      // Add role and tabindex to menu items
      const items = this.dropdown.querySelectorAll('a, button, [role="menuitem"]');
      items.forEach(item => {
        if (item.closest('.dropdown-header, .dropdown-divider, .dropdown-section')) {
          // Skip items inside headers, dividers, or sections
          return;
        }
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '-1');
      });
      
      // Add role to headers if present
      const headers = this.dropdown.querySelectorAll('.dropdown-header');
      headers.forEach(header => {
        header.setAttribute('role', 'heading');
        header.setAttribute('aria-level', '3');
      });
    }
  }

  /**
   * Binds event listeners for the dropdown
   */
  bindEvents() {
    // Toggle dropdown on trigger click
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    
    // Keyboard navigation for trigger
    this.trigger.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.toggle();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.open();
          this.focusFirstItem();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.open();
          this.focusLastItem();
          break;
        case 'Escape':
          this.close();
          break;
      }
    });
    
    // Handle clicks inside dropdown
    if (this.dropdown) {
      this.dropdown.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-close-menu') && e.target.dataset.closeMenu !== 'false') {
          setTimeout(() => this.close(), 10);
        }
      });
      
      // Keyboard navigation inside dropdown
      this.dropdown.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;
        
        const items = this.dropdown.querySelectorAll('[role="menuitem"]');
        if (!items.length) return;
        
        const currentItem = document.activeElement;
        const currentIndex = Array.from(items).findIndex(item => 
          item === currentItem
        );
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
            items[prevIndex].focus();
            break;
          case 'Home':
            e.preventDefault();
            items[0].focus();
            break;
          case 'End':
            e.preventDefault();
            items[items.length - 1].focus();
            break;
          case 'Escape':
            e.preventDefault();
            this.close();
            this.trigger.focus();
            break;
          case 'Tab':
            this.close();
            break;
        }
      });
    }
    
    // Click outside to close
    if (this.options.closeOnClickOutside) {
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.trigger.contains(e.target) && !this.dropdown.contains(e.target)) {
          this.close();
        }
      });
    }

    // Escape key to close
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
          this.trigger.focus();
        }
      });
    }
  }

  /**
   * Toggles the dropdown open/closed state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Opens the dropdown menu
   */
  open() {
    if (this.isOpen || !this.dropdown) return;
    
    // Position the dropdown
    this.positionDropdown();
    
    // Show dropdown with animation
    this.dropdown.style.display = 'block';
    this.dropdown.style.opacity = '0';
    this.dropdown.style.transform = 'scaleY(0.8) translateY(-10px)';
    this.dropdown.style.transformOrigin = 'top';
    
    // Trigger reflow
    this.dropdown.offsetHeight;
    
    // Animate in
    this.dropdown.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
    this.dropdown.style.opacity = '1';
    this.dropdown.style.transform = 'scaleY(1) translateY(0)';

    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.dropdown.setAttribute('aria-hidden', 'false');
  }

  /**
   * Closes the dropdown menu
   */
  close() {
    if (!this.isOpen || !this.dropdown) return;
    
    // Animate out
    this.dropdown.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
    this.dropdown.style.opacity = '0';
    this.dropdown.style.transform = 'scaleY(0.8) translateY(-10px)';
    
    setTimeout(() => {
      if (this.dropdown) {
        this.dropdown.style.display = 'none';
      }
    }, this.options.animationDuration);
    
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.dropdown.setAttribute('aria-hidden', 'true');
  }

  /**
   * Positions the dropdown relative to the trigger
   */
  positionDropdown() {
    if (!this.dropdown || !this.trigger) return;
    
    const triggerRect = this.trigger.getBoundingClientRect();
    const scrollPos = window.scrollY || window.pageYOffset;
    const dropdownRect = this.dropdown.getBoundingClientRect();
    
    // Calculate left position based on alignment
    let left;
    switch (this.options.position) {
      case 'bottom-end':
      case 'top-end':
        left = triggerRect.right - dropdownRect.width;
        break;
      default: // 'bottom-start' or 'top-start'
        left = triggerRect.left;
    }
    
    // Calculate top position based on placement
    let top;
    switch (this.options.position) {
      case 'top-start':
      case 'top-end':
        top = triggerRect.top - dropdownRect.height;
        break;
      default: // 'bottom-start' or 'bottom-end'
        top = triggerRect.bottom;
    }
    
    // Ensure dropdown stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position if needed
    if (left + dropdownRect.width > viewportWidth) {
      left = viewportWidth - dropdownRect.width - 8; // 8px margin
    }
    if (left < 8) {
      left = 8; // 8px margin
    }
    
    // Adjust vertical position if needed
    if (top + dropdownRect.height > viewportHeight + scrollPos && this.options.position.startsWith('bottom')) {
      // If there's not enough space below, show above
      top = triggerRect.top - dropdownRect.height;
    } else if (top < scrollPos && this.options.position.startsWith('top')) {
      // If there's not enough space above, show below
      top = triggerRect.bottom;
    }

    // Apply positions
    this.dropdown.style.left = `${left}px`;
    this.dropdown.style.top = `${top + scrollPos}px`;
    this.dropdown.style.minWidth = `${triggerRect.width}px`; // Match trigger width at minimum
  }

  /**
   * Focuses the first item in the dropdown
   */
  focusFirstItem() {
    if (!this.dropdown) return;
    
    const firstItem = this.dropdown.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Focuses the last item in the dropdown
   */
  focusLastItem() {
    if (!this.dropdown) return;
    
    const items = this.dropdown.querySelectorAll('[role="menuitem"]');
    if (items.length > 0) {
      items[items.length - 1].focus();
    }
  }

  /**
   * Generates a unique ID
   * @returns {string} A unique identifier
   */
  generateId() {
    return 'dropdown-' + Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Initializes all dropdowns on the page
 * @param {HTMLElement|Document} container - Container to search for dropdowns
 * @returns {Array<DropdownMenu>} Array of initialized dropdown instances
 */
function initDropdownMenus(container = document) {
  const triggers = container.querySelectorAll('[data-dropdown-menu-trigger], [data-dropdown-trigger], .dropdown-menu-trigger, .dropdown-trigger');
  const instances = [];
  
  triggers.forEach(trigger => {
    if (!trigger.hasAttribute('data-dropdown-initialized')) {
      trigger.setAttribute('data-dropdown-initialized', 'true');
      
      const options = {
        animationDuration: parseInt(trigger.dataset.dropdownAnimationDuration) || 300,
        position: trigger.dataset.dropdownPosition || 'bottom-start',
        closeOnClickOutside: trigger.dataset.dropdownCloseOnClickOutside !== 'false',
        closeOnEscape: trigger.dataset.dropdownCloseOnEscape !== 'false'
      };
      
      const instance = new DropdownMenu(trigger, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize dropdowns when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initDropdownMenus();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DropdownMenu, initDropdownMenus };
}

// Also make it available globally
window.DropdownMenu = DropdownMenu;
window.initDropdownMenus = initDropdownMenus;