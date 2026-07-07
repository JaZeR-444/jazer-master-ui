/**
 * Modal Dialog Component
 * Accessible modal dialogs with keyboard support and animations
 * Compatible with jazer-brand.css styling
 */

class ModalDialog {
  /**
   * Creates a new modal dialog instance
   * @param {HTMLElement|string} triggerElement - Element that triggers the modal or selector
   * @param {Object} options - Configuration options for the modal
   */
  constructor(triggerElement, options = {}) {
    this.options = {
      animationDuration: 300,
      closeOnOverlayClick: true,
      closeOnEscape: true,
      trapFocus: true,
      returnFocus: true,
      preventScroll: true,
      ...options
    };
    
    this.triggerElement = typeof triggerElement === 'string' 
      ? document.querySelector(triggerElement) 
      : triggerElement;
    
    this.modalElement = null;
    this.overlayElement = null;
    this.isOpen = false;
    this.returnFocusElement = null;
    this.focusedElementBeforeModal = null;
    
    if (this.triggerElement) {
      this.init();
    }
  }

  /**
   * Initializes the modal
   */
  init() {
    // Create modal elements
    this.createModal();
    
    // Bind events
    this.bindEvents();
  }

  /**
   * Creates the modal elements
   */
  createModal() {
    // Get modal content - either from data-modal-content attribute or modalId
    const modalId = this.triggerElement.dataset.modalTarget || this.triggerElement.dataset.modalId;
    const modalContentElement = modalId ? document.getElementById(modalId) : null;
    
    if (!modalContentElement) {
      console.error(`Modal content element with ID '${modalId}' not found.`);
      return;
    }
    
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'modal-overlay';
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: opacity ${this.options.animationDuration}ms ease, visibility ${this.options.animationDuration}ms ease;
    `;
    
    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal';
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.setAttribute('aria-modal', 'true');
    this.modalElement.setAttribute('tabindex', '-1');
    this.modalElement.style.cssText = `
      background: var(--bg-dark);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      min-width: 300px;
      max-width: 90%;
      width: 500px;
      max-height: 90vh;
      overflow: hidden;
      opacity: 0;
      transform: scale(0.8) translateY(-20px);
      transition: opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease, visibility ${this.options.animationDuration}ms ease;
      box-shadow: var(--shadow-card);
      backdrop-filter: blur(10px);
      position: relative;
    `;
    
    // Copy content from source element
    this.modalElement.innerHTML = modalContentElement.innerHTML;
    
    // Add close button if it doesn't already exist
    if (!this.modalElement.querySelector('[data-modal-close], .modal-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close-btn';
      closeBtn.setAttribute('data-modal-close', '');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: var(--text-light);
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 1;
      `;
      
      this.modalElement.prepend(closeBtn);
    }
    
    // Add close button event listener
    const closeButtons = this.modalElement.querySelectorAll('[data-modal-close], .modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.close();
      });
    });
    
    this.overlayElement.appendChild(this.modalElement);
    document.body.appendChild(this.overlayElement);
  }

  /**
   * Binds event listeners to the modal
   */
  bindEvents() {
    // Trigger element click
    if (this.triggerElement) {
      this.triggerElement.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    }
    
    // Overlay click
    if (this.options.closeOnOverlayClick) {
      this.overlayElement.addEventListener('click', (e) => {
        if (e.target === this.overlayElement) {
          this.close();
        }
      });
    }
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && this.options.closeOnEscape) {
        this.close();
      } else if (e.key === 'Tab' && this.isOpen && this.options.trapFocus) {
        this.trapFocus(e);
      }
    });
  }

  /**
   * Opens the modal
   */
  open() {
    if (this.isOpen) return;
    
    // Store focused element to return focus later
    this.focusedElementBeforeModal = document.activeElement;
    
    // Add modal-open class to body to prevent scrolling
    if (this.options.preventScroll) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }
    
    // Show modal with animation
    this.overlayElement.style.display = 'flex';
    this.overlayElement.style.visibility = 'visible';
    this.modalElement.style.visibility = 'visible';
    
    // Trigger reflow
    this.overlayElement.offsetHeight;
    
    this.overlayElement.style.opacity = '1';
    this.modalElement.style.opacity = '1';
    this.modalElement.style.transform = 'scale(1) translateY(0)';
    
    this.isOpen = true;
    
    // Focus first focusable element in modal
    setTimeout(() => {
      const firstFocusable = this.getFirstFocusableElement();
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        this.modalElement.focus();
      }
    }, 0);
  }

  /**
   * Closes the modal
   */
  close() {
    if (!this.isOpen) return;
    
    // Animate out
    this.overlayElement.style.opacity = '0';
    this.modalElement.style.opacity = '0';
    this.modalElement.style.transform = 'scale(0.8) translateY(-20px)';
    
    setTimeout(() => {
      if (this.overlayElement && this.overlayElement.parentNode) {
        this.overlayElement.parentNode.removeChild(this.overlayElement);
      }
      
      // Remove modal-open class from body
      if (this.options.preventScroll) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
      
      // Return focus to original element
      if (this.options.returnFocus && this.focusedElementBeforeModal) {
        this.focusedElementBeforeModal.focus();
      }
      
      this.isOpen = false;
    }, this.options.animationDuration);
  }

  /**
   * Traps focus within the modal
   * @param {KeyboardEvent} e - The keyboard event
   */
  trapFocus(e) {
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }

  /**
   * Gets all focusable elements inside the modal
   * @returns {Array} Array of focusable elements
   */
  getFocusableElements() {
    if (!this.modalElement) return [];
    
    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return Array.from(
      this.modalElement.querySelectorAll(focusableSelectors.join(', '))
    ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  }

  /**
   * Gets the first focusable element inside the modal
   * @returns {HTMLElement|null} First focusable element or null
   */
  getFirstFocusableElement() {
    const focusableElements = this.getFocusableElements();
    return focusableElements.length > 0 ? focusableElements[0] : null;
  }
}

/**
 * Static method to create a modal programmatically
 * @param {Object} config - Modal configuration
 * @returns {HTMLElement} Modal element
 */
ModalDialog.create = function(config) {
  const {
    title = 'Modal Title',
    content = 'Modal Content',
    size = 'md', // sm, md, lg, xl
    closable = true,
    onClose = null
  } = config;
  
  // Create modal elements
  const modalElement = document.createElement('div');
  modalElement.className = 'modal';
  modalElement.setAttribute('role', 'dialog');
  modalElement.setAttribute('aria-modal', 'true');
  modalElement.style.cssText = `
    background: var(--bg-dark);
    border: 2px solid var(--border-default);
    border-radius: var(--radius-lg);
    max-width: ${size === 'sm' ? '300px' : size === 'lg' ? '700px' : size === 'xl' ? '900px' : '500px'};
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
  `;
  
  // Create modal header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.style.cssText = `
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-default);
  `;
  
  const headerTitle = document.createElement('h2');
  headerTitle.className = 'gradient-text font-bold text-xl';
  headerTitle.textContent = title;
  
  header.appendChild(headerTitle);
  
  if (closable) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: var(--text-light);
      font-size: 1.5rem;
      cursor: pointer;
    `;
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalElement);
      if (onClose) onClose();
    });
    
    modalElement.appendChild(closeBtn);
  }
  
  // Create modal body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.cssText = `
    padding: 1.5rem;
  `;
  
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }
  
  // Create modal footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  footer.style.cssText = `
    padding: 1.5rem;
    border-top: 1px solid var(--border-default);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  `;
  
  // Add default close button if no buttons provided and closable
  if (closable && !config.buttons) {
    const footerCloseBtn = document.createElement('button');
    footerCloseBtn.className = 'btn btn-outline';
    footerCloseBtn.textContent = 'Close';
    footerCloseBtn.addEventListener('click', () => {
      document.body.removeChild(modalElement);
      if (onClose) onClose();
    });
    footer.appendChild(footerCloseBtn);
  }
  
  modalElement.appendChild(header);
  modalElement.appendChild(body);
  modalElement.appendChild(footer);
  
  return modalElement;
};

/**
 * Initializes all modals on the page based on data attributes
 * @param {HTMLElement|Document} container - Container to search for modal triggers
 * @returns {Array<ModalDialog>} Array of initialized modal instances
 */
function initModals(container = document) {
  const triggers = container.querySelectorAll('[data-modal-trigger], [data-modal-id], [data-modal-target]');
  const instances = [];
  
  triggers.forEach(trigger => {
    if (!trigger.hasAttribute('data-modal-initialized')) {
      trigger.setAttribute('data-modal-initialized', 'true');
      
      const options = {
        animationDuration: parseInt(trigger.dataset.modalAnimationDuration) || 300,
        closeOnOverlayClick: trigger.dataset.modalCloseOnOverlayClick !== 'false',
        closeOnEscape: trigger.dataset.modalCloseOnEscape !== 'false',
        trapFocus: trigger.dataset.modalTrapFocus !== 'false',
        preventScroll: trigger.dataset.modalPreventScroll !== 'false'
      };
      
      const instance = new ModalDialog(trigger, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize modals when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initModals();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModalDialog, initModals };
}

// Also make it available globally
window.ModalDialog = ModalDialog;
window.initModals = initModals;