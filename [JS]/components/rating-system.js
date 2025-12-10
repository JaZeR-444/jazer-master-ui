/**
 * Rating System Component
 * Accessible star rating component with customizable options
 * Compatible with jazer-brand.css styling
 */

class RatingSystem {
  /**
   * Creates a new rating system component
   * @param {HTMLElement} ratingElement - The rating container element
   * @param {Object} options - Configuration options
   */
  constructor(ratingElement, options = {}) {
    this.ratingElement = ratingElement;
    this.options = {
      maxRating: 5,
      currentRating: 0,
      allowHalfStars: false,
      readOnly: false,
      size: 'medium', // 'small', 'medium', 'large'
      theme: 'yellow', // 'yellow', 'red', 'blue', 'green', 'purple'
      showValue: true,
      valueType: 'stars', // 'stars', 'text', 'both'
      valueTexts: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      ...options
    };

    this.currentRating = this.options.currentRating;
    this.hoverRating = 0;
    this.isHovering = false;

    this.init();
  }

  /**
   * Initializes the rating system
   */
  init() {
    // Set up the rating system structure
    this.setupRatingSystem();

    // Bind events
    this.bindEvents();

    // Update display
    this.updateDisplay();
  }

  /**
   * Sets up the rating system structure
   */
  setupRatingSystem() {
    // Add rating system classes
    this.ratingElement.classList.add('rating-system');
    this.ratingElement.classList.add(`rating-size-${this.options.size}`);
    this.ratingElement.classList.add(`rating-theme-${this.options.theme}`);

    if (this.options.readOnly) {
      this.ratingElement.classList.add('rating-readonly');
    }

    // Create star elements
    this.starsContainer = document.createElement('div');
    this.starsContainer.classList.add('rating-stars-container');

    for (let i = 1; i <= this.options.maxRating; i++) {
      const star = document.createElement('span');
      star.classList.add('rating-star');
      star.setAttribute('data-rating', i);
      star.setAttribute('tabindex', this.options.readOnly ? '-1' : '0');
      star.setAttribute('aria-label', `${i} star${i !== 1 ? 's' : ''}`);
      star.setAttribute('role', 'button');
      
      if (!this.options.readOnly) {
        star.setAttribute('aria-pressed', 'false');
      }

      // Create the star content
      star.innerHTML = this.getStarIcon();

      this.starsContainer.appendChild(star);
    }

    this.ratingElement.appendChild(this.starsContainer);

    // Create value display if needed
    if (this.options.showValue) {
      this.valueDisplay = document.createElement('div');
      this.valueDisplay.classList.add('rating-value-display');
      this.valueDisplay.style.marginTop = '5px';
      this.valueDisplay.style.textAlign = 'center';
      
      if (this.options.valueType === 'stars' || this.options.valueType === 'both') {
        this.starsValue = document.createElement('span');
        this.starsValue.classList.add('rating-stars-value');
        this.valueDisplay.appendChild(this.starsValue);
      }
      
      if (this.options.valueType === 'text' || this.options.valueType === 'both') {
        this.textValue = document.createElement('span');
        this.textValue.classList.add('rating-text-value');
        this.textValue.style.display = 'block';
        this.textValue.style.fontSize = '0.8em';
        this.textValue.style.marginTop = '3px';
        this.valueDisplay.appendChild(this.textValue);
      }
      
      this.ratingElement.appendChild(this.valueDisplay);
    }

    // Set ARIA attributes
    this.ratingElement.setAttribute('role', 'radiogroup');
    this.ratingElement.setAttribute('aria-label', 'Rating system');
  }

  /**
   * Gets the star icon HTML
   * @returns {string} Star icon HTML
   */
  getStarIcon() {
    // Using Unicode star character - can be replaced with SVG or CSS shapes
    return '★';
  }

  /**
   * Binds event listeners for the rating system
   */
  bindEvents() {
    if (this.options.readOnly) return;

    // Add events to all stars
    const stars = this.starsContainer.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      // Click event
      star.addEventListener('click', (e) => {
        e.preventDefault();
        const rating = parseInt(star.getAttribute('data-rating'));
        this.setRating(rating);
      });

      // Keyboard events
      star.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            const rating = parseInt(star.getAttribute('data-rating'));
            this.setRating(rating);
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (index < stars.length - 1) {
              stars[index + 1].focus();
              this.previewRating(index + 2);
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (index > 0) {
              stars[index - 1].focus();
              this.previewRating(index);
            }
            break;
          case 'Home':
            e.preventDefault();
            stars[0].focus();
            this.previewRating(1);
            break;
          case 'End':
            e.preventDefault();
            stars[stars.length - 1].focus();
            this.previewRating(stars.length);
            break;
        }
      });

      // Hover events
      star.addEventListener('mouseenter', () => {
        if (!this.options.readOnly) {
          this.isHovering = true;
          const rating = parseInt(star.getAttribute('data-rating'));
          this.previewRating(rating);
        }
      });

      // Mouse leave for individual star
      star.addEventListener('mouseleave', () => {
        if (!this.options.readOnly && this.isHovering) {
          this.isHovering = false;
          this.resetPreview();
        }
      });
    });

    // Mouse leave for container - reset preview when leaving entire rating system
    this.starsContainer.addEventListener('mouseleave', () => {
      if (!this.options.readOnly && this.isHovering) {
        this.isHovering = false;
        this.resetPreview();
      }
    });
  }

  /**
   * Sets the current rating
   * @param {number} rating - The rating value to set
   */
  setRating(rating) {
    // Handle half star logic if enabled
    if (this.options.allowHalfStars) {
      // If clicking on the same star, toggle between full and half star
      if (rating === this.currentRating && Math.floor(this.currentRating) === this.currentRating) {
        rating = rating - 0.5;
      }
    } else {
      // Only allow full stars
      rating = Math.floor(rating);
    }

    // Clamp rating between 0 and maxRating
    this.currentRating = Math.max(0, Math.min(rating, this.options.maxRating));

    // Update display
    this.updateDisplay();

    // Trigger custom event
    this.ratingElement.dispatchEvent(new CustomEvent('ratingchange', {
      detail: { rating: this.currentRating }
    }));
  }

  /**
   * Previews a rating (on hover)
   * @param {number} rating - The rating to preview
   */
  previewRating(rating) {
    this.hoverRating = rating;
    this.updateDisplay(true); // Pass true for preview state
  }

  /**
   * Resets the preview state
   */
  resetPreview() {
    this.hoverRating = 0;
    this.updateDisplay();
  }

  /**
   * Updates the display based on current rating
   * @param {boolean} isPreview - Whether to update in preview mode
   */
  updateDisplay(isPreview = false) {
    const rating = isPreview ? this.hoverRating : this.currentRating;
    const stars = this.starsContainer.querySelectorAll('.rating-star');

    stars.forEach((star, index) => {
      const starRating = index + 1;
      const starElement = star.querySelector('span') || star;

      // Reset classes
      star.classList.remove('rating-star-full', 'rating-star-half', 'rating-star-empty', 'rating-star-preview');

      // Determine if this star should be full, half, or empty
      if (this.options.allowHalfStars) {
        if (starRating <= Math.floor(rating)) {
          // Full star
          star.classList.add('rating-star-full');
        } else if (starRating === Math.ceil(rating) && rating % 1 !== 0) {
          // Half star
          star.classList.add('rating-star-half');
        } else {
          // Empty star
          star.classList.add('rating-star-empty');
        }
      } else {
        if (starRating <= rating) {
          // Full star
          star.classList.add('rating-star-full');
        } else {
          // Empty star
          star.classList.add('rating-star-empty');
        }
      }

      // Add preview class if in preview mode
      if (isPreview && starRating <= this.hoverRating) {
        star.classList.add('rating-star-preview');
      }
    });

    // Update value display if needed
    if (this.valueDisplay) {
      if (this.starsValue) {
        this.starsValue.textContent = `${rating.toFixed(this.options.allowHalfStars ? 1 : 0)} / ${this.options.maxRating}`;
      }
      
      if (this.textValue) {
        // Determine text based on rating
        const ratingIndex = Math.min(Math.floor((rating / this.options.maxRating) * this.options.valueTexts.length) - 1, this.options.valueTexts.length - 1);
        const textIndex = Math.max(0, ratingIndex);
        this.textValue.textContent = this.options.valueTexts[textIndex] || '';
      }
    }

    // Update ARIA attributes
    this.ratingElement.setAttribute('aria-valuenow', rating.toString());
    this.ratingElement.setAttribute('aria-valuetext', `${rating} out of ${this.options.maxRating} stars`);
  }

  /**
   * Gets the current rating
   * @returns {number} Current rating value
   */
  getRating() {
    return this.currentRating;
  }

  /**
   * Clears the rating
   */
  clearRating() {
    this.currentRating = 0;
    this.updateDisplay();
    
    // Trigger custom event
    this.ratingElement.dispatchEvent(new CustomEvent('ratingchange', {
      detail: { rating: 0 }
    }));
  }

  /**
   * Updates the max rating
   * @param {number} maxRating - New max rating value
   */
  setMaxRating(maxRating) {
    this.options.maxRating = maxRating;
    
    // Clear the container and recreate stars
    this.starsContainer.innerHTML = '';
    
    for (let i = 1; i <= this.options.maxRating; i++) {
      const star = document.createElement('span');
      star.classList.add('rating-star');
      star.setAttribute('data-rating', i);
      star.setAttribute('tabindex', this.options.readOnly ? '-1' : '0');
      star.setAttribute('aria-label', `${i} star${i !== 1 ? 's' : ''}`);
      star.setAttribute('role', 'button');
      
      if (!this.options.readOnly) {
        star.setAttribute('aria-pressed', 'false');
      }

      star.innerHTML = this.getStarIcon();
      this.starsContainer.appendChild(star);
    }
    
    // Rebind events
    this.bindEvents();
    
    // Update display if current rating is higher than new max
    if (this.currentRating > maxRating) {
      this.currentRating = maxRating;
    }
    
    this.updateDisplay();
  }

  /**
   * Sets the rating system to read-only or interactive
   * @param {boolean} readOnly - Whether to set as read-only
   */
  setReadOnly(readOnly) {
    this.options.readOnly = readOnly;
    
    if (readOnly) {
      this.ratingElement.classList.add('rating-readonly');
      const stars = this.starsContainer.querySelectorAll('.rating-star');
      stars.forEach(star => {
        star.setAttribute('tabindex', '-1');
        star.setAttribute('aria-pressed', 'false');
      });
    } else {
      this.ratingElement.classList.remove('rating-readonly');
      const stars = this.starsContainer.querySelectorAll('.rating-star');
      stars.forEach(star => {
        star.setAttribute('tabindex', '0');
      });
    }
  }

  /**
   * Updates the theme
   * @param {string} theme - New theme (yellow, red, blue, green, purple)
   */
  setTheme(theme) {
    // Remove old theme class
    this.ratingElement.classList.remove(`rating-theme-${this.options.theme}`);
    
    // Update theme option
    this.options.theme = theme;
    
    // Add new theme class
    this.ratingElement.classList.add(`rating-theme-${theme}`);
  }

  /**
   * Destroys the rating system and cleans up
   */
  destroy() {
    // Remove all child elements
    while (this.ratingElement.firstChild) {
      this.ratingElement.removeChild(this.ratingElement.firstChild);
    }
    
    // Remove classes
    this.ratingElement.classList.remove('rating-system');
    this.ratingElement.classList.remove(`rating-size-${this.options.size}`);
    this.ratingElement.classList.remove(`rating-theme-${this.options.theme}`);
    if (this.options.readOnly) {
      this.ratingElement.classList.remove('rating-readonly');
    }
  }
}

/**
 * Initializes all rating systems on the page
 * @param {HTMLElement|Document} container - Container to search for rating systems
 * @returns {Array<RatingSystem>} Array of initialized rating system instances
 */
function initRatingSystems(container = document) {
  const ratingSystems = container.querySelectorAll('.rating-system, [data-rating]');
  const instances = [];

  ratingSystems.forEach(ratingSystem => {
    if (!ratingSystem.hasAttribute('data-rating-initialized')) {
      ratingSystem.setAttribute('data-rating-initialized', 'true');

      // Get options from data attributes
      const options = {
        maxRating: parseInt(ratingSystem.dataset.maxRating) || 5,
        currentRating: parseFloat(ratingSystem.dataset.currentRating) || 0,
        allowHalfStars: ratingSystem.dataset.allowHalfStars === 'true',
        readOnly: ratingSystem.dataset.readOnly === 'true',
        size: ratingSystem.dataset.size || 'medium',
        theme: ratingSystem.dataset.theme || 'yellow',
        showValue: ratingSystem.dataset.showValue !== 'false',
        valueType: ratingSystem.dataset.valueType || 'stars',
        valueTexts: (ratingSystem.dataset.valueTexts || 'Poor,Fair,Good,Very Good,Excellent').split(',')
      };

      const instance = new RatingSystem(ratingSystem, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize rating systems when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initRatingSystems();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RatingSystem, initRatingSystems };
}

// Also make it available globally
window.RatingSystem = RatingSystem;
window.initRatingSystems = initRatingSystems;