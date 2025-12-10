// Bounce animation utility functions

function bounce(element, duration = 600) {
  element.style.animation = `bounce ${duration}ms ease`;
  // Create the bounce animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      60% {
        transform: translateY(-10px);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Remove style after animation completes
  setTimeout(() => {
    document.head.removeChild(style);
    element.style.animation = '';
  }, duration);
}

function bounceIn(element, duration = 600) {
  element.style.opacity = '0';
  element.style.transform = 'scale(0.3)';
  element.style.transition = `all ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '1';
  element.style.transform = 'scale(1)';
}

function bounceOut(element, duration = 600) {
  element.style.opacity = '1';
  element.style.transform = 'scale(1)';
  element.style.transition = `all ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '0';
  element.style.transform = 'scale(0.3)';
}

export { bounce, bounceIn, bounceOut };