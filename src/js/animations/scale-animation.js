// Scale animation utility functions

function scaleIn(element, duration = 300, scaleStart = 0) {
  element.style.transform = `scale(${scaleStart})`;
  element.style.transition = `transform ${duration}ms ease-in-out`;
  element.offsetHeight; // Trigger reflow
  element.style.transform = 'scale(1)';
}

function scaleOut(element, duration = 300, scaleEnd = 0) {
  element.style.transform = 'scale(1)';
  element.style.transition = `transform ${duration}ms ease-in-out`;
  element.offsetHeight; // Trigger reflow
  element.style.transform = `scale(${scaleEnd})`;
}

function scaleToggle(element, duration = 300, scaleValue = 0.8) {
  const currentScale = window.getComputedStyle(element).transform;
  const isScaled = currentScale !== 'none' && currentScale.includes('matrix') && 
                  parseFloat(currentScale.split(',')[0].split('(')[1]) < 1;
  
  if (isScaled) {
    scaleIn(element, duration, scaleValue);
  } else {
    scaleOut(element, duration, scaleValue);
  }
}

function scaleBounce(element, duration = 600) {
  element.style.transform = 'scale(1)';
  element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
  element.offsetHeight; // Trigger reflow
  
  // Animate to scale 1.2 then back to 1
  element.style.transform = 'scale(1.2)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, duration / 2);
}

function scalePulse(element, duration = 1000) {
  element.style.transform = 'scale(1)';
  element.style.transition = `transform ${duration}ms ease-in-out`;
  
  // Create pulse effect
  element.style.transform = 'scale(1.1)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, duration / 2);
}

export { scaleIn, scaleOut, scaleToggle, scaleBounce, scalePulse };