// Idle detection hook for JavaScript

function useIdle(timeout = 60000, options = {}) {
  const {
    onActive = null,
    onIdle = null,
    events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'focus']
  } = options;

  // State variables
  let isIdle = false;
  let idleTimer = null;

  // Function to set the idle state
  function setUserIdle() {
    if (!isIdle) {
      isIdle = true;
      if (onIdle) onIdle();
    }
  }

  // Function to set the active state
  function setUserActive() {
    if (isIdle) {
      isIdle = false;
      if (onActive) onActive();
    }

    // Restart the idle timer
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(setUserIdle, timeout);
  }

  // Add event listeners for user activity
  events.forEach(event => {
    document.addEventListener(event, setUserActive, { passive: true });
  });

  // Initialize the idle timer
  idleTimer = setTimeout(setUserIdle, timeout);

  // Function to get current idle state
  function getIdleState() {
    return isIdle;
  }

  // Function to reset the idle timer
  function resetTimer() {
    setUserActive();
  }

  // Function to pause idle detection
  function pause() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  // Function to resume idle detection
  function resume() {
    if (!idleTimer) {
      idleTimer = setTimeout(setUserIdle, timeout);
    }
  }

  // Function to update the timeout
  function updateTimeout(newTimeout) {
    timeout = newTimeout;
    resetTimer();
  }

  // Return the API
  return {
    isIdle: getIdleState,
    reset: resetTimer,
    pause,
    resume,
    updateTimeout
  };
}

// Advanced idle detection with additional features
function useAdvancedIdle(timeout = 60000, options = {}) {
  const {
    onActive = null,
    onIdle = null,
    onAway = null,  // Called when user has been idle for an extended period
    awayTimeout = 300000,  // 5 minutes default for away status
    events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'focus', 'scroll'],
    element = document  // Element to listen on
  } = options;

  // State variables
  let isIdle = false;
  let isAway = false;
  let idleTimer = null;
  let awayTimer = null;
  let lastActiveTime = Date.now();

  // Function to set the idle state
  function setUserIdle() {
    if (!isIdle) {
      isIdle = true;
      if (onIdle) onIdle();
    }
  }

  // Function to set the away state
  function setUserAway() {
    if (!isAway) {
      isAway = true;
      if (onAway) onAway();
    }
  }

  // Function to set the active state
  function setUserActive() {
    const now = Date.now();
    
    // If the user was away, trigger the active callback
    if (isAway && now - lastActiveTime > timeout) {
      isAway = false;
      if (onActive) onActive();
    } else if (isIdle) {
      isIdle = false;
      if (onActive) onActive();
    }

    // Update last active time
    lastActiveTime = now;

    // Restart the idle timer
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(setUserIdle, timeout);

    // Restart the away timer
    if (awayTimer) clearTimeout(awayTimer);
    awayTimer = setTimeout(setUserAway, awayTimeout);
  }

  // Add event listeners for user activity
  events.forEach(event => {
    element.addEventListener(event, setUserActive, { passive: true });
  });

  // Initialize the timers
  idleTimer = setTimeout(setUserIdle, timeout);
  awayTimer = setTimeout(setUserAway, awayTimeout);

  // Function to get current idle state
  function getIdleState() {
    return {
      isIdle,
      isAway,
      lastActive: lastActiveTime,
      timeSinceActive: Date.now() - lastActiveTime
    };
  }

  // Function to reset the idle timers
  function resetTimer() {
    setUserActive();
  }

  // Function to pause idle detection
  function pause() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (awayTimer) {
      clearTimeout(awayTimer);
      awayTimer = null;
    }
  }

  // Function to resume idle detection
  function resume() {
    if (!idleTimer) {
      idleTimer = setTimeout(setUserIdle, timeout);
    }
    if (!awayTimer) {
      awayTimer = setTimeout(setUserAway, awayTimeout);
    }
  }

  // Function to update the timeouts
  function updateTimeout(newTimeout, newAwayTimeout = null) {
    timeout = newTimeout;
    if (newAwayTimeout !== null) {
      awayTimeout = newAwayTimeout;
    }
    resetTimer();
  }

  // Return the API
  return {
    state: getIdleState,
    reset: resetTimer,
    pause,
    resume,
    updateTimeout
  };
}

// Idle detection with screen visibility consideration
function useVisibilityAwareIdle(timeout = 60000, options = {}) {
  const {
    onActive = null,
    onIdle = null,
    events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'focus'],
    considerVisibility = true  // Whether to factor in page visibility
  } = options;

  // State variables
  let isIdle = false;
  let idleTimer = null;
  let wasPageVisible = !document.hidden;

  // Function to set the idle state
  function setUserIdle() {
    // Only set as idle if the page is currently visible
    if (considerVisibility && document.hidden) {
      return;
    }
    
    if (!isIdle) {
      isIdle = true;
      if (onIdle) onIdle();
    }
  }

  // Function to set the active state
  function setUserActive() {
    // Only become active if the user has returned to a visible page or if visibility isn't being considered
    if (considerVisibility && document.hidden) {
      wasPageVisible = false;
      return;
    }

    if (isIdle) {
      isIdle = false;
      if (onActive) onActive();
    }

    wasPageVisible = true;

    // Restart the idle timer
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(setUserIdle, timeout);
  }

  // Add event listeners for user activity
  events.forEach(event => {
    document.addEventListener(event, setUserActive, { passive: true });
  });

  // Add visibility change listener if considering visibility
  if (considerVisibility) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && wasPageVisible) {
        // User has returned to the page - act as if there was activity
        setUserActive();
      } else if (document.hidden) {
        wasPageVisible = true; // Mark that it was visible before hiding
      }
    });
  }

  // Initialize the idle timer
  idleTimer = setTimeout(setUserIdle, timeout);

  // Function to get current idle state
  function getIdleState() {
    return {
      isIdle,
      isVisible: !document.hidden
    };
  }

  // Function to reset the idle timer
  function resetTimer() {
    setUserActive();
  }

  // Function to pause idle detection
  function pause() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  // Function to resume idle detection
  function resume() {
    if (!idleTimer) {
      idleTimer = setTimeout(setUserIdle, timeout);
    }
  }

  // Return the API
  return {
    state: getIdleState,
    reset: resetTimer,
    pause,
    resume
  };
}

// Hook for auto-locking functionality after idle time
function useAutoLock(timeout = 300000, options = {}) { // 5 minutes default
  const {
    onLock = null,
    onUnlock = null,
    lockScreen = false,  // Whether to show a lock screen
    checkPassword = null,  // Function to verify password
    createLockScreen = null  // Function to create custom lock screen
  } = options;

  let isLocked = false;
  let lockTimer = null;

  // Function to lock the session
  function lockSession() {
    if (!isLocked) {
      isLocked = true;
      if (onLock) onLock();

      // If lock screen is enabled, show it
      if (lockScreen) {
        showLockScreen();
      }
    }
  }

  // Function to unlock the session
  function unlockSession(credential = null) {
    if (isLocked) {
      // If a password check is required and password is provided
      if (checkPassword && credential) {
        if (checkPassword(credential)) {
          isLocked = false;
          if (onUnlock) onUnlock();
          return true;
        } else {
          // Incorrect password
          return false;
        }
      } else if (!checkPassword) {
        // No password required
        isLocked = false;
        if (onUnlock) onUnlock();
        return true;
      }
    }
    return false;
  }

  // Function to show lock screen
  function showLockScreen() {
    if (createLockScreen) {
      // Use custom lock screen
      createLockScreen(unlockSession);
    } else {
      // Default lock screen implementation
      const overlay = document.createElement('div');
      overlay.id = 'auto-lock-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0, 0, 0, 0.8)';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.zIndex = '10000';
      overlay.style.color = 'white';
      overlay.style.fontSize = '24px';
      overlay.style.flexDirection = 'column';

      const message = document.createElement('div');
      message.textContent = 'Session locked due to inactivity';
      message.style.marginBottom = '2rem';
      
      const unlockForm = document.createElement('div');
      unlockForm.style.display = 'flex';
      unlockForm.style.flexDirection = 'column';
      unlockForm.style.alignItems = 'center';

      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.placeholder = 'Enter password to unlock';
      passwordInput.style.padding = '10px';
      passwordInput.style.marginBottom = '10px';
      passwordInput.style.borderRadius = '4px';
      passwordInput.style.border = 'none';
      
      const unlockButton = document.createElement('button');
      unlockButton.textContent = 'Unlock';
      unlockButton.style.padding = '10px 20px';
      unlockButton.style.border = 'none';
      unlockButton.style.borderRadius = '4px';
      unlockButton.style.backgroundColor = '#007bff';
      unlockButton.style.color = 'white';
      unlockButton.style.cursor = 'pointer';

      unlockButton.addEventListener('click', () => {
        if (unlockSession(passwordInput.value)) {
          document.body.removeChild(overlay);
        } else {
          // Incorrect password, maybe show an error
          passwordInput.style.borderColor = 'red';
        }
      });

      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          if (unlockSession(passwordInput.value)) {
            document.body.removeChild(overlay);
          } else {
            passwordInput.style.borderColor = 'red';
          }
        }
      });

      unlockForm.appendChild(passwordInput);
      unlockForm.appendChild(unlockButton);
      overlay.appendChild(message);
      overlay.appendChild(unlockForm);
      
      document.body.appendChild(overlay);
      passwordInput.focus();
    }
  }

  // Set up the idle timer to lock the session
  const idleHook = useAdvancedIdle(timeout, {
    onIdle: lockSession
  });

  // Function to get lock state
  function getLockState() {
    return isLocked;
  }

  // Function to force lock
  function forceLock() {
    lockSession();
  }

  // Function to force unlock
  function forceUnlock(credential = null) {
    return unlockSession(credential);
  }

  // Return the API
  return {
    isLocked: getLockState,
    forceLock,
    forceUnlock,
    ...idleHook
  };
}

// Export the hooks
export { 
  useIdle, 
  useAdvancedIdle, 
  useVisibilityAwareIdle, 
  useAutoLock 
};