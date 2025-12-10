/**
 * Carousel Component
 * Touch-enabled carousel with navigation, indicators, and autoplay
 * Compatible with jazer-brand.css styling
 */

class Carousel {
  /**
   * Creates a new carousel component
   * @param {HTMLElement} carouselElement - The carousel container element
   * @param {Object} options - Configuration options for the carousel
   */
  constructor(carouselElement, options = {}) {
    this.carousel = carouselElement;
    this.options = {
      autoplay: false,
      autoplayInterval: 5000,
      showNavigation: true,
      showIndicators: true,
      loop: true,
      animationDuration: 500,
      animationType: 'slide', // 'slide' or 'fade'
      startIndex: 0,
      ...options
    };
    
    this.slides = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.autoplayTimer = null;
    this.slideCount = 0;

    // Touch and mouse variables for swipe gestures
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.mouseStartX = 0;
    this.mouseEndX = 0;
    this.isMouseDown = false;
    
    this.init();
  }

  /**
   * Initializes the carousel
   */
  init() {
    this.prepareSlides();
    this.createStructure();
    this.bindEvents();
    
    // Go to initial slide
    this.goToSlide(this.options.startIndex, false); // Don't animate for first transition
    
    // Start autoplay if enabled
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  /**
   * Prepares slides by setting up the internal structure
   */
  prepareSlides() {
    // Find all slide elements
    this.slides = Array.from(this.carousel.querySelectorAll('.slide'));
    this.slideCount = this.slides.length;

    if (this.slides.length === 0) {
      console.warn('No slides found in carousel');
      return;
    }

    // Add carousel classes
    this.carousel.classList.add('carousel');
    this.carousel.style.position = 'relative';
    this.carousel.style.overflow = 'hidden';
    this.carousel.style.width = '100%';

    // Add container for slides
    this.slidesContainer = document.createElement('div');
    this.slidesContainer.className = 'carousel-slides-container';
    this.slidesContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      transition: transform ${this.options.animationDuration}ms ease-in-out;
    `;

    // Move slides to container
    this.slides.forEach(slide => {
      slide.style.flex = '0 0 100%';
      slide.style.minWidth = '100%';
      this.slidesContainer.appendChild(slide);
    });

    this.carousel.appendChild(this.slidesContainer);
  }

  /**
   * Creates carousel structure including navigation and indicators
   */
  createStructure() {
    // Create navigation buttons if enabled
    if (this.options.showNavigation) {
      this.createNavigationButtons();
    }
    
    // Create indicators if enabled
    if (this.options.showIndicators) {
      this.createIndicators();
    }
  }

  /**
   * Creates navigation buttons (previous/next)
   */
  createNavigationButtons() {
    // Previous button
    this.prevButton = document.createElement('button');
    this.prevButton.className = 'carousel-prev-btn';
    this.prevButton.innerHTML = '‹';
    this.prevButton.setAttribute('aria-label', 'Previous slide');
    this.prevButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid var(--border-cyan);
      color: var(--text-light);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      font-size: 1.5rem;
      transition: all 0.3s ease;
    `;
    
    // Next button
    this.nextButton = document.createElement('button');
    this.nextButton.className = 'carousel-next-btn';
    this.nextButton.innerHTML = '›';
    this.nextButton.setAttribute('aria-label', 'Next slide');
    this.nextButton.style.cssText = `
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid var(--border-cyan);
      color: var(--text-light);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      font-size: 1.5rem;
      transition: all 0.3s ease;
    `;
    
    // Event listeners for navigation buttons
    this.prevButton.addEventListener('click', () => {
      this.previous();
    });
    
    this.nextButton.addEventListener('click', () => {
      this.next();
    });
    
    // Add buttons to carousel
    this.carousel.appendChild(this.prevButton);
    this.carousel.appendChild(this.nextButton);
  }

  /**
   * Creates indicator dots for slide navigation
   */
  createIndicators() {
    this.indicatorsContainer = document.createElement('div');
    this.indicatorsContainer.className = 'carousel-indicators';
    this.indicatorsContainer.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    `;
    
    this.slides.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.className = 'carousel-indicator';
      indicator.dataset.slideIndex = index;
      indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
      indicator.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid var(--text-light);
        background: transparent;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      
      // Set active class for first indicator
      if (index === 0) {
        this.setIndicatorActive(indicator);
      }
      
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
      
      this.indicatorsContainer.appendChild(indicator);
    });
    
    this.carousel.appendChild(this.indicatorsContainer);
  }

  /**
   * Sets an indicator as active
   * @param {HTMLElement} indicator - The indicator element to make active
   */
  setIndicatorActive(indicator) {
    indicator.style.background = 'var(--jazer-cyan)';
    indicator.style.border = '1px solid var(--jazer-cyan)';
  }

  /**
   * Sets an indicator as inactive
   * @param {HTMLElement} indicator - The indicator element to make inactive
   */
  setIndicatorInactive(indicator) {
    indicator.style.background = 'transparent';
    indicator.style.border = '1px solid var(--text-light)';
  }

  /**
   * Binds event listeners for carousel functionality
   */
  bindEvents() {
    // Touch/swipe events
    this.carousel.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    });

    this.carousel.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    });

    // Mouse events for desktop swipe simulation
    this.carousel.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.mouseStartX = e.screenX;
      this.carousel.style.cursor = 'grabbing';
    });

    this.carousel.addEventListener('mouseup', (e) => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.mouseEndX = e.screenX;
        this.handleSwipe();
        this.carousel.style.cursor = 'grab';
      }
    });

    this.carousel.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const dx = e.screenX - this.mouseStartX;
        // Could add swipe preview effect here
      }
    });

    const handleGlobalMouseUp = (e) => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.handleSwipe();
        this.carousel.style.cursor = 'default';
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);

    // Store reference to remove later if needed
    this.handleGlobalMouseUp = handleGlobalMouseUp;
    
    // Mouse enter/leave for autoplay
    if (this.options.autoplay) {
      this.carousel.addEventListener('mouseenter', () => {
        this.pauseAutoplay();
      });
      
      this.carousel.addEventListener('mouseleave', () => {
        this.resumeAutoplay();
      });
    }
  }

  /**
   * Handles swipe gesture for navigation
   */
  handleSwipe() {
    const minSwipeDistance = 50;
    const touchDistance = this.touchStartX - this.touchEndX;
    const mouseDistance = this.mouseStartX - this.mouseEndX;

    // Use touch distance if touch was detected, otherwise mouse distance
    const swipeDistance = Math.abs(touchDistance) > 0 ? touchDistance : mouseDistance;

    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    if (swipeDistance > 0) {
      // Swiped left - next slide
      this.next();
    } else {
      // Swiped right - previous slide
      this.previous();
    }
  }

  /**
   * Goes to the next slide
   */
  next() {
    const newIndex = this.options.loop ? 
      (this.currentIndex + 1) % this.slides.length : 
      Math.min(this.currentIndex + 1, this.slides.length - 1);
    
    if (newIndex !== this.currentIndex) {
      this.goToSlide(newIndex);
    }
  }

  /**
   * Goes to the previous slide
   */
  previous() {
    const newIndex = this.options.loop ? 
      (this.currentIndex + this.slides.length - 1) % this.slides.length : 
      Math.max(this.currentIndex - 1, 0);
    
    if (newIndex !== this.currentIndex) {
      this.goToSlide(newIndex);
    }
  }

  /**
   * Goes to a specific slide
   * @param {number} index - Index of the slide to go to
   * @param {boolean} animate - Whether to animate the transition (defaults to true)
   */
  goToSlide(index, animate = true) {
    if (this.isTransitioning || index === this.currentIndex || index < 0 || index >= this.slides.length) {
      return;
    }

    this.isTransitioning = true;

    const fromIndex = this.currentIndex;
    this.currentIndex = index;

    // Update slides container position
    const translateX = -index * 100;
    this.slidesContainer.style.transform = `translateX(${translateX}%)`;

    // Update indicators
    if (this.options.showIndicators) {
      const indicators = this.indicatorsContainer.querySelectorAll('.carousel-indicator');
      indicators.forEach((indicator, idx) => {
        if (idx === index) {
          this.setIndicatorActive(indicator);
        } else {
          this.setIndicatorInactive(indicator);
        }
      });
    }

    // Update ARIA attributes
    this.carousel.setAttribute('aria-busy', 'true');

    // If using fade animation, handle opacity transitions
    if (this.options.animationType === 'fade') {
      this.slides.forEach((slide, idx) => {
        if (idx === index) {
          slide.style.zIndex = '1';
          slide.style.opacity = '0';
        } else {
          slide.style.zIndex = '0';
          slide.style.opacity = '1';
        }
      });

      // Animate to the new slide
      setTimeout(() => {
        this.slides[fromIndex].style.opacity = '0';
        this.slides[index].style.opacity = '1';
      }, 10);
    }

    // Clear transitioning flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
      this.carousel.setAttribute('aria-busy', 'false');
    }, this.options.animationDuration);
  }

  /**
   * Starts autoplay
   */
  startAutoplay() {
    if (this.autoplayTimer) return;
    
    this.autoplayTimer = setInterval(() => {
      if (!this.isTransitioning) {
        this.next();
      }
    }, this.options.autoplayInterval);
  }

  /**
   * Stops autoplay
   */
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  /**
   * Pauses autoplay
   */
  pauseAutoplay() {
    if (this.options.autoplay) {
      this.stopAutoplay();
    }
  }

  /**
   * Resumes autoplay
   */
  resumeAutoplay() {
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  /**
   * Destroys the carousel and cleans up resources
   */
  destroy() {
    this.stopAutoplay();
    
    // Remove event listeners (simplified, in real implementation you'd store references)
    if (this.prevButton) this.prevButton.removeEventListener('click', this.previous);
    if (this.nextButton) this.nextButton.removeEventListener('click', this.next);
    
    if (this.indicatorsContainer) {
      this.indicatorsContainer.remove();
    }
    
    if (this.prevButton) this.prevButton.remove();
    if (this.nextButton) this.nextButton.remove();
  }
}

/**
 * Initializes all carousels on the page
 * @param {HTMLElement|Document} container - Container to search for carousels
 * @returns {Array<Carousel>} Array of initialized carousel instances
 */
function initCarousels(container = document) {
  const carouselElements = container.querySelectorAll('.carousel, [data-carousel]');
  const instances = [];
  
  carouselElements.forEach(carouselElement => {
    if (!carouselElement.hasAttribute('data-carousel-initialized')) {
      carouselElement.setAttribute('data-carousel-initialized', 'true');
      
      // Get options from data attributes
      const options = {
        autoplay: carouselElement.dataset.autoplay === 'true',
        autoplayInterval: parseInt(carouselElement.dataset.autoplayInterval) || 5000,
        showNavigation: carouselElement.dataset.navigation !== 'false',
        showIndicators: carouselElement.dataset.indicators !== 'false',
        loop: carouselElement.dataset.loop !== 'false',
        animationDuration: parseInt(carouselElement.dataset.animationDuration) || 500,
        animationType: carouselElement.dataset.animationType || 'slide',
        startIndex: parseInt(carouselElement.dataset.startIndex) || 0
      };
      
      const instance = new Carousel(carouselElement, options);
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