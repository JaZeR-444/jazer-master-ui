/**
 * Tab Navigator Component
 * Accessible tab navigation with keyboard support
 * Compatible with jazer-brand.css styling
 */

class TabNavigator {
  /**
   * Creates a new tab navigator
   * @param {HTMLElement} container - The tab container element
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      animationDuration: 200,
      loopNavigation: true,
      activateOnKeyDown: true,
      ...options
    };
    
    this.tabs = [];
    this.tabPanels = [];
    this.activeIndex = 0;
    
    this.init();
  }

  /**
   * Initializes the tab navigator
   */
  init() {
    // Find tab list and individual tabs
    this.tabList = this.container.querySelector('[role="tablist"]');
    if (!this.tabList) {
      console.error('No tablist found in container');
      return;
    }

    const tabElements = this.tabList.querySelectorAll('[role="tab"]');
    const panelElements = this.container.querySelectorAll('[role="tabpanel"]');

    // Setup each tab and its associated panel
    tabElements.forEach((tab, index) => {
      const panelId = tab.getAttribute('aria-controls');
      const panel = panelElements[index] || document.getElementById(panelId);

      if (panel) {
        this.tabs.push(tab);
        this.tabPanels.push(panel);

        // Set up ARIA attributes
        tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
        tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        tab.setAttribute('aria-controls', panel.id);

        panel.setAttribute('aria-labelledby', tab.id);
        panel.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');

        if (index !== 0) {
          panel.style.display = 'none';
        }

        // Add click event listener
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this.activateTab(index);
        });

        // Add keyboard event listeners
        tab.addEventListener('keydown', (e) => {
          if (!this.options.activateOnKeyDown) return;

          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              this.focusPreviousTab();
              break;
            case 'ArrowRight':
              e.preventDefault();
              this.focusNextTab();
              break;
            case 'Home':
              e.preventDefault();
              this.focusTab(0);
              break;
            case 'End':
              e.preventDefault();
              this.focusTab(this.tabs.length - 1);
              break;
            case 'Space':
            case 'Enter':
              e.preventDefault();
              this.activateTab(index);
              break;
          }
        });
      }
    });

    // Highlight first active tab
    if (this.tabs[0]) {
      this.tabs[0].classList.add('tab-active');
    }
  }

  /**
   * Activates a specific tab
   * @param {number} index - Index of the tab to activate
   */
  activateTab(index) {
    if (index < 0 || index >= this.tabs.length) return;

    // Deactivate current tab
    const currentTab = this.tabs[this.activeIndex];
    const currentPanel = this.tabPanels[this.activeIndex];

    if (currentTab) {
      currentTab.setAttribute('aria-selected', 'false');
      currentTab.setAttribute('tabindex', '-1');
      currentTab.classList.remove('tab-active');
    }

    if (currentPanel) {
      currentPanel.setAttribute('aria-hidden', 'true');
      currentPanel.style.display = 'none';
    }

    // Activate new tab
    const newTab = this.tabs[index];
    const newPanel = this.tabPanels[index];

    if (newTab) {
      newTab.setAttribute('aria-selected', 'true');
      newTab.setAttribute('tabindex', '0');
      newTab.classList.add('tab-active');
      newTab.focus();
    }

    if (newPanel) {
      newPanel.setAttribute('aria-hidden', 'false');
      newPanel.style.display = 'block';

      // Add fade-in animation
      newPanel.style.opacity = '0';
      newPanel.style.transform = 'translateY(10px)';

      // Trigger reflow
      newPanel.offsetHeight;

      // Animate in
      newPanel.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
      newPanel.style.opacity = '1';
      newPanel.style.transform = 'translateY(0)';
    }

    this.activeIndex = index;
  }

  /**
   * Focuses the next tab
   */
  focusNextTab() {
    const nextIndex = this.options.loopNavigation ?
      (this.activeIndex + 1) % this.tabs.length :
      Math.min(this.activeIndex + 1, this.tabs.length - 1);

    this.focusTab(nextIndex);
  }

  /**
   * Focuses the previous tab
   */
  focusPreviousTab() {
    const prevIndex = this.options.loopNavigation ?
      (this.activeIndex + this.tabs.length - 1) % this.tabs.length :
      Math.max(this.activeIndex - 1, 0);

    this.focusTab(prevIndex);
  }

  /**
   * Focuses a specific tab
   * @param {number} index - Index of the tab to focus
   */
  focusTab(index) {
    if (index < 0 || index >= this.tabs.length) return;

    this.tabs[index].focus();

    if (!this.options.activateOnKeyDown) {
      // Just focus, don't activate automatically
      return;
    }
  }

  /**
   * Gets the currently active tab
   * @returns {Object} Object containing active index, tab, and panel
   */
  getActiveTab() {
    return {
      index: this.activeIndex,
      tab: this.tabs[this.activeIndex],
      panel: this.tabPanels[this.activeIndex]
    };
  }
}

/**
 * Initializes all tab navigators on the page
 * @param {HTMLElement|Document} container - Container to search in
 * @returns {Array<TabNavigator>} Array of initialized instances
 */
function initTabNavigators(container = document) {
  const tabContainers = container.querySelectorAll('.tab-navigator, [data-tabs], [role="tablist"]');
  const instances = [];
  
  tabContainers.forEach(tabContainer => {
    if (!tabContainer.hasAttribute('data-tabs-initialized')) {
      tabContainer.setAttribute('data-tabs-initialized', 'true');
      
      const options = {
        animationDuration: parseInt(tabContainer.dataset.animationDuration) || 200,
        loopNavigation: tabContainer.dataset.loopNavigation !== 'false',
        activateOnKeyDown: tabContainer.dataset.activateOnKeyDown !== 'false'
      };
      
      const instance = new TabNavigator(tabContainer, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize tab navigators when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initTabNavigators();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TabNavigator, initTabNavigators };
}

// Also make it available globally
window.TabNavigator = TabNavigator;
window.initTabNavigators = initTabNavigators;