// Copy to clipboard hook for JavaScript

function useCopyToClipboard(options = {}) {
  const {
    onSuccess = null,
    onError = null,
    timeout = 2000
  } = options;

  // State variables
  let isCopied = false;
  let copyTimeout = null;

  // Function to copy text to clipboard
  async function copy(text) {
    try {
      // Clear any existing timeout
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }

      // Use the modern Clipboard API if available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyTextToClipboard(text);
      }

      // Update state
      isCopied = true;

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(text);
      }

      // Reset state after timeout
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, timeout);

      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }

      return false;
    }
  }

  // Fallback function for older browsers
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      throw new Error('Fallback copy method failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // Function to get current copy state
  function getCopiedState() {
    return isCopied;
  }

  // Return the API
  return {
    copy,
    isCopied: getCopiedState
  };
}

// Copy to clipboard with additional functionality
function useAdvancedCopyToClipboard(options = {}) {
  const {
    onSuccess = null,
    onError = null,
    timeout = 2000,
    formatText = null  // Function to format text before copying
  } = options;

  // State variables
  let isCopied = false;
  let copyTimeout = null;
  let lastCopiedText = null;

  // Function to copy text to clipboard
  async function copy(text) {
    try {
      // Clear any existing timeout
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }

      // Format text if formatter is provided
      let textToCopy = text;
      if (formatText && typeof formatText === 'function') {
        textToCopy = formatText(text);
      }

      // Use the modern Clipboard API if available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyTextToClipboard(textToCopy);
      }

      // Update state
      isCopied = true;
      lastCopiedText = textToCopy;

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(textToCopy, text);  // Pass both formatted and original text
      }

      // Reset state after timeout
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, timeout);

      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      
      // Call error callback if provided
      if (onError) {
        onError(err, text);
      }

      return false;
    }
  }

  // Fallback function for older browsers
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      throw new Error('Fallback copy method failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // Function to copy HTML content to clipboard as HTML
  async function copyHTML(htmlContent) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([htmlContent], { type: 'text/plain' })
          })
        ]);
        
        isCopied = true;
        lastCopiedText = htmlContent;

        if (onSuccess) {
          onSuccess(htmlContent, 'html');
        }

        // Reset state after timeout
        copyTimeout = setTimeout(() => {
          isCopied = false;
        }, timeout);

        return true;
      } else {
        // Fallback to copying just the text content
        const textContent = new DOMParser().parseFromString(htmlContent, 'text/html').body.textContent || '';
        return copy(textContent);
      }
    } catch (err) {
      console.error('Failed to copy HTML: ', err);
      
      if (onError) {
        onError(err, htmlContent);
      }

      return false;
    }
  }

  // Function to copy an image to clipboard
  async function copyImage(imageUrl) {
    try {
      if (navigator.clipboard && window.isSecureContext && !window.isSecureContext) {
        // In this case, we'll just copy the image URL for older browsers
        return copy(imageUrl);
      }

      const data = await fetch(imageUrl);
      const blob = await data.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      isCopied = true;
      
      if (onSuccess) {
        onSuccess(imageUrl, 'image');
      }

      // Reset state after timeout
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, timeout);

      return true;
    } catch (err) {
      console.error('Failed to copy image: ', err);
      
      if (onError) {
        onError(err, imageUrl);
      }

      return false;
    }
  }

  // Function to get current copy state
  function getCopiedState() {
    return isCopied;
  }

  // Function to get the last copied text
  function getLastCopiedText() {
    return lastCopiedText;
  }

  // Return the API
  return {
    copy,
    copyHTML,
    copyImage,
    isCopied: getCopiedState,
    lastCopied: getLastCopiedText
  };
}

// Hook to copy text when an element is clicked
function useCopyOnClick(element, textToCopy, options = {}) {
  const {
    successClass = 'copied',
    errorClass = 'copy-error',
    successText = 'Copied!',
    originalText = null
  } = options;

  const copyHook = useAdvancedCopyToClipboard({
    onSuccess: () => {
      if (element) {
        // Store original text if not provided
        if (originalText === null && element.textContent) {
          options.originalText = element.textContent;
        }
        
        // Update text or add class
        if (successText) {
          element.textContent = successText;
        }
        element.classList.add(successClass);
        
        // Reset after timeout
        setTimeout(() => {
          if (originalText) {
            element.textContent = originalText;
          }
          element.classList.remove(successClass);
        }, 2000);
      }
    },
    onError: () => {
      if (element) {
        element.classList.add(errorClass);
        
        // Remove error class after timeout
        setTimeout(() => {
          element.classList.remove(errorClass);
        }, 2000);
      }
    }
  });

  // Get the element if it's a selector
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;

  // Add click event to copy text
  if (targetElement) {
    const handleClick = () => {
      copyHook.copy(typeof textToCopy === 'function' ? textToCopy() : textToCopy);
    };
    
    targetElement.addEventListener('click', handleClick);
    
    // Return cleanup function
    return () => {
      targetElement.removeEventListener('click', handleClick);
    };
  }

  return copyHook;
}

// Hook to copy text from another element
function useCopyFromElement(sourceElement, options = {}) {
  const {
    onClickElement = null,
    successClass = 'copied',
    errorClass = 'copy-error'
  } = options;

  const copyHook = useCopyToClipboard({
    onSuccess: () => {
      if (onClickElement) {
        const targetElement = typeof onClickElement === 'string' ? 
          document.querySelector(onClickElement) : onClickElement;
        if (targetElement) {
          targetElement.classList.add(successClass);
          
          // Remove class after timeout
          setTimeout(() => {
            targetElement.classList.remove(successClass);
          }, 2000);
        }
      }
    },
    onError: () => {
      if (onClickElement) {
        const targetElement = typeof onClickElement === 'string' ? 
          document.querySelector(onClickElement) : onClickElement;
        if (targetElement) {
          targetElement.classList.add(errorClass);
          
          // Remove class after timeout
          setTimeout(() => {
            targetElement.classList.remove(errorClass);
          }, 2000);
        }
      }
    }
  });

  // Get the source element if it's a selector
  const source = typeof sourceElement === 'string' ? document.querySelector(sourceElement) : sourceElement;

  // Function to copy text from the source element
  function copyFromSource() {
    if (source) {
      let textToCopy = '';
      
      // Handle different types of elements
      if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
        textToCopy = source.value;
      } else if (source instanceof HTMLElement) {
        textToCopy = source.textContent || source.innerText || '';
      } else {
        // If it's not an HTMLElement, try to convert to string
        textToCopy = String(source);
      }
      
      return copyHook.copy(textToCopy);
    }
    return copyHook.copy('');
  }

  // Add click event to the target element if specified
  if (onClickElement) {
    const targetElement = typeof onClickElement === 'string' ? 
      document.querySelector(onClickElement) : onClickElement;
      
    if (targetElement) {
      const handleClick = copyFromSource;
      targetElement.addEventListener('click', handleClick);
      
      // Return cleanup function
      return {
        copy: copyFromSource,
        isCopied: copyHook.isCopied,
        removeListener: () => {
          targetElement.removeEventListener('click', handleClick);
        }
      };
    }
  }

  return {
    copy: copyFromSource,
    isCopied: copyHook.isCopied
  };
}

// Export the hooks
export { 
  useCopyToClipboard, 
  useAdvancedCopyToClipboard, 
  useCopyOnClick, 
  useCopyFromElement 
};