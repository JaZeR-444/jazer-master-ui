// Additional utility hooks for JavaScript

// A hook for managing keyboard events
function useKey(key, callback) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === key) {
        callback(e);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback]);
}

// A hook for managing focus
function useFocus() {
  const [isFocused, setFocused] = useState(false);
  
  const bind = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false)
  };
  
  return [isFocused, bind];
}

// A hook for managing intervals
function useInterval(callback, delay) {
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [delay]);
}

// A hook for managing timeouts
function useTimeout(callback, delay) {
  useEffect(() => {
    if (delay === null) return;
    
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  }, [delay]);
}

// A hook for managing visibility of elements
function useVisibility(selector) {
  const [isVisible, setVisible] = useState(false);
  
  useEffect(() => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    
    observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [selector]);
  
  return isVisible;
}

// A hook for managing online/offline status
function useOnlineStatus() {
  const [isOnline, setOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// A hook for managing screen orientation
function useScreenOrientation() {
  const [orientation, setOrientation] = useState(
    window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
  );
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
      );
    };
    
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
  
  return orientation;
}

export { 
  useKey, 
  useFocus, 
  useInterval, 
  useTimeout, 
  useVisibility, 
  useOnlineStatus, 
  useScreenOrientation 
};