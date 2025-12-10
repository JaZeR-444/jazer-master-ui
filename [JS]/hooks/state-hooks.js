// Additional custom React-like hooks for JavaScript

// A custom hook for managing local state in vanilla JS
function useState(initialValue) {
  let value = initialValue;
  const subscribers = [];

  function setValue(newValue) {
    if (typeof newValue === 'function') {
      value = newValue(value);
    } else {
      value = newValue;
    }
    
    // Notify all subscribers
    subscribers.forEach(callback => callback(value));
  }

  function subscribe(callback) {
    subscribers.push(callback);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  return [() => value, setValue, subscribe];
}

// A hook for handling side effects
function useEffect(callback, dependencies) {
  let oldDependencies = undefined;
  
  const checkDependencies = () => {
    if (!dependencies) return true; // Run effect if no dependencies
    
    if (!oldDependencies) {
      oldDependencies = [...dependencies];
      return true; // Run effect if first run
    }
    
    // Compare dependencies
    for (let i = 0; i < dependencies.length; i++) {
      if (oldDependencies[i] !== dependencies[i]) {
        oldDependencies = [...dependencies];
        return true; // Run effect if dependencies changed
      }
    }
    
    return false; // Don't run effect if dependencies didn't change
  };
  
  if (checkDependencies()) {
    return callback();
  }
}

// A hook for accessing previous values
function usePrevious(value) {
  let ref = { current: undefined };
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// A hook for managing DOM elements
function useElement(selector) {
  const [element, setElement] = useState(null);
  
  useEffect(() => {
    const el = document.querySelector(selector);
    setElement(el);
  }, [selector]);
  
  return element;
}

// A hook for handling window resize events
function useResize(callback) {
  useEffect(() => {
    const handleResize = () => callback(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    // Call callback once on mount
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [callback]);
}

// A hook for tracking mouse position
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', updatePosition);
    
    return () => {
      document.removeEventListener('mousemove', updatePosition);
    };
  }, []);
  
  return position;
}

export { useState, useEffect, usePrevious, useElement, useResize, useMousePosition };