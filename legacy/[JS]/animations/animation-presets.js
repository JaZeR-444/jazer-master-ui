// Preset animations for common use cases

// Fade animations
function fadeInUp(element, duration = 600) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(30px)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
}

function fadeOutUp(element, duration = 600) {
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '0';
  element.style.transform = 'translateY(-30px)';
}

function fadeInDown(element, duration = 600) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(-30px)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
}

function fadeOutDown(element, duration = 600) {
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '0';
  element.style.transform = 'translateY(30px)';
}

// Slide animations
function slideInLeft(element, duration = 500) {
  element.style.opacity = '0';
  element.style.transform = 'translateX(-100%)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '1';
  element.style.transform = 'translateX(0)';
}

function slideOutRight(element, duration = 500) {
  element.style.opacity = '1';
  element.style.transform = 'translateX(0)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '0';
  element.style.transform = 'translateX(100%)';
}

// Zoom animations
function zoomIn(element, duration = 500) {
  element.style.opacity = '0';
  element.style.transform = 'scale(0.3)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '1';
  element.style.transform = 'scale(1)';
}

function zoomOut(element, duration = 500) {
  element.style.opacity = '1';
  element.style.transform = 'scale(1)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  element.style.opacity = '0';
  element.style.transform = 'scale(0.3)';
}

// Special animations
function hinge(element, duration = 1000) {
  element.style.animation = `hinge ${duration}ms ease`;
  
  // Add CSS for the animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes hinge {
      0% {
        transform-origin: top left;
        animation-timing-function: ease-in-out;
      }
      20%, 60% {
        transform: rotate(80deg);
        transform-origin: top left;
        animation-timing-function: ease-in-out;
      }
      40%, 80% {
        transform: rotate(60deg);
        transform-origin: top left;
        animation-timing-function: ease-in-out;
      }
      100% {
        transform: translate3d(0, 700px, 0);
        opacity: 0;
      }
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

function jackInTheBox(element, duration = 1000) {
  element.style.opacity = '0';
  element.style.transform = 'scale(0.1) rotate(30deg)';
  element.style.transformOrigin = 'center bottom';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  element.offsetHeight; // Trigger reflow
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'scale(1) rotate(0)';
  }, 100);
}

// Predefined animation sequences
function attentionSeeker(element, animationType, duration = 1000) {
  switch(animationType) {
    case 'bounce':
      element.style.animation = `bounce ${duration}ms ease`;
      break;
    case 'flash':
      element.style.animation = `flash ${duration}ms ease`;
      break;
    case 'pulse':
      element.style.animation = `pulse ${duration}ms ease`;
      break;
    case 'rubberBand':
      element.style.animation = `rubberBand ${duration}ms ease`;
      break;
    case 'shake':
      element.style.animation = `shake ${duration}ms ease`;
      break;
    case 'swing':
      element.style.animation = `swing ${duration}ms ease`;
      break;
    case 'tada':
      element.style.animation = `tada ${duration}ms ease`;
      break;
    case 'wobble':
      element.style.animation = `wobble ${duration}ms ease`;
      break;
    default:
      element.style.animation = `pulse ${duration}ms ease`;
  }
  
  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {transform: translate3d(0,0,0);}
      40%, 43% {transform: translate3d(0, -30px, 0);}
      70% {transform: translate3d(0, -15px, 0);}
      90% {transform: translate3d(0, -4px, 0);}
    }
    @keyframes flash {
      0%, 50%, 100% {opacity: 1;}
      25%, 75% {opacity: 0;}
    }
    @keyframes pulse {
      0% {transform: scale3d(1, 1, 1);}
      50% {transform: scale3d(1.05, 1.05, 1.05);}
      100% {transform: scale3d(1, 1, 1);}
    }
    @keyframes rubberBand {
      0% {transform: scale3d(1, 1, 1);}
      30% {transform: scale3d(1.25, 0.75, 1);}
      40% {transform: scale3d(0.75, 1.25, 1);}
      50% {transform: scale3d(1.15, 0.85, 1);}
      65% {transform: scale3d(.95, 1.05, 1);}
      75% {transform: scale3d(1.05, .95, 1);}
      100% {transform: scale3d(1, 1, 1);}
    }
    @keyframes shake {
      0%, 100% {transform: translate3d(0, 0, 0);}
      10%, 30%, 50%, 70%, 90% {transform: translate3d(-10px, 0, 0);}
      20%, 40%, 60%, 80% {transform: translate3d(10px, 0, 0);}
    }
    @keyframes swing {
      20% {transform: rotate3d(0, 0, 1, 15deg);}
      40% {transform: rotate3d(0, 0, 1, -10deg);}
      60% {transform: rotate3d(0, 0, 1, 5deg);}
      80% {transform: rotate3d(0, 0, 1, -5deg);}
      100% {transform: rotate3d(0, 0, 1, 0deg);}
    }
    @keyframes tada {
      0% {transform: scale3d(1, 1, 1);}
      10%, 20% {transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);}
      30%, 50%, 70%, 90% {transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);}
      40%, 60%, 80% {transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);}
      100% {transform: scale3d(1, 1, 1);}
    }
    @keyframes wobble {
      0% {transform: none;}
      15% {transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);}
      30% {transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);}
      45% {transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);}
      60% {transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);}
      75% {transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);}
      100% {transform: none;}
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

export { 
  fadeInUp, fadeOutUp, fadeInDown, fadeOutDown,
  slideInLeft, slideOutRight,
  zoomIn, zoomOut,
  hinge, jackInTheBox,
  attentionSeeker
};