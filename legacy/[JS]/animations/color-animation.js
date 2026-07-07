// Color animation utility functions

function colorTransition(element, startColor, endColor, duration = 1000) {
  element.style.transition = `background-color ${duration}ms ease`;
  element.style.backgroundColor = startColor;
  
  element.offsetHeight; // Trigger reflow
  element.style.backgroundColor = endColor;
}

function colorPulse(element, color, duration = 1000) {
  const originalColor = window.getComputedStyle(element).backgroundColor;
  element.style.transition = `background-color ${duration}ms ease`;
  element.style.backgroundColor = color;
  
  setTimeout(() => {
    element.style.backgroundColor = originalColor;
  }, duration / 2);
}

function gradientAnimation(element, colors, duration = 2000) {
  let currentIndex = 0;
  const originalStyle = element.style.background;
  
  function animate() {
    element.style.background = `linear-gradient(45deg, ${colors[currentIndex]}, ${colors[(currentIndex + 1) % colors.length]})`;
    currentIndex = (currentIndex + 1) % colors.length;
    setTimeout(animate, duration);
  }
  
  animate();
  
  // Return cleanup function
  return () => {
    element.style.background = originalStyle;
  };
}

function colorize(element, color, duration = 500) {
  element.style.transition = `color ${duration}ms ease`;
  element.style.color = color;
}

function rainbowAnimation(element, duration = 3000) {
  const originalColor = window.getComputedStyle(element).color;
  let hue = 0;
  
  const interval = setInterval(() => {
    element.style.color = `hsl(${hue}, 100%, 50%)`;
    hue = (hue + 1) % 360;
  }, duration / 360);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    element.style.color = originalColor;
  };
}

export { colorTransition, colorPulse, gradientAnimation, colorize, rainbowAnimation };