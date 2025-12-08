/**
 * Tooltip Component
 * Accessible tooltips with multiple positioning options
 * Compatible with jazer-brand.css styling
 */

class Tooltip {
  /**
   * Creates a new tooltip
   * @param {HTMLElement} element - Element to attach tooltip to
   * @param {Object} options - Configuration options
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      content: '',
      position: 'top', // top, bottom, left, right, top-start, top-end, etc.
      trigger: 'hover', // hover, click, focus, manual
      showDelay: 300,
      hideDelay: 100,
      animationDuration: 200,
      closeOnClickOutside: true,
      ...options
    };
    
    // Get content from various sources
    if (!this.options.content) {
      this.options.content = element.getAttribute('title') || 
                            element.getAttribute('data-tooltip') || 
                            element.dataset.tooltip || 
                            'Tooltip';
      
      // Remove title attribute to prevent default tooltip
      element.removeAttribute('title');
    }
    
    this.tooltipElement = null;
    this.isVisible = false;
    this.showTimer = null;
    this.hideTimer = null;
    
    this.init();
  }

  /**
   * Initializes the tooltip
   */
  init() {
    // Set up ARIA attributes
    this.element.setAttribute('aria-describedby', `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    this.element.setAttribute('tabindex', '0');
    
    // Set up trigger events based on options
    this.setupTriggers();
  }

  /**
   * Sets up event triggers for the tooltip
   */
  setupTriggers() {
    const triggers = this.options.trigger.split(',');
    
    triggers.forEach(trigger => {
      switch (trigger.trim()) {
        case 'hover':
          this.element.addEventListener('mouseenter', this.show.bind(this));
          this.element.addEventListener('mouseleave', this.hide.bind(this));
          break;
        case 'click':
          this.element.addEventListener('click', () => {
            if (this.isVisible) {
              this.hide();
            } else {
              this.show();
            }
          });
          break;
        case 'focus':
          this.element.addEventListener('focus', this.show.bind(this));
          this.element.addEventListener('blur', this.hide.bind(this));
          break;
      }
    });
    
    // Add close-on-escape if tooltip can be opened by click or focus
    if (triggers.includes('click') || triggers.includes('focus')) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.hide();
        }
      });
    }
    
    // Handle close on outside click if enabled
    if (this.options.closeOnClickOutside) {
      document.addEventListener('click', (e) => {
        if (this.isVisible && !this.element.contains(e.target) && !(this.tooltipElement && this.tooltipElement.contains(e.target))) {
          this.hide();
        }
      });
    }
  }

  /**
   * Shows the tooltip
   */
  show() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    
    this.showTimer = setTimeout(() => {
      if (this.isVisible) return;
      
      this.createTooltip();
      this.positionTooltip();
      
      // Show with animation
      this.tooltipElement.style.opacity = '0';
      this.tooltipElement.style.display = 'block';
      this.tooltipElement.style.transform = this.getOffsetForPosition(this.options.position, true);
      
      // Trigger reflow
      this.tooltipElement.offsetHeight;
      
      // Animate in
      this.tooltipElement.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
      this.tooltipElement.style.opacity = '1';
      this.tooltipElement.style.transform = this.getOffsetForPosition(this.options.position, false);
      
      this.isVisible = true;
    }, this.options.showDelay);
  }

  /**
   * Hides the tooltip
   */
  hide() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    
    this.hideTimer = setTimeout(() => {
      if (!this.isVisible) return;
      
      // Animate out
      this.tooltipElement.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
      this.tooltipElement.style.opacity = '0';
      this.tooltipElement.style.transform = this.getOffsetForPosition(this.options.position, true);
      
      setTimeout(() => {
        if (this.tooltipElement && this.tooltipElement.parentNode) {
          this.tooltipElement.parentNode.removeChild(this.tooltipElement);
          this.tooltipElement = null;
        }
        this.isVisible = false;
      }, this.options.animationDuration);
    }, this.options.hideDelay);
  }

  /**
   * Creates the tooltip element
   */
  createTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
    }
    
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tooltip';
    this.tooltipElement.id = this.element.getAttribute('aria-describedby');
    this.tooltipElement.setAttribute('role', 'tooltip');
    this.tooltipElement.setAttribute('aria-hidden', 'false');
    
    // Add content
    this.tooltipElement.textContent = this.options.content;
    
    // Apply styling
    this.tooltipElement.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: var(--text-light);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-cyan);
      backdrop-filter: blur(10px);
    `;
    
    // Add arrow element
    const arrow = document.createElement('div');
    arrow.className = 'tooltip-arrow';
    arrow.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: inherit;
      border-right: 1px solid var(--border-cyan);
      border-bottom: 1px solid var(--border-cyan);
      transform: rotate(45deg);
    `;
    this.tooltipElement.appendChild(arrow);
    
    // Add to document
    document.body.appendChild(this.tooltipElement);
  }

  /**
   * Positions the tooltip relative to the element
   */
  positionTooltip() {
    if (!this.tooltipElement) return;
    
    const elementRect = this.element.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const arrow = this.tooltipElement.querySelector('.tooltip-arrow');
    
    let top, left;
    
    // Position based on options
    switch (this.options.position) {
      case 'top':
        top = elementRect.top - tooltipRect.height - 10;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        arrow.style.top = '100%';
        arrow.style.left = '50%';
        arrow.style.transform = 'translate(-50%, -50%) rotate(135deg)';
        break;
      case 'top-start':
        top = elementRect.top - tooltipRect.height - 10;
        left = elementRect.left;
        arrow.style.top = '100%';
        arrow.style.left = '10px';
        arrow.style.transform = 'translateY(-50%) rotate(135deg)';
        break;
      case 'top-end':
        top = elementRect.top - tooltipRect.height - 10;
        left = elementRect.right - tooltipRect.width;
        arrow.style.top = '100%';
        arrow.style.right = '10px';
        arrow.style.left = 'auto';
        arrow.style.transform = 'translateY(-50%) rotate(135deg)';
        break;
      case 'bottom':
        top = elementRect.bottom + 10;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        arrow.style.top = '-4px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        break;
      case 'bottom-start':
        top = elementRect.bottom + 10;
        left = elementRect.left;
        arrow.style.top = '-4px';
        arrow.style.left = '10px';
        arrow.style.transform = 'translateY(-50%) rotate(-45deg)';
        break;
      case 'bottom-end':
        top = elementRect.bottom + 10;
        left = elementRect.right - tooltipRect.width;
        arrow.style.top = '-4px';
        arrow.style.right = '10px';
        arrow.style.left = 'auto';
        arrow.style.transform = 'translateY(-50%) rotate(-45deg)';
        break;
      case 'left':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left - tooltipRect.width - 10;
        arrow.style.top = '50%';
        arrow.style.left = '100%';
        arrow.style.transform = 'translate(-50%, -50%) rotate(225deg)';
        break;
      case 'right':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + 10;
        arrow.style.top = '50%';
        arrow.style.left = '-4px';
        arrow.style.transform = 'translate(-50%, -50%) rotate(45deg)';
        break;
      default:
        // Default to top
        top = elementRect.top - tooltipRect.height - 10;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        arrow.style.top = '100%';
        arrow.style.left = '50%';
        arrow.style.transform = 'translate(-50%, -50%) rotate(135deg)';
    }
    
    // Adjust for viewport boundaries
    const viewportPadding = 10;
    if (left < viewportPadding) {
      left = viewportPadding;
    } else if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - tooltipRect.width - viewportPadding;
    }
    
    if (top < viewportPadding) {
      top = viewportPadding;
    } else if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
      top = window.innerHeight - tooltipRect.height - viewportPadding;
    }
    
    // Apply positions with scroll offset
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    this.tooltipElement.style.top = `${top + scrollY}px`;
    this.tooltipElement.style.left = `${left + scrollX}px`;
  }

  /**
   * Gets the transform offset for animation based on position
   * @param {string} position - Tooltip position
   * @param {boolean} isHidden - Whether in hidden state
   * @returns {string} Transform CSS value
   */
  getOffsetForPosition(position, isHidden) {
    const offset = isHidden ? 10 : 0;
    const sign = isHidden ? -1 : 1;
    
    switch (position) {
      case 'top':
      case 'top-start':
      case 'top-end':
        return `translateY(${sign * offset}px) scale(${isHidden ? 0.8 : 1})`;
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        return `translateY(${sign * offset}px) scale(${isHidden ? 0.8 : 1})`;
      case 'left':
        return `translateX(${sign * offset}px) scale(${isHidden ? 0.8 : 1})`;
      case 'right':
        return `translateX(${sign * offset}px) scale(${isHidden ? 0.8 : 1})`;
      default:
        return `translateY(${sign * offset}px) scale(${isHidden ? 0.8 : 1})`;
    }
  }

  /**
   * Updates tooltip content
   * @param {string} content - New content for the tooltip
   */
  updateContent(content) {
    this.options.content = content;
    if (this.tooltipElement) {
      this.tooltipElement.textContent = content;
    }
  }

  /**
   * Destroys the tooltip instance
   */
  destroy() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
    
    this.isVisible = false;
  }
}

/**
 * Initializes all tooltips on the page
 * @param {HTMLElement|Document} container - Container to search for tooltip elements
 * @returns {Array<Tooltip>} Array of initialized tooltip instances
 */
function initTooltips(container = document) {
  const tooltipElements = container.querySelectorAll('[data-tooltip], [title], [data-tooltip-trigger]');
  const instances = [];
  
  tooltipElements.forEach(element => {
    // Skip if already initialized
    if (element.hasAttribute('data-tooltip-initialized')) return;
    
    element.setAttribute('data-tooltip-initialized', 'true');
    
    const options = {
      content: element.getAttribute('data-tooltip') || element.getAttribute('title'),
      position: element.dataset.tooltipPosition || element.dataset.position || 'top',
      trigger: element.dataset.tooltipTrigger || element.dataset.trigger || 'hover',
      showDelay: parseInt(element.dataset.tooltipDelay) || parseInt(element.dataset.delay) || 300,
      animationDuration: parseInt(element.dataset.tooltipAnimation) || parseInt(element.dataset.animation) || 200
    };
    
    const instance = new Tooltip(element, options);
    instances.push(instance);
  });
  
  return instances;
}

/**
 * Auto-initialize tooltips when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initTooltips();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Tooltip, initTooltips };
}

// Also make it available globally
window.Tooltip = Tooltip;
window.initTooltips = initTooltips;