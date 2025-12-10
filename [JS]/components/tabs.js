/**
 * Tabs Component
 * Accessible tab navigation with keyboard support
 * Compatible with jazer-brand.css styling
 */

class Tabs {
  /**
   * Creates a new tabs component
   * @param {HTMLElement} tabsContainer - The container element for the tabs
   * @param {Object} options - Configuration options for the tabs
   */
  constructor(tabsContainer, options = {}) {
    this.container = tabsContainer;
    this.options = {
      animationDuration: 250,
      activateOnKeyDown: true,
      ...options
    };
    
    this.tabList = null;
    this.tabs = [];
    this.panels = [];
    this.activeTab = null;
    this.activeIndex = 0;
    
    this.init();
  }

  /**
   * Initializes the tabs component
   */
  init() {
    this.tabList = this.container.querySelector('[role="tablist"]') || 
                   this.container.querySelector('.tabs-list') ||
                   this.container.children[0];
    
    if (!this.tabList) {
      console.error('No tablist found in tabs container');
      return;
    }
    
    // Find all tabs and their associated panels
    const tabElements = this.tabList.querySelectorAll('[role="tab"], .tab-link, [data-tab-target]');
    const panelContainer = this.container.querySelector('[data-tab-panels]') ||
                          this.container.querySelector('.tab-panels') ||
                          this.container.querySelector('.tab-content-wrapper');
    
    tabElements.forEach((tab, index) => {
      let panel = null;
      
      // Try to find panel by data attribute
      const panelId = tab.dataset.tabTarget;
      if (panelId) {
        panel = document.getElementById(panelId);
      } else {
        // Try to find associated panel by ARIA label or index
        if (tab.getAttribute('aria-controls')) {
          panel = document.getElementById(tab.getAttribute('aria-controls'));
        } else {
          // Fallback to finding panel by index
          const allPanels = panelContainer ? 
            panelContainer.querySelectorAll('[role="tabpanel"], .tab-panel') :
            this.container.querySelectorAll('[role="tabpanel"], .tab-panel');
            
          if (allPanels[index]) {
            panel = allPanels[index];
          }
        }
      }
      
      if (panel) {
        this.tabs.push(tab);
        this.panels.push(panel);
        
        // Set up ARIA attributes
        if (!tab.id) tab.id = `tab-${Date.now()}-${index}`;
        if (!panel.id) panel.id = `panel-${Date.now()}-${index}`;
        
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('aria-controls', panel.id);
        tab.setAttribute('tabindex', '-1');
        tab.classList.add('tab');
        
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.setAttribute('aria-hidden', 'true');
        panel.classList.add('tab-panel');
      }
    });
    
    // Activate first tab by default
    if (this.tabs.length > 0) {
      this.activateTab(0, false); // Don't trigger animation for initial activation
    }

    // Bind events
    this.bindEvents();
  }

  /**
   * Binds event listeners for the tabs
   */
  bindEvents() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.activateTab(index);
      });

      tab.addEventListener('keydown', (e) => {
        if (!this.options.activateOnKeyDown) return;

        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp': // Vertical arrow keys typically for tabs are often horizontal
            e.preventDefault();
            this.activatePreviousTab();
            break;
          case 'ArrowRight':
          case 'ArrowDown': // Vertical arrow keys typically for tabs are often horizontal
            e.preventDefault();
            this.activateNextTab();
            break;
          case 'Home':
            e.preventDefault();
            this.activateFirstTab();
            break;
          case 'End':
            e.preventDefault();
            this.activateLastTab();
            break;
        }
      });
    });
  }

  /**
   * Activates a specific tab
   * @param {number} index - Index of the tab to activate
   * @param {boolean} animate - Whether to animate the transition
   */
  activateTab(index, animate = true) {
    if (index < 0 || index >= this.tabs.length) return;

    // Deactivate current tab if different
    if (this.activeTab !== this.tabs[index]) {
      this.deactivateCurrentTab();

      // Activate new tab
      const newTab = this.tabs[index];
      const newPanel = this.panels[index];

      // Update ARIA attributes
      newTab.setAttribute('aria-selected', 'true');
      newTab.setAttribute('tabindex', '0');
      newPanel.setAttribute('aria-hidden', 'false');

      // Add active classes
      newTab.classList.add('tab-active');
      newPanel.classList.add('panel-active');

      // Show new panel with animation if enabled
      if (animate) {
        newPanel.style.opacity = '0';
        newPanel.style.transform = 'translateY(10px)';
        newPanel.style.display = 'block';

        // Trigger reflow
        newPanel.offsetHeight;

        // Animate in
        newPanel.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
        newPanel.style.opacity = '1';
        newPanel.style.transform = 'translateY(0)';
      } else {
        newPanel.style.display = 'block';
      }

      this.activeTab = newTab;
      this.activeIndex = index;

      // Focus the activated tab
      newTab.focus();
    }
  }

  /**
   * Deactivates the currently active tab
   */
  deactivateCurrentTab() {
    if (this.activeTab) {
      // Update ARIA attributes
      this.activeTab.setAttribute('aria-selected', 'false');
      this.activeTab.setAttribute('tabindex', '-1');

      const activePanel = this.panels[this.activeIndex];
      if (activePanel) {
        activePanel.setAttribute('aria-hidden', 'true');
        activePanel.style.opacity = '0';
        activePanel.style.transform = 'translateY(-10px)';

        // Set small timeout before hiding to allow animation
        setTimeout(() => {
          if (activePanel.style.opacity === '0') {
            activePanel.style.display = 'none';
          }
        }, this.options.animationDuration);

        // Remove active classes
        this.activeTab.classList.remove('tab-active');
        activePanel.classList.remove('panel-active');
      }
    }
  }

  /**
   * Activates the next tab
   */
  activateNextTab() {
    const nextIndex = (this.activeIndex + 1) % this.panels.length;
    this.activateTab(nextIndex);
  }

  /**
   * Activates the previous tab
   */
  activatePreviousTab() {
    const prevIndex = (this.activeIndex + this.panels.length - 1) % this.panels.length;
    this.activateTab(prevIndex);
  }

  /**
   * Activates the first tab
   */
  activateFirstTab() {
    this.activateTab(0);
  }

  /**
   * Activates the last tab
   */
  activateLastTab() {
    this.activateTab(this.panels.length - 1);
  }
}

/**
 * Initializes all tabs components on the page
 * @param {HTMLElement|Document} container - Container to search for tabs
 * @returns {Array<Tabs>} Array of initialized tabs instances
 */
function initTabs(container = document) {
  const tabContainers = container.querySelectorAll('.tabs, [data-tabs], .tab-component');
  const instances = [];
  
  tabContainers.forEach(tabContainer => {
    if (!tabContainer.hasAttribute('data-tabs-initialized')) {
      tabContainer.setAttribute('data-tabs-initialized', 'true');
      
      const options = {
        animationDuration: parseInt(tabContainer.dataset.tabsAnimationDuration) || 250,
        activateOnKeyDown: tabContainer.dataset.tabsActivateOnKeyDown !== 'false'
      };
      
      const instance = new Tabs(tabContainer, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize tabs when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initTabs();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Tabs, initTabs };
}

// Also make it available globally
window.Tabs = Tabs;
window.initTabs = initTabs;