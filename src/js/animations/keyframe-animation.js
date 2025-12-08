// Keyframe animation utility for creating complex animations

function createKeyframeAnimation(name, keyframes) {
  let css = `@keyframes ${name} {\n`;
  
  for (const [percentage, styles] of Object.entries(keyframes)) {
    css += `  ${percentage} {\n`;
    for (const [property, value] of Object.entries(styles)) {
      css += `    ${property}: ${value};\n`;
    }
    css += `  }\n`;
  }
  
  css += `}\n`;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  
  return style;
}

function applyKeyframeAnimation(element, animationName, duration = 1000, options = {}) {
  const {
    easing = 'ease',
    delay = 0,
    iterationCount = 1,
    direction = 'normal',
    fillMode = 'forwards'
  } = options;
  
  element.style.animation = `${animationName} ${duration}ms ${easing} ${delay}ms ${iterationCount} ${direction} ${fillMode}`;
  
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, duration + delay);
  });
}

function complexAnimation(element, animationSteps) {
  return new Promise((resolve) => {
    let stepIndex = 0;
    
    function runStep() {
      if (stepIndex >= animationSteps.length) {
        resolve();
        return;
      }
      
      const step = animationSteps[stepIndex];
      const { keyframes, duration, name } = step;
      
      // Create keyframe animation
      const style = createKeyframeAnimation(name, keyframes);
      
      // Apply animation to element
      applyKeyframeAnimation(element, name, duration, step.options || {})
        .then(() => {
          // Remove style element after animation
          if (style.parentNode) {
            document.head.removeChild(style);
          }
          
          stepIndex++;
          runStep();
        });
    }
    
    runStep();
  });
}

// Predefined animations
function shakeAnimation(element, duration = 500) {
  const keyframes = {
    '0%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-10px)' },
    '50%': { transform: 'translateX(10px)' },
    '75%': { transform: 'translateX(-10px)' },
    '100%': { transform: 'translateX(0)' }
  };
  
  const style = createKeyframeAnimation('shake', keyframes);
  applyKeyframeAnimation(element, 'shake', duration);
  
  setTimeout(() => {
    if (style.parentNode) {
      document.head.removeChild(style);
    }
  }, duration);
}

function heartbeatAnimation(element, duration = 1000) {
  const keyframes = {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '25%': { transform: 'scale(1.1)', opacity: '0.8' },
    '50%': { transform: 'scale(1)', opacity: '1' },
    '75%': { transform: 'scale(1.05)', opacity: '0.9' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  };
  
  const style = createKeyframeAnimation('heartbeat', keyframes);
  applyKeyframeAnimation(element, 'heartbeat', duration, { iterationCount: 'infinite' });
  
  // Return cleanup function
  return () => {
    if (style.parentNode) {
      document.head.removeChild(style);
    }
    element.style.animation = '';
  };
}

export { 
  createKeyframeAnimation, 
  applyKeyframeAnimation, 
  complexAnimation, 
  shakeAnimation,
  heartbeatAnimation 
};