/**
 * Notification Center Component
 * Centralized notification hub for managing various types of notifications
 * Compatible with jazer-brand.css styling
 */

class NotificationCenter {
  /**
   * Creates a new notification center component
   * @param {HTMLElement} centerElement - The notification center container element
   * @param {Object} options - Configuration options
   */
  constructor(centerElement, options = {}) {
    this.center = centerElement;
    this.options = {
      position: 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'
      maxNotifications: 10,
      defaultTimeout: 5000, // 5 seconds
      showCloseButton: true,
      enableSound: false,
      soundFile: null,
      showProgressBar: true,
      pauseOnHover: true,
      hideOnClick: true,
      theme: 'dark', // 'light', 'dark'
      ...options
    };

    this.notifications = [];
    this.container = null;

    this.init();
  }

  /**
   * Initializes the notification center
   */
  init() {
    // Set up the notification center structure
    this.setupCenter();

    // Add necessary CSS
    this.addDynamicStyles();
  }

  /**
   * Sets up the notification center structure
   */
  setupCenter() {
    // Add center classes
    this.center.classList.add('notification-center');
    this.center.classList.add(`notification-center-${this.options.position}`);
    this.center.classList.add(`notification-center-${this.options.theme}`);

    // Create notifications container
    this.container = document.createElement('div');
    this.container.classList.add('notifications-container');
    this.center.appendChild(this.container);
  }

  /**
   * Creates a new notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('info', 'success', 'warning', 'error')
   * @param {Object} options - Notification options
   * @returns {string} Notification ID
   */
  createNotification(message, type = 'info', options = {}) {
    const notificationOptions = {
      title: options.title || this.getTypeTitle(type),
      message: message,
      type: type,
      timeout: options.timeout !== undefined ? options.timeout : this.options.defaultTimeout,
      showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : this.options.showCloseButton,
      showProgressBar: options.showProgressBar !== undefined ? options.showProgressBar : this.options.showProgressBar,
      onClick: options.onClick || null,
      onClose: options.onClose || null,
      ...options
    };

    // Create notification element
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notificationElement = this.createNotificationElement(notificationId, notificationOptions);

    // Add to notifications array
    const notificationObj = {
      id: notificationId,
      element: notificationElement,
      options: notificationOptions,
      createdAt: new Date()
    };

    this.notifications.push(notificationObj);

    // Add to DOM
    this.container.insertBefore(notificationElement, this.container.firstChild);

    // Limit number of notifications
    this.limitNotifications();

    // Start timer if timeout is set
    if (notificationOptions.timeout > 0) {
      this.startNotificationTimer(notificationId, notificationOptions.timeout);
    }

    // Play sound if enabled
    if (this.options.enableSound) {
      this.playNotificationSound();
    }

    // Trigger custom event
    this.center.dispatchEvent(new CustomEvent('notificationcreated', {
      detail: { notification: notificationObj }
    }));

    return notificationId;
  }

  /**
   * Creates a notification element
   * @param {string} id - Notification ID
   * @param {Object} options - Notification options
   * @returns {HTMLElement} Notification element
   */
  createNotificationElement(id, options) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.classList.add(`notification-${options.type}`);
    notification.classList.add(`notification-${this.options.theme}`);
    notification.id = id;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');

    // Create notification content
    let contentHTML = `
      <div class="notification-content">
        <div class="notification-header">
    `;

    // Add icon based on type
    const icon = this.getIconForType(options.type);
    contentHTML += `<div class="notification-icon">${icon}</div>`;

    // Add title
    contentHTML += `<div class="notification-title">${options.title}</div>`;

    // Add close button if enabled
    if (options.showCloseButton) {
      contentHTML += `<button class="notification-close" aria-label="Close notification">&times;</button>`;
    }

    contentHTML += `
        </div>
        <div class="notification-message">${options.message}</div>
    `;

    // Add progress bar if enabled
    if (options.showProgressBar) {
      contentHTML += `<div class="notification-progress"></div>`;
    }

    contentHTML += '</div>';

    notification.innerHTML = contentHTML;

    // Add event listeners
    this.bindNotificationEvents(notification, id, options);

    return notification;
  }

  /**
   * Binds events to a notification element
   * @param {HTMLElement} element - Notification element
   * @param {string} id - Notification ID
   * @param {Object} options - Notification options
   */
  bindNotificationEvents(element, id, options) {
    // Close button event
    const closeButton = element.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeNotification(id);
        if (options.onClose) {
          options.onClose();
        }
      });
    }

    // Click event on notification
    if (options.onClick || this.options.hideOnClick) {
      element.addEventListener('click', () => {
        if (options.onClick) {
          options.onClick();
        }
        if (this.options.hideOnClick) {
          this.removeNotification(id);
        }
      });
    }

    // Hover events for pause on hover
    if (this.options.pauseOnHover) {
      element.addEventListener('mouseenter', () => {
        const notificationObj = this.notifications.find(n => n.id === id);
        if (notificationObj && notificationObj.timerId) {
          clearTimeout(notificationObj.timerId);
          notificationObj.timerId = null;
          
          // Update progress bar to paused state
          const progressBar = element.querySelector('.notification-progress');
          if (progressBar && !progressBar.classList.contains('paused')) {
            progressBar.classList.add('paused');
          }
        }
      });

      element.addEventListener('mouseleave', () => {
        const notificationObj = this.notifications.find(n => n.id === id);
        if (notificationObj && !notificationObj.timerId) {
          // Resume timer with remaining time
          const remainingTime = Math.max(0, notificationObj.options.timeout - (Date.now() - notificationObj.createdAt.getTime()));
          if (remainingTime > 0) {
            this.startNotificationTimer(id, remainingTime, true);
          }
        }
      });
    }
  }

  /**
   * Starts the notification timer
   * @param {string} id - Notification ID
   * @param {number} timeout - Timeout in milliseconds
   * @param {boolean} isResumed - Whether this is a resumed timer
   */
  startNotificationTimer(id, timeout, isResumed = false) {
    const notificationObj = this.notifications.find(n => n.id === id);
    if (!notificationObj) return;

    // Update the creation time if this is a resumed timer
    if (isResumed) {
      notificationObj.createdAt = new Date(Date.now() - (notificationObj.options.timeout - timeout));
    }

    // Create and update progress bar if enabled
    const notificationEl = document.getElementById(id);
    const progressBar = notificationEl ? notificationEl.querySelector('.notification-progress') : null;
    
    if (progressBar && this.options.showProgressBar) {
      // Set up initial width
      progressBar.style.transition = `width ${timeout}ms linear`;
      progressBar.style.width = '100%';
      
      // Reset paused class if it was paused
      progressBar.classList.remove('paused');
    }

    // Set timeout to remove notification
    notificationObj.timerId = setTimeout(() => {
      this.removeNotification(id);
    }, timeout);
  }

  /**
   * Removes a notification
   * @param {string} id - Notification ID
   */
  removeNotification(id) {
    const notificationIndex = this.notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) return;

    const notificationObj = this.notifications[notificationIndex];
    
    // Clear timer if exists
    if (notificationObj.timerId) {
      clearTimeout(notificationObj.timerId);
    }

    // Remove from DOM with animation
    const notificationEl = document.getElementById(id);
    if (notificationEl) {
      notificationEl.style.opacity = '0';
      notificationEl.style.transform = 'translateX(100%)';
      
      // Remove after animation
      setTimeout(() => {
        if (notificationEl.parentNode) {
          notificationEl.parentNode.removeChild(notificationEl);
        }
      }, 300);
    }

    // Remove from array
    this.notifications.splice(notificationIndex, 1);

    // Trigger custom event
    this.center.dispatchEvent(new CustomEvent('notificationremoved', {
      detail: { id: id }
    }));
  }

  /**
   * Clears all notifications
   */
  clearAll() {
    [...this.notifications].forEach(notificationObj => {
      this.removeNotification(notificationObj.id);
    });
  }

  /**
   * Limits the number of notifications based on maxNotifications
   */
  limitNotifications() {
    if (this.notifications.length > this.options.maxNotifications) {
      // Remove oldest notifications
      const excessCount = this.notifications.length - this.options.maxNotifications;
      for (let i = this.notifications.length - 1; i >= this.notifications.length - excessCount; i--) {
        this.removeNotification(this.notifications[i].id);
      }
    }
  }

  /**
   * Creates an info notification
   * @param {string} message - Notification message
   * @param {Object} options - Notification options
   * @returns {string} Notification ID
   */
  info(message, options = {}) {
    return this.createNotification(message, 'info', options);
  }

  /**
   * Creates a success notification
   * @param {string} message - Notification message
   * @param {Object} options - Notification options
   * @returns {string} Notification ID
   */
  success(message, options = {}) {
    return this.createNotification(message, 'success', options);
  }

  /**
   * Creates a warning notification
   * @param {string} message - Notification message
   * @param {Object} options - Notification options
   * @returns {string} Notification ID
   */
  warning(message, options = {}) {
    return this.createNotification(message, 'warning', options);
  }

  /**
   * Creates an error notification
   * @param {string} message - Notification message
   * @param {Object} options - Notification options
   * @returns {string} Notification ID
   */
  error(message, options = {}) {
    return this.createNotification(message, 'error', options);
  }

  /**
   * Plays notification sound
   */
  playNotificationSound() {
    if (this.options.soundFile) {
      // Create and play audio element
      const audio = new Audio(this.options.soundFile);
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } else {
      // Use system beep if no sound file specified
      // In a browser environment, we can't play a system beep directly
      // So we'll just log a message
      console.log('Notification sound');
    }
  }

  /**
   * Gets the title for a notification type
   * @param {string} type - Notification type
   * @returns {string} Title for the type
   */
  getTypeTitle(type) {
    const titles = {
      'info': 'Information',
      'success': 'Success',
      'warning': 'Warning',
      'error': 'Error'
    };
    return titles[type] || 'Notification';
  }

  /**
   * Gets the icon for a notification type
   * @param {string} type - Notification type
   * @returns {string} Icon HTML
   */
  getIconForType(type) {
    const icons = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type] || '🔔';
  }

  /**
   * Gets all notifications
   * @returns {Array} Array of notification objects
   */
  getNotifications() {
    return [...this.notifications];
  }

  /**
   * Gets the count of active notifications
   * @returns {number} Count of active notifications
   */
  getNotificationCount() {
    return this.notifications.length;
  }

  /**
   * Updates the position of the notification center
   * @param {string} position - New position
   */
  setPosition(position) {
    // Remove old position class
    this.center.classList.remove(`notification-center-${this.options.position}`);
    
    // Update position option
    this.options.position = position;
    
    // Add new position class
    this.center.classList.add(`notification-center-${position}`);
  }

  /**
   * Updates the theme of the notification center
   * @param {string} theme - New theme
   */
  setTheme(theme) {
    // Remove old theme class
    this.center.classList.remove(`notification-center-${this.options.theme}`);
    
    // Update theme option
    this.options.theme = theme;
    
    // Add new theme class
    this.center.classList.add(`notification-center-${theme}`);
  }

  /**
   * Shows a notification using the global notification system
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {number} timeout - Timeout in milliseconds
   * @returns {string} Notification ID
   */
  static show(message, type = 'info', timeout = 5000) {
    // This would use a global notification center if one exists
    // For now, we'll just return a placeholder
    console.log(`Global notification: [${type}] ${message}`);
    return `global-${Date.now()}`;
  }

  /**
   * Adds dynamic styles for the notification center
   */
  addDynamicStyles() {
    if (document.getElementById('notification-center-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-center-styles';
    style.textContent = `
      .notification-center {
        position: fixed;
        z-index: 10000;
        padding: 10px;
        width: 350px;
      }
      
      .notification-center-top-left {
        top: 20px;
        left: 20px;
      }
      
      .notification-center-top-right {
        top: 20px;
        right: 20px;
      }
      
      .notification-center-bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .notification-center-bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .notification-center-top-center {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .notification-center-bottom-center {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .notifications-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 100vh;
        overflow-y: auto;
      }
      
      .notification {
        display: flex;
        min-height: 70px;
        background: var(--bg-darker, #111);
        border: 2px solid var(--border-default, #4facfe);
        border-radius: 8px;
        overflow: hidden;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }
      
      .notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .notification-content {
        flex: 1;
        padding: 12px;
        display: flex;
        flex-direction: column;
      }
      
      .notification-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .notification-icon {
        font-size: 1.2rem;
        margin-right: 8px;
      }
      
      .notification-title {
        font-weight: bold;
        flex: 1;
      }
      
      .notification-close {
        background: none;
        border: none;
        color: var(--text-light, #fff);
        font-size: 1.2rem;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
      }
      
      .notification-close:hover {
        background: var(--bg-dark, #0a0a0a);
      }
      
      .notification-message {
        flex: 1;
        font-size: 0.9rem;
      }
      
      .notification-progress {
        height: 3px;
        background: var(--jazer-cyan, #00f2ea);
        width: 0%;
        transition: width 5000ms linear;
      }
      
      .notification-progress.paused {
        transition: none;
      }
      
      .notification-info {
        border-color: #4facfe;
      }
      
      .notification-success {
        border-color: #00ff88;
      }
      
      .notification-warning {
        border-color: #ffcc00;
      }
      
      .notification-error {
        border-color: #ff4444;
      }
      
      .notification-dark {
        background: var(--bg-darker, #111);
        color: var(--text-light, #fff);
      }
      
      .notification-light {
        background: var(--bg-lighter, #f0f0f0);
        color: var(--text-dark, #000);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Destroys the notification center and cleans up
   */
  destroy() {
    // Clear all notifications
    this.clearAll();
    
    // Remove event listeners would normally be done here
    // For simplicity in this implementation, we'll just remove the element
    
    if (this.center.parentNode) {
      this.center.parentNode.removeChild(this.center);
    }
  }
}

/**
 * Initializes all notification centers on the page
 * @param {HTMLElement|Document} container - Container to search for notification centers
 * @returns {Array<NotificationCenter>} Array of initialized notification center instances
 */
function initNotificationCenters(container = document) {
  const centers = container.querySelectorAll('.notification-center, [data-notification-center]');
  const instances = [];

  centers.forEach(center => {
    if (!center.hasAttribute('data-notification-center-initialized')) {
      center.setAttribute('data-notification-center-initialized', 'true');

      // Get options from data attributes
      const options = {
        position: center.dataset.position || 'top-right',
        maxNotifications: parseInt(center.dataset.maxNotifications) || 10,
        defaultTimeout: parseInt(center.dataset.defaultTimeout) || 5000,
        showCloseButton: center.dataset.showCloseButton !== 'false',
        enableSound: center.dataset.enableSound === 'true',
        soundFile: center.dataset.soundFile || null,
        showProgressBar: center.dataset.showProgressBar !== 'false',
        pauseOnHover: center.dataset.pauseOnHover !== 'false',
        hideOnClick: center.dataset.hideOnClick !== 'false',
        theme: center.dataset.theme || 'dark'
      };

      const instance = new NotificationCenter(center, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Global notification function
 * Creates notifications using a default notification center
 */
let globalNotificationCenter = null;

function notify(message, type = 'info', options = {}) {
  // Create global notification center if it doesn't exist
  if (!globalNotificationCenter) {
    // Create a container for the global notification center
    const globalContainer = document.createElement('div');
    globalContainer.id = 'global-notification-center';
    document.body.appendChild(globalContainer);
    
    globalNotificationCenter = new NotificationCenter(globalContainer, {
      position: 'top-right',
      maxNotifications: 5,
      defaultTimeout: 5000
    });
  }
  
  // Create the notification
  return globalNotificationCenter.createNotification(message, type, options);
}

// Convenience functions for global notifications
function notifyInfo(message, options = {}) {
  return notify(message, 'info', options);
}

function notifySuccess(message, options = {}) {
  return notify(message, 'success', options);
}

function notifyWarning(message, options = {}) {
  return notify(message, 'warning', options);
}

function notifyError(message, options = {}) {
  return notify(message, 'error', options);
}

/**
 * Auto-initialize notification centers when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initNotificationCenters();
  }, 0);
});

/**
 * Export functions globally for easy access
 */
window.NotificationCenter = NotificationCenter;
window.notify = notify;
window.notifyInfo = notifyInfo;
window.notifySuccess = notifySuccess;
window.notifyWarning = notifyWarning;
window.notifyError = notifyError;

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    NotificationCenter, 
    initNotificationCenters,
    notify,
    notifyInfo,
    notifySuccess,
    notifyWarning,
    notifyError
  };
}