/**
 * Accordion Component
 * Accessible accordion with keyboard support and smooth animations
 * Compatible with jazer-brand.css styling
 */

class Accordion {
  /**
   * Creates a new accordion component
   * @param {HTMLElement} accordionElement - The accordion container element
   * @param {Object} options - Configuration options
   */
  constructor(accordionElement, options = {}) {
    this.accordion = accordionElement;
    this.options = {
      allowMultipleOpen: false,
      animationDuration: 300,
      activateOnKeyDown: true,
      ...options
    };

    this.items = [];
    this.activeIndices = [];

    this.init();
  }

  /**
   * Initializes the accordion
   */
  init() {
    // Find all accordion items
    const accordionItems = this.accordion.querySelectorAll('.accordion-item');
    
    accordionItems.forEach((item, index) => {
      const header = item.querySelector('.accordion-header') || item.querySelector('[data-accordion-trigger]');
      const content = item.querySelector('.accordion-content') || item.querySelector('[data-accordion-content]');
      
      if (header && content) {
        this.setupAccordionItem(item, header, content, index);
      }
    });
    
    // Bind events
    this.bindEvents();
  }

  /**
   * Sets up a single accordion item
   * @param {HTMLElement} item - The accordion item element
   * @param {HTMLElement} header - The accordion header element
   * @param {HTMLElement} content - The accordion content element
   * @param {number} index - Index of the accordion item
   */
  setupAccordionItem(item, header, content, index) {
    // Generate IDs if not present
    if (!header.id) header.id = `accordion-header-${Date.now()}-${index}`;
    if (!content.id) content.id = `accordion-content-${Date.now()}-${index}`;
    
    // Set ARIA attributes
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', content.id);
    header.setAttribute('tabindex', '0');
    
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', header.id);
    content.setAttribute('aria-hidden', 'true');
    content.style.display = 'none';
    
    // Add classes
    item.classList.add('accordion-item');
    header.classList.add('accordion-header');
    content.classList.add('accordion-content');
    
    // Store item data
    this.items.push({ item, header, content, index });
  }

  /**
   * Binds event listeners for the accordion
   */
  bindEvents() {
    this.items.forEach((itemData, index) => {
      const { header, content } = itemData;
      
      // Click event
      header.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleItem(index);
      });
      
      // Keyboard navigation
      if (this.options.activateOnKeyDown) {
        header.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              this.toggleItem(index);
              break;
            case 'ArrowDown':
              e.preventDefault();
              this.focusNext(index);
              break;
            case 'ArrowUp':
              e.preventDefault();
              this.focusPrevious(index);
              break;
            case 'Home':
              e.preventDefault();
              this.focusFirst();
              break;
            case 'End':
              e.preventDefault();
              this.focusLast();
              break;
          }
        });
      }
    });
  }

  /**
   * Toggles an accordion item open/closed
   * @param {number} index - Index of the item to toggle
   */
  toggleItem(index) {
    const itemData = this.items[index];
    if (!itemData) return;
    
    if (itemData.header.getAttribute('aria-expanded') === 'true') {
      this.closeItem(index);
    } else {
      if (!this.options.allowMultipleOpen) {
        // Close all other items first
        this.items.forEach((_, idx) => {
          if (idx !== index && this.activeIndices.includes(idx)) {
            this.closeItem(idx);
          }
        });
      }
      this.openItem(index);
    }
  }

  /**
   * Opens an accordion item
   * @param {number} index - Index of the item to open
   */
  openItem(index) {
    const itemData = this.items[index];
    if (!itemData) return;
    
    // Update ARIA attributes
    itemData.header.setAttribute('aria-expanded', 'true');
    itemData.content.setAttribute('aria-hidden', 'false');
    
    // Show content with animation
    itemData.content.style.display = 'block';
    itemData.content.style.opacity = '0';
    itemData.content.style.transform = 'translateY(-10px)';
    
    // Trigger reflow
    itemData.content.offsetHeight;
    
    // Animate in
    itemData.content.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
    itemData.content.style.opacity = '1';
    itemData.content.style.transform = 'translateY(0)';
    
    // Add active classes
    itemData.item.classList.add('accordion-active');
    itemData.header.classList.add('accordion-header-active');
    itemData.content.classList.add('accordion-content-active');
    
    // Track active item
    if (!this.activeIndices.includes(index)) {
      this.activeIndices.push(index);
    }
  }

  /**
   * Closes an accordion item
   * @param {number} index - Index of the item to close
   */
  closeItem(index) {
    const itemData = this.items[index];
    if (!itemData) return;
    
    // Animate out
    itemData.content.style.opacity = '0';
    itemData.content.style.transform = 'translateY(-10px)';
    
    // Remove active classes after animation
    setTimeout(() => {
      itemData.content.style.display = 'none';
      itemData.item.classList.remove('accordion-active');
      itemData.header.classList.remove('accordion-header-active');
      itemData.content.classList.remove('accordion-content-active');
    }, this.options.animationDuration);
    
    // Update ARIA attributes
    itemData.header.setAttribute('aria-expanded', 'false');
    itemData.content.setAttribute('aria-hidden', 'true');
    
    // Remove from active indices
    this.activeIndices = this.activeIndices.filter(i => i !== index);
  }

  /**
   * Focuses the next accordion header
   * @param {number} currentIndex - Current item index
   */
  focusNext(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.items.length;
    this.items[nextIndex].header.focus();
  }

  /**
   * Focuses the previous accordion header
   * @param {number} currentIndex - Current item index
   */
  focusPrevious(currentIndex) {
    const prevIndex = currentIndex <= 0 ? this.items.length - 1 : currentIndex - 1;
    this.items[prevIndex].header.focus();
  }

  /**
   * Focuses the first accordion header
   */
  focusFirst() {
    if (this.items.length > 0) {
      this.items[0].header.focus();
    }
  }

  /**
   * Focuses the last accordion header
   */
  focusLast() {
    if (this.items.length > 0) {
      this.items[this.items.length - 1].header.focus();
    }
  }
}

/**
 * Initializes all accordions on the page
 * @param {HTMLElement|Document} container - Container to search for accordions
 * @returns {Array<Accordion>} Array of initialized accordion instances
 */
function initAccordions(container = document) {
  const accordions = container.querySelectorAll('.accordion, [data-accordion]');
  const instances = [];
  
  accordions.forEach(accordion => {
    if (!accordion.hasAttribute('data-accordion-initialized')) {
      accordion.setAttribute('data-accordion-initialized', 'true');
      
      // Get options from data attributes
      const options = {
        allowMultipleOpen: accordion.dataset.allowMultipleOpen === 'true',
        animationDuration: parseInt(accordion.dataset.animationDuration) || 300,
        activateOnKeyDown: accordion.dataset.activateOnKeyDown !== 'false'
      };
      
      const instance = new Accordion(accordion, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize accordions when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initAccordions();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Accordion, initAccordions };
}

// Also make it available globally
window.Accordion = Accordion;
window.initAccordions = initAccordions;