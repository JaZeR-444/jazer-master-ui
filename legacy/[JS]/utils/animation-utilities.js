/**
 * Animation Utilities Module
 * Comprehensive animation utilities with support for CSS and JavaScript animations
 * Compatible with jazer-brand.css styling for animated elements
 */

class AnimationUtils {
  /**
   * Creates a new animation utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultDuration: 300,
      defaultEasing: 'ease-in-out',
      defaultDelay: 0,
      defaultIterations: 1,
      defaultFillMode: 'both',
      ...options
    };

    this.animationRegistry = new Map();
    this.runningAnimations = new Set();
    this.animationQueue = [];
    this.animationFrames = new Set();
  }

  /**
   * Animate an element with CSS animations
   * @param {HTMLElement} element - Element to animate
   * @param {Object} properties - CSS properties to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  animateCSS(element, properties, options = {}) {
    return new Promise((resolve, reject) => {
      if (!element || !(element instanceof HTMLElement)) {
        reject(new Error('Invalid element provided to animateCSS'));
        return;
      }

      const {
        duration = this.options.defaultDuration,
        easing = this.options.defaultEasing,
        delay = this.options.defaultDelay,
        fillMode = this.options.defaultFillMode,
        iterationCount = this.options.defaultIterations,
        complete = null,
        ...cssProps
      } = options;

      // Store original styles to restore later
      const originalStyles = {};
      for (const prop in properties) {
        originalStyles[prop] = element.style.getPropertyValue(prop);
      }

      // Set animation properties with transitions
      const transitionValue = Object.keys(properties)
        .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
        .join(',');

      // Apply transition
      element.style.transition = transitionValue;

      // Apply new styles
      for (const [prop, value] of Object.entries(properties)) {
        element.style.setProperty(prop, value);
      }

      // Set up callback for when animation completes
      const handleTransitionEnd = (e) => {
        if (e.target === element) {
          // Restore transition property
          element.style.transition = '';
          
          // Remove event listener
          element.removeEventListener('transitionend', handleTransitionEnd);
          
          // Execute complete callback if provided
          if (complete) complete(element);
          
          resolve({ element, properties });
        }
      };

      // Add transition end event listener
      element.addEventListener('transitionend', handleTransitionEnd);
      
      // Also listen for animation end in case of CSS animations
      element.addEventListener('animationend', handleTransitionEnd);
    });
  }

  /**
   * Animate an element using the Web Animations API
   * @param {HTMLElement} element - Element to animate
   * @param {Array} keyframes - Array of keyframes
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  animateWebAPI(element, keyframes, options = {}) {
    return new Promise((resolve, reject) => {
      if (!element || !(element instanceof HTMLElement)) {
        reject(new Error('Invalid element provided to animateWebAPI'));
        return;
      }

      const animationOptions = {
        duration: options.duration || this.options.defaultDuration,
        easing: options.easing || this.options.defaultEasing,
        fill: options.fillMode || this.options.defaultFillMode,
        iterations: options.iterationCount || this.options.defaultIterations,
        delay: options.delay || this.options.defaultDelay,
        direction: options.direction || 'normal',
        ...options
      };

      try {
        // Create the animation
        const animation = element.animate(keyframes, animationOptions);

        // Register animation
        const animationId = `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.animationRegistry.set(animationId, animation);
        this.runningAnimations.add(animationId);

        // Set up completion handler
        animation.onfinish = () => {
          this.runningAnimations.delete(animationId);
          this.animationRegistry.delete(animationId);
          resolve({ element, animation, animationId });
        };

        animation.oncancel = () => {
          this.runningAnimations.delete(animationId);
          this.animationRegistry.delete(animationId);
          reject(new Error('Animation cancelled'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Creates a fade in animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  fadeIn(element, options = {}) {
    const defaultOpts = {
      duration: options.duration || 300,
      easing: options.easing || 'ease-out',
      fromOpacity: options.fromOpacity || 0,
      toOpacity: options.toOpacity || 1,
      ...options
    };

    return this.animateCSS(element, {
      opacity: `${defaultOpts.toOpacity}`
    }, {
      ...defaultOpts,
      duration: defaultOpts.duration,
      easing: defaultOpts.easing,
      complete: (el) => {
        el.style.removeProperty('visibility');
        if (defaultOpts.complete) defaultOpts.complete(el);
      }
    });
  }

  /**
   * Creates a fade out animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  fadeOut(element, options = {}) {
    const defaultOpts = {
      duration: options.duration || 300,
      easing: options.easing || 'ease-in',
      fromOpacity: options.fromOpacity || 1,
      toOpacity: options.toOpacity || 0,
      ...options
    };

    return this.animateCSS(element, {
      opacity: `${defaultOpts.toOpacity}`
    }, {
      ...defaultOpts,
      duration: defaultOpts.duration,
      easing: defaultOpts.easing,
      complete: (el) => {
        el.style.visibility = 'hidden';
        if (defaultOpts.complete) defaultOpts.complete(el);
      }
    });
  }

  /**
   * Creates a slide in animation from a direction
   * @param {HTMLElement} element - Element to animate
   * @param {string} direction - Direction to slide from ('up', 'down', 'left', 'right')
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  slideIn(element, direction, options = {}) {
    const distances = {
      up: '100%',
      down: '-100%',
      left: '100%',
      right: '-100%'
    };

    const translateProp = (direction === 'left' || direction === 'right') ? 'translateX' : 'translateY';
    const distance = distances[direction] || '100%';

    // Temporarily set styles to position element outside view
    element.style.transform = `${translateProp}(${distance})`;
    element.style.opacity = '0';
    element.style.transition = 'none'; // No transition initially

    // Force reflow to ensure styles are applied
    void element.offsetHeight;

    // Now apply the animation
    return this.animateCSS(element, {
      transform: `${translateProp}(0)`,
      opacity: '1'
    }, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-out',
      ...options
    });
  }

  /**
   * Creates a slide out animation to a direction
   * @param {HTMLElement} element - Element to animate
   * @param {string} direction - Direction to slide to ('up', 'down', 'left', 'right')
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  slideOut(element, direction, options = {}) {
    const distances = {
      up: '-100%',
      down: '100%',
      left: '-100%',
      right: '100%'
    };

    const translateProp = (direction === 'left' || direction === 'right') ? 'translateX' : 'translateY';
    const distance = distances[direction] || '100%';

    return this.animateCSS(element, {
      transform: `${translateProp}(${distance})`,
      opacity: '0'
    }, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-in',
      ...options
    });
  }

  /**
   * Creates a bounce animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  bounce(element, options = {}) {
    const keyframes = [
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-30px)', offset: 0.4 },
      { transform: 'translateY(0)', offset: 0.6 },
      { transform: 'translateY(-15px)', offset: 0.8 },
      { transform: 'translateY(0)', offset: 1 }
    ];

    return this.animateWebAPI(element, keyframes, {
      duration: options.duration || 600,
      easing: options.easing || 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      ...options
    });
  }

  /**
   * Creates a pulse animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  pulse(element, options = {}) {
    const keyframes = [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.05)', offset: 0.5 },
      { transform: 'scale(1)', offset: 1 }
    ];

    return this.animateWebAPI(element, keyframes, {
      duration: options.duration || 400,
      iterations: options.iterations || 1,
      easing: options.easing || 'ease-in-out',
      ...options
    });
  }

  /**
   * Creates a shake animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  shake(element, options = {}) {
    const keyframes = [
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(-10px)', offset: 0.1 },
      { transform: 'translateX(10px)', offset: 0.2 },
      { transform: 'translateX(-10px)', offset: 0.3 },
      { transform: 'translateX(10px)', offset: 0.4 },
      { transform: 'translateX(-10px)', offset: 0.5 },
      { transform: 'translateX(10px)', offset: 0.6 },
      { transform: 'translateX(-10px)', offset: 0.7 },
      { transform: 'translateX(10px)', offset: 0.8 },
      { transform: 'translateX(-10px)', offset: 0.9 },
      { transform: 'translateX(0)', offset: 1 }
    ];

    return this.animateWebAPI(element, keyframes, {
      duration: options.duration || 600,
      easing: options.easing || 'ease-in-out',
      ...options
    });
  }

  /**
   * Creates a scale animation
   * @param {HTMLElement} element - Element to animate
   * @param {number} scale - Target scale value
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  scale(element, scale, options = {}) {
    return this.animateCSS(element, {
      transform: `scale(${scale})`
    }, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-in-out',
      ...options
    });
  }

  /**
   * Creates a rotation animation
   * @param {HTMLElement} element - Element to animate
   * @param {number} degrees - Degrees to rotate to
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  rotate(element, degrees, options = {}) {
    return this.animateCSS(element, {
      transform: `rotate(${degrees}deg)`
    }, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-in-out',
      ...options
    });
  }

  /**
   * Creates a swing animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  swing(element, options = {}) {
    const keyframes = [
      { transform: 'rotate(0deg)', offset: 0 },
      { transform: 'rotate(15deg)', offset: 0.2 },
      { transform: 'rotate(-10deg)', offset: 0.4 },
      { transform: 'rotate(5deg)', offset: 0.6 },
      { transform: 'rotate(-5deg)', offset: 0.8 },
      { transform: 'rotate(0deg)', offset: 1 }
    ];

    return this.animateWebAPI(element, keyframes, {
      duration: options.duration || 800,
      easing: options.easing || 'ease-in-out',
      ...options
    });
  }

  /**
   * Creates a flip animation
   * @param {HTMLElement} element - Element to animate
   * @param {string} axis - Axis to flip ('x', 'y', or 'both')
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  flip(element, axis = 'y', options = {}) {
    const transformValue = axis === 'x' ? 'rotateX(180deg)' :
                           axis === 'y' ? 'rotateY(180deg)' :
                           'rotateX(180deg) rotateY(180deg)';

    return this.animateCSS(element, {
      transform: transformValue
    }, {
      duration: options.duration || 600,
      easing: options.easing || 'ease-in-out',
      ...options
    });
  }

  /**
   * Creates a typewriter effect on text
   * @param {HTMLElement} element - Element to animate
   * @param {string} text - Text to type out
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  typewriter(element, text, options = {}) {
    return new Promise((resolve) => {
      const {
        delay = 50,
        startDelay = 0,
        callback = null
      } = options;

      element.textContent = '';

      setTimeout(() => {
        let index = 0;
        const typeInterval = setInterval(() => {
          if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
          } else {
            clearInterval(typeInterval);
            if (callback) callback(element);
            resolve({ element, text });
          }
        }, delay);
      }, startDelay);
    });
  }

  /**
   * Creates a text reveal animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  textReveal(element, options = {}) {
    const {
      duration = 300,
      direction = 'right', // 'left', 'right', 'top', 'bottom'
      ...restOptions
    } = options;

    let revealProperty, revealValue;
    
    switch (direction) {
      case 'left':
        revealProperty = 'transform';
        revealValue = 'translateX(-100%)';
        break;
      case 'right':
        revealProperty = 'transform';
        revealValue = 'translateX(100%)';
        break;
      case 'top':
        revealProperty = 'transform';
        revealValue = 'translateY(-100%)';
        break;
      case 'bottom':
        revealProperty = 'transform';
        revealValue = 'translateY(100%)';
        break;
      default:
        revealProperty = 'clip-path';
        revealValue = 'inset(0 100% 0 0)';
    }

    // Set initial state
    element.style[revealProperty] = revealValue;
    element.style.overflow = 'hidden';

    // Animate back to original state
    return this.animateCSS(element, {
      [revealProperty]: direction === 'left' || direction === 'right' || direction === 'top' || direction === 'bottom' 
        ? 'translateX(0) translateY(0)' 
        : 'inset(0 0 0 0)'
    }, {
      duration,
      easing: 'ease-out',
      ...restOptions
    });
  }

  /**
   * Chains multiple animations sequentially
   * @param {Array} animations - Array of animation functions with their arguments
   * @returns {Promise} Promise that resolves when all animations complete
   */
  async chain(animations) {
    for (const [fn, ...args] of animations) {
      await fn.apply(this, args);
    }
  }

  /**
   * Runs multiple animations in parallel
   * @param {Array} animations - Array of animation promises
   * @returns {Promise} Promise that resolves when all animations complete
   */
  parallel(animations) {
    return Promise.all(animations);
  }

  /**
   * Delays an animation by a specified amount
   * @param {number} time - Delay in milliseconds
   * @returns {Promise} Promise that resolves after the delay
   */
  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  /**
   * Creates a spring animation effect
   * @param {HTMLElement} element - Element to animate
   * @param {Object} properties - Properties to animate
   * @param {Object} options - Spring animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  spring(element, properties, options = {}) {
    const {
      tension = 170,  // Spring tension
      friction = 26,  // Friction coefficient
      precision = 0.01,  // Stopping precision
      duration = 1000,   // Max duration
      ...animationOpts
    } = options;

    return new Promise((resolve) => {
      let startValues = {};
      let endValues = {};
      const isComplete = {};
      
      // Get initial values and setup targets
      for (const [prop, targetValue] of Object.entries(properties)) {
        const currentStyle = window.getComputedStyle(element);
        const currentValue = parseFloat(currentStyle[prop]) || 0;
        startValues[prop] = currentValue;
        endValues[prop] = parseFloat(targetValue);
        isComplete[prop] = false;
      }

      let previousTime = null;
      let velocity = {}; // Velocity for each property

      const updateSpring = (timestamp) => {
        if (!previousTime) previousTime = timestamp;

        const deltaTime = (timestamp - previousTime) / 1000;
        previousTime = timestamp;

        let allComplete = true;
        const updates = {};

        for (const [prop, targetValue] of Object.entries(endValues)) {
          if (isComplete[prop]) continue;

          // Initialize velocity if not set
          if (velocity[prop] === undefined) {
            velocity[prop] = 0;
          }

          // Calculate forces and update position
          const displacement = targetValue - startValues[prop];
          const force = -tension * displacement - friction * velocity[prop];
          const acceleration = force;
          velocity[prop] += acceleration * deltaTime;
          startValues[prop] += velocity[prop] * deltaTime;

          // Check if we're close enough to target
          if (Math.abs(startValues[prop] - targetValue) < precision) {
            startValues[prop] = targetValue;
            isComplete[prop] = true;
          } else {
            allComplete = false;
          }

          updates[prop] = startValues[prop];
        }

        // Apply updates
        for (const [prop, value] of Object.entries(updates)) {
          if (prop.includes('transform')) {
            // Handle transform properties specially
            element.style.transform = value;
          } else {
            element.style[prop] = value + (prop.includes('opacity') ? '' : 'px');
          }
        }

        if (!allComplete && timestamp - startTime < duration) {
          requestAnimationFrame(updateSpring);
        } else {
          resolve({ element, properties });
        }
      };

      const startTime = performance.now();
      requestAnimationFrame(updateSpring);
    });
  }

  /**
   * Creates a staggered animation for multiple elements
   * @param {Array} elements - Array of elements to animate
   * @param {Function} animationFn - Animation function to apply
   * @param {Object} options - Stagger options
   * @returns {Promise} Promise that resolves when all animations complete
   */
  stagger(elements, animationFn, options = {}) {
    const {
      interval = 100,  // Time between each animation start
      direction = 'forward',  // 'forward', 'backward', 'center'
      start = null,  // Starting animation function
      end = null     // Ending animation function
    } = options;

    return new Promise(async (resolve) => {
      // Apply starting animation if provided
      if (start) {
        await start(elements);
      }

      // Determine order of animation based on direction
      let orderedElements;
      switch (direction) {
        case 'backward':
          orderedElements = [...elements].reverse();
          break;
        case 'center':
          // Create an order that starts from center and moves outward
          const center = Math.floor(elements.length / 2);
          orderedElements = [elements[center]];  // Start with center
          
          for (let i = 1; i <= center; i++) {
            if (center + i < elements.length) {
              orderedElements.push(elements[center + i]);
            }
            if (center - i >= 0) {
              orderedElements.push(elements[center - i]);
            }
          }
          break;
        default: // 'forward'
          orderedElements = elements;
      }

      // Animate elements with a delay between each
      const promises = orderedElements.map((element, index) => {
        return new Promise((res) => {
          setTimeout(() => {
            animationFn(element).then(res);
          }, index * interval);
        });
      });

      await Promise.all(promises);

      // Apply ending animation if provided
      if (end) {
        await end(elements);
      }

      resolve({ elements, animationFn });
    });
  }

  /**
   * Creates a morphing animation between two elements
   * @param {HTMLElement} element1 - First element
   * @param {HTMLElement} element2 - Second element
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  async morph(element1, element2, options = {}) {
    const {
      duration = 500,
      easing = 'ease-in-out',
      ...restOptions
    } = options;

    // Get the bounding rectangles
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    // Create the morphing animation
    const keyframes = [
      {
        transform: `translate(${rect1.left - rect2.left}px, ${rect1.top - rect2.top}px) scale(${rect1.width / rect2.width}, ${rect1.height / rect2.height})`,
        opacity: 0.8
      },
      {
        transform: 'translate(0, 0) scale(1, 1)',
        opacity: 1
      }
    ];

    return this.animateWebAPI(element2, keyframes, {
      duration,
      easing,
      ...restOptions
    });
  }

  /**
   * Creates a loading animation
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  loading(element, options = {}) {
    const {
      type = 'spin',  // 'spin', 'pulse', 'bounce', 'fade'
      duration = 800,
      ...restOptions
    } = options;

    switch (type) {
      case 'spin':
        return this.animateCSS(element, {
          transform: 'rotate(360deg)'
        }, {
          duration,
          easing: 'linear',
          iterationCount: 'infinite',
          ...restOptions
        });
      case 'pulse':
        return this.animateCSS(element, {
          transform: 'scale(1.1)',
          opacity: '0.7'
        }, {
          duration,
          easing: 'ease-in-out',
          iterationCount: 'infinite',
          direction: 'alternate',
          ...restOptions
        });
      case 'bounce':
        return this.animateCSS(element, {
          transform: 'translateY(-5px)'
        }, {
          duration,
          easing: 'ease-in-out',
          iterationCount: 'infinite',
          direction: 'alternate',
          ...restOptions
        });
      case 'fade':
        return this.animateCSS(element, {
          opacity: '0.5'
        }, {
          duration,
          easing: 'ease-in-out',
          iterationCount: 'infinite',
          direction: 'alternate',
          ...restOptions
        });
      default:
        throw new Error(`Unknown loading animation type: ${type}`);
    }
  }

  /**
   * Stops all running animations on an element
   * @param {HTMLElement} element - Element to stop animations for
   * @returns {void}
   */
  stop(element) {
    // Cancel any Web Animations API
    if (element.getAnimations) {
      const animations = element.getAnimations();
      animations.forEach(anim => {
        if (anim.playState !== 'finished') {
          anim.cancel();
        }
      });
    }
    
    // Reset CSS transition
    element.style.transition = 'none';
    
    // Force reflow to apply the style change
    void element.offsetHeight;
    
    // Reset to natural state
    element.style.transition = '';
  }

  /**
   * Pauses all running animations on an element
   * @param {HTMLElement} element - Element to pause animations for
   * @returns {void}
   */
  pause(element) {
    if (element.getAnimations) {
      const animations = element.getAnimations();
      animations.forEach(anim => {
        if (anim.playState === 'running') {
          anim.pause();
        }
      });
    }
  }

  /**
   * Resumes paused animations on an element
   * @param {HTMLElement} element - Element to resume animations for
   * @returns {void}
   */
  resume(element) {
    if (element.getAnimations) {
      const animations = element.getAnimations();
      animations.forEach(anim => {
        if (anim.playState === 'paused') {
          anim.play();
        }
      });
    }
  }

  /**
   * Gets the current animation state of an element
   * @param {HTMLElement} element - Element to check
   * @returns {Object} Object with animation state information
   */
  getState(element) {
    if (!element) return { running: false, paused: false, animations: 0 };

    const animations = element.getAnimations ? element.getAnimations() : [];
    const running = animations.filter(anim => anim.playState === 'running');
    const paused = animations.filter(anim => anim.playState === 'paused');

    return {
      running: running.length > 0,
      paused: paused.length > 0,
      animations: animations.length,
      runningAnimations: running.length,
      pausedAnimations: paused.length,
      playState: animations.length > 0 ? animations[0].playState : null
    };
  }

  /**
   * Creates a custom easing function
   * @param {number} x1 - First control point x coordinate
   * @param {number} y1 - First control point y coordinate
   * @param {number} x2 - Second control point x coordinate
   * @param {number} y2 - Second control point y coordinate
   * @returns {string} CSS cubic-bezier easing function string
   */
  createEasing(x1, y1, x2, y2) {
    // Validate input values
    if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
      throw new Error('Cubic Bezier x-coordinates must be between 0 and 1');
    }

    return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  }

  /**
   * Predefined easing functions
   */
  get easings() {
    return {
      // Standard easings
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Custom easings
      easeInSine: this.createEasing(0.47, 0, 0.745, 0.715),
      easeOutSine: this.createEasing(0.39, 0.575, 0.565, 1),
      easeInOutSine: this.createEasing(0.445, 0.05, 0.55, 0.95),
      easeInQuad: this.createEasing(0.55, 0.085, 0.68, 0.53),
      easeOutQuad: this.createEasing(0.25, 0.46, 0.45, 0.94),
      easeInOutQuad: this.createEasing(0.455, 0.03, 0.515, 0.955),
      easeInCubic: this.createEasing(0.55, 0.055, 0.675, 0.19),
      easeOutCubic: this.createEasing(0.215, 0.61, 0.355, 1),
      easeInOutCubic: this.createEasing(0.645, 0.045, 0.355, 1),
      easeInQuart: this.createEasing(0.895, 0.03, 0.685, 0.22),
      easeOutQuart: this.createEasing(0.165, 0.84, 0.44, 1),
      easeInOutQuart: this.createEasing(0.77, 0, 0.175, 1),
      easeInQuint: this.createEasing(0.755, 0.05, 0.855, 0.06),
      easeOutQuint: this.createEasing(0.23, 1, 0.32, 1),
      easeInOutQuint: this.createEasing(0.86, 0, 0.07, 1),
      easeInExpo: this.createEasing(0.95, 0.05, 0.795, 0.035),
      easeOutExpo: this.createEasing(0.19, 1, 0.22, 1),
      easeInOutExpo: this.createEasing(1, 0, 0, 1),
      easeInCirc: this.createEasing(0.6, 0.04, 0.98, 0.335),
      easeOutCirc: this.createEasing(0.075, 0.82, 0.165, 1),
      easeInOutCirc: this.createEasing(0.785, 0.135, 0.15, 0.86),
      easeInBack: this.createEasing(0.6, -0.28, 0.735, 0.045),
      easeOutBack: this.createEasing(0.175, 0.885, 0.32, 1.275),
      easeInOutBack: this.createEasing(0.68, -0.55, 0.265, 1.55)
    };
  }

  /**
   * Creates a custom animation with keyframes
   * @param {HTMLElement} element - Element to animate
   * @param {Array} keyframes - Array of keyframe objects
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  customAnimation(element, keyframes, options = {}) {
    const defaultOptions = {
      duration: options.duration || this.options.defaultDuration,
      easing: options.easing || this.options.defaultEasing,
      fill: options.fillMode || this.options.defaultFillMode,
      ...options
    };

    return this.animateWebAPI(element, keyframes, defaultOptions);
  }

  /**
   * Creates a sequence of animations
   * @param {HTMLElement} element - Element to animate
   * @param {Array} animations - Array of animation objects
   * @returns {Promise} Promise that resolves when all animations complete
   */
  async sequence(element, animations) {
    for (const animation of animations) {
      const { type, properties, options = {} } = animation;
      
      switch (type) {
        case 'fadeIn':
          await this.fadeIn(element, options);
          break;
        case 'fadeOut':
          await this.fadeOut(element, options);
          break;
        case 'slideIn':
          await this.slideIn(element, properties.direction, options);
          break;
        case 'slideOut':
          await this.slideOut(element, properties.direction, options);
          break;
        case 'custom':
          await this.animateCSS(element, properties, options);
          break;
        case 'web':
          await this.animateWebAPI(element, properties.keyframes, properties.options);
          break;
        default:
          console.warn(`Unknown animation type: ${type}`);
      }
    }
  }

  /**
   * Adds CSS for commonly used animations
   */
  addCSSAnimations() {
    if (document.getElementById('animation-utils-styles')) return;

    const style = document.createElement('style');
    style.id = 'animation-utils-styles';
    style.textContent = `
      /* Predefined animation classes */
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      
      .animate-fade-out {
        animation: fadeOut 0.3s ease-in;
      }
      
      .animate-slide-in-left {
        animation: slideInLeft 0.3s ease-out;
      }
      
      .animate-slide-in-right {
        animation: slideInRight 0.3s ease-out;
      }
      
      .animate-slide-in-up {
        animation: slideInUp 0.3s ease-out;
      }
      
      .animate-slide-in-down {
        animation: slideInDown 0.3s ease-out;
      }
      
      .animate-bounce {
        animation: bounce 0.5s ease infinite;
      }
      
      .animate-pulse {
        animation: pulse 1s ease-in-out infinite;
      }
      
      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }
      
      .animate-scale {
        animation: scale 0.3s ease-in-out;
      }
      
      .animate-rotate {
        animation: rotate 1s linear infinite;
      }
      
      .animate-swing {
        animation: swing 1s ease-in-out;
      }
      
      .animate-flip {
        animation: flip 0.8s ease-in-out;
      }
      
      .animate-appear {
        opacity: 0;
        animation: appear 0.3s ease-out forwards;
      }
      
      .animate-appear-delayed {
        opacity: 0;
        animation: appear 0.3s ease-out 0.3s forwards;
      }
      
      /* Keyframe definitions */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideInUp {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideInDown {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0, 0, 0);
        }
        40%, 43% {
          transform: translate3d(0, -30px, 0);
        }
        70% {
          transform: translate3d(0, -15px, 0);
        }
        90% {
          transform: translate3d(0, -4px, 0);
        }
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
      
      @keyframes shake {
        0%, 100% {
          transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
          transform: translateX(-10px);
        }
        20%, 40%, 60%, 80% {
          transform: translateX(10px);
        }
      }
      
      @keyframes scale {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        70% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      @keyframes swing {
        20% {
          transform: rotate(15deg);
        }
        40% {
          transform: rotate(-10deg);
        }
        60% {
          transform: rotate(5deg);
        }
        80% {
          transform: rotate(-5deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }
      
      @keyframes flip {
        0% {
          transform: perspective(400px) rotateY(0);
        }
        100% {
          transform: perspective(400px) rotateY(180deg);
        }
      }
      
      @keyframes appear {
        to {
          opacity: 1;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the animation utilities instance and cleans up
   */
  destroy() {
    // Stop and cancel all running animations
    for (const animId of this.runningAnimations) {
      const anim = this.animationRegistry.get(animId);
      if (anim && typeof anim.cancel === 'function') {
        anim.cancel();
      }
    }

    // Clear all queues and registries
    this.animationRegistry.clear();
    this.runningAnimations.clear();
    this.animationQueue = [];
    this.animationFrames.clear();
  }
}

/**
 * Creates and returns a new AnimationUtils instance
 * @param {Object} options - Configuration options
 * @returns {AnimationUtils} New animation utilities instance
 */
function createAnimationUtils(options = {}) {
  return new AnimationUtils(options);
}

// Create a default instance for global use
const animationUtils = new AnimationUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AnimationUtils,
    createAnimationUtils,
    animationUtils
  };
}

// Also make it available globally
if (typeof window !== 'undefined') {
  window.AnimationUtils = AnimationUtils;
  window.createAnimationUtils = createAnimationUtils;
  window.animationUtils = animationUtils;
}