/**
 * Modal Template
 * Reusable modal template with accessibility and customization options
 * Compatible with jazer-brand.css styling for modal components
 */

class ModalTemplate {
  /**
   * Creates a new modal template instance
   * @param {Object} config - Modal configuration
   */
  constructor(config) {
    this.config = {
      // Basic modal properties
      id: `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Modal Title',
      content: '',
      className: 'modal-template',
      size: 'medium', // 'small', 'medium', 'large', 'full'
      position: 'center', // 'center', 'top', 'bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end'
      
      // Behavior options
      showCloseButton: true,
      closeOnEscape: true,
      closeOnOverlayClick: true,
      autoFocus: true,
      restoreFocus: true,
      
      // Animation options
      animationType: 'fade', // 'fade', 'slide', 'zoom', 'none'
      animationDuration: 300,
      backdrop: true,
      
      // Callbacks
      onOpen: null,
      onClose: null,
      onOpened: null,
      onClosed: null,
      
      // Accessibility
      role: 'dialog',
      ariaLabelledBy: null,
      ariaDescribedBy: null,
      ...config
    };

    this.isOpen = false;
    this.element = null;
    this.overlay = null;
    this.originalFocusedElement = null;
    this.modalElement = null;
    this.focusableElements = [];
    this.focusTrapActive = false;
    
    this.createModal();
  }

  /**
   * Creates the modal element with all components
   * @returns {void}
   */
  createModal() {
    // Create main modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = `modal-container ${this.config.className}`;
    this.modalElement.id = this.config.id;
    this.modalElement.setAttribute('role', this.config.role);
    this.modalElement.setAttribute('aria-modal', 'true');
    this.modalElement.setAttribute('tabindex', '-1');
    
    if (this.config.ariaLabelledBy) {
      this.modalElement.setAttribute('aria-labelledby', this.config.ariaLabelledBy);
    }
    
    if (this.config.ariaDescribedBy) {
      this.modalElement.setAttribute('aria-describedby', this.config.ariaDescribedBy);
    }

    // Create overlay if enabled
    if (this.config.backdrop) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'modal-overlay';
      this.overlay.setAttribute('aria-hidden', 'true');
    }

    // Create modal content wrapper
    const modalContent = document.createElement('div');
    modalContent.className = `modal-content modal-size-${this.config.size} modal-position-${this.config.position}`;
    modalContent.setAttribute('aria-describedby', `${this.config.id}-content`);

    // Create header
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    if (this.config.title) {
      const title = document.createElement('h2');
      title.className = 'modal-title';
      title.id = `${this.config.id}-title`;
      title.textContent = this.config.title;
      header.appendChild(title);
    }

    // Create close button if enabled
    if (this.config.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.setAttribute('aria-label', 'Close modal');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.close());
      header.appendChild(closeBtn);
    }

    modalContent.appendChild(header);

    // Create body
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.id = `${this.config.id}-content`;
    
    if (typeof this.config.content === 'string') {
      body.innerHTML = this.config.content;
    } else if (this.config.content instanceof HTMLElement) {
      body.appendChild(this.config.content);
    } else if (typeof this.config.content === 'function') {
      const contentResult = this.config.content();
      if (typeof contentResult === 'string') {
        body.innerHTML = contentResult;
      } else if (contentResult instanceof HTMLElement) {
        body.appendChild(contentResult);
      }
    }
    
    modalContent.appendChild(body);

    // Create footer if needed
    if (this.config.footer) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      
      if (typeof this.config.footer === 'string') {
        footer.innerHTML = this.config.footer;
      } else if (this.config.footer instanceof HTMLElement) {
        footer.appendChild(this.config.footer);
      } else if (typeof this.config.footer === 'object' && this.config.footer.buttons) {
        // Create buttons from configuration
        this.config.footer.buttons.forEach(buttonConfig => {
          const button = document.createElement('button');
          Object.assign(button, buttonConfig);
          button.className = `btn ${buttonConfig.className || 'btn-secondary'}`;
          button.addEventListener('click', buttonConfig.action || (() => {}));
          footer.appendChild(button);
        });
      }
      
      modalContent.appendChild(footer);
    }

    this.modalElement.appendChild(modalContent);

    // Bind events
    this.bindModalEvents();
  }

  /**
   * Binds events to the modal
   */
  bindModalEvents() {
    // Close on escape key if enabled
    if (this.config.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }

    // Close on overlay click if enabled
    if (this.config.closeOnOverlayClick && this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Prevent closing on modal content click
    if (this.config.closeOnOverlayClick) {
      this.modalElement.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Focus management for accessibility
    this.modalElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }
    });
  }

  /**
   * Handles Tab key for focus trapping
   * @param {Event} e - Keyboard event
   */
  handleTabKey(e) {
    const focusable = this.getFocusableElements();
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }

  /**
   * Gets all focusable elements within the modal
   * @returns {Array} Array of focusable elements
   */
  getFocusableElements() {
    const focusableSelectors = [
      'a[href]', 
      'button:not([disabled])', 
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])', 
      'textarea:not([disabled])', 
      '[contenteditable]:not([contenteditable="false"])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return Array.from(
      this.modalElement.querySelectorAll(focusableSelectors.join(', '))
    ).filter(el => !el.disabled && !el.hidden && el.tabIndex !== -1);
  }

  /**
   * Opens the modal with optional animation
   * @param {Object} options - Open options
   * @returns {Promise} Promise that resolves when modal is opened
   */
  async open(options = {}) {
    // Execute opening callback
    if (this.config.onOpen) {
      this.config.onOpen(this);
    }

    // Store currently focused element to restore later
    if (this.config.restoreFocus) {
      this.originalFocusedElement = document.activeElement;
    }

    // Add modal and overlay to DOM
    if (this.overlay) {
      document.body.appendChild(this.overlay);
    }
    document.body.appendChild(this.modalElement);

    // Apply animation class
    this.modalElement.classList.add(`modal-${this.config.animationType}-enter`);
    if (this.overlay) {
      this.overlay.classList.add(`modal-overlay-${this.config.animationType}-enter`);
    }

    // Focus modal for accessibility
    if (this.config.autoFocus) {
      this.modalElement.focus();
    }

    // Set accessibility attributes
    this.modalElement.setAttribute('aria-hidden', 'false');
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'false');
    }

    // Show modal
    this.modalElement.style.display = 'block';
    if (this.overlay) {
      this.overlay.style.display = 'block';
    }

    // Wait for animation to complete
    await new Promise(resolve => {
      setTimeout(() => {
        this.modalElement.classList.remove(`modal-${this.config.animationType}-enter`);
        this.modalElement.classList.add('modal-open');
        
        if (this.overlay) {
          this.overlay.classList.remove(`modal-overlay-${this.config.animationType}-enter`);
          this.overlay.classList.add('modal-overlay-open');
        }
        
        this.isOpen = true;
        this.focusTrapActive = true;
        
        // Focus first focusable element in modal
        const focusable = this.getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
        
        // Execute opened callback
        if (this.config.onOpened) {
          this.config.onOpened(this);
        }
        
        resolve();
      }, this.config.animationDuration);
    });
  }

  /**
   * Closes the modal with optional animation
   * @param {Object} options - Close options
   * @returns {Promise} Promise that resolves when modal is closed
   */
  async close(options = {}) {
    if (!this.isOpen) {
      return Promise.resolve();
    }

    // Execute closing callback
    if (this.config.onClose) {
      this.config.onClose(this);
    }

    // Apply closing animation
    this.modalElement.classList.add(`modal-${this.config.animationType}-leave`);
    this.modalElement.classList.remove('modal-open');
    
    if (this.overlay) {
      this.overlay.classList.add(`modal-overlay-${this.config.animationType}-leave`);
      this.overlay.classList.remove('modal-overlay-open');
    }

    // Wait for animation to complete
    await new Promise(resolve => {
      setTimeout(() => {
        // Remove from DOM
        if (this.modalElement.parentNode) {
          this.modalElement.parentNode.removeChild(this.modalElement);
        }
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }

        // Restore focus to original element
        if (this.config.restoreFocus && this.originalFocusedElement && this.originalFocusedElement.focus) {
          this.originalFocusedElement.focus();
        }

        this.isOpen = false;
        this.focusTrapActive = false;

        // Execute closed callback
        if (this.config.onClosed) {
          this.config.onClosed(this);
        }

        resolve();
      }, this.config.animationDuration);
    });
  }

  /**
   * Toggles the modal open/closed state
   * @returns {Promise} Promise that resolves when toggle is complete
   */
  async toggle() {
    if (this.isOpen) {
      return this.close();
    } else {
      return this.open();
    }
  }

  /**
   * Updates the modal content
   * @param {string|HTMLElement} content - New content
   * @returns {ModalTemplate} Current instance
   */
  setContent(content) {
    const body = this.modalElement.querySelector('.modal-body');
    
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.innerHTML = '';
      body.appendChild(content);
    }
    
    return this;
  }

  /**
   * Updates the modal title
   * @param {string} title - New title
   * @returns {ModalTemplate} Current instance
   */
  setTitle(title) {
    const titleEl = this.modalElement.querySelector('.modal-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
    
    return this;
  }

  /**
   * Shows a loading state in the modal
   * @param {string} message - Loading message (optional)
   * @returns {void}
   */
  showLoading(message = 'Loading...') {
    const body = this.modalElement.querySelector('.modal-body');
    const loader = document.createElement('div');
    loader.className = 'modal-loader';
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <div class="loader-text">${message}</div>
    `;
    
    // Clear existing content and add loader
    body.innerHTML = '';
    body.appendChild(loader);
  }

  /**
   * Hides the loading state
   * @returns {void}
   */
  hideLoading() {
    const loader = this.modalElement.querySelector('.modal-loader');
    if (loader) {
      loader.remove();
    }
  }

  /**
   * Sets the size of the modal
   * @param {string} size - Size ('small', 'medium', 'large', 'full')
   * @returns {ModalTemplate} Current instance
   */
  setSize(size) {
    // Remove old size class
    const sizeClasses = Array.from(this.modalElement.classList).filter(cls => cls.startsWith('modal-size-'));
    sizeClasses.forEach(cls => this.modalElement.classList.remove(cls));
    
    // Add new size class
    this.modalElement.classList.add(`modal-size-${size}`);
    this.config.size = size;
    
    return this;
  }

  /**
   * Sets the position of the modal
   * @param {string} position - Position ('center', 'top', 'bottom', etc.)
   * @returns {ModalTemplate} Current instance
   */
  setPosition(position) {
    // Remove old position class
    const positionClasses = Array.from(this.modalElement.classList).filter(cls => cls.startsWith('modal-position-'));
    positionClasses.forEach(cls => this.modalElement.classList.remove(cls));
    
    // Add new position class
    this.modalElement.classList.add(`modal-position-${position}`);
    this.config.position = position;
    
    return this;
  }

  /**
   * Adds a button to the modal footer
   * @param {Object} buttonConfig - Button configuration
   * @returns {ModalTemplate} Current instance
   */
  addButton(buttonConfig) {
    const footer = this.modalElement.querySelector('.modal-footer');
    
    if (!footer) {
      // Create footer if it doesn't exist
      const newFooter = document.createElement('div');
      newFooter.className = 'modal-footer';
      this.modalElement.appendChild(newFooter);
    }
    
    const button = document.createElement('button');
    Object.assign(button, buttonConfig);
    button.className = `btn ${buttonConfig.className || 'btn-secondary'}`;
    button.addEventListener('click', buttonConfig.action || (() => {}));
    
    (footer || newFooter).appendChild(button);
    
    return this;
  }

  /**
   * Removes a button from the modal
   * @param {string} buttonText - Text of button to remove
   * @returns {boolean} Whether the button was removed
   */
  removeButton(buttonText) {
    const footer = this.modalElement.querySelector('.modal-footer');
    if (!footer) return false;
    
    const button = Array.from(footer.querySelectorAll('button'))
      .find(btn => btn.textContent === buttonText);
    
    if (button) {
      footer.removeChild(button);
      return true;
    }
    
    return false;
  }

  /**
   * Gets the current modal state
   * @returns {Object} Modal state object
   */
  getState() {
    return {
      id: this.config.id,
      isOpen: this.isOpen,
      title: this.config.title,
      content: this.config.content,
      size: this.config.size,
      position: this.config.position,
      element: this.modalElement,
      originalFocusedElement: this.originalFocusedElement
    };
  }

  /**
   * Updates the modal configuration
   * @param {Object} newConfig - New configuration to merge
   * @returns {ModalTemplate} Current instance
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.title !== undefined) {
      this.setTitle(newConfig.title);
    }
    
    if (newConfig.content !== undefined) {
      this.setContent(newConfig.content);
    }
    
    if (newConfig.size !== undefined) {
      this.setSize(newConfig.size);
    }
    
    if (newConfig.position !== undefined) {
      this.setPosition(newConfig.position);
    }
    
    return this;
  }

  /**
   * Destroys the modal instance and cleans up
   * @returns {void}
   */
  destroy() {
    // Close modal if open
    if (this.isOpen) {
      this.close();
    }

    // Remove event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }

    // Remove from DOM if still there
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  /**
   * Creates a confirmation modal
   * @param {Object} options - Confirmation modal options
   * @returns {Promise} Promise that resolves when user confirms/cancels
   */
  static createConfirmation(options) {
    const {
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      ...config
    } = options;

    return new Promise((resolve) => {
      const confirmModal = new ModalTemplate({
        title,
        content: `<p>${message}</p>`,
        footer: {
          buttons: [
            {
              text: cancelText,
              className: 'btn btn-outline',
              action: () => {
                confirmModal.close();
                resolve(false);
              }
            },
            {
              text: confirmText,
              className: 'btn btn-primary',
              action: () => {
                confirmModal.close();
                resolve(true);
              }
            }
          ]
        },
        closeOnOverlayClick: false,
        closeOnEscape: false,
        ...config
      });

      confirmModal.open();
    });
  }

  /**
   * Creates a prompt modal
   * @param {Object} options - Prompt modal options
   * @returns {Promise} Promise that resolves with user input
   */
  static createPrompt(options) {
    const {
      title = 'Enter Value',
      placeholder = 'Type here...',
      defaultValue = '',
      ...config
    } = options;

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = placeholder;
      input.value = defaultValue;
      input.className = 'form-input';

      const promptModal = new ModalTemplate({
        title,
        content: input,
        footer: {
          buttons: [
            {
              text: 'Cancel',
              className: 'btn btn-outline',
              action: () => {
                promptModal.close();
                resolve(null);
              }
            },
            {
              text: 'OK',
              className: 'btn btn-primary',
              action: () => {
                const value = input.value;
                promptModal.close();
                resolve(value);
              }
            }
          ]
        },
        ...config
      });

      // Handle Enter key to submit
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const value = input.value;
          promptModal.close();
          resolve(value);
        }
      });

      promptModal.open();
    });
  }

  /**
   * Creates a notification modal
   * @param {Object} options - Notification modal options
   * @returns {ModalTemplate} Notification modal instance
   */
  static createNotification(options) {
    const {
      title = 'Notification',
      message = 'New notification',
      type = 'info', // 'info', 'success', 'warning', 'error'
      duration = 3000, // Auto close after duration
      ...config
    } = options;

    const notificationModal = new ModalTemplate({
      title,
      content: `<div class="notification-${type}">${message}</div>`,
      showCloseButton: true,
      closeOnOverlayClick: true,
      ...config
    });

    // Auto-close if duration is set
    if (duration > 0) {
      setTimeout(() => {
        notificationModal.close();
      }, duration);
    }

    return notificationModal;
  }

  /**
   * Adds dynamic styles for modal elements
   */
  addDynamicStyles() {
    if (document.getElementById('modal-template-styles')) return;

    const style = document.createElement('style');
    style.id = 'modal-template-styles';
    style.textContent = `
      .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: none;
        opacity: 0;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .modal-container.modal-open {
        opacity: 1;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        display: none;
        opacity: 0;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .modal-overlay.modal-overlay-open {
        opacity: 1;
      }

      .modal-content {
        position: relative;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        max-height: 90vh;
        overflow: hidden;
        outline: none;
      }

      /* Position variations */
      .modal-position-center .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .modal-position-top .modal-content {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .modal-position-bottom .modal-content {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      /* Size variations */
      .modal-size-small .modal-content {
        width: 300px;
        max-width: 90vw;
      }

      .modal-size-medium .modal-content {
        width: 500px;
        max-width: 90vw;
      }

      .modal-size-large .modal-content {
        width: 800px;
        max-width: 95vw;
      }

      .modal-size-full .modal-content {
        width: 95vw;
        height: 90vh;
        max-width: 98vw;
        max-height: 95vh;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .modal-size-medium .modal-content,
        .modal-size-large .modal-content {
          width: 95vw;
          transform: translateX(-50%);
        }
        
        .modal-size-full .modal-content {
          width: 98vw;
          height: 95vh;
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 10px;
        border-bottom: 1px solid var(--border-lighter, #222);
      }

      .modal-title {
        margin: 0;
        color: var(--jazer-cyan, #00f2ea);
        font-size: 1.25rem;
      }

      .modal-close {
        background: none;
        border: none;
        color: var(--text-lighter, #fff);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
      }

      .modal-close:hover {
        background: var(--bg-darker, #111);
      }

      .modal-body {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .modal-footer {
        padding: 15px 20px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid var(--border-lighter, #222);
      }

      .modal-loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
      }

      .loader-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 242, 234, 0.2);
        border-top: 4px solid var(--jazer-cyan, #00f2ea);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }

      .loader-text {
        color: var(--text-lighter, #fff);
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Animation variants */
      .modal-fade-enter {
        opacity: 0;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .modal-fade-leave {
        opacity: 0;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .modal-slide-enter {
        transform: translate(-50%, -40px);
        opacity: 0;
        transition: transform ${this.config.animationDuration}ms ease, opacity ${this.config.animationDuration}ms ease;
      }

      .modal-slide-leave {
        transform: translate(-50%, -40px);
        opacity: 0;
        transition: transform ${this.config.animationDuration}ms ease, opacity ${this.config.animationDuration}ms ease;
      }

      .modal-overlay-fade-enter {
        opacity: 0;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .modal-overlay-fade-leave {
        opacity: 0;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .notification-info { color: #4facfe; }
      .notification-success { color: #00f288; }
      .notification-warning { color: #ffcc00; }
      .notification-error { color: #ff4444; }

      /* Focus styles for accessibility */
      .modal-content:focus {
        outline: 2px solid var(--jazer-cyan, #00f2ea);
        outline-offset: 2px;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Creates a new modal template instance
 * @param {Object} config - Modal configuration
 * @returns {ModalTemplate} New modal template instance
 */
function createModalTemplate(config) {
  return new ModalTemplate(config);
}

/**
 * Modal template utilities
 */
const ModalTemplateUtils = {
  /**
   * Creates an alert modal
   * @param {string} message - Alert message
   * @param {Object} options - Modal options
   * @returns {ModalTemplate} Alert modal instance
   */
  alert(message, options = {}) {
    const alertModal = new ModalTemplate({
      title: 'Alert',
      content: `<p>${message}</p>`,
      footer: {
        buttons: [
          {
            text: 'OK',
            className: 'btn btn-primary',
            action: () => alertModal.close()
          }
        ]
      },
      ...options
    });

    alertModal.open();
    return alertModal;
  },

  /**
   * Creates a confirm modal with yes/no buttons
   * @param {string} message - Confirmation message
   * @param {Object} options - Modal options
   * @returns {Promise} Promise resolving to true/false based on user selection
   */
  async confirm(message, options = {}) {
    return ModalTemplate.createConfirmation({ message, ...options });
  },

  /**
   * Creates a prompt modal with input field
   * @param {string} message - Prompt message
   * @param {Object} options - Modal options
   * @returns {Promise} Promise resolving to user input or null
   */
  async prompt(message, options = {}) {
    return ModalTemplate.createPrompt({ message, ...options });
  },

  /**
   * Creates a loading modal
   * @param {string} message - Loading message
   * @param {Object} options - Modal options
   * @returns {ModalTemplate} Loading modal instance
   */
  loading(message = 'Loading...', options = {}) {
    const loadingModal = new ModalTemplate({
      title: 'Processing',
      content: `<div class="modal-loader">
                  <div class="loader-spinner"></div>
                  <div class="loader-text">${message}</div>
                </div>`,
      showCloseButton: false,
      closeOnEscape: false,
      closeOnOverlayClick: false,
      ...options
    });

    loadingModal.open();
    return loadingModal;
  }
};

// Set up dynamic styles
const modalTemplate = new ModalTemplate({ title: 'Modal Styler', content: '<!-- Styling only -->', showCloseButton: false });
modalTemplate.addDynamicStyles();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ModalTemplate,
    createModalTemplate,
    ModalTemplateUtils
  };
}

// Make available globally
window.ModalTemplate = ModalTemplate;
window.createModalTemplate = createModalTemplate;
window.ModalTemplateUtils = ModalTemplateUtils;