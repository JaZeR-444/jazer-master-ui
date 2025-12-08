/**
 * Utilities - JaZeR Brand Component Library
 * Collection of reusable utility functions and components
 */

class UtilityComponents {
  /**
   * Creates a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type of toast (success, error, warning, info)
   * @param {number} timeout - Timeout in milliseconds before hiding (0 for persistent)
   */
  static showToast(message, type = 'info', timeout = 5000) {
    const toastId = 'toast-' + Date.now();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
      </div>
    `;
    
    // Add styles dynamically if not already present
    this.addToastStyles();
    
    // Make the toast clickable to dismiss it
    toast.addEventListener('click', () => {
      this.removeToast(toastId);
    });
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeToast(toastId);
    });
    
    // Add to page
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 100);
    
    // Auto-remove if timeout specified
    if (timeout > 0) {
      setTimeout(() => {
        this.removeToast(toastId);
      }, timeout);
    }
    
    return toastId;
  }

  /**
   * Removes a toast notification
   * @param {string} toastId - The ID of the toast to remove
   */
  static removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  /**
   * Adds necessary styles for toast notifications
   */
  static addToastStyles() {
    if (document.getElementById('toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        right: 2rem;
        top: 2rem;
        min-width: 300px;
        max-width: 400px;
        background: #1a1a1a;
        border: 2px solid var(--border-default);
        border-radius: 12px;
        padding: 1rem;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 242, 234, 0.2);
      }
      
      .toast.toast-show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .toast.toast-hide {
        opacity: 0;
        transform: translateX(100%);
      }
      
      .toast.success {
        border-color: #00ff88;
        box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
      }
      
      .toast.error {
        border-color: #ff4444;
        box-shadow: 0 10px 30px rgba(255, 68, 68, 0.3);
      }
      
      .toast.warning {
        border-color: #ffcc00;
        box-shadow: 0 10px 30px rgba(255, 204, 0, 0.3);
      }
      
      .toast.info {
        border-color: var(--jazer-cyan);
        box-shadow: 0 10px 30px rgba(0, 242, 234, 0.3);
      }
      
      .toast-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .toast-message {
        flex: 1;
        margin-right: 1rem;
      }
      
      .toast-close {
        background: none;
        border: none;
        color: var(--text-light);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Creates a loading spinner overlay
   * @param {string} message - Optional message to show with spinner
   * @param {boolean} fullScreen - Whether to cover entire screen
   * @returns {Function} Function to remove the spinner
   */
  static showSpinner(message = '', fullScreen = false) {
    const spinnerId = 'spinner-' + Date.now();
    const spinner = document.createElement('div');
    spinner.id = spinnerId;
    spinner.className = `loading-spinner ${fullScreen ? 'fullscreen' : 'overlay'}`;
    
    spinner.innerHTML = `
      <div class="spinner-container">
        <div class="spinner-loader"></div>
        ${message ? `<div class="spinner-message">${message}</div>` : ''}
      </div>
    `;
    
    // Add spinner styles if not present
    this.addSpinnerStyles();
    
    document.body.appendChild(spinner);
    
    return () => {
      this.removeSpinner(spinnerId);
    };
  }

  /**
   * Removes the loading spinner
   * @param {string} spinnerId - The ID of the spinner to remove
   */
  static removeSpinner(spinnerId) {
    const spinner = document.getElementById(spinnerId);
    if (spinner) {
      spinner.style.opacity = '0';
      setTimeout(() => {
        if (spinner.parentNode) {
          spinner.parentNode.removeChild(spinner);
        }
      }, 300);
    }
  }

  /**
   * Adds necessary styles for loading spinner
   */
  static addSpinnerStyles() {
    if (document.getElementById('spinner-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      .loading-spinner {
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
        opacity: 1;
        transition: opacity 0.3s ease;
      }
      
      .loading-spinner.fullscreen {
        position: fixed;
      }
      
      .loading-spinner.overlay {
        position: absolute;
      }
      
      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        background: rgba(26, 26, 26, 0.9);
        border-radius: 16px;
        border: 2px solid var(--border-default);
      }
      
      .spinner-loader {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(0, 242, 234, 0.3);
        border-top: 4px solid var(--jazer-cyan);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .spinner-message {
        margin-top: 1rem;
        color: var(--text-light);
        font-weight: var(--font-secondary);
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Creates a confirmation dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @returns {Promise<boolean>} Promise resolving to true if confirmed
   */
  static confirmDialog(title, message) {
    return new Promise((resolve) => {
      const dialogId = 'dialog-' + Date.now();
      const dialog = document.createElement('div');
      dialog.id = dialogId;
      dialog.className = 'dialog-overlay';
      
      dialog.innerHTML = `
        <div class="dialog-container">
          <div class="dialog-header">
            <h3>${title}</h3>
          </div>
          <div class="dialog-body">
            <p>${message}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-outline dialog-cancel">Cancel</button>
            <button class="btn btn-danger dialog-confirm">Confirm</button>
          </div>
        </div>
      `;
      
      // Add dialog styles if not present
      this.addDialogStyles();
      
      // Add event listeners
      dialog.querySelector('.dialog-confirm').addEventListener('click', () => {
        resolve(true);
        this.removeDialog(dialogId);
      });
      
      dialog.querySelector('.dialog-cancel').addEventListener('click', () => {
        resolve(false);
        this.removeDialog(dialogId);
      });
      
      // Close on overlay click
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          resolve(false);
          this.removeDialog(dialogId);
        }
      });
      
      document.body.appendChild(dialog);
      
      // Trigger animation
      setTimeout(() => {
        dialog.classList.add('dialog-show');
      }, 10);
    });
  }

  /**
   * Removes the confirmation dialog
   * @param {string} dialogId - The ID of the dialog to remove
   */
  static removeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
      dialog.classList.remove('dialog-show');
      dialog.classList.add('dialog-hide');
      
      setTimeout(() => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      }, 300);
    }
  }

  /**
   * Adds necessary styles for dialog
   */
  static addDialogStyles() {
    if (document.getElementById('dialog-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dialog-styles';
    style.textContent = `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .dialog-overlay.dialog-show {
        opacity: 1;
      }
      
      .dialog-overlay.dialog-hide {
        opacity: 0;
      }
      
      .dialog-container {
        background: var(--bg-dark);
        border: 2px solid var(--border-default);
        border-radius: 16px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      
      .dialog-overlay.dialog-show .dialog-container {
        transform: scale(1);
      }
      
      .dialog-header {
        padding: 1.5rem 1.5rem 0.5rem;
      }
      
      .dialog-header h3 {
        font-family: var(--font-primary);
        font-size: 1.5rem;
        margin: 0;
        background: var(--gradient-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .dialog-body {
        padding: 0 1.5rem 1rem;
      }
      
      .dialog-footer {
        padding: 1rem 1.5rem;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        border-top: 1px solid var(--border-default);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Copies text to clipboard with feedback
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!', 'success', 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      this.showToast('Failed to copy to clipboard', 'error', 3000);
      return false;
    }
  }

  /**
   * Shows a tooltip on an element
   * @param {HTMLElement} element - Element to attach tooltip to
   * @param {string} text - Tooltip text
   * @param {string} position - Position: top, bottom, left, right (default: top)
   */
  static showTooltip(element, text, position = 'top') {
    // Remove any existing tooltip
    if (element._currentTooltip) {
      this.removeTooltip(element);
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      z-index: 10002;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    switch (position) {
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 8;
        break;
      case 'top':
      default:
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
    }
    
    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.opacity = '1';
    
    element._currentTooltip = tooltip;
    
    // Show for 3 seconds then fade out
    setTimeout(() => {
      this.removeTooltip(element);
    }, 3000);
  }

  /**
   * Removes a tooltip from an element
   * @param {HTMLElement} element - Element with tooltip
   */
  static removeTooltip(element) {
    if (element._currentTooltip && element._currentTooltip.parentNode) {
      element._currentTooltip.style.opacity = '0';
      setTimeout(() => {
        if (element._currentTooltip && element._currentTooltip.parentNode) {
          element._currentTooltip.parentNode.removeChild(element._currentTooltip);
        }
      }, 200);
      element._currentTooltip = null;
    }
  }

  /**
   * Validates an email address
   * @param {string} email - Email to validate
   * @returns {boolean} Whether the email is valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Formats a number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Debounces a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

/**
 * Initializes utility components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Add data-confirm attribute support to links/buttons
  document.addEventListener('click', (e) => {
    const confirmEl = e.target.closest('[data-confirm]');
    if (confirmEl) {
      e.preventDefault();
      const message = confirmEl.getAttribute('data-confirm-message') || 'Are you sure?';
      const title = confirmEl.getAttribute('data-confirm-title') || 'Confirm Action';
      
      UtilityComponents.confirmDialog(title, message).then(confirmed => {
        if (confirmed) {
          // Perform the original action
          if (confirmEl.tagName === 'A' && confirmEl.href) {
            window.location.href = confirmEl.href;
          } else if (confirmEl.type === 'submit' || confirmEl.classList.contains('submit-btn')) {
            // Form submission handling
            const form = confirmEl.closest('form');
            if (form) {
              form.submit();
            }
          } else if (confirmEl.onclick) {
            confirmEl.onclick();
          }
        }
      });
    }
  });
  
  // Add copy-to-clipboard support
  document.addEventListener('click', (e) => {
    const copyEl = e.target.closest('[data-copy]');
    if (copyEl) {
      const text = copyEl.getAttribute('data-copy') || copyEl.textContent.trim();
      UtilityComponents.copyToClipboard(text);
    }
  });
  
  // Add tooltip support
  document.addEventListener('mouseenter', (e) => {
    const tooltipEl = e.target.closest('[data-tooltip]');
    if (tooltipEl) {
      const text = tooltipEl.getAttribute('data-tooltip');
      const position = tooltipEl.getAttribute('data-tooltip-position') || 'top';
      UtilityComponents.showTooltip(tooltipEl, text, position);
    }
  });
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UtilityComponents };
}

// Make it available globally
window.UtilityComponents = UtilityComponents;