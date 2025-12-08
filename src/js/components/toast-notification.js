/**
 * Toast Notification System
 * Accessible toast notifications with various positions and types
 * Compatible with jazer-brand.css styling
 */

class ToastSystem {
  /**
   * Creates a new toast system instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      position: 'top-right', // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
      timeout: 5000, // Duration before auto-hiding (0 for persistent)
      maxToasts: 5, // Maximum number of toasts visible at once
      preventDuplicates: true,
      ...options
    };
    
    this.toasts = [];
    this.container = null;
    
    this.init();
  }

  /**
   * Initializes the toast system
   */
  init() {
    this.createContainer();
  }

  /**
   * Creates the toast container element
   */
  createContainer() {
    // Determine container class based on position
    let containerClasses = 'toast-container';
    let positionStyles = '';
    
    switch (this.options.position) {
      case 'top-left':
        positionStyles = 'top: 1rem; left: 1rem;';
        break;
      case 'top-right':
        positionStyles = 'top: 1rem; right: 1rem;';
        break;
      case 'bottom-left':
        positionStyles = 'bottom: 1rem; left: 1rem;';
        break;
      case 'bottom-right':
        positionStyles = 'bottom: 1rem; right: 1rem;';
        break;
      case 'top-center':
        positionStyles = 'top: 1rem; left: 50%; transform: translateX(-50%);';
        break;
      case 'bottom-center':
        positionStyles = 'bottom: 1rem; left: 50%; transform: translateX(-50%);';
        break;
      case 'center':
        positionStyles = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        break;
      default: // top-right
        positionStyles = 'top: 1rem; right: 1rem;';
    }
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      z-index: 10000;
      ${positionStyles}
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 350px;
      min-width: 280px;
      width: auto;
    `;
    
    document.body.appendChild(this.container);
  }

  /**
   * Shows a toast notification
   * @param {string|Object} messageOrOptions - Either the message string or full options object
   * @param {Object} options - Options for the toast (if first parameter is a string)
   */
  show(messageOrOptions, options = {}) {
    let toastOptions;

    if (typeof messageOrOptions === 'string') {
      toastOptions = {
        message: messageOrOptions,
        type: 'info',
        title: null,
        position: this.options.position,
        timeout: this.options.timeout,
        closable: true,
        ...options
      };
    } else {
      toastOptions = {
        ...this.options,
        message: messageOrOptions.message || 'Notification',
        type: messageOrOptions.type || 'info',
        title: messageOrOptions.title || null,
        position: messageOrOptions.position || this.options.position,
        timeout: messageOrOptions.timeout !== undefined ? messageOrOptions.timeout : this.options.timeout,
        closable: messageOrOptions.closable !== false,
        ...options
      };
    }

    // Prevent duplicates if enabled
    if (this.options.preventDuplicates) {
      const existingToast = this.toasts.find(t =>
        t.message === toastOptions.message &&
        t.type === toastOptions.type &&
        t.visible
      );
      if (existingToast) {
        // If a duplicate exists, just reset its timer
        this.resetTimer(existingToast.id);
        return existingToast.id;
      }
    }

    // Create toast element
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toastElement = this.createToastElement(toastOptions, id);

    // Add to toasts array
    const toastData = {
      id: id,
      element: toastElement,
      message: toastOptions.message,
      visible: true,
      timeoutId: null,
      type: toastOptions.type,
      title: toastOptions.title,
      position: toastOptions.position,
      timeout: toastOptions.timeout,
      closable: toastOptions.closable
    };

    this.toasts.push(toastData);

    // Add to DOM
    this.container.appendChild(toastElement);

    // Limit number of visible toasts
    if (this.options.maxToasts && this.toasts.filter(t => t.visible).length > this.options.maxToasts) {
      const oldestToast = this.toasts.find(t => t.visible);
      if (oldestToast) {
        this.hide(oldestToast.id);
      }
    }

    // Set timer for auto-hide
    if (toastOptions.timeout > 0) {
      toastData.timeoutId = setTimeout(() => {
        this.hide(id);
      }, toastOptions.timeout);
    }

    // Return the toast ID for potential manual management
    return id;
  }

  /**
   * Creates a toast element with the specified options
   * @param {Object} options - Toast options
   * @param {string} id - Unique ID for the toast
   * @returns {HTMLElement} Toast element
   */
  createToastElement(options, id) {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${options.type || 'info'} toast-animate`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = `
      background: var(--bg-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      box-shadow: var(--shadow-card);
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
      transition: all 0.3s ease;
      position: relative;
      min-height: 60px;
    `;
    
    // Add icon based on type
    let icon = 'ℹ️';
    switch (options.type) {
      case 'success':
        icon = '✓';
        toast.style.borderTop = '3px solid var(--success-color, #00ff88)';
        break;
      case 'warning':
        icon = '⚠️';
        toast.style.borderTop = '3px solid var(--warning-color, #ffcc00)';
        break;
      case 'error':
        icon = '❌';
        toast.style.borderTop = '3px solid var(--error-color, #ff4444)';
        break;
      case 'info':
      default:
        toast.style.borderTop = '3px solid var(--info-color, var(--jazer-cyan))';
    }
    
    const iconDiv = document.createElement('div');
    iconDiv.textContent = icon;
    iconDiv.style.cssText = `
      font-size: 1.25rem;
      margin-top: 2px;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.flex = '1';
    
    if (options.title) {
      const titleDiv = document.createElement('div');
      titleDiv.textContent = options.title;
      titleDiv.style.cssText = `
        font-weight: bold;
        margin-bottom: 0.25rem;
        color: var(--text-light);
      `;
      contentDiv.appendChild(titleDiv);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.textContent = options.message;
    messageDiv.style.color = 'var(--text-gray)';
    contentDiv.appendChild(messageDiv);
    
    // Add close button if permitted
    if (options.closable) {
      const closeButton = document.createElement('button');
      closeButton.className = 'toast-close';
      closeButton.innerHTML = '✕';
      closeButton.style.cssText = `
        background: none;
        border: none;
        color: var(--text-gray);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease;
      `;
      
      closeButton.addEventListener('click', () => {
        this.hide(id);
      });
      
      toast.appendChild(iconDiv);
      toast.appendChild(contentDiv);
      toast.appendChild(closeButton);
    } else {
      toast.appendChild(iconDiv);
      toast.appendChild(contentDiv);
    }
    
    // Trigger entrance animation
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0) scale(1)';
    }, 10);
    
    return toast;
  }

  /**
   * Hides a specific toast
   * @param {string} id - ID of the toast to hide
   */
  hide(id) {
    const toastData = this.toasts.find(t => t.id === id);
    if (!toastData || !toastData.visible) return;
    
    // Clear timeout if exists
    if (toastData.timeoutId) {
      clearTimeout(toastData.timeoutId);
    }
    
    const toastElement = toastData.element;
    if (toastElement) {
      // Animate out
      toastElement.style.transition = 'all 0.3s ease';
      toastElement.style.opacity = '0';
      toastElement.style.transform = 'translateY(-10px) scale(0.95)';
      
      toastElement.addEventListener('transitionend', () => {
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }, { once: true });
    }
    
    // Mark as invisible
    toastData.visible = false;
  }

  /**
   * Hides all visible toasts
   */
  hideAll() {
    this.toasts.forEach(toast => {
      if (toast.visible) {
        this.hide(toast.id);
      }
    });
  }

  /**
   * Shows a success toast notification
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   * @returns {string} ID of the created toast
   */
  success(message, options = {}) {
    return this.show({
      message,
      type: 'success',
      ...options
    });
  }

  /**
   * Shows an error toast notification
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @returns {string} ID of the created toast
   */
  error(message, options = {}) {
    return this.show({
      message,
      type: 'error',
      ...options
    });
  }

  /**
   * Shows a warning toast notification
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   * @returns {string} ID of the created toast
   */
  warning(message, options = {}) {
    return this.show({
      message,
      type: 'warning',
      ...options
    });
  }

  /**
   * Shows an info toast notification
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   * @returns {string} ID of the created toast
   */
  info(message, options = {}) {
    return this.show({
      message,
      type: 'info',
      ...options
    });
  }

  /**
   * Resets the auto-hide timer for a specific toast
   * @param {string} id - ID of the toast
   */
  resetTimer(id) {
    const toastData = this.toasts.find(t => t.id === id);
    if (toastData && toastData.timeoutId) {
      clearTimeout(toastData.timeoutId);
      
      if (toastData.timeout > 0) {
        toastData.timeoutId = setTimeout(() => {
          this.hide(id);
        }, toastData.timeout);
      }
    }
  }
}

// Global instance of ToastSystem for convenience
window.Toast = new ToastSystem();

/**
 * Convenient functions for different toast types
 */
window.showToast = (message, type = 'info', options = {}) => {
  return Toast.show({
    message,
    type,
    ...options
  });
};

window.showSuccess = (message, options = {}) => {
  return Toast.success(message, options);
};

window.showError = (message, options = {}) => {
  return Toast.error(message, options);
};

window.showWarning = (message, options = {}) => {
  return Toast.warning(message, options);
};

window.showInfo = (message, options = {}) => {
  return Toast.info(message, options);
};

/**
 * Initializes toast system when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Toast system is already initialized as global Toast instance
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastSystem, Toast };
}