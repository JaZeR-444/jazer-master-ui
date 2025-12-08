/**
 * Button Behaviors Module
 * Enhanced button interactions with loading states, toggles, and animations
 * Compatible with jazer-brand.css styling
 */

class ButtonBehaviors {
  /**
   * Initializes enhanced button behaviors
   * @param {HTMLElement|Document} container - Container element to watch for buttons
   */
  constructor(container = document) {
    this.container = container;
    this.init();
  }

  /**
   * Initialize the button behaviors
   */
  init() {
    // Watch for dynamically added buttons
    this.observeButtons();
    
    // Initialize existing buttons
    this.setupExistingButtons();
  }

  /**
   * Sets up behaviors for buttons that already exist on the page
   */
  setupExistingButtons() {
    const buttons = this.container.querySelectorAll('.btn, button[data-behavior]');
    buttons.forEach(btn => this.setupButton(btn));
  }

  /**
   * Observes the DOM for new buttons and applies behaviors
   */
  observeButtons() {
    if (!window.MutationObserver) return;
    
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.matches && (node.matches('button, .btn') || node.querySelector)) {
              // Check if the added node is a button
              if (node.matches('button, .btn')) {
                this.setupButton(node);
              }
              
              // Check for buttons inside the added node
              const buttons = node.querySelectorAll && node.querySelectorAll('button, .btn');
              if (buttons) {
                buttons.forEach(btn => this.setupButton(btn));
              }
            }
          }
        });
      });
    });

    observer.observe(this.container, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Sets up a single button with enhanced behaviors
   * @param {HTMLElement} btn - The button element to enhance
   */
  setupButton(btn) {
    if (btn.hasAttribute('data-button-enhanced')) return;
    
    btn.setAttribute('data-button-enhanced', 'true');
    
    // Handle different button behaviors based on data attributes
    const behavior = btn.dataset.behavior || 'default';
    
    switch (behavior) {
      case 'loading':
        this.setupLoadingButton(btn);
        break;
      case 'toggle':
        this.setupToggleButton(btn);
        break;
      case 'ripple':
        this.setupRippleEffect(btn);
        break;
      case 'confirm':
        this.setupConfirmButton(btn);
        break;
      default:
        this.setupRippleEffect(btn);
        this.addHoverEffects(btn);
    }
  }

  /**
   * Adds ripple effect to button
   * @param {HTMLElement} btn - The button element
   */
  setupRippleEffect(btn) {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.style.isolation = 'isolate'; // Ensures ripple effect stays within button

    btn.addEventListener('click', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
      `;

      // Calculate position
      const diameter = Math.max(btn.offsetWidth, btn.offsetHeight);
      const radius = diameter / 2;
      
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.offsetX - radius}px`;
      ripple.style.top = `${e.offsetY - radius}px`;

      // Add ripple to button
      btn.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });

    // Add ripple animation CSS if not already present
    this.addRippleStyles();
  }

  /**
   * Adds ripple animation CSS to the document
   */
  addRippleStyles() {
    if (document.getElementById('ripple-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Adds hover effects to button
   * @param {HTMLElement} btn - The button element
   */
  addHoverEffects(btn) {
    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 8px 25px rgba(0, 242, 234, 0.4)';
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
    });
  }

  /**
   * Sets up loading state for button
   * @param {HTMLElement} btn - The button element
   */
  setupLoadingButton(btn) {
    const originalText = btn.innerHTML;
    
    btn.addEventListener('click', async function() {
      if (btn.disabled) return;
      
      // Show loading state
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = '<span class="spinner"></span> Loading...';
      
      try {
        // Simulate async operation - this would be replaced with actual async operation
        await new Promise(resolve => setTimeout(resolve, 1500));
      } finally {
        // Restore original state
        btn.disabled = false;
        btn.classList.remove('btn-loading');
        btn.innerHTML = originalText;
      }
    });
    
    // Add loading styles if not present
    this.addLoadingStyles();
  }

  /**
   * Adds loading spinner CSS to the document
   */
  addLoadingStyles() {
    if (document.getElementById('loading-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
      .btn-loading {
        position: relative;
        pointer-events: none;
      }
      
      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 8px;
        vertical-align: middle;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Sets up toggle behavior for button
   * @param {HTMLElement} btn - The button element
   */
  setupToggleButton(btn) {
    const toggleGroup = btn.dataset.toggleGroup;
    let isOn = btn.classList.contains('active') || btn.dataset.state === 'on';
    
    btn.setAttribute('aria-pressed', isOn);
    
    btn.addEventListener('click', () => {
      if (toggleGroup) {
        // Handle mutually exclusive toggle groups
        const groupButtons = document.querySelectorAll(`[data-toggle-group="${toggleGroup}"]`);
        groupButtons.forEach(groupBtn => {
          if (groupBtn === btn) {
            groupBtn.classList.add('active');
            groupBtn.setAttribute('aria-pressed', 'true');
          } else {
            groupBtn.classList.remove('active');
            groupBtn.setAttribute('aria-pressed', 'false');
          }
        });
      } else {
        // Handle individual toggle buttons
        isOn = !isOn;
        btn.classList.toggle('active', isOn);
        btn.setAttribute('aria-pressed', isOn.toString());
        
        // Update aria-label based on state
        if (btn.dataset.onLabel && btn.dataset.offLabel) {
          btn.setAttribute('aria-label', isOn ? btn.dataset.onLabel : btn.dataset.offLabel);
        }
      }
    });
    
    // Add toggle styles if not present
    this.addToggleStyles();
  }

  /**
   * Adds toggle button CSS to the document
   */
  addToggleStyles() {
    if (document.getElementById('toggle-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toggle-styles';
    style.textContent = `
      .btn.active {
        background: var(--gradient-accent);
        color: var(--text-dark);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px var(--shadow-cyan);
      }
      
      .btn-toggle-group {
        display: flex;
        gap: 2px;
      }
      
      .btn-toggle-group .btn {
        border-radius: 0;
      }
      
      .btn-toggle-group .btn:first-child {
        border-radius: 8px 0 0 8px;
      }
      
      .btn-toggle-group .btn:last-child {
        border-radius: 0 8px 8px 0;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Sets up confirmation behavior for button
   * @param {HTMLElement} btn - The button element
   */
  setupConfirmButton(btn) {
    const confirmMessage = btn.dataset.confirmMessage || 'Are you sure?';
    const confirmTitle = btn.dataset.confirmTitle || 'Confirmation';
    const action = btn.dataset.confirmAction || 'delete';

    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        const confirmed = await this.showConfirmDialog(confirmTitle, confirmMessage);
        if (confirmed) {
          // Execute the original button action
          if (btn.onclick) {
            btn.onclick.call(btn, e);
          } else if (btn.form) {
            btn.form.dispatchEvent(new Event('submit'));
          } else if (btn.href) {
            window.location.href = btn.href;
          }
        }
      } catch (error) {
        console.error('Confirmation dialog failed:', error);
      }
    });
  }

  /**
   * Shows a confirmation dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @returns {Promise<boolean>} Promise that resolves with true if confirmed
   */
  async showConfirmDialog(title, message) {
    // Using the ModalDialog class if available, otherwise create a simple dialog
    if (window.ModalDialog) {
      return ModalDialog.confirm(title, message);
    } else {
      return new Promise(resolve => {
        const confirmed = confirm(`${title}\n\n${message}`);
        resolve(confirmed);
      });
    }
  }
}

/**
 * Convenience function to initialize button behaviors on elements
 * @param {HTMLElement|Document|string} container - Container element or selector
 * @returns {ButtonBehaviors} Instance of ButtonBehaviors class
 */
function initButtonBehaviors(container = document) {
  const targetContainer = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  return new ButtonBehaviors(targetContainer);
}

// Initialize automatically when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure other scripts have run
  setTimeout(() => {
    initButtonBehaviors();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ButtonBehaviors, initButtonBehaviors };
}

// Also make it available globally
window.ButtonBehaviors = ButtonBehaviors;
window.initButtonBehaviors = initButtonBehaviors;