// Rotate animation utility functions

function rotate(element, angle, duration = 300) {
  element.style.transform = `rotate(${angle}deg)`;
  element.style.transition = `transform ${duration}ms ease-in-out`;
}

function rotateIn(element, duration = 500) {
  element.style.transform = 'rotate(-90deg)';
  element.style.opacity = '0';
  element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  
  element.offsetHeight; // Trigger reflow
  element.style.transform = 'rotate(0deg)';
  element.style.opacity = '1';
}

function rotateOut(element, duration = 500) {
  element.style.transform = 'rotate(0deg)';
  element.style.opacity = '1';
  element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  
  element.offsetHeight; // Trigger reflow
  element.style.transform = 'rotate(90deg)';
  element.style.opacity = '0';
}

function rotateInfinite(element, speed = 2000) {
  element.style.animation = `rotate-infinite ${speed}ms linear infinite`;
  
  // Add CSS for the animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rotate-infinite {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Store reference to remove later if needed
  element.dataset.rotateStyle = style.textContent;
  
  return () => {
    // Cleanup function
    if (style.parentNode) {
      document.head.removeChild(style);
    }
    element.style.animation = '';
  };
}

function flip(element, duration = 600) {
  element.style.transform = 'rotateY(0deg)';
  element.style.transition = `transform ${duration}ms ease`;
  
  element.offsetHeight; // Trigger reflow
  element.style.transform = 'rotateY(180deg)';
}

export { rotate, rotateIn, rotateOut, rotateInfinite, flip };