/**
 * Carousel Component
 * Accessible carousel with navigation controls and smooth animations
 * Compatible with jazer-brand.css styling
 */

class Carousel {
  /**
   * Creates a new carousel component
   * @param {HTMLElement} carouselElement - The carousel container element
   * @param {Object} options - Configuration options
   */
  constructor(carouselElement, options = {}) {
    this.carousel = carouselElement;
    this.options = {
      autoPlay: false,
      autoPlayInterval: 5000,
      showIndicators: true,
      showNavigation: true,
      animationDuration: 500,
      loop: true,
      pauseOnHover: true,
      ...options
    };

    this.currentIndex = 0;
    this.items = [];
    this.indicators = [];
    this.isPlaying = false;
    this.autoPlayInterval = null;

    this.init();
  }

  /**
   * Initializes the carousel
   */
  init() {
    // Find all carousel items
    this.items = Array.from(this.carousel.querySelectorAll('.carousel-item'));
    
    if (this.items.length === 0) {
      console.warn('No carousel items found');
      return;
    }

    // Set up the carousel structure
    this.setupCarousel();

    // Bind events
    this.bindEvents();

    // Initialize auto-play if enabled
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }

  /**
   * Sets up the carousel structure
   */
  setupCarousel() {
    // Add carousel classes
    this.carousel.classList.add('carousel');
    
    // Wrap items in container for transitions
    const itemsContainer = document.createElement('div');
    itemsContainer.classList.add('carousel-items-container');
    itemsContainer.style.display = 'flex';
    itemsContainer.style.transition = `transform ${this.options.animationDuration}ms ease-in-out`;
    
    // Move items to container
    this.items.forEach(item => {
      itemsContainer.appendChild(item);
    });
    
    this.carousel.appendChild(itemsContainer);
    this.itemsContainer = itemsContainer;

    // Create navigation and indicators
    if (this.options.showNavigation) {
      this.createNavigation();
    }

    if (this.options.showIndicators) {
      this.createIndicators();
    }

    // Set initial position
    this.updatePosition();
  }

  /**
   * Creates navigation buttons
   */
  createNavigation() {
    // Previous button
    this.prevButton = document.createElement('button');
    this.prevButton.classList.add('carousel-nav', 'carousel-prev');
    this.prevButton.innerHTML = '&lt;';
    this.prevButton.setAttribute('aria-label', 'Previous slide');
    
    // Next button
    this.nextButton = document.createElement('button');
    this.nextButton.classList.add('carousel-nav', 'carousel-next');
    this.nextButton.innerHTML = '&gt;';
    this.nextButton.setAttribute('aria-label', 'Next slide');

    // Add buttons to carousel
    this.carousel.appendChild(this.prevButton);
    this.carousel.appendChild(this.nextButton);
  }

  /**
   * Creates indicator dots
   */
  createIndicators() {
    this.indicatorsContainer = document.createElement('div');
    this.indicatorsContainer.classList.add('carousel-indicators');

    this.items.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator');
      indicator.setAttribute('data-index', index);
      indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);

      if (index === 0) {
        indicator.classList.add('active');
      }

      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });

      this.indicatorsContainer.appendChild(indicator);
      this.indicators.push(indicator);
    });

    this.carousel.appendChild(this.indicatorsContainer);
  }

  /**
   * Binds event listeners for the carousel
   */
  bindEvents() {
    // Navigation clicks
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }

    // Keyboard navigation
    this.carousel.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(this.items.length - 1);
          break;
      }
    });

    // Mouse events for auto-play
    if (this.options.autoPlay && this.options.pauseOnHover) {
      this.carousel.addEventListener('mouseenter', () => {
        this.pauseAutoPlay();
      });

      this.carousel.addEventListener('mouseleave', () => {
        this.startAutoPlay();
      });
    }

    // Touch/swipe support
    this.bindTouchEvents();
  }

  /**
   * Binds touch events for swipe functionality
   */
  bindTouchEvents() {
    let startX = 0;
    let endX = 0;

    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    this.carousel.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) return;
      e.preventDefault();
    });

    this.carousel.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) { // Swipe threshold
        if (diffX > 0) {
          this.nextSlide(); // Swipe left - next slide
        } else {
          this.prevSlide(); // Swipe right - prev slide
        }
      }
    });
  }

  /**
   * Updates the carousel position based on current index
   */
  updatePosition() {
    const translateX = -this.currentIndex * 100;
    this.itemsContainer.style.transform = `translateX(${translateX}%)`;

    // Update indicators
    if (this.indicators.length > 0) {
      this.indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === this.currentIndex);
      });
    }

    // Update ARIA attributes
    this.items.forEach((item, index) => {
      item.setAttribute('aria-hidden', index !== this.currentIndex);
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
    });

    // Focus current item for accessibility
    if (this.items[this.currentIndex]) {
      this.items[this.currentIndex].focus();
    }
  }

  /**
   * Goes to the specified slide index
   * @param {number} index - Index of the slide to go to
   */
  goToSlide(index) {
    if (index < 0) {
      this.currentIndex = this.options.loop ? this.items.length - 1 : 0;
    } else if (index >= this.items.length) {
      this.currentIndex = this.options.loop ? 0 : this.items.length - 1;
    } else {
      this.currentIndex = index;
    }

    this.updatePosition();
    
    // Reset auto-play timer if active
    if (this.isPlaying) {
      this.resetAutoPlay();
    }
  }

  /**
   * Goes to the next slide
   */
  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }

  /**
   * Goes to the previous slide
   */
  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }

  /**
   * Starts auto-play functionality
   */
  startAutoPlay() {
    if (!this.options.autoPlay || this.isPlaying) return;

    this.isPlaying = true;
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.options.autoPlayInterval);
  }

  /**
   * Pauses auto-play functionality
   */
  pauseAutoPlay() {
    if (!this.isPlaying) return;

    clearInterval(this.autoPlayInterval);
    this.isPlaying = false;
  }

  /**
   * Resets auto-play timer
   */
  resetAutoPlay() {
    this.pauseAutoPlay();
    this.startAutoPlay();
  }

  /**
   * Destroys the carousel and cleans up event listeners
   */
  destroy() {
    this.pauseAutoPlay();

    // Remove event listeners
    if (this.prevButton) {
      this.prevButton.removeEventListener('click', this.prevSlide);
    }

    if (this.nextButton) {
      this.nextButton.removeEventListener('click', this.nextSlide);
    }

    // Remove touch events
    this.carousel.removeEventListener('touchstart', this.handleTouchStart);
    this.carousel.removeEventListener('touchmove', this.handleTouchMove);
    this.carousel.removeEventListener('touchend', this.handleTouchEnd);

    // Remove all added elements
    if (this.prevButton && this.prevButton.parentNode) {
      this.prevButton.parentNode.removeChild(this.prevButton);
    }

    if (this.nextButton && this.nextButton.parentNode) {
      this.nextButton.parentNode.removeChild(this.nextButton);
    }

    if (this.indicatorsContainer && this.indicatorsContainer.parentNode) {
      this.indicatorsContainer.parentNode.removeChild(this.indicatorsContainer);
    }

    // Remove carousel classes
    this.carousel.classList.remove('carousel');
  }
}

/**
 * Initializes all carousels on the page
 * @param {HTMLElement|Document} container - Container to search for carousels
 * @returns {Array<Carousel>} Array of initialized carousel instances
 */
function initCarousels(container = document) {
  const carousels = container.querySelectorAll('.carousel, [data-carousel]');
  const instances = [];

  carousels.forEach(carousel => {
    if (!carousel.hasAttribute('data-carousel-initialized')) {
      carousel.setAttribute('data-carousel-initialized', 'true');

      // Get options from data attributes
      const options = {
        autoPlay: carousel.dataset.autoPlay === 'true',
        autoPlayInterval: parseInt(carousel.dataset.autoPlayInterval) || 5000,
        showIndicators: carousel.dataset.showIndicators !== 'false',
        showNavigation: carousel.dataset.showNavigation !== 'false',
        animationDuration: parseInt(carousel.dataset.animationDuration) || 500,
        loop: carousel.dataset.loop !== 'false'
      };

      const instance = new Carousel(carousel, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize carousels when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initCarousels();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Carousel, initCarousels };
}

// Also make it available globally
window.Carousel = Carousel;
window.initCarousels = initCarousels;