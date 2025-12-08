/**
 * Image Gallery Component
 * Responsive image gallery with lightbox functionality
 * Compatible with jazer-brand.css styling
 */

class ImageGallery {
  /**
   * Creates a new image gallery
   * @param {HTMLElement} galleryElement - The gallery container element
   * @param {Object} options - Configuration options
   */
  constructor(galleryElement, options = {}) {
    this.gallery = galleryElement;
    this.options = {
      enableLightbox: true,
      showCaptions: true,
      showThumbnails: true,
      animationDuration: 300,
      autoplay: false,
      autoplayInterval: 5000,
      ...options
    };
    
    this.images = [];
    this.currentIndex = 0;
    this.lightbox = null;
    this.thumbnails = [];
    
    this.init();
  }

  /**
   * Initializes the image gallery
   */
  init() {
    // Find all images in the gallery
    this.images = Array.from(this.gallery.querySelectorAll('img, .gallery-image'));
    
    if (this.images.length === 0) {
      console.warn('No images found in gallery');
      return;
    }
    
    // Add gallery classes
    this.gallery.classList.add('image-gallery');
    
    // Process each image
    this.images.forEach((image, index) => {
      // Wrap image if not already wrapped
      if (!image.closest('.gallery-item')) {
        const galleryItem = document.createElement('figure');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.index = index;
        
        // If it's an img element, wrap it
        if (image.tagName === 'IMG') {
          const wrapper = document.createElement('div');
          wrapper.className = 'gallery-image-container';
          
          image.classList.add('gallery-img');
          image.style.cursor = this.options.enableLightbox ? 'pointer' : 'default';
          
          wrapper.appendChild(image.cloneNode(true)); // Clone to preserve original
          galleryItem.appendChild(wrapper);
        } else {
          // If it's already a container, use it
          galleryItem.appendChild(image);
        }
        
        // Add caption if available
        if (this.options.showCaptions) {
          const caption = image.alt || image.dataset.caption || image.querySelector('figcaption')?.textContent;
          if (caption) {
            const figCaption = document.createElement('figcaption');
            figCaption.className = 'gallery-caption';
            figCaption.textContent = caption;
            galleryItem.appendChild(figCaption);
          }
        }
        
        // Add click event for lightbox
        if (this.options.enableLightbox) {
          galleryItem.addEventListener('click', () => {
            this.openLightbox(index);
          });
        }
        
        // Insert gallery item
        if (image.parentNode) {
          image.parentNode.replaceChild(galleryItem, image);
        } else {
          this.gallery.appendChild(galleryItem);
        }
      }
    });
    
    // Create thumbnails if enabled
    if (this.options.showThumbnails) {
      this.createThumbnails();
    }
    
    // Bind events
    this.bindEvents();
  }

  /**
   * Creates thumbnail navigation for the gallery
   */
  createThumbnails() {
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'gallery-thumbnails';
    thumbContainer.style.cssText = `
      display: flex;
      overflow-x: auto;
      gap: 0.5rem;
      padding: 1rem 0;
      scrollbar-width: thin;
      scrollbar-color: var(--jazer-cyan) var(--bg-dark);
    `;
    
    this.images.forEach((image, index) => {
      const thumb = document.createElement('img');
      thumb.src = image.src || image.querySelector('img')?.src;
      thumb.className = 'gallery-thumb';
      thumb.alt = image.alt || `Thumbnail ${index + 1}`;
      thumb.dataset.index = index;
      thumb.style.cssText = `
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 6px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.3s ease;
      `;
      
      if (index === 0) {
        thumb.style.borderColor = 'var(--jazer-cyan)';
      }
      
      thumb.addEventListener('click', () => {
        this.openLightbox(index);
      });
      
      thumbContainer.appendChild(thumb);
      this.thumbnails.push(thumb);
    });
    
    this.gallery.appendChild(thumbContainer);
  }

  /**
   * Binds event listeners for the gallery
   */
  bindEvents() {
    // Keyboard navigation when lightbox is open
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox || !this.lightboxVisible) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          this.previousImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
        case 'Escape':
          this.closeLightbox();
          break;
      }
    });
  }

  /**
   * Opens the lightbox with a specific image
   * @param {number} index - Index of the image to display
   */
  openLightbox(index) {
    if (!this.options.enableLightbox) return;
    
    // Create lightbox if it doesn't exist
    if (!this.lightbox) {
      this.createLightbox();
    }
    
    this.currentIndex = index;
    this.updateLightbox();
    
    // Show lightbox
    this.lightbox.style.display = 'flex';
    this.lightbox.style.opacity = '0';
    this.lightbox.style.zIndex = '10000';
    
    // Trigger reflow
    this.lightbox.offsetHeight;
    
    // Animate in
    this.lightbox.style.transition = `opacity ${this.options.animationDuration}ms ease`;
    this.lightbox.style.opacity = '1';
    
    this.lightboxVisible = true;
  }

  /**
   * Creates the lightbox elements
   */
  createLightbox() {
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'lightbox';
    this.lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 2rem;
    `;
    
    // Lightbox content container
    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';
    lightboxContent.style.cssText = `
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
    `;
    
    // Lightbox image
    this.lightboxImg = document.createElement('img');
    this.lightboxImg.className = 'lightbox-image';
    this.lightboxImg.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
      display: block;
    `;
    
    // Navigation arrows
    this.lightboxPrev = document.createElement('button');
    this.lightboxPrev.className = 'lightbox-nav lightbox-prev';
    this.lightboxPrev.innerHTML = '‹';
    this.lightboxPrev.style.cssText = `
      position: absolute;
      left: -60px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: 2px solid var(--jazer-cyan);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.5rem;
    `;
    
    this.lightboxNext = document.createElement('button');
    this.lightboxNext.className = 'lightbox-nav lightbox-next';
    this.lightboxNext.innerHTML = '›';
    this.lightboxNext.style.cssText = `
      position: absolute;
      right: -60px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: 2px solid var(--jazer-cyan);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.5rem;
    `;
    
    // Close button
    this.lightboxClose = document.createElement('button');
    this.lightboxClose.className = 'lightbox-close';
    this.lightboxClose.innerHTML = '×';
    this.lightboxClose.style.cssText = `
      position: absolute;
      top: -40px;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
    `;
    
    // Captions
    this.lightboxCaption = document.createElement('div');
    this.lightboxCaption.className = 'lightbox-caption';
    this.lightboxCaption.style.cssText = `
      text-align: center;
      color: white;
      margin-top: 1rem;
      font-size: 1.1rem;
    `;
    
    // Index counter
    this.lightboxCounter = document.createElement('div');
    this.lightboxCounter.className = 'lightbox-counter';
    this.lightboxCounter.style.cssText = `
      text-align: center;
      color: var(--jazer-cyan);
      margin-top: 0.5rem;
      font-size: 0.9rem;
    `;
    
    // Add event listeners
    this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    this.lightboxPrev.addEventListener('click', () => this.previousImage());
    this.lightboxNext.addEventListener('click', () => this.nextImage());
    
    // Click on overlay to close
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });
    
    // Add elements to lightbox
    lightboxContent.appendChild(this.lightboxImg);
    lightboxContent.appendChild(this.lightboxPrev);
    lightboxContent.appendChild(this.lightboxNext);
    lightboxContent.appendChild(this.lightboxClose);
    lightboxContent.appendChild(this.lightboxCaption);
    lightboxContent.appendChild(this.lightboxCounter);
    this.lightbox.appendChild(lightboxContent);
    
    // Add to document
    document.body.appendChild(this.lightbox);
  }

  /**
   * Updates the lightbox with current image
   */
  updateLightbox() {
    if (!this.lightbox) return;
    
    const currentImage = this.images[this.currentIndex];
    
    // Update image source
    this.lightboxImg.src = currentImage.src || currentImage.querySelector('img')?.src;
    this.lightboxImg.alt = currentImage.alt || `Gallery image ${this.currentIndex + 1}`;
    
    // Update caption
    const caption = currentImage.alt || currentImage.dataset.caption || '';
    this.lightboxCaption.textContent = caption;
    
    // Update index counter
    this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    
    // Enable/disable navigation based on position
    this.lightboxPrev.disabled = this.currentIndex === 0 && !this.options.loop;
    this.lightboxNext.disabled = this.currentIndex === this.images.length - 1 && !this.options.loop;
    
    // Update thumbnail selection
    if (this.thumbnails.length > 0) {
      this.thumbnails.forEach((thumb, idx) => {
        thumb.style.borderColor = idx === this.currentIndex ? 'var(--jazer-cyan)' : 'transparent';
      });
    }
  }

  /**
   * Closes the lightbox
   */
  closeLightbox() {
    if (!this.lightboxVisible) return;
    
    // Animate out
    this.lightbox.style.opacity = '0';
    
    setTimeout(() => {
      if (this.lightbox) {
        this.lightbox.style.display = 'none';
      }
      this.lightboxVisible = false;
    }, this.options.animationDuration);
  }

  /**
   * Shows the previous image
   */
  previousImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.options.loop) {
      this.currentIndex = this.images.length - 1;
    }
    
    this.updateLightbox();
  }

  /**
   * Shows the next image
   */
  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else if (this.options.loop) {
      this.currentIndex = 0;
    }
    
    this.updateLightbox();
  }

  /**
   * Starts autoplay slideshow
   */
  startAutoplay() {
    if (!this.options.autoplay) return;
    
    this.autoplayInterval = setInterval(() => {
      this.nextImage();
    }, this.options.autoplayInterval);
  }

  /**
   * Stops autoplay slideshow
   */
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

/**
 * Initializes all image galleries on the page
 * @param {HTMLElement|Document} container - Container to search for galleries
 * @returns {Array<ImageGallery>} Array of initialized gallery instances
 */
function initImageGalleries(container = document) {
  const galleries = container.querySelectorAll('.image-gallery, .gallery, [data-gallery]');
  const instances = [];
  
  galleries.forEach(gallery => {
    if (!gallery.hasAttribute('data-gallery-initialized')) {
      gallery.setAttribute('data-gallery-initialized', 'true');
      
      // Get options from data attributes
      const options = {
        enableLightbox: gallery.dataset.lightbox !== 'false',
        showCaptions: gallery.dataset.showCaptions !== 'false',
        showThumbnails: gallery.dataset.showThumbnails !== 'false',
        animationDuration: parseInt(gallery.dataset.animationDuration) || 300,
        autoplay: gallery.dataset.autoplay === 'true',
        autoplayInterval: parseInt(gallery.dataset.autoplayInterval) || 5000,
        loop: gallery.dataset.loop !== 'false'
      };
      
      const instance = new ImageGallery(gallery, options);
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Auto-initialize image galleries when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initImageGalleries();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageGallery, initImageGalleries };
}

// Also make it available globally
window.ImageGallery = ImageGallery;
window.initImageGalleries = initImageGalleries;