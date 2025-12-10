/**
 * DOM Utilities Module
 * Comprehensive DOM manipulation and utility functions
 * Compatible with jazer-brand.css styling for DOM-related utilities
 */

class DomUtils {
  /**
   * Creates a new DOM utilities instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultTransitionDuration: 300,
      enableAnimation: true,
      enableMutationObserver: true,
      autoCleanup: true,
      ...options
    };

    this.observers = new Map();
    this.eventListeners = new Map();
    this.elementRegistry = new Map();
    this.animationQueue = [];
    this.animationFrame = null;
  }

  /**
   * Creates an element with specified attributes and children
   * @param {string} tagName - HTML tag name
   * @param {Object} attrs - Object with attributes to set
   * @param {Array} children - Array of child elements or text nodes
   * @returns {HTMLElement} Created element
   */
  static createElement(tagName, attrs = {}, children = []) {
    const element = document.createElement(tagName);

    // Set attributes
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className' || key === 'class') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key === 'dataset') {
        for (const [dsKey, dsValue] of Object.entries(value)) {
          element.dataset[dsKey] = dsValue;
        }
      } else if (key.startsWith('on')) {
        // Event listeners
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    }

    // Add children
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    }

    return element;
  }

  /**
   * Gets an element by selector or returns the element if already an HTMLElement
   * @param {string|HTMLElement} selector - CSS selector or element
   * @returns {HTMLElement|null} Element or null if not found
   */
  static getElement(selector) {
    if (selector instanceof HTMLElement) {
      return selector;
    }
    
    if (typeof selector !== 'string') {
      return null;
    }

    try {
      return document.querySelector(selector);
    } catch (e) {
      console.error('Invalid selector:', selector, e);
      return null;
    }
  }

  /**
   * Gets multiple elements by selector
   * @param {string} selector - CSS selector
   * @returns {Array} Array of elements
   */
  static getElements(selector) {
    if (typeof selector !== 'string') {
      return [];
    }

    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (e) {
      console.error('Invalid selector:', selector, e);
      return [];
    }
  }

  /**
   * Checks if an element matches a CSS selector
   * @param {HTMLElement} element - Element to test
   * @param {string} selector - CSS selector
   * @returns {boolean} Whether element matches selector
   */
  static matches(element, selector) {
    if (!element || !selector) return false;

    return element.matches 
      ? element.matches(selector)
      : element.msMatchesSelector 
        ? element.msMatchesSelector(selector)
        : element.webkitMatchesSelector(selector);
  }

  /**
   * Finds the closest parent element that matches a selector
   * @param {HTMLElement} element - Element to start search from
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} Closest matching parent or null
   */
  static closest(element, selector) {
    if (!element || !selector) return null;

    return element.closest ? element.closest(selector) : null;
  }

  /**
   * Finds elements by data attribute
   * @param {string} attribute - Data attribute name
   * @param {string} value - Data attribute value (optional)
   * @returns {Array} Array of matching elements
   */
  static findByData(attribute, value) {
    if (!attribute) return [];

    let selector = `[data-${attribute}]`;
    if (value !== undefined) {
      selector = `[data-${attribute}="${value}"]`;
    }

    return DomUtils.getElements(selector);
  }

  /**
   * Adds a class to an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {...string} classes - Class names to add
   * @returns {DomUtils} Instance for chaining
   */
  static addClass(element, ...classes) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    classes.forEach(cls => {
      if (cls) {
        el.classList.add(cls);
      }
    });

    return this;
  }

  /**
   * Removes a class from an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {...string} classes - Class names to remove
   * @returns {DomUtils} Instance for chaining
   */
  static removeClass(element, ...classes) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    classes.forEach(cls => {
      if (cls) {
        el.classList.remove(cls);
      }
    });

    return this;
  }

  /**
   * Toggles a class on an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} className - Class name to toggle
   * @param {boolean} force - Whether to force add or remove
   * @returns {boolean} Whether the class is now present
   */
  static toggleClass(element, className, force) {
    const el = DomUtils.getElement(element);
    if (!el) return false;

    return el.classList.toggle(className, force);
  }

  /**
   * Checks if an element has a class
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} className - Class name to check
   * @returns {boolean} Whether the element has the class
   */
  static hasClass(element, className) {
    const el = DomUtils.getElement(element);
    if (!el) return false;

    return el.classList.contains(className);
  }

  /**
   * Sets an attribute on an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} attribute - Attribute name
   * @param {string} value - Attribute value
   * @returns {DomUtils} Instance for chaining
   */
  static setAttribute(element, attribute, value) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    el.setAttribute(attribute, value);
    return this;
  }

  /**
   * Gets an attribute from an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} attribute - Attribute name
   * @returns {string|null} Attribute value or null
   */
  static getAttribute(element, attribute) {
    const el = DomUtils.getElement(element);
    if (!el) return null;

    return el.getAttribute(attribute);
  }

  /**
   * Removes an attribute from an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} attribute - Attribute name
   * @returns {DomUtils} Instance for chaining
   */
  static removeAttribute(element, attribute) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    el.removeAttribute(attribute);
    return this;
  }

  /**
   * Sets CSS styles on an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {Object} styles - Object with CSS properties
   * @returns {DomUtils} Instance for chaining
   */
  static setStyles(element, styles) {
    const el = DomUtils.getElement(element);
    if (!el || typeof styles !== 'object') return this;

    for (const [property, value] of Object.entries(styles)) {
      // Convert camelCase to kebab-case for CSS properties
      const cssProperty = property.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
      el.style.setProperty(cssProperty, value);
    }

    return this;
  }

  /**
   * Gets computed styles for an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string|Array} properties - CSS property or array of properties
   * @returns {Object|string} Computed style value or object of values
   */
  static getStyles(element, properties) {
    const el = DomUtils.getElement(element);
    if (!el) return typeof properties === 'string' ? '' : {};

    const computed = window.getComputedStyle(el);
    const result = {};

    if (typeof properties === 'string') {
      // Single property
      return computed.getPropertyValue(properties);
    } else if (Array.isArray(properties)) {
      // Multiple properties
      for (const property of properties) {
        result[property] = computed.getPropertyValue(property);
      }
      return result;
    } else {
      // All styles
      return computed;
    }
  }

  /**
   * Appends child elements to a parent
   * @param {HTMLElement|string} parent - Parent element or selector
   * @param {...(HTMLElement|string)} children - Child elements or text
   * @returns {DomUtils} Instance for chaining
   */
  static append(parent, ...children) {
    const parentEl = DomUtils.getElement(parent);
    if (!parentEl) return this;

    for (const child of children) {
      if (typeof child === 'string') {
        parentEl.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        parentEl.appendChild(child);
      }
    }

    return this;
  }

  /**
   * Prepends child elements to a parent
   * @param {HTMLElement|string} parent - Parent element or selector
   * @param {...(HTMLElement|string)} children - Child elements or text
   * @returns {DomUtils} Instance for chaining
   */
  static prepend(parent, ...children) {
    const parentEl = DomUtils.getElement(parent);
    if (!parentEl) return this;

    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (typeof child === 'string') {
        parentEl.insertBefore(document.createTextNode(child), parentEl.firstChild);
      } else if (child instanceof HTMLElement) {
        parentEl.insertBefore(child, parentEl.firstChild);
      }
    }

    return this;
  }

  /**
   * Inserts an element after another element
   * @param {HTMLElement|string} element - Element to insert
   * @param {HTMLElement|string} referenceElement - Reference element
   * @returns {DomUtils} Instance for chaining
   */
  static insertAfter(element, referenceElement) {
    const el = DomUtils.getElement(element);
    const refEl = DomUtils.getElement(referenceElement);
    
    if (!el || !refEl || !refEl.parentNode) return this;

    refEl.parentNode.insertBefore(el, refEl.nextSibling);
    return this;
  }

  /**
   * Inserts an element before another element
   * @param {HTMLElement|string} element - Element to insert
   * @param {HTMLElement|string} referenceElement - Reference element
   * @returns {DomUtils} Instance for chaining
   */
  static insertBefore(element, referenceElement) {
    const el = DomUtils.getElement(element);
    const refEl = DomUtils.getElement(referenceElement);
    
    if (!el || !refEl || !refEl.parentNode) return this;

    refEl.parentNode.insertBefore(el, refEl);
    return this;
  }

  /**
   * Removes an element from the DOM
   * @param {HTMLElement|string} element - Element or selector to remove
   * @returns {DomUtils} Instance for chaining
   */
  static remove(element) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }

    return this;
  }

  /**
   * Empties an element (removes all child nodes)
   * @param {HTMLElement|string} element - Element or selector to empty
   * @returns {DomUtils} Instance for chaining
   */
  static empty(element) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    return this;
  }

  /**
   * Shows an element
   * @param {HTMLElement|string} element - Element or selector to show
   * @returns {DomUtils} Instance for chaining
   */
  static show(element) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    el.style.display = el.__originalDisplay || 'block';
    delete el.__originalDisplay;

    return this;
  }

  /**
   * Hides an element
   * @param {HTMLElement|string} element - Element or selector to hide
   * @returns {DomUtils} Instance for chaining
   */
  static hide(element) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    if (!el.__originalDisplay) {
      el.__originalDisplay = el.style.display;
    }

    el.style.display = 'none';
    return this;
  }

  /**
   * Toggles the visibility of an element
   * @param {HTMLElement|string} element - Element or selector to toggle
   * @returns {DomUtils} Instance for chaining
   */
  static toggle(element) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    if (DomUtils.isHidden(el)) {
      DomUtils.show(el);
    } else {
      DomUtils.hide(el);
    }

    return this;
  }

  /**
   * Checks if an element is hidden
   * @param {HTMLElement|string} element - Element or selector to check
   * @returns {boolean} Whether the element is hidden
   */
  static isHidden(element) {
    const el = DomUtils.getElement(element);
    if (!el) return true;

    return el.style.display === 'none' || 
           el.style.visibility === 'hidden' || 
           el.hidden;
  }

  /**
   * Checks if an element is visible
   * @param {HTMLElement|string} element - Element or selector to check
   * @returns {boolean} Whether the element is visible
   */
  static isVisible(element) {
    return !DomUtils.isHidden(element);
  }

  /**
   * Sets text content of an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} text - Text content to set
   * @returns {DomUtils} Instance for chaining
   */
  static setText(element, text) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    el.textContent = text;
    return this;
  }

  /**
   * Gets text content of an element
   * @param {HTMLElement|string} element - Element or selector
   * @returns {string} Text content of the element
   */
  static getText(element) {
    const el = DomUtils.getElement(element);
    if (!el) return '';

    return el.textContent || '';
  }

  /**
   * Sets HTML content of an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} html - HTML content to set
   * @returns {DomUtils} Instance for chaining
   */
  static setHtml(element, html) {
    const el = DomUtils.getElement(element);
    if (!el) return this;

    el.innerHTML = html;
    return this;
  }

  /**
   * Gets HTML content of an element
   * @param {HTMLElement|string} element - Element or selector
   * @returns {string} HTML content of the element
   */
  static getHtml(element) {
    const el = DomUtils.getElement(element);
    if (!el) return '';

    return el.innerHTML || '';
  }

  /**
   * Adds an event listener to an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @param {Object} options - Options for addEventListener
   * @returns {Function} Function to remove the event listener
   */
  static addEventListener(element, event, handler, options = {}) {
    const el = DomUtils.getElement(element);
    if (!el || typeof handler !== 'function') return () => {};

    el.addEventListener(event, handler, options);

    // Store for potential cleanup
    const elementId = el.__domUtilsId || (el.__domUtilsId = Symbol('domUtils'));
    if (!this.eventListeners.has(elementId)) {
      this.eventListeners.set(elementId, []);
    }
    this.eventListeners.get(elementId).push({ event, handler, options });

    // Return function to remove the event listener
    return () => {
      el.removeEventListener(event, handler, options);
      
      // Remove from cleanup registry
      const listeners = this.eventListeners.get(elementId);
      if (listeners) {
        const index = listeners.findIndex(item => 
          item.event === event && item.handler === handler
        );
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Removes an event listener from an element
   * @param {HTMLElement|string} element - Element or selector
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @param {Object} options - Options for removeEventListener
   * @returns {DomUtils} Instance for chaining
   */
  static removeEventListener(element, event, handler, options = {}) {
    const el = DomUtils.getElement(element);
    if (!el || typeof handler !== 'function') return this;

    el.removeEventListener(event, handler, options);
    return this;
  }

  /**
   * Checks if an element is in the viewport
   * @param {HTMLElement|string} element - Element or selector
   * @returns {boolean} Whether the element is in the viewport
   */
  static isInViewport(element) {
    const el = DomUtils.getElement(element);
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Gets the position and dimensions of an element
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with position and dimensions
   */
  static getBoundingClientRect(element) {
    const el = DomUtils.getElement(element);
    if (!el) return null;

    return el.getBoundingClientRect();
  }

  /**
   * Gets the position of an element relative to the document
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with top and left position
   */
  static getPosition(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { top: 0, left: 0 };

    const rect = el.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
    };
  }

  /**
   * Gets the offset of an element (relative to its offset parent)
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with top and left offset
   */
  static getOffset(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { top: 0, left: 0 };

    let top = 0;
    let left = 0;
    let current = el;

    while (current && !isNaN(current.offsetTop) && !isNaN(current.offsetLeft)) {
      top += current.offsetTop;
      left += current.offsetLeft;
      current = current.offsetParent;
    }

    return { top, left };
  }

  /**
   * Gets the dimensions of an element
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with width and height properties
   */
  static getDimensions(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { width: 0, height: 0 };

    return {
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  }

  /**
   * Gets the outer dimensions of an element (including margins)
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with width and height properties
   */
  static getOuterDimensions(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { width: 0, height: 0 };

    const styles = window.getComputedStyle(el);
    return {
      width: el.offsetWidth + 
        parseInt(styles.marginLeft) + 
        parseInt(styles.marginRight),
      height: el.offsetHeight + 
        parseInt(styles.marginTop) + 
        parseInt(styles.marginBottom)
    };
  }

  /**
   * Gets the scroll position of an element
   * @param {HTMLElement|string} element - Element or selector (defaults to window)
   * @returns {Object} Object with x and y scroll positions
   */
  static getScrollPosition(element) {
    if (element === window || element === document) {
      return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      };
    }

    const el = DomUtils.getElement(element);
    if (!el) return { x: 0, y: 0 };

    return {
      x: el.scrollLeft,
      y: el.scrollTop
    };
  }

  /**
   * Scrolls to an element with optional smooth animation
   * @param {HTMLElement|string} element - Element or selector to scroll to
   * @param {Object} options - Scroll options
   * @returns {Promise} Promise that resolves when scrolling is complete
   */
  static scrollTo(element, options = {}) {
    const defaults = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    };

    const el = DomUtils.getElement(element);
    if (!el) return Promise.resolve();

    return new Promise((resolve) => {
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView(defaults);
        
        // Resolve after animation completes (approximately)
        if (defaults.behavior === 'smooth') {
          setTimeout(() => resolve(), 500);
        } else {
          resolve();
        }
      } else {
        // Fallback for browsers without smooth scroll support
        const pos = DomUtils.getPosition(el);
        window.scrollTo(pos.left, pos.top);
        resolve();
      }
    });
  }

  /**
   * Creates a DOM element from an HTML string
   * @param {string} htmlString - HTML string to create element from
   * @returns {HTMLElement} Created element
   */
  static createElementFromHtml(htmlString) {
    if (typeof htmlString !== 'string') return null;

    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
  }

  /**
   * Creates multiple DOM elements from an HTML string
   * @param {string} htmlString - HTML string to create elements from
   * @returns {Array} Array of created elements
   */
  static createElementsFromHtml(htmlString) {
    if (typeof htmlString !== 'string') return [];

    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    
    // Return all child nodes as array
    return Array.from(template.content.childNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);
  }

  /**
   * Checks if an element or its parents have a specific CSS property value
   * @param {HTMLElement} element - Element to check
   * @param {string} property - CSS property name
   * @param {string} value - Value to match
   * @returns {boolean} Whether the property-value pair is found
   */
  static hasInheritedStyle(element, property, value) {
    let current = element;
    
    while (current) {
      const computedStyle = window.getComputedStyle(current);
      if (computedStyle.getPropertyValue(property) === value) {
        return true;
      }
      current = current.parentElement;
    }
    
    return false;
  }

  /**
   * Gets the z-index of an element
   * @param {HTMLElement|string} element - Element or selector
   * @returns {number} Z-index value of the element
   */
  static getZIndex(element) {
    const el = DomUtils.getElement(element);
    if (!el) return 0;

    const zIndex = window.getComputedStyle(el).zIndex;
    return isNaN(parseInt(zIndex)) ? 0 : parseInt(zIndex);
  }

  /**
   * Checks if an element is a focusable element
   * @param {HTMLElement|string} element - Element or selector
   * @returns {boolean} Whether the element is focusable
   */
  static isFocusable(element) {
    const el = DomUtils.getElement(element);
    if (!el) return false;

    // Elements that are inherently focusable
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return el.matches(focusableSelectors.join(', ')) && 
           !el.disabled && 
           !el.hidden && 
           !el.hasAttribute('disabled');
  }

  /**
   * Focuses an element with additional options
   * @param {HTMLElement|string} element - Element or selector to focus
   * @param {Object} options - Focus options
   * @returns {boolean} Whether focusing was successful
   */
  static focus(element, options = {}) {
    const el = DomUtils.getElement(element);
    if (!el || !DomUtils.isFocusable(el)) return false;

    try {
      const defaultOptions = {
        preventScroll: false,
        ...options
      };

      el.focus(defaultOptions);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Finds the next focusable element in the DOM
   * @param {HTMLElement|string} element - Element or selector to start from
   * @returns {HTMLElement|null} Next focusable element or null
   */
  static findNextFocusable(element) {
    const startEl = DomUtils.getElement(element);
    if (!startEl) return null;

    // Get all focusable elements in the document
    const allFocusable = document.querySelectorAll([
      'a[href]', 'button:not([disabled])', 'input:not([disabled])', 
      'select:not([disabled])', 'textarea:not([disabled])', 
      '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]'
    ].join(', '));

    const focusableArray = Array.from(allFocusable);
    const currentIndex = focusableArray.indexOf(startEl);

    if (currentIndex === -1) {
      // If element is not in the focusable list, find closest one
      let current = startEl.nextSibling;
      while (current) {
        if (DomUtils.isFocusable(current)) {
          return current;
        }
        current = current.nextSibling;
      }
      return null;
    } else {
      // Return next element in the list
      return focusableArray[currentIndex + 1] || null;
    }
  }

  /**
   * Finds the previous focusable element in the DOM
   * @param {HTMLElement|string} element - Element or selector to start from
   * @returns {HTMLElement|null} Previous focusable element or null
   */
  static findPrevFocusable(element) {
    const startEl = DomUtils.getElement(element);
    if (!startEl) return null;

    // Get all focusable elements in the document
    const allFocusable = document.querySelectorAll([
      'a[href]', 'button:not([disabled])', 'input:not([disabled])', 
      'select:not([disabled])', 'textarea:not([disabled])', 
      '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]'
    ].join(', '));

    const focusableArray = Array.from(allFocusable);
    const currentIndex = focusableArray.indexOf(startEl);

    if (currentIndex === -1) {
      // If element is not in the focusable list, find closest one
      let current = startEl.previousSibling;
      while (current) {
        if (DomUtils.isFocusable(current)) {
          return current;
        }
        current = current.previousSibling;
      }
      return null;
    } else {
      // Return previous element in the list
      return focusableArray[currentIndex - 1] || null;
    }
  }

  /**
   * Checks if an element is an ancestor of another element
   * @param {HTMLElement} ancestor - Potential ancestor element
   * @param {HTMLElement} descendant - Potential descendant element
   * @returns {boolean} Whether ancestor is actually an ancestor
   */
  static isAncestor(ancestor, descendant) {
    if (!ancestor || !descendant) return false;

    // Walk up the tree from the descendant
    let current = descendant.parentNode;
    while (current) {
      if (current === ancestor) {
        return true;
      }
      current = current.parentNode;
    }

    return false;
  }

  /**
   * Gets all ancestors of an element
   * @param {HTMLElement} element - Element to get ancestors for
   * @returns {Array} Array of ancestor elements
   */
  static getAncestors(element) {
    const ancestors = [];
    let current = element.parentNode;

    while (current && current !== document) {
      ancestors.unshift(current);
      current = current.parentNode;
    }

    return ancestors;
  }

  /**
   * Gets all descendants of an element that match a selector
   * @param {HTMLElement} element - Element to get descendants for
   * @param {string} selector - CSS selector to match
   * @returns {Array} Array of matching descendant elements
   */
  static getDescendants(element, selector) {
    if (!element) return [];

    return selector ? 
      Array.from(element.querySelectorAll(selector)) : 
      Array.from(element.children);
  }

  /**
   * Gets siblings of an element
   * @param {HTMLElement} element - Element to get siblings for
   * @param {string} selector - Optional CSS selector to match siblings
   * @returns {Array} Array of sibling elements
   */
  static getSiblings(element, selector) {
    if (!element || !element.parentNode) return [];

    const siblings = Array.from(element.parentNode.children);
    const result = siblings.filter(sibling => sibling !== element);

    if (selector) {
      return result.filter(sibling => DomUtils.matches(sibling, selector));
    }

    return result;
  }

  /**
   * Creates a mutation observer for DOM changes
   * @param {HTMLElement} element - Element to observe
   * @param {Function} callback - Callback function for mutations
   * @param {Object} options - Observer options
   * @returns {MutationObserver} The mutation observer instance
   */
  static observeMutations(element, callback, options = {}) {
    if (!element || typeof callback !== 'function') return null;

    // Default options for common use cases
    const defaultOptions = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false,
      attributeFilter: undefined,
      ...options
    };

    const observer = new MutationObserver(callback);
    observer.observe(element, defaultOptions);

    // Store for potential cleanup
    const elementId = element.__domUtilsId || (element.__domUtilsId = Symbol('domUtils'));
    this.observers.set(elementId, observer);

    return observer;
  }

  /**
   * Stops observing mutations for an element
   * @param {HTMLElement} element - Element to stop observing
   * @returns {boolean} Whether the observer was stopped
   */
  static stopObservingMutations(element) {
    if (!element) return false;

    const elementId = element.__domUtilsId;
    if (elementId && this.observers.has(elementId)) {
      const observer = this.observers.get(elementId);
      observer.disconnect();
      this.observers.delete(elementId);
      return true;
    }

    return false;
  }

  /**
   * Creates a CSS transition animation
   * @param {HTMLElement|string} element - Element or selector to animate
   * @param {Object} properties - CSS properties to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static animate(element, properties, options = {}) {
    const defaults = {
      duration: this.options.defaultTransitionDuration,
      easing: 'ease-in-out',
      delay: 0,
      ...options
    };

    const el = DomUtils.getElement(element);
    if (!el) return Promise.resolve();

    // Store original transition properties
    const originalTransition = el.style.transition;
    const originalStyles = {};

    // Set transition
    const transitionProperty = Object.keys(properties).join(',');
    el.style.transition = `all ${defaults.duration}ms ${defaults.easing} ${defaults.delay}ms`;

    // Store original values to restore later
    for (const property in properties) {
      originalStyles[property] = window.getComputedStyle(el)[property];
    }

    // Apply new properties
    for (const [property, value] of Object.entries(properties)) {
      el.style[property] = value;
    }

    // Return promise that resolves when transition completes
    return new Promise((resolve) => {
      const handleTransitionEnd = (e) => {
        if (e.target === el) {
          el.style.transition = originalTransition;
          el.removeEventListener('transitionend', handleTransitionEnd);
          resolve({ element: el, properties, options: defaults });
        }
      };

      el.addEventListener('transitionend', handleTransitionEnd);
      setTimeout(() => {
        // Fallback if transitionend doesn't fire
        el.style.transition = originalTransition;
        el.removeEventListener('transitionend', handleTransitionEnd);
        resolve({ element: el, properties, options: defaults });
      }, defaults.duration + defaults.delay + 50);
    });
  }

  /**
   * Creates a fade in animation
   * @param {HTMLElement|string} element - Element or selector to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static fadeIn(element, options = {}) {
    return DomUtils.animate(element, {
      opacity: '1'
    }, {
      duration: options.duration || 300,
      ...options
    });
  }

  /**
   * Creates a fade out animation
   * @param {HTMLElement|string} element - Element or selector to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static fadeOut(element, options = {}) {
    return DomUtils.animate(element, {
      opacity: '0'
    }, {
      duration: options.duration || 300,
      ...options
    });
  }

  /**
   * Creates a slide down animation
   * @param {HTMLElement|string} element - Element or selector to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static slideDown(element, options = {}) {
    const el = DomUtils.getElement(element);
    if (!el) return Promise.resolve();

    // Measure height
    const fullHeight = el.scrollHeight;
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.style.display = 'block';

    return DomUtils.animate(el, {
      height: `${fullHeight}px`
    }, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-out',
      complete: () => {
        el.style.height = ''; // Remove height restriction after animation
        el.style.overflow = '';
      },
      ...options
    });
  }

  /**
   * Creates a slide up animation
   * @param {HTMLElement|string} element - Element or selector to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static slideUp(element, options = {}) {
    const el = DomUtils.getElement(element);
    if (!el) return Promise.resolve();

    el.style.overflow = 'hidden';
    const fullHeight = el.scrollHeight;

    return DomUtils.animate(el, {
      height: '0'
    }, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-in',
      complete: () => {
        el.style.display = 'none';
        el.style.height = ''; // Remove height restriction after animation
        el.style.overflow = '';
      },
      ...options
    });
  }

  /**
   * Gets the computed background color of an element as RGB object
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with r, g, b properties
   */
  static getBackgroundColor(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { r: 0, g: 0, b: 0 };

    const computedStyle = window.getComputedStyle(el);
    const bgColor = computedStyle.backgroundColor;
    
    if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      return { r: 0, g: 0, b: 0 }; // Return black for transparent
    }

    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }

    // Fallback for other color formats (hex, etc.)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    const color = ctx.fillStyle;
    canvas.remove();

    // Convert hex to rgb if needed
    if (color.startsWith('#')) {
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      return { r, g, b };
    }

    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Gets the text color of an element as RGB object
   * @param {HTMLElement|string} element - Element or selector
   * @returns {Object} Object with r, g, b properties
   */
  static getTextColor(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { r: 0, g: 0, b: 0 };

    const computedStyle = window.getComputedStyle(el);
    const color = computedStyle.color;

    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }

    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Creates a deep clone of a DOM element
   * @param {HTMLElement} element - Element to clone
   * @param {boolean} deep - Whether to clone children (default: true)
   * @returns {HTMLElement} Cloned element
   */
  static deepCloneElement(element, deep = true) {
    if (!element) return null;

    const clone = element.cloneNode(deep);

    // Copy additional properties that might not be included in the clone
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
      // Copy the value to properly clone form elements
      clone.value = element.value;
    }

    // Copy any custom data that was stored on the element
    if (element.__domUtilsId) {
      clone.__domUtilsId = element.__domUtilsId;
    }

    return clone;
  }

  /**
   * Checks if two elements are visually overlapping
   * @param {HTMLElement} element1 - First element
   * @param {HTMLElement} element2 - Second element
   * @returns {boolean} Whether the elements overlap
   */
  static isVisuallyOverlapping(element1, element2) {
    if (!element1 || !element2) return false;

    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  /**
   * Gets the closest scrollable parent of an element
   * @param {HTMLElement} element - Element to get scrollable parent for
   * @returns {HTMLElement|null} Closest scrollable parent or null
   */
  static getScrollableParent(element) {
    if (!element) return null;

    let parent = element.parentElement;
    while (parent) {
      const computedStyle = window.getComputedStyle(parent);
      if (
        computedStyle.overflowX !== 'visible' && 
        computedStyle.overflowY !== 'visible' && 
        (computedStyle.overflowX !== 'hidden' || computedStyle.overflowY !== 'hidden')
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return document.documentElement; // Default to document element
  }

  /**
   * Determines if an element has scrollable content
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether the element has scrollable content
   */
  static isScrollable(element) {
    if (!element) return false;

    return element.scrollHeight > element.clientHeight || 
           element.scrollWidth > element.clientWidth;
  }

  /**
   * Gets all elements with a specific property value in their dataset
   * @param {string} property - Dataset property name
   * @param {string} value - Dataset property value to match
   * @returns {Array} Array of elements with matching dataset property value
   */
  static getElementsByDataset(property, value) {
    if (!property) return [];

    const selector = value !== undefined
      ? `[data-${property}="${value}"]`
      : `[data-${property}]`;

    return DomUtils.getElements(selector);
  }

  /**
   * Gets all elements with a specific class name, attribute, or other selector within a container
   * @param {HTMLElement} container - Container element to search within
   * @param {string} selector - CSS selector
   * @returns {Array} Array of matching elements
   */
  static getElementsWithin(container, selector) {
    if (!container || !selector) return [];

    return Array.from(container.querySelectorAll(selector));
  }

  /**
   * Creates a dynamic style element with CSS
   * @param {string} css - CSS to add
   * @param {string} id - Optional ID for the style element
   * @returns {HTMLElement} Style element that was created
   */
  static createStyle(css, id) {
    const style = document.createElement('style');
    style.type = 'text/css';
    
    if (id) {
      style.id = id;
    }
    
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    
    return style;
  }

  /**
   * Adds a CSS class to elements that match a selector
   * @param {string} selector - CSS selector
   * @param {string} className - Class name to add
   * @returns {number} Number of elements that received the class
   */
  static addClassToSelector(selector, className) {
    const elements = DomUtils.getElements(selector);
    elements.forEach(element => DomUtils.addClass(element, className));
    return elements.length;
  }

  /**
   * Removes a CSS class from elements that match a selector
   * @param {string} selector - CSS selector
   * @param {string} className - Class name to remove
   * @returns {number} Number of elements that had the class removed
   */
  static removeClassFromSelector(selector, className) {
    const elements = DomUtils.getElements(selector);
    elements.forEach(element => DomUtils.removeClass(element, className));
    return elements.length;
  }

  /**
   * Toggles a CSS class on elements that match a selector
   * @param {string} selector - CSS selector
   * @param {string} className - Class name to toggle
   * @returns {number} Number of elements that had the class toggled
   */
  static toggleClassOnSelector(selector, className) {
    const elements = DomUtils.getElements(selector);
    elements.forEach(element => DomUtils.toggleClass(element, className));
    return elements.length;
  }

  /**
   * Waits for an element to exist in the DOM
   * @param {string} selector - CSS selector for the element
   * @param {number} timeout - Timeout in milliseconds (default: 5000)
   * @returns {Promise} Promise that resolves with the element when found
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Check if element already exists
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      // Create a MutationObserver to watch for the element
      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Set timeout rejection
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Waits for all elements matching a selector to exist
   * @param {string} selector - CSS selector for the elements
   * @param {number} expectedCount - Expected number of elements (default: 1)
   * @param {number} timeout - Timeout in milliseconds (default: 5000)
   * @returns {Promise} Promise that resolves with array of elements when found
   */
  static waitForElements(selector, expectedCount = 1, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length >= expectedCount) {
        resolve(Array.from(elements));
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length >= expectedCount) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(Array.from(elements));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Required ${expectedCount} elements matching ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Creates a DOM element with event listeners
   * @param {string} tag - Tag name for the element
   * @param {Object} attrs - Attributes and event handlers for the element
   * @param {Array} children - Child elements or text nodes
   * @returns {HTMLElement} Created element with event listeners
   */
  static createElementWithEvents(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes and event listeners
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('on') && typeof value === 'function') {
        // Event listener
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        // Regular attribute
        element.setAttribute(key, value);
      }
    }
    
    // Add children
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    }
    
    return element;
  }

  /**
   * Gets the z-index value of the highest element in the DOM that matches a selector
   * @param {string} selector - CSS selector
   * @returns {number} Highest z-index value or 0 if no elements match
   */
  static getHighestZIndex(selector = '*') {
    const elements = DomUtils.getElements(selector);
    let highestZ = 0;

    elements.forEach(element => {
      const z = DomUtils.getZIndex(element);
      if (z > highestZ) {
        highestZ = z;
      }
    });

    return highestZ;
  }

  /**
   * Brings an element to the front by increasing its z-index
   * @param {HTMLElement|string} element - Element or selector to bring to front
   * @returns {number} New z-index value
   */
  static bringToFront(element) {
    const el = DomUtils.getElement(element);
    if (!el) return 0;

    const highestZ = DomUtils.getHighestZIndex();
    const newZIndex = highestZ + 1;
    el.style.zIndex = newZIndex;
    return newZIndex;
  }

  /**
   * Checks the accessibility of an element
   * @param {HTMLElement|string} element - Element or selector to check
   * @returns {Object} Accessibility information
   */
  static checkAccessibility(element) {
    const el = DomUtils.getElement(element);
    if (!el) return { valid: false, issues: [] };

    const issues = [];

    // Check for accessibility attributes
    if (!el.hasAttribute('alt') && (el.tagName === 'IMG')) {
      issues.push('Missing alt attribute on image');
    }

    if (!el.hasAttribute('aria-label') && 
        !el.hasAttribute('aria-labelledby') && 
        !el.textContent &&
        ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
      issues.push('Missing accessible name for interactive element');
    }

    if (!el.hasAttribute('role') && 
        el.tagName === 'A' && 
        !el.hasAttribute('href')) {
      issues.push('Link without href attribute should have appropriate role');
    }

    // Check for focusability
    if (!el.hasAttribute('tabindex') && !DomUtils.isFocusable(el)) {
      issues.push('Element may not be keyboard accessible');
    }

    return {
      valid: issues.length === 0,
      issues,
      element: el
    };
  }

  /**
   * Creates a modal overlay with focus trap
   * @param {Object} options - Modal options
   * @returns {Object} Modal controller with show/hide methods
   */
  static createModal(options = {}) {
    const {
      content = '',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className = 'dom-utils-modal',
      backdropClass = 'dom-utils-modal-backdrop',
      ...restOptions
    } = options;

    const modalElement = DomUtils.createElement('div', {
      className: className,
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'none',
        zIndex: '10000',
        alignItems: 'center',
        justifyContent: 'center'
      }
    });

    const contentElement = DomUtils.createElement('div', {
      style: {
        backgroundColor: 'var(--bg-dark, #000)',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto',
        position: 'relative'
      }
    });

    // Add content
    if (typeof content === 'string') {
      contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentElement.appendChild(content);
    }

    // Add close button if needed
    if (options.showCloseButton !== false) {
      const closeBtn = DomUtils.createElement('button', {
        className: 'modal-close',
        style: {
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'var(--text-light, #fff)'
        },
        onclick: () => modalController.hide()
      }, ['×']);

      contentElement.appendChild(closeBtn);
    }

    modalElement.appendChild(contentElement);

    document.body.appendChild(modalElement);

    const modalController = {
      element: modalElement,
      content: contentElement,
      
      show: () => {
        modalElement.style.display = 'flex';
        
        // Focus the first focusable element in the modal
        const firstFocusable = contentElement.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) firstFocusable.focus();
        
        // Set up event listeners
        if (closeOnOverlayClick) {
          modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
              modalController.hide();
            }
          });
        }
        
        if (closeOnEscape) {
          const keyHandler = (e) => {
            if (e.key === 'Escape') {
              modalController.hide();
            }
          };
          document.addEventListener('keydown', keyHandler);
          modalController.keyHandler = keyHandler;
        }
      },
      
      hide: () => {
        modalElement.style.display = 'none';
        
        if (modalController.keyHandler) {
          document.removeEventListener('keydown', modalController.keyHandler);
        }
      },
      
      destroy: () => {
        if (modalElement.parentNode) {
          modalElement.parentNode.removeChild(modalElement);
        }
        
        if (modalController.keyHandler) {
          document.removeEventListener('keydown', modalController.keyHandler);
        }
      }
    };

    return modalController;
  }

  /**
   * Adds dynamic styles for DOM utilities
   */
  static addDynamicStyles() {
    if (document.getElementById('dom-utilities-styles')) return;

    const style = document.createElement('style');
    style.id = 'dom-utilities-styles';
    style.textContent = `
      /* DOM utility related styles */
      .dom-utils-modal {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
      }
      
      .dom-utils-modal-content {
        background: var(--bg-dark, #000);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        padding: 20px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        position: relative;
      }
      
      .dom-utils-modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-light, #fff);
      }
      
      .dom-utils-focusable {
        outline: 2px solid var(--jazer-cyan, #00f2ea);
        outline-offset: 2px;
      }
      
      .dom-utils-inert {
        pointer-events: none;
        user-select: none;
        opacity: 0.5;
      }
      
      /* Animation classes */
      .dom-utils-animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      
      .dom-utils-animate-fade-out {
        animation: fadeOut 0.3s ease-in;
      }
      
      .dom-utils-animate-slide-down {
        animation: slideDown 0.3s ease-out;
      }
      
      .dom-utils-animate-slide-up {
        animation: slideUp 0.3s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
      }
      
      /* Accessibility */
      .dom-utils-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Loading states */
      .dom-utils-loading {
        opacity: 0.7;
        pointer-events: none;
        position: relative;
      }
      
      .dom-utils-loading::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: block;
        z-index: 1;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the DOM utilities instance and cleans up resources
   */
  destroy() {
    // Clean up all observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    // Clean up all event listeners
    for (const [elementId, listeners] of this.eventListeners) {
      const element = document.querySelector(`[__domUtilsId="${elementId}"]`);
      if (element) {
        listeners.forEach(({ event, handler, options }) => {
          element.removeEventListener(event, handler, options);
        });
      }
    }
    this.eventListeners.clear();

    // Clear any animation frames
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

/**
 * Creates a new DOM utilities instance
 * @param {Object} options - Configuration options
 * @returns {DomUtils} New DOM utilities instance
 */
function createDomUtils(options = {}) {
  return new DomUtils(options);
}

// Create default instance
const domUtils = new DomUtils();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DomUtils,
    createDomUtils,
    domUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DomUtils = DomUtils;
  window.createDomUtils = createDomUtils;
  window.domUtils = domUtils;
}