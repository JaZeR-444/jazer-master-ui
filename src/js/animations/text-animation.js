// Text animation utility functions

function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

function textFadeIn(element, duration = 1000) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '1';
}

function textFadeOut(element, duration = 1000) {
  element.style.opacity = '1';
  element.style.transition = `opacity ${duration}ms ease-out`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '0';
}

function textBounce(element, text, duration = 1000) {
  element.innerHTML = text;
  element.style.transform = 'translateY(0)';
  element.style.transition = `transform ${duration}ms ease`;
  
  element.offsetHeight; // Trigger reflow
  element.style.transform = 'translateY(-10px)';
  
  setTimeout(() => {
    element.style.transform = 'translateY(0)';
  }, duration / 2);
}

function textShake(element, duration = 500) {
  element.style.animation = `text-shake ${duration}ms ease-in-out`;
  
  // Add CSS for the animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes text-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
  
  // Remove style after animation completes
  setTimeout(() => {
    if (style.parentNode) {
      document.head.removeChild(style);
    }
    element.style.animation = '';
  }, duration);
}

// Export functions
export { typeWriter, textFadeIn, textFadeOut, textBounce, textShake };