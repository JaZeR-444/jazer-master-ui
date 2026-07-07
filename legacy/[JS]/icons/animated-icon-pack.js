// Animated icon pack with various animated icons

// Base class for animated icons
class AnimatedIcon {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.options = {
      animationType: options.animationType || 'none',
      animationDuration: options.animationDuration || 1000,
      animationDelay: options.animationDelay || 0,
      repeat: options.repeat || false,
      ...options
    };
    
    this.isActive = false;
    this.animationFrame = null;
    this.startTime = null;
    
    if (this.element) {
      this.init();
    }
  }
  
  init() {
    // Add necessary CSS for animations
    this.addAnimationStyles();
    
    // Set initial state
    this.setInitialState();
  }
  
  addAnimationStyles() {
    if (!document.getElementById('animated-icons-styles')) {
      const style = document.createElement('style');
      style.id = 'animated-icons-styles';
      style.textContent = `
        .icon-pulse {
          animation: icon-pulse var(--duration, 1s) infinite;
        }
        
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .icon-bounce {
          animation: icon-bounce var(--duration, 1s) infinite;
        }
        
        @keyframes icon-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .icon-rotate {
          animation: icon-rotate var(--duration, 1s) linear infinite;
        }
        
        @keyframes icon-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .icon-spin {
          animation: icon-spin var(--duration, 1s) cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }
        
        @keyframes icon-spin {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          to { transform: rotate(360deg) scale(1); }
        }
        
        .icon-wiggle {
          animation: icon-wiggle var(--duration, 1s) infinite;
        }
        
        @keyframes icon-wiggle {
          0%, 70%, 100% { transform: rotate(0); }
          10%, 30%, 50% { transform: rotate(-5deg); }
          20%, 40%, 60% { transform: rotate(5deg); }
        }
        
        .icon-float {
          animation: icon-float var(--duration, 3s) ease-in-out infinite;
        }
        
        @keyframes icon-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .icon-ping {
          animation: icon-ping var(--duration, 1s) infinite;
        }
        
        @keyframes icon-ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `;
      
      document.head.appendChild(style);
    }
  }
  
  setInitialState() {
    // Set CSS variables for customization
    this.element.style.setProperty('--duration', `${this.options.animationDuration}ms`);
  }
  
  // Start the animation
  start() {
    if (this.isActive) return;
    
    this.element.classList.add(`icon-${this.options.animationType}`);
    this.isActive = true;
  }
  
  // Stop the animation
  stop() {
    if (!this.isActive) return;
    
    this.element.classList.remove(`icon-${this.options.animationType}`);
    this.isActive = false;
  }
  
  // Toggle the animation
  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  // Update animation options
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.setInitialState();
    
    if (this.isActive) {
      this.stop();
      this.start();
    }
  }
  
  // Destroy the animation
  destroy() {
    this.stop();
    this.element.style.removeProperty('--duration');
  }
}

// Specific animated icon classes
class HeartIcon extends AnimatedIcon {
  constructor(element, options = {}) {
    super(element, { animationType: 'pulse', ...options });
  }
}

class SpinnerIcon extends AnimatedIcon {
  constructor(element, options = {}) {
    super(element, { animationType: 'spin', ...options });
  }
}

class LoadingIcon extends AnimatedIcon {
  constructor(element, options = {}) {
    super(element, { animationType: 'rotate', ...options });
  }
}

class NotificationIcon extends AnimatedIcon {
  constructor(element, options = {}) {
    super(element, { animationType: 'bounce', ...options });
  }
}

class SuccessIcon extends AnimatedIcon {
  constructor(element, options = {}) {
    super(element, { animationType: 'pulse', ...options });
  }
  
  // Special method to play success animation
  playSuccessAnimation() {
    this.element.style.animation = 'none';
    setTimeout(() => {
      this.element.style.animation = '';
      this.element.style.animation = 'icon-pulse 0.5s ease 0s 3';
    }, 10);
  }
}

// Animation pack manager
class AnimatedIconPack {
  constructor() {
    this.icons = new Map();
    this.globalAnimations = [];
  }
  
  // Register an animated icon
  register(name, element, options = {}) {
    const icon = new AnimatedIcon(element, options);
    this.icons.set(name, icon);
    return icon;
  }
  
  // Get a registered icon
  get(name) {
    return this.icons.get(name);
  }
  
  // Start animation for a specific icon
  start(name) {
    const icon = this.icons.get(name);
    if (icon) {
      icon.start();
    }
  }
  
  // Stop animation for a specific icon
  stop(name) {
    const icon = this.icons.get(name);
    if (icon) {
      icon.stop();
    }
  }
  
  // Toggle animation for a specific icon
  toggle(name) {
    const icon = this.icons.get(name);
    if (icon) {
      icon.toggle();
    }
  }
  
  // Start all registered animations
  startAll() {
    for (const icon of this.icons.values()) {
      icon.start();
    }
  }
  
  // Stop all registered animations
  stopAll() {
    for (const icon of this.icons.values()) {
      icon.stop();
    }
  }
  
  // Create a preset animated icon
  createPreset(type, element, options = {}) {
    switch (type) {
      case 'heart':
        return new HeartIcon(element, options);
      case 'spinner':
        return new SpinnerIcon(element, options);
      case 'loading':
        return new LoadingIcon(element, options);
      case 'notification':
        return new NotificationIcon(element, options);
      case 'success':
        return new SuccessIcon(element, options);
      default:
        return new AnimatedIcon(element, { animationType: type, ...options });
    }
  }
  
  // Batch register multiple icons
  batchRegister(iconsConfig) {
    const results = {};
    iconsConfig.forEach(config => {
      results[config.name] = this.register(config.name, config.element, config.options);
    });
    return results;
  }
  
  // Destroy the pack and clean up
  destroy() {
    for (const icon of this.icons.values()) {
      icon.destroy();
    }
    this.icons.clear();
  }
  
  // Create an animated icon from SVG string
  createFromSVG(svgString, container, options = {}) {
    // Create an SVG element from the string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgString;
    const svgElement = tempDiv.firstElementChild;
    
    if (svgElement) {
      container.appendChild(svgElement);
      return this.createPreset(options.type || 'pulse', svgElement, options);
    }
    
    return null;
  }
}

// Predefined animated icon components
function createAnimatedIconComponent(type, container, options = {}) {
  const iconTypes = {
    'heart-beat': `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>`,
    
    'spinner': `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>`,
    
    'notification': `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>`,
    
    'success': `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12" />
      </svg>`,
    
    'loading-bars': `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>`
  };
  
  if (iconTypes[type]) {
    container.innerHTML = iconTypes[type];
    const svgElement = container.querySelector('svg');
    return new AnimatedIcon(svgElement, { animationType: options.animationType || 'pulse', ...options });
  }
  
  return null;
}

// Export the classes and functions
export { 
  AnimatedIcon, 
  HeartIcon, 
  SpinnerIcon, 
  LoadingIcon, 
  NotificationIcon, 
  SuccessIcon, 
  AnimatedIconPack, 
  createAnimatedIconComponent 
};