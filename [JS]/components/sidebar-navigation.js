/**
 * Sidebar Navigation Component
 * Accessible collapsible sidebar navigation with submenus
 * Compatible with jazer-brand.css styling
 */

class SidebarNavigation {
  /**
   * Creates a new sidebar navigation component
   * @param {HTMLElement} sidebarElement - The sidebar container element
   * @param {Object} options - Configuration options
   */
  constructor(sidebarElement, options = {}) {
    this.sidebar = sidebarElement;
    this.options = {
      collapsible: true,
      collapseBreakpoint: 768, // Width in pixels where sidebar collapses
      autoCloseSubmenus: true,
      showToggleButton: true,
      initialCollapsed: false,
      animationDuration: 300,
      ...options
    };

    this.isCollapsed = this.options.initialCollapsed;
    this.collapseMediaQuery = null;

    this.init();
  }

  /**
   * Initializes the sidebar navigation
   */
  init() {
    // Set up the sidebar structure
    this.setupSidebar();

    // Bind events
    this.bindEvents();

    // Handle initial state
    if (this.options.initialCollapsed) {
      this.collapse();
    } else {
      this.expand();
    }

    // Set up responsive behavior
    this.setupResponsiveBehavior();
  }

  /**
   * Sets up the sidebar structure
   */
  setupSidebar() {
    // Add sidebar classes
    this.sidebar.classList.add('sidebar-navigation');
    
    // Add toggle button if needed
    if (this.options.showToggleButton) {
      this.toggleButton = document.createElement('button');
      this.toggleButton.classList.add('sidebar-toggle');
      this.toggleButton.innerHTML = `
        <span class="sidebar-toggle-icon">☰</span>
        <span class="sidebar-toggle-text">Menu</span>
      `;
      this.toggleButton.setAttribute('aria-label', 'Toggle sidebar navigation');
      this.toggleButton.setAttribute('aria-expanded', !this.isCollapsed);
      
      // Add toggle button to sidebar or a parent container
      this.sidebar.parentNode.insertBefore(this.toggleButton, this.sidebar);
    }

    // Process all navigation items to add proper structure
    this.setupNavigationItems();
  }

  /**
   * Sets up navigation items with proper structure
   */
  setupNavigationItems() {
    const navItems = this.sidebar.querySelectorAll('.nav-item, .sidebar-item');
    
    navItems.forEach((item, index) => {
      // Generate unique ID if not present
      if (!item.id) {
        item.id = `sidebar-item-${index}-${Date.now()}`;
      }
      
      // Add classes
      item.classList.add('sidebar-nav-item');
      
      // Look for submenu
      const submenu = item.querySelector('.nav-submenu, .submenu, ul');
      
      if (submenu) {
        item.classList.add('has-submenu');
        
        // Create expand/collapse button
        const submenuToggle = document.createElement('button');
        submenuToggle.classList.add('submenu-toggle');
        submenuToggle.setAttribute('aria-expanded', 'false');
        submenuToggle.setAttribute('aria-controls', submenu.id || `submenu-${index}`);
        submenuToggle.innerHTML = '<span class="submenu-icon">▼</span>';
        
        // Add to the item before submenu
        item.insertBefore(submenuToggle, submenu);
        
        // Add ARIA attributes to submenu
        submenu.setAttribute('role', 'group');
        submenu.setAttribute('aria-hidden', 'true');
        
        if (!submenu.id) {
          submenu.id = `submenu-${index}`;
        }
      }
    });
  }

  /**
   * Binds event listeners for the sidebar
   */
  bindEvents() {
    // Toggle button event
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggle();
      });
    }

    // Submenu toggle events
    this.sidebar.addEventListener('click', (e) => {
      const submenuToggle = e.target.closest('.submenu-toggle');
      if (submenuToggle) {
        e.preventDefault();
        this.toggleSubmenu(submenuToggle);
      }
    });

    // Keyboard navigation for submenus
    this.sidebar.addEventListener('keydown', (e) => {
      const submenuToggle = e.target.closest('.submenu-toggle');
      if (submenuToggle) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleSubmenu(submenuToggle);
        }
      }
    });

    // Click outside to close on mobile
    document.addEventListener('click', (e) => {
      if (this.isCollapsed && this.sidebar.contains(e.target)) {
        return;
      }
      
      if (this.isCollapsed && !this.sidebar.contains(e.target) && 
          (!this.toggleButton || !this.toggleButton.contains(e.target))) {
        // Only collapse on screen sizes where sidebar is off-canvas
        if (window.innerWidth <= this.options.collapseBreakpoint) {
          this.collapse();
        }
      }
    });
  }

  /**
   * Sets up responsive behavior
   */
  setupResponsiveBehavior() {
    // Create media query for responsive behavior
    this.collapseMediaQuery = window.matchMedia(`(max-width: ${this.options.collapseBreakpoint - 1}px)`);
    
    // Handle initial responsive state
    this.handleResponsiveChange(this.collapseMediaQuery);
    
    // Listen for changes
    this.collapseMediaQuery.addListener((e) => {
      this.handleResponsiveChange(e);
    });
  }

  /**
   * Handles responsive design changes
   * @param {MediaQueryList} mediaQuery - Media query object
   */
  handleResponsiveChange(mediaQuery) {
    if (mediaQuery.matches) {
      // Mobile view - sidebar should be off-canvas
      this.sidebar.classList.add('sidebar-mobile');
      this.sidebar.classList.remove('sidebar-desktop');
      this.isCollapsed = true;
      this.updateCollapseState();
    } else {
      // Desktop view - sidebar should be visible
      this.sidebar.classList.remove('sidebar-mobile');
      this.sidebar.classList.add('sidebar-desktop');
      this.isCollapsed = this.options.initialCollapsed;
      this.updateCollapseState();
    }
  }

  /**
   * Toggles the sidebar
   */
  toggle() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  /**
   * Expands the sidebar
   */
  expand() {
    this.isCollapsed = false;
    this.updateCollapseState();
  }

  /**
   * Collapses the sidebar
   */
  collapse() {
    this.isCollapsed = true;
    this.updateCollapseState();
    
    // Close all submenus when collapsing main sidebar
    if (this.options.autoCloseSubmenus) {
      this.closeAllSubmenus();
    }
  }

  /**
   * Updates the collapse state visually and with ARIA attributes
   */
  updateCollapseState() {
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-expanded', (!this.isCollapsed).toString());
    }
    
    // Toggle classes based on state
    if (this.isCollapsed) {
      this.sidebar.classList.add('sidebar-collapsed');
      this.sidebar.classList.remove('sidebar-expanded');
    } else {
      this.sidebar.classList.remove('sidebar-collapsed');
      this.sidebar.classList.add('sidebar-expanded');
    }
    
    // Apply different behavior based on screen size
    if (window.innerWidth <= this.options.collapseBreakpoint) {
      // Mobile behavior - off-canvas
      if (this.isCollapsed) {
        this.sidebar.style.transform = 'translateX(-100%)';
      } else {
        this.sidebar.style.transform = 'translateX(0)';
      }
      this.sidebar.style.position = 'fixed';
      this.sidebar.style.height = '100vh';
      this.sidebar.style.zIndex = '999';
    } else {
      // Desktop behavior - side panel
      if (this.isCollapsed) {
        this.sidebar.style.width = '60px';
      } else {
        this.sidebar.style.width = '';
      }
      this.sidebar.style.position = '';
      this.sidebar.style.height = '';
      this.sidebar.style.zIndex = '';
    }
    
    // Add transition for smooth animation
    this.sidebar.style.transition = `transform ${this.options.animationDuration}ms ease, width ${this.options.animationDuration}ms ease`;
    
    // Dispatch custom event
    this.sidebar.dispatchEvent(new CustomEvent('sidebarchange', {
      detail: { collapsed: this.isCollapsed }
    }));
  }

  /**
   * Toggles a submenu
   * @param {HTMLElement} submenuToggle - The submenu toggle button
   */
  toggleSubmenu(submenuToggle) {
    const submenu = submenuToggle.nextElementSibling;
    const isExpanded = submenuToggle.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      this.closeSubmenu(submenuToggle, submenu);
    } else {
      this.openSubmenu(submenuToggle, submenu);
    }
  }

  /**
   * Opens a submenu
   * @param {HTMLElement} submenuToggle - The submenu toggle button
   * @param {HTMLElement} submenu - The submenu element
   */
  openSubmenu(submenuToggle, submenu) {
    if (this.options.autoCloseSubmenus) {
      // Close other submenus in the same level
      const parentItem = submenuToggle.parentElement;
      const siblings = Array.from(parentItem.parentElement.children);
      
      siblings.forEach(sibling => {
        if (sibling !== parentItem && sibling.classList.contains('has-submenu')) {
          const siblingToggle = sibling.querySelector('.submenu-toggle');
          const siblingSubmenu = siblingToggle.nextElementSibling;
          this.closeSubmenu(siblingToggle, siblingSubmenu);
        }
      });
    }
    
    submenuToggle.setAttribute('aria-expanded', 'true');
    submenu.setAttribute('aria-hidden', 'false');
    submenu.style.display = 'block';
    
    // Rotate the toggle icon
    const icon = submenuToggle.querySelector('.submenu-icon');
    if (icon) {
      icon.style.transform = 'rotate(180deg)';
    }
  }

  /**
   * Closes a submenu
   * @param {HTMLElement} submenuToggle - The submenu toggle button
   * @param {HTMLElement} submenu - The submenu element
   */
  closeSubmenu(submenuToggle, submenu) {
    submenuToggle.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');
    submenu.style.display = 'none';
    
    // Reset the toggle icon rotation
    const icon = submenuToggle.querySelector('.submenu-icon');
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
    }
  }

  /**
   * Closes all submenus
   */
  closeAllSubmenus() {
    const submenuToggles = this.sidebar.querySelectorAll('.submenu-toggle[aria-expanded="true"]');
    
    submenuToggles.forEach(toggle => {
      const submenu = toggle.nextElementSibling;
      this.closeSubmenu(toggle, submenu);
    });
  }

  /**
   * Gets the current collapsed state
   * @returns {boolean} Whether the sidebar is collapsed
   */
  getCollapsed() {
    return this.isCollapsed;
  }

  /**
   * Sets the collapsed state
   * @param {boolean} collapsed - Whether to collapse the sidebar
   */
  setCollapsed(collapsed) {
    if (collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /**
   * Destroys the sidebar navigation and cleans up
   */
  destroy() {
    // Remove event listeners
    if (this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.toggle);
      if (this.toggleButton.parentNode) {
        this.toggleButton.parentNode.removeChild(this.toggleButton);
      }
    }

    // Remove classes
    this.sidebar.classList.remove('sidebar-navigation');
    this.sidebar.classList.remove('sidebar-collapsed');
    this.sidebar.classList.remove('sidebar-expanded');
    this.sidebar.classList.remove('sidebar-mobile');
    this.sidebar.classList.remove('sidebar-desktop');
    
    // Reset inline styles
    this.sidebar.style.transform = '';
    this.sidebar.style.width = '';
    this.sidebar.style.position = '';
    this.sidebar.style.height = '';
    this.sidebar.style.zIndex = '';
    this.sidebar.style.transition = '';
  }
}

/**
 * Initializes all sidebar navigations on the page
 * @param {HTMLElement|Document} container - Container to search for sidebars
 * @returns {Array<SidebarNavigation>} Array of initialized sidebar navigation instances
 */
function initSidebarNavigations(container = document) {
  const sidebars = container.querySelectorAll('.sidebar-navigation, [data-sidebar]');
  const instances = [];

  sidebars.forEach(sidebar => {
    if (!sidebar.hasAttribute('data-sidebar-initialized')) {
      sidebar.setAttribute('data-sidebar-initialized', 'true');

      // Get options from data attributes
      const options = {
        collapsible: sidebar.dataset.collapsible !== 'false',
        collapseBreakpoint: parseInt(sidebar.dataset.collapseBreakpoint) || 768,
        autoCloseSubmenus: sidebar.dataset.autoCloseSubmenus !== 'false',
        showToggleButton: sidebar.dataset.showToggleButton !== 'false',
        initialCollapsed: sidebar.dataset.initialCollapsed === 'true',
        animationDuration: parseInt(sidebar.dataset.animationDuration) || 300
      };

      const instance = new SidebarNavigation(sidebar, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize sidebar navigations when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initSidebarNavigations();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SidebarNavigation, initSidebarNavigations };
}

// Also make it available globally
window.SidebarNavigation = SidebarNavigation;
window.initSidebarNavigations = initSidebarNavigations;