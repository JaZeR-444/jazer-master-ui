/**
 * Slider/Carousel Component
 * Touch-enabled slider with navigation and autoplay capabilities
 * Compatible with jazer-brand.css styling
 */

class Slider {
  /**
   * Creates a new slider component
   * @param {HTMLElement} sliderElement - The slider container element
   * @param {Object} options - Configuration options
   */
  constructor(sliderElement, options = {}) {
    this.slider = sliderElement;
    this.options = {
      autoplay: false,
      autoplayInterval: 5000,
      showNavigation: true,
      showIndicators: true,
      loop: true,
      animationDuration: 500,
      ...options
    };
    
    this.slides = [];
    this.currentIndex = 0;
    this.autoplayTimer = null;
    this.isTransitioning = false;
    
    this.init();
  }

  /**
   * Initializes the slider
   */
  init() {
    // Get slides
    this.slides = Array.from(this.slider.querySelectorAll('.slide'));
    
    if (this.slides.length === 0) {
      console.warn('No slides found in slider');
      return;
    }
    
    // Add slider classes
    this.slider.classList.add('slider-container');
    
    // Initialize slides
    this.slides.forEach((slide, index) => {
      slide.classList.add('slide');
      slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
      
      if (index === 0) {
        slide.classList.add('slide-active');
      } else {
        slide.style.display = 'none'; // Start with only first slide visible
      }
    });
    
    // Create navigation if enabled
    if (this.options.showNavigation) {
      this.createNavigation();
    }
    
    // Create indicators if enabled
    if (this.options.showIndicators) {
      this.createIndicators();
    }
    
    // Bind events
    this.bindEvents();
    
    // Start autoplay if enabled
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  /**
   * Creates navigation buttons (previous/next)
   */
  createNavigation() {
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'slider-prev btn btn-outline';
    prevButton.innerHTML = '‹';
    prevButton.setAttribute('aria-label', 'Previous slide');
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'slider-next btn btn-outline';
    nextButton.innerHTML = '›';
    nextButton.setAttribute('aria-label', 'Next slide');
    
    // Add navigation to slider
    this.slider.appendChild(prevButton);
    this.slider.appendChild(nextButton);
    
    // Store references
    this.prevButton = prevButton;
    this.nextButton = nextButton;
  }

  /**
   * Creates indicator dots
   */
  createIndicators() {
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'slider-indicators';
    
    this.slides.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.className = 'indicator';
      indicator.setAttribute('data-slide-index', index);
      indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
      
      if (index === 0) {
        indicator.classList.add('indicator-active');
      }
      
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
      
      indicatorsContainer.appendChild(indicator);
    });
    
    this.slider.appendChild(indicatorsContainer);
    this.indicatorsContainer = indicatorsContainer;
  }

  /**
   * Binds event listeners
   */
  bindEvents() {
    // Navigation buttons
    if (this.options.showNavigation) {
      this.prevButton.addEventListener('click', () => {
        this.previous();
      });
      
      this.nextButton.addEventListener('click', () => {
        this.next();
      });
    }
    
    // Touch/swipe events
    let startX = 0;
    let endX = 0;
    
    this.slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    this.slider.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe(startX, endX);
    });
    
    // Mouse events for desktop swipe simulation
    this.slider.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      this.slider.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    });
    
    const mouseMoveHandler = (e) => {
      if (Math.abs(e.clientX - startX) > 5) {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      }
    };
    
    const mouseUpHandler = (e) => {
      endX = e.clientX;
      this.handleSwipe(startX, endX);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    
    // Pause autoplay on hover
    if (this.options.autoplay) {
      this.slider.addEventListener('mouseenter', () => {
        this.pauseAutoplay();
      });
      
      this.slider.addEventListener('mouseleave', () => {
        this.resumeAutoplay();
      });
    }
  }

  /**
   * Handles swipe gestures
   * @param {number} start - Starting x coordinate
   * @param {number} end - Ending x coordinate
   */
  handleSwipe(start, end) {
    const threshold = 50; // Minimum distance to trigger swipe
    const diff = start - end;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left (next)
        this.next();
      } else {
        // Swipe right (prev)
        this.previous();
      }
    }
  }

  /**
   * Goes to the next slide
   */
  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  /**
   * Goes to the previous slide
   */
  previous() {
    const prevIndex = (this.currentIndex + this.slides.length - 1) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  /**
   * Goes to a specific slide
   * @param {number} index - Index of the slide to show
   */
  goToSlide(index) {
    if (index === this.currentIndex || this.isTransitioning) return;
    
    if (index < 0 || index >= this.slides.length) {
      if (this.options.loop) {
        index = index < 0 ? this.slides.length - 1 : 0;
      } else {
        return;
      }
    }
    
    this.isTransitioning = true;
    
    // Hide current slide
    const currentSlide = this.slides[this.currentIndex];
    currentSlide.classList.remove('slide-active');
    currentSlide.setAttribute('aria-hidden', 'true');
    currentSlide.style.opacity = '0';
    currentSlide.style.transform = 'translateX(100px)';
    
    // Show new slide
    const newSlide = this.slides[index];
    newSlide.style.display = 'block';
    newSlide.style.opacity = '0';
    newSlide.style.transform = 'translateX(-100px)';
    
    // Trigger reflow
    newSlide.offsetHeight;
    
    // Animate
    newSlide.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
    newSlide.style.opacity = '1';
    newSlide.style.transform = 'translateX(0)';
    
    setTimeout(() => {
      currentSlide.style.display = 'none';
      newSlide.classList.add('slide-active');
      newSlide.setAttribute('aria-hidden', 'false');
      
      // Update indicators
      if (this.options.showIndicators && this.indicatorsContainer) {
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, i) => {
          indicator.classList.toggle('indicator-active', i === index);
        });
      }
      
      this.currentIndex = index;
      this.isTransitioning = false;
    }, this.options.animationDuration);
  }

  /**
   * Starts autoplay
   */
  startAutoplay() {
    if (!this.options.autoplay) return;
    
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.options.autoplayInterval);
  }

  /**
   * Pauses autoplay
   */
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  /**
   * Resumes autoplay
   */
  resumeAutoplay() {
    if (this.options.autoplay && !this.autoplayTimer) {
      this.startAutoplay();
    }
  }
}

/**
 * Initializes all sliders on the page
 * @param {HTMLElement|Document} container - Container to search for sliders
 * @returns {Array<Slider>} Array of initialized slider instances
 */
function initSliders(container = document) {
  const sliders = container.querySelectorAll('.slider, .carousel, [data-slider]');
  const instances = [];
  
  sliders.forEach(slider => {
    if (!slider.hasAttribute('data-slider-initialized')) {
      slider.setAttribute('data-slider-initialized', 'true');
      
      // Get options from data attributes
      const options = {
        autoplay: slider.dataset.autoplay === 'true',
        autoplayInterval: parseInt(slider.dataset.autoplayInterval) || 5000,
        showNavigation: slider.dataset.navigation !== 'false',
        showIndicators: slider.dataset.indicators !== 'false',
        loop: slider.dataset.loop !== 'false',
        animationDuration: parseInt(slider.dataset.animationDuration) || 500
      };
      
      const instance = new Slider(slider, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize sliders when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initSliders();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Slider, initSliders };
}

// Also make it available globally
window.Slider = Slider;
window.initSliders = initSliders;