// Hover hook for JavaScript

function useHover(element, options = {}) {
  const {
    delay = 0,
    leaveDelay = 0,
    onHoverStart = null,
    onHoverEnd = null,
    includeTouch = false
  } = options;

  // State variables
  let isHovering = false;
  let hoverStartTimer = null;
  let hoverEndTimer = null;

  // Get the element if it's a selector
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;

  // Hover start handler
  function handleHoverStart(event) {
    // On touch devices, we might want to disable hover behavior
    if (event.type === 'touchstart' && !includeTouch) {
      // Remove the touch event listener to prevent triggering on touch
      targetElement.removeEventListener('touchstart', handleHoverStart);
      return;
    }

    if (hoverEndTimer) {
      clearTimeout(hoverEndTimer);
      hoverEndTimer = null;
    }

    if (!isHovering) {
      if (delay > 0) {
        hoverStartTimer = setTimeout(() => {
          isHovering = true;
          if (onHoverStart) onHoverStart(event);
        }, delay);
      } else {
        isHovering = true;
        if (onHoverStart) onHoverStart(event);
      }
    }
  }

  // Hover end handler
  function handleHoverEnd(event) {
    if (hoverStartTimer) {
      clearTimeout(hoverStartTimer);
      hoverStartTimer = null;
    }

    if (isHovering) {
      if (leaveDelay > 0) {
        hoverEndTimer = setTimeout(() => {
          isHovering = false;
          if (onHoverEnd) onHoverEnd(event);
        }, leaveDelay);
      } else {
        isHovering = false;
        if (onHoverEnd) onHoverEnd(event);
      }
    }
  }

  // Add event listeners
  targetElement.addEventListener('mouseenter', handleHoverStart);
  targetElement.addEventListener('mouseleave', handleHoverEnd);

  // Add touch events if needed
  if (includeTouch) {
    targetElement.addEventListener('touchstart', handleHoverStart);
    // For touch, we consider it "hover ended" when touch ends or moves away
    targetElement.addEventListener('touchend', handleHoverEnd);
    targetElement.addEventListener('touchcancel', handleHoverEnd);
  }

  // Function to get current hover state
  function getHoverState() {
    return isHovering;
  }

  // Function to force start hover state
  function forceHoverStart() {
    if (!isHovering) {
      isHovering = true;
      if (onHoverStart) {
        onHoverStart(new Event('forceHoverStart'));
      }
    }
  }

  // Function to force end hover state
  function forceHoverEnd() {
    if (isHovering) {
      isHovering = false;
      if (onHoverEnd) {
        onHoverEnd(new Event('forceHoverEnd'));
      }
    }
  }

  // Return the API
  return {
    isHovering: getHoverState,
    forceHoverStart,
    forceHoverEnd
  };
}

// Hover effect hook - applies CSS classes when hovering
function useHoverEffect(element, options = {}) {
  const {
    hoverClass = 'hovered',
    activeClass = 'active',
    includeTouch = false
  } = options;

  // Get the element if it's a selector
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;

  // Create the hover hook with no callbacks
  const hoverState = useHover(targetElement, {
    includeTouch,
    onHoverStart: () => targetElement.classList.add(hoverClass),
    onHoverEnd: () => targetElement.classList.remove(hoverClass)
  });

  // Add active class on mousedown/touchstart and remove on mouseup/touchend
  if (activeClass) {
    const handleActiveStart = () => targetElement.classList.add(activeClass);
    const handleActiveEnd = () => targetElement.classList.remove(activeClass);

    targetElement.addEventListener('mousedown', handleActiveStart);
    targetElement.addEventListener('mouseup', handleActiveEnd);
    targetElement.addEventListener('mouseleave', handleActiveEnd); // Also remove when mouse leaves

    if (includeTouch) {
      targetElement.addEventListener('touchstart', handleActiveStart);
      targetElement.addEventListener('touchend', handleActiveEnd);
      targetElement.addEventListener('touchcancel', handleActiveEnd);
    }
  }

  // Return the hover state and cleanup function
  return {
    isHovering: hoverState.isHovering,
    forceHoverStart: hoverState.forceHoverStart,
    forceHoverEnd: hoverState.forceHoverEnd
  };
}

// Multiple elements hover hook - useful for navigation items, etc.
function useMultipleHover(elements, options = {}) {
  const {
    exclusive = true, // Only one element can be hovered at a time
    delay = 0,
    leaveDelay = 0,
    onHoverStart = null,
    onHoverEnd = null,
    hoverClass = 'hovered'
  } = options;

  // Convert selector to elements if needed
  const elementList = typeof elements === 'string' ? 
    Array.from(document.querySelectorAll(elements)) : 
    Array.isArray(elements) ? elements : [elements];

  // Track hover state for each element
  const hoverStates = new Map();
  elementList.forEach(el => hoverStates.set(el, false));

  // Handler for when any element is hovered
  function createHoverStartHandler(element) {
    return function(event) {
      // If exclusive, remove hover state from other elements
      if (exclusive) {
        elementList.forEach(el => {
          if (el !== element && hoverStates.get(el)) {
            hoverStates.set(el, false);
            el.classList.remove(hoverClass);
            if (onHoverEnd) onHoverEnd(el, event);
          }
        });
      }

      // Set hover state for this element
      hoverStates.set(element, true);
      element.classList.add(hoverClass);
      if (onHoverStart) onHoverStart(element, event);
    };
  }

  // Handler for when any element is unhovered
  function createHoverEndHandler(element) {
    return function(event) {
      hoverStates.set(element, false);
      element.classList.remove(hoverClass);
      if (onHoverEnd) onHoverEnd(element, event);
    };
  }

  // Attach event listeners to all elements
  const cleanupFunctions = [];
  
  elementList.forEach(el => {
    const hoverStartHandler = createHoverStartHandler(el);
    const hoverEndHandler = createHoverEndHandler(el);

    el.addEventListener('mouseenter', hoverStartHandler);
    el.addEventListener('mouseleave', hoverEndHandler);

    // Store cleanup function
    cleanupFunctions.push(() => {
      el.removeEventListener('mouseenter', hoverStartHandler);
      el.removeEventListener('mouseleave', hoverEndHandler);
    });
  });

  // Function to get hover state for a specific element
  function isElementHovered(element) {
    return hoverStates.get(typeof element === 'string' ? document.querySelector(element) : element) || false;
  }

  // Function to get all hover states
  function getAllHoverStates() {
    const states = {};
    elementList.forEach(el => {
      states[el] = hoverStates.get(el);
    });
    return states;
  }

  // Return the API
  return {
    isHovered: isElementHovered,
    getAllStates: getAllHoverStates,
    destroy: () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    }
  };
}

// Hover with tooltip functionality
function useHoverTooltip(element, tooltipText, options = {}) {
  const {
    position = 'top', // top, bottom, left, right
    delay = 500,
    tooltipClass = 'tooltip',
    includeTouch = false
  } = options;

  // Get the element if it's a selector
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = tooltipClass;
  tooltip.textContent = tooltipText;
  tooltip.style.position = 'absolute';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = '10000';
  tooltip.style.padding = '5px 10px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  tooltip.style.color = 'white';
  tooltip.style.fontSize = '14px';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.pointerEvents = 'none';

  document.body.appendChild(tooltip);

  // Position the tooltip based on the position option
  function positionTooltip() {
    const elementRect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (position) {
      case 'top':
        tooltip.style.top = `${elementRect.top + scrollTop - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${elementRect.left + scrollLeft + (elementRect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        break;
      case 'bottom':
        tooltip.style.top = `${elementRect.bottom + scrollTop + 5}px`;
        tooltip.style.left = `${elementRect.left + scrollLeft + (elementRect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        break;
      case 'left':
        tooltip.style.top = `${elementRect.top + scrollTop + (elementRect.height / 2) - (tooltip.offsetHeight / 2)}px`;
        tooltip.style.left = `${elementRect.left + scrollLeft - tooltip.offsetWidth - 5}px`;
        break;
      case 'right':
        tooltip.style.top = `${elementRect.top + scrollTop + (elementRect.height / 2) - (tooltip.offsetHeight / 2)}px`;
        tooltip.style.left = `${elementRect.right + scrollLeft + 5}px`;
        break;
      default:
        // Default to top
        tooltip.style.top = `${elementRect.top + scrollTop - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${elementRect.left + scrollLeft + (elementRect.width / 2) - (tooltip.offsetWidth / 2)}px`;
    }
  }

  // Show tooltip after delay
  let showTimer = null;
  function showTooltip() {
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => {
      positionTooltip();
      tooltip.style.display = 'block';
    }, delay);
  }

  // Hide tooltip
  function hideTooltip() {
    if (showTimer) clearTimeout(showTimer);
    tooltip.style.display = 'none';
  }

  // Create hover effect with tooltip
  return useHover(targetElement, {
    delay: 0,
    leaveDelay: 0,
    onHoverStart: showTooltip,
    onHoverEnd: hideTooltip,
    includeTouch
  });
}

// Export the hooks
export { 
  useHover, 
  useHoverEffect, 
  useMultipleHover, 
  useHoverTooltip 
};