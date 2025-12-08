/**
 * Modal Dialog Component
 * A reusable modal dialog system with various options and configurations
 * Compatible with the jazer-brand.css styling
 */

class ModalDialog {
  constructor(options = {}) {
    this.options = {
      closeOnOverlayClick: true,
      closeOnEscape: true,
      animationClass: 'slide-up',
      ...options
    };
    
    this.modalElement = null;
    this.overlayElement = null;
    this.isOpen = false;
  }

  /**
   * Creates and opens a modal with the specified content
   * @param {Object} config - Configuration for the modal
   * @param {string} config.title - Title of the modal
   * @param {string|HTMLElement} config.content - Content to display in the modal
   * @param {Array} config.buttons - Array of button configurations
   * @returns {Promise} Resolves when modal is closed
   */
  open(config) {
    return new Promise((resolve) => {
      // Create modal elements
      this.createModalElements(config);
      
      // Add event listeners
      this.bindEvents(resolve);
      
      // Show modal with animation
      this.show();
      
      // Store the resolver for later use
      this.resolver = resolve;
    });
  }

  /**
   * Creates the modal DOM elements
   * @private
   */
  createModalElements(config) {
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
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = `modal-container ${this.options.animationClass}`;
    this.modalElement.style.cssText = `
      background: #000;
      border: 2px solid var(--border-default, #4facfe);
      border-radius: 16px;
      max-width: 90%;
      width: 500px;
      max-height: 90vh;
      overflow: hidden;
      transform: scale(0.8);
      transition: transform 0.3s ease, opacity 0.3s ease;
      position: relative;
    `;

    // Create modal header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.style.cssText = `
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-default, #4facfe);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.className = 'gradient-text';
    title.textContent = config.title || 'Modal Title';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create modal body
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.style.padding = '1.5rem';
    
    if (typeof config.content === 'string') {
      body.innerHTML = config.content;
    } else if (config.content instanceof HTMLElement) {
      body.appendChild(config.content);
    }

    // Create modal footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    footer.style.cssText = `
      padding: 1.5rem;
      border-top: 1px solid var(--border-default, #4facfe);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    `;

    // Add buttons to footer
    if (config.buttons && config.buttons.length > 0) {
      config.buttons.forEach(btnConfig => {
        const button = document.createElement('button');
        button.className = btnConfig.class || 'btn';
        button.textContent = btnConfig.text || 'OK';
        
        if (btnConfig.action) {
          button.addEventListener('click', () => {
            btnConfig.action(this);
          });
        }
        
        button.addEventListener('click', () => {
          this.close();
          this.resolver(btnConfig.value || true);
        });
        
        footer.appendChild(button);
      });
    } else {
      const okButton = document.createElement('button');
      okButton.className = 'btn';
      okButton.textContent = 'OK';
      okButton.addEventListener('click', () => {
        this.close();
        this.resolver(true);
      });
      footer.appendChild(okButton);
    }

    // Add close button event listener
    closeBtn.addEventListener('click', () => {
      this.close();
      this.resolver(false);
    });

    // Assemble modal
    this.modalElement.appendChild(header);
    this.modalElement.appendChild(body);
    this.modalElement.appendChild(footer);
    this.overlayElement.appendChild(this.modalElement);

    // Append to body
    document.body.appendChild(this.overlayElement);
  }

  /**
   * Binds event listeners to the modal
   * @private
   */
  bindEvents(resolve) {
    // Close on overlay click
    if (this.options.closeOnOverlayClick) {
      this.overlayElement.addEventListener('click', (e) => {
        if (e.target === this.overlayElement) {
          this.close();
          resolve(false);
        }
      });
    }

    // Close on Escape key
    if (this.options.closeOnEscape) {
      const handleEscape = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
          resolve(false);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }
  }

  /**
   * Shows the modal with animation
   * @private
   */
  show() {
    setTimeout(() => {
      this.overlayElement.style.opacity = '1';
      this.modalElement.style.transform = 'scale(1)';
      this.isOpen = true;
    }, 10);
  }

  /**
   * Closes the modal with animation
   */
  close() {
    if (!this.isOpen) return;
    
    this.modalElement.style.transform = 'scale(0.8)';
    this.overlayElement.style.opacity = '0';
    
    setTimeout(() => {
      if (this.overlayElement && this.overlayElement.parentNode) {
        this.overlayElement.parentNode.removeChild(this.overlayElement);
      }
      this.isOpen = false;
    }, 300);
  }
}

/**
 * Convenience function for creating simple alert modals
 * @param {string} title - Title of the alert
 * @param {string} message - Message content
 * @returns {Promise} Resolves when modal is closed
 */
ModalDialog.alert = function(title, message) {
  const modal = new ModalDialog();
  return modal.open({
    title: title,
    content: message,
    buttons: [
      {
        text: 'OK',
        class: 'btn',
        value: 'ok'
      }
    ]
  });
};

/**
 * Convenience function for creating confirmation modals
 * @param {string} title - Title of the confirmation
 * @param {string} message - Confirmation message
 * @returns {Promise} Resolves with true/false based on user selection
 */
ModalDialog.confirm = function(title, message) {
  const modal = new ModalDialog();
  return modal.open({
    title: title,
    content: message,
    buttons: [
      {
        text: 'Cancel',
        class: 'btn btn-outline',
        value: false
      },
      {
        text: 'OK',
        class: 'btn',
        value: true
      }
    ]
  });
};

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalDialog;
}

// Also make it available globally for older browsers
window.ModalDialog = ModalDialog;