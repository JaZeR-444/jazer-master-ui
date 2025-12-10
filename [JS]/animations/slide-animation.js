// Slide animation utility functions

function slideDown(element, duration = 300) {
  element.style.height = '0';
  element.style.overflow = 'hidden';
  element.style.transition = `height ${duration}ms ease-in-out`;
  element.offsetHeight; // Trigger reflow
  element.style.height = `${element.scrollHeight}px`;
}

function slideUp(element, duration = 300) {
  element.style.height = `${element.scrollHeight}px`;
  element.style.overflow = 'hidden';
  element.style.transition = `height ${duration}ms ease-in-out`;
  element.offsetHeight; // Trigger reflow
  element.style.height = '0';
}

function slideToggle(element, duration = 300) {
  if (element.style.height === '0px' || element.style.display === 'none') {
    element.style.display = 'block';
    slideDown(element, duration);
  } else {
    slideUp(element, duration);
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }
}

export { slideDown, slideUp, slideToggle };