// Easing functions for animations

// Linear easing (constant speed)
function linear(t) {
  return t;
}

// Quadratic easing functions
function easeInQuad(t) {
  return t * t;
}

function easeOutQuad(t) {
  return t * (2 - t);
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Cubic easing functions
function easeInCubic(t) {
  return t * t * t;
}

function easeOutCubic(t) {
  return (--t) * t * t + 1;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Quartic easing functions
function easeInQuart(t) {
  return t * t * t * t;
}

function easeOutQuart(t) {
  return 1 - (--t) * t * t * t;
}

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
}

// Quintic easing functions
function easeInQuint(t) {
  return t * t * t * t * t;
}

function easeOutQuint(t) {
  return 1 + (--t) * t * t * t * t;
}

function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
}

// Sinusoidal easing functions
function easeInSine(t) {
  return 1 - Math.cos(t * Math.PI / 2);
}

function easeOutSine(t) {
  return Math.sin(t * Math.PI / 2);
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// Exponential easing functions
function easeInExpo(t) {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInOutExpo(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
  return (2 - Math.pow(2, -20 * t + 10)) / 2;
}

// Circular easing functions
function easeInCirc(t) {
  return 1 - Math.sqrt(1 - t * t);
}

function easeOutCirc(t) {
  return Math.sqrt(1 - (--t) * t);
}

function easeInOutCirc(t) {
  return t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
}

// Bounce easing functions
function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

function easeInBounce(t) {
  return 1 - easeOutBounce(1 - t);
}

function easeInOutBounce(t) {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;
}

// Elastic easing functions
function easeInElastic(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
}

function easeOutElastic(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
}

function easeInOutElastic(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) {
    return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11) * 5 * Math.PI)) / 2;
  }
  return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11) * 5 * Math.PI)) / 2 + 1;
}

// Apply easing to animation
function applyEasing(element, property, startValue, endValue, duration, easingFunction, callback) {
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easedProgress = easingFunction(progress);
    const currentValue = startValue + (endValue - startValue) * easedProgress;
    
    // Apply the value to the element property
    if (property === 'opacity') {
      element.style.opacity = currentValue;
    } else if (property === 'transform') {
      element.style.transform = `translateX(${currentValue}px)`;
    } else {
      element.style[property] = `${currentValue}px`;
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (callback) {
      callback();
    }
  }
  
  requestAnimationFrame(animate);
}

export { 
  linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart,
  easeInQuint, easeOutQuint, easeInOutQuint,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInBounce, easeOutBounce, easeInOutBounce,
  easeInElastic, easeOutElastic, easeInOutElastic,
  applyEasing
};