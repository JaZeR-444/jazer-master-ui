/**
 * Progress Bar Component
 * Accessible and customizable progress bar with various styling options
 * Compatible with jazer-brand.css styling
 */

class ProgressBar {
  /**
   * Creates a new progress bar component
   * @param {HTMLElement} progressBarElement - The progress bar container element
   * @param {Object} options - Configuration options
   */
  constructor(progressBarElement, options = {}) {
    this.progressBar = progressBarElement;
    this.options = {
      value: 0,
      max: 100,
      showValue: true,
      valueType: 'percentage', // 'percentage', 'value', 'none'
      animationDuration: 300,
      striped: false,
      animated: false,
      theme: 'primary', // 'primary', 'success', 'warning', 'danger', 'info'
      ...options
    };

    this.value = this.options.value;
    this.max = this.options.max;
    this.animationFrame = null;

    this.init();
  }

  /**
   * Initializes the progress bar
   */
  init() {
    // Set up the progress bar structure
    this.setupProgressBar();

    // Update the value
    this.setValue(this.options.value);
  }

  /**
   * Sets up the progress bar structure
   */
  setupProgressBar() {
    // Add progress bar classes
    this.progressBar.classList.add('progress-bar');
    this.progressBar.classList.add(`progress-bar-${this.options.theme}`);
    
    if (this.options.striped) {
      this.progressBar.classList.add('progress-bar-striped');
    }
    
    if (this.options.animated) {
      this.progressBar.classList.add('progress-bar-animated');
    }

    // Create the fill element
    this.fillElement = document.createElement('div');
    this.fillElement.classList.add('progress-bar-fill');
    this.fillElement.style.transition = `width ${this.options.animationDuration}ms ease`;
    this.fillElement.style.width = '0%';

    // Create the value display element if needed
    if (this.options.showValue && this.options.valueType !== 'none') {
      this.valueElement = document.createElement('div');
      this.valueElement.classList.add('progress-bar-value');
      this.valueElement.style.position = 'absolute';
      this.valueElement.style.top = '50%';
      this.valueElement.style.left = '50%';
      this.valueElement.style.transform = 'translate(-50%, -50%)';
      this.valueElement.style.zIndex = '2';
      this.valueElement.style.color = 'white';
      this.valueElement.style.fontSize = '0.8rem';
      this.valueElement.style.fontWeight = 'bold';
      this.progressBar.appendChild(this.valueElement);
    }

    // Add fill element to progress bar
    this.progressBar.appendChild(this.fillElement);

    // Set ARIA attributes
    this.progressBar.setAttribute('role', 'progressbar');
    this.progressBar.setAttribute('aria-valuemin', '0');
    this.progressBar.setAttribute('aria-valuemax', this.max.toString());
    this.progressBar.setAttribute('aria-valuenow', this.value.toString());
  }

  /**
   * Sets the progress bar value
   * @param {number} value - The new value
   */
  setValue(value) {
    // Ensure value is within bounds
    const clampedValue = Math.min(Math.max(value, 0), this.max);
    this.value = clampedValue;

    // Calculate percentage
    const percentage = (this.value / this.max) * 100;

    // Update the fill element
    this.fillElement.style.width = `${percentage}%`;

    // Update value display if needed
    if (this.valueElement) {
      switch (this.options.valueType) {
        case 'value':
          this.valueElement.textContent = `${this.value}/${this.max}`;
          break;
        case 'percentage':
          this.valueElement.textContent = `${Math.round(percentage)}%`;
          break;
        case 'none':
          // Do nothing
          break;
        default:
          this.valueElement.textContent = `${Math.round(percentage)}%`;
      }
    }

    // Update ARIA attributes
    this.progressBar.setAttribute('aria-valuenow', this.value.toString());
    
    // Update label for screen readers
    this.progressBar.setAttribute('aria-valuetext', `${Math.round(percentage)}% complete`);
  }

  /**
   * Gets the current progress bar value
   * @returns {number} Current value
   */
  getValue() {
    return this.value;
  }

  /**
   * Updates the theme of the progress bar
   * @param {string} theme - New theme (primary, success, warning, danger, info)
   */
  setTheme(theme) {
    // Remove old theme class
    this.progressBar.classList.remove(`progress-bar-${this.options.theme}`);
    
    // Update theme option
    this.options.theme = theme;
    
    // Add new theme class
    this.progressBar.classList.add(`progress-bar-${theme}`);
  }

  /**
   * Shows or hides the value display
   * @param {boolean} show - Whether to show the value
   */
  showValue(show) {
    if (show && this.options.valueType !== 'none') {
      if (!this.valueElement) {
        // Create value element if it doesn't exist
        this.valueElement = document.createElement('div');
        this.valueElement.classList.add('progress-bar-value');
        this.valueElement.style.position = 'absolute';
        this.valueElement.style.top = '50%';
        this.valueElement.style.left = '50%';
        this.valueElement.style.transform = 'translate(-50%, -50%)';
        this.valueElement.style.zIndex = '2';
        this.valueElement.style.color = 'white';
        this.valueElement.style.fontSize = '0.8rem';
        this.valueElement.style.fontWeight = 'bold';
        this.progressBar.appendChild(this.valueElement);
      }
      this.valueElement.style.display = 'block';
    } else if (this.valueElement) {
      this.valueElement.style.display = 'none';
    }
    
    this.options.showValue = show;
  }

  /**
   * Animates the progress bar from current value to target value
   * @param {number} targetValue - Target value to animate to
   * @param {number} duration - Duration of animation in milliseconds
   */
  animateToValue(targetValue, duration = this.options.animationDuration) {
    const startValue = this.value;
    const targetClamped = Math.min(Math.max(targetValue, 0), this.max);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smoother animation
      const easeProgress = this.easeInOutCubic(progress);
      const currentValue = startValue + (targetClamped - startValue) * easeProgress;
      
      this.setValue(currentValue);
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.setValue(targetClamped); // Ensure final value is exact
      }
    };
    
    cancelAnimationFrame(this.animationFrame);
    requestAnimationFrame(animate);
  }

  /**
   * Easing function for smooth animations
   * @param {number} t - Time value between 0 and 1
   * @returns {number} Eased value
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Updates the max value
   * @param {number} max - New max value
   */
  setMax(max) {
    this.max = max;
    this.progressBar.setAttribute('aria-valuemax', max.toString());
    
    // Update current value if needed
    if (this.value > max) {
      this.setValue(max);
    } else {
      // Update percentage display
      this.setValue(this.value);
    }
  }

  /**
   * Destroys the progress bar and cleans up
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Remove all child elements
    while (this.progressBar.firstChild) {
      this.progressBar.removeChild(this.progressBar.firstChild);
    }
    
    // Remove classes
    this.progressBar.classList.remove('progress-bar');
    this.progressBar.classList.remove(`progress-bar-${this.options.theme}`);
    if (this.options.striped) {
      this.progressBar.classList.remove('progress-bar-striped');
    }
    if (this.options.animated) {
      this.progressBar.classList.remove('progress-bar-animated');
    }
  }
}

/**
 * Initializes all progress bars on the page
 * @param {HTMLElement|Document} container - Container to search for progress bars
 * @returns {Array<ProgressBar>} Array of initialized progress bar instances
 */
function initProgressBars(container = document) {
  const progressBars = container.querySelectorAll('.progress-bar, [data-progress]');
  const instances = [];

  progressBars.forEach(progressBar => {
    if (!progressBar.hasAttribute('data-progress-initialized')) {
      progressBar.setAttribute('data-progress-initialized', 'true');

      // Get options from data attributes
      const options = {
        value: parseFloat(progressBar.dataset.value) || 0,
        max: parseFloat(progressBar.dataset.max) || 100,
        showValue: progressBar.dataset.showValue !== 'false',
        valueType: progressBar.dataset.valueType || 'percentage',
        animationDuration: parseInt(progressBar.dataset.animationDuration) || 300,
        striped: progressBar.dataset.striped === 'true',
        animated: progressBar.dataset.animated === 'true',
        theme: progressBar.dataset.theme || 'primary'
      };

      const instance = new ProgressBar(progressBar, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize progress bars when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initProgressBars();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProgressBar, initProgressBars };
}

// Also make it available globally
window.ProgressBar = ProgressBar;
window.initProgressBars = initProgressBars;