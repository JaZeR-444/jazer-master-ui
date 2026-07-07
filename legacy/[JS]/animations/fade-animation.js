// Fade animation utility functions

function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  element.style.opacity = '1';
}

function fadeOut(element, duration = 300) {
  element.style.opacity = '1';
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  element.style.opacity = '0';
}

function fadeToggle(element, duration = 300) {
  if (element.style.opacity === '0' || element.style.display === 'none') {
    fadeIn(element, duration);
    element.style.display = 'block';
  } else {
    fadeOut(element, duration);
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }
}

export { fadeIn, fadeOut, fadeToggle };